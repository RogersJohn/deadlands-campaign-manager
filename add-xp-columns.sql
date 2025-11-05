-- Add XP tracking columns to characters table
ALTER TABLE characters ADD COLUMN IF NOT EXISTS total_xp INTEGER NOT NULL DEFAULT 0;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS spent_xp INTEGER NOT NULL DEFAULT 0;

-- Verify columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'characters' AND column_name IN ('total_xp', 'spent_xp');
