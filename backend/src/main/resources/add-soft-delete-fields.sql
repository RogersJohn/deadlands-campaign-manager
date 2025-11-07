-- Migration: Add soft delete fields to characters table
-- Date: 2025-11-07
-- Description: Adds deletedAt and deletedBy fields to support soft delete functionality
-- Note: This will be automatically applied by Hibernate ddl-auto=update, but this script
--       is provided for manual execution if needed or for production deployments.

-- Add soft delete timestamp column
ALTER TABLE characters
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Add soft delete user reference column
ALTER TABLE characters
ADD COLUMN IF NOT EXISTS deleted_by BIGINT;

-- Add foreign key constraint to users table
ALTER TABLE characters
ADD CONSTRAINT IF NOT EXISTS fk_characters_deleted_by
FOREIGN KEY (deleted_by) REFERENCES users(id);

-- Create index on deleted_at for query performance
CREATE INDEX IF NOT EXISTS idx_characters_deleted_at ON characters(deleted_at);

-- Add comment to document the soft delete pattern
COMMENT ON COLUMN characters.deleted_at IS 'Timestamp when character was soft-deleted. NULL means not deleted.';
COMMENT ON COLUMN characters.deleted_by IS 'User who deleted the character. Used for audit trail.';
