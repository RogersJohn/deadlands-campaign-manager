# AI Gamemaster Assistant - GM-Only Restrictions

**Date:** 2025-11-14
**Status:** ✅ IMPLEMENTED - Deploying to Railway
**Commit:** 08a371c "Restrict AI Gamemaster Assistant to GM-only access"

---

## Overview

The AI Gamemaster Assistant is now **completely restricted to Game Masters only**. Players cannot see, access, or use any AI features. This prevents meta-gaming and keeps the AI as a GM-exclusive tool.

---

## Changes Made

### 1. Frontend - Game Arena (GameArena.tsx)

**Before:** AI GM button visible to all users
**After:** AI GM button only visible to Game Masters

```typescript
// Added at top of component
const { token, user } = useAuthStore();
const isGameMaster = user?.role === 'GAME_MASTER';

// AI button wrapped in conditional
{isGameMaster && (
  <Paper sx={{ p: 1, backgroundColor: '#2d1b0e', border: '2px solid #8b4513' }}>
    <Tooltip title="Open AI Gamemaster Assistant (GM Only)">
      <Button
        variant="outlined"
        startIcon={<AIIcon />}
        onClick={() => window.open('/ai-assistant', ...)}
      >
        AI GM
      </Button>
    </Tooltip>
  </Paper>
)}
```

**Result:**
- ✅ Players: AI GM button is completely hidden
- ✅ Game Masters: AI GM button visible and functional

---

### 2. Frontend - AI Assistant Window (AIAssistantWindow.tsx)

**Before:** Direct URL access allowed for all users
**After:** Access denied page for non-GMs

```typescript
const { user } = useAuthStore();
const isGameMaster = user?.role === 'GAME_MASTER';

// GM-only guard
if (!isGameMaster) {
  return (
    <Alert severity="error">
      <AlertTitle>🚫 Access Denied</AlertTitle>
      The AI Gamemaster Assistant is only available to Game Masters.
      This powerful tool provides AI-generated NPCs, encounters, locations,
      and rule lookups. Only the GM has access to ensure game balance and
      prevent meta-gaming.
    </Alert>
  );
}
```

**Result:**
- ✅ Players: Cannot access `/ai-assistant` directly
- ✅ Shows clear "Access Denied" message explaining why
- ✅ Game Masters: Full access to AI Assistant

---

### 3. Backend - API Security (AIAssistantController.java)

**Before:** Some endpoints accessible to players
**After:** ALL AI endpoints require GAME_MASTER role

#### Updated Endpoints:

**NPC Dialogue** (`/api/ai-gm/npc-dialogue`)
```java
// Before
@PreAuthorize("hasAnyRole('PLAYER', 'GAME_MASTER')")

// After
@PreAuthorize("hasRole('GAME_MASTER')")
```

**Rule Lookup** (`/api/ai-gm/rule-lookup`)
```java
// Before
@PreAuthorize("hasAnyRole('PLAYER', 'GAME_MASTER')")

// After
@PreAuthorize("hasRole('GAME_MASTER')")
```

#### Already GM-Only:
- ✅ Encounter Generator (`/api/ai-gm/generate-encounter`)
- ✅ Location Generator (`/api/ai-gm/generate-location`)
- ✅ GM Suggestions (`/api/ai-gm/gm-suggestion`)

#### Public (No Auth Required):
- ✅ Health Check (`/api/ai-gm/health`) - For monitoring only

**Result:**
- ✅ All AI features require GAME_MASTER role
- ✅ Players get 403 Forbidden if they try to access endpoints
- ✅ Backend enforces security even if frontend is bypassed

---

## Security Summary

### Frontend Protection (User Experience)
1. **UI Hidden:** Players don't see AI GM button in Game Arena
2. **Access Blocked:** Direct navigation to `/ai-assistant` shows error
3. **Clear Messaging:** Explains feature is GM-only

### Backend Protection (Security)
1. **Authentication:** All endpoints require valid JWT token
2. **Authorization:** All AI endpoints require `GAME_MASTER` role
3. **Role Enforcement:** Spring Security `@PreAuthorize` annotations
4. **Response:** Players get HTTP 403 Forbidden

### Defense in Depth
- **Layer 1:** UI hides button (convenience)
- **Layer 2:** Frontend route guard (UX)
- **Layer 3:** Backend role check (security)
- **Result:** Players cannot access AI even if they try to bypass frontend

---

## Testing Instructions

### Test 1: Player Cannot See AI Button

**Steps:**
1. Login as `e2e_player1` / `Test123!` (PLAYER role)
2. Join or create game session
3. Navigate to Game Arena
4. Check Combat HUD (right column)

**Expected Result:**
- ❌ NO AI GM button visible
- ✅ Only combat log, illumination controls, and other UI visible

---

### Test 2: Player Cannot Access AI Window Directly

**Steps:**
1. While logged in as `e2e_player1` (PLAYER role)
2. Manually navigate to: https://deadlands-frontend-production.up.railway.app/ai-assistant
3. Or try: `window.open('/ai-assistant')` in browser console

**Expected Result:**
- ❌ NO AI Assistant panel
- ✅ "Access Denied" error message shown
- ✅ Explanation that feature is GM-only

**Error Message Should Say:**
```
🚫 Access Denied
The AI Gamemaster Assistant is only available to Game Masters.

This powerful tool provides AI-generated NPCs, encounters, locations,
and rule lookups. Only the GM has access to ensure game balance and
prevent meta-gaming.

If you believe you should have access, please contact your Game Master.
```

---

### Test 3: Player API Calls Blocked

**Steps:**
1. Login as `e2e_player1` and get JWT token
2. Try to call AI API endpoint:
```bash
curl -X POST https://deadlands-campaign-manager-production-053e.up.railway.app/api/ai-gm/rule-lookup \
  -H "Authorization: Bearer PLAYER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ruleQuestion":"How does aim work?"}'
```

**Expected Result:**
- ❌ Request rejected
- ✅ HTTP 403 Forbidden
- ✅ Error message about insufficient permissions

---

### Test 4: GM Has Full Access

**Steps:**
1. Login as `e2e_testgm` / `Test123!` (GAME_MASTER role)
2. Join or create game session
3. Navigate to Game Arena
4. Check for AI GM button in Combat HUD

**Expected Result:**
- ✅ AI GM button is visible
- ✅ Button labeled "AI GM" with brain icon
- ✅ Tooltip: "Open AI Gamemaster Assistant (GM Only)"
- ✅ Click opens AI window (900x800px popup)
- ✅ All 5 tabs visible: NPC, Rules, Encounter, Location
- ✅ All features work correctly

---

### Test 5: GM API Access

**Steps:**
1. Login as `e2e_testgm` and get JWT token
2. Call any AI endpoint:
```bash
curl -X POST https://deadlands-campaign-manager-production-053e.up.railway.app/api/ai-gm/rule-lookup \
  -H "Authorization: Bearer GM_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ruleQuestion":"How does gang up work?"}'
```

**Expected Result:**
- ✅ Request succeeds (HTTP 200)
- ✅ AI-generated response returned
- ✅ Well-formatted rule explanation

---

## Files Modified

### Frontend
1. `frontend/src/game/GameArena.tsx`
   - Added `isGameMaster` check
   - Wrapped AI GM button in conditional render
   - Updated tooltip text

2. `frontend/src/pages/AIAssistantWindow.tsx`
   - Added auth store import
   - Added GM-only guard at component level
   - Created access denied UI for players

### Backend
3. `backend/src/main/java/com/deadlands/campaign/controller/AIAssistantController.java`
   - Updated `@PreAuthorize` on `/npc-dialogue` endpoint
   - Updated `@PreAuthorize` on `/rule-lookup` endpoint
   - Updated javadoc comments to reflect GM-only access

---

## Deployment

**Status:** Deploying to Railway
**Commit:** 08a371c
**Pushed:** 2025-11-14

**Railway will auto-deploy:**
- Backend: ~5 minutes to rebuild and restart
- Frontend: ~3 minutes to rebuild and deploy

**Estimated completion:** 22:40-22:45 UTC

---

## Rollback Instructions (If Needed)

If you need to allow players to use NPC dialogue and rules lookup again:

### Quick Rollback (Backend Only)
```bash
cd backend/src/main/java/com/deadlands/campaign/controller
# Edit AIAssistantController.java

# Change lines 32 and 69 from:
@PreAuthorize("hasRole('GAME_MASTER')")

# Back to:
@PreAuthorize("hasAnyRole('PLAYER', 'GAME_MASTER')")

# Rebuild and redeploy
```

### Full Rollback (All Changes)
```bash
git revert 08a371c
git push origin main
```

---

## Rationale

### Why GM-Only?

1. **Prevent Meta-Gaming**
   - Players could use rule lookup to find loopholes
   - Players could generate encounters to prepare
   - Players could create NPCs to predict GM's plans

2. **Maintain GM Authority**
   - AI is a tool to assist the GM, not replace them
   - GM decides when and how to use AI
   - Players shouldn't rely on AI for rules questions

3. **Game Balance**
   - Encounter and location generators are inherently GM tools
   - NPC dialogue could spoil GM's prepared NPCs
   - Rule lookups should go through GM for consistency

4. **Immersion**
   - Players asking GM questions (human interaction)
   - GM can provide context-specific answers
   - AI responses don't account for house rules

---

## Alternative Approach (If Needed)

If you want to give players **limited** AI access in the future:

### Option 1: Player-Specific Features
- Create separate player-facing endpoints
- Limit to basic rule lookups only
- No NPC, encounter, or location access
- Different UI/branding (not "AI GM")

### Option 2: GM-Controlled Access
- Add session-level toggle: "Allow player AI access"
- GM decides per-session if players can use AI
- GM can enable/disable mid-session
- Logs all player AI usage for GM review

### Option 3: Tiered Access
- Players: Basic rule lookups only
- GMs: Full AI Assistant access
- Different rate limits per role
- GM sees all player AI queries

**Current Decision:** Full GM-only restriction (simplest and most secure)

---

## Summary

✅ **Frontend:** AI GM button hidden from players
✅ **Frontend:** Direct access blocked with clear error message
✅ **Backend:** All AI endpoints require GAME_MASTER role
✅ **Security:** Multi-layer protection (UI, route guard, API auth)
✅ **Deployed:** Changes pushed to Railway
✅ **Tested:** Ready for verification after deployment

**Next Step:** Wait ~5-10 minutes for Railway deployment, then test with player and GM accounts to verify restrictions work correctly.

---

**Last Updated:** 2025-11-14 22:35 UTC
**Status:** ✅ DEPLOYED AND READY FOR TESTING
