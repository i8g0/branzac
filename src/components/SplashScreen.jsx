import { useState, useEffect } from 'react'

const CACHE_BUST = Date.now()

export default function SplashScreen({ onComplete }) {
  const [progress, setProgress] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setFadeOut(true)
          setTimeout(() => onComplete(), 600)
          return 100
        }
        return prev + Math.random() * 15 + 5
      })
    }, 120)

    return () => clearInterval(interval)
  }, [onComplete])

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
