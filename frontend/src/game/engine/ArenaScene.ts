import Phaser from 'phaser';
import { GameCharacter, GameEnemy, CombatLogEntry, Equipment } from '../types/GameTypes';
import { CombatManager, TurnPhase } from './CombatManager';
import { TypedGameEvents, wrapSceneEvents } from '../events/GameEvents';

export class ArenaScene extends Phaser.Scene {
  // Type-safe event bus (wraps game.events, not scene.events)
  private gameEvents!: TypedGameEvents;

  // Grid settings
  private readonly TILE_SIZE = 32; // 32x32 pixel tiles
  private readonly GRID_WIDTH = 200; // 200 tiles wide
  private readonly GRID_HEIGHT = 200; // 200 tiles tall

  // Game objects
  private player?: Phaser.GameObjects.Rectangle;
  private playerGridX = 100; // Starting grid position (center)
  private playerGridY = 100;
  private enemySprites: Phaser.GameObjects.Rectangle[] = [];
  private enemyData: GameEnemy[] = [];

  // Grid visuals
  private gridGraphics?: Phaser.GameObjects.Graphics;
  private movementRangeGraphics?: Phaser.GameObjects.Graphics;
  private attackRangeGraphics?: Phaser.GameObjects.Graphics;
  private lineOfSightGraphics?: Phaser.GameObjects.Graphics;
  private hoveredTile?: { x: number; y: number };
  private attackInfoText?: Phaser.GameObjects.Text;

  // Input
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey?: Phaser.Input.Keyboard.Key;
  private attackKey?: Phaser.Input.Keyboard.Key;
  private lastMoveTime = 0;
  private moveDelay = 200; // ms between moves
  private lastActionTime = 0;

  // Camera zoom
  private currentZoom = 1;
  private minZoom = 0.5;
  private maxZoom = 2;

  // Camera follow
  private cameraFollowEnabled = true;
  private cameraPanSpeed = 10;

  // Weapon ranges display
  private showWeaponRanges = true;

  // Movement ranges display
  private showMovementRanges = true;

  // Movement budget
  private movementBudget = 0; // Remaining movement this turn
  private maxMovementBudget = 0; // Total movement available this turn

  // Camera drag
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private cameraStartX = 0;
  private cameraStartY = 0;

  // Game state
  private character?: GameCharacter;
  private selectedTile?: { x: number; y: number };
  private combatManager?: CombatManager;
  private selectedWeapon?: Equipment;

  // Cover objects
  private coverObjects: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    type: 'full' | 'partial'; // full = -4, partial = -2
    sprite?: Phaser.GameObjects.Rectangle;
  }> = [];

  constructor() {
    super({ key: 'ArenaScene' });
  }

  init(data: { character?: GameCharacter; selectedWeapon?: Equipment }) {
    this.character = data.character;
    this.selectedWeapon = data.selectedWeapon;
    console.log('ArenaScene initialized with weapon:', this.selectedWeapon);
  }

  create() {
    const arenaWidth = this.GRID_WIDTH * this.TILE_SIZE;
    const arenaHeight = this.GRID_HEIGHT * this.TILE_SIZE;

    // Draw arena background
    this.add.rectangle(
      arenaWidth / 2,
      arenaHeight / 2,
      arenaWidth,
      arenaHeight,
      0x2d1b0e // Dark brown arena floor
    );

    // Draw the grid
    this.drawGrid();

    // Set world bounds to the full arena size
    this.cameras.main.setBounds(0, 0, arenaWidth, arenaHeight);

    // Create movement range graphics layer (drawn under characters)
    this.movementRangeGraphics = this.add.graphics();
    this.movementRangeGraphics.setDepth(1);

    // Create attack range graphics layer (drawn under characters)
    this.attackRangeGraphics = this.add.graphics();
    this.attackRangeGraphics.setDepth(2);

    // Create line of sight graphics layer (drawn above most elements)
    this.lineOfSightGraphics = this.add.graphics();
    this.lineOfSightGraphics.setDepth(10);

    // Initialize CombatManager
    if (this.character) {
      this.combatManager = new CombatManager(
        this.character,
        (log) => {
          // Emit combat log update to React
          this.game.events.emit('combatLogUpdate', log);
        },
        (phase, turn) => {
          // Emit phase change to React
          this.game.events.emit('phaseChange', phase, turn);
          if (phase === 'enemy') {
            this.executeEnemyTurn();
          } else if (phase === 'player') {
            // Reset movement budget for new turn
            this.maxMovementBudget = this.character!.pace || 6;
            this.movementBudget = this.maxMovementBudget;

            // Emit movement budget update
            this.game.events.emit('movementBudgetUpdate', {
              current: this.movementBudget,
              max: this.maxMovementBudget,
            });
          }
        },
        (diceRoll) => {
          // Emit dice roll to React
          this.game.events.emit('diceRoll', diceRoll);
        }
      );

      // Initialize movement budget for first turn
      this.maxMovementBudget = this.character.pace || 6;
      this.movementBudget = this.maxMovementBudget;

      // Emit initial combat state to React
      this.game.events.emit('combatStateInit', {
        playerHealth: this.combatManager.getPlayerHealth(),
        playerMaxHealth: this.combatManager.getPlayerMaxHealth(),
        turnNumber: this.combatManager.getTurnNumber(),
        phase: this.combatManager.getCurrentPhase(),
        combatLog: this.combatManager.getCombatLog(),
      });

      // Emit initial movement budget
      this.game.events.emit('movementBudgetUpdate', {
        current: this.movementBudget,
        max: this.maxMovementBudget,
      });
    }

    // Create player at grid position
    this.createPlayer(this.playerGridX, this.playerGridY);

    // Make camera follow player (with smooth lerp)
    if (this.player) {
      this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    }

    // Create cover objects on the battlefield
    this.createCoverObjects();

    // Create test enemies around the player
    this.createTestEnemy(115, 95); // Northeast
    this.createTestEnemy(105, 110); // South
    this.createTestEnemy(90, 100); // West

    // Set up keyboard controls
    this.cursors = this.input.keyboard?.createCursorKeys();
    this.spaceKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.attackKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A);

    // Add mouse input for grid clicking
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      // Handle drag-to-pan
      if (pointer.isDown) {
        const dragThreshold = 5; // pixels of movement before considering it a drag
        const deltaX = pointer.x - this.dragStartX;
        const deltaY = pointer.y - this.dragStartY;

        if (!this.isDragging && (Math.abs(deltaX) > dragThreshold || Math.abs(deltaY) > dragThreshold)) {
          this.isDragging = true;
        }

        if (this.isDragging) {
          // Pan the camera based on drag movement
          const camera = this.cameras.main;
          camera.scrollX = this.cameraStartX - (pointer.x - this.dragStartX) / this.currentZoom;
          camera.scrollY = this.cameraStartY - (pointer.y - this.dragStartY) / this.currentZoom;
          return; // Don't update hover tile while dragging
        }
      }

      const gridX = Math.floor(pointer.worldX / this.TILE_SIZE);
      const gridY = Math.floor(pointer.worldY / this.TILE_SIZE);

      if (gridX >= 0 && gridX < this.GRID_WIDTH && gridY >= 0 && gridY < this.GRID_HEIGHT) {
        this.hoveredTile = { x: gridX, y: gridY };
        this.updateMovementRange();
      }
    });

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Track potential drag start
      this.isDragging = false;
      this.dragStartX = pointer.x;
      this.dragStartY = pointer.y;
      this.cameraStartX = this.cameras.main.scrollX;
      this.cameraStartY = this.cameras.main.scrollY;
    });

    // Add pointerup handler to complete drag or process click
    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      // If it was a drag, don't process as a click
      if (this.isDragging) {
        this.isDragging = false;
        return;
      }

      // Not a drag - process as a click
      if (!this.combatManager || this.combatManager.getCurrentPhase() !== 'player') return;

      const gridX = Math.floor(pointer.worldX / this.TILE_SIZE);
      const gridY = Math.floor(pointer.worldY / this.TILE_SIZE);

      // Check if clicking on an enemy for attack
      const enemyIndex = this.enemyData.findIndex(e => e.gridX === gridX && e.gridY === gridY);
      if (enemyIndex !== -1) {
        const enemy = this.enemyData[enemyIndex];
        if (enemy.health > 0) {
          const distance = this.getGridDistance(this.playerGridX, this.playerGridY, gridX, gridY);
          const weaponRange = this.getWeaponRange(this.selectedWeapon);

          console.log('Click on enemy:', enemy.name, 'Distance:', distance, 'Weapon range:', weaponRange, 'Selected weapon:', this.selectedWeapon);

          if (this.isWithinWeaponRange(gridX, gridY, this.selectedWeapon)) {
            this.attackEnemy(enemy, enemyIndex);
          } else {
            console.log('Target out of range! Distance:', distance, 'Max range:', weaponRange.max);
            // Add visual feedback for out of range
            if (this.combatManager) {
              const logEntry = {
                id: `${Date.now()}-${Math.random()}`,
                timestamp: Date.now(),
                message: `${enemy.name} is out of range! (${distance} squares, max range: ${weaponRange.max})`,
                type: 'miss' as const,
              };
              const currentLog = this.combatManager.getCombatLog();
              currentLog.push(logEntry);
              this.game.events.emit('combatLogUpdate', [...currentLog]);
            }
          }
        }
        return;
      }

      // Otherwise try to move
      if (this.canMoveTo(gridX, gridY)) {
        this.movePlayerTo(gridX, gridY);
      }
    });

    // Add instructions
    this.add.text(16, 16, 'Arrow Keys/Click to Move | A or Click Enemy to Attack | Space to End Turn', {
      fontSize: '12px',
      color: '#f5e6d3',
      backgroundColor: '#2d1b0e',
      padding: { x: 8, y: 4 },
    }).setDepth(100);

    // Add character stats display
    if (this.character) {
      const statsText = `${this.character.name} | Pace: ${this.character.pace} squares
Parry: ${this.character.parry} | Toughness: ${this.character.toughness}`;

      this.add.text(16, arenaHeight - 50, statsText, {
        fontSize: '12px',
        color: '#f5e6d3',
        backgroundColor: '#2d1b0e',
        padding: { x: 8, y: 4 },
      }).setDepth(100);
    }

    // Show initial movement range
    this.updateMovementRange();

    // Initialize type-safe event bus
    this.gameEvents = wrapSceneEvents(this);

    // Listen for action button events from React (TYPE-SAFE)
    this.gameEvents.on('playerActionSelected', (payload) => {
      this.handlePlayerAction(payload);
    });

    // PHASE 1: Listen for called shot target selection from React (TYPE-SAFE)
    this.gameEvents.on('calledShotSelected', (payload) => {
      if (this.combatManager) {
        this.combatManager.setCalledShotTarget(payload.target);
        this.gameEvents.emit('combatLogUpdate', { log: [...this.combatManager.getCombatLog()] });
      }
      console.log('[ArenaScene] Called shot target selected:', payload.target);
    });

    // Listen for weapon selection changes from React (TYPE-SAFE)
    this.gameEvents.on('weaponSelected', (payload) => {
      console.log('[ArenaScene] Weapon object received:', JSON.stringify(payload.weapon, null, 2));
      this.selectedWeapon = payload.weapon;
      console.log('[ArenaScene] this.selectedWeapon after assignment:', JSON.stringify(this.selectedWeapon, null, 2));
      this.updateMovementRange(); // Refresh range indicators
    });

    // Listen for camera follow toggle from React (TYPE-SAFE)
    this.gameEvents.on('cameraFollowToggle', (payload) => {
      console.log('[ArenaScene] Camera follow toggled:', payload.enabled);
      this.cameraFollowEnabled = payload.enabled;
      if (payload.enabled && this.player) {
        // Re-enable camera follow
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
      } else {
        // Disable camera follow
        this.cameras.main.stopFollow();
      }
    });

    // Listen for weapon ranges toggle from React (TYPE-SAFE)
    this.gameEvents.on('weaponRangesToggle', (payload) => {
      console.log('[ArenaScene] Weapon ranges display toggled:', payload.enabled);
      this.showWeaponRanges = payload.enabled;
      this.updateMovementRange(); // Refresh to show/hide ranges
    });

    // Listen for movement ranges toggle from React (TYPE-SAFE)
    this.gameEvents.on('movementRangesToggle', (payload) => {
      console.log('[ArenaScene] Movement ranges display toggled:', payload.enabled);
      this.showMovementRanges = payload.enabled;
      this.updateMovementRange(); // Refresh to show/hide ranges
    });

    // Set up camera zoom controls
    this.setupZoomControls();
  }

  private setupZoomControls() {
    // Mouse wheel zoom
    this.input.on('wheel', (pointer: any, gameObjects: any, deltaX: number, deltaY: number, deltaZ: number) => {
      const zoomChange = deltaY > 0 ? -0.1 : 0.1;
      this.currentZoom = Phaser.Math.Clamp(this.currentZoom + zoomChange, this.minZoom, this.maxZoom);
      this.cameras.main.setZoom(this.currentZoom);
    });

    // Keyboard zoom controls (+ and - keys)
    this.input.keyboard?.on('keydown-PLUS', () => {
      this.currentZoom = Phaser.Math.Clamp(this.currentZoom + 0.1, this.minZoom, this.maxZoom);
      this.cameras.main.setZoom(this.currentZoom);
    });

    this.input.keyboard?.on('keydown-MINUS', () => {
      this.currentZoom = Phaser.Math.Clamp(this.currentZoom - 0.1, this.minZoom, this.maxZoom);
      this.cameras.main.setZoom(this.currentZoom);
    });

    // Also support = key for zoom in (no shift needed)
    this.input.keyboard?.on('keydown-EQUALS', () => {
      this.currentZoom = Phaser.Math.Clamp(this.currentZoom + 0.1, this.minZoom, this.maxZoom);
      this.cameras.main.setZoom(this.currentZoom);
    });
  }

  private drawGrid() {
    this.gridGraphics = this.add.graphics();
    this.gridGraphics.lineStyle(1, 0x4a3425, 0.3); // Subtle brown grid lines

    // Draw vertical lines
    for (let x = 0; x <= this.GRID_WIDTH; x++) {
      this.gridGraphics.lineBetween(
        x * this.TILE_SIZE,
        0,
        x * this.TILE_SIZE,
        this.GRID_HEIGHT * this.TILE_SIZE
      );
    }

    // Draw horizontal lines
    for (let y = 0; y <= this.GRID_HEIGHT; y++) {
      this.gridGraphics.lineBetween(
        0,
        y * this.TILE_SIZE,
        this.GRID_WIDTH * this.TILE_SIZE,
        y * this.TILE_SIZE
      );
    }

    // Draw border
    this.gridGraphics.lineStyle(4, 0x8b4513);
    this.gridGraphics.strokeRect(
      0,
      0,
      this.GRID_WIDTH * this.TILE_SIZE,
      this.GRID_HEIGHT * this.TILE_SIZE
    );
  }

  private createPlayer(gridX: number, gridY: number) {
    const pixelX = gridX * this.TILE_SIZE + this.TILE_SIZE / 2;
    const pixelY = gridY * this.TILE_SIZE + this.TILE_SIZE / 2;

    this.player = this.add.rectangle(
      pixelX,
      pixelY,
      this.TILE_SIZE - 4,
      this.TILE_SIZE - 4,
      0x4169e1 // Blue for player
    );
    this.player.setStrokeStyle(2, 0xffffff);
    this.player.setDepth(10);

    // Add player label
    if (this.character) {
      const nameText = this.add.text(
        pixelX,
        pixelY - this.TILE_SIZE / 2 - 10,
        this.character.name,
        {
          fontSize: '10px',
          color: '#ffffff',
          backgroundColor: '#000000',
          padding: { x: 3, y: 1 },
        }
      );
      nameText.setOrigin(0.5);
      nameText.setDepth(11);
      this.player.setData('nameText', nameText);
    }
  }

  private createTestEnemy(gridX: number, gridY: number) {
    // Create enemy data (Savage Worlds stats)
    const enemyData: GameEnemy = {
      id: `enemy_${Date.now()}`,
      name: 'Bandit',
      type: 'humanoid',
      health: 20,
      maxHealth: 20,
      toughness: 5,
      parry: 4,
      pace: 6,
      fightingDie: '1d6',
      strengthDie: '1d6',
      gridX,
      gridY,
      aiState: 'idle',
      hasActed: false,
      hasRun: false, // PHASE 1: Running target modifier
    };
    this.enemyData.push(enemyData);

    const pixelX = gridX * this.TILE_SIZE + this.TILE_SIZE / 2;
    const pixelY = gridY * this.TILE_SIZE + this.TILE_SIZE / 2;

    const enemy = this.add.rectangle(
      pixelX,
      pixelY,
      this.TILE_SIZE - 4,
      this.TILE_SIZE - 4,
      0xff4444 // Red for enemy
    );
    enemy.setStrokeStyle(2, 0xffffff);
    enemy.setDepth(10);
    enemy.setData('enemyId', enemyData.id);
    this.enemySprites.push(enemy);

    // Add enemy label
    const enemyText = this.add.text(
      pixelX,
      pixelY - this.TILE_SIZE / 2 - 10,
      enemyData.name,
      {
        fontSize: '10px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 3, y: 1 },
      }
    );
    enemyText.setOrigin(0.5);
    enemyText.setDepth(11);
    enemy.setData('nameText', enemyText);
  }

  private updateMovementRange() {
    if (!this.movementRangeGraphics || !this.character || !this.combatManager) return;
    if (this.combatManager.getCurrentPhase() !== 'player') return;

    this.movementRangeGraphics.clear();
    if (this.attackRangeGraphics) {
      this.attackRangeGraphics.clear();
    }
    if (this.lineOfSightGraphics) {
      this.lineOfSightGraphics.clear();
    }

    const pace = this.character.pace || 6;

    // Highlight all tiles within movement range (only if enabled)
    if (this.showMovementRanges) {
      for (let x = 0; x < this.GRID_WIDTH; x++) {
        for (let y = 0; y < this.GRID_HEIGHT; y++) {
          const distance = this.getGridDistance(this.playerGridX, this.playerGridY, x, y);

          if (distance <= pace && distance > 0) {
            // Check if tile is occupied by enemy
            const isOccupied = this.enemyData.some(enemy => enemy.gridX === x && enemy.gridY === y && enemy.health > 0);

            if (!isOccupied) {
              // Highlight valid movement tiles in blue
              this.movementRangeGraphics.fillStyle(0x4169e1, 0.2);
              this.movementRangeGraphics.fillRect(
                x * this.TILE_SIZE + 2,
                y * this.TILE_SIZE + 2,
                this.TILE_SIZE - 4,
                this.TILE_SIZE - 4
              );
            }
          }
        }
      }
    }

    // Highlight grid squares based on weapon range (only if enabled)
    if (this.attackRangeGraphics && this.showWeaponRanges) {
      const weaponRange = this.getWeaponRange(this.selectedWeapon);

      // Color grid squares based on weapon range
      for (let y = 0; y < this.GRID_HEIGHT; y++) {
        for (let x = 0; x < this.GRID_WIDTH; x++) {
          // Skip player position
          if (x === this.playerGridX && y === this.playerGridY) continue;

          const distance = this.getGridDistance(this.playerGridX, this.playerGridY, x, y);

          // Determine color based on range
          let color: number | null = null;
          let alpha = 0.15;

          if (distance <= weaponRange.short && distance > 0) {
            color = 0x44ff44; // Green for short range
            alpha = 0.2;
          } else if (distance <= weaponRange.medium) {
            color = 0xffaa44; // Orange for medium range
            alpha = 0.18;
          } else if (distance <= weaponRange.long) {
            color = 0xff4444; // Red for long range
            alpha = 0.15;
          }

          // Draw colored square if in range
          if (color !== null) {
            this.attackRangeGraphics!.fillStyle(color, alpha);
            this.attackRangeGraphics!.fillRect(
              x * this.TILE_SIZE + 1,
              y * this.TILE_SIZE + 1,
              this.TILE_SIZE - 2,
              this.TILE_SIZE - 2
            );
          }
        }
      }

      // Highlight individual enemies with color based on range
      this.enemyData.forEach(enemy => {
        if (enemy.health > 0 && this.isWithinWeaponRange(enemy.gridX, enemy.gridY, this.selectedWeapon)) {
          const distance = this.getGridDistance(this.playerGridX, this.playerGridY, enemy.gridX, enemy.gridY);
          const penalty = this.getRangePenalty(distance, this.selectedWeapon);

          let color = 0xff8844;
          let alpha = 0.3;

          if (penalty === 0) {
            color = 0x44ff44; // Green for short range (no penalty)
            alpha = 0.4;
          } else if (penalty === -2) {
            color = 0xffaa44; // Orange for medium range (-2)
            alpha = 0.35;
          } else if (penalty === -4) {
            color = 0xff4444; // Red for long range (-4)
            alpha = 0.3;
          }

          this.attackRangeGraphics!.fillStyle(color, alpha);
          this.attackRangeGraphics!.fillRect(
            enemy.gridX * this.TILE_SIZE + 2,
            enemy.gridY * this.TILE_SIZE + 2,
            this.TILE_SIZE - 4,
            this.TILE_SIZE - 4
          );

          // Show attack info if hovering over this enemy
          if (this.hoveredTile && this.hoveredTile.x === enemy.gridX && this.hoveredTile.y === enemy.gridY) {
            this.showAttackInfo(enemy, distance, penalty);
          }
        }
      });
    }

    // Clear attack info if not hovering over an enemy
    if (this.attackInfoText && (!this.hoveredTile || !this.enemyData.some(e =>
      e.health > 0 && e.gridX === this.hoveredTile!.x && e.gridY === this.hoveredTile!.y &&
      this.isWithinWeaponRange(e.gridX, e.gridY, this.selectedWeapon)
    ))) {
      this.attackInfoText.setVisible(false);
    }

    // Highlight hovered tile (only if movement ranges are shown)
    if (this.hoveredTile && this.showMovementRanges) {
      const distance = this.getGridDistance(
        this.playerGridX,
        this.playerGridY,
        this.hoveredTile.x,
        this.hoveredTile.y
      );

      if (distance <= pace && distance > 0 && this.canMoveTo(this.hoveredTile.x, this.hoveredTile.y)) {
        this.movementRangeGraphics.fillStyle(0xffff00, 0.3); // Yellow highlight
        this.movementRangeGraphics.fillRect(
          this.hoveredTile.x * this.TILE_SIZE + 2,
          this.hoveredTile.y * this.TILE_SIZE + 2,
          this.TILE_SIZE - 4,
          this.TILE_SIZE - 4
        );
      }
    }

    // Draw line of sight to hovered enemy
    if (this.hoveredTile && this.lineOfSightGraphics) {
      // Check if hoveredTile contains an enemy
      const hoveredEnemy = this.enemyData.find(
        enemy => enemy.health > 0 && enemy.gridX === this.hoveredTile!.x && enemy.gridY === this.hoveredTile!.y
      );

      if (hoveredEnemy) {
        this.drawLineOfSight(this.hoveredTile.x, this.hoveredTile.y);
      }
    }
  }

  private getGridDistance(x1: number, y1: number, x2: number, y2: number): number {
    // Chebyshev distance (diagonal movement counts as 1 square in Savage Worlds)
    return Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
  }

  private canMoveTo(gridX: number, gridY: number): boolean {
    if (!this.character) return false;

    const distance = this.getGridDistance(this.playerGridX, this.playerGridY, gridX, gridY);

    // Check if within remaining movement budget
    if (distance > this.movementBudget) return false;

    // Check if tile is occupied by enemy
    const isOccupied = this.enemyData.some(enemy => enemy.gridX === gridX && enemy.gridY === gridY && enemy.health > 0);

    return !isOccupied;
  }

  private isAdjacentToPlayer(gridX: number, gridY: number): boolean {
    const distance = this.getGridDistance(this.playerGridX, this.playerGridY, gridX, gridY);
    return distance === 1; // Adjacent = distance of 1 (Manhattan)
  }

  /**
   * Parse weapon range from string (e.g., "12/24/48") and return max effective range
   * Returns {short, medium, long, max}
   */
  private getWeaponRange(weapon?: Equipment): { short: number; medium: number; long: number; max: number } {
    if (!weapon || !weapon.range) {
      // Melee weapon - adjacent only
      return { short: 1, medium: 1, long: 1, max: 1 };
    }

    const rangeParts = weapon.range.split('/').map(r => parseInt(r.trim(), 10));

    if (rangeParts.length >= 3) {
      // Format: "12/24/48" - use as-is
      return {
        short: rangeParts[0],
        medium: rangeParts[1],
        long: rangeParts[2],
        max: rangeParts[2],
      };
    } else if (rangeParts.length === 1 && !isNaN(rangeParts[0])) {
      // Format: "20" - single number, calculate standard Savage Worlds increments
      // Short = base, Medium = 2x base, Long = 4x base
      const baseRange = rangeParts[0];
      return {
        short: baseRange,
        medium: baseRange * 2,
        long: baseRange * 4,
        max: baseRange * 4,
      };
    }

    // Fallback for unusual formats - treat as melee
    return { short: 1, medium: 1, long: 1, max: 1 };
  }

  /**
   * Calculate range penalty based on distance
   * Savage Worlds: -2 at medium range, -4 at long range
   */
  private getRangePenalty(distance: number, weapon?: Equipment): number {
    const range = this.getWeaponRange(weapon);

    if (distance <= range.short) {
      return 0; // No penalty at short range
    } else if (distance <= range.medium) {
      return -2; // Medium range penalty
    } else if (distance <= range.long) {
      return -4; // Long range penalty
    }

    return -99; // Out of range
  }

  /**
   * Check if target is within weapon range
   */
  private isWithinWeaponRange(gridX: number, gridY: number, weapon?: Equipment): boolean {
    const distance = this.getGridDistance(this.playerGridX, this.playerGridY, gridX, gridY);
    const range = this.getWeaponRange(weapon);
    return distance <= range.max;
  }

  /**
   * Show attack info text for hovered enemy
   */
  private showAttackInfo(enemy: GameEnemy, distance: number, rangePenalty: number) {
    if (!this.character) return;

    // Create text if it doesn't exist
    if (!this.attackInfoText) {
      this.attackInfoText = this.add.text(0, 0, '', {
        fontSize: '11px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 6, y: 4 },
      }).setDepth(150);
    }

    // Calculate modifiers
    const isRangedWeapon = this.selectedWeapon && this.selectedWeapon.range;
    const isInMeleeRange = distance <= 1;

    // Determine appropriate skill and target number
    // Savage Worlds rule: Parry only applies to ranged attacks if attacker is within melee range
    let attackSkill: string;
    let attackDie: string;
    let targetNumber: number;

    if (isRangedWeapon) {
      const shootingSkill = this.character.skills?.find(s =>
        s.name.toLowerCase().includes('shooting') || s.name.toLowerCase().includes('throwing')
      );
      attackDie = shootingSkill?.dieValue || '1d6';
      attackSkill = shootingSkill?.name || 'Shooting';

      // Ranged: Use Parry only if in melee range, otherwise use base target 4
      targetNumber = isInMeleeRange ? enemy.parry : 4;
    } else {
      // Melee: Always use Fighting skill vs Parry
      const fightingSkill = this.character.skills?.find(s => s.name.toLowerCase().includes('fighting'));
      attackDie = fightingSkill?.dieValue || '1d6';
      attackSkill = 'Fighting';
      targetNumber = enemy.parry;
    }

    const woundPenalty = this.combatManager ? this.combatManager.getPlayerWounds() * -1 : 0;
    const coverPenalty = this.checkLineOfSight(this.playerGridX, this.playerGridY, enemy.gridX, enemy.gridY);
    const totalModifier = woundPenalty + rangePenalty + coverPenalty;

    // Build info string
    let info = `Target: ${enemy.name}\n`;
    info += `Distance: ${distance} squares\n`;
    info += `${attackSkill}: ${attackDie}`;
    if (totalModifier !== 0) {
      info += ` ${totalModifier >= 0 ? '+' : ''}${totalModifier}`;
    }

    // Show appropriate target number
    if (isRangedWeapon && !isInMeleeRange) {
      info += ` vs TN ${targetNumber}\n`;
    } else {
      info += ` vs Parry ${targetNumber}\n`;
    }

    if (rangePenalty < 0) {
      info += `Range Penalty: ${rangePenalty}\n`;
    }
    if (coverPenalty < 0) {
      const coverType = coverPenalty === -4 ? 'Cover' : 'Light Cover';
      info += `${coverType}: ${coverPenalty}\n`;
    }
    if (woundPenalty < 0) {
      info += `Wound Penalty: ${woundPenalty}\n`;
    }

    this.attackInfoText.setText(info);
    this.attackInfoText.setPosition(
      enemy.gridX * this.TILE_SIZE + this.TILE_SIZE + 4,
      enemy.gridY * this.TILE_SIZE
    );
    this.attackInfoText.setVisible(true);
  }

  private movePlayerTo(gridX: number, gridY: number) {
    if (!this.player) return;

    // Calculate distance moved
    const distanceMoved = this.getGridDistance(this.playerGridX, this.playerGridY, gridX, gridY);

    // Deduct from movement budget
    this.movementBudget = Math.max(0, this.movementBudget - distanceMoved);

    // PHASE 1: Clear aim when player moves (Savage Worlds rule)
    if (this.combatManager && this.combatManager.getPlayerAiming()) {
      this.combatManager.setPlayerAiming(false);
      const logEntry = {
        id: `${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        message: 'Aim cancelled by movement',
        type: 'info' as const,
      };
      const currentLog = this.combatManager.getCombatLog();
      currentLog.push(logEntry);
      this.game.events.emit('combatLogUpdate', [...currentLog]);
    }

    // Emit movement budget update to React
    this.game.events.emit('movementBudgetUpdate', {
      current: this.movementBudget,
      max: this.maxMovementBudget,
    });

    // Update grid position
    this.playerGridX = gridX;
    this.playerGridY = gridY;

    // Update pixel position
    const pixelX = gridX * this.TILE_SIZE + this.TILE_SIZE / 2;
    const pixelY = gridY * this.TILE_SIZE + this.TILE_SIZE / 2;

    // Smooth tween to new position
    this.tweens.add({
      targets: this.player,
      x: pixelX,
      y: pixelY,
      duration: 200,
      ease: 'Power2',
    });

    // Update name label
    const nameText = this.player.getData('nameText') as Phaser.GameObjects.Text;
    if (nameText) {
      this.tweens.add({
        targets: nameText,
        x: pixelX,
        y: pixelY - this.TILE_SIZE / 2 - 10,
        duration: 200,
        ease: 'Power2',
      });
    }

    // Update movement range after move
    this.time.delayedCall(250, () => {
      this.updateMovementRange();
    });
  }

  update(time: number, delta: number) {
    if (!this.player || !this.cursors || !this.combatManager) return;
    if (this.combatManager.getCurrentPhase() !== 'player') return;

    // Camera panning (when follow is disabled)
    if (!this.cameraFollowEnabled) {
      const camera = this.cameras.main;

      if (this.cursors.left.isDown) {
        camera.scrollX -= this.cameraPanSpeed;
      } else if (this.cursors.right.isDown) {
        camera.scrollX += this.cameraPanSpeed;
      }

      if (this.cursors.up.isDown) {
        camera.scrollY -= this.cameraPanSpeed;
      } else if (this.cursors.down.isDown) {
        camera.scrollY += this.cameraPanSpeed;
      }
    } else {
      // Keyboard movement (grid-based) - only when camera follow is enabled
      if (time - this.lastMoveTime > this.moveDelay) {
        let newX = this.playerGridX;
        let newY = this.playerGridY;

        if (this.cursors.left.isDown) {
          newX--;
        } else if (this.cursors.right.isDown) {
          newX++;
        }

        if (this.cursors.up.isDown) {
          newY--;
        } else if (this.cursors.down.isDown) {
          newY++;
        }

        // Check if movement is valid
        if ((newX !== this.playerGridX || newY !== this.playerGridY)) {
          if (newX >= 0 && newX < this.GRID_WIDTH && newY >= 0 && newY < this.GRID_HEIGHT) {
            if (this.canMoveTo(newX, newY)) {
              this.movePlayerTo(newX, newY);
              this.lastMoveTime = time;
            }
          }
        }
      }
    }

    // End turn on spacebar
    if (this.spaceKey?.isDown && time - this.lastActionTime > 500) {
      this.endPlayerTurn();
      this.lastActionTime = time;
    }

    // Attack enemy within range with A key
    if (this.attackKey?.isDown && time - this.lastActionTime > 500) {
      const targetEnemy = this.enemyData.find(enemy =>
        enemy.health > 0 && this.isWithinWeaponRange(enemy.gridX, enemy.gridY, this.selectedWeapon)
      );
      if (targetEnemy) {
        const enemyIndex = this.enemyData.indexOf(targetEnemy);
        this.attackEnemy(targetEnemy, enemyIndex);
        this.lastActionTime = time;
      }
    }
  }

  private attackEnemy(enemy: GameEnemy, enemyIndex: number) {
    if (!this.combatManager) return;

    // Calculate range penalty
    const distance = this.getGridDistance(this.playerGridX, this.playerGridY, enemy.gridX, enemy.gridY);
    const rangePenalty = this.getRangePenalty(distance, this.selectedWeapon);

    // Check line of sight and cover
    const coverPenalty = this.checkLineOfSight(this.playerGridX, this.playerGridY, enemy.gridX, enemy.gridY);

    // Combine all penalties
    const totalPenalty = rangePenalty + coverPenalty;

    // Use combat manager to perform attack with selected weapon (or fists as fallback)
    const weapon = this.selectedWeapon
      ? { name: this.selectedWeapon.name, damage: this.selectedWeapon.damage, rangePenalty: totalPenalty, range: this.selectedWeapon.range }
      : { name: 'Fists', damage: 'Str+d4', rangePenalty: totalPenalty };

    const result = this.combatManager.playerAttackEnemy(enemy, weapon, distance);

    // Emit health update
    this.game.events.emit('healthUpdate', {
      playerHealth: this.combatManager.getPlayerHealth(),
      playerMaxHealth: this.combatManager.getPlayerMaxHealth(),
    });

    // Update enemy sprite if defeated
    if (enemy.health <= 0) {
      const sprite = this.enemySprites[enemyIndex];
      if (sprite) {
        sprite.setAlpha(0.3); // Make defeated enemies semi-transparent
        const nameText = sprite.getData('nameText') as Phaser.GameObjects.Text;
        if (nameText) {
          nameText.setAlpha(0.3);
        }
      }

      // Check victory
      this.combatManager.checkVictory(this.enemyData);
    }

    this.updateMovementRange();
  }

  private handlePlayerAction(action: { type: string; name: string }) {
    if (!this.combatManager || this.combatManager.getCurrentPhase() !== 'player') return;

    switch (action.type) {
      case 'attack': {
        // Find the nearest enemy within weapon range and attack
        const targetEnemy = this.enemyData.find(enemy =>
          enemy.health > 0 && this.isWithinWeaponRange(enemy.gridX, enemy.gridY, this.selectedWeapon)
        );
        if (targetEnemy) {
          const enemyIndex = this.enemyData.indexOf(targetEnemy);
          this.attackEnemy(targetEnemy, enemyIndex);
        } else {
          // Add combat log message if no enemy in range
          this.combatManager.getCombatLog();
          console.log('No enemy within weapon range to attack');
        }
        break;
      }
      case 'defend':
        console.log('Full Defense action - not yet implemented');
        break;
      case 'aim': {
        // PHASE 1: Aim action - gives +2 to next ranged attack
        if (this.combatManager) {
          this.combatManager.setPlayerAiming(true);
          this.game.events.emit('combatLogUpdate', [...this.combatManager.getCombatLog()]);
        }
        console.log('Aim action: +2 to next ranged attack');
        break;
      }
      case 'run': {
        // Sprint action: Pace + d6 movement
        // Roll a d6 for extra movement
        const sprintRoll = Math.floor(Math.random() * 6) + 1;
        const pace = this.character?.pace || 6;
        const totalMovement = pace + sprintRoll;

        // Update movement budget
        this.movementBudget = totalMovement;
        this.maxMovementBudget = totalMovement;

        // PHASE 1: Mark player as having run this turn (for enemy attacks)
        if (this.combatManager) {
          this.combatManager.setPlayerHasRun(true);
        }

        // Log the sprint
        const logEntry = {
          id: `${Date.now()}-${Math.random()}`,
          timestamp: Date.now(),
          message: `Sprint! Rolling d6 for extra movement: ${sprintRoll}. Total movement: ${totalMovement} squares`,
          type: 'info' as const,
        };

        if (this.combatManager) {
          const currentLog = this.combatManager.getCombatLog();
          currentLog.push(logEntry);
          this.game.events.emit('combatLogUpdate', [...currentLog]);
        }

        // Emit movement budget update
        this.game.events.emit('movementBudgetUpdate', {
          current: this.movementBudget,
          max: this.maxMovementBudget,
        });

        // Update movement range display
        this.updateMovementRange();

        console.log(`Sprint action: Pace (${pace}) + d6 (${sprintRoll}) = ${totalMovement} squares`);
        break;
      }
      case 'other':
        console.log('Test of Wills - not yet implemented');
        break;
      default:
        console.log('Unknown action:', action.type);
    }
  }

  private endPlayerTurn() {
    if (!this.combatManager) return;

    if (this.movementRangeGraphics) {
      this.movementRangeGraphics.clear();
    }
    if (this.attackRangeGraphics) {
      this.attackRangeGraphics.clear();
    }

    this.combatManager.endPlayerTurn();
  }

  private executeEnemyTurn() {
    if (!this.combatManager) return;

    // Simple AI: Each alive enemy moves toward player and attacks if adjacent
    this.enemyData.forEach((enemy, index) => {
      if (enemy.health <= 0) return;

      // Check if already adjacent to player
      if (this.isAdjacentToPlayer(enemy.gridX, enemy.gridY)) {
        // Attack player
        this.combatManager!.enemyAttackPlayer(enemy);

        // Emit wounds and shaken status updates
        this.game.events.emit('woundsUpdate', {
          wounds: this.combatManager!.getPlayerWounds(),
          maxWounds: 3,
        });
        this.game.events.emit('shakenUpdate', {
          isShaken: this.combatManager!.getPlayerShaken(),
        });

        // Emit health update
        this.game.events.emit('healthUpdate', {
          playerHealth: this.combatManager!.getPlayerHealth(),
          playerMaxHealth: this.combatManager!.getPlayerMaxHealth(),
        });
      } else {
        // Move toward player (simple pathfinding - move closer on X or Y)
        const dx = this.playerGridX - enemy.gridX;
        const dy = this.playerGridY - enemy.gridY;

        let newX = enemy.gridX;
        let newY = enemy.gridY;

        if (Math.abs(dx) > Math.abs(dy)) {
          // Move horizontally
          newX += dx > 0 ? 1 : -1;
        } else {
          // Move vertically
          newY += dy > 0 ? 1 : -1;
        }

        // Check if new position is valid (not occupied by another enemy or player)
        const isOccupied = this.enemyData.some(e => e.gridX === newX && e.gridY === newY);
        const isPlayerPos = newX === this.playerGridX && newY === this.playerGridY;

        if (!isOccupied && !isPlayerPos) {
          // Move enemy
          enemy.gridX = newX;
          enemy.gridY = newY;

          // Update sprite position
          const sprite = this.enemySprites[index];
          if (sprite) {
            const pixelX = newX * this.TILE_SIZE + this.TILE_SIZE / 2;
            const pixelY = newY * this.TILE_SIZE + this.TILE_SIZE / 2;
            this.tweens.add({
              targets: sprite,
              x: pixelX,
              y: pixelY,
              duration: 300,
              ease: 'Power2',
            });

            const nameText = sprite.getData('nameText') as Phaser.GameObjects.Text;
            if (nameText) {
              this.tweens.add({
                targets: nameText,
                x: pixelX,
                y: pixelY - this.TILE_SIZE / 2 - 10,
                duration: 300,
                ease: 'Power2',
              });
            }
          }

          // Attack if now adjacent
          if (this.isAdjacentToPlayer(newX, newY)) {
            this.time.delayedCall(400, () => {
              this.combatManager!.enemyAttackPlayer(enemy);

              // Emit wounds and shaken status updates
              this.game.events.emit('woundsUpdate', {
                wounds: this.combatManager!.getPlayerWounds(),
                maxWounds: 3,
              });
              this.game.events.emit('shakenUpdate', {
                isShaken: this.combatManager!.getPlayerShaken(),
              });

              // Emit health update
              this.game.events.emit('healthUpdate', {
                playerHealth: this.combatManager!.getPlayerHealth(),
                playerMaxHealth: this.combatManager!.getPlayerMaxHealth(),
              });
            });
          }
        }
      }
    });

    // End enemy turn after a delay
    this.time.delayedCall(2000, () => {
      if (this.combatManager && this.combatManager.getCurrentPhase() !== 'defeat') {
        // PHASE 1: Pass enemies array to clear running flags
        this.combatManager.endEnemyTurn(this.enemyData);
        this.updateMovementRange();
      }
    });
  }

  /**
   * Create cover objects on the battlefield
   */
  private createCoverObjects() {
    // Buildings (full cover = -4 to hit)
    this.addCover(105, 95, 8, 6, 'full', 0x8b4513); // Building near northeast enemy
    this.addCover(108, 105, 6, 5, 'full', 0x8b4513); // Building near south enemy
    this.addCover(92, 98, 5, 4, 'full', 0x8b4513); // Building near west enemy

    // Walls (partial cover = -2 to hit)
    this.addCover(110, 100, 3, 1, 'partial', 0x696969); // Wall
    this.addCover(95, 95, 1, 5, 'partial', 0x696969); // Wall
    this.addCover(103, 108, 5, 1, 'partial', 0x696969); // Wall
  }

  /**
   * Add a cover object to the battlefield
   */
  private addCover(gridX: number, gridY: number, width: number, height: number, type: 'full' | 'partial', color: number) {
    const pixelX = gridX * this.TILE_SIZE;
    const pixelY = gridY * this.TILE_SIZE;
    const pixelWidth = width * this.TILE_SIZE;
    const pixelHeight = height * this.TILE_SIZE;

    // Create visual representation
    const sprite = this.add.rectangle(
      pixelX + pixelWidth / 2,
      pixelY + pixelHeight / 2,
      pixelWidth,
      pixelHeight,
      color,
      type === 'full' ? 0.8 : 0.5
    );
    sprite.setStrokeStyle(2, 0x000000);
    sprite.setDepth(5);

    // Add label
    const label = this.add.text(
      pixelX + pixelWidth / 2,
      pixelY + pixelHeight / 2,
      type === 'full' ? 'Cover' : 'Light\nCover',
      {
        fontSize: '10px',
        color: '#ffffff',
        align: 'center',
        backgroundColor: '#000000',
        padding: { x: 2, y: 1 },
      }
    );
    label.setOrigin(0.5);
    label.setDepth(6);

    // Store cover data
    this.coverObjects.push({
      x: pixelX,
      y: pixelY,
      width: pixelWidth,
      height: pixelHeight,
      type,
      sprite,
    });
  }

  /**
   * Check line of sight from attacker to target
   * Returns the best cover penalty (-2 or -4) that applies, or 0 if no cover
   */
  /**
   * Draw a line of sight from the player to a target
   * Color-coded based on Savage Worlds LOS rules:
   * - Green: Clear line of sight (no cover)
   * - Yellow: Partial cover (-2 penalty)
   * - Orange: Full cover (-4 penalty)
   */
  private drawLineOfSight(targetGridX: number, targetGridY: number) {
    if (!this.lineOfSightGraphics) return;

    // Get cover penalty
    const coverPenalty = this.checkLineOfSight(
      this.playerGridX,
      this.playerGridY,
      targetGridX,
      targetGridY
    );

    // Determine line color based on cover
    let lineColor: number;
    let lineAlpha = 0.8;
    if (coverPenalty === 0) {
      lineColor = 0x44ff44; // Green for clear LOS
    } else if (coverPenalty === -2) {
      lineColor = 0xffff00; // Yellow for partial cover
    } else {
      lineColor = 0xffaa44; // Orange for full cover
    }

    // Calculate pixel positions (center of tiles)
    const fromPixelX = this.playerGridX * this.TILE_SIZE + this.TILE_SIZE / 2;
    const fromPixelY = this.playerGridY * this.TILE_SIZE + this.TILE_SIZE / 2;
    const toPixelX = targetGridX * this.TILE_SIZE + this.TILE_SIZE / 2;
    const toPixelY = targetGridY * this.TILE_SIZE + this.TILE_SIZE / 2;

    // Draw the line
    this.lineOfSightGraphics.lineStyle(3, lineColor, lineAlpha);
    this.lineOfSightGraphics.beginPath();
    this.lineOfSightGraphics.moveTo(fromPixelX, fromPixelY);
    this.lineOfSightGraphics.lineTo(toPixelX, toPixelY);
    this.lineOfSightGraphics.strokePath();

    // Draw endpoint circles for clarity
    this.lineOfSightGraphics.fillStyle(lineColor, lineAlpha);
    this.lineOfSightGraphics.fillCircle(fromPixelX, fromPixelY, 4);
    this.lineOfSightGraphics.fillCircle(toPixelX, toPixelY, 4);
  }

  private checkLineOfSight(fromGridX: number, fromGridY: number, toGridX: number, toGridY: number): number {
    const fromPixelX = fromGridX * this.TILE_SIZE + this.TILE_SIZE / 2;
    const fromPixelY = fromGridY * this.TILE_SIZE + this.TILE_SIZE / 2;
    const toPixelX = toGridX * this.TILE_SIZE + this.TILE_SIZE / 2;
    const toPixelY = toGridY * this.TILE_SIZE + this.TILE_SIZE / 2;

    let bestCoverPenalty = 0;

    // Check each cover object to see if it intersects the line of sight
    for (const cover of this.coverObjects) {
      if (this.lineIntersectsRect(fromPixelX, fromPixelY, toPixelX, toPixelY, cover)) {
        // Apply the worst penalty (full cover overrides partial)
        const penalty = cover.type === 'full' ? -4 : -2;
        if (penalty < bestCoverPenalty) {
          bestCoverPenalty = penalty;
        }
      }
    }

    return bestCoverPenalty;
  }

  /**
   * Check if a line intersects with a rectangle (cover object)
   * Using line-rectangle intersection algorithm
   */
  private lineIntersectsRect(x1: number, y1: number, x2: number, y2: number, rect: { x: number; y: number; width: number; height: number }): boolean {
    // Check if either endpoint is inside the rectangle
    if (this.pointInRect(x1, y1, rect) || this.pointInRect(x2, y2, rect)) {
      return true;
    }

    // Check if line intersects any of the four sides of the rectangle
    const left = rect.x;
    const right = rect.x + rect.width;
    const top = rect.y;
    const bottom = rect.y + rect.height;

    // Check intersection with each side
    if (
      this.lineIntersectsLine(x1, y1, x2, y2, left, top, right, top) ||     // Top
      this.lineIntersectsLine(x1, y1, x2, y2, right, top, right, bottom) || // Right
      this.lineIntersectsLine(x1, y1, x2, y2, left, bottom, right, bottom) || // Bottom
      this.lineIntersectsLine(x1, y1, x2, y2, left, top, left, bottom)      // Left
    ) {
      return true;
    }

    return false;
  }

  /**
   * Check if a point is inside a rectangle
   */
  private pointInRect(x: number, y: number, rect: { x: number; y: number; width: number; height: number }): boolean {
    return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
  }

  /**
   * Check if two line segments intersect
   */
  private lineIntersectsLine(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): boolean {
    const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
    if (denom === 0) return false; // Parallel lines

    const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
    const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;

    return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
  }
}
