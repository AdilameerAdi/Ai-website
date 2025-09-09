-- =============================================
-- SAFE DATABASE SETUP FOR AI WEBSITE
-- This script safely creates/updates all tables
-- =============================================

-- =============================================
-- STEP 1: Create missing tables only
-- =============================================

-- Create system_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    category VARCHAR(100),
    is_public BOOLEAN DEFAULT false,
    updated_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    variables JSONB,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leads table if it doesn't exist
CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(255),
    position VARCHAR(255),
    source VARCHAR(100),
    status VARCHAR(50) DEFAULT 'new',
    score INTEGER DEFAULT 0,
    budget DECIMAL(12,2),
    expected_close_date DATE,
    notes TEXT,
    tags TEXT[],
    assigned_to UUID,
    last_contact_date TIMESTAMP WITH TIME ZONE,
    next_follow_up_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    metadata JSONB,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255),
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create proposal_templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS proposal_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_data JSONB NOT NULL,
    is_shared BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STEP 2: Add missing columns to existing tables
-- =============================================

-- Add metadata column to user_activities if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_activities' AND column_name='metadata') THEN
        ALTER TABLE user_activities ADD COLUMN metadata JSONB;
    END IF;
END $$;

-- =============================================
-- STEP 3: Create indexes safely (if not exists)
-- =============================================

-- System settings indexes
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_system_settings_category') THEN
        CREATE INDEX idx_system_settings_category ON system_settings(category);
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_system_settings_is_public') THEN
        CREATE INDEX idx_system_settings_is_public ON system_settings(is_public);
    END IF;
END $$;

-- Email templates indexes
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_email_templates_category') THEN
        CREATE INDEX idx_email_templates_category ON email_templates(category);
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_email_templates_is_active') THEN
        CREATE INDEX idx_email_templates_is_active ON email_templates(is_active);
    END IF;
END $$;

-- Leads indexes
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_leads_email') THEN
        CREATE INDEX idx_leads_email ON leads(email);
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_leads_status') THEN
        CREATE INDEX idx_leads_status ON leads(status);
    END IF;
END $$;

-- Notifications indexes
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_user_id') THEN
        CREATE INDEX idx_notifications_user_id ON notifications(user_id);
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_is_read') THEN
        CREATE INDEX idx_notifications_is_read ON notifications(is_read);
    END IF;
END $$;

-- =============================================
-- STEP 4: Disable RLS on new tables
-- =============================================

ALTER TABLE IF EXISTS system_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS email_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS proposal_templates DISABLE ROW LEVEL SECURITY;

-- =============================================
-- STEP 5: Grant permissions
-- =============================================

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- =============================================
-- STEP 6: Insert initial system settings
-- =============================================

INSERT INTO system_settings (setting_key, setting_value, description, category, is_public) VALUES
('site_title', '"AI Business Platform"', 'Main site title', 'general', true),
('site_description', '"Complete business management platform"', 'Site description', 'general', true),
('max_file_size', '52428800', 'Maximum file upload size in bytes', 'files', false),
('allowed_file_types', '["pdf", "doc", "docx", "txt", "jpg", "jpeg", "png"]', 'Allowed file types', 'files', false),
('email_notifications_enabled', 'true', 'Enable email notifications', 'notifications', false),
('maintenance_mode', 'false', 'Enable maintenance mode', 'system', false),
('registration_enabled', 'true', 'Allow new registrations', 'auth', false),
('default_storage_limit', '5368709120', 'Default storage limit (5GB)', 'users', false),
('storage_limit_gb', '5', 'Default storage limit in GB', 'system', false),
('max_file_size_mb', '50', 'Max file size in MB', 'system', false),
('session_timeout_min', '60', 'Session timeout in minutes', 'system', false),
('backup_frequency', '"daily"', 'Backup frequency', 'system', false),
('maintenance_window', '"02:00-04:00"', 'Maintenance window', 'system', false),
('onboarding_enabled', 'true', 'Enable user onboarding', 'system', false),
('alerts_email', '"admin@example.com"', 'Admin alerts email', 'system', false)
ON CONFLICT (setting_key) DO NOTHING;

-- =============================================
-- STEP 7: Insert email templates
-- =============================================

INSERT INTO email_templates (name, subject, body_html, body_text, category, is_active) VALUES
('welcome_email', 'Welcome to AI Business Platform', '<h1>Welcome!</h1><p>Thank you for joining our platform.</p>', 'Welcome! Thank you for joining our platform.', 'auth', true),
('proposal_created', 'New Proposal Created', '<h1>Proposal Created</h1><p>Your proposal has been successfully created.</p>', 'Proposal Created. Your proposal has been successfully created.', 'proposals', true),
('ticket_created', 'Support Ticket Created', '<h1>Support Ticket Created</h1><p>We have received your support request.</p>', 'Support Ticket Created. We have received your support request.', 'support', true)
ON CONFLICT DO NOTHING;

-- =============================================
-- STEP 8: Verification
-- =============================================

SELECT 'Safe database setup completed successfully!' as status;

-- Show all tables
SELECT 'Current tables:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Verify system_settings table has data
SELECT 'System settings count:' as info;
SELECT COUNT(*) as settings_count FROM system_settings;

-- Verify user_activities has metadata column
SELECT 'User activities columns:' as info;
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'user_activities'
ORDER BY column_name;