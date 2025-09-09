# Database Setup Instructions

## Quick Setup

1. **Run the Database Setup Script**
   - Go to your Supabase project SQL Editor
   - Copy and paste the entire content of `final_database_setup.sql`
   - Run the script

2. **Environment Variables**
   - Make sure your `.env` file has the correct Supabase URL and anon key
   - The database will be ready for your application

## What the Setup Script Does

✅ **Creates all required tables:**
- `users` - User accounts and profiles
- `proposals` - Quote/proposal management
- `proposal_line_items` - Individual items in proposals  
- `user_activities` - User activity logging

✅ **Sets up proper relationships:**
- Foreign key constraints between tables
- Cascade delete for data integrity

✅ **Configures permissions:**
- Disables Row Level Security for development
- Grants all necessary permissions

✅ **Creates test user:**
- Inserts a test user to match your auth system
- Prevents foreign key constraint errors

## After Setup

Your application will be able to:
- ✅ User signup and login
- ✅ Proposal creation and management
- ✅ Admin panel functionality
- ✅ User activity tracking
- ✅ File and data management

## Production Notes

- For production, you may want to enable Row Level Security (RLS)
- Consider adding more restrictive permissions
- The current setup is optimized for development ease

## Support

If you encounter any issues, the setup script includes verification queries that will show you the current state of your database.