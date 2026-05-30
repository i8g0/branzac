import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { springSnappy, springSoft } from '../lib/motion'
import { supabase } from '../lib/supabase'

const SERVICES = [
  {
    title: 'اطلب عبر QR Code',
    description:
      'امسح الكود على طاولتك، تصفّح المنيو، واطلب مباشرة من جوالك. طلبك يوصلك على طاولتك بدون انتظار.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M7 7h.01" />
        <path d="M17 7h.01" />
        <path d="M7 17h.01" />
        <path d="M17 17h.01" />
      </svg>
    ),
  },
  {
    title: 'مساحة عمل مشتركة',
    description:
      'بيئة عمل مثالية مع إنترنت فائق السرعة، منافذ شحن متعددة، ومناطق هادئة مصممة للإنتاجية والإبداع.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: springSoft },
}

export default function Services() {
  const [dbServices, setDbServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchServices() {
      const { data } = await supabase
        .from('menu_items')
        .select('*')
        .eq('category', '__site_service__')
        .order('created_at', { ascending: true })
      
      if (data && data.length > 0) {
        setDbServices(data)
      }
      setLoading(false)
    }
    fetchServices()
  }, [])

  const displayServices = dbServices.length > 0 ? dbServices.map(s => ({
    title: s.name,
    description: s.description,
    image: s.image,
    id: s.id
  })) : SERVICES.map(s => ({ ...s, id: s.title }))

  if (loading) return null

  return (
    <section id="services" className="services-section" aria-labelledby="services-heading">
      <div className="container">
        <h2 id="services-heading" className="section-title">
          خدماتنا
        </h2>
        <p className="section-subtitle">نقدّم أكثر من مجرد قهوة — نقدّم تجربة متكاملة</p>

        <motion.div
          className="services-grid"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
        >
          {displayServices.map((service) => (
            <motion.article
              key={service.id}
              className="service-card"
              variants={item}
              whileHover={{ y: -6, transition: springSnappy }}
            >
              <div className="service-icon">
                {service.image ? (
                  <img src={service.image} alt={service.title} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                ) : (
                  service.icon || <div style={{ width: 40, height: 40, background: 'var(--gray-200)', borderRadius: '8px' }} />
                )}
              </div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <a href="#contact" className="service-link">
                تواصل معنا
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </a>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
