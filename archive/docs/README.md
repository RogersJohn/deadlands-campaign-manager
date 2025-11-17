# Archived Documentation

This directory contains outdated, superseded, or deprecated documentation from previous development sessions.

## Purpose

These documents are preserved for:
- Historical reference
- Understanding past design decisions
- Tracking how the architecture evolved
- Debugging if old patterns need to be reviewed

**These documents should NOT be used as current references.**

---

## Directory Structure

### `/session-management/`
**Status:** ❌ Deprecated - Multi-session architecture removed

Documents related to the abandoned multi-session platform design:
- `SESSION_ROOM_IMPLEMENTATION.md` - Session lobby and room system
- `MULTIPLAYER_TEST_PLAN.md` - Multi-session testing strategy
- `SESSION_2025-11-16_COMPLETE.md` - Session implementation notes
- `E2E_TEST_UPDATES.md` - Session-related E2E tests
- `E2E_TEST_EXECUTION_REPORT.md` - Session test results
- `TEST_REPORT.md` - Session testing documentation
- `TESTING.md` - General testing docs (outdated)

**Why Deprecated:**
The application initially followed a multi-tenancy platform pattern (like Roll20/Foundry VTT) with separate game sessions, lobbies, and join/leave mechanics. This was **fundamentally wrong** for our use case.

**Current Architecture:**
Single shared campaign - users login and play directly. No session management complexity.

See: **SIMPLIFIED_ARCHITECTURE.md** (root directory) for current design.

---

### `/map-development/`
**Status:** ✅ Superseded - Replaced by hybrid procedural rendering

Documents related to previous map generation iterations:
- `AI_MAP_GENERATION_PROPOSAL.md` - Original map system proposal
- `AI_MAP_GENERATION_COMPLETE.md` - First implementation
- `MAP_GENERATION_FIX.md` - Attempted fixes
- `MAP_LOADER_INTEGRATION.md` - Map loading implementation
- `MAP_REDESIGN_ARCHITECTURE.md` - Redesign planning (696 lines)
- `UI_REDESIGN_OPTIONS.md` - UI improvement options
- `AI_ASSISTANT_ACTIVATION.md` - AI setup instructions
- `AI_WORKING_CONFIRMED.md` - AI integration verification
- `AI_GM_ONLY_CHANGES.md` - Access control changes
- `AI_GAMEMASTER_SETUP.md` - Setup guide

**Evolution of Map System:**
1. **Phase 1:** AI-generated photorealistic images → Perspective issues
2. **Phase 2:** Hand-drawn illustrated style → Still perspective
3. **Phase 3:** Hybrid approach → Procedural top-down rendering ✅

**Current Implementation:**
Maps are drawn programmatically from tactical data:
- Terrain: Color-coded areas (grass, dirt, rocks, water)
- Buildings: Geometric shapes with walls and entrances
- Cover: Appropriate symbols (barrels, crates, wagons)
- Perfect alignment with grid coordinates
- No AI image generation (faster, cheaper, more accurate)

See: **NEXT_SESSION.md** (root directory) for current map system.

---

### `/CHANGELOG.md`
**Status:** ❌ Outdated - No longer maintained

Original changelog from early development. Replaced by git commit history and session notes.

**Current Tracking:**
- Git commits for detailed change history
- `NEXT_SESSION.md` for session planning and summaries
- `SIMPLIFIED_ARCHITECTURE.md` for architectural changes

---

## Current Documentation (Root Directory)

**Active References:**
- `README.md` - Project overview and setup
- `SIMPLIFIED_ARCHITECTURE.md` - Current single-campaign architecture
- `NEXT_SESSION.md` - Current session goals (map testing)
- `RAILWAY_ENVIRONMENT_VARIABLES.md` - Production deployment
- `RAILWAY_REBUILD_GUIDE.md` - Deployment guide
- `QUICKSTART.md` - Quick setup guide
- `ARCHITECTURE.md` - System architecture details
- `DECISIONS.md` - Design decisions log
- `TODO.md` - Current tasks
- `CLAUDE_RULES.md` - AI development guidelines
- `PROJECT_ASSESSMENT.md` - Project status

**Documentation Locations:**
- `/docs/setup/` - Setup and deployment guides
- `/docs/development/` - Development plans and specs
- `/docs/sessions/` - Session notes and planning
- `/docs/game-arena/` - Game mechanics documentation
- `/docs/archive/` - Old documentation (this directory)

---

## Key Lessons Learned

### Session Management Anti-Pattern
**Problem:** Over-architected for use case
- Built multi-session platform (like Roll20)
- Added session lobbies, join/leave mechanics
- Created complex SessionPlayer entities
- ~2000 lines of unnecessary code

**Solution:** Single shared campaign
- One game world for the group
- Login → Play (2 clicks instead of 5)
- GM/Player role-based access
- Much simpler, faster, better UX

**Reference:** `SIMPLIFIED_ARCHITECTURE.md` (root) for full analysis

### Map Generation Evolution
**Problem:** AI-generated images had perspective/alignment issues
- Landscape images didn't match top-down coordinates
- Buildings/cover misaligned with tactical grid
- 30-second generation time
- Cost per map (~$0.01)

**Solution:** Procedural rendering
- Draw map from tactical data
- Perfect coordinate alignment
- Instant rendering
- No API costs

**Reference:** `NEXT_SESSION.md` (root) for current implementation

---

## When to Reference Archived Docs

**Use archived docs for:**
- Understanding why certain approaches were abandoned
- Debugging if similar patterns emerge
- Historical context on architectural decisions
- Learning from past mistakes

**DO NOT use archived docs for:**
- Current implementation guidance
- API references
- Setup instructions
- Development planning

**Always check root documentation first for current information.**

---

## Archival Policy

Documents are moved here when:
1. **Deprecated** - Feature/pattern removed from codebase
2. **Superseded** - Replaced by better implementation
3. **Outdated** - Information no longer accurate
4. **Completed** - Project phase finished and documented elsewhere

Documents are **never deleted** - only archived for historical reference.

---

Last Updated: 2025-11-17
