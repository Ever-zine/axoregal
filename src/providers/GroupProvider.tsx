import { createContext, useContext, ReactNode } from 'react'
import { useMatch } from '@/hooks/useMatch'
import type { MatchGroup } from '@/services/matching'

interface GroupContextValue {
  group: MatchGroup | null
  isLoadingGroup: boolean
  clearGroup: () => void
  leaveGroup: () => Promise<void>
}

const GroupContext = createContext<GroupContextValue | null>(null)

export function GroupProvider({ children }: { children: ReactNode }) {
  const { group, isLoading, clearGroup, leaveGroup } = useMatch()

  return (
    <GroupContext.Provider value={{ group, isLoadingGroup: isLoading, clearGroup, leaveGroup }}>
      {children}
    </GroupContext.Provider>
  )
}

export function useGroup(): GroupContextValue {
  const ctx = useContext(GroupContext)
  if (!ctx) throw new Error('useGroup doit être utilisé dans <GroupProvider>')
  return ctx
}
