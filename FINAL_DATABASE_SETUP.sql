-- FINAL DATABASE SETUP FOR AI WEBSITE
-- This script sets up all tables with proper structure and constraints
-- Run this script once to set up your database completely

-- =============================================
-- STEP 1: Clean up existing tables and policies
-- =============================================

-- Drop existing tables in correct order (child tables first)
DROP TABLE IF EXISTS user_activities CASCADE;
DROP TABLE IF EXISTS proposal_line_items CASCADE;
DROP TABLE IF EXISTS proposals CASCADE;
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
-- STEP 5: Create user_activities table
-- =============================================

CREATE TABLE user_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STEP 6: Create indexes for performance
-- =============================================

CREATE INDEX idx_proposals_user_id ON proposals(user_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_created_at ON proposals(created_at);
CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_timestamp ON user_activities(timestamp);
CREATE INDEX idx_proposal_line_items_proposal_id ON proposal_line_items(proposal_id);

-- =============================================
-- STEP 7: Disable Row Level Security for development
-- =============================================

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE proposals DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_line_items DISABLE ROW LEVEL SECURITY;

-- =============================================
-- STEP 8: Grant permissions for all roles
-- =============================================

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- =============================================
-- STEP 9: Create initial user for testing
-- =============================================

-- Insert a test user with the ID that matches your auth system
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

-- =============================================
-- STEP 10: Verification
-- =============================================

-- Verify tables were created
SELECT 'Tables created successfully!' as message;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('users', 'proposals', 'proposal_line_items', 'user_activities')
ORDER BY table_name;

-- Verify test user exists
SELECT 'Test user verification:' as message;
SELECT id, email, full_name, role FROM users WHERE email = 'akraj25085@gmail.com';

-- Show final status
SELECT 'Database setup completed successfully!' as status;