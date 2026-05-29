import { supabase } from '@/lib/supabase'

export interface SwipeMember {
  id: string
  name: string
  avatar_url: string | null
}

export async function recordSwipe(
  userId: string,
  categoryId: string,
  direction: 'left' | 'right',
): Promise<void> {
  const { error } = await supabase.from('swipes').upsert(
    { user_id: userId, category_id: categoryId, direction, session_date: today() },
    { onConflict: 'user_id,category_id,session_date' },
  )
  if (error) throw error
}

export async function getTodayRightSwipes(categoryId: string): Promise<SwipeMember[]> {
  const { data, error } = await supabase
    .from('swipes')
    .select('profiles(id, name, avatar_url)')
    .eq('category_id', categoryId)
    .eq('direction', 'right')
    .eq('session_date', today())

  if (error) throw error
  return (data ?? []).flatMap((row) => (row.profiles ? [row.profiles as unknown as SwipeMember] : []))
}

function today(): string {
  return new Date().toISOString().split('T')[0]
}
