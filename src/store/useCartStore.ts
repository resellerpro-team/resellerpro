import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartItem } from '@/types'

interface CartStore {
  items: CartItem[]
  shopSlug: string | null
  isOpen: boolean
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  getItemCount: () => number
  getSubtotal: () => number
  setShopSlug: (slug: string) => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      shopSlug: null,
      isOpen: false,

      addItem: (newItem) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.productId === newItem.productId
          )
          if (existingIndex >= 0) {
            const updatedItems = [...state.items]
            const existing = updatedItems[existingIndex]
            const newQty = existing.quantity + newItem.quantity
            // Respect stock limit if provided
            const maxQty = newItem.stockQuantity ?? Infinity
            updatedItems[existingIndex] = {
              ...existing,
              quantity: Math.min(newQty, maxQty),
            }
            return { items: updatedItems, isOpen: true }
          }
          return { items: [...state.items, newItem], isOpen: true }
        })
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }))
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          ),
        }))
      },

      clearCart: () => set({ items: [], isOpen: false }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      getItemCount: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),

      getSubtotal: () =>
        get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        ),

      setShopSlug: (slug) => set({ shopSlug: slug }),
    }),
    {
      name: 'rp-cart',
      storage: createJSONStorage(() => localStorage),
      // Only persist items and shopSlug — not UI state
      partialize: (state) => ({
        items: state.items,
        shopSlug: state.shopSlug,
      }),
    }
  )
)
