/**
 * Supabase Client for Wedded Business KPIs
 *
 * This module provides a singleton Supabase client for querying
 * Wedded's production database (users, weddings, onboarding, etc.)
 *
 * Environment variables required:
 * - SUPABASE_URL: Supabase project URL
 * - SUPABASE_SERVICE_ROLE_KEY: Service role key for admin access
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured"
      );
    }

    supabaseInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabaseInstance;
}

export const supabase = {
  get client(): SupabaseClient {
    return getSupabaseClient();
  },
};
