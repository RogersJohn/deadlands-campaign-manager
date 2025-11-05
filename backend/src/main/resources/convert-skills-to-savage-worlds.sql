-- Convert all character skills from Deadlands Classic (XdY) to Savage Worlds (dY) format
-- Conversion logic based on skill proficiency:
--   Deadlands Classic → Savage Worlds
--   1d4, 1d6         → d4  (minimal training)
--   1d8, 1d10, 2d6   → d6  (trained)
--   1d12, 2d8, 2d10, 3d6 → d8 (good)
--   2d12, 3d8, 3d10, 4d6 → d10 (very good)
--   3d12+, 4d8+, 4d10+, 5d6+ → d12 (expert)

-- Minimal training (d4)
UPDATE skills SET die_value = 'd4' WHERE die_value IN ('1d4', '1d6');

-- Trained (d6)
UPDATE skills SET die_value = 'd6' WHERE die_value IN ('1d8', '1d10', '2d6');

-- Good (d8)
UPDATE skills SET die_value = 'd8' WHERE die_value IN ('1d12', '2d8', '2d10', '3d6');

-- Very good (d10)
UPDATE skills SET die_value = 'd10' WHERE die_value IN ('2d12', '3d8', '3d10', '4d6', '4d8');

-- Expert (d12)
UPDATE skills SET die_value = 'd12' WHERE die_value IN ('3d12', '4d10', '4d12', '5d6', '5d8', '5d10', '5d12');

-- Summary of conversions
SELECT
    'Converted ' || COUNT(*) || ' skills to Savage Worlds format' as summary
FROM skills
WHERE die_value IN ('d4', 'd6', 'd8', 'd10', 'd12');

-- Show distribution
SELECT
    die_value,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) || '%' as percentage
FROM skills
WHERE die_value IN ('d4', 'd6', 'd8', 'd10', 'd12')
GROUP BY die_value
ORDER BY
    CASE die_value
        WHEN 'd4' THEN 1
        WHEN 'd6' THEN 2
        WHEN 'd8' THEN 3
        WHEN 'd10' THEN 4
        WHEN 'd12' THEN 5
    END;
