import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'

const TOAST_DURATION_MS = 2800

function computeTotals(items) {
  let totalItems = 0
  let totalPrice = 0
  for (const item of items) {
    totalItems += item.quantity
    totalPrice += item.price * item.quantity
  }
  return { totalItems, totalPrice }
}

function pushToast(set, message) {
  const id = Date.now()
  set({ toast: { id, message } })
  setTimeout(() => {
    set((state) => (state.toast?.id === id ? { toast: null } : state))
  }, TOAST_DURATION_MS)
}

function cartItemKey(item) {
  return item.selectedSize ? `${item.id}__${item.selectedSize}` : item.id
}

export const useCartStore = create(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      toast: null,

      setIsOpen: (isOpen) => set({ isOpen }),

      addItem: (product) => {
        set((state) => {
          const key = cartItemKey(product)
          const existing = state.items.find((item) => cartItemKey(item) === key)
          const items = existing
            ? state.items.map((item) =>
                cartItemKey(item) === key
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              )
            : [...state.items, { ...product, quantity: 1, _key: key }]
          return { items }
        })
        const sizeLabel = product.selectedSize ? ` (${product.selectedSize})` : ''
        pushToast(set, `تمت إضافة ${product.name}${sizeLabel} إلى السلة`)
      },

      removeItem: (key) => {
        set((state) => ({
          items: state.items.filter((item) => (item._key || cartItemKey(item)) !== key),
        }))
      },

      updateQuantity: (key, delta) => {
        set((state) => ({
          items: state.items
            .map((item) => {
              const itemKey = item._key || cartItemKey(item)
              if (itemKey !== key) return item
              const newQty = item.quantity + delta
              return newQty <= 0 ? null : { ...item, quantity: newQty }
            })
            .filter(Boolean),
        }))
      },

      clearCart: () => set({ items: [] }),

      dismissToast: () => set({ toast: null }),
    }),
    {
      name: 'mhasel-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
)

/** Cart line items only — avoids re-renders when toast/modal state changes */
export const useCartItems = () => useCartStore((s) => s.items)

export const useCartTotals = () =>
  useCartStore(useShallow((s) => computeTotals(s.items)))

export const useCartUi = () =>
  useCartStore(
    useShallow((s) => ({
      isOpen: s.isOpen,
      toast: s.toast,
      setIsOpen: s.setIsOpen,
      dismissToast: s.dismissToast,
    }))
  )

export const useCartActions = () =>
  useCartStore(
    useShallow((s) => ({
      addItem: s.addItem,
      removeItem: s.removeItem,
      updateQuantity: s.updateQuantity,
      clearCart: s.clearCart,
    }))
  )

/** @deprecated Use granular hooks above */
export function useCart() {
  return useCartStore(
    useShallow((s) => ({
      items: s.items,
      isOpen: s.isOpen,
      toast: s.toast,
      setIsOpen: s.setIsOpen,
      addItem: s.addItem,
      removeItem: s.removeItem,
      updateQuantity: s.updateQuantity,
      clearCart: s.clearCart,
      ...computeTotals(s.items),
    }))
  )
}
