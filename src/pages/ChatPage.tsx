import { useState, type KeyboardEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useGroup } from '@/providers/GroupProvider'
import { useAuth } from '@/providers/AuthProvider'
import { useChat, useScrollToBottom } from '@/hooks/useChat'
import { useContest } from '@/hooks/useContest'
import { CATEGORIES } from '@/data/categories'
import { updateGroupInfo } from '@/services/matching'
import { BottomNav } from '@/components/BottomNav/BottomNav'
import { PageTransition } from '@/components/PageTransition/PageTransition'
import { ContestPage } from './ContestPage'
import type { ChatMessage } from '@/services/chat'
import './ChatPage.scss'

export function ChatPage() {
  const { user } = useAuth()
  const { group, isChef, leaveGroup, refreshGroup } = useGroup()
  const { messages, isLoading, isSending, send, currentUserId } = useChat(group?.id)
  const [input, setInput] = useState('')
  const [isLeaving, setIsLeaving] = useState(false)

  // Chef settings
  const [chefPanelOpen, setChefPanelOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [isSavingGroup, setIsSavingGroup] = useState(false)

  const {
    phase,
    myScore,
    opponentScore,
    countdownSeconds,
    winner,
    pendingChallenge,
    activeContest,
    challenge,
    accept,
    decline,
    tap,
  } = useContest(group?.id, group?.created_by, refreshGroup)

  // CHAT-01 : redirige si pas de groupe
  if (!group) return <Navigate to="/swipe" replace />

  const category = CATEGORIES.find((c) => c.id === group.category_id) ?? CATEGORIES[0]
  const canSend = input.trim().length > 0 && !isSending

  const me = group.members.find((m) => m.id === user?.id) ?? null
  const isUserChallenger = user?.id === activeContest?.challenger
  const opponentId = isUserChallenger ? activeContest?.chef : activeContest?.challenger
  const opponent = group.members.find((m) => m.id === opponentId) ?? null

  const showContest = phase === 'countdown' || phase === 'running' || phase === 'finished'

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

  function handleOpenChefPanel() {
    setEditName(group.name)
    setEditCategory(group.category_id)
    setChefPanelOpen(true)
  }

  async function handleSaveGroup() {
    if (!group || isSavingGroup) return
    setIsSavingGroup(true)
    try {
      await updateGroupInfo(group.id, { name: editName.trim() || group.name, category_id: editCategory })
      await refreshGroup()
      setChefPanelOpen(false)
    } finally {
      setIsSavingGroup(false)
    }
  }

  return (
    <PageTransition>
    <div className="figma-screen chat-screen">
    <div className="figma-screen-bg" />
    <div className="figma-page chat-page" style={{ position: 'relative' }}>

      {/* Bandeau défi chef entrant */}
      <AnimatePresence>
        {isChef && pendingChallenge && (
          <motion.div
            className="contest-challenge-banner border-cup"
            initial={{ y: -70, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -70, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <span className="contest-banner-text">🐺 {pendingChallenge.challengerName} te défie !</span>
            <div className="contest-banner-actions">
              <button
                className="figma-button contest-banner-accept bg-success text-text"
                onClick={accept}
              >
                Accepter
              </button>
              <button
                className="contest-banner-decline"
                onClick={decline}
              >
                Refuser
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

        {/* Bouton chef settings */}
        {isChef && (
          <button
            className="chat-chef-settings-btn"
            onClick={handleOpenChefPanel}
            aria-label="Paramètres du groupe"
          >
            ⚙️
          </button>
        )}

        {/* Bouton défi (membres non-chef) */}
        {!isChef && group.created_by && (
          <button
            className={['figma-button chat-challenge-btn bg-accent text-surface', phase !== 'idle' ? 'opacity-50 cursor-not-allowed' : 'btn-press'].join(' ')}
            onClick={challenge}
            disabled={phase !== 'idle'}
            title="Défier le chef !"
          >
            🐺
          </button>
        )}

        <button
          className="chat-leave-button"
          onClick={handleLeaveGroup}
          disabled={isLeaving}
        >
          {isLeaving ? '...' : 'Quitter'}
        </button>
      </header>

      {/* Panel chef (settings) */}
      <AnimatePresence>
        {chefPanelOpen && (
          <motion.div
            className="chef-panel border-cup bg-surface"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
          >
            <div className="chef-panel-header">
              <span className="figma-title chef-panel-title">⚙️ Modifier le groupe</span>
              <button className="chef-panel-close" onClick={() => setChefPanelOpen(false)}>✕</button>
            </div>
            <label className="chef-panel-label">Nom du groupe</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              maxLength={60}
              className="create-group-input border-cup bg-bg text-text placeholder:text-muted focus:border-primary focus:outline-none"
            />
            <label className="chef-panel-label">Type de cuisine</label>
            <div className="chef-category-grid">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  className={[
                    'create-category-option border-cup btn-press',
                    editCategory === cat.id ? 'bg-primary shadow-cup-card' : 'bg-surface shadow-cup-btn text-muted',
                  ].join(' ')}
                  style={editCategory === cat.id ? { color: cat.color } : {}}
                  onClick={() => setEditCategory(cat.id)}
                >
                  <span className="text-xl">{cat.emoji}</span>
                  <span className="text-xs">{cat.name}</span>
                </button>
              ))}
            </div>
            <button
              className="figma-button bg-success text-text btn-press chef-panel-save"
              onClick={handleSaveGroup}
              disabled={isSavingGroup}
            >
              {isSavingGroup ? 'Sauvegarde…' : 'Enregistrer ✓'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Liste des messages */}
      <MessagesArea
        messages={messages}
        isLoading={isLoading}
        currentUserId={currentUserId}
        categoryEmoji={category.emoji}
      />

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

      {/* Overlay Alpha Contest */}
      <AnimatePresence>
        {showContest && (
          <ContestPage
            phase={phase}
            myScore={myScore}
            opponentScore={opponentScore}
            countdownSeconds={countdownSeconds}
            winner={winner}
            myUserId={user?.id ?? ''}
            me={me}
            opponent={opponent}
            isChallenger={isUserChallenger}
            onTap={tap}
          />
        )}
      </AnimatePresence>
    </div>
    </div>
    </PageTransition>
  )
}

function MessagesArea({
  messages,
  isLoading,
  currentUserId,
  categoryEmoji,
}: {
  messages: ChatMessage[]
  isLoading: boolean
  currentUserId: string | null
  categoryEmoji: string
}) {
  const messagesRef = useScrollToBottom(messages.length)

  return (
    <div ref={messagesRef} className="messages figma-main chat-messages">
      {isLoading && (
        <p className="text-center text-muted text-sm py-8">Chargement…</p>
      )}
      {!isLoading && messages.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 text-center px-6">
          <span className="text-5xl">{categoryEmoji}</span>
          <p className="figma-title chat-empty-title text-muted">Soyez les premiers à parler !</p>
        </div>
      )}
      {messages.map((msg) => (
        <MessageBubble key={msg.id} msg={msg} isOwn={msg.user_id === currentUserId} />
      ))}
    </div>
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
