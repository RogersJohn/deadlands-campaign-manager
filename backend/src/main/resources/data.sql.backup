-- Initial user accounts (passwords are BCrypt hashed 'password123')
INSERT INTO users (id, username, email, password, role, active, created_at, updated_at) VALUES
(1, 'gamemaster', 'gm@deadlands.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'GAME_MASTER', true, NOW(), NOW()),
(2, 'player1', 'player1@deadlands.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'PLAYER', true, NOW(), NOW()),
(3, 'player2', 'player2@deadlands.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'PLAYER', true, NOW(), NOW()),
(4, 'player3', 'player3@deadlands.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'PLAYER', true, NOW(), NOW()),
(5, 'player4', 'player4@deadlands.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'PLAYER', true, NOW(), NOW()),
(6, 'player5', 'player5@deadlands.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'PLAYER', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Mexicali Bob - Apprentice Shaman
INSERT INTO characters (id, name, occupation, player_id, cognition_die, deftness_die, nimbleness_die, quickness_die, smarts_die, spirit_die, strength_die, vigor_die, pace, size, wind, grit, is_npc, created_at, updated_at) VALUES
(1, 'Mexicali Bob', 'Apprentice Shaman', 2, '1d6', '3d8', '2d10', '3d12', '3d6', '4d12', '2d12', '2d8', 6, 7, 20, 1, false, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Mexicali Bob Skills
INSERT INTO skills (character_id, name, die_value, category) VALUES
(1, 'Medicine', '1d6', 'COGNITION'),
(1, 'Professional', '1d6', 'PROFESSIONAL'),
(1, 'Bow', '3d8', 'DEFTNESS'),
(1, 'Flichin''', '3d8', 'DEFTNESS'),
(1, 'Lockpickin''', '3d8', 'DEFTNESS'),
(1, 'Shootin''', '5d8', 'DEFTNESS'),
(1, 'Sleight o'' Hand', '3d8', 'DEFTNESS'),
(1, 'Speed Load', '3d8', 'DEFTNESS'),
(1, 'Throwin''', '3d8', 'DEFTNESS'),
(1, 'Academia', '3d6', 'KNOWLEDGE'),
(1, 'Area Knowledge', '2d6', 'KNOWLEDGE'),
(1, 'Language', '2d6', 'KNOWLEDGE'),
(1, 'Demolition', '2d6', 'KNOWLEDGE'),
(1, 'Disguise', '2d6', 'KNOWLEDGE'),
(1, 'Science', '1d6', 'SMARTS'),
(1, 'Trade', '1d6', 'TRADE'),
(1, 'Animal Wranglin''', '3d6', 'SMARTS'),
(1, 'Nimbleness', '2d10', 'NIMBLENESS'),
(1, 'Climbin''', '4d10', 'NIMBLENESS'),
(1, 'Dodge', '4d10', 'NIMBLENESS'),
(1, 'Drivin''', '1d10', 'NIMBLENESS'),
(1, 'Fightin''', '3d10', 'NIMBLENESS'),
(1, 'Bluff', '3d6', 'SMARTS'),
(1, 'Gamblin''', '2d6', 'SMARTS'),
(1, 'Ridicule', '1d6', 'SMARTS'),
(1, 'Scroungin''', '1d6', 'SMARTS'),
(1, 'Streetwise', '1d6', 'SMARTS'),
(1, 'Survival', '2d6', 'SMARTS'),
(1, 'Tinkerin''', '1d6', 'SMARTS'),
(1, 'Faith', '4d12', 'SPIRIT'),
(1, 'Guts', '4d12', 'SPIRIT'),
(1, 'Strength', '2d12', 'STRENGTH'),
(1, 'Vigor', '2d8', 'VIGOR')
ON CONFLICT DO NOTHING;

-- Mexicali Bob Edges
INSERT INTO edges (character_id, name, description, type) VALUES
(1, 'Brawny', '+1 size, +2 guts check', 'BACKGROUND'),
(1, 'Brave', '+2 to guts check', 'BACKGROUND'),
(1, 'Keen', '+2 on cognition, search, scrutinize', 'BACKGROUND'),
(1, 'Nerves of Steel', 'Ignore 1 wound penalty', 'BACKGROUND'),
(1, 'Martial Artist', 'Special martial arts abilities', 'COMBAT'),
(1, 'Superstitious', 'Superstitious behavior', 'BACKGROUND'),
(1, 'Juxteno', 'Mexican heritage', 'BACKGROUND'),
(1, 'Illiterate', 'Cannot read', 'BACKGROUND')
ON CONFLICT DO NOTHING;

-- Mexicali Bob Hindrances
INSERT INTO hindrances (character_id, name, description, severity) VALUES
(1, 'Superstitious', 'Believes in superstitions', 'MINOR'),
(1, 'Illiterate', 'Cannot read or write', 'MINOR'),
(1, 'Dumb as Mud (Eagle)', 'Low intelligence', 'MAJOR'),
(1, 'Dumb as Mud', 'Low intelligence', 'MAJOR')
ON CONFLICT DO NOTHING;

-- Mexicali Bob Equipment
INSERT INTO equipment (character_id, name, type, damage, range, defense, quantity) VALUES
(1, 'Colt Army', 'WEAPON_RANGED', '3d6', '10', null, 1),
(1, 'Bowie Knife', 'WEAPON_MELEE', 'STR+1d6', null, '+1', 1),
(1, 'Rope', 'GEAR', null, null, null, 1),
(1, 'Poncho', 'GEAR', null, null, null, 1),
(1, 'Tack', 'GEAR', null, null, null, 1)
ON CONFLICT DO NOTHING;

-- Mexicali Bob Arcane Powers
INSERT INTO arcane_powers (character_id, name, type, notes) VALUES
(1, 'Phantasm', 'SHAMANISM', 'Create illusions'),
(1, 'Sense Up', 'SHAMANISM', 'Enhanced senses'),
(1, 'Speed', 'SHAMANISM', 'Increased speed'),
(1, 'Tamul (Agude)', 'SHAMANISM', 'Eagle spirit'),
(1, 'Shapeshift', 'SHAMANISM', 'Transform into eagle'),
(1, 'Disguise', 'SHAMANISM', 'Change appearance')
ON CONFLICT DO NOTHING;

-- Cornelius Wilberforce III
INSERT INTO characters (id, name, occupation, player_id, cognition_die, deftness_die, nimbleness_die, quickness_die, smarts_die, spirit_die, strength_die, vigor_die, pace, size, wind, grit, is_npc, created_at, updated_at, notes) VALUES
(2, 'Cornelius Wilberforce III', 'Scholar', 3, '2d12', '4d6', '2d8', '2d10', '4d12', '1d10', '4d6', '4d8', 6, 0, 13, 1, false, NOW(), NOW(), '0 red chips, 6 white chips, 0 blue chips')
ON CONFLICT DO NOTHING;

-- Cornelius Skills
INSERT INTO skills (character_id, name, die_value, category) VALUES
(2, 'Artillery', '2d12', 'COGNITION'),
(2, 'Arts', '2d12', 'COGNITION'),
(2, 'Scrutinize', '2d12', 'COGNITION'),
(2, 'Search', '2d12', 'COGNITION'),
(2, 'Trackin''', '2d12', 'COGNITION'),
(2, 'Bow', '4d6', 'DEFTNESS'),
(2, 'Flichin''', '4d6', 'DEFTNESS'),
(2, 'Lockpickin''', '4d6', 'DEFTNESS'),
(2, 'Shootin''', '5d6', 'DEFTNESS'),
(2, 'Sleight o'' Hand', '4d6', 'DEFTNESS'),
(2, 'Speed Load', '4d6', 'DEFTNESS'),
(2, 'Throwin''', '4d6', 'DEFTNESS'),
(2, 'Academia', '2d10', 'KNOWLEDGE'),
(2, 'Classics', '1d10', 'KNOWLEDGE'),
(2, 'Area Knowledge', '2d12', 'KNOWLEDGE'),
(2, 'Home County', '2d12', 'KNOWLEDGE'),
(2, 'Language', '1d12', 'KNOWLEDGE'),
(2, 'Demolition', '3d12', 'KNOWLEDGE'),
(2, 'Disguise', '4d12', 'KNOWLEDGE'),
(2, 'Mad Science', '2d12', 'PROFESSIONAL'),
(2, 'Professional', '4d12', 'PROFESSIONAL'),
(2, 'True Magic', '3d12', 'PROFESSIONAL'),
(2, 'Science', '5d12', 'SMARTS'),
(2, 'Trade', '4d12', 'TRADE'),
(2, 'Blacksmithing', '3d12', 'TRADE'),
(2, 'Animal Wranglin''', '4d8', 'SMARTS'),
(2, 'Leadership', '2d10', 'SMARTS'),
(2, 'Overawe', '2d10', 'SMARTS'),
(2, 'Performin''', '2d10', 'SMARTS'),
(2, 'Persuasion', '3d10', 'SMARTS'),
(2, 'Tale Tellin''', '3d10', 'SMARTS'),
(2, 'Nimbleness', '4d8', 'NIMBLENESS'),
(2, 'Climbin''', '1d8', 'NIMBLENESS'),
(2, 'Dodge', '5d8', 'NIMBLENESS'),
(2, 'Drivin''', '1d8', 'NIMBLENESS'),
(2, 'Fightin''', '2d8', 'NIMBLENESS'),
(2, 'Bluff', '2d12', 'SMARTS'),
(2, 'Gamblin''', '4d12', 'SMARTS'),
(2, 'Ridicule', '4d12', 'SMARTS'),
(2, 'Scroungin''', '4d12', 'SMARTS'),
(2, 'Streetwise', '4d12', 'SMARTS'),
(2, 'Survival', '4d12', 'SMARTS'),
(2, 'Tinkerin''', '3d12', 'SMARTS'),
(2, 'Faith', '1d10', 'SPIRIT'),
(2, 'Guts', '1d10', 'SPIRIT'),
(2, 'Strength', '4d6', 'STRENGTH'),
(2, 'Vigor', '4d8', 'VIGOR')
ON CONFLICT DO NOTHING;

-- Cornelius Edges & Hindrances
INSERT INTO edges (character_id, name, description, type) VALUES
(2, 'Tin Horn', 'Well-dressed aristocrat', 'BACKGROUND'),
(2, 'Obstinate', 'Stubborn and willful', 'BACKGROUND'),
(2, 'Loyal', 'Loyal to friends', 'BACKGROUND'),
(2, 'Curious', 'Always investigating', 'BACKGROUND'),
(2, 'Heroism', 'Acts heroically', 'BACKGROUND'),
(2, 'Dinero', 'Wealthy', 'BACKGROUND')
ON CONFLICT DO NOTHING;

INSERT INTO hindrances (character_id, name, description, severity) VALUES
(2, 'Obstinate', 'Stubborn', 'MINOR'),
(2, 'Curious', 'Overly curious', 'MINOR')
ON CONFLICT DO NOTHING;

-- Doc Emett Von Braun - Mad Scientist
INSERT INTO characters (id, name, occupation, player_id, cognition_die, deftness_die, nimbleness_die, quickness_die, smarts_die, spirit_die, strength_die, vigor_die, pace, size, wind, grit, is_npc, created_at, updated_at, notes) VALUES
(3, 'Doc Emett Von Braun', 'Mad Scientist', 4, '3d12', '1d12', '2d8', '2d12', '3d10', '3d6', '2d6', '4d8', 6, 0, 12, 1, false, NOW(), NOW(), 'Year 1863 - The only true character in the party!')
ON CONFLICT DO NOTHING;

-- Doc Von Braun Skills
INSERT INTO skills (character_id, name, die_value, category) VALUES
(3, 'Artillery', '3d12', 'COGNITION'),
(3, 'Scrutinize', '1d12', 'COGNITION'),
(3, 'Search', '1d12', 'COGNITION'),
(3, 'Trackin''', '1d12', 'COGNITION'),
(3, 'Bow', '1d12', 'DEFTNESS'),
(3, 'Flichin''', '1d12', 'DEFTNESS'),
(3, 'Lockpickin''', '1d12', 'DEFTNESS'),
(3, 'Shootin''', '4d12', 'DEFTNESS'),
(3, 'Sleight o'' Hand', '1d12', 'DEFTNESS'),
(3, 'Speed Load', '1d12', 'DEFTNESS'),
(3, 'Throwin''', '1d12', 'DEFTNESS'),
(3, 'Academia', '4d12', 'KNOWLEDGE'),
(3, 'Classics', '3d12', 'KNOWLEDGE'),
(3, 'Area Knowledge', '2d12', 'KNOWLEDGE'),
(3, 'Language', '4d12', 'KNOWLEDGE'),
(3, 'Demolition', '4d12', 'KNOWLEDGE'),
(3, 'Mad Science', '3d12', 'PROFESSIONAL'),
(3, 'Medicine', '3d12', 'PROFESSIONAL'),
(3, 'Professional', '3d12', 'PROFESSIONAL'),
(3, 'Science', '5d10', 'SMARTS'),
(3, 'Scrutiny', '3d10', 'SMARTS'),
(3, 'Trade', '3d10', 'TRADE'),
(3, 'Blacksmithing', '3d10', 'TRADE'),
(3, 'Animal Wranglin''', '1d8', 'SMARTS'),
(3, 'Leadership', '3d6', 'SMARTS'),
(3, 'Overawe', '3d6', 'SMARTS'),
(3, 'Performin''', '3d6', 'SMARTS'),
(3, 'Persuasion', '3d6', 'SMARTS'),
(3, 'Nimbleness', '2d8', 'NIMBLENESS'),
(3, 'Climbin''', '1d8', 'NIMBLENESS'),
(3, 'Dodge', '1d8', 'NIMBLENESS'),
(3, 'Drivin''', '1d8', 'NIMBLENESS'),
(3, 'Fightin''', '3d8', 'NIMBLENESS'),
(3, 'Bluff', '3d10', 'SMARTS'),
(3, 'Gamblin''', '3d10', 'SMARTS'),
(3, 'Ridicule', '3d10', 'SMARTS'),
(3, 'Scroungin''', '1d10', 'SMARTS'),
(3, 'Streetwise', '1d10', 'SMARTS'),
(3, 'Survival', '3d10', 'SMARTS'),
(3, 'Tinkerin''', '5d10', 'SMARTS'),
(3, 'Faith', '3d6', 'SPIRIT'),
(3, 'Guts', '3d6', 'SPIRIT'),
(3, 'Strength', '2d6', 'STRENGTH'),
(3, 'Vigor', '4d8', 'VIGOR')
ON CONFLICT DO NOTHING;

-- Doc Von Braun Edges
INSERT INTO edges (character_id, name, description, type) VALUES
(3, 'Arcane Background', 'Mad Science', 'SUPERNATURAL'),
(3, 'True Heir', 'Heir to fortune', 'BACKGROUND'),
(3, 'Heroic', 'Acts heroically', 'BACKGROUND'),
(3, 'Hexer', 'Can use hexes', 'SUPERNATURAL'),
(3, 'Stompin''', 'Good at stomping', 'COMBAT'),
(3, 'Brave', '+2 to guts checks', 'BACKGROUND'),
(3, 'Mechanical Devices', 'Can create devices', 'PROFESSIONAL')
ON CONFLICT DO NOTHING;

-- Doc Von Braun Equipment
INSERT INTO equipment (character_id, name, type, quantity) VALUES
(3, 'Brass Goggles', 'GEAR', 1),
(3, 'Pocket Protector', 'GEAR', 1),
(3, 'Pipe & Pipe Tobacco', 'GEAR', 1),
(3, 'Lab Coat', 'GEAR', 1),
(3, 'Scientific Tools', 'GEAR', 1),
(3, 'Winchester Rifle', 'WEAPON_RANGED', 1),
(3, 'Explosive Rifle Bullets', 'AMMUNITION', 50)
ON CONFLICT DO NOTHING;

-- John Henry Farraday (Doc Farraday)
INSERT INTO characters (id, name, occupation, player_id, cognition_die, deftness_die, nimbleness_die, quickness_die, smarts_die, spirit_die, strength_die, vigor_die, pace, size, wind, grit, is_npc, created_at, updated_at) VALUES
(4, 'John Henry Farraday', 'Doctor', 5, '5d6', '2d12', '2d8', '2d12', '3d12', '3d12', '1d6', '4d8', 8, 6, 12, 2, false, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Doc Farraday Skills
INSERT INTO skills (character_id, name, die_value, category) VALUES
(4, 'Cognition', '5d6', 'COGNITION'),
(4, 'Artillery', '5d6', 'COGNITION'),
(4, 'Arts', '5d6', 'COGNITION'),
(4, 'Scrutinize', '5d6', 'COGNITION'),
(4, 'Search', '5d6', 'COGNITION'),
(4, 'Trackin''', '5d6', 'COGNITION'),
(4, 'Bow', '2d12', 'DEFTNESS'),
(4, 'Flichin''', '2d12', 'DEFTNESS'),
(4, 'Lockpickin''', '2d12', 'DEFTNESS'),
(4, 'Shootin''', '5d12', 'DEFTNESS'),
(4, 'Sleight o'' Hand', '5d12', 'DEFTNESS'),
(4, 'Speed Load', '2d12', 'DEFTNESS'),
(4, 'Throwin''', '2d12', 'DEFTNESS'),
(4, 'Academia', '1d12', 'KNOWLEDGE'),
(4, 'Area Knowledge', '1d12', 'KNOWLEDGE'),
(4, 'Home County', '1d12', 'KNOWLEDGE'),
(4, 'Demolition', '1d12', 'KNOWLEDGE'),
(4, 'Medicine', '5d12', 'PROFESSIONAL'),
(4, 'Science', '1d12', 'SMARTS'),
(4, 'Survival', '3d12', 'SMARTS'),
(4, 'Nimbleness', '1d8', 'NIMBLENESS'),
(4, 'Climbin''', '3d8', 'NIMBLENESS'),
(4, 'Dodge', '3d8', 'NIMBLENESS'),
(4, 'Drivin''', '1d8', 'NIMBLENESS'),
(4, 'Fightin''', '1d8', 'NIMBLENESS'),
(4, 'Bluff', '1d12', 'SMARTS'),
(4, 'Gamblin''', '1d12', 'SMARTS'),
(4, 'Ridicule', '1d12', 'SMARTS'),
(4, 'Scroungin''', '1d12', 'SMARTS'),
(4, 'Streetwise', '1d12', 'SMARTS'),
(4, 'Tinkerin''', '5d12', 'SMARTS'),
(4, 'Faith', '3d12', 'SPIRIT'),
(4, 'Guts', '5d12', 'SPIRIT'),
(4, 'Strength', '1d6', 'STRENGTH'),
(4, 'Vigor', '4d8', 'VIGOR')
ON CONFLICT DO NOTHING;

-- Doc Farraday Arcane Powers
INSERT INTO arcane_powers (character_id, name, type, speed, duration, range, trait, target_number, notes) VALUES
(4, 'Boost', 'HEXSLINGING', '2', 'Instant', 'Instant', 'Smarts', 5, 'Boost trait'),
(4, 'Heal', 'HEXSLINGING', '1', 'Instant', 'Touch', 'Spirit', 5, 'Heal wounds'),
(4, 'Helper Hex', 'HEXSLINGING', 'Varies', 'Permanent', 'Touch', 'Smarts', 5, 'Help as be wilt'),
(4, 'Noxious Breath', 'HEXSLINGING', '1', 'Concentration', 'Touch', 'Spirit', 5, 'Poison breath'),
(4, 'Feast', 'HEXSLINGING', '10min', 'Permanent', 'Touch', 'Mojo', 5, 'Summon food'),
(4, 'Old Sarge', 'HEXSLINGING', 'Inst', null, null, null, null, 'Summon guardian'),
(4, 'Viva Patras', 'HEXSLINGING', 'Inst', null, null, null, null, 'Raise dead'),
(4, 'Spiritual Pathway', 'HEXSLINGING', 'Inst', null, null, null, null, 'Ghost road'),
(4, 'Sadden', 'HEXSLINGING', 'Inst', null, null, null, null, 'Cause sadness'),
(4, 'Sight Made', 'HEXSLINGING', 'Inst', null, null, null, null, 'Enhanced vision')
ON CONFLICT DO NOTHING;

-- Doc Farraday Edges
INSERT INTO edges (character_id, name, description, type) VALUES
(4, 'Arcane Background', 'Hexslinging', 'SUPERNATURAL'),
(4, 'Brave', '+2 to guts checks', 'BACKGROUND'),
(4, 'Cat Eyes', 'See in darkness', 'BACKGROUND'),
(4, 'Huckster', 'Hexslinger', 'SUPERNATURAL'),
(4, 'Fast Healer', 'Heal quickly', 'BACKGROUND'),
(4, 'Thick Skull', 'Hard head', 'BACKGROUND'),
(4, 'Purty', 'Attractive', 'BACKGROUND')
ON CONFLICT DO NOTHING;

INSERT INTO hindrances (character_id, name, description, severity) VALUES
(4, 'Hankerin''', 'Alcoholic', 'MAJOR'),
(4, 'Nose of Steel', 'Insensitive', 'MINOR'),
(4, 'Loco', 'Crazy', 'MINOR')
ON CONFLICT DO NOTHING;

-- Jack Horner
INSERT INTO characters (id, name, occupation, player_id, cognition_die, deftness_die, nimbleness_die, quickness_die, smarts_die, spirit_die, strength_die, vigor_die, pace, size, wind, grit, is_npc, created_at, updated_at, notes) VALUES
(5, 'Jack Horner', 'Old Geezer Prospector', 6, '1d6', '3d10', '2d6', '1d6', '1d6', '1d6', '2d6', '1d6', 10, 0, 7, 2, false, NOW(), NOW(), 'No aptitude for Tomb or Switch. Attacked in hand to hand with weapon and have card. Miss TN 5 Nimbleness or fall down.')
ON CONFLICT DO NOTHING;

-- Jack Horner Skills
INSERT INTO skills (character_id, name, die_value, category) VALUES
(5, 'Cognition', '1d6', 'COGNITION'),
(5, 'Artillery', '1d6', 'COGNITION'),
(5, 'Arts', '1d6', 'COGNITION'),
(5, 'Scrutinize', '1d6', 'COGNITION'),
(5, 'Search', '1d6', 'COGNITION'),
(5, 'Trackin''', '1d6', 'COGNITION'),
(5, 'Bow', '3d10', 'DEFTNESS'),
(5, 'Flichin''', '3d10', 'DEFTNESS'),
(5, 'Lockpickin''', '3d10', 'DEFTNESS'),
(5, 'Shootin''', '3d10', 'DEFTNESS'),
(5, 'Sleight o'' Hand', '3d10', 'DEFTNESS'),
(5, 'Speed Load', '3d10', 'DEFTNESS'),
(5, 'Throwin''', '3d10', 'DEFTNESS'),
(5, 'Academia', '1d12', 'KNOWLEDGE'),
(5, 'Area Knowledge', '1d12', 'KNOWLEDGE'),
(5, 'Home County', '1d12', 'KNOWLEDGE'),
(5, 'Professional', '4d12', 'PROFESSIONAL'),
(5, 'Mining', '4d12', 'PROFESSIONAL'),
(5, 'Animal Wranglin''', '1d6', 'SMARTS'),
(5, 'Nimbleness', '2d6', 'NIMBLENESS'),
(5, 'Climbin''', '1d6', 'NIMBLENESS'),
(5, 'Dodge', '1d6', 'NIMBLENESS'),
(5, 'Drivin''', '1d6', 'NIMBLENESS'),
(5, 'Fightin''', '1d6', 'NIMBLENESS'),
(5, 'Bluff', '1d6', 'SMARTS'),
(5, 'Gamblin''', '1d6', 'SMARTS'),
(5, 'Ridicule', '1d6', 'SMARTS'),
(5, 'Scroungin''', '1d6', 'SMARTS'),
(5, 'Streetwise', '1d6', 'SMARTS'),
(5, 'Survival', '1d6', 'SMARTS'),
(5, 'Tinkerin''', '1d6', 'SMARTS'),
(5, 'Faith', '1d6', 'SPIRIT'),
(5, 'Guts', '5d6', 'SPIRIT'),
(5, 'Strength', '2d6', 'STRENGTH'),
(5, 'Vigor', '1d6', 'VIGOR')
ON CONFLICT DO NOTHING;

-- Jack Horner Edges
INSERT INTO edges (character_id, name, description, type) VALUES
(5, 'Obligated Soul', 'Owes debt', 'BACKGROUND'),
(5, 'Heroic', 'Heroic nature', 'BACKGROUND')
ON CONFLICT DO NOTHING;

INSERT INTO hindrances (character_id, name, description, severity) VALUES
(5, 'Lame', 'Walks with limp', 'MAJOR'),
(5, 'Geezer', 'Old age', 'MAJOR'),
(5, 'Vengeful', 'Seeks revenge', 'MINOR')
ON CONFLICT DO NOTHING;

-- Lucas Turner
INSERT INTO characters (id, name, occupation, player_id, cognition_die, deftness_die, nimbleness_die, quickness_die, smarts_die, spirit_die, strength_die, vigor_die, pace, size, wind, grit, is_npc, created_at, updated_at) VALUES
(6, 'Lucas Turner', 'Gunslinger', 2, '1d6', '3d10', '2d6', '1d6', '1d6', '1d6', '2d6', '1d6', 10, 0, 7, 2, false, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Lucas Turner Edges
INSERT INTO edges (character_id, name, description, type) VALUES
(6, 'Obligated Soul', 'Owes debt', 'BACKGROUND'),
(6, 'Heroic', 'Heroic nature', 'BACKGROUND'),
(6, 'Brave', 'Courageous', 'BACKGROUND'),
(6, 'Keen', 'Eagle-eyed', 'BACKGROUND'),
(6, 'Law of the West', 'Lawman skills', 'COMBAT'),
(6, 'Watchers', 'Marshall', 'BACKGROUND'),
(6, 'The Voice', '+2 to overawe', 'SOCIAL')
ON CONFLICT DO NOTHING;

INSERT INTO hindrances (character_id, name, description, severity) VALUES
(6, 'Enemy', 'Has enemy', 'MAJOR')
ON CONFLICT DO NOTHING;

-- George C Dobbs
INSERT INTO characters (id, name, occupation, player_id, cognition_die, deftness_die, nimbleness_die, quickness_die, smarts_die, spirit_die, strength_die, vigor_die, pace, size, wind, grit, is_npc, created_at, updated_at) VALUES
(7, 'George C Dobbs', 'Unknown', 3, '1d6', '1d6', '1d6', '1d6', '1d6', '1d6', '1d6', '1d6', 6, 0, 6, 1, false, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Reset sequences
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('characters_id_seq', (SELECT MAX(id) FROM characters));
