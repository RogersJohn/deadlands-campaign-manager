import { describe, it, expect, beforeEach, vi } from 'vitest';
import sessionService from '../sessionService';
import api from '../api';

// Mock the api module
vi.mock('../api');

describe('sessionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ========== HAPPY PATH TESTS ==========

  describe('getAllSessions', () => {
    it('should fetch all sessions successfully', async () => {
      const mockSessions = [
        { id: 1, name: 'Session 1', gameMaster: { id: 1, username: 'GM1' }, active: false },
        { id: 2, name: 'Session 2', gameMaster: { id: 1, username: 'GM1' }, active: true },
      ];

      vi.mocked(api.get).mockResolvedValueOnce({ data: mockSessions });

      const result = await sessionService.getAllSessions();

      expect(api.get).toHaveBeenCalledWith('/sessions');
      expect(result).toEqual(mockSessions);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no sessions exist', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: [] });

      const result = await sessionService.getAllSessions();

      expect(result).toEqual([]);
    });
  });

  describe('getSession', () => {
    it('should fetch a specific session by ID', async () => {
      const mockSession = {
        id: 1,
        name: 'Test Session',
        description: 'Test description',
        gameMaster: { id: 1, username: 'GM1' },
        active: false,
      };

      vi.mocked(api.get).mockResolvedValueOnce({ data: mockSession });

      const result = await sessionService.getSession(1);

      expect(api.get).toHaveBeenCalledWith('/sessions/1');
      expect(result).toEqual(mockSession);
      expect(result.name).toBe('Test Session');
    });
  });

  describe('createSession', () => {
    it('should create a session with all fields', async () => {
      const request = {
        name: 'New Session',
        description: 'Test description',
        maxPlayers: 5,
      };

      const mockResponse = {
        id: 1,
        ...request,
        gameMaster: { id: 1, username: 'GM1' },
        active: false,
      };

      vi.mocked(api.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await sessionService.createSession(request);

      expect(api.post).toHaveBeenCalledWith('/sessions', request);
      expect(result).toEqual(mockResponse);
      expect(result.name).toBe('New Session');
    });

    it('should create a session with minimal fields', async () => {
      const request = {
        name: 'Minimal Session',
      };

      const mockResponse = {
        id: 2,
        name: 'Minimal Session',
        gameMaster: { id: 1, username: 'GM1' },
        active: false,
      };

      vi.mocked(api.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await sessionService.createSession(request);

      expect(result.name).toBe('Minimal Session');
      expect(result.description).toBeUndefined();
      expect(result.maxPlayers).toBeUndefined();
    });
  });

  describe('joinSession', () => {
    it('should join a session with a character', async () => {
      const mockResponse = {
        id: 1,
        session: { id: 1, name: 'Test Session' },
        player: { id: 2, username: 'Player1' },
        character: { id: 3, name: 'Character1' },
        connected: false,
      };

      vi.mocked(api.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await sessionService.joinSession(1, { characterId: 3 });

      expect(api.post).toHaveBeenCalledWith('/sessions/1/join', { characterId: 3 });
      expect(result).toEqual(mockResponse);
      expect(result.character.id).toBe(3);
    });
  });

  describe('leaveSession', () => {
    it('should leave a session successfully', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({ data: undefined });

      await sessionService.leaveSession(1);

      expect(api.post).toHaveBeenCalledWith('/sessions/1/leave');
    });
  });

  describe('getSessionPlayers', () => {
    it('should fetch all players in a session', async () => {
      const mockPlayers = [
        {
          id: 1,
          player: { id: 1, username: 'Player1' },
          character: { id: 1, name: 'Char1' },
          connected: true,
        },
        {
          id: 2,
          player: { id: 2, username: 'Player2' },
          character: { id: 2, name: 'Char2' },
          connected: false,
        },
      ];

      vi.mocked(api.get).mockResolvedValueOnce({ data: mockPlayers });

      const result = await sessionService.getSessionPlayers(1);

      expect(api.get).toHaveBeenCalledWith('/sessions/1/players');
      expect(result).toHaveLength(2);
      expect(result[0].connected).toBe(true);
      expect(result[1].connected).toBe(false);
    });
  });

  // ========== EDGE CASE TESTS ==========

  describe('Edge Cases', () => {
    it('should handle API errors gracefully', async () => {
      const errorMessage = 'Network error';
      vi.mocked(api.get).mockRejectedValueOnce(new Error(errorMessage));

      await expect(sessionService.getAllSessions()).rejects.toThrow(errorMessage);
    });

    it('should handle 404 errors when getting non-existent session', async () => {
      const error = { response: { status: 404, data: { message: 'Session not found' } } };
      vi.mocked(api.get).mockRejectedValueOnce(error);

      await expect(sessionService.getSession(999)).rejects.toEqual(error);
    });

    it('should handle 403 errors when joining with wrong character', async () => {
      const error = { response: { status: 403, data: { message: 'Forbidden' } } };
      vi.mocked(api.post).mockRejectedValueOnce(error);

      await expect(sessionService.joinSession(1, { characterId: 999 })).rejects.toEqual(error);
    });

    it('should handle 409 errors when joining full session', async () => {
      const error = { response: { status: 409, data: { message: 'Session is full' } } };
      vi.mocked(api.post).mockRejectedValueOnce(error);

      await expect(sessionService.joinSession(1, { characterId: 1 })).rejects.toEqual(error);
    });

    it('should handle timeout errors', async () => {
      const error = { code: 'ECONNABORTED', message: 'timeout of 5000ms exceeded' };
      vi.mocked(api.get).mockRejectedValueOnce(error);

      await expect(sessionService.getAllSessions()).rejects.toEqual(error);
    });
  });

  // ========== NEGATIVE TESTS ==========

  describe('Authorization', () => {
    it('should handle 401 unauthorized errors', async () => {
      const error = { response: { status: 401, data: { message: 'Unauthorized' } } };
      vi.mocked(api.get).mockRejectedValueOnce(error);

      await expect(sessionService.getAllSessions()).rejects.toEqual(error);
    });

    it('should handle 403 forbidden errors for non-GM creating session', async () => {
      const error = { response: { status: 403, data: { message: 'Forbidden' } } };
      vi.mocked(api.post).mockRejectedValueOnce(error);

      await expect(
        sessionService.createSession({ name: 'Test' })
      ).rejects.toEqual(error);
    });
  });

  // ========== DATA VALIDATION TESTS ==========

  describe('Data Integrity', () => {
    it('should pass through malformed session data (backend validation)', async () => {
      const malformedData = {
        id: 'not-a-number', // Invalid ID type
        name: null, // Null name
      };

      vi.mocked(api.get).mockResolvedValueOnce({ data: [malformedData] });

      const result = await sessionService.getAllSessions();

      expect(result[0]).toEqual(malformedData);
      // Note: Frontend doesn't validate, backend should reject
    });

    it('should handle extremely long session names', async () => {
      const longName = 'A'.repeat(10000);
      const request = { name: longName };

      // Backend should reject, but frontend passes through
      vi.mocked(api.post).mockRejectedValueOnce({
        response: { status: 400, data: { message: 'Name too long' } },
      });

      await expect(sessionService.createSession(request)).rejects.toBeDefined();
    });
  });
});
