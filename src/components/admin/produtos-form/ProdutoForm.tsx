'use client'

import { useActionState, useState } from 'react'
import { salvarProduto, type EstadoProduto } from '@/app/admin/produtos/form-actions'
import type { CategoryRow, ProductRow, ProductStatus, VariantRow } from '@/lib/database.types'
import { brlPlain } from '@/lib/format'
import { AreaTexto, Campo, Selecao } from './Campos'
import { Fotos } from './Fotos'
import { TabelaMedidas, type LinhaMedida } from './TabelaMedidas'
import { GradeEstoque } from './GradeEstoque'
import { Publicacao } from './Publicacao'
import { SobEncomenda } from './SobEncomenda'
import {
  fotosDoProduto,
  gradeInicial,
  linhasParaEnvio,
  paraSlug,
  textoNumero,
  type LinhaGrade,
  type Numeracao,
} from './dados'

const INICIAL: EstadoProduto = {}

export type CategoriaOpcao = Pick<CategoryRow, 'id' | 'nome'>

export function ProdutoForm({
  categorias,
  produto,
  variantes = [],
}: {
  categorias: CategoriaOpcao[]
  produto?: ProductRow
  variantes?: VariantRow[]
}) {
  const [estado, acao, salvando] = useActionState(salvarProduto, INICIAL)

  const [campos, setCampos] = useState(() => ({
    nome: produto?.nome ?? '',
    slug: produto?.slug ?? '',
    ref: produto?.ref ?? '',
    categoria: produto?.category_id ?? '',
    tecido: produto?.tecido ?? '',
    preco: produto ? brlPlain(produto.preco) : '',
    promocional: produto?.preco_comparativo != null ? brlPlain(produto.preco_comparativo) : '',
    custo: produto?.preco_custo != null ? brlPlain(produto.preco_custo) : '',
    peso: textoNumero(produto?.peso, 3),
    fornecedor: produto?.fornecedor ?? '',
    descricao: produto?.descricao ?? '',
    medidas: produto?.medidas ?? '',
  }))
  // O slug segue o nome até a pessoa escrever o dela.
  const [slugManual, setSlugManual] = useState(Boolean(produto))
  const [status, setStatus] = useState<ProductStatus>(produto?.status ?? 'rascunho')
  const [aceita, setAceita] = useState(produto?.aceita_encomenda ?? true)
  const [prazo, setPrazo] = useState(produto?.prazo_encomenda_dias ?? 10)
  const [fotos, setFotos] = useState<string[]>(() => fotosDoProduto(produto?.fotos))
  const [videos, setVideos] = useState<string[]>(() => fotosDoProduto(produto?.videos))
  const [medidas, setMedidas] = useState<LinhaMedida[]>(() => medidasIniciais(produto?.medidas_tabela))
  const [grade, setGrade] = useState(() => gradeInicial(variantes))

  const editar = (chave: keyof typeof campos) => (valor: string) =>
    setCampos((atual) => ({ ...atual, [chave]: valor }))

  const setLinhas = (linhas: LinhaGrade[]) => setGrade((g) => ({ ...g, linhas }))
  const setNumeracao = (numeracao: Numeracao) => setGrade((g) => ({ ...g, numeracao }))

  return (
    <form action={acao}>
      <input type="hidden" name="id" value={produto?.id ?? ''} />
      <input type="hidden" name="fotos" value={JSON.stringify(fotos)} />
      <input type="hidden" name="videos" value={JSON.stringify(videos)} />
      <input type="hidden" name="medidas_tabela" value={JSON.stringify(medidasParaEnvio(medidas))} />
      <input type="hidden" name="grade" value={JSON.stringify(linhasParaEnvio(grade.linhas, grade.numeracao))} />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))',
          gap: 22,
          alignItems: 'start',
        }}
      >
        <div className="flex min-w-0 flex-col gap-[22px]" style={{ gridColumn: 'span 2' }}>
          <section className="oz-card" style={{ padding: 24 }}>
            <h2 className="font-display" style={{ fontSize: 22, fontWeight: 400, marginBottom: 20 }}>
              Informações da peça
            </h2>

            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))' }}>
              <Campo
                label="Nome da peça"
                span={2}
                name="nome"
                required
                maxLength={120}
                placeholder="Vestido Serrote"
                value={campos.nome}
                onChange={(e) => {
                  const nome = e.target.value
                  setCampos((atual) => ({ ...atual, nome, slug: slugManual ? atual.slug : paraSlug(nome) }))
                }}
              />
              <Campo
                label="Referência"
                name="ref"
                required
                maxLength={24}
                placeholder="OZ-1042"
                value={campos.ref}
                onChange={(e) => editar('ref')(e.target.value)}
              />
              <Selecao
                label="Categoria"
                name="categoria"
                value={campos.categoria}
                onChange={(e) => editar('categoria')(e.target.value)}
              >
                <option value="">Sem categoria</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </Selecao>
              <Campo
                label="Tecido"
                name="tecido"
                maxLength={80}
                placeholder="Linho misto"
                value={campos.tecido}
                onChange={(e) => editar('tecido')(e.target.value)}
              />
              <Campo
                label="Preço"
                name="preco"
                required
                inputMode="decimal"
                placeholder="289,90"
                value={campos.preco}
                onChange={(e) => editar('preco')(e.target.value)}
              />
              <Campo
                label="Preço promocional"
                name="preco_comparativo"
                inputMode="decimal"
                placeholder="opcional"
                dica="Valor riscado ao lado do preço quando for maior que ele"
                value={campos.promocional}
                onChange={(e) => editar('promocional')(e.target.value)}
              />
              <Campo
                label="Preço de custo"
                name="preco_custo"
                inputMode="decimal"
                placeholder="opcional"
                dica={dicaMargem(campos.custo, campos.preco)}
                value={campos.custo}
                onChange={(e) => editar('custo')(e.target.value)}
              />
              <Campo
                label="Peso (kg)"
                name="peso"
                inputMode="decimal"
                placeholder="0,42"
                dica="Usado no cálculo do frete dos Correios"
                value={campos.peso}
                onChange={(e) => editar('peso')(e.target.value)}
              />
              <Campo
                label="Fornecedor"
                name="fornecedor"
                maxLength={80}
                placeholder="Ateliê Cariri"
                value={campos.fornecedor}
                onChange={(e) => editar('fornecedor')(e.target.value)}
              />
              <Campo
                label="Endereço na loja"
                span={2}
                name="slug"
                required
                maxLength={120}
                placeholder="vestido-serrote"
                dica={`A peça abre em /produto/${campos.slug || 'vestido-serrote'}`}
                value={campos.slug}
                onChange={(e) => {
                  setSlugManual(true)
                  editar('slug')(e.target.value)
                }}
                onBlur={(e) => editar('slug')(paraSlug(e.target.value))}
              />
              <AreaTexto
                label="Descrição"
                span={3}
                rows={4}
                name="descricao"
                maxLength={2000}
                placeholder="Vestido midi em linho misto com decote quadrado, mangas curtas e fenda discreta na barra."
                value={campos.descricao}
                onChange={(e) => editar('descricao')(e.target.value)}
              />
              <AreaTexto
                label="Medidas"
                span={3}
                rows={2}
                name="medidas"
                maxLength={600}
                dica="Aparece no acordeão “Medidas e numeração” da página da peça"
                placeholder="P (36/38) · M (40/42) · G (44/46) · GG (48/50). Comprimento 118cm no tamanho M."
                value={campos.medidas}
                onChange={(e) => editar('medidas')(e.target.value)}
              />
            </div>
          </section>

          <GradeEstoque
            linhas={grade.linhas}
            numeracao={grade.numeracao}
            aceitaEncomenda={aceita}
            onLinhas={setLinhas}
            onNumeracao={setNumeracao}
          />

          <TabelaMedidas linhas={medidas} onLinhas={setMedidas} />

          <Fotos
            fotos={fotos}
            onFotos={setFotos}
            videos={videos}
            onVideos={setVideos}
            pasta={campos.ref.trim() || produto?.ref || 'sem-referencia'}
          />
        </div>

        <div className="flex flex-col gap-[22px]" style={{ position: 'sticky', top: 104 }}>
          <Publicacao status={status} onStatus={setStatus} salvando={salvando} erro={estado.erro} />
          <SobEncomenda aceita={aceita} onAceita={setAceita} prazo={prazo} onPrazo={setPrazo} />
        </div>
      </div>
    </form>
  )
}

/** Lê medidas_tabela do banco para o formato do formulário. */
function medidasIniciais(bruto: unknown): LinhaMedida[] {
  if (!Array.isArray(bruto)) return []
  return bruto
    .filter((l): l is Record<string, unknown> => typeof l === 'object' && l !== null)
    .map((l) => ({
      tamanho: String(l.tamanho ?? ''),
      busto: l.busto == null ? '' : String(l.busto),
      cintura: l.cintura == null ? '' : String(l.cintura),
      quadril: l.quadril == null ? '' : String(l.quadril),
      comprimento: l.comprimento == null ? '' : String(l.comprimento),
    }))
}

/** Descarta linha sem numeração e campo vazio, para não gravar lixo. */
function medidasParaEnvio(linhas: LinhaMedida[]) {
  return linhas
    .filter((l) => l.tamanho.trim() !== '')
    .map((l) => {
      const linha: Record<string, string> = { tamanho: l.tamanho.trim() }
      for (const chave of ['busto', 'cintura', 'quadril', 'comprimento'] as const) {
        const valor = l[chave].trim()
        if (valor) linha[chave] = valor
      }
      return linha
    })
}

/** Margem em reais e em percentual, calculada enquanto a pessoa digita. */
function dicaMargem(custo: string, venda: string): string {
  const n = (v: string) => {
    const limpo = v.replace(/\./g, '').replace(',', '.').trim()
    const x = Number(limpo)
    return limpo !== '' && Number.isFinite(x) ? x : null
  }
  const c = n(custo)
  const v = n(venda)
  if (c === null || c <= 0) return 'Quanto a peça custou na compra. Não aparece na loja.'
  if (v === null || v <= 0) return 'Preencha o preço para ver a margem.'
  const lucro = v - c
  const pct = Math.round((lucro / c) * 100)
  if (lucro < 0) return `Prejuízo de R$ ${Math.abs(lucro).toFixed(2).replace('.', ',')} por peça.`
  return `Margem de R$ ${lucro.toFixed(2).replace('.', ',')} por peça · ${pct}% sobre o custo.`
}
