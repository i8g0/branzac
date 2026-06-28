import { createClient } from '@supabase/supabase-js'
import { debounce } from './performance'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? 'https://yjgtablerdbkzuwxkmyp.supabase.co'
const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'sb_publishable_ZeQ_IIQ26DFUCb5KYFlovQ_45rH0Jd1'

export const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Debounced refetch helper for realtime channels that fire in bursts.
 */
export function createDebouncedRefetch(fetchFn, wait = 400) {
  return debounce(fetchFn, wait)
}
