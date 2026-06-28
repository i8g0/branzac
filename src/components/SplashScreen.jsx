import { useState, useEffect } from 'react'

const CACHE_BUST = Date.now()

function preloadImage(src) {
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
      const minTime = new Promise((r) => setTimeout(r, 800))
      const images = Promise.all([
        preloadImage(`/images/logo-transparent.png?v=${CACHE_BUST}`),
        preloadImage(`/images/logo-bg.png?v=${CACHE_BUST}`),
      ])

      await Promise.all([minTime, images])

      if (!cancelled) {
        setProgress(100)
        setFadeOut(true)
        setTimeout(() => onComplete(), 600)
      }
    }

    loadAssets()

    return () => { cancelled = true }
  }, [onComplete])

  useEffect(() => {
    if (progress >= 100) return
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev
        return prev + Math.random() * 10 + 3
      })
    }, 150)
    return () => clearInterval(interval)
  }, [progress])

  return (
    <div className={`splash-screen ${fadeOut ? 'splash-fade-out' : ''}`}>
      <div className="splash-content">
        <div className="splash-logo-img">
          <img src={`/images/logo-transparent.png?v=${CACHE_BUST}`} alt="" width={160} height={160} />
        </div>

        <div className="splash-brand-text">
          <img src={`/images/logo-bg.png?v=${CACHE_BUST}`} alt="محاصيل الشاي" />
        </div>

        <div className="splash-progress-bar">
          <div className="splash-progress-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>

        <p className="splash-loading-text">جاري التحميل...</p>
      </div>

      <div className="splash-particles" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} className="splash-particle" style={{
            '--delay': `${i * 0.3}s`,
            '--x': `${10 + Math.random() * 80}%`,
            '--duration': `${3 + Math.random() * 4}s`,
          }} />
        ))}
      </div>
    </div>
  )
}
