import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { NavProvider } from './components/Nav'
import { TopBar } from './components/ui'
import { MusicProvider } from './components/MusicPlayer'
import { GradientBackground } from './components/GradientBackground'
import Home from './pages/Home'
import Historia from './pages/Historia'
import Galeria from './pages/Galeria'
import Cartas from './pages/Cartas'
import SacDoAmor from './pages/SacDoAmor'
import LuzDoMeuCeu from './pages/LuzDoMeuCeu'
import Musica from './pages/Musica'
import NossoMapa from './pages/NossoMapa'
import Admin from './pages/Admin'
import Login from './pages/Login'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin') || location.pathname === '/login'

  return (
    <NavProvider>
      <div className="body-bg">
        <GradientBackground />
      </div>
      <ScrollToTop />
      {!isAdmin && (
        <MusicProvider>
          <TopBar isHome={location.pathname === '/'} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/historia" element={<Historia />} />
            <Route path="/galeria" element={<Galeria />} />
            <Route path="/galeria/:id" element={<Galeria />} />
            <Route path="/cartas" element={<Cartas />} />
            <Route path="/sac-do-amor" element={<SacDoAmor />} />
            <Route path="/luz-do-meu-ceu" element={<LuzDoMeuCeu />} />
            <Route path="/musica" element={<Musica />} />
            <Route path="/nosso-mapa" element={<NossoMapa />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </MusicProvider>
      )}
      {isAdmin && (
        <Routes>
          <Route path="/admin" element={<Admin />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      )}
    </NavProvider>
  )
}
