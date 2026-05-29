import { useQuery } from '@tanstack/react-query'
import type { Restaurant } from '@/data/restaurants'

export function useRestaurants() {
  return useQuery<Restaurant[]>({
    queryKey: ['restaurants'],
    queryFn: () => fetch('/restaurants.json').then((r) => r.json()),
    staleTime: Infinity,
  })
}
