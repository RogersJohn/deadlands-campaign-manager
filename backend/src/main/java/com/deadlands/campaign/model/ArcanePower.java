package com.deadlands.campaign.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "arcane_powers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArcanePower {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "character_id", nullable = false)
    private Character character;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    private PowerType type;

    private String speed;
    private String duration;
    private String range;
    private String trait;

    @Column(name = "target_number")
    private Integer targetNumber;

    @Column(length = 1000)
    private String notes;

    public enum PowerType {
        HEXSLINGING,
        RITUAL,
        SHAMANISM,
        BLESSED,
        MAD_SCIENCE
    }
}
