-- Quick initialization script for production database
-- Run this manually in Railway PostgreSQL console

-- Create users table if not exists
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Insert game master (password is 'password123')
INSERT INTO users (id, username, email, password, role, active, created_at, updated_at)
VALUES (1, 'gamemaster', 'gm@deadlands.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'GAME_MASTER', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert player1 (password is 'password123')
INSERT INTO users (id, username, email, password, role, active, created_at, updated_at)
VALUES (2, 'player1', 'player1@deadlands.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'PLAYER', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
