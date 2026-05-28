import { createContext, useContext, useState, useCallback } from 'react'

const CartContext = createContext()

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [toast, setToast] = useState(null)

  const addItem = useCallback((product) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
    setToast({ message: `تمت إضافة ${product.name} إلى السلة`, id: Date.now() })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const removeItem = useCallback((id) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }, [])

  const updateQuantity = useCallback((id, delta) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item
      const newQty = item.quantity + delta
      return newQty <= 0 ? null : { ...item, quantity: newQty }
    }).filter(Boolean))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  return (
    <CartContext.Provider value={{
      items, isOpen, toast,
      setIsOpen, addItem, removeItem, updateQuantity, clearCart,
      totalItems, totalPrice
    }}>
      {children}
    </CartContext.Provider>
  )
}
