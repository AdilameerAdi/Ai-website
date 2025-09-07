-- Temporarily disable RLS for admin testing
-- WARNING: This is for development/testing only!
-- In production, you should use proper service role authentication

-- Disable RLS on all tables to allow admin access
ALTER TABLE proposals DISABLE ROW LEVEL SECURITY;
ALTER TABLE files DISABLE ROW LEVEL SECURITY; 
ALTER TABLE tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE tablename IN ('proposals', 'files', 'tickets', 'users', 'leads')
ORDER BY tablename;