-- Criação de pedido no servidor.
-- Preços, frete, desconto e estoque são recalculados a partir do banco:
-- nada vindo do cliente entra na conta. Permite compra sem cadastro, e é por
-- isso que a aplicação não precisa de chave de service role.
create or replace function public.criar_pedido(
  p_itens            jsonb,
  p_nome             text,
  p_email            text default null,
  p_telefone         text default null,
  p_cpf              text default null,
  p_metodo_entrega   public.delivery_method default 'retirada',
  p_metodo_pagamento public.payment_method default 'pix',
  p_endereco         jsonb default null,
  p_observacao       text default null
)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_cfg           public.store_settings%rowtype;
  v_subtotal      numeric(10,2) := 0;
  v_frete         numeric(10,2) := 0;
  v_desconto      numeric(10,2) := 0;
  v_total         numeric(10,2) := 0;
  v_tem_encomenda boolean := false;
  v_status        public.order_status;
  v_customer_id   uuid;
  v_order_id      uuid;
  v_codigo        text;
  v_uid           uuid := auth.uid();
  v_email         text := nullif(trim(coalesce(p_email, '')), '');
  v_frete_base    numeric(10,2);
  v_frete_ativo   boolean;
  r               record;
begin
  if p_nome is null or trim(p_nome) = '' then
    raise exception 'Informe o nome de quem vai receber' using errcode = '22023';
  end if;

  if p_itens is null or jsonb_typeof(p_itens) <> 'array' or jsonb_array_length(p_itens) = 0 then
    raise exception 'A sacola está vazia' using errcode = '22023';
  end if;

  select * into v_cfg from public.store_settings where id = true;

  create temporary table _itens on commit drop as
  select
    v.id                                   as variant_id,
    pr.id                                  as product_id,
    pr.nome                                as nome,
    pr.ref                                 as ref,
    v.cor_nome || ' · ' || v.tamanho::text as variante,
    greatest(1, (i->>'quantidade')::int)   as quantidade,
    pr.preco                               as preco_unitario,
    v.estoque                              as estoque,
    pr.aceita_encomenda                    as aceita_encomenda,
    (pr.fotos->>0)                         as foto
  from jsonb_array_elements(p_itens) as i
  join public.variants v on v.id = (i->>'variant_id')::uuid
  join public.products pr on pr.id = v.product_id
  where pr.status <> 'rascunho';

  if (select count(*) from _itens) <> jsonb_array_length(p_itens) then
    raise exception 'Uma das peças não está mais disponível' using errcode = '22023';
  end if;

  for r in select * from _itens loop
    if r.estoque < r.quantidade then
      if not r.aceita_encomenda then
        raise exception 'Sem estoque de % (%)', r.nome, r.variante using errcode = '22023';
      end if;
      v_tem_encomenda := true;
    end if;
  end loop;

  select coalesce(sum(preco_unitario * quantidade), 0) into v_subtotal from _itens;

  select preco, ativo into v_frete_base, v_frete_ativo
  from public.shipping_methods where chave = p_metodo_entrega;

  if v_frete_base is null or v_frete_ativo is not true then
    raise exception 'Forma de entrega indisponível' using errcode = '22023';
  end if;

  -- Retirada é sempre grátis; Correios fica grátis acima do limite configurado
  if p_metodo_entrega = 'retirada' then
    v_frete := 0;
  elsif p_metodo_entrega = 'motoboy' then
    v_frete := v_frete_base;
  elsif v_subtotal >= v_cfg.frete_gratis_acima then
    v_frete := 0;
  else
    v_frete := v_frete_base;
  end if;

  if not exists (select 1 from public.payment_options where chave = p_metodo_pagamento and ativo) then
    raise exception 'Forma de pagamento indisponível' using errcode = '22023';
  end if;

  -- Desconto de 5% só no PIX, e só sobre o subtotal
  if p_metodo_pagamento = 'pix' then
    v_desconto := round(v_subtotal * v_cfg.desconto_pix, 2);
  end if;

  v_total := greatest(0, v_subtotal + v_frete - v_desconto);
  v_status := case when v_tem_encomenda then 'sob_encomenda' else 'aguardando_pagamento' end;

  if v_uid is not null then
    select id into v_customer_id from public.customers where profile_id = v_uid;
  end if;

  if v_customer_id is null and v_email is not null then
    select id into v_customer_id from public.customers where lower(email) = lower(v_email);
  end if;

  if v_customer_id is null then
    insert into public.customers (profile_id, nome, email, telefone, cpf, cidade, uf)
    values (v_uid, p_nome, v_email, p_telefone, p_cpf,
            nullif(p_endereco->>'cidade',''), nullif(p_endereco->>'uf',''))
    returning id into v_customer_id;
  else
    update public.customers
       set profile_id = coalesce(profile_id, v_uid),
           telefone   = coalesce(nullif(p_telefone,''), telefone),
           cpf        = coalesce(nullif(p_cpf,''), cpf),
           cidade     = coalesce(nullif(p_endereco->>'cidade',''), cidade),
           uf         = coalesce(nullif(p_endereco->>'uf',''), uf)
     where id = v_customer_id;
  end if;

  insert into public.orders (
    codigo, customer_id, cliente_nome, cliente_email, cliente_telefone, cliente_cpf,
    cliente_cidade, cliente_uf, endereco, status, metodo_entrega, metodo_pagamento,
    subtotal, frete, desconto, total, observacao
  ) values (
    '', v_customer_id, p_nome, v_email, p_telefone, p_cpf,
    nullif(p_endereco->>'cidade',''), nullif(p_endereco->>'uf',''),
    p_endereco, v_status, p_metodo_entrega, p_metodo_pagamento,
    v_subtotal, v_frete, v_desconto, v_total, p_observacao
  )
  returning id, codigo into v_order_id, v_codigo;

  insert into public.order_items (order_id, variant_id, product_id, nome, variante, ref, quantidade, preco_unitario, foto)
  select v_order_id, variant_id, product_id, nome, variante, ref, quantidade, preco_unitario, foto from _itens;

  -- Baixa de estoque só do que sai de pronta entrega
  update public.variants v
     set estoque = greatest(0, v.estoque - i.quantidade)
    from _itens i
   where v.id = i.variant_id and v.estoque >= i.quantidade;

  insert into public.order_events (order_id, titulo, autor)
  values (v_order_id, 'Pedido criado no site',
    'Cliente · checkout ' || (case p_metodo_pagamento
      when 'pix' then 'PIX' when 'cartao' then 'cartão'
      when 'whatsapp' then 'WhatsApp' else 'na retirada' end));

  if v_tem_encomenda then
    insert into public.order_events (order_id, titulo, autor)
    values (v_order_id, 'Encomenda registrada', 'Numeração fora de estoque · até 10 dias úteis');
  end if;

  return jsonb_build_object(
    'id', v_order_id, 'codigo', v_codigo, 'status', v_status,
    'subtotal', v_subtotal, 'frete', v_frete, 'desconto', v_desconto,
    'total', v_total, 'sob_encomenda', v_tem_encomenda);
end;
$$;

grant execute on function public.criar_pedido(jsonb, text, text, text, text, public.delivery_method, public.payment_method, jsonb, text)
  to anon, authenticated;

-- Consulta pública de um pedido: exige o código E o e-mail usado na compra.
create or replace function public.pedido_publico(p_codigo text, p_email text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_order public.orders%rowtype;
begin
  select * into v_order from public.orders
  where codigo = upper(trim(p_codigo))
    and cliente_email is not null
    and lower(cliente_email) = lower(trim(p_email));

  if not found then return null; end if;

  return jsonb_build_object(
    'codigo', v_order.codigo, 'status', v_order.status,
    'metodo_entrega', v_order.metodo_entrega, 'metodo_pagamento', v_order.metodo_pagamento,
    'subtotal', v_order.subtotal, 'frete', v_order.frete, 'desconto', v_order.desconto,
    'total', v_order.total, 'criado_em', v_order.criado_em, 'cliente_nome', v_order.cliente_nome,
    'itens', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'nome', oi.nome, 'variante', oi.variante, 'quantidade', oi.quantidade,
        'preco_unitario', oi.preco_unitario, 'foto', oi.foto) order by oi.nome), '[]'::jsonb)
      from public.order_items oi where oi.order_id = v_order.id));
end;
$$;

grant execute on function public.pedido_publico(text, text) to anon, authenticated;
