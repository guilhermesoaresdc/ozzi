-- Cadastro de cliente (CRM) independente da conta de acesso.
-- Um cliente pode existir sem login (pedido pelo WhatsApp, balcão) e é
-- vinculado a um profile quando a pessoa cria conta no site.
create table if not exists public.customers (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid unique references public.profiles(id) on delete set null,
  nome         text not null,
  email        text,
  telefone     text,
  cpf          text,
  cidade       text,
  uf           text,
  clube_ozzi   boolean not null default false,
  opt_in_email boolean not null default true,
  criado_em    timestamptz not null default now()
);

create unique index if not exists customers_email_unique
  on public.customers (lower(email)) where email is not null;

alter table public.orders    drop constraint if exists orders_customer_id_fkey;
alter table public.addresses drop constraint if exists addresses_customer_id_fkey;

alter table public.orders
  add constraint orders_customer_id_fkey
  foreign key (customer_id) references public.customers(id) on delete set null;

alter table public.addresses
  add constraint addresses_customer_id_fkey
  foreign key (customer_id) references public.customers(id) on delete cascade;

create or replace function public.my_customer_id()
returns uuid language sql stable security definer set search_path = public, pg_temp as $$
  select c.id from public.customers c where c.profile_id = auth.uid() limit 1;
$$;

alter table public.customers enable row level security;

drop policy if exists customers_own on public.customers;
create policy customers_own on public.customers
  for select to authenticated using (profile_id = (select auth.uid()) or public.is_admin());

drop policy if exists orders_select_own on public.orders;
create policy orders_select_own on public.orders
  for select to authenticated
  using (customer_id = public.my_customer_id() or public.is_admin());

drop policy if exists order_items_select_own on public.order_items;
create policy order_items_select_own on public.order_items
  for select to authenticated using (
    exists (select 1 from public.orders o
            where o.id = order_id and (o.customer_id = public.my_customer_id() or public.is_admin()))
  );

drop policy if exists order_events_select_own on public.order_events;
create policy order_events_select_own on public.order_events
  for select to authenticated using (
    exists (select 1 from public.orders o
            where o.id = order_id and (o.customer_id = public.my_customer_id() or public.is_admin()))
  );

drop policy if exists addresses_own on public.addresses;
create policy addresses_own on public.addresses
  for all to authenticated
  using (customer_id = public.my_customer_id() or public.is_admin())
  with check (customer_id = public.my_customer_id() or public.is_admin());
