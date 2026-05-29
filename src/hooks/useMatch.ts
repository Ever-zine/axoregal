import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { getMyTodayGroup, fetchGroupWithMembers, leaveGroup as leaveGroupMembership, type MatchGroup } from '@/services/matching'
import { useAuth } from '@/providers/AuthProvider'

interface UseMatchResult {
  group: MatchGroup | null
  isLoading: boolean
  clearGroup: () => void
  leaveGroup: () => Promise<void>
}

export function useMatch(): UseMatchResult {
  const { user } = useAuth()
  const [group, setGroup] = useState<MatchGroup | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) { setIsLoading(false); return }

    // Charge le groupe existant au démarrage
    getMyTodayGroup(user.id)
      .then(setGroup)
      .finally(() => setIsLoading(false))

    // Écoute les nouvelles appartenances en temps réel
    const channel = supabase
      .channel(`match-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_members',
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          const groupId = (payload.new as { group_id: string }).group_id
          const matched = await fetchGroupWithMembers(groupId)
          setGroup(matched)
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'group_members',
          filter: `user_id=eq.${user.id}`,
        },
        () => setGroup(null),
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user])

  const clearGroup = useCallback(() => setGroup(null), [])
  const leaveGroup = useCallback(async () => {
    if (!user || !group) return
    await leaveGroupMembership(user.id, group.id)
    setGroup(null)
  }, [group, user])

  return { group, isLoading, clearGroup, leaveGroup }
}
