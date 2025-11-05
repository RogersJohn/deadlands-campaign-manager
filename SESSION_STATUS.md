# Session Status - Deadlands Campaign Manager

**Last Updated:** 2025-11-05
**Status:** 🚀 DEPLOYED TO RAILWAY (Production) - Alpha Ready

## Project Overview

Deadlands Campaign Manager - A Spring Boot 3.2.1 + React 18 web application for managing Deadlands Reloaded tabletop RPG campaigns. Successfully deployed to Railway.app for online access.

---

## Session 2025-11-05: Character Creation Wizard & UI Enhancements

### Summary
Completed comprehensive character creation wizard with full game mechanics support (skills, edges, hindrances, equipment, arcane powers). Implemented Savage Worlds derived statistics auto-calculation. Fixed critical authentication bug preventing character creation. Overhauled UI theme for better legibility and Western aesthetic.

### What We Accomplished

#### 1. ✅ Expanded Character Creation Wizard (4 → 9 Steps)
**Created comprehensive multi-step character creation wizard:**

**Step 1 - Basic Info:**
- Name, occupation (now dropdown), experience level
- Avatar selection
- Player notes

**Step 2 - Attributes:**
- 5 core Savage Worlds attributes (Agility, Smarts, Spirit, Strength, Vigor)
- Die value selection (d4 through d12+)

**Step 3 - Skills:**
- Browse 63 skills organized by linked attribute (Agility, Smarts, etc.)
- Accordion UI for easy browsing by category
- Chip-based selection with visual feedback
- Core skills highlighted in primary color
- Table view of selected skills with inline die value editing
- Skill removal capability

**Step 4 - Edges:**
- Browse 79 edges organized by type (Background, Combat, Leadership, Power, Professional, Social, Weird)
- Accordion UI with descriptions
- Tooltip showing requirements, rank, and effects
- Card-based selection display

**Step 5 - Hindrances:**
- Browse 54 hindrances organized by severity (Major, Minor)
- Accordion UI with game effect descriptions
- Visual distinction between Major and Minor hindrances

**Step 6 - Equipment:**
- Browse 53 equipment items organized by type (Weapons, Armor, Gear)
- Accordion UI showing stats (damage, range, AP, weight)
- Quantity controls for stackable items
- Table view with inline quantity editing

**Step 7 - Arcane Powers:**
- Browse 17 arcane powers (for Blessed, Huckster, Shaman, Mad Scientist)
- View power points, range, duration, and effects
- Conditional display (only for arcane backgrounds)

**Step 8 - Derived Stats:**
- Auto-calculated Pace (usually 6)
- Size modifier input
- Grit level (for Deadlands setting)

**Step 9 - Review:**
- Complete character summary before submission
- All selections visible for final check
- Displays calculated Parry, Toughness, Charisma

**Files Created:**
- `frontend/src/services/referenceService.ts` - TypeScript interfaces and API calls for reference data

**Files Modified:**
- `frontend/src/pages/CharacterCreate.tsx` - Expanded from 4 to 9 steps, added selection UIs
- `frontend/src/services/characterService.ts` - Updated Character interface with nested entities

#### 2. ✅ Occupation Standardization
**Changed occupation from free-text to dropdown with 80+ authentic Deadlands archetypes:**

**Arcane Backgrounds:**
- Blessed, Huckster, Mad Scientist, Shaman, Chi Master, Enlightened, Voodooist, Hexslinger

**Combat Roles:**
- Gunslinger, Shootist, Duelist, Bounty Hunter, Hired Gun, Soldier, Scout, Ranger

**Law Enforcement:**
- Lawman, Texas Ranger, U.S. Marshal, Pinkerton Agent, Railroad Detective

**Military:**
- Cavalry Officer, Infantry Soldier, Veteran, Confederate Soldier, Union Soldier

**Social/Professional:**
- Gambler, Con Artist, Saloon Girl, Prospector, Inventor, Doctor, Undertaker, Photographer

**Frontier Workers:**
- Cowboy, Ranch Hand, Trail Boss, Cattle Rustler, Horse Thief, Stage Coach Driver

**And 50+ more archetypes...**

**Benefits:**
- Ensures data consistency
- Provides guidance to players
- Authentic to Deadlands setting

#### 3. ✅ Derived Statistics Implementation
**Implemented Savage Worlds auto-calculation for Parry, Toughness, and Charisma:**

**Backend Changes:**
- Added `parry`, `toughness`, `charisma` columns to `characters` table
- Modified `Character.java` entity with new fields:
  - `parry` (Integer, default 2) - Base 2 + Fighting skill / 2
  - `toughness` (Integer, default 2) - Base 2 + Vigor / 2 + Armor
  - `charisma` (Integer, default 0) - Modifiers from edges/hindrances

**Database Migration:**
- Created `add-derived-stats.sql` migration script
- Added columns with defaults
- Backfilled existing 8 characters with calculated values:
  - Parry calculated from Fighting skill die value
  - Toughness calculated from Vigor die value
  - Charisma set to 0 (no edge/hindrance modifiers detected)

**Frontend Utilities:**
- Created `frontend/src/utils/derivedStats.ts` with calculation functions:
  - `dieToNumber()` - Converts d4/d6/d8/d10/d12 to numeric values
  - `calculateParry()` - 2 + (Fighting skill die / 2)
  - `calculateToughness()` - 2 + (Vigor die / 2) + armor bonus
  - `calculateCharisma()` - Sum of edge/hindrance modifiers (Attractive, Ugly, etc.)
  - `calculateAllDerivedStats()` - Convenience wrapper

**Integration:**
- Character creation automatically calculates before submission
- Character sheet displays all 6 derived stats (Pace, Parry, Toughness, Charisma, Grit, Size)
- Review step shows calculated values

**Files Created:**
- `frontend/src/utils/derivedStats.ts` - Calculation utilities

**Files Modified:**
- `backend/src/main/java/com/deadlands/campaign/model/Character.java` - Added derived stat fields
- `backend/src/main/resources/db/migration/add-derived-stats.sql` - Database migration
- `frontend/src/pages/CharacterCreate.tsx` - Integration of calculations
- `frontend/src/pages/CharacterSheet.tsx` - Display of derived stats

#### 4. ✅ Fixed 403 Error on Character Creation
**Critical Bug Fix: Character creation returning 403 Forbidden**

**Root Cause:**
- Spring Security FilterChain runs BEFORE servlet context path is applied
- SecurityConfig had path matchers with `/api` prefix (e.g., `/api/characters`)
- Servlet adds `/api` context path AFTER security filtering
- Security only saw `/characters`, not `/api/characters` → denied access

**Solution:**
- Removed `/api` prefix from ALL security matchers
- Made matchers HTTP method-specific for granular control
- Verified OPTIONS requests allowed for CORS preflight

**Before (incorrect):**
```java
.requestMatchers("/api/characters/**").hasAnyRole("PLAYER", "GAME_MASTER")
```

**After (correct):**
```java
.requestMatchers(HttpMethod.GET, "/characters", "/characters/**").hasAnyRole("PLAYER", "GAME_MASTER")
.requestMatchers(HttpMethod.POST, "/characters").hasAnyRole("PLAYER", "GAME_MASTER")
.requestMatchers(HttpMethod.PUT, "/characters/**").hasAnyRole("PLAYER", "GAME_MASTER")
.requestMatchers(HttpMethod.DELETE, "/characters/**").hasRole("GAME_MASTER")
```

**Impact:**
- Character creation now works for PLAYER and GAME_MASTER roles
- All character endpoints properly secured by role and HTTP method

**Files Modified:**
- `backend/src/main/java/com/deadlands/campaign/config/SecurityConfig.java`

#### 5. ✅ UI Theme Overhaul - Western Aesthetic & Legibility
**Addressed user feedback: "orange on brown is very poor legibility" and "western cowboy font" request**

**Color Palette Redesign:**
- **Primary Color:** Changed from Saddle Brown (#8B4513) to Cream/Tan (#D4C5A9, #E8DCC4)
  - High contrast on dark backgrounds
  - Better readability
- **Secondary Color:** Changed from Goldenrod (#DAA520) to Bright Gold (#FFD700)
  - Western accent color
  - Visible and vibrant
- **Background Colors:**
  - Default: Very Dark Brown (#1a1410)
  - Paper: Dark Brown (#2d2419)
- **Text Colors:**
  - Primary: Cream (#E8DCC4) - high contrast on dark brown
  - Secondary: Muted Tan (#B8A888) - for secondary text
- **Semantic Colors Enhanced:**
  - Error: Brighter Red (#DC3545) for visibility
  - Success: Muted Green (#5C8A3A)
  - Warning: Orange (#FFA726)
  - Info: Dusty Blue (#5A9BD5)

**Western Font Integration:**
- **Added Google Fonts:**
  - "Rye" - Ornate Western saloon-style font
  - "Special Elite" - Typewriter Western font
- **Typography Hierarchy:**
  - **h1, h2:** Rye font, Gold color (#FFD700), letter-spacing 0.05em
  - **h3:** Rye font, Cream color (#E8DCC4), letter-spacing 0.03em
  - **h4:** Special Elite font, Cream color, letter-spacing 0.02em
  - **h5, h6:** Special Elite font, Tan color (#D4C5A9), bold weight
  - **Buttons:** Special Elite font, uppercase, bold, letter-spacing 0.05em
- **Result:** Headers look like old Western wanted posters and saloon signs

**Component Style Enhancements:**
- **Buttons:**
  - Uppercase text transform
  - Enhanced shadow depth (0 4px 6px on default, 0 6px 8px on hover)
  - Border radius 8px
- **Cards:**
  - Border radius 12px
  - Subtle cream border (rgba(212, 197, 169, 0.12))
  - No background gradient
- **Chips:**
  - Bold font weight
  - Custom filled style with dark brown background (#3d342a)
- **Tables:**
  - Cream-colored borders for better definition

**Files Modified:**
- `frontend/src/theme.ts` - Complete palette and typography overhaul
- `frontend/index.html` - Added Google Fonts preconnect and stylesheet links

**User Impact:**
- Much better text legibility throughout app
- Authentic Wild West aesthetic
- Professional appearance while maintaining theme

#### 6. ✅ Committed and Deployed
**All changes committed to GitHub and auto-deployed to Railway:**
- Theme changes live in production
- Character creation wizard functional
- Derived stats calculating correctly
- Western fonts loaded and applied

### Files Created This Session
1. `frontend/src/services/referenceService.ts` - Reference data TypeScript interfaces and API service
2. `frontend/src/utils/derivedStats.ts` - Savage Worlds derived stat calculations
3. `backend/src/main/resources/db/migration/add-derived-stats.sql` - Database migration for derived stats

### Files Modified This Session
1. `frontend/src/pages/CharacterCreate.tsx` - Expanded to 9-step wizard with full game mechanics
2. `frontend/src/pages/CharacterSheet.tsx` - Display all derived stats
3. `frontend/src/services/characterService.ts` - Updated Character interface
4. `backend/src/main/java/com/deadlands/campaign/model/Character.java` - Added derived stat fields
5. `backend/src/main/java/com/deadlands/campaign/config/SecurityConfig.java` - Fixed path matchers (removed /api prefix)
6. `frontend/src/theme.ts` - Complete color palette and typography overhaul
7. `frontend/index.html` - Added Western Google Fonts

### Technical Challenges Resolved

**Challenge 1: SQL Die Value Conversion**
- **Problem:** Migration script attempted to parse die notation strings (like "d8", "1d8") directly to integers
- **Error:** `invalid input syntax for type integer: "d8"`
- **Solution:** Used CASE statements with pattern matching instead of SUBSTRING/CAST
```sql
CASE
    WHEN vigor_die LIKE '%d4' THEN 2
    WHEN vigor_die LIKE '%d6' THEN 3
    WHEN vigor_die LIKE '%d8' THEN 4
    WHEN vigor_die LIKE '%d10' THEN 5
    WHEN vigor_die LIKE '%d12' THEN 6
    ELSE 2
END
```

**Challenge 2: Spring Security Path Matching**
- **Problem:** 403 Forbidden on POST /api/characters despite correct role
- **Root Cause:** Security FilterChain runs before context path, saw `/characters` not `/api/characters`
- **Solution:** Removed `/api` prefix from all security matchers, made HTTP method-specific

**Challenge 3: Poor UI Contrast**
- **Problem:** Orange/goldenrod on brown backgrounds hard to read
- **Solution:** Complete palette overhaul to cream/tan with bright gold accents

### Current Status

**✅ Fully Working:**
- Character creation wizard (all 9 steps)
- Skills, edges, hindrances, equipment, arcane powers selection
- Occupation dropdown with 80+ archetypes
- Derived statistics auto-calculation
- Database migration with backfilled data
- Character sheet display with all stats
- Western-themed UI with high contrast
- Google Fonts integration (Rye, Special Elite)
- Authentication and authorization
- Production deployment on Railway

**✅ Production URLs:**
- Frontend: https://deadlands-frontend.up.railway.app
- Backend: https://deadlands-campaign-manager-production.up.railway.app/api

**✅ Test Accounts:**
All passwords: `password`
- gamemaster - GAME_MASTER role
- player1, player2, player3 - PLAYER roles

### Known Limitations

**Character Creation:**
- No point-buy validation yet (skills: 15pts, edges: limits based on hindrances, hindrances: max 4pts)
- No hindrance point conversion system (2pts → +1 edge, +1 attribute, +skill point, or +$500)
- No equipment budget tracking ($500 starting funds + bonuses)
- No validation warnings when limits exceeded

**Character Editing:**
- Characters can be created but not edited after creation (NEXT SESSION PRIORITY)
- No inline editing on character sheets
- No "Edit" button on character sheet page

**Derived Stats:**
- Armor bonus not yet factored into Toughness (needs equipment analysis)
- Edge/hindrance modifiers for Charisma need expansion (only Attractive/Ugly currently)
- Parry bonuses from shields not implemented

---

## Next Session Plan - 2025-11-06

### PRIMARY GOAL: Character Editing for Owners

**User Priority:** "For the gamemaster and the players to be able to edit all characters for which they have ownership"

#### Ownership Rules
**Game Master:**
- Can edit ALL characters regardless of owner
- Full CRUD permissions

**Players:**
- Can edit ONLY their own characters (where character.player_id = user.id)
- Cannot edit other players' characters
- Cannot delete characters (only GM)

#### Implementation Plan

**Phase 1: Backend Permission Verification (15 min)**
- ✅ Review existing authorization in CharacterController.java
- ✅ Verify SecurityConfig allows PUT requests for character owners
- ✅ Add ownership check in service layer
- ✅ Test authorization with different user roles

**Phase 2: Character Update Endpoint Enhancement (30 min)**
- Update CharacterService to handle full character updates
- Support updating nested entities (skills, edges, hindrances, equipment, powers)
- Implement cascade updates for related entities
- Handle orphan removal for deleted nested items
- Add validation for derived stats recalculation

**Phase 3: Frontend Edit Mode UI (60 min)**
- Add "Edit Character" button to CharacterSheet.tsx (only for owners)
- Create edit mode state toggle
- Convert character sheet sections to editable forms
- Implement inline editing for:
  - Basic info (name, occupation, experience)
  - Attributes (die value selectors)
  - Skills (add/remove, change die values)
  - Edges (add/remove)
  - Hindrances (add/remove)
  - Equipment (add/remove, change quantities)
  - Arcane Powers (add/remove)
  - Derived stats (auto-recalculate on change)
- Add "Save" and "Cancel" buttons
- Show loading state during save
- Display success/error messages

**Phase 4: Reuse CharacterCreate Components (45 min)**
- Extract skill/edge/hindrance/equipment selection UI into reusable components
- Move to `frontend/src/components/character/` directory:
  - `SkillSelector.tsx`
  - `EdgeSelector.tsx`
  - `HindranceSelector.tsx`
  - `EquipmentSelector.tsx`
  - `ArcanePowerSelector.tsx`
- Use these components in both CharacterCreate and CharacterSheet edit mode
- Maintain consistent UX between creation and editing

**Phase 5: Validation & Auto-Calculation (30 min)**
- Re-run derived stats calculation on every attribute/skill change
- Update Parry when Fighting skill changes
- Update Toughness when Vigor changes
- Update Charisma when edges/hindrances change
- Show real-time stat updates in edit mode
- Validate die values (d4 through d12+)

**Phase 6: Testing (30 min)**
- Test as GAME_MASTER - verify can edit all characters
- Test as PLAYER - verify can only edit own characters
- Test editing each character section
- Test adding and removing nested items
- Test derived stats recalculation
- Test save/cancel functionality
- Test error handling (network errors, validation errors)
- Verify changes persist after page reload

**Phase 7: Authorization Edge Cases (15 min)**
- Verify player cannot edit another player's character (403 error)
- Verify unauthenticated user cannot edit (401 error)
- Verify character ownership displayed in UI
- Add ownership indicator ("Your Character" vs "Player: username")

#### Expected Deliverables

**Backend:**
- Enhanced PUT /api/characters/{id} endpoint
- Ownership validation in service layer
- Cascade update support for nested entities
- Derived stats recalculation on update

**Frontend:**
- Edit mode toggle on CharacterSheet
- Reusable selection components
- Inline editing UI for all character sections
- Real-time derived stats updates
- Save/cancel functionality
- Proper authorization checks

**Testing:**
- All edit scenarios tested
- Ownership rules verified
- Derived stats recalculating correctly

#### Estimated Time: 3-4 hours

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
