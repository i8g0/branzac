import { useEffect } from 'react'

/** Smooth-scroll for in-page hash links without full page jump */
export function useAnchorScroll() {
  useEffect(() => {
    const handleClick = (e) => {
      const target = e.target.closest('a[href^="#"]')
      if (!target) return
      const hash = target.getAttribute('href')
      if (!hash || hash === '#') return
      e.preventDefault()
      const el = document.getElementById(hash.slice(1))
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])
}
