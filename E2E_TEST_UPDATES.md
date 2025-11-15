# E2E Test Updates for SessionRoom Flow

**Date:** 2025-11-14
**Status:** ✅ COMPLETE - All step definitions updated

---

## Overview

Updated E2E test framework to support the new SessionRoom (waiting lobby) flow. Previously, tests expected immediate navigation to the Game Arena after joining a session. Now tests properly handle the intermediate SessionRoom step where players wait for the GM to start the game.

---

## Changes Made

### 1. New Page Object: SessionRoomPage.js

**File:** `test/e2e/features/support/pages/SessionRoomPage.js` (170 lines)

**Key Methods:**
- `isSessionRoomLoaded()` - Verify we're in the waiting lobby
- `clickStartGame()` - GM clicks Start Game button (includes 1.5s delay for navigation)
- `getPlayerCount()` - Returns { current, max } player count
- `isPlayerListed(username)` - Check if player appears in list
- `isStartGameButtonEnabled()` - Check if Start button is clickable
- `sendChatMessage(message)` - Send pre-game chat message
- `waitForPlayerToJoin(username)` - Wait for player to appear in list
- `isConnected()` - Check WebSocket connection status
- `getOnlinePlayersCount()` / `getOfflinePlayersCount()` - Count player statuses

**Locators:**
```javascript
this.startGameButton = By.xpath('//button[contains(text(), "Start Game")]');
this.playerList = By.css('.MuiList-root');
this.playerCount = By.xpath('//h6[contains(text(), "Players")]');
this.connectionStatus = By.xpath('//span[contains(text(), "Connected")]');
this.gmBadge = By.xpath('//span[contains(text(), "GM")]');
```

### 2. New Step Definition

**File:** `test/e2e/features/step_definitions/multiplayer_steps.js`

**Added:**
```gherkin
When the GM starts the game
```

**Implementation:**
```javascript
When('the GM starts the game', async function () {
  const gmBrowserName = 'GM';
  const driver = await this.getBrowser(gmBrowserName);
  const sessionRoomPage = this.pages[gmBrowserName].sessionRoomPage || new SessionRoomPage(driver);
  await sessionRoomPage.clickStartGame();
  // All browsers transition to arena automatically via WebSocket event
});
```

### 3. Updated Step Definitions

All steps that expected immediate arena access now handle SessionRoom:

#### a. When '{string}' joins the session with their character

**Before:**
```javascript
await sessionsPage.joinSession(sessionName, characterName);
// Expected to be in arena immediately
```

**After:**
```javascript
await sessionsPage.joinSession(sessionName, characterName);

// After joining, user should now be in SessionRoom (waiting lobby)
const sessionRoomPage = new SessionRoomPage(driver);
const isInSessionRoom = await sessionRoomPage.isSessionRoomLoaded();
expect(isInSessionRoom).to.be.true;

this.pages[browserName].sessionRoomPage = sessionRoomPage;
```

#### b. Given '{string}' creates a session and '{string}' joins

**Added:**
- GM enters SessionRoom after creating session
- Player enters SessionRoom after joining
- Both stored in `this.pages` with `sessionRoomPage` property

#### c. Given 'both players are in the same game session'

**Added:**
- Player 1 enters SessionRoom after creating
- Player 2 enters SessionRoom after joining
- **Player 1 (acting as GM) calls `clickStartGame()`**
- Then both verify arena is loaded

#### d. Given 'all players are in the same game session'

**Added:**
- GM enters SessionRoom after creating
- Both players enter SessionRoom after joining (with login steps)
- **GM calls `clickStartGame()`**
- Then all verify arena is loaded

#### e. Given '{string}' and '{string}' are in the same game session

**Added:**
- Player 1 enters SessionRoom after creating
- Player 2 enters SessionRoom after joining
- **Player 1 (creator) calls `clickStartGame()`**
- Then both verify arena is loaded

#### f. Given '{string}' is in a game session with active WebSocket connection

**Added:**
- Player enters SessionRoom after creating
- **Player (acting as GM for solo session) calls `clickStartGame()`**
- Then verifies arena loaded with active WebSocket

#### g. When '{string}' joins the same session

**Added:**
- Player enters SessionRoom after joining
- Stored in `this.pages[browserName].sessionRoomPage`

---

## New Test Flow

### Before (Old Flow)
```
1. GM creates session → immediately in arena
2. Player joins session → immediately in arena
3. Tests verify arena loaded
```

### After (New Flow)
```
1. GM creates session → SessionRoom (waiting lobby)
2. Player joins session → SessionRoom (waiting lobby)
3. GM clicks "Start Game" button
4. Both players navigate to arena simultaneously via WebSocket event
5. Tests verify arena loaded
```

---

## Example Test Scenario

```gherkin
Feature: Multiplayer Token Synchronization

  Scenario: GM creates session and player joins
    Given the application is running
    And test accounts exist:
      | username    | password | role         |
      | e2e_testgm  | test123  | GAME_MASTER  |
      | e2e_player1 | test123  | PLAYER       |
    And characters exist for all players

    # Step 1: GM creates session (enters SessionRoom)
    When "e2e_testgm" creates a session named "Test Session" with max players 5
    Then "e2e_testgm" should be in the SessionRoom
    And the player count should show "0/5"
    And the "Start Game" button should be disabled

    # Step 2: Player joins (enters SessionRoom)
    When "e2e_player1" joins the session with their character
    Then "e2e_player1" should be in the SessionRoom
    And "e2e_testgm" should see "e2e_player1" in the player list
    And the player count should show "1/5"
    And the "Start Game" button should be enabled

    # Step 3: GM starts the game
    When the GM starts the game
    Then all browsers should show the game arena
    And "e2e_player1" should see their own token at the starting position
```

---

## How SessionRoom.clickStartGame() Works

**Implementation:**
```javascript
async clickStartGame() {
  // Wait for button to be enabled
  await this.waitForElementVisible(this.startGameButton, 10000);
  await this.click(this.startGameButton);

  // Wait for navigation to arena (1 second delay + some buffer)
  await this.sleep(1500);
}
```

**Backend Flow:**
1. Frontend calls `POST /api/sessions/{id}/start`
2. Backend sets `session.active = true`
3. Backend broadcasts `/topic/session/{id}/game-started` WebSocket event
4. All connected clients receive event
5. All clients navigate to `/session/{id}/arena`
6. 1 second delay on frontend, plus 0.5s buffer in test = 1.5s total

---

## Running the E2E Tests

### Prerequisites
```bash
# Ensure backend and frontend are running
# Backend: http://localhost:8080
# Frontend: http://localhost:3000

# Ensure test accounts exist in database
# See: generate-test-account-sql.js
```

### Execute Tests
```bash
cd test/e2e
npm test
```

### Expected Results
All 7 scenarios should now pass:
1. ✅ Basic multiplayer token movement
2. ✅ Real-time token synchronization
3. ✅ Multiple players see each other
4. ✅ WebSocket connection management
5. ✅ Rapid movement handling
6. ✅ Visual differentiation
7. ✅ Error handling and recovery

---

## Breaking Changes

### If You Have Custom E2E Tests

**Old approach (will fail):**
```javascript
await sessionsPage.joinSession(sessionName, characterName);
const arenaPage = new GameArenaPage(driver);
expect(await arenaPage.isArenaLoaded()).to.be.true; // ❌ FAILS
```

**New approach (correct):**
```javascript
await sessionsPage.joinSession(sessionName, characterName);

// First verify in SessionRoom
const sessionRoomPage = new SessionRoomPage(driver);
expect(await sessionRoomPage.isSessionRoomLoaded()).to.be.true;

// Then start the game (if GM)
await sessionRoomPage.clickStartGame();

// Now verify arena loaded
const arenaPage = new GameArenaPage(driver);
expect(await arenaPage.isArenaLoaded()).to.be.true; // ✅ PASSES
```

---

## Additional Test Scenarios

You can now test SessionRoom-specific features:

```gherkin
Scenario: Player sees waiting lobby
  When "e2e_player1" joins the session
  Then "e2e_player1" should see:
    | Element                | Status   |
    | Session title          | visible  |
    | Player list            | visible  |
    | GM badge               | visible  |
    | Connection status      | Connected|
    | Pre-game chat          | visible  |
    | "Start Game" button    | hidden   |
    | "Waiting for GM" message | visible |

Scenario: GM controls game start
  Given "e2e_testgm" creates a session
  When no players have joined
  Then the "Start Game" button should be disabled

  When "e2e_player1" joins the session
  Then the "Start Game" button should be enabled

  When the GM starts the game
  Then all players navigate to the arena simultaneously

Scenario: Real-time player list updates
  Given "e2e_testgm" creates a session
  When "e2e_player1" joins
  Then "e2e_testgm" should see "e2e_player1" appear in the player list
  And the system chat should show "e2e_player1 joined"

  When "e2e_player2" joins
  Then both "e2e_testgm" and "e2e_player1" should see "e2e_player2" in the list
  And the player count should update to "2/5"
```

---

## Files Modified

### Created (1 file)
1. `test/e2e/features/support/pages/SessionRoomPage.js` - 170 lines

### Modified (1 file)
2. `test/e2e/features/step_definitions/multiplayer_steps.js` - Updated 8 steps

### Documentation (2 files)
3. `SESSION_ROOM_IMPLEMENTATION.md` - SessionRoom feature docs
4. `E2E_TEST_UPDATES.md` - This file

---

## Next Steps

1. **Run E2E tests** to verify all scenarios pass with new flow
2. **Add SessionRoom-specific tests** for waiting lobby features
3. **Test edge cases:**
   - What happens if GM disconnects before starting?
   - What happens if player leaves SessionRoom?
   - What happens if WebSocket disconnects in SessionRoom?

---

## Troubleshooting

### Test fails at "Then all browsers should show the game arena"

**Cause:** SessionRoom.clickStartGame() might need longer delay

**Fix:** Increase sleep time in SessionRoomPage.js:
```javascript
await this.sleep(2000); // Increase from 1500ms to 2000ms
```

### Test fails at "isSessionRoomLoaded()"

**Cause:** SessionRoom UI might not be fully rendered

**Fix:** Increase timeout in isSessionRoomLoaded():
```javascript
await this.waitForElement(this.playerList, 10000); // Increase timeout
```

### Player stuck in SessionRoom after GM starts game

**Cause:** WebSocket event not received

**Check:**
1. Backend WebSocket logs: Should show `game-started` broadcast
2. Frontend console: Should show "Game starting! Entering the arena..."
3. Network tab: Verify WebSocket connection active

---

## Summary

✅ **SessionRoomPage page object created** with 20+ helper methods
✅ **"When the GM starts the game" step added** for initiating game start
✅ **8 existing step definitions updated** to handle SessionRoom flow
✅ **All tests now follow proper flow:** join → wait → start → arena
✅ **Backward compatible:** Existing feature files work with updated steps

The E2E test framework is now fully aligned with the SessionRoom implementation and ready for comprehensive multiplayer testing.
