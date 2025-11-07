# Character Import Guide

This guide explains how to import your existing character sheets into the database.

## Characters to be Imported

The following 7 characters from your campaign have been extracted and prepared for import:

1. **Mexicali Bob** - Apprentice Shaman (Mexican heritage, martial artist)
2. **Cornelius Wilberforce III** - Scholar (Aristocrat with mad science)
3. **Doc Emett Von Braun** - Mad Scientist (Year 1863, creates devices)
4. **John Henry Farraday** - Doctor/Hexslinger (Medical skills with hexes)
5. **Jack Horner** - Old Geezer Prospector (Limping old-timer)
6. **Lucas Turner** - Gunslinger/Marshal (Law of the West)
7. **George C Dobbs** - Character sheet incomplete

## What's Included in the Import

Each character includes:

- **Basic Info**: Name, occupation
- **8 Core Attributes**: Cognition, Deftness, Nimbleness, Quickness, Smarts, Spirit, Strength, Vigor
- **Derived Stats**: Pace, Size, Wind, Grit
- **Skills**: All skills with die values and categories
- **Edges**: Character advantages and special abilities
- **Hindrances**: Character disadvantages
- **Equipment**: Weapons, gear, and items
- **Arcane Powers**: Hexes, spells, and supernatural abilities (where applicable)
- **Notes**: Special character notes and backstory elements

## Default User Accounts

The import creates 6 user accounts:

| Username | Email | Password | Role |
|----------|-------|----------|------|
| gamemaster | gm@deadlands.com | password123 | GAME_MASTER |
| player1 | player1@deadlands.com | password123 | PLAYER |
| player2 | player2@deadlands.com | password123 | PLAYER |
| player3 | player3@deadlands.com | password123 | PLAYER |
| player4 | player4@deadlands.com | password123 | PLAYER |
| player5 | player5@deadlands.com | password123 | PLAYER |
| player6 | player6@deadlands.com | password123 | PLAYER |

**IMPORTANT:** Change these passwords immediately after first login!

## Character Assignment

Characters are initially assigned to players as follows:

- **player1**: (Reserved for assignment)
- **player2**: Mexicali Bob, Lucas Turner
- **player3**: Cornelius Wilberforce III, George C Dobbs
- **player4**: Doc Emett Von Braun
- **player5**: John Henry Farraday
- **player6**: Jack Horner

You can reassign characters through the database or admin interface.

## Import Methods

### Method 1: Automatic Import (Recommended)

The `data.sql` file will automatically run when you start the application for the first time with an empty database.

**Steps:**

1. Ensure your PostgreSQL database is running
2. Start the Spring Boot application:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
3. Characters will be imported automatically
4. Login with any of the user accounts above

### Method 2: Manual SQL Import

If you need to manually import or re-import:

```bash
psql -U deadlands -d deadlands -f backend/src/main/resources/data.sql
```

### Method 3: Using pgAdmin

1. Open pgAdmin
2. Connect to your `deadlands` database
3. Tools → Query Tool
4. Open file `backend/src/main/resources/data.sql`
5. Execute (F5)

## Verification

After import, verify the data:

```sql
-- Check users
SELECT username, role FROM users;

-- Check characters
SELECT name, occupation FROM characters;

-- Check total skills imported
SELECT c.name, COUNT(s.id) as skill_count
FROM characters c
LEFT JOIN skills s ON c.id = s.character_id
GROUP BY c.name;

-- Check edges
SELECT c.name, COUNT(e.id) as edge_count
FROM characters c
LEFT JOIN edges e ON c.id = e.character_id
GROUP BY c.name;
```

Expected results:
- 6 users (1 GM + 5 players)
- 7 characters
- Mexicali Bob: ~35 skills, ~9 edges, 6 arcane powers
- Cornelius: ~40 skills, ~6 edges
- Doc Von Braun: ~40 skills, ~7 edges
- Doc Farraday: ~30 skills, ~7 edges, 10 arcane powers
- Jack Horner: ~20 skills, ~2 edges, ~3 hindrances
- Lucas Turner: Basic data with edges
- George Dobbs: Basic data only

## Login to Web Interface

After successful import:

1. Start the backend (if not already running):
   ```bash
   cd backend
   mvn spring-boot:run
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Navigate to http://localhost:3000

4. Login with:
   - Username: `gamemaster` (to see all characters)
   - Password: `password123`

5. Or login as a player to see only their assigned characters

## Updating Character Data

### Via SQL

You can update characters directly:

```sql
-- Update character attributes
UPDATE characters
SET cognition_die = '4d6', wind = 15
WHERE name = 'Mexicali Bob';

-- Add a new skill
INSERT INTO skills (character_id, name, die_value, category)
VALUES (1, 'Swimming', '2d6', 'VIGOR');

-- Update equipment
UPDATE equipment
SET damage = '3d8'
WHERE character_id = 1 AND name = 'Colt Army';
```

### Via API (Future)

Once the frontend character editor is complete, you'll be able to update characters through the web interface.

## Troubleshooting

### Characters not appearing

```sql
-- Check if data was imported
SELECT COUNT(*) FROM characters;

-- If zero, run the import manually
```

### Duplicate key errors

The import script uses `ON CONFLICT DO NOTHING` to prevent duplicates. If you need to re-import:

```sql
-- Clear existing data (WARNING: This deletes everything!)
TRUNCATE TABLE wounds, arcane_powers, equipment, hindrances, edges, skills, characters, users RESTART IDENTITY CASCADE;

-- Then re-run the import
```

### Password doesn't work

The default password is `password123`. Make sure there are no typos. The password hash in the database is BCrypt encoded.

To reset a password:

```sql
-- Reset to 'password123'
UPDATE users
SET password = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE username = 'gamemaster';
```

## Character Data Quality Notes

### Complete Character Sheets
- **Mexicali Bob**: Fully detailed with martial arts abilities
- **Cornelius Wilberforce III**: Complete with extensive skills
- **Doc Emett Von Braun**: Full mad scientist with equipment
- **Doc Farraday**: Complete hexslinger with 10 arcane powers

### Partial Character Sheets
- **Jack Horner**: Core stats and some skills, backstory included
- **Lucas Turner**: Core edges and hindrances, skills need completion
- **George C Dobbs**: Minimal data, requires manual completion

## Next Steps

1. **Change all passwords** via SQL or admin interface
2. **Assign characters to actual player accounts**
3. **Review and update incomplete character sheets** (Lucas Turner, George Dobbs)
4. **Add missing equipment** from character sheet images
5. **Upload character portraits** (feature pending)
6. **Add session notes and campaign background** to wiki (feature pending)

## Adding New Characters

To add a new character, either:

1. **Use the web interface** (once character creation form is complete)
2. **Manually insert via SQL** following the pattern in `data.sql`

Example for new character:

```sql
-- Insert character
INSERT INTO characters (name, occupation, player_id, cognition_die, deftness_die, /* ... */)
VALUES ('New Character', 'Gunslinger', 2, '2d6', '3d8', /* ... */);

-- Add skills
INSERT INTO skills (character_id, name, die_value, category)
VALUES (8, 'Shootin''', '4d10', 'DEFTNESS');

-- Add edges
INSERT INTO edges (character_id, name, description, type)
VALUES (8, 'Quick Draw', 'Fast on the draw', 'COMBAT');
```

## Support

If you encounter issues with the character import:

1. Check the Spring Boot logs for errors
2. Verify PostgreSQL connection
3. Ensure database schema is created (run migrations)
4. Check for SQL syntax errors in logs

## Data Source

All character data was extracted from the JPG images in the `Character Sheets` directory:
- Mexicali Bob (3 pages)
- Cornelius Wilberforce III (2 pages)
- Doc Emett Von Braun (2 pages)
- John Henry Farraday (2 pages + hexes)
- Jack Horner (3 pages including backstory)
- Lucas Turner (1 page)
- George C Dobbs (1 page)
