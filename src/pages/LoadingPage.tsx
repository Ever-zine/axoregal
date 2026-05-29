import './LoadingPage.scss'
import { useEffect, useRef } from 'react'
import sandwichGif from '@/assets/SANDWICH 1.gif'
import soundTitre from '@/assets/Titre.m4a'

export function LoadingPage() {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = new Audio(soundTitre)
    audioRef.current = audio
    audio.play().catch(() => {}) // .catch() évite l'erreur si le navigateur bloque l'autoplay

    return () => {
      audio.pause()
      audio.currentTime = 0
    }
  }, [])

  return (
    <div className="relative flex flex-col items-center justify-center h-full bg-bg gap-8 overflow-hidden">
      <span className="text-cuphead-lg text-5xl text-secondary">Axoregal</span>

      <img
          src={sandwichGif}
          alt="Chargement..."
          className="w-[200px] h-[200px] object-contain"
        />
      <p className="absolute top-[15%] right-[-30%] w-[120%] rotate-45 text-xs font-display tracking-widest uppercase bg-primary text-text text-center py-1.5 shadow-cup-btn border-y-[2px] border-black">
        Made by Anthropix × OpenAI × AAAAT
      </p>
    </div>
  )
}
