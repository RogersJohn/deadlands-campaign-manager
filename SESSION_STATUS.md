# Session Status - Deadlands Campaign Manager

**Last Updated:** 2025-11-04
**Status:** 🚀 DEPLOYED TO RAILWAY (Production)

## Project Overview

Deadlands Campaign Manager - A Spring Boot 3.2.1 + React 18 web application for managing Deadlands Reloaded tabletop RPG campaigns. Successfully deployed to Railway.app for online access.

---

## Session 2025-11-04 (Part 2): Production Deployment to Railway

### Summary
Successfully deployed the Deadlands Campaign Manager to Railway.app cloud platform. Application is now accessible online at production URLs. Resolved numerous deployment challenges including Docker configuration, CORS issues, environment variables, and networking setup.

### Deployment URLs
- **Frontend:** https://deadlands-frontend.up.railway.app
- **Backend:** https://deadlands-campaign-manager-production.up.railway.app/api
- **Database:** PostgreSQL 14 on Railway (private network)

### What We Accomplished

#### 1. ✅ Railway Infrastructure Setup
- Created Railway.app account and linked GitHub repository
- Set up three services:
  - **PostgreSQL** database service (14.x)
  - **Backend** service (Spring Boot with Docker)
  - **Frontend** service (React + Nginx with Docker)
- Configured environment variables across all services
- Generated public domains for frontend and backend

#### 2. ✅ Backend Docker Configuration
**Challenges Resolved:**
- **Issue:** Maven build failing with `-Pproduction` flag not recognized
  - **Fix:** Added production profile to `pom.xml`
- **Issue:** Alpine Maven package too old/incompatible
  - **Fix:** Switched to official `maven:3.9-eclipse-temurin-17` image
- **Issue:** Build failing due to compilation errors
  - **Fix:** Fixed SecurityConfig to use `HttpMethod.OPTIONS` enum instead of string

**Final Configuration:**
```dockerfile
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

#### 3. ✅ Frontend Docker Configuration
**Challenges Resolved:**
- **Issue:** Frontend calling itself instead of backend (405 errors)
  - **Root Cause:** `VITE_API_URL` not baked into build
  - **Fix:** Added build-time ARG/ENV to Dockerfile
- **Issue:** nginx proxy causing 403 errors
  - **Fix:** Removed backend proxy from nginx.conf (Railway uses direct URLs)
- **Issue:** Wrong port configured (3000 vs 80)
  - **Fix:** Verified nginx listens on port 3000, Railway domain set to 3000

**Final Configuration:**
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app

# Accept build argument for API URL
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
```

#### 4. ✅ Database Initialization
**Implemented:**
- Created `DatabaseInitializer.java` that runs on startup in production
- Auto-creates users if database is empty:
  - gamemaster (GAME_MASTER role)
  - player1, player2 (PLAYER roles)
- Uses BCrypt password hashing
- Passwords: All users have password `password` (not `password123` as comments suggested)

**Data Loaded:**
- 6 users created
- 3 characters loaded (Mexicali Bob, Cornelius, Doc Von Braun)
- All character skills, edges, hindrances, equipment, arcane powers

#### 5. ✅ Security Configuration Updates
- Added CORS configuration with environment variable: `CORS_ORIGINS`
- Allowed OPTIONS requests for CORS preflight: `.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()`
- Made portrait endpoint public: `.requestMatchers("/portraits/**").permitAll()`
- Configured JWT authentication with secure 512-bit secret

#### 6. ✅ Environment Variables Configured

**Backend Variables:**
```bash
DATABASE_URL=jdbc:postgresql://${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/${{Postgres.PGDATABASE}}
DATABASE_USERNAME=${{Postgres.PGUSER}}
DATABASE_PASSWORD=${{Postgres.PGPASSWORD}}
JWT_SECRET=UMy/hBg+bJlRgKtugAeh4RGoUg5kIUkzgKFy3dNvXBJq7qS2Kz0gLrb8AKfcArDI0JkOZj44uI1PP1UGYkvNqg==
JWT_EXPIRATION=86400000
SPRING_PROFILES_ACTIVE=production
LOG_LEVEL=INFO
CORS_ORIGINS=https://deadlands-frontend.up.railway.app
```

**Frontend Variables:**
```bash
VITE_API_URL=https://deadlands-campaign-manager-production.up.railway.app/api
```

#### 7. ✅ Networking Configuration
- Backend public domain configured for **port 8080** (Spring Boot)
- Frontend public domain configured for **port 3000** (nginx)
- CORS enabled between frontend and backend domains
- PostgreSQL accessible via Railway private network

#### 8. ✅ Character Portraits Added
- Created `backend/src/main/resources/static/portraits/` directory
- Uploaded character portraits:
  - `mexicali-bob.jpg`
  - `doc-farraday.jpg`
- Updated database with portrait URLs
- Made portraits publicly accessible via Spring Security

#### 9. ✅ Authentication Working
- Login system fully functional
- JWT tokens generated and stored
- Password change feature working (with show/hide toggles)
- Role-based access control:
  - **GAME_MASTER** can see all characters
  - **PLAYER** can see only their own characters

### Files Created This Session

**Backend:**
- `backend/src/main/java/com/deadlands/campaign/config/DatabaseInitializer.java`
- `backend/src/main/java/com/deadlands/campaign/config/ReferenceDataInitializer.java` (disabled due to memory)
- `init-production-db.sql` (manual database script)
- `load-characters-railway.sql` (manual database script)

**Documentation:**
- `DEPLOYMENT.md` (comprehensive deployment guide)
- `PRE_DEPLOYMENT_TESTS.md` (testing checklist)
- `SECURITY_IMPROVEMENTS.md` (security audit)

### Files Modified This Session

**Backend:**
- `backend/pom.xml` - Added production profile
- `backend/Dockerfile` - Fixed Maven image, added production support
- `backend/src/main/resources/application-production.yml` - Database initialization settings
- `backend/src/main/java/com/deadlands/campaign/config/SecurityConfig.java` - CORS, OPTIONS, portraits
- `backend/src/main/resources/static/portraits/` - Added portrait images

**Frontend:**
- `frontend/Dockerfile` - Added build-time VITE_API_URL support
- `frontend/nginx.conf` - Removed backend proxy (Railway uses direct URLs)
- `frontend/src/services/api.ts` - Fixed to use VITE_API_URL from environment

### Technical Challenges Resolved

1. **Maven Build Failures**
   - Missing production profile → Added to pom.xml
   - Wrong Maven version → Switched to official Maven Docker image
   - Compilation errors → Fixed HttpMethod import and enum usage

2. **CORS Errors (The Long Battle)**
   - 403 Forbidden → Added OPTIONS permitAll
   - 405 Method Not Allowed → Fixed frontend API URL
   - No Access-Control headers → Set CORS_ORIGINS variable
   - Preflight failures → Multiple iterations to get right

3. **502 Bad Gateway Errors**
   - Wrong port (3000 vs 8080) → Set backend domain to port 8080
   - Backend crashing → Multiple fixes and redeplooys
   - Environment variables not loaded → Configured before deploy

4. **Frontend Not Calling Backend**
   - Relative URL `/api` → Changed to use VITE_API_URL
   - Build-time vs runtime variables → Added ARG/ENV to Dockerfile
   - nginx proxy interfering → Removed proxy, use direct URLs

5. **Password Mismatch**
   - Assumed password was `password123` → Actually `password`
   - BCrypt hash in data.sql was for "password" not "password123"

6. **Memory Errors**
   - ReferenceDataInitializer OOM → Disabled component (@Profile("disabled"))
   - Loading entire SQL file → Too memory intensive for Railway free tier

7. **Character Visibility**
   - Characters exist but not showing → 502 errors preventing API calls
   - Need to debug `/api/characters` endpoint

### Current Status

**✅ Working:**
- Login system (gamemaster / password, player1 / password, etc.)
- Password change feature
- JWT authentication
- Frontend deployment
- Backend deployment
- Database deployment
- Environment variables
- CORS configuration (mostly)
- Portrait images accessible
- User creation on startup
- Character data loaded in database

**❌ Not Working / Issues:**
- **Characters not displaying** - Backend returns 502 when accessing `/api/characters`
  - Backend logs show "Started CampaignManagerApplication" successfully
  - No obvious errors in logs
  - `/api/characters` endpoint returning 502 Bad Gateway
  - CORS error is symptom, not root cause
- **Reference data not loaded** - Disabled ReferenceDataInitializer due to memory issues
  - Tooltips will not work until reference data loaded manually
  - Need alternative approach (smaller batches, or manual SQL)

### Known Issues for Next Session

#### PRIORITY 1: Fix Character Endpoint 502 Error
**Problem:** Backend successfully starts but crashes/fails when `/api/characters` is called
**Symptoms:**
- Backend logs show successful startup
- GET request to `/api/characters` returns 502 Bad Gateway
- CORS error appears but is secondary to 502
- No obvious exceptions in Railway logs

**Debugging Steps for Next Session:**
1. Check Railway backend logs during `/api/characters` request
2. Look for database query errors or timeouts
3. Check if CharacterRepository methods work in production
4. Verify database connection pool settings
5. Test with direct database query to check data integrity
6. Consider if JOIN queries are causing issues
7. Check if Railway database is timing out

**Potential Causes:**
- Database query timeout on Railway
- JOIN query too complex for Railway's free tier
- Missing database indexes causing slow queries
- Character relationships not loading properly
- Connection pool exhausted

#### PRIORITY 2: Load Reference Data
**Problem:** ReferenceDataInitializer caused memory issues
**Solution Options:**
1. Load reference data in smaller batches
2. Use Railway CLI to connect and run SQL manually
3. Create a one-time API endpoint to load data
4. Pre-load data during Docker build (not runtime)
5. Use Railway's Data tab if/when SQL console becomes available

#### PRIORITY 3: Test Full User Flow
Once characters are visible:
1. Log in as gamemaster - verify sees all 3 characters
2. Log in as player1 - verify sees only Mexicali Bob
3. Log in as player2 - verify sees only Cornelius
4. Test character sheet display
5. Test portrait display
6. Test tooltips (will fail until reference data loaded)
7. Test password change
8. Test navigation

### Login Credentials (Production)

All users have password: **`password`**

- **gamemaster** - GAME_MASTER role, should see all characters
- **player1** - PLAYER role, owns Mexicali Bob (character ID 1)
- **player2** - PLAYER role, owns Cornelius (character ID 2)
- **player3** - PLAYER role, owns Doc Von Braun (character ID 3)
- **player4, player5** - PLAYER roles, no characters

### Architecture Notes for Next Session

**Character Ownership:**
- Backend already implements correct logic in CharacterController.java:
  - GAME_MASTER sees all characters via `findAllWithRelationships()`
  - PLAYER sees only their characters via `findByPlayerIdWithRelationships(user.getId())`
- This is correct behavior - no code changes needed
- Issue is that endpoint is crashing before returning data

**Database Structure:**
- Characters table has `player_id` foreign key to users table
- Character relationships loaded via JPA `@OneToMany` annotations
- Possible that eager loading of relationships is causing issues

**Railway Constraints:**
- Free tier has memory limits
- May have query timeout limits
- Connection pooling might need tuning for Railway

---

## Session 2025-11-04 (Part 1): Reference Data System Implementation

### Summary
Implemented a comprehensive reference data system that extracts information from Deadlands sourcebooks and displays it via tooltips on character sheets. This provides players and GMs with instant access to official rule descriptions without leaving the character sheet.

### What We Accomplished

#### 1. ✅ Created Reference Data Tables
- **New Database Tables:**
  - `skill_references` - 60+ canonical skill definitions
  - `edge_references` - Canonical edge definitions with requirements
  - `hindrance_references` - Canonical hindrance definitions with game effects
  - `equipment_references` - Weapons, armor, and gear with stats
  - `arcane_power_references` - Spell/power definitions with mechanics

- **Data Source:** Extracted from Deadlands Reloaded Player's Guide PDF
- **Content:** Includes both classic Deadlands and Savage Worlds skill names

#### 2. ✅ Tabbed Character Sheet UI
Completely redesigned character sheet with Material-UI tabs:
- **Tab 1 (Overview):** Portrait, name, archetype, attributes, derived stats
- **Tab 2 (Skills):** All skills as cards
- **Tab 3 (Edges & Hindrances):** Split into two columns
- **Tab 4 (Equipment):** Equipment as cards
- **Tab 5 (Arcane Powers):** Powers as cards

All tooltips preserved and working across tabs.

---

## Quick Reference for Next Session

### Access Points
- **Production Frontend:** https://deadlands-frontend.up.railway.app
- **Production Backend:** https://deadlands-campaign-manager-production.up.railway.app/api
- **Local Frontend:** http://localhost:3000
- **Local Backend:** http://localhost:8080/api

### Railway CLI Commands
```bash
# Login to Railway (opens browser)
railway login

# Link to project
railway link

# View logs
railway logs

# Connect to PostgreSQL
railway connect Postgres
```

### Useful Debugging Commands
```bash
# Test backend health
curl https://deadlands-campaign-manager-production.up.railway.app/api/reference/attributes

# Test with authentication
curl -X POST https://deadlands-campaign-manager-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"gamemaster","password":"password"}'

# Check character endpoint (will likely fail with 502)
curl https://deadlands-campaign-manager-production.up.railway.app/api/characters \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Next Session Priorities

### CRITICAL - Must Fix First
1. **Debug and fix `/api/characters` 502 error**
   - Check Railway backend logs during request
   - Look for database query issues
   - Test with simplified query (no JOINs)
   - Consider connection pool settings
   - May need to optimize CharacterRepository queries

### High Priority - After Characters Working
2. **Load reference data into production database**
   - Try Railway CLI with smaller SQL batches
   - Or create temporary admin API endpoint
   - Or modify Dockerfile to pre-load during build

3. **Test complete user flows**
   - All 3 character types visible
   - Character sheets display correctly
   - Portraits showing
   - Role-based access working

### Medium Priority - Polish
4. **Update CHANGELOG.md** with deployment milestone
5. **Test password change** in production
6. **Verify all tooltips work** (after reference data loaded)

### Low Priority - Future
7. **Consider upgrading Railway plan** if memory/performance insufficient
8. **Add health check endpoints** for monitoring
9. **Set up automatic backups** for production database

---

## Important Context for Debugging

### Character Endpoint Structure
```
GET /api/characters
Authorization: Bearer <JWT>

Expected Response:
[
  {
    "id": 1,
    "name": "Mexicali Bob",
    "occupation": "Apprentice Shaman",
    "player": { "id": 2, "username": "player1" },
    "skills": [...],
    "edges": [...],
    "hindrances": [...],
    "equipment": [...],
    "arcanePowers": [...]
  },
  ...
]
```

### Potential Query Issues
The repository method `findAllWithRelationships()` uses JPA to fetch:
- Character entity
- Associated User (player)
- All Skills (via @OneToMany)
- All Edges (via @OneToMany)
- All Hindrances (via @OneToMany)
- All Equipment (via @OneToMany)
- All ArcanePowers (via @OneToMany)

This could be causing:
- N+1 query problem
- Memory exhaustion
- Query timeout
- Connection pool exhaustion

**Solution ideas:**
- Add `@BatchSize` annotation
- Use explicit JOIN FETCH
- Implement pagination
- Use DTOs to reduce data transfer
- Add database indexes

---

## Session Metrics - Deployment Session

- **Duration:** ~6 hours
- **Services Deployed:** 3 (Database, Backend, Frontend)
- **Files Modified:** 8
- **Files Created:** 6
- **Docker Images Built:** 10+ (multiple iterations)
- **Railway Deployments:** 15+ (troubleshooting iterations)
- **Issues Resolved:** 7 major, 10+ minor
- **Issues Remaining:** 2 (character endpoint, reference data)

---

**Status:** 🚀 **DEPLOYED** but characters endpoint returning 502
**Next Session Focus:** Debug and fix `/api/characters` endpoint, then load reference data
**Deployment:** https://deadlands-frontend.up.railway.app (✅ Frontend working, ⚠️ Backend partial)
