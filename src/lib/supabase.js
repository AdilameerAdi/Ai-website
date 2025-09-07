import { createClient } from '@supabase/supabase-js'

// Use environment variables for production, fallback to current values for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ygxooauhmbinzrixjahm.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlneG9vYXVobWJpbnpyaXhqYWhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNzI1MzgsImV4cCI6MjA3MjY0ODUzOH0.amqD56boN2UR1w2hs8QcGYSd-o7oLSuUaN0EliCMQ7w'

export const supabase = createClient(supabaseUrl, supabaseKey)