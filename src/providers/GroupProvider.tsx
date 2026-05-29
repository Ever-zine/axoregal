import { createContext, useContext, useCallback, ReactNode } from 'react'
import { useMatch } from '@/hooks/useMatch'
import { fetchGroupWithMembers } from '@/services/matching'
import { useAuth } from '@/providers/AuthProvider'
import type { MatchGroup } from '@/services/matching'

interface GroupContextValue {
  group: MatchGroup | null
  isLoadingGroup: boolean
  isChef: boolean
  clearGroup: () => void
  leaveGroup: () => Promise<void>
  refreshGroup: () => Promise<void>
}

const GroupContext = createContext<GroupContextValue | null>(null)

export function GroupProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { group, isLoading, clearGroup, leaveGroup, setGroup } = useMatch()

  const isChef = !!group && !!user && group.created_by === user.id

  const refreshGroup = useCallback(async () => {
    if (!group) return
    const updated = await fetchGroupWithMembers(group.id)
    setGroup(updated)
  }, [group, setGroup])

  return (
    <GroupContext.Provider value={{ group, isLoadingGroup: isLoading, isChef, clearGroup, leaveGroup, refreshGroup }}>
      {children}
    </GroupContext.Provider>
  )
}

export function useGroup(): GroupContextValue {
  const ctx = useContext(GroupContext)
  if (!ctx) throw new Error('useGroup doit être utilisé dans <GroupProvider>')
  return ctx
}
