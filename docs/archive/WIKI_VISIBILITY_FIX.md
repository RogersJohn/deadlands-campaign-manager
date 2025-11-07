# Wiki Visibility Fix - 2025-11-06

## Issue

When DaveOBrien (player4, John Henry Farraday) logged in, he could see:
- ✅ Mexicali Bob's public profile
- ❌ NOT seeing Cornelius or Jack Horner's public profiles

## Root Cause

Two character bio wiki entries were incorrectly set as `CHARACTER_SPECIFIC` when they should have been `PUBLIC`:
- `cornelius-bio.md` - No "private" keyword in filename
- `jack-horner-bio.md` - No "private" keyword in filename

The filenames did not contain "private" or "secret" keywords, so they should have been visible to all players.

---

## New Rule

**Wiki Visibility Rule:**
- If filename contains **"private"** or **"secret"** → `CHARACTER_SPECIFIC` (only owner + GM can see)
- Otherwise → `PUBLIC` (all players can see)

---

## What Was Fixed

### 1. Database Updated

Changed visibility for two entries from `CHARACTER_SPECIFIC` → `PUBLIC`:

| Entry | Before | After |
|-------|--------|-------|
| Cornelius Wilberforce III - Biography | CHARACTER_SPECIFIC ❌ | PUBLIC ✅ |
| Jack Horner - The Old Prospector | CHARACTER_SPECIFIC ❌ | PUBLIC ✅ |

### 2. Import Script Fixed

Updated `import-wiki.js` to correctly categorize these entries as PUBLIC for future imports.

---

## Current Wiki Visibility

### PUBLIC Entries (All Players Can See)

**Campaign Lore:**
1. The Great Civil War
2. The Great Railroad Race
3. Global Affairs & The Weird West

**Character Bios (Public):**
4. Mexicali Bob - Public Profile
5. John Henry Farraday - Public Profile
6. Cornelius Wilberforce III - Biography ✅ **NOW PUBLIC**
7. Jack Horner - The Old Prospector ✅ **NOW PUBLIC**

**Total:** 7 public wiki entries

### CHARACTER_SPECIFIC Entries (Owner + GM Only)

1. Mexicali Bob - Private Background (only player2 + GM)
2. John Henry Farraday - Secret Past (only DaveOBrien + GM)

---

## Verification

After this fix, when **DaveOBrien** logs in, he should now see:

✅ All 3 campaign lore entries
✅ All 4 public character bios (including Cornelius and Jack Horner)
✅ John Henry's private entry (his own character)
❌ Mexicali Bob's private entry (not his character)

**Total visible to DaveOBrien:** 8 wiki entries (7 public + 1 his own private)

---

## Commands Run

```bash
# Updated database
node fix-wiki-visibility.js

# Updated import script
git add import-wiki.js
git commit -m "Fix wiki visibility: character bios without 'private' keyword are now PUBLIC"
git push origin main
```

---

## Files Changed

1. **Database** - Updated `wiki_entries` table (entries #8 and #9)
2. **import-wiki.js** - Fixed visibility settings for cornelius-bio and jack-horner-bio

---

## Testing

To verify the fix works:

1. Log in as **DaveOBrien** (player4)
2. Go to Wiki page
3. Count entries - should see **8 total**:
   - 3 campaign lore entries
   - 4 public character bios
   - 1 private entry (John Henry's secret)

---

**Fixed:** 2025-11-06
**Committed:** bdb7a1c
**Status:** ✅ Complete - Database and code updated
