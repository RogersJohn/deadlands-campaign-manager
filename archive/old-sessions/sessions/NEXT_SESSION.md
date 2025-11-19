# Next Session - Character Editing & Deletion

**Priority:** HIGH
**Estimated Duration:** 3-4 hours
**Prerequisites:** ✅ All complete

---

## Session Goal

Implement full character editing and deletion functionality with interactive dropdown menus.

---

## User Requirements

From session 2025-11-07:

> "next we need to be able to edit and delete the characters from the front end, I want this to be fully interactive and have drop down menus were appropriate showing the player or gamemaster their options"

---

## Tasks

### 1. Character Editing Interface

**Functionality:**
- [ ] Create `CharacterEdit.tsx` component
- [ ] Implement form state management (React Hook Form)
- [ ] Add inline editing for all character fields
- [ ] Implement auto-save or explicit save button
- [ ] Add permission checks (user owns character OR user is GM)
- [ ] Auto-calculate derived stats on attribute/skill changes

**Dropdown Menus Required:**
- [ ] **Attributes** - Die selection (d4, d6, d8, d10, d12)
- [ ] **Skills** - Link to attribute, die selection, show default die
- [ ] **Occupation** - 80+ archetypes from reference data
- [ ] **Edges** - Filterable by type (Background, Combat, Social, etc.)
- [ ] **Hindrances** - Major/Minor with severity dropdown
- [ ] **Equipment** - Type dropdown (Weapon, Armor, Gear, etc.)
- [ ] **Arcane Powers** - Arcane background specific

**UI Features:**
- [ ] Tooltips showing requirements/descriptions from reference data
- [ ] Validation feedback (red border, error messages)
- [ ] Unsaved changes warning
- [ ] Loading states during save
- [ ] Success/error notifications

### 2. Character Deletion

**Functionality:**
- [ ] Add "Delete Character" button
- [ ] Implement confirmation dialog with character name validation
- [ ] Add permission checks (user owns character OR user is GM)
- [ ] Cascade deletion warning (show related entities)
- [ ] Handle backend DELETE endpoint
- [ ] Redirect to dashboard after successful deletion

**Confirmation Dialog:**
```
Are you sure you want to delete [Character Name]?

This will permanently delete:
- 19 skills
- 8 edges
- 3 hindrances
- 24 equipment items
- 5 arcane powers
- All wound records

Type the character name to confirm: [________]

[Cancel] [Delete Permanently]
```

### 3. Backend Authorization

**Endpoint Updates:**
- [ ] `PUT /api/characters/{id}` - Add ownership check
- [ ] `DELETE /api/characters/{id}` - Add ownership check
- [ ] Service layer validation (user is owner OR GM)
- [ ] Return 403 Forbidden if unauthorized
- [ ] Add audit logging for edit/delete operations

**Authorization Logic:**
```java
boolean canModify = (currentUser.getId().equals(character.getPlayer().getId())
                     || currentUser.getRole().equals(Role.GAME_MASTER));
```

### 4. Reference Data Integration

**Service Enhancements:**
- [ ] Fetch occupation list from archetypes
- [ ] Fetch skill list with linked attributes
- [ ] Fetch edge list with requirements
- [ ] Fetch hindrance list with severity
- [ ] Fetch equipment types
- [ ] Cache reference data in frontend

---

## Technical Approach

### Frontend Architecture

**Component Structure:**
```
CharacterEdit/
├── CharacterEditForm.tsx       (Main form container)
├── AttributeEditor.tsx         (Attribute die dropdowns)
├── SkillsEditor.tsx           (Skills with linked attributes)
├── EdgesEditor.tsx            (Edge selection with tooltips)
├── HindrancesEditor.tsx       (Hindrance selection)
├── EquipmentEditor.tsx        (Equipment list with inline edit)
├── PowersEditor.tsx           (Arcane power selection)
└── DeleteCharacterDialog.tsx  (Confirmation dialog)
```

**State Management:**
- Use React Hook Form for form state
- Use React Query for data fetching and mutations
- Optimistic updates for better UX
- Revalidate character list after save/delete

**Dropdown Implementation:**
```tsx
// Example: Attribute Die Dropdown
<FormControl fullWidth>
  <InputLabel>Agility</InputLabel>
  <Select value={character.agility_die} onChange={handleAgilityChange}>
    <MenuItem value="d4">d4 (-2)</MenuItem>
    <MenuItem value="d6">d6 (-1)</MenuItem>
    <MenuItem value="d8">d8 (0)</MenuItem>
    <MenuItem value="d10">d10 (+1)</MenuItem>
    <MenuItem value="d12">d12 (+2)</MenuItem>
    <MenuItem value="d12+1">d12+1 (+3)</MenuItem>
  </Select>
</FormControl>
```

### Backend Updates

**Character Controller:**
```java
@PutMapping("/{id}")
public ResponseEntity<Character> updateCharacter(
    @PathVariable Long id,
    @RequestBody Character updatedCharacter,
    @AuthenticationPrincipal UserDetails userDetails
) {
    // Check authorization
    if (!characterService.canUserModifyCharacter(id, userDetails.getUsername())) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    // Update character
    Character character = characterService.updateCharacter(id, updatedCharacter);
    return ResponseEntity.ok(character);
}

@DeleteMapping("/{id}")
public ResponseEntity<Void> deleteCharacter(
    @PathVariable Long id,
    @AuthenticationPrincipal UserDetails userDetails
) {
    // Check authorization
    if (!characterService.canUserModifyCharacter(id, userDetails.getUsername())) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    characterService.deleteCharacter(id);
    return ResponseEntity.noContent().build();
}
```

**Character Service:**
```java
public boolean canUserModifyCharacter(Long characterId, String username) {
    Character character = characterRepository.findById(characterId)
        .orElseThrow(() -> new ResourceNotFoundException("Character not found"));

    User user = userRepository.findByUsername(username)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    // User is character owner OR user is GM
    return character.getPlayer().getId().equals(user.getId())
           || user.getRole().equals(Role.GAME_MASTER);
}
```

---

## Testing Checklist

### Editing Tests
- [ ] Player can edit their own character
- [ ] Player cannot edit other players' characters
- [ ] GM can edit any character
- [ ] Dropdowns populate correctly from reference data
- [ ] Tooltips show correct descriptions
- [ ] Derived stats recalculate on attribute/skill changes
- [ ] Form validation works (required fields, valid values)
- [ ] Unsaved changes warning prevents navigation
- [ ] Save success shows notification
- [ ] Save error shows error message

### Deletion Tests
- [ ] Player can delete their own character
- [ ] Player cannot delete other players' characters
- [ ] GM can delete any character
- [ ] Confirmation dialog requires typing character name
- [ ] Cascade deletion works (skills, edges, equipment, etc. deleted)
- [ ] Character removed from character list after deletion
- [ ] Redirects to dashboard after successful deletion

---

## Reference Documentation

- `docs/development/CHARACTER_EDITING_PLAN.md` - Original planning document
- `docs/development/WIKI_IMPLEMENTATION.md` - Reference for permission system
- `frontend/src/services/referenceService.ts` - Reference data fetching
- `frontend/src/pages/CharacterCreate.tsx` - Example of dropdown implementation

---

## Estimated Time Breakdown

1. **Character Editing Form** - 2 hours
   - Form setup and state management - 30 min
   - Dropdown components with reference data - 1 hour
   - Validation and error handling - 30 min

2. **Backend Authorization** - 30 minutes
   - Add ownership checks to PUT/DELETE - 15 min
   - Test authorization logic - 15 min

3. **Character Deletion** - 1 hour
   - Delete button and confirmation dialog - 30 min
   - Backend cascade deletion - 15 min
   - Testing and error handling - 15 min

4. **Testing & Polish** - 30 minutes
   - End-to-end testing - 20 min
   - Bug fixes and polish - 10 min

**Total:** 4 hours

---

## Success Criteria

✅ Players can edit their own characters
✅ GM can edit all characters
✅ All fields editable with appropriate input types
✅ Dropdowns populate from reference data
✅ Tooltips show descriptions/requirements
✅ Derived stats auto-calculate
✅ Form validation prevents invalid data
✅ Players can delete their own characters
✅ GM can delete any character
✅ Confirmation dialog prevents accidental deletion
✅ Authorization prevents unauthorized edits/deletes

---

## Notes

- Mobile responsiveness should be tested (dropdowns on small screens)
- Consider adding "Duplicate Character" feature in future
- Consider adding "Character History" (version tracking) in future
- Equipment editing might need special handling (quantity, is_equipped)
- Arcane powers should filter by character's arcane background
