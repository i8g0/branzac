import { motion } from 'framer-motion'
import { useSiteAbout } from '../hooks/useSiteAbout'
import PremiumImage from './ui/PremiumImage'
import { springSoft } from '../lib/motion'

const DEFAULTS = {
  heading: 'شغفنا بالشاي المغربي الأصيل',
  description: `في محاصيل الشاي، نؤمن بأن الشاي ليس مجرد مشروب — إنه تجربة متكاملة تنقلك إلى عالم الأصالة والذوق الرفيع. نختار بعناية أجود أنواع الشاي من أرقى المزارع، ونقدمه لك بأسلوب يجمع بين التراث العريق والحداثة. من أوراق الشاي الطازجة إلى كوبك، نحرص على كل تفصيلة لنقدّم لك تجربة شاية استثنائية في قلب الرياض.

صمّمنا مكاننا ليكون أكثر من مجرد محل شاي. أجواء تراثية دافئة تجمع بين الراحة والأصالة، مع تشكيلة متنوعة من المشروبات الساخنة التي تناسب جميع الأذواق. سواء كنت تبحث عن لحظة هدوء أو تجربة شاية فريدة، محاصيل الشاي هو وجهتك المثالية.`,
  image: '/images/cafe-interior.png',
}

const STATS = [
  { number: '+١٠٠٠', label: 'عميل سعيد' },
  { number: '+١٢', label: 'صنف شاي مميز' },
  { number: '٢٠٢٤', label: 'سنة التأسيس' },
]

export default function About() {
  const { heading, description, image, blurData } = useSiteAbout(DEFAULTS)
  const paragraphs = description.split('\n').filter((p) => p.trim() !== '')

  return (
    <section id="about" className="about-section" aria-labelledby="about-heading">
      <div className="container">
        <h2 id="about-heading" className="section-title section-title-light">
          قصتنا
        </h2>
        <p className="section-subtitle section-subtitle-light">
          شغف حقيقي بالشاي المغربي الأصيل منذ اليوم الأول
        </p>

        <div className="about-grid">
          <motion.div
            className="about-image"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={springSoft}
          >
            <PremiumImage
              src={image}
              alt="محاصيل الشاي - أجواء المحل"
              aspectRatio="4/3"
              placeholderSrc={blurData || undefined}
              wrapperClassName="about-image-wrap"
            />
          </motion.div>

          <motion.div
            className="about-text"
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ ...springSoft, delay: 0.08 }}
          >
            <div className="about-divider" aria-hidden="true" />
            <h3>{heading}</h3>

            {paragraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}

            <div className="about-stats">
              {STATS.map((stat) => (
                <div key={stat.label} className="about-stat">
                  <span className="stat-number">{stat.number}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
