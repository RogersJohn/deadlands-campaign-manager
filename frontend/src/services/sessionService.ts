import api from './api';
import {
  GameSession,
  SessionPlayer,
  CreateSessionRequest,
  JoinSessionRequest,
} from '../types/session';

/**
 * Service for managing game sessions via REST API
 */
const sessionService = {
  /**
   * Get all active sessions
   */
  getAllSessions: async (): Promise<GameSession[]> => {
    const response = await api.get('/sessions');
    return response.data;
  },

  /**
   * Get a specific session by ID
   */
  getSession: async (id: number): Promise<GameSession> => {
    const response = await api.get(`/sessions/${id}`);
    return response.data;
  },

  /**
   * Create a new session (GM only)
   */
  createSession: async (request: CreateSessionRequest): Promise<GameSession> => {
    const response = await api.post('/sessions', request);
    return response.data;
  },

  /**
   * Join a session with a character
   */
  joinSession: async (sessionId: number, request: JoinSessionRequest): Promise<SessionPlayer> => {
    const response = await api.post(`/sessions/${sessionId}/join`, request);
    return response.data;
  },

  /**
   * Leave a session
   */
  leaveSession: async (sessionId: number): Promise<void> => {
    await api.post(`/sessions/${sessionId}/leave`);
  },

  /**
   * Get all players in a session
   */
  getSessionPlayers: async (sessionId: number): Promise<SessionPlayer[]> => {
    const response = await api.get(`/sessions/${sessionId}/players`);
    return response.data;
  },
};

export default sessionService;
