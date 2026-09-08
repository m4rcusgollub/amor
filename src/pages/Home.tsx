import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNav } from '../components/Nav'
import { useMusic } from '../components/MusicPlayer'

export default function Home() {
  const { setOpen } = useNav()
  const { setMode } = useMusic()

  // a home é a porta de entrada — o player começa escondido aqui
  useEffect(() => {
    setMode('mini')
  }, [setMode])

  return (
    <div className="home tex-noise">
      <button
        type="button"
        className="menu-btn home-menu"
        onClick={() => setOpen(true)}
        aria-label="abrir o índice do nosso álbum"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
          <path d="M4 7 C 8 6.5, 16 7.5, 20 7" />
          <path d="M4 12 C 8 11.5, 16 12.5, 20 12" />
          <path d="M4 17 C 8 16.5, 16 17.5, 20 17" />
        </svg>
      </button>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        style={{ textAlign: 'center' }}
      >
        <svg className="home-heart" viewBox="0 0 54 54" aria-hidden="true">
          <path
            d="M27 46 C 12 35, 6 27, 6 18.6 C 6 12.2, 10.9 7.4, 16.9 7.4 C 21.4 7.4, 25 10, 27 13.6 C 29 10, 32.6 7.4, 37.1 7.4 C 43.1 7.4, 48 12.2, 48 18.6 C 48 27, 42 35, 27 46 Z"
            fill="none"
            stroke="var(--rose)"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M18 15 c -2 2.2 -2 5 .2 7 M37 15 c 2 2.2 2 5 -.2 7"
            fill="none"
            stroke="var(--rose-soft)"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>

        <h1 className="home-title">
          para <em>Auany</em>
        </h1>

        <p className="home-hand">
          um pequeno lugar na internet
          <br />
          que guarda um pouco de nós
        </p>

        <button
          type="button"
          className="home-enter btn-ink"
          onClick={() => setOpen(true)}
        >
          entrar no nosso universo
        </button>
      </motion.div>

      <div className="home-foot">
        <span className="stamp">de marcus · com amor</span>
      </div>
    </div>
  )
}
