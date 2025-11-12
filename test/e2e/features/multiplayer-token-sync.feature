Feature: Multiplayer Token Synchronization
  As a Game Master and Players
  I want real-time token movement synchronization
  So that all players see each other's movements instantly

  Background:
    Given the application is running
    And test accounts exist:
      | username    | password  | role         |
      | e2e_testgm  | Test123!  | GAME_MASTER  |
      | e2e_player1 | Test123!  | PLAYER       |
      | e2e_player2 | Test123!  | PLAYER       |
    And characters exist for all players

  @critical @multiplayer
  Scenario: Two players see each other's token movements in real-time
    Given "e2e_testgm" is logged in as Game Master in browser "GM"
    And "e2e_player1" is logged in as Player in browser "Player1"
    And "e2e_player2" is logged in as Player in browser "Player2"

    When "e2e_testgm" creates a session named "E2E Test Session" with max players 5
    And "e2e_player1" joins the session with their character
    And "e2e_player2" joins the session with their character

    Then all browsers should show the game arena
    And "Player1" should see their own token at the starting position
    And "Player2" should see their own token at the starting position

    When "e2e_player1" moves their token to position (110, 95)
    Then "Player1" should see their token at position (110, 95)
    And "Player2" should see "e2e_player1"'s remote token at position (110, 95)
    And "GM" should see "e2e_player1"'s remote token at position (110, 95)

    When "e2e_player2" moves their token to position (105, 100)
    Then "Player2" should see their token at position (105, 100)
    And "Player1" should see "e2e_player2"'s remote token at position (105, 100)
    And "GM" should see "e2e_player2"'s remote token at position (105, 100)

  @multiplayer @websocket
  Scenario: WebSocket connection status is visible
    Given "e2e_player1" is logged in as Player in browser "Player1"
    And "e2e_testgm" creates a session and "e2e_player1" joins

    When "e2e_player1" navigates to the game arena
    Then "Player1" should see WebSocket status as "connected"
    And the browser console should show "WebSocket connected"

  @multiplayer @edge-case
  Scenario: Token movement synchronization with 3 simultaneous players
    Given "e2e_testgm" is logged in as Game Master in browser "GM"
    And "e2e_player1" is logged in as Player in browser "Player1"
    And "e2e_player2" is logged in as Player in browser "Player2"
    And all players are in the same game session

    When "e2e_player1" moves to (115, 95) at the same time as "e2e_player2" moves to (90, 100)
    Then "Player1" should see their own token at (115, 95)
    And "Player1" should see "e2e_player2"'s remote token at (90, 100)
    And "Player2" should see their own token at (90, 100)
    And "Player2" should see "e2e_player1"'s remote token at (115, 95)
    And "GM" should see both remote tokens at their correct positions

  @multiplayer @visual
  Scenario: Remote player tokens have distinct visual styling
    Given "e2e_player1" is logged in as Player in browser "Player1"
    And "e2e_player2" is logged in as Player in browser "Player2"
    And both players are in the same game session

    When "e2e_player2" moves their token to (105, 105)
    Then "Player1" should see their own token with dark blue color
    And "Player1" should see "e2e_player2"'s remote token with light blue color
    And "Player1" should see "e2e_player2"'s username label on the remote token
    And the remote token should have 70% opacity

  @multiplayer @session-management
  Scenario: Player joining mid-game sees existing player tokens
    Given "e2e_testgm" creates a session and "e2e_player1" joins
    And "e2e_player1" has moved to position (120, 100)

    When "e2e_player2" joins the same session
    Then "Player2" should see "e2e_player1"'s remote token at position (120, 100)
    And "Player1" should see "e2e_player2"'s remote token appear

  @multiplayer @error-handling
  Scenario: Graceful handling of WebSocket disconnection
    Given "e2e_player1" is in a game session with active WebSocket connection

    When the network connection is interrupted
    And the connection is restored after 2 seconds
    Then the WebSocket should automatically reconnect
    And "e2e_player1" should continue receiving token movement updates
    And no error should be displayed to the user

  @multiplayer @performance
  Scenario: System handles rapid token movements smoothly
    Given "e2e_player1" and "e2e_player2" are in the same game session

    When "e2e_player1" makes 10 rapid token movements within 2 seconds
    Then all 10 movements should be synchronized to "e2e_player2"
    And the token positions should update smoothly without lag
    And no movements should be lost or duplicated
