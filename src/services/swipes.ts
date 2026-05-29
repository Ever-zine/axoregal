import { supabase } from '@/lib/supabase'
import type { GroupMember } from '@/services/matching'

export interface AvailableGroup {
  id: string
  name: string
  category_id: string
  session_date: string
  members: GroupMember[]
}

export async function recordSwipe(
  userId: string,
  groupId: string,
  direction: 'left' | 'right',
): Promise<void> {
  const { error } = await supabase.from('swipes').upsert(
    { user_id: userId, group_id: groupId, direction, session_date: today() },
    { onConflict: 'user_id,group_id' },
  )
  if (error) throw error
}

export async function joinGroup(userId: string, groupId: string): Promise<void> {
  const { error } = await supabase
    .from('group_members')
    .insert({ group_id: groupId, user_id: userId })
  if (error) throw error
}

export async function getAvailableGroups(userId: string): Promise<AvailableGroup[]> {
  const dateStr = today()

  // Groupes du jour
  const { data: groups, error: gErr } = await supabase
    .from('groups')
    .select('id, name, category_id, session_date')
    .eq('session_date', dateStr)
  if (gErr) throw gErr

  if (!groups || groups.length === 0) return []

  // IDs des groupes déjà swipés ou rejoints
  const groupIds = groups.map((g) => g.id)

  const [swipesRes, membersRes] = await Promise.all([
    supabase
      .from('swipes')
      .select('group_id')
      .eq('user_id', userId)
      .in('group_id', groupIds),
    supabase
      .from('group_members')
      .select('group_id, profiles(id, name, avatar_url)')
      .in('group_id', groupIds),
  ])

  if (swipesRes.error) throw swipesRes.error
  if (membersRes.error) throw membersRes.error

  const swipedIds = new Set((swipesRes.data ?? []).map((r) => r.group_id))
  const myMembership = new Set(
    (membersRes.data ?? [])
      .filter((r) => (r.profiles as unknown as GroupMember | null)?.id === userId)
      .map((r) => r.group_id),
  )

  // Map des membres par groupe
  const membersByGroup = new Map<string, GroupMember[]>()
  for (const row of membersRes.data ?? []) {
    if (!row.profiles) continue
    const m = row.profiles as unknown as GroupMember
    const arr = membersByGroup.get(row.group_id) ?? []
    arr.push(m)
    membersByGroup.set(row.group_id, arr)
  }

  return groups
    .filter((g) => !swipedIds.has(g.id) && !myMembership.has(g.id))
    .map((g) => ({ ...g, members: membersByGroup.get(g.id) ?? [] }))
}

function today(): string {
  return new Date().toISOString().split('T')[0]
}
