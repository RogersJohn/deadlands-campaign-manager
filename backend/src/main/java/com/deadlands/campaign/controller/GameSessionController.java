package com.deadlands.campaign.controller;

import com.deadlands.campaign.dto.CreateSessionRequest;
import com.deadlands.campaign.dto.JoinSessionRequest;
import com.deadlands.campaign.dto.TokenMoveRequest;
import com.deadlands.campaign.dto.TokenMovedEvent;
import com.deadlands.campaign.model.*;
import com.deadlands.campaign.repository.*;
import com.deadlands.campaign.service.GameSessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

/**
 * Controller for managing multiplayer game sessions.
 *
 * @deprecated This entire session management system is being phased out.
 * The application now uses a single shared game world instead of multiple sessions.
 * These endpoints are kept for backward compatibility but will be removed in a future version.
 *
 * New approach: All players access the same game via /arena (no session selection).
 * Session notes will be handled via the Wiki system instead.
 */
@Deprecated
@RestController
@RequestMapping("/sessions")
@RequiredArgsConstructor
public class GameSessionController {

    private final GameSessionService sessionService;
    private final UserRepository userRepository;
    private final CharacterRepository characterRepository;

    // ============ REST ENDPOINTS ============

    /**
     * Get all active sessions
     */
    @GetMapping
    public ResponseEntity<List<GameSession>> getAllSessions(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<GameSession> sessions = sessionService.getAllSessions(user);
        return ResponseEntity.ok(sessions);
    }

    /**
     * Get a specific session by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<GameSession> getSession(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        GameSession session = sessionService.getSession(id, user);
        return ResponseEntity.ok(session);
    }

    /**
     * Create a new game session (GM only)
     */
    @PostMapping
    @PreAuthorize("hasRole('GAME_MASTER')")
    public ResponseEntity<GameSession> createSession(
            @Valid @RequestBody CreateSessionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User gameMaster = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        GameSession session = sessionService.createSession(
            request.getName(),
            request.getDescription(),
            request.getMaxPlayers(),
            gameMaster
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(session);
    }

    /**
     * Delete a session (GM only)
     * Only the GM who created the session can delete it.
     * Cannot delete active sessions - must be ended first.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('GAME_MASTER')")
    public ResponseEntity<Void> deleteSession(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        sessionService.deleteSession(id, user);
        return ResponseEntity.noContent().build();
    }

    /**
     * Join a session with a character
     */
    @PostMapping("/{sessionId}/join")
    public ResponseEntity<SessionPlayer> joinSession(
            @PathVariable Long sessionId,
            @Valid @RequestBody JoinSessionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User player = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        SessionPlayer sessionPlayer = sessionService.joinSession(
            sessionId,
            request.getCharacterId(),
            player
        );

        return ResponseEntity.ok(sessionPlayer);
    }

    /**
     * Leave a session
     */
    @PostMapping("/{sessionId}/leave")
    public ResponseEntity<Void> leaveSession(
            @PathVariable Long sessionId,
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        sessionService.leaveSession(sessionId, user);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get all players in a session
     */
    @GetMapping("/{sessionId}/players")
    public ResponseEntity<List<SessionPlayer>> getSessionPlayers(@PathVariable Long sessionId) {
        List<SessionPlayer> players = sessionService.getSessionPlayers(sessionId);
        return ResponseEntity.ok(players);
    }

    /**
     * Start the game (GM only)
     */
    @PostMapping("/{sessionId}/start")
    @PreAuthorize("hasRole('GAME_MASTER')")
    public ResponseEntity<GameSession> startGame(
            @PathVariable Long sessionId,
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        GameSession session = sessionService.startSession(sessionId, user);
        return ResponseEntity.ok(session);
    }

    // ============ WEBSOCKET MESSAGE HANDLERS ============

    /**
     * Player connects to session
     */
    @MessageMapping("/session/{sessionId}/connect")
    public void connectToSession(@DestinationVariable Long sessionId, Principal principal) {
        User player = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        sessionService.updatePlayerConnection(sessionId, player, true);
    }

    /**
     * Player disconnects from session
     */
    @MessageMapping("/session/{sessionId}/disconnect")
    public void disconnectFromSession(@DestinationVariable Long sessionId, Principal principal) {
        User player = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        sessionService.updatePlayerConnection(sessionId, player, false);
    }

    /**
     * Heartbeat to keep connection alive and update activity
     */
    @MessageMapping("/session/{sessionId}/heartbeat")
    public void heartbeat(@DestinationVariable Long sessionId, Principal principal) {
        User player = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        sessionService.updatePlayerActivity(sessionId, player);
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
        sessionService.updatePlayerActivity(sessionId, player);

        // Note: Token movement broadcasting is handled here (not in service)
        // This is acceptable as it's a WebSocket-specific concern
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
            com.deadlands.campaign.model.Character character = characterRepository.findById(characterId).orElse(null);

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

}
