# Deployment Guide

## Environment Setup

### Required Environment Variables

Before deploying, you need to set up the following environment variables:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
NODE_ENV=production
```

### Local Development

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your actual Supabase credentials
3. Run the development server:
   ```bash
   npm run dev
   ```

### Deployment Platforms

#### Vercel
1. Connect your GitHub repository to Vercel
2. In the Vercel dashboard, go to Project Settings → Environment Variables
3. Add the required environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `NODE_ENV=production`

#### Netlify
1. Connect your GitHub repository to Netlify
2. In the Netlify dashboard, go to Site settings → Build & deploy → Environment variables
3. Add the required environment variables

#### Other Platforms
For other deployment platforms, ensure you set the environment variables in their respective configuration sections.

## Build Process

The application is configured to:
- ✅ Build successfully without environment variables (with warnings)
- ✅ Handle missing Supabase configuration gracefully
- ✅ Show appropriate error messages when authentication is unavailable
- ✅ Prevent crashes when login/signup forms are submitted without Supabase
- ✅ Display helpful error messages for missing configuration

## Pre-deployment Checklist

- [ ] Environment variables configured on deployment platform
- [ ] Build passes: `npm run build`
- [ ] No critical console errors
- [ ] Mobile responsiveness tested
- [ ] Authentication flow tested (if Supabase is configured)

## Supabase Setup

If you need to set up a new Supabase project:

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Get your project URL and anon key from Project Settings → API
3. Set up your database tables as needed
4. Configure Row Level Security (RLS) policies
5. Update your environment variables

## Common Issues

### 403 Forbidden Errors
- Check that your Supabase anon key is correct
- Verify your Supabase URL is correct
- Ensure RLS policies are configured properly

### Build Failures
- Run `npm run build` locally first
- Check for missing dependencies
- Verify environment variables are set correctly

## Support

For deployment issues, check:
1. Browser console for errors
2. Network tab for failed requests
3. Environment variables configuration
4. Supabase project settings and policies