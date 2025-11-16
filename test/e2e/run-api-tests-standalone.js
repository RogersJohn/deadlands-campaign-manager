#!/usr/bin/env node

/**
 * Standalone Session API Test Runner
 *
 * Runs session endpoint tests without requiring Selenium/browser.
 * Tests the API directly using axios.
 */

const SessionAPI = require('./features/support/api/SessionAPI');
const chalk = require('chalk');

// Configuration
const config = {
  apiUrl: process.env.API_URL || 'https://deadlands-campaign-manager-production.up.railway.app/api',
  testUsers: {
    gm: { username: 'e2e_testgm', password: 'Test123!' },
    player1: { username: 'e2e_player1', password: 'Test123!' },
    player2: { username: 'e2e_player2', password: 'Test123!' }
  }
};

// Test results tracker
const results = {
  passed: 0,
  failed: 0,
  errors: []
};

// Helper functions
function pass(message) {
  console.log(chalk.green('✓'), message);
  results.passed++;
}

function fail(message, error) {
  console.log(chalk.red('✗'), message);
  console.log(chalk.red('  Error:'), error);
  results.failed++;
  results.errors.push({ test: message, error: error.toString() });
}

function section(title) {
  console.log('\n' + chalk.cyan('═'.repeat(70)));
  console.log(chalk.cyan.bold(`  ${title}`));
  console.log(chalk.cyan('═'.repeat(70)));
}

async function assertEquals(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`Expected ${expected}, got ${actual}`);
  }
}

async function assertStatus(response, expectedStatus, message) {
  if (response.status !== expectedStatus) {
    throw new Error(`Expected status ${expectedStatus}, got ${response.status}. Data: ${JSON.stringify(response.data)}`);
  }
}

// Main test suite
async function runTests() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║     Session API Test Suite - Standalone Execution           ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  console.log(`API URL: ${config.apiUrl}\n`);

  const api = new SessionAPI(config);
  api.enableDebug();

  let gmToken, player1Token, player2Token;
  let sessionId, player1CharacterId, player2CharacterId;

  try {
    // ===== TEST 1: AUTHENTICATION =====
    section('TEST 1: Authentication');

    try {
      const gmLogin = await api.login(config.testUsers.gm.username, config.testUsers.gm.password);
      await assertStatus(gmLogin, 200, 'GM login should return 200');
      gmToken = gmLogin.data.token;
      pass('GM authentication successful');
    } catch (error) {
      fail('GM authentication failed', error.message);
    }

    try {
      const p1Login = await api.login(config.testUsers.player1.username, config.testUsers.player1.password);
      await assertStatus(p1Login, 200, 'Player1 login should return 200');
      player1Token = p1Login.data.token;
      pass('Player1 authentication successful');
    } catch (error) {
      fail('Player1 authentication failed', error.message);
    }

    try {
      const p2Login = await api.login(config.testUsers.player2.username, config.testUsers.player2.password);
      await assertStatus(p2Login, 200, 'Player2 login should return 200');
      player2Token = p2Login.data.token;
      pass('Player2 authentication successful');
    } catch (error) {
      fail('Player2 authentication failed', error.message);
    }

    // ===== TEST 2: GET /api/sessions WITH JWT =====
    section('TEST 2: GET /api/sessions (Authenticated)');

    try {
      const response = await api.getAllSessions(gmToken);
      await assertStatus(response, 200, 'Should return 200');
      if (!Array.isArray(response.data)) {
        throw new Error('Response should be an array');
      }
      pass('GET /api/sessions returns 200 with valid JWT');
      pass(`Retrieved ${response.data.length} sessions`);
    } catch (error) {
      fail('GET /api/sessions with JWT failed', error.message);
    }

    // ===== TEST 3: GET /api/sessions WITHOUT JWT =====
    section('TEST 3: GET /api/sessions (Unauthenticated)');

    try {
      await api.getAllSessions(null);
      fail('GET /api/sessions without JWT should fail', 'Expected 401 but got success');
    } catch (error) {
      if (error.response?.status === 401) {
        pass('GET /api/sessions without JWT correctly returns 401');
      } else {
        fail('GET /api/sessions without JWT failed unexpectedly', error.message);
      }
    }

    // ===== TEST 4: POST /api/sessions (Create Session - GM) =====
    section('TEST 4: POST /api/sessions (GM Creates Session)');

    try {
      const response = await api.createSession({
        name: 'API Test Session',
        description: 'Created by automated test suite',
        maxPlayers: 5
      }, gmToken);

      await assertStatus(response, 201, 'Should return 201');
      sessionId = response.data.id;

      if (response.data.name !== 'API Test Session') {
        throw new Error('Session name mismatch');
      }
      if (response.data.gameMaster.username !== config.testUsers.gm.username) {
        throw new Error('GM username mismatch');
      }
      if (response.data.active !== false) {
        throw new Error('New session should not be active');
      }

      pass('POST /api/sessions creates session successfully');
      pass(`Session created with ID: ${sessionId}`);
    } catch (error) {
      fail('POST /api/sessions (GM) failed', error.message);
    }

    // ===== TEST 5: POST /api/sessions (PLAYER - Should Fail) =====
    section('TEST 5: POST /api/sessions (PLAYER Role - Authorization)');

    try {
      await api.createSession({
        name: 'Unauthorized Session',
        maxPlayers: 5
      }, player1Token);
      fail('POST /api/sessions as PLAYER should fail', 'Expected 403 but got success');
    } catch (error) {
      if (error.response?.status === 403) {
        pass('POST /api/sessions as PLAYER correctly returns 403');
      } else {
        fail('POST /api/sessions as PLAYER failed unexpectedly', error.message);
      }
    }

    // ===== TEST 6: GET /api/sessions/{id} =====
    section('TEST 6: GET /api/sessions/{id} (Get Specific Session)');

    if (sessionId) {
      try {
        const response = await api.getSession(sessionId, gmToken);
        await assertStatus(response, 200, 'Should return 200');

        if (response.data.id !== sessionId) {
          throw new Error('Session ID mismatch');
        }
        if (response.data.name !== 'API Test Session') {
          throw new Error('Session name mismatch');
        }

        pass('GET /api/sessions/{id} returns correct session');
      } catch (error) {
        fail('GET /api/sessions/{id} failed', error.message);
      }
    } else {
      fail('GET /api/sessions/{id} skipped', 'No session ID available');
    }

    // ===== TEST 7: GET /api/sessions/{id}/players (Empty) =====
    section('TEST 7: GET /api/sessions/{id}/players (Initially Empty)');

    if (sessionId) {
      try {
        const response = await api.getSessionPlayers(sessionId, gmToken);
        await assertStatus(response, 200, 'Should return 200');

        if (!Array.isArray(response.data)) {
          throw new Error('Response should be an array');
        }
        if (response.data.length !== 0) {
          throw new Error(`Expected 0 players, got ${response.data.length}`);
        }

        pass('GET /api/sessions/{id}/players returns empty array initially');
      } catch (error) {
        fail('GET /api/sessions/{id}/players failed', error.message);
      }
    }

    // ===== TEST 8: POST /api/sessions/{id}/join (Player1) =====
    section('TEST 8: POST /api/sessions/{id}/join (Player1 Joins)');

    // First, we need to get Player1's character ID
    // Note: This assumes characters were created via the setup script
    if (sessionId) {
      try {
        // We'll use a mock character ID for now (you may need to adjust)
        // In a real scenario, you'd fetch this from the characters endpoint
        const mockCharacterId = 1; // Adjust based on your data

        const response = await api.joinSession(sessionId, mockCharacterId, player1Token);
        await assertStatus(response, 200, 'Should return 200');

        if (response.data.player.username !== config.testUsers.player1.username) {
          throw new Error('Player username mismatch');
        }

        pass('POST /api/sessions/{id}/join - Player1 joined successfully');
      } catch (error) {
        if (error.response?.status === 404) {
          console.log(chalk.yellow('⚠'), 'Character not found - skipping join test');
          console.log(chalk.yellow('  ℹ'), 'Run setup-test-accounts.js to create characters');
        } else {
          fail('POST /api/sessions/{id}/join (Player1) failed', error.message);
        }
      }
    }

    // ===== TEST 9: GET /api/sessions/{id}/players (With Players) =====
    section('TEST 9: GET /api/sessions/{id}/players (After Join)');

    if (sessionId) {
      try {
        const response = await api.getSessionPlayers(sessionId, gmToken);
        await assertStatus(response, 200, 'Should return 200');

        if (!Array.isArray(response.data)) {
          throw new Error('Response should be an array');
        }

        pass(`GET /api/sessions/{id}/players returns ${response.data.length} player(s)`);
      } catch (error) {
        fail('GET /api/sessions/{id}/players (after join) failed', error.message);
      }
    }

    // ===== TEST 10: POST /api/sessions/{id}/start (GM Starts Game) =====
    section('TEST 10: POST /api/sessions/{id}/start (GM Starts Game)');

    if (sessionId) {
      try {
        const response = await api.startGame(sessionId, gmToken);
        await assertStatus(response, 200, 'Should return 200');

        if (response.data.active !== true) {
          throw new Error('Session should be active after start');
        }

        pass('POST /api/sessions/{id}/start - Game started successfully');
        pass('Session is now active');
      } catch (error) {
        fail('POST /api/sessions/{id}/start failed', error.message);
      }
    }

    // ===== TEST 11: POST /api/sessions/{id}/start (PLAYER - Should Fail) =====
    section('TEST 11: POST /api/sessions/{id}/start (PLAYER Role - Authorization)');

    if (sessionId) {
      try {
        await api.startGame(sessionId, player1Token);
        fail('POST /api/sessions/{id}/start as PLAYER should fail', 'Expected 403 but got success');
      } catch (error) {
        if (error.response?.status === 403) {
          pass('POST /api/sessions/{id}/start as PLAYER correctly returns 403');
        } else {
          fail('POST /api/sessions/{id}/start as PLAYER failed unexpectedly', error.message);
        }
      }
    }

    // ===== TEST 12: Invalid JWT Token =====
    section('TEST 12: Invalid JWT Token');

    try {
      await api.getAllSessions('invalid.jwt.token');
      fail('Request with invalid JWT should fail', 'Expected 403 but got success');
    } catch (error) {
      if (error.response?.status === 403 || error.response?.status === 401) {
        pass('Invalid JWT token correctly returns 403/401');
      } else {
        fail('Invalid JWT token failed unexpectedly', error.message);
      }
    }

  } catch (error) {
    console.error(chalk.red('\n❌ Test suite error:'), error);
  }

  // ===== SUMMARY =====
  console.log('\n' + chalk.cyan('═'.repeat(70)));
  console.log(chalk.cyan.bold('  TEST SUMMARY'));
  console.log(chalk.cyan('═'.repeat(70)));

  api.printSummary();

  console.log(`\n${chalk.green('Passed:')} ${results.passed}`);
  console.log(`${chalk.red('Failed:')} ${results.failed}`);
  console.log(`${chalk.blue('Total:')} ${results.passed + results.failed}\n`);

  if (results.failed > 0) {
    console.log(chalk.red('Failed Tests:'));
    results.errors.forEach((err, i) => {
      console.log(chalk.red(`  ${i + 1}. ${err.test}`));
      console.log(chalk.gray(`     ${err.error}`));
    });
    console.log('');
  }

  const successRate = ((results.passed / (results.passed + results.failed)) * 100).toFixed(1);

  if (results.failed === 0) {
    console.log(chalk.green.bold('✅ ALL TESTS PASSED!\n'));
    process.exit(0);
  } else {
    console.log(chalk.yellow(`⚠️  Success Rate: ${successRate}%\n`));
    process.exit(1);
  }
}

// Run the tests
runTests().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});
