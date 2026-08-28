'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Campo } from '@/components/loja/checkout/Campo'
import { AvisoErro, EsqueletoCheckout, SacolaVazia } from '@/components/loja/checkout/EstadosCheckout'
import { OpcoesEntrega } from '@/components/loja/checkout/OpcoesEntrega'
import { OpcoesPagamento } from '@/components/loja/checkout/OpcoesPagamento'
import { ResumoPedido } from '@/components/loja/checkout/ResumoPedido'
import {
  DADOS_VAZIOS,
  ORDEM_CAMPOS,
  precisaEndereco,
  separarLogradouro,
  validarEntrega,
  type DadosEntrega,
  type ErrosEntrega,
} from '@/components/loja/checkout/validacao'
import { useCart } from '@/lib/cart'
import type {
  DeliveryMethod,
  Json,
  PaymentMethod,
  PaymentOptionRow,
  ShippingMethodRow,
} from '@/lib/database.types'
import { brl, mascaraCep, mascaraCpf, mascaraTelefone, soDigitos } from '@/lib/format'
import { calcularTotais } from '@/lib/pricing'
import { createClient } from '@/lib/supabase/client'

const ERRO_GENERICO = 'Não foi possível fechar o pedido agora. Tente de novo em instantes.'
const PADRAO_ESTOQUE = /sem estoque|não está mais disponível|nao esta mais disponivel/i

interface RespostaCep {
  cep?: string
  rua?: string
  bairro?: string
  cidade?: string
  uf?: string
  erro?: string
}

/** Só o que a tela de confirmação precisa saber do retorno da RPC. */
function lerCodigo(valor: unknown): string | null {
  if (!valor || typeof valor !== 'object' || Array.isArray(valor)) return null
  const codigo = (valor as Record<string, unknown>).codigo
  return typeof codigo === 'string' && codigo.trim() ? codigo.trim() : null
}

/**
 * Checkout (handoff §5.6). Todo o estado da tela mora aqui: os dados de
 * entrega, a forma de entrega, a de pagamento e a chamada da RPC.
 */
export function PainelCheckout({
  metodosEntrega,
  opcoesPagamento,
  entregaInicial,
  freteGratisAcima,
  taxaPix,
  parcelasMax,
  whatsapp,
}: {
  metodosEntrega: ShippingMethodRow[]
  opcoesPagamento: PaymentOptionRow[]
  entregaInicial: DeliveryMethod
  freteGratisAcima: number
  taxaPix: number
  parcelasMax: number
  whatsapp: string
}) {
  const router = useRouter()
  const { itens, carregado, subtotal, limpar } = useCart()

  const [dados, setDados] = useState<DadosEntrega>(DADOS_VAZIOS)
  const [erros, setErros] = useState<ErrosEntrega>({})
  const [metodoEntrega, setMetodoEntrega] = useState<DeliveryMethod>(entregaInicial)
  const [metodoPagamento, setMetodoPagamento] = useState<PaymentMethod>(
    opcoesPagamento[0]?.chave ?? 'pix',
  )
  const [buscandoCep, setBuscandoCep] = useState(false)
  const [avisoCep, setAvisoCep] = useState('')
  const [erroGeral, setErroGeral] = useState('')
  const [enviando, setEnviando] = useState(false)

  const finalizado = useRef(false)
  const ultimoCep = useRef('')
  const requisicaoCep = useRef<AbortController | null>(null)

  // Sem sacola não há checkout (handoff §7)
  useEffect(() => {
    if (carregado && itens.length === 0 && !finalizado.current) router.replace('/sacola')
  }, [carregado, itens.length, router])

  useEffect(() => () => requisicaoCep.current?.abort(), [])

  const precos = useMemo(() => {
    const mapa: Partial<Record<DeliveryMethod, number>> = {}
    for (const metodo of metodosEntrega) mapa[metodo.chave] = Number(metodo.preco)
    return mapa
  }, [metodosEntrega])

  const totais = useMemo(
    () =>
      calcularTotais({
        subtotal,
        metodoEntrega,
        metodoPagamento,
        precosFrete: precos,
        freteGratisAcima,
        taxaPix,
        parcelas: parcelasMax,
      }),
    [subtotal, metodoEntrega, metodoPagamento, precos, freteGratisAcima, taxaPix, parcelasMax],
  )

  const rotuloEntrega =
    metodosEntrega.find((m) => m.chave === metodoEntrega)?.nome ?? 'Retirada no Centro'
  const comEndereco = precisaEndereco(metodoEntrega)

  const hrefWhatsapp = useMemo(() => {
    const linhas = itens.map((i) => `• ${i.nome} · ${i.cor} · ${i.tamanho} · ${i.quantidade} un`)
    const texto = [
      'Oi! Quero fechar um pedido pelo site da Ozzi:',
      ...linhas,
      `Entrega: ${rotuloEntrega}`,
      `Total: ${brl(totais.total)}`,
    ].join('\n')
    return `https://wa.me/${whatsapp}?text=${encodeURIComponent(texto)}`
  }, [itens, rotuloEntrega, totais.total, whatsapp])

  const alterar = useCallback((campo: keyof DadosEntrega, valor: string) => {
    setDados((atual) => ({ ...atual, [campo]: valor }))
    setErros((atual) => (atual[campo] ? { ...atual, [campo]: undefined } : atual))
  }, [])

  const buscarCep = useCallback(async (bruto: string) => {
    const digitos = soDigitos(bruto)
    if (digitos.length !== 8 || ultimoCep.current === digitos) return
    ultimoCep.current = digitos

    requisicaoCep.current?.abort()
    const controle = new AbortController()
    requisicaoCep.current = controle
    setBuscandoCep(true)
    setAvisoCep('')
    setErros((atual) => ({ ...atual, cep: undefined }))

    try {
      const resposta = await fetch(`/api/cep?cep=${digitos}`, { signal: controle.signal })
      const corpo = (await resposta.json()) as RespostaCep

      if (!resposta.ok || corpo.erro) {
        ultimoCep.current = ''
        setErros((atual) => ({ ...atual, cep: corpo.erro || 'CEP não encontrado' }))
        return
      }

      setDados((atual) => {
        // Preserva o número que o visitante já tinha digitado na rua
        const { numero } = separarLogradouro(atual.endereco)
        const rua = corpo.rua
          ? numero
            ? `${corpo.rua}, ${numero}`
            : corpo.rua
          : atual.endereco
        return {
          ...atual,
          cep: corpo.cep ?? mascaraCep(digitos),
          endereco: rua,
          bairro: corpo.bairro || atual.bairro,
          cidade: corpo.cidade || atual.cidade,
          uf: corpo.uf || atual.uf,
        }
      })
      setErros((atual) => ({ ...atual, endereco: undefined, bairro: undefined, cidade: undefined, uf: undefined }))
      setAvisoCep('Endereço preenchido pelo CEP. Confira o número.')
    } catch (erro) {
      if (erro instanceof DOMException && erro.name === 'AbortError') return
      ultimoCep.current = ''
      setErros((atual) => ({ ...atual, cep: 'Não foi possível consultar o CEP agora' }))
    } finally {
      if (!controle.signal.aborted) setBuscandoCep(false)
    }
  }, [])

  function alterarCep(valor: string) {
    const mascarado = mascaraCep(valor)
    alterar('cep', mascarado)
    setAvisoCep('')
    if (soDigitos(mascarado).length === 8) void buscarCep(mascarado)
  }

  async function confirmar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (enviando || itens.length === 0) return

    const encontrados = validarEntrega(dados, comEndereco)
    setErros(encontrados)
    const primeiro = ORDEM_CAMPOS.find((campo) => encontrados[campo])
    if (primeiro) {
      setErroGeral('')
      document.getElementById(primeiro)?.focus()
      return
    }

    setEnviando(true)
    setErroGeral('')

    const itensRpc: Json = itens.map((item) => ({
      variant_id: item.variantId,
      quantidade: item.quantidade,
    }))

    const { rua, numero } = separarLogradouro(dados.endereco)
    const endereco: Json | null = comEndereco
      ? {
          cep: dados.cep,
          rua,
          numero,
          complemento: null,
          bairro: dados.bairro.trim(),
          cidade: dados.cidade.trim(),
          uf: dados.uf.trim().toUpperCase(),
        }
      : null

    try {
      const supabase = createClient()
      const { data, error } = await supabase.rpc('criar_pedido', {
        p_itens: itensRpc,
        p_nome: dados.nome.trim(),
        p_email: dados.email.trim(),
        p_telefone: dados.celular.trim(),
        p_cpf: dados.cpf.trim(),
        p_metodo_entrega: metodoEntrega,
        p_metodo_pagamento: metodoPagamento,
        p_endereco: endereco,
        p_observacao: null,
      })

      if (error) {
        setErroGeral(error.message?.trim() || ERRO_GENERICO)
        setEnviando(false)
        return
      }

      const codigo = lerCodigo(data)
      if (!codigo) {
        setErroGeral(ERRO_GENERICO)
        setEnviando(false)
        return
      }

      finalizado.current = true
      limpar()
      const busca = new URLSearchParams({ codigo, email: dados.email.trim() })
      router.push(`/checkout/confirmacao?${busca.toString()}`)
    } catch {
      setErroGeral(ERRO_GENERICO)
      setEnviando(false)
    }
  }

  useEffect(() => {
    if (erroGeral) document.getElementById('erro-checkout')?.focus()
  }, [erroGeral])

  if (!carregado) return <EsqueletoCheckout />
  if (itens.length === 0) return <SacolaVazia />

  return (
    <form onSubmit={confirmar} noValidate>
      <div className="grid lg:grid-cols-3" style={{ gap: 44 }}>
        <div className="min-w-0 lg:col-span-2">
          {erroGeral && (
            <AvisoErro mensagem={erroGeral} mostrarAjusteDaSacola={PADRAO_ESTOQUE.test(erroGeral)} />
          )}

          <h2 className="font-display" style={{ fontSize: 28, fontWeight: 300, marginBottom: 20 }}>
            Entrega
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4" style={{ gap: 14 }}>
            <Campo
              id="nome"
              rotulo="Nome completo"
              valor={dados.nome}
              aoMudar={(v) => alterar('nome', v)}
              erro={erros.nome}
              autoComplete="name"
              maxLength={90}
              className="col-span-full sm:col-span-2"
            />
            <Campo
              id="cpf"
              rotulo="CPF"
              valor={dados.cpf}
              aoMudar={(v) => alterar('cpf', mascaraCpf(v))}
              erro={erros.cpf}
              inputMode="numeric"
              placeholder="000.000.000-00"
              maxLength={14}
            />
            <Campo
              id="celular"
              rotulo="Celular / WhatsApp"
              valor={dados.celular}
              aoMudar={(v) => alterar('celular', mascaraTelefone(v))}
              erro={erros.celular}
              tipo="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="(88) 99999-0000"
              maxLength={15}
            />
            <Campo
              id="cep"
              rotulo="CEP"
              valor={dados.cep}
              aoMudar={alterarCep}
              aoSair={() => void buscarCep(dados.cep)}
              erro={erros.cep}
              dica={buscandoCep ? 'Buscando endereço…' : undefined}
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder="63540-000"
              maxLength={9}
            />
            <Campo
              id="endereco"
              rotulo="Endereço"
              valor={dados.endereco}
              aoMudar={(v) => alterar('endereco', v)}
              erro={erros.endereco}
              dica="Rua e número. Ex.: Rua Antônio Luís, 240"
              autoComplete="street-address"
              maxLength={120}
              className="col-span-full sm:col-span-2"
            />
            <Campo
              id="bairro"
              rotulo="Bairro"
              valor={dados.bairro}
              aoMudar={(v) => alterar('bairro', v)}
              erro={erros.bairro}
              maxLength={60}
            />
            <Campo
              id="cidade"
              rotulo="Cidade"
              valor={dados.cidade}
              aoMudar={(v) => alterar('cidade', v)}
              erro={erros.cidade}
              autoComplete="address-level2"
              maxLength={60}
            />
            <Campo
              id="uf"
              rotulo="Estado"
              valor={dados.uf}
              aoMudar={(v) => alterar('uf', v.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2))}
              erro={erros.uf}
              autoComplete="address-level1"
              placeholder="CE"
              maxLength={2}
            />
            <Campo
              id="email"
              rotulo="E-mail"
              valor={dados.email}
              aoMudar={(v) => alterar('email', v)}
              erro={erros.email}
              dica="Enviamos a confirmação e o acompanhamento para este e-mail."
              tipo="email"
              inputMode="email"
              autoComplete="email"
              maxLength={120}
              className="col-span-full sm:col-span-2"
            />
          </div>

          <p role="status" aria-live="polite" className="sr-only">
            {buscandoCep ? 'Buscando o endereço do CEP.' : avisoCep}
          </p>
          {avisoCep && !buscandoCep && (
            <p aria-hidden style={{ fontSize: 11.5, color: '#8A8375', marginTop: 12 }}>
              {avisoCep}
            </p>
          )}

          <div style={{ marginTop: 34 }}>
            <OpcoesEntrega
              metodos={metodosEntrega}
              valor={metodoEntrega}
              aoMudar={setMetodoEntrega}
              subtotal={subtotal}
              precos={precos}
              freteGratisAcima={freteGratisAcima}
            />
          </div>

          <h2 className="font-display" style={{ fontSize: 28, fontWeight: 300, margin: '44px 0 20px' }}>
            Pagamento
          </h2>
          <OpcoesPagamento
            opcoes={opcoesPagamento}
            valor={metodoPagamento}
            aoMudar={setMetodoPagamento}
          />
        </div>

        <ResumoPedido
          itens={itens}
          totais={totais}
          metodoPagamento={metodoPagamento}
          rotuloEntrega={rotuloEntrega}
          taxaPix={taxaPix}
          enviando={enviando}
          hrefWhatsapp={hrefWhatsapp}
        />
      </div>
    </form>
  )
}
