-- =====================================================
-- COMPREHENSIVE DEADLANDS CLASSIC → SAVAGE WORLDS CONVERSION
-- =====================================================
-- This script converts all characters from Deadlands Classic format
-- to Savage Worlds format by:
-- 1. Converting 8 attributes (Cognition, Deftness, etc.) to 5 (Agility, Smarts, Spirit, Strength, Vigor)
-- 2. Converting multi-die notation (3d8) to single-die notation (d8)
-- 3. Updating all skills to use single-die notation
-- =====================================================

-- STEP 1: Add Savage Worlds attribute columns if they don't exist
ALTER TABLE characters ADD COLUMN IF NOT EXISTS agility_die VARCHAR(10) DEFAULT 'd6';
ALTER TABLE characters ADD COLUMN IF NOT EXISTS smarts_die VARCHAR(10) DEFAULT 'd6';
ALTER TABLE characters ADD COLUMN IF NOT EXISTS spirit_die VARCHAR(10) DEFAULT 'd6';
ALTER TABLE characters ADD COLUMN IF NOT EXISTS strength_die VARCHAR(10) DEFAULT 'd6';
ALTER TABLE characters ADD COLUMN IF NOT EXISTS vigor_die VARCHAR(10) DEFAULT 'd6';

-- STEP 2: Create a conversion function for dice notation
-- Converts Deadlands Classic XdY to Savage Worlds dY
-- Conversion logic:
--   1d4, 1d6          → d4
--   1d8, 1d10, 2d6    → d6
--   1d12, 2d8, 2d10, 3d6 → d8
--   2d12, 3d8, 3d10, 4d6, 4d8 → d10
--   3d12+, 4d10+, 5d6+, 5d8+, 5d10+, 5d12+ → d12

CREATE OR REPLACE FUNCTION convert_die_notation(old_die TEXT) RETURNS TEXT AS $$
BEGIN
    -- d4 level (minimal training)
    IF old_die IN ('1d4', '1d6') THEN
        RETURN 'd4';

    -- d6 level (trained)
    ELSIF old_die IN ('1d8', '1d10', '2d6') THEN
        RETURN 'd6';

    -- d8 level (good)
    ELSIF old_die IN ('1d12', '2d8', '2d10', '3d6') THEN
        RETURN 'd8';

    -- d10 level (very good)
    ELSIF old_die IN ('2d12', '3d8', '3d10', '4d6', '4d8') THEN
        RETURN 'd10';

    -- d12 level (expert)
    ELSIF old_die IN ('3d12', '4d10', '4d12', '5d6', '5d8', '5d10', '5d12') THEN
        RETURN 'd12';

    -- d12+1 level (heroic)
    ELSIF old_die IN ('6d6', '6d8', '6d10', '6d12', '4d12', '5d12') THEN
        RETURN 'd12+1';

    -- d12+2 level (legendary)
    ELSIF old_die ~ '^\d{2,}d\d+$' THEN -- matches 10d6, 15d8, etc.
        RETURN 'd12+2';

    -- Default to d6 if unrecognized
    ELSE
        RETURN 'd6';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- STEP 3: Convert character attributes from Deadlands Classic to Savage Worlds
-- Mapping:
--   Agility   ← Max(Deftness, Nimbleness) -- hand-eye and dodging
--   Smarts    ← Max(Smarts, Cognition)    -- mental capacity
--   Spirit    ← Spirit                     -- willpower (unchanged)
--   Strength  ← Strength                   -- physical power (unchanged)
--   Vigor     ← Vigor                      -- toughness (unchanged)

UPDATE characters SET
    agility_die = CASE
        -- Compare deftness and nimbleness, use higher value
        WHEN convert_die_notation(deftness_die) > convert_die_notation(nimbleness_die)
            THEN convert_die_notation(deftness_die)
        ELSE convert_die_notation(nimbleness_die)
    END,

    smarts_die = CASE
        -- Compare smarts and cognition, use higher value
        WHEN convert_die_notation(smarts_die) > convert_die_notation(cognition_die)
            THEN convert_die_notation(smarts_die)
        WHEN cognition_die IS NOT NULL AND cognition_die != ''
            THEN convert_die_notation(cognition_die)
        ELSE convert_die_notation(smarts_die)
    END,

    spirit_die = convert_die_notation(spirit_die),
    strength_die = convert_die_notation(strength_die),
    vigor_die = convert_die_notation(vigor_die)
WHERE
    -- Only update if Savage Worlds attributes are still default
    agility_die = 'd6' OR agility_die IS NULL;

-- STEP 4: Convert all skill die values to Savage Worlds format
UPDATE skills
SET die_value = convert_die_notation(die_value)
WHERE die_value ~ '^\d+d\d+$'; -- matches XdY format

-- STEP 5: Remove duplicate "attribute as skill" entries
-- In Savage Worlds, attributes are not listed as skills
DELETE FROM skills
WHERE name IN (
    'Cognition', 'Deftness', 'Nimbleness', 'Quickness',
    'Smarts', 'Spirit', 'Strength', 'Vigor',
    'Agility'
);

-- STEP 6: Recalculate derived stats with new values
-- Parry = 2 + (Fighting skill die / 2)
UPDATE characters SET parry = 2 + COALESCE(
    (SELECT CASE
        WHEN s.die_value = 'd4' THEN 2
        WHEN s.die_value = 'd6' THEN 3
        WHEN s.die_value = 'd8' THEN 4
        WHEN s.die_value = 'd10' THEN 5
        WHEN s.die_value = 'd12' THEN 6
        WHEN s.die_value = 'd12+1' THEN 6
        WHEN s.die_value = 'd12+2' THEN 7
        ELSE 0
     END
     FROM skills s
     WHERE s.character_id = characters.id
     AND (s.name = 'Fighting' OR s.name = 'Fightin''')
     LIMIT 1),
    0
);

-- Toughness = 2 + (Vigor die / 2) + Armor
UPDATE characters SET toughness = 2 +
    CASE
        WHEN vigor_die = 'd4' THEN 2
        WHEN vigor_die = 'd6' THEN 3
        WHEN vigor_die = 'd8' THEN 4
        WHEN vigor_die = 'd10' THEN 5
        WHEN vigor_die = 'd12' THEN 6
        WHEN vigor_die = 'd12+1' THEN 6
        WHEN vigor_die = 'd12+2' THEN 7
        ELSE 2
    END;

-- STEP 7: Output conversion summary
SELECT
    'Converted ' || COUNT(*) || ' characters to Savage Worlds format' as summary
FROM characters;

SELECT
    'Converted ' || COUNT(*) || ' skills to Savage Worlds die notation' as summary
FROM skills
WHERE die_value IN ('d4', 'd6', 'd8', 'd10', 'd12', 'd12+1', 'd12+2');

-- Show character attribute summary
SELECT
    id,
    name,
    occupation,
    agility_die,
    smarts_die,
    spirit_die,
    strength_die,
    vigor_die,
    parry,
    toughness,
    charisma
FROM characters
ORDER BY id;

-- Show skill die value distribution
SELECT
    die_value,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM skills), 1) || '%' as percentage
FROM skills
GROUP BY die_value
ORDER BY
    CASE die_value
        WHEN 'd4' THEN 1
        WHEN 'd6' THEN 2
        WHEN 'd8' THEN 3
        WHEN 'd10' THEN 4
        WHEN 'd12' THEN 5
        WHEN 'd12+1' THEN 6
        WHEN 'd12+2' THEN 7
        ELSE 99
    END;

-- Cleanup function
-- DROP FUNCTION IF EXISTS convert_die_notation(TEXT);
