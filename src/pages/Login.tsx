import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) navigate('/admin', { replace: true })
      })
    }
  }, [navigate])

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isSupabaseConfigured || !supabase) {
      setError('supabase ainda não está configurado neste ambiente.')
      return
    }
    setBusy(true)
    setError(null)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (err) {
      setError('não foi possível entrar — confira o e-mail e a senha.')
      return
    }
    navigate('/admin', { replace: true })
  }

  return (
    <main className="admin-page page" style={{ minHeight: '100dvh' }}>
      <form className="admin-login" onSubmit={signIn}>
        <h1 className="admin-title">entrar</h1>
        <p className="admin-sub">só o marcos escreve por aqui.</p>
        <div className="admin-field">
          <label htmlFor="login-email">e-mail</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="admin-field">
          <label htmlFor="login-pass">senha</label>
          <input
            id="login-pass"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error ? <p className="admin-msg err">{error}</p> : null}
        <button type="submit" className="admin-btn" disabled={busy}>
          {busy ? 'entrando…' : 'entrar'}
        </button>
      </form>
    </main>
  )
}
