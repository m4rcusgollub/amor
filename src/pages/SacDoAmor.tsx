import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChapterHead } from '../components/ui'
import { fetchSacMessages, sendSacMessage, uploadSacMedia, isSupabaseReady } from '../services/sacApi'
import type { SacMessage } from '../types'

const KINDS: { id: SacMessage['kind']; label: string; hint: string }[] = [
  { id: 'recado', label: 'um recado', hint: 'algo que você quer me dizer' },
  { id: 'vontade', label: 'uma vontade', hint: 'algo que você tá com vontade de fazer' },
  { id: 'comida', label: 'vontade de comer', hint: 'aquela comidinha que bateu' },
  { id: 'plano', label: 'um plano', hint: 'algo que você quer fazer comigo' },
]

function kindLabel(kind: string): string {
  return KINDS.find((k) => k.id === kind)?.label ?? 'recado'
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'agorinha'
  if (min < 60) return `${min} min atrás`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h atrás`
  const d = Math.floor(h / 24)
  return d === 1 ? 'ontem' : `${d} dias atrás`
}

export default function SacDoAmor() {
  const [messages, setMessages] = useState<SacMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [kind, setKind] = useState<SacMessage['kind']>('recado')
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [feedback, setFeedback] = useState<'ok' | 'err' | null>(null)
  const [offline, setOffline] = useState(false)
  const fileRef = useRef<HTMLInputElement | null>(null)

  const load = () => {
    fetchSacMessages()
      .then(setMessages)
      .catch(() => setMessages([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    setOffline(!isSupabaseReady)
    load()
  }, [])

  const pickFile = (f: File | null) => {
    setFile(f)
    if (filePreview) URL.revokeObjectURL(filePreview)
    setFilePreview(f ? URL.createObjectURL(f) : null)
  }

  const submit = async () => {
    if (!text.trim() && !file) return
    setSending(true)
    setFeedback(null)
    try {
      let media_url: string | null = null
      let media_type: SacMessage['media_type'] = null
      if (file) {
        const up = await uploadSacMedia(file)
        media_url = up.url
        media_type = up.type
      }
      await sendSacMessage({
        author: 'auany',
        kind,
        text: text.trim() || '(sem texto, só o anexo)',
        media_url,
        media_type,
      })
      setText('')
      pickFile(null)
      setFeedback('ok')
      load()
    } catch {
      setFeedback('err')
    } finally {
      setSending(false)
      setTimeout(() => setFeedback(null), 3500)
    }
  }

  const activeKind = KINDS.find((k) => k.id === kind)!

  return (
    <main className="page">
      <div className="page-inner">
        <ChapterHead
          kicker="capítulo cinco"
          title="Sac do Amor"
          note="deixa aqui qualquer coisa — eu vejo tudo"
        />
        <div className="h-line" aria-hidden="true" />

        {offline ? (
          <div className="placeholder-note">
            o sac precisa do supabase configurado pra guardar seus recados —
            <br />
            mas logo logo tá tudo pronto pra você me mandar coisa
          </div>
        ) : (
          <motion.section
            className="sac-form tex-noise"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="tape tape--top" aria-hidden="true" />
            <p className="sac-label">o que você quer deixar pra mim?</p>

            <div className="sac-kinds" role="radiogroup" aria-label="tipo de recado">
              {KINDS.map((k) => (
                <button
                  key={k.id}
                  type="button"
                  className={`sac-kind ${kind === k.id ? 'active' : ''}`}
                  onClick={() => setKind(k.id)}
                  role="radio"
                  aria-checked={kind === k.id}
                >
                  {k.label}
                </button>
              ))}
            </div>
            <p className="sac-hint">{activeKind.hint}</p>

            <textarea
              className="sac-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="escreve aqui do seu jeitinho…"
              rows={4}
              maxLength={2000}
            />

            <div className="sac-media-row">
              <input
                ref={fileRef}
                type="file"
                accept="image/*,video/*"
                className="sr-only"
                onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                className="sac-attach"
                onClick={() => fileRef.current?.click()}
              >
                {file ? 'trocar anexo' : 'anexar foto ou vídeo'}
              </button>
              {filePreview ? (
                <div className="sac-preview">
                  {file?.type.startsWith('video') ? (
                    <video src={filePreview} muted playsInline />
                  ) : (
                    <img src={filePreview} alt="prévia do anexo" />
                  )}
                  <button
                    type="button"
                    className="sac-preview-x"
                    onClick={() => pickFile(null)}
                    aria-label="remover anexo"
                  >
                    ×
                  </button>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              className="btn-ink sac-send"
              onClick={submit}
              disabled={sending || (!text.trim() && !file)}
            >
              {sending ? 'enviando…' : 'mandar pro marcus'}
            </button>

            {feedback === 'ok' ? (
              <p className="sac-feedback ok">enviado — vou ler cada palavra</p>
            ) : null}
            {feedback === 'err' ? (
              <p className="sac-feedback err">
                não deu pra enviar agora… tenta de novo pra mim?
              </p>
            ) : null}
          </motion.section>
        )}

        <div className="h-line" aria-hidden="true" />

        {loading ? (
          <p className="marginalia center">carregando seus recados…</p>
        ) : messages.length === 0 ? (
          <p className="marginalia center">
            {offline
              ? 'seus recados vão aparecer aqui'
              : 'nenhum recado ainda — o primeiro é seu'}
          </p>
        ) : (
          <ul className="sac-list">
            {messages.map((m, i) => (
              <motion.li
                key={m.id}
                className={`sac-item ${i % 2 === 0 ? 'tilt-l' : 'tilt-r'}`}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45 }}
              >
                <span className="sac-item-kind">{kindLabel(m.kind)}</span>
                {m.text && m.text !== '(sem texto, só o anexo)' ? (
                  <p className="sac-item-text">{m.text}</p>
                ) : null}
                {m.media_url && m.media_type === 'image' ? (
                  <img className="sac-item-media" src={m.media_url} alt="foto da auany" loading="lazy" />
                ) : null}
                {m.media_url && m.media_type === 'video' ? (
                  <video className="sac-item-media" src={m.media_url} controls playsInline preload="metadata" />
                ) : null}
                <span className="sac-item-time">{timeAgo(m.created_at)}</span>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
