import { useSyncExternalStore } from 'react'
import { supabase } from '../lib/supabase'

const DEFAULT_WELCOME = 'مرحباً بكم في'
const CHANNEL_NAME = 'site-welcome-shared'

let welcomeText = DEFAULT_WELCOME
const listeners = new Set()
let channel = null

async function fetchWelcomeFromDb() {
  try {
    const { data } = await supabase
      .from('menu_items')
      .select('name')
      .eq('category', '__site_welcome__')
      .maybeSingle()
    if (data?.name && data.name !== welcomeText) {
      welcomeText = data.name
      listeners.forEach((notify) => notify())
    }
  } catch (err) {
    console.warn('Failed to fetch welcome from Supabase:', err)
  }
}

function subscribe(callback) {
  listeners.add(callback)
  if (!channel) {
    fetchWelcomeFromDb()
    channel = supabase
      .channel(CHANNEL_NAME)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'menu_items',
          filter: 'category=eq.__site_welcome__',
        },
        () => {
          fetchWelcomeFromDb()
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
  return welcomeText
}

export function useSiteWelcome(defaultWelcome = DEFAULT_WELCOME) {
  const text = useSyncExternalStore(subscribe, getSnapshot, () => defaultWelcome)
  return text || defaultWelcome
}
