import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { fetchMessages, sendMessage, type ChatMessage } from '@/services/chat'
import { useAuth } from '@/providers/AuthProvider'

export function useChat(groupId: string | undefined) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

  // Charge l'historique du jour (CHAT-06)
  useEffect(() => {
    if (!groupId) return
    setIsLoading(true)
    fetchMessages(groupId)
      .then(setMessages)
      .finally(() => setIsLoading(false))
  }, [groupId])

  // Realtime — nouveaux messages (CHAT-04)
  useEffect(() => {
    if (!groupId) return

    const channel = supabase
      .channel(`chat:${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `group_id=eq.${groupId}`,
        },
        async (payload) => {
          // Enrichit le message avec le profil
          const { data } = await supabase
            .from('messages')
            .select('id, group_id, user_id, content, created_at, profiles(name, avatar_url)')
            .eq('id', (payload.new as { id: string }).id)
            .single()

          if (data) {
            setMessages((prev) => {
              // Évite les doublons (le sender reçoit aussi son propre message via realtime)
              if (prev.some((m) => m.id === data.id)) return prev
              return [...prev, data as unknown as ChatMessage]
            })
          }
        },
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [groupId])

  async function send(content: string) {
    if (!groupId || !user || isSending) return
    setIsSending(true)
    try {
      await sendMessage(groupId, user.id, content)
    } finally {
      setIsSending(false)
    }
  }

  return { messages, isLoading, isSending, send, currentUserId: user?.id }
}

// Hook pour scroller automatiquement vers le bas à chaque nouveau message
export function useScrollToBottom(dep: unknown) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: 'smooth' })
  }, [dep])
  return ref
}
