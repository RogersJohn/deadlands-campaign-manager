package com.deadlands.campaign.service;

import com.deadlands.campaign.exception.SessionAlreadyActiveException;
import com.deadlands.campaign.exception.SessionNotFoundException;
import com.deadlands.campaign.exception.UnauthorizedSessionAccessException;
import com.deadlands.campaign.model.Character;
import com.deadlands.campaign.model.GameSession;
import com.deadlands.campaign.model.SessionPlayer;
import com.deadlands.campaign.model.User;
import com.deadlands.campaign.repository.CharacterRepository;
import com.deadlands.campaign.repository.GameSessionRepository;
import com.deadlands.campaign.repository.SessionPlayerRepository;
import com.deadlands.campaign.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * Service layer for game session business logic.
 *
 * Handles session lifecycle (create, start, end, delete), player management,
 * and authorization checks. All operations are transactional.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class GameSessionService {

    private final GameSessionRepository sessionRepository;
    private final SessionPlayerRepository sessionPlayerRepository;
    private final UserRepository userRepository;
    private final CharacterRepository characterRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Get all active sessions visible to the user.
     * GMs see all sessions, players see sessions they're part of.
     */
    @Transactional(readOnly = true)
    public List<GameSession> getAllSessions(User user) {
        log.debug("Getting all sessions for user: {}", user.getUsername());

        if (user.getRole() == User.Role.GAME_MASTER) {
            return sessionRepository.findByDeletedAtIsNull();
        } else {
            // For now, return all sessions (filtering logic can be added later)
            return sessionRepository.findByDeletedAtIsNull();
        }
    }

    /**
     * Get a specific session by ID.
     * Verifies the user has permission to view this session.
     */
    @Transactional(readOnly = true)
    public GameSession getSession(Long sessionId, User user) {
        log.debug("Getting session {} for user: {}", sessionId, user.getUsername());

        GameSession session = sessionRepository.findByIdAndDeletedAtIsNull(sessionId)
                .orElseThrow(() -> new SessionNotFoundException(sessionId));

        // TODO: Add permission check - for now allow all authenticated users

        return session;
    }

    /**
     * Create a new game session.
     * Only Game Masters can create sessions.
     */
    @Transactional
    public GameSession createSession(String name, String description, Integer maxPlayers, User gameMaster) {
        log.info("Creating new session '{}' by GM: {}", name, gameMaster.getUsername());

        if (gameMaster.getRole() != User.Role.GAME_MASTER) {
            throw new UnauthorizedSessionAccessException("Only Game Masters can create sessions");
        }

        GameSession session = GameSession.builder()
                .name(name)
                .description(description)
                .gameMaster(gameMaster)
                .active(false)
                .maxPlayers(maxPlayers)
                .build();

        session = sessionRepository.save(session);
        log.info("Session created with ID: {}", session.getId());

        return session;
    }

    /**
     * Delete a session (soft delete).
     * Only the Game Master who created the session can delete it.
     * Cannot delete active sessions - must be ended first.
     */
    @Transactional
    public void deleteSession(Long sessionId, User user) {
        log.info("Deleting session {} by user: {}", sessionId, user.getUsername());

        GameSession session = sessionRepository.findByIdAndDeletedAtIsNull(sessionId)
                .orElseThrow(() -> new SessionNotFoundException(sessionId));

        // Verify user is the GM who created this session
        if (!session.getGameMaster().getId().equals(user.getId())) {
            throw new UnauthorizedSessionAccessException(
                "Only the Game Master who created this session can delete it");
        }

        // Cannot delete active sessions
        if (Boolean.TRUE.equals(session.getActive())) {
            throw new SessionAlreadyActiveException(sessionId);
        }

        // Soft delete
        session.setDeletedAt(Instant.now());
        session.setDeletedBy(user);
        sessionRepository.save(session);

        log.info("Session {} soft-deleted successfully", sessionId);
    }

    /**
     * Start a game session (activate it).
     * Only the GM who created the session can start it.
     */
    @Transactional
    public GameSession startSession(Long sessionId, User user) {
        log.info("Starting session {} by user: {}", sessionId, user.getUsername());

        GameSession session = sessionRepository.findByIdAndDeletedAtIsNull(sessionId)
                .orElseThrow(() -> new SessionNotFoundException(sessionId));

        // Verify user is the GM of this session
        if (!session.getGameMaster().getId().equals(user.getId())) {
            throw new UnauthorizedSessionAccessException(
                "Only the Game Master can start this session");
        }

        session.setActive(true);
        session = sessionRepository.save(session);

        // Broadcast game started event
        messagingTemplate.convertAndSend(
            "/topic/session/" + sessionId + "/game-started",
            Map.of("sessionId", sessionId, "startedBy", user.getUsername())
        );

        log.info("Session {} started successfully", sessionId);
        return session;
    }

    /**
     * Join a session with a character.
     */
    @Transactional
    public SessionPlayer joinSession(Long sessionId, Long characterId, User player) {
        log.info("Player {} joining session {} with character {}",
                 player.getUsername(), sessionId, characterId);

        GameSession session = sessionRepository.findByIdAndDeletedAtIsNull(sessionId)
                .orElseThrow(() -> new SessionNotFoundException(sessionId));

        Character character = characterRepository.findById(characterId)
                .orElseThrow(() -> new IllegalArgumentException("Character not found with ID: " + characterId));

        // Verify character belongs to player
        if (!character.getPlayer().getId().equals(player.getId())) {
            throw new UnauthorizedSessionAccessException(
                "You can only join sessions with your own characters");
        }

        // Check if already in session
        if (sessionPlayerRepository.existsBySessionIdAndPlayerIdAndLeftAtIsNull(sessionId, player.getId())) {
            throw new IllegalArgumentException("You are already in this session");
        }

        // Check if session is full
        if (session.getMaxPlayers() != null) {
            long currentPlayers = sessionPlayerRepository.countBySessionIdAndLeftAtIsNull(sessionId);
            if (currentPlayers >= session.getMaxPlayers()) {
                throw new IllegalArgumentException("Session is full");
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
                Map.of("playerId", player.getId(),
                       "playerName", player.getUsername(),
                       "characterName", character.getName())
        );

        log.info("Player {} joined session {} successfully", player.getUsername(), sessionId);
        return sessionPlayer;
    }

    /**
     * Leave a session.
     * Players can leave sessions they've joined.
     * GMs cannot leave their own sessions (they should delete/end them instead).
     */
    @Transactional
    public void leaveSession(Long sessionId, User user) {
        log.info("User {} leaving session {}", user.getUsername(), sessionId);

        GameSession session = sessionRepository.findByIdAndDeletedAtIsNull(sessionId)
                .orElseThrow(() -> new SessionNotFoundException(sessionId));

        // Check if user is the Game Master
        if (session.getGameMaster().getId().equals(user.getId())) {
            // GM cannot "leave" their own session
            log.debug("GM cannot leave their own session - use delete/end instead");
            return;
        }

        // User is a player - find their SessionPlayer record
        SessionPlayer sessionPlayer = sessionPlayerRepository
                .findBySessionIdAndPlayerIdAndLeftAtIsNull(sessionId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("You are not in this session"));

        sessionPlayer.setLeftAt(Instant.now());
        sessionPlayer.setConnected(false);
        sessionPlayerRepository.save(sessionPlayer);

        // Notify other players
        messagingTemplate.convertAndSend(
                "/topic/session/" + sessionId + "/player-left",
                Map.of("playerId", user.getId(), "playerName", user.getUsername())
        );

        log.info("Player {} left session {} successfully", user.getUsername(), sessionId);
    }

    /**
     * Get all players in a session.
     */
    @Transactional(readOnly = true)
    public List<SessionPlayer> getSessionPlayers(Long sessionId) {
        log.debug("Getting players for session {}", sessionId);
        return sessionPlayerRepository.findBySessionIdAndLeftAtIsNull(sessionId);
    }

    /**
     * Update player connection status.
     */
    @Transactional
    public void updatePlayerConnection(Long sessionId, User player, boolean connected) {
        log.debug("Updating connection status for player {} in session {}: {}",
                  player.getUsername(), sessionId, connected);

        SessionPlayer sessionPlayer = sessionPlayerRepository
                .findBySessionIdAndPlayerIdAndLeftAtIsNull(sessionId, player.getId())
                .orElseThrow(() -> new IllegalArgumentException("Player not in this session"));

        sessionPlayer.setConnected(connected);
        sessionPlayer.setLastActivity(Instant.now());
        sessionPlayerRepository.save(sessionPlayer);

        // Broadcast connection status change
        String topic = connected ? "player-connected" : "player-disconnected";
        messagingTemplate.convertAndSend(
                "/topic/session/" + sessionId + "/" + topic,
                Map.of("playerId", player.getId(), "playerName", player.getUsername())
        );
    }

    /**
     * Update player activity timestamp (for heartbeat).
     */
    @Transactional
    public void updatePlayerActivity(Long sessionId, User player) {
        log.trace("Updating activity for player {} in session {}", player.getUsername(), sessionId);

        sessionPlayerRepository
                .findBySessionIdAndPlayerIdAndLeftAtIsNull(sessionId, player.getId())
                .ifPresent(sessionPlayer -> {
                    sessionPlayer.setLastActivity(Instant.now());
                    sessionPlayerRepository.save(sessionPlayer);
                });
    }
}
