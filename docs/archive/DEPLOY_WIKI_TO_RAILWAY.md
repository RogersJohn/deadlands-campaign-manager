# Deploying Wiki System to Railway

**Goal:** Get the wiki system running on your Railway app
**Time:** 10-15 minutes

---

## Step 1: Install Frontend Dependencies Locally

First, add the markdown rendering library to your frontend:

```bash
cd frontend
npm install react-markdown
```

This updates `package.json` which Railway will use to install dependencies.

---

## Step 2: Commit All Changes

Add and commit all the new wiki files to git:

```bash
# From project root
git add .
git status  # Review what's being added
git commit -m "Add wiki system with access control

- WikiEntry and WikiAccess entities
- WikiController with permission checking
- Wiki frontend with markdown rendering
- Import script for markdown files
- Support for public, character-specific, and private entries
- GM can grant access to private entries"
```

---

## Step 3: Push to GitHub

Push your changes to trigger Railway deployment:

```bash
git push origin main
```

Railway will automatically detect the push and start deploying.

---

## Step 4: Wait for Railway Deployment

1. Go to your Railway dashboard: https://railway.app/dashboard
2. Click on your project "illustrious-solace"
3. Watch the deployment logs
4. Wait for **"Build successful"** and **"Deployment successful"**

The backend will automatically:
- Create the `wiki_entries` table
- Create the `wiki_access` table

---

## Step 5: Import Wiki Files to Railway Database

Once deployment is complete, import your markdown files:

```bash
# From project root
DATABASE_URL="postgresql://postgres:MIYRwGqttlrIeJSvgYWstxkmvxRXtMBt@centerbeam.proxy.rlwy.net:31016/railway" node import-wiki.js
```

You should see output like:

```
✅ Connected to database

📚 Importing wiki entries:

🌍 [1] The Great Civil War (CAMPAIGN_LORE)
🌍 [2] The Great Railroad Race (CAMPAIGN_LORE)
🌍 [3] Global Affairs & The Weird West (CAMPAIGN_LORE)
🌍 [4] Mexicali Bob - Public Profile (CHARACTER_BIO)
🌍 [5] John Henry Farraday - Public Profile (CHARACTER_BIO)
👤 [6] Mexicali Bob - Private Background (CHARACTER_BIO)
👤 [7] John Henry Farraday - Secret Past (CHARACTER_BIO)
👤 [8] Cornelius Wilberforce III - Biography (CHARACTER_BIO)
👤 [9] Jack Horner - The Old Prospector (CHARACTER_BIO)

✅ Import complete!
   Imported: 9
   Skipped: 0
```

---

## Step 6: Test the Wiki

1. Go to your Railway app URL (e.g., `https://your-app.railway.app`)
2. Log in as a **player**
3. Click **"Wiki"** in the navigation
4. You should see:
   - ✅ All public entries (Civil War, Railroad Race, etc.)
   - ✅ Your character's private entry (if you own a character)
   - ❌ Other characters' private entries (hidden)

5. Log in as **Game Master**
6. You should see **ALL** wiki entries

---

## Step 7: Verify Access Control

Test that permissions work correctly:

### As Mexicali Bob's Player (player1):
- ✅ Can see Bob's public bio
- ✅ Can see Bob's private bio
- ❌ Cannot see John Henry's private bio
- ❌ Cannot see Cornelius's bio

### As Game Master:
- ✅ Can see everything
- ✅ Can grant access to private entries

---

## Troubleshooting

### Issue: Railway deployment fails

**Check:**
1. Look at Railway deployment logs for errors
2. Make sure all Java files compiled locally
3. Check `pom.xml` hasn't been corrupted

**Fix:**
```bash
# Test compilation locally
cd backend
mvn clean compile
```

### Issue: Frontend shows "Cannot find module 'react-markdown'"

**Fix:**
```bash
cd frontend
npm install
git add package.json package-lock.json
git commit -m "Add react-markdown dependency"
git push origin main
```

### Issue: "wiki_entries table does not exist"

**Fix:**
Wait for Railway backend to fully deploy. The backend creates tables on startup.

Check Railway logs for:
```
Hibernate: create table wiki_entries ...
```

### Issue: Import script shows "No wiki entries found"

**Check:**
1. Did the import script run successfully?
2. Verify with:

```bash
DATABASE_URL="postgresql://postgres:MIYRwGqttlrIeJSvgYWstxkmvxRXtMBt@centerbeam.proxy.rlwy.net:31016/railway" node -e "
const {Client} = require('pg');
const c = new Client({connectionString: process.env.DATABASE_URL});
c.connect().then(() => c.query('SELECT id, title, visibility FROM wiki_entries ORDER BY id'))
  .then(r => console.table(r.rows))
  .finally(() => c.end());
"
```

### Issue: Markdown doesn't render (shows raw text)

**Check:**
- Is `react-markdown` in `package.json` dependencies?
- Did Railway install it?

**Fix:**
```bash
cd frontend
npm install react-markdown
git add package.json package-lock.json
git commit -m "Add react-markdown dependency"
git push
```

---

## Quick Verification Checklist

After deployment, verify:

- [ ] Railway shows "Deployment successful"
- [ ] Backend created wiki tables (check logs)
- [ ] Import script ran successfully (9 entries imported)
- [ ] Wiki page loads without errors
- [ ] Public entries visible to all players
- [ ] Private entries hidden from other players
- [ ] GM can see all entries
- [ ] Markdown renders correctly (not raw text)
- [ ] Search works
- [ ] Category tabs work

---

## Railway Environment Variables

No new environment variables needed! The wiki uses existing:
- `DATABASE_URL` (already configured)
- `JWT_SECRET` (already configured)

---

## After Deployment

Your wiki is now live! Next steps:

1. **Grant Access as GM**: Use the API or wait for access management UI
2. **Add Session Notes**: Create markdown files and re-import
3. **Add Locations**: Same process

---

## Updating Wiki Content Later

To add or update wiki entries:

1. Edit markdown files in `Wiki/` directory
2. Update `import-wiki.js` if adding new files
3. Re-run import script (it clears and re-imports all)

```bash
DATABASE_URL="postgresql://..." node import-wiki.js
```

---

**Deployment Complete!** 🎉

Your campaign wiki is now live on Railway with full access control.
