-- Manual Testing: Reset Test Characters to Fresh State
-- Run this ONLY when you want to reset characters to starting conditions
-- WARNING: This will DELETE test characters and recreate them from scratch

-- Delete test characters (cascades to powers, skills, equipment, edges)
DELETE FROM characters WHERE name IN ('Arcane Huckster', 'Divine Blessed');

-- Note: Run setup-test-characters.sql after this to recreate them
SELECT 'Test characters deleted. Run setup-test-characters.sql to recreate them.' AS message;
