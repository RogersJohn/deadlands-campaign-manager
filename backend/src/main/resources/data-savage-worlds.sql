-- ======================================================================
-- SAVAGE WORLDS CHARACTER DATA (Corrected Format)
-- ======================================================================
-- All characters converted from Deadlands Classic to Savage Worlds:
-- - 5 attributes instead of 8 (Agility, Smarts, Spirit, Strength, Vigor)
-- - Single die notation (d4, d6, d8, d10, d12) instead of multiple dice
-- - Proper derived stats (Parry, Toughness, Charisma)
-- ======================================================================

-- Initial user accounts (passwords are BCrypt hashed 'password')
INSERT INTO users (id, username, email, password, role, active, created_at, updated_at) VALUES
(1, 'gamemaster', 'gm@deadlands.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'GAME_MASTER', true, NOW(), NOW()),
(2, 'player1', 'player1@deadlands.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'PLAYER', true, NOW(), NOW()),
(3, 'player2', 'player2@deadlands.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'PLAYER', true, NOW(), NOW()),
(4, 'player3', 'player3@deadlands.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'PLAYER', true, NOW(), NOW()),
(5, 'player4', 'player4@deadlands.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'PLAYER', true, NOW(), NOW()),
(6, 'player5', 'player5@deadlands.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'PLAYER', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- =====================================================
-- CHARACTER 1: Mexicali Bob - Apprentice Shaman
-- =====================================================
-- Attributes: Agility d10, Smarts d8, Spirit d12, Strength d10, Vigor d8
-- Parry 7, Toughness 6, Charisma 0
INSERT INTO characters (id, name, occupation, player_id, agility_die, smarts_die, spirit_die, strength_die, vigor_die, pace, size, wind, grit, parry, toughness, charisma, is_npc, created_at, updated_at) VALUES
(1, 'Mexicali Bob', 'Apprentice Shaman', 2, 'd10', 'd8', 'd12', 'd10', 'd8', 6, 7, 20, 1, 7, 6, 0, false, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    agility_die = EXCLUDED.agility_die,
    smarts_die = EXCLUDED.smarts_die,
    spirit_die = EXCLUDED.spirit_die,
    strength_die = EXCLUDED.strength_die,
    vigor_die = EXCLUDED.vigor_die,
    parry = EXCLUDED.parry,
    toughness = EXCLUDED.toughness,
    charisma = EXCLUDED.charisma;

-- Mexicali Bob Skills (converted to Savage Worlds)
DELETE FROM skills WHERE character_id = 1;
INSERT INTO skills (character_id, name, die_value, category) VALUES
(1, 'Medicine', 'd4', 'Smarts'),
(1, 'Bow', 'd10', 'Agility'),
(1, 'Lockpickin''', 'd10', 'Agility'),
(1, 'Shootin''', 'd12', 'Agility'),
(1, 'Sleight o'' Hand', 'd10', 'Agility'),
(1, 'Speed Load', 'd10', 'Agility'),
(1, 'Throwin''', 'd10', 'Agility'),
(1, 'Academia', 'd8', 'Smarts'),
(1, 'Area Knowledge', 'd6', 'Smarts'),
(1, 'Language', 'd6', 'Smarts'),
(1, 'Demolition', 'd6', 'Smarts'),
(1, 'Disguise', 'd6', 'Smarts'),
(1, 'Science', 'd4', 'Smarts'),
(1, 'Animal Wranglin''', 'd8', 'Smarts'),
(1, 'Climbin''', 'd12', 'Strength'),
(1, 'Dodge', 'd12', 'Agility'),
(1, 'Drivin''', 'd6', 'Agility'),
(1, 'Fightin''', 'd10', 'Agility'),
(1, 'Bluff', 'd8', 'Smarts'),
(1, 'Gamblin''', 'd6', 'Smarts'),
(1, 'Ridicule', 'd4', 'Smarts'),
(1, 'Scroungin''', 'd4', 'Smarts'),
(1, 'Streetwise', 'd4', 'Smarts'),
(1, 'Survival', 'd6', 'Smarts'),
(1, 'Tinkerin''', 'd4', 'Smarts'),
(1, 'Faith', 'd12', 'Spirit'),
(1, 'Guts', 'd12', 'Spirit')
ON CONFLICT DO NOTHING;

-- Mexicali Bob Edges
DELETE FROM edges WHERE character_id = 1;
INSERT INTO edges (character_id, name, description, type) VALUES
(1, 'Brawny', '+1 size, +2 guts check', 'Background'),
(1, 'Brave', '+2 to guts check', 'Background'),
(1, 'Keen', '+2 on cognition, search, scrutinize', 'Background'),
(1, 'Nerves of Steel', 'Ignore 1 wound penalty', 'Background'),
(1, 'Martial Artist', 'Special martial arts abilities', 'Combat'),
(1, 'Superstitious', 'Superstitious behavior', 'Background'),
(1, 'Juxteno', 'Mexican heritage', 'Background'),
(1, 'Illiterate', 'Cannot read', 'Background')
ON CONFLICT DO NOTHING;

-- Mexicali Bob Hindrances
DELETE FROM hindrances WHERE character_id = 1;
INSERT INTO hindrances (character_id, name, description, severity) VALUES
(1, 'Superstitious', 'Believes in superstitions', 'Minor'),
(1, 'Illiterate', 'Cannot read or write', 'Minor'),
(1, 'Dumb as Mud', 'Low intelligence', 'Major')
ON CONFLICT DO NOTHING;

-- Mexicali Bob Equipment
DELETE FROM equipment WHERE character_id = 1;
INSERT INTO equipment (character_id, name, type, damage, range, defense, quantity) VALUES
(1, 'Colt Army', 'Weapon (Ranged)', '2d6+1', '12/24/48', null, 1),
(1, 'Bowie Knife', 'Weapon (Melee)', 'Str+d4+1', null, '+1', 1),
(1, 'Rope', 'Gear', null, null, null, 1),
(1, 'Poncho', 'Gear', null, null, null, 1),
(1, 'Tack', 'Gear', null, null, null, 1)
ON CONFLICT DO NOTHING;

-- Mexicali Bob Arcane Powers
DELETE FROM arcane_powers WHERE character_id = 1;
INSERT INTO arcane_powers (character_id, name, type, notes) VALUES
(1, 'Phantasm', 'Shamanism', 'Create illusions'),
(1, 'Sense Up', 'Shamanism', 'Enhanced senses'),
(1, 'Speed', 'Shamanism', 'Increased speed'),
(1, 'Tamul (Agude)', 'Shamanism', 'Eagle spirit'),
(1, 'Shapeshift', 'Shamanism', 'Transform into eagle'),
(1, 'Disguise', 'Shamanism', 'Change appearance')
ON CONFLICT DO NOTHING;

-- =====================================================
-- CHARACTER 2: Cornelius Wilberforce III - Scholar
-- =====================================================
-- Attributes: Agility d10, Smarts d12, Spirit d6, Strength d10, Vigor d10
-- Parry 6, Toughness 7, Charisma 0
INSERT INTO characters (id, name, occupation, player_id, agility_die, smarts_die, spirit_die, strength_die, vigor_die, pace, size, wind, grit, parry, toughness, charisma, is_npc, created_at, updated_at, notes) VALUES
(2, 'Cornelius Wilberforce III', 'Scholar', 3, 'd10', 'd12', 'd6', 'd10', 'd10', 6, 0, 13, 1, 6, 7, 0, false, NOW(), NOW(), '0 red chips, 6 white chips, 0 blue chips')
ON CONFLICT (id) DO UPDATE SET
    agility_die = EXCLUDED.agility_die,
    smarts_die = EXCLUDED.smarts_die,
    spirit_die = EXCLUDED.spirit_die,
    strength_die = EXCLUDED.strength_die,
    vigor_die = EXCLUDED.vigor_die,
    parry = EXCLUDED.parry,
    toughness = EXCLUDED.toughness,
    charisma = EXCLUDED.charisma;

-- Cornelius Skills (converted to Savage Worlds)
DELETE FROM skills WHERE character_id = 2;
INSERT INTO skills (character_id, name, die_value, category) VALUES
(2, 'Artillery', 'd10', 'Smarts'),
(2, 'Arts', 'd10', 'Smarts'),
(2, 'Scrutinize', 'd10', 'Smarts'),
(2, 'Search', 'd10', 'Smarts'),
(2, 'Trackin''', 'd10', 'Smarts'),
(2, 'Bow', 'd10', 'Agility'),
(2, 'Lockpickin''', 'd10', 'Agility'),
(2, 'Shootin''', 'd12', 'Agility'),
(2, 'Sleight o'' Hand', 'd10', 'Agility'),
(2, 'Speed Load', 'd10', 'Agility'),
(2, 'Throwin''', 'd10', 'Agility'),
(2, 'Academia', 'd8', 'Smarts'),
(2, 'Classics', 'd6', 'Smarts'),
(2, 'Area Knowledge', 'd10', 'Smarts'),
(2, 'Language', 'd8', 'Smarts'),
(2, 'Demolition', 'd12', 'Smarts'),
(2, 'Disguise', 'd12', 'Smarts'),
(2, 'Mad Science', 'd10', 'Smarts'),
(2, 'Professional', 'd12', 'Smarts'),
(2, 'Science', 'd12', 'Smarts'),
(2, 'Blacksmithing', 'd12', 'Smarts'),
(2, 'Animal Wranglin''', 'd10', 'Smarts'),
(2, 'Leadership', 'd8', 'Smarts'),
(2, 'Overawe', 'd8', 'Spirit'),
(2, 'Performin''', 'd8', 'Spirit'),
(2, 'Persuasion', 'd10', 'Spirit'),
(2, 'Tale Tellin''', 'd10', 'Spirit'),
(2, 'Climbin''', 'd6', 'Strength'),
(2, 'Dodge', 'd12', 'Agility'),
(2, 'Drivin''', 'd6', 'Agility'),
(2, 'Fightin''', 'd8', 'Agility'),
(2, 'Bluff', 'd10', 'Smarts'),
(2, 'Gamblin''', 'd12', 'Smarts'),
(2, 'Ridicule', 'd12', 'Smarts'),
(2, 'Scroungin''', 'd12', 'Smarts'),
(2, 'Streetwise', 'd12', 'Smarts'),
(2, 'Survival', 'd12', 'Smarts'),
(2, 'Tinkerin''', 'd12', 'Smarts'),
(2, 'Faith', 'd6', 'Spirit'),
(2, 'Guts', 'd6', 'Spirit')
ON CONFLICT DO NOTHING;

-- Cornelius Edges & Hindrances
DELETE FROM edges WHERE character_id = 2;
INSERT INTO edges (character_id, name, description, type) VALUES
(2, 'Tin Horn', 'Well-dressed aristocrat', 'Background'),
(2, 'Obstinate', 'Stubborn and willful', 'Background'),
(2, 'Loyal', 'Loyal to friends', 'Background'),
(2, 'Curious', 'Always investigating', 'Background'),
(2, 'Heroism', 'Acts heroically', 'Background'),
(2, 'Dinero', 'Wealthy', 'Background')
ON CONFLICT DO NOTHING;

DELETE FROM hindrances WHERE character_id = 2;
INSERT INTO hindrances (character_id, name, description, severity) VALUES
(2, 'Obstinate', 'Stubborn', 'Minor'),
(2, 'Curious', 'Overly curious', 'Minor')
ON CONFLICT DO NOTHING;

-- =====================================================
-- CHARACTER 3: Doc Emett Von Braun - Mad Scientist
-- =====================================================
-- Attributes: Agility d8, Smarts d12, Spirit d8, Strength d6, Vigor d10
-- Parry 6, Toughness 7, Charisma 0
INSERT INTO characters (id, name, occupation, player_id, agility_die, smarts_die, spirit_die, strength_die, vigor_die, pace, size, wind, grit, parry, toughness, charisma, is_npc, created_at, updated_at, notes) VALUES
(3, 'Doc Emett Von Braun', 'Mad Scientist', 4, 'd8', 'd12', 'd8', 'd6', 'd10', 6, 0, 12, 1, 6, 7, 0, false, NOW(), NOW(), 'Year 1863 - The only true character in the party!')
ON CONFLICT (id) DO UPDATE SET
    agility_die = EXCLUDED.agility_die,
    smarts_die = EXCLUDED.smarts_die,
    spirit_die = EXCLUDED.spirit_die,
    strength_die = EXCLUDED.strength_die,
    vigor_die = EXCLUDED.vigor_die,
    parry = EXCLUDED.parry,
    toughness = EXCLUDED.toughness,
    charisma = EXCLUDED.charisma;

-- Doc Von Braun Skills (converted to Savage Worlds)
DELETE FROM skills WHERE character_id = 3;
INSERT INTO skills (character_id, name, die_value, category) VALUES
(3, 'Artillery', 'd12', 'Smarts'),
(3, 'Scrutinize', 'd8', 'Smarts'),
(3, 'Search', 'd8', 'Smarts'),
(3, 'Trackin''', 'd8', 'Smarts'),
(3, 'Bow', 'd8', 'Agility'),
(3, 'Lockpickin''', 'd8', 'Agility'),
(3, 'Shootin''', 'd12', 'Agility'),
(3, 'Sleight o'' Hand', 'd8', 'Agility'),
(3, 'Speed Load', 'd8', 'Agility'),
(3, 'Throwin''', 'd8', 'Agility'),
(3, 'Academia', 'd12', 'Smarts'),
(3, 'Classics', 'd12', 'Smarts'),
(3, 'Area Knowledge', 'd10', 'Smarts'),
(3, 'Language', 'd12', 'Smarts'),
(3, 'Demolition', 'd12', 'Smarts'),
(3, 'Mad Science', 'd12', 'Smarts'),
(3, 'Medicine', 'd12', 'Smarts'),
(3, 'Professional', 'd12', 'Smarts'),
(3, 'Science', 'd12', 'Smarts'),
(3, 'Scrutiny', 'd10', 'Smarts'),
(3, 'Blacksmithing', 'd10', 'Smarts'),
(3, 'Animal Wranglin''', 'd6', 'Smarts'),
(3, 'Leadership', 'd8', 'Smarts'),
(3, 'Overawe', 'd8', 'Spirit'),
(3, 'Performin''', 'd8', 'Spirit'),
(3, 'Persuasion', 'd8', 'Spirit'),
(3, 'Climbin''', 'd6', 'Strength'),
(3, 'Dodge', 'd6', 'Agility'),
(3, 'Drivin''', 'd6', 'Agility'),
(3, 'Fightin''', 'd8', 'Agility'),
(3, 'Bluff', 'd10', 'Smarts'),
(3, 'Gamblin''', 'd10', 'Smarts'),
(3, 'Ridicule', 'd10', 'Smarts'),
(3, 'Scroungin''', 'd6', 'Smarts'),
(3, 'Streetwise', 'd6', 'Smarts'),
(3, 'Survival', 'd10', 'Smarts'),
(3, 'Tinkerin''', 'd12', 'Smarts'),
(3, 'Faith', 'd8', 'Spirit'),
(3, 'Guts', 'd8', 'Spirit')
ON CONFLICT DO NOTHING;

-- Doc Von Braun Edges
DELETE FROM edges WHERE character_id = 3;
INSERT INTO edges (character_id, name, description, type) VALUES
(3, 'Arcane Background', 'Mad Science', 'Power'),
(3, 'True Heir', 'Heir to fortune', 'Background'),
(3, 'Heroic', 'Acts heroically', 'Background'),
(3, 'Hexer', 'Can use hexes', 'Power'),
(3, 'Brave', '+2 to guts checks', 'Background'),
(3, 'Mechanical Devices', 'Can create devices', 'Professional')
ON CONFLICT DO NOTHING;

-- Doc Von Braun Equipment
DELETE FROM equipment WHERE character_id = 3;
INSERT INTO equipment (character_id, name, type, quantity) VALUES
(3, 'Brass Goggles', 'Gear', 1),
(3, 'Pocket Protector', 'Gear', 1),
(3, 'Pipe & Pipe Tobacco', 'Gear', 1),
(3, 'Lab Coat', 'Gear', 1),
(3, 'Scientific Tools', 'Gear', 1),
(3, 'Winchester Rifle', 'Weapon (Ranged)', 1),
(3, 'Explosive Rifle Bullets', 'Ammunition', 50)
ON CONFLICT DO NOTHING;

-- =====================================================
-- CHARACTER 4: John Henry Farraday - Doctor/Hexslinger
-- =====================================================
-- Attributes: Agility d10, Smarts d12, Spirit d12, Strength d4, Vigor d10
-- Parry 5, Toughness 7, Charisma +2 (has Purty edge)
INSERT INTO characters (id, name, occupation, player_id, agility_die, smarts_die, spirit_die, strength_die, vigor_die, pace, size, wind, grit, parry, toughness, charisma, is_npc, created_at, updated_at) VALUES
(4, 'John Henry Farraday', 'Doctor', 5, 'd10', 'd12', 'd12', 'd4', 'd10', 8, 6, 12, 2, 5, 7, 2, false, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    agility_die = EXCLUDED.agility_die,
    smarts_die = EXCLUDED.smarts_die,
    spirit_die = EXCLUDED.spirit_die,
    strength_die = EXCLUDED.strength_die,
    vigor_die = EXCLUDED.vigor_die,
    parry = EXCLUDED.parry,
    toughness = EXCLUDED.toughness,
    charisma = EXCLUDED.charisma;

-- Doc Farraday Skills (converted to Savage Worlds)
DELETE FROM skills WHERE character_id = 4;
INSERT INTO skills (character_id, name, die_value, category) VALUES
(4, 'Artillery', 'd12', 'Smarts'),
(4, 'Arts', 'd12', 'Smarts'),
(4, 'Scrutinize', 'd12', 'Smarts'),
(4, 'Search', 'd12', 'Smarts'),
(4, 'Trackin''', 'd12', 'Smarts'),
(4, 'Bow', 'd10', 'Agility'),
(4, 'Lockpickin''', 'd10', 'Agility'),
(4, 'Shootin''', 'd12', 'Agility'),
(4, 'Sleight o'' Hand', 'd12', 'Agility'),
(4, 'Speed Load', 'd10', 'Agility'),
(4, 'Throwin''', 'd10', 'Agility'),
(4, 'Academia', 'd8', 'Smarts'),
(4, 'Area Knowledge', 'd8', 'Smarts'),
(4, 'Demolition', 'd8', 'Smarts'),
(4, 'Medicine', 'd12', 'Smarts'),
(4, 'Science', 'd8', 'Smarts'),
(4, 'Survival', 'd12', 'Smarts'),
(4, 'Climbin''', 'd8', 'Strength'),
(4, 'Dodge', 'd8', 'Agility'),
(4, 'Drivin''', 'd6', 'Agility'),
(4, 'Fightin''', 'd6', 'Agility'),
(4, 'Bluff', 'd8', 'Smarts'),
(4, 'Gamblin''', 'd8', 'Smarts'),
(4, 'Ridicule', 'd8', 'Smarts'),
(4, 'Scroungin''', 'd8', 'Smarts'),
(4, 'Streetwise', 'd8', 'Smarts'),
(4, 'Tinkerin''', 'd12', 'Smarts'),
(4, 'Faith', 'd12', 'Spirit'),
(4, 'Guts', 'd12', 'Spirit')
ON CONFLICT DO NOTHING;

-- Doc Farraday Arcane Powers
DELETE FROM arcane_powers WHERE character_id = 4;
INSERT INTO arcane_powers (character_id, name, type, speed, duration, range, trait, target_number, notes) VALUES
(4, 'Boost', 'Hexslinging', '2', 'Instant', 'Instant', 'Smarts', 5, 'Boost trait'),
(4, 'Heal', 'Hexslinging', '1', 'Instant', 'Touch', 'Spirit', 5, 'Heal wounds'),
(4, 'Helper Hex', 'Hexslinging', 'Varies', 'Permanent', 'Touch', 'Smarts', 5, 'Help as be wilt'),
(4, 'Noxious Breath', 'Hexslinging', '1', 'Concentration', 'Touch', 'Spirit', 5, 'Poison breath'),
(4, 'Feast', 'Hexslinging', '10min', 'Permanent', 'Touch', 'Mojo', 5, 'Summon food'),
(4, 'Old Sarge', 'Hexslinging', 'Inst', null, null, null, null, 'Summon guardian'),
(4, 'Viva Patras', 'Hexslinging', 'Inst', null, null, null, null, 'Raise dead'),
(4, 'Spiritual Pathway', 'Hexslinging', 'Inst', null, null, null, null, 'Ghost road'),
(4, 'Sadden', 'Hexslinging', 'Inst', null, null, null, null, 'Cause sadness'),
(4, 'Sight Made', 'Hexslinging', 'Inst', null, null, null, null, 'Enhanced vision')
ON CONFLICT DO NOTHING;

-- Doc Farraday Edges
DELETE FROM edges WHERE character_id = 4;
INSERT INTO edges (character_id, name, description, type) VALUES
(4, 'Arcane Background', 'Hexslinging', 'Power'),
(4, 'Brave', '+2 to guts checks', 'Background'),
(4, 'Cat Eyes', 'See in darkness', 'Background'),
(4, 'Huckster', 'Hexslinger', 'Power'),
(4, 'Fast Healer', 'Heal quickly', 'Background'),
(4, 'Thick Skull', 'Hard head', 'Background'),
(4, 'Purty', 'Attractive (+2 Charisma)', 'Background')
ON CONFLICT DO NOTHING;

DELETE FROM hindrances WHERE character_id = 4;
INSERT INTO hindrances (character_id, name, description, severity) VALUES
(4, 'Hankerin''', 'Alcoholic', 'Major'),
(4, 'Nose of Steel', 'Insensitive', 'Minor'),
(4, 'Loco', 'Crazy', 'Minor')
ON CONFLICT DO NOTHING;

-- =====================================================
-- CHARACTER 5: Jack Horner - Old Geezer Prospector
-- =====================================================
-- Attributes: Agility d10, Smarts d4, Spirit d4, Strength d6, Vigor d4
-- Parry 5, Toughness 4, Charisma 0
INSERT INTO characters (id, name, occupation, player_id, agility_die, smarts_die, spirit_die, strength_die, vigor_die, pace, size, wind, grit, parry, toughness, charisma, is_npc, created_at, updated_at, notes) VALUES
(5, 'Jack Horner', 'Old Geezer Prospector', 6, 'd10', 'd4', 'd4', 'd6', 'd4', 10, 0, 7, 2, 5, 4, 0, false, NOW(), NOW(), 'No aptitude for Tomb or Switch. Attacked in hand to hand with weapon and have card. Miss TN 5 Nimbleness or fall down.')
ON CONFLICT (id) DO UPDATE SET
    agility_die = EXCLUDED.agility_die,
    smarts_die = EXCLUDED.smarts_die,
    spirit_die = EXCLUDED.spirit_die,
    strength_die = EXCLUDED.strength_die,
    vigor_die = EXCLUDED.vigor_die,
    parry = EXCLUDED.parry,
    toughness = EXCLUDED.toughness,
    charisma = EXCLUDED.charisma;

-- Jack Horner Skills (converted to Savage Worlds)
DELETE FROM skills WHERE character_id = 5;
INSERT INTO skills (character_id, name, die_value, category) VALUES
(5, 'Artillery', 'd4', 'Smarts'),
(5, 'Arts', 'd4', 'Smarts'),
(5, 'Scrutinize', 'd4', 'Smarts'),
(5, 'Search', 'd4', 'Smarts'),
(5, 'Trackin''', 'd4', 'Smarts'),
(5, 'Bow', 'd10', 'Agility'),
(5, 'Lockpickin''', 'd10', 'Agility'),
(5, 'Shootin''', 'd10', 'Agility'),
(5, 'Sleight o'' Hand', 'd10', 'Agility'),
(5, 'Speed Load', 'd10', 'Agility'),
(5, 'Throwin''', 'd10', 'Agility'),
(5, 'Academia', 'd8', 'Smarts'),
(5, 'Area Knowledge', 'd8', 'Smarts'),
(5, 'Professional', 'd12', 'Smarts'),
(5, 'Mining', 'd12', 'Smarts'),
(5, 'Animal Wranglin''', 'd4', 'Smarts'),
(5, 'Climbin''', 'd4', 'Strength'),
(5, 'Dodge', 'd4', 'Agility'),
(5, 'Drivin''', 'd4', 'Agility'),
(5, 'Fightin''', 'd6', 'Agility'),
(5, 'Bluff', 'd4', 'Smarts'),
(5, 'Gamblin''', 'd4', 'Smarts'),
(5, 'Ridicule', 'd4', 'Smarts'),
(5, 'Scroungin''', 'd4', 'Smarts'),
(5, 'Streetwise', 'd4', 'Smarts'),
(5, 'Survival', 'd4', 'Smarts'),
(5, 'Tinkerin''', 'd4', 'Smarts'),
(5, 'Faith', 'd4', 'Spirit'),
(5, 'Guts', 'd12', 'Spirit')
ON CONFLICT DO NOTHING;

-- Jack Horner Edges
DELETE FROM edges WHERE character_id = 5;
INSERT INTO edges (character_id, name, description, type) VALUES
(5, 'Obligated Soul', 'Owes debt', 'Background'),
(5, 'Heroic', 'Heroic nature', 'Background')
ON CONFLICT DO NOTHING;

DELETE FROM hindrances WHERE character_id = 5;
INSERT INTO hindrances (character_id, name, description, severity) VALUES
(5, 'Lame', 'Walks with limp', 'Major'),
(5, 'Geezer', 'Old age', 'Major'),
(5, 'Vengeful', 'Seeks revenge', 'Minor')
ON CONFLICT DO NOTHING;

-- =====================================================
-- CHARACTER 6: Lucas Turner - Gunslinger
-- =====================================================
-- Attributes: Agility d10, Smarts d4, Spirit d4, Strength d6, Vigor d4
-- Parry 2, Toughness 4, Charisma 0
-- NOTE: Character has no skills - needs to be completed
INSERT INTO characters (id, name, occupation, player_id, agility_die, smarts_die, spirit_die, strength_die, vigor_die, pace, size, wind, grit, parry, toughness, charisma, is_npc, created_at, updated_at) VALUES
(6, 'Lucas Turner', 'Gunslinger', 2, 'd10', 'd4', 'd4', 'd6', 'd4', 10, 0, 7, 2, 2, 4, 0, false, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    agility_die = EXCLUDED.agility_die,
    smarts_die = EXCLUDED.smarts_die,
    spirit_die = EXCLUDED.spirit_die,
    strength_die = EXCLUDED.strength_die,
    vigor_die = EXCLUDED.vigor_die,
    parry = EXCLUDED.parry,
    toughness = EXCLUDED.toughness,
    charisma = EXCLUDED.charisma;

-- Lucas Turner Edges
DELETE FROM edges WHERE character_id = 6;
INSERT INTO edges (character_id, name, description, type) VALUES
(6, 'Obligated Soul', 'Owes debt', 'Background'),
(6, 'Heroic', 'Heroic nature', 'Background'),
(6, 'Brave', 'Courageous', 'Background'),
(6, 'Keen', 'Eagle-eyed', 'Background'),
(6, 'Law of the West', 'Lawman skills', 'Combat'),
(6, 'Watchers', 'Marshall', 'Background'),
(6, 'The Voice', '+2 to overawe', 'Social')
ON CONFLICT DO NOTHING;

DELETE FROM hindrances WHERE character_id = 6;
INSERT INTO hindrances (character_id, name, description, severity) VALUES
(6, 'Enemy', 'Has enemy', 'Major')
ON CONFLICT DO NOTHING;

-- =====================================================
-- CHARACTER 7: George C Dobbs - Template
-- =====================================================
-- Attributes: All d4 (baseline template)
-- Parry 2, Toughness 4, Charisma 0
INSERT INTO characters (id, name, occupation, player_id, agility_die, smarts_die, spirit_die, strength_die, vigor_die, pace, size, wind, grit, parry, toughness, charisma, is_npc, created_at, updated_at) VALUES
(7, 'George C Dobbs', 'Unknown', 3, 'd4', 'd4', 'd4', 'd4', 'd4', 6, 0, 6, 1, 2, 4, 0, false, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    agility_die = EXCLUDED.agility_die,
    smarts_die = EXCLUDED.smarts_die,
    spirit_die = EXCLUDED.spirit_die,
    strength_die = EXCLUDED.strength_die,
    vigor_die = EXCLUDED.vigor_die,
    parry = EXCLUDED.parry,
    toughness = EXCLUDED.toughness,
    charisma = EXCLUDED.charisma;

-- Reset sequences
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('characters_id_seq', (SELECT MAX(id) FROM characters));

-- Summary
SELECT 'Successfully loaded 7 characters in Savage Worlds format' AS status;
SELECT id, name, occupation, agility_die, smarts_die, spirit_die, strength_die, vigor_die, parry, toughness, charisma
FROM characters
ORDER BY id;
