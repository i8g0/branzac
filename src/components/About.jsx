import { motion } from 'framer-motion'
import { useSiteAbout } from '../hooks/useSiteAbout'
import PremiumImage from './ui/PremiumImage'
import { springSoft } from '../lib/motion'

const DEFAULTS = {
  heading: 'شغفنا بالقهوة المختصة',
  description: `في برانزاك، نؤمن بأن القهوة ليست مجرد مشروب — إنها تجربة متكاملة. نختار بعناية أجود حبوب البن من إثيوبيا وكولومبيا والبرازيل، ونحمّصها بأسلوب حرفي يُبرز أفضل نكهاتها. من المزرعة إلى فنجانك، نحرص على كل تفصيلة لنقدّم لك تجربة قهوة استثنائية في قلب الرياض.

صمّمنا مقهانا ليكون أكثر من مجرد مكان لشرب القهوة. أجواء فريدة تجمع بين الراحة والإلهام، مع مساحة عمل مشتركة مجهّزة بكل ما يحتاجه المحترفون وعشّاق القهوة. سواء كنت تبحث عن لحظة هدوء أو مكان إنتاجي، برانزاك هو وجهتك المثالية.`,
  image: '/images/cafe-interior.png',
}

const STATS = [
  { number: '+١٠٠٠', label: 'عميل سعيد' },
  { number: '+١٤', label: 'صنف مميز' },
  { number: '٢٠٢٣', label: 'سنة التأسيس' },
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
          شغف حقيقي بالقهوة المختصة منذ اليوم الأول
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
              alt="برانزاك - أجواء الكافيه"
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
