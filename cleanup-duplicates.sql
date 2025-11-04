-- Cleanup script to remove duplicate character data
-- This script keeps the first (oldest) row and deletes duplicates

-- Clean duplicate skills
DELETE FROM skills
WHERE id NOT IN (
    SELECT MIN(id)
    FROM skills
    GROUP BY character_id, name, die_value, category
);

-- Clean duplicate edges
DELETE FROM edges
WHERE id NOT IN (
    SELECT MIN(id)
    FROM edges
    GROUP BY character_id, name, COALESCE(edge_reference_id, 0), COALESCE(type, 'BACKGROUND')
);

-- Clean duplicate hindrances
DELETE FROM hindrances
WHERE id NOT IN (
    SELECT MIN(id)
    FROM hindrances
    GROUP BY character_id, name, COALESCE(hindrance_reference_id, 0), COALESCE(severity, 'MINOR')
);

-- Clean duplicate equipment
DELETE FROM equipment
WHERE id NOT IN (
    SELECT MIN(id)
    FROM equipment
    GROUP BY character_id, name, COALESCE(equipment_type, 'OTHER')
);

-- Clean duplicate arcane_powers
DELETE FROM arcane_powers
WHERE id NOT IN (
    SELECT MIN(id)
    FROM arcane_powers
    GROUP BY character_id, name
);

-- Clean duplicate wounds
DELETE FROM wounds
WHERE id NOT IN (
    SELECT MIN(id)
    FROM wounds
    GROUP BY character_id, location, severity, COALESCE(is_healed, false)
);

-- Verify cleanup
SELECT 'Skills' as table_name, COUNT(*) as remaining_count FROM skills WHERE character_id = 1
UNION ALL
SELECT 'Edges', COUNT(*) FROM edges WHERE character_id = 1
UNION ALL
SELECT 'Hindrances', COUNT(*) FROM hindrances WHERE character_id = 1
UNION ALL
SELECT 'Equipment', COUNT(*) FROM equipment WHERE character_id = 1
UNION ALL
SELECT 'Arcane Powers', COUNT(*) FROM arcane_powers WHERE character_id = 1
UNION ALL
SELECT 'Wounds', COUNT(*) FROM wounds WHERE character_id = 1;
