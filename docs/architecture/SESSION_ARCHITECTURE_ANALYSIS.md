# Session Architecture Analysis & Redesign

**Date**: 2025-11-17
**Status**: 🔴 CRITICAL - Architecture Mismatch Blocking E2E Tests

---

## Executive Summary

The Deadlands Campaign Manager has a **critical architectural mismatch** between the intended design (single shared world) and the test expectations (multiple concurrent sessions). This document analyzes the current state and proposes a path forward.

### Key Findings

1. **WebSocket Infrastructure**: Partially built but **incomplete**
   - ✅ WebSocketConfig exists
   - ✅ DTOs defined (TokenMoveRequest, TokenMovedEvent)
   - ❌ **ZERO WebSocket message handlers** (@MessageMapping)
   - ❌ No GameController or WebSocketController

2. **Session Management**: **Not Implemented**
   - ❌ No GameSession entity
   - ❌ No SessionController
   - ❌ No session REST endpoints
   - ❌ Frontend has no `/sessions` route

3. **E2E Tests**: Assume session-based multiplayer
   - Tests expect `/session/${sessionId}` routes
   - Tests expect create/join session endpoints
   - **77 steps**: 28 passed, 7 failed, 37 skipped due to missing features

4. **Current Frontend**: Single-player mode
   - Comment in GameArena.tsx line 186: "WebSocket logic removed - single player game for now"
   - Multiplayer code exists but is dormant (remotePlayerSprites, localTokenMoved events)

---

## Current State Deep Dive

### Backend Analysis

#### What Exists:
```java
// backend/src/main/java/com/deadlands/campaign/config/WebSocketConfig.java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    // ✅ Configures STOMP endpoint at /ws
    // ✅ Sets up /topic and /queue destinations
    // ✅ Sets /app prefix for client messages
}

// DTOs ready for WebSocket messaging
TokenMoveRequest.java  // Client → Server
TokenMovedEvent.java   // Server → Clients
```

#### What's Missing:
```java
// ❌ NO WebSocket message handlers anywhere
@Controller
public class GameController {
    @MessageMapping("/game/move")          // MISSING
    @SendTo("/topic/game/moves")           // MISSING
    public TokenMovedEvent handleMove(...) // MISSING
}

// ❌ NO Session management
@Entity
public class GameSession { ... }           // MISSING

@RestController
public class SessionController {           // MISSING
    POST /api/sessions                     // MISSING
    GET /api/sessions/{id}                 // MISSING
}
```

### Frontend Analysis

#### What Exists (Dormant):
```typescript
// frontend/src/game/engine/ArenaScene.ts
private remotePlayerSprites: Map<string, Phaser.GameObjects.Rectangle> = new Map();

// Emits movement for WebSocket (but nothing listens)
this.game.events.emit('localTokenMoved', {
  tokenId: String(this.character.id),
  tokenType: 'PLAYER',
  fromX: oldGridX,
  fromY: oldGridY,
  toX: gridX,
  toY: gridY,
});

// Handler for remote token movements (lines 1353-1410)
// ✅ Creates/updates remote player sprites
// ✅ Shows player names
// ✅ Animates movement
```

#### What's Missing:
```typescript
// ❌ NO WebSocket client connection
// ❌ NO STOMP message subscription
// ❌ NO /sessions route or component
```

### E2E Test Expectations

```gherkin
# test/e2e/features/multiplayer-token-sync.feature
Scenario: Two players see each other's token movements in real-time
  When "e2e_testgm" creates a session named "E2E Test Session" with max players 5
  And "e2e_player1" joins the session with their character
  # ❌ These endpoints don't exist
```

```javascript
// test/e2e/features/support/pages/GameArenaPage.js
async navigate(baseUrl, sessionId) {
  await this.visit(`${baseUrl}/session/${sessionId}`);
  // ❌ This route doesn't exist
}
```

---

## Design Decision: Single Shared World

### Requirements (Confirmed by User)

**Architecture**: Single shared world where:
- All players access the same game space
- No session creation/joining - just "Login → Play Game"
- GM has control, players have character-specific abilities
- Real-time token synchronization across all connected players

### Implications

1. **No Session Entity Needed**
   - Remove concept of "sessions" entirely
   - One global game state

2. **Simplified WebSocket Topics**
   - No per-session topics like `/topic/session/{id}/moves`
   - Global topics: `/topic/game/moves`, `/topic/game/state`

3. **Simplified Frontend Flow**
   ```
   Login → Character Selection → Game Arena
   (No session lobby or session management)
   ```

4. **E2E Tests Must Change**
   - Remove session creation/joining scenarios
   - Test direct arena access
   - Focus on multiplayer synchronization in shared world

---

## Proposed Architecture: Single Shared World

### Backend Components

#### 1. GameController (NEW)
```java
@Controller
public class GameController {

    @MessageMapping("/game/move")
    @SendTo("/topic/game/moves")
    public TokenMovedEvent handleTokenMove(TokenMoveRequest request, Principal principal) {
        // Validate movement
        // Broadcast to all connected clients
        return new TokenMovedEvent(
            request.getTokenId(),
            request.getTokenType(),
            principal.getName(),
            request.getToX(),
            request.getToY(),
            System.currentTimeMillis()
        );
    }

    @MessageMapping("/game/join")
    @SendTo("/topic/game/players")
    public PlayerJoinedEvent handlePlayerJoin(Principal principal) {
        // Notify all players that someone joined
    }
}
```

#### 2. WebSocket Topics
- `/topic/game/moves` - Token movements (broadcast to all)
- `/topic/game/players` - Player join/leave events
- `/topic/game/state` - Game state updates (turn phase, etc.)

#### 3. No Session Model Required
- Single shared world = no need to track sessions
- Optional: Track connected players in memory (ConcurrentHashMap)

### Frontend Components

#### 1. WebSocket Service (NEW)
```typescript
// frontend/src/services/websocketService.ts
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export class WebSocketService {
  private client: Client;

  connect(token: string): Promise<void> {
    this.client = new Client({
      webSocketFactory: () => new SockJS(`${API_URL}/ws`),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      onConnect: () => {
        this.subscribeToGameEvents();
      }
    });

    this.client.activate();
  }

  subscribeToGameEvents() {
    // Subscribe to global game moves
    this.client.subscribe('/topic/game/moves', (message) => {
      const event = JSON.parse(message.body);
      window.dispatchEvent(new CustomEvent('remoteTokenMoved', { detail: event }));
    });
  }

  sendMove(tokenId: string, fromX: number, fromY: number, toX: number, toY: number) {
    this.client.publish({
      destination: '/app/game/move',
      body: JSON.stringify({ tokenId, tokenType: 'PLAYER', fromX, fromY, toX, toY })
    });
  }
}
```

#### 2. Update GameArena.tsx
```typescript
// Connect to WebSocket on component mount
useEffect(() => {
  if (token && selectedCharacter) {
    const wsService = new WebSocketService();
    wsService.connect(token);

    // Listen for remote token movements
    const handleRemoteMove = (event: CustomEvent) => {
      gameEvents?.emit('remoteTokenMoved', event.detail);
    };

    window.addEventListener('remoteTokenMoved', handleRemoteMove);

    return () => {
      window.removeEventListener('remoteTokenMoved', handleRemoteMove);
      wsService.disconnect();
    };
  }
}, [token, selectedCharacter]);
```

#### 3. Update ArenaScene.ts
```typescript
// Listen for local moves and send to server
this.game.events.on('localTokenMoved', (data) => {
  wsService.sendMove(data.tokenId, data.fromX, data.fromY, data.toX, data.toY);
});
```

### E2E Test Updates

#### Before (Session-based):
```gherkin
Scenario: Two players see each other's movements
  When "e2e_testgm" creates a session named "Test" with max players 5
  And "e2e_player1" joins the session with their character
```

#### After (Shared world):
```gherkin
Scenario: Two players see each other's movements in shared world
  Given "e2e_testgm" is logged in and enters the game arena
  And "e2e_player1" is logged in and enters the game arena
  When "e2e_player1" moves their token to position (110, 95)
  Then "e2e_testgm" should see "e2e_player1"'s token at position (110, 95)
```

---

## Implementation Plan

### Phase 1: WebSocket Foundation (Priority A)
- [x] Analyze current architecture
- [ ] Create GameController with @MessageMapping handlers
- [ ] Create WebSocketService in frontend
- [ ] Integrate WebSocket into GameArena component
- [ ] Test basic connectivity (manual testing)

### Phase 2: Token Synchronization
- [ ] Implement token movement broadcasting
- [ ] Connect ArenaScene to WebSocket events
- [ ] Test multiplayer movement (2 browsers)
- [ ] Handle edge cases (disconnects, reconnects)

### Phase 3: E2E Test Refactoring
- [ ] Remove session creation/joining scenarios
- [ ] Update step definitions for shared world
- [ ] Update page objects (remove /session/:id routes)
- [ ] Add new scenarios for shared world behavior

### Phase 4: Backend Unit Tests (Priority B)
- [ ] GameController tests (WebSocket message handling)
- [ ] AuthController tests
- [ ] CharacterController tests
- [ ] Security tests (JWT, authorization)

### Phase 5: CI/CD Pipeline (Priority C)
- [ ] GitHub Actions workflow
- [ ] Run all tests on push
- [ ] Coverage reporting
- [ ] Quality gates

---

## Testing Strategy

### Backend Unit Tests
```java
@SpringBootTest
class GameControllerTest {

    @Test
    void handleTokenMove_broadcastsToAllClients() {
        // Test WebSocket message handling
    }

    @Test
    void handleTokenMove_validatesBounds() {
        // Test movement validation
    }
}
```

### Frontend Unit Tests
```typescript
describe('WebSocketService', () => {
  it('connects to WebSocket endpoint', async () => {
    // Test connection
  });

  it('subscribes to game events', () => {
    // Test subscriptions
  });

  it('sends token movements', () => {
    // Test publishing
  });
});
```

### E2E Tests
```gherkin
@multiplayer @shared-world
Scenario: Real-time token synchronization in shared world
  Given 2 players are in the game arena
  When player 1 moves their token
  Then player 2 sees the movement in real-time
```

---

## Coverage Targets

- **Backend**: 60% minimum (GameController, services, security)
- **Frontend**: 70% minimum (WebSocket, services, components)
- **E2E**: All critical paths (multiplayer sync, auth, character CRUD)

---

## Next Steps

1. **Implement GameController** (WebSocket message handlers)
2. **Create WebSocketService** (frontend client)
3. **Update GameArena** (integrate WebSocket)
4. **Manual test** (2 browsers, verify sync)
5. **Refactor E2E tests** (remove session concepts)
6. **Add unit tests** (backend + frontend)
7. **Set up CI/CD** (GitHub Actions)

---

## Questions & Decisions

### Resolved:
- ✅ Architecture: Single shared world (not multiple sessions)
- ✅ Coverage targets: 60% backend, 70% frontend
- ✅ Priority order: WebSocket → Tests → CI/CD

### Open:
- ⏳ Player join notifications: Do we need to show "Player X joined the game"?
- ⏳ GM controls: What actions should be GM-only in shared world?
- ⏳ Persistence: Should we save game state (token positions) to database?

---

**Status**: Ready to implement
**Blocker**: None (design approved)
**Next Task**: Create GameController with WebSocket handlers
