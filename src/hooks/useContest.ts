import { useEffect, useRef, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/providers/AuthProvider'
import {
  challengeChef,
  acceptContest,
  declineContest,
  finishContest,
  type Contest,
} from '@/services/contests'

export type ContestPhase = 'idle' | 'pending' | 'countdown' | 'running' | 'finished'

interface PendingChallenge {
  contestId: string
  challengerName: string
  challengerId: string
}

interface UseContestResult {
  phase: ContestPhase
  myScore: number
  opponentScore: number
  countdownSeconds: number
  winner: string | null
  pendingChallenge: PendingChallenge | null
  activeContest: Contest | null
  challenge: () => Promise<void>
  accept: () => Promise<void>
  decline: () => Promise<void>
  tap: () => void
}

const CONTEST_DURATION_MS = 5000
const COUNTDOWN_MS = 3000

export function useContest(
  groupId: string | undefined,
  chefId: string | null | undefined,
  onContestFinished: () => void,
): UseContestResult {
  const { user } = useAuth()
  const [phase, setPhase] = useState<ContestPhase>('idle')
  const [myScore, setMyScore] = useState(0)
  const [opponentScore, setOpponentScore] = useState(0)
  const [countdownSeconds, setCountdownSeconds] = useState(3)
  const [winner, setWinner] = useState<string | null>(null)
  const [pendingChallenge, setPendingChallenge] = useState<PendingChallenge | null>(null)
  const [activeContest, setActiveContest] = useState<Contest | null>(null)

  // Refs pour éviter les stale closures dans les timers
  const phaseRef = useRef<ContestPhase>('idle')
  const myScoreRef = useRef(0)
  const opponentScoreRef = useRef(0)
  const startAtRef = useRef<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const isChallenger = useRef(false)

  const updatePhase = (p: ContestPhase) => {
    phaseRef.current = p
    setPhase(p)
  }

  const resetState = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
    startAtRef.current = null
    myScoreRef.current = 0
    opponentScoreRef.current = 0
    isChallenger.current = false
    setMyScore(0)
    setOpponentScore(0)
    setCountdownSeconds(3)
    setWinner(null)
    setPendingChallenge(null)
    setActiveContest(null)
    updatePhase('idle')
  }, [])

  // Lance le countdown puis le combat
  const startCountdown = useCallback((startAt: number) => {
    startAtRef.current = startAt
    updatePhase('countdown')

    timerRef.current = setInterval(() => {
      const now = Date.now()
      const remaining = Math.ceil((startAt - now) / 1000)

      if (remaining > 0) {
        setCountdownSeconds(remaining)
      } else {
        if (timerRef.current) clearInterval(timerRef.current)
        updatePhase('running')

        // Timer de fin de combat
        timerRef.current = setInterval(async () => {
          const elapsed = Date.now() - startAt
          if (elapsed >= CONTEST_DURATION_MS) {
            if (timerRef.current) clearInterval(timerRef.current)

            // Seul le challenger appelle le RPC
            if (isChallenger.current && activeContestRef.current) {
              try {
                await finishContest(
                  activeContestRef.current.id,
                  myScoreRef.current,
                  opponentScoreRef.current,
                )
              } catch {
                // Le chef a peut-être déjà finalisé — ignorer
              }
            }
          }
        }, 100)
      }
    }, 200)
  }, [])

  // Ref vers activeContest pour les closures des timers
  const activeContestRef = useRef<Contest | null>(null)
  useEffect(() => {
    activeContestRef.current = activeContest
  }, [activeContest])

  // Canal Realtime pour le contest
  useEffect(() => {
    if (!groupId || !user) return

    const channel = supabase
      .channel(`contest:${groupId}`)
      .on('broadcast', { event: 'challenge' }, ({ payload }) => {
        // Le chef reçoit le défi
        if (user.id === chefId) {
          setPendingChallenge({
            contestId: payload.contestId,
            challengerName: payload.challengerName,
            challengerId: payload.challengerId,
          })
          updatePhase('pending')
        }
      })
      .on('broadcast', { event: 'accepted' }, ({ payload }) => {
        // Les deux joueurs démarrent le countdown
        startCountdown(payload.startAt)
      })
      .on('broadcast', { event: 'declined' }, () => {
        resetState()
      })
      .on('broadcast', { event: 'tap' }, ({ payload }) => {
        // Score de l'adversaire
        if (payload.userId !== user.id) {
          opponentScoreRef.current = payload.count
          setOpponentScore(payload.count)
        }
      })
      .on('broadcast', { event: 'finished' }, ({ payload }) => {
        if (timerRef.current) clearInterval(timerRef.current)
        setWinner(payload.winner)
        updatePhase('finished')
        setTimeout(() => {
          resetState()
          onContestFinished()
        }, 4000)
      })
      .subscribe()

    channelRef.current = channel
    return () => {
      supabase.removeChannel(channel)
    }
  }, [groupId, user, chefId, startCountdown, resetState, onContestFinished])

  const challenge = useCallback(async () => {
    if (!groupId || !user || !chefId || phase !== 'idle') return
    const contest = await challengeChef(groupId, user.id, chefId)
    setActiveContest(contest)
    isChallenger.current = true
    updatePhase('pending')

    channelRef.current?.send({
      type: 'broadcast',
      event: 'challenge',
      payload: {
        contestId: contest.id,
        challengerName: user.name,
        challengerId: user.id,
      },
    })
  }, [groupId, user, chefId, phase])

  const accept = useCallback(async () => {
    if (!pendingChallenge) return
    await acceptContest(pendingChallenge.contestId)
    const startAt = Date.now() + COUNTDOWN_MS

    // Charge le contest pour le chef
    setActiveContest({
      id: pendingChallenge.contestId,
      group_id: groupId!,
      challenger: pendingChallenge.challengerId,
      chef: user!.id,
      status: 'accepted',
      challenger_score: null,
      chef_score: null,
      winner: null,
      created_at: new Date().toISOString(),
      finished_at: null,
    })
    setPendingChallenge(null)

    channelRef.current?.send({
      type: 'broadcast',
      event: 'accepted',
      payload: { contestId: pendingChallenge.contestId, startAt },
    })

    startCountdown(startAt)
  }, [pendingChallenge, groupId, user, startCountdown])

  const decline = useCallback(async () => {
    if (!pendingChallenge) return
    await declineContest(pendingChallenge.contestId)

    channelRef.current?.send({
      type: 'broadcast',
      event: 'declined',
      payload: { contestId: pendingChallenge.contestId },
    })

    resetState()
  }, [pendingChallenge, resetState])

  const tap = useCallback(() => {
    if (phaseRef.current !== 'running') return
    const newScore = myScoreRef.current + 1
    myScoreRef.current = newScore
    setMyScore(newScore)

    channelRef.current?.send({
      type: 'broadcast',
      event: 'tap',
      payload: { userId: user!.id, count: newScore },
    })
  }, [user])

  // Quand le contest est finished, broadcaster le résultat (côté challenger uniquement)
  // C'est géré dans le timer setInterval ci-dessus après finishContest()
  // Le hook postgres_changes sur la table contests détectera le changement
  // et notifiera l'autre joueur via le broadcast 'finished'
  useEffect(() => {
    if (!groupId || !user) return

    const sub = supabase
      .channel(`contest-db:${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'contests',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          const updated = payload.new as { status: string; winner: string | null; challenger_score: number | null; chef_score: number | null; id: string }
          if (updated.status === 'finished') {
            if (timerRef.current) clearInterval(timerRef.current)
            setWinner(updated.winner)
            updatePhase('finished')

            // Broadcaster pour notifier l'autre joueur si le RPC vient de l'adversaire
            channelRef.current?.send({
              type: 'broadcast',
              event: 'finished',
              payload: {
                contestId: updated.id,
                winner: updated.winner,
                challengerScore: updated.challenger_score,
                chefScore: updated.chef_score,
              },
            })

            setTimeout(() => {
              resetState()
              onContestFinished()
            }, 4000)
          }
        },
      )
      .subscribe()

    return () => { supabase.removeChannel(sub) }
  }, [groupId, user, resetState, onContestFinished])

  return {
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
  }
}
