import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { STAR } from '../services/starData'
import { useGeolocation } from '../hooks/useGeolocation'
import { useTick } from '../hooks/useInterval'
import { skyPositionNow } from '../lib/astro'
import type { StarData } from '../types'
import { ChapterHead } from '../components/ui'
import { SkyCanvas, type SkyCanvasHandle } from '../components/SkyCanvas'

function StarStatus({ star, lat, lon, city }: { star: StarData; lat: number; lon: number; city: string }) {
  const { now } = useTick(30000)
  const pos = skyPositionNow(star.ra_deg, star.dec_deg, lat, lon, city, now)

  return (
    <div className="sky-status" aria-live="polite">
      <span className="ss-title">onde ela está agora?</span>
      <p className="ss-main">
        {pos.visible ? 'agora ela está no céu, carregando seu nome.' : 'agora ela está escondida, mas ainda está lá.'}
      </p>
      <p className="ss-details">
        altitude aproximada: {pos.altitude.toFixed(1)}°
        <br />
        direção: {pos.compass} ({pos.azimuth.toFixed(0)}°)
        <br />
        calculado às {pos.timeLabel} · {city}
      </p>
    </div>
  )
}

export default function LuzDoMeuCeu() {
  const star = STAR // dados originais preservados
  const { coords, ask } = useGeolocation({
    lat: star.default_lat,
    lon: star.default_lon,
    city: star.default_city,
    granted: false,
  })
  const [asked, setAsked] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [skyHandle, setSkyHandle] = useState<SkyCanvasHandle | null>(null)
  const [certOpen, setCertOpen] = useState(false)
  const { now } = useTick(60000)

  const askLocation = () => {
    ask()
    setAsked(true)
  }

  const onCenterRef = useCallback((h: SkyCanvasHandle) => setSkyHandle(h), [])

  const toggleFullscreen = async () => {
    const el = skyHandle?.containerRef.current
    // tenta fullscreen nativo; iOS Safari não suporta em div —
    // usa modo simulado (fixed inset-0) como caminho principal
    if (el && typeof el.requestFullscreen === 'function' && document.fullscreenEnabled) {
      try {
        if (!document.fullscreenElement) {
          await el.requestFullscreen()
          return
        }
        await document.exitFullscreen()
        return
      } catch {
        /* cai no simulado */
      }
    }
    setFullscreen((v) => !v)
  }

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    }
    setFullscreen(false)
  }

  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFs)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('fullscreenchange', onFs)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  // landscape no fullscreen simulado
  useEffect(() => {
    const check = () => {}
    check()
  }, [])

  return (
    <main className="page night-page">
      <div className="page-inner">
        <ChapterHead
          kicker="capítulo seis"
          title="Auany — Luz do Meu Céu"
          note="a estrela que escolhi, e onde ela está agora"
        />

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
          <p className="star-text">{star.dedication_text}</p>

          <StarStatus star={star} lat={coords.lat} lon={coords.lon} city={coords.city} />

          {!asked ? (
            <p className="center" style={{ marginTop: -8, marginBottom: 6 }}>
              <button type="button" className="btn-ink" onClick={askLocation} style={{ fontSize: '1.15rem' }}>
                usar minha localização
              </button>
            </p>
          ) : (
            <p className="sky-hint" style={{ marginTop: -4 }}>
              {coords.granted ? 'vendo o céu de onde você está' : `usando ${coords.city} como referência`}
              {!coords.granted ? (
                <>
                  {' — '}
                  <button type="button" className="link-ink retry-btn" onClick={ask}>
                    tentar de novo
                  </button>
                </>
              ) : null}
            </p>
          )}

          <SkyCanvas
            star={star}
            lat={coords.lat}
            lon={coords.lon}
            date={now}
            fullscreen={fullscreen}
            onCenterRef={onCenterRef}
            onExitFullscreen={exitFullscreen}
          />

          <div className="sky-controls">
            <button
              type="button"
              className="btn-ink"
              onClick={() => skyHandle?.centerOnStar()}
              style={{ fontSize: '1.2rem' }}
            >
              centralizar na estrela
            </button>
            <button
              type="button"
              className="btn-ink"
              onClick={toggleFullscreen}
              style={{ fontSize: '1.2rem' }}
            >
              tela cheia
            </button>
          </div>
          <p className="sky-hint">arraste o céu · junte os dedos para aproximar</p>

          <div className="star-data" aria-label="dados da estrela">
            <div className="sd-item">
              <span className="sd-label">constelação</span>
              <span className="sd-value">{star.constellation}</span>
            </div>
            <div className="sd-item">
              <span className="sd-label">magnitude</span>
              <span className="sd-value">{star.magnitude}</span>
            </div>
            <div className="sd-item">
              <span className="sd-label">ascensão reta</span>
              <span className="sd-value">{star.ra_text}</span>
            </div>
            <div className="sd-item">
              <span className="sd-label">declinação</span>
              <span className="sd-value">{star.dec_text}</span>
            </div>
            <div className="sd-item wide">
              <span className="sd-label">registro</span>
              <span className="sd-value">simbólico, feito com amor</span>
            </div>
          </div>

          <div className="star-secret">{star.secret_text}</div>

          <div className="certificate-frame">
            <img
              src={star.certificate_url}
              alt="Certificado Estelar de Dedicação — Auany, Luz do Meu Céu"
              loading="lazy"
              onClick={() => setCertOpen(true)}
              style={{ cursor: 'zoom-in' }}
            />
            <p className="certificate-note">
              o certificado dela — toque para ver de pertinho
            </p>
          </div>
        </motion.div>
      </div>

      {certOpen ? (
        <div
          className="cert-modal"
          onClick={(e) => {
            if (e.target === e.currentTarget) setCertOpen(false)
          }}
          role="dialog"
          aria-modal="true"
          aria-label="certificado estelar"
        >
          <button type="button" className="lb-close" onClick={() => setCertOpen(false)} aria-label="fechar certificado">
            fechar
          </button>
          <img src={star.certificate_url} alt="Certificado Estelar de Dedicação — Auany, Luz do Meu Céu" />
        </div>
      ) : null}
    </main>
  )
}
