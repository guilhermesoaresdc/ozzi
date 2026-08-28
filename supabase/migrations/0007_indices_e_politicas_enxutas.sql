-- Índices que faltavam nas chaves estrangeiras
create index if not exists email_campaigns_lista_idx on public.email_campaigns(lista_id);
create index if not exists order_items_product_idx   on public.order_items(product_id);
create index if not exists order_items_variant_idx   on public.order_items(variant_id);
create index if not exists stock_alerts_product_idx  on public.stock_alerts(product_id);

-- As políticas de admin eram FOR ALL e se sobrepunham à leitura pública no SELECT,
-- fazendo o Postgres avaliar duas políticas por linha lida. Como toda política de
-- leitura já contempla o admin, basta o admin ter INSERT/UPDATE/DELETE.
do $$
declare t text;
begin
  foreach t in array array[
    'categories', 'products', 'variants', 'notices', 'banners',
    'shipping_methods', 'payment_options', 'store_settings'
  ] loop
    execute format('drop policy if exists %I on public.%I', t || '_admin_write', t);
    execute format('drop policy if exists %I on public.%I', 'payment_admin_write', t);
    execute format('drop policy if exists %I on public.%I', 'settings_admin_write', t);
    execute format('drop policy if exists %I on public.%I', 'shipping_admin_write', t);

    execute format('create policy %I on public.%I for insert to authenticated with check (public.is_admin())',
      t || '_admin_insert', t);
    execute format('create policy %I on public.%I for update to authenticated using (public.is_admin()) with check (public.is_admin())',
      t || '_admin_update', t);
    execute format('create policy %I on public.%I for delete to authenticated using (public.is_admin())',
      t || '_admin_delete', t);
  end loop;
end $$;

drop policy if exists orders_admin_write on public.orders;
create policy orders_admin_insert on public.orders
  for insert to authenticated with check (public.is_admin());
create policy orders_admin_update on public.orders
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy orders_admin_delete on public.orders
  for delete to authenticated using (public.is_admin());

drop policy if exists order_items_admin_write on public.order_items;
create policy order_items_admin_insert on public.order_items
  for insert to authenticated with check (public.is_admin());
create policy order_items_admin_update on public.order_items
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy order_items_admin_delete on public.order_items
  for delete to authenticated using (public.is_admin());

drop policy if exists order_events_admin_write on public.order_events;
create policy order_events_admin_insert on public.order_events
  for insert to authenticated with check (public.is_admin());
create policy order_events_admin_update on public.order_events
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy order_events_admin_delete on public.order_events
  for delete to authenticated using (public.is_admin());

-- Perfis e clientes: fundem o acesso do admin nas políticas que já existem
drop policy if exists profiles_admin_all on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid()) or public.is_admin())
  with check (id = (select auth.uid()) or public.is_admin());
create policy profiles_admin_insert on public.profiles
  for insert to authenticated with check (public.is_admin());
create policy profiles_admin_delete on public.profiles
  for delete to authenticated using (public.is_admin());

drop policy if exists customers_admin_all on public.customers;
drop policy if exists customers_update_own on public.customers;
create policy customers_update_own on public.customers
  for update to authenticated
  using (profile_id = (select auth.uid()) or public.is_admin())
  with check (profile_id = (select auth.uid()) or public.is_admin());
create policy customers_admin_insert on public.customers
  for insert to authenticated with check (public.is_admin());
create policy customers_admin_delete on public.customers
  for delete to authenticated using (public.is_admin());

-- Avise-me: o insert já é aberto a todos; o admin fica com leitura e manutenção
drop policy if exists stock_alerts_admin_write on public.stock_alerts;
create policy stock_alerts_admin_update on public.stock_alerts
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy stock_alerts_admin_delete on public.stock_alerts
  for delete to authenticated using (public.is_admin());
