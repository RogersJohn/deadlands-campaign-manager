# Next Session - Action Items

**Last Updated:** 2025-11-27
**Current Status:** Deployment in Progress - Check Status First
**Priority:** Verify deployment, then continue with Initiative/Turn Structure

---

## 🚨 FIRST THING - Check Deployment Status

A deployment was triggered at the end of last session. Before doing anything else:

### 1. Test API Health
```bash
# Test login endpoint
curl -s https://deadlands-campaign-manager-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"gamemaster","password":"Test123!"}'

# If it returns a token, the deployment is working
# If it returns 500, check Railway logs for errors
```

### 2. Check Railway Logs
```bash
railway logs --tail 50
```

### 3. If Still Failing - Manual Redeploy
Go to Railway dashboard and trigger a manual redeploy from the UI.

---

## 📝 Session 2025-11-27 - What Was Done

### Bug Fixes Committed

1. **Multiplayer Sync Fix** (commit `d4b0eaf`)
   - Fixed property name mismatch in `GameArena.tsx`
   - Was: `toX`, `toY`, `username`
   - Now: `gridX`, `gridY`, `movedBy` (matches `ArenaScene.ts`)

2. **Hibernate Schema Fix** (commit `2fdf74c`)
   - Added `nullable = true` to `@Column` annotations in `GameState.java`
   - Fields: `roundNumber`, `combatActive`, `jokerDealtThisRound`
   - Added null safety to `nextRound()` method
   - Added error logging to `GameStateController`

### Files Modified
- `backend/src/main/java/com/deadlands/campaign/model/GameState.java`
- `backend/src/main/java/com/deadlands/campaign/controller/GameStateController.java`
- `frontend/src/game/GameArena.tsx`
- `test/manual-testing/fix-game-state-nulls.js` (new utility)

### Root Cause Analysis
- **Multiplayer Issue**: Event property names mismatched between emitter and handler
- **500 Errors**: Hibernate `ddl-auto: update` was trying to add NOT NULL columns to table with existing data

---

## 🎯 Session Focus: Turn Management & Initiative

**Problem:** Players can take unlimited actions - the turn structure is broken.

**Goal:** Implement proper Savage Worlds turn management:
- Each character gets 1 action per turn
- Multi-action penalty (-2 per extra action) for additional actions
- GM controls turn advancement
- Initiative determines action order (card draw system)

---

## 🐛 Critical Bug: Unlimited Actions

### Root Cause Analysis

**TWO disconnected action systems exist:**

1. **Frontend (GameArena.tsx)**
   - `remainingActions` state initialized to 1
   - Only resets when player selects a character
   - **NEVER RESET when turn advances via WebSocket**
   - Location: `frontend/src/game/GameArena.tsx` lines 67, 383, 402-404

2. **Backend (CombatManager.ts)**
   - `actionsThisTurn` counter for multi-action penalty
   - Resets in `endEnemyTurn()` method
   - **Completely disconnected from frontend UI**
   - Location: `frontend/src/game/engine/CombatManager.ts` lines 38, 151-153, 277, 330

**Why It's Broken:** When the turn advances via WebSocket ('turnChanged' event), `GameArena` updates `combatState` but does NOT reset `remainingActions`. Players can take unlimited actions.

### The Fix

**Option A: Frontend Fix (Quick)**
Add action reset in the WebSocket turn change handler:

```typescript
// In GameArena.tsx, inside the turnChanged event listener
useEffect(() => {
  const handleTurnChanged = (event: CustomEvent) => {
    const gameState = event.detail;
    setCombatState(prev => ({
      ...prev,
      turnNumber: gameState.turnNumber,
      phase: gameState.turnPhase,
    }));

    // RESET ACTIONS when turn changes
    setRemainingActions(1);
  };
  // ...
}, []);
```

**Option B: Backend Enforcement (Proper)**
- Track actions per character on the backend
- Validate action requests (reject if no actions remaining)
- Broadcast action usage via WebSocket
- More work but prevents cheating

---

## 📋 Implementation Tasks

### Phase 1: Fix Action Limits (1-2 hours)
- [ ] Reset `remainingActions` when turn changes (frontend)
- [ ] Disable action buttons when no actions remaining
- [ ] Show "No actions remaining" message
- [ ] Test multi-action penalty still works

### Phase 2: Initiative System (2-3 hours)
- [ ] Draw actual playing cards for initiative (not hardcoded)
- [ ] Store initiative order on backend GameState
- [ ] Broadcast initiative to all players
- [ ] Show all characters in tracker (not just current player)
- [ ] Highlight whose turn it is

### Phase 3: Turn Flow (1-2 hours)
- [ ] Player can only act on their turn
- [ ] GM can advance to next character's turn
- [ ] "End Turn" button for players
- [ ] Round counter increments after all characters act

### Phase 4: Savage Worlds Specifics (1-2 hours)
- [ ] Joker = +2 to all trait and damage rolls that round
- [ ] Hesitant hindrance (take lowest of 2 cards)
- [ ] Quick edge (redraw cards 5 or lower)
- [ ] Level Headed (draw 2, keep best)
- [ ] Hold action (go later in initiative)

---

## 🔑 Key Files to Modify

### Backend
```
backend/src/main/java/com/deadlands/campaign/
├── model/GameState.java              # Add initiativeOrder field
├── service/GameStateService.java     # Add drawInitiative(), advanceTurn()
├── controller/GameStateController.java # Endpoints for turn management
└── dto/InitiativeEntry.java          # New DTO for initiative data
```

### Frontend
```
frontend/src/
├── game/
│   ├── GameArena.tsx                 # FIX: Reset actions on turn change
│   ├── components/
│   │   ├── InitiativeTracker.tsx     # Show all characters, real cards
│   │   ├── ActionBar.tsx             # Disable when no actions
│   │   └── TurnControls.tsx          # NEW: End turn, hold action buttons
│   └── engine/CombatManager.ts       # Connect to frontend state
├── hooks/
│   └── useGameWebSocket.ts           # Handle initiative broadcasts
└── services/
    └── turnService.ts                # NEW: Turn management API calls
```

---

## 🃏 Savage Worlds Initiative Rules

### Basic Rules
1. **Deal Cards:** Each character draws one card at start of round
2. **Order:** Act from highest (Ace ♠) to lowest (2 ♣)
3. **Suit Order:** ♠ > ♥ > ♦ > ♣
4. **Jokers:** Red = act first with +2 bonus, Black = act last (or first?)
5. **One Action:** Each character gets 1 action per turn
6. **Multi-Action:** Can take multiple actions at -2 per additional action

### Special Cases
- **Hesitant (Hindrance):** Draw 2 cards, use worst
- **Quick (Edge):** Redraw cards 5 or lower
- **Level Headed (Edge):** Draw 2 cards, use best
- **Improved Level Headed:** Draw 3 cards, use best
- **Hold:** Can choose to act later in round
- **Interrupt:** Spend a Benny to act out of turn

### Card Values (High to Low)
```
Joker (Red) > Ace > King > Queen > Jack > 10 > 9 > 8 > 7 > 6 > 5 > 4 > 3 > 2 > Joker (Black)
```

Within same value: ♠ > ♥ > ♦ > ♣

---

## 🧪 Testing Checklist

### Manual Testing
1. [ ] Player can only take 1 action per turn
2. [ ] Action buttons disable after action used
3. [ ] Multi-action penalty applies correctly (-2, -4, -6...)
4. [ ] GM can advance turn to next character
5. [ ] Player sees "Your Turn" indicator correctly
6. [ ] Initiative tracker shows all characters in order
7. [ ] Cards change each round
8. [ ] Joker bonus applies (+2 to rolls)

### Test Accounts (Production)
| Username | Password | Role | Character |
|----------|----------|------|-----------|
| `gamemaster` | `Test123!` | GM | N/A |
| `JCKullmann` | `Test123!` | Player | Jack Horner |
| `e2e_player1` | `Test123!` | Player | Wild West Huckster |
| `e2e_player2` | `Test123!` | Player | Frontier Blessed |

### Launch Test Browsers
```bash
cd test/manual-testing
npm install  # First time only
node launch-test-scenario.js
```

---

## 📊 Current State Summary

### What's Working ✅
- Turn phase cycling (player → enemy → resolution)
- WebSocket broadcasting of turn changes
- Multi-action penalty calculation (in CombatManager)
- Basic initiative tracker display
- GM turn advance endpoint

### What's Broken ❌
- **Unlimited actions** - remainingActions never resets
- **Static initiative cards** - hardcoded, not drawn
- **Single player tracker** - only shows current player
- **No enforcement** - players can act out of turn
- **No End Turn button** - players can't pass

### What's Missing 🚧
- Backend initiative card drawing
- Initiative order storage in GameState
- Character-specific turn tracking
- Action validation on backend
- Hold/interrupt mechanics

---

## 🚀 Quick Start for Next Session

### 1. Read the Bug (5 min)
Open `frontend/src/game/GameArena.tsx` and find:
- Line 67: `remainingActions` useState
- Line 214-236: `turnChanged` handler (missing action reset!)
- Line 402-404: `handleSelectAction` (decrements actions)

### 2. Apply Quick Fix (15 min)
Add `setRemainingActions(1);` inside the `handleTurnChanged` function.

### 3. Test Locally (10 min)
```bash
# Terminal 1 - Backend
cd backend
mvnw.cmd spring-boot:run

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 4. Implement Full Solution (2-4 hours)
Follow the Phase 1-4 tasks above.

---

## 📝 This Session's Accomplishments (2025-11-25)

### Bug Fixes
- ✅ Fixed WebSocket URL (was `/ws`, should be `/api/ws`)
- ✅ Fixed Railway build (root `package.json` was confusing build)
- ✅ Removed CombatHUD clutter (duplicate turn/health display)

### Database Fixes
- ✅ Reset PostgreSQL sequences (was causing duplicate key errors)
- ✅ Created test characters for e2e_player1 and e2e_player2
- ✅ Reset password for JCKullmann player account
- ✅ Renamed JCKullman → JCKullmann

### New Utilities
- `test/manual-testing/create-test-characters.js` - Create fully-loaded test characters
- `test/manual-testing/fix-sequences.js` - Reset PostgreSQL auto-increment sequences
- `test/manual-testing/verify-characters.js` - Verify character data
- `test/manual-testing/find-character.js` - Find character owner
- `test/manual-testing/reset-user-password.js` - Reset user passwords
- `test/manual-testing/rename-user.js` - Rename users

### Infrastructure
- ✅ Moved test dependencies to `test/manual-testing/package.json`
- ✅ Removed root `package.json` that broke Railway builds
- ✅ Production deployment restored

---

## 🔗 Reference Documentation

| Document | Purpose |
|----------|---------|
| `TURN_MANAGEMENT_IMPLEMENTATION.md` | WebSocket turn sync pattern |
| `STATE_MANAGEMENT.md` | When to use Zustand vs React Query |
| `COMMON_PATTERNS.md` | Implementation patterns |
| `ARCHITECTURE_DECISIONS.md` | Design rationale |

---

## 🎯 Success Criteria

By end of next session:
- [ ] Players limited to 1 action per turn (bug fixed)
- [ ] Action buttons disable when no actions remaining
- [ ] Initiative tracker shows multiple characters
- [ ] GM can advance through turn order
- [ ] Basic Savage Worlds turn flow working

**Stretch Goals:**
- [ ] Real card drawing for initiative
- [ ] End Turn button for players
- [ ] Joker bonus implementation
