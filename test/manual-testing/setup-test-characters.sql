-- Manual Testing: Create 2 Arcane Test Characters (IDEMPOTENT)
-- Safe to run multiple times - creates characters once, preserves state
-- If you want fresh characters, run reset-test-characters.sql first

-- Ensure test players exist (won't duplicate)
INSERT INTO users (username, password, role, created_at, updated_at)
VALUES
  ('testplayer1', '$2a$10$xQZ9Z9Z9Z9Z9Z9Z9Z9Z9ZOqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'PLAYER', NOW(), NOW()),
  ('testplayer2', '$2a$10$xQZ9Z9Z9Z9Z9Z9Z9Z9Z9ZOqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'PLAYER', NOW(), NOW())
ON CONFLICT (username) DO NOTHING;

-- Create Huckster character ONLY if it doesn't exist
INSERT INTO characters (
  name, occupation, player_id, is_npc, created_at, updated_at,
  -- Savage Worlds Attributes (Huckster build)
  agility_die, smarts_die, spirit_die, strength_die, vigor_die,
  -- Derived Stats
  pace, size, parry, toughness, charisma, grit,
  -- Power Points & Fate Chips
  current_power_points, max_power_points, fate_chips,
  -- Combat State
  wound_count, is_shaken,
  -- XP
  total_xp, spent_xp,
  character_image_url
)
SELECT
  'Arcane Huckster',
  'Huckster',
  (SELECT id FROM users WHERE username = 'testplayer1'),
  false,
  NOW(),
  NOW(),
  -- Attributes (smart huckster build)
  'd8',  -- Agility
  'd10', -- Smarts (key for hucksters)
  'd8',  -- Spirit
  'd6',  -- Strength
  'd6',  -- Vigor
  -- Derived Stats
  6,  -- Pace
  0,  -- Size
  6,  -- Parry (2 + half Fighting)
  5,  -- Toughness (2 + half Vigor)
  0,  -- Charisma
  2,  -- Grit
  -- Power Points & Fate Chips (fully loaded)
  20,  -- Current Power Points
  20,  -- Max Power Points (veteran huckster)
  5,   -- Fate Chips
  -- Combat State (healthy)
  0,     -- Wounds
  false, -- Not Shaken
  -- XP (veteran)
  40,
  40,
  'https://via.placeholder.com/150/FF6347/FFFFFF?text=Huckster'
WHERE NOT EXISTS (
  SELECT 1 FROM characters WHERE name = 'Arcane Huckster'
);

-- Create Blessed character ONLY if it doesn't exist
INSERT INTO characters (
  name, occupation, player_id, is_npc, created_at, updated_at,
  -- Savage Worlds Attributes (Blessed build)
  agility_die, smarts_die, spirit_die, strength_die, vigor_die,
  -- Derived Stats
  pace, size, parry, toughness, charisma, grit,
  -- Power Points & Fate Chips
  current_power_points, max_power_points, fate_chips,
  -- Combat State
  wound_count, is_shaken,
  -- XP
  total_xp, spent_xp,
  character_image_url
)
SELECT
  'Divine Blessed',
  'Blessed',
  (SELECT id FROM users WHERE username = 'testplayer2'),
  false,
  NOW(),
  NOW(),
  -- Attributes (balanced blessed build)
  'd6',  -- Agility
  'd8',  -- Smarts
  'd10', -- Spirit (key for blessed)
  'd6',  -- Strength
  'd8',  -- Vigor
  -- Derived Stats
  6,  -- Pace
  0,  -- Size
  6,  -- Parry
  6,  -- Toughness
  0,  -- Charisma
  3,  -- Grit
  -- Power Points & Fate Chips (fully loaded)
  20,  -- Current Power Points
  20,  -- Max Power Points
  5,   -- Fate Chips
  -- Combat State (healthy)
  0,     -- Wounds
  false, -- Not Shaken
  -- XP (veteran)
  40,
  40,
  'https://via.placeholder.com/150/4169E1/FFFFFF?text=Blessed'
WHERE NOT EXISTS (
  SELECT 1 FROM characters WHERE name = 'Divine Blessed'
);

-- Assign ALL powers to Huckster (offensive + utility) - only if not already assigned
INSERT INTO arcane_powers (character_id, power_reference_id, learned_at)
SELECT
  (SELECT id FROM characters WHERE name = 'Arcane Huckster'),
  apr.id,
  NOW()
FROM arcane_power_references apr
WHERE (apr.arcane_backgrounds LIKE '%Huckster%' OR apr.arcane_backgrounds LIKE '%Any%')
  AND NOT EXISTS (
    SELECT 1 FROM arcane_powers ap
    WHERE ap.character_id = (SELECT id FROM characters WHERE name = 'Arcane Huckster')
      AND ap.power_reference_id = apr.id
  );

-- Assign ALL powers to Blessed (healing + defensive + some utility) - only if not already assigned
INSERT INTO arcane_powers (character_id, power_reference_id, learned_at)
SELECT
  (SELECT id FROM characters WHERE name = 'Divine Blessed'),
  apr.id,
  NOW()
FROM arcane_power_references apr
WHERE (apr.arcane_backgrounds LIKE '%Blessed%' OR apr.arcane_backgrounds LIKE '%Any%')
  AND NOT EXISTS (
    SELECT 1 FROM arcane_powers ap
    WHERE ap.character_id = (SELECT id FROM characters WHERE name = 'Divine Blessed')
      AND ap.power_reference_id = apr.id
  );

-- Add essential skills to Huckster - only if not already added
INSERT INTO skills (character_id, name, die_value, created_at)
SELECT
  (SELECT id FROM characters WHERE name = 'Arcane Huckster'),
  skill_name,
  die_value,
  NOW()
FROM (VALUES
  ('Hexslinging', 'd10'),  -- Arcane skill
  ('Shooting', 'd8'),      -- Ranged combat
  ('Fighting', 'd6'),      -- Melee combat
  ('Notice', 'd8'),        -- Awareness
  ('Persuasion', 'd6'),    -- Social
  ('Stealth', 'd6'),       -- Sneaking
  ('Guts', 'd8')           -- Fear resistance
) AS t(skill_name, die_value)
WHERE NOT EXISTS (
  SELECT 1 FROM skills s
  WHERE s.character_id = (SELECT id FROM characters WHERE name = 'Arcane Huckster')
    AND s.name = t.skill_name
);

-- Add essential skills to Blessed - only if not already added
INSERT INTO skills (character_id, name, die_value, created_at)
SELECT
  (SELECT id FROM characters WHERE name = 'Divine Blessed'),
  skill_name,
  die_value,
  NOW()
FROM (VALUES
  ('Faith', 'd10'),        -- Arcane skill
  ('Shooting', 'd6'),      -- Ranged combat
  ('Fighting', 'd8'),      -- Melee combat
  ('Notice', 'd8'),        -- Awareness
  ('Healing', 'd8'),       -- Medicine
  ('Persuasion', 'd8'),    -- Social
  ('Guts', 'd10')          -- Fear resistance (blessed specialty)
) AS t(skill_name, die_value)
WHERE NOT EXISTS (
  SELECT 1 FROM skills s
  WHERE s.character_id = (SELECT id FROM characters WHERE name = 'Divine Blessed')
    AND s.name = t.skill_name
);

-- Add equipment to Huckster - only if not already added
INSERT INTO equipment (character_id, name, type, quantity, damage, range, rof, shots, is_equipped, created_at)
SELECT
  (SELECT id FROM characters WHERE name = 'Arcane Huckster'),
  item_name,
  item_type,
  quantity,
  damage,
  range_val,
  rof,
  shots,
  is_equipped,
  NOW()
FROM (VALUES
  ('Colt Peacemaker', 'WEAPON_RANGED', 1, '2d6+1', '12/24/48', 1, 6, true),
  ('Knife', 'WEAPON_MELEE', 1, 'Str+d4', null, null, null, true),
  ('Playing Cards', 'GEAR', 1, null, null, null, null, false),
  ('Ammunition (.45)', 'GEAR', 50, null, null, null, null, false),
  ('Lucky Poker Chip', 'GEAR', 1, null, null, null, null, false)
) AS t(item_name, item_type, quantity, damage, range_val, rof, shots, is_equipped)
WHERE NOT EXISTS (
  SELECT 1 FROM equipment eq
  WHERE eq.character_id = (SELECT id FROM characters WHERE name = 'Arcane Huckster')
    AND eq.name = t.item_name
);

-- Add equipment to Blessed - only if not already added
INSERT INTO equipment (character_id, name, type, quantity, damage, range, rof, shots, is_equipped, created_at)
SELECT
  (SELECT id FROM characters WHERE name = 'Divine Blessed'),
  item_name,
  item_type,
  quantity,
  damage,
  range_val,
  rof,
  shots,
  is_equipped,
  NOW()
FROM (VALUES
  ('Winchester Rifle', 'WEAPON_RANGED', 1, '2d8', '24/48/96', 1, 15, true),
  ('Bowie Knife', 'WEAPON_MELEE', 1, 'Str+d6', null, null, null, true),
  ('Holy Symbol', 'GEAR', 1, null, null, null, null, false),
  ('Bible', 'GEAR', 1, null, null, null, null, false),
  ('Ammunition (.45-70)', 'GEAR', 30, null, null, null, null, false),
  ('Medical Supplies', 'GEAR', 1, null, null, null, null, false)
) AS t(item_name, item_type, quantity, damage, range_val, rof, shots, is_equipped)
WHERE NOT EXISTS (
  SELECT 1 FROM equipment eq
  WHERE eq.character_id = (SELECT id FROM characters WHERE name = 'Divine Blessed')
    AND eq.name = t.item_name
);

-- Add edges to Huckster - only if not already added
INSERT INTO edges (character_id, name, description, created_at)
SELECT
  (SELECT id FROM characters WHERE name = 'Arcane Huckster'),
  edge_name,
  description,
  NOW()
FROM (VALUES
  ('Arcane Background (Huckster)', 'Can cast huckster hexes'),
  ('Quick Draw', 'May draw weapon as free action'),
  ('Level Headed', 'Draw extra card in combat for initiative'),
  ('New Power (Bolt)', 'Learned Bolt power'),
  ('Power Points', '+5 Power Points')
) AS t(edge_name, description)
WHERE NOT EXISTS (
  SELECT 1 FROM edges ed
  WHERE ed.character_id = (SELECT id FROM characters WHERE name = 'Arcane Huckster')
    AND ed.name = t.edge_name
);

-- Add edges to Blessed - only if not already added
INSERT INTO edges (character_id, name, description, created_at)
SELECT
  (SELECT id FROM characters WHERE name = 'Divine Blessed'),
  edge_name,
  description,
  NOW()
FROM (VALUES
  ('Arcane Background (Blessed)', 'Can cast miracles through faith'),
  ('Healer', 'Can use Healing power up to 1 hour after injury'),
  ('Strong Willed', '+2 to Tests of Will and resisting Taunt'),
  ('New Power (Healing)', 'Learned Healing power'),
  ('Power Points', '+5 Power Points')
) AS t(edge_name, description)
WHERE NOT EXISTS (
  SELECT 1 FROM edges ed
  WHERE ed.character_id = (SELECT id FROM characters WHERE name = 'Divine Blessed')
    AND ed.name = t.edge_name
);

-- Verify creation/existence
SELECT
  c.id,
  c.name,
  c.occupation,
  c.current_power_points,
  c.max_power_points,
  c.fate_chips,
  COUNT(DISTINCT ap.id) as power_count,
  COUNT(DISTINCT s.id) as skill_count,
  COUNT(DISTINCT e.id) as equipment_count,
  COUNT(DISTINCT ed.id) as edge_count
FROM characters c
LEFT JOIN arcane_powers ap ON c.id = ap.character_id
LEFT JOIN skills s ON c.id = s.character_id
LEFT JOIN equipment e ON c.id = e.character_id
LEFT JOIN edges ed ON c.id = ed.character_id
WHERE c.name IN ('Arcane Huckster', 'Divine Blessed')
GROUP BY c.id, c.name, c.occupation, c.current_power_points, c.max_power_points, c.fate_chips
ORDER BY c.name;
