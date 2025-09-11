-- CASCADE DELETE SETUP FOR USER DATA ISOLATION
-- Copy and paste this entire script into Supabase SQL Editor

-- Step 1: Drop existing foreign key constraints if they exist
-- (This prevents errors if constraints already exist)

ALTER TABLE IF EXISTS tickets 
DROP CONSTRAINT IF EXISTS tickets_user_id_fkey;

ALTER TABLE IF EXISTS files 
DROP CONSTRAINT IF EXISTS files_user_id_fkey;

ALTER TABLE IF EXISTS proposals 
DROP CONSTRAINT IF EXISTS proposals_user_id_fkey;

ALTER TABLE IF EXISTS password_resets 
DROP CONSTRAINT IF EXISTS password_resets_user_id_fkey;

-- Step 2: Add proper CASCADE DELETE foreign key constraints

-- Tickets table - delete all user tickets when user is deleted
ALTER TABLE tickets 
ADD CONSTRAINT tickets_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

-- Files table - delete all user files when user is deleted
ALTER TABLE files 
ADD CONSTRAINT files_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

-- Proposals table - delete all user proposals when user is deleted
ALTER TABLE proposals 
ADD CONSTRAINT proposals_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

-- Password resets table - delete all user password reset tokens when user is deleted
ALTER TABLE password_resets 
ADD CONSTRAINT password_resets_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

-- Step 3: Verify the constraints were added successfully
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name,
    rc.delete_rule
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    JOIN information_schema.referential_constraints AS rc
      ON tc.constraint_name = rc.constraint_name
WHERE 
    tc.constraint_type = 'FOREIGN KEY' 
    AND ccu.table_name = 'users'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- Step 4: Test the cascade delete (OPTIONAL - DO NOT RUN IN PRODUCTION)
-- Uncomment the lines below ONLY if you want to test with a dummy user
-- WARNING: This will delete the test user and all their data!

/*
-- Create a test user
INSERT INTO users (id, email, full_name, password, role, subscription_status)
VALUES ('test-user-cascade-123', 'test-cascade@example.com', 'Test Cascade User', 'temp', 'user', 'active');

-- Create test data for the user
INSERT INTO tickets (title, description, user_id, status) 
VALUES ('Test Ticket', 'Test ticket for cascade delete', 'test-user-cascade-123', 'open');

INSERT INTO files (filename, user_id, file_size, file_type) 
VALUES ('test-file.txt', 'test-user-cascade-123', 1024, 'text/plain');

-- Now delete the test user - this should automatically delete all related data
DELETE FROM users WHERE id = 'test-user-cascade-123';

-- Verify all related data was deleted (should return 0 rows for each)
SELECT COUNT(*) as remaining_tickets FROM tickets WHERE user_id = 'test-user-cascade-123';
SELECT COUNT(*) as remaining_files FROM files WHERE user_id = 'test-user-cascade-123';
*/

-- Success! 
-- Now when you delete a user from the admin panel or via SQL,
-- all their tickets, files, proposals, and password reset tokens
-- will be automatically deleted as well.

COMMENT ON TABLE users IS 'Main users table with CASCADE DELETE setup for data isolation';
COMMENT ON TABLE tickets IS 'User tickets - automatically deleted when user is deleted';
COMMENT ON TABLE files IS 'User files - automatically deleted when user is deleted';
COMMENT ON TABLE proposals IS 'User proposals - automatically deleted when user is deleted';
COMMENT ON TABLE password_resets IS 'Password reset tokens - automatically deleted when user is deleted';