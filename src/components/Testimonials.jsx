import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { testimonials as staticTestimonials } from '../data/menuData'
import { springSoft } from '../lib/motion'
import { supabase } from '../lib/supabase'

function Stars({ rating }) {
  return (
    <div className="testimonial-stars" aria-label={`تقييم ${rating} من 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? 'star filled' : 'star'} aria-hidden="true">
          ★
        </span>
      ))}
    </div>
  )
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const card = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: springSoft },
}

export default function Testimonials() {
  const [dbReviews, setDbReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTestimonials() {
      const { data } = await supabase
        .from('menu_items')
        .select('*')
        .eq('category', '__site_testimonial__')
        .order('created_at', { ascending: true })
      
      if (data && data.length > 0) {
        setDbReviews(data)
      }
      setLoading(false)
    }
    fetchTestimonials()
  }, [])

  const displayReviews = dbReviews.length > 0 ? dbReviews.map(r => ({
    id: r.id,
    name: r.name,
    text: r.description,
    role: r.name_en || 'عميل',
    rating: r.price > 0 ? r.price : 5, // Read rating from price field, default to 5
  })) : staticTestimonials.map(r => ({ ...r, role: 'عميل' }))

  if (loading) return null

  return (
    <section id="testimonials" className="testimonials-section" aria-labelledby="testimonials-heading">
      <div className="container">
        <h2 id="testimonials-heading" className="section-title section-title-light">
          آراء عملائنا
        </h2>
        <p className="section-subtitle section-subtitle-light">
          ما يقوله عملاؤنا عن تجربتهم في محاصيل الشاي
        </p>

        <motion.div
          className="testimonials-grid"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
        >
          {displayReviews.map((review) => (
            <motion.blockquote
              key={review.id}
              className="testimonial-card"
              variants={card}
              cite={`عميل: ${review.name}`}
            >
              <div className="testimonial-quote" aria-hidden="true">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" opacity="0.15">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              <Stars rating={review.rating} />
              <p className="testimonial-text">{review.text}</p>
              <footer className="testimonial-author">
                <div className="author-avatar" aria-hidden="true">
                  {review.name.charAt(0)}
                </div>
                <div className="author-info">
                  <cite className="author-name">{review.name}</cite>
                  <span className="author-date">
                    {review.role}
                  </span>
                </div>
              </footer>
            </motion.blockquote>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
