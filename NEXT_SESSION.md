# Next Session: Backend Testing Expansion

**Date**: 2025-11-18 (Session 2)
**Status**: ✅ CharacterController Tests Complete
**Priority**: Continue expanding test coverage (Game, AI controllers)
**Estimated Time**: 2-3 hours

---

## ✅ This Session's Accomplishments (2025-11-18 - Session 2)

### CharacterControllerTest Fully Implemented
- **16/16 tests passing** ✅
- **74% CharacterController coverage**
- Complete coverage of character management endpoints:
  - GET /characters (3 tests - GM/Player role filtering)
  - GET /characters/{id} (4 tests - authorization checks)
  - POST /characters (2 tests)
  - PUT /characters/{id} (3 tests - authorization checks)
  - DELETE /characters/{id} (4 tests - soft delete, authorization)

### Critical Bug Fixed
- **SecurityConfig.java line 81** - DELETE endpoint restriction
  - **Problem**: Only GAME_MASTER could delete characters (blocked at SecurityConfig level)
  - **Controller Intent**: Both character owner AND GM should be able to delete
  - **Fix**: Changed `.hasRole("GAME_MASTER")` to `.hasAnyRole("PLAYER", "GAME_MASTER")`
  - **Impact**: Players can now soft-delete their own characters

### Coverage Milestones Achieved
- **Overall Backend**: 19% (was 9%) - **+10 percentage points**
- **Controllers**: 34% (was 7%) - **+27 percentage points**
- **AuthController**: 97% coverage
- **CharacterController**: 74% coverage
- **Total Tests**: 29 (13 Auth + 16 Character)

---

## Previous Session Accomplishments (2025-11-18 - Session 1)

### AuthControllerTest Fully Implemented
- **13/13 tests passing** ✅
- Complete coverage of authentication endpoints:
  - POST /auth/login (4 tests)
  - POST /auth/register (4 tests)
  - POST /auth/change-password (5 tests)

### Key Technical Discoveries

**Problem Solved:** `@WebMvcTest` Configuration Issue
- **Symptom**: Controller methods never executed despite correct mocking
- **Root Cause**: `@WebMvcTest` had framework-level issues preventing controller invocation in this specific setup
- **Solution**: Migrated to `@SpringBootTest` with `@AutoConfigureMockMvc`

**Working Test Pattern:**
```java
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthenticationManager authenticationManager;
    // ... other @MockBean dependencies
}
```

### JaCoCo Coverage Reporting
- ✅ Successfully configured and verified
- **Current Coverage**: 9% overall
  - Controller: 7% (201/2,702 instructions)
  - Security: 41% (209/505 instructions)
  - Exception: 70% (10/14 lines)
- **Target**: 60% backend, 70% frontend

### Files Modified This Session
1. **Created:**
   - `backend/src/test/java/com/deadlands/campaign/controller/CharacterControllerTest.java` (572 lines, 16 tests)

2. **Modified:**
   - `backend/src/main/java/com/deadlands/campaign/config/SecurityConfig.java` (line 81 - fixed DELETE authorization bug)

### Files Modified Previous Session
1. **Created:**
   - `backend/src/test/java/com/deadlands/campaign/controller/AuthControllerTest.java` (386 lines, 13 tests)
   - `backend/src/main/java/com/deadlands/campaign/config/JpaConfig.java` (separated `@EnableJpaAuditing`)

2. **Modified:**
   - `backend/src/main/java/com/deadlands/campaign/CampaignManagerApplication.java` (removed `@EnableJpaAuditing`)
   - `backend/src/test/resources/application-test.yml` (added `allow-bean-definition-overriding: true`)
   - `backend/pom.xml` (JaCoCo already configured)

---

## 🎯 Next Session Goals

### Priority A: Create GameController Tests (60-90 min)

**GameControllerTest** - Estimated 6-10 tests
Looking at GameController.java (backend/src/main/java/com/deadlands/campaign/controller/GameController.java):
- [ ] WebSocket message handlers:
  - `/game/join` - Player joins global game world
  - `/game/leave` - Player leaves game
  - `/game/move` - Token movement on battle map
  - `/game/ping` - Connection health check
- [ ] HTTP endpoints:
  - GET `/game/state` - Get current game state
  - POST `/game/combat/action` - Perform combat action
  - POST `/game/combat/damage` - Apply damage to character
  - GET `/game/maps` - List available battle maps
  - POST `/game/map/select` - Select battle map for session
- [ ] Test authorization and role-based access
- [ ] Test WebSocket message handling patterns

### Priority B: Integration & E2E Testing (45-60 min)

**WebSocket Testing** (Manual)
- [ ] Test with 2 browsers (GM + Player)
- [ ] Verify real-time character position updates
- [ ] Verify combat action broadcasts
- [ ] Test connection stability

**E2E Test Updates**
- [ ] Update Cucumber scenarios to match single-world model
- [ ] Remove session-based multiplayer tests
- [ ] Add global world join flow tests

### Priority C: Frontend Test Coverage (60-90 min)

**Services Testing** (Vitest)
- [ ] `apiService.ts` - HTTP client tests
- [ ] `websocketService.ts` - WebSocket connection tests
- [ ] `characterService.ts` - Character CRUD tests

**Stores Testing** (Vitest + Testing Library)
- [ ] `gameStore.ts` - Game state management tests
- [ ] `characterStore.ts` - Character state tests
- [ ] Test store reactivity and computed properties

**Component Testing** (Vitest + Testing Library)
- [ ] `GameArena.tsx` - Main game component
- [ ] `CharacterSheet.tsx` - Character display
- [ ] `CombatHUD.tsx` - Combat interface

### Priority D: CI/CD Pipeline (30-45 min)

**GitHub Actions Workflow**
- [ ] Create `.github/workflows/test.yml`
- [ ] Run backend tests on PR
- [ ] Run frontend tests on PR
- [ ] Generate and upload coverage reports
- [ ] Quality gates (fail if coverage < 60%/70%)

---

## 📊 Current Test Status

### Backend Tests
| Component | Tests | Coverage | Status |
|-----------|-------|----------|--------|
| AuthController | 13 | 97% | ✅ Complete |
| CharacterController | 16 | 74% | ✅ Complete |
| GameController | 0 | 4% | ⏳ Next |
| AIAssistantController | 0 | 2% | Future |
| WikiController | 0 | 0% | Future |
| ReferenceDataController | 0 | 2% | Future |
| Services | 0 | 2% | Future |
| Security | 0 | 41% | Partial |

**Total Backend**: 29 tests, 19% coverage (Target: 60%)

### Frontend Tests
| Component | Tests | Coverage | Status |
|-----------|-------|----------|--------|
| Services | 0 | ? | ⏳ Next |
| Stores | 0 | ? | ⏳ Next |
| Components | 0 | ? | ⏳ Next |

**Total Frontend**: 0 tests, 0% coverage (Target: 70%)

### E2E Tests
- **Status**: Needs update for single-world architecture
- **Current**: 17 scenarios (7 failing due to session-based assumptions)
- **Action Required**: Refactor to test global world join flow

---

## 🔧 Testing Patterns & Best Practices

### Controller Testing Pattern (SpringBootTest)

```java
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ServiceDependency serviceDependency;

    @Test
    @DisplayName("Endpoint description")
    void testMethod() throws Exception {
        // Arrange
        when(serviceDependency.method()).thenReturn(mockData);

        // Act & Assert
        mockMvc.perform(post("/endpoint")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.field", is("value")));

        // Verify
        verify(serviceDependency, times(1)).method();
    }
}
```

### Important Notes
- ✅ Use `@SpringBootTest` (NOT `@WebMvcTest` - has issues)
- ✅ Use `@MockBean` for dependencies
- ✅ Always include `.with(csrf())` for POST/PUT/DELETE
- ✅ Use `anyString()` matchers for password encoder tests
- ✅ Expect HTTP 500 for validation failures (GlobalExceptionHandler converts)
- ✅ Expect HTTP 403 for unauthenticated protected endpoints

### Test Configuration
- **Profile**: `test` (uses H2 database, test JWT secrets)
- **Bean Overriding**: Enabled in `application-test.yml`
- **JPA Auditing**: Separated to `JpaConfig.java` for easier exclusion
- **Coverage Tool**: JaCoCo (60% line, 50% branch thresholds)

---

## 📁 Key Files to Reference

### Testing Infrastructure
- `backend/src/test/java/com/deadlands/campaign/controller/AuthControllerTest.java` - **Example test file**
- `backend/src/test/resources/application-test.yml` - Test configuration
- `backend/pom.xml` - JaCoCo configuration (lines with jacoco plugin)

### Controllers to Test Next
- `backend/src/main/java/com/deadlands/campaign/controller/CharacterController.java`
- `backend/src/main/java/com/deadlands/campaign/controller/GameController.java`
- `backend/src/main/java/com/deadlands/campaign/controller/AIAssistantController.java`

### Frontend Testing Setup
- `frontend/vitest.config.ts` - Vitest configuration
- `frontend/package.json` - Test scripts

---

## 🎮 Test Credentials

### Local Development
- **GM**: `gamemaster` / `password`
- **Player**: `testplayer` / `password`

### Production (Railway)
- **GM**: `gamemaster` / `Test123!`
- **Player**: `e2e_player1` / `Test123!`
- **URL**: https://deadlands-frontend-production.up.railway.app

---

## 🚀 Quick Start Commands

### Run Backend Tests
```bash
# All tests
./mvnw test

# Specific test class
./mvnw test -Dtest=AuthControllerTest

# With coverage report
./mvnw test
# View: backend/target/site/jacoco/index.html
```

### Run Frontend Tests (Future)
```bash
cd frontend
npm test                  # Run all tests
npm run test:coverage     # With coverage
```

### Run E2E Tests (Future - needs update)
```bash
cd e2e-tests
npm run test:all
```

---

## ✅ Success Criteria for Next Session

**Backend Testing:**
- [ ] CharacterControllerTest complete (8-10 tests)
- [ ] GameControllerTest complete (6-8 tests)
- [ ] Backend coverage reaches 25-30%

**Frontend Testing:**
- [ ] At least 2 service test files
- [ ] At least 1 store test file
- [ ] Frontend coverage baseline established

**Integration:**
- [ ] Manual WebSocket testing verified (2 browsers)
- [ ] E2E tests updated for single-world model
- [ ] CI/CD pipeline configured (optional)

---

## 💡 Lessons Learned

### What Worked
✅ `@SpringBootTest` with `@AutoConfigureMockMvc` is reliable
✅ Separating `@EnableJpaAuditing` to dedicated config class
✅ Using `anyString()` matchers for flexible verification
✅ JaCoCo provides good visibility into coverage

### What Didn't Work
❌ `@WebMvcTest` - controller methods never executed
❌ `@TestConfiguration` with `@Primary` beans - caused Spring proxy issues
❌ Trying to make tests pass without investigating root cause

### Key Insights
- Always investigate why tests fail - don't just make them pass
- When debugging tests, add logging to controller methods to verify execution
- SpringBoot test slicing (`@WebMvcTest`) can have subtle framework issues
- Full integration tests (`@SpringBootTest`) are more reliable, just slightly slower

---

## 📖 Reference Documentation

- **SIMPLIFIED_ARCHITECTURE.md** - Current system architecture (single campaign)
- **RAILWAY_ENVIRONMENT_VARIABLES.md** - Production deployment config
- **backend/pom.xml** - JaCoCo configuration and thresholds

---

## 🎯 Ready for Next Session!

**Start with:**
1. Copy `CharacterControllerTest.java` as template
2. Create `GameControllerTest.java`
3. Follow same pattern with `@SpringBootTest` and `@MockBean`
4. Target 6-10 tests for game state and WebSocket endpoints

**Special Considerations for GameController:**
- WebSocket testing may require `@WebSocketTest` or integration testing approach
- Test both HTTP REST endpoints and WebSocket message handlers
- Mock the WebSocket message broker if needed
- Focus on HTTP endpoints first (easier to test)

**Remember:**
- `@SpringBootTest` with `@AutoConfigureMockMvc` is the working pattern
- Always include `.with(csrf())` for POST/PUT/DELETE endpoints
- Use `@WithMockUser(username = "...", roles = {"PLAYER"})` for authenticated tests
- Use `@WithMockUser(username = "...", roles = {"GAME_MASTER"})` for GM tests
- Check coverage after each test file: `./mvnw test -f backend/pom.xml`
- Coverage report: `backend/target/site/jacoco/index.html`

---

Let's build that test coverage! 🧪✨
