# Session API Testing Guide - Full Debugging Mode

## Overview

This guide explains how to run comprehensive automated tests for the session endpoints with **full debugging visibility**, including:

- ✅ Chrome browser with **DevTools automatically opened**
- ✅ Network tab showing all API requests/responses
- ✅ Console logs from both frontend and JWT filter
- ✅ Railway backend logs in real-time
- ✅ Step-by-step test execution with detailed logging

---

## Quick Start

### 1. Install Dependencies

```bash
cd test/e2e
npm install
```

### 2. Run Tests with DevTools

```bash
# Run all session API tests with DevTools
node run-with-devtools.js --tags @api

# Run in slow motion (500ms between actions)
node run-with-devtools.js --tags @api --slow

# Run a specific scenario
node run-with-devtools.js --tags @critical
```

### 3. Monitor Backend Logs (Separate Terminal)

```bash
# In another terminal window
railway logs --service deadlands-campaign-manager

# Or with filtering
railway logs --service deadlands-campaign-manager | grep -E "JWT FILTER|SESSION"
```

---

## Test Files Overview

### Feature File
**Location**: `test/e2e/features/session-api-endpoints.feature`

Contains 20 comprehensive test scenarios covering:
- ✅ GET /api/sessions (with/without JWT)
- ✅ POST /api/sessions (create session)
- ✅ GET /api/sessions/{id} (get specific session)
- ✅ POST /api/sessions/{id}/join (join session)
- ✅ POST /api/sessions/{id}/leave (leave session)
- ✅ GET /api/sessions/{id}/players (get players)
- ✅ POST /api/sessions/{id}/start (start game - GM only)
- ✅ Authorization testing (PLAYER vs GAME_MASTER roles)
- ✅ Pattern matching verification (/sessions vs /sessions/**)
- ✅ Error handling and edge cases

### SessionAPI Helper
**Location**: `test/e2e/features/support/api/SessionAPI.js`

Provides:
- API request methods with automatic JWT management
- Request/response logging
- Debug mode with verbose output
- Test report generation

### Step Definitions
**Location**: `test/e2e/features/step_definitions/session_api_steps.js`

Implements all Gherkin steps with:
- Detailed console logging
- Chai assertions
- Error handling
- Debug output

---

## Running Tests - Detailed Instructions

### Option 1: With DevTools (Recommended for Debugging)

```bash
node run-with-devtools.js --tags @api
```

**What Happens:**
1. Chrome opens in **visible mode**
2. DevTools **automatically opens**
3. Network tab is ready to capture requests
4. Tests run with full visibility
5. You can see each API call in the Network tab

**DevTools Tips:**
- **Network Tab**: Filter by "sessions" to see only session endpoints
- **Preserve Log**: Check this box to keep requests across page reloads
- **Console Tab**: View browser console.log() output
- **Application Tab**: Inspect LocalStorage for JWT tokens

### Option 2: Headless Mode (CI/CD)

```bash
npm test -- --tags @api
```

or

```bash
HEADLESS=true cucumber-js --tags @api
```

### Option 3: Specific Scenarios

```bash
# Run only critical tests
node run-with-devtools.js --tags @critical

# Run only authorization tests
node run-with-devtools.js --tags @authorization

# Run only WebSocket tests
node run-with-devtools.js --tags @websocket

# Run complete lifecycle test
node run-with-devtools.js --tags @comprehensive
```

---

## Debugging Workflow

### Step 1: Start Backend Logs Monitoring

```bash
# Terminal 1
railway logs --service deadlands-campaign-manager --follow
```

### Step 2: Run Tests with DevTools

```bash
# Terminal 2
cd test/e2e
node run-with-devtools.js --tags @api --slow
```

### Step 3: Watch for Output

**In Test Console:**
```
✓ Backend API is accessible
✓ e2e_testgm logged in successfully
========== API REQUEST ==========
GET https://deadlands-campaign-manager-production.up.railway.app/api/sessions
Headers: { Authorization: 'Bearer eyJhbGciOiJIUzI1N...' }
================================

========== API RESPONSE ==========
Status: 200
Data: [ { id: 1, name: 'Test Session', ... } ]
==================================

✓ Response status is 200
✓ Response is valid JSON
✓ Response contains array of 0 sessions
```

**In Railway Logs:**
```
========== JWT FILTER DEBUG ==========
Request URI: /api/sessions
Method: GET
Authorization Header: Present
JWT Valid - Username: e2e_testgm
UserDetails loaded: e2e_testgm
Authorities: [ROLE_GAME_MASTER]
✓ Authentication SET in SecurityContext
Final Authentication: e2e_testgm [ROLE_GAME_MASTER]
======================================
```

**In Chrome DevTools Network Tab:**
- See the GET request to `/api/sessions`
- Click on it to see Request Headers (with JWT token)
- See Response Headers and response body
- Status code: 200 OK

---

## Test Scenarios Explained

### 1. **Basic GET Request**
```gherkin
Scenario: GET /api/sessions returns 200 with valid JWT
  Given "e2e_testgm" logs in and gets a valid JWT token
  When the client requests GET "/api/sessions" with the JWT token
  Then the response status should be 200
  And the JWT filter debug log should show successful authentication
```

**Verifies:**
- ✅ SecurityConfig pattern matches `/sessions`
- ✅ JWT token is validated
- ✅ User authorities loaded from database
- ✅ Response contains session data

### 2. **Authorization Testing**
```gherkin
Scenario: POST /api/sessions returns 403 for PLAYER role
  Given "e2e_player1" logs in and gets a valid JWT token
  When the client requests POST "/api/sessions" with session data
  Then the response status should be 403
```

**Verifies:**
- ✅ `@PreAuthorize("hasRole('GAME_MASTER')")` enforced
- ✅ PLAYER role cannot create sessions
- ✅ Proper 403 Forbidden returned

### 3. **Pattern Matching**
```gherkin
Scenario: Verify /sessions pattern matches both /sessions and /sessions/**
  When the client requests GET "/api/sessions"
  Then the security filter should have matched pattern "/sessions"

  When the client requests GET "/api/sessions/1"
  Then the security filter should have matched pattern "/sessions/**"
```

**Verifies:**
- ✅ Our fix for pattern matching bug
- ✅ Both `/sessions` and `/sessions/**` are matched
- ✅ No 403 errors on base `/sessions` endpoint

### 4. **Complete Session Lifecycle**
```gherkin
Scenario: Complete session lifecycle
  # Create → Join → Start → Leave → Verify
```

**Verifies:**
- ✅ End-to-end session flow
- ✅ Multiple players joining
- ✅ GM starting game
- ✅ Players leaving
- ✅ Session state persistence

---

## Troubleshooting

### Problem: Tests Can't Connect to API

**Symptoms:**
```
Error: connect ECONNREFUSED
```

**Solutions:**
1. Check API URL in `test/e2e/features/support/world.js`
2. Verify Railway deployment is running: `railway status`
3. Test API manually: `curl https://deadlands-campaign-manager-production.up.railway.app/api/sessions`

### Problem: JWT Authentication Failing

**Symptoms:**
```
✗ Response status is 401 (expected 200)
```

**Debug Steps:**
1. Check Railway logs for JWT filter output
2. Look for "JWT validation FAILED" in logs
3. Verify JWT_SECRET matches between environments
4. Check user exists in database: `railway run --service postgres psql -c "SELECT * FROM users WHERE username='e2e_testgm';"`

### Problem: Getting 403 Instead of 200

**Symptoms:**
```
Expected status 200 but got 403
```

**Debug Steps:**
1. Check SecurityConfig deployment: Look for "SESSION FIX - Corrected Pattern Matching" in logs
2. Verify pattern matching: Check Railway logs for which pattern matched
3. Check authorities: Look for "Authorities: [ROLE_...]" in JWT filter logs
4. Verify @PreAuthorize annotations on controller methods

### Problem: DevTools Not Opening

**Solutions:**
1. Make sure you're using `run-with-devtools.js` script
2. Check `DEVTOOLS=true` environment variable is set
3. Try manually: `DEVTOOLS=true node run-with-devtools.js`
4. Verify Chrome is installed: `which google-chrome` or `where chrome`

---

## Advanced Debugging

### Enable Verbose Logging

Edit `test/e2e/features/support/api/SessionAPI.js`:

```javascript
constructor(config) {
  this.baseURL = config.apiUrl;
  this.debug = true; // ← Enable by default
  this.requests = [];
  this.responses = [];
}
```

### Capture Screenshots on Failure

Add to `test/e2e/features/support/world.js`:

```javascript
After(async function(scenario) {
  if (scenario.result.status === 'failed') {
    for (const [name, driver] of Object.entries(this.browsers)) {
      const screenshot = await driver.takeScreenshot();
      this.attach(screenshot, 'image/png');
      console.log(`📸 Screenshot captured for browser '${name}'`);
    }
  }
});
```

### Network Traffic Capture

Use Selenium's DevTools Protocol:

```javascript
const { exec} = require('selenium-webdriver/lib/command');
await driver.sendDevToolsCommand('Network.enable', {});
```

---

## Expected Output (Successful Run)

```
╔══════════════════════════════════════════════════════════════╗
║   Deadlands E2E Tests - Chrome DevTools Debug Mode          ║
╚══════════════════════════════════════════════════════════════╝

Configuration:
  • Browser: Chrome (visible mode)
  • DevTools: Auto-open
  • Slow Motion: disabled
  • Tags: @api

DevTools Tips:
  1. Network Tab: Monitor API requests/responses
  2. Console Tab: View browser console logs
  3. Application Tab: Inspect LocalStorage/SessionStorage

Starting tests...
════════════════════════════════════════════════════════════════

✓ Backend API is accessible
✓ e2e_testgm logged in successfully
✓ Response status is 200
✓ Response is valid JSON
✓ Response contains array of sessions
✓ JWT filter authenticated request successfully

... (20 scenarios)

========== SESSION API TEST SUMMARY ==========
Total Requests: 45
Successful (2xx): 40
Client Errors (4xx): 5
Server Errors (5xx): 0
=============================================

════════════════════════════════════════════════════════════════
Tests completed with exit code: 0

✅ All tests passed!
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Session API Tests

on: [push, pull_request]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          cd test/e2e
          npm install

      - name: Run tests
        env:
          HEADLESS: true
          API_URL: ${{ secrets.API_URL }}
          FRONTEND_URL: ${{ secrets.FRONTEND_URL }}
        run: |
          cd test/e2e
          npm test -- --tags @api

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: test/e2e/test-results.json
```

---

## Summary

You now have a **complete E2E testing suite** for session endpoints with:

✅ **20 comprehensive test scenarios**
✅ **Chrome DevTools automatically opened**
✅ **Real-time backend log monitoring**
✅ **Detailed request/response logging**
✅ **Slow-motion mode for debugging**
✅ **Full visibility into JWT authentication flow**

Run the tests and watch them execute in real-time with full debugging visibility!

```bash
cd test/e2e
node run-with-devtools.js --tags @api
```
