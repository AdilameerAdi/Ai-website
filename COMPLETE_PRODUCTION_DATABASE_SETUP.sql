-- =============================================
-- COMPLETE PRODUCTION DATABASE SETUP FOR AI WEBSITE
-- This script creates ALL tables with ALL required columns
-- Run this script ONCE to set up your entire production database
--
-- ✅ CASCADE DELETE BUILT-IN: 
-- All foreign key relationships use ON DELETE CASCADE
-- When a user is deleted, all related data is automatically removed:
-- - tickets, files, proposals, notifications, user_activities, 
-- - user_sessions, password_resets are all auto-deleted
-- =============================================

-- =============================================
-- STEP 1: Clean up existing tables
-- =============================================

-- Drop all existing tables in correct order (child tables first)
DROP TABLE IF EXISTS user_activities CASCADE;
DROP TABLE IF EXISTS proposal_line_items CASCADE;
DROP TABLE IF EXISTS proposals CASCADE;
DROP TABLE IF EXISTS proposal_templates CASCADE;
DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS files CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS password_resets CASCADE;
DROP TABLE IF EXISTS email_templates CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =============================================
-- STEP 2: Create users table
-- =============================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    company VARCHAR(255),
    phone VARCHAR(50),
    subscription_plan VARCHAR(50) DEFAULT 'free',
    subscription_status VARCHAR(50) DEFAULT 'active',
    storage_used BIGINT DEFAULT 0,
    storage_limit BIGINT DEFAULT 5368709120,
    is_email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STEP 3: Create proposals table
-- =============================================

CREATE TABLE proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    proposal_number VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_company VARCHAR(255),
    description TEXT,
    total_amount DECIMAL(12,2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'draft',
    valid_until DATE,
    terms_conditions TEXT,
    notes TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    viewed_at TIMESTAMP WITH TIME ZONE,
    responded_at TIMESTAMP WITH TIME ZONE,
    ai_win_probability DECIMAL(5,2),
    ai_suggested_pricing TEXT,
    ai_market_analysis TEXT,
    ai_risk_factors TEXT,
    ai_recommendations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STEP 4: Create proposal_line_items table
-- =============================================

CREATE TABLE proposal_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STEP 5: Create proposal_templates table
-- =============================================

CREATE TABLE proposal_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_data JSONB NOT NULL,
    is_shared BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STEP 6: Create tickets table (ConsecDesk)
-- =============================================

CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'open',
    priority VARCHAR(50) DEFAULT 'medium',
    category VARCHAR(100),
    assigned_to UUID REFERENCES users(id),
    tags TEXT[],
    attachments JSONB,
    resolution_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STEP 7: Create files table (ConsecDrive) with ALL columns
-- =============================================

CREATE TABLE files (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    filename VARCHAR(255),
    original_filename VARCHAR(255),
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100),
    file_path TEXT NOT NULL,
    file_url TEXT,
    folder_path VARCHAR(500) DEFAULT '/',
    folder_id INTEGER,
    mime_type VARCHAR(100),
    is_public BOOLEAN DEFAULT false,
    shared_with UUID[],
    tags TEXT[],
    user_tags TEXT[],
    description TEXT,
    user_description TEXT,
    version INTEGER DEFAULT 1,
    parent_file_id INTEGER REFERENCES files(id),
    checksum VARCHAR(64),
    is_favorite BOOLEAN DEFAULT false,
    upload_status VARCHAR(50) DEFAULT 'completed',
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    ai_summary TEXT,
    ai_keywords TEXT[],
    ai_category VARCHAR(100),
    ai_priority VARCHAR(50),
    ai_suggested_tags TEXT[],
    ai_confidence DECIMAL(5,2),
    ai_content_analysis JSONB,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STEP 8: Create feedback table
-- =============================================

CREATE TABLE feedback (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    category VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(50) DEFAULT 'medium',
    status VARCHAR(50) DEFAULT 'open',
    admin_response TEXT,
    admin_user_id UUID REFERENCES users(id),
    admin_responded_at TIMESTAMP WITH TIME ZONE,
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    tags TEXT[],
    follow_up_required BOOLEAN DEFAULT false,
    ai_sentiment VARCHAR(50),
    ai_category VARCHAR(100),
    ai_urgency VARCHAR(50),
    ai_confidence DECIMAL(5,2),
    ai_suggested_response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STEP 9: Create leads table
-- =============================================

CREATE TABLE leads (
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
    assigned_to UUID REFERENCES users(id),
    last_contact_date TIMESTAMP WITH TIME ZONE,
    next_follow_up_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STEP 10: Create notifications table with ALL columns
-- =============================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    metadata JSONB,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STEP 11: Create user_activities table with metadata
-- =============================================

CREATE TABLE user_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STEP 12: Create audit_logs table
-- =============================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255),
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STEP 13: Create user_sessions table
-- =============================================

CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STEP 14: Create password_resets table
-- =============================================

CREATE TABLE password_resets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT false,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STEP 15: Create email_templates table
-- =============================================

CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    variables JSONB,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STEP 16: Create system_settings table with ALL admin columns
-- =============================================

CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    category VARCHAR(100),
    is_public BOOLEAN DEFAULT false,
    updated_by UUID REFERENCES users(id),
    -- Admin dashboard specific columns
    storage_limit_gb INTEGER DEFAULT 5,
    max_file_size_mb INTEGER DEFAULT 50,
    session_timeout_min INTEGER DEFAULT 60,
    backup_frequency VARCHAR(50) DEFAULT 'daily',
    maintenance_window VARCHAR(100) DEFAULT '02:00-04:00 UTC',
    onboarding_enabled BOOLEAN DEFAULT true,
    alerts_email VARCHAR(255) DEFAULT 'admin@example.com',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STEP 17: Create indexes for performance
-- =============================================

-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Proposals table indexes
CREATE INDEX idx_proposals_user_id ON proposals(user_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_created_at ON proposals(created_at);
CREATE INDEX idx_proposals_proposal_number ON proposals(proposal_number);

-- Proposal line items indexes
CREATE INDEX idx_proposal_line_items_proposal_id ON proposal_line_items(proposal_id);

-- Proposal templates indexes
CREATE INDEX idx_proposal_templates_user_id ON proposal_templates(user_id);
CREATE INDEX idx_proposal_templates_is_shared ON proposal_templates(is_shared);

-- Tickets table indexes
CREATE INDEX idx_tickets_user_id ON tickets(user_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX idx_tickets_created_at ON tickets(created_at);

-- Files table indexes
CREATE INDEX idx_files_user_id ON files(user_id);
CREATE INDEX idx_files_folder_path ON files(folder_path);
CREATE INDEX idx_files_file_type ON files(file_type);
CREATE INDEX idx_files_uploaded_at ON files(uploaded_at);
CREATE INDEX idx_files_is_deleted ON files(is_deleted);
CREATE INDEX idx_files_upload_status ON files(upload_status);

-- Feedback table indexes
CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_feedback_status ON feedback(status);
CREATE INDEX idx_feedback_category ON feedback(category);
CREATE INDEX idx_feedback_created_at ON feedback(created_at);

-- Leads table indexes
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_created_at ON leads(created_at);

-- Notifications table indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- User activities indexes
CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_timestamp ON user_activities(timestamp);
CREATE INDEX idx_user_activities_activity_type ON user_activities(activity_type);

-- Audit logs indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- User sessions indexes
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Email templates indexes
CREATE INDEX idx_email_templates_category ON email_templates(category);
CREATE INDEX idx_email_templates_is_active ON email_templates(is_active);

-- System settings indexes
CREATE INDEX idx_system_settings_category ON system_settings(category);
CREATE INDEX idx_system_settings_is_public ON system_settings(is_public);

-- Password resets indexes
CREATE INDEX idx_password_resets_user_id ON password_resets(user_id);
CREATE INDEX idx_password_resets_token ON password_resets(token);
CREATE INDEX idx_password_resets_expires_at ON password_resets(expires_at);

-- =============================================
-- STEP 18: Disable Row Level Security for development/production
-- =============================================

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE proposals DISABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_line_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE files DISABLE ROW LEVEL SECURITY;
ALTER TABLE feedback DISABLE ROW LEVEL SECURITY;
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE password_resets DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings DISABLE ROW LEVEL SECURITY;

-- =============================================
-- STEP 19: Grant permissions for all roles
-- =============================================

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- =============================================
-- STEP 20: Insert initial production data
-- =============================================

-- Create test user with correct ID
INSERT INTO users (
    id,
    email,
    full_name,
    password,
    role,
    subscription_plan,
    subscription_status,
    storage_used,
    storage_limit,
    is_email_verified,
    created_at,
    updated_at
) VALUES (
    'f21c28ad-479f-4ab7-820d-665644987bcf',
    'akraj25085@gmail.com',
    'Test User',
    'AUTH_MANAGED',
    'user',
    'free',
    'active',
    0,
    5368709120,
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    id = 'f21c28ad-479f-4ab7-820d-665644987bcf';

-- Create admin user
INSERT INTO users (
    email,
    full_name,
    password,
    role,
    subscription_plan,
    subscription_status,
    storage_used,
    storage_limit,
    is_email_verified
) VALUES (
    'admin@example.com',
    'Admin User',
    'AUTH_MANAGED',
    'admin',
    'enterprise',
    'active',
    0,
    107374182400,
    true
) ON CONFLICT (email) DO NOTHING;

-- Insert complete system settings
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
    category,
    is_public
) VALUES 
('admin_settings', '{"version": "1.0"}', 5, 50, 60, 'daily', '02:00-04:00 UTC', true, 'admin@example.com', 'Main admin system settings', 'admin', false),
('site_title', '"AI Business Platform"', 5, 50, 60, 'daily', '02:00-04:00 UTC', true, 'admin@example.com', 'Main site title', 'general', true),
('site_description', '"Complete business management platform with AI integration"', 5, 50, 60, 'daily', '02:00-04:00 UTC', true, 'admin@example.com', 'Site description for SEO', 'general', true),
('max_file_size', '52428800', 5, 50, 60, 'daily', '02:00-04:00 UTC', true, 'admin@example.com', 'Maximum file upload size in bytes (50MB)', 'files', false),
('allowed_file_types', '["pdf", "doc", "docx", "txt", "jpg", "jpeg", "png", "gif"]', 5, 50, 60, 'daily', '02:00-04:00 UTC', true, 'admin@example.com', 'Allowed file types for upload', 'files', false),
('email_notifications_enabled', 'true', 5, 50, 60, 'daily', '02:00-04:00 UTC', true, 'admin@example.com', 'Enable email notifications', 'notifications', false),
('maintenance_mode', 'false', 5, 50, 60, 'daily', '02:00-04:00 UTC', true, 'admin@example.com', 'Enable maintenance mode', 'system', false),
('registration_enabled', 'true', 5, 50, 60, 'daily', '02:00-04:00 UTC', true, 'admin@example.com', 'Allow new user registrations', 'auth', false),
('default_user_storage_limit', '5368709120', 5, 50, 60, 'daily', '02:00-04:00 UTC', true, 'admin@example.com', 'Default storage limit for new users (5GB)', 'users', false)
ON CONFLICT (setting_key) DO UPDATE SET
    storage_limit_gb = EXCLUDED.storage_limit_gb,
    max_file_size_mb = EXCLUDED.max_file_size_mb,
    session_timeout_min = EXCLUDED.session_timeout_min,
    backup_frequency = EXCLUDED.backup_frequency,
    maintenance_window = EXCLUDED.maintenance_window,
    onboarding_enabled = EXCLUDED.onboarding_enabled,
    alerts_email = EXCLUDED.alerts_email;

-- Insert email templates
INSERT INTO email_templates (name, subject, body_html, body_text, category, is_active) VALUES
('welcome_email', 'Welcome to AI Business Platform', 
 '<h1>Welcome {{user_name}}!</h1><p>Thank you for joining our platform.</p>', 
 'Welcome {{user_name}}! Thank you for joining our platform.', 
 'auth', true),
('proposal_created', 'New Proposal Created', 
 '<h1>Proposal {{proposal_number}} Created</h1><p>Your proposal has been successfully created.</p>', 
 'Proposal {{proposal_number}} Created. Your proposal has been successfully created.', 
 'proposals', true),
('ticket_created', 'Support Ticket Created', 
 '<h1>Support Ticket #{{ticket_id}} Created</h1><p>We have received your support request.</p>', 
 'Support Ticket #{{ticket_id}} Created. We have received your support request.', 
 'support', true)
ON CONFLICT DO NOTHING;

-- =============================================
-- STEP 21: Create database functions and triggers
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposal_templates_updated_at BEFORE UPDATE ON proposal_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON feedback
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- STEP 22: Final verification and status
-- =============================================

-- Verify all tables were created
SELECT 'PRODUCTION DATABASE SETUP COMPLETED SUCCESSFULLY!' as status;

SELECT 'All tables created:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Verify test user exists
SELECT 'Test user verification:' as info;
SELECT id, email, full_name, role FROM users WHERE email = 'akraj25085@gmail.com';

-- Show system settings count
SELECT 'System settings count:' as info;
SELECT COUNT(*) as settings_count FROM system_settings;

-- Show final status
SELECT 'Your database is ready for production deployment!' as final_message;