import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

export const CHAPTERS = [
  { path: '/', n: 'i', title: 'Início' },
  { path: '/historia', n: 'ii', title: 'Dias Juntos' },
  { path: '/galeria', n: 'iii', title: 'Nossa Galeria' },
  { path: '/cartas', n: 'iv', title: 'Cartas' },
  { path: '/sac-do-amor', n: 'v', title: 'Sac do Amor' },
  { path: '/luz-do-meu-ceu', n: 'vi', title: 'Auany — Luz do Meu Céu' },
  { path: '/musica', n: 'vii', title: 'Nossa Música' },
  { path: '/nosso-mapa', n: 'viii', title: 'Nosso Mapa' },
] as const

interface NavContextValue {
  open: boolean
  setOpen: (v: boolean) => void
  toggle: () => void
}

const NavContext = createContext<NavContextValue>({
  open: false,
  setOpen: () => {},
  toggle: () => {},
})

export const useNav = () => useContext(NavContext)

const MotionLink = motion.create(Link)

/** seta desenhada à mão */
function HandArrow() {
  return (
    <svg width="30" height="24" viewBox="0 0 30 24" fill="none" aria-hidden="true">
      <path
        d="M2 12 C 8 10.5, 16 11.5, 23 12.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M17 5.5 C 19.6 8, 21.6 10.4, 23.4 12.4 C 21.2 15, 19 17.8, 17.2 20"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

const overlayVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.32, ease: 'easeOut' as const } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: 'easeIn' as const } },
}

function FullscreenMenu({
  activePath,
  onClose,
}: {
  activePath: string
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <motion.nav
      className="nav-overlay"
      variants={overlayVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      role="dialog"
      aria-modal="true"
      aria-label="índice do nosso álbum"
    >
      <div className="nav-head">
        <div className="nav-head-text">
          <span className="nav-kicker">o índice do</span>
          <span className="nav-title">nosso álbum</span>
        </div>
        <button
          type="button"
          className="nav-close"
          onClick={onClose}
          aria-label="fechar o índice"
        >
          fechar
        </button>
      </div>

      <ul className="nav-list">
        {CHAPTERS.map((c, i) => {
          const active =
            c.path === '/' ? activePath === '/' : activePath.startsWith(c.path)
          return (
            <motion.li
              key={c.path}
              initial={{ opacity: 0, x: -32 }}
              animate={{
                opacity: 1,
                x: 0,
                transition: {
                  delay: 0.14 + i * 0.065,
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                },
              }}
              exit={{
                opacity: 0,
                x: -18,
                transition: { duration: 0.16 },
              }}
            >
              <MotionLink
                to={c.path}
                className={`nav-item ${active ? 'active' : ''}`}
                initial="initial"
                whileHover="hover"
                whileTap="hover"
                onClick={onClose}
              >
                <motion.span
                  className="nav-arrow"
                  custom={active}
                  variants={{
                    initial: (isActive: boolean) => ({
                      x: -26,
                      opacity: isActive ? 0.95 : 0,
                    }),
                    hover: { x: 0, opacity: 1 },
                  }}
                  transition={{ duration: 0.3, ease: 'easeOut' as const }}
                >
                  <HandArrow />
                </motion.span>

                <motion.span
                  className="nav-text"
                  variants={{
                    initial: { x: 0, skewX: 0 },
                    hover: { x: 14, skewX: -6 },
                  }}
                  transition={{ duration: 0.3, ease: 'easeOut' as const }}
                >
                  <em className="nav-n">{c.n}.</em>
                  <span className="nav-t">{c.title}</span>
                </motion.span>
              </MotionLink>
            </motion.li>
          )
        })}
      </ul>

      <div className="nav-foot">
        <span className="stamp">de marcus · para auany</span>
      </div>
    </motion.nav>
  )
}

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const toggle = useCallback(() => setOpen((v) => !v), [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const location = useLocation()
  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  return (
    <NavContext.Provider value={{ open, setOpen, toggle }}>
      {children}
      <AnimatePresence>
        {open ? (
          <FullscreenMenu activePath={location.pathname} onClose={() => setOpen(false)} />
        ) : null}
      </AnimatePresence>
    </NavContext.Provider>
  )
}
