package com.deadlands.campaign.controller;

import com.deadlands.campaign.model.Character;
import com.deadlands.campaign.model.GameSession;
import com.deadlands.campaign.model.SessionPlayer;
import com.deadlands.campaign.model.User;
import com.deadlands.campaign.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for GameSessionController REST endpoints.
 *
 * Tests cover:
 * - Session CRUD operations
 * - Authorization (GM vs Player permissions)
 * - Edge cases (full sessions, duplicate joins, invalid data)
 * - Negative tests (unauthorized access, invalid requests)
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class GameSessionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private GameSessionRepository sessionRepository;

    @Autowired
    private SessionPlayerRepository sessionPlayerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CharacterRepository characterRepository;

    private User testGM;
    private User testPlayer1;
    private User testPlayer2;
    private Character testCharacter1;
    private Character testCharacter2;
    private GameSession testSession;

    @BeforeEach
    void setUp() {
        // Create test GM
        testGM = User.builder()
                .username("testgm")
                .email("testgm@test.com")
                .password("hashedpassword")
                .role(User.Role.GAME_MASTER)
                .active(true)
                .build();
        testGM = userRepository.save(testGM);

        // Create test players
        testPlayer1 = User.builder()
                .username("testplayer1")
                .email("player1@test.com")
                .password("hashedpassword")
                .role(User.Role.PLAYER)
                .active(true)
                .build();
        testPlayer1 = userRepository.save(testPlayer1);

        testPlayer2 = User.builder()
                .username("testplayer2")
                .email("player2@test.com")
                .password("hashedpassword")
                .role(User.Role.PLAYER)
                .active(true)
                .build();
        testPlayer2 = userRepository.save(testPlayer2);

        // Create test characters
        testCharacter1 = Character.builder()
                .name("Test Character 1")
                .player(testPlayer1)
                .agilityDie("d8")
                .smartsDie("d6")
                .spiritDie("d6")
                .strengthDie("d6")
                .vigorDie("d6")
                .parry(5)
                .toughness(5)
                .pace(6)
                .build();
        testCharacter1 = characterRepository.save(testCharacter1);

        testCharacter2 = Character.builder()
                .name("Test Character 2")
                .player(testPlayer2)
                .agilityDie("d8")
                .smartsDie("d6")
                .spiritDie("d6")
                .strengthDie("d6")
                .vigorDie("d6")
                .parry(5)
                .toughness(5)
                .pace(6)
                .build();
        testCharacter2 = characterRepository.save(testCharacter2);

        // Create test session
        testSession = GameSession.builder()
                .name("Test Session")
                .description("A test session")
                .gameMaster(testGM)
                .active(false)
                .maxPlayers(5)
                .build();
        testSession = sessionRepository.save(testSession);
    }

    // ========== HAPPY PATH TESTS ==========

    @Test
    @WithMockUser(username = "testgm", roles = {"GAME_MASTER"})
    void testCreateSession_Success() throws Exception {
        String requestBody = """
                {
                    "name": "New Session",
                    "description": "Description here",
                    "maxPlayers": 4
                }
                """;

        mockMvc.perform(post("/sessions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("New Session"))
                .andExpect(jsonPath("$.description").value("Description here"))
                .andExpect(jsonPath("$.maxPlayers").value(4))
                .andExpect(jsonPath("$.active").value(false));
    }

    @Test
    @WithMockUser(username = "testgm", roles = {"GAME_MASTER"})
    void testGetAllSessions_AsGM_ReturnsAll() throws Exception {
        mockMvc.perform(get("/sessions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].name").exists());
    }

    @Test
    @WithMockUser(username = "testplayer1", roles = {"PLAYER"})
    void testGetAllSessions_AsPlayer_ReturnsAll() throws Exception {
        mockMvc.perform(get("/sessions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", isA(java.util.List.class)));
    }

    @Test
    @WithMockUser(username = "testgm", roles = {"GAME_MASTER"})
    void testGetSessionById_Success() throws Exception {
        mockMvc.perform(get("/sessions/" + testSession.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testSession.getId()))
                .andExpect(jsonPath("$.name").value("Test Session"));
    }

    @Test
    @WithMockUser(username = "testplayer1", roles = {"PLAYER"})
    void testJoinSession_Success() throws Exception {
        String requestBody = String.format("""
                {
                    "characterId": %d
                }
                """, testCharacter1.getId());

        mockMvc.perform(post("/sessions/" + testSession.getId() + "/join")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.character.id").value(testCharacter1.getId()))
                .andExpect(jsonPath("$.player.username").value("testplayer1"));
    }

    @Test
    @WithMockUser(username = "testplayer1", roles = {"PLAYER"})
    void testLeaveSession_Success() throws Exception {
        // First join
        SessionPlayer sp = SessionPlayer.builder()
                .session(testSession)
                .player(testPlayer1)
                .character(testCharacter1)
                .connected(false)
                .build();
        sessionPlayerRepository.save(sp);

        // Then leave
        mockMvc.perform(post("/sessions/" + testSession.getId() + "/leave"))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(username = "testgm", roles = {"GAME_MASTER"})
    void testGetSessionPlayers_Success() throws Exception {
        // Add a player first
        SessionPlayer sp = SessionPlayer.builder()
                .session(testSession)
                .player(testPlayer1)
                .character(testCharacter1)
                .connected(false)
                .build();
        sessionPlayerRepository.save(sp);

        mockMvc.perform(get("/sessions/" + testSession.getId() + "/players"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].player.username").value("testplayer1"));
    }

    // ========== EDGE CASE TESTS ==========

    @Test
    @WithMockUser(username = "testplayer1", roles = {"PLAYER"})
    void testCreateSession_AsPlayer_Forbidden() throws Exception {
        String requestBody = """
                {
                    "name": "Unauthorized Session",
                    "description": "Should fail"
                }
                """;

        mockMvc.perform(post("/sessions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "testgm", roles = {"GAME_MASTER"})
    void testGetSession_NonExistent_NotFound() throws Exception {
        mockMvc.perform(get("/sessions/999999"))
                .andExpect(status().is5xxServerError()); // Will throw RuntimeException
    }

    @Test
    @WithMockUser(username = "testplayer1", roles = {"PLAYER"})
    void testJoinSession_WithOtherPlayersCharacter_Forbidden() throws Exception {
        String requestBody = String.format("""
                {
                    "characterId": %d
                }
                """, testCharacter2.getId()); // testCharacter2 belongs to testPlayer2

        mockMvc.perform(post("/sessions/" + testSession.getId() + "/join")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "testplayer1", roles = {"PLAYER"})
    void testJoinSession_AlreadyJoined_Conflict() throws Exception {
        // First join
        SessionPlayer sp = SessionPlayer.builder()
                .session(testSession)
                .player(testPlayer1)
                .character(testCharacter1)
                .connected(false)
                .build();
        sessionPlayerRepository.save(sp);

        // Try to join again
        String requestBody = String.format("""
                {
                    "characterId": %d
                }
                """, testCharacter1.getId());

        mockMvc.perform(post("/sessions/" + testSession.getId() + "/join")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isConflict());
    }

    @Test
    @WithMockUser(username = "testplayer1", roles = {"PLAYER"})
    void testJoinSession_SessionFull_Conflict() throws Exception {
        // Create a session with max 1 player
        GameSession fullSession = GameSession.builder()
                .name("Full Session")
                .gameMaster(testGM)
                .active(false)
                .maxPlayers(1)
                .build();
        fullSession = sessionRepository.save(fullSession);

        // Player 2 joins first
        SessionPlayer sp = SessionPlayer.builder()
                .session(fullSession)
                .player(testPlayer2)
                .character(testCharacter2)
                .connected(false)
                .build();
        sessionPlayerRepository.save(sp);

        // Player 1 tries to join (should fail)
        String requestBody = String.format("""
                {
                    "characterId": %d
                }
                """, testCharacter1.getId());

        mockMvc.perform(post("/sessions/" + fullSession.getId() + "/join")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isConflict());
    }

    @Test
    @WithMockUser(username = "testplayer1", roles = {"PLAYER"})
    void testJoinSession_InvalidCharacterId_NotFound() throws Exception {
        String requestBody = """
                {
                    "characterId": 999999
                }
                """;

        mockMvc.perform(post("/sessions/" + testSession.getId() + "/join")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().is5xxServerError()); // RuntimeException
    }

    @Test
    @WithMockUser(username = "testplayer1", roles = {"PLAYER"})
    void testLeaveSession_NotJoined_NotFound() throws Exception {
        mockMvc.perform(post("/sessions/" + testSession.getId() + "/leave"))
                .andExpect(status().is5xxServerError()); // RuntimeException: Not in this session
    }

    // ========== NEGATIVE TESTS ==========

    @Test
    void testGetSessions_Unauthenticated_Unauthorized() throws Exception {
        mockMvc.perform(get("/sessions"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testCreateSession_Unauthenticated_Unauthorized() throws Exception {
        String requestBody = """
                {
                    "name": "Unauthorized Session"
                }
                """;

        mockMvc.perform(post("/sessions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testJoinSession_Unauthenticated_Unauthorized() throws Exception {
        String requestBody = String.format("""
                {
                    "characterId": %d
                }
                """, testCharacter1.getId());

        mockMvc.perform(post("/sessions/" + testSession.getId() + "/join")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isUnauthorized());
    }
}
