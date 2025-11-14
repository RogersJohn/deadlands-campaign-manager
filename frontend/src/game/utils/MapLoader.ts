import Phaser from 'phaser';
import { GeneratedMap, TerrainGroup, Building, CoverObject, NPC } from '../../types/map';

/**
 * Utility for loading AI-generated maps into Phaser
 * Handles both terrain rendering and background image layering
 */
export class MapLoader {
  private scene: Phaser.Scene;
  private tileSize: number = 32;
  private backgroundLayer?: Phaser.GameObjects.Image;
  private terrainLayer?: Phaser.GameObjects.Group;
  private buildingLayer?: Phaser.GameObjects.Group;
  private coverLayer?: Phaser.GameObjects.Group;
  private npcLayer?: Phaser.GameObjects.Group;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Load a generated map into the scene
   * @param mapData The generated map data from AI
   */
  async loadMap(mapData: GeneratedMap): Promise<void> {
    console.log('Loading generated map:', mapData.name);

    // Clear existing map
    this.clearMap();

    // Step 1: Load background image if available (lowest layer)
    if (mapData.imageUrl) {
      await this.loadBackgroundImage(mapData.imageUrl, mapData.size.width, mapData.size.height);
    }

    // Step 2: Create terrain layer (on top of background)
    this.renderTerrain(mapData.terrain);

    // Step 3: Create buildings
    this.renderBuildings(mapData.buildings);

    // Step 4: Place cover objects
    this.renderCover(mapData.cover);

    // Step 5: Spawn NPCs
    this.renderNPCs(mapData.npcs);

    console.log('Map loaded successfully:', mapData.name);
  }

  /**
   * Load and display background image
   */
  private async loadBackgroundImage(imageUrl: string, width: number, height: number): Promise<void> {
    return new Promise((resolve) => {
      // Create a unique texture key
      const textureKey = `map_bg_${Date.now()}`;

      // Load the base64 image
      this.scene.textures.once('addtexture', () => {
        // Create background image sprite
        this.backgroundLayer = this.scene.add.image(0, 0, textureKey);
        this.backgroundLayer.setOrigin(0, 0);
        this.backgroundLayer.setDepth(-100); // Behind everything

        // Scale to fit the map size
        const targetWidth = width * this.tileSize;
        const targetHeight = height * this.tileSize;
        this.backgroundLayer.setDisplaySize(targetWidth, targetHeight);

        // Optional: Add slight transparency so terrain overlays are visible
        this.backgroundLayer.setAlpha(0.7);

        resolve();
      });

      this.scene.textures.addBase64(textureKey, imageUrl);
    });
  }

  /**
   * Render terrain tiles
   */
  private renderTerrain(terrainGroups: TerrainGroup[]): void {
    this.terrainLayer = this.scene.add.group();

    terrainGroups.forEach((group) => {
      // Render rectangular area
      const { x1, y1, x2, y2 } = group.area;

      for (let y = y1; y <= y2; y++) {
        for (let x = x1; x <= x2; x++) {
          const sprite = this.createTerrainTile(group.type, x, y);
          if (sprite) {
            this.terrainLayer?.add(sprite);
          }
        }
      }
    });
  }

  /**
   * Create a terrain tile sprite
   */
  private createTerrainTile(terrainType: string, gridX: number, gridY: number): Phaser.GameObjects.Sprite | null {
    const worldX = gridX * this.tileSize;
    const worldY = gridY * this.tileSize;

    // Map terrain types to colors/textures
    // In production, you'd use actual sprite textures
    const terrainColors: { [key: string]: number } = {
      dirt: 0x8B4513,
      rocks: 0x696969,
      water: 0x4682B4,
      grass: 0x228B22,
      sand: 0xF4A460,
      wood_floor: 0xD2691E,
      stone_floor: 0x808080,
      wood_wall: 0x8B4513,
      stone_wall: 0x696969,
    };

    const color = terrainColors[terrainType] || 0x8B4513;

    // Create a simple colored rectangle as placeholder
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(color, 0.6);
    graphics.fillRect(0, 0, this.tileSize, this.tileSize);
    graphics.generateTexture(`terrain_${terrainType}`, this.tileSize, this.tileSize);
    graphics.destroy();

    const sprite = this.scene.add.sprite(worldX, worldY, `terrain_${terrainType}`);
    sprite.setOrigin(0, 0);
    sprite.setDepth(0);

    return sprite;
  }

  /**
   * Render buildings
   */
  private renderBuildings(buildings: Building[]): void {
    this.buildingLayer = this.scene.add.group();

    buildings.forEach((building) => {
      // Draw building outline
      const worldX = building.position.x * this.tileSize;
      const worldY = building.position.y * this.tileSize;
      const width = building.size.width * this.tileSize;
      const height = building.size.height * this.tileSize;

      const graphics = this.scene.add.graphics();
      graphics.lineStyle(2, 0x8B4513, 1);
      graphics.strokeRect(worldX, worldY, width, height);
      graphics.fillStyle(0xD2691E, 0.3);
      graphics.fillRect(worldX, worldY, width, height);
      graphics.setDepth(1);

      this.buildingLayer?.add(graphics);

      // Add building label
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
      label.setDepth(2);
      this.buildingLayer?.add(label);
    });
  }

  /**
   * Render cover objects
   */
  private renderCover(coverObjects: CoverObject[]): void {
    this.coverLayer = this.scene.add.group();

    coverObjects.forEach((cover) => {
      const worldX = cover.position.x * this.tileSize;
      const worldY = cover.position.y * this.tileSize;

      // Draw cover object (simple circle for now)
      const graphics = this.scene.add.graphics();
      graphics.fillStyle(0x654321, 0.8);
      graphics.fillCircle(worldX + this.tileSize / 2, worldY + this.tileSize / 2, this.tileSize / 3);
      graphics.lineStyle(2, 0x000000, 1);
      graphics.strokeCircle(worldX + this.tileSize / 2, worldY + this.tileSize / 2, this.tileSize / 3);
      graphics.setDepth(3);

      this.coverLayer?.add(graphics);

      // Add cover bonus label
      const label = this.scene.add.text(
        worldX + this.tileSize / 2,
        worldY + this.tileSize / 2,
        `+${cover.coverBonus}`,
        {
          fontSize: '10px',
          color: '#00ff00',
          fontStyle: 'bold',
        }
      );
      label.setOrigin(0.5);
      label.setDepth(4);
      this.coverLayer?.add(label);
    });
  }

  /**
   * Render NPCs
   */
  private renderNPCs(npcs: NPC[]): void {
    this.npcLayer = this.scene.add.group();

    npcs.forEach((npc) => {
      const worldX = npc.position.x * this.tileSize;
      const worldY = npc.position.y * this.tileSize;

      // Draw NPC marker (triangle for now)
      const graphics = this.scene.add.graphics();
      graphics.fillStyle(0xFFD700, 1);
      graphics.fillTriangle(
        worldX + this.tileSize / 2, worldY,
        worldX, worldY + this.tileSize,
        worldX + this.tileSize, worldY + this.tileSize
      );
      graphics.lineStyle(2, 0x000000, 1);
      graphics.strokeTriangle(
        worldX + this.tileSize / 2, worldY,
        worldX, worldY + this.tileSize,
        worldX + this.tileSize, worldY + this.tileSize
      );
      graphics.setDepth(5);

      this.npcLayer?.add(graphics);

      // Add NPC name
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
      label.setDepth(6);
      this.npcLayer?.add(label);
    });
  }

  /**
   * Clear all map layers
   */
  clearMap(): void {
    this.backgroundLayer?.destroy();
    this.terrainLayer?.clear(true, true);
    this.buildingLayer?.clear(true, true);
    this.coverLayer?.clear(true, true);
    this.npcLayer?.clear(true, true);

    this.backgroundLayer = undefined;
    this.terrainLayer = undefined;
    this.buildingLayer = undefined;
    this.coverLayer = undefined;
    this.npcLayer = undefined;
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
 */
export function initializeMapLoaderListener(scene: Phaser.Scene): void {
  const mapLoader = new MapLoader(scene);

  window.addEventListener('loadGeneratedMap', ((event: CustomEvent) => {
    const mapData = event.detail as GeneratedMap;
    mapLoader.loadMap(mapData);
  }) as EventListener);

  console.log('Map loader listener initialized');
}
