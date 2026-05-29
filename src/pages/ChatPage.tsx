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
  const { group, leaveGroup } = useGroup()
  const { messages, isLoading, isSending, send, currentUserId } = useChat(group?.id)
  const [input, setInput] = useState('')
  const [isLeaving, setIsLeaving] = useState(false)
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

  async function handleLeaveGroup() {
    if (!window.confirm('Quitter ce groupe ? Tu ne verras plus son chat.')) return
    setIsLeaving(true)
    try {
      await leaveGroup()
    } finally {
      setIsLeaving(false)
    }
  }

  return (
    <PageTransition>
    <div className="figma-screen chat-screen">
    <div className="figma-screen-bg" />
    <div className="figma-page chat-page">
      {/* Header */}
      <header className="chat-header border-cup bg-surface">
        <span className="chat-header-emoji">{category.emoji}</span>
        <div className="chat-header-copy">
          <span className="figma-title chat-title">{group.name}</span>
          <span className="chat-subtitle">
            {category.emoji} {category.name} · {group.members.length} membre{group.members.length !== 1 ? 's' : ''}
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
                className="chat-member-avatar rounded-full border-[2px] border-black object-cover"
                style={{ marginLeft: i === 0 ? 0 : -6 }}
              />
            ) : (
              <div
                key={m.id}
                className="chat-member-avatar flex items-center justify-center rounded-full border-[2px] border-black bg-primary font-display text-[10px] text-text"
                style={{ marginLeft: i === 0 ? 0 : -6 }}
              >
                {m.name.charAt(0)}
              </div>
            ),
          )}
        </div>
        <button
          className="chat-leave-button"
          onClick={handleLeaveGroup}
          disabled={isLeaving}
        >
          {isLeaving ? '...' : 'Quitter'}

        </button>
      </header>

      {/* Liste des messages */}
      <div
        ref={messagesRef}
        className="messages figma-main chat-messages"
      >
        {isLoading && (
          <p className="text-center text-muted text-sm py-8">Chargement…</p>
        )}

        {!isLoading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 gap-3 text-center px-6">
            <span className="text-5xl">{category.emoji}</span>
            <p className="figma-title chat-empty-title text-muted">Soyez les premiers à parler !</p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} isOwn={msg.user_id === currentUserId} />
        ))}
      </div>

      {/* Barre d'envoi */}
      <div className="chat-composer border-cup bg-surface">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ton message…"
          maxLength={1000}
          className="chat-input border-cup bg-bg text-text placeholder:text-muted focus:border-primary focus:outline-none"
        />
        <button
          className={[
            'figma-button chat-send-button',
            canSend ? 'bg-primary text-surface' : 'bg-surface text-muted opacity-40 cursor-not-allowed',
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
        <div className="max-w-[82%] rounded-2xl rounded-br-none border-cup bg-primary px-4 py-2 shadow-cup-btn">
          <p className="break-words text-sm leading-relaxed text-surface">{msg.content}</p>
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
      <div className="flex max-w-[82%] flex-col gap-1">
        <span className="text-[10px] text-muted font-bold px-1">{name}</span>
        <div className="rounded-2xl rounded-tl-none border-cup bg-surface px-4 py-2 shadow-cup-btn">
          <p className="text-sm text-text leading-relaxed break-words">{msg.content}</p>
        </div>
        <span className="text-[10px] text-muted px-1">{time}</span>
      </div>
    </div>
  )
}
