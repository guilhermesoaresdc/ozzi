-- Bucket público para fotos de produto, banner e categoria.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('produtos', 'produtos', true, 5242880,
        array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set
  public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists produtos_leitura_publica on storage.objects;
create policy produtos_leitura_publica on storage.objects
  for select to anon, authenticated using (bucket_id = 'produtos');

drop policy if exists produtos_admin_escreve on storage.objects;
create policy produtos_admin_escreve on storage.objects
  for insert to authenticated with check (bucket_id = 'produtos' and public.is_admin());

drop policy if exists produtos_admin_atualiza on storage.objects;
create policy produtos_admin_atualiza on storage.objects
  for update to authenticated
  using (bucket_id = 'produtos' and public.is_admin())
  with check (bucket_id = 'produtos' and public.is_admin());

drop policy if exists produtos_admin_remove on storage.objects;
create policy produtos_admin_remove on storage.objects
  for delete to authenticated using (bucket_id = 'produtos' and public.is_admin());
