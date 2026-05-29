export type AnimVariant = 'bounce' | 'wiggle' | 'spin'

export interface Category {
  id: string
  name: string
  emoji: string
  color: string
  bgColor: string
  anim: AnimVariant
}

export const CATEGORIES: Category[] = [
  { id: 'burger',  name: 'Burger',      emoji: '🍔', color: '#FF6B35', bgColor: '#2D1200', anim: 'bounce' },
  { id: 'sushi',   name: 'Sushi',       emoji: '🍣', color: '#FF69B4', bgColor: '#1A0020', anim: 'wiggle' },
  { id: 'pizza',   name: 'Pizza',       emoji: '🍕', color: '#FFD700', bgColor: '#1A1500', anim: 'spin'   },
  { id: 'tacos',   name: 'Tacos',       emoji: '🌮', color: '#00E676', bgColor: '#001A0A', anim: 'bounce' },
  { id: 'ramen',   name: 'Ramen',       emoji: '🍜', color: '#FF4081', bgColor: '#1A000D', anim: 'wiggle' },
  { id: 'salade',  name: 'Salade',      emoji: '🥗', color: '#69F0AE', bgColor: '#001A0D', anim: 'bounce' },
  { id: 'poulet',  name: 'Poulet rôti', emoji: '🍗', color: '#FFAB40', bgColor: '#1A0E00', anim: 'spin'   },
  { id: 'steak',   name: 'Steak',       emoji: '🥩', color: '#FF5252', bgColor: '#1A0000', anim: 'wiggle' },
]
