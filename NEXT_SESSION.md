# Next Session - Action Items

**Last Updated:** 2025-11-24
**Current Status:** Documentation Fixes + UX Improvements Complete ✅
**Priority:** Commit Changes → Plan Spells & Abilities Improvements

---

## 🎯 Immediate Tasks (Start Here)

### 1. Review What Was Done This Session (10 min)
This session accomplished TWO major improvements:

#### A. Documentation Bug Fixes ✅
Fixed outdated session-related comments throughout codebase:
- `WebSocketConfig.java` - Updated to reflect single shared world
- `SecurityConfig.java` - Fixed WebSocket endpoint comment
- `JwtAuthenticationFilter.java` - Removed obsolete session debug logging
- `TokenMovedEvent.java` - Updated broadcast documentation
- `GameArena.tsx`, `gameStore.ts`, `ArenaScene.ts` - Fixed "session" terminology

**Impact:** Code documentation now accurately reflects architecture (no more confusion about "sessions")

#### B. UX Improvements (Option A + B Complete) ✅
Implemented 6 features with full E2E test coverage:

**OPTION A - Critical Navigation Fixes:**
1. ✅ Removed duplicate menu item from Layout
2. ✅ Added back button to CharacterEdit page header
3. ✅ Added breadcrumbs to CharacterSheet (My Characters > [Name])

**OPTION B - High Value Quick Wins:**
4. ✅ Empty state messages (verified already existed)
5. ✅ Dashboard search filter (by name/occupation, real-time)
6. ✅ Character stats tooltips (Str/Agi/Vig/Pace/Parry/Tough)

**Files Modified:** 5 frontend components
**E2E Tests Created:** 13 new scenarios across 2 feature files
**Build Status:** ✅ Passing (3,106 kB bundle)

**Read:** `UX_IMPROVEMENTS_COMPLETE.md` for full details

---

### 2. Git Commit (10 min)

**IMPORTANT:** You have TWO separate sets of changes to commit:

#### Commit 1: Documentation Fixes
```bash
git add backend/src/main/java/com/deadlands/campaign/config/WebSocketConfig.java
git add backend/src/main/java/com/deadlands/campaign/config/SecurityConfig.java
git add backend/src/main/java/com/deadlands/campaign/security/JwtAuthenticationFilter.java
git add backend/src/main/java/com/deadlands/campaign/dto/TokenMovedEvent.java
git add frontend/src/game/GameArena.tsx
git add frontend/src/game/engine/ArenaScene.ts
git add frontend/src/store/gameStore.ts

git commit -m "Fix session-related documentation throughout codebase

Updated outdated comments referencing 'sessions' to reflect the current
single shared world architecture implemented in commit d1dd167.

Backend documentation fixes:
- WebSocketConfig.java: Updated class/method comments to describe single shared world
- SecurityConfig.java: Fixed WebSocket endpoint comment
- JwtAuthenticationFilter.java: Removed obsolete session endpoint debug logging
- TokenMovedEvent.java: Updated broadcast documentation

Frontend documentation fixes:
- GameArena.tsx: Changed 'in the session' to 'in the game'
- gameStore.ts: Clarified 'session' means page visit
- ArenaScene.ts: Changed 'in the session' to 'in the game'

No functional changes, documentation only."
```

#### Commit 2: UX Improvements
```bash
git add frontend/src/components/Layout.tsx
git add frontend/src/pages/CharacterEdit.tsx
git add frontend/src/pages/CharacterSheet.tsx
git add frontend/src/pages/Dashboard.tsx
git add frontend/src/pages/CharacterSelect.tsx
git add test/e2e/features/navigation-improvements.feature
git add test/e2e/features/ux-improvements.feature
git add test/e2e/features/support/pages/LayoutPage.js
git add test/e2e/features/support/pages/CharacterSheetPage.js
git add test/e2e/features/support/pages/CharacterEditPage.js
git add test/e2e/features/step_definitions/navigation_steps.js
git add UX_IMPROVEMENTS_COMPLETE.md

git commit -m "Add UX improvements: navigation fixes, search, and tooltips

OPTION A - Critical Navigation Fixes:
1. Remove duplicate menu item from Layout (kept 'My Characters')
2. Add back button to CharacterEdit page header
3. Add breadcrumbs to CharacterSheet (My Characters > Character Name)

OPTION B - High Value Quick Wins:
4. Verify empty state messages (already implemented)
5. Add search filter to Dashboard (name/occupation, case-insensitive)
6. Add tooltips to character stats (Str/Agi/Vig/Pace/Parry/Tough)

E2E Test Coverage:
- Created 13 new test scenarios across 2 feature files
- Added 3 new page object classes (Layout, CharacterSheet, CharacterEdit)
- Added 250+ lines of step definitions

All changes are frontend-only, no breaking changes.
Build: ✅ Successful (3,106 kB, +7 kB)
Tests: ✅ Full E2E coverage with Selenium page objects

See UX_IMPROVEMENTS_COMPLETE.md for full implementation details."
```

---

## 🔮 NEXT SESSION FOCUS: Spells & Abilities Improvements

**Goal:** Enhance player options for spells, powers, and abilities from Deadlands and Savage Worlds rules

### Current State Assessment Needed

Before implementing, we need to understand what's already in place:

#### 1. Review Current Implementation (30 min)
**Files to Examine:**
- `backend/src/main/java/com/deadlands/campaign/model/Character.java`
  - How are `arcanePowers` stored?
  - What fields exist? (name, powerPoints, description, range, etc.)

- `backend/src/main/java/com/deadlands/campaign/model/references/ArcanePowerReference.java`
  - What reference data is available?
  - Are all Deadlands powers included?

- `frontend/src/pages/CharacterEdit.tsx` (lines 984-1048)
  - How does the UI for adding arcane powers work?
  - What fields can players edit?

- `frontend/src/pages/CharacterSheet.tsx` (Tab 5: Arcane Powers)
  - How are powers displayed to players?
  - Can they track usage during combat?

#### 2. Identify Gaps (Questions to Answer)
**Rule Coverage:**
- [ ] Are all core Savage Worlds powers included? (Blast, Bolt, Barrier, etc.)
- [ ] Are Deadlands-specific powers included? (Huckster hexes, Blessed miracles, etc.)
- [ ] Are power modifiers supported? (+1 AP for increased range, duration, etc.)
- [ ] Are power trappings supported? (Fire bolt vs ice bolt vs lightning bolt)

**Gameplay Features:**
- [ ] Can players track current Power Points during combat?
- [ ] Can players spend Power Points when casting?
- [ ] Are spell effects integrated with the game arena?
- [ ] Can GM see when players cast spells?

**Character Types:**
- [ ] Do Hucksters have their special mechanics? (card draw for hexes)
- [ ] Do Blessed have faith checks?
- [ ] Do Mad Scientists have gizmo rules?
- [ ] Do Shamans have spirit rules?

#### 3. Database Seeding Check
**Verify Reference Data:**
```bash
# Check if ArcanePowerReference table is populated
# Look at: backend/src/main/resources/data.sql
# Or: Check if there's a seed script for powers
```

---

## 🎯 Proposed Improvements (Based on Analysis)

### Priority 1: Core Power Mechanics (2-3 hours)
**If not already implemented:**

1. **Power Points Tracking**
   - Add `currentPowerPoints` and `maxPowerPoints` to Character
   - Add UI in CharacterSheet to show PP: 10 / 15
   - Add ability to spend/restore PP

2. **Power Casting in Arena**
   - Add "Cast Power" action in combat
   - Power point cost deduction
   - Broadcast to other players via WebSocket
   - Show visual effect in Phaser

3. **Power Reference Data**
   - Ensure all Savage Worlds core powers are in database
   - Add Deadlands-specific powers (hexes, miracles, etc.)
   - Add power modifiers (range, duration, damage)

### Priority 2: Advanced Mechanics (3-4 hours)
**Character Type Specialization:**

1. **Huckster Mechanics**
   - Card draw system for casting hexes
   - Backlash on failed draws
   - Hex slinging rules

2. **Blessed Mechanics**
   - Faith checks for miracles
   - Sin penalties
   - Divine favor rules

3. **Mad Scientist Mechanics**
   - Gizmo creation
   - Malfunction rolls
   - Ghost rock requirements

4. **Shaman Mechanics**
   - Spirit world interaction
   - Favor with spirits
   - Ritual casting

### Priority 3: UI/UX Enhancements (1-2 hours)

1. **Power Quick Reference**
   - Searchable/filterable power list
   - Show range, duration, AP cost
   - Show power trappings

2. **Combat Integration**
   - Quick-cast from hotbar
   - Target selection for powers
   - Area of effect visualization

3. **Character Sheet Improvements**
   - Power preparation (if using spell slots)
   - Power usage tracking
   - Power notes/customization

---

## 📚 Key Files to Reference

### Backend (Java)
```
backend/src/main/java/com/deadlands/campaign/
├── model/
│   ├── Character.java                    (character entity)
│   ├── references/
│   │   └── ArcanePowerReference.java     (power reference data)
│   └── ArcanePower.java                  (character's powers)
├── controller/
│   └── CharacterController.java          (character API)
├── service/
│   └── CharacterService.java             (business logic)
└── repository/
    └── ArcanePowerReferenceRepository.java
```

### Frontend (TypeScript/React)
```
frontend/src/
├── pages/
│   ├── CharacterEdit.tsx                 (power editing UI)
│   └── CharacterSheet.tsx                (power display)
├── services/
│   ├── referenceService.ts               (fetch power references)
│   └── characterService.ts               (character CRUD)
└── game/
    ├── GameArena.tsx                     (main game component)
    └── components/
        └── GMControlPanel.tsx            (GM controls)
```

### Reference Data
```
backend/src/main/resources/
└── data.sql                              (database seed scripts)
```

---

## 🔍 Research Resources

### Savage Worlds Rules (Core Powers)
- **Combat Powers:** Bolt, Blast, Smite, Warrior's Gift
- **Defensive Powers:** Armor, Deflection, Protection
- **Utility Powers:** Detect/Conceal Arcana, Dispel, Light/Obscure
- **Support Powers:** Boost/Lower Trait, Healing, Relief
- **Movement Powers:** Speed, Fly, Teleport

### Deadlands Classic Powers
**Huckster Hexes:**
- Soul Blast, Phantom Fingers, Mind Rider
- Texas Twister, Trinkets, Whateley Blood

**Blessed Miracles:**
- Lay on Hands, Consecrate Ground, Smite
- Guardian Angel, Holy Roller, Sanctify

**Shaman Powers:**
- Spirit Guide, Vision Quest, Shape Change
- Totem Guardian, Nature's Fury

**Mad Scientist Gizmos:**
- Analytical Engine, Gatling Gun, Spring-Heeled Boots
- Ghost Rock Bomb, Tesla Coil, Dirigible

### Implementation Patterns to Follow
- **WebSocket Integration:** See `TURN_MANAGEMENT_IMPLEMENTATION.md`
- **State Management:** See `STATE_MANAGEMENT.md`
- **GM-Only Features:** Role-based rendering + @PreAuthorize
- **Reference Data:** Follow pattern in EdgeReference, SkillReference

---

## ✅ Success Criteria for Next Session

### Phase 1: Analysis & Planning (30 min)
- [ ] Reviewed all power-related code
- [ ] Identified gaps in current implementation
- [ ] Checked database seed data for powers
- [ ] Documented findings in new markdown file

### Phase 2: Implementation (2-4 hours)
- [ ] Power Points tracking implemented (if needed)
- [ ] At least 1 character type specialization done
- [ ] Power casting integrated with combat system
- [ ] UI improvements for power management
- [ ] Backend tests written
- [ ] Frontend builds successfully

### Phase 3: Documentation (30 min)
- [ ] Implementation guide created
- [ ] Session notes written
- [ ] NEXT_SESSION.md updated
- [ ] Changes committed to git

---

## 🛠️ Development Environment

### Start Backend
```bash
cd backend
mvnw.cmd spring-boot:run
```
Backend: http://localhost:8080

### Start Frontend
```bash
cd frontend
npm run dev
```
Frontend: http://localhost:3000

### Test Database Connection
```bash
# Check application.properties for database config
# Usually H2 in-memory or PostgreSQL
```

---

## 📁 Session Documentation Template

When you start next session, create:
```
SESSION_2025-11-24_SPELLS_ABILITIES.md
SPELLS_ABILITIES_IMPLEMENTATION.md
```

Include:
- Analysis of current state
- Gaps identified
- Features implemented
- Testing approach
- Next steps

---

## ✅ Recent Accomplishments

### This Session (2025-11-24)
- ✅ Documentation bug fixes (7 files) - Session terminology corrected
- ✅ UX improvements (6 features) - Navigation, search, tooltips
- ✅ E2E test coverage (13 scenarios) - Full Selenium page objects
- ✅ Build verification - All passing, no regressions

### Previous Session (2025-11-23)
- ✅ Security cleanup - Credentials removed
- ✅ Arena protection redirect - Bug prevention
- ✅ Illumination UI control - QoL feature
- ✅ Character delete button - QoL feature

### Session Before (2025-11-22)
- ✅ State management refactoring (Zustand + React Query)
- ✅ Character selection screen created
- ✅ WebSocket logic extracted to custom hook
- ✅ Architecture documentation

---

## 🐛 Known Issues

### None Currently
All documentation and UX improvements implemented cleanly.

### Future Considerations
1. **Power Points Not Tracked in Combat** - Need to add if not present
2. **No Power Casting UI** - Need combat integration
3. **Limited Power Reference Data** - May need to seed more powers

---

## 💡 Recommendation for Next Session

**Recommended Approach:**

1. **Start with Analysis** (30 min)
   - Read all power-related code
   - Check database for existing powers
   - Document what exists vs what's needed

2. **Quick Win: Power Points Tracking** (1-2 hours)
   - Add `currentPowerPoints`/`maxPowerPoints` to Character
   - Add UI to CharacterSheet to display/edit
   - Simple, high-value feature

3. **Choose One Specialization** (1-2 hours)
   - Pick Huckster OR Blessed OR Mad Scientist
   - Implement their unique mechanics
   - Test thoroughly before moving to next

4. **Document & Commit** (30 min)
   - Write implementation guide
   - Update NEXT_SESSION.md
   - Commit with good messages

**Total Time:** 3-5 hours (achievable in one session)

---

## 🚀 Quick Reference

### Test Accounts (Local)
- **GM:** `gamemaster` / `password`
- **Player:** `testplayer` / `password`

### Test Accounts (Production)
- **GM:** `gamemaster` / `Test123!`
- **Players:** `e2e_player1`, `e2e_player2` / `Test123!`

### Git Commands
```bash
# Check what needs committing
git status

# See all changes from this session
git diff

# See specific file changes
git diff frontend/src/pages/Dashboard.tsx
```

### Important Documentation
- `UX_IMPROVEMENTS_COMPLETE.md` - This session's UX work
- `ARCHITECTURE_DECISIONS.md` - Why we made design choices
- `COMMON_PATTERNS.md` - How to implement features
- `STATE_MANAGEMENT.md` - When to use each state tool
- `TURN_MANAGEMENT_IMPLEMENTATION.md` - WebSocket pattern reference

---

## 🎯 Questions to Answer Next Session

Before coding, answer these:

1. **Are Power Points already tracked?**
   - Check Character.java for fields
   - Check CharacterSheet.tsx for display

2. **What powers exist in the database?**
   - Check data.sql or equivalent
   - Check ArcanePowerReferenceRepository

3. **Can players cast powers in combat?**
   - Check GameArena.tsx for power casting actions
   - Check WebSocket for power cast events

4. **What character types are supported?**
   - Check if Huckster/Blessed/Mad Scientist/Shaman are distinguished
   - Check if they have unique mechanics

5. **What's the easiest high-value improvement?**
   - Power Points display?
   - More powers in database?
   - Combat casting integration?

---

**Ready for Next Session!**

1. ✅ Commit this session's changes (2 commits)
2. ✅ Review power-related code
3. ✅ Answer the 5 questions above
4. ✅ Start with analysis before coding
5. ✅ Pick one clear goal and implement fully

**Focus:** Improve player options for spells and abilities per Deadlands/Savage Worlds rules
