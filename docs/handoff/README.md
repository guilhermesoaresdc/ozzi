# Handoff: E-commerce Ozzi (loja + painel administrativo)

> Documento de handoff para implementação com Claude Code. Escrito em português.
> O projeto **começa do zero** — o repositório `guilhermesoaresdc/ozzi` está vazio.

---

## 1. Visão geral

A Ozzi é uma loja de moda feminina de Várzea Alegre, Ceará. **Não existe loja física** — a operação é online, com retirada combinada no Centro de Várzea Alegre, entrega local por motoboy e envio pelos Correios para todo o Brasil.

Este handoff cobre duas aplicações:

| Aplicação | Arquivo de referência | Telas |
| --- | --- | --- |
| **Loja (storefront)** | `Ozzi.dc.html` | Home, Categoria, Produto, Busca, Sacola, Checkout, Entrar/Conta, Meus pedidos, Sobre |
| **Painel administrativo** | `Ozzi Admin.dc.html` | Visão geral, Pedidos, Detalhe do pedido, Produtos, Novo produto, Banners e avisos, E-mail marketing, Clientes, Configurações |

Regra de negócio central: **prioridade absoluta para pronta entrega.** Peças em estoque são o padrão em toda a loja. "Sob encomenda em até 10 dias úteis" é uma exceção que aparece apenas em três lugares: no aviso de numeração esgotada na página do produto, num item do acordeão de informações do produto, e como status de pedido.

---

## 2. Sobre os arquivos de design

Os arquivos `.dc.html` deste bundle são **referências de design criadas em HTML** — protótipos que mostram a aparência e o comportamento pretendidos. **Não são código de produção para copiar.**

A tarefa é **recriar esses designs no ambiente da aplicação-alvo**, usando os padrões e bibliotecas da stack escolhida. Como o repositório está vazio, o desenvolvedor deve escolher a stack. Recomendação para este caso (loja pequena, catálogo de ~300 SKUs, admin próprio):

- **Next.js (App Router) + TypeScript** — SSR/ISR para SEO das páginas de produto e categoria
- **Tailwind CSS** — os tokens da seção 8 mapeiam direto para o `tailwind.config`
- **PostgreSQL + Prisma** — modelagem na seção 10
- **Autenticação**: e-mail/senha para clientes, e um papel `admin` separado para o painel
- **Pagamentos**: gateway com PIX + cartão parcelado (Mercado Pago, Pagar.me ou Asaas — todos cobrem PIX nativo no Brasil)
- **Imagens**: armazenamento em object storage (S3/R2) + `next/image`

Observações sobre a técnica dos protótipos, para não gerar confusão:
- Os protótipos usam **apenas estilos inline** e uma troca de tela por estado local (`state.screen`). Isso é uma limitação do formato de protótipo — na implementação real, cada tela é uma **rota** própria.
- Não há media queries nos protótipos: a responsividade é feita com `grid-template-columns: repeat(auto-fit, minmax(Xpx, 1fr))` e `clamp()`. Na implementação real, use breakpoints normais do Tailwind; os valores de `minmax` indicam a largura mínima pretendida de cada card.
- Todas as imagens são **placeholders listrados** com legenda em monospace informando o conteúdo e a dimensão pretendida (ex. `editorial · look principal · 1040×1300`). A cliente vai fornecer as fotos reais.

---

## 3. Fidelidade

**Alta fidelidade (hifi).** Cores, tipografia, espaçamentos, hierarquia e conteúdo são finais e devem ser recriados fielmente. Os valores exatos estão na seção 8 (tokens) e nas descrições de tela.

Exceções (baixa fidelidade, decisão do desenvolvedor):
- O gráfico de barras da Visão geral é um placeholder visual — substituir por dados reais (a forma visual, barras retas sem cantos arredondados com a última barra em destaque `#8A6A4F`, deve ser mantida).
- Os controles de toggle são desenhados como pílulas simples; use o componente equivalente da biblioteca escolhida mantendo as cores.

---

## 4. Identidade visual

### Logo
`assets/ozzi-logo.png` — marca de lótus em traço fino, preto sobre linho. Fornecida pela cliente.

Aplicações:
- **Loja, cabeçalho**: marca 44×44px + wordmark "OZZI" (Jost 200, 23px, `letter-spacing: .34em`, `text-indent: .34em`) + tagline "FEMININE FASHION & ACCESSORIES" (Jost 400, 7.5px, `letter-spacing: .2em`, cor `#6B665C`), empilhados em coluna com `gap: 3px`.
- **Sobre fundo escuro** (rodapé, sidebar do admin): aplicar `filter: invert(1) brightness(1.08); opacity: .92` na imagem. **Substituir por um PNG branco real na implementação** — o filtro é um recurso de protótipo.
- A marca sobre fundo claro usa `mix-blend-mode: multiply` para casar com o fundo linho.

O `letter-spacing` do wordmark é essencial para a identidade: sempre com `text-indent` de valor igual, para compensar o espaço que o tracking adiciona à direita da última letra.

### Tipografia

| Uso | Fonte | Peso | Detalhes |
| --- | --- | --- | --- |
| Títulos editoriais, preços, números grandes | **Cormorant Garamond** | 300 (títulos), 400 (subtítulos de card) | `letter-spacing: -.015em` nos títulos grandes |
| Interface, corpo, navegação, labels | **Jost** | 200 / 300 / 400 / 500 | — |
| Legendas de placeholder de imagem | monospace do sistema | 400 | `ui-monospace, Menlo, monospace` |

Google Fonts: `Cormorant+Garamond:ital,wght@0,300;0,400;1,300` e `Jost:wght@200;300;400;500`.

Padrão recorrente de "label": Jost, 10.5–11.5px, `letter-spacing: .14em`–`.16em`, `text-transform: uppercase`, cor `#8A8375`. Usado em labels de formulário, cabeçalhos de tabela e microtítulos.

Padrão de botão: Jost, 11–11.5px, `letter-spacing: .16em`, `text-transform: uppercase`.

Itens de navegação: Jost, 12px, `letter-spacing: .12em`, `text-transform: uppercase`.

---

## 5. Telas da loja (`Ozzi.dc.html`)

### Chrome comum a todas as telas

**Faixa de avisos** (topo, controlável pelo admin — prop `promoBar`)
- `background: #232320`, texto `#F2EEE7`, `padding: 10px 24px`
- Fonte 10.5px, `letter-spacing: .18em`, uppercase, centralizado, `flex-wrap: wrap`, `gap: 12px 30px`
- Separadores `/` com `opacity: .3`
- Conteúdo: "Pronta entrega · postamos no mesmo dia" / "Frete grátis acima de R$ 249" / "Retirada grátis em Várzea Alegre"

**Cabeçalho**
- `position: sticky; top: 0; z-index: 60`
- `background: rgba(242,238,231,.93)` + `backdrop-filter: blur(14px)`, borda inferior `1px solid #DFD8CB`
- Conteúdo em `max-width: 1340px`, `padding: 14px 28px`, `display: flex; align-items: center; flex-wrap: wrap; gap: 12px 30px`
- Logo à esquerda com `margin-right: auto`; nav no centro; ações à direita
- Nav: Novidades · Vestidos · Blusas · Conjuntos · Sobre nós. Hover: `border-bottom: 1px solid #232320` (o `border-bottom: 1px solid transparent` no estado normal evita deslocamento no hover)
- Ações: Buscar · Conta · Sacola. O contador da sacola é uma pílula: `min-width: 19px; height: 19px; border-radius: 99px; background: #232320; color: #F2EEE7; font-size: 10px`

**Rodapé**
- `background: #232320`, texto `#F2EEE7`, `margin-top: auto`
- Grid `repeat(auto-fit, minmax(200px, 1fr))`, `gap: 40px`, `padding: 60px 28px 30px`
- Coluna 1: logo invertida + "Centro, Várzea Alegre - CE / Atendimento online e entrega local" (`#8F8A7E`, 13.5px, `line-height: 1.7`)
- Colunas: **Comprar** (Novidades, Vestidos, Conjuntos, Acessórios, Sob encomenda) · **Ajuda** (Trocas e devoluções, Prazos de entrega, Tabela de medidas, Formas de pagamento) · **Ozzi** (Sobre nós, Clube Ozzi, Trabalhe com a gente, Instagram)
- Títulos de coluna: 10.5px, `letter-spacing: .18em`, uppercase, peso 500, cor `#C4A88B`
- Links: 13.5px, cor `#B3ADA0`, hover `#F2EEE7`
- Barra inferior separada por `border-top: 1px solid #3A3730`, `padding: 22px 28px 40px`, 11.5px, `#8F8A7E`: "© 2026 Ozzi Moda Feminina · CNPJ 00.000.000/0001-00" e "PIX · Cartão em até 6x · Retirada combinada · Correios"

---

### 5.1 Home

**Hero** — grid `repeat(auto-fit, minmax(330px, 1fr))` com borda inferior `1px solid #DFD8CB`, dentro de `max-width: 1340px; padding: 0 28px`.
- Coluna esquerda: `padding: clamp(48px,7vw,92px) clamp(0px,4vw,64px) clamp(48px,7vw,92px) 0`, `min-height: 520px`, conteúdo centralizado verticalmente
  - Chapéu: "Coleção Alta Estação 2026" — 10.5px, `letter-spacing: .26em`, uppercase, `#8A6A4F`, `margin-bottom: 24px`
  - H1: "Linho, luz / **e o sertão** / em movimento" — Cormorant Garamond 300, `clamp(46px, 5.4vw, 78px)`, `line-height: .98`, `letter-spacing: -.015em`, `text-wrap: balance`. A segunda linha é um `<em>` em `#8A6A4F`
  - Parágrafo: "Peças escolhidas uma a uma por quem mora aqui, no Centro de Várzea Alegre. O que está no site sai hoje do estoque." — 15.5px, `line-height: 1.72`, `#5C574D`, `max-width: 410px`, `text-wrap: pretty`
  - Botões (flex, `gap: 12px`, wrap): **"Comprar pronta entrega"** (`background: #232320`, texto `#F2EEE7`, `padding: 16px 32px`, hover `background: #8A6A4F`) e **"Conhecer a Ozzi"** (`border: 1px solid #232320`, hover inverte para fundo escuro)
- Coluna direita: placeholder de imagem `editorial · look principal · 1040×1300`, `min-height: 460px`

**Categorias** — `padding: 60px 28px 0`. Cabeçalho de seção: H2 Cormorant 300 36px + link "Ver tudo" (11.5px, `letter-spacing: .14em`, uppercase, `border-bottom: 1px solid #232320`, `padding-bottom: 3px`).
- Grid `repeat(auto-fill, minmax(210px, 1fr))`, `gap: 16px`
- Card: imagem `aspect-ratio: 3/4` com legenda ancorada embaixo (`align-items: flex-end; padding: 14px`); hover `filter: brightness(.965)`
- Sob a imagem: nome em Cormorant 22px + contagem em 10.5px `#8A8375`, distribuídos com `space-between`, `padding: 12px 2px 0`
- Categorias e contagens: Vestidos 64 · Blusas 48 · Calças 37 · Saias 22 · Conjuntos 29 · Moda praia 31 · Acessórios 56 · Calçados 25

**Favoritos da casa** — `padding: 76px 28px 0`. Chapéu "Pronta entrega" (`#8A6A4F`) + H2 "Favoritos da casa" + link "Todos os produtos".
- Grid `repeat(auto-fill, minmax(230px, 1fr))`, `gap: 22px 16px`
- **Card de produto** (padrão reutilizado em Categoria, Busca e "Combina com"):
  - Imagem `aspect-ratio: 3/4`, legenda de placeholder ancorada embaixo
  - Selo opcional: `position: absolute; top: 13px; left: 13px`, `background: #232320`, texto `#F2EEE7`, 9px, `letter-spacing: .16em`, uppercase, `padding: 6px 9px`. Valores: "Última numeração", "Novidade"
  - Corpo (`padding: 13px 2px 0`, flex column, `gap: 5px`): nome 14.5px · cores 11px `#8A8375` · preço Cormorant 21px · parcelamento 11px `#8A8375` (oculto quando `showInstallments` é falso)
  - Produtos: Vestido Serrote R$ 289,90 (Areia · Preto · Verde oliva, selo "Última numeração") · Blusa Cordel R$ 129,90 (Off-white · Terracota) · Conjunto Lavras R$ 349,90 (Bege · Chumbo, selo "Novidade") · Saia Midi Canoa R$ 199,90 (Preto · Caramelo)

**Bloco escuro "Prove em casa antes de pagar"** — `margin: 76px auto 0`, grid `repeat(auto-fit, minmax(320px, 1fr))`, `background: #232320`, texto `#F2EEE7`
- Texto: `padding: clamp(40px,5vw,64px) clamp(28px,4vw,56px)`; chapéu "Só em Várzea Alegre" em `#C4A88B`; H2 Cormorant 300 `clamp(32px,3.4vw,44px)`; parágrafo `#B3ADA0`; botão de contorno claro (hover inverte)
- Imagem: placeholder escuro (`repeating-linear-gradient(135deg, #2C2A25 0 9px, #232120 9px 18px)`), legenda com `border: 1px solid #4A463D`, `min-height: 320px`

**Quatro benefícios** — `padding: 76px 28px 92px`, grid `repeat(auto-fit, minmax(240px, 1fr))`, `gap: 1px`.
> **Atenção:** o fio de 1px é feito com `box-shadow: 0 0 0 1px #DFD8CB` **em cada célula**, não com fundo no container. Fundo no container deixa um retângulo bege vazio quando a última linha não preenche as colunas.
- Célula: `background: #F2EEE7`, `padding: 30px 24px`; numeral romano em Cormorant 14px `letter-spacing: .2em` `#8A6A4F`; título 13px uppercase `letter-spacing: .08em` peso 500; corpo 13.5px `line-height: 1.65` `#5C574D`
- Conteúdo: **I Pronta entrega** "Tudo que aparece no site está no estoque da loja e sai para postagem no mesmo dia." · **II Retire no centro** "Combine a retirada no Centro de Várzea Alegre em até 2 horas, sem custo." · **III PIX com desconto** "5% off à vista no PIX ou até 6x sem juros no cartão." · **IV Troca sem dor** "Sete dias para trocar numeração, presencialmente ou pelos Correios."

---

### 5.2 Categoria

- `max-width: 1340px; padding: 24px 28px 92px`
- Breadcrumb: 11px, `letter-spacing: .1em`, uppercase, `#8A8375` — "Início / Vestidos"
- Cabeçalho: H1 Cormorant 300 `clamp(38px,4.4vw,52px)` "Vestidos" + subtítulo "64 peças em pronta entrega · numeração P ao GG" (14px `#5C574D`); à direita, `<select>` de ordenação (Relevância, Menor preço, Maior preço, Novidades) com `border: 1px solid #C9C0B1`, `padding: 10px 13px`. Borda inferior `1px solid #DFD8CB`, `padding-bottom: 20px`, `margin-bottom: 28px`
- Layout: sidebar de filtros (`max-width: 250px`) + grade de produtos
- **Filtros**: título 11px uppercase `letter-spacing: .16em` com borda inferior; itens com checkbox quadrado desenhado (`width/height: 12px; border: 1px solid #A79C89`), nome 13.5px `#3E3B34`, contagem 10.5px `#9A9385` alinhada à direita
  - Tamanho: P 18 · M 31 · G 27 · GG 14
  - Cor: Areia 22 · Preto 19 · Off-white 15 · Terracota 9
  - Preço: Até R$ 150 (11) · R$ 150 a R$ 250 (24) · R$ 250 a R$ 350 (21) · Acima de R$ 350 (8)
  - Disponibilidade: Pronta entrega 58 · Sob encomenda 6
  - Card ao final: `border: 1px solid #DFD8CB`, `padding: 18px`, título Cormorant 20px "Prova em casa", texto 12.5px "Em Várzea Alegre e região, levamos até 3 peças para você provar antes de pagar."
- **Grade**: `repeat(auto-fill, minmax(220px, 1fr))`, `gap: 26px 18px`, mesmo card de produto da home. 9 produtos: Vestido Serrote 289,90 · Chapada 259,90 · Cariri 319,90 · Aurora 279,90 · Riacho 229,90 · Serena 339,90 · Ipueiras 249,90 · Solar 299,90 · Cacimba 269,90
- Botão "Carregar mais 24" centralizado, `margin-top: 48px`, contorno escuro que inverte no hover

---

### 5.3 Produto

- Grid `repeat(auto-fit, minmax(min(100%, 380px), 1fr))`, `gap: clamp(28px, 4vw, 60px)`, `align-items: start`
- **Galeria**: grid 2×2, `gap: 10px`, quatro placeholders `aspect-ratio: 3/4` — frente, costas, detalhe do tecido, look completo (900×1200 cada)
- **Coluna de compra**: `position: sticky; top: 120px`
  - Chapéu "Pronta entrega" 10.5px `letter-spacing: .24em` `#8A6A4F`
  - H1 "Vestido Serrote" Cormorant 300 `clamp(34px,3.6vw,46px)`, `line-height: 1.08`
  - Subtítulo "Linho misto · Ref. OZ-1042" 13.5px `#8A8375`
  - Preço: `R$ 289,90` em Cormorant 38px + `R$ 349,90` riscado 13.5px `#8A8375`
  - "**R$ 275,40** no PIX (5% de desconto)" e "ou 6x de R$ 48,32 sem juros no cartão" (13.5px)
  - Bloco de variantes com `border-top: 1px solid #DFD8CB; padding-top: 22px`
    - **Cor · {selecionada}** — swatches 46×46px, `border: 1px solid #C9C0B1`, `gap: 10px`. Areia `#D9CDBA` · Preto `#26241F` · Verde oliva `#6E7358`
    - **Tamanho** + link "Tabela de medidas" (`#8A6A4F`, `border-bottom: 1px solid #C4A88B`)
    - Botões de tamanho: `min-width: 52px; padding: 13px 6px`, 13px, `letter-spacing: .06em`
      - selecionado: fundo `#232320`, texto `#F2EEE7`, borda `#232320`
      - disponível: fundo transparente, texto `#232320`, borda `#C9C0B1`
      - esgotado: fundo `#E9E3D9`, texto `#A79C89`, borda `#C9C0B1`
      - Estoque de exemplo: P, M, G disponíveis; **GG esgotado**
    - Nota sob os tamanhos (12px `#8A8375`) — muda conforme o tamanho selecionado:
      - em estoque: "Em estoque · envio no mesmo dia"
      - esgotado: "Esgotado no estoque — fazemos sob encomenda em até 10 dias úteis"
    - Ações: **"Adicionar à sacola"** (`flex: 1 1 220px`, fundo escuro, `padding: 18px 24px`, hover `#8A6A4F`) + **"Comprar agora"** (`flex: 1 1 140px`, contorno) + **"Tirar dúvida no WhatsApp"** (largura total, `border: 1px solid #C9C0B1`, `padding: 14px`, texto `#5C574D`; oculto quando `showWhatsapp` é falso)
  - **Acordeão** (`border-top: 1px solid #DFD8CB`; cada item com `border-bottom: 1px solid #DFD8CB`, `padding: 18px 0`; título 11.5px uppercase `letter-spacing: .14em` + sinal `−`/`+` 16px `#8A8375`; corpo 13.5px `line-height: 1.7` `#5C574D`)
    1. **Descrição** (aberto) — "Vestido midi em linho misto com decote quadrado, mangas curtas e fenda discreta na barra. Caimento fluido, forro na saia. Modelo veste M e tem 1,70m."
    2. **Medidas e numeração** — "P (36/38) · M (40/42) · G (44/46) · GG (48/50). Comprimento 118cm no tamanho M. Na dúvida entre dois números, escolha o maior."
    3. **Sob encomenda** — "Numeração ou cor esgotada? Costuramos e entregamos em até 10 dias úteis, com uma prova de ajuste combinada para quem retira aqui na cidade."
    4. **Envio e retirada** — "Retirada grátis combinada no Centro de Várzea Alegre em até 2 horas. Motoboy local no mesmo dia. Correios para todo o Brasil, grátis acima de R$ 249."
- **"Combina com"** — `padding-top: 76px`, H2 Cormorant 300 34px, grid `repeat(auto-fill, minmax(220px, 1fr))` com card reduzido (nome + preço, sem cores nem parcelamento)

---

### 5.4 Busca

- `max-width: 1000px; padding: 56px 28px 92px`
- H1 "O que você procura?" Cormorant 300 `clamp(34px,4vw,46px)`
- Campo de busca: input sem borda dentro de um contêiner com `border-bottom: 1px solid #232320`, `padding-bottom: 14px`; fonte `clamp(20px,2.4vw,28px)` peso 300; contagem de resultados à direita (11.5px uppercase `letter-spacing: .14em` `#8A8375`)
- **Mais buscados**: chips com `border: 1px solid #C9C0B1`, `padding: 9px 15px`, 12.5px; hover `border-color: #232320; background: #E9E3D9`. Termos: vestido de linho · conjunto alfaiataria · blusa cropped · saia midi · sandália · moda praia
- Título de resultados com borda inferior: `Resultados para "{query}"`
- Grade `repeat(auto-fill, minmax(200px, 1fr))`, card reduzido (nome + preço)

---

### 5.5 Sacola

- `max-width: 1180px; padding: 44px 28px 92px`; grid de duas áreas (`repeat(auto-fit, minmax(min(100%,320px), 1fr))`, lista com `grid-column: span 2`), `gap: 44px`
- **Lista** (`border-top: 1px solid #DFD8CB`): cada item com `padding: 22px 0`, `border-bottom: 1px solid #DFD8CB`, `display: flex; gap: 20px; flex-wrap: wrap`
  - Miniatura 108px de largura, `aspect-ratio: 3/4`
  - Nome 16px · variante 12.5px `#8A8375` · status "Pronta entrega" 11.5px uppercase `letter-spacing: .1em` `#8A6A4F`
  - Links "Editar" e "Remover": 11.5px uppercase, `border-bottom: 1px solid #C9C0B1`, `#8A8375`
  - À direita: total do item em Cormorant 22px + stepper de quantidade (`border: 1px solid #C9C0B1`, botões `padding: 8px 13px`, valor centralizado `min-width: 22px`)
  - Itens: Vestido Serrote (Areia · M) R$ 289,90 ×1 · Conjunto Lavras (Bege · P) R$ 349,90 ×1 · Blusa Cordel (Terracota · M) R$ 129,90 ×2
- Link "Continuar comprando" ao final da lista
- **Resumo** (`position: sticky; top: 120px`, `background: #FAF7F2`, `border: 1px solid #DFD8CB`, `padding: 28px 26px`)
  - H2 Cormorant 300 26px "Resumo"
  - Linhas 13.5px `#5C574D` com valores em `#232320`: Subtotal · Frete · {rótulo do frete} · Desconto PIX (5%) em `#8A6A4F` com sinal `−`
  - Total no PIX: label 11.5px uppercase + valor Cormorant 30px; abaixo, "ou {total} em até 6x sem juros" 12.5px `#8A8375`
  - **Opções de entrega** (selecionável): cada opção é uma linha com nome + prazo (11.5px `#8A8375`) à esquerda e preço à direita; selecionada tem `background: #E9E3D9; border-color: #232320`, não selecionada `background: transparent; border: 1px solid #DFD8CB`
    - Retirada no Centro — "Hoje, a combinar · Várzea Alegre" — Grátis
    - Entrega local · motoboy — "Hoje até 18h · Várzea Alegre" — R$ 12,00
    - Correios · PAC — "5 a 9 dias úteis" — Grátis (acima de R$ 249)
  - Botão "Finalizar compra" (largura total, fundo escuro, `padding: 18px`)
  - Nota final centralizada 11.5px `#8A8375`: "Compra protegida · troca grátis em 7 dias"

---

### 5.6 Checkout

- Indicador de etapas no topo: `1 Sacola` (`#8A8375`) · `2 Entrega e pagamento` (`#232320`, ativo) · `3 Confirmação` (`#8A8375`). Numeral dentro de círculo de 22px com borda de 1px da mesma cor do texto
- Mesma estrutura de duas colunas da sacola
- **Entrega** — H2 Cormorant 300 28px; grid `repeat(auto-fit, minmax(180px, 1fr))`, `gap: 14px`; inputs com `border: 1px solid #C9C0B1`, `background: #FAF7F2`, `padding: 13px 14px`, 14px; label acima (10.5px uppercase `letter-spacing: .14em` `#8A8375`)
  - Campos e larguras (em colunas do grid): Nome completo (2) · CPF (1) · Celular/WhatsApp (1) · CEP (1) · Endereço (2) · Bairro (1) · Cidade (1) · Estado (1)
- **Pagamento** — opções empilhadas, `gap: 10px`; cada uma com `padding: 16px 18px`; selecionada `background: #FAF7F2; border-color: #232320`; nome 14.5px à esquerda, destaque em `#8A6A4F` à direita, detalhe 12.5px `#8A8375` na linha de baixo
  - **PIX** — "5% de desconto" — "QR Code na próxima tela · aprovação imediata"
  - **Cartão de crédito** — "até 6x sem juros" — "Visa, Master, Elo e Hipercard"
  - **Combinar no WhatsApp** — "atendimento humano" — "Uma vendedora finaliza o pedido com você"
  - **Pagar na retirada** — "sem taxa" — "PIX ou dinheiro na hora de receber a peça"
- **Resumo do pedido** (sticky): miniaturas de 52px + nome/variante/quantidade + valor; totais; botão "Confirmar pedido"; nota "Prefere fechar pelo WhatsApp? Chamar a loja"

---

### 5.7 Entrar / Conta

- Grid de duas colunas (`repeat(auto-fit, minmax(min(100%,320px), 1fr))`, `gap: clamp(28px,4vw,60px)`)
- **Esquerda**: H1 "Entrar" Cormorant 300 `clamp(34px,4vw,46px)`; texto de apoio "Acompanhe pedidos, salve favoritos e finalize a compra mais rápido."; formulário `max-width: 420px` com E-mail ou CPF, Senha, link "Esqueci minha senha", botão "Entrar" (fundo escuro) e "Criar minha conta" (contorno `#C9C0B1`)
- **Direita — Clube Ozzi**: `background: #FAF7F2`, `border: 1px solid #DFD8CB`, `padding: clamp(28px,3vw,40px)`; chapéu "Clube Ozzi"; H2 "Quem é de casa / ganha primeiro" Cormorant 300 32px; três benefícios numerados em romanos com `border-bottom: 1px solid #E4DDD1`
  - I "Acesso antecipado às novidades, sempre na quinta antes de abrir para todos."
  - II "Aviso no WhatsApp quando sua numeração favorita volta ao estoque."
  - III "Cupom de aniversário de 15% para usar em qualquer compra no site."

---

### 5.8 Meus pedidos

- Sidebar (`max-width: 230px`): saudação "Olá," (11px uppercase `#8A8375`) + nome em Cormorant 26px, com `border-bottom: 1px solid #DFD8CB`; nav vertical 13px — Meus pedidos (ativo, `#232320`), Meus dados, Endereços, Favoritos, Trocas e devoluções, Sair (todos `#6B665C`)
- Lista de pedidos: cada card com `border: 1px solid #DFD8CB`, `background: #FAF7F2`
  - Cabeçalho do card: "Pedido #OZ-2841 · 24 ago 2026" à esquerda (12px `#8A8375`), status à direita (uppercase `letter-spacing: .14em`), `border-bottom: 1px solid #DFD8CB`, `padding: 16px 20px`
  - Corpo `padding: 20px`: miniaturas 56px + itens/entrega + total em Cormorant 24px + botão de ação com contorno
  - Pedidos: **#OZ-2841** Em separação (`#8A6A4F`) — "Vestido Serrote · Blusa Cordel" — "Retirada no Centro · pronto hoje até 16h" — R$ 419,80 — "Ver pedido" · **#OZ-2790** Entregue (`#5C574D`) — Conjunto Lavras — "Correios · entregue em 14 ago" — R$ 349,90 — "Comprar de novo" · **#OZ-2733** Sob encomenda (`#8A6A4F`) — "Vestido Serena · GG" — "Previsão de entrega em 10 dias úteis" — R$ 339,90 — "Acompanhar"

---

### 5.9 Sobre a loja

- **Hero** igual em estrutura ao da home: chapéu "Várzea Alegre · Ceará"; H1 "Do Centro de / Várzea Alegre / pro Brasil" Cormorant 300 `clamp(40px,5vw,66px)`; parágrafo "A Ozzi começou em 2019 com um perfil no Instagram, um caderno de encomendas e muita conversa no WhatsApp. Hoje atendemos o Cariri inteiro e enviamos para todo o país — sem perder o jeito de vizinha, que sabe o nome de quem chama."; imagem `araras da coleção · 1000×1100`
- **Três blocos** (grid `repeat(auto-fit, minmax(260px, 1fr))`, `gap: 1px`, fio via `box-shadow` na célula, `padding: 34px 28px`): título Cormorant 400 24px + corpo 14px `line-height: 1.7`
  - **Curadoria de araras** — "Cada peça passa pela prova antes de entrar no site. Se o caimento não convence a gente, não vai para a vitrine."
  - **Feito para o calor** — "Linho, viscose e algodão em primeiro lugar. Tecidos que respiram e sobrevivem a 38 graus no Cariri."
  - **Encomenda com nome** — "Numeração esgotada não é fim de conversa: costuramos sob medida em até 10 dias úteis."
- **Fale com a gente**: H2 Cormorant 300 38px; três blocos de dados (label 10.5px uppercase `#8A8375` + valor `#232320`)
  - Onde estamos — "Centro, Várzea Alegre - CE / Loja online, com entrega local"
  - Atendimento — "Seg a sex · 8h às 18h / Sábado · 8h às 13h"
  - Fale com a gente — "(88) 99999-0000 · @ozzimodafeminina"
  - Ao lado, placeholder `entrega local · 900×680` em `aspect-ratio: 4/3`

---

## 6. Telas do painel (`Ozzi Admin.dc.html`)

### Shell

- `display: flex; min-height: 100vh; align-items: stretch`
- **Sidebar**: 238px fixos, `background: #232320`, texto `#F2EEE7`, `position: sticky; top: 0; height: 100vh`
  - Topo: logo invertida 36px + "OZZI" (18px, peso 200, `letter-spacing: .3em`) + "PAINEL DA LOJA" (7.5px, `#8F8A7E`); `border-bottom: 1px solid #3A3730`
  - Nav: itens com `padding: 11px 12px`, 13.5px; inativo `color: #8F8A7E`, ativo `color: #F2EEE7; background: #312E28`; badge opcional em pílula `background: #8A6A4F`
  - Itens: Visão geral · Pedidos (badge 14) · Produtos · Novo produto · Banners e avisos (badge 2) · E-mail marketing · Clientes · Configurações
  - Rodapé: "Guilherme Soares" 13px + "Administrador · ozzi.com.br" 11px `#8F8A7E` + link "Sair"
- **Cabeçalho da área de conteúdo**: sticky, `background: rgba(242,238,231,.94)` + blur, `padding: 16px 30px`, `border-bottom: 1px solid #DFD8CB`
  - Título da página em Cormorant 300 30px + subtítulo 12.5px `#8A8375`
  - Campo de busca "Buscar pedido, produto ou cliente" (270px) + botão "+ Novo produto"
- **Conteúdo**: `padding: 26px 30px 60px`
- **Cartão padrão de seção**: `border: 1px solid #DFD8CB`, `background: #FAF7F2`; cabeçalho com `padding: 20px 22px` e `border-bottom: 1px solid #DFD8CB`; linhas de lista separadas por `border-bottom: 1px solid #E4DDD1`; hover de linha `background: #EFE9DF`
- **Títulos de página por tela** (título / subtítulo):
  - Visão geral — "Bom dia, Guilherme" / "Quinta, 28 de agosto de 2026 · resumo de hoje"
  - Pedidos — "Pedidos" / "14 pedidos aguardando ação"
  - Detalhe — "Pedido #OZ-2841" / "Maria Eduarda Alves · 24 de agosto de 2026, 09:42"
  - Produtos — "Produtos" / "312 peças cadastradas · 58 em pronta entrega nesta semana"
  - Novo produto — "Novo produto" / "Cadastre a peça, a grade de numeração e as fotos"
  - Banners — "Banners e avisos" / "Imagens da vitrine, faixa de avisos e campanhas agendadas"
  - E-mail — "E-mail marketing" / "1.284 contatos · 3 automações ligadas"
  - Clientes — "Clientes" / "1.284 cadastros · 62% do Cariri"
  - Configurações — "Configurações" / "Entrega, pagamento, dados da loja e cupons"

### 6.1 Visão geral

- **KPIs**: 4 cards, grid `repeat(auto-fit, minmax(200px, 1fr))`, `gap: 1px`, fio via `box-shadow: 0 0 0 1px #DFD8CB` na célula, `background: #FAF7F2`, `padding: 22px 22px 20px`. Label uppercase 10.5px + valor Cormorant 36px + tendência 12px colorida
  - Vendas hoje R$ 2.847,60 ("+18% vs. ontem", verde) · Pedidos abertos 14 ("4 aguardando pagamento", âmbar) · Ticket médio R$ 271,40 ("+R$ 12 no mês", verde) · Visitas na semana 4.912 ("conversão de 2,4%", neutro)
- **Gráfico** (2/3 da largura): "Vendas dos últimos 14 dias" + "Ticket médio R$ 271,40"; barras `height: 172px`, `gap: 6px`, cor `#C9BFAD` e a última em `#8A6A4F`; rótulo do dia 9.5px `#9A9385` abaixo de cada barra; `title` com a receita do dia
- **Precisa de você** (1/3): linhas clicáveis com título 13.5px, subtítulo 11.5px `#8A8375` e contagem em Cormorant 24px `#8A6A4F`
  - Pedidos para separar 6 · Aguardando pagamento 4 · Encomendas em produção 3 · Peças sem foto 2
- **Pedidos recentes**: 5 linhas com cliente, `#id · itens`, status colorido, total
- **Estoque em alerta**: miniatura 38px + nome/ref/numerações + quantidade colorida
  - Saia Midi Canoa (P, M) 3 un · Vestido Serena (todas) Esgotado · Biquíni Coqueiro (G, GG) Esgotado · Vestido Serrote (GG) 1 un · Blusa Cordel (GG) 4 un

### 6.2 Pedidos

- Abas: Abertos 14 · Pagos 6 · Enviados 31 · Encomendas 3 · Concluídos 248. Aba ativa `background: #232320; color: #F2EEE7`; inativa contorno `#C9C0B1`. Contagem sempre em `#8A8375`
- Tabela (`min-width: 920px`, container com `overflow: auto`), colunas `1fr 1.7fr 1.5fr 1.4fr 1fr 1fr`: Pedido (id + data) · Cliente (nome + cidade) · Entrega · Pagamento · Status · Total (alinhado à direita)
- 8 pedidos de exemplo, de #OZ-2841 a #OZ-2834, cobrindo os status: Em separação (`#8A6A4F`) · Pago (`#5C7A5E`) · Postado (`#5C574D`) · Aguardando pagamento (`#A0533F`) · Entregue (`#5C574D`) · Sob encomenda (`#8A6A4F`)

### 6.3 Detalhe do pedido

- Link "← Todos os pedidos" 11px uppercase `#8A8375`
- **Itens do pedido**: cabeçalho com status "Em separação" à direita; linhas com miniatura 58px, nome + `variante · ref`, quantidade, total; bloco de totais ao final (Subtotal R$ 419,80 · Frete · retirada no Centro: Grátis · Desconto PIX (5%): − R$ 20,99 · **Total pago R$ 398,81** em Cormorant 28px, separado por `border-top`)
- **Histórico**: linhas com coluna de tempo fixa de 104px (11.5px `#8A8375`) + título 13.5px + autor 11.5px
  - Hoje · 09:42 Pedido criado no site (Cliente · checkout PIX) · Hoje · 09:44 Pagamento confirmado (PIX · R$ 398,81) · Hoje · 10:03 Separação iniciada (Guilherme Soares) · Previsto · 16:00 Pronto para retirada no Centro (Aviso automático no WhatsApp)
- **Próximo passo** (sticky): "Marcar como pronto" (fundo escuro) · "Avisar cliente no WhatsApp" · "Imprimir etiqueta" (ambos contorno) · "Cancelar pedido" (texto `#A0533F`, sem borda)
- **Cliente**: Nome · WhatsApp · Entrega ("Retirada no Centro, Várzea Alegre - CE") · Histórico ("7 pedidos · R$ 1.984,30 no total")

### 6.4 Produtos

- Abas: Todos 312 · Ativos 284 · Sob encomenda 12 · Rascunhos 16; à direita "Filtro: {aba}"
- Tabela (`min-width: 900px`), colunas `56px 2.4fr 1fr 1fr 1.3fr 1fr 96px`: miniatura 42px · Produto (nome + `categoria · N cores`) · Referência · Preço · Estoque (colorido por severidade) · Status · "Editar"
- 8 produtos de exemplo, incluindo casos-limite: "12 un · GG esgotado" (âmbar), "0 un" (vermelho) com status "Sob encomenda", e um "Rascunho" sem estoque
- Paginação: "Mostrando 8 de 312 produtos" + botões Anterior / 1 / 2 / 3 / Próxima (`padding: 9px 15px`, página atual com fundo escuro)

### 6.5 Novo produto

- Duas colunas: formulário (2/3) + barra lateral de publicação (1/3, sticky em `top: 104px`)
- **Informações da peça**: grid `repeat(auto-fit, minmax(160px, 1fr))`; campos Nome (2 col) · Referência · Categoria · Tecido · Preço · Preço promocional · Peso (kg) · Fornecedor; textarea de Descrição ocupando 3 colunas
- **Grade de estoque**: nota "Zero em uma numeração = vira 'sob encomenda' na loja"; tabela `1.4fr repeat(4,1fr) 1fr` (`min-width: 560px`) com swatch de cor 22px + inputs P/M/G/GG + total calculado
  - Areia 4/6/2/0 = 12 · Preto 3/5/4/1 = 13 · Verde oliva 2/3/3/0 = 8
- **Fotos**: grid `repeat(auto-fill, minmax(120px, 1fr))` com 4 slots preenchidos + área de upload tracejada (`border: 1px dashed #B8AE9C`, hover escurece)
- **Publicação**: três opções selecionáveis — Ativo na vitrine ("Aparece na busca e nas categorias") · Oculto ("Só acessível por link direto") · Rascunho ("Não publicado, sem estoque reservado"); botões "Salvar produto" e "Descartar"
- **Sob encomenda**: texto explicativo, checkbox "Aceitar encomenda" (marcado: quadrado 13px preenchido de `#232320`) e select de prazo (Até 10 / 7 / 15 dias úteis)

### 6.6 Banners e avisos

- **Avisos da barra superior**: toggle geral "Faixa ativa" no cabeçalho; cada aviso é uma linha com alça de arraste (`⠿`, `cursor: grab`), input de texto (`flex: 1 1 280px`), select de período (Sempre visível / Até 31/08 / Agendar período), toggle e link "Remover" em `#A0533F`; botão tracejado "+ Novo aviso"
  - Três avisos ativos (os da faixa da loja) + "Semana do cliente · 15% off com CARIRI15" (Até 31/08, desligado)
- **Banner principal da home**: preview `aspect-ratio: 4/5` + botões Substituir/Remover; campos Chapéu · Título · Texto de apoio · Botão · Link do botão · Início · Fim; botão "Publicar banner". Nota de especificação: "recomendado 1040×1300, até 800kb". Selo "No ar desde 12 ago"
- **Banners de categoria**: grid `repeat(auto-fill, minmax(170px, 1fr))`, cards `aspect-ratio: 3/4` com nome, status ("No ar" verde / "Falta foto" vermelho) e link "Trocar imagem"; slot tracejado "+ Nova categoria"
- **Faixa da coleção**: preview escuro `aspect-ratio: 16/9` + campos Título e Texto (correspondem ao bloco "Prove em casa antes de pagar" da home)
- **Agendamentos**: cards com nome, `janela · local` e status — Semana do cliente (25 a 31 ago, Agendada) · Novidades de setembro (01 set, Rascunho) · Liquida inverno (10 a 20 jul, Encerrada); botão "+ Agendar campanha"

### 6.7 E-mail marketing

- **KPIs**: Contatos ativos 1.284 (+68 no mês) · Abertura média 41% · Cliques 9,2% · Receita por e-mail R$ 7.412,50 (26 pedidos atribuídos)
- **Campanhas**: tabela `2.2fr 1.4fr 1fr .9fr .9fr 1fr 88px` (`min-width: 940px`) — Assunto (+ pré-cabeçalho 11px) · Lista · Envio (data + status) · Abertura · Cliques · Receita · ação ("Relatório" / "Editar" / "Ver fluxo"). Métricas de campanhas não enviadas são `—`
  - 6 campanhas: Alta Estação (Enviada, 44%/11%, R$ 3.184,60) · Voltou em GG (Enviada, 62%/19%, R$ 1.739,40) · Semana do cliente (Agendada) · Novidades de setembro (Rascunho) · Últimas peças de inverno (Enviada, 38%/7%, R$ 2.488,50) · Carrinho abandonado (Ativa, contínuo, 51%/23%, R$ 1.962,80)
- **Automações** (toggle por linha): Carrinho abandonado (4h, 2 e-mails — 18 pedidos/mês, ligada) · Boas-vindas (cupom PRIMEIRACOMPRA10 — 31% de conversão, ligada) · Voltou ao estoque (lista Avise-me — 62% de abertura, ligada) · Aniversário (15% off, desligada) · Pós-compra (7 dias após entrega, desligada)
- **Listas**: Todos os contatos 1.284 · Cariri (raio de 120km) 796 · Clube Ozzi 412 · Compraram 2x ou mais 488 · Avise-me · esgotados 137
- **Modelo do e-mail**: preview centralizado de 600px com logo, imagem 1200×1500, título Cormorant 26px, corpo, botão escuro e rodapé "Centro, Várzea Alegre - CE · descadastrar"; ao lado, campos Assunto · Pré-cabeçalho · Remetente · Lista · Título · Botão · Data · Hora + textarea; ações "Agendar envio" e "Salvar rascunho"; link "Enviar teste para mim"

### 6.8 Clientes

- KPIs: Clientes cadastrados 1.284 · Compram novamente 38% · Do Cariri 62% · Clube Ozzi 412
- Tabela `2fr 1.4fr 1fr 1fr 1.2fr` (`min-width: 820px`): Cliente (nome + telefone) · Cidade · Pedidos · Gasto total · Último pedido; 8 clientes de exemplo, do Cariri a Fortaleza e Recife

### 6.9 Configurações

Quatro cartões em grid `repeat(auto-fit, minmax(min(100%,320px), 1fr))`:
- **Entrega e retirada** (nome + detalhe + preço + toggle): Retirada no Centro (Grátis, on) · Motoboy local (R$ 12,00, on) · Correios PAC (Por CEP, on) · Correios SEDEX (Por CEP, off)
- **Pagamentos**: PIX (5% off, on) · Cartão de crédito (até 6x, on) · Pagar na retirada (sem taxa, on) · Boleto (—, off)
- **Dados da loja**: Nome da loja "Ozzi Moda Feminina" · Localização "Centro, Várzea Alegre - CE" · WhatsApp · Instagram "@ozzimodafeminina" · CNPJ · E-mail "contato@ozzi.com.br"; botão "Salvar alterações"
- **Cupons ativos**: PRIMEIRACOMPRA10 (10% off, primeira compra, 128 usos) · CARIRI15 (15% off, CEPs do Cariri, até 31/08, 42 usos) · ANIVERSARIO (15% off automático, sempre ativo); botão tracejado "+ Criar cupom"

**Toggle**: pílula 34×19px, `border-radius: 99px`, `padding: 2px`; ligado `background: #232320` com o pino à direita, desligado `background: #C9C0B1` com o pino à esquerda; pino 15×15px `#F2EEE7`.

---

## 7. Interações e comportamento

### Navegação
- Loja: cada tela é uma rota (`/`, `/[categoria]`, `/produto/[slug]`, `/busca`, `/sacola`, `/checkout`, `/entrar`, `/conta/pedidos`, `/sobre`). Nos protótipos a troca é por estado e sempre faz `window.scrollTo(0,0)` — na implementação, é o comportamento padrão de navegação.
- Admin: rotas sob `/admin/*`, protegidas por papel `admin`.

### Estados de hover (todos sem transição declarada — instantâneos nos protótipos; adicionar `transition: 150ms ease` é aceitável e recomendado)
- Links de nav: `border-bottom: 1px solid transparent` → `#232320` (reservar a borda desde o início evita deslocamento)
- Botão primário: `background: #232320` → `#8A6A4F`
- Botão de contorno: fundo transparente → `background: #232320; color: #F2EEE7`
- Botão terciário (`border: 1px solid #C9C0B1`, texto `#5C574D`): borda → `#232320`, texto → `#232320`
- Card de categoria: `filter: brightness(.965)`
- Linha de tabela/lista no admin: `background: #EFE9DF`
- Área de upload tracejada: borda `#B8AE9C` → `#232320`, texto `#8A8375` → `#232320`
- Links globais: `a { color: #232320 }`, `a:hover { color: #8A6A4F }`

### Foco
`input:focus, select:focus, textarea:focus { outline: 1px solid #232320; outline-offset: -1px }`. Manter um indicador de foco visível e acessível em todos os controles interativos (os protótipos não definem foco para links e botões — **isso precisa ser corrigido na implementação**).

### Comportamento por tela
- **Produto**: selecionar cor troca a galeria (não implementado no protótipo, mas é o esperado); selecionar tamanho troca a nota de disponibilidade; tamanho esgotado permanece clicável e exibe o caminho de encomenda; acordeão com um item aberto por vez.
- **Sacola**: stepper com mínimo de 1; alterar quantidade ou frete recalcula subtotal, desconto PIX (5%) e total; frete grátis nos Correios acima de R$ 249.
- **Checkout**: CEP deve buscar endereço (ViaCEP) e recalcular frete; o desconto de 5% aparece somente com PIX selecionado; "Combinar no WhatsApp" gera o pedido como pendente e abre a conversa com o resumo.
- **Busca**: busca conforme digitação com debounce (~250ms); chips de sugestão preenchem o campo.
- **Admin, novo produto**: total por cor é calculado; zerar todas as numerações de uma peça com "Aceitar encomenda" ligado muda o status para "Sob encomenda", e desligado muda para "Esgotado" (oculto da vitrine).

### Responsividade
Os protótipos são fluidos sem media queries. Alvos de comportamento:
- Grades de produto: 4 colunas em desktop largo → 3 → 2 → 1 (o `minmax` de cada grade indica a largura mínima do card)
- Cabeçalho da loja: com pouco espaço, a nav quebra para uma segunda linha; em mobile real, usar menu hambúrguer
- Layouts de duas colunas (produto, sacola, checkout, admin): empilham quando a coluna principal fica abaixo de ~320–380px
- Sidebar do admin: colapsa para menu deslizante em telas estreitas (não desenhado — decisão do desenvolvedor)
- Tabelas do admin: mantêm `min-width` e rolam horizontalmente dentro do cartão

### Estados ausentes nos protótipos (precisam ser projetados na implementação)
Carregamento (skeletons), sacola vazia, busca sem resultado, erros de formulário e de pagamento, indisponibilidade de estoque no momento do checkout. Seguir a mesma linguagem visual: fundo `#FAF7F2`, fio `#DFD8CB`, texto de apoio `#8A8375`, erro `#A0533F`.

---

## 8. Design tokens

### Cores
| Token | Hex | Uso |
| --- | --- | --- |
| `bg` | `#F2EEE7` | Fundo geral (linho) |
| `surface` | `#FAF7F2` | Cartões, inputs, resumos |
| `surface-hover` | `#EFE9DF` | Hover de linha, opção selecionada |
| `surface-sunken` | `#E9E3D9` | Tamanho esgotado, chip em hover |
| `ink` | `#232320` | Texto principal, botão primário, faixas escuras |
| `ink-2` | `#312E28` | Item ativo da sidebar do admin |
| `text-body` | `#5C574D` | Corpo de texto |
| `text-body-2` | `#3E3B34` | Itens de filtro |
| `text-muted` | `#8A8375` | Labels, metadados |
| `text-muted-2` | `#6B665C` | Tagline, legendas de placeholder |
| `text-faint` | `#9A9385` | Contagens, eixo do gráfico |
| `line` | `#DFD8CB` | Fio de 1px (bordas de cartão) |
| `line-2` | `#E4DDD1` | Divisor interno de lista |
| `line-input` | `#C9C0B1` | Borda de input e botão terciário |
| `line-dashed` | `#B8AE9C` | Área de upload |
| `line-check` | `#A79C89` | Checkbox, texto de esgotado |
| `accent` | `#8A6A4F` | Marrom quente: hover, destaques, ênfase |
| `accent-light` | `#C4A88B` | Chapéu sobre fundo escuro, títulos do rodapé |
| `on-dark` | `#F2EEE7` | Texto sobre fundo escuro |
| `on-dark-muted` | `#B3ADA0` | Corpo sobre fundo escuro |
| `on-dark-faint` | `#8F8A7E` | Metadados sobre fundo escuro |
| `dark-line` | `#3A3730` | Divisor sobre fundo escuro |
| `dark-line-2` | `#4A463D` | Borda de legenda em placeholder escuro |
| `chart-bar` | `#C9BFAD` | Barras do gráfico |
| `success` | `#5C7A5E` | Pago, ativo, no ar |
| `warning` | `#8A6A4F` | Em separação, estoque baixo, agendado |
| `danger` | `#A0533F` | Esgotado, cancelar, aguardando pagamento |

**Swatches de produto** (dados, não tokens): Areia `#D9CDBA` · Preto `#26241F` · Verde oliva `#6E7358`

**Placeholders de imagem**
- Claro: `repeating-linear-gradient(135deg, #E7E0D4 0 9px, #DCD4C6 9px 18px)` — em contextos densos, `0 8px / 8px 16px`, ou `0 7px / 7px 14px` em miniaturas
- Escuro: `repeating-linear-gradient(135deg, #2C2A25 0 9px, #232120 9px 18px)`
- Legenda: monospace 9–11px, `background: #F2EEE7` (ou borda `#4A463D` sobre escuro), `padding: 4px 7px` a `7px 12px`, ancorada com `align-items: flex-end`

### Espaçamento
Escala usada: **1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 38, 40, 44, 48, 52, 56, 60, 64, 76, 92px**. Na prática:
- `gap` de grade de produto: `20–26px` vertical, `16–18px` horizontal
- `padding` de cartão do admin: `20px 22px` (cabeçalho), `22–24px` (corpo)
- `padding` de input: `11–14px` vertical, `12–14px` horizontal
- `padding` de botão: `13–18px` vertical, `22–34px` horizontal
- Espaço entre seções da loja: `60–80px`; base de página: `92px`
- Larguras máximas: `1340px` (loja e conteúdo do admin), `1180px` (sacola, checkout, conta), `1000px` (busca)

### Tipografia
| Papel | Fonte / peso | Tamanho | Extras |
| --- | --- | --- | --- |
| Display hero | Cormorant 300 | `clamp(46px, 5.4vw, 78px)` | `line-height: .98`, `letter-spacing: -.015em`, `text-wrap: balance` |
| H1 de página | Cormorant 300 | `clamp(34px, 4.4vw, 52px)` | — |
| H2 de seção | Cormorant 300 | 34–38px | — |
| H2 de cartão | Cormorant 400 | 20–26px | — |
| Preço grande | Cormorant 300/400 | 38px | — |
| Preço de card | Cormorant 400 | 20–21px | — |
| Valor de KPI | Cormorant 400 | 30–36px | `line-height: 1` |
| Corpo grande | Jost 400 | 15–15.5px | `line-height: 1.72`, `text-wrap: pretty` |
| Corpo | Jost 400 | 13.5–14px | `line-height: 1.65–1.7` |
| Nome de card | Jost 400 | 14–14.5px | — |
| Item de nav | Jost 400 | 12–12.5px | `letter-spacing: .12em`, uppercase |
| Botão | Jost 400 | 11–11.5px | `letter-spacing: .16em`, uppercase |
| Label | Jost 400 | 10.5–11.5px | `letter-spacing: .14–.16em`, uppercase |
| Chapéu | Jost 400 | 10.5–11px | `letter-spacing: .24–.26em`, uppercase |
| Metadado | Jost 400 | 11–12.5px | — |
| Wordmark | Jost 200 | 17–23px | `letter-spacing: .34em` + `text-indent: .34em` |
| Tagline | Jost 400 | 7.5px | `letter-spacing: .2em` |
| Legenda de placeholder | monospace | 9–11px | — |

### Raio de borda
**Zero em todo o produto** — exceto pílulas (`border-radius: 99px`) para o contador da sacola, badges da sidebar e toggles. Isso é deliberado: as arestas retas são parte da identidade. **Não introduzir `rounded-lg` em componentes de biblioteca.**

### Sombras
Nenhuma sombra decorativa. `box-shadow` é usado apenas como fio de 1px: `0 0 0 1px #DFD8CB`.

### Efeitos
- `backdrop-filter: blur(12–14px)` nos cabeçalhos sticky, com fundo em `rgba(242,238,231,.93–.94)`
- `mix-blend-mode: multiply` na logo sobre fundo claro
- `text-wrap: balance` em títulos, `text-wrap: pretty` em parágrafos
- `::selection { background: #E0D2C0 }`

---

## 9. Assets

| Arquivo | Origem | Observações |
| --- | --- | --- |
| `assets/ozzi-logo.png` | Fornecido pela cliente | Marca de lótus, preto sobre linho. **Falta**: versão branca/transparente para fundos escuros, favicon e ícone de app |
| Fotos de produto | **Não fornecidas** | Todas as imagens são placeholders. Dimensões pretendidas nas legendas: hero 1040×1300 · card de categoria 520×690 · card de produto 520×690 · galeria de produto 900×1200 · faixa escura 900×760 · Sobre 1000×1100 e 900×680 · e-mail 1200×1500 |
| Ícones | **Nenhum** | Nenhum ícone é usado, por decisão de design. As poucas marcas glíficas são caracteres de texto: `−` `+` `←` `⠿` `/` `·`. Se a implementação precisar de ícones (menu, fechar, seta), escolher um conjunto de traço fino e peso leve, coerente com a marca |

Nenhuma fonte precisa ser hospedada: Cormorant Garamond e Jost vêm do Google Fonts.

---

## 10. Modelo de dados sugerido

Derivado do que as telas exigem — não é um esquema imposto, é o mínimo para que as telas funcionem.

- **Product**: id, nome, slug, ref (`OZ-1042`), categoria, tecido, descrição, preço, precoComparativo, peso, fornecedor, status (`ativo` | `oculto` | `rascunho`), aceitaEncomenda (bool), prazoEncomendaDias (7 | 10 | 15), fotos[], criadoEm
- **Variant**: id, productId, cor (nome + hex), tamanho (P | M | G | GG), estoque (int) — o "esgotado com encomenda" da página de produto é `estoque === 0 && product.aceitaEncomenda`
- **Category**: id, nome, slug, imagemBanner, ordem
- **Customer**: id, nome, cpf, email, telefone, cidade, uf, clubeOzzi (bool), optInEmail (bool)
- **Address**: id, customerId, cep, rua, numero, bairro, cidade, uf, padrao
- **Order**: id (`#OZ-2841`), customerId, status (`aguardando_pagamento` | `pago` | `em_separacao` | `pronto` | `postado` | `entregue` | `sob_encomenda` | `cancelado`), metodoEntrega (`retirada` | `motoboy` | `pac` | `sedex`), metodoPagamento (`pix` | `cartao` | `whatsapp` | `na_retirada`), subtotal, frete, desconto, total, criadoEm
- **OrderItem**: id, orderId, variantId, nome, variante, quantidade, precoUnitario
- **OrderEvent**: id, orderId, titulo, autor, criadoEm — alimenta o Histórico
- **Coupon**: código, tipo, valor, regra (primeira compra, faixa de CEP, aniversário), validade, usos
- **Notice**: id, texto, periodo, ativo, ordem — a faixa do topo
- **Banner**: id, tipo (`home_hero` | `categoria` | `faixa_colecao`), imagem, chapeu, titulo, texto, textoBotao, linkBotao, inicio, fim, ativo
- **EmailCampaign**: id, assunto, preHeader, listaId, agendadoPara, status (`rascunho` | `agendada` | `enviada` | `ativa`), aberturas, cliques, receita
- **EmailAutomation**: id, tipo (`carrinho_abandonado` | `boas_vindas` | `volta_estoque` | `aniversario` | `pos_compra`), ativo, config
- **EmailList**: id, nome, regra, contagem (calculada)
- **StockAlert** ("Avise-me"): id, variantId, customerEmail, notificadoEm

Regras de negócio a codificar:
- Desconto PIX de 5% sobre o subtotal, aplicado somente quando o método é PIX
- Frete grátis nos Correios com subtotal ≥ R$ 249; retirada sempre grátis; motoboy R$ 12,00
- Parcelamento em até 6x sem juros no cartão
- Peça com todas as variantes zeradas e `aceitaEncomenda = false` sai da vitrine

---

## 11. Arquivos deste bundle

| Arquivo | Conteúdo |
| --- | --- |
| `Ozzi.dc.html` | Loja — 9 telas, navegáveis pelo cabeçalho |
| `Ozzi Admin.dc.html` | Painel — 9 telas, navegáveis pela sidebar |
| `assets/ozzi-logo.png` | Logo da marca |
| `README.md` | Este documento |

Os `.dc.html` abrem direto no navegador. A troca de telas é por clique nos elementos de navegação (cabeçalho na loja, sidebar no admin).

---

## 12. Prioridade de implementação sugerida

1. Fundação: stack, tokens no `tailwind.config`, fontes, layout base (cabeçalho, rodapé, faixa de avisos)
2. Catálogo: modelo Product/Variant, Home, Categoria, Produto — as telas que vendem
3. Compra: Sacola, Checkout com PIX + cartão, cálculo de frete, criação de pedido
4. Conta: Entrar, Meus pedidos
5. Admin: Pedidos + Detalhe (a cliente precisa disso no dia 1), depois Produtos + Novo produto
6. Conteúdo: Banners e avisos, Configurações
7. Marketing: E-mail marketing, automações, cupons, Clientes

O que a cliente precisa antes de ir ao ar: fotos de produto, logo em versão branca, CNPJ real, contas do gateway de pagamento e do provedor de e-mail.
