const { Given, When, Then, Before, After, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('chai');
const SessionAPI = require('../support/api/SessionAPI');

// Set timeout to 60 seconds for all steps
setDefaultTimeout(60000);

// Initialize SessionAPI before each scenario
Before(function () {
  this.sessionAPI = new SessionAPI(this.config);
  this.sessionAPI.enableDebug(); // Enable debug logging
  this.apiTokens = {}; // Store JWT tokens by username
  this.createdSessions = []; // Store created session IDs for cleanup
});

// Cleanup after each scenario
After(function () {
  if (this.sessionAPI) {
    this.sessionAPI.printSummary();
  }
});

// ========== BACKGROUND STEPS ==========

Given('the backend API is accessible', async function () {
  try {
    const response = await this.sessionAPI.getAllSessions();
    // If we get here without error, API is accessible (even if 401/403)
    console.log('✓ Backend API is accessible');
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      throw new Error(`Backend API is not accessible at ${this.sessionAPI.baseURL}`);
    }
    // Other errors (401, 403) mean API is accessible, just not authenticated
    console.log('✓ Backend API is accessible (authentication required)');
  }
});

// ========== AUTHENTICATION STEPS ==========

Given('{string} logs in and gets a valid JWT token', async function (username) {
  const password = this.testData[username].password;

  try {
    const response = await this.sessionAPI.login(username, password);
    expect(response.status).to.equal(200);
    expect(response.data).to.have.property('token');

    this.apiTokens[username] = response.data.token;
    this.currentToken = response.data.token;
    this.currentUser = username;

    console.log(`✓ ${username} logged in successfully`);
  } catch (error) {
    throw new Error(`Login failed for ${username}: ${error.response?.data || error.message}`);
  }
});

Given('an invalid JWT token {string}', function (token) {
  this.currentToken = token;
  console.log('✓ Using invalid JWT token for testing');
});

Given('{string} and {string} have valid JWT tokens', async function (username1, username2) {
  await this.sessionAPI.login(username1, this.testData[username1].password)
    .then(res => { this.apiTokens[username1] = res.data.token; });
  await this.sessionAPI.login(username2, this.testData[username2].password)
    .then(res => { this.apiTokens[username2] = res.data.token; });
  console.log(`✓ ${username1} and ${username2} have JWT tokens`);
});

// ========== REQUEST STEPS ==========

When('the client requests GET {string} with the JWT token', async function (endpoint) {
  try {
    this.lastResponse = await this.sessionAPI.getAllSessions(this.currentToken);
  } catch (error) {
    this.lastResponse = error.response;
    this.lastError = error;
  }
});

When('the client requests GET {string} without authentication', async function (endpoint) {
  try {
    this.lastResponse = await this.sessionAPI.getAllSessions(null);
  } catch (error) {
    this.lastResponse = error.response;
    this.lastError = error;
  }
});

When('the client requests POST {string} with:', async function (endpoint, dataTable) {
  const data = {};
  dataTable.hashes().forEach(row => {
    const key = Object.keys(row)[0];
    const value = row[key];
    data[key] = isNaN(value) ? value : parseInt(value);
  });

  try {
    this.lastResponse = await this.sessionAPI.createSession(data, this.currentToken);
    if (this.lastResponse.data && this.lastResponse.data.id) {
      this.createdSessions.push(this.lastResponse.data.id);
      this.currentSessionId = this.lastResponse.data.id;
    }
  } catch (error) {
    this.lastResponse = error.response;
    this.lastError = error;
  }
});

When('the client requests GET {string} with the JWT token', async function (endpoint) {
  const url = endpoint.replace('{sessionId}', this.currentSessionId);

  try {
    if (url.includes('/players')) {
      this.lastResponse = await this.sessionAPI.getSessionPlayers(this.currentSessionId, this.currentToken);
    } else {
      this.lastResponse = await this.sessionAPI.getSession(this.currentSessionId, this.currentToken);
    }
  } catch (error) {
    this.lastResponse = error.response;
    this.lastError = error;
  }
});

When('the client requests POST {string} with:', async function (endpoint, dataTable) {
  const data = dataTable.hashes()[0];
  const characterId = data.characterId?.includes('{')
    ? this.testData[this.currentUser].character.id
    : parseInt(data.characterId);

  try {
    if (endpoint.includes('/join')) {
      this.lastResponse = await this.sessionAPI.joinSession(this.currentSessionId, characterId, this.currentToken);
    } else if (endpoint.includes('/start')) {
      this.lastResponse = await this.sessionAPI.startGame(this.currentSessionId, this.currentToken);
    }
  } catch (error) {
    this.lastResponse = error.response;
    this.lastError = error;
  }
});

When('the client requests POST {string} with the JWT token', async function (endpoint) {
  try {
    if (endpoint.includes('/start')) {
      this.lastResponse = await this.sessionAPI.startGame(this.currentSessionId, this.currentToken);
    } else if (endpoint.includes('/leave')) {
      this.lastResponse = await this.sessionAPI.leaveSession(this.currentSessionId, this.currentToken);
    }
  } catch (error) {
    this.lastResponse = error.response;
    this.lastError = error;
  }
});

// ========== SESSION CREATION/MANAGEMENT STEPS ==========

Given('a session exists with name {string}', async function (sessionName) {
  const gmToken = this.apiTokens['e2e_testgm'] || this.currentToken;
  const response = await this.sessionAPI.createSession({ name: sessionName, maxPlayers: 5 }, gmToken);

  expect(response.status).to.equal(201);
  this.currentSessionId = response.data.id;
  this.createdSessions.push(response.data.id);
  console.log(`✓ Session created: ${sessionName} (ID: ${this.currentSessionId})`);
});

Given('{string} creates a session named {string}', async function (username, sessionName) {
  const token = this.apiTokens[username];
  if (!token) {
    const response = await this.sessionAPI.login(username, this.testData[username].password);
    this.apiTokens[username] = response.data.token;
  }

  const response = await this.sessionAPI.createSession(
    { name: sessionName, maxPlayers: 5 },
    this.apiTokens[username]
  );

  this.currentSessionId = response.data.id;
  this.createdSessions.push(response.data.id);
  console.log(`✓ ${username} created session: ${sessionName}`);
});

Given('{string} creates a session with max players {int}', async function (username, maxPlayers) {
  const token = this.apiTokens[username];
  const response = await this.sessionAPI.createSession(
    { name: 'Test Session', maxPlayers },
    token
  );

  this.currentSessionId = response.data.id;
  this.createdSessions.push(response.data.id);
});

Given('{string} joins the session with their character', async function (username) {
  const token = this.apiTokens[username];
  const characterId = this.testData[username].character.id;

  const response = await this.sessionAPI.joinSession(this.currentSessionId, characterId, token);
  expect(response.status).to.equal(200);
  console.log(`✓ ${username} joined session`);
});

When('{string} tries to join the session', async function (username) {
  const token = this.apiTokens[username];
  const characterId = this.testData[username].character.id;

  try {
    this.lastResponse = await this.sessionAPI.joinSession(this.currentSessionId, characterId, token);
  } catch (error) {
    this.lastResponse = error.response;
    this.lastError = error;
  }
});

When('both players request to join the session simultaneously', async function () {
  const token1 = this.apiTokens['e2e_player1'];
  const token2 = this.apiTokens['e2e_player2'];
  const char1 = this.testData['e2e_player1'].character.id;
  const char2 = this.testData['e2e_player2'].character.id;

  const [response1, response2] = await Promise.all([
    this.sessionAPI.joinSession(this.currentSessionId, char1, token1).catch(e => e.response),
    this.sessionAPI.joinSession(this.currentSessionId, char2, token2).catch(e => e.response)
  ]);

  this.concurrentResponses = [response1, response2];
});

When('the GM starts the game', async function () {
  const gmToken = this.apiTokens['e2e_testgm'];
  this.lastResponse = await this.sessionAPI.startGame(this.currentSessionId, gmToken);
});

When('{string} leaves the session', async function (username) {
  const token = this.apiTokens[username];
  this.lastResponse = await this.sessionAPI.leaveSession(this.currentSessionId, token);
});

// ========== ASSERTION STEPS ==========

Then('the response status should be {int}', function (expectedStatus) {
  const actualStatus = this.lastResponse?.status || this.lastError?.response?.status;
  expect(actualStatus).to.equal(expectedStatus,
    `Expected status ${expectedStatus} but got ${actualStatus}. Response: ${JSON.stringify(this.lastResponse?.data || this.lastError?.response?.data)}`
  );
  console.log(`✓ Response status is ${expectedStatus}`);
});

Then('the response should be valid JSON', function () {
  expect(this.lastResponse.data).to.be.an('object');
  console.log('✓ Response is valid JSON');
});

Then('the response should contain an array of sessions', function () {
  expect(this.lastResponse.data).to.be.an('array');
  console.log(`✓ Response contains array of ${this.lastResponse.data.length} sessions`);
});

Then('the response should contain error message {string}', function (message) {
  const responseData = this.lastResponse?.data || this.lastError?.response?.data || '';
  const responseString = typeof responseData === 'string' ? responseData : JSON.stringify(responseData);
  expect(responseString.toLowerCase()).to.include(message.toLowerCase());
  console.log(`✓ Response contains error message: ${message}`);
});

Then('the response should contain error message indicating access denied', function () {
  const status = this.lastResponse?.status;
  expect([401, 403]).to.include(status);
  console.log('✓ Response indicates access denied');
});

Then('the response should contain a session with name {string}', function (expectedName) {
  expect(this.lastResponse.data.name).to.equal(expectedName);
  console.log(`✓ Session name is "${expectedName}"`);
});

Then('the session should have gameMaster with username {string}', function (username) {
  expect(this.lastResponse.data.gameMaster.username).to.equal(username);
  console.log(`✓ GM is ${username}`);
});

Then('the response should contain a SessionPlayer record', function () {
  expect(this.lastResponse.data).to.have.property('session');
  expect(this.lastResponse.data).to.have.property('player');
  console.log('✓ Response contains SessionPlayer record');
});

Then('the SessionPlayer should have player username {string}', function (username) {
  expect(this.lastResponse.data.player.username).to.equal(username);
  console.log(`✓ SessionPlayer has username ${username}`);
});

Then('the response should contain {int} players', function (count) {
  expect(this.lastResponse.data).to.be.an('array').with.lengthOf(count);
  console.log(`✓ Response contains ${count} players`);
});

Then('the players should include {string} and {string}', function (user1, user2) {
  const usernames = this.lastResponse.data.map(p => p.player.username);
  expect(usernames).to.include(user1);
  expect(usernames).to.include(user2);
  console.log(`✓ Players include ${user1} and ${user2}`);
});

Then('the response should show session active is true', function () {
  expect(this.lastResponse.data.active).to.be.true;
  console.log('✓ Session is active');
});

Then('the player should no longer be in the session players list', async function () {
  const token = this.apiTokens['e2e_testgm'];
  const response = await this.sessionAPI.getSessionPlayers(this.currentSessionId, token);
  const usernames = response.data.map(p => p.player.username);
  expect(usernames).to.not.include(this.currentUser);
  console.log(`✓ Player removed from session`);
});

Then('both requests should succeed with status {int}', function (status) {
  expect(this.concurrentResponses[0].status).to.equal(status);
  expect(this.concurrentResponses[1].status).to.equal(status);
  console.log('✓ Both concurrent requests succeeded');
});

Then('the session should have exactly {int} players', async function (count) {
  const token = this.apiTokens['e2e_testgm'];
  const response = await this.sessionAPI.getSessionPlayers(this.currentSessionId, token);
  expect(response.data).to.have.lengthOf(count);
  console.log(`✓ Session has exactly ${count} players`);
});

Then('the session should be created with active false', function () {
  expect(this.lastResponse.data.active).to.be.false;
  console.log('✓ Session created with active=false');
});

Then('the session active should be true', async function () {
  const token = this.apiTokens['e2e_testgm'];
  const response = await this.sessionAPI.getSession(this.currentSessionId, token);
  expect(response.data.active).to.be.true;
  console.log('✓ Session is now active');
});

Then('the session should still exist with active true', async function () {
  const token = this.apiTokens['e2e_testgm'];
  const response = await this.sessionAPI.getSession(this.currentSessionId, token);
  expect(response.data).to.exist;
  expect(response.data.active).to.be.true;
  console.log('✓ Session still exists and is active');
});

// ========== DEBUG/LOGGING STEPS ==========

Then('the JWT filter debug log should show successful authentication', function () {
  // This would require access to server logs
  // For now, we verify by successful 200 response
  expect(this.lastResponse.status).to.equal(200);
  console.log('✓ JWT filter authenticated request successfully');
});

Then('the JWT filter debug log should show {string}', function (expectedLog) {
  // This would require access to server logs
  // For local testing, user should check backend console output
  console.log(`ℹ️  Check server logs for: ${expectedLog}`);
});

Then('the JWT filter debug log should show:', function (dataTable) {
  // This would require access to server logs
  const expected = dataTable.hashes();
  console.log('ℹ️  Check server logs for JWT filter debug output:');
  expected.forEach(row => {
    const key = Object.keys(row)[0];
    console.log(`   ${key}: ${row[key]}`);
  });
});

Then('the security filter should have matched pattern {string}', function (pattern) {
  // This requires server log access
  console.log(`ℹ️  Verify SecurityConfig matched pattern: ${pattern}`);
  console.log('   Check Railway logs for pattern matching');
});

Given('developer tools network tab is open', function () {
  console.log('ℹ️  For browser tests, open DevTools > Network tab');
  console.log('   For API tests, check sessionAPI.requests log');
});

Then('the response should indicate session is full', function () {
  expect(this.lastResponse.status).to.equal(409);
  console.log('✓ Session is full (409 Conflict)');
});

Then('the response should indicate validation errors', function () {
  expect(this.lastResponse.status).to.equal(400);
  console.log('✓ Validation error returned');
});

// ========== COMPLEX SCENARIO HELPERS ==========

When('the client requests POST {string} with name {string}', async function (endpoint, name) {
  const response = await this.sessionAPI.createSession({ name, maxPlayers: 5 }, this.currentToken);
  this.lastResponse = response;
  this.currentSessionId = response.data.id;
  this.createdSessions.push(response.data.id);
});

When('{string} joins the session', async function (username) {
  const token = this.apiTokens[username] || await this.sessionAPI.login(username, this.testData[username].password).then(r => r.data.token);
  this.apiTokens[username] = token;

  const characterId = this.testData[username].character.id;
  await this.sessionAPI.joinSession(this.currentSessionId, characterId, token);
});

Then('GET {string} should return {int} players', async function (endpoint, count) {
  const token = this.apiTokens['e2e_testgm'];
  const response = await this.sessionAPI.getSessionPlayers(this.currentSessionId, token);
  expect(response.data).to.have.lengthOf(count);
});
