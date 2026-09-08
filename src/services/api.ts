import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { Letter, Memory, MusicTrack, Photo, SacMessage, Surprise, TimelineEvent } from '../types'

/**
 * Conteúdo de exemplo usado quando o Supabase ainda não está configurado.
 * Placeholders claros — Marcus substitui pelo conteúdo real no /admin.
 */

const placeholderPhotos: Photo[] = [
  {
    id: 'ph-1',
    title: 'nossa primeira foto',
    description: '[ESCREVA AQUI SOBRE ESSA FOTO — o dia, o lugar, o que você sentiu]',
    image_url: '',
    thumbnail_url: '',
    date: null,
    position: 1,
    featured: false,
    created_at: new Date().toISOString(),
  },
]

const placeholderTimeline: TimelineEvent[] = [
  {
    id: 'tl-1',
    title: 'o dia em que a gente se encontrou',
    description: '[CONTE AQUI AQUELE PRIMEIRO MOMENTO — como foi, onde foi, o que você lembra]',
    date: null,
    image_url: null,
    position: 1,
    created_at: new Date().toISOString(),
  },
]

const placeholderMemories: Memory[] = [
  {
    id: 'mm-1',
    title: 'uma lembrança pequena',
    content: '[ESCREVA AQUI UMA MEMÓRIA DE VOCÊS — pequena, verdadeira, só de vocês]',
    date: null,
    image_url: null,
    position: 1,
    created_at: new Date().toISOString(),
  },
]

const placeholderLetters: Letter[] = [
  {
    id: 'lt-1',
    title: 'para você, quando quiser ler',
    content:
      'minha princesa,\n\n[ESCREVA AQUI A SUA CARTA — do jeitinho que você fala com ela.]\n\ncom todo o meu amor,\n\nseu marcos',
    date: null,
    image_url: null,
    position: 1,
    active: true,
    created_at: new Date().toISOString(),
  },
]

const placeholderMusic: MusicTrack[] = [
  {
    id: 'mu-1',
    title: 'nossa playlist no spotify',
    artist: 'a playlist que eu fiz pra nós',
    audio_url: null,
    spotify_url: 'https://open.spotify.com/playlist/34fGwb4dlTUhtQBUN7C93p?si=Hv3N_1juTdSeZ_yCkU_sOw',
    position: 1,
    created_at: new Date().toISOString(),
  },
]

const placeholderSurprises: Surprise[] = [
  {
    id: 'sp-1',
    title: 'uma surpresa está sendo preparada',
    description: '[ADICIONE AQUI UMA SURPRESA PARA AUANY — algo novo, escondido, só dela]',
    image_url: null,
    position: 1,
    active: true,
    created_at: new Date().toISOString(),
  },
]

function warnOnce(scope: string) {
  // silencioso no build; a UI mostra estado vazio educadamente
  if (typeof console !== 'undefined') {
    console.info(`[nosso universo] usando conteúdo de exemplo em "${scope}" (supabase não configurado)`)
  }
}

export async function fetchPhotos(): Promise<Photo[]> {
  if (isSupabaseConfigured && supabase) {
    // das mais recentes pra mais antigas: data da foto (sem data vai pro fim),
    // e entre elas, a mais recente adicionada primeiro
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .order('date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []) as Photo[]
  }
  warnOnce('photos')
  return placeholderPhotos
}

export async function fetchTimeline(): Promise<TimelineEvent[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('timeline_events')
      .select('*')
      .order('position', { ascending: true })
    if (error) throw error
    return (data ?? []) as TimelineEvent[]
  }
  warnOnce('timeline')
  return placeholderTimeline
}

export async function fetchMemories(): Promise<Memory[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .order('position', { ascending: true })
    if (error) throw error
    return (data ?? []) as Memory[]
  }
  warnOnce('memories')
  return placeholderMemories
}

export async function fetchLetters(): Promise<Letter[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('letters')
      .select('*')
      .eq('active', true)
      .order('position', { ascending: true })
    if (error) throw error
    return (data ?? []) as Letter[]
  }
  warnOnce('letters')
  return placeholderLetters
}

export async function fetchMusic(): Promise<MusicTrack[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('music')
      .select('*')
      .order('position', { ascending: true })
    if (error) throw error
    return (data ?? []) as MusicTrack[]
  }
  warnOnce('music')
  return placeholderMusic
}

export async function fetchSurprises(): Promise<Surprise[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('surprises')
      .select('*')
      .eq('active', true)
      .order('position', { ascending: true })
    if (error) throw error
    return (data ?? []) as Surprise[]
  }
  warnOnce('surprises')
  return placeholderSurprises
}

export async function fetchStarExperience() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('star_experience')
      .select('*')
      .limit(1)
      .maybeSingle()
    if (error) throw error
    return data
  }
  warnOnce('star_experience')
  return null
}

/* ---- SAC do Amor (mensagens da Auany) ---- */

export async function fetchSacMessages(): Promise<SacMessage[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('sac_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
    if (error) throw error
    return (data ?? []) as SacMessage[]
  }
  return []
}

export async function sendSacMessage(
  msg: Pick<SacMessage, 'author' | 'kind' | 'text'> & {
    media_url?: string | null
    media_type?: 'image' | 'video' | null
  }
): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('sac indisponível sem supabase')
  }
  const { error } = await supabase.from('sac_messages').insert({
    author: msg.author,
    kind: msg.kind,
    text: msg.text,
    media_url: msg.media_url ?? null,
    media_type: msg.media_type ?? null,
  })
  if (error) throw error
}

/** envia mídia direto pro storage (bucket sac) e devolve a url pública */
export async function uploadSacMedia(file: File): Promise<{ url: string; type: 'image' | 'video' }> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('upload indisponível sem supabase')
  }
  const ext = file.name.split('.').pop() ?? 'bin'
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await supabase.storage.from('sac').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error
  const { data } = supabase.storage.from('sac').getPublicUrl(path)
  const type: 'image' | 'video' = file.type.startsWith('video') ? 'video' : 'image'
  return { url: data.publicUrl, type }
}

/* ---- upload em massa de fotos ---- */

/** gera um thumbnail WebP de no máx 600px, client-side, via canvas */
async function makeThumbnail(file: File, max = 600, quality = 0.72): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * scale)
  const h = Math.round(bitmap.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas indisponível')
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close()
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('falha no thumbnail'))),
      'image/webp',
      quality
    )
  })
}

/** lê a data em que a foto foi tirada (EXIF) — null se não achar */
async function readExifDate(file: File): Promise<string | null> {
  try {
    const buf = await file.slice(0, 128 * 1024).arrayBuffer()
    const view = new DataView(buf)
    // JPEG: procura EXIF (APP1)
    if (view.byteLength >= 4 && view.getUint16(0) === 0xffd8) {
      let offset = 2
      while (offset + 4 <= view.byteLength) {
        const marker = view.getUint16(offset)
        const size = view.getUint16(offset + 2)
        if (marker === 0xffe1 && offset + 10 <= view.byteLength) {
          // EXIF?
          const sig = view.getUint32(offset + 4)
          if (sig === 0x45786966) {
            // "Exif"
            const tiff = offset + 10
            const little = view.getUint16(tiff) === 0x4949
            const ifdOffset = view.getUint32(tiff + 4, little)
            const dirStart = tiff + ifdOffset
            const entries = view.getUint16(dirStart, little)
            for (let i = 0; i < entries; i++) {
              const entry = dirStart + 2 + i * 12
              const tag = view.getUint16(entry, little)
              if (tag === 0x9003) {
                // DateTimeOriginal
                const valOffset = view.getUint32(entry + 8, little)
                const chars: string[] = []
                for (let c = 0; c < 20; c++) {
                  chars.push(String.fromCharCode(view.getUint8(tiff + valOffset + c)))
                }
                const raw = chars.join('') // "AAAA:MM:DD HH:MM:SS"
                const [d, t] = raw.split(' ')
                if (d && t) {
                  const iso = `${d.replace(/:/g, '-')}`
                  const date = new Date(`${iso}T${t}Z`)
                  if (!Number.isNaN(date.getTime())) {
                    return date.toISOString().slice(0, 10)
                  }
                }
                return null
              }
            }
            return null
          }
        }
        offset += 2 + size
      }
    }
    return null
  } catch {
    return null
  }
}

export interface BulkUploadResult {
  ok: number
  fail: number
  errors: string[]
}

/**
 * Sobe várias fotos de uma vez pro bucket 'photos':
 * - original em photos/original/
 * - thumbnail (600px webp) em photos/thumbs/
 * - cria o registro na tabela photos com título = nome do arquivo
 * Retorna contagem de sucessos/falhas.
 */
export async function uploadPhotosBulk(
  files: File[],
  onProgress?: (done: number, total: number, currentName: string) => void
): Promise<BulkUploadResult> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('upload indisponível sem supabase')
  }

  let ok = 0
  let fail = 0
  const errors: string[] = []
  let done = 0

  for (const file of files) {
    const base = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim() || 'nossa foto'
    try {
      const stamp = Date.now()
      const rand = Math.random().toString(36).slice(2, 8)
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'

      // 1) thumbnail webp + data exif (quando a foto foi tirada)
      const [thumbBlob, exifDate] = await Promise.all([
        makeThumbnail(file),
        readExifDate(file),
      ])

      // 2) upload original
      const originalPath = `original/${stamp}-${rand}.${ext}`
      const { error: errOriginal } = await supabase.storage
        .from('photos')
        .upload(originalPath, file, { cacheControl: '31536000', upsert: false })
      if (errOriginal) throw errOriginal

      // 3) upload thumbnail
      const thumbPath = `thumbs/${stamp}-${rand}.webp`
      const { error: errThumb } = await supabase.storage
        .from('photos')
        .upload(thumbPath, thumbBlob, {
          cacheControl: '31536000',
          upsert: false,
          contentType: 'image/webp',
        })
      if (errThumb) throw errThumb

      // 4) urls públicas
      const { data: dOriginal } = supabase.storage.from('photos').getPublicUrl(originalPath)
      const { data: dThumb } = supabase.storage.from('photos').getPublicUrl(thumbPath)

      // 5) registro na tabela — ordenada pela data da foto (mais recente primeiro)
      const { error: errRow } = await supabase.from('photos').insert({
        title: base,
        description: '',
        image_url: dOriginal.publicUrl,
        thumbnail_url: dThumb.publicUrl,
        date: exifDate,
        position: 0,
        featured: false,
      })
      if (errRow) throw errRow

      ok++
    } catch (e) {
      fail++
      errors.push(`${file.name}: ${e instanceof Error ? e.message : 'erro desconhecido'}`)
    } finally {
      done++
      onProgress?.(done, files.length, file.name)
    }
  }

  return { ok, fail, errors }
}
