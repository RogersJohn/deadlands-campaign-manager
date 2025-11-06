-- =====================================================
-- CHARACTER BALANCING SQL - 2025-11-05 (CORRECTED)
-- =====================================================
-- Rebalances all characters to ~120 XP spent (matching Mexicali Bob)
-- Target range: 115-125 XP
-- Uses correct Deadlands Classic categories
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
-- Combat (DEFTNESS and NIMBLENESS)
(2, 'Shootin''', 'd12', 'DEFTNESS'),
(2, 'Dodge', 'd12', 'NIMBLENESS'),
(2, 'Fightin''', 'd8', 'NIMBLENESS'),
(2, 'Speed Load', 'd10', 'DEFTNESS'),
(2, 'Throwin''', 'd10', 'DEFTNESS'),
(2, 'Lockpickin''', 'd10', 'DEFTNESS'),

-- Core Railroad Executive/Scholar Skills
(2, 'Professional', 'd12', 'PROFESSIONAL'),
(2, 'Science', 'd12', 'SMARTS'),
(2, 'Blacksmithing', 'd12', 'TRADE'),
(2, 'Leadership', 'd8', 'SMARTS'),
(2, 'Academia', 'd8', 'KNOWLEDGE'),
(2, 'Classics', 'd6', 'KNOWLEDGE'),
(2, 'Demolition', 'd8', 'KNOWLEDGE'),
(2, 'Tinkerin''', 'd8', 'SMARTS'),
(2, 'Area Knowledge', 'd8', 'KNOWLEDGE'),
(2, 'Language', 'd6', 'KNOWLEDGE'),
(2, 'Search', 'd6', 'COGNITION'),

-- Social/Deception
(2, 'Disguise', 'd10', 'KNOWLEDGE'),
(2, 'Bluff', 'd10', 'SMARTS'),
(2, 'Gamblin''', 'd10', 'SMARTS'),
(2, 'Ridicule', 'd10', 'SMARTS'),
(2, 'Streetwise', 'd10', 'SMARTS'),
(2, 'Persuasion', 'd10', 'SMARTS'),

-- Basic Competencies
(2, 'Survival', 'd6', 'SMARTS'),
(2, 'Scroungin''', 'd6', 'SMARTS'),
(2, 'Animal Wranglin''', 'd10', 'SMARTS'),
(2, 'Faith', 'd6', 'SPIRIT'),
(2, 'Guts', 'd6', 'SPIRIT');

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
(3, 'Mad Science', 'd12', 'PROFESSIONAL'),
(3, 'Science', 'd12', 'SMARTS'),
(3, 'Tinkerin''', 'd12', 'SMARTS'),
(3, 'Medicine', 'd12', 'COGNITION'),
(3, 'Demolition', 'd12', 'KNOWLEDGE'),

-- Academic Background
(3, 'Academia', 'd12', 'KNOWLEDGE'),
(3, 'Classics', 'd10', 'KNOWLEDGE'),
(3, 'Language', 'd10', 'KNOWLEDGE'),
(3, 'Scrutiny', 'd10', 'SMARTS'),
(3, 'Blacksmithing', 'd10', 'TRADE'),
(3, 'Area Knowledge', 'd8', 'KNOWLEDGE'),

-- Combat
(3, 'Shootin''', 'd12', 'DEFTNESS'),
(3, 'Artillery', 'd10', 'COGNITION'),
(3, 'Fightin''', 'd8', 'NIMBLENESS'),
(3, 'Dodge', 'd6', 'NIMBLENESS'),
(3, 'Throwin''', 'd6', 'DEFTNESS'),
(3, 'Speed Load', 'd6', 'DEFTNESS'),
(3, 'Lockpickin''', 'd6', 'DEFTNESS'),

-- Perception/Investigation
(3, 'Scrutinize', 'd6', 'COGNITION'),
(3, 'Search', 'd6', 'COGNITION'),
(3, 'Trackin''', 'd6', 'COGNITION'),

-- Social
(3, 'Bluff', 'd10', 'SMARTS'),
(3, 'Gamblin''', 'd10', 'SMARTS'),
(3, 'Ridicule', 'd10', 'SMARTS'),
(3, 'Overawe', 'd8', 'SMARTS'),
(3, 'Persuasion', 'd8', 'SMARTS'),
(3, 'Leadership', 'd6', 'SMARTS'),

-- Utility
(3, 'Survival', 'd10', 'SMARTS'),
(3, 'Scroungin''', 'd6', 'SMARTS'),
(3, 'Streetwise', 'd6', 'SMARTS'),
(3, 'Animal Wranglin''', 'd4', 'SMARTS'),
(3, 'Faith', 'd8', 'SPIRIT'),
(3, 'Guts', 'd8', 'SPIRIT');

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

-- Insert balanced skill set (28 skills, reduced die values)
INSERT INTO skills (character_id, name, die_value, category) VALUES
-- Harrowed/Hexslinger Core
(4, 'Faith', 'd12', 'SPIRIT'),
(4, 'Guts', 'd12', 'SPIRIT'),
(4, 'Medicine', 'd12', 'COGNITION'),
(4, 'Tinkerin''', 'd12', 'SMARTS'),

-- Gunsmith/Combat
(4, 'Shootin''', 'd12', 'DEFTNESS'),
(4, 'Sleight o'' Hand', 'd12', 'DEFTNESS'),
(4, 'Fightin''', 'd6', 'NIMBLENESS'),
(4, 'Dodge', 'd8', 'NIMBLENESS'),
(4, 'Bow', 'd8', 'DEFTNESS'),
(4, 'Lockpickin''', 'd8', 'DEFTNESS'),
(4, 'Speed Load', 'd8', 'DEFTNESS'),
(4, 'Throwin''', 'd8', 'DEFTNESS'),

-- Perception (reduced from d12)
(4, 'Artillery', 'd8', 'COGNITION'),
(4, 'Arts', 'd6', 'COGNITION'),
(4, 'Scrutinize', 'd8', 'COGNITION'),
(4, 'Search', 'd8', 'COGNITION'),
(4, 'Trackin''', 'd8', 'COGNITION'),

-- Knowledge
(4, 'Academia', 'd6', 'KNOWLEDGE'),
(4, 'Area Knowledge', 'd6', 'KNOWLEDGE'),
(4, 'Demolition', 'd6', 'KNOWLEDGE'),
(4, 'Science', 'd6', 'SMARTS'),
(4, 'Survival', 'd12', 'SMARTS'),

-- Social
(4, 'Bluff', 'd8', 'SMARTS'),
(4, 'Gamblin''', 'd8', 'SMARTS'),
(4, 'Ridicule', 'd8', 'SMARTS'),
(4, 'Scroungin''', 'd8', 'SMARTS'),
(4, 'Streetwise', 'd8', 'SMARTS'),

-- Utility
(4, 'Drivin''', 'd6', 'NIMBLENESS'),
(4, 'Climbin''', 'd8', 'NIMBLENESS');

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

-- Insert improved skill set (31 skills with better survival skills)
INSERT INTO skills (character_id, name, die_value, category) VALUES
-- Combat (Agility-based high)
(5, 'Shootin''', 'd10', 'DEFTNESS'),
(5, 'Bow', 'd10', 'DEFTNESS'),
(5, 'Lockpickin''', 'd10', 'DEFTNESS'),
(5, 'Sleight o'' Hand', 'd10', 'DEFTNESS'),
(5, 'Speed Load', 'd10', 'DEFTNESS'),
(5, 'Throwin''', 'd10', 'DEFTNESS'),
(5, 'Fightin''', 'd6', 'NIMBLENESS'),
(5, 'Dodge', 'd4', 'NIMBLENESS'),

-- Prospector/Mining Core
(5, 'Professional', 'd12', 'PROFESSIONAL'),
(5, 'Mining', 'd12', 'PROFESSIONAL'),
(5, 'Survival', 'd8', 'SMARTS'),
(5, 'Trackin''', 'd8', 'COGNITION'),
(5, 'Search', 'd8', 'COGNITION'),
(5, 'Scrutinize', 'd6', 'COGNITION'),
(5, 'Tinkerin''', 'd8', 'SMARTS'),
(5, 'Scroungin''', 'd6', 'SMARTS'),
(5, 'Area Knowledge', 'd10', 'KNOWLEDGE'),
(5, 'Academia', 'd8', 'KNOWLEDGE'),

-- Basic Competencies
(5, 'Artillery', 'd4', 'COGNITION'),
(5, 'Arts', 'd4', 'COGNITION'),
(5, 'Animal Wranglin''', 'd4', 'SMARTS'),
(5, 'Bluff', 'd4', 'SMARTS'),
(5, 'Gamblin''', 'd4', 'SMARTS'),
(5, 'Ridicule', 'd4', 'SMARTS'),
(5, 'Streetwise', 'd4', 'SMARTS'),
(5, 'Climbin''', 'd4', 'NIMBLENESS'),
(5, 'Drivin''', 'd4', 'NIMBLENESS'),
(5, 'Faith', 'd4', 'SPIRIT'),

-- Hardened Prospector
(5, 'Guts', 'd12', 'SPIRIT');

-- Add new edges
DELETE FROM edges WHERE character_id = 5;
INSERT INTO edges (character_id, name, description, type) VALUES
(5, 'Obligated Soul', 'Owes debt', 'BACKGROUND'),
(5, 'Heroic', 'Heroic nature', 'BACKGROUND'),
(5, 'Prospector', 'Expert at finding minerals', 'PROFESSIONAL'),
(5, 'Tough as Nails', 'Ignores wound penalties', 'COMBAT'),
(5, 'Keen', 'Sharp senses (+2 to Notice)', 'BACKGROUND');

-- =====================================================
-- CHARACTER 6: Lucas Turner
-- Increase from 22 XP to 122 XP (add 100 XP)
-- =====================================================

-- Update XP values
UPDATE characters
SET spent_xp = 122, total_xp = 132
WHERE id = 6;

-- Delete existing (no skills currently)
DELETE FROM skills WHERE character_id = 6;

-- Lucas currently has NO skills - add complete gunslinger build
INSERT INTO skills (character_id, name, die_value, category) VALUES
-- Core Gunfighter Skills
(6, 'Shootin''', 'd12+2', 'DEFTNESS'),
(6, 'Quick Draw', 'd12', 'DEFTNESS'),
(6, 'Fightin''', 'd10', 'NIMBLENESS'),
(6, 'Dodge', 'd10', 'NIMBLENESS'),
(6, 'Throwin''', 'd10', 'DEFTNESS'),

-- Lawman Skills
(6, 'Intimidation', 'd8', 'SMARTS'),
(6, 'Trackin''', 'd8', 'COGNITION'),
(6, 'Search', 'd8', 'COGNITION'),
(6, 'Scrutinize', 'd6', 'COGNITION'),
(6, 'Survival', 'd6', 'SMARTS'),

-- Social/Interaction
(6, 'Overawe', 'd8', 'SMARTS'),
(6, 'Streetwise', 'd8', 'SMARTS'),
(6, 'Bluff', 'd6', 'SMARTS'),

-- Basic Competencies
(6, 'Guts', 'd8', 'SPIRIT'),
(6, 'Gamblin''', 'd4', 'SMARTS'),
(6, 'Drivin''', 'd6', 'NIMBLENESS'),
(6, 'Area Knowledge', 'd4', 'KNOWLEDGE'),
(6, 'Ridicule', 'd4', 'SMARTS');

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

-- Delete existing (no skills currently)
DELETE FROM skills WHERE character_id = 7;

-- Add George's skills (Professional Gambler build)
INSERT INTO skills (character_id, name, die_value, category) VALUES
-- Core Gambling/Social Skills
(7, 'Gamblin''', 'd12', 'SMARTS'),
(7, 'Bluff', 'd12', 'SMARTS'),
(7, 'Scrutinize', 'd12', 'COGNITION'),
(7, 'Persuasion', 'd10', 'SMARTS'),
(7, 'Ridicule', 'd10', 'SMARTS'),
(7, 'Streetwise', 'd10', 'SMARTS'),
(7, 'Sleight o'' Hand', 'd10', 'DEFTNESS'),
(7, 'Scroungin''', 'd8', 'SMARTS'),

-- Knowledge/Perception
(7, 'Area Knowledge', 'd8', 'KNOWLEDGE'),
(7, 'Academia', 'd6', 'KNOWLEDGE'),
(7, 'Language', 'd6', 'KNOWLEDGE'),

-- Combat/Survival
(7, 'Shootin''', 'd10', 'DEFTNESS'),
(7, 'Dodge', 'd10', 'NIMBLENESS'),
(7, 'Fightin''', 'd6', 'NIMBLENESS'),
(7, 'Guts', 'd8', 'SPIRIT'),

-- Utility
(7, 'Drivin''', 'd6', 'NIMBLENESS'),
(7, 'Search', 'd8', 'COGNITION'),
(7, 'Survival', 'd6', 'SMARTS'),
(7, 'Tinkerin''', 'd6', 'SMARTS'),
(7, 'Faith', 'd6', 'SPIRIT');

-- Add George's edges
DELETE FROM edges WHERE character_id = 7;
INSERT INTO edges (character_id, name, description, type) VALUES
(7, 'Luck', 'Gambler''s luck (+1 benny per session)', 'BACKGROUND'),
(7, 'Dinero', 'Wealthy from gambling', 'BACKGROUND'),
(7, 'Charming', '+2 to Persuasion (+2 Charisma)', 'SOCIAL'),
(7, 'Quick', 'Discard and redraw action cards of 5 or less', 'COMBAT');

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
