import { Link, useLocation, useNavigate } from 'react-router-dom'

export function MenuIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
      <path d="M4 7 C 8 6.5, 16 7.5, 20 7" />
      <path d="M4 12 C 8 11.5, 16 12.5, 20 12" />
      <path d="M4 17 C 8 16.5, 16 17.5, 20 17" />
    </svg>
  )
}

export function BackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 5 C 12 8, 9 10, 6 12 C 9 14, 12 16, 15 19" />
    </svg>
  )
}

export function TopBar({ isHome }: { isHome: boolean }) {
  const navigate = useNavigate()
  const location = useLocation()

  const canGoBack = location.key !== 'default' && !isHome

  return (
    <div className="top-bar">
      {isHome ? (
        <span className="menu-btn" style={{ visibility: 'hidden' }} aria-hidden="true">
          <MenuIcon />
        </span>
      ) : (
        <button
          type="button"
          className={`back-btn ${canGoBack ? 'show' : ''}`}
          onClick={() => (canGoBack ? navigate(-1) : navigate('/'))}
          aria-label="voltar"
        >
          <BackIcon />
          <span>voltar</span>
        </button>
      )}
    </div>
  )
}

export function ChapterHead({
  kicker,
  title,
  note,
}: {
  kicker?: string
  title: string
  note?: string
}) {
  return (
    <header className="chapter-head soft-rise">
      {kicker ? <span className="chapter-kicker">{kicker}</span> : null}
      <h1 className="chapter-title">{title}</h1>
      {note ? <span className="chapter-note">{note}</span> : null}
    </header>
  )
}

export function EmptyNote({ children }: { children: React.ReactNode }) {
  return <div className="placeholder-note">{children}</div>
}

export function BackHome() {
  return (
    <p className="center mt-3">
      <Link to="/" className="link-ink" style={{ fontFamily: 'var(--hand)', fontSize: '1.2rem' }}>
        voltar ao início
      </Link>
    </p>
  )
}
