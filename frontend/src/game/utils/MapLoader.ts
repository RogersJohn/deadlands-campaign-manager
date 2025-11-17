import Phaser from 'phaser';
import { GeneratedMap, TerrainGroup, Building, CoverObject, NPC } from '../../types/map';

/**
 * Utility for loading AI-generated maps into Phaser
 * REDESIGNED: Maps now REPLACE the entire arena (not drawn in corner)
 * Features tactical overlays: grid, walls, cover markers
 */
export class MapLoader {
  private scene: Phaser.Scene;
  private tileSize: number = 32;

  // Map layers
  private backgroundImage?: Phaser.GameObjects.Image;
  private tacticalGrid?: Phaser.GameObjects.Graphics;
  private wallHighlights?: Phaser.GameObjects.Graphics;
  private coverMarkers?: Phaser.GameObjects.Group;
  private buildingLabels?: Phaser.GameObjects.Group;
  private npcMarkers?: Phaser.GameObjects.Group;

  // Overlay visibility flags
  private gridVisible: boolean = true;
  private wallsVisible: boolean = true;
  private coverVisible: boolean = true;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Load map and REPLACE the entire arena (PRIMARY METHOD)
   * This is the new recommended method for loading maps
   * @param mapData The generated map data from AI
   */
  async loadMapAsArena(mapData: GeneratedMap): Promise<void> {
    console.log('Loading map as arena:', mapData.name);

    // Step 1: Clear entire arena (not just map layers)
    this.clearEntireArena();

    // Step 2: Set new world bounds to match map size
    const mapWidth = mapData.size.width * this.tileSize;
    const mapHeight = mapData.size.height * this.tileSize;
    this.scene.physics.world.setBounds(0, 0, mapWidth, mapHeight);
    console.log(`Arena resized to: ${mapWidth}x${mapHeight} pixels`);

    // Step 3: Load background image (the hand-drawn illustrated map)
    if (mapData.imageUrl) {
      console.log('Loading background image from:', mapData.imageUrl.substring(0, 50) + '...');
      await this.loadBackgroundImage(mapData.imageUrl, mapData.size.width, mapData.size.height);
    } else {
      console.warn('No imageUrl provided in map data! Map will have no background artwork.');
      console.warn('Map data keys:', Object.keys(mapData));
    }

    // Step 4: Create tactical grid overlay
    this.createTacticalGrid(mapData.size.width, mapData.size.height);

    // Step 5: Highlight walls/obstacles from buildings
    const walls = this.extractWallsFromBuildings(mapData.buildings);
    if (walls.length > 0) {
      this.highlightWalls(walls);
    }

    // Step 6: Mark cover positions
    if (mapData.cover && mapData.cover.length > 0) {
      this.markCover(mapData.cover);
    }

    // Step 7: Add building labels (optional)
    if (mapData.buildings && mapData.buildings.length > 0) {
      this.addBuildingLabels(mapData.buildings);
    }

    // Step 8: Add NPC markers (optional)
    if (mapData.npcs && mapData.npcs.length > 0) {
      this.addNPCMarkers(mapData.npcs);
    }

    // Step 9: Move player to spawn point (center of map by default)
    this.movePlayerToSpawn(mapData.size.width, mapData.size.height);

    // Step 10: Center camera on map
    this.centerCameraOnMap(mapData.size.width, mapData.size.height);

    console.log(`Arena replaced with map: ${mapWidth}x${mapHeight} pixels`);
  }

  /**
   * Legacy method: Load map without replacing arena
   * @deprecated Use loadMapAsArena() instead
   */
  async loadMap(mapData: GeneratedMap): Promise<void> {
    console.warn('loadMap() is deprecated, use loadMapAsArena() instead');
    return this.loadMapAsArena(mapData);
  }

  /**
   * Clear entire arena (not just map layers)
   */
  private clearEntireArena(): void {
    // Destroy all existing map layers
    this.backgroundImage?.destroy();
    this.tacticalGrid?.destroy();
    this.wallHighlights?.destroy();
    this.coverMarkers?.clear(true, true);
    this.buildingLabels?.clear(true, true);
    this.npcMarkers?.clear(true, true);

    // Clear references
    this.backgroundImage = undefined;
    this.tacticalGrid = undefined;
    this.wallHighlights = undefined;
    this.coverMarkers = undefined;
    this.buildingLabels = undefined;
    this.npcMarkers = undefined;

    // CRITICAL: Destroy ALL game objects from the original ArenaScene
    // This includes the brown background rectangle and original grid
    const allChildren = this.scene.children.getChildren();
    allChildren.forEach(child => {
      // Don't destroy player sprite, enemies, or UI elements
      // Only destroy background graphics and map-related objects
      if (child instanceof Phaser.GameObjects.Graphics ||
          child instanceof Phaser.GameObjects.Rectangle ||
          child instanceof Phaser.GameObjects.Image) {
        // Check if it's not a character sprite (characters are rectangles with specific depth)
        const gameObject = child as Phaser.GameObjects.GameObject & { depth?: number };
        // Preserve characters (depth 5) and UI elements (depth > 100)
        if (gameObject.depth === undefined || (gameObject.depth < 5 || (gameObject.depth > 5 && gameObject.depth < 100))) {
          child.destroy();
        }
      }
    });

    console.log('Arena cleared (including original background)');
  }

  /**
   * Load and display hand-drawn illustrated background image
   */
  private async loadBackgroundImage(imageUrl: string, width: number, height: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const textureKey = `map_bg_${Date.now()}`;

      this.scene.textures.once('addtexture', () => {
        // Create background image
        this.backgroundImage = this.scene.add.image(0, 0, textureKey);
        this.backgroundImage.setOrigin(0, 0);
        this.backgroundImage.setDepth(-100); // Behind everything

        // Scale to fit map size
        const targetWidth = width * this.tileSize;
        const targetHeight = height * this.tileSize;
        this.backgroundImage.setDisplaySize(targetWidth, targetHeight);

        // Full opacity for hand-drawn illustrated images
        this.backgroundImage.setAlpha(1.0);

        console.log('Hand-drawn background image loaded successfully');
        console.log(`Image scaled to: ${targetWidth}x${targetHeight} px`);
        resolve();
      });

      this.scene.textures.once('onerror', (key: string) => {
        console.error('Failed to load background image texture:', key);
        reject(new Error('Failed to load background image'));
      });

      try {
        this.scene.textures.addBase64(textureKey, imageUrl);
      } catch (error) {
        console.error('Error adding base64 texture:', error);
        reject(error);
      }
    });
  }

  /**
   * Create tactical grid overlay on top of realistic image
   */
  private createTacticalGrid(width: number, height: number): void {
    this.tacticalGrid = this.scene.add.graphics();
    this.tacticalGrid.setDepth(100); // Above background, below UI

    // Draw subtle grid lines
    this.tacticalGrid.lineStyle(1, 0xffffff, 0.15);

    // Vertical lines
    for (let x = 0; x <= width; x++) {
      const worldX = x * this.tileSize;
      this.tacticalGrid.lineBetween(worldX, 0, worldX, height * this.tileSize);
    }

    // Horizontal lines
    for (let y = 0; y <= height; y++) {
      const worldY = y * this.tileSize;
      this.tacticalGrid.lineBetween(0, worldY, width * this.tileSize, worldY);
    }

    // Highlight every 5th line for easier counting
    this.tacticalGrid.lineStyle(2, 0xffffff, 0.3);
    for (let x = 0; x <= width; x += 5) {
      const worldX = x * this.tileSize;
      this.tacticalGrid.lineBetween(worldX, 0, worldX, height * this.tileSize);
    }
    for (let y = 0; y <= height; y += 5) {
      const worldY = y * this.tileSize;
      this.tacticalGrid.lineBetween(0, worldY, width * this.tileSize, worldY);
    }

    this.tacticalGrid.setVisible(this.gridVisible);
    console.log('Tactical grid overlay created');
  }

  /**
   * Extract wall data from buildings
   */
  private extractWallsFromBuildings(buildings: Building[]): Array<{x: number, y: number, width: number, height: number}> {
    return buildings.map(building => ({
      x: building.position.x,
      y: building.position.y,
      width: building.size.width,
      height: building.size.height
    }));
  }

  /**
   * Highlight walls and obstacles with colored overlay
   */
  private highlightWalls(walls: Array<{x: number, y: number, width: number, height: number}>): void {
    this.wallHighlights = this.scene.add.graphics();
    this.wallHighlights.setDepth(101);

    walls.forEach(wall => {
      // Draw red semi-transparent overlay over walls
      this.wallHighlights!.fillStyle(0xff0000, 0.2);
      this.wallHighlights!.fillRect(
        wall.x * this.tileSize,
        wall.y * this.tileSize,
        wall.width * this.tileSize,
        wall.height * this.tileSize
      );

      // Add red border
      this.wallHighlights!.lineStyle(2, 0xff0000, 0.6);
      this.wallHighlights!.strokeRect(
        wall.x * this.tileSize,
        wall.y * this.tileSize,
        wall.width * this.tileSize,
        wall.height * this.tileSize
      );
    });

    this.wallHighlights.setVisible(this.wallsVisible);
    console.log(`Wall highlights created for ${walls.length} walls`);
  }

  /**
   * Mark cover positions with defense bonus indicators
   */
  private markCover(coverPositions: CoverObject[]): void {
    this.coverMarkers = this.scene.add.group();

    coverPositions.forEach(cover => {
      const worldX = cover.position.x * this.tileSize;
      const worldY = cover.position.y * this.tileSize;

      // Green semi-transparent marker
      const marker = this.scene.add.graphics();
      marker.fillStyle(0x00ff00, 0.3);
      marker.fillCircle(
        worldX + this.tileSize/2,
        worldY + this.tileSize/2,
        this.tileSize/2
      );
      marker.lineStyle(2, 0x00ff00, 0.8);
      marker.strokeCircle(
        worldX + this.tileSize/2,
        worldY + this.tileSize/2,
        this.tileSize/2
      );
      marker.setDepth(102);

      // Defense bonus label
      const label = this.scene.add.text(
        worldX + this.tileSize/2,
        worldY + this.tileSize/2,
        `+${cover.coverBonus}`,
        {
          fontSize: '14px',
          color: '#00ff00',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 3
        }
      );
      label.setOrigin(0.5);
      label.setDepth(103);

      this.coverMarkers.add(marker);
      this.coverMarkers.add(label);
    });

    this.coverMarkers.setVisible(this.coverVisible);
    console.log(`Cover markers created for ${coverPositions.length} positions`);
  }

  /**
   * Add building labels (optional)
   */
  private addBuildingLabels(buildings: Building[]): void {
    this.buildingLabels = this.scene.add.group();

    buildings.forEach(building => {
      const worldX = building.position.x * this.tileSize;
      const worldY = building.position.y * this.tileSize;
      const width = building.size.width * this.tileSize;
      const height = building.size.height * this.tileSize;

      const label = this.scene.add.text(
        worldX + width / 2,
        worldY + height / 2,
        building.name,
        {
          fontSize: '12px',
          color: '#ffffff',
          backgroundColor: '#000000',
          padding: { x: 4, y: 2 },
        }
      );
      label.setOrigin(0.5);
      label.setDepth(104);
      this.buildingLabels.add(label);
    });

    console.log(`Building labels added for ${buildings.length} buildings`);
  }

  /**
   * Add NPC markers (optional)
   */
  private addNPCMarkers(npcs: NPC[]): void {
    this.npcMarkers = this.scene.add.group();

    npcs.forEach(npc => {
      const worldX = npc.position.x * this.tileSize;
      const worldY = npc.position.y * this.tileSize;

      // Gold triangle marker
      const marker = this.scene.add.graphics();
      marker.fillStyle(0xFFD700, 1);
      marker.fillTriangle(
        worldX + this.tileSize / 2, worldY,
        worldX, worldY + this.tileSize,
        worldX + this.tileSize, worldY + this.tileSize
      );
      marker.lineStyle(2, 0x000000, 1);
      marker.strokeTriangle(
        worldX + this.tileSize / 2, worldY,
        worldX, worldY + this.tileSize,
        worldX + this.tileSize, worldY + this.tileSize
      );
      marker.setDepth(105);

      // NPC name label
      const label = this.scene.add.text(
        worldX + this.tileSize / 2,
        worldY - 10,
        npc.name,
        {
          fontSize: '10px',
          color: '#ffffff',
          backgroundColor: '#000000',
          padding: { x: 2, y: 1 },
        }
      );
      label.setOrigin(0.5, 1);
      label.setDepth(106);

      this.npcMarkers.add(marker);
      this.npcMarkers.add(label);
    });

    console.log(`NPC markers added for ${npcs.length} NPCs`);
  }

  /**
   * Move player to spawn point (center of map by default)
   */
  private movePlayerToSpawn(mapWidth: number, mapHeight: number): void {
    const spawnX = (mapWidth * this.tileSize) / 2;
    const spawnY = (mapHeight * this.tileSize) / 2;

    // Try to access player object if it exists
    const player = (this.scene as any).player;
    if (player && player.setPosition) {
      player.setPosition(spawnX, spawnY);
      console.log(`Player moved to spawn: (${spawnX}, ${spawnY})`);
    } else {
      console.warn('Player object not found, skipping spawn placement');
    }
  }

  /**
   * Center camera on the loaded map and adjust zoom
   */
  private centerCameraOnMap(mapWidth: number, mapHeight: number): void {
    const centerX = (mapWidth * this.tileSize) / 2;
    const centerY = (mapHeight * this.tileSize) / 2;

    // Move camera to center
    this.scene.cameras.main.centerOn(centerX, centerY);

    // Adjust zoom to fit map on screen
    const camera = this.scene.cameras.main;
    const mapPixelWidth = mapWidth * this.tileSize;
    const mapPixelHeight = mapHeight * this.tileSize;

    const zoomX = (camera.width * 0.9) / mapPixelWidth;
    const zoomY = (camera.height * 0.9) / mapPixelHeight;
    const zoom = Math.min(zoomX, zoomY, 1); // Don't zoom in beyond 1x

    camera.setZoom(zoom);

    console.log(`Camera centered at (${centerX}, ${centerY}) with zoom ${zoom.toFixed(2)}`);
  }

  /**
   * Toggle tactical grid visibility
   */
  toggleGrid(visible: boolean): void {
    this.gridVisible = visible;
    if (this.tacticalGrid) {
      this.tacticalGrid.setVisible(visible);
      console.log(`Tactical grid ${visible ? 'shown' : 'hidden'}`);
    }
  }

  /**
   * Toggle wall highlights visibility
   */
  toggleWalls(visible: boolean): void {
    this.wallsVisible = visible;
    if (this.wallHighlights) {
      this.wallHighlights.setVisible(visible);
      console.log(`Wall highlights ${visible ? 'shown' : 'hidden'}`);
    }
  }

  /**
   * Toggle cover markers visibility
   */
  toggleCover(visible: boolean): void {
    this.coverVisible = visible;
    if (this.coverMarkers) {
      this.coverMarkers.setVisible(visible);
      console.log(`Cover markers ${visible ? 'shown' : 'hidden'}`);
    }
  }

  /**
   * Clear all map layers (legacy method)
   * @deprecated Use clearEntireArena() instead
   */
  clearMap(): void {
    this.clearEntireArena();
  }

  /**
   * Download map as JSON file
   */
  static downloadMapJSON(mapData: GeneratedMap): void {
    const dataStr = JSON.stringify(mapData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${mapData.name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Initialize map loader event listener
 * Call this in your Phaser scene's create() method
 * Returns the MapLoader instance so you can access toggle methods
 */
export function initializeMapLoaderListener(scene: Phaser.Scene): MapLoader {
  const mapLoader = new MapLoader(scene);

  window.addEventListener('loadGeneratedMap', ((event: CustomEvent) => {
    const mapData = event.detail as GeneratedMap;
    mapLoader.loadMapAsArena(mapData); // Use new method
  }) as EventListener);

  console.log('Map loader listener initialized');

  return mapLoader;
}
