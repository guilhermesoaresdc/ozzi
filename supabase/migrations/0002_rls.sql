-- ============================================================
-- Ozzi — Row Level Security
-- Leitura pública apenas do que a vitrine precisa.
-- Escrita administrativa passa pelo service role (server actions),
-- com políticas de admin como defesa em profundidade.
-- ============================================================

alter table public.profiles          enable row level security;
alter table public.categories        enable row level security;
alter table public.products          enable row level security;
alter table public.variants          enable row level security;
alter table public.addresses         enable row level security;
alter table public.orders            enable row level security;
alter table public.order_items       enable row level security;
alter table public.order_events      enable row level security;
alter table public.notices           enable row level security;
alter table public.banners           enable row level security;
alter table public.coupons           enable row level security;
alter table public.shipping_methods  enable row level security;
alter table public.payment_options   enable row level security;
alter table public.store_settings    enable row level security;
alter table public.email_lists       enable row level security;
alter table public.email_campaigns   enable row level security;
alter table public.email_automations enable row level security;
alter table public.stock_alerts      enable row level security;

-- ---------- Perfis ----------
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated using (id = (select auth.uid()) or public.is_admin());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- Catálogo: leitura pública ----------
drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories
  for select to anon, authenticated using (ativo or public.is_admin());

drop policy if exists categories_admin_write on public.categories;
create policy categories_admin_write on public.categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products
  for select to anon, authenticated using (status <> 'rascunho' or public.is_admin());

drop policy if exists products_admin_write on public.products;
create policy products_admin_write on public.products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists variants_public_read on public.variants;
create policy variants_public_read on public.variants
  for select to anon, authenticated using (
    exists (select 1 from public.products p where p.id = product_id and p.status <> 'rascunho')
    or public.is_admin()
  );

drop policy if exists variants_admin_write on public.variants;
create policy variants_admin_write on public.variants
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- Conteúdo público ----------
drop policy if exists notices_public_read on public.notices;
create policy notices_public_read on public.notices
  for select to anon, authenticated using (ativo or public.is_admin());

drop policy if exists notices_admin_write on public.notices;
create policy notices_admin_write on public.notices
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists banners_public_read on public.banners;
create policy banners_public_read on public.banners
  for select to anon, authenticated using (ativo or public.is_admin());

drop policy if exists banners_admin_write on public.banners;
create policy banners_admin_write on public.banners
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists shipping_public_read on public.shipping_methods;
create policy shipping_public_read on public.shipping_methods
  for select to anon, authenticated using (true);

drop policy if exists shipping_admin_write on public.shipping_methods;
create policy shipping_admin_write on public.shipping_methods
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists payment_public_read on public.payment_options;
create policy payment_public_read on public.payment_options
  for select to anon, authenticated using (true);

drop policy if exists payment_admin_write on public.payment_options;
create policy payment_admin_write on public.payment_options
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists settings_public_read on public.store_settings;
create policy settings_public_read on public.store_settings
  for select to anon, authenticated using (true);

drop policy if exists settings_admin_write on public.store_settings;
create policy settings_admin_write on public.store_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Cupons: só o admin lê a lista. A validação na loja é feita no servidor.
drop policy if exists coupons_admin_all on public.coupons;
create policy coupons_admin_all on public.coupons
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- Endereços ----------
drop policy if exists addresses_own on public.addresses;
create policy addresses_own on public.addresses
  for all to authenticated
  using (customer_id = (select auth.uid()) or public.is_admin())
  with check (customer_id = (select auth.uid()) or public.is_admin());

-- ---------- Pedidos ----------
drop policy if exists orders_select_own on public.orders;
create policy orders_select_own on public.orders
  for select to authenticated using (customer_id = (select auth.uid()) or public.is_admin());

drop policy if exists orders_admin_write on public.orders;
create policy orders_admin_write on public.orders
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists order_items_select_own on public.order_items;
create policy order_items_select_own on public.order_items
  for select to authenticated using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.customer_id = (select auth.uid()) or public.is_admin())
    )
  );

drop policy if exists order_items_admin_write on public.order_items;
create policy order_items_admin_write on public.order_items
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists order_events_select_own on public.order_events;
create policy order_events_select_own on public.order_events
  for select to authenticated using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.customer_id = (select auth.uid()) or public.is_admin())
    )
  );

drop policy if exists order_events_admin_write on public.order_events;
create policy order_events_admin_write on public.order_events
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- E-mail marketing: somente admin ----------
drop policy if exists email_lists_admin on public.email_lists;
create policy email_lists_admin on public.email_lists
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists email_campaigns_admin on public.email_campaigns;
create policy email_campaigns_admin on public.email_campaigns
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists email_automations_admin on public.email_automations;
create policy email_automations_admin on public.email_automations
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- Avise-me ----------
drop policy if exists stock_alerts_insert_any on public.stock_alerts;
create policy stock_alerts_insert_any on public.stock_alerts
  for insert to anon, authenticated with check (true);

drop policy if exists stock_alerts_admin_read on public.stock_alerts;
create policy stock_alerts_admin_read on public.stock_alerts
  for select to authenticated using (public.is_admin());

drop policy if exists stock_alerts_admin_write on public.stock_alerts;
create policy stock_alerts_admin_write on public.stock_alerts
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
