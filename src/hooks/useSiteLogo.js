import { useSyncExternalStore } from 'react'
import { supabase } from '../lib/supabase'

const DEFAULT_LOGO = ''
const CHANNEL_NAME = 'site-logo-shared'

let logoUrl = DEFAULT_LOGO
const listeners = new Set()
let realtimeStarted = false

async function fetchLogoFromDb() {
  const { data } = await supabase
    .from('menu_items')
    .select('image')
    .eq('category', '__site_logo__')
    .maybeSingle()
  if (data?.image && data.image !== logoUrl) {
    logoUrl = data.image
    listeners.forEach((notify) => notify())
  }
}

function startLogoRealtime() {
  if (realtimeStarted) return
  realtimeStarted = true

  fetchLogoFromDb()

  supabase
    .channel(CHANNEL_NAME)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'menu_items',
        filter: 'category=eq.__site_logo__',
      },
      () => {
        fetchLogoFromDb()
      }
    )
    .subscribe()
}

function subscribe(callback) {
  listeners.add(callback)
  startLogoRealtime()
  return () => listeners.delete(callback)
}

function getSnapshot() {
  return logoUrl
}

/** Shared logo — single realtime subscription app-wide */
export function useSiteLogo(defaultLogo = DEFAULT_LOGO) {
  const url = useSyncExternalStore(subscribe, getSnapshot, () => defaultLogo)
  return url || defaultLogo
}
