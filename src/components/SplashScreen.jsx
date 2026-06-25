import { useState, useEffect } from 'react'

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
        <div className="splash-logo">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" opacity="0.3" />
            <path d="M20 42c0-8 4-14 12-14s12 6 12 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M44 34c2 0 5 1 5 4s-3 4-5 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M20 34c-2 0-5 1-5 4s3 4 5 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M28 22c0-3 2-5 4-5s4 2 4 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
            <path d="M25 18c-1-4 0-8 3-10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
            <path d="M39 18c1-4 0-8-3-10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
          </svg>
        </div>

        <h1 className="splash-title">محاصيل الشاي</h1>
        <p className="splash-subtitle">شاي مغربي أصيل</p>

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
