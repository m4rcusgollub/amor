/**
 * Estrelas da constelação de Carina (dados aproximados de brilho/posição),
 * para o mapa celeste desenhado em SVG.
 * Coordenadas em RA/Dec (graus) das estrelas principais.
 */
export interface SkyStar {
  ra: number
  dec: number
  mag: number
  name?: string
}

/** Linhas do "asterismo" da Carina (pares de índices em CARINA_STARS). */
export const CARINA_LINES: [number, number][] = [
  [0, 2], [2, 4], [4, 3], [3, 5], [5, 6], [4, 5],
]

/**
 * Carina — estrelas principais aproximadas.
 * mag 2 = Canopus (alpha Car), a segunda estrela mais brilhante do céu.
 */
export const CARINA_STARS: SkyStar[] = [
  { ra: 95.98, dec: -52.7, mag: -0.74, name: 'Canopus' },
  { ra: 148.0, dec: -59.51, mag: 1.86, name: 'Miaplacidus' },
  { ra: 160.74, dec: -55.99, mag: 2.26 },
  { ra: 161.68, dec: -64.39, mag: 2.55 },
  { ra: 125.63, dec: -59.51, mag: 1.68 },
  { ra: 138.3, dec: -62.5, mag: 2.47 },
  { ra: 141.9, dec: -70.04, mag: 2.29 },
]
