-- Reference Data for Deadlands Campaign Manager
-- Source: Deadlands Reloaded Player's Guide

-- ============================================================================
-- HINDRANCE REFERENCES
-- ============================================================================

INSERT INTO hindrance_references (name, description, severity, game_effect) VALUES
('Ailin''', 'Medicine is a rudimentary science on the wild frontier. Your hero has a reservation with the undertaker. The cause is something like consumption (tuberculosis), diabetes, or cancer. Minor: Subtract 1 from Fatigue rolls. Major: Subtract 2 from Fatigue rolls. Must make Vigor roll at end of each session or worsen.', 'EITHER', '-1 or -2 to Fatigue rolls for physical exertion'),
('Bad Dreams', 'Your hombre doesn''t sleep well. The Land of Nod is a constant nightmare. The cowpoke begins each game session with 1 less Fate Chip to represent his constantly tired state. This is cumulative with Bad Luck.', 'MAJOR', 'Start each session with 1 less Fate Chip'),
('Grim Servant o'' Death', 'Your hero''s a killer. Only Wild Cards can take this Hindrance. The good news: +1 to every damage roll. The downside: any Shooting or Throwing attack roll of 1 on the skill die automatically hits the nearest friendly character in sight.', 'MAJOR', '+1 to all damage rolls, but attack rolls of 1 hit allies'),
('Heavy Sleeper', 'Once your hero drops off, he must make a Notice roll (-4) to wake up. He also suffers a -4 penalty to Vigor rolls made to stay awake.', 'MINOR', 'Notice -4 to wake up, Vigor -4 to stay awake'),
('Lyin'' Eyes', 'Lies just don''t come easy to this hombre. A hero with this Hindrance suffers a -2 penalty to all Intimidation and Persuasion rolls where lies must be told. Also -2 to Gambling rolls in poker games.', 'MINOR', '-2 to Intimidation/Persuasion when lying, -2 to Gambling (poker)'),
('Old Ways Oath', 'Your hero has decided to forego modern technology to honor the spirits. Minor: Won''t use modern devices himself. Major: Won''t even passively use such devices.', 'EITHER', 'Cannot use modern technology'),
('Slowpoke', 'Molasses on a cold day moves faster than your hero. Reduce his Pace by 1. This is cumulative with the Lame Hindrance.', 'MINOR', 'Pace -1'),
('Tenderfoot', 'Your hero suffers -1 Grit as a result of his inexperience in the ways of the West. A hero with this Hindrance can''t take the True Grit Edge. Can be bought off at Seasoned rank.', 'MINOR', 'Grit -1, cannot take True Grit Edge'),
('Thin Skinned', 'Every little cut and scrape makes your cowpoke cry for mama. As long as he has at least one wound, he suffers an additional -1 penalty to all his actions.', 'MAJOR', 'Additional -1 penalty per wound'),
('Wanted', 'Your cowpoke has a price on his head. Minor: 1d6 x $100 bounty. Major: 1d6 x $1,000 bounty.', 'EITHER', 'Bounty on head, law enforcement pursuit')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- EDGE REFERENCES
-- ============================================================================

INSERT INTO edge_references (name, description, requirements, type, rank_required) VALUES
-- Background Edges
('Arcane Background (Magic)', 'Hucksters envision duels of will as card games. They wrestle their powers from the dark spirits of the Weird West.', 'Novice', 'BACKGROUND', 'Novice'),
('Arcane Background (Miracles)', 'Blessed can call upon the power of their deity for aid. When these folks behave themselves, they can sometimes invoke miracles.', 'Novice', 'BACKGROUND', 'Novice'),
('Arcane Background (Shamanism)', 'Shamans are Indian holy men and women. Their power comes from bargains with the demanding spirits of the natural world.', 'Novice', 'BACKGROUND', 'Novice'),
('Arcane Background (Chi Mastery)', 'A few supremely skilled fighters have achieved spiritual discipline necessary to channel chi through their own bodies.', 'Novice, Martial Arts', 'BACKGROUND', 'Novice'),
('Arcane Background (Weird Science)', 'Mad Scientists build weird and wonderful devices, machines which often seem to defy the very laws of reality.', 'Novice', 'BACKGROUND', 'Novice'),
('Veteran o'' the Weird West', 'You want to be an experienced hero? Begin play at Seasoned rank (or one Rank higher). Draw a card from action deck for Marshal to determine what bad luck you''ve encountered.', 'Wild Card, Novice, Guts d6+, Knowledge (Occult) d6+', 'BACKGROUND', 'Novice'),

-- Combat Edges
('Duelist', 'Your hombre is a deadly gunfighter. In a duel, this hero receives an extra hole card for each point of Grit he has.', 'Wild Card, Novice, Shooting d6+', 'COMBAT', 'Novice'),
('Hip-Shooting', 'Any hombre can fan a single-action pistol, but your hero''s a natural hip-shooter. He suffers only a -2 to his Shooting rolls when fanning the hammer.', 'Seasoned, Shooting d8+', 'COMBAT', 'Seasoned'),
('Improved Hip-Shooting', 'Your hero''s got fanning down to a fine art. He suffers no penalty to his Shooting roll when fanning the hammer.', 'Heroic, Shooting d10+, Hip-Shooting', 'COMBAT', 'Heroic'),
('Martial Arts', 'You''ve trained in martial arts or boxing. Your character''s body is a finely honed weapon. Even when fighting unarmed, you are considered armed. Opponents never benefit from any gang up bonus against your hero.', 'Novice, Fighting d6+', 'COMBAT', 'Novice'),
('Speed Load', 'Your pistolero has mastered the fine art of loading his six-gun in an all-fired hurry. You can reload one weapon on your action, ignoring the usual -2 penalty. If weapon requires a full round to reload, time is reduced by 1 round.', 'Seasoned, Agility d8+, Shooting d6+', 'COMBAT', 'Seasoned'),

-- Social Edges
('Card Sharp', 'Your hero has a way with a deck and never feels more at home than when he''s shuffling cards. Only gets caught cheating on snake eyes. If your hero''s a Huckster, folks get a -2 to Notice rolls when trying to spot a hex being cast.', 'Novice, Gambling d6+', 'SOCIAL', 'Novice'),
('Reputation', 'Whether branded a hero or villain, he has earned a reputation across the West. He may add his Charisma to Intimidation rolls. A negative score is treated as positive for this purpose.', 'Veteran', 'SOCIAL', 'Veteran'),
('True Grit', 'Some folks just seem to exude toughness. The horrors of life in the Weird West don''t faze this hombre. Your hero''s cool demeanor gives him +1 Grit.', 'Wild Card, Novice, Spirit d8+', 'SOCIAL', 'Novice'),

-- Professional Edges
('Agent', 'Full-time Agent beholden to the Union''s Agency. Expected to spy on enemies, seek out and contain/destroy weird creatures. Receive free Gatling pistol upon completion of training and always add +1 to Guts checks. Begin at Grade 0 with $40/month pay.', 'Seasoned, Smarts d8+, Fighting d6+, Knowledge (Law) d4+, Knowledge (Occult) d6+, Investigation d6+, Shooting d6+', 'PROFESSIONAL', 'Seasoned')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SKILL REFERENCES
-- ============================================================================

-- Savage Worlds Core Skills (Available to all)
INSERT INTO skill_references (name, description, attribute, default_value, is_core_skill) VALUES
('Athletics', 'Climbing, jumping, balancing, throwing. Used for acts of physical exertion.', 'AGILITY', 'd4', true),
('Climbin''', 'Climbing walls, cliffs, and other vertical surfaces.', 'AGILITY', 'd4', false),
('Common Knowledge', 'General knowledge of the world and culture.', 'SMARTS', 'd4', true),
('Notice', 'Awareness and perception.', 'SMARTS', 'd4', true),
('Persuasion', 'Ability to convince, deceive, or taunt others.', 'SPIRIT', 'd4', true),
('Stealth', 'Ability to hide and move quietly.', 'AGILITY', 'd4', true),

-- Combat Skills
('Fighting', 'Skill in armed and unarmed melee combat.', 'AGILITY', 'd4-2', true),
('Fightin''', 'Skill in armed and unarmed melee combat.', 'AGILITY', 'd4-2', true),
('Shooting', 'Skill with firearms and thrown weapons.', 'AGILITY', 'd4-2', true),
('Shootin''', 'Skill with firearms and bows.', 'AGILITY', 'd4-2', true),
('Bow', 'Skill with bows and crossbows.', 'AGILITY', 'd4-2', false),
('Throwin''', 'Skill with thrown weapons like knives, tomahawks.', 'AGILITY', 'd4-2', false),

-- Smarts-Based Skills
('Academia', 'Knowledge of liberal arts, social sciences, literature, history.', 'SMARTS', 'd4-2', false),
('Gambling', 'Knowledge of games of chance and skill.', 'SMARTS', 'd4-2', false),
('Gamblin''', 'Knowledge of card games, dice, and other games of chance.', 'SMARTS', 'd4-2', false),
('Investigation', 'Researching, tracking down sources, cross-referencing data.', 'SMARTS', 'd4-2', false),
('Medicine', 'Healing and treating wounds and sickness.', 'SMARTS', 'd4-2', false),
('Occult', 'Knowledge of supernatural events, creatures, history, and ways.', 'SMARTS', 'd4-2', false),
('Repair', 'Fixing mechanical and electrical devices.', 'SMARTS', 'd4-2', false),
('Science', 'Knowledge of scientific principles and their application.', 'SMARTS', 'd4-2', false),
('Survival', 'Finding food, water, shelter in wilderness; tracking.', 'SMARTS', 'd4-2', false),
('Bluff', 'Deceiving others through lies and misdirection.', 'SMARTS', 'd4-2', false),
('Scroungin''', 'Finding useful items in unlikely places.', 'SMARTS', 'd4-2', false),
('Streetwise', 'Knowledge of the criminal underworld and urban survival.', 'SMARTS', 'd4-2', false),
('Tinkerin''', 'Fixing and modifying mechanical devices.', 'SMARTS', 'd4-2', false),
('Ridicule', 'Mocking and taunting opponents.', 'SMARTS', 'd4-2', false),
('Trackin''', 'Following tracks and reading signs in the wilderness.', 'SMARTS', 'd4-2', false),
('Search', 'Finding hidden objects and clues.', 'SMARTS', 'd4-2', false),
('Scrutinize', 'Examining details and spotting lies.', 'SMARTS', 'd4-2', false),

-- Agility-Based Skills
('Riding', 'Handling and riding animals, wagons, carriages.', 'AGILITY', 'd4-2', false),
('Drivin''', 'Operating wagons, carriages, and other vehicles.', 'AGILITY', 'd4-2', false),
('Thievery', 'Sleight of hand, picking locks, disabling traps.', 'AGILITY', 'd4-2', false),
('Lockpickin''', 'Opening locks without a key.', 'AGILITY', 'd4-2', false),
('Sleight o'' Hand', 'Picking pockets, palming objects, card tricks.', 'AGILITY', 'd4-2', false),
('Speed Load', 'Quickly reloading firearms.', 'AGILITY', 'd4-2', false),
('Flichin''', 'Quick-draw and fast shooting techniques.', 'AGILITY', 'd4-2', false),
('Dodge', 'Avoiding attacks and danger.', 'AGILITY', 'd4-2', false),

-- Spirit-Based Skills
('Faith', 'Invoking divine miracles for the Blessed.', 'SPIRIT', 'd4-2', false),
('Focus', 'Channeling arcane energy for spellcasters.', 'SPIRIT', 'd4-2', false),
('Intimidation', 'Threatening or frightening others into compliance.', 'SPIRIT', 'd4-2', false),

-- Weird West Specific Skills
('Guts', 'Resisting fear and maintaining composure in the face of terror.', 'SPIRIT', 'd4', true),
('Hexslinging', 'Casting hexes for Hucksters using poker hands and willpower.', 'SMARTS', 'd4-2', false),

-- Trade and Professional Skills
('Blacksmithing', 'Working with metal to create tools and weapons.', 'SMARTS', 'd4-2', false),
('Professional', 'Various professional occupations and trades.', 'SMARTS', 'd4-2', false),
('Trade', 'General trade and craft skills.', 'SMARTS', 'd4-2', false),
('Mad Science', 'Creating infernal devices and weird science gadgets.', 'SMARTS', 'd4-2', false),

-- Cognition-Based Skills
('Cognition', 'Mental awareness and quick thinking.', 'SMARTS', 'd4', false),
('Artillery', 'Operating cannons and other artillery pieces.', 'SMARTS', 'd4-2', false),
('Arts', 'Painting, sculpting, and other artistic endeavors.', 'SMARTS', 'd4-2', false),

-- Additional Skills
('Animal Wranglin''', 'Handling and training animals.', 'SMARTS', 'd4-2', false),
('Area Knowledge', 'Detailed knowledge of a specific geographic area.', 'SMARTS', 'd4-2', false),
('Language', 'Speaking and understanding foreign languages.', 'SMARTS', 'd4-2', false),
('Demolition', 'Using explosives safely and effectively.', 'SMARTS', 'd4-2', false),
('Disguise', 'Changing appearance to avoid recognition.', 'SMARTS', 'd4-2', false),
('Performin''', 'Acting, singing, dancing, and other performances.', 'SPIRIT', 'd4-2', false),
('Tale Tellin''', 'Storytelling and entertaining audiences.', 'SPIRIT', 'd4-2', false),
('Leadership', 'Inspiring and commanding others.', 'SPIRIT', 'd4-2', false),
('Overawe', 'Intimidating through presence and force of personality.', 'SPIRIT', 'd4-2', false)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- EQUIPMENT REFERENCES - Weapons
-- ============================================================================

INSERT INTO equipment_references (name, description, type, damage, range, rate_of_fire, shots, ap, weight, cost, notes) VALUES
-- Pistols
('Colt Army', 'Standard military revolver. Reliable single-action pistol.', 'WEAPON_RANGED', '2d6+1', '12/24/48', 1, 6, 0, 3.0, 15.00, 'Single-action revolver'),
('Colt Lightning', 'Double-action revolver. Faster to fire than single-action.', 'WEAPON_RANGED', '2d6', '12/24/48', 1, 6, 0, 2.0, 20.00, 'Double-action revolver'),
('Colt Peacemaker', 'The most iconic gun of the West. Single-action revolver.', 'WEAPON_RANGED', '2d6+1', '12/24/48', 1, 6, 0, 3.0, 15.00, 'Single-action revolver, a.k.a. Colt .45'),
('Derringer', 'Small, easily concealed pistol. Popular with gamblers.', 'WEAPON_RANGED', '2d4', '3/6/12', 1, 2, 0, 0.5, 10.00, 'Easily concealed (-2 to Notice)'),
('LeMat Revolver', 'Unique 9-shot revolver with underbarrel shotgun.', 'WEAPON_RANGED', '2d6+1', '12/24/48', 1, 9, 0, 4.0, 25.00, 'Can fire shotgun barrel: 1-3d6, 12/24/48, RoF 1, Shots 1'),

-- Rifles
('Henry Rifle', 'Lever-action repeating rifle. Popular during Civil War.', 'WEAPON_RANGED', '2d8', '24/48/96', 1, 12, 2, 9.0, 40.00, 'Lever-action'),
('Sharps Big 50', 'Heavy buffalo gun. Very long range, powerful.', 'WEAPON_RANGED', '2d10', '30/60/120', 1, 1, 2, 11.0, 50.00, 'Snapfire, Reload 2 actions'),
('Spencer Carbine', 'Shorter rifle for cavalry use.', 'WEAPON_RANGED', '2d8', '20/40/80', 1, 7, 2, 8.0, 35.00, 'Lever-action'),
('Winchester ''73', 'The gun that won the West. Reliable repeating rifle.', 'WEAPON_RANGED', '2d8-1', '24/48/96', 1, 15, 2, 10.0, 45.00, 'Lever-action'),

-- Shotguns
('Double-Barrel Shotgun', 'Classic coach gun. Both barrels can fire at once.', 'WEAPON_RANGED', '1-3d6', '12/24/48', 1, 2, 0, 11.0, 30.00, 'Can fire both barrels simultaneously'),
('Pump-Action Shotgun', 'Modern shotgun with faster reload.', 'WEAPON_RANGED', '1-3d6', '12/24/48', 1, 6, 0, 10.0, 40.00, 'Pump-action'),

-- Melee Weapons
('Bowie Knife', 'Large fighting knife. Popular sidearm.', 'WEAPON_MELEE', 'Str+d4+1', null, 0, 0, 0, 3.0, 8.00, 'Reach 0'),
('Cavalry Saber', 'Standard military sword.', 'WEAPON_MELEE', 'Str+d6', null, 0, 0, 0, 4.0, 15.00, 'Reach 1'),
('Tomahawk', 'Native American axe. Can be thrown.', 'WEAPON_MELEE', 'Str+d6', '3/6/12', 0, 0, 0, 2.0, 5.00, 'Can be thrown, Reach 0'),
('Whip', 'Used for intimidation and disarming.', 'WEAPON_MELEE', 'Str+d4', null, 0, 0, 0, 2.0, 5.00, 'Reach 2, can Disarm or Grapple')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- EQUIPMENT REFERENCES - Gear
-- ============================================================================

INSERT INTO equipment_references (name, description, type, weight, cost, notes) VALUES
('Backpack', 'Canvas or leather pack for carrying supplies.', 'GEAR', 2.0, 2.00, 'Holds 50 lbs of gear'),
('Bedroll', 'Blankets and ground cloth for sleeping.', 'GEAR', 4.0, 2.00, 'Provides warmth'),
('Canteen', 'Water container. Holds 1 quart.', 'GEAR', 2.0, 1.00, 'Holds 1 quart water'),
('Lantern', 'Oil lantern. Provides light in darkness.', 'GEAR', 3.0, 10.00, 'Radius 10", 6 hours oil'),
('Lockpicks', 'Thief''s tools for picking locks.', 'GEAR', 1.0, 15.00, '+2 to Thievery for lockpicking'),
('Rope (10")', 'Hemp rope for climbing, binding.', 'GEAR', 15.0, 10.00, 'Can support 200 lbs'),
('Spurs', 'Boot spurs. Help control mounts.', 'GEAR', 1.0, 5.00, '+2 to Riding rolls to control mount'),
('Tent (4-person)', 'Canvas tent for camping.', 'GEAR', 30.0, 20.00, 'Shelters 4 people'),
('Whiskey (bottle)', 'Spirits. For medicinal purposes, of course.', 'CONSUMABLE', 2.0, 1.00, 'Can be used for courage or medicine')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- ARCANE POWER REFERENCES
-- ============================================================================

INSERT INTO arcane_power_references (name, description, power_points, range, duration, trait_roll, effect, arcane_backgrounds) VALUES
-- Blessed Powers
('Healing', 'Invoking divine power to heal wounds through prayer and faith. Can heal wounds or remove poison/disease.', 3, 'Touch', 'Instant', 'Faith', 'Heals one Wound per success/raise, or removes poison/disease', 'Blessed'),
('Smite', 'Channel divine wrath to enhance weapons with holy power.', 2, 'Smarts', '5 rounds', 'Faith', 'Weapon does +2 or +4 damage', 'Blessed'),
('Protection', 'Call upon divine protection to shield from harm.', 1, 'Smarts', '5 rounds', 'Faith', 'Armor +2 or +4', 'Blessed,Shaman,Huckster'),
('Warrior''s Gift', 'Bless a warrior with enhanced combat abilities.', 2, 'Touch', '5 rounds', 'Faith', '+2 Fighting or Shooting rolls', 'Blessed'),

-- Huckster Powers
('Bolt', 'Hurl arcane energy at foes. Classic attack spell.', 1, '12/24/48', 'Instant', 'Hexslinging', '2d6 damage, Lightning Trapping', 'Huckster,Mad Scientist'),
('Deflection', 'Create a field that deflects attacks.', 3, 'Smarts', '5 rounds', 'Hexslinging', 'Attackers get -2 or -4 to hit', 'Huckster,Shaman'),
('Mind Rider', 'Enter and read the thoughts of another.', 5, 'Smarts', 'Concentration', 'Hexslinging', 'Read surface thoughts or probe memories', 'Huckster,Blessed'),
('Phantom Fingers', 'Manipulate objects at a distance with unseen hands.', 2, 'Smarts', 'Concentration', 'Hexslinging', 'Telekinesis to manipulate objects', 'Huckster'),

-- Shaman Powers
('Beast Friend', 'Communicate with and gain the aid of animals.', 3, 'Smarts', '10 minutes', 'Faith', 'Gain animal ally that obeys simple commands', 'Shaman'),
('Shape Change', 'Transform into an animal form.', 4, 'Self', '5 minutes', 'Faith', 'Transform into animal, gain its abilities', 'Shaman'),
('Spirit Warrior', 'Summon a spirit guardian to fight alongside you.', 5, 'Smarts', '5 rounds', 'Faith', 'Summon spirit ally with combat abilities', 'Shaman'),

-- Mad Science Powers
('Burst', 'Area attack device. Explosive or electrical discharge.', 2, 'Cone Template', 'Instant', 'Weird Science', '2d6 damage in area', 'Mad Scientist'),
('Environmental Protection', 'Device protects from harsh environments.', 2, 'Touch', '1 hour', 'Weird Science', 'Immune to environmental hazards', 'Mad Scientist'),
('Speed', 'Device enhances movement speed.', 1, 'Touch', '5 rounds', 'Weird Science', 'Pace doubled, +2 to Athletics (running)', 'Mad Scientist,Huckster'),

-- Common/Multiple Arcane Backgrounds
('Boost Trait', 'Enhance a physical or mental attribute.', 2, 'Smarts', '5 rounds', 'Varies', '+1 or +2 die steps to a Trait', 'Blessed,Huckster,Shaman,Mad Scientist'),
('Invisibility', 'Become invisible or nearly so.', 5, 'Touch', '5 rounds', 'Varies', '-4 or -6 to be seen', 'Huckster,Shaman,Mad Scientist'),
('Lower Trait', 'Reduce a foe''s attribute or skill.', 2, 'Smarts', '5 rounds', 'Varies', '-1 or -2 die steps to a Trait', 'Blessed,Huckster,Shaman')
ON CONFLICT DO NOTHING;
