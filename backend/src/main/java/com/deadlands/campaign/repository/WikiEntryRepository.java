package com.deadlands.campaign.repository;

import com.deadlands.campaign.model.WikiEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WikiEntryRepository extends JpaRepository<WikiEntry, Long> {

    Optional<WikiEntry> findBySlug(String slug);

    List<WikiEntry> findByCategory(WikiEntry.Category category);

    List<WikiEntry> findByIsPublicTrue();

    @Query("SELECT w FROM WikiEntry w WHERE w.relatedCharacter.id = :characterId")
    List<WikiEntry> findByRelatedCharacterId(@Param("characterId") Long characterId);

    @Query("SELECT w FROM WikiEntry w ORDER BY w.category, w.sortOrder, w.title")
    List<WikiEntry> findAllOrdered();
}
