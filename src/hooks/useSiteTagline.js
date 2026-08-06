import { useSyncExternalStore } from 'react'
import { supabase } from '../lib/supabase'

const DEFAULT_TAGLINE = 'حيث تلتقي أصالة الشاي بالتجربة الاستثنائية'
const CHANNEL_NAME = 'site-tagline-shared'

let taglineText = DEFAULT_TAGLINE
const listeners = new Set()
let channel = null

async function fetchTaglineFromDb() {
  try {
    const { data } = await supabase
      .from('menu_items')
      .select('name')
      .eq('category', '__site_tagline__')
      .maybeSingle()
    if (data?.name && data.name !== taglineText) {
      taglineText = data.name
      listeners.forEach((notify) => notify())
    }
  } catch (err) {
    console.warn('Failed to fetch tagline from Supabase:', err)
  }
}

function subscribe(callback) {
  listeners.add(callback)
  if (!channel) {
    fetchTaglineFromDb()
    channel = supabase
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
  return () => {
    listeners.delete(callback)
    if (listeners.size === 0 && channel) {
      supabase.removeChannel(channel)
      channel = null
    }
  }
}

function getSnapshot() {
  return taglineText
}

export function useSiteTagline(defaultTagline = DEFAULT_TAGLINE) {
  const text = useSyncExternalStore(subscribe, getSnapshot, () => defaultTagline)
  return text || defaultTagline
}
