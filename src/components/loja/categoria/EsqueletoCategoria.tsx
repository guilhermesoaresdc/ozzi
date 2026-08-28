import { CabecalhoCategoria } from './CabecalhoCategoria'
import { ProvaEmCasa } from './ProvaEmCasa'

const GRUPOS = [4, 4, 3]
const CARDS = 8

function Barra({ largura, altura = 11 }: { largura: number | string; altura?: number }) {
  return (
    <span
      aria-hidden
      className="block bg-surface-sunken"
      style={{ width: largura, height: altura, maxWidth: '100%' }}
    />
  )
}

/** Estado de carregando (handoff §7) na mesma caixa da grade real. */
export function EsqueletoCategoria({ nome }: { nome: string }) {
  return (
    <>
      <CabecalhoCategoria nome={nome} carregando />

      <div className="grid animate-pulse items-start gap-10 md:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-7" style={{ maxWidth: 250 }} aria-hidden>
          {GRUPOS.map((linhas, i) => (
            <div key={i}>
              <div className="border-b border-line" style={{ paddingBottom: 10, marginBottom: 13 }}>
                <Barra largura={78} altura={9} />
              </div>
              <div className="flex flex-col gap-[10px]">
                {Array.from({ length: linhas }).map((_, l) => (
                  <div key={l} className="flex items-center gap-[10px]">
                    <span
                      className="block shrink-0"
                      style={{ width: 12, height: 12, border: '1px solid #A79C89' }}
                    />
                    <Barra largura={`${52 + ((l * 13) % 34)}%`} altura={10} />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <ProvaEmCasa />
        </aside>

        <div className="min-w-0">
          <div
            className="grid"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '26px 18px' }}
            aria-hidden
          >
            {Array.from({ length: CARDS }).map((_, i) => (
              <div key={i} className="flex flex-col gap-[5px]">
                <span className="block bg-surface-sunken" style={{ aspectRatio: '3/4' }} />
                <span className="block" style={{ height: 8 }} />
                <Barra largura="62%" altura={11} />
                <Barra largura="34%" altura={10} />
                <Barra largura="46%" altura={13} />
              </div>
            ))}
          </div>
          <p role="status" className="sr-only">
            Carregando as peças de {nome}
          </p>
        </div>
      </div>
    </>
  )
}
