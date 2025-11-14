Feature: Session Room (Waiting Lobby)
  As a Game Master and Players
  I want a waiting lobby before the game starts
  So that I can see who joined and coordinate before starting

  Background:
    Given the application is running
    And test accounts exist:
      | username    | password  | role         |
      | e2e_testgm  | Test123!  | GAME_MASTER  |
      | e2e_player1 | Test123!  | PLAYER       |
      | e2e_player2 | Test123!  | PLAYER       |
    And characters exist for all players

  @critical @session-room
  Scenario: GM creates session and enters SessionRoom
    Given "e2e_testgm" is logged in as Game Master in browser "GM"

    When "e2e_testgm" creates a session named "Waiting Lobby Test" with max players 5
    Then "GM" should be in the SessionRoom
    And "GM" should see the session title "Waiting Lobby Test"
    And "GM" should see player count "0/5"
    And "GM" should see the Start Game button
    And the Start Game button should be disabled
    And "GM" should see the GM badge

  @critical @session-room @multiplayer
  Scenario: Player joins and appears in real-time player list
    Given "e2e_testgm" is logged in as Game Master in browser "GM"
    And "e2e_player1" is logged in as Player in browser "Player1"

    When "e2e_testgm" creates a session named "Player Join Test" with max players 5
    Then "GM" should be in the SessionRoom

    When "e2e_player1" joins the session with their character
    Then "Player1" should be in the SessionRoom
    And "GM" should see "e2e_player1" in the player list
    And "GM" should see player count "1/5"
    And the Start Game button should be enabled
    And "Player1" should see the waiting message

  @critical @session-room @game-start
  Scenario: GM starts game and all players navigate to arena
    Given "e2e_testgm" is logged in as Game Master in browser "GM"
    And "e2e_player1" is logged in as Player in browser "Player1"
    And "e2e_player2" is logged in as Player in browser "Player2"

    When "e2e_testgm" creates a session named "Start Game Test" with max players 5
    And "e2e_player1" joins the session with their character
    And "e2e_player2" joins the session with their character
    Then "GM" should see player count "2/5"

    When the GM starts the game
    Then all browsers should show the game arena
    And "Player1" should see their own token at the starting position
    And "Player2" should see their own token at the starting position

  @session-room @websocket
  Scenario: Multiple players join and player list updates in real-time
    Given "e2e_testgm" is logged in as Game Master in browser "GM"
    And "e2e_player1" is logged in as Player in browser "Player1"
    And "e2e_player2" is logged in as Player in browser "Player2"

    When "e2e_testgm" creates a session named "Multi Join Test" with max players 3
    Then "GM" should see player count "0/3"

    When "e2e_player1" joins the session with their character
    Then "GM" should see "e2e_player1" in the player list
    And "GM" should see player count "1/3"

    When "e2e_player2" joins the session with their character
    Then "GM" should see "e2e_player2" in the player list
    And "Player1" should see "e2e_player2" in the player list
    And "GM" should see player count "2/3"
    And "Player1" should see player count "2/3"
    And "Player2" should see player count "2/3"

  @session-room @connection-status
  Scenario: SessionRoom shows WebSocket connection status
    Given "e2e_testgm" is logged in as Game Master in browser "GM"

    When "e2e_testgm" creates a session named "Connection Test" with max players 5
    Then "GM" should be in the SessionRoom
    And "GM" should see connection status as "Connected"

    When "e2e_player1" is logged in as Player in browser "Player1"
    And "e2e_player1" joins the session with their character
    Then "Player1" should see connection status as "Connected"

  @session-room @player-status
  Scenario: Player list shows online/offline status
    Given "e2e_testgm" is logged in as Game Master in browser "GM"
    And "e2e_player1" is logged in as Player in browser "Player1"

    When "e2e_testgm" creates a session named "Status Test" with max players 5
    And "e2e_player1" joins the session with their character
    Then "GM" should see "e2e_player1" with online status
    And "Player1" should see themselves with online status

  @session-room @validation
  Scenario: Start Game button is disabled with no players
    Given "e2e_testgm" is logged in as Game Master in browser "GM"

    When "e2e_testgm" creates a session named "Empty Session" with max players 5
    Then "GM" should be in the SessionRoom
    And the Start Game button should be disabled
    And "GM" should see player count "0/5"

  @session-room @edge-case
  Scenario: Max players limit is enforced visually
    Given "e2e_testgm" is logged in as Game Master in browser "GM"
    And "e2e_player1" is logged in as Player in browser "Player1"
    And "e2e_player2" is logged in as Player in browser "Player2"

    When "e2e_testgm" creates a session named "Full Session" with max players 2
    Then "GM" should see player count "0/2"

    When "e2e_player1" joins the session with their character
    Then "GM" should see player count "1/2"

    When "e2e_player2" joins the session with their character
    Then "GM" should see player count "2/2"

  @session-room @ui
  Scenario: SessionRoom displays all required UI elements
    Given "e2e_testgm" is logged in as Game Master in browser "GM"

    When "e2e_testgm" creates a session named "UI Test" with max players 5
    Then "GM" should see:
      | Element                | Status   |
      | Session title          | visible  |
      | Player list            | visible  |
      | GM badge               | visible  |
      | Connection status      | visible  |
      | Pre-game chat          | visible  |
      | Start Game button      | visible  |
      | Leave Session button   | visible  |
      | Player count           | visible  |

  @session-room @navigation
  Scenario: Player role does not see Start Game button
    Given "e2e_player1" is logged in as Player in browser "Player1"
    And "e2e_testgm" is logged in as Game Master in browser "GM"

    When "e2e_testgm" creates a session named "Role Test" with max players 5
    And "e2e_player1" joins the session with their character
    Then "Player1" should be in the SessionRoom
    And "Player1" should not see the Start Game button
    And "Player1" should see the waiting message
    But "GM" should see the Start Game button
