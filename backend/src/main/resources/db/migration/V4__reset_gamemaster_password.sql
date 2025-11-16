-- Reset gamemaster password to Test123!
-- This allows access to existing sessions created by the gamemaster user

-- BCrypt hash for password: Test123!
UPDATE users
SET password = '$2b$10$vpsGaYHG6Jr3asKLG3jWz.ciJ.xnE7qALcnNNP/Wm8T2HdvFfPLPe',
    updated_at = NOW()
WHERE username = 'gamemaster';

-- Verify the gamemaster account is active and has correct role
UPDATE users
SET active = true,
    role = 'GAME_MASTER'
WHERE username = 'gamemaster';
