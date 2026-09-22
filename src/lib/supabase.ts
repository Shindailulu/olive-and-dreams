import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project-id.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/**
 * Standard typed Supabase client for browser & client components.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

/**
 * Supabase client with custom session token header for guest cart operations.
 */
export function createGuestCartClient(sessionToken: string) {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        "x-cart-session": sessionToken,
      },
    },
  });
}

/**
 * Server-only admin client with service_role key to bypass RLS when necessary (e.g. background jobs).
 */
export function getAdminClient() {
  if (!supabaseServiceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not defined in environment.");
  }
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
