import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { recordSwipe, getTodayRightSwipes, type SwipeMember } from '@/services/swipes'
import { useAuth } from '@/providers/AuthProvider'

// Avatars en temps réel pour une catégorie donnée
export function useCategoryMembers(categoryId: string) {
  const qc = useQueryClient()
  const key = ['swipe-members', categoryId]

  const query = useQuery({
    queryKey: key,
    queryFn: () => getTodayRightSwipes(categoryId),
    staleTime: 30_000,
  })

  // Réception temps réel des nouveaux swipes droite
  useEffect(() => {
    const channel = supabase
      .channel(`swipes-${categoryId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'swipes', filter: `category_id=eq.${categoryId}` },
        () => qc.invalidateQueries({ queryKey: key }),
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [categoryId, qc]) // eslint-disable-line react-hooks/exhaustive-deps

  return query
}

// Swipes déjà effectués aujourd'hui (pour ne pas re-proposer les catégories)
export function useTodaySwipedIds(): Set<string> {
  const { user } = useAuth()
  const [swipedIds, setSwipedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!user) return
    supabase
      .from('swipes')
      .select('category_id')
      .eq('user_id', user.id)
      .eq('session_date', new Date().toISOString().split('T')[0])
      .then(({ data }) => {
        if (data) setSwipedIds(new Set(data.map((r) => r.category_id)))
      })
  }, [user])

  return swipedIds
}

// Mutation pour enregistrer un swipe
export function useRecordSwipe() {
  const { user } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ categoryId, direction }: { categoryId: string; direction: 'left' | 'right' }) => {
      if (!user) throw new Error('Non authentifié')
      return recordSwipe(user.id, categoryId, direction)
    },
    onSuccess: (_, { categoryId }) => {
      qc.invalidateQueries({ queryKey: ['swipe-members', categoryId] })
    },
  })
}

export type { SwipeMember }
