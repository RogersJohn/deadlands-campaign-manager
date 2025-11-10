# Next Session Plan

## Primary Objectives

### 1. Verify Production Application Functionality
**Priority: CRITICAL**

The database migration is complete, but the application hasn't been tested with the migrated data.

**Tasks:**
- Access production at deadlands-campaign-manager-production.up.railway.app
- Test user login with migrated credentials (try gamemaster and JohnDoyle)
- Verify all 9 characters appear in character list
- Check that character details load correctly (stats, skills, edges, etc.)
- Test character portrait display
- Verify wiki entries are accessible

**Why this matters:**
- Migration was successful at database level, but application integration is unverified
- Users cannot use the system until login/character access is confirmed working
- Character portrait URLs from old system may be broken

**Context needed:**
- Production URL: deadlands-campaign-manager-production.up.railway.app
- Old prod database: centerbeam.proxy.rlwy.net:31016 (illustrious-solace)
- New prod database: switchyard.proxy.rlwy.net:15935 (cozy-fulfillment)
- 11 users migrated with original passwords preserved
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
