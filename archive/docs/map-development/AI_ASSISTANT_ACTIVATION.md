# AI Gamemaster Assistant - Activation Guide

**Date:** 2025-11-14
**Status:** ✅ CONFIGURED - Requires Backend Restart

---

## Overview

Your Anthropic API key has been successfully configured in the application. The AI Gamemaster Assistant feature is ready to use once the backend is restarted.

**API Key Configured:**
`your-anthropic-api-key-here`

---

## What Was Configured

### 1. Backend Configuration ✅

**File Modified:** `backend/src/main/resources/application.yml`

```yaml
spring:
  ai:
    anthropic:
      api-key: ${ANTHROPIC_API_KEY:your-anthropic-api-key-here}
      chat:
        options:
          model: claude-3-5-sonnet-20241022
          temperature: 0.8
          max-tokens: 1000
```

**What This Means:**
- The API key is now the default value in the configuration
- If `ANTHROPIC_API_KEY` environment variable is set, it will be used instead
- Otherwise, your provided API key will be used automatically

### 2. AI Features Already Implemented ✅

From the previous session, the following components are ready:

**Backend (Java/Spring Boot):**
- ✅ `AIGameMasterService.java` - Core AI logic (188 lines)
- ✅ `AIAssistantController.java` - REST API endpoints (116 lines)
- ✅ 5 DTO classes for requests/responses
- ✅ Spring AI integration with Anthropic
- ✅ Role-based security (GM-only for some features)

**Frontend (React/TypeScript):**
- ✅ `AIAssistantPanel.tsx` - Main UI component (150 lines)
- ✅ 4 tab components (NPC, Rules, Encounter, Location)
- ✅ `aiService.ts` - API client (65 lines)
- ✅ Integration into GameArena
- ✅ Toggle button in Combat HUD

---

## How to Activate

### Option 1: Restart Backend Locally

If running backend locally:

```bash
# Stop current backend process
# (Find PID using: netstat -ano | findstr :8080)

# Navigate to backend directory
cd backend

# Run with Maven (if installed)
mvn spring-boot:run

# OR build and run JAR
mvn clean package
java -jar target/deadlands-campaign-manager-0.0.1-SNAPSHOT.jar
```

### Option 2: Deploy to Railway (Production)

If backend is deployed on Railway:

1. **Go to Railway Dashboard:**
   - https://railway.app
   - Select your project: "deadlands-campaign-manager"

2. **Add Environment Variable:**
   ```
   Variable: ANTHROPIC_API_KEY
   Value: your-anthropic-api-key-here
   ```

3. **Redeploy:**
   - Railway will automatically redeploy with the new environment variable
   - Or manually trigger a redeploy

4. **Verify:**
   ```bash
   curl https://deadlands-campaign-manager-production-053e.up.railway.app/api/ai-gm/health
   ```

   Should return:
   ```json
   {
     "status": "healthy",
     "model": "claude-3-5-sonnet-20241022",
     "configured": true
   }
   ```

### Option 3: Use Alternative Backend Port

If port 8080 is occupied (by Apache httpd):

```bash
cd backend

# Set port and API key
set SERVER_PORT=8081
set ANTHROPIC_API_KEY=your-anthropic-api-key-here

# Run backend
java -jar target/*.jar
```

Then update frontend to use port 8081:
```bash
# In frontend/.env or frontend/.env.local
VITE_API_URL=http://localhost:8081/api
```

---

## How to Use AI Assistant

### 1. Access the AI Panel

1. **Login** to the application (as GM or Player)
2. **Join or create a game session**
3. **Navigate to Game Arena** (the Phaser game view)
4. **Click the "AI Assistant" button** in the Combat HUD
5. **AI Panel opens** on the right side (350px wide)

### 2. Available Features

**For All Users:**

**NPC Dialogue Tab:**
- Generate in-character responses from NPCs
- Inputs:
  - NPC Name
  - NPC Personality/Background
  - Current Context
  - Player Question/Statement
- Example: "Cletus the barkeep" with personality "gruff but helpful" responding to "What's been happening in town?"

**Rules Lookup Tab:**
- Get Savage Worlds rule explanations
- Inputs:
  - Rule Question
- Quick Questions: Combat, Skills, Edges, Hindrances, Damage
- Example: "How does the Wild Card rule work?"

**For Game Masters Only:**

**Encounter Generator Tab:**
- Create balanced encounters
- Inputs:
  - Number of Players
  - Average Player Rank (Novice/Seasoned/Veteran/Heroic/Legendary)
  - Environment/Setting
  - Encounter Type (combat/social/investigation/etc.)
- Generates: Enemies, tactics, terrain, complications

**Location Generator Tab:**
- Generate Weird West locations
- Inputs:
  - Location Type (town/wilderness/dungeon/etc.)
  - Atmosphere (creepy/bustling/desolate/etc.)
  - Special Features (optional)
- Generates: Description, NPCs, hooks, secrets

**GM Suggestion Tab:**
- Get plot twists and story ideas
- Inputs:
  - Current Situation
  - What's Needed
- Example: "Players just defeated the ghost train, what happens next?"

### 3. Example Workflow

**Scenario: Player asks about a local NPC**

1. **GM clicks AI Assistant button**
2. **Switches to NPC Dialogue tab**
3. **Fills in:**
   - Name: "Sheriff Harding"
   - Personality: "Tough, fair, seen too much"
   - Context: "Player asks about recent disappearances"
   - Question: "Sheriff, people are saying folks have been vanishing at night. What do you know?"
4. **Clicks "Generate Response"**
5. **AI returns in-character dialogue:**
   > *Sheriff Harding leans back in his chair, his hand instinctively moving to his gun belt.*
   >
   > "Folks are right to be scared. Three missing in the last two weeks - all from the edge of town, all after midnight. No bodies, no blood trails, just... gone. Old Man Tucker swears he heard strange singing coming from the prairie the night his daughter vanished. I got a posse forming tomorrow at dawn. You interested in ridin' with us?"

**Benefits:**
- Consistent NPC personality
- Deadlands-appropriate tone
- Plot hooks and next steps
- Saves GM prep time

---

## API Endpoints

### Public Endpoints (All Users)

**NPC Dialogue:**
```http
POST /api/ai-gm/npc-dialogue
Content-Type: application/json

{
  "npcName": "Cletus",
  "npcPersonality": "gruff barkeep",
  "context": "Players just arrived in town",
  "playerQuestion": "What's the latest news?"
}
```

**Rules Lookup:**
```http
POST /api/ai-gm/rule-lookup
Content-Type: application/json

{
  "question": "How does shaken work in Savage Worlds?"
}
```

### GM-Only Endpoints

**Generate Encounter:**
```http
POST /api/ai-gm/generate-encounter
Authorization: Bearer <GM_JWT_TOKEN>
Content-Type: application/json

{
  "playerCount": 4,
  "playerRank": "Seasoned",
  "environment": "abandoned mine",
  "encounterType": "combat"
}
```

**Generate Location:**
```http
POST /api/ai-gm/generate-location
Authorization: Bearer <GM_JWT_TOKEN>
Content-Type: application/json

{
  "locationType": "town",
  "atmosphere": "creepy",
  "specialFeatures": "has a mysterious clock tower"
}
```

**GM Suggestion:**
```http
POST /api/ai-gm/gm-suggestion
Authorization: Bearer <GM_JWT_TOKEN>
Content-Type: application/json

{
  "currentSituation": "Players just defeated the villain",
  "needHelp": "what plot twist should happen next?"
}
```

**Health Check:**
```http
GET /api/ai-gm/health

Response: {
  "status": "healthy",
  "model": "claude-3-5-sonnet-20241022",
  "configured": true
}
```

---

## Testing AI Assistant

### 1. Health Check (Backend)

```bash
# If running locally
curl http://localhost:8080/api/ai-gm/health

# If on Railway
curl https://deadlands-campaign-manager-production-053e.up.railway.app/api/ai-gm/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "model": "claude-3-5-sonnet-20241022",
  "configured": true
}
```

**If Not Working:**
- `configured: false` - API key not set or invalid
- 404 - Backend not running or endpoint not available
- 500 - Check backend logs for Spring AI errors

### 2. Test NPC Dialogue

```bash
curl -X POST http://localhost:8080/api/ai-gm/npc-dialogue \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "npcName": "Test NPC",
    "npcPersonality": "friendly",
    "context": "test",
    "playerQuestion": "hello"
  }'
```

Should return a response from Claude.

### 3. Test in Browser

1. Login to application
2. Create/join a game session
3. Navigate to Game Arena
4. Click "AI Assistant" button (in Combat HUD)
5. Fill out NPC Dialogue form
6. Click "Generate Response"
7. Should see AI-generated text appear

---

## Configuration Details

### Model: Claude 3.5 Sonnet

**Version:** `claude-3-5-sonnet-20241022`

**Capabilities:**
- Excellent at roleplay and character voice
- Strong knowledge of Savage Worlds rules
- Creative encounter and location generation
- Understands Deadlands Reloaded setting

**Settings:**
- Temperature: `0.8` (creative but not too random)
- Max Tokens: `1000` (allows detailed responses)
- Can be adjusted in `application.yml`

### Cost Estimates

**Claude 3.5 Sonnet Pricing:**
- Input: $3 per million tokens
- Output: $15 per million tokens

**Typical Usage:**
- NPC Dialogue: ~200-500 tokens per request (~$0.01)
- Rules Lookup: ~100-300 tokens (~$0.005)
- Encounter Generation: ~300-700 tokens (~$0.015)
- Location Generation: ~300-700 tokens (~$0.015)

**Expected Monthly Cost:**
- Light use (10-20 requests/day): $5-10/month
- Moderate use (50-100 requests/day): $15-30/month
- Heavy use (200+ requests/day): $50+/month

**Your API Credits:**
- New accounts get $5 free credit
- Monitor usage at https://console.anthropic.com

---

## Troubleshooting

### "AI Assistant not available"

**Cause:** Backend not configured or not running

**Solution:**
1. Check backend is running: `curl http://localhost:8080/api/ai-gm/health`
2. Verify API key in `application.yml` or environment variable
3. Check backend logs for Spring AI errors
4. Restart backend

### "Request failed with status 401"

**Cause:** Invalid or expired JWT token

**Solution:**
1. Logout and login again
2. Check token expiration in backend config
3. Verify token is being sent in Authorization header

### "Request failed with status 403"

**Cause:** GM-only endpoint accessed by Player

**Solution:**
- NPC Dialogue and Rules Lookup: Available to all
- Encounter, Location, GM Suggestion: GM only
- Login as GM to access restricted features

### "Response takes too long"

**Cause:** API call to Anthropic takes 2-10 seconds

**Solution:**
- This is normal for AI generation
- Consider adding loading indicators
- Increase timeout if needed
- For faster responses, reduce max_tokens in config

### "Invalid API key" or "Rate limit exceeded"

**Cause:** API key issue

**Solution:**
1. Verify API key is correct
2. Check key hasn't expired
3. Check usage limits at console.anthropic.com
4. Generate new API key if needed

---

## Next Steps

### Immediate (Required):

1. **Restart Backend** with new API key configuration
   ```bash
   # Stop current backend
   # Start with: java -jar target/*.jar
   # OR deploy to Railway with env variable
   ```

2. **Verify Health Endpoint**
   ```bash
   curl http://localhost:8080/api/ai-gm/health
   # Should return: {"status":"healthy","configured":true}
   ```

3. **Test in Browser**
   - Login as any user
   - Join a game session
   - Click AI Assistant button
   - Try NPC Dialogue feature

### Short Term (Enhancements):

1. **Add Chat History**
   - Save conversation context
   - Allow follow-up questions
   - "Continue the conversation" feature

2. **Add Favorites**
   - Save favorite NPCs
   - Quick-load NPC personalities
   - Templates for common scenarios

3. **Improve UI**
   - Better loading states
   - Error handling
   - Response formatting (markdown support)

4. **Add More Features**
   - Monster stat block generation
   - Treasure/loot generation
   - NPC name generator
   - Random encounter tables

### Medium Term (Advanced):

1. **Session Memory**
   - Remember NPCs from this session
   - Track plot threads
   - Maintain consistency

2. **Voice Integration**
   - Text-to-speech for NPC responses
   - Different voices per NPC

3. **Image Generation**
   - NPC portraits
   - Location maps
   - Scene illustrations

4. **Automation**
   - Auto-generate session summaries
   - Track player actions
   - Suggest next plot points

---

## Security Notes

### API Key Security:

**Current Setup:**
- API key is in `application.yml` (default value)
- Suitable for local development
- **NOT suitable for version control**

**Recommended for Production:**
1. **Use Environment Variables:**
   ```bash
   export ANTHROPIC_API_KEY=sk-ant-api03-...
   ```

2. **Use Secrets Manager:**
   - Railway: Environment Variables (encrypted)
   - AWS: Secrets Manager
   - Azure: Key Vault
   - Google: Secret Manager

3. **.gitignore:**
   ```
   # In .gitignore
   **/application-local.yml
   **/application-secrets.yml
   .env
   .env.local
   ```

4. **Rotate Keys Regularly:**
   - Generate new API key every 90 days
   - Deactivate old keys
   - Update all deployments

### Request Security:

**Already Implemented:**
- JWT authentication required
- Role-based access control (GM-only endpoints)
- Request validation
- Error handling (no sensitive data in errors)

---

## Files Modified

1. `backend/src/main/resources/application.yml` - Added API key as default value

---

## Summary

✅ **API Key Configured** - Added to application.yml
✅ **AI Features Ready** - All components implemented (7 backend files, 8 frontend files)
✅ **Documentation Complete** - Full activation guide created

⏳ **Pending:** Backend restart to activate AI assistant

**To Complete Activation:**
1. Restart backend (locally or on Railway)
2. Verify health endpoint returns `configured: true`
3. Test AI Assistant panel in browser

**Estimated Time:** 5-10 minutes

Once the backend restarts, the AI Gamemaster Assistant will be fully functional and ready to use!
