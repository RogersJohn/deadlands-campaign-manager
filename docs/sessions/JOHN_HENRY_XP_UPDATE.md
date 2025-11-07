# John Henry XP Update - 2025-11-06

**Date:** 2025-11-06
**Reason:** Character rebalancing removed skills, giving him 30 XP to spend
**Status:** ✅ Complete

---

## XP Adjustment Needed

After removing 10 inappropriate skills from John Henry, his spent XP decreased significantly:

**Before Rebalancing:**
- Spent XP: 121
- Total XP: 131
- Unspent XP: 10

**After Removing 10 Skills:**
- Removed Skills Cost: 21 XP
- New Spent XP: 121 - 21 = **100 XP**

**Comparison to Mexicali Bob:**
- Mexicali Bob: 120 XP spent
- John Henry: 100 XP spent
- **Shortfall: -20 XP**

---

## Solution: 30 Unspent XP

To maintain character balance while reflecting his simpler, more focused skill set:

**New XP Values:**
- **Spent XP: 100** (reflects actual skills)
- **Unspent XP: 30** (advancement pool)
- **Total XP: 130** (matches Mexicali Bob)

---

## Comparison

| Character | Spent XP | Unspent XP | Total XP | Skills |
|-----------|----------|------------|----------|--------|
| **Mexicali Bob** | 120 | 10 | 130 | 33 |
| **John Henry** | 100 | 30 | 130 | 19 |

---

## Character Philosophy

**Mexicali Bob:**
- More experienced/complex character
- 33 skills covering many areas
- 10 XP for future advancement

**John Henry:**
- Simpler, more focused character
- 19 core skills (Doctor, Hexslinger, Harrowed, Gunfighter)
- 30 XP to customize during campaign
- Can add skills as player discovers character's needs

---

## Skills Breakdown

**John Henry's 19 Skills:**

**Doctor (4):** Medicine d12, Scrutinize d8, Search d8, Academia d6
**Hexslinger (4):** Faith d12, Gamblin' d8, Sleight o' Hand d12, Bluff d8
**Gunfighter (4):** Shootin' d12, Speed Load d8, Dodge d8, Fightin' d6
**Harrowed/Survival (5):** Guts d12, Streetwise d8, Scroungin' d8, Trackin' d8, Ridicule d8
**General (2):** Area Knowledge d6, Drivin' d6

**What 30 XP Can Buy:**
- 5-7 new skills at d6-d8
- Upgrade 3-4 existing skills by 1-2 die steps
- Mix of new skills and upgrades
- Flexibility for player choices

---

## Database Update

```sql
UPDATE characters
SET spent_xp = 100, total_xp = 130, updated_at = NOW()
WHERE name = 'John Henry Farraday';
```

**Result:**
- Spent XP: 121 → 100
- Total XP: 131 → 130
- Unspent XP: 10 → 30

---

## Benefits

1. **Accurate Accounting:** Spent XP reflects actual skills
2. **Character Balance:** Same total XP as other characters
3. **Player Agency:** 30 XP allows customization during play
4. **Focused Concept:** Core skills match Doctor/Hexslinger/Harrowed/Gunfighter
5. **Room to Grow:** Player can add skills as character needs become clear

---

## For DaveOBrien

Your character now has:
- **100 XP spent** on current skills (Doctor, Hexslinger, Harrowed, Gunfighter)
- **30 XP available** to spend on advancement
- Same total XP as other characters (130 XP)

**You can use the 30 XP to:**
- Add new skills your character needs
- Improve existing skills
- Purchase additional edges
- Customize as you discover what the character needs in play

---

**Update Complete!** ✅

John Henry has balanced XP with room for player-driven customization.
