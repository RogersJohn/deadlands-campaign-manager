# Testing Guide

## Quick Start

### Backend Tests
```bash
cd backend
./mvnw test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Stress Tests
```bash
cd test
npm install
npm run stress:concurrent-users
```

---

## Test Categories

### 1. Backend Unit Tests (Java/JUnit)
**Location**: `backend/src/test/java/`

**What's tested**:
- REST API endpoints (GameSessionController)
- Repository queries
- Business logic validation
- Authorization rules

**Run**: `cd backend && ./mvnw test`

**Expected Coverage**: 80%+

**Key Test Files**:
- `GameSessionControllerTest.java` - Session CRUD, join/leave, authorization

---

### 2. Frontend Unit Tests (Vitest)
**Location**: `frontend/src/**/__tests__/`

**What's tested**:
- Service layer (API calls)
- WebSocket service
- Component rendering
- Event handling

**Run**: `cd frontend && npm test`

**Watch Mode**: `npm test -- --watch`

**Coverage**: `npm run test:coverage`

**Expected Coverage**: 75%+

**Key Test Files**:
- `sessionService.test.ts` - Session API calls, error handling

---

### 3. Stress Tests (Node.js Scripts)
**Location**: `test/stress/`

**What's tested**:
- Concurrent user load (50+ players)
- Message throughput (1000+ msgs/sec)
- Latency under load
- Memory/CPU usage
- Connection stability

**Setup**:
```bash
cd test
npm install
```

**Run**:
```bash
# Concurrent users test (50 players, 100 moves each)
npm run stress:concurrent-users

# All stress tests
npm run stress:all
```

**Pass Criteria**:
- 95% connection success rate
- 90% message reception rate
- Average latency < 100ms

---

## Manual E2E Testing

### Prerequisites
- Backend running: `cd backend && ./mvnw spring-boot:run`
- Frontend running: `cd frontend && npm run dev`
- 2-3 browser windows/incognito tabs

### Test Workflow 1: Session Creation & Join

**Objective**: Verify complete session lifecycle

1. **Create Session (GM)**
   - Login as GM account
   - Navigate to `/sessions`
   - Click "Create Session"
   - Fill: Name, Description, Max Players
   - Submit
   - ✅ Session appears in list
   - ✅ Status shows "inactive"

2. **Join Session (Player 1)**
   - Login as Player in 2nd browser
   - Navigate to `/sessions`
   - Click "Join Session"
   - Select a character
   - Submit
   - ✅ Redirects to `/session/:id`
   - ✅ Console shows "WebSocket connected"
   - ✅ No errors

3. **Join Session (Player 2)**
   - Login as Player in 3rd browser
   - Repeat Player 1 steps
   - ✅ Both players see "Player connected" event in console

4. **Verify Real-Time Events**
   - Check both player consoles
   - ✅ Player 1 sees "Player 2 connected"
   - ✅ Player 2 sees "Player 1 connected"

### Test Workflow 2: Token Movement Sync

**Objective**: Verify real-time token movement

**NOTE**: Requires ArenaScene integration (Phase 2 Part 3)

1. **Setup**: 2 players in same session
2. **Player 1 moves character**
   - Click battlefield to move
   - ✅ Token moves on Player 1's screen
   - ✅ Console: "localTokenMoved" event
   - ✅ Console: WebSocket send message
3. **Player 2 observes**
   - ✅ Console: "remoteTokenMoved" event received
   - ✅ Token position updates on screen
4. **Player 2 moves**
   - Repeat steps 2-3 in reverse
   - ✅ Player 1 sees movement

### Test Workflow 3: Edge Cases

**Objective**: Test error handling and edge cases

1. **Session Full**
   - Create session with maxPlayers=1
   - Player 1 joins
   - Player 2 tries to join
   - ✅ Shows "409 Conflict" error
   - ✅ Player 2 not added

2. **Invalid Character**
   - Player A tries to join with Player B's character
   - ✅ Shows "403 Forbidden" error

3. **Network Interruption**
   - Player joins session
   - Disable WiFi
   - Wait 5 seconds
   - Re-enable WiFi
   - ✅ WebSocket reconnects automatically
   - ✅ Resume receiving events

4. **Concurrent Join**
   - Create session with maxPlayers=2
   - 3 players click "Join" simultaneously
   - ✅ First 2 succeed
   - ✅ 3rd gets error

---

## Testing Checklist

### Pre-Commit
- [ ] Backend tests pass (`mvn test`)
- [ ] Frontend tests pass (`npm test`)
- [ ] No TypeScript errors (`npm run build`)
- [ ] No ESLint warnings

### Pre-PR
- [ ] All unit tests pass
- [ ] Code coverage meets targets (80% backend, 75% frontend)
- [ ] Manual E2E test (Session create → join → basic interaction)
- [ ] No console errors in dev mode

### Pre-Release
- [ ] All automated tests pass
- [ ] Manual E2E tests pass (all workflows)
- [ ] Stress test passes (concurrent users)
- [ ] Security test (check authorization, input validation)
- [ ] Performance benchmarks met

### Post-Deployment
- [ ] Smoke test on production (create session, join, observe)
- [ ] Monitor error logs for 24 hours
- [ ] Verify WebSocket connections stable

---

## Debugging Failed Tests

### Backend Test Failures

**Symptom**: Tests fail with "User not found"
**Cause**: Test database not seeded
**Fix**: Add `@Transactional` to test class

**Symptom**: WebSocket tests timeout
**Cause**: WebSocket server not started
**Fix**: Ensure `@SpringBootTest(webEnvironment = RANDOM_PORT)`

**Symptom**: 401 Unauthorized in tests
**Cause**: JWT not mocked
**Fix**: Use `@WithMockUser` annotation

### Frontend Test Failures

**Symptom**: "api is not defined"
**Cause**: Module not mocked
**Fix**: Add `vi.mock('../api')` before test

**Symptom**: "Cannot read property of undefined"
**Cause**: Async data not resolved
**Fix**: Use `await waitFor()` or `findBy*` queries

**Symptom**: WebSocket tests fail
**Cause**: WebSocket server not mocked
**Fix**: Use Mock Service Worker or manual mock

### Stress Test Failures

**Symptom**: Connection timeouts
**Cause**: Server not running or CORS issue
**Fix**: Verify backend is running, check CORS config

**Symptom**: Low message reception rate
**Cause**: Server overloaded or slow
**Fix**: Reduce concurrent users or increase timeout

**Symptom**: High latency
**Cause**: Network or server bottleneck
**Fix**: Check server CPU/memory, network bandwidth

---

## Test Data Management

### Backend Test Data
**Created in**: `@BeforeEach` methods
**Cleaned up**: Automatically via `@Transactional` rollback

### Stress Test Data
**Created in**: `setup()` function
**Cleaned up**: Manual cleanup recommended
```sql
DELETE FROM session_players WHERE session_id IN (SELECT id FROM game_sessions WHERE name LIKE 'Stress Test%');
DELETE FROM game_sessions WHERE name LIKE 'Stress Test%';
DELETE FROM characters WHERE name LIKE 'Stress Test%';
DELETE FROM users WHERE username LIKE 'stresstest_%';
```

---

## Continuous Integration

### GitHub Actions (TODO)
```yaml
name: Tests
on: [push, pull_request]
jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up JDK 17
        uses: actions/setup-java@v2
        with:
          java-version: '17'
      - name: Run tests
        run: cd backend && ./mvnw test

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install and test
        run: cd frontend && npm install && npm test
```

---

## Performance Benchmarks

### Acceptable Performance Targets

| Metric | Target | Measured |
|--------|--------|----------|
| Session creation | < 200ms | ⏳ TBD |
| Session join | < 150ms | ⏳ TBD |
| Token movement broadcast | < 50ms | ⏳ TBD |
| WebSocket message delivery | < 30ms | ⏳ TBD |
| Concurrent users (same session) | 20 | ⏳ TBD |
| Messages per second | 10,000 | ⏳ TBD |
| Backend memory (100 sessions) | < 512MB | ⏳ TBD |
| Frontend memory per client | < 100MB | ⏳ TBD |

---

## Known Issues

1. **Backend controller tests use RuntimeException** instead of custom exceptions
   - Impact: Less specific error responses in tests
   - Fix: Create custom exception classes (ResourceNotFoundException, etc.)

2. **No WebSocket integration tests yet**
   - Impact: WebSocket endpoints not fully tested
   - Fix: Create WebSocketTestClient-based tests (Phase 2 Part 3)

3. **Frontend WebSocket service not fully tested**
   - Impact: Connection/reconnection logic not verified
   - Fix: Add websocketService tests with mock WebSocket

4. **Stress tests require manual cleanup**
   - Impact: Test data accumulates
   - Fix: Add cleanup script or use separate test database

---

## Test Metrics (Current)

**Last Updated**: [Date TBD]

| Category | Files | Tests | Coverage | Status |
|----------|-------|-------|----------|--------|
| Backend Unit | 1 | 15 | ⏳ TBD | ✅ Pass |
| Backend Integration | 0 | 0 | N/A | ⏳ Pending |
| Frontend Unit | 1 | 25 | ⏳ TBD | ⏳ Pending |
| Frontend Component | 0 | 0 | N/A | ⏳ Pending |
| E2E Manual | - | - | N/A | ⏳ Pending |
| Stress Tests | 1 | 1 | N/A | ⏳ Pending |

**Total Automated Tests**: 40+
**Total Manual Tests**: 15+
**Total Test Coverage**: ⏳ TBD
