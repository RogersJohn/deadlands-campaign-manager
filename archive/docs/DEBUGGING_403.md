# Debugging 403 Error - Steps for User

## Check 1: Are you actually logged in?

1. Open browser DevTools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Look at **Local Storage** → `https://deadlands-frontend-production.up.railway.app`
4. Check if you see a `token` or `authToken` entry
5. **Copy the token value** (we need to verify it's valid)

## Check 2: Is the JWT token being sent?

1. Stay in DevTools
2. Go to **Network** tab
3. **Clear the log**
4. Try to access `/sessions` again
5. Click on the `sessions` request in the Network log
6. Go to **Headers** tab
7. Scroll to **Request Headers**
8. Look for: `Authorization: Bearer eyJ...`

**Is it there?**
- ✅ YES → Token is being sent (good!)
- ❌ NO → Token isn't being sent (problem!)

## Check 3: What's the actual error?

In the Network tab request:
1. Click on the failed `sessions` or `sessions/3` request
2. Go to **Response** tab
3. Copy the FULL response body
4. Go to **Preview** tab to see formatted error

## What to Report Back

Please provide:
1. Is there a token in Local Storage? (YES/NO)
2. Is Authorization header being sent? (YES/NO)
3. What's the full error response body?
4. What's your username that you logged in with?

This will help us figure out if it's:
- A. Token not being stored
- B. Token not being sent
- C. Token being rejected by backend
- D. User role issue
