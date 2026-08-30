// Tipos do banco Ozzi. Espelham o esquema aplicado no Supabase
// (supabase/migrations). Regenerar com `supabase gen types` se o esquema mudar.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type ProductStatus = 'ativo' | 'oculto' | 'rascunho'
export type OrderStatus =
  | 'aguardando_pagamento'
  | 'pago'
  | 'em_separacao'
  | 'pronto'
  | 'postado'
  | 'entregue'
  | 'sob_encomenda'
  | 'cancelado'
export type DeliveryMethod = 'retirada' | 'motoboy' | 'pac' | 'sedex'
export type PaymentMethod = 'pix' | 'cartao' | 'whatsapp' | 'na_retirada'
export type PerfilEstiloRow = {
  id: string
  customer_id: string | null
  visitante_id: string | null
  subtom: string
  estacao: string | null
  contraste: string | null
  paleta: Json
  evitar: Json
  resumo: string | null
  criado_em: string
}

export type ProvaStatus = 'processando' | 'pronta' | 'erro'
export type SizeCode = 'P' | 'M' | 'G' | 'GG' | 'U'
export type BannerType = 'home_hero' | 'categoria' | 'faixa_colecao'
export type CampaignStatus = 'rascunho' | 'agendada' | 'enviada' | 'ativa'
export type AutomationType =
  | 'carrinho_abandonado'
  | 'boas_vindas'
  | 'volta_estoque'
  | 'aniversario'
  | 'pos_compra'

export type ProfileRow = {
  id: string
  nome: string
  email: string | null
  cpf: string | null
  telefone: string | null
  cidade: string | null
  uf: string | null
  clube_ozzi: boolean
  opt_in_email: boolean
  role: string
  criado_em: string
}

export type CustomerRow = {
  id: string
  profile_id: string | null
  nome: string
  email: string | null
  telefone: string | null
  cpf: string | null
  cidade: string | null
  uf: string | null
  clube_ozzi: boolean
  opt_in_email: boolean
  criado_em: string
}

export type CategoryRow = {
  id: string
  nome: string
  slug: string
  imagem_banner: string | null
  ordem: number
  ativo: boolean
  no_menu: boolean
  criado_em: string
}

export type ProductRow = {
  id: string
  nome: string
  slug: string
  ref: string
  category_id: string | null
  tecido: string | null
  descricao: string | null
  medidas: string | null
  preco: number
  preco_comparativo: number | null
  preco_custo: number | null
  peso: number | null
  fornecedor: string | null
  status: ProductStatus
  aceita_encomenda: boolean
  prazo_encomenda_dias: number
  selo: string | null
  fotos: Json
  videos: Json
  medidas_tabela: Json
  destaque: boolean
  criado_em: string
}

export type VariantRow = {
  id: string
  product_id: string
  cor_nome: string
  cor_hex: string
  tamanho: SizeCode
  estoque: number
  ordem: number
}

export type AddressRow = {
  id: string
  customer_id: string
  cep: string
  rua: string
  numero: string | null
  complemento: string | null
  bairro: string | null
  cidade: string
  uf: string
  padrao: boolean
  criado_em: string
}

export type OrderRow = {
  id: string
  codigo: string
  customer_id: string | null
  cliente_nome: string
  cliente_email: string | null
  cliente_telefone: string | null
  cliente_cpf: string | null
  cliente_cidade: string | null
  cliente_uf: string | null
  endereco: Json | null
  status: OrderStatus
  metodo_entrega: DeliveryMethod
  metodo_pagamento: PaymentMethod
  subtotal: number
  frete: number
  desconto: number
  total: number
  cupom: string | null
  observacao: string | null
  criado_em: string
}

export type OrderItemRow = {
  id: string
  order_id: string
  variant_id: string | null
  product_id: string | null
  nome: string
  variante: string
  ref: string | null
  quantidade: number
  preco_unitario: number
  foto: string | null
}

export type OrderEventRow = {
  id: string
  order_id: string
  titulo: string
  autor: string | null
  previsto: boolean
  rotulo_tempo: string | null
  criado_em: string
}

export type NoticeRow = {
  id: string
  texto: string
  periodo: string
  ativo: boolean
  ordem: number
  criado_em: string
}

export type BannerRow = {
  id: string
  tipo: BannerType
  slug: string | null
  imagem: string | null
  chapeu: string | null
  titulo: string | null
  texto: string | null
  texto_botao: string | null
  link_botao: string | null
  inicio: string | null
  fim: string | null
  ativo: boolean
  ordem: number
  criado_em: string
}

export type CouponRow = {
  codigo: string
  tipo: string
  valor: number
  regra: string
  descricao: string | null
  validade: string | null
  usos: number
  ativo: boolean
  criado_em: string
}

export type ShippingMethodRow = {
  chave: DeliveryMethod
  nome: string
  detalhe: string
  preco: number
  ativo: boolean
  ordem: number
}

export type PaymentOptionRow = {
  chave: PaymentMethod
  nome: string
  destaque: string
  detalhe: string
  ativo: boolean
  ordem: number
}

export type StoreSettingsRow = {
  id: boolean
  nome_loja: string
  localizacao: string
  whatsapp: string
  instagram: string
  cnpj: string
  email: string
  promo_bar_ativa: boolean
  frete_gratis_acima: number
  desconto_avista: number
  parcelas_max: number
}

export type EmailListRow = {
  id: string
  nome: string
  regra: string
  contagem: number
  ordem: number
}

export type EmailCampaignRow = {
  id: string
  assunto: string
  pre_header: string | null
  lista_id: string | null
  agendado_para: string | null
  envio_rotulo: string | null
  status: CampaignStatus
  aberturas: number | null
  cliques: number | null
  receita: number | null
  criado_em: string
}

export type EmailAutomationRow = {
  id: string
  tipo: AutomationType
  nome: string
  descricao: string
  metrica: string
  ativo: boolean
  config: Json
}

export type ProvaRow = {
  id: string
  product_id: string | null
  variant_id: string | null
  customer_id: string | null
  visitante_id: string | null
  foto_pessoa: string
  imagem_gerada: string | null
  status: ProvaStatus
  erro: string | null
  criado_em: string
}

export type StockAlertRow = {
  id: string
  variant_id: string | null
  product_id: string | null
  customer_email: string
  criado_em: string
  notificado_em: string | null
}

type Table<Row, Rel extends readonly unknown[] = []> = {
  Row: Row
  Insert: Partial<Row>
  Update: Partial<Row>
  Relationships: Rel
}

/** Chave estrangeira, no formato que o supabase-js usa para tipar embeds. */
type FK<Nome extends string, Coluna extends string, Alvo extends string, UmPraUm extends boolean = false> = {
  foreignKeyName: Nome
  columns: [Coluna]
  isOneToOne: UmPraUm
  referencedRelation: Alvo
  referencedColumns: ['id']
}

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      profiles: Table<ProfileRow>
      customers: Table<CustomerRow, [FK<'customers_profile_id_fkey', 'profile_id', 'profiles', true>]>
      categories: Table<CategoryRow>
      products: Table<ProductRow, [FK<'products_category_id_fkey', 'category_id', 'categories'>]>
      variants: Table<VariantRow, [FK<'variants_product_id_fkey', 'product_id', 'products'>]>
      addresses: Table<AddressRow, [FK<'addresses_customer_id_fkey', 'customer_id', 'customers'>]>
      orders: Table<OrderRow, [FK<'orders_customer_id_fkey', 'customer_id', 'customers'>]>
      order_items: Table<
        OrderItemRow,
        [
          FK<'order_items_order_id_fkey', 'order_id', 'orders'>,
          FK<'order_items_product_id_fkey', 'product_id', 'products'>,
          FK<'order_items_variant_id_fkey', 'variant_id', 'variants'>,
        ]
      >
      order_events: Table<OrderEventRow, [FK<'order_events_order_id_fkey', 'order_id', 'orders'>]>
      notices: Table<NoticeRow>
      banners: Table<BannerRow>
      coupons: Table<CouponRow>
      shipping_methods: Table<ShippingMethodRow>
      payment_options: Table<PaymentOptionRow>
      store_settings: Table<StoreSettingsRow>
      email_lists: Table<EmailListRow>
      email_campaigns: Table<EmailCampaignRow, [FK<'email_campaigns_lista_id_fkey', 'lista_id', 'email_lists'>]>
      email_automations: Table<EmailAutomationRow>
      perfis_estilo: Table<
        PerfilEstiloRow,
        [FK<'perfis_estilo_customer_id_fkey', 'customer_id', 'customers'>]
      >
      provas: Table<
        ProvaRow,
        [
          FK<'provas_product_id_fkey', 'product_id', 'products'>,
          FK<'provas_variant_id_fkey', 'variant_id', 'variants'>,
          FK<'provas_customer_id_fkey', 'customer_id', 'customers'>,
        ]
      >
      stock_alerts: Table<
        StockAlertRow,
        [
          FK<'stock_alerts_product_id_fkey', 'product_id', 'products'>,
          FK<'stock_alerts_variant_id_fkey', 'variant_id', 'variants'>,
        ]
      >
    }
    Views: { [_ in never]: never }
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean }
      my_customer_id: { Args: Record<string, never>; Returns: string }
      criar_pedido: {
        Args: {
          p_itens: Json
          p_nome: string
          p_email?: string | null
          p_telefone?: string | null
          p_cpf?: string | null
          p_metodo_entrega?: DeliveryMethod
          p_metodo_pagamento?: PaymentMethod
          p_endereco?: Json | null
          p_observacao?: string | null
        }
        Returns: Json
      }
      pedido_publico: {
        Args: { p_codigo: string; p_email: string }
        Returns: Json
      }
      prova_cota: {
        Args: { p_visitante?: string | null }
        Returns: Json
      }
      consultor_cota: {
        Args: { p_visitante?: string | null }
        Returns: Json
      }
    }
    Enums: {
      product_status: ProductStatus
      order_status: OrderStatus
      delivery_method: DeliveryMethod
      payment_method: PaymentMethod
      size_code: SizeCode
      banner_type: BannerType
      campaign_status: CampaignStatus
      automation_type: AutomationType
    }
    CompositeTypes: { [_ in never]: never }
  }
}
