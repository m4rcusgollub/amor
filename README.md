# nosso universo — marcus & auany

um pequeno lugar na internet que guarda um pouco de nós.

feito à mão, mobile first, com React + TypeScript + Vite + Supabase.

## como rodar

```bash
npm install
npm run dev
```

## configurar o supabase

1. crie um projeto no [supabase.com](https://supabase.com)
2. rode o arquivo `supabase.sql` no **SQL Editor** do painel
   (cria as tabelas, RLS, policies e o bucket `photos`)
3. crie seu usuário em **Authentication → Users** (só o marcos entra)
4. copie `.env.example` para `.env` e preencha:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

sem o `.env`, o site funciona com conteúdo de exemplo
(placeholders claros, sem inventar nada de verdade).

## onde cada coisa vive

- `src/pages/` — os capítulos: início, história, galeria, memórias,
  cartas, luz do meu céu, música, surpresas
- `src/components/Nav.tsx` — a gaveta-índice do álbum
- `src/components/MusicPlayer.tsx` — o vinho player de canto
- `src/components/SkyCanvas.tsx` — o céu desenhado da estrela
- `src/lib/astro.ts` — os cálculos de altitude/azimute da estrela
- `src/services/` — a fala com o supabase + dados da estrela
- `/admin` — o cantinho do marcos (login via supabase auth)

## manutenção

tudo se edita pelo `/admin`: fotos, história, memórias, cartas,
música, surpresas e os dados da estrela. o site público é só leitura.

para as fotos, suba as imagens no bucket `photos` do supabase
storage e use a url pública no admin (thumbnails ajudam o celular).
