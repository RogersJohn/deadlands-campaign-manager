package com.deadlands.campaign.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "edges")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Edge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "character_id", nullable = false)
    private Character character;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    private EdgeType type;

    public enum EdgeType {
        BACKGROUND,
        COMBAT,
        LEADERSHIP,
        PROFESSIONAL,
        SOCIAL,
        SUPERNATURAL,
        WEIRD
    }
}
