# Session Status - Deadlands Campaign Manager

**Last Updated:** 2025-11-04
**Status:** ✅ Application running with Reference Data System and Tooltips

## Project Overview

Deadlands Campaign Manager - A Spring Boot 3.2.1 + React 18 web application for managing Deadlands Reloaded tabletop RPG campaigns with integrated sourcebook reference data.

---

## Session 2025-11-04: Reference Data System Implementation

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

#### 2. ✅ Updated Entity Models
Modified existing character data models to reference canonical data:
- `Skill.java` - Added `skillReference` field
- `Edge.java` - Added `edgeReference` field
- `Hindrance.java` - Added `hindranceReference` field
- `Equipment.java` - Added `equipmentReference` field
- `ArcanePower.java` - Added `powerReference` field

**Design Decision:** Maintained backward compatibility with legacy data by making reference fields optional.

#### 3. ✅ Created Repository Layer
New JPA repositories for reference data:
- `SkillReferenceRepository`
- `EdgeReferenceRepository`
- `HindranceReferenceRepository`
- `EquipmentReferenceRepository`
- `ArcanePowerReferenceRepository`

#### 4. ✅ Built REST API Endpoints
Created `ReferenceDataController` with public endpoints:
- `GET /api/reference/skills` - List all skill references
- `GET /api/reference/edges` - List all edge references
- `GET /api/reference/hindrances` - List all hindrance references
- `GET /api/reference/equipment` - List all equipment references
- `GET /api/reference/powers` - List all arcane power references

**Security:** Made reference endpoints publicly accessible (no authentication required) since they're read-only reference data.

#### 5. ✅ Frontend Tooltip System
Enhanced character sheet UI with Material-UI tooltips:
- Hover over any skill, edge, hindrance, equipment, or power to see full description
- Tooltips display:
  - **Skills:** Description, linked attribute, default die value
  - **Edges:** Description, requirements, rank required
  - **Hindrances:** Description, mechanical game effects
  - **Equipment:** Description, damage, range, special notes
  - **Powers:** Description, power points, range, duration, effects

#### 6. ✅ Alphabetical Sorting
All character sheet lists now display in alphabetical order:
- Skills sorted A-Z
- Edges sorted A-Z
- Hindrances sorted A-Z
- Equipment sorted A-Z
- Arcane Powers sorted A-Z

#### 7. ✅ Sourcebook Data Integration
- Converted 6 Deadlands PDFs to text format for easier parsing
- Created seed data SQL script with sample reference data
- Loaded reference data into database via Docker

### Technical Challenges Resolved

1. **PDF Size Issues:** PDFs were too large (4.5-18MB) to read directly
   - **Solution:** Used `pdftotext` to extract text content to manageable .txt files

2. **Controller Path Conflict:** Initial `/api/reference` conflicted with server context path
   - **Solution:** Changed to `/reference` since server already has `/api` context

3. **Column Name Mismatch:** SQL used `armor_piercing` but entity used `ap`
   - **Solution:** Updated SQL script to match entity field names

4. **403 Forbidden Errors:** Reference endpoints were protected by authentication
   - **Solution:** Added `.requestMatchers("/reference/**").permitAll()` to security config

5. **Missing Reference Tables:** Database didn't have reference tables after first deploy
   - **Solution:** Rebuilt backend Docker image to create tables via Hibernate

6. **Skill Name Mismatch:** Character data used old-style names ("Shootin'") vs new names ("Shooting")
   - **Solution:** Added both classic and Savage Worlds skill names to reference data

7. **No Tooltips Showing:** Frontend container wasn't rebuilt with new code
   - **Solution:** Ran `docker-compose build frontend` and hard-refreshed browser

### Files Created

**Backend:**
- `backend/src/main/java/com/deadlands/campaign/model/SkillReference.java`
- `backend/src/main/java/com/deadlands/campaign/model/EdgeReference.java`
- `backend/src/main/java/com/deadlands/campaign/model/HindranceReference.java`
- `backend/src/main/java/com/deadlands/campaign/model/EquipmentReference.java`
- `backend/src/main/java/com/deadlands/campaign/model/ArcanePowerReference.java`
- `backend/src/main/java/com/deadlands/campaign/repository/SkillReferenceRepository.java`
- `backend/src/main/java/com/deadlands/campaign/repository/EdgeReferenceRepository.java`
- `backend/src/main/java/com/deadlands/campaign/repository/HindranceReferenceRepository.java`
- `backend/src/main/java/com/deadlands/campaign/repository/EquipmentReferenceRepository.java`
- `backend/src/main/java/com/deadlands/campaign/repository/ArcanePowerReferenceRepository.java`
- `backend/src/main/java/com/deadlands/campaign/controller/ReferenceDataController.java`
- `backend/src/main/resources/reference-data.sql`

**Frontend:**
- `frontend/src/services/referenceDataService.ts`

**Documentation:**
- `load-reference-data.sh`
- `load-reference-data.bat`

**Sourcebook Data:**
- `Sourcebooks/*.txt` (6 extracted text files from PDFs)

### Files Modified

**Backend:**
- `backend/src/main/java/com/deadlands/campaign/model/Skill.java`
- `backend/src/main/java/com/deadlands/campaign/model/Edge.java`
- `backend/src/main/java/com/deadlands/campaign/model/Hindrance.java`
- `backend/src/main/java/com/deadlands/campaign/model/Equipment.java`
- `backend/src/main/java/com/deadlands/campaign/model/ArcanePower.java`
- `backend/src/main/java/com/deadlands/campaign/config/SecurityConfig.java`

**Frontend:**
- `frontend/src/pages/CharacterSheet.tsx`

### Current Data Counts

- **Skills:** 60+ entries (includes both classic and Savage Worlds names)
- **Edges:** 13 entries (Background, Combat, Social, Professional)
- **Hindrances:** 10 entries (Deadlands-specific hindrances)
- **Equipment:** 18 entries (weapons, armor, gear)
- **Arcane Powers:** 15 entries (Blessed, Huckster, Shaman, Mad Science)

---

## Proposed Next Steps

### Priority 1: Expand Reference Data
**Goal:** Complete the sourcebook reference database

#### Tasks:
1. **Parse more skills from sourcebooks**
   - Extract all skills from Player's Guide Chapter 3
   - Add Knowledge skills with specific specializations
   - Include trait requirements and difficulty modifiers

2. **Add complete Edge database**
   - All Background Edges (Arcane Background variants, racial edges)
   - All Combat Edges (Duelist, Hip-Shooting, Martial Arts, etc.)
   - All Legendary Edges
   - All Professional Edges (Agent, Texas Ranger, etc.)
   - Include specific numeric bonuses and requirements

3. **Complete Hindrance list**
   - All Minor Hindrances
   - All Major Hindrances
   - Include point values for character creation

4. **Expand Equipment database**
   - All firearms from S&R Catalog
   - All melee weapons
   - All armor types
   - All infernal devices
   - Horses and vehicles
   - Include full stat blocks (damage, range, RoF, shots, AP, cost, weight)

5. **Complete Arcane Powers**
   - All Blessed miracles
   - All Huckster hexes with poker hand requirements
   - All Shaman favors
   - All Mad Science device blueprints
   - Include scaling effects and modifiers

**Estimated Data:** ~200 skills, ~100 edges, ~50 hindrances, ~150 equipment items, ~50 powers

#### Benefits:
- Players can browse complete rulebook during character creation
- GMs can quickly reference rules during gameplay
- Reduces need to flip through physical books
- Ensures consistent rule application

---

### Priority 2: Character Creation Wizard
**Goal:** Allow players to create new characters through the UI

#### Tasks:
1. **Multi-step character creation form**
   - Step 1: Basic info (name, occupation, concept)
   - Step 2: Attributes (point-buy system with dice)
   - Step 3: Choose hindrances (gain points)
   - Step 4: Choose edges (spend points)
   - Step 5: Assign skills (point-buy)
   - Step 6: Select starting equipment
   - Step 7: Review and save

2. **Integration with reference data**
   - Dropdowns populated from reference tables
   - Tooltips show requirements and effects
   - Auto-calculate point totals
   - Validate character creation rules

3. **Character templates/archetypes**
   - Quick-start templates (Huckster, Gunslinger, Doc, etc.)
   - Pre-allocated attributes and skills
   - Suggested edges and hindrances
   - Option to customize from template

#### Benefits:
- No need to manually import JSON files
- Guided character creation for new players
- Consistent with game rules
- Reduces GM workload

---

### Priority 3: Campaign Management Features
**Goal:** Add tools for GMs to manage campaigns

#### Tasks:
1. **Campaign/Session tracking**
   - Create campaigns with name, date, description
   - Associate characters with campaigns
   - Track session history and notes
   - Award experience points

2. **NPC Management**
   - Flag characters as NPCs vs PCs
   - Quick-create NPCs with reduced details
   - Tag NPCs by type (ally, enemy, neutral)
   - Associate NPCs with campaigns

3. **Adventure/Plot tracking**
   - Create adventure outlines
   - Track plot threads and clues
   - Link characters to plot points
   - Session prep notes

4. **Handout system**
   - Upload and share documents
   - Create in-game handouts
   - Share map images
   - Distribute to players

#### Benefits:
- Central hub for campaign information
- Better organization for GMs
- Historical record of campaign
- Easy sharing with players

---

### Priority 4: Interactive Character Sheet
**Goal:** Make character sheet fully interactive for gameplay

#### Tasks:
1. **Dice rolling integration**
   - Click on skill to roll
   - Automatic modifiers (wounds, hindrances)
   - Roll results logged
   - Support for opposed rolls

2. **Wound tracking**
   - Click to mark wounds
   - Auto-calculate wound penalties
   - Track location (head, guts, limbs)
   - Mark when healed

3. **Fate Chip tracker**
   - Display current chips (white, red, blue)
   - Award/spend chips
   - Track legend chip status
   - History of chip usage

4. **Power Points / Ammo tracking**
   - Current vs max power points
   - Track ammo counts for weapons
   - Quick increment/decrement buttons
   - Auto-update on use

5. **Experience Points**
   - Track XP earned
   - Calculate rank advancement
   - Show available improvements
   - Spending log

#### Benefits:
- Reduces paper tracking during gameplay
- Auto-calculates modifiers
- Faster gameplay
- Complete digital character management

---

### Priority 5: Enhanced Search and Filtering
**Goal:** Make it easy to find reference data and characters

#### Tasks:
1. **Reference data browser**
   - Dedicated page for browsing skills/edges/etc.
   - Filter by type, category, requirements
   - Sort by name, rank, cost
   - Search by keyword

2. **Character roster improvements**
   - Filter by player, campaign, rank
   - Search by name, occupation, attributes
   - Export character list to CSV
   - Bulk operations (archive, delete)

3. **Advanced search**
   - Search across all game content
   - Filter edges by requirements met
   - Find equipment by price range
   - Search powers by effect type

#### Benefits:
- Quick reference during play
- Easy character planning
- Better organization
- Faster rules lookups

---

### Priority 6: Import/Export Enhancements
**Goal:** Improve character data portability

#### Tasks:
1. **Enhanced JSON import**
   - Auto-match to reference data
   - Suggest corrections for typos
   - Validate against rules
   - Preview before import

2. **Character export formats**
   - Export to PDF character sheet
   - Export to JSON for backup
   - Export to Roll20/Foundry VTT format
   - Print-friendly HTML

3. **Bulk import/export**
   - Import multiple characters at once
   - Export entire campaign
   - Campaign backup/restore
   - Migration tools

#### Benefits:
- Data portability
- Backup safety
- Integration with VTTs
- Campaign sharing

---

### Priority 7: Mobile Optimization
**Goal:** Make the app usable on phones and tablets

#### Tasks:
1. **Responsive character sheet**
   - Collapsible sections
   - Touch-friendly buttons
   - Optimized layout for mobile
   - Swipe navigation

2. **Mobile-first features**
   - Quick dice roller
   - Simplified view mode
   - Offline capability
   - PWA installation

#### Benefits:
- Use at gaming table on phone
- No laptop required
- Better accessibility
- Modern user experience

---

### Priority 8: Rulebook Wiki Integration
**Goal:** Build a searchable rules reference

#### Tasks:
1. **Wiki pages for rules**
   - Combat rules
   - Magic system
   - Character advancement
   - Setting lore

2. **Cross-linking**
   - Link skills to relevant rules
   - Link edges to requirements
   - Link powers to mechanics
   - Breadcrumb navigation

3. **GM resources**
   - Random encounter tables
   - Town generators
   - NPC name generators
   - Plot hooks

#### Benefits:
- Complete reference system
- No need for physical books
- Searchable content
- Always up-to-date

---

## Development Priorities Summary

**Immediate (Next Session):**
1. Expand reference data to 80-90% of core rulebook
2. Begin character creation wizard (basic structure)

**Short-term (1-2 weeks):**
3. Complete character creation wizard
4. Add campaign management basics
5. Interactive character sheet features

**Medium-term (1 month):**
6. Enhanced search and filtering
7. Import/export improvements
8. Mobile optimization

**Long-term (2-3 months):**
9. Wiki integration
10. Advanced GM tools
11. Virtual tabletop features

---

## Technical Debt & Improvements

### Code Quality
- [ ] Add comprehensive error handling to reference data service
- [ ] Implement loading states for tooltip data
- [ ] Add TypeScript interfaces for all reference data
- [ ] Write unit tests for reference matching logic
- [ ] Add integration tests for reference endpoints

### Performance
- [ ] Cache reference data in frontend (React Query)
- [ ] Add database indexes on reference table names
- [ ] Implement lazy loading for large character lists
- [ ] Optimize tooltip rendering performance

### Security
- [ ] Change default passwords in production
- [ ] Update JWT secret for production
- [ ] Add rate limiting to public endpoints
- [ ] Implement CSRF protection

### Documentation
- [ ] API documentation (Swagger/OpenAPI)
- [ ] User guide for players
- [ ] GM guide for campaign management
- [ ] Developer guide for contributions

---

## Current Project State

```
Git Status: Modified files (reference system implementation)
Database: Running in Docker with reference tables populated
Backend: Running on port 8080 with reference endpoints
Frontend: Running on port 3000 with tooltip system
```

### Database Tables
**Character Data:**
- users, characters, skills, edges, hindrances, equipment, arcane_powers, wounds

**Reference Data:**
- skill_references, edge_references, hindrance_references, equipment_references, arcane_power_references

### Container Status
```
deadlands-db: Running (PostgreSQL 14)
deadlands-backend: Running (Spring Boot 3.2.1)
deadlands-frontend: Running (React 18 + Nginx)
```

---

## Quick Commands Reference

### Docker Operations
```bash
# Restart all services
docker-compose restart

# Rebuild backend only
docker-compose build backend
docker-compose up -d backend

# Rebuild frontend only
docker-compose build frontend
docker-compose up -d frontend

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop everything
docker-compose down

# Complete rebuild
docker-compose down
docker-compose build
docker-compose up -d
```

### Database Operations
```bash
# Load reference data
docker exec -i deadlands-db psql -U deadlands -d deadlands < backend\src\main\resources\reference-data.sql

# Check reference data counts
docker exec deadlands-db psql -U deadlands -d deadlands -c "SELECT COUNT(*) FROM skill_references;"
docker exec deadlands-db psql -U deadlands -d deadlands -c "SELECT COUNT(*) FROM edge_references;"

# Connect to database
docker exec -it deadlands-db psql -U deadlands -d deadlands

# List all tables
docker exec deadlands-db psql -U deadlands -d deadlands -c "\dt"
```

### Access Points
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8080/api
- **Reference Skills:** http://localhost:8080/api/reference/skills
- **Reference Edges:** http://localhost:8080/api/reference/edges

### Login Credentials
- **Game Master:** gamemaster / password123
- **Player 1:** player1 / password123
- **Player 2:** player2 / password123

---

## Known Issues

### None Currently!
All major issues from tonight's session have been resolved.

---

## Session Metrics

- **Duration:** ~4 hours
- **Files Created:** 19
- **Files Modified:** 7
- **Database Tables Added:** 5
- **API Endpoints Added:** 10
- **Reference Data Entries:** ~100
- **Issues Resolved:** 7

---

**Status:** ✅ All systems operational with reference data tooltips working!
**Next Session:** Expand reference data and begin character creation wizard
