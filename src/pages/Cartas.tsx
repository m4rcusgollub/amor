import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChapterHead } from '../components/ui'

/**
 * Cartinhas — "pra quando eu não puder estar aí".
 * Os mesmos pedacinhos do cantinho original, agora morando aqui.
 */

interface Carta {
  key: string
  icon: string
  titulo: string
  microfrase: string
  texto: string
  imagem?: string
  video?: string
  especial?: 'surpresa' | 'naoSei'
}

const CARTAS: Carta[] = [
  {
    key: 'saudade',
    icon: '🕊',
    titulo: 'Quando sentir saudade',
    microfrase: 'abre quando a saudade apertar',
    texto:
      'amor, eu sei que as vezes a saudade bate e a gente não ta próximo pra poder se ver, mas saiba que mesmo com a gente longe, o amor que eu sinto é enorme, e que eu sempre lembro dos nossos momentos pra matar a saudade nossa. sempre que sentir saudades vê esse video nosso pra lembrar dos beijinhos e abraços.',
    video: 'https://teamoauany.netlify.app/20260618_142546.mp4',
  },
  {
    key: 'triste',
    icon: '🌧',
    titulo: 'Quando estiver triste',
    microfrase: 'abre quando o coração pesar',
    texto:
      'amor, eu sei que você abriu essa cartinha por estar triste, é horrível quando esse sentimento bate e o coração pesa. mas saiba que você pode contar comigo sempre que precisar, e quando quiser desabafar e conversar é só me chamar que sempre vou estar disponível pra você, pq quero sempre que eu seja um lugar seguro pra você poder confiar. te amo sempre. lembre desse momento feliz nosso pra confortar seu coração.',
    video: 'https://teamoauany.netlify.app/20260626_185508.mp4',
  },
  {
    key: 'insegura',
    icon: '🪞',
    titulo: 'Quando estiver insegura',
    microfrase: 'abre quando precisar lembrar do seu valor',
    texto:
      'amor, se você está se sentindo insegura, saiba de uma coisa: você é a pessoa mais especial e linda que eu conheço. as vezes você não consegue enxergar isso, e fica meio insegura, mas se você tivesse a oportunidade de ter meu olhar por algum tempo, teria a melhor visão que uma pessoa poderia ter: uma garota linda, amorosa, carinhosa, importante e única, que alegra cada vez mais meus dias. eu amo seu jeito, seu carinho, sua beleza, seu amor, tudo seu. sempre que tiver insegura, pode vir aqui pra ser lembrada de novo seu valor. eu te amo',
    imagem: 'https://teamoauany.netlify.app/20260623_142447.jpg',
  },
  {
    key: 'ansiosa',
    icon: '🌙',
    titulo: 'Quando estiver ansiosa',
    microfrase: 'abre quando a cabeça não parar quieta',
    texto:
      'minha princesinha, se você abriu essa cartinha, é porque esteja ansiosa. mas respire um pouco, não precisamos entender ou resolver tudo agora, ou carregar todos os pensamentos de uma vez. é ruim quando a cabeça acelera e fica tudo se juntando. mas se conseguir organizar uma coisa de cada vez, fica mais fácil de acalmar essa ansiedade. e não esqueça mais uma vez, se precisar, sempre estou aqui pra conversar e ouvir você, sempre mesmo amor. te amo',
    imagem: 'https://teamoauany.netlify.app/1000033430.jpg',
  },
  {
    key: 'carente',
    icon: '🎀',
    titulo: 'Quando estiver carente',
    microfrase: 'abre quando quiser um carinho meu',
    texto:
      'bb, se estiver se sentindo carente: lembre dos nossos momentos carinhosos, da gente em silêncio, abraçados, fazendo carinho, e sempre lembrando o quando eu te amo. sei que as vezes bate aquela vontade de receber carinho, só ficar abraçada e ficar grudada, e tudo bem. sempre que você precisar de grude, carinho, amor, sempre vai ter, pq sempre vou cuidar de você e fazê-la sentir amada. te amo',
    imagem: 'https://teamoauany.netlify.app/1000031853.jpg',
  },
  {
    key: 'abraco',
    icon: '🤍',
    titulo: 'Quando quiser um abraço',
    microfrase: 'abre quando quiser um abraço meu',
    texto:
      'se precisar de um abraço: imagine eu te abraçando bem apertado e forte, aqueles abraços demorados e carinhosos que eu sempre te dou. esse texto não substitui um abraço, mas tentei deixar o mais perto disso. e também lembre dessa foto pra lembrar dos nossos abraços. te amo muito amor.',
    imagem: 'https://teamoauany.netlify.app/1000026147.jpg',
  },
  {
    key: 'sorrir',
    icon: '🌸',
    titulo: 'Quando quiser sorrir',
    microfrase: 'abre quando quiser lembrar de rir',
    texto:
      'se você abriu isso precisando ou querendo sorrir, lembra das nossas gracinhas e palhaçadas: quando te irrito ou fico fazendo cócegas em você pra te fazer rir. e lembra também dos momentos que você faz suas gracinhas, principalmente quando lambe meu rosto, e você ri demais. eu posso até fingir que estou irritado ou bravo, mas ver aquele seu sorriso é um dos melhores presentes que ja ganhei em minha vida. te amo',
    video: 'https://teamoauany.netlify.app/20260623_142530.mp4',
  },
  {
    key: 'sozinha',
    icon: '🕯',
    titulo: 'Quando se sentir sozinha',
    microfrase: 'abre quando parecer que não tem ninguém',
    texto:
      'eu sei que as vezes mesmo rodeado de gente, mensagens e coisas, podemos sentir um vazio meio chato. mas lembre de uma coisa: eu me importo com você de verdade, a importância que você tem na minha vida é incalculável, sempre sinto sua falta quando estou longe, e sempre torço por você e acredito muito nos seus sonhos e vontades, seu lugar no meu coração é especial e somente pra você. te amo muito minha princesa',
    imagem: 'https://teamoauany.netlify.app/1000034106.jpg',
  },
  {
    key: 'medoDePerder',
    icon: '🔒',
    titulo: 'Quando tiver medo de me perder',
    microfrase: 'abre quando o medo aparecer',
    texto:
      'amor, eu sei que esse medo bate as vezes, mas quero te falar: eu estou sempre aqui, se estou com você não é por acaso, você não é minha princesinha linda que eu amo atoa, eu não faço isso por obrigação, e sim pq você é importante pra mim em um nível que não da pra medir, até seus detalhes são muito importantes pra mim, amo tudo em você, tudo que envolve auany, você é muito importante pra mim desde o dia que entrou na minha vida, e entrou pra mudar tá, pode ter certeza, te amo.',
    imagem: 'https://teamoauany.netlify.app/1000034290.jpg',
  },
  {
    key: 'surpresa',
    icon: '🎁',
    titulo: 'Carta surpresa',
    microfrase: 'abre sem saber o que vem',
    texto: '',
    especial: 'surpresa',
  },
  {
    key: 'naoSei',
    icon: '❔',
    titulo: 'Não sei o que estou sentindo',
    microfrase: 'abre e deixa eu cuidar de você mesmo assim',
    texto: '',
    especial: 'naoSei',
  },
]

const MENSAGENS_SURPRESA = [
  'você é muito muito linda, amo tudo em você, já até disse: é meu tipo todinho, branquinha, magrinha, alta, linda de rosto e de corpo e de jeito e personalidade também.',
  'meus melhores sorrisos são com você',
  'você mudou minha vida por completo',
  'seu amor me conforta e me faz sentir amado e único cada vez mais',
  'suas frases são muito engraçadas e uso muitas delas',
  'eu sou muito sortudo de te ter (mais que você rs)',
  'nossas saídas performáticas são as melhores que eu poderia ter',
  'pra mim, você era minha namorada desde o dia da paulista já',
  'desde o dia que a gente voltou a se falar, eu tinha uma sensação que hoje a gente estaria namorando',
  'agradeço a Deus todos os dias por poder te chamar de namorada',
]

const FRASE_ANTES_SURPRESA = 'deixa eu procurar um pedacinho meu pra você'
const FRASE_ANTES_NAOSEI = 'tudo bem não saber explicar. deixa eu cuidar de você mesmo assim.'
const MENSAGEM_ABRAÇO = 'abraço enviado. fecha os olhos. eu tô te abraçando daqui.'

/* -------- carta aberta (modal) -------- */
function CartaModal({ carta, onClose }: { carta: Carta; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <motion.div
      className="cartinha-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`cartinha: ${carta.titulo}`}
    >
      <motion.div
        className="cartinha-paper tex-noise"
        initial={{ scale: 0.88, y: 26, rotateX: 8, opacity: 0 }}
        animate={{ scale: 1, y: 0, rotateX: 0, opacity: 1 }}
        exit={{ scale: 0.94, y: 16, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 240, damping: 22 }}
      >
        <button type="button" className="letter-close-btn" onClick={onClose} aria-label="fechar cartinha">
          fechar
        </button>
        <span className="cartinha-icon">{carta.icon}</span>
        <h2 className="cartinha-titulo">{carta.titulo}</h2>
        <p className="cartinha-sub">{carta.microfrase}</p>
        {carta.video ? (
          <video className="cartinha-media" src={carta.video} controls playsInline preload="metadata" />
        ) : null}
        {carta.imagem ? (
          <img className="cartinha-media" src={carta.imagem} alt="nossa foto" loading="lazy" />
        ) : null}
        <p className="cartinha-texto">{carta.texto}</p>
        <button type="button" className="btn-ink" onClick={onClose}>
          guardar essa cartinha
        </button>
      </motion.div>
    </motion.div>
  )
}

/* -------- página -------- */
export default function Cartas() {
  const [abertas, setAbertas] = useState<Set<string>>(() => new Set())
  const [reading, setReading] = useState<Carta | null>(null)
  const [procurando, setProcurando] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const principais = useMemo(() => CARTAS.filter((c) => !c.especial), [])
  const totalAbertas = [...abertas].filter((k) => principais.some((p) => p.key === k)).length

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 4200)
  }

  const abrir = (carta: Carta) => {
    if (carta.especial === 'surpresa') {
      setProcurando(FRASE_ANTES_SURPRESA)
      setTimeout(() => {
        const msg = MENSAGENS_SURPRESA[Math.floor(Math.random() * MENSAGENS_SURPRESA.length)]
        setProcurando(null)
        setReading({ ...carta, texto: msg })
        marcar(carta.key)
      }, 1100)
      return
    }
    if (carta.especial === 'naoSei') {
      setProcurando(FRASE_ANTES_NAOSEI)
      setTimeout(() => {
        const candidatas = principais.filter((c) => !c.especial)
        const sorteada = candidatas[Math.floor(Math.random() * candidatas.length)]
        setProcurando(null)
        setReading(sorteada)
        marcar(sorteada.key)
      }, 1100)
      return
    }
    setReading(carta)
    marcar(carta.key)
  }

  const marcar = (key: string) => {
    setAbertas((prev) => {
      const next = new Set(prev)
      const antes = next.size
      next.add(key)
      const depois = [...next].filter((k) => principais.some((p) => p.key === k)).length
      // mensagens de progresso como no original
      if (antes < next.size) {
        if (depois === 3) setTimeout(() => showToast('eu sabia que você ia abrir mais de uma kkkkk. tudo bem, meu amor. esse cantinho é seu mesmo.'), 700)
        if (depois === 7) setTimeout(() => showToast('agora você encontrou vários pedacinhos que eu deixei aqui. mas sempre que voltar, eles continuam sendo meus jeitos de cuidar de você de longe.'), 700)
        if (depois === principais.length) setTimeout(() => showToast('você abriu todas as cartinhas principais. agora esse cantinho é oficialmente seu pra voltar sempre que quiser.'), 700)
      }
      return next
    })
  }

  return (
    <main className="page">
      <div className="page-inner">
        <ChapterHead
          kicker="capítulo quatro"
          title="Cartas"
          note="cartinhas pra quando eu não puder estar aí"
        />
        <div className="h-line" aria-hidden="true" />

        <p className="cartinhas-intro tex-noise">
          amor, fiz essas cartinhas pra você sempre lembrar o quanto é importante e única pra
          mim, sempre que precisar pode abrir, quantas vezes quiser.
        </p>

        <div className="cartinhas-counter" aria-live="polite">
          pedacinhos abertos: <strong>{totalAbertas}</strong>
        </div>

        <div className="cartinhas-grid">
          {CARTAS.map((c, i) => (
            <motion.button
              key={c.key}
              type="button"
              className={`cartinha-env ${abertas.has(c.key) ? 'aberta' : ''}`}
              onClick={() => abrir(c)}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.45, delay: (i % 6) * 0.05 }}
              aria-label={`abrir cartinha: ${c.titulo}`}
            >
              {abertas.has(c.key) ? <span className="cartinha-lida">lida</span> : null}
              <span className="cartinha-icon-sm">{c.icon}</span>
              <span className="cartinha-titulo-sm">{c.titulo}</span>
              <span className="cartinha-micro">{c.microfrase}</span>
            </motion.button>
          ))}
        </div>

        <div className="cartinhas-extras">
          <button
            type="button"
            className="btn-ink"
            onClick={() => {
              showToast(MENSAGEM_ABRAÇO)
            }}
          >
            receber um abraço daqui
          </button>
          <button
            type="button"
            className="btn-ink"
            onClick={() => {
              const msg = MENSAGENS_SURPRESA[Math.floor(Math.random() * MENSAGENS_SURPRESA.length)]
              setReading({
                key: 'agora',
                icon: '💗',
                titulo: 'Uma cartinha de agora',
                microfrase: 'escrita rapidinho, pensando em você',
                texto: msg,
              })
            }}
          >
            me manda uma cartinha de agora
          </button>
        </div>

        <div className="cartinha-final tex-noise">
          <p>
            agora que você abriu esse cantinho, ele é seu. pode voltar aqui quando quiser sentir
            um pouquinho de mim perto. eu deixei carinho escondido em cada carta. e mesmo que você
            leia todas hoje, elas continuam sendo suas pra todos os dias em que precisar.
            <br />
            <br />
            mesmo longe, eu continuo tentando estar perto.
          </p>
          <span className="cartinha-assinatura">com carinho, do seu lugar favorito pra voltar</span>
        </div>
      </div>

      <AnimatePresence>
        {procurando ? (
          <motion.div
            className="cartinha-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="cartinha-paper cartinha-carregando">
              {procurando}
              <span className="pontinhos">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            </div>
          </motion.div>
        ) : null}
        {reading ? <CartaModal carta={reading} onClose={() => setReading(null)} /> : null}
      </AnimatePresence>

      <AnimatePresence>
        {toast ? (
          <motion.div
            className="cartinha-toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            role="status"
          >
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  )
}
