-- =====================================================
-- FIX RAILWAY PRODUCTION DATABASE - SAVAGE WORLDS
-- =====================================================
-- Direct UPDATE statements to fix all 7 characters
-- Run this on Railway Postgres database
-- =====================================================

-- CHARACTER 1: Mexicali Bob
UPDATE characters SET
    agility_die = 'd10',
    smarts_die = 'd8',
    spirit_die = 'd12',
    strength_die = 'd10',
    vigor_die = 'd8',
    parry = 7,
    toughness = 6,
    charisma = 0
WHERE id = 1;

-- CHARACTER 2: Cornelius Wilberforce III
UPDATE characters SET
    agility_die = 'd10',
    smarts_die = 'd12',
    spirit_die = 'd6',
    strength_die = 'd10',
    vigor_die = 'd10',
    parry = 6,
    toughness = 7,
    charisma = 0
WHERE id = 2;

-- CHARACTER 3: Doc Emett Von Braun
UPDATE characters SET
    agility_die = 'd8',
    smarts_die = 'd12',
    spirit_die = 'd8',
    strength_die = 'd6',
    vigor_die = 'd10',
    parry = 6,
    toughness = 7,
    charisma = 0
WHERE id = 3;

-- CHARACTER 4: John Henry Farraday
UPDATE characters SET
    agility_die = 'd10',
    smarts_die = 'd12',
    spirit_die = 'd12',
    strength_die = 'd4',
    vigor_die = 'd10',
    parry = 5,
    toughness = 7,
    charisma = 2
WHERE id = 4;

-- CHARACTER 5: Jack Horner
UPDATE characters SET
    agility_die = 'd10',
    smarts_die = 'd4',
    spirit_die = 'd4',
    strength_die = 'd6',
    vigor_die = 'd4',
    parry = 5,
    toughness = 4,
    charisma = 0
WHERE id = 5;

-- CHARACTER 6: Lucas Turner
UPDATE characters SET
    agility_die = 'd10',
    smarts_die = 'd4',
    spirit_die = 'd4',
    strength_die = 'd6',
    vigor_die = 'd4',
    parry = 2,
    toughness = 4,
    charisma = 0
WHERE id = 6;

-- CHARACTER 7: George C Dobbs
UPDATE characters SET
    agility_die = 'd4',
    smarts_die = 'd4',
    spirit_die = 'd4',
    strength_die = 'd4',
    vigor_die = 'd4',
    parry = 2,
    toughness = 4,
    charisma = 0
WHERE id = 7;

-- Now update all skills to single-die notation
-- d4 conversions
UPDATE skills SET die_value = 'd4' WHERE die_value IN ('1d4', '1d6');

-- d6 conversions
UPDATE skills SET die_value = 'd6' WHERE die_value IN ('1d8', '1d10', '2d6');

-- d8 conversions
UPDATE skills SET die_value = 'd8' WHERE die_value IN ('1d12', '2d8', '2d10', '3d6');

-- d10 conversions
UPDATE skills SET die_value = 'd10' WHERE die_value IN ('2d12', '3d8', '3d10', '4d6', '4d8');

-- d12 conversions
UPDATE skills SET die_value = 'd12' WHERE die_value IN ('3d12', '4d10', '4d12', '5d6', '5d8', '5d10', '5d12');

-- d12+1 conversions (if any)
UPDATE skills SET die_value = 'd12+1' WHERE die_value IN ('6d6', '6d8', '6d10', '6d12');

-- Verify the changes
SELECT
    id,
    name,
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

-- Show skill distribution
SELECT
    die_value,
    COUNT(*) as count
FROM skills
GROUP BY die_value
ORDER BY die_value;

-- Success message
SELECT 'All 7 characters and ' || COUNT(*) || ' skills updated to Savage Worlds format!' as status
FROM skills
WHERE die_value IN ('d4', 'd6', 'd8', 'd10', 'd12', 'd12+1', 'd12+2');
