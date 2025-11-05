-- Add derived stats columns to characters table
-- Savage Worlds: Parry, Toughness, Charisma

ALTER TABLE characters ADD COLUMN IF NOT EXISTS parry INTEGER NOT NULL DEFAULT 2;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS toughness INTEGER NOT NULL DEFAULT 2;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS charisma INTEGER NOT NULL DEFAULT 0;

-- Update existing characters with calculated values
-- Parry = 2 + (Fighting skill die / 2)
UPDATE characters SET parry = 2 + COALESCE(
    (SELECT CASE
        WHEN s.die_value LIKE '%d4' THEN 2
        WHEN s.die_value LIKE '%d6' THEN 3
        WHEN s.die_value LIKE '%d8' THEN 4
        WHEN s.die_value LIKE '%d10' THEN 5
        WHEN s.die_value LIKE '%d12' THEN 6
        ELSE 0
     END
     FROM skills s
     WHERE s.character_id = characters.id
     AND (s.name = 'Fighting' OR s.name = 'Fightin''')
     LIMIT 1),
    0
) WHERE parry = 2;

-- Toughness = 2 + (Vigor die / 2) + Armor
-- For now, just calculate from Vigor (armor calculation can be added later)
-- Handle both "d8" and "1d8" formats
UPDATE characters SET toughness = 2 +
    CASE
        WHEN vigor_die LIKE '%d4' THEN 2
        WHEN vigor_die LIKE '%d6' THEN 3
        WHEN vigor_die LIKE '%d8' THEN 4
        WHEN vigor_die LIKE '%d10' THEN 5
        WHEN vigor_die LIKE '%d12' THEN 6
        ELSE 2
    END
WHERE toughness = 2;

-- Charisma is calculated from edges/hindrances
-- Start at 0 for all characters (will be calculated on frontend)

SELECT 'Added derived stats columns and calculated initial values' AS status;
