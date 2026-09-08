-- =========================================================
-- CORREÇÃO: cria os registros da tabela 'photos' a partir
-- dos arquivos que já estão no bucket 'photos' do storage.
-- Rode isto no SQL Editor do Supabase.
-- =========================================================

-- apaga registros vazios antigos, se existirem (que não apontam pra arquivo)
delete from public.photos
where coalesce(image_url, '') = '' or image_url is null;

-- insera um registro pra cada arquivo de imagem no bucket (na raiz e em subpastas)
insert into public.photos (title, image_url, thumbnail_url, position)
select
  -- título: nome do arquivo sem extensão e sem caminho
  regexp_replace(
    regexp_replace(o.name, '.*[/\\]', ''),   -- remove caminho
    '\.[^.]+$', ''                            -- remove extensão
  ),
  -- image_url: url pública do arquivo
  'https://omhkereddvjdmqivxlog.supabase.co/storage/v1/object/public/photos/' || o.name,
  -- thumbnail: usa a própria imagem por enquanto (troque depois se quiser)
  'https://omhkereddvjdmqivxlog.supabase.co/storage/v1/object/public/photos/' || o.name,
  -- posição: ordem alfabética do nome
  row_number() over (order by o.name)
from storage.objects o
where o.bucket_id = 'photos'
  and lower(o.name) ~ '\.(jpg|jpeg|png|webp|gif|avif)$'
  -- não duplica: só arquivos que ainda não têm registro
  and not exists (
    select 1
    from public.photos p
    where p.image_url = 'https://omhkereddvjdmqivxlog.supabase.co/storage/v1/object/public/photos/' || o.name
  );

-- confere o resultado
select count(*) as total_fotos from public.photos;
