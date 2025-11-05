-- Missing Reference Data for Deadlands Campaign Manager
-- Adding references for character data currently without references
-- Source: Deadlands Reloaded Player's Guide & Savage Worlds Deluxe Edition

-- ============================================================================
-- MISSING SKILL REFERENCES (5)
-- ============================================================================

INSERT INTO skill_references (name, description, attribute, default_value, is_core_skill) VALUES
('Classics', 'Knowledge of ancient Greek and Roman literature, history, and language.', 'SMARTS', 'd4-2', false),
('Home County', 'Detailed knowledge of a specific home region or county.', 'SMARTS', 'd4-2', false),
('Mining', 'Knowledge and skill in mining operations, geology, and prospecting.', 'SMARTS', 'd4-2', false),
('Scrutiny', 'Reading people, detecting lies, and noticing behavioral details.', 'SMARTS', 'd4-2', false),
('True Magic', 'The ability to cast true magical spells, rare in the Weird West.', 'SMARTS', 'd4-2', false)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- MISSING EDGE REFERENCES (29) - All character edges currently in use
-- ============================================================================

INSERT INTO edge_references (name, description, requirements, type, rank_required) VALUES
-- Background Edges
('Arcane Background', 'Your hero can access supernatural powers through various means.', 'Novice', 'BACKGROUND', 'Novice'),
('Dinero', 'Your character comes from money. He starts with three times the normal starting funds and a $150 monthly allowance. Rich: starts with 5x funds and $250/month.', 'Novice or Veteran', 'BACKGROUND', 'Novice'),
('Illiterate', 'Your hero cannot read or write in any language.', 'Novice', 'BACKGROUND', 'Novice'),
('Juxteno', 'Character is a Juxteno - a rare martial artist who has mastered ancient fighting techniques.', 'Novice, Martial Artist', 'BACKGROUND', 'Novice'),

-- Combat Edges
('Brave', 'Those with this Edge have learned to master their fear. They add +2 to all Fear tests.', 'Novice, Spirit d6+', 'COMBAT', 'Novice'),
('Brawny', 'Your hero is very large or particularly muscular. His Size increases by +1 and he treats his Strength as one die type higher for Encumbrance.', 'Novice, Strength d6+, Vigor d6+', 'COMBAT', 'Novice'),
('Nerves of Steel', 'Your hero has learned to fight on through the most intense pain. He may ignore 1 point of wound penalties.', 'Novice, Vigor d8+', 'COMBAT', 'Novice'),
('Martial Artist', 'Your character is trained in hand-to-hand combat. His fists and feet are weapons (Str+d4), he never counts as an Unarmed Defender, and he has Reach 1 with his unarmed attacks.', 'Novice, Fighting d6+', 'COMBAT', 'Novice'),

-- Leadership Edges
('Heroic', 'Your hero never says no to a person in need. He cannot refuse a request for aid if it''s in his power to help.', 'Novice', 'LEADERSHIP', 'Novice'),

-- Social Edges
('Cat Eyes', 'Your hero''s eyes amplify light. He ignores penalties for Dim and Dark lighting.', 'Novice', 'SOCIAL', 'Novice'),
('Keen', 'Your hero is very observant. He adds +2 to all Notice rolls.', 'Novice', 'SOCIAL', 'Novice'),
('Loyal', 'Your hero is extremely loyal to his friends and allies. He will never leave a man behind if there''s any chance to save him.', 'Novice', 'SOCIAL', 'Novice'),
('Purty', 'Your hero is blessed with exceptional looks. Add +2 to Performance and Persuasion rolls if the target is attracted to your hero''s gender.', 'Novice, Vigor d6+', 'SOCIAL', 'Novice'),
('Thick Skull', 'Your cowpoke''s noggin is harder than most. He adds +2 to Soak rolls and Vigor rolls to recover from being Shaken.', 'Novice', 'SOCIAL', 'Novice'),

-- Professional Edges
('Fast Healer', 'Your hero heals faster than most. He makes natural healing rolls once per 3 days instead of 5 days.', 'Novice, Vigor d8+', 'PROFESSIONAL', 'Novice'),
('Mechanical Devices', 'Your mad scientist specializes in mechanical contraptions. Gain +2 to Mad Science rolls when building mechanical devices.', 'Novice, Arcane Background (Weird Science)', 'PROFESSIONAL', 'Novice'),

-- Weird Edges
('Hexer', 'Hucksters with this Edge know the secret of laying hexes. They can spend a Fate Chip to place a hex on a target.', 'Novice, Arcane Background (Huckster)', 'WEIRD', 'Novice'),
('Huckster', 'Your hero is a Huckster - a card-slinging spellcaster who makes deals with manitous.', 'Novice, Arcane Background (Magic)', 'WEIRD', 'Novice'),
('Curious', 'Your hero wants to know everything. He will often stick his nose where it doesn''t belong.', 'Novice', 'WEIRD', 'Novice'),
('Superstitious', 'The character believes in all sorts of superstitions and follows various rituals. He suffers -2 to Fear checks when facing supernatural creatures.', 'Novice', 'WEIRD', 'Novice'),
('The Voice', 'Your hero has a commanding, authoritative voice. Add +2 to Intimidation and Persuasion rolls when speaking.', 'Novice, Spirit d8+', 'WEIRD', 'Novice'),
('Obligated Soul', 'Your hero''s soul is pledged to a dark power. He must perform certain tasks or face consequences.', 'Novice', 'WEIRD', 'Novice'),
('Heroism', 'Your hero is renowned for his heroic deeds. He gains +2 Charisma.', 'Seasoned', 'WEIRD', 'Seasoned'),
('Obstinate', 'Your hero is stubborn and set in his ways. He wants to do things his way, often rejecting good advice.', 'Novice', 'WEIRD', 'Novice'),
('Stompin''', 'Your character knows how to put the boots to someone. When making an unarmed Fighting attack against a prone foe, add +2 to damage.', 'Novice, Vigor d8+', 'COMBAT', 'Novice'),
('Tin Horn', 'Your hero is a small-time gambler or con artist. Gain +2 to Gambling and Streetwise in towns.', 'Novice, Gambling d6+', 'SOCIAL', 'Novice'),
('True Heir', 'Your character is the rightful heir to something important - a throne, fortune, or title.', 'Novice', 'BACKGROUND', 'Novice'),
('Watchers', 'Mysterious entities watch over your hero. Once per session, they may intervene to help him.', 'Novice', 'WEIRD', 'Novice'),
('Law of the West', 'Your hero is an expert on frontier law and justice. Gain +2 to Knowledge (Law) and Intimidation when enforcing the law.', 'Novice, Smarts d6+', 'PROFESSIONAL', 'Novice')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- MISSING HINDRANCE REFERENCES (13) - All character hindrances currently in use
-- ============================================================================

INSERT INTO hindrance_references (name, description, severity, game_effect) VALUES
('Curious', 'Your hero is a naturally curious person. He will often stick his nose where it doesn''t belong and ask questions he shouldn''t. Minor: Generally curious. Major: Insatiably curious, will risk life and limb.', 'EITHER', 'Must investigate interesting situations'),
('Dumb as Mud', 'Your hero is not the sharpest tool in the shed. His maximum Smarts is d4. He also suffers -2 to Common Knowledge rolls.', 'MINOR', 'Maximum Smarts d4, -2 to Common Knowledge'),
('Dumb as Mud (Eagle)', 'Character named Eagle has limited mental capacity. Maximum Smarts is d4.', 'MINOR', 'Maximum Smarts d4, -2 to Common Knowledge'),
('Enemy', 'Someone out there hates your hero and will cause trouble. Minor: Enemy is relatively weak. Major: Enemy is powerful and influential.', 'EITHER', 'Someone actively works against you'),
('Geezer', 'Your hero is getting on in years. He suffers -1 to Pace, running die is d4 instead of d6, and -1 to Agility and Strength (but +5 skill points).', 'MAJOR', 'Pace -1, Run d4, Agility/Strength -1, +5 skill points'),
('Hankerin''', 'Your hero has a hankering for something - alcohol, tobacco, a certain food. Minor: Common vice. Major: Rare or dangerous substance.', 'EITHER', 'Must indulge regularly or suffer penalties'),
('Illiterate', 'Your hero cannot read or write in any language. He gains one additional skill point during character creation.', 'MINOR', 'Cannot read or write, +1 skill point'),
('Lame', 'Your hero has a bum leg or similar injury. His Pace is reduced by 2 and his running die is a d4.', 'MAJOR', 'Pace -2, Run d4'),
('Loco', 'Your hero is a little bit crazy. Minor: Minor delusions or phobias. Major: Severe mental illness that affects decision-making.', 'EITHER', 'Mental illness affects behavior'),
('Nose of Steel', 'Your hero has no sense of smell or taste whatsoever. He cannot detect odors or enjoy food.', 'MINOR', 'Cannot smell or taste'),
('Obstinate', 'Your hero is stubborn and wants things done his way. He often rejects good advice.', 'MINOR', 'Stubborn, ignores advice'),
('Superstitious', 'The character believes in all sorts of superstitions and follows various rituals. He suffers -2 to Fear checks. Minor: -1 to Fear. Major: -2 to Fear.', 'EITHER', '-1 or -2 to Fear checks'),
('Vengeful', 'Your hero will go out of his way to punish those who have wronged him. Minor: Vengeful. Major: Seeks the death of those who cross him.', 'EITHER', 'Must seek revenge on enemies')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- MISSING EQUIPMENT REFERENCES (8) - Equipment used by characters without references
-- ============================================================================

INSERT INTO equipment_references (name, description, type, weight, cost, notes) VALUES
('Brass Goggles', 'Protective eyewear, often worn by mad scientists and engineers. Provides protection from sparks and debris.', 'GEAR', 0.5, 5.00, '+1 to resist eye injuries from sparks'),
('Explosive Rifle Bullets', 'Special ammunition that explodes on impact. Dangerous and expensive.', 'AMMUNITION', 1.0, 50.00, '+1d6 damage in 2" radius, chance of misfire'),
('Lab Coat', 'White coat worn by scientists and doctors. Projects authority and professionalism.', 'GEAR', 2.0, 10.00, '+1 Charisma when practicing medicine or science'),
('Pipe & Pipe Tobacco', 'Smoking pipe and tobacco. Popular among gentlemen and thinkers.', 'CONSUMABLE', 0.5, 5.00, 'Lasts 1 month'),
('Pocket Protector', 'Keeps pens and tools organized in shirt pocket. Popular with scientists.', 'GEAR', 0.1, 0.50, 'Protects shirt from ink stains'),
('Poncho', 'Weather-resistant cloak. Keeps wearer dry in rain.', 'GEAR', 2.0, 5.00, 'Provides protection from rain'),
('Scientific Tools', 'Beakers, test tubes, measuring devices, and other scientific equipment.', 'GEAR', 5.0, 50.00, '+2 to Science rolls when equipped'),
('Tack', 'Saddle, reins, bridle, and other horse equipment.', 'GEAR', 20.0, 20.00, 'Required for riding')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMMON SAVAGE WORLDS EDGES FOR FUTURE CHARACTERS
-- ============================================================================

INSERT INTO edge_references (name, description, requirements, type, rank_required) VALUES
-- Common Background Edges
('Alertness', 'Your hero is very perceptive. He gets +2 to Notice rolls.', 'Novice', 'BACKGROUND', 'Novice'),
('Ambidextrous', 'Your hero is as deft with his left hand as he is with his right. He ignores the -2 penalty for using his off-hand.', 'Novice, Agility d8+', 'BACKGROUND', 'Novice'),
('Charismatic', 'Your hero has an aura of confidence and natural magnetism. His Charisma improves by +2.', 'Novice, Spirit d8+', 'BACKGROUND', 'Novice'),
('Jack-of-All-Trades', 'Your hero has a knack for picking things up. He has no -2 penalty for using skills untrained.', 'Novice, Smarts d10+', 'BACKGROUND', 'Novice'),
('Luck', 'Your hero seems to be blessed by fate itself. He has one extra Fate Chip per game session.', 'Novice', 'BACKGROUND', 'Novice'),
('Great Luck', 'Your hero is very lucky. He draws two extra Fate Chips instead of one per game session.', 'Novice, Luck', 'BACKGROUND', 'Novice'),

-- Common Combat Edges
('Block', 'Your hero is very skilled at defending himself in melee. He adds +1 to his Parry.', 'Seasoned, Fighting d8+', 'COMBAT', 'Seasoned'),
('Improved Block', 'Your hero is a master of defense. He adds +2 to his Parry instead of +1.', 'Veteran, Block', 'COMBAT', 'Veteran'),
('Dodge', 'Your hero is nimble and hard to hit. Attackers subtract 1 from their ranged attacks against him.', 'Seasoned, Agility d8+', 'COMBAT', 'Seasoned'),
('Improved Dodge', 'Your hero is extremely agile. Attackers subtract 2 from their ranged attacks against him.', 'Veteran, Dodge', 'COMBAT', 'Veteran'),
('Frenzy', 'Your hero gets an extra Fighting attack when taking the Fighting action at a -2 penalty.', 'Seasoned, Fighting d8+', 'COMBAT', 'Seasoned'),
('Improved Frenzy', 'Your hero gets an extra Fighting attack with no penalty.', 'Veteran, Frenzy', 'COMBAT', 'Veteran'),
('Level Headed', 'Your hero keeps his cool in combat. He draws an extra card in combat and acts on the best one.', 'Seasoned, Smarts d8+', 'COMBAT', 'Seasoned'),
('Improved Level Headed', 'Your hero draws two extra cards and acts on the best one.', 'Seasoned, Level Headed', 'COMBAT', 'Seasoned'),
('Marksman', 'If your hero does not move, he may add +2 to his Shooting roll. He may not run.', 'Seasoned, Shooting d8+', 'COMBAT', 'Seasoned'),
('Quick Draw', 'Your hero can draw a weapon as a free action.', 'Novice, Agility d8+', 'COMBAT', 'Novice'),
('Steady Hands', 'Your hero ignores the -2 penalty for firing from a moving platform.', 'Novice, Agility d8+', 'COMBAT', 'Novice'),
('Trademark Weapon', 'Your hero knows one unique weapon very well. He gains +1 to Fighting or Shooting rolls with that specific weapon.', 'Novice, Fighting/Shooting d10+', 'COMBAT', 'Novice'),
('Improved Trademark Weapon', 'Your hero is a master with his signature weapon. He gains +2 instead of +1.', 'Veteran, Trademark Weapon', 'COMBAT', 'Veteran'),
('Two-Fisted', 'Your hero fights with a weapon in each hand. He may attack with both weapons without the multi-action penalty.', 'Novice, Agility d8+', 'COMBAT', 'Novice'),

-- Common Leadership Edges
('Command', 'Your hero is a natural leader. Allies in his command radius add +1 to Spirit rolls to recover from Shaken.', 'Novice, Smarts d6+', 'LEADERSHIP', 'Novice'),
('Inspire', 'Once per turn, your hero may make a Smarts roll to remove the Shaken status from all troops in his command radius.', 'Seasoned, Command', 'LEADERSHIP', 'Seasoned'),
('Natural Leader', 'Your hero''s command radius increases from 5" to 10".', 'Novice, Spirit d8+, Command', 'LEADERSHIP', 'Novice'),

-- Common Professional Edges
('Acrobat', 'Your hero is very agile. He adds +2 to Agility rolls made to perform acrobatic maneuvers and +1 to Parry.', 'Novice, Agility d8+, Strength d6+', 'PROFESSIONAL', 'Novice'),
('Assassin', 'Your hero knows the secret places to strike. He adds +2 to damage when attacking a foe via a surprise attack (The Drop).', 'Novice, Agility d8+, Fighting d6+, Stealth d8+', 'PROFESSIONAL', 'Novice'),
('Investigator', 'Your hero is skilled at research and investigation. He adds +2 to Investigation and Streetwise rolls.', 'Novice, Smarts d8+, Investigation d8+, Streetwise d8+', 'PROFESSIONAL', 'Novice'),
('Scholar', 'Your hero is well-educated. He adds +2 to any two different Knowledge skills.', 'Novice, d8+ in affected skills', 'PROFESSIONAL', 'Novice'),
('Thief', 'Your hero is very good at "redistributing" wealth. He gains +2 to Climb, Lockpick, Stealth, and Sleight of Hand rolls.', 'Novice, Agility d8+, Stealth d6+, Thievery d6+', 'PROFESSIONAL', 'Novice'),
('Woodsman', 'Your hero is at home in the wilderness. He adds +2 to Tracking, Survival, and Stealth rolls in the wilds.', 'Novice, Spirit d6+, Survival d8+, Tracking d8+', 'PROFESSIONAL', 'Novice'),

-- Common Social Edges
('Attractive', 'Your hero is appealing to the eye. He has +2 Charisma.', 'Novice, Vigor d6+', 'SOCIAL', 'Novice'),
('Very Attractive', 'Your hero is drop-dead gorgeous. He has +4 Charisma instead of +2.', 'Novice, Attractive', 'SOCIAL', 'Novice'),
('Connections', 'Your hero knows important people who can help. Once per session, he can call on a contact for a favor.', 'Novice', 'SOCIAL', 'Novice'),
('Famous', 'Your hero is famous in his region. He has +2 Charisma but is often recognized.', 'Seasoned', 'SOCIAL', 'Seasoned'),
('Noble', 'Your character is a member of the nobility. He has status and +2 Charisma, but also has responsibilities.', 'Novice', 'SOCIAL', 'Novice'),
('Rich', 'Your hero is wealthy. He starts with three times the normal starting funds and a $150 monthly allowance.', 'Novice', 'SOCIAL', 'Novice')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMMON SAVAGE WORLDS HINDRANCES FOR FUTURE CHARACTERS
-- ============================================================================

INSERT INTO hindrance_references (name, description, severity, game_effect) VALUES
('All Thumbs', 'Your hero is poor with mechanical devices. He suffers a -2 penalty to use mechanical or electrical devices. If he rolls a 1 on his skill die, the device is broken.', 'MINOR', '-2 to use mechanical/electrical devices'),
('Anemic', 'Your hero is sickly and weak. He subtracts 2 from Fatigue checks.', 'MINOR', '-2 to Fatigue checks'),
('Arrogant', 'Your hero doesn''t think he''s the best - he knows he is. He must humble opponents and challenge the leader in battle.', 'MAJOR', 'Must prove superiority'),
('Bad Eyes', 'Your hero has poor vision. Minor: -2 to vision-related rolls beyond 5". Major: -2 to all vision-related rolls, cannot see details beyond 5".', 'EITHER', 'Vision penalties'),
('Bad Luck', 'Your hero is a little unlucky. He gets one less Fate Chip at the start of each session.', 'MAJOR', 'Start session with 1 less Fate Chip'),
('Big Mouth', 'Your hero can''t keep a secret and blurts things out at the worst times.', 'MINOR', 'Cannot keep secrets, reveals too much'),
('Blind', 'Your hero is completely blind. He suffers -6 to all physical actions requiring vision and -2 to social interactions.', 'MAJOR', '-6 to physical actions, -2 to social'),
('Bloodthirsty', 'Your hero never takes prisoners and finishes off downed foes.', 'MAJOR', 'Always kills enemies'),
('Cautious', 'Your hero is overly careful. He never takes risks and plans everything out.', 'MINOR', 'Avoids risky situations'),
('Clueless', 'Your hero isn''t stupid, just naive and unable to grasp most social cues. He suffers -2 to Common Knowledge and Notice rolls.', 'MAJOR', '-2 to Common Knowledge and Notice'),
('Code of Honor', 'Your hero follows a strict code. He keeps his word and acts like a gentleman.', 'MAJOR', 'Must follow personal code'),
('Death Wish', 'Your hero wants to die in a meaningful way. He seeks out dangerous situations.', 'MINOR', 'Seeks dangerous situations'),
('Delusional', 'Your hero believes something that is not true. Minor: Minor delusion. Major: Severe delusion affecting behavior.', 'EITHER', 'Believes false things'),
('Doubting Thomas', 'Your hero doesn''t believe in the supernatural until it bites him. He suffers -2 to Fear checks against supernatural foes.', 'MINOR', '-2 to Fear vs supernatural'),
('Elderly', 'Your hero is getting on in years. He suffers -1 to Pace, running die is d4, and -1 to Agility and Strength (but +5 skill points).', 'MAJOR', 'Pace -1, Run d4, Agility/Strength -1, +5 skill points'),
('Greedy', 'Your hero is obsessed with wealth. Minor: Argues over payment. Major: Will betray friends for money.', 'EITHER', 'Obsessed with money'),
('Habit', 'Your hero has an annoying or dangerous habit. Minor: Tobacco, biting nails. Major: Alcohol, drugs.', 'EITHER', 'Annoying or dangerous habit'),
('Hard of Hearing', 'Your hero doesn''t hear well. He suffers -2 to all Notice rolls involving hearing.', 'MINOR', '-2 to Notice (hearing)'),
('Heroic', 'Your hero is a true good guy. He cannot refuse a request for aid.', 'MAJOR', 'Cannot refuse help to those in need'),
('Mean', 'Your hero is ill-tempered and surly. He suffers -2 to Charisma for being unpleasant.', 'MINOR', '-2 Charisma'),
('Overconfident', 'Your hero believes he can do anything. He never thinks things are too dangerous.', 'MAJOR', 'Overestimates abilities'),
('Pacifist', 'Your hero dislikes violence. Minor: Only fights in self-defense. Major: Will not harm living creatures.', 'EITHER', 'Avoids or refuses violence'),
('Phobia', 'Your hero has an irrational fear. Minor: -2 to trait rolls in presence of phobia. Major: -4 to trait rolls and must make Fear check.', 'EITHER', 'Fear of specific thing'),
('Poverty', 'Your hero is dirt poor. He starts with half normal funds and often struggles to make ends meet.', 'MINOR', 'Half starting funds, struggles financially'),
('Quirk', 'Your hero has a minor, harmless eccentricity that is roleplayed but has no game effect.', 'MINOR', 'Harmless eccentricity'),
('Small', 'Your hero is very small (less than 5'' tall). His Size is -1, making him a bit easier to hurt.', 'MAJOR', 'Size -1, Toughness -1'),
('Ugly', 'Your hero is unfortunate-looking. He suffers -2 to Charisma.', 'MINOR', '-2 Charisma'),
('Vow', 'Your hero has pledged himself to a cause or deity. Minor: Can be worked around. Major: Dominates his life.', 'EITHER', 'Must honor vow'),
('Weak', 'Your hero is physically weak. He subtracts 1 when rolling his Strength for damage.', 'MAJOR', '-1 to Strength damage rolls'),
('Yellow', 'Your hero is cowardly. Minor: -2 to Fear checks. Major: -4 to Fear checks.', 'EITHER', '-2 or -4 to Fear checks'),
('Young', 'Your hero is young (8-12 years old). He has only 3 attribute points and 10 skill points, and gets 1 Fate Chip per session. +1 Fate Chip if he also has Luck.', 'MAJOR', '3 attribute points, 10 skill points, +1 Fate Chip')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- ADDITIONAL COMMON EQUIPMENT FOR FUTURE CHARACTERS
-- ============================================================================

INSERT INTO equipment_references (name, description, type, weight, cost, notes) VALUES
-- More Weapons
('Shotgun Shells (box)', 'Box of 50 shotgun shells.', 'AMMUNITION', 2.0, 5.00, '50 rounds'),
('.44/.45 Rounds (box)', 'Box of 50 pistol rounds.', 'AMMUNITION', 2.0, 5.00, '50 rounds'),
('Rifle Rounds (box)', 'Box of 50 rifle cartridges.', 'AMMUNITION', 2.0, 10.00, '50 rounds'),
('Knife (Folding)', 'Small folding pocket knife.', 'WEAPON_MELEE', 0.5, 3.00, 'Str+d4, easily concealed'),

-- More Gear
('Binoculars', 'Optical device for seeing distant objects. Reduces range penalties by half for Notice rolls.', 'GEAR', 2.0, 50.00, 'Reduces range penalties by half'),
('Blanket', 'Wool blanket for warmth.', 'GEAR', 4.0, 2.00, 'Provides warmth'),
('Boots', 'Sturdy leather boots.', 'GEAR', 3.0, 10.00, 'Standard footwear'),
('Compass', 'Navigation tool showing magnetic north.', 'GEAR', 0.5, 10.00, '+2 to Survival (navigation)'),
('Crowbar', 'Iron bar for prying. Can be used as weapon.', 'GEAR', 5.0, 5.00, 'Str+d4 as weapon, +2 to force doors'),
('Dynamite (stick)', 'Single stick of dynamite.', 'AMMUNITION', 1.0, 5.00, '3d6 damage, Medium Burst Template'),
('Hammer', 'Carpenter''s hammer.', 'GEAR', 2.0, 1.00, 'For building and repairs'),
('Harmonica', 'Musical instrument.', 'GEAR', 0.5, 5.00, 'For entertainment'),
('Hat (Stetson)', 'Classic Western hat.', 'GEAR', 1.0, 10.00, 'Sun protection, style'),
('Horse (Riding)', 'Average riding horse.', 'VEHICLE', null, 150.00, 'Pace 10, Toughness 6'),
('Horse (Mustang)', 'Wild mustang, fast and spirited.', 'VEHICLE', null, 100.00, 'Pace 12, Toughness 5'),
('Matches (box)', 'Box of strike-anywhere matches.', 'CONSUMABLE', 0.1, 0.50, '50 matches'),
('Mule', 'Pack animal for carrying supplies.', 'VEHICLE', null, 50.00, 'Pace 6, can carry 200 lbs'),
('Playing Cards', 'Deck of cards for gambling or magic.', 'GEAR', 0.1, 1.00, 'Required for Hucksters'),
('Shovel', 'Digging tool.', 'GEAR', 8.0, 5.00, 'For digging'),
('Wagon', 'Covered wagon for transport.', 'VEHICLE', null, 250.00, 'Pace 4 (pulled by horses)'),
('Waterskin', 'Leather container for water. Holds 1 quart.', 'GEAR', 1.0, 0.50, 'Holds 1 quart water')
ON CONFLICT DO NOTHING;
