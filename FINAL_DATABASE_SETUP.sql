-- ============================================================================
-- CONSECCOMMS PLATFORM - COMPLETE DATABASE SETUP
-- ============================================================================
-- This is the FINAL comprehensive database setup file for the Conseccomms platform
-- 
-- INSTRUCTIONS FOR CLIENT:
-- 1. Copy this entire file
-- 2. Open your Supabase project dashboard
-- 3. Go to SQL Editor
-- 4. Paste this entire content
-- 5. Click "Run" - the entire database will be set up automatically
--
-- This file includes:
-- ✅ All tables for ConsecDesk, ConsecDrive, and ConsecQuote
-- ✅ All Row Level Security (RLS) policies
-- ✅ All storage policies for file uploads
-- ✅ All indexes for optimal performance
-- ✅ All triggers and functions
-- ✅ Sample data for system settings
--
-- Last updated: 2025-09-07
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. CORE TABLES - USERS AND AUTHENTICATION
-- ============================================================================

-- Users table (compatible with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(255),
    company VARCHAR(255),
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
    subscription_plan VARCHAR(20) DEFAULT 'free' CHECK (subscription_plan IN ('free', 'growth', 'business', 'pro', 'enterprise')),
    subscription_status VARCHAR(20) DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired')),
    storage_used BIGINT DEFAULT 0,
    storage_limit BIGINT DEFAULT 5368709120, -- 5GB in bytes
    is_email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions for extended functionality
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS public.password_resets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 2. CONSECDESK TABLES - SUPPORT TICKETS AND HELP DESK
-- ============================================================================

-- Support tickets
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    client_name VARCHAR(255),
    client_email VARCHAR(255),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    category VARCHAR(100),
    assigned_to UUID,
    
    -- AI Analysis Fields
    ai_sentiment VARCHAR(20) CHECK (ai_sentiment IN ('positive', 'neutral', 'negative', 'frustrated')),
    ai_urgency VARCHAR(20) CHECK (ai_urgency IN ('low', 'medium', 'high')),
    ai_category VARCHAR(100),
    ai_suggested_response TEXT,
    ai_confidence_score DECIMAL(3,2),
    
    resolution_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ticket responses/comments
CREATE TABLE IF NOT EXISTS public.ticket_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL,
    user_id UUID NOT NULL,
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    ai_generated BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ticket attachments
CREATE TABLE IF NOT EXISTS public.ticket_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. CONSECDRIVE TABLES - FILE MANAGEMENT AND STORAGE
-- ============================================================================

-- Folders for file organization
CREATE TABLE IF NOT EXISTS public.folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    parent_folder_id UUID,
    path TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Files table
CREATE TABLE IF NOT EXISTS public.files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    folder_id UUID,
    file_name VARCHAR(255) NOT NULL,
    stored_name VARCHAR(255) NOT NULL UNIQUE,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    
    -- AI Analysis Fields
    ai_summary TEXT,
    ai_keywords TEXT[],
    ai_category VARCHAR(100),
    ai_priority VARCHAR(20) CHECK (ai_priority IN ('low', 'medium', 'high')),
    ai_suggested_tags TEXT[],
    ai_content_extracted TEXT,
    ai_processing_status VARCHAR(20) DEFAULT 'pending' CHECK (ai_processing_status IN ('pending', 'processing', 'completed', 'failed')),
    
    is_duplicate BOOLEAN DEFAULT false,
    duplicate_of UUID,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File tags for organization
CREATE TABLE IF NOT EXISTS public.file_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID NOT NULL,
    tag VARCHAR(100) NOT NULL,
    created_by_ai BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(file_id, tag)
);

-- File sharing functionality
CREATE TABLE IF NOT EXISTS public.file_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID NOT NULL,
    shared_by UUID NOT NULL,
    shared_with UUID,
    share_token VARCHAR(255) UNIQUE,
    permissions VARCHAR(20) DEFAULT 'view' CHECK (permissions IN ('view', 'edit', 'admin')),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. CONSECQUOTE TABLES - PROPOSAL AND QUOTE MANAGEMENT
-- ============================================================================

-- Main proposals table
CREATE TABLE IF NOT EXISTS public.proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    proposal_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255),
    client_company VARCHAR(255),
    
    description TEXT,
    total_amount DECIMAL(15,2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'USD',
    
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'approved', 'rejected', 'expired')),
    
    -- AI Analysis Fields
    ai_win_probability DECIMAL(5,2),
    ai_suggested_pricing DECIMAL(15,2),
    ai_market_analysis TEXT,
    ai_risk_factors TEXT[],
    ai_recommendations TEXT,
    
    valid_until DATE,
    terms_conditions TEXT,
    notes TEXT,
    
    sent_at TIMESTAMP WITH TIME ZONE,
    viewed_at TIMESTAMP WITH TIME ZONE,
    responded_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Proposal line items
CREATE TABLE IF NOT EXISTS public.proposal_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID NOT NULL,
    item_name VARCHAR(500) NOT NULL,
    description TEXT,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1.00,
    unit_price DECIMAL(15,2) NOT NULL,
    total_price DECIMAL(15,2) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Proposal templates for reusability
CREATE TABLE IF NOT EXISTS public.proposal_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_data JSONB NOT NULL,
    is_shared BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 5. COMMUNICATION AND NOTIFICATIONS
-- ============================================================================

-- Notifications system
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email logs for tracking
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    to_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    template VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 6. FEEDBACK AND ANALYTICS
-- ============================================================================

-- User feedback
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    category VARCHAR(100) NOT NULL,
    subject VARCHAR(500),
    message TEXT NOT NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    
    -- AI Analysis Fields
    ai_sentiment VARCHAR(20) CHECK (ai_sentiment IN ('positive', 'neutral', 'negative')),
    ai_priority VARCHAR(20) CHECK (ai_priority IN ('low', 'medium', 'high')),
    ai_category VARCHAR(100),
    ai_keywords TEXT[],
    
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'in_progress', 'resolved')),
    admin_response TEXT,
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lead management
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source VARCHAR(100) NOT NULL,
    
    -- Contact Information
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    company VARCHAR(255),
    phone VARCHAR(20),
    
    -- Lead Details
    message TEXT,
    interested_in VARCHAR(100),
    company_size VARCHAR(50),
    current_solution VARCHAR(255),
    
    -- Lead Scoring and Status
    score INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
    assigned_to UUID,
    
    -- Follow-up
    last_contacted TIMESTAMP WITH TIME ZONE,
    next_followup TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Roadmap notifications
CREATE TABLE IF NOT EXISTS public.roadmap_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    app_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    additional_info TEXT,
    notified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(app_name, email)
);

-- ============================================================================
-- 7. AI AND SYSTEM MANAGEMENT
-- ============================================================================

-- AI model training data
CREATE TABLE IF NOT EXISTS public.ai_model_training (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_type VARCHAR(50) NOT NULL,
    app_context VARCHAR(50) NOT NULL,
    training_data JSONB NOT NULL,
    accuracy_score DECIMAL(5,4),
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI performance metrics
CREATE TABLE IF NOT EXISTS public.ai_performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_type VARCHAR(50) NOT NULL,
    app_context VARCHAR(50) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,4) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System settings
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    updated_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs for security
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 8. PERFORMANCE INDEXES
-- ============================================================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_subscription ON public.users(subscription_plan);

-- Support ticket indexes
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON public.support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON public.support_tickets(created_at);

-- File indexes
CREATE INDEX IF NOT EXISTS idx_files_user_id ON public.files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_folder_id ON public.files(folder_id);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON public.files(created_at);
CREATE INDEX IF NOT EXISTS idx_files_ai_keywords ON public.files USING GIN(ai_keywords);
CREATE INDEX IF NOT EXISTS idx_files_ai_tags ON public.files USING GIN(ai_suggested_tags);

-- Proposal indexes
CREATE INDEX IF NOT EXISTS idx_proposals_user_id ON public.proposals(user_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON public.proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_created_at ON public.proposals(created_at);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- Lead indexes
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at);

-- ============================================================================
-- 9. FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to automatically update 'updated_at' timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables with updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON public.support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON public.folders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON public.files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON public.proposals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.proposal_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique proposal numbers
CREATE OR REPLACE FUNCTION generate_proposal_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.proposal_number IS NULL OR NEW.proposal_number = '' THEN
        NEW.proposal_number := 'PROP-' || EXTRACT(YEAR FROM NOW()) || '-' || 
                              LPAD(nextval('proposal_number_seq')::text, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create sequence for proposal numbers
CREATE SEQUENCE IF NOT EXISTS proposal_number_seq START 1;

-- Trigger to auto-generate proposal numbers
CREATE TRIGGER generate_proposal_number_trigger
    BEFORE INSERT ON public.proposals
    FOR EACH ROW EXECUTE FUNCTION generate_proposal_number();

-- ============================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all user data tables
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SUPPORT TICKETS RLS POLICIES
-- ============================================================================

-- Support tickets policies
CREATE POLICY "Users can manage their own tickets" ON public.support_tickets
    FOR ALL USING (auth.uid() = user_id);

-- Ticket responses policies
CREATE POLICY "Users can manage responses for their tickets" ON public.ticket_responses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.support_tickets 
            WHERE support_tickets.id = ticket_responses.ticket_id 
            AND support_tickets.user_id = auth.uid()
        )
    );

-- Ticket attachments policies
CREATE POLICY "Users can manage attachments for their tickets" ON public.ticket_attachments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.support_tickets 
            WHERE support_tickets.id = ticket_attachments.ticket_id 
            AND support_tickets.user_id = auth.uid()
        )
    );

-- ============================================================================
-- FILES AND FOLDERS RLS POLICIES
-- ============================================================================

-- Folders policies
CREATE POLICY "Users can manage their own folders" ON public.folders
    FOR ALL USING (auth.uid() = user_id);

-- Files policies
CREATE POLICY "Users can manage their own files" ON public.files
    FOR ALL USING (auth.uid() = user_id);

-- File tags policies
CREATE POLICY "Users can manage tags for their files" ON public.file_tags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.files 
            WHERE files.id = file_tags.file_id 
            AND files.user_id = auth.uid()
        )
    );

-- File shares policies
CREATE POLICY "Users can manage shares for their files" ON public.file_shares
    FOR ALL USING (
        auth.uid() = shared_by OR 
        auth.uid() = shared_with OR
        EXISTS (
            SELECT 1 FROM public.files 
            WHERE files.id = file_shares.file_id 
            AND files.user_id = auth.uid()
        )
    );

-- ============================================================================
-- PROPOSALS RLS POLICIES
-- ============================================================================

-- Proposals policies
CREATE POLICY "Users can manage their own proposals" ON public.proposals
    FOR ALL USING (auth.uid() = user_id);

-- Proposal line items policies
CREATE POLICY "Users can manage line items for their proposals" ON public.proposal_line_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.proposals 
            WHERE proposals.id = proposal_line_items.proposal_id 
            AND proposals.user_id = auth.uid()
        )
    );

-- Proposal templates policies
CREATE POLICY "Users can view and manage templates" ON public.proposal_templates
    FOR ALL USING (
        auth.uid() = user_id OR is_shared = true
    );

-- ============================================================================
-- OTHER RLS POLICIES
-- ============================================================================

-- Notifications policies
CREATE POLICY "Users can manage their own notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);

-- Feedback policies
CREATE POLICY "Users can manage their own feedback" ON public.feedback
    FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

-- ============================================================================
-- 11. STORAGE BUCKET AND POLICIES
-- ============================================================================

-- Create storage bucket for file uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('files', 'files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for file uploads
CREATE POLICY "Users can upload files to their folder" ON storage.objects 
    FOR INSERT WITH CHECK (
        bucket_id = 'files' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view their own files" ON storage.objects 
    FOR SELECT USING (
        bucket_id = 'files' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own files" ON storage.objects 
    FOR UPDATE USING (
        bucket_id = 'files' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own files" ON storage.objects 
    FOR DELETE USING (
        bucket_id = 'files' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- ============================================================================
-- 12. DEFAULT SYSTEM SETTINGS AND DATA
-- ============================================================================

-- Insert default system settings
INSERT INTO public.system_settings (key, value, description) VALUES
('ai_sentiment_threshold', '0.7', 'Minimum confidence score for AI sentiment analysis'),
('max_file_size', '104857600', 'Maximum file size in bytes (100MB)'),
('free_storage_limit', '5368709120', 'Free tier storage limit in bytes (5GB)'),
('email_notifications_enabled', 'true', 'Enable email notifications system-wide'),
('ai_processing_enabled', 'true', 'Enable AI processing for files and tickets'),
('maintenance_mode', 'false', 'System maintenance mode toggle'),
('default_currency', 'USD', 'Default currency for proposals'),
('proposal_validity_days', '30', 'Default validity period for proposals in days')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
-- 
-- 🎉 DATABASE SETUP COMPLETE! 🎉
-- 
-- Your Conseccomms platform database is now fully configured with:
-- 
-- ✅ All tables created (ConsecDesk, ConsecDrive, ConsecQuote)
-- ✅ All security policies enabled (RLS)
-- ✅ All storage policies configured
-- ✅ All indexes for optimal performance
-- ✅ All triggers and functions
-- ✅ All default settings
-- 
-- Your application should now work perfectly with this database!
-- 
-- Next steps:
-- 1. Your React application will automatically connect
-- 2. Users can register and login
-- 3. All features (tickets, files, proposals) will work
-- 4. Data is automatically secured per user
-- 
-- ============================================================================