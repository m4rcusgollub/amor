-- =========================================================
-- NOSSO UNIVERSO — MARCUS & AUANY
-- Script do Supabase: tabelas, RLS, policies e storage.
-- Rode no SQL Editor do painel do Supabase.
-- =========================================================

-- ---------------------------------------------------------
-- TABELAS
-- ---------------------------------------------------------

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  description text default '',
  image_url text,
  thumbnail_url text,
  date date,
  position int not null default 0,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.timeline_events (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  description text default '',
  date date,
  image_url text,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  content text default '',
  date date,
  image_url text,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.letters (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  content text default '',
  date date,
  image_url text,
  position int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.music (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  artist text default '',
  audio_url text,
  spotify_url text,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.star_experience (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Auany — Luz do Meu Céu',
  constellation text not null default 'Carina',
  ra_text text not null default '08h37m12.694s',
  dec_text text not null default '-61°28''13.04"',
  ra_deg double precision not null default 129.3028917,
  dec_deg double precision not null default -61.4702889,
  magnitude text not null default '11.21',
  default_city text not null default 'São Paulo, Brasil',
  default_lat double precision not null default -23.5505,
  default_lon double precision not null default -46.6333,
  dedication_text text not null default '',
  secret_text text not null default '',
  certificate_url text not null default 'https://16diaspratever.netlify.app/assets/certificado.jpg',
  created_at timestamptz not null default now()
);

create table if not exists public.surprises (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  description text default '',
  image_url text,
  position int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- SAC do amor — recados que a Auany deixa e o marcos lê
create table if not exists public.sac_messages (
  id uuid primary key default gen_random_uuid(),
  author text not null default 'auany',
  kind text not null default 'recado', -- recado | vontade | comida | plano
  text text default '',
  media_url text,
  media_type text, -- image | video
  created_at timestamptz not null default now()
);

-- linha inicial da estrela (id fixo, pra facilitar upsert do admin)
insert into public.star_experience (dedication_text, secret_text)
values (
  'princesa, hoje eu decidi escolher uma estrela pra você:

ela não é famosa nem óbvia, e eu decidi escolher exatamente essa por ser única e exclusiva no céu, e agora no meu coração ela tem seu nome.',
  'Ela tem magnitude 11.21, então não é uma estrela que aparece fácil a olho nu.

Mas eu gostei disso.

Porque ela parece um segredo guardado no céu.

E agora esse segredo tem seu nome.'
)
on conflict do nothing;

-- ---------------------------------------------------------
-- RLS — leitura pública, escrita só autenticada
-- ---------------------------------------------------------

alter table public.photos enable row level security;
alter table public.timeline_events enable row level security;
alter table public.memories enable row level security;
alter table public.letters enable row level security;
alter table public.music enable row level security;
alter table public.star_experience enable row level security;
alter table public.surprises enable row level security;
alter table public.sac_messages enable row level security;

-- leitura pública
create policy "leitura pública photos" on public.photos for select using (true);
create policy "leitura pública timeline" on public.timeline_events for select using (true);
create policy "leitura pública memories" on public.memories for select using (true);
create policy "leitura pública letters" on public.letters for select using (active = true);
create policy "leitura pública music" on public.music for select using (true);
create policy "leitura pública star" on public.star_experience for select using (true);
create policy "leitura pública surprises" on public.surprises for select using (active = true);
create policy "leitura pública sac" on public.sac_messages for select using (true);

-- SAC: qualquer pessoa (auany) pode escrever, só o marcos administra
create policy "escrita anônima sac" on public.sac_messages for insert to anon, authenticated with check (true);

-- escrita apenas para o usuário autenticado (marcos)
create policy "escrita auth photos" on public.photos for all to authenticated using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "escrita auth timeline" on public.timeline_events for all to authenticated using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "escrita auth memories" on public.memories for all to authenticated using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "escrita auth letters" on public.letters for all to authenticated using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "escrita auth music" on public.music for all to authenticated using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "escrita auth star" on public.star_experience for all to authenticated using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "escrita auth surprises" on public.surprises for all to authenticated using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "escrita auth sac" on public.sac_messages for update to authenticated using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "delete auth sac" on public.sac_messages for delete to authenticated using (auth.role() = 'authenticated');

-- ---------------------------------------------------------
-- STORAGE — fotos do casal
-- ---------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('sac', 'sac', true)
on conflict (id) do nothing;

create policy "leitura pública storage photos" on storage.objects for select using (bucket_id = 'photos');
create policy "escrita auth storage photos" on storage.objects for all to authenticated using (bucket_id = 'photos') with check (bucket_id = 'photos');

-- SAC: a Auany (anon) pode subir mídia; leitura pública
create policy "leitura pública storage sac" on storage.objects for select using (bucket_id = 'sac');
create policy "upload sac anon" on storage.objects for insert to anon, authenticated with check (bucket_id = 'sac');
