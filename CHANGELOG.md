# Changelog

All notable changes to the Deadlands Campaign Manager will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Production Deployment Verification (2025-11-11)
**Status:** ✅ Both services successfully deployed and running

#### Verified
- Frontend service deployed at https://deadlands-frontend-production.up.railway.app
- Backend service deployed at https://deadlands-campaign-manager-production-053e.up.railway.app/api
- Database connection verified (11 migrated users, 63 skill references)
- Spring Boot application running with production profile
- nginx serving React application successfully

#### Pending
- End-to-end user authentication testing
- Character data verification in production
- Game Arena v1.0 feature testing in production
- Character portrait URL validation

### Game Arena v1.0 - Ready for Deployment (2025-11-10)
**Status:** ✅ Ready for production deployment

#### Added
- **Movement Budget System**
  - Characters have limited movement per turn based on Pace (typically 6 squares)
  - Real-time movement tracking with visual feedback
  - Movement budget resets at start of each player turn
  - Chebyshev distance calculation (diagonals count as 1 square)
  - Movement budget display in HUD with progress bar showing X/Y squares
  - Blue progress bar (gray when depleted)

- **Sprint Action**
  - "Run" action allows sprinting for Pace + d6 movement
  - Automatically rolls d6 and updates movement budget
  - Consumes action for the turn
  - Results logged in combat log with roll details
  - Location: `ArenaScene.ts:1000-1036`

- **Parry Rules (Savage Worlds Compliance)**
  - Correct implementation of ranged attack parry rules per Savage Worlds rulebook
  - **Melee attacks:** Always use target's Parry
  - **Ranged attacks in melee range (≤1 square):** Use target's Parry
  - **Ranged attacks beyond melee range (>1 square):** Use TN 4
  - Proper skill selection (Fighting vs Shooting/Throwing)
  - Accurate combat log messages distinguishing "vs TN 4" and "vs Parry X"
  - Attack info tooltips show appropriate target text

- **Range Display Toggles**
  - Independent radio button toggles for weapon ranges and movement ranges
  - **Weapon Ranges Toggle:** Show/hide color-coded weapon range indicators (green/orange/red)
  - **Movement Ranges Toggle:** Show/hide blue movement range indicators
  - Toggles grouped in single "Range Display Toggles" panel
  - Real-time visual feedback on grid
  - Location: `GameArena.tsx:423-468`

- **Combat Action Tooltips**
  - Hover tooltips on all 21 combat action dropdown items
  - 1-second delay before tooltip appears (prevents accidental triggers)
  - Displays full action description
  - Shows modifiers in orange text (e.g., "+2 attack/damage, -2 Parry")
  - Also available for arcane powers dropdown
  - Styled to match Deadlands theme (dark brown background, brown border)
  - Location: `ActionMenu.tsx:283-327`

#### Testing
- **Test Infrastructure Setup Complete:**
  - Installed Vitest, React Testing Library, and jsdom
  - Created `vitest.config.ts` and test setup file
  - Added test scripts to package.json (`npm test`, `npm test:ui`, `npm test:coverage`)
  - **All 36 tests passing** ✅
- **Created 3 comprehensive test files:**
  - `MovementBudget.test.ts` - 14 tests covering initialization, deduction, sprint action, validation
  - `ParryRules.test.ts` - 13 tests covering melee range detection, target calculation, weapon types
  - `ActionMenu.test.tsx` - 9 UI component tests for tooltips, arcane powers, rendering
- **Build Verification:**
  - Frontend build successful (`npm run build`) ✅
  - Production bundle size: 2.3 MB (591 KB gzipped)

#### Documentation
- **Created comprehensive documentation:**
  - `GAME_ARENA_V1.md` - Complete feature documentation with implementation details
  - `DEPLOYMENT_GUIDE.md` - Step-by-step deployment process with lessons learned from previous deployments
  - Updated `next_session.md` with deployment checklist and rollback plan

#### Technical
- Event-based communication between React and Phaser for all new features
- Movement budget events: `movementBudgetUpdate`
- Range toggle events: `weaponRangesToggle`, `movementRangesToggle`
- State management across React (UI) and Phaser (game logic)

#### Changed
- Combat system now enforces correct Savage Worlds parry rules
- Movement range display now respects toggle state
- Attack info popups show appropriate target text (TN vs Parry)
- Action menu dropdown enhanced with detailed tooltips

#### Fixed
- Parry incorrectly applied to all ranged attacks (was not checking melee range)
- Movement not limited by character's Pace value
- No visual distinction between weapon and movement ranges
- No way to hide range indicators when they clutter the view

### Planned (Future Versions)
- Character editing for owners
- Character deletion with authorization
- Interactive dropdown menus for character editing
- Point-buy validation system (skills: 15pts, edges/hindrances limits)
- Hindrance point conversion (2pts → +1 edge, +1 attribute, +skill, +$500)
- Equipment budget tracking ($500 starting funds)
- Campaign management features (sessions, notes, tracking)
- Advanced AI enemy tactics (v1.1)
- Full implementation of all 21 combat actions (v1.1)
- Arcane power effects system (v1.1)
- Save/resume combat state (v1.1)

## [1.3.1] - 2025-11-08 - DEPLOYMENT STABILIZATION

### Fixed
- **Critical:** Recovered from deployment failures caused by configuration changes
- Reverted to Docker-based deployment (stable and reliable)
- Restored frontend service name to `deadlands-frontend` (preserving user URLs)
- Fixed CORS configuration for frontend authentication
- Resolved package-lock.json conflicts from serve package

### Changed
- Restored all Docker and Railway configuration files
  - `backend/Dockerfile` - Maven multi-stage build
  - `frontend/Dockerfile` - Node + nginx multi-stage build
  - `frontend/nginx.conf` - SPA routing configuration
  - `railway.json` and `railway.toml` - Build configuration
- Removed `serve` package from frontend (using nginx in Docker instead)
- Updated `.gitignore` to exclude screenshot files

### Infrastructure
- **Git Tag:** `stable-deployment-2025-11-08` created for recovery point
- All Railway services verified operational:
  - PostgreSQL database (11 users, 63 skill references)
  - Spring Boot backend API (Java 17, port 8080)
  - React frontend (nginx, port 3000)
- Production URLs stable and accessible
- Documented complete Railway configuration

### Lessons Learned
- Always create git tags before infrastructure changes
- Never make multiple deployment config changes simultaneously
- Docker approach more stable than auto-detection for production
- Service naming affects user-shared URLs

### Documentation
- Created comprehensive session summary: `docs/SESSION_2025-11-08_DEPLOYMENT_STABILIZATION.md`
- Documented all Railway service configurations
- Recorded default user accounts and credentials
- Established safe deployment workflow for future changes

## [1.3.0] - 2025-11-07

### Added

#### Character Equipment Distribution
- Added comprehensive starting equipment for all 7 player characters
- Period-appropriate weapons for Deadlands setting:
  - **Spencer Repeater Rifle** (2d8 damage, 20" range, 7 shots) - Primary long gun
  - **Colt 1860 Army** (.44 percussion revolver, 2d6+1 damage, 12" range, 6 shots)
  - **Bowie Knife** (STR+1d6 damage) - Close combat weapon
- Ammunition stores (100 rounds each type)
- Complete horse tack and gear (saddle, bridle, saddlebags)
- Frontier survival equipment (bedroll, canteen, matches, coffee pot)
- Tools and rope (50ft lariat, basic tool kit)
- Trail rations (1 week supply)
- Equipment intelligently skipped for characters with existing similar items

### Changed

#### Documentation Reorganization
- Restructured entire documentation system into organized folders:
  - **docs/setup/** - Setup and deployment guides
  - **docs/development/** - Development plans and technical docs
  - **docs/sessions/** - Session summaries and planning
  - **docs/archive/** - Completed/obsolete documentation
- Moved 12 completed documents to archive
- Updated README.md with new documentation structure
- Added Documentation section to README with clear navigation
- Updated Development Roadmap with completed features (wiki, mobile UI)
- Fixed broken documentation links

#### Character Data Cleanup
- Removed artifact notes from Jack Horner character
- Cleaned up meaningless reference data

### Fixed

#### Mobile Tab Navigation
- Fixed character sheet tabs not scrolling on mobile devices
- Added `variant="scrollable"` to MUI Tabs component
- Added `scrollButtons="auto"` for navigation arrows
- Added `allowScrollButtonsMobile` for mobile support
- Users can now navigate back to Overview tab from any tab on mobile

#### Railway Frontend Build
- Created `railway.json` and `railway.toml` configuration files
- Specified correct Dockerfile path for monorepo structure
- Fixed "failed to read dockerfile" error on Railway deployment
- Documented troubleshooting steps in archived RAILWAY_BUILD_FIX.md

### Documentation
- Created comprehensive session documentation system
- Archived 12 completed documentation files
- Organized 7 session-specific documents
- Moved 4 development planning documents
- Moved 3 setup/deployment guides
- Updated README.md with documentation navigation
- Updated CHANGELOG.md with session 2025-11-07 details

### Technical Details

**Equipment Loading:**
- Created `add_equipment.js` script for bulk equipment distribution
- Smart duplicate detection to avoid overwriting existing items
- Period-appropriate weapon stats from Deadlands Reloaded
- Equipment types: WEAPON_MELEE, WEAPON_RANGED, AMMUNITION, GEAR, CONSUMABLE

**Mobile Tab Fix:**
```tsx
<Tabs
  value={currentTab}
  onChange={handleTabChange}
  variant="scrollable"           // Added
  scrollButtons="auto"            // Added
  allowScrollButtonsMobile        // Added
>
```

**Files Modified:**
- `frontend/src/pages/CharacterSheet.tsx` (mobile tabs)
- `railway.json` (new)
- `railway.toml` (new)
- Database: `equipment` table (113 new items across 7 characters)
- Database: `characters` table (removed artifact notes from Jack Horner)
- Reorganized 29 markdown documentation files

## [1.2.1] - 2025-11-06

### Fixed

#### Wiki Visibility Issue
- **Critical Fix:** Character bios without "private" in filename now properly display as PUBLIC
- Fixed Cornelius Wilberforce III - Biography visibility (CHARACTER_SPECIFIC → PUBLIC)
- Fixed Jack Horner - The Old Prospector visibility (CHARACTER_SPECIFIC → PUBLIC)
- Established visibility rule: Filename contains "private" or "secret" → CHARACTER_SPECIFIC, otherwise → PUBLIC
- Updated `import-wiki.js` to correctly categorize entries based on filename
- All players can now see all public character bios (7 public entries total)

#### Character Portrait Cache-Busting
- Added cache-busting parameter to portrait URLs to force browser reload
- Ensures users see updated portraits immediately without manual cache clearing
- Format: `/portraits/[filename].jpg?v=[timestamp]`

### Changed

#### John Henry Farraday Portrait
- Replaced character portrait with updated image (169 KB)
- New image deployed to production with cache-busting URL
- Database updated: `character_image_url` now includes timestamp parameter

### Documentation
- Created `WIKI_VISIBILITY_FIX.md` - Detailed documentation of wiki visibility fix
- Updated `SESSION_STATUS.md` with session 2025-11-06 details
- Updated `NEXT_SESSION.md` with completed tasks

### Technical Details

**Wiki Visibility Logic:**
```javascript
const isPrivate = filename.includes('private') || filename.includes('secret');
const visibility = isPrivate ? 'CHARACTER_SPECIFIC' : 'PUBLIC';
```

**Files Modified:**
- `backend/src/main/resources/static/portraits/doc-farraday.jpg`
- `import-wiki.js`
- Database: `wiki_entries` table (entries #8 and #9)
- Database: `characters.character_image_url` (John Henry Farraday)

**Commits:**
- `5e893a9` - Update John Henry Farraday portrait
- `bdb7a1c` - Fix wiki visibility
- `5fa138d` - Add wiki visibility fix documentation

## [1.2.0] - 2025-11-05

### Added

#### Comprehensive Character Creation Wizard
- Expanded character creation from 4 steps to **9 steps** with full game mechanics support:
  - **Step 1:** Basic info (name, occupation dropdown, experience level, avatar, notes)
  - **Step 2:** Attributes (Agility, Smarts, Spirit, Strength, Vigor with die selection)
  - **Step 3:** Skills (63 skills organized by attribute, accordion browsing, chip selection, inline editing)
  - **Step 4:** Edges (79 edges by type, accordion UI, tooltip descriptions)
  - **Step 5:** Hindrances (54 hindrances by severity, accordion UI, game effects)
  - **Step 6:** Equipment (53 items by type, quantity controls, stats display)
  - **Step 7:** Arcane Powers (17 powers for arcane backgrounds)
  - **Step 8:** Derived Stats (Pace, Size, Grit inputs)
  - **Step 9:** Review (complete character summary with all calculated stats)
- Created `frontend/src/services/referenceService.ts` for reference data integration
- Added TypeScript interfaces for all reference data types (SkillReference, EdgeReference, etc.)
- Implemented accordion-based browsing UI for large datasets
- Added chip-based selection system with visual feedback
- Created table views with inline editing capabilities
- Core skills highlighted with primary color
- Equipment quantity controls

#### Occupation Dropdown System
- Replaced free-text occupation field with dropdown of **80+ authentic Deadlands archetypes**
- Organized by categories:
  - Arcane Backgrounds (Blessed, Huckster, Mad Scientist, Shaman, etc.)
  - Combat Roles (Gunslinger, Shootist, Duelist, Bounty Hunter, etc.)
  - Law Enforcement (Lawman, Texas Ranger, U.S. Marshal, Pinkerton, etc.)
  - Military (Cavalry Officer, Infantry Soldier, Veteran, etc.)
  - Social/Professional (Gambler, Doctor, Inventor, Undertaker, etc.)
  - Frontier Workers (Cowboy, Ranch Hand, Prospector, etc.)
  - And 50+ more authentic Western archetypes
- Ensures data consistency and guides players to appropriate character types

#### Derived Statistics Auto-Calculation
- Implemented Savage Worlds derived stat system:
  - **Parry:** Base 2 + (Fighting skill die / 2)
  - **Toughness:** Base 2 + (Vigor die / 2) + Armor bonus
  - **Charisma:** Sum of edge/hindrance modifiers (Attractive, Ugly, etc.)
- Added database columns to `characters` table (parry, toughness, charisma)
- Created database migration script `add-derived-stats.sql`
- Backfilled 8 existing characters with calculated values
- Created `frontend/src/utils/derivedStats.ts` utility functions:
  - `dieToNumber()` - Converts die notation to numeric values
  - `calculateParry()`, `calculateToughness()`, `calculateCharisma()`
  - `calculateAllDerivedStats()` - Wrapper for all calculations
- Integrated auto-calculation into character creation workflow
- Updated character sheet to display all 6 derived stats (Pace, Parry, Toughness, Charisma, Grit, Size)
- Review step shows calculated values before submission

#### Western UI Theme & Typography
- Complete color palette overhaul for better legibility:
  - **Primary:** Cream/Tan (#D4C5A9, #E8DCC4) - high contrast on dark backgrounds
  - **Secondary:** Bright Gold (#FFD700) - Western accent color
  - **Background:** Very Dark Brown (#1a1410) with Dark Brown paper (#2d2419)
  - **Text:** Cream (#E8DCC4) primary, Muted Tan (#B8A888) secondary
  - **Semantic colors:** Brighter Red (#DC3545), Muted Green (#5C8A3A), Orange (#FFA726), Dusty Blue (#5A9BD5)
- Integrated Google Fonts for authentic Western aesthetic:
  - **"Rye"** - Ornate Western saloon-style font for h1/h2 headers
  - **"Special Elite"** - Typewriter Western font for h3-h6 and buttons
- Typography hierarchy with Western flair:
  - Headers in Gold (#FFD700) and Cream (#E8DCC4) colors
  - Buttons uppercase with Special Elite font and enhanced shadows
  - Letter spacing adjusted for authentic wanted poster look
- Enhanced component styling:
  - Cards with subtle cream borders and 12px radius
  - Buttons with depth shadows (4px default, 6px hover)
  - Chips with bold font and dark brown fills
  - Tables with cream-colored borders
- Added Google Fonts preconnect and stylesheet to `index.html`

### Changed
- Modified `frontend/src/pages/CharacterCreate.tsx` to 9-step wizard
- Updated `frontend/src/services/characterService.ts` Character interface with nested entities
- Modified `frontend/src/pages/CharacterSheet.tsx` to display all derived stats
- Updated `backend/src/main/java/com/deadlands/campaign/model/Character.java` with derived stat fields
- Changed `frontend/src/theme.ts` complete palette and typography overhaul
- Modified `frontend/index.html` to load Western Google Fonts

### Fixed
- **Critical Security Bug:** Fixed 403 Forbidden on character creation
  - Root cause: Spring Security FilterChain runs BEFORE servlet context path
  - SecurityConfig matchers had `/api` prefix but security only saw `/characters`
  - Solution: Removed `/api` prefix from all security matchers
  - Made matchers HTTP method-specific for better granularity
  - Updated `backend/src/main/java/com/deadlands/campaign/config/SecurityConfig.java`
- Fixed SQL die value conversion in migration script
  - Changed from SUBSTRING/CAST to CASE statements with pattern matching
  - Handles d4, d6, d8, d10, d12 notation correctly
- Fixed poor UI contrast (orange on brown)
  - Replaced goldenrod/orange with cream/tan and bright gold
  - Much better text legibility throughout application

### Technical Details
- Database migration uses CASE statements for die value conversion:
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
- Character creation calculates derived stats before submission
- All changes committed and auto-deployed to Railway production

### Known Limitations
- **Character Editing:** Characters can be created but not edited (NEXT SESSION)
- **Point-Buy Validation:** No validation of skill points (15), edge limits, or hindrance limits (4pts max)
- **Hindrance Conversion:** No point conversion system yet
- **Equipment Budget:** No $500 budget tracking yet
- **Derived Stats:** Armor bonus not factored into Toughness, limited Charisma modifiers, no shield Parry bonus

## [1.1.0] - 2025-11-04

### Added

#### Production Deployment to Railway.app
- Successfully deployed full application stack to Railway cloud platform
- Created three Railway services:
  - PostgreSQL 14 database (managed service)
  - Spring Boot backend with Docker
  - React frontend with Nginx and Docker
- Configured public domains:
  - Frontend: https://deadlands-frontend.up.railway.app
  - Backend: https://deadlands-campaign-manager-production.up.railway.app/api
- Implemented auto-initialization of database on startup
- Created `DatabaseInitializer.java` for automatic user creation
- Added character portrait support with static file serving
- Implemented password change feature with show/hide toggles
- Added "Change Password" menu item to navigation

#### Security Enhancements
- Generated secure 512-bit JWT secret for production
- Configured environment-based CORS origins
- Added OPTIONS request handling for CORS preflight
- Made portrait endpoints publicly accessible
- Implemented rate limiting preparation (Bucket4j dependency)

#### Character Sheet UI Redesign
- Redesigned character sheet with tabbed interface using Material-UI Tabs
- Created 5 tabs: Overview, Skills, Edges & Hindrances, Equipment, Arcane Powers
- Added portrait display in Overview tab with conditional rendering
- Improved visual organization with Card components
- Preserved all tooltip functionality across tabs

#### Docker Configuration
- Updated backend Dockerfile to use official Maven 3.9 image
- Added build-time environment variable support for frontend
- Fixed nginx configuration for Railway deployment
- Implemented multi-stage Docker builds for optimization
- Added production Maven profile to pom.xml

### Changed
- Modified `api.ts` to use `VITE_API_URL` from environment variables
- Updated nginx.conf to remove backend proxy (direct URL calls)
- Changed `application-production.yml` SQL init mode to always
- Updated SecurityConfig to allow OPTIONS requests via `HttpMethod.OPTIONS`
- Modified frontend Dockerfile to accept `VITE_API_URL` as build argument

### Fixed
- Resolved Maven build failures with production profile
- Fixed CORS preflight request handling
- Corrected frontend API URL configuration (was calling itself)
- Fixed Spring Security blocking portrait images
- Resolved Docker build issues with Alpine Maven package
- Fixed compilation errors in SecurityConfig (HttpMethod enum)
- Corrected nginx port configuration (3000 vs 80)
- Fixed password mismatch (BCrypt hash was for "password" not "password123")

### Known Issues
- `/api/characters` endpoint returning 502 Bad Gateway in production
  - Backend starts successfully but crashes on character endpoint access
  - Likely database query timeout or memory issue
  - Requires debugging in next session
- Reference data not loaded in production
  - ReferenceDataInitializer disabled due to memory constraints
  - Tooltips will not work until reference data loaded manually
  - Need alternative loading approach (smaller batches or build-time)

### Technical Debt
- Character endpoint needs query optimization for Railway
- Reference data loading needs memory-efficient approach
- Consider database connection pool tuning
- May need to add database indexes for performance
- Consider implementing pagination for character queries

### Deployment Configuration

#### Environment Variables Added
**Backend:**
- `DATABASE_URL` - PostgreSQL connection via Railway variables
- `DATABASE_USERNAME` - Auto-linked to Railway Postgres
- `DATABASE_PASSWORD` - Auto-linked to Railway Postgres
- `JWT_SECRET` - Secure 512-bit secret
- `JWT_EXPIRATION` - 86400000ms (24 hours)
- `SPRING_PROFILES_ACTIVE` - production
- `LOG_LEVEL` - INFO
- `CORS_ORIGINS` - Frontend domain

**Frontend:**
- `VITE_API_URL` - Backend API domain (build-time)

#### Port Configuration
- Backend: 8080 (Spring Boot default)
- Frontend: 3000 (nginx configured port)
- Database: 5432 (PostgreSQL default, private network)

## [1.0.0] - 2025-11-04

### Added

#### Reference Data System
- Created comprehensive reference data database with 5 new tables:
  - `skill_references` - 60+ canonical skill definitions
  - `edge_references` - Edge definitions with requirements
  - `hindrance_references` - Hindrance definitions with game effects
  - `equipment_references` - Weapons, armor, and gear with full stats
  - `arcane_power_references` - Spell/power definitions with mechanics
- Integrated reference data from official Deadlands sourcebooks
- Added REST API endpoints for reference data access:
  - `GET /api/reference/skills`
  - `GET /api/reference/edges`
  - `GET /api/reference/hindrances`
  - `GET /api/reference/equipment`
  - `GET /api/reference/powers`
- Made reference endpoints publicly accessible (no authentication required)

#### Character Sheet Enhancements
- Implemented interactive tooltips using Material-UI
- Added hover descriptions for all character sheet elements:
  - Skills show description, linked attribute, and default die value
  - Edges show requirements, rank, and effects
  - Hindrances show mechanical game effects
  - Equipment shows damage, range, and special notes
  - Powers show power points, range, duration, and effects
- Alphabetically sorted all character sheet sections (skills, edges, hindrances, equipment, powers)

#### Database & Models
- Extended existing entity models with optional reference links:
  - `Skill.java` - Added `skillReference` field
  - `Edge.java` - Added `edgeReference` field
  - `Hindrance.java` - Added `hindranceReference` field
  - `Equipment.java` - Added `equipmentReference` field
  - `ArcanePower.java` - Added `powerReference` field
- Created JPA repositories for all reference data entities
- Maintained backward compatibility with legacy data

#### Frontend Services
- Created `referenceDataService.ts` for API integration
- Implemented reference data caching in frontend
- Enhanced `CharacterSheet.tsx` with tooltip system

#### Documentation & Tools
- Added reference data loading scripts (`load-reference-data.sh`, `load-reference-data.bat`)
- Created seed data SQL script with sample reference data
- Extracted 6 Deadlands sourcebooks to text format for parsing
- Updated security configuration documentation

### Changed
- Modified `SecurityConfig.java` to permit public access to reference endpoints
- Updated character sheet component to fetch and display reference data
- Restructured API controller paths for better organization

### Fixed
- Resolved PDF size issues by converting to text format
- Fixed controller path conflicts between `/api/reference` and server context
- Corrected SQL column name mismatches (armor_piercing → ap)
- Fixed 403 Forbidden errors on reference endpoints
- Resolved missing reference tables after Docker deployment
- Fixed skill name mismatches between classic and Savage Worlds naming
- Fixed frontend tooltips not appearing after Docker rebuild

## [0.1.0] - 2025-11-03

### Added

#### Core Application Structure
- Initial project setup with Spring Boot 3.2.1 and React 18
- Maven-based backend with multi-module structure
- Vite-based frontend with TypeScript support
- PostgreSQL database configuration

#### Authentication & Authorization
- JWT-based authentication system
- User registration and login endpoints (`/auth/register`, `/auth/login`)
- Role-based access control (PLAYER, GAME_MASTER)
- BCrypt password hashing
- Spring Security configuration with CORS support
- Token-based authorization for protected endpoints

#### Character Management
- Complete character entity model for Deadlands Reloaded:
  - 8 attributes (Cognition, Deftness, Knowledge, Mien, Quickness, Smarts, Spirit, Vigor)
  - Derived stats (Pace, Size, Wind/Strain, Grit)
  - Skills with die values and categories
  - Edges (Background, Combat, Social, Professional)
  - Hindrances (Major/Minor)
  - Equipment (weapons, armor, gear) with full stat blocks
  - Arcane powers (Blessed, Huckster, Shaman, Mad Science)
  - Wound tracking by location (Head, Arms, Guts, Legs)
- Character CRUD operations via REST API:
  - `GET /api/characters` - List all characters
  - `GET /api/characters/{id}` - Get character details
  - `POST /api/characters` - Create new character
  - `PUT /api/characters/{id}` - Update character
  - `DELETE /api/characters/{id}` - Delete character (GM only)
- Character sheet viewing interface with Material-UI
- Permission system (players can only view/edit own characters, GMs see all)

#### Database Schema
- Created 9 core database tables:
  - `users` - User accounts and authentication
  - `characters` - Character basic information
  - `skills` - Character skills (one-to-many)
  - `edges` - Character edges (one-to-many)
  - `hindrances` - Character hindrances (one-to-many)
  - `equipment` - Character equipment (one-to-many)
  - `arcane_powers` - Character arcane powers (one-to-many)
  - `wounds` - Character wound tracking (one-to-many)
  - Proper foreign key relationships and constraints
- Hibernate auto-DDL for table creation
- JPA entity mappings with proper cascading

#### Character Import System
- JSON-based character import from original character sheets
- Imported 7 pre-configured characters:
  - Mexicali Bob (Apprentice Shaman)
  - Cornelius Wilberforce III (Wealthy Scholar)
  - Doc Emett Von Braun (Mad Scientist, 1863)
  - John Henry Farraday (Doctor/Hexslinger)
  - Jack Horner (Old Prospector)
  - Lucas Turner (Gunslinger/Marshal)
  - George C Dobbs (Basic Template)
- Created 6 user accounts with role assignments
- Data seeding via SQL scripts

#### Frontend Application
- React 18 with TypeScript and strict mode
- Material-UI component library integration
- React Router for client-side routing
- React Query for server state management
- Zustand for authentication state with persistence
- Axios HTTP client with JWT interceptors
- Pages implemented:
  - Login/Register pages
  - Dashboard with character roster
  - Character sheet viewer
- Responsive layout with navigation
- Form validation with React Hook Form and Zod

#### Docker Support
- Multi-container Docker Compose setup
- Containers for PostgreSQL, Backend (Spring Boot), Frontend (Nginx)
- Volume persistence for database
- Docker networking between services
- Production-ready Dockerfiles
- Environment variable configuration

#### Documentation
- `README.md` - Project overview and features
- `ARCHITECTURE.md` - Complete system architecture documentation
- `QUICKSTART.md` - 15-minute setup guide
- `SETUP.md` - Detailed installation instructions
- `CHARACTER_IMPORT.md` - Character import guide
- `SESSION_STATUS.md` - Development session tracking
- API endpoint documentation
- Technology stack explanation
- Deployment guides for Railway.app and Render.com

### Technical Details

#### Backend (Spring Boot)
- Java 17 with Maven dependency management
- Spring Boot 3.2.1 with embedded Tomcat
- Spring Data JPA with Hibernate ORM
- Spring Security with JWT token validation
- RESTful API design with proper HTTP status codes
- Exception handling with custom error responses
- Application configuration with YAML
- Development and production profiles

#### Frontend (React + TypeScript)
- React 18.2.0 with TypeScript 5.3.3
- Vite 5.0.11 for fast development and building
- Material-UI 5.15.3 for UI components
- React Query 5.17.9 for data fetching and caching
- Zustand 4.4.7 for lightweight state management
- Axios 1.6.5 for HTTP requests
- React Router 6.21.1 for navigation
- ESLint with TypeScript rules for code quality

#### Database
- PostgreSQL 14 for data persistence
- Proper normalization with foreign keys
- Indexes on frequently queried columns
- Support for complex character data models
- Connection pooling for performance

### Security
- JWT tokens with configurable secret and expiration
- Password hashing with BCrypt (strength 10)
- CORS configuration for cross-origin requests
- SQL injection prevention via JPA/Hibernate
- XSS prevention via React's built-in escaping
- Role-based access control on all endpoints
- Authorization checks at service layer

### Performance
- Frontend code splitting and lazy loading
- React Query caching to reduce API calls
- JPA lazy loading for related entities
- Database connection pooling
- Optimized SQL queries with proper indexes
- Fast development server (Vite) with HMR
- Production builds with minification

---

## Version History Summary

- **v1.0.0** (2025-11-04) - Reference data system with tooltips, alphabetical sorting
- **v0.1.0** (2025-11-03) - Initial release with character management and authentication

---

## Contributing

This is a private campaign management tool. For bug reports or feature requests, please contact the project maintainer.

## License

Private project - All rights reserved.

## Acknowledgments

- Deadlands Reloaded by Pinnacle Entertainment Group
- Character sheet templates from official Deadlands materials
- Spring Boot and React communities for excellent documentation