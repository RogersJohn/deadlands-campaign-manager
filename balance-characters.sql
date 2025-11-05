-- =====================================================
-- CHARACTER BALANCING SQL - 2025-11-05
-- =====================================================
-- Rebalances all characters to ~120 XP spent (matching Mexicali Bob)
-- Target range: 115-125 XP
-- =====================================================

BEGIN;

-- =====================================================
-- CHARACTER 2: Cornelius Wilberforce III
-- Reduce from 182 XP to 118 XP (remove 64 XP)
-- =====================================================

-- Update XP values
UPDATE characters
SET spent_xp = 118, total_xp = 128
WHERE id = 2;

-- Delete Cornelius's existing skills
DELETE FROM skills WHERE character_id = 2;

-- Insert balanced skill set (28 skills instead of 47)
INSERT INTO skills (character_id, name, die_value, category) VALUES
-- Combat (keep strong)
(2, 'Shootin''', 'd12', 'Agility'),
(2, 'Dodge', 'd12', 'Agility'),
(2, 'Fightin''', 'd8', 'Agility'),
(2, 'Speed Load', 'd10', 'Agility'),
(2, 'Throwin''', 'd10', 'Agility'),
(2, 'Lockpickin''', 'd10', 'Agility'),

-- Core Railroad Executive/Scholar Skills
(2, 'Professional', 'd12', 'Smarts'),
(2, 'Science', 'd12', 'Smarts'),
(2, 'Blacksmithing', 'd12', 'Smarts'),
(2, 'Leadership', 'd8', 'Smarts'),
(2, 'Academia', 'd8', 'Smarts'),
(2, 'Classics', 'd6', 'Smarts'),
(2, 'Demolition', 'd8', 'Smarts'),
(2, 'Tinkerin''', 'd8', 'Smarts'),
(2, 'Area Knowledge', 'd8', 'Smarts'),
(2, 'Language', 'd6', 'Smarts'),
(2, 'Search', 'd6', 'Smarts'),

-- Social/Deception (desperate for approval)
(2, 'Disguise', 'd10', 'Smarts'),
(2, 'Bluff', 'd10', 'Smarts'),
(2, 'Gamblin''', 'd10', 'Smarts'),
(2, 'Ridicule', 'd10', 'Smarts'),
(2, 'Streetwise', 'd10', 'Smarts'),
(2, 'Persuasion', 'd10', 'Spirit'),

-- Basic Competencies
(2, 'Survival', 'd6', 'Smarts'),
(2, 'Scroungin''', 'd6', 'Smarts'),
(2, 'Animal Wranglin''', 'd10', 'Smarts'),
(2, 'Faith', 'd6', 'Spirit'),
(2, 'Guts', 'd6', 'Spirit');

-- =====================================================
-- CHARACTER 3: Doc Emett Von Braun
-- Reduce from 152 XP to 119 XP (remove 33 XP)
-- =====================================================

-- Update XP values
UPDATE characters
SET spent_xp = 119, total_xp = 129
WHERE id = 3;

-- Delete Doc's existing skills
DELETE FROM skills WHERE character_id = 3;

-- Insert balanced skill set (32 skills instead of 44)
INSERT INTO skills (character_id, name, die_value, category) VALUES
-- Mad Science Core
(3, 'Mad Science', 'd12', 'Smarts'),
(3, 'Science', 'd12', 'Smarts'),
(3, 'Tinkerin''', 'd12', 'Smarts'),
(3, 'Medicine', 'd12', 'Smarts'),
(3, 'Demolition', 'd12', 'Smarts'),

-- Academic Background
(3, 'Academia', 'd12', 'Smarts'),
(3, 'Classics', 'd10', 'Smarts'),
(3, 'Language', 'd10', 'Smarts'),
(3, 'Scrutiny', 'd10', 'Smarts'),
(3, 'Blacksmithing', 'd10', 'Smarts'),
(3, 'Area Knowledge', 'd8', 'Smarts'),

-- Combat
(3, 'Shootin''', 'd12', 'Agility'),
(3, 'Artillery', 'd10', 'Smarts'),
(3, 'Fightin''', 'd8', 'Agility'),
(3, 'Dodge', 'd6', 'Agility'),
(3, 'Throwin''', 'd6', 'Agility'),
(3, 'Speed Load', 'd6', 'Agility'),
(3, 'Lockpickin''', 'd6', 'Agility'),

-- Perception/Investigation
(3, 'Scrutinize', 'd6', 'Smarts'),
(3, 'Search', 'd6', 'Smarts'),
(3, 'Trackin''', 'd6', 'Smarts'),

-- Social
(3, 'Bluff', 'd10', 'Smarts'),
(3, 'Gamblin''', 'd10', 'Smarts'),
(3, 'Ridicule', 'd10', 'Smarts'),
(3, 'Overawe', 'd8', 'Spirit'),
(3, 'Persuasion', 'd8', 'Spirit'),
(3, 'Leadership', 'd6', 'Smarts'),

-- Utility
(3, 'Survival', 'd10', 'Smarts'),
(3, 'Scroungin''', 'd6', 'Smarts'),
(3, 'Streetwise', 'd6', 'Smarts'),
(3, 'Animal Wranglin''', 'd4', 'Smarts'),
(3, 'Faith', 'd8', 'Spirit'),
(3, 'Guts', 'd8', 'Spirit');

-- =====================================================
-- CHARACTER 4: John Henry Farraday
-- Reduce from 141 XP to 121 XP (remove 20 XP)
-- =====================================================

-- Update XP values
UPDATE characters
SET spent_xp = 121, total_xp = 131
WHERE id = 4;

-- Delete John Henry's existing skills
DELETE FROM skills WHERE character_id = 4;

-- Insert balanced skill set (35 skills, reduced die values)
INSERT INTO skills (character_id, name, die_value, category) VALUES
-- Harrowed/Hexslinger Core
(4, 'Faith', 'd12', 'Spirit'),
(4, 'Guts', 'd12', 'Spirit'),
(4, 'Medicine', 'd12', 'Smarts'),
(4, 'Tinkerin''', 'd12', 'Smarts'),

-- Gunsmith/Combat
(4, 'Shootin''', 'd12', 'Agility'),
(4, 'Sleight o'' Hand', 'd12', 'Agility'),
(4, 'Fightin''', 'd6', 'Agility'),
(4, 'Dodge', 'd8', 'Agility'),
(4, 'Bow', 'd8', 'Agility'),
(4, 'Lockpickin''', 'd8', 'Agility'),
(4, 'Speed Load', 'd8', 'Agility'),
(4, 'Throwin''', 'd8', 'Agility'),

-- Perception (reduced from d12)
(4, 'Artillery', 'd8', 'Smarts'),
(4, 'Arts', 'd6', 'Smarts'),
(4, 'Scrutinize', 'd8', 'Smarts'),
(4, 'Search', 'd8', 'Smarts'),
(4, 'Trackin''', 'd8', 'Smarts'),

-- Knowledge
(4, 'Academia', 'd6', 'Smarts'),
(4, 'Area Knowledge', 'd6', 'Smarts'),
(4, 'Demolition', 'd6', 'Smarts'),
(4, 'Science', 'd6', 'Smarts'),
(4, 'Survival', 'd12', 'Smarts'),

-- Social
(4, 'Bluff', 'd8', 'Smarts'),
(4, 'Gamblin''', 'd8', 'Smarts'),
(4, 'Ridicule', 'd8', 'Smarts'),
(4, 'Scroungin''', 'd8', 'Smarts'),
(4, 'Streetwise', 'd8', 'Smarts'),

-- Utility
(4, 'Drivin''', 'd6', 'Agility'),
(4, 'Climbin''', 'd8', 'Strength');

-- =====================================================
-- CHARACTER 5: Jack Horner
-- Increase from 94 XP to 117 XP (add 23 XP)
-- =====================================================

-- Update XP values
UPDATE characters
SET spent_xp = 117, total_xp = 127
WHERE id = 5;

-- Delete Jack's existing skills
DELETE FROM skills WHERE character_id = 5;

-- Insert improved skill set (35 skills with better survival skills)
INSERT INTO skills (character_id, name, die_value, category) VALUES
-- Combat (keep Agility-based high)
(5, 'Shootin''', 'd10', 'Agility'),
(5, 'Bow', 'd10', 'Agility'),
(5, 'Lockpickin''', 'd10', 'Agility'),
(5, 'Sleight o'' Hand', 'd10', 'Agility'),
(5, 'Speed Load', 'd10', 'Agility'),
(5, 'Throwin''', 'd10', 'Agility'),
(5, 'Fightin''', 'd6', 'Agility'),
(5, 'Dodge', 'd4', 'Agility'),

-- Prospector/Mining Core
(5, 'Professional', 'd12', 'Smarts'),
(5, 'Mining', 'd12', 'Smarts'),
(5, 'Survival', 'd8', 'Smarts'),
(5, 'Trackin''', 'd8', 'Smarts'),
(5, 'Search', 'd8', 'Smarts'),
(5, 'Scrutinize', 'd6', 'Smarts'),
(5, 'Tinkerin''', 'd8', 'Smarts'),
(5, 'Scroungin''', 'd6', 'Smarts'),
(5, 'Area Knowledge', 'd10', 'Smarts'),
(5, 'Academia', 'd8', 'Smarts'),

-- Basic Competencies (low Spirit/Smarts makes these expensive)
(5, 'Artillery', 'd4', 'Smarts'),
(5, 'Arts', 'd4', 'Smarts'),
(5, 'Animal Wranglin''', 'd4', 'Smarts'),
(5, 'Bluff', 'd4', 'Smarts'),
(5, 'Gamblin''', 'd4', 'Smarts'),
(5, 'Ridicule', 'd4', 'Smarts'),
(5, 'Streetwise', 'd4', 'Smarts'),
(5, 'Climbin''', 'd4', 'Strength'),
(5, 'Drivin''', 'd4', 'Agility'),
(5, 'Faith', 'd4', 'Spirit'),

-- Hardened Prospector
(5, 'Guts', 'd12', 'Spirit');

-- Add new edges
DELETE FROM edges WHERE character_id = 5;
INSERT INTO edges (character_id, name, description, type) VALUES
(5, 'Obligated Soul', 'Owes debt', 'Background'),
(5, 'Heroic', 'Heroic nature', 'Background'),
(5, 'Prospector', 'Expert at finding minerals', 'Professional'),
(5, 'Tough as Nails', 'Ignores wound penalties', 'Combat'),
(5, 'Keen', 'Sharp senses (+2 to Notice)', 'Background');

-- =====================================================
-- CHARACTER 6: Lucas Turner
-- Increase from 22 XP to 122 XP (add 100 XP)
-- =====================================================

-- Update XP values
UPDATE characters
SET spent_xp = 122, total_xp = 132
WHERE id = 6;

-- Lucas currently has NO skills - add complete gunslinger build
INSERT INTO skills (character_id, name, die_value, category) VALUES
-- Core Gunfighter Skills
(6, 'Shootin''', 'd12+2', 'Agility'),  -- His specialty
(6, 'Quick Draw', 'd12', 'Spirit'),
(6, 'Fightin''', 'd10', 'Agility'),
(6, 'Dodge', 'd10', 'Agility'),
(6, 'Throwin''', 'd10', 'Agility'),

-- Lawman Skills
(6, 'Intimidation', 'd8', 'Spirit'),
(6, 'Trackin''', 'd8', 'Smarts'),
(6, 'Search', 'd8', 'Smarts'),
(6, 'Scrutinize', 'd6', 'Smarts'),
(6, 'Survival', 'd6', 'Smarts'),

-- Social/Interaction
(6, 'Overawe', 'd8', 'Spirit'),
(6, 'Streetwise', 'd8', 'Smarts'),
(6, 'Bluff', 'd6', 'Smarts'),

-- Basic Competencies
(6, 'Guts', 'd8', 'Spirit'),
(6, 'Gamblin''', 'd4', 'Smarts'),
(6, 'Drivin''', 'd6', 'Agility'),
(6, 'Area Knowledge', 'd4', 'Smarts'),
(6, 'Ridicule', 'd4', 'Smarts');

-- =====================================================
-- CHARACTER 7: George C Dobbs
-- Build from 0 XP to 118 XP (add 118 XP)
-- =====================================================

-- Update character attributes and XP
UPDATE characters
SET
    agility_die = 'd8',
    smarts_die = 'd10',
    spirit_die = 'd8',
    strength_die = 'd4',
    vigor_die = 'd6',
    parry = 5,
    toughness = 5,
    charisma = 2,
    occupation = 'Professional Gambler',
    spent_xp = 118,
    total_xp = 128,
    wind = 11
WHERE id = 7;

-- Add George's skills (Professional Gambler build)
INSERT INTO skills (character_id, name, die_value, category) VALUES
-- Core Gambling/Social Skills
(7, 'Gamblin''', 'd12', 'Smarts'),
(7, 'Bluff', 'd12', 'Smarts'),
(7, 'Scrutinize', 'd12', 'Smarts'),
(7, 'Persuasion', 'd10', 'Spirit'),
(7, 'Ridicule', 'd10', 'Smarts'),
(7, 'Streetwise', 'd10', 'Smarts'),
(7, 'Sleight o'' Hand', 'd10', 'Agility'),
(7, 'Scroungin''', 'd8', 'Smarts'),

-- Knowledge/Perception
(7, 'Area Knowledge', 'd8', 'Smarts'),
(7, 'Academia', 'd6', 'Smarts'),
(7, 'Language', 'd6', 'Smarts'),

-- Combat/Survival
(7, 'Shootin''', 'd10', 'Agility'),
(7, 'Dodge', 'd10', 'Agility'),
(7, 'Fightin''', 'd6', 'Agility'),
(7, 'Guts', 'd8', 'Spirit'),

-- Utility
(7, 'Drivin''', 'd6', 'Agility'),
(7, 'Search', 'd8', 'Smarts'),
(7, 'Survival', 'd6', 'Smarts'),
(7, 'Tinkerin''', 'd6', 'Smarts'),
(7, 'Faith', 'd6', 'Spirit');

-- Add George's edges
INSERT INTO edges (character_id, name, description, type) VALUES
(7, 'Luck', 'Gambler''s luck (+1 benny per session)', 'Background'),
(7, 'Dinero', 'Wealthy from gambling', 'Background'),
(7, 'Charming', '+2 to Persuasion (+2 Charisma)', 'Social'),
(7, 'Quick', 'Discard and redraw action cards of 5 or less', 'Combat');

COMMIT;

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
SELECT
    id,
    name,
    occupation,
    spent_xp,
    total_xp,
    (total_xp - spent_xp) as unspent_xp
FROM characters
WHERE is_npc = false
ORDER BY id;
