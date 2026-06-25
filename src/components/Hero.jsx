import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { supabase, createDebouncedRefetch } from '../lib/supabase'
import { useSiteLogo } from '../hooks/useSiteLogo'
import { useSiteWelcome } from '../hooks/useSiteWelcome'
import { useSiteTagline } from '../hooks/useSiteTagline'
import { useScrollY } from '../hooks/useThrottledScroll'
import { springSoft } from '../lib/motion'

const DEFAULT_SLIDE = {
  id: 'default',
  image: '',
  name: 'حيث تلتقي أصالة الشاي بالتجربة الاستثنائية',
}

export default function Hero() {
  const [slides, setSlides] = useState([])
  const globalLogo = useSiteLogo()
  const welcomeText = useSiteWelcome()
  const taglineText = useSiteTagline()
  const [activeIndex, setActiveIndex] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const scrollY = useScrollY()
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    setLoaded(true)
  }, [])

  const fetchSlidesAndLogo = useCallback(async () => {
    const { data } = await supabase
      .from('menu_items')
      .select('*')
      .eq('category', '__hero_slide__')
      .order('created_at', { ascending: true })

    if (data?.length) setSlides(data)
  }, [])

  useEffect(() => {
    const debouncedFetch = createDebouncedRefetch(fetchSlidesAndLogo, 400)
    fetchSlidesAndLogo()

    const channel = supabase
      .channel('hero-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'menu_items',
          filter: 'category=eq.__hero_slide__',
        },
        debouncedFetch
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [fetchSlidesAndLogo])

  const displaySlides = slides.length > 0 ? slides : [DEFAULT_SLIDE]
  const totalSlides = displaySlides.length

  useEffect(() => {
    if (totalSlides <= 1 || reduceMotion) return
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % totalSlides)
    }, 5000)
    return () => clearInterval(timer)
  }, [totalSlides, reduceMotion])

  useEffect(() => {
    displaySlides.forEach((slide) => {
      if (!slide.image) return
      const img = new Image()
      img.src = slide.image
    })
  }, [displaySlides])

  const currentSlide = displaySlides[activeIndex] || displaySlides[0]

  const parallaxY = reduceMotion ? 0 : scrollY * 0.22
  const contentY = reduceMotion ? 0 : scrollY * -0.12
  const blurAmount = reduceMotion ? 0 : Math.min(scrollY / 80, 10)

  return (
    <section className="hero" id="home" aria-label="الصفحة الرئيسية">
      <div className="hero-slider" aria-hidden="true">
        <motion.div
          className="hero-slider-track"
          animate={{ x: `-${activeIndex * 100}%` }}
          transition={springSoft}
        >
          {displaySlides.map((slide, idx) => {
            const isActive = idx === activeIndex
            return (
              <div
                key={slide.id || idx}
                className={`hero-slide ${isActive ? 'active' : ''}`}
              >
                <div
                  className="hero-slide-bg"
                  style={{
                    backgroundImage: `url('${slide.image}')`,
                    filter: isActive ? `blur(${blurAmount}px)` : 'none',
                    transform: isActive
                      ? `translateY(${parallaxY}px) scale(1.04)`
                      : 'scale(1.04)',
                  }}
                />
                <div className="hero-overlay" />
              </div>
            )
          })}
        </motion.div>
      </div>

      <div
        className={`hero-content static-content ${loaded ? 'loaded' : ''}`}
        style={{ transform: `translate(-50%, calc(-50% + ${contentY}px))` }}
      >
        <p className="hero-welcome">{welcomeText}</p>

        <div className="hero-logo">
          {globalLogo && (
            <img
              src={globalLogo}
              alt="BRANZAG | برانزاك"
              className="hero-logo-img"
              width={290}
              height={290}
              decoding="async"
              fetchpriority="high"
            />
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={taglineText + activeIndex}
            className="hero-tagline active"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={springSoft}
          >
            {taglineText}
          </motion.p>
        </AnimatePresence>

        <div className="hero-buttons">
          <a href="#menu" className="cta-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            اكتشف المنيو
          </a>
          <a href="#about" className="cta-btn-outline">
            اكتشف قصتنا
          </a>
        </div>
      </div>

      {totalSlides > 1 && (
        <div className="hero-indicators" role="tablist" aria-label="شرائح العرض">
          {displaySlides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              role="tab"
              aria-selected={idx === activeIndex}
              aria-label={`الشريحة ${idx + 1}`}
              className={`hero-dot ${idx === activeIndex ? 'active' : ''}`}
              onClick={() => setActiveIndex(idx)}
            />
          ))}
        </div>
      )}

      <div className="hero-scroll" aria-hidden="true">
        <span />
      </div>
    </section>
  )
}
