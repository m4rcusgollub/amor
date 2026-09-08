import { motion } from 'framer-motion'
import { ChapterHead, EmptyNote } from '../components/ui'
import { useMusic } from '../components/MusicPlayer'
import { MUSIC } from '../services/starData'
import type { MusicTrack } from '../types'

export default function Musica() {
  const { tracks, playTrack, current, playing } = useMusic()

  return (
    <main className="page tex-noise">
      <div className="page-inner">
        <ChapterHead
          kicker="capítulo sete"
          title="Nossa Música"
          note="trilha sonora destas páginas — toca baixinho, como fundo de memória"
        />
        <div className="h-line" aria-hidden="true" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center' }}
        >
          <figure
            className="polaroid"
            style={{ width: 'min(70vw, 260px)', margin: '10px auto 6px', transform: 'rotate(-1.6deg)' }}
          >
            <span className="tape tape--tl" aria-hidden="true" />
            <img src={MUSIC.cover} alt="capa da nossa playlist" loading="lazy" className="lazy-img loaded" />
            <figcaption>a playlist que eu fiz pra nossa contagem</figcaption>
          </figure>

          <p className="marginalia" style={{ margin: '14px 6px' }}>
            {MUSIC.note}
          </p>

          {/* embed oficial — toca aqui dentro, sem sair do site */}
          <div className="spotify-main">
            <iframe
              src={MUSIC.spotifyEmbed}
              title="nossa playlist no spotify"
              loading="lazy"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <p style={{ marginTop: 16 }}>
            <a
              href={MUSIC.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ink"
              style={{ display: 'inline-block', fontSize: '1.15rem' }}
            >
              ou levar no spotify
            </a>
          </p>

          <div className="h-line" aria-hidden="true" />

          {tracks.length > 1 || (tracks[0] && tracks[0].audio_url) ? (
            <ul style={{ marginTop: 10, textAlign: 'left' }}>
              {tracks.map((t: MusicTrack, i) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => playTrack(i)}
                    className="index-item"
                    style={{ width: '100%', display: 'flex', gap: 10, alignItems: 'baseline' }}
                    aria-label={`tocar ${t.title}`}
                  >
                    <span style={{ fontFamily: 'var(--hand)', color: 'var(--rose)', minWidth: 24 }}>
                      {i === current && playing ? '♪' : `${i + 1}.`}
                    </span>
                    <span>
                      <span style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: '1.1rem', display: 'block' }}>
                        {t.title}
                      </span>
                      <span style={{ fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--ink-faint)' }}>{t.artist}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : tracks.length === 0 ? (
            <EmptyNote>[ADICIONE AQUI AS MÚSICAS DE VOCÊS]</EmptyNote>
          ) : null}
        </motion.div>
      </div>
    </main>
  )
}
