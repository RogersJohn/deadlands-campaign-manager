# John Henry Farraday Character Rebalance

**Date:** 2025-11-06
**Reason:** Character had incorrect skills that didn't match original concept
**Status:** ✅ Complete

---

## Problem Identified

The character database included **gunsmithing and mechanical skills** that were never part of the original character concept. Neither the GM nor the player remembered John Henry being a gunsmith, mechanic, or tinkerer.

**Original Concept:**
- Doctor (medical training)
- Hexslinger (Huckster - card-based magic)
- Harrowed (undead with manitou)
- Gunfighter (good with firearms)

**What Was Wrong:**
- Had Tinkerin' d12 (gunsmithing/mechanical skill)
- Wiki described him as a "gunsmith" and "inventor"
- Wiki referenced "Mad Science" and mechanical abilities
- Various other skills that didn't fit the concept

---

## Skills Removed (10 total)

### Primary Issue
- **Tinkerin' d12** - Gunsmithing/mechanical skill (NOT part of concept)

### Other Removed Skills
- **Artillery d8** - Doesn't fit doctor/hexslinger concept
- **Demolition d6** - Doesn't fit
- **Bow d8** - He's a gunfighter, not an archer
- **Lockpickin' d8** - Doesn't fit doctor concept
- **Science d6** - Generic science (Medicine covers medical science)
- **Survival d12** - Oddly high for a doctor
- **Climbin' d8** - Not essential
- **Throwin' d8** - Not essential for gunfighter
- **Arts d6** - Doesn't fit

**Skills reduced from 29 → 19**

---

## Skills Retained (19 total)

### Doctor Skills (4)
- **Medicine d12** - Medical treatment (primary profession)
- **Scrutinize d8** - Diagnosis and observation
- **Search d8** - Finding things
- **Academia d6** - Medical education background

### Hexslinger (Huckster) Skills (4)
- **Faith d12** - Casting hexes (Huckster powers)
- **Gamblin' d8** - Card games (Huckster theme)
- **Sleight o' Hand d12** - Card tricks (Huckster theme)
- **Bluff d8** - Deception (Huckster theme)

### Gunfighter Skills (4)
- **Shootin' d12** - Primary combat skill
- **Speed Load d8** - Quick reloading
- **Dodge d8** - Combat defense
- **Fightin' d6** - Hand-to-hand combat

### Harrowed/Survival Skills (5)
- **Guts d12** - Horror resistance (critical for Harrowed)
- **Streetwise d8** - Urban survival
- **Scroungin' d8** - Finding resources
- **Trackin' d8** - Following trails
- **Ridicule d8** - Social combat

### General Skills (2)
- **Area Knowledge d6** - Local geography
- **Drivin' d6** - Wagon/coach driving

---

## Wiki Entries Completely Rewritten

### PUBLIC Wiki Changes

**Before:**
- Described as "Gunsmith, Inventor, Medical Practitioner"
- Sections about "The Gunsmith's Trade" and "The Equipment Crafter"
- Referenced workshop, precision tools, firearms modification
- Implied mechanical expertise was original

**After:**
- **Occupation: Medical Doctor**
- Sections: "The Doctor", "The Gambler", "The Gunfighter"
- Focus on medical practice, card playing, combat skills
- Gambling explained as card sharp/Huckster theme
- Gunfighting as frontier necessity, not explained deeply
- **NO gunsmithing or mechanical references**

### PRIVATE Wiki Changes

**Before:**
- Sections on "Mad Science" and "The Supernatural Tinkering"
- Implied mechanical/tinkering abilities
- Vague about how gambling fits character

**After:**
- **True Nature: Doctor, Hexslinger (Huckster), Undead Gunfighter**
- Section: "The Hexes: Huckster's Dark Art"
- Explains gambling as **Huckster manifestation** (card-based hexslinging)
- "The Card Sharp's Skills" - supernatural proficiency granted by manitou
- "The Gunfighter's Reflexes" - enhanced by Harrowed condition
- **NO Mad Science or mechanical abilities**
- Powers clearly listed: Heal, Boost, Spiritual Pathway (and others)

**Key Addition:**
```
"In life, John Henry had no particular talent for gambling or card
manipulation—he was a doctor, focused on medicine and healing. Since
his resurrection, the manitou has granted him supernatural proficiency
with cards and games of chance."
```

---

## Character Concept Summary

### What John Henry IS:
✅ **Doctor** - Trained physician with Medicine d12
✅ **Hexslinger (Huckster)** - Card-based magic user with Faith d12
✅ **Harrowed** - Undead animated by manitou, with supernatural powers
✅ **Gunfighter** - Skilled with firearms (Shootin' d12)
✅ **Card Sharp** - Gambling ability is Huckster manifestation
✅ **Dangerous** - Combat-capable due to Harrowed resilience

### What John Henry is NOT:
❌ Gunsmith
❌ Mechanic
❌ Tinkerer
❌ Inventor
❌ Mad Scientist
❌ Equipment crafter

---

## Edges (Unchanged)

John Henry's edges remain the same and support the correct concept:

- **Arcane Background** (SUPERNATURAL) - Hexslinger powers
- **Huckster** (SUPERNATURAL) - Card-based hexslinging
- **Brave** (BACKGROUND) - Fearless
- **Fast Healer** (BACKGROUND) - Fits Harrowed healing
- **Cat Eyes** (BACKGROUND) - Night vision
- **Purty** (BACKGROUND) - Charismatic
- **Thick Skull** (BACKGROUND) - Tough

**All edges fit the Doctor/Hexslinger/Harrowed/Gunfighter concept.**

---

## Arcane Powers (Unchanged)

John Henry's hexes remain accurate:

### Primary Powers (Remembered by Player)
- **Heal** - Supernatural healing
- **Boost** - Speed/extra actions
- **Spiritual Pathway** - Insubstantial/ghost form

### Additional Hexes
- Helper Hex, Feast, Noxious Breath, Old Sarge, Sadden, Sight Made, Viva Patras

**All hexes are Huckster-style powers, consistent with the concept.**

---

## Character XP

**Current:**
- Total XP: 131
- Spent XP: 121
- Unspent XP: 10

**Note:** Removing 10 skills doesn't affect XP totals. This rebalancing corrects concept errors, not XP calculation. The character was built with some incorrect skills that are now removed.

---

## Database Changes Applied

```sql
-- Removed 10 skills from John Henry (character_id = 4)
DELETE FROM skills WHERE character_id = 4 AND name IN (
  'Tinkerin'', 'Artillery', 'Demolition', 'Bow', 'Lockpickin'',
  'Science', 'Survival', 'Climbin'', 'Throwin'', 'Arts'
);

-- Updated public wiki entry
UPDATE wiki_entries
SET content = [new_public_content], updated_at = NOW()
WHERE slug = 'john-henry-farraday-public';

-- Updated private wiki entry
UPDATE wiki_entries
SET content = [new_private_content], updated_at = NOW()
WHERE slug = 'john-henry-farraday-private';
```

---

## Files Modified

1. **Database: skills table** - Deleted 10 skills for character_id = 4
2. **Database: wiki_entries table** - Updated 2 wiki entries
3. **Wiki/john-henry-public.md** - Completely rewritten
4. **Wiki/john-henry-private.md** - Completely rewritten

---

## Player Communication

**For DaveOBrien (John Henry's player):**

Your character has been rebalanced to match the original concept. The database had incorrect gunsmithing/mechanical skills that were never part of your character.

**What Changed:**
- Removed Tinkerin' and other mechanical skills
- Wiki now focuses on: Doctor, Card Sharp (Huckster), Gunfighter
- Gambling ability explained as Huckster hexslinging manifestation
- Gunfighting explained as Harrowed-enhanced reflexes
- All gunsmithing/mechanical references removed

**What Stayed the Same:**
- All your medical skills (Medicine d12)
- All your hexslinging powers (Heal, Boost, Spiritual Pathway)
- All your gunfighting skills (Shootin' d12)
- All your edges (Huckster, Arcane Background, etc.)
- Your character concept: Doctor, Hexslinger, Harrowed, Gunfighter

**Character now accurately reflects: Doctor who's secretly a Harrowed Hexslinger and dangerous gunfighter.**

---

## Verification

To verify the rebalancing:

1. **Check Character Sheet:**
   - Should have 19 skills (down from 29)
   - No Tinkerin' skill
   - Medicine d12, Faith d12, Shootin' d12 still present

2. **Check Wiki Entries:**
   - PUBLIC: Describes doctor, gambler, gunfighter
   - PRIVATE: Explains Huckster hexslinging, Harrowed powers
   - NO gunsmithing or mechanical references

3. **Character Concept:**
   - Doctor ✓
   - Hexslinger (Huckster) ✓
   - Harrowed ✓
   - Gunfighter ✓

---

**Rebalancing Complete!** ✅

John Henry Farraday now accurately represents the character as originally conceived: a doctor who's secretly an undead Huckster hexslinger with dangerous gunfighting skills, not a gunsmith or mechanic.

**Commit:** `aef2675` - Rebalance John Henry character - remove gunsmithing/mechanical skills
**Deployed:** GitHub pushed, Railway auto-deploying
