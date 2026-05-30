import { useEffect } from 'react'

/**
 * Adds `.revealed` to `.reveal` elements when they enter the viewport.
 * Uses a MutationObserver to support components lazy-loaded via React Suspense.
 */
export function useRevealOnScroll() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.01, rootMargin: '0px 0px -10px 0px' }
    )

    const observeElements = () => {
      const elements = document.querySelectorAll('.reveal:not(.revealed)')
      elements.forEach((el) => {
        observer.observe(el)
      })
    }

    // Run initially
    observeElements()

    // Monitor the DOM for new elements (like lazy-loaded components)
    const mutationObserver = new MutationObserver(() => {
      observeElements()
    })

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    })

    // Also run on scroll/resize as a fail-safe to detect dynamically rendered content
    window.addEventListener('scroll', observeElements, { passive: true })
    window.addEventListener('resize', observeElements, { passive: true })

    // Fallback: Check every 1 second for any unobserved elements
    const interval = setInterval(observeElements, 1000)

    return () => {
      observer.disconnect()
      mutationObserver.disconnect()
      window.removeEventListener('scroll', observeElements)
      window.removeEventListener('resize', observeElements)
      clearInterval(interval)
    }
  }, [])
}


