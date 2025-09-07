-- Fix RLS Policies for Admin Access
-- This will allow admin users to read all data from tables

-- First, check if RLS is enabled on these tables
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to recreate them)
DROP POLICY IF EXISTS "Enable read access for all users" ON proposals;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON proposals;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON proposals;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON proposals;
DROP POLICY IF EXISTS "Public proposals are viewable by everyone" ON proposals;
DROP POLICY IF EXISTS "Users can view own proposals" ON proposals;
DROP POLICY IF EXISTS "Users can create proposals" ON proposals;
DROP POLICY IF EXISTS "Users can update own proposals" ON proposals;
DROP POLICY IF EXISTS "Users can delete own proposals" ON proposals;

-- Create new policies for proposals table
-- Policy 1: Users can see their own proposals
CREATE POLICY "Users can view own proposals" ON proposals
    FOR SELECT USING (auth.uid() = user_id);

-- Policy 2: Users can create proposals
CREATE POLICY "Users can create proposals" ON proposals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own proposals
CREATE POLICY "Users can update own proposals" ON proposals
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy 4: Users can delete their own proposals
CREATE POLICY "Users can delete own proposals" ON proposals
    FOR DELETE USING (auth.uid() = user_id);

-- Policy 5: ADMIN POLICY - Allow service role to read ALL proposals
CREATE POLICY "Service role can read all proposals" ON proposals
    FOR SELECT USING (
        auth.role() = 'service_role' OR 
        auth.jwt() ->> 'role' = 'service_role'
    );

-- Alternative: Create a more permissive policy for admin dashboard
-- This allows ANY authenticated user to read proposals (for admin dashboard)
CREATE POLICY "Allow authenticated users to read proposals for admin" ON proposals
    FOR SELECT 
    TO authenticated
    USING (true);

-- Fix policies for files table
DROP POLICY IF EXISTS "Users can view own files" ON files;
DROP POLICY IF EXISTS "Users can upload files" ON files;
DROP POLICY IF EXISTS "Users can update own files" ON files;
DROP POLICY IF EXISTS "Users can delete own files" ON files;

CREATE POLICY "Users can view own files" ON files
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upload files" ON files
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own files" ON files
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own files" ON files
    FOR DELETE USING (auth.uid() = user_id);

-- Allow reading all files for admin purposes
CREATE POLICY "Allow authenticated users to read files for admin" ON files
    FOR SELECT 
    TO authenticated
    USING (true);

-- Fix policies for tickets table
DROP POLICY IF EXISTS "Users can view own tickets" ON tickets;
DROP POLICY IF EXISTS "Allow authenticated users to read tickets for admin" ON tickets;

CREATE POLICY "Users can view own tickets" ON tickets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to read tickets for admin" ON tickets
    FOR SELECT 
    TO authenticated
    USING (true);

-- Fix policies for users table (if it exists)
DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Allow reading users table" ON users;

CREATE POLICY "Allow reading users table" ON users
    FOR SELECT 
    TO authenticated
    USING (true);

-- Fix policies for leads table
DROP POLICY IF EXISTS "Allow reading leads table" ON leads;

CREATE POLICY "Allow reading leads table" ON leads
    FOR SELECT 
    TO authenticated
    USING (true);

-- Grant necessary permissions
GRANT ALL ON proposals TO authenticated;
GRANT ALL ON files TO authenticated;
GRANT ALL ON tickets TO authenticated;
GRANT ALL ON users TO authenticated;
GRANT ALL ON leads TO authenticated;

-- Verify the policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('proposals', 'files', 'tickets', 'users', 'leads')
ORDER BY tablename, policyname;