const axios = require('axios');
const { expect } = require('chai');

/**
 * Session API Helper
 *
 * Provides methods for testing session endpoints with:
 * - Automatic JWT token management
 * - Request/response logging for debugging
 * - Network traffic capture for DevTools analysis
 * - Railway deployment log parsing
 */
class SessionAPI {
  constructor(config) {
    this.baseURL = config.apiUrl || 'http://localhost:8080/api';
    this.requests = []; // Store all requests for debugging
    this.responses = []; // Store all responses for debugging
    this.serverLogs = []; // Store server logs if available
  }

  /**
   * Enable debug mode for verbose output
   */
  enableDebug() {
    this.debug = true;
  }

  /**
   * Log request details for debugging
   */
  logRequest(method, url, data, headers) {
    const log = {
      timestamp: new Date().toISOString(),
      method,
      url,
      data,
      headers: {
        ...headers,
        Authorization: headers.Authorization ? `Bearer ${headers.Authorization.substring(7, 27)}...` : 'None'
      }
    };
    this.requests.push(log);

    if (this.debug) {
      console.log('\n========== API REQUEST ==========');
      console.log(`${method} ${url}`);
      console.log(`Headers:`, log.headers);
      if (data) console.log(`Body:`, JSON.stringify(data, null, 2));
      console.log('================================\n');
    }
  }

  /**
   * Log response details for debugging
   */
  logResponse(status, data, headers) {
    const log = {
      timestamp: new Date().toISOString(),
      status,
      data,
      headers
    };
    this.responses.push(log);

    if (this.debug) {
      console.log('\n========== API RESPONSE ==========');
      console.log(`Status: ${status}`);
      console.log(`Data:`, JSON.stringify(data, null, 2));
      console.log('==================================\n');
    }
  }

  /**
   * GET /api/sessions - Get all sessions
   */
  async getAllSessions(token) {
    const url = `${this.baseURL}/sessions`;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    this.logRequest('GET', url, null, headers);

    try {
      const response = await axios.get(url, { headers });
      this.logResponse(response.status, response.data, response.headers);
      return response;
    } catch (error) {
      this.logResponse(
        error.response?.status || 500,
        error.response?.data || error.message,
        error.response?.headers || {}
      );
      throw error;
    }
  }

  /**
   * GET /api/sessions/{id} - Get specific session
   */
  async getSession(sessionId, token) {
    const url = `${this.baseURL}/sessions/${sessionId}`;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    this.logRequest('GET', url, null, headers);

    try {
      const response = await axios.get(url, { headers });
      this.logResponse(response.status, response.data, response.headers);
      return response;
    } catch (error) {
      this.logResponse(
        error.response?.status || 500,
        error.response?.data || error.message,
        error.response?.headers || {}
      );
      throw error;
    }
  }

  /**
   * POST /api/sessions - Create new session (GM only)
   */
  async createSession(sessionData, token) {
    const url = `${this.baseURL}/sessions`;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    this.logRequest('POST', url, sessionData, headers);

    try {
      const response = await axios.post(url, sessionData, { headers });
      this.logResponse(response.status, response.data, response.headers);
      return response;
    } catch (error) {
      this.logResponse(
        error.response?.status || 500,
        error.response?.data || error.message,
        error.response?.headers || {}
      );
      throw error;
    }
  }

  /**
   * POST /api/sessions/{id}/join - Join session with character
   */
  async joinSession(sessionId, characterId, token) {
    const url = `${this.baseURL}/sessions/${sessionId}/join`;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const data = { characterId };

    this.logRequest('POST', url, data, headers);

    try {
      const response = await axios.post(url, data, { headers });
      this.logResponse(response.status, response.data, response.headers);
      return response;
    } catch (error) {
      this.logResponse(
        error.response?.status || 500,
        error.response?.data || error.message,
        error.response?.headers || {}
      );
      throw error;
    }
  }

  /**
   * POST /api/sessions/{id}/leave - Leave session
   */
  async leaveSession(sessionId, token) {
    const url = `${this.baseURL}/sessions/${sessionId}/leave`;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    this.logRequest('POST', url, null, headers);

    try {
      const response = await axios.post(url, {}, { headers });
      this.logResponse(response.status, response.data, response.headers);
      return response;
    } catch (error) {
      this.logResponse(
        error.response?.status || 500,
        error.response?.data || error.message,
        error.response?.headers || {}
      );
      throw error;
    }
  }

  /**
   * GET /api/sessions/{id}/players - Get all players in session
   */
  async getSessionPlayers(sessionId, token) {
    const url = `${this.baseURL}/sessions/${sessionId}/players`;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    this.logRequest('GET', url, null, headers);

    try {
      const response = await axios.get(url, { headers });
      this.logResponse(response.status, response.data, response.headers);
      return response;
    } catch (error) {
      this.logResponse(
        error.response?.status || 500,
        error.response?.data || error.message,
        error.response?.headers || {}
      );
      throw error;
    }
  }

  /**
   * POST /api/sessions/{id}/start - Start game (GM only)
   */
  async startGame(sessionId, token) {
    const url = `${this.baseURL}/sessions/${sessionId}/start`;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    this.logRequest('POST', url, null, headers);

    try {
      const response = await axios.post(url, {}, { headers });
      this.logResponse(response.status, response.data, response.headers);
      return response;
    } catch (error) {
      this.logResponse(
        error.response?.status || 500,
        error.response?.data || error.message,
        error.response?.headers || {}
      );
      throw error;
    }
  }

  /**
   * POST /auth/login - Get JWT token
   */
  async login(username, password) {
    const url = `${this.baseURL}/auth/login`;
    const data = { username, password };

    this.logRequest('POST', url, { username, password: '***' }, {});

    try {
      const response = await axios.post(url, data);
      this.logResponse(response.status, { token: `${response.data.token.substring(0, 20)}...` }, response.headers);
      return response;
    } catch (error) {
      this.logResponse(
        error.response?.status || 500,
        error.response?.data || error.message,
        error.response?.headers || {}
      );
      throw error;
    }
  }

  /**
   * Generate test report
   */
  generateReport() {
    return {
      totalRequests: this.requests.length,
      totalResponses: this.responses.length,
      requests: this.requests,
      responses: this.responses,
      summary: {
        successful: this.responses.filter(r => r.status >= 200 && r.status < 300).length,
        clientErrors: this.responses.filter(r => r.status >= 400 && r.status < 500).length,
        serverErrors: this.responses.filter(r => r.status >= 500).length,
      }
    };
  }

  /**
   * Print summary report to console
   */
  printSummary() {
    const report = this.generateReport();
    console.log('\n========== SESSION API TEST SUMMARY ==========');
    console.log(`Total Requests: ${report.totalRequests}`);
    console.log(`Successful (2xx): ${report.summary.successful}`);
    console.log(`Client Errors (4xx): ${report.summary.clientErrors}`);
    console.log(`Server Errors (5xx): ${report.summary.serverErrors}`);
    console.log('=============================================\n');
  }
}

module.exports = SessionAPI;
