# Ozzi — loja e painel

E-commerce da Ozzi Moda Feminina (Centro, Várzea Alegre - CE): loja pública e
painel administrativo, construídos a partir do handoff de design.

## Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS v4** — os tokens do handoff §8 vivem em `src/app/globals.css` (`@theme`)
- **Supabase** — Postgres + Auth + RLS
- **Vercel** — deploy de produção a partir da `main`

## Rodando local

```bash
npm install
cp .env.example .env.local   # preencha com as chaves do projeto Supabase
npm run dev
```

## Variáveis de ambiente

| Nome | Uso |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave publicável (respeita RLS) |
| `NEXT_PUBLIC_SITE_URL` | URL canônica, para metadados |
| `NEXT_PUBLIC_WHATSAPP` | Número no formato internacional, sem símbolos |

Não há chave de service role: toda escrita passa por RLS ou por funções
`SECURITY DEFINER` no banco, então nenhum segredo de administração vai para a aplicação.

## Estrutura

```
src/app/(loja)      rotas públicas — home, categoria, produto, busca, sacola, checkout, conta
src/app/admin       painel, protegido pelo papel `admin` no middleware
src/components/ui   primitivas compartilhadas (Placeholder, Logo, Toggle, Checkbox)
src/components/loja chrome e cartões da loja
src/components/admin chrome e cartões do painel
src/lib             tipos do banco, clientes Supabase, formatação, preço, consultas
supabase/migrations SQL aplicado no projeto
```

## Regras de negócio

Codificadas em `src/lib/pricing.ts` e na função `public.criar_pedido` do banco:

- 5% de desconto no PIX, só sobre o subtotal e só quando o pagamento é PIX
- Frete grátis nos Correios com subtotal ≥ R$ 249; retirada sempre grátis; motoboy R$ 12
- Até 6x sem juros no cartão
- Numeração sem estoque com `aceita_encomenda` vira pedido "sob encomenda" (até 10 dias úteis)

Preços, frete, desconto e baixa de estoque são recalculados no banco a cada
pedido — nada que venha do navegador entra na conta.

## Design

Fidelidade alta ao handoff. Dois pontos que valem lembrar ao mexer no visual:

- **Raio de borda é zero em todo o produto**, exceto pílulas (`.oz-pill`) do contador
  da sacola, dos badges da sidebar e dos toggles.
- O fio de 1px entre células de grade é `box-shadow: 0 0 0 1px` **na célula**
  (`.oz-hairline-cell`), nunca fundo no container.
