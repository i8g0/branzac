import { useState } from 'react'
import { workingHours } from '../data/menuData'
import { supabase } from '../lib/supabase'

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    
    const { error } = await supabase.from('contact_messages').insert([{
      name: formData.name,
      phone: formData.phone,
      message: formData.message
    }])
    
    setSubmitting(false)
    if (error) {
      console.error(error)
      alert('حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.')
      return
    }

    setSubmitted(true)
    setFormData({ name: '', phone: '', message: '' })
    setTimeout(() => setSubmitted(false), 5000)
  }

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <section id="contact" className="contact-section">
      <div className="container">
        <h2 className="section-title">تواصل معنا</h2>
        <p className="section-subtitle">نسعد بزيارتكم أو تواصلكم معنا في أي وقت</p>

        <div className="contact-grid">
          {/* Contact Form */}
          <div className="contact-form-wrapper reveal">
            <h3>أرسل لنا رسالة</h3>
            {submitted ? (
              <div className="form-success">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#2d6847" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <h4>تم إرسال رسالتك بنجاح!</h4>
                <p>سنتواصل معك في أقرب وقت ممكن</p>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="contact-name">الاسم</label>
                  <input
                    type="text"
                    id="contact-name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="أدخل اسمك الكامل"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contact-phone">رقم الجوال</label>
                  <input
                    type="tel"
                    id="contact-phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="05XXXXXXXX"
                    dir="ltr"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contact-message">الرسالة</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="اكتب رسالتك هنا..."
                    rows="5"
                    required
                  ></textarea>
                </div>
                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                  {!submitting && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Location & Map */}
          <div className="contact-info-wrapper reveal">
            <div className="map-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3625.1!2d46.7758213!3d24.5924183!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2f098fd758cd83%3A0xf64fed1f9a48a01a!2sBRANZAC%20%7C%20%D8%A8%D8%B1%D8%A7%D9%86%D8%B2%D8%A7%D9%83!5e0!3m2!1sar!2ssa!4v1"
                width="100%"
                height="300"
                style={{ border: 0, borderRadius: '16px' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="موقع برانزاك على الخريطة"
              ></iframe>
            </div>

            <div className="contact-details">
              <div className="contact-detail-item">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <div>
                  <strong>العنوان</strong>
                  <p>الرياض، المملكة العربية السعودية</p>
                </div>
              </div>

              <div className="contact-detail-item">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <div>
                  <strong>الهاتف</strong>
                  <p dir="ltr">+966 53 300 4327</p>
                </div>
              </div>

              <div className="contact-detail-item">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <div>
                  <strong>أوقات العمل</strong>
                  {workingHours.map((item, i) => (
                    <p key={i}>{item.day}: {item.hours}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
