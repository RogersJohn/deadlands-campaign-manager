package com.deadlands.campaign.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

/**
 * Represents a player's participation in a game session.
 *
 * Associates a player (user) with a session and the character they're playing.
 * Tracks connection status for real-time session management.
 */
@Entity
@Table(
    name = "session_players",
    uniqueConstraints = @UniqueConstraint(columnNames = {"session_id", "player_id"})
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionPlayer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The game session this player is part of
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private GameSession session;

    /**
     * The player (user) participating in this session
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player_id", nullable = false)
    private User player;

    /**
     * The character this player is using in the session
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "character_id", nullable = false)
    private Character character;

    /**
     * Whether the player is currently connected via WebSocket
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean connected = false;

    /**
     * Player's color for token/UI identification (hex color code)
     */
    @Column
    private String color;

    /**
     * Timestamp of last activity (for idle detection)
     */
    @Column
    private Instant lastActivity;

    /**
     * When the player joined this session
     */
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant joinedAt;

    /**
     * When the player left this session (null if still active)
     */
    @Column
    private Instant leftAt;
}
