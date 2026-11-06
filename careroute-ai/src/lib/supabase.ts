import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

/** True only when both public Supabase settings are present. */
export const isSupabaseConfigured = Boolean(url && key)

/**
 * Browser Supabase client using the *publishable* key only.
 * All data protection is enforced by Row-Level Security in the database.
 * `null` when the env vars are missing — callers must show a "not configured" state.
 */
export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured
  ? createClient<Database>(url!, key!)
  : null
