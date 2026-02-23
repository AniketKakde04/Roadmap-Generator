import { createClient } from '@supabase/supabase-js';
import { Database } from '../types';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and Anon Key are not set in environment variables");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
