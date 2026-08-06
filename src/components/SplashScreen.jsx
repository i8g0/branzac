import { useState, useEffect } from 'react'

function preloadImage(src) {
  if (!src) return Promise.resolve()
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = resolve
    img.onerror = resolve
    img.src = src
  })
}

export default function SplashScreen({ onComplete }) {
  const [progress, setProgress] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    let cancelled = false

    const loadAssets = async () => {
      // 1. Critical bundled & hero images to preload while splash screen is active
      const criticalImages = [
        '/images/logo-transparent.png',
        '/images/logo-bg.png',
        '/images/cafe-interior.png',
        '/images/hero-bg.png',
        '/images/tea-default.png'
      ]

      let loadedCount = 0
      const total = criticalImages.length

      const updateProgress = () => {
        if (cancelled) return
        loadedCount++
        const pct = Math.min(Math.round((loadedCount / total) * 100), 95)
        setProgress((prev) => Math.max(prev, pct))
      }

      const promises = criticalImages.map((src) =>
        preloadImage(src).then(updateProgress)
      )

      // Ensure minimum splash time for ultra smooth transition (400ms)
      const minTimer = new Promise((r) => setTimeout(r, 400))

      await Promise.all([Promise.all(promises), minTimer])

      if (!cancelled) {
        setProgress(100)
        setFadeOut(true)
        setTimeout(() => onComplete(), 500)
      }
    }

    loadAssets()

    return () => {
      cancelled = true
    }
  }, [onComplete])

  useEffect(() => {
    if (progress >= 100) return
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev
        return prev + Math.random() * 12 + 6
      })
    }, 80)
    return () => clearInterval(interval)
  }, [progress])

  return (
    <div className={`splash-screen ${fadeOut ? 'splash-fade-out' : ''}`}>
      <div className="splash-content">
        <div className="splash-logo-img">
          <img
            src="/images/logo-transparent.png"
            alt="شعار محاصيل الشاي"
            width={160}
            height={160}
            loading="eager"
            decoding="sync"
          />
        </div>

        <div className="splash-brand-text">
          <img
            src="/images/logo-bg.png"
            alt="مرحباً بكم في محاصيل الشاي"
            loading="eager"
            decoding="sync"
          />
        </div>

        <div className="splash-progress-bar">
          <div
            className="splash-progress-fill"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        <p className="splash-loading-text">جاري تحضير التجربة...</p>
      </div>

      <div className="splash-particles" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            className="splash-particle"
            style={{
              '--delay': `${i * 0.3}s`,
              '--x': `${10 + Math.random() * 80}%`,
              '--duration': `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

