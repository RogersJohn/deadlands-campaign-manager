package com.deadlands.campaign.repository;

import com.deadlands.campaign.model.GameSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GameSessionRepository extends JpaRepository<GameSession, Long> {

    /**
     * Find all active sessions (not soft-deleted)
     */
    List<GameSession> findByDeletedAtIsNull();

    /**
     * Find active sessions for a specific Game Master
     */
    List<GameSession> findByGameMasterIdAndDeletedAtIsNull(Long gameMasterId);

    /**
     * Find active sessions that are currently in progress
     */
    List<GameSession> findByActiveTrueAndDeletedAtIsNull();

    /**
     * Find a session by ID (not soft-deleted)
     */
    Optional<GameSession> findByIdAndDeletedAtIsNull(Long id);

    /**
     * Count active sessions for a GM
     */
    @Query("SELECT COUNT(s) FROM GameSession s WHERE s.gameMaster.id = :gameMasterId AND s.deletedAt IS NULL")
    long countActiveSessionsByGameMaster(Long gameMasterId);
}
