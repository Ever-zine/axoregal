import { supabase } from '@/lib/supabase'

export interface ChatMessage {
  id: string
  group_id: string
  user_id: string
  content: string
  created_at: string
  profiles: {
    name: string
    avatar_url: string | null
  } | null
}

export async function fetchMessages(groupId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('id, group_id, user_id, content, created_at, profiles(name, avatar_url)')
    .eq('group_id', groupId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as unknown as ChatMessage[]
}

export async function sendMessage(
  groupId: string,
  userId: string,
  content: string,
): Promise<void> {
  const trimmed = content.trim()
  if (!trimmed) return
  const { error } = await supabase
    .from('messages')
    .insert({ group_id: groupId, user_id: userId, content: trimmed })
  if (error) throw error
}
