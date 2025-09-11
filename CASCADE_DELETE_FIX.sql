-- =============================================
-- CASCADE DELETE FIX - Apply proper foreign key constraints
-- Run this script to fix user deletion issues
-- =============================================

-- This script fixes foreign key relationships to ensure that when a user is deleted,
-- all their related data (feedback, notifications, etc.) is automatically deleted

-- =============================================
-- STEP 1: Fix feedback table CASCADE DELETE
-- =============================================

-- Drop existing foreign key constraint
ALTER TABLE feedback 
DROP CONSTRAINT IF EXISTS feedback_user_id_fkey;

-- Add new constraint with CASCADE DELETE
ALTER TABLE feedback 
ADD CONSTRAINT feedback_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Also fix admin_user_id to use CASCADE
ALTER TABLE feedback 
DROP CONSTRAINT IF EXISTS feedback_admin_user_id_fkey;

ALTER TABLE feedback 
ADD CONSTRAINT feedback_admin_user_id_fkey 
FOREIGN KEY (admin_user_id) REFERENCES users(id) ON DELETE SET NULL;

-- =============================================
-- STEP 2: Fix leads table CASCADE DELETE
-- =============================================

-- Fix assigned_to field to use CASCADE DELETE
ALTER TABLE leads 
DROP CONSTRAINT IF EXISTS leads_assigned_to_fkey;

ALTER TABLE leads 
ADD CONSTRAINT leads_assigned_to_fkey 
FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE CASCADE;

-- =============================================
-- STEP 3: Ensure all user data tables have CASCADE DELETE
-- =============================================

-- Double-check tickets table
ALTER TABLE tickets 
DROP CONSTRAINT IF EXISTS tickets_user_id_fkey;

ALTER TABLE tickets 
ADD CONSTRAINT tickets_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Double-check files table  
ALTER TABLE files 
DROP CONSTRAINT IF EXISTS files_user_id_fkey;

ALTER TABLE files 
ADD CONSTRAINT files_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Double-check proposals table
ALTER TABLE proposals 
DROP CONSTRAINT IF EXISTS proposals_user_id_fkey;

ALTER TABLE proposals 
ADD CONSTRAINT proposals_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Double-check notifications table
ALTER TABLE notifications 
DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;

ALTER TABLE notifications 
ADD CONSTRAINT notifications_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Double-check user_activities table
ALTER TABLE user_activities 
DROP CONSTRAINT IF EXISTS user_activities_user_id_fkey;

ALTER TABLE user_activities 
ADD CONSTRAINT user_activities_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Double-check user_sessions table
ALTER TABLE user_sessions 
DROP CONSTRAINT IF EXISTS user_sessions_user_id_fkey;

ALTER TABLE user_sessions 
ADD CONSTRAINT user_sessions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Double-check password_resets table
ALTER TABLE password_resets 
DROP CONSTRAINT IF EXISTS password_resets_user_id_fkey;

ALTER TABLE password_resets 
ADD CONSTRAINT password_resets_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- =============================================
-- STEP 4: Create a test function to verify CASCADE DELETE
-- =============================================

CREATE OR REPLACE FUNCTION test_user_cascade_delete(test_user_id UUID)
RETURNS TABLE(
    table_name TEXT,
    records_before BIGINT,
    records_after BIGINT,
    deleted_count BIGINT
) 
LANGUAGE plpgsql
AS $$
DECLARE
    before_count BIGINT;
    after_count BIGINT;
BEGIN
    -- Check tickets
    SELECT COUNT(*) INTO before_count FROM tickets WHERE user_id = test_user_id;
    DELETE FROM users WHERE id = test_user_id;
    SELECT COUNT(*) INTO after_count FROM tickets WHERE user_id = test_user_id;
    
    RETURN QUERY SELECT 'tickets'::TEXT, before_count, after_count, (before_count - after_count);
    
    -- Check files
    SELECT COUNT(*) INTO before_count FROM files WHERE user_id = test_user_id;
    SELECT COUNT(*) INTO after_count FROM files WHERE user_id = test_user_id;
    RETURN QUERY SELECT 'files'::TEXT, before_count, after_count, (before_count - after_count);
    
    -- Check proposals
    SELECT COUNT(*) INTO before_count FROM proposals WHERE user_id = test_user_id;
    SELECT COUNT(*) INTO after_count FROM proposals WHERE user_id = test_user_id;
    RETURN QUERY SELECT 'proposals'::TEXT, before_count, after_count, (before_count - after_count);
    
    -- Check notifications
    SELECT COUNT(*) INTO before_count FROM notifications WHERE user_id = test_user_id;
    SELECT COUNT(*) INTO after_count FROM notifications WHERE user_id = test_user_id;
    RETURN QUERY SELECT 'notifications'::TEXT, before_count, after_count, (before_count - after_count);
    
    -- Check feedback
    SELECT COUNT(*) INTO before_count FROM feedback WHERE user_id = test_user_id;
    SELECT COUNT(*) INTO after_count FROM feedback WHERE user_id = test_user_id;
    RETURN QUERY SELECT 'feedback'::TEXT, before_count, after_count, (before_count - after_count);
END;
$$;

-- =============================================
-- STEP 5: Verification queries
-- =============================================

-- Show all foreign key constraints that reference users table
SELECT 
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    confrelid::regclass AS referenced_table,
    confdeltype AS delete_action,
    CASE confdeltype 
        WHEN 'c' THEN 'CASCADE'
        WHEN 'n' THEN 'SET NULL'
        WHEN 'r' THEN 'RESTRICT'
        WHEN 'd' THEN 'SET DEFAULT'
        ELSE 'NO ACTION'
    END AS delete_action_description
FROM pg_constraint 
WHERE confrelid = 'users'::regclass
ORDER BY conrelid::regclass::text;

-- Success message
SELECT 
    '✅ CASCADE DELETE FIX COMPLETED!' as status,
    'All user-related data will now be automatically deleted when a user is removed.' as description;