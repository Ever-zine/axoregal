import './LoadingPage.scss'
import sandwichGif from '@/assets/SANDWICH 1.gif'
import imageTitre from '@/assets/Logo.svg'

export function LoadingPage() {

  return (
    <div className="relative flex flex-col items-center justify-center h-full bg-bg gap-8 overflow-hidden">
      <img
        src={imageTitre}
        className="w-[600px] h-[50px] object-contain"
        />

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
