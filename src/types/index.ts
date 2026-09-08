export interface Photo {
  id: string
  title: string
  description: string
  image_url: string
  thumbnail_url: string
  date: string | null
  position: number
  featured: boolean
  created_at: string
}

export interface TimelineEvent {
  id: string
  title: string
  description: string
  date: string | null
  image_url: string | null
  position: number
  created_at: string
}

export interface Memory {
  id: string
  title: string
  content: string
  date: string | null
  image_url: string | null
  position: number
  created_at: string
}

export interface Letter {
  id: string
  title: string
  content: string
  date: string | null
  image_url: string | null
  position: number
  active: boolean
  created_at: string
}

export interface MusicTrack {
  id: string
  title: string
  artist: string
  audio_url: string | null
  spotify_url: string | null
  position: number
  created_at: string
}

export interface StarData {
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

export interface Surprise {
  id: string
  title: string
  description: string
  image_url: string | null
  position: number
  active: boolean
  created_at: string
}

/** SAC do Amor — recados que a Auany deixa pro Marcus ver */
export interface SacMessage {
  id: string
  author: string
  kind: 'recado' | 'vontade' | 'comida' | 'plano'
  text: string
  media_url: string | null
  media_type: 'image' | 'video' | null
  created_at: string
}
