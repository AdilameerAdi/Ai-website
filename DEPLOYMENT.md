# Deployment Guide

## Environment Setup

### Required Environment Variables
Create a `.env` file (not committed to Git) with the following variables:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
NODE_ENV=production
```

### Supabase Database Setup
Before deploying, ensure your Supabase database has the required tables:

1. **Run Database Schema**: Execute the SQL files in your Supabase SQL editor:
   - `database-schema.sql` (main tables)
   - `consecquote-setup.sql` (proposals tables)

2. **Required Tables**:
   - `proposals` (ConsecQuote) ✅ 
   - `support_tickets` (ConsecDesk) ⚠️ 
   - `files` (ConsecDrive) ⚠️

3. **Row Level Security (RLS)**:
   - All tables have RLS enabled
   - Policies allow users to access only their own data

## Build Process

### Local Build Test
```bash
npm install
npm run build
npm run preview
```

### Production Build
```bash
npm run build
```
This creates a `dist/` folder ready for deployment.

## Deployment Platforms

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables

### Other Platforms
- Build command: `npm run build`
- Output directory: `dist`
- Node version: 18+

## Known Issues

### Linting Warnings
- 119 unused variable warnings (non-blocking)
- These don't affect functionality or deployment

### Bundle Size Warnings
- Some chunks are larger than 500KB
- Consider code splitting for better performance
- Non-blocking for deployment

### Database Tables
- `support_tickets` and `files` tables need to be created
- Dashboard will show 0 counts until tables exist
- Proposals functionality works correctly

## Security Notes

### Environment Variables
- ✅ Supabase credentials now use environment variables
- ✅ `.env` files are in `.gitignore`
- ✅ `.env.example` provided for reference

### Database Security
- ✅ Row Level Security (RLS) enabled
- ✅ User authentication required
- ✅ Users can only access their own data

## Post-Deployment Checklist

1. ✅ Application loads without errors
2. ✅ User authentication works (login/signup)
3. ✅ ConsecQuote functionality (create, edit, delete proposals)
4. ⚠️ Dashboard statistics (requires database tables)
5. ⚠️ ConsecDesk functionality (requires support_tickets table)
6. ⚠️ ConsecDrive functionality (requires files table)