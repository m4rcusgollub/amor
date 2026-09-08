import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { fetchMusic } from '../services/api'
import { MUSIC } from '../services/starData'
import type { MusicTrack } from '../types'

/**
 * Player da nossa música.
 * Faixas com audio_url tocam no <audio> nativo;
 * a playlist do Spotify toca num embed oficial dentro do site —
 * nada de redirecionar pra fora.
 */

interface MusicContextValue {
  tracks: MusicTrack[]
  current: number
  playing: boolean
  mode: 'closed' | 'mini' | 'open' | 'embed'
  setMode: (m: 'closed' | 'mini' | 'open' | 'embed') => void
  toggle: () => void
  playTrack: (i?: number) => void
  nudgeDismissed: boolean
  dismissNudge: () => void
}

const MusicContext = createContext<MusicContextValue | null>(null)

export const useMusic = () => {
  const ctx = useContext(MusicContext)
  if (!ctx) throw new Error('useMusic fora do provider')
  return ctx
}

const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M8 5.5 C 8 4.8, 8.8 4.4, 9.4 4.8 L 18 11.3 C 18.6 11.7, 18.6 12.3, 18 12.7 L 9.4 19.2 C 8.8 19.6, 8 19.2, 8 18.5 Z" />
  </svg>
)
const PauseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect x="7" y="5" width="3.4" height="14" rx="1.2" />
    <rect x="13.6" y="5" width="3.4" height="14" rx="1.2" />
  </svg>
)

type Mode = 'closed' | 'mini' | 'open' | 'embed'

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [tracks, setTracks] = useState<MusicTrack[]>([])
  const [current, setCurrent] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [mode, setMode] = useState<Mode>('mini')
  const [nudgeDismissed, setNudgeDismissed] = useState(false)

  useEffect(() => {
    let alive = true
    fetchMusic()
      .then((t) => {
        if (alive) setTracks(t)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  // quando um modal abre (lightbox/carta/certificado), o player se recolhe
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const modalOpen = Boolean(
        document.querySelector('.lb-scrim, .letter-modal, .cert-modal, .cartinha-modal')
      )
      if (modalOpen) setMode((m) => (m === 'embed' ? m : 'mini'))
    })
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  // faixas com arquivo de áudio próprio tocam aqui
  const playTrack = useCallback(
    (i?: number) => {
      const idx = i ?? current
      const track = tracks[idx]
      if (!track) return
      setCurrent(idx)
      setNudgeDismissed(true)
      if (track.audio_url) {
        let audio: HTMLAudioElement | null = document.querySelector('audio.nossa-musica')
        if (!audio) {
          audio = document.createElement('audio')
          audio.className = 'nossa-musica'
          audio.addEventListener('ended', () => setPlaying(false))
          document.body.appendChild(audio)
        }
        if (audio.src !== track.audio_url) audio.src = track.audio_url
        audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
        setMode('open')
      } else {
        // playlist do spotify: embed toca aqui dentro
        setMode('embed')
      }
    },
    [tracks, current]
  )

  const toggle = useCallback(() => {
    const track = tracks[current]
    if (!track) return
    if (track.audio_url) {
      const audio: HTMLAudioElement | null = document.querySelector('audio.nossa-musica')
      if (playing && audio) {
        audio.pause()
        setPlaying(false)
      } else {
        playTrack(current)
      }
    } else {
      // spotify: abrir/fechar o embed (ele próprio controla play/pause)
      setMode((m) => (m === 'embed' ? 'mini' : 'embed'))
    }
  }, [tracks, current, playing, playTrack])

  const value: MusicContextValue = {
    tracks,
    current,
    playing,
    mode,
    setMode,
    toggle,
    playTrack,
    nudgeDismissed,
    dismissNudge: () => setNudgeDismissed(true),
  }

  return (
    <MusicContext.Provider value={value}>
      {children}
      <PlayerDock />
    </MusicContext.Provider>
  )
}

/** Provider global: envolve o app e ancora o dock no canto. */
export const MusicPlayer = MusicProvider

function PlayerDock() {
  const { tracks, current, playing, mode, setMode, toggle, playTrack, nudgeDismissed, dismissNudge } =
    useMusic()
  const track = tracks[current]

  if (!track) return null

  const cover = MUSIC.cover
  const isSpotify = !track.audio_url

  return (
    <>
      {mode === 'mini' && !nudgeDismissed && !playing ? (
        <div className="music-nudge" role="note" aria-label="convite para ouvir a nossa música">
          <span className="mn-text">quer ouvir nossa playlist enquanto olha as páginas?</span>
          <button type="button" className="btn-ink" onClick={() => playTrack(0)}>
            ouvir
          </button>
          <button type="button" className="mn-close" onClick={dismissNudge} aria-label="agora não">
            ×
          </button>
        </div>
      ) : null}

      <div className="player-dock">
        <AnimatePresence mode="wait">
          {mode === 'mini' ? (
            <motion.button
              key="mini"
              type="button"
              className="player-mini"
              onClick={() => setMode('open')}
              aria-label="abrir player da nossa música"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              <img src={cover} alt="" aria-hidden="true" />
              <span className="pm-icon">
                {playing ? <PauseIcon /> : <PlayIcon />}
              </span>
            </motion.button>
          ) : mode === 'embed' ? (
            <motion.div
              key="embed"
              className="spotify-dock"
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 18, opacity: 0 }}
              transition={{ duration: 0.28 }}
              role="dialog"
              aria-label="player do spotify — nossa playlist"
            >
              <div className="spotify-dock-head">
                <span className="player-label">nossa playlist</span>
                <button
                  type="button"
                  className="pctl-min"
                  onClick={() => setMode('mini')}
                  aria-label="minimizar player"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M5 12 C 9 11.6, 15 12.4, 19 12" />
                  </svg>
                </button>
              </div>
              <iframe
                src={MUSIC.spotifyEmbed}
                title="nossa playlist no spotify"
                loading="lazy"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </motion.div>
          ) : (
            <motion.div
              key="card"
              className="player-card"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              transition={{ duration: 0.25 }}
              aria-label="player da nossa música"
            >
              <div className="player-head">
                <span className="player-label">nossa música</span>
                <button
                  type="button"
                  className="pctl-min"
                  onClick={() => setMode('mini')}
                  aria-label="minimizar player"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M5 12 C 9 11.6, 15 12.4, 19 12" />
                  </svg>
                </button>
              </div>
              <div className="player-row">
                <img className="player-cover" src={cover} alt="capa da nossa playlist" />
                <div className="player-info">
                  <div className="player-title">{track.title}</div>
                  <div className="player-artist">{track.artist}</div>
                </div>
              </div>
              <div className="player-controls">
                <button
                  type="button"
                  className="pctl"
                  onClick={isSpotify ? () => setMode('embed') : () => playTrack((current - 1 + tracks.length) % tracks.length)}
                  aria-label={isSpotify ? 'abrir playlist no player' : 'música anterior'}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17 6.2 C 17 5.5, 16.2 5.1, 15.6 5.5 L 8 11.3 C 7.5 11.7, 7.5 12.3, 8 12.7 L 15.6 18.5 C 16.2 18.9, 17 18.5, 17 17.8 Z" />
                    <rect x="5.5" y="5.5" width="2.2" height="13" rx="1" />
                  </svg>
                </button>
                <button type="button" className="pctl" onClick={toggle} aria-label={playing ? 'pausar' : 'tocar'}>
                  {playing ? <PauseIcon /> : <PlayIcon />}
                </button>
                <button
                  type="button"
                  className="pctl"
                  onClick={isSpotify ? () => setMode('embed') : () => playTrack((current + 1) % tracks.length)}
                  aria-label={isSpotify ? 'abrir playlist no player' : 'próxima música'}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M7 6.2 C 7 5.5, 7.8 5.1, 8.4 5.5 L 16 11.3 C 16.5 11.7, 16.5 12.3, 16 12.7 L 8.4 18.5 C 7.8 18.9, 7 18.5, 7 17.8 Z" />
                    <rect x="16.3" y="5.5" width="2.2" height="13" rx="1" />
                  </svg>
                </button>
              </div>
              {isSpotify ? (
                <button type="button" className="spotify-hint-btn" onClick={() => setMode('embed')}>
                  tocar a playlist aqui
                </button>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
