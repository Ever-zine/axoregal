import { useQuery } from '@tanstack/react-query'
import { getUserHistory } from '@/services/history'
import { useAuth } from '@/providers/AuthProvider'

export function useUserHistory() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['user-history', user?.id],
    queryFn: () => getUserHistory(user!.id),
    enabled: !!user,
    staleTime: 60_000,
  })
}
