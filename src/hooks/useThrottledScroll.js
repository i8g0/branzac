import { useSyncExternalStore } from 'react'
import { rafThrottle } from '../lib/performance'

let scrollY = 0
let scrolled = false
const listeners = new Set()

const onScroll = rafThrottle(() => {
  const y = typeof window !== 'undefined' ? window.scrollY : 0
  const isScrolled = y > 50
  let changed = false

  if (y !== scrollY) {
    scrollY = y
    changed = true
  }
  if (isScrolled !== scrolled) {
    scrolled = isScrolled
    changed = true
  }

  if (changed) {
    listeners.forEach((notify) => notify())
  }
})

function subscribe(callback) {
  if (listeners.size === 0 && typeof window !== 'undefined') {
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
  }
  listeners.add(callback)
  return () => {
    listeners.delete(callback)
    if (listeners.size === 0 && typeof window !== 'undefined') {
      window.removeEventListener('scroll', onScroll)
    }
  }
}

export function useScrollY() {
  return useSyncExternalStore(subscribe, () => scrollY, () => 0)
}

export function useScrolled() {
  return useSyncExternalStore(subscribe, () => scrolled, () => false)
}

/** Legacy support, though consumers should migrate to specific hooks */
export function useThrottledScroll() {
  const y = useSyncExternalStore(subscribe, () => scrollY, () => 0)
  const s = useSyncExternalStore(subscribe, () => scrolled, () => false)
  return { scrollY: y, scrolled: s }
}
