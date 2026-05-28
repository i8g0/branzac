import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const DEFAULT_HEADING = 'شغفنا بالقهوة المختصة'
const DEFAULT_DESC = `في برانزاك، نؤمن بأن القهوة ليست مجرد مشروب — إنها تجربة متكاملة. نختار بعناية أجود حبوب البن من إثيوبيا وكولومبيا والبرازيل، ونحمّصها بأسلوب حرفي يُبرز أفضل نكهاتها. من المزرعة إلى فنجانك، نحرص على كل تفصيلة لنقدّم لك تجربة قهوة استثنائية في قلب الرياض.

صمّمنا مقهانا ليكون أكثر من مجرد مكان لشرب القهوة. أجواء فريدة تجمع بين الراحة والإلهام، مع مساحة عمل مشتركة مجهّزة بكل ما يحتاجه المحترفون وعشّاق القهوة. سواء كنت تبحث عن لحظة هدوء أو مكان إنتاجي، برانزاك هو وجهتك المثالية.`

export default function About() {
  const [aboutData, setAboutData] = useState(null)

  useEffect(() => {
    const fetchAboutData = async () => {
      const { data } = await supabase
        .from('menu_items')
        .select('*')
        .eq('category', '__site_about__')
        .single()
      if (data) {
        setAboutData(data)
      }
    }
    fetchAboutData()

    // Listen for realtime changes
    const channel = supabase
      .channel('about-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items', filter: 'category=eq.__site_about__' }, () => {
        fetchAboutData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const headingText = aboutData?.name || DEFAULT_HEADING
  const descText = aboutData?.description || DEFAULT_DESC
  const imageUrl = aboutData?.image || '/images/cafe-interior.png'

  const paragraphs = descText.split('\n').filter(p => p.trim() !== '')

  return (
    <section id="about" className="about-section">
      <div className="container">
        <h2 className="section-title section-title-light">قصتنا</h2>
        <p className="section-subtitle section-subtitle-light">شغف حقيقي بالقهوة المختصة منذ اليوم الأول</p>

        <div className="about-grid">
          <div className="about-image reveal">
            <img
              src={imageUrl}
              alt="برانزاك - أجواء الكافيه"
              loading="lazy"
            />
          </div>

          <div className="about-text reveal">
            <div className="about-divider"></div>
            <h3>{headingText}</h3>
            
            {paragraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}

            <div className="about-stats">
              <div className="about-stat">
                <span className="stat-number">+١٠٠٠</span>
                <span className="stat-label">عميل سعيد</span>
              </div>
              <div className="about-stat">
                <span className="stat-number">+١٤</span>
                <span className="stat-label">صنف مميز</span>
              </div>
              <div className="about-stat">
                <span className="stat-number">٢٠٢٣</span>
                <span className="stat-label">سنة التأسيس</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
