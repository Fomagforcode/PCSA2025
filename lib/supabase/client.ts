import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config"

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)

// Create a singleton client for use throughout the app
export function createSupabaseClient() {
  return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
}

// Default export for compatibility
export default supabase

// Named export for createClient function
export { createClient } from "@supabase/supabase-js"
