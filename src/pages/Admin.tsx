import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { uploadPhotosBulk } from '../services/api'
import type { Letter, Memory, MusicTrack, Photo, SacMessage, Surprise, TimelineEvent } from '../types'

/**
 * Admin — painel simples de manutenção (única área com cara de painel).
 * CRUD direto no Supabase; apenas o usuário autenticado (marcos) entra.
 */

type Tab = 'fotos' | 'historia' | 'sac' | 'cartas' | 'musica' | 'estrela'

const TABS: { id: Tab; label: string }[] = [
  { id: 'fotos', label: 'fotos' },
  { id: 'historia', label: 'história' },
  { id: 'sac', label: 'sac do amor' },
  { id: 'cartas', label: 'cartas' },
  { id: 'musica', label: 'música' },
  { id: 'estrela', label: 'estrela' },
]

type Row = Partial<Photo & TimelineEvent & Memory & Letter & MusicTrack & Surprise> & {
  id: string
  [k: string]: unknown
}

interface StarRow {
  name: string
  constellation: string
  ra_text: string
  dec_text: string
  ra_deg: number
  dec_deg: number
  magnitude: string
  default_city: string
  default_lat: number
  default_lon: number
  dedication_text: string
  secret_text: string
  certificate_url: string
}

export default function Admin() {
  const navigate = useNavigate()
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [tab, setTab] = useState<Tab>('fotos')
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const [rows, setRows] = useState<Row[]>([])
  const [star, setStar] = useState<StarRow | null>(null)
  const [editing, setEditing] = useState<Row | null>(null)
  const [sac, setSac] = useState<SacMessage[]>([])

  const tableFor: Record<Tab, string> = useMemo(
    () => ({
      fotos: 'photos',
      historia: 'timeline_events',
      sac: 'sac_messages',
      cartas: 'letters',
      musica: 'music',
      estrela: 'star_experience',
    }),
    []
  )

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setAuthed(false)
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate('/login', { replace: true })
      else setAuthed(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') navigate('/login', { replace: true })
    })
    return () => sub.subscription.unsubscribe()
  }, [navigate])

  const flash = (kind: 'ok' | 'err', text: string) => {
    setMsg({ kind, text })
    setTimeout(() => setMsg(null), 3200)
  }

  const loadRows = useCallback(async () => {
    if (!supabase || !authed) return
    if (tab === 'estrela') {
      const { data } = await supabase.from('star_experience').select('*').limit(1).maybeSingle()
      setStar(data as StarRow | null)
      return
    }
    if (tab === 'sac') {
      const { data, error } = await supabase
        .from('sac_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200)
      if (error) flash('err', error.message)
      setSac((data ?? []) as SacMessage[])
      return
    }
    if (tab === 'fotos') {
      // mesma ordem da galeria: das mais recentes pra mais antigas
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('date', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
      if (error) flash('err', error.message)
      setRows((data ?? []) as Row[])
      return
    }
    const { data, error } = await supabase
      .from(tableFor[tab])
      .select('*')
      .order('position', { ascending: true })
    if (error) flash('err', error.message)
    setRows((data ?? []) as Row[])
  }, [tab, authed, tableFor])

  useEffect(() => {
    if (authed) loadRows()
  }, [authed, loadRows])

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  const saveRow = async (row: Row) => {
    if (!supabase) return
    const table = tableFor[tab]
    const payload: Record<string, unknown> = { ...row }
    delete payload.id
    Object.keys(payload).forEach((k) => {
      if (payload[k] === '' ) payload[k] = null
    })
    if (!('active' in row) && tab === 'cartas') payload.active = true
    const res = row.id
      ? await supabase.from(table).update(payload).eq('id', row.id)
      : await supabase.from(table).insert(payload)
    if (res.error) flash('err', res.error.message)
    else {
      flash('ok', 'salvo.')
      setEditing(null)
      loadRows()
    }
  }

  const deleteRow = async (id: string) => {
    if (!supabase) return
    if (!window.confirm('apagar mesmo?')) return
    const { error } = await supabase.from(tableFor[tab]).delete().eq('id', id)
    if (error) flash('err', error.message)
    else {
      flash('ok', 'apagado.')
      loadRows()
    }
  }

  const moveRow = async (row: Row, dir: -1 | 1) => {
    if (!supabase) return
    const list = [...rows]
    const i = list.findIndex((r) => r.id === row.id)
    const j = i + dir
    if (i < 0 || j < 0 || j >= list.length) return
    ;[list[i], list[j]] = [list[j], list[i]]
    const updates = list.map((r, idx) => ({ id: r.id, position: idx + 1 }))
    const { error } = await supabase.from(tableFor[tab]).upsert(updates)
    if (error) flash('err', error.message)
    else loadRows()
  }

  const saveStar = async () => {
    if (!supabase || !star) return
    const { id: _omit, ...payload } = star as StarRow & { id?: string }
    const res = star
      ? await supabase.from('star_experience').upsert(payload)
      : undefined
    if (res && res.error) flash('err', res.error.message)
    else flash('ok', 'estrela salva.')
    loadRows()
  }

  if (authed === null) {
    return (
      <main className="admin-page page">
        <p className="admin-sub">carregando…</p>
      </main>
    )
  }

  if (!authed) {
    return (
      <main className="admin-page page">
        <div className="page-inner">
          <h1 className="admin-title">admin</h1>
          <p className="admin-sub">
            para manter este universo, é preciso configurar o supabase (.env) e entrar com a conta do marcos.
          </p>
          <p>
            <button className="admin-btn" onClick={() => navigate('/login')}>ir para o login</button>
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="admin-page page">
      <div className="page-inner">
        <div className="admin-toolbar">
          <h1 className="admin-title">cantinho do marcos</h1>
          <button className="admin-btn ghost" onClick={signOut}>sair</button>
        </div>

        <nav className="admin-tabs" aria-label="seções">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`admin-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => {
                setTab(t.id)
                setEditing(null)
              }}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {msg ? <div className={`admin-msg ${msg.kind}`}>{msg.text}</div> : null}

        <section className="admin-panel">
          {tab === 'estrela' ? (
            star ? (
              <StarEditor star={star} setStar={setStar} onSave={saveStar} />
            ) : (
              <p className="admin-sub">carregando dados da estrela…</p>
            )
          ) : tab === 'sac' ? (
            <>
              <div className="admin-toolbar">
                <span className="admin-sub" style={{ margin: 0 }}>
                  {sac.length} recado(s) da auany
                </span>
              </div>
              {sac.length === 0 ? (
                <p className="admin-sub">nenhum recado ainda — quando ela mandar, aparece aqui.</p>
              ) : (
                <ul className="admin-list">
                  {sac.map((m) => (
                    <li className="admin-row admin-sac-row" key={m.id}>
                      <div className="ar-main">
                        <div className="ar-title">
                          {m.kind === 'recado' ? 'recado' : m.kind === 'vontade' ? 'vontade' : m.kind === 'comida' ? 'vontade de comer' : 'plano'}
                          {' · '}
                          <small style={{ color: '#6b6660' }}>
                            {new Date(m.created_at).toLocaleString('pt-BR')}
                          </small>
                        </div>
                        {m.text ? <div className="ar-sac-text">{m.text}</div> : null}
                        {m.media_url && m.media_type === 'image' ? (
                          <img className="ar-sac-media" src={m.media_url} alt="anexo da auany" />
                        ) : null}
                        {m.media_url && m.media_type === 'video' ? (
                          <video className="ar-sac-media" src={m.media_url} controls playsInline preload="metadata" />
                        ) : null}
                      </div>
                      <div className="ar-actions">
                        <button className="danger" onClick={() => deleteRow(m.id)}>apagar</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : editing ? (
            <RowForm
              tab={tab}
              row={editing}
              onCancel={() => setEditing(null)}
              onSave={saveRow}
            />
          ) : tab === 'fotos' ? (
            <>
              <BulkUploader onDone={loadRows} />
              <div className="admin-toolbar" style={{ marginTop: 18 }}>
                <span className="admin-sub" style={{ margin: 0 }}>
                  {rows.length} registro(s)
                </span>
                <button
                  className="admin-btn"
                  onClick={() =>
                    setEditing({ title: '', description: '', image_url: '', thumbnail_url: '', date: null, position: rows.length + 1, featured: false } as Row)
                  }
                >
                  adicionar uma por URL
                </button>
              </div>
              <ul className="admin-list">
                {rows.map((r) => (
                  <li className="admin-row" key={r.id}>
                    {typeof r.image_url === 'string' && r.image_url ? (
                      <img src={r.image_url} alt="" />
                    ) : typeof r.thumbnail_url === 'string' && r.thumbnail_url ? (
                      <img src={r.thumbnail_url} alt="" />
                    ) : null}
                    <div className="ar-main">
                      <div className="ar-title">{String(r.title ?? r.id)}</div>
                      <div className="ar-sub">
                        {String(r.date ?? r.description ?? '')?.slice(0, 60)}
                      </div>
                    </div>
                    <div className="ar-actions">
                      <button onClick={() => setEditing(r)}>editar</button>
                      <button className="danger" onClick={() => deleteRow(r.id)}>apagar</button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <div className="admin-toolbar">
                <span className="admin-sub" style={{ margin: 0 }}>
                  {rows.length} registro(s)
                </span>
                <button
                  className="admin-btn"
                  onClick={() =>
                    setEditing((tab === 'historia'
                      ? { title: '', description: '', date: null, image_url: null, position: rows.length + 1 }
                      : tab === 'cartas'
                        ? { title: '', content: '', date: null, image_url: null, position: rows.length + 1, active: true }
                        : { title: '', artist: '', audio_url: null, spotify_url: null, position: rows.length + 1 }) as Row)
                  }
                >
                  adicionar
                </button>
              </div>
              <ul className="admin-list">
                {rows.map((r) => (
                  <li className="admin-row" key={r.id}>
                    {typeof r.image_url === 'string' && r.image_url ? (
                      <img src={r.image_url} alt="" />
                    ) : null}
                    <div className="ar-main">
                      <div className="ar-title">{String(r.title ?? r.artist ?? r.id)}</div>
                      <div className="ar-sub">
                        {String(r.date ?? r.description ?? r.content ?? '')?.slice(0, 60)}
                      </div>
                    </div>
                    <div className="ar-actions">
                      <button onClick={() => moveRow(r, -1)} aria-label="subir">↑</button>
                      <button onClick={() => moveRow(r, 1)} aria-label="descer">↓</button>
                      <button onClick={() => setEditing(r)}>editar</button>
                      <button className="danger" onClick={() => deleteRow(r.id)}>apagar</button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
    </main>
  )
}

function Field({
  label,
  value,
  onChange,
  textarea,
  type = 'text',
}: {
  label: string
  value: unknown
  onChange: (v: string) => void
  textarea?: boolean
  type?: string
}) {
  return (
    <div className="admin-field">
      <label>{label}</label>
      {textarea ? (
        <textarea value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input
          type={type}
          value={value === null || value === undefined ? '' : String(value)}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  )
}

/** upload em massa de fotos — seleciona várias, sobe com thumbnails e data exif */
function BulkUploader({ onDone }: { onDone: () => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<{ done: number; total: number; name: string } | null>(null)
  const [result, setResult] = useState<{ ok: number; fail: number; errors: string[] } | null>(null)

  const start = async (files: File[]) => {
    if (files.length === 0) return
    setBusy(true)
    setResult(null)
    setProgress({ done: 0, total: files.length, name: files[0].name })
    try {
      const res = await uploadPhotosBulk(files, (done, total, name) =>
        setProgress({ done, total, name })
      )
      setResult(res)
      onDone()
    } catch (e) {
      setResult({ ok: 0, fail: files.length, errors: [e instanceof Error ? e.message : 'erro'] })
    } finally {
      setBusy(false)
      setProgress(null)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="bulk-uploader">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(e) => start(Array.from(e.target.files ?? []))}
      />
      <button
        type="button"
        className="admin-btn bulk-btn"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
      >
        {busy ? 'subindo fotos…' : 'escolher fotos em massa'}
      </button>
      <p className="admin-sub" style={{ margin: '8px 0 0' }}>
        pode selecionar todas de uma vez — o título vira o nome do arquivo,
        a data é lida da foto, e a ordem na galeria fica das mais recentes pra mais antigas.
      </p>

      {progress ? (
        <div className="bulk-progress">
          <div className="bulk-bar">
            <div
              className="bulk-fill"
              style={{ width: `${(progress.done / progress.total) * 100}%` }}
            />
          </div>
          <span className="bulk-count">
            {progress.done} / {progress.total} · {progress.name.slice(0, 30)}
          </span>
        </div>
      ) : null}

      {result ? (
        <div className={`admin-msg ${result.fail > 0 ? 'err' : 'ok'}`}>
          {result.ok} foto(s) subida(s){result.fail > 0 ? `, ${result.fail} falha(s)` : ''}.
          {result.errors.length > 0 ? ` (${result.errors.slice(0, 2).join('; ')}${result.errors.length > 2 ? '…' : ''})` : ''}
        </div>
      ) : null}
    </div>
  )
}

function RowForm({
  tab,
  row,
  onCancel,
  onSave,
}: {
  tab: Tab
  row: Row
  onCancel: () => void
  onSave: (r: Row) => void
}) {
  const [draft, setDraft] = useState<Row>(row)
  const set = (k: string) => (v: string) => setDraft((d) => ({ ...d, [k]: v }))

  return (
    <div className="admin-form">
      <Field label="título" value={draft.title} onChange={set('title')} />
      {tab === 'fotos' ? (
        <>
          <Field label="descrição" value={draft.description} onChange={set('description')} textarea />
          <Field label="url da imagem" value={draft.image_url} onChange={set('image_url')} />
          <Field label="url do thumbnail" value={draft.thumbnail_url} onChange={set('thumbnail_url')} />
          <Field label="data (aaaa-mm-dd)" value={draft.date} onChange={set('date')} type="date" />
        </>
      ) : null}
      {tab === 'historia' ? (
        <>
          <Field label="descrição" value={draft.description} onChange={set('description')} textarea />
          <Field label="data (aaaa-mm-dd)" value={draft.date} onChange={set('date')} type="date" />
          <Field label="url da imagem (opcional)" value={draft.image_url} onChange={set('image_url')} />
        </>
      ) : null}
      {tab === 'cartas' ? (
        <>
          <Field label="conteúdo da carta" value={draft.content} onChange={set('content')} textarea />
          <Field label="data (aaaa-mm-dd)" value={draft.date} onChange={set('date')} type="date" />
          <Field label="url da imagem (opcional)" value={draft.image_url} onChange={set('image_url')} />
        </>
      ) : null}
      {tab === 'musica' ? (
        <>
          <Field label="artista" value={draft.artist} onChange={set('artist')} />
          <Field label="url do áudio (mp3, opcional)" value={draft.audio_url} onChange={set('audio_url')} />
          <Field label="url do spotify (opcional)" value={draft.spotify_url} onChange={set('spotify_url')} />
        </>
      ) : null}
      <Field label="posição (ordem)" value={draft.position} onChange={set('position')} type="number" />

      <div className="admin-toolbar" style={{ justifyContent: 'flex-end' }}>
        <button className="admin-btn ghost" onClick={onCancel}>cancelar</button>
        <button className="admin-btn" onClick={() => onSave(draft)}>salvar</button>
      </div>
    </div>
  )
}

function StarEditor({
  star,
  setStar,
  onSave,
}: {
  star: StarRow
  setStar: (s: StarRow) => void
  onSave: () => void
}) {
  const set = (k: keyof StarRow) => (v: string) =>
    setStar({ ...star, [k]: v } as StarRow)

  return (
    <div className="admin-form">
      <Field label="nome" value={star.name} onChange={set('name')} />
      <Field label="constelação" value={star.constellation} onChange={set('constellation')} />
      <Field label="ascensão reta (texto)" value={star.ra_text} onChange={set('ra_text')} />
      <Field label="declinação (texto)" value={star.dec_text} onChange={set('dec_text')} />
      <Field label="ra (graus)" value={star.ra_deg} onChange={set('ra_deg')} />
      <Field label="dec (graus)" value={star.dec_deg} onChange={set('dec_deg')} />
      <Field label="magnitude" value={star.magnitude} onChange={set('magnitude')} />
      <Field label="cidade padrão" value={star.default_city} onChange={set('default_city')} />
      <Field label="latitude padrão" value={star.default_lat} onChange={set('default_lat')} />
      <Field label="longitude padrão" value={star.default_lon} onChange={set('default_lon')} />
      <Field label="texto de dedicação" value={star.dedication_text} onChange={set('dedication_text')} textarea />
      <Field label="texto do segredo" value={star.secret_text} onChange={set('secret_text')} textarea />
      <Field label="url do certificado" value={star.certificate_url} onChange={set('certificate_url')} />
      <div className="admin-toolbar" style={{ justifyContent: 'flex-end' }}>
        <button className="admin-btn" onClick={onSave}>salvar estrela</button>
      </div>
    </div>
  )
}
