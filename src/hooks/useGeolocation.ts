import { useEffect, useState } from 'react'

export interface Coords {
  lat: number
  lon: number
  city: string
  granted: boolean
}

const DEFAULT_COORDS: Coords = {
  lat: -23.5505,
  lon: -46.6333,
  city: 'São Paulo, Brasil',
  granted: false,
}

/**
 * Geolocalização para a experiência da estrela.
 * Se negada ou indisponível, usa São Paulo como padrão.
 */
export function useGeolocation(defaults: Coords = DEFAULT_COORDS) {
  const [coords, setCoords] = useState<Coords>(defaults)
  const [requested, setRequested] = useState(false)

  const ask = () => {
    if (requested) return
    setRequested(true)
    if (typeof navigator === 'undefined' || !navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          city: `sua localização · ${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}`,
          granted: true,
        })
      },
      () => {
        /* negada — mantém São Paulo */
      },
      { timeout: 8000, maximumAge: 600000 }
    )
  }

  useEffect(() => {
    return () => {}
  }, [])

  return { coords, ask, requested }
}
