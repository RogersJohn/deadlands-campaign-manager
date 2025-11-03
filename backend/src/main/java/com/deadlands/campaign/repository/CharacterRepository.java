package com.deadlands.campaign.repository;

import com.deadlands.campaign.model.Character;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CharacterRepository extends JpaRepository<Character, Long> {
    List<Character> findByPlayerId(Long playerId);
    List<Character> findByIsNpc(Boolean isNpc);
    List<Character> findByPlayerIdAndIsNpc(Long playerId, Boolean isNpc);
}
