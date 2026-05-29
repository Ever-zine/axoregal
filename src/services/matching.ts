import { supabase } from '@/lib/supabase'

export interface GroupMember {
  id: string
  name: string
  avatar_url: string | null
}

export interface MatchGroup {
  id: string
  name: string
  category_id: string
  session_date: string
  created_by: string | null
  members: GroupMember[]
}

export async function getMyTodayGroup(userId: string): Promise<MatchGroup | null> {
  const { data, error } = await supabase
    .from('group_members')
    .select('group_id, groups(id, name, category_id, session_date)')
    .eq('user_id', userId)
    .eq('groups.session_date', today())
    .maybeSingle()

  if (error) throw error
  if (!data?.groups) return null

  const group = data.groups as unknown as { id: string; name: string; category_id: string; session_date: string; created_by: string | null }
  return fetchGroupWithMembers(group.id)
}

export async function fetchGroupWithMembers(groupId: string): Promise<MatchGroup> {
  const { data: group, error: gErr } = await supabase
    .from('groups')
    .select('id, name, category_id, session_date, created_by')
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

export async function createGroup(userId: string, name: string, categoryId: string): Promise<MatchGroup> {
  const { data, error } = await supabase.rpc('create_group', {
    p_user_id: userId,
    p_name: name,
    p_category: categoryId,
  })
  if (error) throw error
  const row = (data as { group_id: string }[])[0]
  return fetchGroupWithMembers(row.group_id)
}

export async function joinRandomGroup(userId: string): Promise<MatchGroup | null> {
  const { data, error } = await supabase.rpc('join_random_group', { p_user_id: userId })
  if (error) throw error
  const rows = data as { group_id: string; category_id: string; group_name: string }[]
  if (!rows || rows.length === 0) return null
  return fetchGroupWithMembers(rows[0].group_id)
}

export async function leaveGroup(userId: string, groupId: string): Promise<void> {
  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('user_id', userId)
    .eq('group_id', groupId)

  if (error) throw error
}

export async function updateGroupInfo(
  groupId: string,
  patch: { name?: string; category_id?: string },
): Promise<void> {
  const { error } = await supabase.from('groups').update(patch).eq('id', groupId)
  if (error) throw error
}

function today() {
  return new Date().toISOString().split('T')[0]
}
