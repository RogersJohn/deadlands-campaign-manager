package com.deadlands.campaign.repository;

import com.deadlands.campaign.model.Character;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CharacterRepository extends JpaRepository<Character, Long> {
    List<Character> findByPlayerId(Long playerId);
    List<Character> findByIsNpc(Boolean isNpc);
    List<Character> findByPlayerIdAndIsNpc(Long playerId, Boolean isNpc);

    @EntityGraph(attributePaths = {"skills", "edges", "hindrances", "equipment", "arcanePowers", "wounds", "player"})
    @Query("SELECT c FROM Character c WHERE c.id = :id")
    Optional<Character> findByIdWithRelationships(@Param("id") Long id);

    @EntityGraph(attributePaths = {"skills", "edges", "hindrances", "equipment", "arcanePowers", "wounds", "player"})
    @Query("SELECT c FROM Character c")
    List<Character> findAllWithRelationships();

    @EntityGraph(attributePaths = {"skills", "edges", "hindrances", "equipment", "arcanePowers", "wounds", "player"})
    @Query("SELECT c FROM Character c WHERE c.player.id = :playerId")
    List<Character> findByPlayerIdWithRelationships(@Param("playerId") Long playerId);
}
