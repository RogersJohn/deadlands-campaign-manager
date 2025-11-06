# Next Session Plan - Character Editing System

**Last Updated:** 2025-11-06
**Priority:** HIGH
**Estimated Time:** 3-4 hours

---

## Recent Completed Tasks (2025-11-06)

✅ John Henry Farraday portrait updated with cache-busting
✅ Wiki visibility fixed - character bios now properly public/private based on filename
✅ All documentation updated

---

## User Requirement

> "My priority is for the gamemaster and the players to be able to edit all characters for which they have ownership"

---

## Ownership & Permission Rules

### Game Master (GAME_MASTER role)
- Can edit **ALL characters** regardless of owner
- Can delete any character
- Full CRUD permissions on all character data

### Players (PLAYER role)
- Can edit **ONLY their own characters** (where `character.player_id = user.id`)
- Cannot edit other players' characters (403 Forbidden)
- Cannot delete characters (only GM can delete)
- Can view other characters in same campaign

### Authorization Flow
1. Frontend checks if user is owner OR game master
2. Shows "Edit Character" button only if authorized
3. Backend validates ownership on PUT request
4. Returns 403 if user tries to edit character they don't own (unless GM)

---

## Implementation Plan

### Phase 1: Backend Permission Verification (15 min)

**Goal:** Ensure backend properly validates ownership on character updates

**Tasks:**
- [ ] Review `CharacterController.java` PUT endpoint
- [ ] Check if authorization logic exists in `CharacterService.java`
- [ ] Verify `SecurityConfig.java` allows PUT requests for PLAYER and GAME_MASTER
- [ ] Add ownership validation in service layer if missing
- [ ] Write method to check: `user.hasRole("GAME_MASTER") OR character.player.id == user.id`

**Expected Code (CharacterService.java):**
```java
public Character updateCharacter(Long characterId, Character updatedCharacter, User currentUser) {
    Character existingCharacter = characterRepository.findById(characterId)
        .orElseThrow(() -> new ResourceNotFoundException("Character not found"));

    // Check ownership: must be GM or character owner
    boolean isGameMaster = currentUser.getRoles().stream()
        .anyMatch(role -> role.getName().equals("GAME_MASTER"));
    boolean isOwner = existingCharacter.getPlayer().getId().equals(currentUser.getId());

    if (!isGameMaster && !isOwner) {
        throw new UnauthorizedException("You do not have permission to edit this character");
    }

    // Proceed with update...
}
```

**Files to Check/Modify:**
- `backend/src/main/java/com/deadlands/campaign/controller/CharacterController.java`
- `backend/src/main/java/com/deadlands/campaign/service/CharacterService.java`
- `backend/src/main/java/com/deadlands/campaign/config/SecurityConfig.java` (should already be correct)

---

### Phase 2: Character Update Endpoint Enhancement (30 min)

**Goal:** Handle full character updates including nested entities

**Tasks:**
- [ ] Update `CharacterService.updateCharacter()` to handle nested entities:
  - Skills (add new, update existing, remove deleted)
  - Edges (add new, remove deleted)
  - Hindrances (add new, remove deleted)
  - Equipment (add new, update quantities, remove deleted)
  - Arcane Powers (add new, remove deleted)
- [ ] Implement cascade update logic for @OneToMany relationships
- [ ] Handle orphan removal (delete skills/edges/etc. that were removed)
- [ ] Recalculate derived stats (Parry, Toughness, Charisma) after update
- [ ] Add validation for die values and required fields
- [ ] Test with Postman/curl before frontend work

**Update Strategy:**
```java
// For nested entities like skills:
// 1. Clear existing relationships
existingCharacter.getSkills().clear();

// 2. Add new/updated skills
for (Skill skill : updatedCharacter.getSkills()) {
    skill.setCharacter(existingCharacter);
    existingCharacter.getSkills().add(skill);
}

// 3. Save (cascade will handle inserts/updates/deletes)
characterRepository.save(existingCharacter);
```

**Derived Stats Recalculation:**
- Reuse `frontend/src/utils/derivedStats.ts` logic in backend
- Or recalculate in frontend before sending PUT request
- Ensure Parry/Toughness/Charisma updated based on new values

**Files to Modify:**
- `backend/src/main/java/com/deadlands/campaign/service/CharacterService.java`
- `backend/src/main/java/com/deadlands/campaign/controller/CharacterController.java`

---

### Phase 3: Frontend Edit Mode UI (60 min)

**Goal:** Add edit mode toggle to CharacterSheet with inline editing

**Tasks:**
- [ ] Add state variable for edit mode: `const [isEditing, setIsEditing] = useState(false)`
- [ ] Add "Edit Character" button (only if authorized)
  - Check: `user.id === character.player?.id OR user.role === "GAME_MASTER"`
- [ ] Create edit mode layout with form fields replacing static text
- [ ] Convert each section to editable mode:
  - **Basic Info:** TextField for name, Select for occupation
  - **Attributes:** Select dropdown for die values (d4, d6, d8, d10, d12, d12+1, d12+2)
  - **Skills:** Reuse skill selector from CharacterCreate
  - **Edges:** Reuse edge selector from CharacterCreate
  - **Hindrances:** Reuse hindrance selector from CharacterCreate
  - **Equipment:** Reuse equipment selector from CharacterCreate
  - **Arcane Powers:** Reuse power selector from CharacterCreate
  - **Derived Stats:** Display calculated values (auto-update)
- [ ] Add "Save Changes" and "Cancel" buttons at top/bottom
- [ ] Implement save handler:
  - Calculate derived stats
  - Send PUT request to `/api/characters/{id}`
  - Show loading spinner during save
  - Display success message on save
  - Exit edit mode on success
- [ ] Implement cancel handler:
  - Reset form to original values
  - Exit edit mode
- [ ] Add error handling:
  - Display error message if save fails
  - Handle 403 (not authorized) and 401 (not authenticated)
  - Handle validation errors

**UI Components Needed:**
```tsx
{isEditing ? (
  <Box>
    <TextField
      label="Character Name"
      value={editedCharacter.name}
      onChange={(e) => setEditedCharacter({...editedCharacter, name: e.target.value})}
    />
    {/* More edit fields... */}
    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
      <Button variant="contained" onClick={handleSave}>Save Changes</Button>
      <Button variant="outlined" onClick={handleCancel}>Cancel</Button>
    </Box>
  </Box>
) : (
  <Box>
    <Typography variant="h4">{character.name}</Typography>
    {/* Read-only display... */}
    {canEdit && (
      <Button variant="outlined" onClick={() => setIsEditing(true)}>
        Edit Character
      </Button>
    )}
  </Box>
)}
```

**Authorization Check:**
```tsx
const canEdit = useMemo(() => {
  const user = authStore.user
  if (!user) return false
  const isGameMaster = user.roles?.includes('GAME_MASTER')
  const isOwner = character.player?.id === user.id
  return isGameMaster || isOwner
}, [character, authStore.user])
```

**Files to Modify:**
- `frontend/src/pages/CharacterSheet.tsx`

---

### Phase 4: Reuse CharacterCreate Components (45 min)

**Goal:** Extract selection UIs into reusable components to avoid code duplication

**Tasks:**
- [ ] Create `frontend/src/components/character/` directory
- [ ] Extract skill selection UI to `SkillSelector.tsx`:
  - Props: `skills`, `onSkillsChange`, `skillReferences`
  - Accordion by attribute
  - Chip selection
  - Table with inline die value editing
- [ ] Extract edge selection UI to `EdgeSelector.tsx`:
  - Props: `edges`, `onEdgesChange`, `edgeReferences`
  - Accordion by type
  - Card display with tooltips
- [ ] Extract hindrance selection UI to `HindranceSelector.tsx`:
  - Props: `hindrances`, `onHindrancesChange`, `hindranceReferences`
  - Accordion by severity
- [ ] Extract equipment selection UI to `EquipmentSelector.tsx`:
  - Props: `equipment`, `onEquipmentChange`, `equipmentReferences`
  - Accordion by type
  - Quantity controls
- [ ] Extract arcane power selection UI to `ArcanePowerSelector.tsx`:
  - Props: `powers`, `onPowersChange`, `powerReferences`
- [ ] Update `CharacterCreate.tsx` to use new components
- [ ] Update `CharacterSheet.tsx` edit mode to use new components
- [ ] Ensure consistent UX between creation and editing

**Component Structure:**
```tsx
// SkillSelector.tsx
interface SkillSelectorProps {
  skills: Skill[]
  onSkillsChange: (skills: Skill[]) => void
  skillReferences: SkillReference[]
}

export function SkillSelector({ skills, onSkillsChange, skillReferences }: SkillSelectorProps) {
  // Accordion UI with chip selection
  // Table view with inline editing
  return (...)
}
```

**Files to Create:**
- `frontend/src/components/character/SkillSelector.tsx`
- `frontend/src/components/character/EdgeSelector.tsx`
- `frontend/src/components/character/HindranceSelector.tsx`
- `frontend/src/components/character/EquipmentSelector.tsx`
- `frontend/src/components/character/ArcanePowerSelector.tsx`

**Files to Modify:**
- `frontend/src/pages/CharacterCreate.tsx`
- `frontend/src/pages/CharacterSheet.tsx`

---

### Phase 5: Validation & Auto-Calculation (30 min)

**Goal:** Real-time validation and derived stats calculation during editing

**Tasks:**
- [ ] Recalculate derived stats on every relevant change:
  - Update **Parry** when Fighting skill changes
  - Update **Toughness** when Vigor attribute changes or armor equipment changes
  - Update **Charisma** when edges/hindrances change (Attractive, Ugly, etc.)
- [ ] Show real-time stat updates in edit mode (live preview)
- [ ] Validate die values (must be d4, d6, d8, d10, d12, d12+1, d12+2)
- [ ] Validate required fields (name, occupation, attributes)
- [ ] Display validation errors inline
- [ ] Disable "Save" button if validation fails
- [ ] Calculate stats before sending PUT request

**Auto-Calculation Logic:**
```tsx
// In CharacterSheet edit mode
useEffect(() => {
  if (isEditing) {
    const updatedStats = calculateAllDerivedStats(editedCharacter)
    setEditedCharacter(prev => ({
      ...prev,
      parry: updatedStats.parry,
      toughness: updatedStats.toughness,
      charisma: updatedStats.charisma,
    }))
  }
}, [
  editedCharacter.skills,
  editedCharacter.vigorDie,
  editedCharacter.edges,
  editedCharacter.hindrances,
  editedCharacter.equipment,
  isEditing
])
```

**Validation:**
- Use React Hook Form or manual validation
- Show error messages for invalid die values
- Highlight required fields

**Files to Modify:**
- `frontend/src/pages/CharacterSheet.tsx`
- `frontend/src/utils/derivedStats.ts` (if needed)

---

### Phase 6: Testing (30 min)

**Goal:** Comprehensive testing of all editing scenarios

**Test Cases:**

#### As GAME_MASTER:
- [ ] Login as gamemaster
- [ ] Open any character sheet
- [ ] Verify "Edit Character" button appears
- [ ] Click Edit, modify name, save
- [ ] Verify changes persist after page reload
- [ ] Edit skills (add new, remove existing, change die value)
- [ ] Edit edges (add, remove)
- [ ] Edit hindrances (add, remove)
- [ ] Edit equipment (add, remove, change quantity)
- [ ] Verify derived stats recalculate correctly
- [ ] Test cancel button (changes revert)
- [ ] Open another player's character, verify can edit

#### As PLAYER (player1):
- [ ] Login as player1
- [ ] Open own character (e.g., Mexicali Bob)
- [ ] Verify "Edit Character" button appears
- [ ] Edit character, save, verify changes persist
- [ ] Test all sections (skills, edges, hindrances, equipment, powers)
- [ ] Open another player's character (e.g., Cornelius)
- [ ] Verify "Edit Character" button does NOT appear
- [ ] Attempt to call PUT endpoint directly (should get 403)

#### As PLAYER (player2):
- [ ] Login as player2
- [ ] Open own character (e.g., Cornelius)
- [ ] Verify can edit own character
- [ ] Cannot edit player1's character (Mexicali Bob)

#### Edge Cases:
- [ ] Test with unauthenticated user (should get 401)
- [ ] Test network error handling (disconnect, try to save)
- [ ] Test validation errors (invalid die value, empty name)
- [ ] Test concurrent edits (if two users edit same character)
- [ ] Test very large characters (many skills, equipment)

**Test Accounts:**
- gamemaster / password (GAME_MASTER)
- player1 / password (PLAYER, owns character 1)
- player2 / password (PLAYER, owns character 2)
- player3 / password (PLAYER, owns character 3)

**Files to Test:**
- All modified backend and frontend files

---

### Phase 7: Authorization Edge Cases (15 min)

**Goal:** Ensure proper authorization feedback and edge case handling

**Tasks:**
- [ ] Display ownership indicator on character sheet:
  - "Your Character" if owned by current user
  - "Player: [username]" if owned by another player
  - GM always sees owner name
- [ ] Handle 403 error gracefully:
  - Show error message: "You don't have permission to edit this character"
  - Do not crash or show generic error
- [ ] Handle 401 error (session expired):
  - Redirect to login page
  - Preserve character ID to return after login
- [ ] Hide "Delete Character" button from players (only GM)
- [ ] Show role badge on character sheet header:
  - Gold badge for GM viewing
  - Silver badge for player viewing own
  - Gray badge for player viewing others

**UI Indicators:**
```tsx
<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
  <Typography variant="h4">{character.name}</Typography>

  {isOwner && (
    <Chip label="Your Character" color="primary" size="small" />
  )}

  {isGameMaster && !isOwner && (
    <Chip label={`Player: ${character.player?.username}`} color="secondary" size="small" />
  )}
</Box>
```

**Files to Modify:**
- `frontend/src/pages/CharacterSheet.tsx`

---

## Expected Deliverables

### Backend
- ✅ PUT /api/characters/{id} endpoint with ownership validation
- ✅ Cascade update support for nested entities (skills, edges, hindrances, equipment, powers)
- ✅ Orphan removal for deleted nested items
- ✅ Derived stats recalculation on update
- ✅ Proper error responses (403 for unauthorized, 404 for not found)

### Frontend
- ✅ "Edit Character" button on CharacterSheet (only for owners/GM)
- ✅ Edit mode toggle with inline editing for all sections
- ✅ Reusable selection components (SkillSelector, EdgeSelector, etc.)
- ✅ Real-time derived stats calculation during editing
- ✅ Save and cancel functionality
- ✅ Loading states and success/error messages
- ✅ Ownership indicators and role badges
- ✅ Proper authorization checks (canEdit logic)

### Testing
- ✅ All edit scenarios tested (GM and players)
- ✅ Ownership rules verified
- ✅ Derived stats recalculating correctly
- ✅ Error handling working (403, 401, network errors)
- ✅ Changes persist after page reload

---

## Files to Create

1. `frontend/src/components/character/SkillSelector.tsx`
2. `frontend/src/components/character/EdgeSelector.tsx`
3. `frontend/src/components/character/HindranceSelector.tsx`
4. `frontend/src/components/character/EquipmentSelector.tsx`
5. `frontend/src/components/character/ArcanePowerSelector.tsx`

---

## Files to Modify

### Backend
1. `backend/src/main/java/com/deadlands/campaign/controller/CharacterController.java`
2. `backend/src/main/java/com/deadlands/campaign/service/CharacterService.java`

### Frontend
3. `frontend/src/pages/CharacterSheet.tsx`
4. `frontend/src/pages/CharacterCreate.tsx`

---

## Success Criteria

- [ ] Game master can edit any character
- [ ] Players can edit only their own characters
- [ ] Attempting to edit another player's character shows proper error
- [ ] All character sections are editable (basic info, attributes, skills, edges, hindrances, equipment, powers)
- [ ] Derived stats auto-recalculate when relevant fields change
- [ ] Changes persist to database and survive page reload
- [ ] UI shows clear ownership indicators
- [ ] Edit and cancel buttons work correctly
- [ ] Loading states shown during save
- [ ] Success/error messages displayed appropriately

---

## Estimated Timeline

| Phase | Task | Time |
|-------|------|------|
| 1 | Backend Permission Verification | 15 min |
| 2 | Character Update Endpoint Enhancement | 30 min |
| 3 | Frontend Edit Mode UI | 60 min |
| 4 | Reuse CharacterCreate Components | 45 min |
| 5 | Validation & Auto-Calculation | 30 min |
| 6 | Testing | 30 min |
| 7 | Authorization Edge Cases | 15 min |
| **TOTAL** | | **3h 45min** |

---

## Notes for Next Session

### Current System State
- Character creation fully functional (9-step wizard)
- Character viewing works for all authorized users
- Backend has PUT endpoint but may need ownership validation
- Frontend has no edit mode yet (read-only character sheet)
- Derived stats calculation working in creation, need to add to editing

### Key Technical Decisions
- **Component Reuse:** Extract selection UIs from CharacterCreate to avoid duplication
- **Authorization:** Check both frontend (UI) and backend (API) for ownership
- **Derived Stats:** Recalculate on frontend before sending PUT request
- **Nested Entities:** Use cascade operations and orphan removal for clean updates

### Potential Challenges
- Handling orphan removal for deleted skills/edges/etc. (need to test cascade settings)
- Ensuring derived stats stay in sync during editing
- Complex state management in edit mode (many nested objects)
- Testing all authorization scenarios (GM, owner, non-owner)

### Helpful Commands
```bash
# Test backend locally
mvn spring-boot:run

# Test frontend locally
cd frontend && npm run dev

# Check database after edits
railway connect Postgres
\c deadlands
SELECT * FROM characters WHERE id = 1;
SELECT * FROM skills WHERE character_id = 1;

# View Railway logs
railway logs
```

---

**Ready to implement!** 🚀
