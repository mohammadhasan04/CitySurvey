import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://angqtmpuibwwrpkvbygt.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuZ3F0bXB1aWJ3d3Jwa3ZieWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNDk1MTQsImV4cCI6MjEwMTkyNTUxNH0.75rP6MPIZEcCK2gS10MdVYoML7cmLYrZboiuyICd_68";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuZ3F0bXB1aWJ3d3Jwa3ZieWd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjM0OTUxNCwiZXhwIjoyMTAxOTI1NTE0fQ.WXCMV-rh8oxDQKsD8Y4n3XLLWt8GTIueHbG5OYUGuJo";

// Public browser/client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side admin Supabase client (bypasses Row Level Security for admin tasks & storage)
const activeServiceKey = supabaseServiceKey || supabaseAnonKey;
export const supabaseAdmin = createClient(
  supabaseUrl,
  activeServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
