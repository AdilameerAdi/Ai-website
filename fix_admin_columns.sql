-- Fix system_settings table to match what AdminDashboard expects

-- The AdminDashboard is looking for these specific columns in system_settings:
-- storage_limit_gb, max_file_size_mb, session_timeout_min, backup_frequency, 
-- maintenance_window, onboarding_enabled, alerts_email

-- Add the missing columns that AdminDashboard expects
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='system_settings' AND column_name='storage_limit_gb') THEN
        ALTER TABLE system_settings ADD COLUMN storage_limit_gb INTEGER DEFAULT 5;
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='system_settings' AND column_name='max_file_size_mb') THEN
        ALTER TABLE system_settings ADD COLUMN max_file_size_mb INTEGER DEFAULT 50;
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='system_settings' AND column_name='session_timeout_min') THEN
        ALTER TABLE system_settings ADD COLUMN session_timeout_min INTEGER DEFAULT 60;
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='system_settings' AND column_name='backup_frequency') THEN
        ALTER TABLE system_settings ADD COLUMN backup_frequency VARCHAR(50) DEFAULT 'daily';
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='system_settings' AND column_name='maintenance_window') THEN
        ALTER TABLE system_settings ADD COLUMN maintenance_window VARCHAR(100) DEFAULT '02:00-04:00 UTC';
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='system_settings' AND column_name='onboarding_enabled') THEN
        ALTER TABLE system_settings ADD COLUMN onboarding_enabled BOOLEAN DEFAULT true;
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='system_settings' AND column_name='alerts_email') THEN
        ALTER TABLE system_settings ADD COLUMN alerts_email VARCHAR(255) DEFAULT 'admin@example.com';
    END IF;
END $$;

-- Insert a default system settings row that AdminDashboard can find
INSERT INTO system_settings (
    setting_key, 
    setting_value, 
    storage_limit_gb,
    max_file_size_mb,
    session_timeout_min,
    backup_frequency,
    maintenance_window,
    onboarding_enabled,
    alerts_email,
    description,
    category
) VALUES (
    'admin_settings',
    '{"version": "1.0"}',
    5,
    50,
    60,
    'daily',
    '02:00-04:00 UTC',
    true,
    'admin@example.com',
    'Main admin system settings',
    'admin'
) ON CONFLICT (setting_key) DO UPDATE SET
    storage_limit_gb = 5,
    max_file_size_mb = 50,
    session_timeout_min = 60,
    backup_frequency = 'daily',
    maintenance_window = '02:00-04:00 UTC',
    onboarding_enabled = true,
    alerts_email = 'admin@example.com';

-- Verify the columns exist
SELECT 'System settings columns after fix:' as info;
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'system_settings'
ORDER BY column_name;

-- Verify the data exists
SELECT 'System settings data:' as info;
SELECT id, storage_limit_gb, max_file_size_mb, session_timeout_min, backup_frequency, maintenance_window, onboarding_enabled, alerts_email
FROM system_settings 
WHERE setting_key = 'admin_settings';

SELECT 'Setup completed successfully!' as status;