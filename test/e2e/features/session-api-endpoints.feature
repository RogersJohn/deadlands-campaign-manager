Feature: Session API Endpoints
  As a developer
  I want to verify all session endpoints work correctly
  So that users can manage game sessions without 403 errors

  Background:
    Given the backend API is accessible
    And test accounts exist:
      | username    | password  | role         |
      | e2e_testgm  | Test123!  | GAME_MASTER  |
      | e2e_player1 | Test123!  | PLAYER       |
      | e2e_player2 | Test123!  | PLAYER       |
    And characters exist for all players

  @critical @api @session-endpoints
  Scenario: GET /api/sessions returns 200 with valid JWT
    Given "e2e_testgm" logs in and gets a valid JWT token
    When the client requests GET "/api/sessions" with the JWT token
    Then the response status should be 200
    And the response should be valid JSON
    And the JWT filter debug log should show successful authentication
    And the response should contain an array of sessions

  @critical @api @session-endpoints
  Scenario: GET /api/sessions returns 401 without JWT token
    When the client requests GET "/api/sessions" without authentication
    Then the response status should be 401
    And the response should contain error message "Unauthorized"

  @critical @api @session-endpoints
  Scenario: POST /api/sessions creates session as GM
    Given "e2e_testgm" logs in and gets a valid JWT token
    When the client requests POST "/api/sessions" with:
      | name        | Test Session     |
      | description | API Test Session |
      | maxPlayers  | 5                |
    Then the response status should be 201
    And the response should contain a session with name "Test Session"
    And the session should have gameMaster with username "e2e_testgm"
    And the JWT filter debug log should show "ROLE_GAME_MASTER"

  @critical @api @session-endpoints @authorization
  Scenario: POST /api/sessions returns 403 for PLAYER role
    Given "e2e_player1" logs in and gets a valid JWT token
    When the client requests POST "/api/sessions" with:
      | name        | Forbidden Session |
      | maxPlayers  | 5                 |
    Then the response status should be 403
    And the response should contain error message indicating access denied

  @critical @api @session-endpoints
  Scenario: GET /api/sessions/{id} returns specific session
    Given "e2e_testgm" logs in and gets a valid JWT token
    And a session exists with name "Specific Session Test"
    When the client requests GET "/api/sessions/{sessionId}" with the JWT token
    Then the response status should be 200
    And the response should contain a session with name "Specific Session Test"

  @critical @api @session-endpoints
  Scenario: POST /api/sessions/{id}/join adds player to session
    Given "e2e_testgm" creates a session named "Join Test Session"
    And "e2e_player1" logs in and gets a valid JWT token
    When the client requests POST "/api/sessions/{sessionId}/join" with:
      | characterId | {player1CharacterId} |
    Then the response status should be 200
    And the response should contain a SessionPlayer record
    And the SessionPlayer should have player username "e2e_player1"

  @critical @api @session-endpoints
  Scenario: GET /api/sessions/{id}/players returns all session players
    Given "e2e_testgm" creates a session named "Players List Test"
    And "e2e_player1" joins the session with their character
    And "e2e_player2" joins the session with their character
    When the client requests GET "/api/sessions/{sessionId}/players"
    Then the response status should be 200
    And the response should contain 2 players
    And the players should include "e2e_player1" and "e2e_player2"

  @critical @api @session-endpoints @websocket
  Scenario: POST /api/sessions/{id}/start activates session (GM only)
    Given "e2e_testgm" creates a session named "Start Test Session"
    And "e2e_player1" joins the session with their character
    And "e2e_testgm" logs in and gets a valid JWT token
    When the client requests POST "/api/sessions/{sessionId}/start" with the JWT token
    Then the response status should be 200
    And the response should show session active is true
    And the JWT filter debug log should show "ROLE_GAME_MASTER"

  @critical @api @session-endpoints @authorization
  Scenario: POST /api/sessions/{id}/start returns 403 for PLAYER role
    Given "e2e_testgm" creates a session named "Forbidden Start Test"
    And "e2e_player1" joins the session with their character
    And "e2e_player1" logs in and gets a valid JWT token
    When the client requests POST "/api/sessions/{sessionId}/start" with the JWT token
    Then the response status should be 403
    And the response should contain error message indicating access denied

  @critical @api @session-endpoints
  Scenario: POST /api/sessions/{id}/leave removes player from session
    Given "e2e_testgm" creates a session named "Leave Test Session"
    And "e2e_player1" joins the session with their character
    And "e2e_player1" logs in and gets a valid JWT token
    When the client requests POST "/api/sessions/{sessionId}/leave" with the JWT token
    Then the response status should be 204
    And the player should no longer be in the session players list

  @api @session-endpoints @debug
  Scenario: Verify JWT filter logs authentication details
    Given "e2e_testgm" logs in and gets a valid JWT token
    And developer tools network tab is open
    When the client requests GET "/api/sessions" with the JWT token
    Then the JWT filter debug log should show:
      | Request URI                  | /api/sessions             |
      | Authorization Header         | Present                   |
      | JWT Valid - Username         | e2e_testgm                |
      | UserDetails loaded           | e2e_testgm                |
      | Authorities                  | [ROLE_GAME_MASTER]        |
      | Authentication SET           | ✓                         |

  @api @session-endpoints @pattern-matching
  Scenario: Verify /sessions pattern matches both /sessions and /sessions/**
    Given "e2e_testgm" logs in and gets a valid JWT token
    When the client requests GET "/api/sessions" with the JWT token
    Then the response status should be 200
    And the security filter should have matched pattern "/sessions"

    When the client requests GET "/api/sessions/1" with the JWT token
    Then the security filter should have matched pattern "/sessions/**"

  @api @session-endpoints @error-handling
  Scenario: Invalid JWT token returns 403
    Given an invalid JWT token "invalid.token.here"
    When the client requests GET "/api/sessions" with the invalid token
    Then the response status should be 403
    And the JWT filter debug log should show "JWT validation FAILED"

  @api @session-endpoints @edge-case
  Scenario: Session with max players limit enforced
    Given "e2e_testgm" creates a session with max players 2
    And "e2e_player1" joins the session with their character
    And "e2e_player2" joins the session with their character
    When "e2e_player3" tries to join the session
    Then the response status should be 409
    And the response should indicate session is full

  @api @session-endpoints @validation
  Scenario: Creating session without name returns validation error
    Given "e2e_testgm" logs in and gets a valid JWT token
    When the client requests POST "/api/sessions" with:
      | description | Missing name |
      | maxPlayers  | 5            |
    Then the response status should be 400
    And the response should indicate validation errors

  @api @session-endpoints @concurrency
  Scenario: Multiple players joining simultaneously
    Given "e2e_testgm" creates a session named "Concurrent Join Test"
    And "e2e_player1" and "e2e_player2" have valid JWT tokens
    When both players request to join the session simultaneously
    Then both requests should succeed with status 200
    And the session should have exactly 2 players

  @api @session-endpoints @comprehensive
  Scenario: Complete session lifecycle
    # Create
    Given "e2e_testgm" logs in and gets a valid JWT token
    When the client requests POST "/api/sessions" with name "Lifecycle Test"
    Then the response status should be 201
    And the session should be created with active false

    # Players join
    When "e2e_player1" joins the session
    And "e2e_player2" joins the session
    Then GET "/api/sessions/{sessionId}/players" should return 2 players

    # Start game
    When the GM starts the game
    Then the session active should be true

    # Player leaves
    When "e2e_player1" leaves the session
    Then GET "/api/sessions/{sessionId}/players" should return 1 player

    # Verify state
    When the client requests GET "/api/sessions/{sessionId}"
    Then the session should still exist with active true
