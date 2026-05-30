import { useState, useEffect, useCallback, memo, useRef } from 'react'
import { motion } from 'framer-motion'
import { useCartActions } from '../store/cartStore'
import { supabase } from '../lib/supabase'
import { debounce } from '../lib/performance'
import { stripEmojis, formatPrice } from '../lib/utils'
import { springSnappy } from '../lib/motion'
import IconRenderer from './IconRenderer'
import PremiumImage from './ui/PremiumImage'
import { normalizeMenuItem } from '../lib/normalizeMenuItem'

const MenuCard = memo(function MenuCard({ item, onAdd }) {
  const handleAdd = useCallback(() => {
    onAdd(normalizeMenuItem(item))
  }, [item, onAdd])

  return (
    <motion.article
      className="menu-card"
      layout
      initial={false}
      whileHover={{ y: -6 }}
      transition={springSnappy}
    >
      <div className="menu-card-img">
        <PremiumImage
          src={item.image}
          alt={item.name}
          aspectRatio="5/4"
          wrapperClassName="menu-card-image-wrap"
          placeholderSrc={item.blurData || undefined}
        />
        {item.tag && <span className="card-tag">{item.tag}</span>}
      </div>
      <div className="menu-card-body">
        <h3>{item.name}</h3>
        {item.nameEn && <span className="card-name-en">{item.nameEn}</span>}
        <p className="card-desc">{item.description}</p>
        <div className="menu-card-footer">
          <span className="price">
            {formatPrice(item.price)} <small>ر.س</small>
          </span>
          <button
            type="button"
            className="add-to-cart-btn"
            onClick={handleAdd}
            aria-label={`أضف ${item.name} إلى السلة`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            أضف
          </button>
        </div>
      </div>
    </motion.article>
  )
})

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [menuItems, setMenuItems] = useState([])
  const [categories, setCategories] = useState([{ id: 'all', name: 'الكل' }])
  const [loading, setLoading] = useState(true)
  const menuGridRef = useRef(null)
  const tabsRef = useRef(null)
  const highlightRef = useRef(null)
  const { addItem } = useCartActions()

  useEffect(() => {
    let cancelled = false

    const fetchData = async () => {
      const [menuRes, catRes] = await Promise.all([
        supabase.from('menu_items').select('*').order('created_at', { ascending: true }),
        supabase.from('menu_categories').select('*').order('created_at', { ascending: true }),
      ])

      if (cancelled) return

      if (menuRes.data) {
        setMenuItems(
          menuRes.data
            .filter((item) => !item.category.startsWith('__'))
            .map(normalizeMenuItem)
        )
      }
      if (catRes.data) {
        setCategories([
          { id: 'all', name: 'الكل', icon: '' },
          ...catRes.data.map((c) => ({ id: c.name, name: c.name, icon: c.icon })),
        ])
      }
      setLoading(false)
    }

    const debouncedFetch = debounce(fetchData, 300)
    fetchData()

    const channel = supabase
      .channel('menu-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'menu_items' },
        debouncedFetch
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'menu_categories' },
        debouncedFetch
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [])

  const filteredItems =
    activeCategory === 'all'
      ? menuItems
      : menuItems.filter((item) => item.category === activeCategory)

  const updateHighlight = useCallback(() => {
    const tabs = tabsRef.current
    const highlight = highlightRef.current
    if (!tabs || !highlight) return

    const activeButton = tabs.querySelector(`button[data-cat="${activeCategory}"]`)
    if (!activeButton) return

    const left = activeButton.offsetLeft
    const width = activeButton.offsetWidth

    highlight.style.width = `${width}px`
    highlight.style.transform = `translateX(${left}px)`
  }, [activeCategory])

  useEffect(() => {
    updateHighlight()
    window.addEventListener('resize', updateHighlight)
    return () => window.removeEventListener('resize', updateHighlight)
  }, [updateHighlight])

  return (
    <section className="menu-section" id="menu" aria-labelledby="menu-heading">
      <div className="container">
        <h2 id="menu-heading" className="section-title">
          قائمة الأصناف
        </h2>
        <p className="section-subtitle">
          استمتع بتشكيلة فريدة من القهوة المختصة والحلويات المميزة المحضرة يومياً بكل حب
        </p>

        <div className="menu-tabs" role="tablist" aria-label="أقسام المنيو" ref={tabsRef}>
          <span className="menu-tab-highlight" ref={highlightRef} aria-hidden="true" />
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              data-cat={cat.id}
              aria-selected={activeCategory === cat.id}
              className={`menu-tab ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => {
                setActiveCategory(cat.id)
                menuGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
            >
              {cat.icon && <IconRenderer iconStr={cat.icon} size={18} />}
              {stripEmojis(cat.name)}
            </button>
          ))}
        </div>

        <div className="menu-grid" role="tabpanel" ref={menuGridRef}>
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton-card" aria-hidden="true">
                <div className="skeleton-img" />
                <div className="skeleton-text">
                  <div className="skeleton-line" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line" />
                </div>
              </div>
            ))
          ) : filteredItems.length === 0 ? (
            <p className="menu-empty" role="status">
              لا توجد أصناف في هذا القسم حالياً.
            </p>
          ) : (
            filteredItems.map((item) => (
              <MenuCard key={item.id} item={item} onAdd={addItem} />
            ))
          )}
        </div>
      </div>
    </section>
  )
}
