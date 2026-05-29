import './LoadingPage.scss'

export function LoadingPage() {
  return (
    <div className="relative flex flex-col items-center justify-center h-full bg-bg gap-8 overflow-hidden">
      <span className="text-cuphead-lg text-5xl text-secondary">Axoregal</span>

      {/* Personnage dansant */}
      <div className="relative w-[120px] h-[120px]">
        <div
          className="character w-[100px] h-[100px] rounded-full border-cup-xl shadow-cup-card absolute top-1/2 left-1/2 bg-primary"
        />
        {/* Jambes */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-3">
          <div className="w-[14px] h-[22px] bg-primary border-cup rounded-[6px_6px_10px_10px] animate-leg-l" />
          <div className="w-[14px] h-[22px] bg-primary border-cup rounded-[6px_6px_10px_10px] animate-leg-r" />
        </div>
      </div>

      {/* Points clignotants */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-[10px] h-[10px] rounded-full bg-secondary border-[2px] border-black animate-blink"
            style={{ animationDelay: `${i * 0.33}s` }}
          />
        ))}
      </div>
      <p className="absolute top-[15%] right-[-30%] w-[120%] rotate-45 text-xs font-display tracking-widest uppercase bg-primary text-text text-center py-1.5 shadow-cup-btn border-y-[2px] border-black">
        Made by Anthropix × OpenAI × AAAAT
      </p>
    </div>
  )
}
