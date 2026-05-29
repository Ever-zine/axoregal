import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { recordSwipe, joinGroup, getAvailableGroups, type AvailableGroup } from '@/services/swipes'
import { useAuth } from '@/providers/AuthProvider'

export function useAvailableGroups() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['available-groups', user?.id],
    queryFn: () => getAvailableGroups(user!.id),
    enabled: !!user,
    staleTime: 30_000,
  })
}

export function useRecordSwipe() {
  const { user } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ groupId, direction }: { groupId: string; direction: 'left' | 'right' }) => {
      if (!user) throw new Error('Non authentifié')
      return recordSwipe(user.id, groupId, direction)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['available-groups', user?.id] })
    },
  })
}

export function useJoinGroup() {
  const { user } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (groupId: string) => {
      if (!user) throw new Error('Non authentifié')
      return joinGroup(user.id, groupId)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['available-groups', user?.id] })
    },
  })
}

export type { AvailableGroup }
