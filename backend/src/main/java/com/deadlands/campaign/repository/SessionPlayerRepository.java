package com.deadlands.campaign.repository;

import com.deadlands.campaign.model.SessionPlayer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SessionPlayerRepository extends JpaRepository<SessionPlayer, Long> {

    /**
     * Find all players in a session
     */
    List<SessionPlayer> findBySessionIdAndLeftAtIsNull(Long sessionId);

    /**
     * Find all currently connected players in a session
     */
    List<SessionPlayer> findBySessionIdAndConnectedTrueAndLeftAtIsNull(Long sessionId);

    /**
     * Find all sessions a player is part of
     */
    List<SessionPlayer> findByPlayerIdAndLeftAtIsNull(Long playerId);

    /**
     * Find a specific player in a specific session
     */
    Optional<SessionPlayer> findBySessionIdAndPlayerIdAndLeftAtIsNull(Long sessionId, Long playerId);

    /**
     * Check if a player is already in a session
     */
    boolean existsBySessionIdAndPlayerIdAndLeftAtIsNull(Long sessionId, Long playerId);

    /**
     * Disconnect all players in a session (set connected = false)
     */
    @Modifying
    @Query("UPDATE SessionPlayer sp SET sp.connected = false WHERE sp.session.id = :sessionId")
    void disconnectAllPlayersInSession(Long sessionId);

    /**
     * Count active players in a session
     */
    long countBySessionIdAndLeftAtIsNull(Long sessionId);
}
