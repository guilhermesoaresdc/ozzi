# Convenções de implementação

Referência curta para quem for mexer nas telas. A fonte de verdade do design é
`docs/handoff/README.md`.

## Idioma

Tudo em pt-BR: rotas, nomes de variáveis de domínio, textos, comentários.
Nomes de API do framework ficam em inglês (`params`, `searchParams`, `children`).

## Estilo

- **Tailwind v4.** Os tokens do handoff §8 são variáveis de tema em
  `src/app/globals.css`: `bg`, `surface`, `surface-hover`, `surface-sunken`,
  `ink`, `ink-2`, `body`, `body-2`, `muted`, `muted-2`, `faint`, `line`,
  `line-2`, `line-input`, `line-dashed`, `line-check`, `accent`,
  `accent-light`, `on-dark`, `on-dark-muted`, `on-dark-faint`, `dark-line`,
  `dark-line-2`, `chart-bar`, `success`, `warning`, `danger`.
  Use `text-muted`, `border-line`, `bg-surface` e afins.
- Tamanhos fracionários do handoff (13.5px, 10.5px, `.14em`) não existem na
  escala do Tailwind: use `style={{ fontSize: 13.5, letterSpacing: '.14em' }}`.
  Isso é esperado, não é gambiarra.
- **Raio zero em todo o produto.** A única exceção é `.oz-pill`
  (`border-radius: 99px`), para o contador da sacola, os badges da sidebar do
  painel e os toggles.
- **Sem sombra decorativa.** `box-shadow` só como fio de 1px.
- O fio de 1px entre células de grade vai **na célula** (`.oz-hairline-cell`),
  nunca como fundo do container — fundo deixa um retângulo vazio quando a
  última linha não preenche as colunas.
- Classes utilitárias prontas: `.shell` (1340px), `.shell-narrow` (1180px),
  `.oz-label`, `.oz-eyebrow`, `.oz-nav-link`, `.oz-btn` + `.oz-btn-primary`
  / `.oz-btn-outline` / `.oz-btn-outline-light` / `.oz-btn-tertiary`,
  `.oz-input`, `.oz-card`, `.oz-hairline-cell`, `.oz-pill`, `.oz-table-row`.
- Fontes: `font-display` (Cormorant Garamond) para títulos, preços e números
  grandes; `font-sans` (Jost) para o resto, que já é o padrão do `body`.

## Componentes compartilhados

| Componente | Uso |
| --- | --- |
| `ui/Placeholder` | Toda imagem. Aceita `src` para a foto real e `label` para a legenda listrada |
| `ui/Logo` | Marca + wordmark. `invertida` para fundo escuro |
| `ui/Toggle` | Pílula 34×19 |
| `ui/Checkbox` (`CheckSquare`) | Quadrado de 12px |
| `loja/ProductCard` | Cartão de produto; `reduzido` corta cores e parcelamento |
| `loja/SectionHeader` | Chapéu + H2 + link "ver tudo" |

## Dados

- Leitura pública: `src/lib/queries.ts` (funções memoizadas com `cache`).
- Escrita: server actions com o cliente de sessão (`lib/supabase/server`).
  O RLS já libera o papel `admin` — **não** existe chave de service role.
- Criação de pedido: RPC `criar_pedido` no banco. Ela recalcula preço, frete,
  desconto e estoque; nunca mande totais do navegador.
- Dinheiro: `brl()` de `lib/format`. Contas: `lib/pricing`.
- Datas: `dataCurta`, `dataLonga`, `dataPorExtenso`, `hora`, `rotuloDia`.

## Acessibilidade

O handoff §7 pede explicitamente foco visível em links e botões — o
`:focus-visible` global já cobre isso. Mantenha `aria-label` nos controles que
só têm glifo (`−`, `+`, `←`, `⠿`) e `aria-current` no item de navegação ativo.
