import { useRef, useState } from 'react'

/** Imagem com lazy loading + fade-in suave. */
export function Img({
  src,
  alt,
  ...rest
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [loaded, setLoaded] = useState(false)
  const ref = useRef<HTMLImageElement | null>(null)
  return (
    <img
      ref={(n) => {
        ref.current = n
        if (n && n.complete && n.naturalWidth > 0) setLoaded(true)
      }}
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onLoad={() => setLoaded(true)}
      className={`lazy-img ${loaded ? 'loaded' : ''}`}
      {...rest}
    />
  )
}
