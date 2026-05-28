import { testimonials } from '../data/menuData'

export default function Testimonials() {
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'star filled' : 'star'}>★</span>
    ))
  }

  return (
    <section id="testimonials" className="testimonials-section">
      <div className="container">
        <h2 className="section-title section-title-light">آراء عملائنا</h2>
        <p className="section-subtitle section-subtitle-light">
          ما يقوله عملاؤنا عن تجربتهم في برانزاك
        </p>

        <div className="testimonials-grid">
          {testimonials.map((review) => (
            <div key={review.id} className="testimonial-card reveal">
              <div className="testimonial-quote">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" opacity="0.15">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                </svg>
              </div>
              <div className="testimonial-stars">
                {renderStars(review.rating)}
              </div>
              <p className="testimonial-text">{review.text}</p>
              <div className="testimonial-author">
                <div className="author-avatar">
                  {review.name.charAt(0)}
                </div>
                <div className="author-info">
                  <span className="author-name">{review.name}</span>
                  <span className="author-date">{review.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
