/**
 * Cálculos astronômicos — posição da estrela dedicada.
 * Fórmulas aproximadas, suficientes para uma estimativa coerente
 * de onde ela está no céu.
 */

export const COMPASS_16 = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'] as const

export function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

export function toDeg(rad: number): number {
  return (rad * 180) / Math.PI
}

/** Data Juliana a partir de um Date. */
export function julianDate(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5
}

/** Tempo sideral de Greenwich (GMST) em graus. */
export function gmstDegrees(date: Date): number {
  const jd = julianDate(date)
  const T = (jd - 2451545.0) / 36525
  let gmst =
    280.46061837 +
    360.98564736629 * (jd - 2451545.0) +
    0.000387933 * T * T -
    (T * T * T) / 38710000
  gmst = gmst % 360
  if (gmst < 0) gmst += 360
  return gmst
}

export interface AltAz {
  altitude: number
  azimuth: number
}

/** Altitude e azimute aproximados de um objeto celeste (RA/Dec em graus). */
export function computeAltAz(raDeg: number, decDeg: number, lat: number, lon: number, date: Date): AltAz {
  const gmst = gmstDegrees(date)
  const lst = (((gmst + lon) % 360) + 360) % 360
  let H = lst - raDeg
  H = (((H + 180) % 360) + 360) % 360 - 180

  const latRad = toRad(lat)
  const decRad = toRad(decDeg)
  const hRad = toRad(H)

  const sinAlt =
    Math.sin(decRad) * Math.sin(latRad) +
    Math.cos(decRad) * Math.cos(latRad) * Math.cos(hRad)
  const alt = Math.asin(Math.max(-1, Math.min(1, sinAlt)))

  let cosAz =
    (Math.sin(decRad) - Math.sin(alt) * Math.sin(latRad)) /
    (Math.cos(alt) * Math.cos(latRad))
  cosAz = Math.max(-1, Math.min(1, cosAz))
  let az = toDeg(Math.acos(cosAz))
  if (Math.sin(hRad) > 0) az = 360 - az

  return { altitude: toDeg(alt), azimuth: az }
}

/** Sigla da rosa dos ventos (16 direções) para um azimute em graus. */
export function compassDirection(az: number): string {
  return COMPASS_16[Math.round(az / 22.5) % 16]
}

export interface SkyPosition {
  altitude: number
  azimuth: number
  visible: boolean
  compass: string
  timeLabel: string
  city: string
}

export function skyPositionNow(
  raDeg: number,
  decDeg: number,
  lat: number,
  lon: number,
  city: string,
  now: Date = new Date()
): SkyPosition {
  const { altitude, azimuth } = computeAltAz(raDeg, decDeg, lat, lon, now)
  return {
    altitude,
    azimuth,
    visible: altitude > 0,
    compass: compassDirection(azimuth),
    timeLabel: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    city,
  }
}
