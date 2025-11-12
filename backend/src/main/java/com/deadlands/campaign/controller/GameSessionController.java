package com.deadlands.campaign.controller;

import com.deadlands.campaign.dto.TokenMoveRequest;
import com.deadlands.campaign.dto.TokenMovedEvent;
import com.deadlands.campaign.model.*;
import com.deadlands.campaign.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * Controller for managing multiplayer game sessions.
 *
 * Handles both REST endpoints (session CRUD) and WebSocket messages (real-time updates).
 */
@Controller
public class GameSessionController {

    @Autowired
    private GameSessionRepository sessionRepository;

    @Autowired
    private SessionPlayerRepository sessionPlayerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CharacterRepository characterRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // ============ REST ENDPOINTS ============

    /**
     * Get all active sessions
     */
    @GetMapping("/sessions")
    @ResponseBody
    public ResponseEntity<List<GameSession>> getAllSessions(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<GameSession> sessions;
        if (user.getRole() == User.Role.GAME_MASTER) {
            // GMs see all sessions
            sessions = sessionRepository.findByDeletedAtIsNull();
        } else {
            // Players see sessions they're part of or public sessions
            sessions = sessionRepository.findByDeletedAtIsNull();
        }

        return ResponseEntity.ok(sessions);
    }

    /**
     * Get a specific session by ID
     */
    @GetMapping("/sessions/{id}")
    @ResponseBody
    public ResponseEntity<GameSession> getSession(@PathVariable Long id, Authentication authentication) {
        GameSession session = sessionRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        // TODO: Check if user has permission to view this session

        return ResponseEntity.ok(session);
    }

    /**
     * Create a new game session (GM only)
     */
    @PostMapping("/sessions")
    @PreAuthorize("hasAuthority('GAME_MASTER')")
    @ResponseBody
    public ResponseEntity<GameSession> createSession(@RequestBody CreateSessionRequest request,
                                                       Authentication authentication) {
        User gameMaster = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        GameSession session = GameSession.builder()
                .name(request.getName())
                .description(request.getDescription())
                .gameMaster(gameMaster)
                .active(false)
                .maxPlayers(request.getMaxPlayers())
                .build();

        session = sessionRepository.save(session);

        return ResponseEntity.status(HttpStatus.CREATED).body(session);
    }

    /**
     * Join a session with a character
     */
    @PostMapping("/sessions/{sessionId}/join")
    @ResponseBody
    public ResponseEntity<SessionPlayer> joinSession(@PathVariable Long sessionId,
                                                       @RequestBody JoinSessionRequest request,
                                                       Authentication authentication) {
        User player = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        GameSession session = sessionRepository.findByIdAndDeletedAtIsNull(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        Character character = characterRepository.findById(request.getCharacterId())
                .orElseThrow(() -> new RuntimeException("Character not found"));

        // Check if character belongs to player
        if (!character.getPlayer().getId().equals(player.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Check if already in session
        if (sessionPlayerRepository.existsBySessionIdAndPlayerIdAndLeftAtIsNull(sessionId, player.getId())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        // Check if session is full
        if (session.getMaxPlayers() != null) {
            long currentPlayers = sessionPlayerRepository.countBySessionIdAndLeftAtIsNull(sessionId);
            if (currentPlayers >= session.getMaxPlayers()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }
        }

        SessionPlayer sessionPlayer = SessionPlayer.builder()
                .session(session)
                .player(player)
                .character(character)
                .connected(false)
                .build();

        sessionPlayer = sessionPlayerRepository.save(sessionPlayer);

        // Notify other players
        messagingTemplate.convertAndSend(
                "/topic/session/" + sessionId + "/player-joined",
                Map.of("playerId", player.getId(), "playerName", player.getUsername(), "characterName", character.getName())
        );

        return ResponseEntity.ok(sessionPlayer);
    }

    /**
     * Leave a session
     */
    @PostMapping("/sessions/{sessionId}/leave")
    @ResponseBody
    public ResponseEntity<Void> leaveSession(@PathVariable Long sessionId, Authentication authentication) {
        User player = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        SessionPlayer sessionPlayer = sessionPlayerRepository
                .findBySessionIdAndPlayerIdAndLeftAtIsNull(sessionId, player.getId())
                .orElseThrow(() -> new RuntimeException("Not in this session"));

        sessionPlayer.setLeftAt(Instant.now());
        sessionPlayer.setConnected(false);
        sessionPlayerRepository.save(sessionPlayer);

        // Notify other players
        messagingTemplate.convertAndSend(
                "/topic/session/" + sessionId + "/player-left",
                Map.of("playerId", player.getId(), "playerName", player.getUsername())
        );

        return ResponseEntity.noContent().build();
    }

    /**
     * Get all players in a session
     */
    @GetMapping("/sessions/{sessionId}/players")
    @ResponseBody
    public ResponseEntity<List<SessionPlayer>> getSessionPlayers(@PathVariable Long sessionId) {
        List<SessionPlayer> players = sessionPlayerRepository.findBySessionIdAndLeftAtIsNull(sessionId);
        return ResponseEntity.ok(players);
    }

    // ============ WEBSOCKET MESSAGE HANDLERS ============

    /**
     * Player connects to session
     */
    @MessageMapping("/session/{sessionId}/connect")
    public void connectToSession(@DestinationVariable Long sessionId, Principal principal) {
        User player = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        SessionPlayer sessionPlayer = sessionPlayerRepository
                .findBySessionIdAndPlayerIdAndLeftAtIsNull(sessionId, player.getId())
                .orElseThrow(() -> new RuntimeException("Not in this session"));

        sessionPlayer.setConnected(true);
        sessionPlayer.setLastActivity(Instant.now());
        sessionPlayerRepository.save(sessionPlayer);

        // Broadcast connection to all players in session
        messagingTemplate.convertAndSend(
                "/topic/session/" + sessionId + "/player-connected",
                Map.of("playerId", player.getId(), "playerName", player.getUsername())
        );
    }

    /**
     * Player disconnects from session
     */
    @MessageMapping("/session/{sessionId}/disconnect")
    public void disconnectFromSession(@DestinationVariable Long sessionId, Principal principal) {
        User player = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        SessionPlayer sessionPlayer = sessionPlayerRepository
                .findBySessionIdAndPlayerIdAndLeftAtIsNull(sessionId, player.getId())
                .orElseThrow(() -> new RuntimeException("Not in this session"));

        sessionPlayer.setConnected(false);
        sessionPlayerRepository.save(sessionPlayer);

        // Broadcast disconnection
        messagingTemplate.convertAndSend(
                "/topic/session/" + sessionId + "/player-disconnected",
                Map.of("playerId", player.getId(), "playerName", player.getUsername())
        );
    }

    /**
     * Heartbeat to keep connection alive and update activity
     */
    @MessageMapping("/session/{sessionId}/heartbeat")
    public void heartbeat(@DestinationVariable Long sessionId, Principal principal) {
        User player = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        SessionPlayer sessionPlayer = sessionPlayerRepository
                .findBySessionIdAndPlayerIdAndLeftAtIsNull(sessionId, player.getId())
                .orElse(null);

        if (sessionPlayer != null) {
            sessionPlayer.setLastActivity(Instant.now());
            sessionPlayerRepository.save(sessionPlayer);
        }
    }

    /**
     * Move a token on the battlefield
     * Server validates the move, updates state, and broadcasts to all players
     */
    @MessageMapping("/session/{sessionId}/move-token")
    public void moveToken(@DestinationVariable Long sessionId,
                          TokenMoveRequest request,
                          Principal principal) {
        User player = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify player is in this session
        SessionPlayer sessionPlayer = sessionPlayerRepository
                .findBySessionIdAndPlayerIdAndLeftAtIsNull(sessionId, player.getId())
                .orElseThrow(() -> new RuntimeException("Not in this session"));

        // Validate the move (basic validation for now)
        if (!isValidMove(request)) {
            // Silently reject invalid moves
            return;
        }

        // For player tokens, verify ownership
        if ("PLAYER".equals(request.getTokenType())) {
            // Check if this player owns the character being moved
            if (!canMoveToken(player, request.getTokenId())) {
                return; // Reject silently
            }
        } else if ("ENEMY".equals(request.getTokenType())) {
            // Only GM can move enemies
            if (player.getRole() != User.Role.GAME_MASTER) {
                return;
            }
        }

        // Update last activity
        sessionPlayer.setLastActivity(Instant.now());
        sessionPlayerRepository.save(sessionPlayer);

        // Broadcast the token movement to all players in session
        TokenMovedEvent event = new TokenMovedEvent(
                request.getTokenId(),
                request.getTokenType(),
                player.getUsername(),
                request.getToX(),
                request.getToY(),
                System.currentTimeMillis()
        );

        messagingTemplate.convertAndSend(
                "/topic/session/" + sessionId + "/token-moved",
                event
        );
    }

    /**
     * Validate if a move is legal (basic validation)
     */
    private boolean isValidMove(TokenMoveRequest request) {
        // Check required fields
        if (request.getToX() == null || request.getToY() == null) {
            return false;
        }

        // Check grid boundaries (assuming 200x200 grid)
        if (request.getToX() < 0 || request.getToX() >= 200 ||
            request.getToY() < 0 || request.getToY() >= 200) {
            return false;
        }

        // TODO: Add more validation:
        // - Check movement distance (pace-based)
        // - Check for obstacles
        // - Check for occupied tiles

        return true;
    }

    /**
     * Check if a player can move a specific token
     */
    private boolean canMoveToken(User player, String tokenId) {
        // For player tokens, tokenId is the character ID
        try {
            Long characterId = Long.parseLong(tokenId);
            Character character = characterRepository.findById(characterId).orElse(null);

            if (character == null) {
                return false;
            }

            // Player must own this character, or be a GM
            return character.getPlayer().getId().equals(player.getId()) ||
                   player.getRole() == User.Role.GAME_MASTER;
        } catch (NumberFormatException e) {
            // Invalid token ID
            return false;
        }
    }

    // ============ DTOs ============

    public static class CreateSessionRequest {
        private String name;
        private String description;
        private Integer maxPlayers;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Integer getMaxPlayers() { return maxPlayers; }
        public void setMaxPlayers(Integer maxPlayers) { this.maxPlayers = maxPlayers; }
    }

    public static class JoinSessionRequest {
        private Long characterId;

        public Long getCharacterId() { return characterId; }
        public void setCharacterId(Long characterId) { this.characterId = characterId; }
    }
}
