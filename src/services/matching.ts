import { supabase } from '@/lib/supabase'

export interface GroupMember {
  id: string
  name: string
  avatar_url: string | null
}

export interface MatchGroup {
  id: string
  category_id: string
  session_date: string
  members: GroupMember[]
}

export async function getMyTodayGroup(userId: string): Promise<MatchGroup | null> {
  const { data, error } = await supabase
    .from('group_members')
    .select('group_id, groups(id, category_id, session_date)')
    .eq('user_id', userId)
    .eq('groups.session_date', today())
    .maybeSingle()

  if (error) throw error
  if (!data?.groups) return null

  const group = data.groups as unknown as { id: string; category_id: string; session_date: string }
  return fetchGroupWithMembers(group.id)
}

export async function fetchGroupWithMembers(groupId: string): Promise<MatchGroup> {
  const { data: group, error: gErr } = await supabase
    .from('groups')
    .select('id, category_id, session_date')
    .eq('id', groupId)
    .single()
  if (gErr) throw gErr

  const { data: members, error: mErr } = await supabase
    .from('group_members')
    .select('profiles(id, name, avatar_url)')
    .eq('group_id', groupId)
  if (mErr) throw mErr

  return {
    ...group,
    members: (members ?? []).flatMap((r) =>
      r.profiles ? [r.profiles as unknown as GroupMember] : [],
    ),
  }
}

export async function joinRandomGroup(userId: string): Promise<MatchGroup> {
  const { data, error } = await supabase.rpc('join_random_group', { p_user_id: userId })
  if (error) throw error
  const row = (data as { group_id: string; category_id: string }[])[0]
  return fetchGroupWithMembers(row.group_id)
}

function today() {
  return new Date().toISOString().split('T')[0]
}
