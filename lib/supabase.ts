import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || '',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

// Helper function to handle errors consistently
export function handleSupabaseError(error: any, operation: string): never {
  console.error(`Supabase error during ${operation}:`, error);
  throw new Error(`Error during ${operation}: ${error.message || 'Unknown error'}`);
} 