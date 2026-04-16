import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ygesfahotezvdubzoxyi.supabase.co'; 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnZXNmYWhvdGV6dmR1YnpveHlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyODMxNjMsImV4cCI6MjA5MTg1OTE2M30.G1fN24BlOXPdiJjWsw77DV1R6OX6ogbyhlkIManJkZc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
