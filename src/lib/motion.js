/** Shared Framer Motion spring presets — mass & damping, not linear easing */
export const springSnappy = { type: 'spring', stiffness: 420, damping: 32, mass: 0.7 }
export const springSoft = { type: 'spring', stiffness: 280, damping: 28, mass: 0.9 }
export const springDrawer = { type: 'spring', stiffness: 320, damping: 34, mass: 0.85 }
export const springModal = { type: 'spring', stiffness: 380, damping: 30, mass: 0.75 }
export const springToast = { type: 'spring', stiffness: 500, damping: 35, mass: 0.6 }

export const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
}
