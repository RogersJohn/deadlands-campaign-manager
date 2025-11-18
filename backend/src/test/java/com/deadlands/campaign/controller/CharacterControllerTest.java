package com.deadlands.campaign.controller;

import com.deadlands.campaign.model.Character;
import com.deadlands.campaign.model.User;
import com.deadlands.campaign.repository.CharacterRepository;
import com.deadlands.campaign.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Unit tests for CharacterController.
 *
 * Tests all character management endpoints:
 * - GET /characters - List characters (filtered by role)
 * - GET /characters/{id} - Get specific character (with authorization)
 * - POST /characters - Create character
 * - PUT /characters/{id} - Update character (with authorization)
 * - DELETE /characters/{id} - Soft delete character (with authorization)
 *
 * Uses @SpringBootTest with @AutoConfigureMockMvc for full integration testing.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CharacterControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CharacterRepository characterRepository;

    @MockBean
    private UserRepository userRepository;

    private User testPlayer;
    private User testGM;
    private User otherPlayer;
    private Character playerCharacter;
    private Character otherPlayerCharacter;
    private Character npcCharacter;

    @BeforeEach
    void setUp() {
        // Create test users
        testPlayer = User.builder()
                .id(1L)
                .username("testplayer")
                .email("player@example.com")
                .password("encoded-password")
                .role(User.Role.PLAYER)
                .active(true)
                .build();

        testGM = User.builder()
                .id(2L)
                .username("gamemaster")
                .email("gm@example.com")
                .password("encoded-password")
                .role(User.Role.GAME_MASTER)
                .active(true)
                .build();

        otherPlayer = User.builder()
                .id(3L)
                .username("otherplayer")
                .email("other@example.com")
                .password("encoded-password")
                .role(User.Role.PLAYER)
                .active(true)
                .build();

        // Create test characters
        playerCharacter = Character.builder()
                .id(1L)
                .name("Test Gunslinger")
                .occupation("Gunslinger")
                .player(testPlayer)
                .pace(6)
                .size(0)
                .wind(0)
                .grit(1)
                .parry(2)
                .toughness(2)
                .charisma(0)
                .totalXp(0)
                .spentXp(0)
                .agilityDie("1d8")
                .smartsDie("1d6")
                .spiritDie("1d6")
                .strengthDie("1d6")
                .vigorDie("1d6")
                .isNpc(false)
                .skills(new HashSet<>())
                .edges(new HashSet<>())
                .hindrances(new HashSet<>())
                .equipment(new HashSet<>())
                .arcanePowers(new HashSet<>())
                .wounds(new HashSet<>())
                .build();

        otherPlayerCharacter = Character.builder()
                .id(2L)
                .name("Other Character")
                .occupation("Huckster")
                .player(otherPlayer)
                .pace(6)
                .size(0)
                .wind(0)
                .grit(1)
                .parry(2)
                .toughness(2)
                .charisma(0)
                .totalXp(0)
                .spentXp(0)
                .agilityDie("1d6")
                .smartsDie("1d8")
                .spiritDie("1d6")
                .strengthDie("1d6")
                .vigorDie("1d6")
                .isNpc(false)
                .skills(new HashSet<>())
                .edges(new HashSet<>())
                .hindrances(new HashSet<>())
                .equipment(new HashSet<>())
                .arcanePowers(new HashSet<>())
                .wounds(new HashSet<>())
                .build();

        npcCharacter = Character.builder()
                .id(3L)
                .name("Bandit Leader")
                .occupation("Outlaw")
                .player(testGM)
                .pace(6)
                .size(0)
                .wind(0)
                .grit(1)
                .parry(2)
                .toughness(2)
                .charisma(0)
                .totalXp(0)
                .spentXp(0)
                .agilityDie("1d6")
                .smartsDie("1d6")
                .spiritDie("1d6")
                .strengthDie("1d6")
                .vigorDie("1d6")
                .isNpc(true)
                .skills(new HashSet<>())
                .edges(new HashSet<>())
                .hindrances(new HashSet<>())
                .equipment(new HashSet<>())
                .arcanePowers(new HashSet<>())
                .wounds(new HashSet<>())
                .build();
    }

    // ==================== GET /characters TESTS ====================

    @Test
    @WithMockUser(username = "gamemaster", roles = {"GAME_MASTER"})
    @DisplayName("GET /characters - GM gets all characters")
    void getAllCharacters_asGM_returnsAllCharacters() throws Exception {
        // Arrange
        when(userRepository.findByUsername("gamemaster")).thenReturn(Optional.of(testGM));
        when(characterRepository.findAll()).thenReturn(List.of(playerCharacter, otherPlayerCharacter, npcCharacter));

        // Act & Assert
        mockMvc.perform(get("/characters")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[0].name", is("Test Gunslinger")))
                .andExpect(jsonPath("$[1].name", is("Other Character")))
                .andExpect(jsonPath("$[2].name", is("Bandit Leader")));

        verify(characterRepository, times(1)).findAll();
        verify(characterRepository, never()).findByPlayerId(anyLong());
    }

    @Test
    @WithMockUser(username = "testplayer", roles = {"PLAYER"})
    @DisplayName("GET /characters - Player gets only their own characters")
    void getAllCharacters_asPlayer_returnsOnlyOwnCharacters() throws Exception {
        // Arrange
        when(userRepository.findByUsername("testplayer")).thenReturn(Optional.of(testPlayer));
        when(characterRepository.findByPlayerId(1L)).thenReturn(List.of(playerCharacter));

        // Act & Assert
        mockMvc.perform(get("/characters")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Test Gunslinger")))
                .andExpect(jsonPath("$[0].playerId", is(1)));

        verify(characterRepository, times(1)).findByPlayerId(1L);
        verify(characterRepository, never()).findAll();
    }

    @Test
    @DisplayName("GET /characters - Unauthenticated returns forbidden")
    void getAllCharacters_unauthenticated_returnsForbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/characters")
                        .with(csrf()))
                .andExpect(status().isForbidden());

        verify(characterRepository, never()).findAll();
        verify(characterRepository, never()).findByPlayerId(anyLong());
    }

    // ==================== GET /characters/{id} TESTS ====================

    @Test
    @WithMockUser(username = "testplayer", roles = {"PLAYER"})
    @DisplayName("GET /characters/{id} - Success (character owner)")
    void getCharacterById_asOwner_returnsCharacter() throws Exception {
        // Arrange
        when(characterRepository.findById(1L)).thenReturn(Optional.of(playerCharacter));
        when(userRepository.findByUsername("testplayer")).thenReturn(Optional.of(testPlayer));

        // Act & Assert
        mockMvc.perform(get("/characters/1")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.name", is("Test Gunslinger")))
                .andExpect(jsonPath("$.occupation", is("Gunslinger")));

        verify(characterRepository, times(1)).findById(1L);
    }

    @Test
    @WithMockUser(username = "gamemaster", roles = {"GAME_MASTER"})
    @DisplayName("GET /characters/{id} - Success (GM viewing any character)")
    void getCharacterById_asGM_returnsCharacter() throws Exception {
        // Arrange
        when(characterRepository.findById(2L)).thenReturn(Optional.of(otherPlayerCharacter));
        when(userRepository.findByUsername("gamemaster")).thenReturn(Optional.of(testGM));

        // Act & Assert
        mockMvc.perform(get("/characters/2")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(2)))
                .andExpect(jsonPath("$.name", is("Other Character")));

        verify(characterRepository, times(1)).findById(2L);
    }

    @Test
    @WithMockUser(username = "testplayer", roles = {"PLAYER"})
    @DisplayName("GET /characters/{id} - Forbidden (player viewing other's character)")
    void getCharacterById_asPlayerViewingOthers_returnsForbidden() throws Exception {
        // Arrange
        when(characterRepository.findById(2L)).thenReturn(Optional.of(otherPlayerCharacter));
        when(userRepository.findByUsername("testplayer")).thenReturn(Optional.of(testPlayer));

        // Act & Assert
        mockMvc.perform(get("/characters/2")
                        .with(csrf()))
                .andExpect(status().isForbidden());

        verify(characterRepository, times(1)).findById(2L);
    }

    @Test
    @WithMockUser(username = "testplayer", roles = {"PLAYER"})
    @DisplayName("GET /characters/{id} - Not found")
    void getCharacterById_nonExistent_throwsException() throws Exception {
        // Arrange
        when(characterRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(get("/characters/999")
                        .with(csrf()))
                .andExpect(status().is5xxServerError());

        verify(characterRepository, times(1)).findById(999L);
    }

    // ==================== POST /characters TESTS ====================

    @Test
    @WithMockUser(username = "testplayer", roles = {"PLAYER"})
    @DisplayName("POST /characters - Success")
    void createCharacter_withValidData_createsCharacter() throws Exception {
        // Arrange
        Character newCharacter = Character.builder()
                .name("New Character")
                .occupation("Marshal")
                .pace(6)
                .size(0)
                .wind(0)
                .grit(1)
                .parry(2)
                .toughness(2)
                .charisma(0)
                .totalXp(0)
                .spentXp(0)
                .agilityDie("1d6")
                .smartsDie("1d6")
                .spiritDie("1d6")
                .strengthDie("1d6")
                .vigorDie("1d6")
                .isNpc(false)
                .skills(new HashSet<>())
                .edges(new HashSet<>())
                .hindrances(new HashSet<>())
                .equipment(new HashSet<>())
                .arcanePowers(new HashSet<>())
                .build();

        Character savedCharacter = Character.builder()
                .id(10L)
                .name("New Character")
                .occupation("Marshal")
                .player(testPlayer)
                .pace(6)
                .size(0)
                .wind(0)
                .grit(1)
                .parry(2)
                .toughness(2)
                .charisma(0)
                .totalXp(0)
                .spentXp(0)
                .agilityDie("1d6")
                .smartsDie("1d6")
                .spiritDie("1d6")
                .strengthDie("1d6")
                .vigorDie("1d6")
                .isNpc(false)
                .skills(new HashSet<>())
                .edges(new HashSet<>())
                .hindrances(new HashSet<>())
                .equipment(new HashSet<>())
                .arcanePowers(new HashSet<>())
                .wounds(new HashSet<>())
                .build();

        when(userRepository.findByUsername("testplayer")).thenReturn(Optional.of(testPlayer));
        when(characterRepository.save(any(Character.class))).thenReturn(savedCharacter);

        // Act & Assert
        mockMvc.perform(post("/characters")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newCharacter)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(10)))
                .andExpect(jsonPath("$.name", is("New Character")))
                .andExpect(jsonPath("$.occupation", is("Marshal")));

        verify(userRepository, times(1)).findByUsername("testplayer");
        verify(characterRepository, times(1)).save(any(Character.class));
    }

    @Test
    @DisplayName("POST /characters - Unauthenticated returns forbidden")
    void createCharacter_unauthenticated_returnsForbidden() throws Exception {
        // Arrange
        Character newCharacter = Character.builder()
                .name("New Character")
                .occupation("Marshal")
                .build();

        // Act & Assert
        mockMvc.perform(post("/characters")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newCharacter)))
                .andExpect(status().isForbidden());

        verify(characterRepository, never()).save(any(Character.class));
    }

    // ==================== PUT /characters/{id} TESTS ====================

    @Test
    @WithMockUser(username = "testplayer", roles = {"PLAYER"})
    @DisplayName("PUT /characters/{id} - Success (character owner)")
    void updateCharacter_asOwner_updatesCharacter() throws Exception {
        // Arrange
        Character updatedDetails = Character.builder()
                .name("Updated Gunslinger")
                .occupation("Expert Gunslinger")
                .pace(7)
                .agilityDie("1d10")
                .skills(new HashSet<>())
                .edges(new HashSet<>())
                .hindrances(new HashSet<>())
                .equipment(new HashSet<>())
                .arcanePowers(new HashSet<>())
                .build();

        when(characterRepository.findById(1L)).thenReturn(Optional.of(playerCharacter));
        when(userRepository.findByUsername("testplayer")).thenReturn(Optional.of(testPlayer));
        when(characterRepository.save(any(Character.class))).thenReturn(playerCharacter);

        // Act & Assert
        mockMvc.perform(put("/characters/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedDetails)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)));

        verify(characterRepository, times(1)).findById(1L);
        verify(characterRepository, times(1)).save(any(Character.class));
    }

    @Test
    @WithMockUser(username = "gamemaster", roles = {"GAME_MASTER"})
    @DisplayName("PUT /characters/{id} - Success (GM editing any character)")
    void updateCharacter_asGM_updatesCharacter() throws Exception {
        // Arrange
        Character updatedDetails = Character.builder()
                .name("GM Updated Character")
                .occupation("Updated Occupation")
                .pace(6)
                .agilityDie("1d8")
                .skills(new HashSet<>())
                .edges(new HashSet<>())
                .hindrances(new HashSet<>())
                .equipment(new HashSet<>())
                .arcanePowers(new HashSet<>())
                .build();

        when(characterRepository.findById(2L)).thenReturn(Optional.of(otherPlayerCharacter));
        when(userRepository.findByUsername("gamemaster")).thenReturn(Optional.of(testGM));
        when(characterRepository.save(any(Character.class))).thenReturn(otherPlayerCharacter);

        // Act & Assert
        mockMvc.perform(put("/characters/2")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedDetails)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(2)));

        verify(characterRepository, times(1)).findById(2L);
        verify(characterRepository, times(1)).save(any(Character.class));
    }

    @Test
    @WithMockUser(username = "testplayer", roles = {"PLAYER"})
    @DisplayName("PUT /characters/{id} - Forbidden (player editing other's character)")
    void updateCharacter_asPlayerEditingOthers_returnsForbidden() throws Exception {
        // Arrange
        Character updatedDetails = Character.builder()
                .name("Hacked Character")
                .occupation("Hacker")
                .pace(6)
                .build();

        when(characterRepository.findById(2L)).thenReturn(Optional.of(otherPlayerCharacter));
        when(userRepository.findByUsername("testplayer")).thenReturn(Optional.of(testPlayer));

        // Act & Assert
        mockMvc.perform(put("/characters/2")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedDetails)))
                .andExpect(status().isForbidden());

        verify(characterRepository, times(1)).findById(2L);
        verify(characterRepository, never()).save(any(Character.class));
    }

    // ==================== DELETE /characters/{id} TESTS ====================

    @Test
    @WithMockUser(username = "testplayer", roles = {"PLAYER"})
    @DisplayName("DELETE /characters/{id} - Success (soft delete)")
    void deleteCharacter_asOwner_softDeletesCharacter() throws Exception {
        // Arrange
        when(characterRepository.findByIdIncludingDeleted(1L)).thenReturn(Optional.of(playerCharacter));
        when(userRepository.findByUsername("testplayer")).thenReturn(Optional.of(testPlayer));
        when(characterRepository.save(any(Character.class))).thenReturn(playerCharacter);

        // Act & Assert
        mockMvc.perform(delete("/characters/1")
                        .with(csrf()))
                .andExpect(status().isNoContent());

        verify(characterRepository, times(1)).findByIdIncludingDeleted(1L);
        verify(characterRepository, times(1)).save(any(Character.class));
    }

    @Test
    @WithMockUser(username = "gamemaster", roles = {"GAME_MASTER"})
    @DisplayName("DELETE /characters/{id} - Success (GM deleting any character)")
    void deleteCharacter_asGM_softDeletesCharacter() throws Exception {
        // Arrange
        when(characterRepository.findByIdIncludingDeleted(2L)).thenReturn(Optional.of(otherPlayerCharacter));
        when(userRepository.findByUsername("gamemaster")).thenReturn(Optional.of(testGM));
        when(characterRepository.save(any(Character.class))).thenReturn(otherPlayerCharacter);

        // Act & Assert
        mockMvc.perform(delete("/characters/2")
                        .with(csrf()))
                .andExpect(status().isNoContent());

        verify(characterRepository, times(1)).findByIdIncludingDeleted(2L);
        verify(characterRepository, times(1)).save(any(Character.class));
    }

    @Test
    @WithMockUser(username = "testplayer", roles = {"PLAYER"})
    @DisplayName("DELETE /characters/{id} - Already deleted returns 410")
    void deleteCharacter_alreadyDeleted_returnsGone() throws Exception {
        // Arrange
        playerCharacter.setDeletedAt(LocalDateTime.now());

        when(characterRepository.findByIdIncludingDeleted(1L)).thenReturn(Optional.of(playerCharacter));
        when(userRepository.findByUsername("testplayer")).thenReturn(Optional.of(testPlayer));

        // Act & Assert
        mockMvc.perform(delete("/characters/1")
                        .with(csrf()))
                .andExpect(status().isGone())
                .andExpect(content().string("Character already deleted"));

        verify(characterRepository, times(1)).findByIdIncludingDeleted(1L);
        verify(characterRepository, never()).save(any(Character.class));
    }

    @Test
    @WithMockUser(username = "testplayer", roles = {"PLAYER"})
    @DisplayName("DELETE /characters/{id} - Forbidden (player deleting other's character)")
    void deleteCharacter_asPlayerDeletingOthers_returnsForbidden() throws Exception {
        // Arrange
        when(characterRepository.findByIdIncludingDeleted(2L)).thenReturn(Optional.of(otherPlayerCharacter));
        when(userRepository.findByUsername("testplayer")).thenReturn(Optional.of(testPlayer));

        // Act & Assert
        mockMvc.perform(delete("/characters/2")
                        .with(csrf()))
                .andExpect(status().isForbidden());

        verify(characterRepository, times(1)).findByIdIncludingDeleted(2L);
        verify(characterRepository, never()).save(any(Character.class));
    }
}
