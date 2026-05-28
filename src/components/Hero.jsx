import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Hero() {
  const [slides, setSlides] = useState([])
  const [globalLogo, setGlobalLogo] = useState('/images/logo-bg.png')
  const [activeIndex, setActiveIndex] = useState(0)
  const [scrollY, setScrollY] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setLoaded(true)
  }, [])

  useEffect(() => {
    const fetchSlidesAndLogo = async () => {
      const { data: slideData } = await supabase
        .from('menu_items')
        .select('*')
        .eq('category', '__hero_slide__')
        .order('created_at', { ascending: true })
      if (slideData && slideData.length > 0) {
        setSlides(slideData)
      }

      const { data: logoRecord } = await supabase
        .from('menu_items')
        .select('*')
        .eq('category', '__site_logo__')
        .maybeSingle()
      if (logoRecord && logoRecord.image) {
        setGlobalLogo(logoRecord.image)
      }
    }
    fetchSlidesAndLogo()

    // Listen for realtime modifications so admin updates show instantly
    const channel = supabase
      .channel('hero-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, () => {
        fetchSlidesAndLogo()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Auto-slide rotation interval
  useEffect(() => {
    const totalSlides = slides.length > 0 ? slides.length : 1
    if (totalSlides <= 1) return

    const timer = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % totalSlides)
    }, 4000) // 4 seconds interval for a balanced transition speed

    return () => clearInterval(timer)
  }, [slides])

  const displaySlides = slides.length > 0 ? slides : [
    {
      id: 'default',
      image: '/images/hero-bg.png',
      description: '/images/logo-bg.png',
      name: 'حيث تلتقي القهوة المختصة بالأجواء الاستثنائية'
    }
  ]

  const currentSlide = displaySlides[activeIndex] || displaySlides[0];
  const activeTagline = (currentSlide.name && currentSlide.name !== 'شريحة ترحيبية' && currentSlide.name !== 'شريحة ترحيبية جديدة')
    ? currentSlide.name
    : 'حيث تلتقي القهوة المختصة بالأجواء الاستثنائية';

  return (
    <section className="hero" id="home">
      {/* 1. Sliding Background Images only */}
      <div className="hero-slider">
        <div 
          className="hero-slider-track"
          style={{ transform: `translateX(${activeIndex * 100}%)` }}
        >
          {displaySlides.map((slide, idx) => {
            const isActive = idx === activeIndex
            return (
              <div
                key={slide.id || idx}
                className={`hero-slide ${isActive ? 'active' : ''}`}
              >
                {/* Parallax Background with dynamic blur */}
                <div
                  className="hero-slide-bg"
                  style={{ 
                    backgroundImage: `url('${slide.image}')`,
                    filter: `blur(${isActive ? Math.min(scrollY / 80, 12) : 0}px)`,
                    transform: isActive 
                      ? `translateY(${scrollY * 0.25}px) scale(1.04)` 
                      : 'scale(1.04)'
                  }}
                ></div>
                <div className="hero-overlay"></div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 2. Absolutely Static Overlay Content (fixed in the center) */}
      <div 
        className={`hero-content static-content ${loaded ? 'loaded' : ''}`}
        style={{ transform: `translate(-50%, calc(-50% + ${scrollY * -0.15}px))` }}
      >
        <p className="hero-welcome">
          مرحباً بكم في
        </p>

        <div className="hero-logo">
          <img
            src={globalLogo}
            alt="BRANZAC | برانزاك"
            className="hero-logo-img"
          />
        </div>

        {/* Dynamic tagline fading in place using key */}
        <p className="hero-tagline active" key={activeIndex}>
          {activeTagline}
        </p>

        <div className="hero-buttons">
          <a href="#menu" className="cta-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            اكتشف المنيو
          </a>
          <a href="#about" className="cta-btn-outline">
            اكتشف قصتنا
          </a>
        </div>
      </div>

      {/* Navigation Indicators */}
      {displaySlides.length > 1 && (
        <div className="hero-indicators">
          {displaySlides.map((_, idx) => (
            <button
              key={idx}
              className={`hero-dot ${idx === activeIndex ? 'active' : ''}`}
              onClick={() => setActiveIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

      <div className="hero-scroll">
        <span></span>
      </div>
    </section>
  )
}
