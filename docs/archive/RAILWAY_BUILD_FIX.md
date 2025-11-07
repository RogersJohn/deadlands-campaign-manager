# Railway Frontend Build Fix

**Date:** 2025-11-06
**Issue:** Frontend build failing with "failed to read dockerfile: open frontend/Dockerfile: no such file or directory"
**Status:** ✅ Configuration files added

---

## Problem

Railway frontend service was failing to build with error:
```
Build Failed: bc.Build: failed to solve: failed to read dockerfile:
open frontend/Dockerfile: no such file or directory
```

The Dockerfile exists at `frontend/Dockerfile` and is committed to git, but Railway couldn't find it.

---

## Solution Applied

### Step 1: Added Railway Configuration Files ✅

Created two configuration files to tell Railway where to find the Dockerfile:

**railway.json:**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "frontend/Dockerfile",
    "dockerContext": "frontend"
  },
  "deploy": {
    "numReplicas": 1,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**railway.toml:**
```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "frontend/Dockerfile"
dockerContext = "frontend"

[deploy]
numReplicas = 1
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

**Files committed:** `f7972fb` - Add Railway configuration files to fix frontend build

---

## If Build Still Fails

### Check Railway Dashboard Service Settings

1. **Go to Railway Dashboard** → Your Project → Frontend Service → Settings

2. **Verify Build Settings:**
   - **Root Directory:** Should be empty or `/` (not `frontend`)
   - **Build Command:** Should be empty (uses Dockerfile)
   - **Start Command:** Should be empty (uses Dockerfile CMD)

3. **Verify Watch Paths:**
   - Should include `frontend/**` to trigger rebuilds on frontend changes

4. **Check Service Variables:**
   - `VITE_API_URL` should be set (e.g., `https://your-backend.up.railway.app/api`)

---

## Alternative Solution: Separate Railway Services

If the issue persists, you may have a **monorepo configuration problem**. Railway might need separate services:

### Current Setup (Monorepo - 2 services in 1 repo):
```
deadlands-campaign-manager/
├── frontend/          ← Frontend service points here
│   └── Dockerfile
└── backend/           ← Backend service points here
    └── Dockerfile
```

### Option 1: Fix Root Directory in Railway Dashboard

**Frontend Service Settings:**
- Root Directory: `frontend`
- Dockerfile Path: `Dockerfile` (relative to root directory)

**Backend Service Settings:**
- Root Directory: `backend`
- Dockerfile Path: `Dockerfile` (relative to root directory)

### Option 2: Use Railway Configuration Files (Applied)

Keep Root Directory empty, use `railway.json`/`railway.toml` to specify paths.

---

## Dockerfile Verification

The frontend Dockerfile exists and is correct:

```dockerfile
FROM node:18-alpine AS build
WORKDIR /app

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
```

**File location:** `frontend/Dockerfile`
**Git status:** ✅ Committed and tracked
**Last modified:** Nov 4, 2025

---

## Troubleshooting Steps

### 1. Verify File Exists in Git
```bash
git ls-files frontend/Dockerfile
# Should output: frontend/Dockerfile
```

### 2. Check Railway Logs
- Go to Railway Dashboard → Frontend Service → Deployments
- Click on failed deployment
- Check full build logs for more details

### 3. Manual Railway Service Configuration

If automatic detection fails, manually configure in Railway dashboard:

**Settings → Build:**
- Builder: Dockerfile
- Dockerfile Path: `frontend/Dockerfile`
- Build Context: `frontend`

**Settings → Deploy:**
- Watch Paths: `frontend/**`

### 4. Trigger Manual Redeploy

After updating settings:
- Go to Deployments tab
- Click "Deploy" → "Redeploy"

---

## Expected Behavior After Fix

1. Push to main branch triggers Railway build
2. Railway reads `railway.json` or `railway.toml`
3. Finds Dockerfile at `frontend/Dockerfile`
4. Sets build context to `frontend` directory
5. Builds Docker image successfully
6. Deploys to production

---

## Backend Service (Should Still Work)

Backend service should be unaffected:
- Root Directory: `backend` (or empty with railway config)
- Dockerfile Path: `backend/Dockerfile`
- Build Context: `backend`

---

## If Problem Persists

### Manual Fix in Railway Dashboard

1. **Delete existing Frontend service**
2. **Create new service from GitHub repo**
3. **During setup:**
   - Select repository: `deadlands-campaign-manager`
   - Root Directory: `frontend`
   - Railway should auto-detect Dockerfile
4. **Set environment variables:**
   - `VITE_API_URL`: Backend URL

---

## Files Modified

1. **railway.json** (NEW) - Railway configuration (JSON format)
2. **railway.toml** (NEW) - Railway configuration (TOML format)

**Commit:** `f7972fb` - Add Railway configuration files to fix frontend build

---

## Next Steps

1. ✅ Configuration files pushed to GitHub
2. ⏳ Railway should auto-detect and rebuild (2-3 minutes)
3. 📋 If build fails, check Railway dashboard service settings
4. 📋 Verify Root Directory is empty or correct
5. 📋 Manual redeploy if needed

---

**Fix Applied!** Configuration files should resolve the build issue.

If Railway still can't find the Dockerfile after this push, the service settings in Railway dashboard need manual adjustment (see "Alternative Solution" above).
