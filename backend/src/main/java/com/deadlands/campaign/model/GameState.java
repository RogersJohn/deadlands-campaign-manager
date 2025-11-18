package com.deadlands.campaign.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Singleton entity representing the global game state.
 *
 * There is only ONE game state record (id = 1) for the entire shared world.
 * This tracks the current map, turn number, phase, and all token positions.
 *
 * When the GM changes maps, all token positions are cleared.
 */
@Entity
@Table(name = "game_state")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class GameState {

    /**
     * Always 1 - singleton pattern for single shared world.
     */
    @Id
    private Long id = 1L;

    /**
     * Current turn number in combat.
     */
    @Column(nullable = false)
    private Integer turnNumber = 1;

    /**
     * Current phase: 'player', 'enemy', 'resolution'
     */
    @Column(nullable = false, length = 50)
    private String turnPhase = "player";

    /**
     * Current map identifier (e.g., "saloon_interior", "desert_canyon")
     * When this changes, all token positions should be cleared.
     */
    @Column(length = 255)
    private String currentMap;

    /**
     * All token positions on the current map.
     * Cascade DELETE: When game state is reset, positions are cleared.
     */
    @OneToMany(mappedBy = "gameState", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TokenPosition> tokenPositions = new ArrayList<>();

    /**
     * Last time any game action occurred (move, combat, etc.)
     */
    @Column(nullable = false)
    private LocalDateTime lastActivity = LocalDateTime.now();

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    /**
     * Clear all token positions.
     * Used when GM changes the map.
     */
    public void clearAllTokenPositions() {
        this.tokenPositions.clear();
    }

    /**
     * Add or update a token position.
     * If token already exists, updates its position.
     * If token is new, adds it to the list.
     */
    public void updateTokenPosition(TokenPosition position) {
        // Remove existing position for this token if present
        this.tokenPositions.removeIf(p -> p.getTokenId().equals(position.getTokenId()));

        // Add the new/updated position
        position.setGameState(this);
        this.tokenPositions.add(position);

        // Update last activity
        this.lastActivity = LocalDateTime.now();
    }

    /**
     * Remove a specific token from the map.
     * Used when character is deleted or leaves.
     */
    public void removeToken(String tokenId) {
        this.tokenPositions.removeIf(p -> p.getTokenId().equals(tokenId));
        this.lastActivity = LocalDateTime.now();
    }
}
