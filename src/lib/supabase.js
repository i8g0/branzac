import { createClient } from '@supabase/supabase-js'
import { debounce } from './performance'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '')

/**
 * Debounced refetch helper for realtime channels that fire in bursts.
 */
export function createDebouncedRefetch(fetchFn, wait = 400) {
  return debounce(fetchFn, wait)
}
