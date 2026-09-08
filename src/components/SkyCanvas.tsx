import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { CARINA_LINES, CARINA_STARS } from '../components/carina'
import type { StarData } from '../types'
import { computeAltAz } from '../lib/astro'

/**
 * Mapa celeste desenhado — projeta o céu ao redor da estrela dedicada
 * num plano SVG. Estrela principal em destaque, constelação de Carina
 * com linhas pontilhadas, fundo com estrelas de fundo geradas
 * deterministicamente (sempre iguais, como um céu "nosso").
 */

interface View {
  /** centro em RA (graus) */
  ra: number
  /** centro em Dec (graus) */
  dec: number
  /** campo de visão vertical em graus */
  fov: number
}

/** converte RA/Dec para x/y no plano tangente (gnomônico) */
function project(ra: number, dec: number, view: View, w: number, h: number) {
  const dRA = ((ra - view.ra + 540) % 360) - 180
  const dDec = dec - view.dec
  const pxPerDeg = h / view.fov
  const x = w / 2 - dRA * Math.cos((view.dec * Math.PI) / 180) * pxPerDeg
  const y = h / 2 - dDec * pxPerDeg
  return { x, y }
}

/** estrelas de fundo fixas (seed determinística) */
function backgroundStars(seed: number, count: number) {
  let s = seed
  const rnd = () => {
    s = (s * 1103515245 + 12345) % 2147483648
    return s / 2147483648
  }
  return Array.from({ length: count }, () => ({
    x: rnd(),
    y: rnd(),
    r: 0.5 + rnd() * 1.1,
    o: 0.25 + rnd() * 0.6,
    tw: rnd() * 6,
  }))
}

function magToR(mag: number): number {
  // escala: mag 0 → grande, cada magnitude diminui
  return Math.max(1, 10 * Math.pow(0.78, mag + 1.2))
}

export interface SkyCanvasHandle {
  centerOnStar: () => void
  containerRef: React.RefObject<HTMLDivElement | null>
}

export function SkyCanvas({
  star,
  lat,
  lon,
  date,
  fullscreen,
  onCenterRef,
  onExitFullscreen,
}: {
  star: StarData
  lat: number
  lon: number
  date: Date
  fullscreen: boolean
  onCenterRef?: (h: SkyCanvasHandle) => void
  onExitFullscreen?: () => void
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const [size, setSize] = useState({ w: 360, h: 380 })
  const [view, setView] = useState<View>({ ra: star.ra_deg, dec: star.dec_deg, fov: 20 })
  const viewRef = useRef(view)
  viewRef.current = view

  // pinch / drag
  const pointerState = useRef<{
    mode: 'none' | 'drag' | 'pinch'
    startX: number
    startY: number
    startView: View
    pointers: Map<number, { x: number; y: number }>
    pinchDist: number
    startFov: number
  }>({
    mode: 'none',
    startX: 0,
    startY: 0,
    startView: view,
    pointers: new Map(),
    pinchDist: 0,
    startFov: 20,
  })

  const bg = useMemo(() => backgroundStars(16, 90), [])
  const reducedMotion = useReducedMotion()

  const centerOnStar = useCallback(() => {
    setView((v) => ({ ...v, ra: star.ra_deg, dec: star.dec_deg }))
  }, [star.ra_deg, star.dec_deg])

  useEffect(() => {
    if (onCenterRef) onCenterRef({ centerOnStar, containerRef: wrapRef })
  }, [onCenterRef, centerOnStar])

  // tamanho
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      setSize({ w: el.clientWidth, h: el.clientHeight })
    })
    ro.observe(el)
    setSize({ w: el.clientWidth, h: el.clientHeight })
    return () => ro.disconnect()
  }, [])

  // interação touch/mouse
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return

    const degPerPx = () => {
      const v = viewRef.current
      return v.fov / Math.max(size.h, 1)
    }

    const onDown = (e: PointerEvent) => {
      pointerState.current.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      el.setPointerCapture(e.pointerId)
      if (pointerState.current.pointers.size === 1) {
        pointerState.current.mode = 'drag'
        pointerState.current.startX = e.clientX
        pointerState.current.startY = e.clientY
        pointerState.current.startView = { ...viewRef.current }
      } else if (pointerState.current.pointers.size === 2) {
        pointerState.current.mode = 'pinch'
        const pts = [...pointerState.current.pointers.values()]
        pointerState.current.pinchDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
        pointerState.current.startFov = viewRef.current.fov
      }
    }

    const onMove = (e: PointerEvent) => {
      const st = pointerState.current
      if (!st.pointers.has(e.pointerId)) return
      st.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

      if (st.mode === 'drag' && st.pointers.size === 1) {
        const dx = e.clientX - st.startX
        const dy = e.clientY - st.startY
        const d = degPerPx()
        const sv = st.startView
        const newRa = sv.ra + (dx * d) / Math.cos((sv.dec * Math.PI) / 180)
        const newDec = sv.dec + dy * d
        setView((v) => ({
          ...v,
          ra: ((newRa % 360) + 360) % 360,
          dec: Math.max(-85, Math.min(85, newDec)),
        }))
      } else if (st.mode === 'pinch' && st.pointers.size === 2) {
        const pts = [...st.pointers.values()]
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
        if (st.pinchDist > 0 && dist > 0) {
          const fov = Math.max(2, Math.min(90, (st.startFov * st.pinchDist) / dist))
          setView((v) => ({ ...v, fov }))
        }
      }
    }

    const onUp = (e: PointerEvent) => {
      pointerState.current.pointers.delete(e.pointerId)
      if (pointerState.current.pointers.size === 0) {
        pointerState.current.mode = 'none'
      } else if (pointerState.current.pointers.size === 1) {
        const pt = [...pointerState.current.pointers.values()][0]
        pointerState.current.mode = 'drag'
        pointerState.current.startX = pt.x
        pointerState.current.startY = pt.y
        pointerState.current.startView = { ...viewRef.current }
      }
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      setView((v) => ({
        ...v,
        fov: Math.max(2, Math.min(90, v.fov * (e.deltaY > 0 ? 1.12 : 0.89))),
      }))
    }

    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
      el.removeEventListener('wheel', onWheel)
    }
  }, [size.h])

  const altaz = useMemo(
    () => computeAltAz(star.ra_deg, star.dec_deg, lat, lon, date),
    [star.ra_deg, star.dec_deg, lat, lon, date]
  )

  const w = size.w
  const h = size.h

  const mainPos = project(star.ra_deg, star.dec_deg, view, w, h)

  const carinaPts = CARINA_STARS.map((s) =>
    project(s.ra, s.dec, view, w, h)
  )

  return (
    <div
      ref={wrapRef}
      className={`sky-frame ${fullscreen ? 'fullscreen' : ''}`}
      role="application"
      aria-label="mapa do céu — arraste para explorar, pinça para aproximar"
    >
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="xMidYMid slice"
        style={{ display: 'block', height: '100%', width: '100%' }}
      >
        <defs>
          <radialGradient id="star-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f6e8bd" stopOpacity="0.9" />
            <stop offset="45%" stopColor="#e9c78a" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#e9c78a" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* estrelas de fundo */}
        {bg.map((s, i) => (
          <circle
            key={i}
            cx={((s.x * w * 1.4 - 0.2 * w) % w + w) % w}
            cy={((s.y * h * 1.4 - 0.2 * h) % h + h) % h}
            r={s.r}
            fill="#d8ceb8"
            opacity={reducedMotion ? s.o : undefined}
          >
            {reducedMotion ? null : (
              <animate attributeName="opacity" values={`${s.o};${Math.min(1, s.o + 0.25)};${s.o}`} dur={`${3 + (i % 5)}s`} repeatCount="indefinite" />
            )}
          </circle>
        ))}

        {/* linhas da constelação */}
        {CARINA_LINES.map(([a, b], i) => {
          const p1 = carinaPts[a]
          const p2 = carinaPts[b]
          const visible =
            p1.x > -200 && p1.x < w + 200 && p2.x > -200 && p2.x < w + 200
          if (!visible) return null
          return (
            <line
              key={i}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke="rgba(233,199,138,0.28)"
              strokeWidth="1"
              strokeDasharray="3 4"
            />
          )
        })}

        {/* estrelas da Carina */}
        {CARINA_STARS.map((s, i) => {
          const p = carinaPts[i]
          if (p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20) return null
          const r = magToR(s.mag)
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={r} fill="#e7dcc4" opacity="0.85" />
              {s.name ? (
                <text
                  x={p.x + r + 4}
                  y={p.y + 3}
                  fill="rgba(234,227,214,0.45)"
                  fontSize="10"
                  fontFamily="Caveat, cursive"
                >
                  {s.name}
                </text>
              ) : null}
            </g>
          )
        })}

        {/* a estrela dedicada */}
        <g>
          <circle cx={mainPos.x} cy={mainPos.y} r={reducedMotion ? 34 : undefined} fill="url(#star-glow)">
            {reducedMotion ? null : (
              <animate attributeName="r" values="30;40;30" dur="4.5s" repeatCount="indefinite" />
            )}
          </circle>
          <circle cx={mainPos.x} cy={mainPos.y} r="3.4" fill="#f2e2c0" />
          <circle cx={mainPos.x} cy={mainPos.y} r="8" fill="none" stroke="#e9c78a" strokeWidth="0.9" opacity="0.8">
            {reducedMotion ? null : (
              <animate attributeName="r" values="7;12;7" dur="4.5s" repeatCount="indefinite" />
            )}
          </circle>
          <text
            x={mainPos.x}
            y={mainPos.y - 18}
            textAnchor="middle"
            fill="#e9c78a"
            fontSize="13"
            fontFamily="Caveat, cursive"
          >
            auany
          </text>
        </g>

        {/* indicador do horizonte quando a estrela está visível */}
        {altaz.altitude > 0 ? (
          <text x="12" y={h - 12} fill="rgba(234,227,214,0.5)" fontSize="11" fontFamily="Caveat, cursive">
            {`ela está no céu agora · ${altaz.altitude.toFixed(1)}° acima do horizonte`}
          </text>
        ) : (
          <text x="12" y={h - 12} fill="rgba(234,227,214,0.4)" fontSize="11" fontFamily="Caveat, cursive">
            escondida abaixo do horizonte · mas ainda está lá
          </text>
        )}
      </svg>
      {fullscreen ? (
        <div className="sky-fs-ui">
          <button
            type="button"
            className="btn-ink sky-exit"
            onClick={onExitFullscreen}
            aria-label="sair da tela cheia"
            style={{ fontSize: '1.15rem' }}
          >
            sair da tela cheia
          </button>
          <button
            type="button"
            className="btn-ink sky-recenter"
            onClick={centerOnStar}
            aria-label="centralizar na estrela"
            style={{ fontSize: '1.15rem' }}
          >
            centralizar na estrela
          </button>
        </div>
      ) : null}
    </div>
  )
}
