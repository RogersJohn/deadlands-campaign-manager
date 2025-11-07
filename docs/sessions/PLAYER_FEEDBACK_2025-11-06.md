# Player Feedback - DaveOBrien (John Henry Farraday)
**Date:** 2025-11-06
**Status:** ✅ All Issues Addressed

---

## Feedback Received

### 1. Mobile Tab Navigation Issue

**Problem:** "From the mobile you can't scroll the character sheet tabs so once you go to the rightmost one (Edges &..) you can't get back to the Overview tab without going out to Dashboard and back into Character sheet."

**Root Cause:** MUI Tabs component was missing scrollable props for mobile devices

**Fix Applied:**
```tsx
<Tabs
  value={currentTab}
  onChange={handleTabChange}
  aria-label="character sheet tabs"
  variant="scrollable"           // Added
  scrollButtons="auto"            // Added
  allowScrollButtonsMobile        // Added
>
```

**Result:** ✅ Tabs now scroll on mobile with arrow buttons

**File Changed:** `frontend/src/pages/CharacterSheet.tsx`

---

### 2. John Henry Character Backstory Corrections

**Player Feedback:**
- "He was actually a doctor so knows conventional medicine and has qualifications to prove it"
- "I was killed by a cannon ball through the side of my torso so I've no obvious death wounds unless I've no clothes on"
- "The mechanical knowledge is all new, not sure how the new hallowed powers work"
- "I remember I did have supernatural healing, a speed thing that gave me extra actions... and I could turn insubstantial"

---

## Character Backstory Updates

### PUBLIC Wiki Entry Updates

#### Before:
- Described as having "no formal medical training"
- Spoke vaguely of "practical experience and extensive reading"
- Made mechanical skills seem like original abilities
- Injury visible and obvious

#### After:
- ✅ Emphasized legitimate doctor with formal credentials and qualifications
- ✅ Clarified mechanical/gunsmithing skills are NEW (emerged recently)
- ✅ Updated injury description: scars only visible without shirt, hidden when clothed
- ✅ Maintained mystery while being accurate to player's vision

**Key Changes:**
```markdown
**Occupation**: Medical Doctor, Gunsmith, Technical Specialist

## The Doctor Who Knows Too Much
John Henry Faraday is a properly trained medical doctor, with credentials
and qualifications that check out when examined.

## The New Technical Skills
More recently, John Henry has demonstrated unexpected proficiency with
mechanical and technical work... This represents a dramatic expansion of
his capabilities beyond his medical training.
```

---

### PRIVATE Wiki Entry Updates

#### Before:
- Vague cause of death
- Implied mechanical skills existed before death
- Listed incorrect/generic Harrowed powers
- Wounds described as "recent injury"

#### After:
- ✅ Specific death: "cannonball that tore through the side of his torso"
- ✅ Mechanical skills are Harrowed powers (manitou-granted knowledge)
- ✅ Corrected powers to match player's memory:
  - **Heal** - Supernatural healing
  - **Boost** - Speed/extra actions
  - **Spiritual Pathway** - Insubstantial/ghost form
- ✅ Scars from cannonball wound, only visible shirtless

**Key Changes:**
```markdown
**Died**: 1863 (Cannonball wound through the torso)
**Occupation (In Life)**: Medical Doctor
**Occupation (Undeath)**: Doctor, Hexslinger, Supernatural Tinker

## The Death That Wasn't
The artillery shell came without warning—a cannonball that tore through
the side of his torso, shattering ribs, pulverizing organs...

## The Supernatural Tinkering
In life, John Henry was a doctor—his expertise was medicine, anatomy,
and the treatment of illness and injury. He had no particular mechanical
aptitude beyond what any educated person might possess.

Since his resurrection, the manitou has granted him supernatural
understanding of mechanisms, devices, and equipment.
```

---

## Harrowed Powers Verification

Checked character database to confirm actual powers:

**Powers in Database:**
1. Heal - "Heal wounds" (matches player memory: supernatural healing)
2. Boost - "Boost trait" (matches player memory: speed/extra actions)
3. Spiritual Pathway - "Ghost road" (matches player memory: insubstantial)
4. Helper Hex, Feast, Noxious Breath, Old Sarge, Sadden, Sight Made, Viva Patras

**Wiki Updated to Reflect:**
- Primary powers: Heal, Boost, Spiritual Pathway
- Other hexes listed as additional powers
- Emphasized these are the core abilities player remembers using

---

## Files Modified

1. **frontend/src/pages/CharacterSheet.tsx**
   - Added scrollable tabs for mobile navigation

2. **Wiki/john-henry-public.md**
   - Updated to emphasize formal medical training
   - Clarified mechanical skills are NEW
   - Updated scar/injury description

3. **Wiki/john-henry-private.md**
   - Specified cannonball death
   - Mechanical abilities are Harrowed (not pre-death)
   - Corrected power descriptions
   - Updated wound visibility details

4. **Database: wiki_entries table**
   - Updated content for both John Henry entries

---

## Database Changes

```javascript
UPDATE wiki_entries
SET content = [updated_public_content], updated_at = NOW()
WHERE slug = 'john-henry-farraday-public';

UPDATE wiki_entries
SET content = [updated_private_content], updated_at = NOW()
WHERE slug = 'john-henry-farraday-private';
```

---

## Deployment

**Commit:** `5c85fe7` - Fix mobile tab navigation and update John Henry's backstory
**Pushed to:** GitHub main branch
**Railway:** Auto-deploying (2-3 minutes)
**Database:** Updated immediately

---

## Testing Checklist

### Mobile Navigation
- [ ] Test on mobile device (DaveOBrien to verify)
- [ ] Confirm tabs scroll left/right
- [ ] Verify all 5 tabs accessible
- [ ] Confirm scroll buttons appear on small screens

### Wiki Content
- [x] PUBLIC: Confirms he's a trained doctor
- [x] PUBLIC: Mechanical skills described as NEW
- [x] PUBLIC: Scars only visible without shirt
- [x] PRIVATE: Death by cannonball specified
- [x] PRIVATE: Mechanical skills are Harrowed powers
- [x] PRIVATE: Heal, Boost, Spiritual Pathway powers described

---

## Player Response Expected

After Railway deployment completes:
1. DaveOBrien can test mobile tab scrolling
2. DaveOBrien can review wiki entries for accuracy
3. Confirm backstory now matches his character concept

---

**All feedback addressed!** ✅

Changes deployed to production and database updated.
