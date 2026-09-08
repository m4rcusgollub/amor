import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchPhotos } from '../services/api'
import type { Photo } from '../types'
import { ChapterHead, EmptyNote } from '../components/ui'
import { Img } from '../components/Img'
import { useSwipe } from '../hooks/useSwipe'
import { CORD_SVG, PIN_SVG } from '../components/clothesline'

/* ---------- lightbox (toque na foto do carrossel ou varal) ---------- */
function Lightbox({
  photos,
  index,
  onClose,
  onNav,
}: {
  photos: Photo[]
  index: number
  onClose: () => void
  onNav: (i: number) => void
}) {
  const photo = photos[index]
  const swipe = useSwipe(
    () => onNav((index + 1) % photos.length),
    () => onNav((index - 1 + photos.length) % photos.length)
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onNav((index + 1) % photos.length)
      if (e.key === 'ArrowLeft') onNav((index - 1 + photos.length) % photos.length)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [index, photos.length, onClose, onNav])

  if (!photo) return null

  return (
    <motion.div
      className="lb-scrim"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`foto: ${photo.title}`}
      {...swipe}
    >
      <button type="button" className="lb-close" onClick={onClose} aria-label="fechar foto">
        fechar
      </button>
      <span className="lb-counter">
        {index + 1} de {photos.length}
      </span>
      <motion.div
        className="lb-card"
        initial={{ scale: 0.9, opacity: 0, rotate: -1.5 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        key={photo.id}
      >
        <div className="lb-photo">
          <Img src={photo.image_url || photo.thumbnail_url} alt={photo.title} />
          <div className="lb-caption">{photo.title}</div>
        </div>
        <div className="lb-nav">
          <button
            type="button"
            className="lb-btn"
            onClick={() => onNav((index - 1 + photos.length) % photos.length)}
            aria-label="foto anterior"
          >
            ‹ anterior
          </button>
          <button
            type="button"
            className="lb-btn"
            onClick={() => onNav((index + 1) % photos.length)}
            aria-label="próxima foto"
          >
            próxima ›
          </button>
        </div>
        <p className="sky-hint" style={{ color: 'rgba(240,230,218,0.55)' }}>
          deslize para os lados · toque fora para fechar
        </p>
      </motion.div>
    </motion.div>
  )
}

/* ---------- carrossel: uma foto por vez, swipe lateral ---------- */
function Carousel({
  photos,
  index,
  onIndex,
  onOpen,
}: {
  photos: Photo[]
  index: number
  onIndex: (i: number) => void
  onOpen: () => void
}) {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const startX = useRef<number | null>(null)
  const dragging = useRef(false)
  const [dx, setDx] = useState(0)

  const width = typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.86, 420) : 360

  const next = () => onIndex((index + 1) % photos.length)
  const prev = () => onIndex((index - 1 + photos.length) % photos.length)

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    dragging.current = true
  }
  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging.current || startX.current === null) return
    setDx(e.touches[0].clientX - startX.current)
  }
  const onTouchEnd = () => {
    if (dx < -50) next()
    else if (dx > 50) prev()
    dragging.current = false
    startX.current = null
    setDx(0)
  }

  return (
    <div className="carousel" role="region" aria-label="carrossel de fotos — deslize para os lados">
      <div
        className="carousel-viewport"
        ref={trackRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="carousel-track"
          style={{
            transform: `translateX(calc(${-index * (width + 18)}px + ${dx}px))`,
            transition: dragging.current ? 'none' : 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {photos.map((p) => (
            <button
              type="button"
              key={p.id}
              className="polaroid carousel-slide"
              style={{ width }}
              onClick={onOpen}
              aria-label={`abrir foto: ${p.title}`}
            >
              {p.image_url || p.thumbnail_url ? (
                <Img src={p.thumbnail_url || p.image_url} alt={p.title} />
              ) : (
                <div className="carousel-empty">[foto ainda não pendurada]</div>
              )}
              <span className="pl-caption">{p.title}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="carousel-nav">
        <button type="button" className="lb-btn" onClick={prev} aria-label="foto anterior">
          ‹
        </button>
        <span className="carousel-dots" aria-hidden="true">
          {photos.map((_, i) => (
            <span key={i} className={`carousel-dot ${i === index ? 'on' : ''}`} />
          ))}
        </span>
        <button type="button" className="lb-btn" onClick={next} aria-label="próxima foto">
          ›
        </button>
      </div>
      <p className="sky-hint" style={{ color: 'var(--cream-faint)' }}>
        deslize para os lados · toque na foto pra ver de pertinho
      </p>
    </div>
  )
}

/* ---------- página ---------- */
export default function Galeria() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [mode, setMode] = useState<'varal' | 'carrossel'>('varal')
  const [carIndex, setCarIndex] = useState(0)
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    fetchPhotos()
      .then(setPhotos)
      .catch(() => setPhotos([]))
      .finally(() => setLoading(false))
  }, [])

  // link direto para uma foto: /galeria/:id
  useEffect(() => {
    if (photos.length === 0) return
    if (!id) {
      setOpenIndex(null)
      return
    }
    const i = photos.findIndex((p) => p.id === id)
    if (i >= 0) setOpenIndex(i)
  }, [id, photos])

  const openPhoto = (i: number) => {
    setOpenIndex(i)
    setCarIndex(i)
    navigate(`/galeria/${photos[i].id}`) // push: voltar fecha o lightbox
  }

  const closeLb = () => {
    setOpenIndex(null)
    if (id) navigate('/galeria', { replace: true })
  }

  const navTo = (i: number) => {
    setOpenIndex(i)
    setCarIndex(i)
    const target = photos[i]
    if (target && id !== target.id) {
      navigate(`/galeria/${target.id}`, { replace: true })
    }
  }

  return (
    <main className="page tex-noise">
      <div className="page-inner">
        <ChapterHead
          kicker="capítulo três"
          title="Nossa Galeria"
          note="um varal cheio de lembranças penduradas"
        />
        <div className="h-line" aria-hidden="true" />

        {loading ? (
          <p className="marginalia center">pendurando as fotos…</p>
        ) : photos.length === 0 ? (
          <EmptyNote>
            o varal ainda está vazio —
            <br />
            [ADICIONE AQUI AS FOTOS DE VOCÊS]
          </EmptyNote>
        ) : (
          <>
            <div className="mode-switch" role="tablist" aria-label="modo de ver as fotos">
              <button
                type="button"
                className={`mode-btn ${mode === 'varal' ? 'on' : ''}`}
                onClick={() => setMode('varal')}
                role="tab"
                aria-selected={mode === 'varal'}
              >
                varal
              </button>
              <button
                type="button"
                className={`mode-btn ${mode === 'carrossel' ? 'on' : ''}`}
                onClick={() => setMode('carrossel')}
                role="tab"
                aria-selected={mode === 'carrossel'}
              >
                carrossel
              </button>
            </div>

            {mode === 'varal' ? (
              <div className="clothesline">
                {photos.map((p, i) => (
                  <div className="cl-photo-wrap" key={p.id}>
                    <span className="cord" style={{ top: -8, backgroundImage: `url("${CORD_SVG}")` }} aria-hidden="true" />
                    <span className="pin" style={{ top: -10, left: '50%', marginLeft: -9, backgroundImage: `url("${PIN_SVG}")` }} aria-hidden="true" />
                    <button
                      type="button"
                      className="polaroid"
                      style={{ width: '100%', cursor: 'pointer', textAlign: 'left' }}
                      onClick={() => openPhoto(i)}
                      aria-label={`abrir foto: ${p.title}`}
                    >
                      {p.image_url || p.thumbnail_url ? (
                        <Img src={p.thumbnail_url || p.image_url} alt={p.title} />
                      ) : (
                        <div className="carousel-empty">[foto ainda não pendurada]</div>
                      )}
                      <span className="pl-caption">{p.title}</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <Carousel
                photos={photos}
                index={carIndex}
                onIndex={(i) => setCarIndex(i)}
                onOpen={() => openPhoto(carIndex)}
              />
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {openIndex !== null && photos.length > 0 ? (
          <Lightbox photos={photos} index={openIndex} onClose={closeLb} onNav={navTo} />
        ) : null}
      </AnimatePresence>
    </main>
  )
}
