package com.deadlands.campaign.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "skills")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Skill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "character_id", nullable = false)
    private Character character;

    @Column(nullable = false)
    private String name;

    @Column(name = "die_value", nullable = false)
    private String dieValue; // e.g., "3d6", "4d12"

    @Enumerated(EnumType.STRING)
    private SkillCategory category;

    @Column(length = 500)
    private String notes;

    public enum SkillCategory {
        COGNITION,
        DEFTNESS,
        KNOWLEDGE,
        NIMBLENESS,
        SMARTS,
        SPIRIT,
        STRENGTH,
        VIGOR,
        TRADE,
        PROFESSIONAL
    }
}
