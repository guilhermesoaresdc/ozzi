'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ProdutoResumo } from '@/lib/queries'
import { CampoBusca } from '@/components/loja/busca/CampoBusca'
import { ChipsSugestoes } from '@/components/loja/busca/ChipsSugestoes'
import { ResultadosBusca } from '@/components/loja/busca/ResultadosBusca'
import { EsqueletoResultados, ErroDeBusca, SemResultado } from '@/components/loja/busca/EstadosBusca'

/** Espera antes de bater na API — handoff §7 pede ~250ms. */
const ESPERA = 250

type Estado = 'inicial' | 'carregando' | 'pronto' | 'erro'

interface RespostaBusca {
  termo: string
  total: number
  produtos: ProdutoResumo[]
}

function contar(total: number): string {
  if (total === 0) return 'Nenhuma peça'
  return total === 1 ? '1 peça' : `${total} peças`
}

/** Reflete o termo na URL sem recarregar a página (nem empilhar histórico). */
function sincronizarUrl(termo: string) {
  const url = termo ? `${window.location.pathname}?q=${encodeURIComponent(termo)}` : window.location.pathname
  window.history.replaceState(null, '', url)
}

export function PainelBusca({
  termoInicial,
  resultadosIniciais,
}: {
  termoInicial: string
  /**
   * Resultado renderizado no servidor quando a página chega com `?q=`.
   * `null` quando a consulta do servidor falhou — o cliente refaz a busca.
   */
  resultadosIniciais: ProdutoResumo[] | null
}) {
  const [termo, setTermo] = useState(termoInicial)
  const [consulta, setConsulta] = useState(termoInicial)
  const [resultados, setResultados] = useState<ProdutoResumo[]>(resultadosIniciais ?? [])
  const [estado, setEstado] = useState<Estado>(
    !termoInicial ? 'inicial' : resultadosIniciais ? 'pronto' : 'carregando',
  )

  const campoRef = useRef<HTMLInputElement>(null)
  const requisicao = useRef<AbortController | null>(null)
  // Termo já exibido e termo em voo: evitam refazer a busca que acabou de sair.
  const exibido = useRef(resultadosIniciais ? termoInicial : '')
  const emVoo = useRef('')

  const alvo = termo.trim()

  const buscar = useCallback(async (procurado: string) => {
    requisicao.current?.abort()
    const controle = new AbortController()
    requisicao.current = controle
    emVoo.current = procurado
    setEstado('carregando')

    try {
      const resposta = await fetch(`/api/busca?q=${encodeURIComponent(procurado)}`, {
        signal: controle.signal,
      })
      if (!resposta.ok) throw new Error('busca indisponível')
      const dados = (await resposta.json()) as RespostaBusca

      exibido.current = procurado
      setResultados(dados.produtos ?? [])
      setConsulta(procurado)
      setEstado('pronto')
    } catch {
      if (controle.signal.aborted) return
      setConsulta(procurado)
      setEstado('erro')
    }
  }, [])

  useEffect(() => {
    // Campo vazio: volta ao estado inicial, só com os chips.
    if (!alvo) {
      requisicao.current?.abort()
      exibido.current = ''
      emVoo.current = ''
      setResultados([])
      setConsulta('')
      setEstado('inicial')
      sincronizarUrl('')
      return
    }

    const disparar = setTimeout(() => {
      if (alvo === exibido.current || alvo === emVoo.current) return
      sincronizarUrl(alvo)
      buscar(alvo)
    }, ESPERA)

    return () => clearTimeout(disparar)
  }, [alvo, buscar])

  // Aborta o que estiver em voo ao sair da tela.
  useEffect(() => {
    const pendente = requisicao
    return () => pendente.current?.abort()
  }, [])

  function enviar() {
    if (!alvo || alvo === exibido.current || alvo === emVoo.current) return
    sincronizarUrl(alvo)
    buscar(alvo)
  }

  function escolherChip(sugestao: string) {
    setTermo(sugestao)
    campoRef.current?.focus()
  }

  const contagem =
    estado === 'carregando' ? 'Buscando…' : estado === 'pronto' ? contar(resultados.length) : ''

  return (
    <>
      <CampoBusca
        termo={termo}
        contagem={contagem}
        ocupado={estado === 'carregando'}
        campoRef={campoRef}
        aoMudar={setTermo}
        aoEnviar={enviar}
      />

      <ChipsSugestoes ativo={estado === 'inicial' ? '' : alvo} aoEscolher={escolherChip} />

      {estado === 'carregando' && <EsqueletoResultados />}
      {estado === 'erro' && <ErroDeBusca termo={consulta} aoTentar={() => buscar(consulta || alvo)} />}
      {estado === 'pronto' &&
        (resultados.length > 0 ? (
          <ResultadosBusca termo={consulta} produtos={resultados} />
        ) : (
          <SemResultado termo={consulta} />
        ))}
    </>
  )
}
