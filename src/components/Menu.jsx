import React, { useState, useRef, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { supabase } from '../lib/supabase'
import IconRenderer from './IconRenderer'
import { stripEmojis } from '../lib/utils'

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [menuItems, setMenuItems] = useState([])
  const [categories, setCategories] = useState([{ id: 'all', name: 'الكل' }])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()

  useEffect(() => {
    const fetchData = async () => {
      const [menuRes, catRes] = await Promise.all([
        supabase.from('menu_items').select('*').order('created_at', { ascending: true }),
        supabase.from('menu_categories').select('*').order('created_at', { ascending: true })
      ])
      
      if (menuRes.data) {
        const actualItems = menuRes.data.filter(item => !item.category.startsWith('__'))
        setMenuItems(actualItems)
      }
      if (catRes.data) {
        setCategories([{ id: 'all', name: 'الكل', icon: '' }, ...catRes.data.map(c => ({ id: c.name, name: c.name, icon: c.icon }))])
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const filteredItems = activeCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === activeCategory)

  return (
    <section className="menu-section" id="menu">
      <div className="container">
        <h2 className="section-title">قائمة الأصناف</h2>
        <p className="section-subtitle">استمتع بتشكيلة فريدة من القهوة المختصة والحلويات المميزة المحضرة يومياً بكل حب</p>

        <div className="menu-tabs">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`menu-tab ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              {cat.icon && <IconRenderer iconStr={cat.icon} size={18} />}
              {stripEmojis(cat.name)}
            </button>
          ))}
        </div>

        <div className="menu-grid">
          {loading ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              جاري تحميل المنيو...
            </div>
          ) : filteredItems.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              لا توجد أصناف في هذا القسم حالياً.
            </div>
          ) : (
            filteredItems.map(item => (
              <MenuCard key={item.id} item={item} onAdd={addItem} />
            ))
          )}
        </div>
      </div>
    </section>
  )
}

const MenuCard = React.memo(({ item, onAdd }) => {
  const [imgLoaded, setImgLoaded] = useState(false)
  const cardRef = useRef(null)

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    cardRef.current.style.setProperty('--mouse-x', `${x}px`)
    cardRef.current.style.setProperty('--mouse-y', `${y}px`)
  }

  return (
    <div className="menu-card" ref={cardRef} onMouseMove={handleMouseMove}>
      <div className="menu-card-img" style={{ overflow: 'hidden', background: 'var(--beige-dark)' }}>
        <img
          src={item.image}
          alt={item.name}
          onLoad={() => setImgLoaded(true)}
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            filter: imgLoaded ? 'blur(0)' : 'blur(20px)',
            transform: imgLoaded ? 'scale(1)' : 'scale(1.1)',
            opacity: imgLoaded ? 1 : 0, 
            transition: 'filter 0.8s ease-out, transform 0.8s ease-out, opacity 0.4s ease'
          }}
        />
      </div>
      <div className="menu-card-body">
        <h3>{item.name}</h3>
        <span className="card-name-en">{item.nameEn}</span>
        <p className="card-desc">{item.description}</p>
        <div className="menu-card-footer">
          <span className="price">
            {item.price} <small>ر.س</small>
          </span>
          <button
            className="add-to-cart-btn"
            onClick={() => onAdd(item)}
            aria-label={`أضف ${item.name} إلى السلة`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            أضف
          </button>
        </div>
      </div>
    </div>
  )
})
