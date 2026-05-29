import { supabase } from '@/lib/supabase'

export interface Contest {
  id: string
  group_id: string
  challenger: string
  chef: string
  status: 'pending' | 'accepted' | 'declined' | 'running' | 'finished'
  challenger_score: number | null
  chef_score: number | null
  winner: string | null
  created_at: string
  finished_at: string | null
}

export async function challengeChef(
  groupId: string,
  challengerId: string,
  chefId: string,
): Promise<Contest> {
  const { data, error } = await supabase
    .from('contests')
    .insert({ group_id: groupId, challenger: challengerId, chef: chefId })
    .select()
    .single()
  if (error) throw error
  return data as Contest
}

export async function acceptContest(contestId: string): Promise<void> {
  const { error } = await supabase.rpc('accept_contest', { p_contest_id: contestId })
  if (error) throw error
}

export async function declineContest(contestId: string): Promise<void> {
  const { error } = await supabase
    .from('contests')
    .update({ status: 'declined' })
    .eq('id', contestId)
  if (error) throw error
}

export async function finishContest(
  contestId: string,
  challengerScore: number,
  chefScore: number,
): Promise<void> {
  const { error } = await supabase.rpc('finish_contest', {
    p_contest_id: contestId,
    p_challenger_score: challengerScore,
    p_chef_score: chefScore,
  })
  if (error) throw error
}

export async function fetchActiveContest(groupId: string): Promise<Contest | null> {
  const { data, error } = await supabase
    .from('contests')
    .select('*')
    .eq('group_id', groupId)
    .in('status', ['pending', 'accepted', 'running'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data as Contest | null
}
