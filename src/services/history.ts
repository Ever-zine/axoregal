import { supabase } from '@/lib/supabase'
import type { GroupMember } from '@/services/matching'

export interface UserHistoryItem {
  groupId: string
  groupName: string
  categoryId: string
  sessionDate: string
  createdBy: string | null
  joinedAt: string | null
  swipeDirection: 'left' | 'right' | null
  swipedAt: string | null
  members: GroupMember[]
}

interface MembershipRow {
  group_id: string
  joined_at: string
}

interface SwipeRow {
  group_id: string
  direction: 'left' | 'right'
  swiped_at: string
  session_date: string
}

interface GroupRow {
  id: string
  name: string
  category_id: string
  session_date: string
  created_by: string | null
}

export async function getUserHistory(userId: string): Promise<UserHistoryItem[]> {
  const [membershipsRes, swipesRes] = await Promise.all([
    supabase
      .from('group_members')
      .select('group_id, joined_at')
      .eq('user_id', userId),
    supabase
      .from('swipes')
      .select('group_id, direction, swiped_at, session_date')
      .eq('user_id', userId),
  ])

  if (membershipsRes.error) throw membershipsRes.error
  if (swipesRes.error) throw swipesRes.error

  const memberships = (membershipsRes.data ?? []) as MembershipRow[]
  const swipes = (swipesRes.data ?? []) as SwipeRow[]
  const groupIds = Array.from(new Set([
    ...memberships.map((m) => m.group_id),
    ...swipes.map((s) => s.group_id),
  ]))

  if (groupIds.length === 0) return []

  const [groupsRes, groupMembersRes] = await Promise.all([
    supabase
      .from('groups')
      .select('id, name, category_id, session_date, created_by')
      .in('id', groupIds),
    supabase
      .from('group_members')
      .select('group_id, profiles(id, name, avatar_url)')
      .in('group_id', groupIds),
  ])

  if (groupsRes.error) throw groupsRes.error
  if (groupMembersRes.error) throw groupMembersRes.error

  const membershipsByGroup = new Map(memberships.map((m) => [m.group_id, m]))
  const swipesByGroup = new Map(swipes.map((s) => [s.group_id, s]))
  const membersByGroup = new Map<string, GroupMember[]>()

  for (const row of groupMembersRes.data ?? []) {
    if (!row.profiles) continue
    const current = membersByGroup.get(row.group_id) ?? []
    current.push(row.profiles as unknown as GroupMember)
    membersByGroup.set(row.group_id, current)
  }

  return ((groupsRes.data ?? []) as GroupRow[])
    .map((group) => {
      const membership = membershipsByGroup.get(group.id)
      const swipe = swipesByGroup.get(group.id)

      return {
        groupId: group.id,
        groupName: group.name,
        categoryId: group.category_id,
        sessionDate: group.session_date,
        createdBy: group.created_by,
        joinedAt: membership?.joined_at ?? null,
        swipeDirection: swipe?.direction ?? null,
        swipedAt: swipe?.swiped_at ?? null,
        members: membersByGroup.get(group.id) ?? [],
      }
    })
    .sort((a, b) => historyTimestamp(b) - historyTimestamp(a))
}

function historyTimestamp(item: UserHistoryItem): number {
  return new Date(item.joinedAt ?? item.swipedAt ?? item.sessionDate).getTime()
}
