import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ChapterHead } from '../components/ui'
import { useTick } from '../hooks/useInterval'

/** o dia em que tudo começou */
const START = new Date(2026, 3, 18) // 18 de abril de 2026

interface DaysTogether {
  days: number
  hours: number
  minutes: number
  seconds: number
  totalHours: number
  months: number
  monthsDays: number
}

/** meses e dias corridos entre duas datas (calendário real) */
function monthsAndDays(start: Date, now: Date): { months: number; monthsDays: number } {
  let months =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth())
  // testa se o dia do mês já foi alcançado neste mês
  const anchor = new Date(start.getFullYear(), start.getMonth() + months, start.getDate())
  if (anchor.getTime() > now.getTime()) {
    months -= 1
  }
  // dias restantes desde o último "aniversário mensal"
  const anchor2 = new Date(start.getFullYear(), start.getMonth() + months, start.getDate())
  const monthsDays = Math.floor((now.getTime() - anchor2.getTime()) / 86400000)
  return { months: Math.max(0, months), monthsDays: Math.max(0, monthsDays) }
}

function elapsedSince(start: Date, now: Date): DaysTogether {
  const diff = Math.max(0, now.getTime() - start.getTime())
  const totalSeconds = Math.floor(diff / 1000)
  const md = monthsAndDays(start, now)
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    totalHours: Math.floor(totalSeconds / 3600),
    months: md.months,
    monthsDays: md.monthsDays,
  }
}

const pad = (n: number) => String(n).padStart(2, '0')

export default function Historia() {
  const { now } = useTick(1000)
  const [t, setT] = useState<DaysTogether>(() => elapsedSince(START, new Date()))

  useEffect(() => {
    setT(elapsedSince(START, now))
  }, [now])

  const sinceLabel = START.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <main className="page tex-noise">
      <div className="page-inner">
        <ChapterHead
          kicker="capítulo dois"
          title="Dias Juntos"
          note="contando desde 18 de abril de 2026"
        />
        <div className="h-line" aria-hidden="true" />

        <motion.section
          className="counter-card tex-noise"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          aria-label="contador de dias juntos"
        >
          <span className="tape tape--top" aria-hidden="true" />
          <p className="counter-label">estamos juntos há</p>

          <p className="counter-days" aria-live="off">
            <motion.span
              key={t.days}
              initial={{ opacity: 0.4, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="counter-number"
            >
              {t.days}
            </motion.span>
            <span className="counter-unit">
              {t.days === 1 ? 'dia' : 'dias'}
            </span>
          </p>

          <p className="counter-rest">
            {pad(t.hours)}h {pad(t.minutes)}min {pad(t.seconds)}s
          </p>

          <p className="counter-months">
            ou {t.months} {t.months === 1 ? 'mês' : 'meses'} e {t.monthsDays}{' '}
            {t.monthsDays === 1 ? 'dia' : 'dias'} de nós
          </p>

          <div className="counter-meta">
            <span className="counter-since">
              desde {sinceLabel}
            </span>
            <span className="counter-hours">
              {t.totalHours.toLocaleString('pt-BR')} horas de nós
            </span>
          </div>
        </motion.section>

        <p className="marginalia center" style={{ marginTop: 30 }}>
          e contando… cada dia um pouco mais.
        </p>
      </div>
    </main>
  )
}
