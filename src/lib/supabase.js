import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ygxooauhmbinzrixjahm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlneG9vYXVobWJpbnpyaXhqYWhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNzI1MzgsImV4cCI6MjA3MjY0ODUzOH0.amqD56boN2UR1w2hs8QcGYSd-o7oLSuUaN0EliCMQ7w'

export const supabase = createClient(supabaseUrl, supabaseKey)