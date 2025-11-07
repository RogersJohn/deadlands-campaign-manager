# 🚨 Fix Railway Production Database NOW

**Issue:** Railway production database still has OLD Deadlands Classic format (2d12, 3d12, etc.)
**Solution:** Run `fix-railway-characters.sql` on Railway Postgres database
**Time Required:** 2 minutes

---

## ✅ What's Already Done

1. ✅ **Code is correct** - All code uses Savage Worlds format
2. ✅ **data.sql is correct** - File has proper Savage Worlds data
3. ✅ **Pushed to GitHub** - All changes committed and pushed
4. ❌ **Railway database needs manual update** - Production DB still has old data

---

## 🚀 Quick Fix (Option 1) - Run SQL Script

### Step 1: Connect to Railway
```bash
railway login
railway link
# Select: rogersjohn's Projects → illustrious-solace
railway connect Postgres
```

### Step 2: Run the Fix Script
Once connected to Postgres, run:
```sql
\i fix-railway-characters.sql
```

**OR** copy and paste the contents of `fix-railway-characters.sql` directly into the psql prompt.

### Step 3: Verify
```sql
SELECT id, name, agility_die, smarts_die, spirit_die, strength_die, vigor_die
FROM characters
ORDER BY id;
```

You should see:
```
 id |           name            | agility_die | smarts_die | spirit_die | strength_die | vigor_die
----+---------------------------+-------------+------------+------------+--------------+-----------
  1 | Mexicali Bob              | d10         | d8         | d12        | d10          | d8
  2 | Cornelius Wilberforce III | d10         | d12        | d6         | d10          | d10
  3 | Doc Emett Von Braun       | d8          | d12        | d8         | d6           | d10
  4 | John Henry Farraday       | d10         | d12        | d12        | d4           | d10
  5 | Jack Horner               | d10         | d4         | d4         | d6           | d4
  6 | Lucas Turner              | d10         | d4         | d4         | d6           | d4
  7 | George C Dobbs            | d4          | d4         | d4         | d4           | d4
```

---

## 🔄 Alternative Fix (Option 2) - Force Railway Rebuild

If you want Railway to use the new `data.sql` automatically:

### Step 1: Drop and Recreate Database
**⚠️ WARNING: This will DELETE all data and recreate from data.sql**

```bash
railway link
railway connect Postgres
```

Then in psql:
```sql
-- Drop all tables
DROP TABLE IF EXISTS wounds CASCADE;
DROP TABLE IF EXISTS arcane_powers CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS hindrances CASCADE;
DROP TABLE IF EXISTS edges CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS characters CASCADE;
DROP TABLE IF EXISTS users CASCADE;
-- Drop reference tables
DROP TABLE IF EXISTS skill_references CASCADE;
DROP TABLE IF EXISTS edge_references CASCADE;
DROP TABLE IF EXISTS hindrance_references CASCADE;
DROP TABLE IF EXISTS equipment_references CASCADE;
DROP TABLE IF EXISTS arcane_power_references CASCADE;
```

### Step 2: Restart Backend Service
Railway will auto-recreate tables from `data.sql` on next startup:
```bash
# In Railway dashboard:
# Backend service → Restart
```

---

## 📋 What the Fix Script Does

The `fix-railway-characters.sql` script will:

1. ✅ Update all 7 characters with correct Savage Worlds attributes (d4-d12 format)
2. ✅ Fix John Henry Farraday's Charisma to +2 (Purty edge)
3. ✅ Convert all ~180 skills from XdY to dY notation
4. ✅ Update Parry and Toughness calculations
5. ✅ Show verification queries to confirm changes

---

## 🔍 Expected Results After Fix

### Before (❌ Current State in Railway)
```
John Henry Farraday:
  Agility: 2d12    ← WRONG (multiple dice)
  Smarts: 3d12     ← WRONG
  Spirit: 3d12     ← WRONG
  Strength: 1d6    ← WRONG
  Vigor: 4d8       ← WRONG
  Charisma: +0     ← WRONG (should be +2)
```

### After (✅ Fixed State)
```
John Henry Farraday:
  Agility: d10     ← CORRECT (single die)
  Smarts: d12      ← CORRECT
  Spirit: d12      ← CORRECT
  Strength: d4     ← CORRECT
  Vigor: d10       ← CORRECT
  Charisma: +2     ← CORRECT (Purty edge)
```

---

## ⚡ Fastest Method

**If you're comfortable with Railway CLI:**

```bash
# 1-minute fix
railway login
railway link
railway connect Postgres

# Once in psql, copy/paste from fix-railway-characters.sql
# Then verify:
SELECT id, name, agility_die, smarts_die FROM characters ORDER BY id;

# Should show d4, d6, d8, d10, d12 (NOT 2d12, 3d8, etc.)
```

---

## 🎯 Verification Checklist

After running the fix script, verify in production:

1. [ ] Open https://deadlands-frontend.up.railway.app
2. [ ] Login as gamemaster / password
3. [ ] Open John Henry Farraday character sheet
4. [ ] Verify attributes show:
   - [ ] Agility: **d10** (not 2d12)
   - [ ] Smarts: **d12** (not 3d12)
   - [ ] Spirit: **d12** (not 3d12)
   - [ ] Strength: **d4** (not 1d6)
   - [ ] Vigor: **d10** (not 4d8)
   - [ ] Charisma: **+2** (not +0)
5. [ ] Check Skills tab - should show d4, d6, d8, d10, d12 (NOT XdY format)
6. [ ] Check other characters - all should show single die notation

---

## 🐛 Troubleshooting

### Issue: "railway: command not found"
**Solution:** Install Railway CLI:
```bash
npm install -g @railway/cli
```

### Issue: "cannot connect to postgres"
**Solution:** Make sure you're linked to the right project:
```bash
railway link
# Select: rogersjohn's Projects → illustrious-solace
railway status  # Verify you're connected
```

### Issue: "No such file: fix-railway-characters.sql"
**Solution:** The file is in the project root:
```bash
cd C:\Users\roger\Documents\GitHub\deadlands-campaign-manager
railway connect Postgres
\i fix-railway-characters.sql
```

### Issue: Script runs but characters still show wrong format
**Solution:** Hard refresh the browser:
- Chrome/Edge: Ctrl+Shift+R
- Or clear Railway cache and reload

---

## 📞 Need Help?

If you encounter issues:
1. Check Railway logs: `railway logs`
2. Verify database connection: `railway variables`
3. Check if backend restarted: Railway dashboard → Backend service

---

**Status:** ⚠️ **ACTION REQUIRED**
**Priority:** HIGH
**Time Required:** 2 minutes
**Risk Level:** LOW (script only updates, doesn't delete)

---

**Once the fix is applied, all characters will display correctly in Savage Worlds format! 🎉**
