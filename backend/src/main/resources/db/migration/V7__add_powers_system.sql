-- Phase 3: Power Casting System
-- Seed common Deadlands Savage Worlds powers into existing arcane_power_references table
-- Uses existing tables: arcane_power_references (power templates) and arcane_powers (character-power join)

-- Seed 10 common combat-relevant Deadlands powers
INSERT INTO arcane_power_references (name, description, power_points, range, duration, trait_roll, effect, arcane_backgrounds) VALUES

-- 1. Bolt - Basic attack power
('Bolt',
 'The caster conjures a magical projectile of energy that streaks toward a foe. This is one of the most common offensive powers.',
 1,
 'Smarts x 2',
 'Instant',
 'Arcane Skill',
 '2d6 damage. Ranged touch attack (+2 to hit). With a raise on the arcane skill roll, the damage increases to 3d6.',
 'Blessed,Huckster,Shaman,Mad Scientist'),

-- 2. Blast - Area damage
('Blast',
 'Blast creates an explosion of fire, cold, or other energy that damages all targets in a Medium Burst Template.',
 2,
 'Smarts x 2',
 'Instant',
 'Arcane Skill',
 '2d6 damage to all targets in Medium Burst Template. With raise: 3d6 damage. Each target makes a separate damage resistance roll.',
 'Blessed,Huckster,Shaman,Mad Scientist'),

-- 3. Armor - Defensive buff
('Armor',
 'Armor creates a magical field around a character (or their clothing or gear) that protects them from attacks. The effect is invisible but might shimmer when hit.',
 2,
 'Touch',
 '3 (1/round)',
 'Arcane Skill',
 '+2 Armor. With raise: +4 Armor. Duration: 3 rounds (or until dispelled). Can be maintained for 1 PP per round.',
 'Blessed,Huckster,Shaman,Mad Scientist'),

-- 4. Healing - Wound recovery
('Healing',
 'Healing can remove Wounds less than one hour old. The "golden hour" can be increased to 24 hours with the Healer Edge. It can also cure poison and disease.',
 3,
 'Touch',
 'Permanent',
 'Faith',
 'Remove 1 Wound. With raise: Remove 1 additional Wound (2 total). Must be cast within 1 hour of injury (24 hours with Healer Edge). Can also neutralize poison or disease.',
 'Blessed'),

-- 5. Boost Trait - Buff ability
('Boost Trait',
 'Boost Trait increases one of a target''s Trait (attribute or skill) by one die type. This can never take a Trait above d12+2.',
 2,
 'Smarts',
 '3 (1/round)',
 'Arcane Skill',
 '+1 die step to chosen Trait. With raise: +2 die steps. Duration: 3 rounds. Can be maintained for 1 PP per round. Maximum: d12+2.',
 'Blessed,Huckster,Shaman'),

-- 6. Lower Trait - Debuff ability
('Lower Trait',
 'This power lowers a target''s Trait (attribute or skill). The target resists with an opposed Spirit roll.',
 2,
 'Smarts',
 '3 (1/round)',
 'Arcane Skill',
 '-1 die step to chosen Trait. With raise: -2 die steps. Target resists with opposed Spirit roll. Duration: 3 rounds. Can be maintained.',
 'Huckster,Shaman'),

-- 7. Deflection - Ranged defense
('Deflection',
 'Deflection creates an invisible field that deflects incoming ranged and melee attacks from the target.',
 2,
 'Smarts',
 '3 (1/round)',
 'Arcane Skill',
 '-2 to all attacks (ranged and melee) against target. With raise: -4 to all attacks. Duration: 3 rounds. Can be maintained for 1 PP per round.',
 'Blessed,Huckster,Shaman'),

-- 8. Smite - Melee damage buff
('Smite',
 'Smite increases the damage a weapon does by granting it a magical, holy, or other enchantment. This works with any melee or ranged weapon.',
 2,
 'Touch',
 '3 (1/round)',
 'Arcane Skill',
 '+2 to weapon damage rolls. With raise: +4 to weapon damage. Duration: 3 rounds. Can be maintained for 1 PP per round.',
 'Blessed,Huckster'),

-- 9. Stun - Non-lethal attack
('Stun',
 'Stun assaults a target''s mind with focused mental energy, disorienting them. The victim resists with a Vigor roll.',
 2,
 'Smarts',
 'Instant',
 'Arcane Skill',
 'Target makes Vigor roll (-2 with raise on casting) or becomes Shaken. If already Shaken, target takes a Wound instead.',
 'Blessed,Huckster,Shaman'),

-- 10. Dispel - Counter magic
('Dispel',
 'Dispel can be used to negate enemy powers or end friendly ongoing powers. Requires opposed arcane skill roll vs original caster.',
 3,
 'Smarts',
 'Instant',
 'Arcane Skill',
 'Make opposed arcane skill roll vs original caster. Success: Target power ends immediately. When used on friendly power, automatically succeeds.',
 'Blessed,Huckster,Shaman');

-- Add comment for documentation
COMMENT ON TABLE arcane_power_references IS 'Reference data for Deadlands Savage Worlds powers. Phase 3 implementation adds 10 base combat powers.';
