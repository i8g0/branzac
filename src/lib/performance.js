/**
 * Returns a debounced function that delays invoking fn until after wait ms
 * have elapsed since the last call.
 */
export function debounce(fn, wait = 300) {
  let timeoutId
  return function debounced(...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args), wait)
  }
}

/**
 * Returns a throttled function that invokes fn at most once per wait ms.
 */
export function throttle(fn, wait = 100) {
  let last = 0
  let trailingTimer
  return function throttled(...args) {
    const now = Date.now()
    const remaining = wait - (now - last)
    if (remaining <= 0) {
      if (trailingTimer) {
        clearTimeout(trailingTimer)
        trailingTimer = null
      }
      last = now
      fn.apply(this, args)
    } else if (!trailingTimer) {
      trailingTimer = setTimeout(() => {
        last = Date.now()
        trailingTimer = null
        fn.apply(this, args)
      }, remaining)
    }
  }
}

/**
 * RequestAnimationFrame-based throttle for scroll/resize handlers.
 */
export function rafThrottle(fn) {
  let ticking = false
  return function rafThrottled(...args) {
    if (ticking) return
    ticking = true
    requestAnimationFrame(() => {
      fn.apply(this, args)
      ticking = false
    })
  }
}
