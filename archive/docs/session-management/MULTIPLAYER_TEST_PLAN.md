# Multiplayer System Test Plan

## Overview
Comprehensive test plan for Phase 1 & 2 multiplayer features (Session Management + Token Movement).

## Test Categories
1. **Unit Tests** - Individual components in isolation
2. **Integration Tests** - Component interactions
3. **E2E Tests** - Complete user workflows
4. **Edge Case Tests** - Boundary conditions and error scenarios
5. **Stress Tests** - Performance and concurrent load
6. **Security Tests** - Authorization and validation

---

## 1. Backend Unit Tests

### 1.1 GameSessionRepository Tests
**File**: `backend/src/test/java/com/deadlands/campaign/repository/GameSessionRepositoryTest.java`

**Test Cases**:
- ✅ `findByDeletedAtIsNull()` - Returns only active sessions
- ✅ `findByGameMasterIdAndDeletedAtIsNull()` - Returns GM's sessions only
- ✅ `findByActiveTrueAndDeletedAtIsNull()` - Returns active sessions
- ✅ `findByIdAndDeletedAtIsNull()` - Returns session if not deleted
- ✅ `countActiveSessionsByGameMaster()` - Counts correctly
- ❌ Soft-deleted sessions are excluded from all queries

### 1.2 SessionPlayerRepository Tests
**File**: `backend/src/test/java/com/deadlands/campaign/repository/SessionPlayerRepositoryTest.java`

**Test Cases**:
- ✅ `findBySessionIdAndLeftAtIsNull()` - Returns active players
- ✅ `findBySessionIdAndConnectedTrueAndLeftAtIsNull()` - Returns connected players
- ✅ `existsBySessionIdAndPlayerIdAndLeftAtIsNull()` - Detects duplicates
- ✅ `disconnectAllPlayersInSession()` - Bulk disconnect works
- ✅ `countBySessionIdAndLeftAtIsNull()` - Accurate count
- ❌ Players who left are excluded

### 1.3 GameSessionController REST Tests
**File**: `backend/src/test/java/com/deadlands/campaign/controller/GameSessionControllerTest.java`

**Happy Path**:
- ✅ GM creates session → 201 Created
- ✅ Player joins session with valid character → 200 OK
- ✅ Player leaves session → 204 No Content
- ✅ Get all sessions returns list → 200 OK
- ✅ Get session by ID returns session → 200 OK

**Edge Cases**:
- ❌ Create session with empty name → 400 Bad Request
- ❌ Join session with invalid character ID → 404 Not Found
- ❌ Join session with another player's character → 403 Forbidden
- ❌ Join already full session → 409 Conflict
- ❌ Join session already joined → 409 Conflict
- ❌ Non-GM tries to create session → 403 Forbidden
- ❌ Get non-existent session → 404 Not Found
- ❌ Leave session not joined → 404 Not Found

**Authorization Tests**:
- ❌ Unauthenticated user tries to access → 401 Unauthorized
- ❌ Player tries to access GM-only endpoints → 403 Forbidden

### 1.4 Token Movement Validation Tests
**File**: `backend/src/test/java/com/deadlands/campaign/controller/TokenMovementTest.java`

**Happy Path**:
- ✅ Player moves own character → Broadcast sent
- ✅ GM moves any character → Broadcast sent
- ✅ GM moves enemy → Broadcast sent

**Edge Cases**:
- ❌ Move to negative coordinates → Rejected silently
- ❌ Move beyond grid (>= 200) → Rejected silently
- ❌ Player tries to move another player's character → Rejected silently
- ❌ Player tries to move enemy → Rejected silently
- ❌ Move with null coordinates → Rejected silently
- ❌ Move non-existent character → Rejected silently

**Stress Tests**:
- ❌ 100 simultaneous moves → All processed
- ❌ Rapid moves from same player → Rate limiting (if implemented)

---

## 2. Backend Integration Tests (WebSocket)

### 2.1 WebSocket Connection Tests
**File**: `backend/src/test/java/com/deadlands/campaign/websocket/WebSocketConnectionTest.java`

**Happy Path**:
- ✅ Client connects with valid JWT → Connected
- ✅ Client subscribes to session topic → Subscribed
- ✅ Client sends connect message → Broadcast received by others
- ✅ Client sends disconnect message → Broadcast received

**Edge Cases**:
- ❌ Connect without JWT → Connection refused
- ❌ Connect with invalid JWT → Connection refused
- ❌ Connect with expired JWT → Connection refused
- ❌ Subscribe to session not joined → No messages received
- ❌ Connection drops → Reconnect works

### 2.2 Token Movement WebSocket Tests
**File**: `backend/src/test/java/com/deadlands/campaign/websocket/TokenMovementWebSocketTest.java`

**Happy Path**:
- ✅ Player sends move → All players in session receive broadcast
- ✅ GM sends move → All players receive broadcast
- ✅ Move includes correct timestamp
- ✅ Move includes movedBy username

**Edge Cases**:
- ❌ Player A moves → Player B in different session doesn't receive
- ❌ Invalid move → No broadcast sent
- ❌ Player disconnects mid-move → Other players still receive updates
- ❌ Concurrent moves → All processed, order maintained

**Race Conditions**:
- ❌ Two players move same token simultaneously → Server resolves (last write wins)
- ❌ Player moves, then disconnects immediately → Move still broadcasts

---

## 3. Frontend Unit Tests

### 3.1 websocketService Tests
**File**: `frontend/src/services/__tests__/websocketService.test.ts`

**Happy Path**:
- ✅ `connect()` establishes WebSocket connection
- ✅ `disconnect()` closes connection cleanly
- ✅ `moveToken()` sends message to server
- ✅ `onTokenMoved()` receives and parses messages
- ✅ `onPlayerJoined()` receives player join events
- ✅ Heartbeat sent every 30 seconds

**Edge Cases**:
- ❌ `connect()` without token → Throws error
- ❌ `connect()` with invalid session ID → Throws error
- ❌ `moveToken()` before connect → Logs error, doesn't crash
- ❌ Connection fails → Reconnects automatically
- ❌ Malformed message received → Parsed safely, doesn't crash
- ❌ Multiple connects → Second connect doesn't duplicate
- ❌ Disconnect before connect completes → Handles gracefully

**Cleanup Tests**:
- ❌ Unsubscribe works correctly
- ❌ Disconnect removes all subscriptions
- ❌ Component unmount triggers cleanup

### 3.2 sessionService Tests
**File**: `frontend/src/services/__tests__/sessionService.test.ts`

**Happy Path**:
- ✅ `getAllSessions()` fetches sessions
- ✅ `createSession()` creates with valid data
- ✅ `joinSession()` joins with character
- ✅ `leaveSession()` leaves session

**Edge Cases**:
- ❌ API call fails → Error thrown
- ❌ Network timeout → Error thrown
- ❌ 401 response → Triggers logout (via interceptor)
- ❌ 403 response → Error thrown
- ❌ Malformed response → Parsed safely

### 3.3 SessionLobby Component Tests
**File**: `frontend/src/pages/__tests__/SessionLobby.test.tsx`

**Rendering Tests**:
- ✅ Renders loading state initially
- ✅ Renders session list when loaded
- ✅ Renders "no sessions" message when empty
- ✅ Shows "Create Session" button for GM
- ✅ Hides "Create Session" button for players

**Interaction Tests**:
- ✅ Clicking "Create Session" opens dialog
- ✅ Submitting create form calls API
- ✅ Clicking "Join Session" opens character selection
- ✅ Joining redirects to session room
- ✅ Form validation prevents invalid submissions

**Edge Cases**:
- ❌ API error shows error message
- ❌ Create fails → Shows error, doesn't redirect
- ❌ Join fails → Shows error, doesn't redirect
- ❌ No characters available → Shows message

### 3.4 GameArena WebSocket Integration Tests
**File**: `frontend/src/game/__tests__/GameArena.websocket.test.tsx`

**Connection Tests**:
- ✅ Multiplayer mode connects to WebSocket
- ✅ Single-player mode doesn't connect
- ✅ Connection status reflected in state
- ✅ Disconnection on unmount

**Event Propagation Tests**:
- ✅ Remote token moved event → Emitted to Phaser
- ✅ Local token moved event → Sent to WebSocket
- ✅ Events include correct data
- ✅ Multiple events handled in sequence

**Edge Cases**:
- ❌ WebSocket fails → Shows error, game still playable (degraded)
- ❌ Events received before Phaser ready → Queued or dropped safely
- ❌ Invalid event data → Parsed safely, doesn't crash

---

## 4. End-to-End Tests

### 4.1 Complete Session Workflow
**Manual Test Procedure**:

1. **GM Creates Session**
   - Login as GM
   - Navigate to Sessions
   - Click "Create Session"
   - Fill form: name, description, max players
   - Submit
   - ✅ Session appears in list
   - ✅ Shows as inactive

2. **Player 1 Joins**
   - Login as Player 1 (different browser/incognito)
   - Navigate to Sessions
   - Click "Join Session"
   - Select character
   - Submit
   - ✅ Redirected to game arena
   - ✅ Character loaded
   - ✅ WebSocket connected (check console)

3. **Player 2 Joins**
   - Login as Player 2 (third browser/incognito)
   - Repeat join process
   - ✅ Redirected to game arena
   - ✅ WebSocket connected

4. **Verify Real-Time Events**
   - Player 1 console: Should see "Player 2 connected" event
   - Player 2 console: Should see "Player 1 connected" event
   - ✅ Both players see each other's connection

### 4.2 Token Movement Synchronization
**Manual Test Procedure**:

1. **Setup**: 2 players in same session
2. **Player 1 moves character**
   - Click to move on battlefield
   - ✅ Token moves on Player 1's screen
   - ✅ Console shows "localTokenMoved" event
   - ✅ Console shows WebSocket send
3. **Player 2 observes**
   - ✅ Console shows "remoteTokenMoved" event
   - ✅ Token position updates (after ArenaScene integration)
4. **Player 2 moves**
   - Same verification in reverse
5. **Concurrent moves**
   - Both players move at same time
   - ✅ Both moves appear on both screens
   - ✅ No conflicts or crashes

### 4.3 Session Persistence
**Test Procedure**:

1. Create session with players
2. Player leaves session
   - ✅ Other players see "player left" event
3. Player rejoins same session
   - ✅ Can rejoin successfully
   - ✅ Reconnects to WebSocket
4. GM closes browser
   - ✅ Session still exists
5. GM reopens browser
   - ✅ Session still in list
   - ✅ Can manage session

---

## 5. Edge Case Tests

### 5.1 Network Interruption
**Test Procedure**:

1. Join session, verify WebSocket connected
2. Disconnect network (disable WiFi/unplug)
   - ✅ WebSocket shows disconnected
   - ✅ Reconnect attempted (check console for retry logs)
3. Reconnect network
   - ✅ WebSocket reconnects automatically
   - ✅ Resumes receiving events

### 5.2 Concurrent Session Join
**Test Procedure**:

1. Create session with maxPlayers = 2
2. Have 3 players attempt to join simultaneously
   - ✅ First 2 succeed
   - ✅ Third player gets 409 Conflict
   - ✅ Session shows 2/2 players

### 5.3 Invalid Character Ownership
**Test Procedure**:

1. Player A creates character
2. Player B attempts to join session with Player A's character ID (via API)
   - ✅ 403 Forbidden response
   - ✅ Join rejected

### 5.4 Session Deletion Mid-Game
**Test Procedure**:

1. Players in active session
2. GM soft-deletes session (if endpoint exists)
   - ✅ Session no longer appears in list
   - ✅ Active players can finish game (WebSocket still works)
   - ✅ New players can't join

### 5.5 Token Movement Edge Cases

**Test Grid Boundaries**:
- Move to (0, 0) → ✅ Valid
- Move to (199, 199) → ✅ Valid
- Move to (-1, 0) → ❌ Rejected
- Move to (200, 0) → ❌ Rejected
- Move to (100, -50) → ❌ Rejected
- Move to (300, 300) → ❌ Rejected

**Test Malformed Data**:
- Send null tokenId → ❌ Rejected
- Send null coordinates → ❌ Rejected
- Send non-numeric coordinates → ❌ Rejected
- Send invalid tokenType → ❌ Rejected

### 5.6 WebSocket Message Flooding
**Test Procedure**:

1. Player sends 100 move requests in 1 second
   - ✅ Server processes all
   - ✅ Other players receive all (or rate-limited)
   - ✅ No server crash
   - ✅ No memory leak

---

## 6. Stress Tests

### 6.1 Many Players (Load Test)
**Automated Script**: `test/stress/many-players.js`

**Scenario**: 50 players join same session
- ✅ All connections established
- ✅ All players receive broadcasts
- ✅ Server memory < 500MB
- ✅ Response time < 100ms
- ✅ No connection drops

### 6.2 Rapid Token Movements
**Automated Script**: `test/stress/rapid-movements.js`

**Scenario**: 10 players each send 100 moves/second
- ✅ All moves processed
- ✅ Broadcasts delivered within 50ms
- ✅ No messages lost
- ✅ No server CPU spike > 80%

### 6.3 Long Session Duration
**Manual Test**:

**Scenario**: Session runs for 4 hours
- ✅ WebSocket stays connected
- ✅ Heartbeats prevent timeout
- ✅ No memory leaks (check browser/server memory)
- ✅ No performance degradation

### 6.4 Concurrent Session Creation
**Automated Script**: `test/stress/concurrent-sessions.js`

**Scenario**: 100 GMs create sessions simultaneously
- ✅ All sessions created (100 total)
- ✅ No duplicate IDs
- ✅ All sessions queryable
- ✅ Database constraints enforced

---

## 7. Security Tests

### 7.1 Authentication Tests
- ❌ Access session endpoints without JWT → 401
- ❌ Access with expired JWT → 401
- ❌ Access with tampered JWT → 401
- ❌ WebSocket connect without auth → Rejected

### 7.2 Authorization Tests
- ❌ Player tries to delete session → 403
- ❌ Player tries to move other player's character → Silently rejected
- ❌ Player tries to move enemy → Silently rejected
- ✅ GM can move any character → Allowed
- ✅ GM can move enemies → Allowed

### 7.3 Input Validation
- ❌ XSS in session name → Sanitized
- ❌ SQL injection in description → Parameterized, safe
- ❌ Extremely long session name (10,000 chars) → Rejected
- ❌ Negative session ID → 404
- ❌ Non-numeric session ID → 400

### 7.4 CSRF Protection
- ❌ WebSocket connection from different origin → Check CORS
- ❌ Session creation from different origin → Check CORS

---

## 8. Performance Benchmarks

### 8.1 Response Time Targets
- Session creation: < 200ms
- Session join: < 150ms
- Token movement broadcast: < 50ms
- WebSocket message delivery: < 30ms

### 8.2 Throughput Targets
- Concurrent users per session: 20
- Total concurrent sessions: 100
- Messages per second: 10,000

### 8.3 Resource Usage Targets
- Backend memory: < 512MB per 100 sessions
- Frontend memory: < 100MB per client
- Database connections: < 50 total

---

## 9. Test Automation Strategy

### Backend Tests
- **Framework**: JUnit 5, Spring Boot Test, WebSocket Test Client
- **Run Command**: `mvn test`
- **Coverage Target**: 80% code coverage

### Frontend Tests
- **Framework**: Vitest, Testing Library, Mock Service Worker
- **Run Command**: `npm test`
- **Coverage Target**: 75% code coverage

### E2E Tests
- **Framework**: Manual testing initially, Playwright/Cypress later
- **Frequency**: Before each release

### Stress Tests
- **Framework**: Custom Node.js scripts, Artillery.io
- **Frequency**: Weekly, before major releases

---

## 10. Test Execution Checklist

### Pre-Deployment Testing (Every Commit)
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Code coverage meets targets
- [ ] No console errors in dev mode

### Pre-Release Testing (Before Deployment)
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] E2E tests pass
- [ ] Stress tests pass
- [ ] Security tests pass
- [ ] Performance benchmarks met

### Post-Deployment Testing (After Release)
- [ ] Smoke test on production
- [ ] Create session works
- [ ] Join session works
- [ ] Token movement works
- [ ] No errors in production logs

---

## 11. Known Limitations (To Be Tested)

1. **No movement distance validation** - Server accepts any move within grid
2. **No collision detection** - Multiple tokens can occupy same tile
3. **No movement budget enforcement** - Server doesn't check pace limits
4. **No turn order enforcement** - Any player can move anytime
5. **No fog of war** - All players see entire map
6. **No obstruction checking** - Tokens can move through walls (needs ArenaScene integration)

These will be addressed in future phases but should be tested to ensure they fail gracefully.

---

## 12. Test Results Tracking

### Test Execution Log
**Date**: [YYYY-MM-DD]
**Tester**: [Name]
**Environment**: [Dev/Staging/Production]

| Test ID | Test Name | Status | Notes |
|---------|-----------|--------|-------|
| BK-1.1  | Session Repository Tests | ⏳ Pending | |
| BK-1.2  | SessionPlayer Repository Tests | ⏳ Pending | |
| BK-1.3  | REST Controller Tests | ⏳ Pending | |
| BK-2.1  | WebSocket Connection Tests | ⏳ Pending | |
| FE-3.1  | WebSocket Service Tests | ⏳ Pending | |
| E2E-4.1 | Complete Workflow | ⏳ Pending | |
| STR-6.1 | Load Test (50 players) | ⏳ Pending | |

Legend:
- ✅ Pass
- ❌ Fail
- ⏳ Pending
- ⚠️ Blocked

---

## Summary

**Total Test Cases**: 150+
**Automated**: 80+ (Unit + Integration)
**Manual**: 70+ (E2E + Exploratory)
**Estimated Test Time**:
- Automated: 5 minutes
- Manual: 3 hours
- Stress: 1 hour
