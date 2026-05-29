export type AnimVariant = 'bounce' | 'wiggle' | 'spin'
export type AccessoryType =
  | 'chef-hat' | 'headband' | 'glasses' | 'sombrero'
  | 'steam'    | 'bow'      | 'comb'    | 'mustache'

export interface CharacterConfig {
  accessory: AccessoryType
  bodyRadius: string   // CSS border-radius — donne une forme unique
  cheekColor: string   // rougeurs spécifiques au personnage
}

export interface Category {
  id: string
  name: string
  emoji: string
  color: string
  bgColor: string
  anim: AnimVariant
  character: CharacterConfig
}

export const CATEGORIES: Category[] = [
  {
    id: 'burger', name: 'Burger', emoji: '🍔',
    color: '#FF6B35', bgColor: '#2D1200', anim: 'bounce',
    character: { accessory: 'chef-hat', bodyRadius: '50%', cheekColor: '#FF9966' },
  },
  {
    id: 'sushi', name: 'Sushi', emoji: '🍣',
    color: '#FF69B4', bgColor: '#1A0020', anim: 'wiggle',
    character: { accessory: 'headband', bodyRadius: '50% 50% 46% 46% / 54% 54% 46% 46%', cheekColor: '#FF99CC' },
  },
  {
    id: 'pizza', name: 'Pizza', emoji: '🍕',
    color: '#FFD700', bgColor: '#1A1500', anim: 'spin',
    character: { accessory: 'glasses', bodyRadius: '50%', cheekColor: '#FFCC44' },
  },
  {
    id: 'tacos', name: 'Tacos', emoji: '🌮',
    color: '#00E676', bgColor: '#001A0A', anim: 'bounce',
    character: { accessory: 'sombrero', bodyRadius: '50% 50% 44% 44% / 56% 56% 44% 44%', cheekColor: '#66FFAA' },
  },
  {
    id: 'ramen', name: 'Ramen', emoji: '🍜',
    color: '#FF4081', bgColor: '#1A000D', anim: 'wiggle',
    character: { accessory: 'steam', bodyRadius: '48% 48% 52% 52% / 52% 52% 48% 48%', cheekColor: '#FF80AB' },
  },
  {
    id: 'salade', name: 'Salade', emoji: '🥗',
    color: '#69F0AE', bgColor: '#001A0D', anim: 'bounce',
    character: { accessory: 'bow', bodyRadius: '50%', cheekColor: '#B9F6CA' },
  },
  {
    id: 'poulet', name: 'Poulet rôti', emoji: '🍗',
    color: '#FFAB40', bgColor: '#1A0E00', anim: 'spin',
    character: { accessory: 'comb', bodyRadius: '42% 42% 50% 50% / 50% 50% 50% 50%', cheekColor: '#FFCC80' },
  },
  {
    id: 'steak', name: 'Steak', emoji: '🥩',
    color: '#FF5252', bgColor: '#1A0000', anim: 'wiggle',
    character: { accessory: 'mustache', bodyRadius: '50%', cheekColor: '#FF8A80' },
  },
]
