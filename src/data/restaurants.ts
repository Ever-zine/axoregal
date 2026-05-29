export type Diet = 'all' | 'vegetarian' | 'vegan' | 'gluten_free'
export type PriceRange = 'low' | 'medium' | 'high'

export interface Restaurant {
  id: string
  name: string
  category_id: string
  address: string
  distanceMeters: number
  rating: number
  price: PriceRange
  diets: Diet[]
  emoji: string
  hours: string
  phone?: string
}

export const RESTAURANTS: Restaurant[] = [
  // Burger
  { id: 'b1', name: 'Big Fernand', category_id: 'burger', address: '55 rue du Faubourg Poissoniere, 75009', distanceMeters: 280, rating: 4.5, price: 'medium', diets: ['all'], emoji: '🍔', hours: 'Lun-Dim 11h30-22h30' },
  { id: 'b2', name: 'Blend Hamburger', category_id: 'burger', address: '44 rue Argout, 75002', distanceMeters: 650, rating: 4.3, price: 'medium', diets: ['all', 'gluten_free'], emoji: '🍔', hours: 'Lun-Sam 12h-22h' },
  { id: 'b3', name: 'PNY Nation', category_id: 'burger', address: '50 rue du Faubourg Saint-Denis, 75010', distanceMeters: 950, rating: 4.1, price: 'low', diets: ['all'], emoji: '🍔', hours: 'Lun-Dim 11h-23h' },

  // Sushi
  { id: 's1', name: 'Sushi Shop', category_id: 'sushi', address: '18 rue de Rivoli, 75004', distanceMeters: 320, rating: 4.2, price: 'medium', diets: ['all', 'gluten_free'], emoji: '🍣', hours: 'Lun-Dim 11h-22h' },
  { id: 's2', name: 'Hana Sushi', category_id: 'sushi', address: '3 place de la Bastille, 75011', distanceMeters: 700, rating: 4.6, price: 'high', diets: ['all'], emoji: '🍣', hours: 'Mar-Dim 12h-14h, 19h-22h30' },
  { id: 's3', name: 'Matsuri', category_id: 'sushi', address: '36 rue de la Bienfaisance, 75008', distanceMeters: 1200, rating: 3.9, price: 'medium', diets: ['all'], emoji: '🍣', hours: 'Lun-Sam 12h-14h30, 19h-22h' },

  // Pizza
  { id: 'p1', name: 'Ober Mamma', category_id: 'pizza', address: '107 boulevard Richard Lenoir, 75011', distanceMeters: 450, rating: 4.7, price: 'medium', diets: ['all', 'vegetarian'], emoji: '🍕', hours: 'Lun-Dim 12h-14h30, 19h-23h' },
  { id: 'p2', name: 'Pizza Chic', category_id: 'pizza', address: '13 rue de Mezieres, 75006', distanceMeters: 800, rating: 4.4, price: 'high', diets: ['all', 'vegetarian'], emoji: '🍕', hours: 'Lun-Sam 12h-14h, 19h-22h30' },
  { id: 'p3', name: 'Popolare', category_id: 'pizza', address: '111 rue Reaumur, 75002', distanceMeters: 550, rating: 4.5, price: 'low', diets: ['all', 'vegetarian', 'vegan'], emoji: '🍕', hours: 'Lun-Sam 12h-15h, 19h-22h30' },

  // Tacos
  { id: 't1', name: 'Candelaria', category_id: 'tacos', address: '52 rue de Saintonge, 75003', distanceMeters: 380, rating: 4.4, price: 'low', diets: ['all', 'vegetarian'], emoji: '🌮', hours: 'Lun-Dim 12h-23h30' },
  { id: 't2', name: 'El Nopal', category_id: 'tacos', address: '3 rue Eugene Varlin, 75010', distanceMeters: 900, rating: 4.2, price: 'low', diets: ['all', 'vegetarian', 'vegan'], emoji: '🌮', hours: 'Lun-Sam 12h-22h' },

  // Ramen
  { id: 'r1', name: 'Kodawari Ramen', category_id: 'ramen', address: '37 rue Mazarine, 75006', distanceMeters: 620, rating: 4.8, price: 'medium', diets: ['all'], emoji: '🍜', hours: 'Lun-Dim 12h-14h30, 19h-22h30' },
  { id: 'r2', name: 'Ramen Ya', category_id: 'ramen', address: '23 rue des Canettes, 75006', distanceMeters: 1100, rating: 4.3, price: 'medium', diets: ['all'], emoji: '🍜', hours: 'Mar-Dim 12h-15h, 19h-22h' },
  { id: 'r3', name: 'Tondou Ramen', category_id: 'ramen', address: '15 rue Therese, 75001', distanceMeters: 400, rating: 4.1, price: 'low', diets: ['all'], emoji: '🍜', hours: 'Lun-Sam 11h30-22h' },

  // Salade
  { id: 'sa1', name: 'Exki', category_id: 'salade', address: '25 rue du Louvre, 75001', distanceMeters: 200, rating: 3.8, price: 'medium', diets: ['all', 'vegetarian', 'vegan', 'gluten_free'], emoji: '🥗', hours: 'Lun-Ven 8h-20h, Sam 10h-18h' },
  { id: 'sa2', name: 'Cosi', category_id: 'salade', address: '54 rue de Seine, 75006', distanceMeters: 750, rating: 4.2, price: 'medium', diets: ['all', 'vegetarian'], emoji: '🥗', hours: 'Lun-Sam 11h-21h' },
  { id: 'sa3', name: 'Wild & the Moon', category_id: 'salade', address: '55 rue Charlot, 75003', distanceMeters: 850, rating: 4.5, price: 'medium', diets: ['vegetarian', 'vegan', 'gluten_free'], emoji: '🥗', hours: 'Lun-Dim 8h30-19h' },

  // Poulet
  { id: 'po1', name: 'Le Coq Rico', category_id: 'poulet', address: '98 rue Lepic, 75018', distanceMeters: 1500, rating: 4.7, price: 'high', diets: ['all', 'gluten_free'], emoji: '🍗', hours: 'Lun-Dim 12h-14h30, 19h-22h30' },
  { id: 'po2', name: 'Clover Grill', category_id: 'poulet', address: '6 rue Bailleul, 75001', distanceMeters: 430, rating: 4.4, price: 'high', diets: ['all'], emoji: '🍗', hours: 'Mar-Sam 12h-14h, 19h-21h30' },
  { id: 'po3', name: 'Chicken Avenue', category_id: 'poulet', address: '12 avenue de Opera, 75001', distanceMeters: 280, rating: 3.9, price: 'low', diets: ['all'], emoji: '🍗', hours: 'Lun-Dim 11h-22h' },

  // Steak
  { id: 'st1', name: "Le Relais de l'Entrecote", category_id: 'steak', address: '15 rue Marbeuf, 75008', distanceMeters: 700, rating: 4.6, price: 'medium', diets: ['all', 'gluten_free'], emoji: '🥩', hours: 'Lun-Dim 12h-14h30, 19h-22h30' },
  { id: 'st2', name: 'Severo', category_id: 'steak', address: '8 rue des Plantes, 75014', distanceMeters: 1800, rating: 4.8, price: 'high', diets: ['all'], emoji: '🥩', hours: 'Mar-Sam 12h-14h, 19h30-22h' },
  { id: 'st3', name: 'Le Ribouldingue', category_id: 'steak', address: '10 rue Saint-Julien-le-Pauvre, 75005', distanceMeters: 900, rating: 4.3, price: 'medium', diets: ['all'], emoji: '🥩', hours: 'Mar-Sam 12h-15h, 19h-22h' },
]
