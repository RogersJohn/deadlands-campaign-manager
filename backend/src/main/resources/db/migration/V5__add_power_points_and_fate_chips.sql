-- V5: Add Power Points and Fate Chips to Characters
-- Date: 2025-11-24
-- Purpose: Implement core Savage Worlds mechanics for arcane powers and bennies

-- Add Power Points fields for arcane background characters
ALTER TABLE characters ADD COLUMN current_power_points INTEGER DEFAULT 0;
ALTER TABLE characters ADD COLUMN max_power_points INTEGER DEFAULT 10;

-- Add Fate Chips (Bennies) field
-- Default 3 for Wild Cards (players), can be modified by edges/hindrances
ALTER TABLE characters ADD COLUMN fate_chips INTEGER DEFAULT 3;

-- Add comments for clarity
COMMENT ON COLUMN characters.current_power_points IS 'Current Power Points available for casting powers (Savage Worlds)';
COMMENT ON COLUMN characters.max_power_points IS 'Maximum Power Points (typically 10 + Power Points edge bonuses)';
COMMENT ON COLUMN characters.fate_chips IS 'Fate Chips (Bennies) - used for rerolls and soaking damage';

-- Set initial values for existing characters
-- Characters with arcane powers should have power points
UPDATE characters c
SET max_power_points = 10,
    current_power_points = 10
WHERE EXISTS (
    SELECT 1 FROM arcane_powers ap WHERE ap.character_id = c.id
);

-- All Wild Cards (player characters) start with 3 fate chips
-- NPCs typically get fewer
UPDATE characters
SET fate_chips = CASE WHEN is_npc = true THEN 1 ELSE 3 END
WHERE fate_chips IS NULL;
