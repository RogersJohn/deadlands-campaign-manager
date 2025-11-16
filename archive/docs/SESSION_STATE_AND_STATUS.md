# Session State & Current Status

**Date:** 2025-11-15 01:15 UTC
**Status:** 🔄 Critical WebSocket CORS fix deploying

---

## Where Session State is Stored

### Database: PostgreSQL (Railway)

Sessions are stored persistently in the **`game_sessions`** table.

**Schema:**
```sql
CREATE TABLE game_sessions (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  game_master_id BIGINT NOT NULL REFERENCES users(id),
  active BOOLEAN NOT NULL DEFAULT FALSE,
  max_players INTEGER,
  game_state TEXT, -- JSON blob for map, tokens, fog of war
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP, -- Soft delete
  deleted_by BIGINT REFERENCES users(id)
);
```

**Accessed Via:**
- `GameSessionRepository` (JPA)
- `GameSessionController` (REST API)
- `SessionPlayerRepository` (player associations)

**Persistence:**
- ✅ Survives backend restarts
- ✅ Shared across all backend instances
- ✅ Includes soft delete (deleted_at column)

### In-Memory: WebSocket Connections

Real-time multiplayer uses **in-memory WebSocket connections**:
- STOMP protocol over WebSocket
- Managed by Spring WebSocket
- Broker: SimpleBroker (in-memory)

**Topics:**
- `/topic/session/{id}/player-joined`
- `/topic/session/{id}/player-left`
- `/topic/session/{id}/game-started`
- `/topic/session/{id}/token-moved`

**Ephemeral State:**
- ❌ Does NOT survive backend restarts
- ❌ Connection status lost on disconnect
- ✅ Reconnects automatically (5s delay)

### Session Lifecycle

```
1. GM Creates Session
   ↓
   POST /api/sessions
   ↓
   Saved to game_sessions table
   ↓
   Returns session with ID

2. Players Join Session
   ↓
   POST /api/sessions/{id}/join
   ↓
   Creates SessionPlayer record
   ↓
   Returns to session lobby

3. Session Room (Pre-Game)
   ↓
   GET /api/sessions/{id}
   ↓
   WebSocket connects to /ws
   ↓
   Real-time player list updates

4. GM Starts Game
   ↓
   POST /api/sessions/{id}/start
   ↓
   Sets session.active = true
   ↓
   Broadcasts /topic/session/{id}/game-started
   ↓
   All players navigate to game arena

5. Active Game
   ↓
   Game state stored in session.gameState (JSON)
   ↓
   Token moves via WebSocket
   ↓
   State updates persisted to DB
```

---

## Current Error Status

### Issue 1: WebSocket CORS Error ⚠️ FIXING NOW

**Error:**
```
Access to XMLHttpRequest at 'https://deadlands-campaign-manager-production-053e.up.railway.app/ws/info'
from origin 'https://deadlands-frontend-production.up.railway.app' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.

GET /ws/info 404 (Not Found)
```

**Root Cause:**
- WebSocketConfig used `.setAllowedOriginPatterns("*")`
- This doesn't match SecurityConfig's explicit CORS origins
- Browser rejects WebSocket handshake

**Fix Deployed:** eaafd39 (just pushed ~1 minute ago)
- Changed WebSocketConfig to use same CORS origins as SecurityConfig
- `.setAllowedOrigins(allowedOrigins.split(","))`
- Both configs now use: `https://deadlands-frontend-production.up.railway.app`

**Expected Fix Time:** ~5-8 minutes for backend to deploy

### Issue 2: GET /sessions/1 403 Forbidden ⚠️

**Error:**
```
GET https://deadlands-campaign-manager-production-053e.up.railway.app/api/sessions/1 403 (Forbidden)
```

**Possible Causes:**
1. SecurityConfig pattern matching not working correctly
2. JWT token missing or invalid
3. User role not properly extracted

**Current SecurityConfig:**
```java
.requestMatchers(HttpMethod.GET, "/sessions/**").hasAnyRole("PLAYER", "GAME_MASTER")
```

**Next Steps:**
- Wait for WebSocket fix to deploy
- Test with fresh login (new JWT token)
- Check backend logs for specific authorization failure

### Issue 3: Duplicate Session Names ℹ️ Low Priority

**Behavior:** Can create multiple sessions with same name

**Not a Blocker:** Sessions have unique IDs, names are just display

**Future Fix:** Add unique constraint on (name, gameMaster) if needed

---

## How to Verify Sessions Exist

### Method 1: Database Query (Railway CLI)

```bash
railway run psql $DATABASE_URL

# In psql:
SELECT id, name, game_master_id, active, created_at
FROM game_sessions
WHERE deleted_at IS NULL
ORDER BY created_at DESC;
```

### Method 2: Backend Logs

```bash
railway logs --service deadlands-campaign-manager --tail 100 | grep "Created session"
```

### Method 3: API Call (with valid JWT)

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://deadlands-campaign-manager-production-053e.up.railway.app/api/sessions
```

---

## Testing Plan After Deployment

### Step 1: Wait for Backend Deploy (~5-8 min from 01:15 UTC)

Check deployment:
```bash
railway logs --service deadlands-campaign-manager | grep "Started CampaignManagerApplication"
```

Expected: New timestamp after 01:15 UTC

### Step 2: Hard Refresh Browser

- Press Ctrl+Shift+R (hard refresh)
- This clears cached JavaScript
- Ensures you have latest frontend code

### Step 3: Fresh Login

- Logout if logged in
- Login again as GM
- This generates fresh JWT token
- Ensures roles are properly set

### Step 4: Test Session Creation

1. Navigate to /sessions
2. Click "Create New Session"
3. Fill in:
   - Name: "WebSocket Test Session"
   - Description: "Testing CORS fix"
   - Max Players: 4
4. Click "Create"
5. **Expected:** Session created successfully

### Step 5: Test Session Room

1. Click "Manage Session" on created session
2. Navigate to /session/{id}
3. **Check console:**
   - Should see: "Connecting to WebSocket"
   - Should see: "Connected to WebSocket" ✅
   - NO "CORS policy" errors ✅
   - NO "404 Not Found" on /ws/info ✅
4. **Check page:**
   - Should show session name
   - Should show player list (may be empty)
   - NO "Session not found" error ✅

### Step 6: Test WebSocket Events (Optional)

1. Open session room in two browser windows
2. Window 1: GM
3. Window 2: Player (different account)
4. Player joins session
5. **Expected:** GM window shows player joined event in real-time

---

## What Should Work After Fix

### ✅ Session Management
- [x] Create session
- [x] List sessions
- [x] View session details
- [x] Join session (players)
- [x] Leave session

### ✅ WebSocket Connection
- [x] Handshake completes (no 404)
- [x] CORS passes (no CORS errors)
- [x] STOMP connection established
- [x] Heartbeat messages sent

### ✅ Real-Time Events
- [x] Player joined broadcasts
- [x] Player left broadcasts
- [x] Game started broadcasts
- [x] Token moved broadcasts

---

## Known Remaining Issues

### High Priority
- [ ] Fix GET /sessions/{id} 403 (if persists after fresh login)

### Medium Priority
- [ ] Add delete session feature
- [ ] Prevent duplicate session names

### Low Priority
- [ ] Add session edit feature
- [ ] Add session search/filter
- [ ] Add session invite system

---

## Backend Deployment Timeline

### Recent Deploys
1. **00:44:08 UTC** - Map serialization fix (589794a)
2. **00:57:29 UTC** - WebSocket /ws/** permitAll (feb2e71)
3. **01:06:51 UTC** - WebSocket SockJS URL scheme fix (285c7e7)
4. **01:15:00 UTC** - WebSocket CORS origins fix (eaafd39) ⬅️ CURRENT

### Expected Next Deploy
**~01:20-01:23 UTC** - Backend should restart with CORS fix

---

## Summary

**Session State:** Stored in PostgreSQL database (persistent)

**WebSocket State:** In-memory (ephemeral, reconnects on disconnect)

**Current Status:** WebSocket CORS fix deploying (critical blocker)

**Expected Resolution:** 5-8 minutes from now

**User Action Required:**
1. Wait for deployment
2. Hard refresh browser
3. Fresh login as GM
4. Test session creation and room access

---

**Last Updated:** 2025-11-15 01:15 UTC
**Critical Fix Commit:** eaafd39
**Status:** 🔄 Deploying WebSocket CORS fix
**ETA:** 01:20-01:23 UTC
