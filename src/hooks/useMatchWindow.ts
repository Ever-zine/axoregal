import { useState, useEffect } from 'react'

function parseTime(hhmm: string): { h: number; m: number } {
  const [h, m] = hhmm.split(':').map(Number)
  return { h, m }
}

function nowMinutes(): number {
  const d = new Date()
  return d.getHours() * 60 + d.getMinutes()
}

function windowMinutes() {
  const start = parseTime(import.meta.env.VITE_MATCH_WINDOW_START ?? '11:00')
  const end   = parseTime(import.meta.env.VITE_MATCH_WINDOW_END   ?? '11:45')
  return {
    start: start.h * 60 + start.m,
    end:   end.h   * 60 + end.m,
  }
}

export function useMatchWindow() {
  const [isOpen, setIsOpen] = useState(() => {
    const now = nowMinutes()
    const { start, end } = windowMinutes()
    return now >= start && now <= end
  })

  useEffect(() => {
    const id = setInterval(() => {
      const now = nowMinutes()
      const { start, end } = windowMinutes()
      setIsOpen(now >= start && now <= end)
    }, 30_000) // re-check toutes les 30s
    return () => clearInterval(id)
  }, [])

  const { start } = windowMinutes()
  return {
    isOpen,
    startLabel: import.meta.env.VITE_MATCH_WINDOW_START ?? '11:00',
    endLabel:   import.meta.env.VITE_MATCH_WINDOW_END   ?? '11:45',
    minutesUntilOpen: Math.max(0, start - nowMinutes()),
  }
}
