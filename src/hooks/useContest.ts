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
  micVolume: number          // volume instantané 0-100 pour la visualisation
  countdownSeconds: number
  winner: string | null
  pendingChallenge: PendingChallenge | null
  activeContest: Contest | null
  micError: string | null    // message d'erreur si l'accès micro est refusé
  challenge: () => Promise<void>
  accept: () => Promise<void>
  decline: () => Promise<void>
}

const CONTEST_DURATION_MS = 5000
const COUNTDOWN_MS = 3000
// Fréquence d'échantillonnage du volume (ms)
const SAMPLE_INTERVAL_MS = 100
// Fréquence de broadcast du score (ms)
const BROADCAST_INTERVAL_MS = 200

export function useContest(
  groupId: string | undefined,
  chefId: string | null | undefined,
  onContestFinished: () => void,
): UseContestResult {
  const { user } = useAuth()
  const [phase, setPhase] = useState<ContestPhase>('idle')
  const [myScore, setMyScore] = useState(0)
  const [opponentScore, setOpponentScore] = useState(0)
  const [micVolume, setMicVolume] = useState(0)
  const [countdownSeconds, setCountdownSeconds] = useState(3)
  const [winner, setWinner] = useState<string | null>(null)
  const [pendingChallenge, setPendingChallenge] = useState<PendingChallenge | null>(null)
  const [activeContest, setActiveContest] = useState<Contest | null>(null)
  const [micError, setMicError] = useState<string | null>(null)

  const phaseRef = useRef<ContestPhase>('idle')
  const myScoreRef = useRef(0)
  const opponentScoreRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const isChallenger = useRef(false)
  const hasFinished = useRef(false)
  const activeContestRef = useRef<Contest | null>(null)

  // Refs audio
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const micLoopRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const broadcastLoopRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastBroadcastRef = useRef(0)

  const updatePhase = (p: ContestPhase) => {
    phaseRef.current = p
    setPhase(p)
  }

  useEffect(() => {
    activeContestRef.current = activeContest
  }, [activeContest])

  const stopMic = useCallback(() => {
    if (micLoopRef.current) clearInterval(micLoopRef.current)
    if (broadcastLoopRef.current) clearInterval(broadcastLoopRef.current)
    micLoopRef.current = null
    broadcastLoopRef.current = null
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    audioCtxRef.current?.close()
    audioCtxRef.current = null
    analyserRef.current = null
    setMicVolume(0)
  }, [])

  const handleFinished = useCallback((winnerId: string | null) => {
    if (hasFinished.current) return
    hasFinished.current = true
    if (timerRef.current) clearInterval(timerRef.current)
    stopMic()
    setWinner(winnerId)
    updatePhase('finished')
    setTimeout(() => {
      resetState()
      onContestFinished()
    }, 4000)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onContestFinished, stopMic])

  const resetState = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
    myScoreRef.current = 0
    opponentScoreRef.current = 0
    isChallenger.current = false
    hasFinished.current = false
    setMyScore(0)
    setOpponentScore(0)
    setMicVolume(0)
    setCountdownSeconds(3)
    setWinner(null)
    setPendingChallenge(null)
    setActiveContest(null)
    setMicError(null)
    updatePhase('idle')
  }, [])

  // Démarre la capture micro et la boucle d'accumulation du score
  const startMic = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      streamRef.current = stream

      const ctx = new AudioContext()
      audioCtxRef.current = ctx
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser

      const dataArray = new Uint8Array(analyser.fftSize)

      micLoopRef.current = setInterval(() => {
        if (!analyserRef.current) return
        analyserRef.current.getByteTimeDomainData(dataArray)

        // RMS → volume 0-100
        const rms = Math.sqrt(
          dataArray.reduce((sum, v) => sum + (v - 128) ** 2, 0) / dataArray.length,
        )
        const vol = Math.min(Math.round((rms / 50) * 100), 100)
        setMicVolume(vol)

        // Accumule dans le score (sommation des volumes)
        myScoreRef.current += vol
        setMyScore(myScoreRef.current)

        // Broadcast le score à intervalles réguliers
        const now = Date.now()
        if (now - lastBroadcastRef.current >= BROADCAST_INTERVAL_MS) {
          lastBroadcastRef.current = now
          channelRef.current?.send({
            type: 'broadcast',
            event: 'tap',
            payload: { userId: user!.id, count: myScoreRef.current },
          })
        }
      }, SAMPLE_INTERVAL_MS)

      setMicError(null)
    } catch {
      setMicError("Accès au micro refusé — autorise le micro dans les paramètres de ton navigateur.")
      stopMic()
    }
  }, [user, stopMic])

  const startCountdown = useCallback((startAt: number) => {
    updatePhase('countdown')

    timerRef.current = setInterval(async () => {
      const now = Date.now()
      const remaining = Math.ceil((startAt - now) / 1000)

      if (remaining > 0) {
        setCountdownSeconds(remaining)
      } else {
        if (timerRef.current) clearInterval(timerRef.current)
        updatePhase('running')

        // Démarre le micro dès que le combat commence
        await startMic()

        // Timer de fin de combat
        timerRef.current = setInterval(async () => {
          const elapsed = Date.now() - startAt
          if (elapsed >= CONTEST_DURATION_MS + COUNTDOWN_MS) {
            if (timerRef.current) clearInterval(timerRef.current)
            stopMic()

            // Seul le challenger finalise — le postgres_changes notifie les deux
            if (isChallenger.current && activeContestRef.current) {
              try {
                await finishContest(
                  activeContestRef.current.id,
                  myScoreRef.current,
                  opponentScoreRef.current,
                )
              } catch {
                // Ignorer si déjà finalisé
              }
            }
          }
        }, 100)
      }
    }, 200)
  }, [startMic, stopMic])

  // Canal Realtime pour les événements broadcast du contest
  useEffect(() => {
    if (!groupId || !user) return

    const channel = supabase
      .channel(`contest:${groupId}`)
      .on('broadcast', { event: 'challenge' }, ({ payload }) => {
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
        startCountdown(payload.startAt)
      })
      .on('broadcast', { event: 'declined' }, () => {
        resetState()
      })
      .on('broadcast', { event: 'tap' }, ({ payload }) => {
        if (payload.userId !== user.id) {
          opponentScoreRef.current = payload.count
          setOpponentScore(payload.count)
        }
      })
      .subscribe()

    channelRef.current = channel
    return () => { supabase.removeChannel(channel) }
  }, [groupId, user, chefId, startCountdown, resetState])

  // postgres_changes sur contests — signal de fin pour les deux joueurs
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
          const updated = payload.new as { status: string; winner: string | null; id: string }
          if (updated.status === 'finished') {
            handleFinished(updated.winner)
          }
        },
      )
      .subscribe()

    return () => { supabase.removeChannel(sub) }
  }, [groupId, user, handleFinished])

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
    if (!pendingChallenge || !groupId || !user) return
    await acceptContest(pendingChallenge.contestId)
    const startAt = Date.now() + COUNTDOWN_MS

    const syntheticContest: Contest = {
      id: pendingChallenge.contestId,
      group_id: groupId,
      challenger: pendingChallenge.challengerId,
      chef: user.id,
      status: 'accepted',
      challenger_score: null,
      chef_score: null,
      winner: null,
      created_at: new Date().toISOString(),
      finished_at: null,
    }
    setActiveContest(syntheticContest)
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

  // Nettoyage à la destruction
  useEffect(() => () => { stopMic() }, [stopMic])

  return {
    phase,
    myScore,
    opponentScore,
    micVolume,
    countdownSeconds,
    winner,
    pendingChallenge,
    activeContest,
    micError,
    challenge,
    accept,
    decline,
  }
}
