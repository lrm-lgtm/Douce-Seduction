
-- Douce Seduction: catálogo seguro, isolado de outros projetos.
-- Execute SOMENTE em um projeto Supabase exclusivo da Douce Seduction.
-- Não cria credenciais ou administradores automaticamente.
begin;

create table if not exists public.douce_catalog_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.douce_catalog_admins enable row level security;
revoke all on public.douce_catalog_admins from public, anon, authenticated;
grant select on public.douce_catalog_admins to authenticated;
create policy "douce_admin_self_read"
on public.douce_catalog_admins for select to authenticated
using (user_id = (select auth.uid()));

create table if not exists public.douce_products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 120),
  description text not null default '' check (char_length(description) <= 2500),
  category text not null check (char_length(btrim(category)) between 2 and 70),
  price numeric(10,2) not null check (price > 0 and price <= 100000),
  stock integer not null default 0 check (stock between 0 and 1000000),
  active boolean not null default false,
  image_path text check (image_path is null or image_path ~ '^products/[a-z0-9-]+\.(jpg|jpeg|png|webp)$'),
  image_url text check (image_url is null or image_url ~ '^https://[^[:space:]]+$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists douce_products_active_category on public.douce_products (active, category);
alter table public.douce_products enable row level security;
revoke all on public.douce_products from public, anon, authenticated;
grant select on public.douce_products to anon, authenticated;
grant insert, update, delete on public.douce_products to authenticated;

create policy "douce_product_public_or_admin_read"
on public.douce_products for select to anon, authenticated using (
  active = true or exists (
    select 1 from public.douce_catalog_admins a where a.user_id = (select auth.uid())
  )
);
create policy "douce_product_admin_insert"
on public.douce_products for insert to authenticated
with check (exists (
  select 1 from public.douce_catalog_admins a where a.user_id = (select auth.uid())
));
create policy "douce_product_admin_update"
on public.douce_products for update to authenticated
using (exists (
  select 1 from public.douce_catalog_admins a where a.user_id = (select auth.uid())
))
with check (exists (
  select 1 from public.douce_catalog_admins a where a.user_id = (select auth.uid())
));
create policy "douce_product_admin_delete"
on public.douce_products for delete to authenticated
using (exists (
  select 1 from public.douce_catalog_admins a where a.user_id = (select auth.uid())
));

create or replace function public.douce_touch_product()
returns trigger language plpgsql security invoker set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end; $$;
revoke all on function public.douce_touch_product() from public;
drop trigger if exists douce_touch_product on public.douce_products;
create trigger douce_touch_product before update on public.douce_products
for each row execute function public.douce_touch_product();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('douce-catalog', 'douce-catalog', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy "douce_catalog_admin_upload"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'douce-catalog'
  and (storage.foldername(name))[1] = 'products'
  and exists (select 1 from public.douce_catalog_admins a where a.user_id = (select auth.uid()))
);
create policy "douce_catalog_admin_read_objects"
on storage.objects for select to authenticated
using (
  bucket_id = 'douce-catalog'
  and exists (select 1 from public.douce_catalog_admins a where a.user_id = (select auth.uid()))
);
create policy "douce_catalog_admin_delete_objects"
on storage.objects for delete to authenticated
using (
  bucket_id = 'douce-catalog'
  and exists (select 1 from public.douce_catalog_admins a where a.user_id = (select auth.uid()))
);

-- Produtos iniciais estão DESPUBLICADOS até a cliente validar nomes, imagens e preços.
insert into public.douce_products (name,category,price,stock,active,image_url)
values
 ('Melzinho do Amor','Comestíveis',30.00,5,false,'https://douceseduction.netlify.app/images/prod-1.svg'),
 ('Plug Anal M','Acessórios',35.00,2,false,'https://douceseduction.netlify.app/images/prod-2.webp'),
 ('Egg Masturbador Masculino','Masculino',15.00,8,false,'https://douceseduction.netlify.app/images/prod-3.webp'),
 ('Bolinha Yummy','Comestíveis',35.00,6,false,'https://douceseduction.netlify.app/images/prod-4.webp');

commit;

-- APÓS criar a conta da proprietária manualmente no Authentication -> Users,
-- copiar o UUID dessa usuária e executar:
-- insert into public.douce_catalog_admins(user_id) values ('UUID_DA_PROPRIETARIA');
--
-- NUNCA atribuir permissões com base em user_metadata, e-mail digitado
-- no navegador ou PIN no frontend.
