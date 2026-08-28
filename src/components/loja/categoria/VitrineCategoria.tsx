'use client'

import { useMemo, useState } from 'react'
import { ProductCard } from '@/components/loja/ProductCard'
import { EstadoVazio } from './EstadoVazio'
import { FiltrosSidebar } from './FiltrosSidebar'
import {
  SELECAO_VAZIA,
  aplicarFiltros,
  totalSelecionado,
  type ChaveFiltro,
  type GrupoFiltro,
  type ProdutoNaGrade,
  type Selecao,
} from './facetas'

/** Peças por página: a categoria que cabe numa página não mostra o botão. */
const PAGINA = 12

export function VitrineCategoria({
  itens,
  filtros,
  parcelas,
}: {
  itens: ProdutoNaGrade[]
  filtros: GrupoFiltro[]
  parcelas: number
}) {
  const [selecao, setSelecao] = useState<Selecao>(SELECAO_VAZIA)
  const [visiveis, setVisiveis] = useState(PAGINA)

  const filtrados = useMemo(() => aplicarFiltros(itens, selecao), [itens, selecao])
  const mostrados = filtrados.slice(0, visiveis)
  const restantes = filtrados.length - mostrados.length
  const temFiltro = totalSelecionado(selecao) > 0

  function alternar(chave: ChaveFiltro, valor: string) {
    setVisiveis(PAGINA)
    setSelecao((atual) => {
      const escolhidos = atual[chave]
      return {
        ...atual,
        [chave]: escolhidos.includes(valor)
          ? escolhidos.filter((v) => v !== valor)
          : [...escolhidos, valor],
      }
    })
  }

  function limpar() {
    setSelecao(SELECAO_VAZIA)
    setVisiveis(PAGINA)
  }

  return (
    <div className="grid items-start gap-10 md:grid-cols-[250px_minmax(0,1fr)]">
      <FiltrosSidebar filtros={filtros} selecao={selecao} aoAlternar={alternar} aoLimpar={limpar} />

      <div className="min-w-0">
        {temFiltro && (
          <p className="oz-label" style={{ marginBottom: 18 }} role="status">
            {filtrados.length === 0
              ? 'Nenhuma peça'
              : `${filtrados.length} ${filtrados.length === 1 ? 'peça' : 'peças'} com esses filtros`}
          </p>
        )}

        {filtrados.length === 0 ? (
          <EstadoVazio
            chapeu="Sem resultado"
            titulo="Nenhuma peça com esses filtros"
            texto="Solte uma das opções escolhidas: a mesma peça costuma aparecer em outra cor ou numeração. Se preferir, a gente também costura sob encomenda em até 10 dias úteis."
          >
            <button type="button" className="oz-btn oz-btn-outline" onClick={limpar}>
              Limpar filtros
            </button>
          </EstadoVazio>
        ) : (
          <>
            <div
              className="grid"
              style={{
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '26px 18px',
              }}
            >
              {mostrados.map((item) => (
                <ProductCard
                  key={item.produto.id}
                  produto={item.produto}
                  parcelas={parcelas}
                  sizes="(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 260px"
                />
              ))}
            </div>

            {restantes > 0 && (
              <div className="flex justify-center" style={{ marginTop: 48 }}>
                <button
                  type="button"
                  className="oz-btn oz-btn-outline"
                  style={{ padding: '15px 38px' }}
                  onClick={() => setVisiveis((v) => v + PAGINA)}
                >
                  Carregar mais {Math.min(PAGINA, restantes)}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
