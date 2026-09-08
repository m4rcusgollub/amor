import { motion } from 'framer-motion'
import { ChapterHead } from '../components/ui'

const MAP_EMBED =
  'https://www.google.com/maps/d/u/0/embed?mid=1SIgNRQ7oDRpD-smlZ5qfda_L5gEu5wM&ehbc=2E312F'

export default function NossoMapa() {
  return (
    <main className="page">
      <div className="page-inner">
        <ChapterHead
          kicker="capítulo oito"
          title="Nosso Mapa"
          note="cada pino é um lugar que virou nosso"
        />
        <div className="h-line" aria-hidden="true" />

        <motion.div
          className="map-frame"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <iframe
            src={MAP_EMBED}
            title="nosso mapa — os lugares que a gente marcou"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        </motion.div>

        <p className="marginalia center" style={{ marginTop: 16 }}>
          toca nos pinos pra ver onde a gente já foi —
          <br />
          e onde ainda falta ir.
        </p>
      </div>
    </main>
  )
}
