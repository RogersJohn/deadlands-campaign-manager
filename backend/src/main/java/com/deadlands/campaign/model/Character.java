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
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "characters")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Character {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String occupation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player_id")
    private User player;

    // Core Stats
    @Column(nullable = false)
    private Integer pace = 6;

    @Column(nullable = false)
    private Integer size = 0;

    @Column(nullable = false)
    private Integer wind = 0;

    @Column(nullable = false)
    private Integer grit = 1;

    // Attributes - stored as dice notation (e.g., "3d6")
    @Column(name = "cognition_die")
    private String cognitionDie = "1d6";

    @Column(name = "deftness_die")
    private String deftnessDie = "1d6";

    @Column(name = "nimbleness_die")
    private String nimblenessDie = "1d6";

    @Column(name = "quickness_die")
    private String quicknessDie = "1d6";

    @Column(name = "smarts_die")
    private String smartsDie = "1d6";

    @Column(name = "spirit_die")
    private String spiritDie = "1d6";

    @Column(name = "strength_die")
    private String strengthDie = "1d6";

    @Column(name = "vigor_die")
    private String vigorDie = "1d6";

    // Derived Stats
    @OneToMany(mappedBy = "character", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Skill> skills = new HashSet<>();

    @OneToMany(mappedBy = "character", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Edge> edges = new HashSet<>();

    @OneToMany(mappedBy = "character", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Hindrance> hindrances = new HashSet<>();

    @OneToMany(mappedBy = "character", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Equipment> equipment = new HashSet<>();

    @OneToMany(mappedBy = "character", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ArcanePower> arcanePowers = new HashSet<>();

    @OneToMany(mappedBy = "character", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Wound> wounds = new HashSet<>();

    @Column(length = 2000)
    private String notes;

    @Column(name = "character_image_url")
    private String characterImageUrl;

    @Column(name = "is_npc")
    private Boolean isNpc = false;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
