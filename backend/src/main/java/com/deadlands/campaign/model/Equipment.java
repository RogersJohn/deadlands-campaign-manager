package com.deadlands.campaign.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "equipment")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Equipment {

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
    private EquipmentType type;

    @Column(nullable = false)
    private Integer quantity = 1;

    @Column(precision = 10, scale = 2)
    private BigDecimal weight;

    @Column(precision = 10, scale = 2)
    private BigDecimal cost;

    // Weapon-specific fields
    private String damage;
    private String range;
    private Integer rof; // Rate of Fire
    private Integer shots;
    private Integer speed;
    private Integer defense;

    @Column(name = "is_equipped")
    private Boolean isEquipped = false;

    public enum EquipmentType {
        WEAPON_MELEE,
        WEAPON_RANGED,
        ARMOR,
        AMMUNITION,
        GEAR,
        TREASURE,
        CONSUMABLE
    }
}
