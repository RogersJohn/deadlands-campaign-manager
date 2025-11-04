-- Load character data into Railway database
-- Run this in Railway PostgreSQL Data tab Query console

-- First, let's update the portrait URLs for the characters
UPDATE characters SET character_image_url = '/portraits/mexicali-bob.jpg' WHERE name = 'Mexicali Bob';
UPDATE characters SET character_image_url = '/portraits/doc-farraday.jpg' WHERE name LIKE '%Farraday%';

-- If characters don't exist yet, insert them
-- Note: The data.sql should have run automatically, but if not, you can run it manually

-- Check if characters exist
SELECT id, name, occupation, player_id FROM characters;
