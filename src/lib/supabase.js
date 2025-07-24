import { createClient } from '@supabase/supabase-js'

// Project ID and anon key from credentials
const SUPABASE_URL = 'https://isjqzvoglzqehlsajfjb.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzanF6dm9nbHpxZWhsc2FqZmpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMjYxMTEsImV4cCI6MjA2ODkwMjExMX0.z2z5C_V05rumIW3h49oW_hTM3vbZuK5CTWGvn3iSGZY'

if (SUPABASE_URL === 'https://<PROJECT-ID>.supabase.co' || SUPABASE_ANON_KEY === '<ANON_KEY>') {
  throw new Error('Missing Supabase variables');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

console.log("Supabase client initialized with URL:", SUPABASE_URL);

export default supabase;