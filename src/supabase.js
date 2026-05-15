import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://arpyvihwgmbqoaihxyky.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFycHl2aWh3Z21icW9haWh4eWt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3OTkyMzQsImV4cCI6MjA5NDM3NTIzNH0.8TgKZcPKPMLs6saVMtwrOYdcQwVSj0MhYC3iH0xAIOY"

export const supabase = createClient(supabaseUrl, supabaseKey)