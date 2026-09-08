import type { StarData } from '../types'

/**
 * A estrela dedicada à Auany.
 * Dados originais do projeto "16 Dias Até Nosso Abraço".
 */
export const STAR: StarData = {
  name: 'Auany — Luz do Meu Céu',
  constellation: 'Carina',
  ra_text: '08h37m12.694s',
  dec_text: "-61°28'13.04\"",
  ra_deg: 129.3028917,
  dec_deg: -61.4702889,
  magnitude: '11.21',
  default_city: 'São Paulo, Brasil',
  default_lat: -23.5505,
  default_lon: -46.6333,
  dedication_text:
    'princesa, hoje eu decidi escolher uma estrela pra você:\n\nela não é famosa nem óbvia, e eu decidi escolher exatamente essa por ser única e exclusiva no céu, e agora no meu coração ela tem seu nome.',
  secret_text:
    'Ela tem magnitude 11.21, então não é uma estrela que aparece fácil a olho nu.\n\nMas eu gostei disso.\n\nPorque ela parece um segredo guardado no céu.\n\nE agora esse segredo tem seu nome.',
  certificate_url: 'https://16diaspratever.netlify.app/assets/certificado.jpg',
}

/** Capa e link originais da playlist do projeto. */
export const MUSIC = {
  cover: 'https://16diaspratever.netlify.app/assets/capa.jpg',
  cd: 'https://16diaspratever.netlify.app/assets/cd.jpg',
  spotify: 'https://open.spotify.com/playlist/34fGwb4dlTUhtQBUN7C93p?si=Hv3N_1juTdSeZ_yCkU_sOw',
  spotifyEmbed:
    'https://open.spotify.com/embed/playlist/34fGwb4dlTUhtQBUN7C93p?utm_source=generator&theme=0',
  note:
    'a playlist que eu fiz pra nossa contagem —\nmúsicas que a gente conversou, que viraram nossas.\ntoca aqui mesmo, sem sair da nossa casa.',
}
