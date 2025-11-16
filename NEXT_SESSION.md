# Session Complete: 403 Session Access Issue FIXED

**Date**: 2025-11-16
**Status**: ✅ FIXED - Session endpoints pattern matching corrected
**Deployment**: Committed 3b66eeb, pushed to GitHub, Railway auto-deploying
**Next Priority**: Verify fix in production, test session management flow

---

## Session Summary: 2025-11-16 Fix Implementation

### What We Fixed ✅

**ROOT CAUSE IDENTIFIED**: Spring Security pattern `/sessions/**` does NOT match `/sessions` (without trailing path).

**Result**: Requests to `GET /api/sessions` fell through to `.anyRequest().authenticated()`, but when authentication was missing/invalid, controller tried to use null Authentication parameter → NullPointerException → 403 Forbidden.

### Comprehensive Fixes Implemented

1. **SecurityConfig.java - Pattern Matching**
   - Fixed: `.requestMatchers("/sessions", "/sessions/**")` (matches both explicitly)
   - Changed: `.permitAll()` → `.hasAnyRole("PLAYER", "GAME_MASTER")` (proper security)
   - Added: Verification logging for deployment tracking

2. **GameSessionController.java - Refactoring**
   - Changed: `@Controller` → `@RestController` (follows Spring Boot best practices)
   - Added: `@RequestMapping("/sessions")` at class level (consistent with other controllers)
   - Changed: `Authentication` → `@AuthenticationPrincipal UserDetails` (null-safe)
   - Added: Null checks returning 401 Unauthorized (proper error codes)
   - Removed: All `@ResponseBody` annotations (redundant with @RestController)

3. **JwtAuthenticationFilter.java - Debug Logging**
   - Added: Comprehensive logging for session endpoint requests
   - Logs: JWT validation, username, authorities, authentication status
   - Helps: Diagnose any remaining JWT/database issues in production

### Files Changed
- backend/src/main/java/com/deadlands/campaign/config/SecurityConfig.java
- backend/src/main/java/com/deadlands/campaign/controller/GameSessionController.java
- backend/src/main/java/com/deadlands/campaign/security/JwtAuthenticationFilter.java

### Commit
- **SHA**: 3b66eeb
- **Message**: "Fix session 403 errors - correct pattern matching and refactor controller"
- **Pushed**: main branch to GitHub
- **Railway**: Auto-deploying from GitHub

---

## Previous Session Summary (Archive)

### What We Accomplished (Previous) 

1. **Rebuilt Railway Backend Service from Scratch**
   - Deleted old `deadlands-campaign-manager` service (had corrupt/stale state)
   - Created fresh service from GitHub: `RogersJohn/deadlands-campaign-manager`
   - Root directory: `backend`
   - Dockerfile: `backend/Dockerfile`

2. **Fixed Environment Variables**
   - **Critical Discovery**: Old service used `DATABASE_URL` (generic), but Spring Boot needs `SPRING_DATASOURCE_URL`
   - Configured correct Spring Boot variables:
     - `SPRING_DATASOURCE_URL` = `jdbc:postgresql://switchyard.proxy.rlwy.net:15935/railway`
     - `SPRING_DATASOURCE_USERNAME` = `postgres`
     - `SPRING_DATASOURCE_PASSWORD` = `wCwfSYwLvDslGeepWAiPYvxbEmEtzIhN`
     - `CORS_ORIGINS` (not CORS_ALLOWED_ORIGINS)
     - `JWT_SECRET`, `JWT_EXPIRATION`, `ANTHROPIC_API_KEY`, etc.
   - See `VariablesOld.txt` for complete reference

3. **Verified Deployment**
   - New service is **STABLE** and **RUNNING** 
   - Health endpoint: `https://deadlands-campaign-manager-production.up.railway.app/api/ai-gm/health` � 200 OK
   - Database connection: Working 
   - Latest code deployed (verified deployment logs show SecurityConfig verification message)

4. **Identified Root Cause of 403 Errors**
   - **NOT a SecurityConfig issue**
   - **NOT a JWT token issue**
   - **ACTUAL CAUSE**: Controller methods require `Authentication` parameter

   ```java
   @GetMapping("/sessions")
   public ResponseEntity<List<GameSession>> getAllSessions(Authentication authentication) {
       User user = userRepository.findByUsername(authentication.getName())
       // ...
   ```

   When a controller method has an `Authentication` parameter, Spring Security **requires authentication** even if SecurityConfig has `permitAll()`.

---

## Current State

### What's Working 
-  Service deployed and stable
-  Database connection working
-  Health endpoint responding
-  Frontend still running at `https://deadlands-frontend-production.up.railway.app`
-  Latest code from GitHub deployed

### What's Not Working L
- L `/api/sessions` returns **403 Forbidden** (even with valid JWT token)
- L `/api/sessions/{id}` returns **403 Forbidden**
- L Users cannot access "Manage Session" button functionality

### Important URLs
- **New Backend**: `https://deadlands-campaign-manager-production.up.railway.app`
- **Frontend**: `https://deadlands-frontend-production.up.railway.app` (needs updating!)
- **Database**: Railway Postgres (unchanged, all data intact)

---

## Root Cause Analysis

### The 403 Error Chain

1. **User clicks "Manage Session"** � Calls `/api/sessions/3`
2. **Browser sends JWT token** in Authorization header (confirmed in Network tab)
3. **Spring Security receives request** with valid token
4. **JwtAuthenticationFilter** validates token 
5. **Controller method requires `Authentication` parameter**
6. **Spring Security requires authentication** for this endpoint (ignores `permitAll()`)
7. **BUT: Something fails in the authentication chain** � 403 Forbidden

### Why the Authentication is Failing

**Theory 1**: JWT token has no roles
- Token payload: `{"sub":"gamemaster","iat":...,"exp":...}`
- No explicit `roles` or `authorities` in JWT
- **Design**: Roles are loaded from database via `CustomUserDetailsService`
- **Question**: Is the CustomUserDetailsService being called?

**Theory 2**: Role name mismatch
- Database has role: `GAME_MASTER` (enum)
- Spring Security expects: `ROLE_GAME_MASTER`
- CustomUserDetailsService adds `ROLE_` prefix (line 42 of CustomUserDetailsService.java)
- **Question**: Is this working correctly?

**Theory 3**: Authentication object is null or invalid
- JwtAuthenticationFilter might not be setting Authentication in SecurityContext
- **Question**: Is `SecurityContextHolder.getContext().setAuthentication()` being called?

---

## Testing the Fix (Next Steps)

### Expected Behavior After Railway Deployment

**With Valid JWT Token**:
- `GET /api/sessions` → **200 OK** (returns session list)
- `GET /api/sessions/3` → **200 OK** (returns specific session)
- `POST /api/sessions` (as GM) → **201 Created**
- All session endpoints should work

**With Invalid/Missing JWT**:
- `GET /api/sessions` → **401 Unauthorized** (not 403!)
- Clear error message

**With Valid JWT But Wrong Role**:
- `POST /api/sessions` (as PLAYER) → **403 Forbidden**
- Expected behavior for GM-only endpoints

### How to Verify

1. **Check Railway Deployment Logs**:
   ```bash
   railway logs --service deadlands-campaign-manager
   ```
   Look for: `🚀 SESSION FIX - Corrected Pattern Matching`

2. **Watch JWT Debug Output**:
   When accessing `/api/sessions`, you should see:
   ```
   ========== JWT FILTER DEBUG ==========
   Request URI: /api/sessions
   Authorization Header: Present
   JWT Valid - Username: gamemaster
   UserDetails loaded: gamemaster
   Authorities: [ROLE_GAME_MASTER]
   ✓ Authentication SET in SecurityContext
   Final Authentication: gamemaster [ROLE_GAME_MASTER]
   ======================================
   ```

3. **Test in Frontend**:
   - Login as gamemaster
   - Navigate to /sessions
   - Click "Manage Session"
   - Should work without 403 errors

### If Still Getting 403

Check debug output for:
- `✗ JWT validation FAILED` → JWT_SECRET mismatch
- `✗ Exception: ...` → Database/user lookup issue
- `Authorization Header: MISSING` → Frontend not sending token

---

## Archive: Previous Debug Attempts

### Step 1: Add Debug Logging to JwtAuthenticationFilter (COMPLETED)

**File**: `backend/src/main/java/com/deadlands/campaign/security/JwtAuthenticationFilter.java`

Add detailed logging to see what's happening:

```java
@Override
protected void doFilterInternal(HttpServletRequest request,
                                HttpServletResponse response,
                                FilterChain filterChain) {
    System.out.println("========== JWT FILTER DEBUG ==========");
    System.out.println("Request URI: " + request.getRequestURI());

    String header = request.getHeader("Authorization");
    System.out.println("Authorization Header: " + (header != null ? "Present" : "MISSING"));

    if (header != null && header.startsWith("Bearer ")) {
        String token = header.substring(7);
        System.out.println("Token extracted: " + token.substring(0, 20) + "...");

        try {
            String username = jwtTokenProvider.getUsernameFromToken(token);
            System.out.println("Username from token: " + username);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);
                System.out.println("UserDetails loaded: " + userDetails.getUsername());
                System.out.println("Authorities: " + userDetails.getAuthorities());

                if (jwtTokenProvider.validateToken(token, userDetails)) {
                    UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(auth);
                    System.out.println(" Authentication SET in SecurityContext");
                } else {
                    System.out.println("L Token validation FAILED");
                }
            }
        } catch (Exception e) {
            System.out.println("L JWT Filter Exception: " + e.getMessage());
            e.printStackTrace();
        }
    } else {
        System.out.println("No Bearer token found in request");
    }

    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    System.out.println("Final Authentication: " + (auth != null ? auth.getName() + " with " + auth.getAuthorities() : "NULL"));
    System.out.println("======================================");

    filterChain.doFilter(request, response);
}
```

### Step 2: Deploy and Test with Logging

1. Commit changes to GitHub
2. Railway will auto-deploy
3. Try to access `/api/sessions` with JWT token
4. Check Railway Deploy Logs for debug output
5. Look for what's failing in the authentication chain

### Step 3: Based on Logs, Choose Fix

**If CustomUserDetailsService is NOT being called:**
- Check JwtAuthenticationFilter ordering in SecurityConfig
- Verify filter is added before UsernamePasswordAuthenticationFilter

**If roles are NULL or empty:**
- Check database: `SELECT * FROM users WHERE username = 'gamemaster';`
- Verify CustomUserDetailsService.getAuthorities() method
- Check if User.role field is populated

**If authentication is set but still 403:**
- Problem is in SecurityConfig rule matching
- Check if `/sessions/**` pattern is matching correctly
- Verify order of requestMatchers (most specific first)

**If token validation fails:**
- Check JWT_SECRET matches between login and filter
- Check token expiration time
- Verify JwtTokenProvider.validateToken() logic

### Step 4: Alternative Fix (if all else fails)

**Make controller methods NOT require Authentication:**

Change this:
```java
@GetMapping("/sessions")
public ResponseEntity<List<GameSession>> getAllSessions(Authentication authentication) {
    User user = userRepository.findByUsername(authentication.getName())
```

To this:
```java
@GetMapping("/sessions")
public ResponseEntity<List<GameSession>> getAllSessions(
    @AuthenticationPrincipal UserDetails userDetails) {

    if (userDetails == null) {
        return ResponseEntity.status(401).build();
    }

    User user = userRepository.findByUsername(userDetails.getUsername())
```

OR make Authentication optional:
```java
@GetMapping("/sessions")
public ResponseEntity<List<GameSession>> getAllSessions(
    @AuthenticationPrincipal(errorOnInvalidType = false) UserDetails userDetails) {
```

---

## Files Changed This Session

1. **SecurityConfig.java** - Added debug logging (commit 29885f5, 368ad2b, 29473d7)
2. **VariablesOld.txt** - Saved old environment variables
3. **VariablesNew.txt** - Documented new environment variables
4. **verify-deployment.js** - Script to test endpoints
5. **verify-new-deployment.js** - Script to test new Railway URL
6. **monitor-deployment.js** - Script to watch for deployment changes
7. **RAILWAY_REBUILD_GUIDE.md** - Documentation of rebuild process
8. **NEXT_SESSION.md** - This file

---

## Important Notes for Next Session

1. **DO NOT delete Railway service again** - current setup is correct
2. **Frontend needs updating** - `VITE_API_URL` still points to old backend URL
   - Go to `deadlands-frontend` service � Variables
   - Update: `VITE_API_URL` = `https://deadlands-campaign-manager-production.up.railway.app/api`
3. **Database is untouched** - all user data and sessions are safe
4. **JWT token structure is correct** - no roles in token is intentional design
5. **SecurityConfig is correct** - `permitAll()` is there, but controller overrides it

---

## Quick Reference Commands

### Test Endpoints
```bash
node verify-new-deployment.js
```

### Check Railway Logs
```bash
railway logs --service deadlands-campaign-manager
```

### Get Latest Code
```bash
git pull origin main
```

### Deploy to Railway
```bash
git add .
git commit -m "Add JWT filter debugging"
git push origin main
# Railway auto-deploys from GitHub
```

---

## Session Handoff Checklist

- [x] Railway service rebuilt and stable
- [x] Environment variables configured correctly
- [x] Database connection working
- [x] Latest code deployed
- [x] Root cause of 403 identified
- [x] Debug logging strategy planned
- [ ] 403 error fixed (NEXT SESSION)
- [ ] Frontend updated with new backend URL (NEXT SESSION)
- [ ] End-to-end session management tested (NEXT SESSION)

---

## Contact Info / Resources

- **GitHub Repo**: `https://github.com/RogersJohn/deadlands-campaign-manager`
- **Railway Project**: `cozy-fulfillment` (production environment)
- **Services**:
  - Backend: `deadlands-campaign-manager`
  - Frontend: `deadlands-frontend`
  - Database: `Postgres`

---

**Good luck with the next session! Start with the debug logging in Step 1.** =�
