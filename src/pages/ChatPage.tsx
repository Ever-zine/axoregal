import { useState, type KeyboardEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useGroup } from '@/providers/GroupProvider'
import { useChat, useScrollToBottom } from '@/hooks/useChat'
import { CATEGORIES } from '@/data/categories'
import { BottomNav } from '@/components/BottomNav/BottomNav'
import { PageTransition } from '@/components/PageTransition/PageTransition'
import type { ChatMessage } from '@/services/chat'
import './ChatPage.scss'

export function ChatPage() {
  const { group } = useGroup()
  const { messages, isLoading, isSending, send, currentUserId } = useChat(group?.id)
  const [input, setInput] = useState('')
  const messagesRef = useScrollToBottom(messages.length)

  // CHAT-01 : redirige si pas de groupe
  if (!group) return <Navigate to="/swipe" replace />

  const category = CATEGORIES.find((c) => c.id === group.category_id) ?? CATEGORIES[0]
  const canSend = input.trim().length > 0 && !isSending

  function handleSend() {
    if (!canSend) return
    send(input)
    setInput('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <PageTransition>
    <div className="flex flex-col h-full bg-bg overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b-[2px] border-black bg-surface">
        <span className="text-3xl">{category.emoji}</span>
        <div className="flex-1 min-w-0">
          <span className="text-cuphead text-base text-secondary block truncate">{category.name}</span>
          <span className="text-xs text-muted">
            {group.members.length} membre{group.members.length !== 1 ? 's' : ''}
          </span>
        </div>
        {/* Avatars membres en miniature */}
        <div className="flex items-center">
          {group.members.slice(0, 4).map((m, i) =>
            m.avatar_url ? (
              <img
                key={m.id}
                src={m.avatar_url}
                alt={m.name}
                className="w-7 h-7 rounded-full border-[2px] border-black object-cover"
                style={{ marginLeft: i === 0 ? 0 : -6 }}
              />
            ) : (
              <div
                key={m.id}
                className="w-7 h-7 rounded-full border-[2px] border-black bg-primary flex items-center justify-center text-[10px] font-display text-text"
                style={{ marginLeft: i === 0 ? 0 : -6 }}
              >
                {m.name.charAt(0)}
              </div>
            ),
          )}
        </div>
      </header>

      {/* Liste des messages */}
      <div
        ref={messagesRef}
        className="messages flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-3"
      >
        {isLoading && (
          <p className="text-center text-muted text-sm py-8">Chargement…</p>
        )}

        {!isLoading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 gap-3 text-center px-6">
            <span className="text-5xl">{category.emoji}</span>
            <p className="text-cuphead text-sm text-muted uppercase">Soyez les premiers à parler !</p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} isOwn={msg.user_id === currentUserId} />
        ))}
      </div>

      {/* Barre d'envoi */}
      <div className="flex-shrink-0 flex items-center gap-2 px-3 py-3 border-t-[2px] border-black bg-surface">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ton message…"
          maxLength={1000}
          className="flex-1 bg-bg border-cup rounded-xl px-4 py-3 text-sm text-text placeholder:text-muted focus:outline-none focus:border-primary"
        />
        <button
          className={[
            'w-12 h-12 rounded-xl border-cup flex items-center justify-center text-xl flex-shrink-0',
            'shadow-cup-btn btn-press transition-opacity',
            canSend ? 'bg-primary text-text' : 'bg-surface text-muted opacity-40 cursor-not-allowed',
          ].join(' ')}
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Envoyer"
        >
          ➤
        </button>
      </div>

      <BottomNav />
    </div>
    </PageTransition>
  )
}

function MessageBubble({ msg, isOwn }: { msg: ChatMessage; isOwn: boolean }) {
  const name = msg.profiles?.name ?? 'Inconnu'
  const avatar = msg.profiles?.avatar_url ?? null
  const time = new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  if (isOwn) {
    return (
      <div className="message flex items-end justify-end gap-2">
        <span className="text-[10px] text-muted self-end mb-1">{time}</span>
        <div className="max-w-[75%] bg-primary border-cup rounded-2xl rounded-br-none px-4 py-2 shadow-cup-btn">
          <p className="text-sm text-text leading-relaxed break-words">{msg.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="message flex items-end gap-2">
      {/* Avatar */}
      {avatar ? (
        <img src={avatar} alt={name} className="w-8 h-8 rounded-full border-[2px] border-black object-cover flex-shrink-0 self-end" />
      ) : (
        <div className="w-8 h-8 rounded-full border-[2px] border-black bg-surface flex items-center justify-center text-xs font-display text-text flex-shrink-0 self-end">
          {name.charAt(0)}
        </div>
      )}
      <div className="max-w-[75%] flex flex-col gap-1">
        <span className="text-[10px] text-muted font-bold px-1">{name}</span>
        <div className="bg-surface border-cup rounded-2xl rounded-tl-none px-4 py-2 shadow-cup-btn">
          <p className="text-sm text-text leading-relaxed break-words">{msg.content}</p>
        </div>
        <span className="text-[10px] text-muted px-1">{time}</span>
      </div>
    </div>
  )
}
