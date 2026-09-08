/**
 * GradientBackground — "Orchid Petal Sky"
 * receita do 21st.dev Gradient Builder, portada para CSS vivo.
 * zero dependências: um <div> que preenche o pai.
 */
export function GradientBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        height: '100%',
        containerType: 'size',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: '-0.8cqmin',
          filter: 'blur(0.4cqmin)',
          backgroundColor: '#F2C0D8',
          backgroundImage:
            "url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.180'/></svg>\"), radial-gradient(150% 50% at 40.46% 6%, rgba(14, 16, 48, 0.92) 0%, rgba(14, 16, 48, 0) 55%), radial-gradient(150% 50% at 41.41% 33%, rgba(60, 42, 115, 0.92) 0%, rgba(60, 42, 115, 0) 55%), radial-gradient(150% 50% at 51.35% 67%, rgba(177, 95, 168, 0.92) 0%, rgba(177, 95, 168, 0) 55%), radial-gradient(150% 50% at 54.16% 94%, rgba(242, 192, 216, 0.92) 0%, rgba(242, 192, 216, 0) 55%)",
          backgroundSize: '120px 120px, auto, auto, auto, auto',
          backgroundBlendMode: 'overlay, normal, normal, normal, normal',
        }}
      />
      <svg
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0.18,
          mixBlendMode: 'overlay',
        }}
      >
        <filter id="grain-orchid">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain-orchid)" />
      </svg>
    </div>
  )
}
