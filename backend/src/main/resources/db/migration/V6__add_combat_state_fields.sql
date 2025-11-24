-- V6: Add Combat State Fields (Wounds and Shaken)
-- Date: 2025-11-24
-- Purpose: Add Savage Worlds combat state tracking to characters

-- Add wound count (0-3 wounds, 4 = incapacitated)
ALTER TABLE characters ADD COLUMN wound_count INTEGER DEFAULT 0;

-- Add Shaken status (stunned, can only take free actions)
ALTER TABLE characters ADD COLUMN is_shaken BOOLEAN DEFAULT false;

-- Add comments
COMMENT ON COLUMN characters.wound_count IS 'Current wounds (0-3). Each wound = -1 penalty. 4 wounds = incapacitated.';
COMMENT ON COLUMN characters.is_shaken IS 'Shaken status (stunned). Can only take free actions until Spirit roll succeeds.';

-- Ensure no existing characters have invalid wound counts
UPDATE characters SET wound_count = 0 WHERE wound_count IS NULL OR wound_count < 0;
UPDATE characters SET wound_count = 3 WHERE wound_count > 3; -- Cap at 3 (4 = incapacitated)

-- Ensure all characters have Shaken status set
UPDATE characters SET is_shaken = false WHERE is_shaken IS NULL;
