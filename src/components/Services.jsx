export default function Services() {
  const services = [
    {
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 7h.01"/><path d="M17 7h.01"/><path d="M7 17h.01"/><path d="M17 17h.01"/>
        </svg>
      ),
      title: 'اطلب عبر QR Code',
      description: 'امسح الكود على طاولتك، تصفّح المنيو، واطلب مباشرة من جوالك. طلبك يوصلك على طاولتك بدون انتظار.'
    },
    {
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
      ),
      title: 'مساحة عمل مشتركة',
      description: 'بيئة عمل مثالية مع إنترنت فائق السرعة، منافذ شحن متعددة، ومناطق هادئة مصممة للإنتاجية والإبداع.'
    }
  ]

  return (
    <section id="services" className="services-section">
      <div className="container">
        <h2 className="section-title">خدماتنا</h2>
        <p className="section-subtitle">نقدّم أكثر من مجرد قهوة — نقدّم تجربة متكاملة</p>

        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-card reveal">
              <div className="service-icon">
                {service.icon}
              </div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <a href="#contact" className="service-link">
                تواصل معنا
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                </svg>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
