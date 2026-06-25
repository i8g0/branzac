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
        {item.calories > 0 && (
          <span className="card-calories">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
            {item.calories} سعرة
          </span>
        )}
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
  const [searchQuery, setSearchQuery] = useState('')
  const menuGridRef = useRef(null)
  const tabsRef = useRef(null)
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

  const filteredItems = menuItems.filter((item) => {
    const matchCategory = activeCategory === 'all' || stripEmojis(item.category).trim() === stripEmojis(activeCategory).trim()
    const q = searchQuery.trim().toLowerCase()
    const matchSearch = !q || item.name.toLowerCase().includes(q) || (item.name_en && item.name_en.toLowerCase().includes(q))
    return matchCategory && matchSearch
  })

  return (
    <section className="menu-section" id="menu" aria-labelledby="menu-heading">
      <div className="container">
        <h2 id="menu-heading" className="section-title">
          قائمة الأصناف
        </h2>
        <p className="section-subtitle">
          استمتع بتشكيلة فريدة من الشاي المغربي والمشروبات الساخنة والباردة المحضّرة يومياً بكل حب
        </p>

        <div className="menu-search-wrapper">
          <div className="menu-search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              placeholder="ابحث عن صنف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button type="button" className="menu-search-clear" onClick={() => setSearchQuery('')}>✕</button>
            )}
          </div>
        </div>

        <div className="menu-tabs" role="tablist" aria-label="أقسام المنيو" ref={tabsRef}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              data-cat={cat.id}
              aria-selected={activeCategory === cat.id}
              className={`menu-tab ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={(e) => {
                setActiveCategory(cat.id)
                const tab = e.currentTarget
                const container = tabsRef.current
                if (tab && container) {
                  const tabLeft = tab.offsetLeft
                  const tabWidth = tab.offsetWidth
                  const containerWidth = container.offsetWidth
                  const scrollLeft = tabLeft - (containerWidth / 2) + (tabWidth / 2)
                  container.scrollTo({ left: scrollLeft, behavior: 'smooth' })
                }
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
