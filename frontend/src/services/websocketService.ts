import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {
  PlayerJoinedMessage,
  PlayerLeftMessage,
  PlayerConnectedMessage,
  PlayerDisconnectedMessage,
  TokenMoveRequest,
  TokenMovedEvent,
} from '../types/session';

/**
 * WebSocket service for real-time multiplayer game sessions.
 *
 * Handles connection to game sessions via STOMP over WebSocket.
 */
class WebSocketService {
  private client: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private sessionId: number | null = null;
  private connected: boolean = false;

  /**
   * Connect to a game session
   */
  async connect(sessionId: number, token: string): Promise<void> {
    if (this.client && this.connected) {
      console.warn('Already connected to a session');
      return;
    }

    this.sessionId = sessionId;

    // Determine WebSocket URL based on environment
    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';

    return new Promise((resolve, reject) => {
      this.client = new Client({
        webSocketFactory: () => new SockJS(wsUrl),
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        debug: (str) => {
          console.log('[STOMP]', str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          console.log('Connected to WebSocket');
          this.connected = true;

          // Send connect message to backend
          this.send(`/app/session/${sessionId}/connect`, {});

          // Start heartbeat
          this.startHeartbeat();

          resolve();
        },
        onStompError: (frame) => {
          console.error('STOMP error:', frame);
          this.connected = false;
          reject(new Error(`STOMP error: ${frame.headers['message']}`));
        },
        onWebSocketError: (event) => {
          console.error('WebSocket error:', event);
          this.connected = false;
          reject(new Error('WebSocket connection error'));
        },
      });

      this.client.activate();
    });
  }

  /**
   * Disconnect from current session
   */
  disconnect(): void {
    if (!this.client || !this.sessionId) {
      return;
    }

    // Send disconnect message
    this.send(`/app/session/${this.sessionId}/disconnect`, {});

    // Unsubscribe from all topics
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions.clear();

    // Deactivate client
    this.client.deactivate();
    this.client = null;
    this.connected = false;
    this.sessionId = null;
  }

  /**
   * Subscribe to player joined events
   */
  onPlayerJoined(callback: (message: PlayerJoinedMessage) => void): () => void {
    if (!this.sessionId) {
      throw new Error('Not connected to a session');
    }

    return this.subscribe(
      `/topic/session/${this.sessionId}/player-joined`,
      (message) => {
        callback(JSON.parse(message.body));
      }
    );
  }

  /**
   * Subscribe to player left events
   */
  onPlayerLeft(callback: (message: PlayerLeftMessage) => void): () => void {
    if (!this.sessionId) {
      throw new Error('Not connected to a session');
    }

    return this.subscribe(
      `/topic/session/${this.sessionId}/player-left`,
      (message) => {
        callback(JSON.parse(message.body));
      }
    );
  }

  /**
   * Subscribe to player connected events
   */
  onPlayerConnected(callback: (message: PlayerConnectedMessage) => void): () => void {
    if (!this.sessionId) {
      throw new Error('Not connected to a session');
    }

    return this.subscribe(
      `/topic/session/${this.sessionId}/player-connected`,
      (message) => {
        callback(JSON.parse(message.body));
      }
    );
  }

  /**
   * Subscribe to player disconnected events
   */
  onPlayerDisconnected(callback: (message: PlayerDisconnectedMessage) => void): () => void {
    if (!this.sessionId) {
      throw new Error('Not connected to a session');
    }

    return this.subscribe(
      `/topic/session/${this.sessionId}/player-disconnected`,
      (message) => {
        callback(JSON.parse(message.body));
      }
    );
  }

  /**
   * Send a token move request to the server
   */
  moveToken(request: TokenMoveRequest): void {
    if (!this.sessionId) {
      throw new Error('Not connected to a session');
    }

    this.send(`/app/session/${this.sessionId}/move-token`, request);
  }

  /**
   * Subscribe to token moved events
   */
  onTokenMoved(callback: (event: TokenMovedEvent) => void): () => void {
    if (!this.sessionId) {
      throw new Error('Not connected to a session');
    }

    return this.subscribe(
      `/topic/session/${this.sessionId}/token-moved`,
      (message) => {
        callback(JSON.parse(message.body));
      }
    );
  }

  /**
   * Generic subscribe method
   */
  private subscribe(destination: string, callback: (message: any) => void): () => void {
    if (!this.client || !this.connected) {
      throw new Error('Not connected to WebSocket');
    }

    const subscription = this.client.subscribe(destination, callback);
    this.subscriptions.set(destination, subscription);

    // Return unsubscribe function
    return () => {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
    };
  }

  /**
   * Send a message to the server
   */
  private send(destination: string, body: any): void {
    if (!this.client || !this.connected) {
      console.error('Cannot send message: not connected');
      return;
    }

    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }

  /**
   * Start sending heartbeat messages
   */
  private startHeartbeat(): void {
    if (!this.sessionId) {
      return;
    }

    // Send heartbeat every 30 seconds
    setInterval(() => {
      if (this.connected && this.sessionId) {
        this.send(`/app/session/${this.sessionId}/heartbeat`, {});
      }
    }, 30000);
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Get current session ID
   */
  getSessionId(): number | null {
    return this.sessionId;
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
