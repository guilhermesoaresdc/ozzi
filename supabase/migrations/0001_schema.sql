-- ============================================================
-- Ozzi — esquema base (handoff §10)
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- Tipos ----------
do $$ begin
  create type public.product_status as enum ('ativo','oculto','rascunho');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.order_status as enum
    ('aguardando_pagamento','pago','em_separacao','pronto','postado','entregue','sob_encomenda','cancelado');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.delivery_method as enum ('retirada','motoboy','pac','sedex');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_method as enum ('pix','cartao','whatsapp','na_retirada');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.size_code as enum ('P','M','G','GG');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.banner_type as enum ('home_hero','categoria','faixa_colecao');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.campaign_status as enum ('rascunho','agendada','enviada','ativa');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.automation_type as enum
    ('carrinho_abandonado','boas_vindas','volta_estoque','aniversario','pos_compra');
exception when duplicate_object then null; end $$;

-- ---------- Perfis / papéis ----------
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  nome         text not null default '',
  email        text,
  cpf          text,
  telefone     text,
  cidade       text,
  uf           text,
  clube_ozzi   boolean not null default false,
  opt_in_email boolean not null default true,
  role         text not null default 'customer' check (role in ('customer','admin')),
  criado_em    timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- Cria o perfil automaticamente a cada novo usuário do Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, nome, email, telefone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', split_part(coalesce(new.email,''), '@', 1)),
    new.email,
    new.raw_user_meta_data->>'telefone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Catálogo ----------
create table if not exists public.categories (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null,
  slug          text not null unique,
  imagem_banner text,
  ordem         integer not null default 0,
  ativo         boolean not null default true,
  no_menu       boolean not null default false,
  criado_em     timestamptz not null default now()
);

create table if not exists public.products (
  id                    uuid primary key default gen_random_uuid(),
  nome                  text not null,
  slug                  text not null unique,
  ref                   text not null unique,
  category_id           uuid references public.categories(id) on delete set null,
  tecido                text,
  descricao             text,
  medidas               text,
  preco                 numeric(10,2) not null check (preco >= 0),
  preco_comparativo     numeric(10,2) check (preco_comparativo >= 0),
  peso                  numeric(6,3),
  fornecedor            text,
  status                public.product_status not null default 'rascunho',
  aceita_encomenda      boolean not null default true,
  prazo_encomenda_dias  integer not null default 10 check (prazo_encomenda_dias in (7,10,15)),
  selo                  text,
  fotos                 jsonb not null default '[]'::jsonb,
  destaque              boolean not null default false,
  criado_em             timestamptz not null default now()
);

create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_status_idx on public.products(status);
create index if not exists products_busca_idx on public.products
  using gin (to_tsvector('portuguese', nome || ' ' || coalesce(descricao,'') || ' ' || coalesce(tecido,'')));

create table if not exists public.variants (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  cor_nome   text not null,
  cor_hex    text not null default '#D9CDBA',
  tamanho    public.size_code not null,
  estoque    integer not null default 0 check (estoque >= 0),
  ordem      integer not null default 0,
  unique (product_id, cor_nome, tamanho)
);

create index if not exists variants_product_idx on public.variants(product_id);

-- ---------- Clientes ----------
create table if not exists public.addresses (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  cep         text not null,
  rua         text not null,
  numero      text,
  complemento text,
  bairro      text,
  cidade      text not null,
  uf          text not null,
  padrao      boolean not null default false,
  criado_em   timestamptz not null default now()
);

create index if not exists addresses_customer_idx on public.addresses(customer_id);

-- ---------- Pedidos ----------
create sequence if not exists public.order_code_seq start with 2842;

create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  codigo           text not null unique,
  customer_id      uuid references public.profiles(id) on delete set null,
  cliente_nome     text not null,
  cliente_email    text,
  cliente_telefone text,
  cliente_cpf      text,
  cliente_cidade   text,
  cliente_uf       text,
  endereco         jsonb,
  status           public.order_status not null default 'aguardando_pagamento',
  metodo_entrega   public.delivery_method not null default 'retirada',
  metodo_pagamento public.payment_method not null default 'pix',
  subtotal         numeric(10,2) not null default 0,
  frete            numeric(10,2) not null default 0,
  desconto         numeric(10,2) not null default 0,
  total            numeric(10,2) not null default 0,
  cupom            text,
  observacao       text,
  criado_em        timestamptz not null default now()
);

create index if not exists orders_customer_idx on public.orders(customer_id);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_criado_idx on public.orders(criado_em desc);

create table if not exists public.order_items (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid not null references public.orders(id) on delete cascade,
  variant_id     uuid references public.variants(id) on delete set null,
  product_id     uuid references public.products(id) on delete set null,
  nome           text not null,
  variante       text not null default '',
  ref            text,
  quantidade     integer not null default 1 check (quantidade > 0),
  preco_unitario numeric(10,2) not null,
  foto           text
);

create index if not exists order_items_order_idx on public.order_items(order_id);

create table if not exists public.order_events (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  titulo        text not null,
  autor         text,
  previsto      boolean not null default false,
  rotulo_tempo  text,
  criado_em     timestamptz not null default now()
);

create index if not exists order_events_order_idx on public.order_events(order_id, criado_em);

-- Gera o código sequencial OZ-XXXX
create or replace function public.set_order_code()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.codigo is null or new.codigo = '' then
    new.codigo := 'OZ-' || nextval('public.order_code_seq')::text;
  end if;
  return new;
end;
$$;

drop trigger if exists orders_set_code on public.orders;
create trigger orders_set_code
  before insert on public.orders
  for each row execute function public.set_order_code();

-- ---------- Conteúdo e configuração ----------
create table if not exists public.notices (
  id        uuid primary key default gen_random_uuid(),
  texto     text not null,
  periodo   text not null default 'sempre',
  ativo     boolean not null default true,
  ordem     integer not null default 0,
  criado_em timestamptz not null default now()
);

create table if not exists public.banners (
  id          uuid primary key default gen_random_uuid(),
  tipo        public.banner_type not null,
  slug        text,
  imagem      text,
  chapeu      text,
  titulo      text,
  texto       text,
  texto_botao text,
  link_botao  text,
  inicio      date,
  fim         date,
  ativo       boolean not null default true,
  ordem       integer not null default 0,
  criado_em   timestamptz not null default now()
);

create table if not exists public.coupons (
  codigo    text primary key,
  tipo      text not null default 'percentual' check (tipo in ('percentual','valor')),
  valor     numeric(10,2) not null,
  regra     text not null default 'geral',
  descricao text,
  validade  date,
  usos      integer not null default 0,
  ativo     boolean not null default true,
  criado_em timestamptz not null default now()
);

create table if not exists public.shipping_methods (
  chave   public.delivery_method primary key,
  nome    text not null,
  detalhe text not null default '',
  preco   numeric(10,2) not null default 0,
  ativo   boolean not null default true,
  ordem   integer not null default 0
);

create table if not exists public.payment_options (
  chave    public.payment_method primary key,
  nome     text not null,
  destaque text not null default '',
  detalhe  text not null default '',
  ativo    boolean not null default true,
  ordem    integer not null default 0
);

create table if not exists public.store_settings (
  id              boolean primary key default true check (id),
  nome_loja       text not null default 'Ozzi Moda Feminina',
  localizacao     text not null default 'Centro, Várzea Alegre - CE',
  whatsapp        text not null default '(88) 99999-0000',
  instagram       text not null default '@ozzimodafeminina',
  cnpj            text not null default '00.000.000/0001-00',
  email           text not null default 'contato@ozzi.com.br',
  promo_bar_ativa boolean not null default true,
  frete_gratis_acima numeric(10,2) not null default 249,
  desconto_pix    numeric(5,4) not null default 0.05,
  parcelas_max    integer not null default 6
);

-- ---------- E-mail marketing ----------
create table if not exists public.email_lists (
  id        uuid primary key default gen_random_uuid(),
  nome      text not null,
  regra     text not null default '',
  contagem  integer not null default 0,
  ordem     integer not null default 0
);

create table if not exists public.email_campaigns (
  id             uuid primary key default gen_random_uuid(),
  assunto        text not null,
  pre_header     text,
  lista_id       uuid references public.email_lists(id) on delete set null,
  agendado_para  timestamptz,
  envio_rotulo   text,
  status         public.campaign_status not null default 'rascunho',
  aberturas      numeric(5,2),
  cliques        numeric(5,2),
  receita        numeric(10,2),
  criado_em      timestamptz not null default now()
);

create table if not exists public.email_automations (
  id        uuid primary key default gen_random_uuid(),
  tipo      public.automation_type not null unique,
  nome      text not null,
  descricao text not null default '',
  metrica   text not null default '',
  ativo     boolean not null default false,
  config    jsonb not null default '{}'::jsonb
);

create table if not exists public.stock_alerts (
  id             uuid primary key default gen_random_uuid(),
  variant_id     uuid references public.variants(id) on delete cascade,
  product_id     uuid references public.products(id) on delete cascade,
  customer_email text not null,
  criado_em      timestamptz not null default now(),
  notificado_em  timestamptz
);

create index if not exists stock_alerts_variant_idx on public.stock_alerts(variant_id);
