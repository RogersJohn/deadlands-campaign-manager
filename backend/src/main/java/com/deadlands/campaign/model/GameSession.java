package com.deadlands.campaign.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

/**
 * Represents a multiplayer game session (campaign/room).
 *
 * A session is created by a Game Master and can have multiple players join.
 * The session maintains the authoritative game state (map, tokens, fog of war).
 */
@Entity
@Table(name = "game_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class GameSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Session name (e.g., "Chapter 1: The Ghost Town")
     */
    @Column(nullable = false)
    private String name;

    /**
     * The Game Master who created and controls this session
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "game_master_id", nullable = false)
    @JsonIgnoreProperties({"password", "characters", "createdAt", "updatedAt"})
    private User gameMaster;

    /**
     * Whether the session is currently active (in progress)
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean active = false;

    /**
     * JSON blob containing the current game state:
     * - Map configuration
     * - Token positions
     * - Fog of war state
     * - Cover tiles
     * - Current turn/phase
     *
     * Stored as TEXT to allow large game states
     */
    @Column(columnDefinition = "TEXT")
    private String gameState;

    /**
     * Maximum number of players allowed (null = unlimited)
     */
    @Column
    private Integer maxPlayers;

    /**
     * Session description/notes
     */
    @Column(columnDefinition = "TEXT")
    private String description;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;

    /**
     * Soft delete support
     */
    @Column
    private Instant deletedAt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "deleted_by")
    @JsonIgnoreProperties({"password", "characters", "createdAt", "updatedAt"})
    private User deletedBy;
}
