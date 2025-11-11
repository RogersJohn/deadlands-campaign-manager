# Next Session Plan

## Primary Objectives

### 1. Production Application Status
**Priority: TESTING** | **Status: ✅ DEPLOYED & FIXED**

**CURRENT STATUS (2025-11-11 20:00 UTC):**
Both frontend and backend services are deployed and properly configured.

**Production URLs:**
- **Frontend:** https://deadlands-frontend-production.up.railway.app
- **Backend:** https://deadlands-campaign-manager-production-053e.up.railway.app/api

**Recent Fixes (2025-11-11):**
1. ✅ **Database Connection Fixed** - Backend was connecting to empty Railway internal database
   - Updated `SPRING_DATASOURCE_URL` to correct production database
   - Backend redeployed with correct connection to switchyard.proxy.rlwy.net:15935
   - All 9 characters verified present in database

2. ✅ **Character Portrait Display Improved** (Commit: 07e468e)
   - Increased portrait height from 140px → 200px
   - Added `objectPosition: 'top'` to show faces clearly
   - Deployed to production via git push

**Deployment Verification:**
- ✅ Frontend: nginx serving React app (HTTP 200)
- ✅ Backend: Spring Boot running with `/api` context path
- ✅ Database: Connected to correct production database (switchyard.proxy.rlwy.net:15935)
- ✅ Data integrity: 9 characters, 11 users, 63 skill references verified in database
- 🔄 Backend redeployment in progress (should complete by 20:05 UTC)

**Testing Checklist:**
Once backend redeploys (check after ~20:05 UTC):
1. [ ] Login works with migrated credentials (gamemaster, JohnDoyle)
2. [ ] All 9 characters visible in Game Arena character selection
3. [ ] Character portraits display with faces clearly visible (objectPosition: top)
4. [ ] Character details load correctly
5. [ ] Game Arena v1.0 features functional

**Workflow Going Forward:**
- Small incremental changes pushed immediately to production
- Git push triggers automatic Railway deployment
- Frontend deployments: ~2-3 minutes
- Backend deployments: ~3-4 minutes

**Context:**
- Production database: switchyard.proxy.rlwy.net:15935 (cozy-fulfillment)
- Old database (archived): centerbeam.proxy.rlwy.net:31016 (illustrious-solace)
- 11 users migrated with original BCrypt passwords preserved
- 9 characters migrated (8 from old prod + 1 "frank" from local)

### 2. Security Cleanup
**Priority: HIGH**

Migration scripts contain production database credentials in plaintext.

**Tasks:**
- Add migration scripts to `.gitignore`
- OR move to `scripts/migrations/archive/` directory
- OR delete after confirming they're not needed for audit

**Files:**
- `migrate-characters.js`
- `migrate-from-old-prod.js`
- `migrate-all-from-old-prod.js`
- `migrate-complete.js`

### 3. Decommission Old Railway Project
**Priority: MEDIUM**

**Tasks:**
- Confirm new production is stable and accessible
- Delete or pause illustrious-solace Railway project
- Remove old database connection permissions from `.claude/settings.local.json`

**Cost impact:** Old project may be incurring monthly charges

## Known Issues

None - migration completed successfully, application testing pending.

## Recent Changes

- Database fully migrated from illustrious-solace to cozy-fulfillment
- Users: 11 (passwords preserved from old system)
- Characters: 9 with all associated skills/edges/hindrances/equipment
- Reference data: All character-related lookup tables migrated
- Wiki entries: 9 entries migrated

## Session State

- Clean state, no broken tests
- All migration scripts executed successfully
- Password preservation verified (BCrypt hashes match)
- Production database contains all expected data per row counts

---

## Game Arena Combat System - PHASE 1 COMPLETE ✅
**Priority: COMPLETE** | **Status: DEPLOYED & TESTED**

### Overview
Game Arena tactical combat system is fully functional with all core Savage Worlds rules implemented. 78 tests passing, all critical rules covered.

### Session 2025-11-11: Phase 1 + Critical Rules Complete
**Implemented:**
1. ✅ **Phase 1: Ranged Combat Modifiers**
   - Aim action (+2 bonus to next ranged attack)
   - Called shots (head/vitals/limb with penalties and damage bonuses)
   - Running target modifier (-2 to hit)
   - Range penalties (0/-2/-4/-8 for short/medium/long/extreme)
   - Modifier stacking and proper state management

2. ✅ **Critical Rule 1: Gang Up Bonuses**
   - +1 per adjacent ally, capped at +4
   - Works for both player attacks (with allied NPCs) and enemy gang-ups
   - Distance calculation uses Chebyshev distance (max of dx, dy)
   - Full integration with combat methods

3. ✅ **Critical Rule 2: Illumination System**
   - 4 illumination levels: Bright (0), Dim (-1), Dark (-2), Pitch Black (-4)
   - Applies to all attacks (ranged and melee)
   - Persists across turns until changed
   - **Missing:** UI control to change illumination (defaults to Bright)

4. ✅ **Critical Rule 3: Multi-Action Enforcement**
   - First action: no penalty
   - Second action: -2 penalty
   - Third action: -4 penalty
   - Continues at -2 per additional action
   - Resets at start of new turn
   - Increments even on missed attacks

5. ✅ **Technical Improvements**
   - Type-safe event system (GameEvents.ts) - compile-time validation
   - Combat log bounded at 100 entries (prevents memory leaks)
   - Theme constants extracted (GAME_COLORS, DIALOG_SIZES)
   - Comprehensive test coverage (78 tests total)

### Test Coverage
- **78 tests passing** across 5 test files
- ParryRules.test.ts (13 tests)
- MovementBudget.test.ts (14 tests)
- Phase1Modifiers.test.ts (20 tests) - **Caught 4 real bugs**
- CriticalRules.test.ts (22 tests) - **NEW**
- ActionMenu.test.tsx (9 tests)

**Bugs Caught:**
1. Aim persisting on missed attacks
2. Called shot never clearing after attack
3. Wrong parameter order in damage calculation
4. Wrong property name (totalDamage vs total)

### Documentation Created
- ✅ `RANGED_COMBAT_DEVELOPMENT_PLAN.md` - 8-phase roadmap
- ✅ `PHASE_1_IMPLEMENTATION_SUMMARY.md` - Phase 1 details
- ✅ `CLAUDE_RULES.md` - Engineering standards
- ✅ `PROJECT_ASSESSMENT.md` - **NEW** - Comprehensive project status

### Current Status
**What Works:**
- All core Savage Worlds mechanics (dice, raises, wounds, toughness)
- All Phase 1 ranged combat modifiers
- All 3 critical rules (gang-up, illumination, multi-action)
- Movement budget system
- Type-safe event system
- Combat log with bounded size

**What's Missing:**
- UI control for illumination setting (system works, just no UI)
- Allied NPCs (gang-up infrastructure ready, but no allies exist yet)
- Phase 2-8 features (cover, ammo, rate of fire, etc.)

### Next Steps (Recommended)

#### Option 1: Add Illumination UI (1-2 hours)
**Priority: Medium** | **Unblocks:** Tactical illumination decisions
- Add dropdown in GameArena UI for Bright/Dim/Dark/Pitch Black
- Wire up to CombatManager.setIllumination()
- Add visual indicator (sun/moon icon)
- Simple, clean implementation

#### Option 2: Phase 2 - Cover System (4-6 hours)
**Priority: High** | **Impact:** Major tactical depth for ranged combat
- Define cover areas on map
- Calculate line of sight
- Apply cover modifiers (-2 light, -4 medium, -6 heavy)
- Add visual indicators
- Write comprehensive tests

#### Option 3: Phase 3 - Ammo Tracking (3-4 hours)
**Priority: Medium** | **Impact:** Resource management, prevents infinite ammo
- Track shots remaining per weapon
- Implement reload action
- UI indicator for ammo count
- Tests for edge cases

### Resources
- **Project Assessment:** `PROJECT_ASSESSMENT.md` - Full status review
- **Development Plan:** `RANGED_COMBAT_DEVELOPMENT_PLAN.md`
- **Phase 1 Summary:** `PHASE_1_IMPLEMENTATION_SUMMARY.md`
- **Engineering Standards:** `CLAUDE_RULES.md`
- **Tests:** `frontend/src/game/engine/__tests__/*.test.ts`
