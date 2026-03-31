-- Migration: Add global shared devices table
-- This allows devices to be shared across all dorms while keeping usage logs separate

-- Enable PostgreSQL trigram extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create global devices table (shared across all users/dorms)
CREATE TABLE IF NOT EXISTS global_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  watt INTEGER NOT NULL,
  category VARCHAR(100),
  normalized_name TEXT GENERATED ALWAYS AS (LOWER(TRIM(name))) STORED,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  usage_count INTEGER DEFAULT 0,
  user_count INTEGER DEFAULT 0
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_global_devices_name ON global_devices(name);
CREATE INDEX IF NOT EXISTS idx_global_devices_normalized_name ON global_devices(normalized_name);
CREATE INDEX IF NOT EXISTS idx_global_devices_category ON global_devices(category);
CREATE INDEX IF NOT EXISTS idx_global_devices_usage_count ON global_devices(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_global_devices_user_count ON global_devices(user_count DESC);

-- GIN index for fuzzy search (Google-like search)
CREATE INDEX IF NOT EXISTS idx_global_devices_name_trgm 
ON global_devices USING gin (name gin_trgm_ops);

-- Migrate existing user devices to global devices
-- Count distinct users (not usage logs) for accurate user_count
INSERT INTO global_devices (name, watt, created_by, usage_count, user_count)
SELECT DISTINCT ON (LOWER(TRIM(d.name)), d.watt)
  d.name,
  d.watt,
  d.user_id as created_by,
  COUNT(DISTINCT u.id) as usage_count,
  COUNT(DISTINCT d.user_id) as user_count
FROM devices d
LEFT JOIN usages u ON d.id = u.device_id
GROUP BY LOWER(TRIM(d.name)), d.watt, d.name, d.user_id
ON CONFLICT (normalized_name, watt) DO UPDATE SET
  usage_count = global_devices.usage_count + EXCLUDED.usage_count,
  user_count = GREATEST(global_devices.user_count, EXCLUDED.user_count),
  created_by = COALESCE(global_devices.created_by, EXCLUDED.created_by);

-- Add reference column to link user devices to global devices
ALTER TABLE devices 
ADD COLUMN IF NOT EXISTS global_device_id UUID REFERENCES global_devices(id) ON DELETE SET NULL;

-- Update existing devices to link to their global counterparts
UPDATE devices d
SET global_device_id = gd.id
FROM global_devices gd
WHERE LOWER(TRIM(d.name)) = gd.normalized_name AND d.watt = gd.watt;

-- Add unique constraint on normalized name + watt to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_global_device 
ON global_devices(normalized_name, watt);

-- Add comment for documentation
COMMENT ON COLUMN global_devices.normalized_name IS 'Auto-generated lowercase trimmed name for duplicate detection';
COMMENT ON COLUMN global_devices.user_count IS 'Number of distinct users using this device';
COMMENT ON COLUMN global_devices.usage_count IS 'Total number of usage logs for this device';
