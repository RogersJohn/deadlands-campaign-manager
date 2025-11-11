// Game-specific TypeScript types
// Isolated from existing character types

export interface Equipment {
  id: number;
  name: string;
  description?: string;
  type: string; // WEAPON_MELEE, WEAPON_RANGED, ARMOR, etc.
  quantity: number;
  damage?: string; // e.g., "2d6+1"
  range?: string; // e.g., "12/24/48"
  rof?: number; // Rate of Fire
  shots?: number; // Ammo capacity
  isEquipped: boolean;
}

export interface Skill {
  id: number;
  name: string;
  dieValue: string; // e.g., "d8", "d10"
}

export interface Edge {
  id: number;
  name: string;
  description?: string;
}

export interface GameCharacter {
  id: number;
  name: string;

  // Savage Worlds Attributes
  agilityDie: string;
  smartsDie: string;
  spiritDie: string;
  strengthDie: string;
  vigorDie: string;

  // Derived Stats
  parry: number;
  toughness: number;
  pace: number;

  // Character abilities
  equipment?: Equipment[];
  skills?: Skill[];
  edges?: Edge[];

  // For game rendering
  characterImageUrl?: string;
}

export interface GameEnemy {
  id: string;
  name: string;
  type: string;

  // Combat stats
  health: number;
  maxHealth: number;
  toughness: number;
  parry: number;
  pace: number;

  // Combat attributes (Savage Worlds)
  fightingDie: string; // e.g., "1d6"
  strengthDie: string; // For damage

  // Position
  gridX: number;
  gridY: number;

  // AI state
  aiState: 'idle' | 'patrol' | 'chase' | 'attack';
  hasActed: boolean; // Whether this enemy has taken its turn
}

export interface CombatState {
  turn: number;
  phase: 'player' | 'enemy' | 'animating';

  // Player state
  playerHealth: number;
  playerMaxHealth: number;
  playerPosition: { x: number; y: number };
  playerWounds: number;
  playerShaken: boolean;
  playerSelectedWeapon?: Equipment;
  playerActions: number; // Remaining actions this turn

  enemies: GameEnemy[];

  combatLog: CombatLogEntry[];
}

export type CombatActionType =
  | 'attack_melee'
  | 'attack_ranged'
  | 'aim'
  | 'defend'
  | 'run'
  | 'grapple'
  | 'disarm'
  | 'called_shot'
  | 'wild_attack'
  | 'trick'
  | 'test_of_wills'
  | 'support'
  | 'multi_action'
  | 'unshaken'
  | 'use_power'
  | 'reload'
  | 'change_weapon'
  | 'use_item'
  | 'coup_de_grace'
  | 'finishing_move'
  | 'evasion'
  | 'withdraw';

export interface CombatAction {
  type: CombatActionType;
  name: string;
  description: string;
  icon: string;
  modifier?: string; // e.g. "-2 to attack", "+2 to Parry"
  requiresTarget?: boolean;
  requiresArcane?: boolean;
}

export interface CombatLogEntry {
  id: string;
  timestamp: number;
  message: string;
  type: 'info' | 'success' | 'damage' | 'miss';
}

export interface DiceRollResult {
  total: number;
  rolls: number[];
  exploded: boolean;
  dieType: string;
}

export interface DiceRollEvent {
  id: string;
  timestamp: number;
  roller: string; // "Player" or enemy name
  purpose: string; // "Attack", "Damage", "Strength", etc.
  dieType: string; // "1d6", "1d8", etc.
  rolls: number[];
  total: number;
  exploded: boolean;
}
