// Game session types for multiplayer

export interface GameSession {
  id: number;
  name: string;
  description?: string;
  gameMaster: {
    id: number;
    username: string;
  };
  active: boolean;
  gameState?: string; // JSON blob
  maxPlayers?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SessionPlayer {
  id: number;
  session: GameSession;
  player: {
    id: number;
    username: string;
  };
  character: {
    id: number;
    name: string;
  };
  connected: boolean;
  color?: string;
  lastActivity?: string;
  joinedAt: string;
  leftAt?: string;
}

export interface CreateSessionRequest {
  name: string;
  description?: string;
  maxPlayers?: number;
}

export interface JoinSessionRequest {
  characterId: number;
}

// WebSocket message types
export interface PlayerJoinedMessage {
  playerId: number;
  playerName: string;
  characterName: string;
}

export interface PlayerLeftMessage {
  playerId: number;
  playerName: string;
}

export interface PlayerConnectedMessage {
  playerId: number;
  playerName: string;
}

export interface PlayerDisconnectedMessage {
  playerId: number;
  playerName: string;
}

export interface GameStartedMessage {
  sessionId: number;
  startedBy: string;
}

// Token movement messages
export interface TokenMoveRequest {
  tokenId: string;
  tokenType: 'PLAYER' | 'ENEMY';
  fromX?: number;
  fromY?: number;
  toX: number;
  toY: number;
}

export interface TokenMovedEvent {
  tokenId: string;
  tokenType: 'PLAYER' | 'ENEMY';
  movedBy: string;
  gridX: number;
  gridY: number;
  timestamp: number;
}
