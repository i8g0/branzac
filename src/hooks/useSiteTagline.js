import { useSyncExternalStore } from 'react'
import { supabase } from '../lib/supabase'

const DEFAULT_TAGLINE = 'حيث تلتقي القهوة المختصة بالأجواء الاستثنائية'
const CHANNEL_NAME = 'site-tagline-shared'

let taglineText = DEFAULT_TAGLINE
const listeners = new Set()
let realtimeStarted = false

async function fetchTaglineFromDb() {
  const { data } = await supabase
    .from('menu_items')
    .select('name')
    .eq('category', '__site_tagline__')
    .maybeSingle()
  if (data?.name && data.name !== taglineText) {
    taglineText = data.name
    listeners.forEach((notify) => notify())
  }
}

function startTaglineRealtime() {
  if (realtimeStarted) return
  realtimeStarted = true

  fetchTaglineFromDb()

  supabase
    .channel(CHANNEL_NAME)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'menu_items',
        filter: 'category=eq.__site_tagline__',
      },
      () => {
        fetchTaglineFromDb()
      }
    )
    .subscribe()
}

function subscribe(callback) {
  listeners.add(callback)
  startTaglineRealtime()
  return () => listeners.delete(callback)
}

function getSnapshot() {
  return taglineText
}

export function useSiteTagline(defaultTagline = DEFAULT_TAGLINE) {
  const text = useSyncExternalStore(subscribe, getSnapshot, () => defaultTagline)
  return text || defaultTagline
}
