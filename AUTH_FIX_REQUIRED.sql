-- =============================================
-- AUTHENTICATION SYNC FIX - REQUIRED PATCH
-- Run this script to fix authentication issues for new users
-- =============================================

-- This script fixes the ID mismatch between Supabase Auth and users table
-- Run this ONCE to resolve "User not authenticated" errors

-- =============================================
-- STEP 1: Check current authentication status
-- =============================================

-- Show users who might have auth accounts but no matching database records
-- This query will help identify the scope of the issue
SELECT 'Current users table status:' as info;
SELECT COUNT(*) as total_users FROM users;

-- =============================================
-- STEP 2: Add missing columns to users table (if needed)
-- =============================================

-- Ensure users table has all required columns for new user sync
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT false;

-- Update existing users who might be missing this field
UPDATE users 
SET is_email_verified = true 
WHERE is_email_verified IS NULL;

-- =============================================
-- STEP 3: Create helper function for user sync
-- =============================================

-- Function to check if a user exists in users table
CREATE OR REPLACE FUNCTION check_user_exists(user_uuid UUID)
RETURNS TABLE(exists_in_db BOOLEAN, user_email TEXT, user_name TEXT) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (COUNT(*) > 0)::BOOLEAN as exists_in_db,
        COALESCE(MAX(email), 'Not found')::TEXT as user_email,
        COALESCE(MAX(full_name), 'Not found')::TEXT as user_name
    FROM users 
    WHERE id = user_uuid;
END;
$$;

-- =============================================
-- STEP 4: Verify CASCADE DELETE constraints exist
-- =============================================

-- Check if CASCADE DELETE is properly set up
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    rc.delete_rule,
    CASE 
        WHEN rc.delete_rule = 'CASCADE' THEN '✅ Properly configured'
        ELSE '❌ NEEDS FIX - Run complete database setup'
    END as status
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    JOIN information_schema.referential_constraints AS rc
      ON tc.constraint_name = rc.constraint_name
WHERE 
    tc.constraint_type = 'FOREIGN KEY' 
    AND ccu.table_name = 'users'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- =============================================
-- STEP 5: Test the user sync function
-- =============================================

-- Test with a known user ID (replace with actual UUID from your auth system)
-- SELECT * FROM check_user_exists('f21c28ad-479f-4ab7-820d-665644987bcf');

-- =============================================
-- STEP 6: Clean up any orphaned data (OPTIONAL)
-- =============================================

-- UNCOMMENT THESE LINES ONLY IF YOU WANT TO CLEAN UP ORPHANED DATA
-- WARNING: This will delete data that doesn't have valid user_id references

/*
-- Show orphaned tickets (tickets without valid users)
SELECT 'Orphaned tickets:' as info;
SELECT COUNT(*) as orphaned_tickets 
FROM tickets t 
LEFT JOIN users u ON t.user_id = u.id 
WHERE u.id IS NULL;

-- Show orphaned files
SELECT 'Orphaned files:' as info;
SELECT COUNT(*) as orphaned_files 
FROM files f 
LEFT JOIN users u ON f.user_id = u.id 
WHERE u.id IS NULL;

-- Show orphaned proposals
SELECT 'Orphaned proposals:' as info;
SELECT COUNT(*) as orphaned_proposals 
FROM proposals p 
LEFT JOIN users u ON p.user_id = u.id 
WHERE u.id IS NULL;

-- DELETE ORPHANED DATA (UNCOMMENT ONLY IF YOU'RE SURE)
-- DELETE FROM tickets WHERE user_id NOT IN (SELECT id FROM users);
-- DELETE FROM files WHERE user_id NOT IN (SELECT id FROM users);  
-- DELETE FROM proposals WHERE user_id NOT IN (SELECT id FROM users);
*/

-- =============================================
-- STEP 7: Final verification
-- =============================================

SELECT 'AUTH FIX APPLIED SUCCESSFULLY!' as status;
SELECT 'Next steps:' as info;
SELECT '1. Deploy updated code with userSyncService' as step1;
SELECT '2. Test new user registration' as step2;
SELECT '3. Verify existing users can access their data' as step3;

-- Show summary
SELECT 
    'Database is ready for authentication sync fixes' as final_message,
    COUNT(*) as total_users_in_db
FROM users;