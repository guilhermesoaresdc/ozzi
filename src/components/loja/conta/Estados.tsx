import Link from 'next/link'
import { WHATSAPP } from '@/lib/supabase/config'

/**
 * Estados da conta que o protótipo não desenha (handoff §7): carregando, sem
 * pedidos, tela que ainda não existe e pedido não encontrado. Mesma linguagem
 * da casa: fundo #FAF7F2, fio #DFD8CB, apoio #8A8375, erro #A0533F.
 */

export function linkWhatsapp(mensagem: string): string {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensagem)}`
}

export function TituloConta({ children, apoio }: { children: React.ReactNode; apoio?: string }) {
  return (
    <header style={{ marginBottom: 26 }}>
      <h1
        className="font-display"
        style={{
          fontWeight: 300,
          fontSize: 'clamp(32px, 3.6vw, 42px)',
          lineHeight: 1.06,
          letterSpacing: '-.015em',
        }}
      >
        {children}
      </h1>
      {apoio ? (
        <p
          className="text-body"
          style={{ fontSize: 14, lineHeight: 1.7, maxWidth: 560, marginTop: 12, textWrap: 'pretty' }}
        >
          {apoio}
        </p>
      ) : null}
    </header>
  )
}

export function Painel({
  chapeu,
  titulo,
  texto,
  corDoFio = '#DFD8CB',
  corDoChapeu = '#8A8375',
  children,
}: {
  chapeu: string
  titulo: string
  texto: string
  corDoFio?: string
  corDoChapeu?: string
  children?: React.ReactNode
}) {
  return (
    <div
      className="flex flex-col"
      style={{ background: '#FAF7F2', border: `1px solid ${corDoFio}`, padding: '44px 28px', gap: 12 }}
    >
      <span className="uppercase" style={{ fontSize: 10.5, letterSpacing: '.14em', color: corDoChapeu }}>
        {chapeu}
      </span>
      <h2
        className="font-display"
        style={{ fontSize: 26, fontWeight: 300, lineHeight: 1.15, textWrap: 'balance' }}
      >
        {titulo}
      </h2>
      <p
        className="text-body"
        style={{ fontSize: 13.5, lineHeight: 1.7, maxWidth: 470, textWrap: 'pretty' }}
      >
        {texto}
      </p>
      {children ? <div className="flex flex-wrap" style={{ gap: 12, paddingTop: 8 }}>{children}</div> : null}
    </div>
  )
}

export function SemPedidos() {
  return (
    <Painel
      chapeu="Nenhum pedido ainda"
      titulo="Sua primeira compra ainda está por vir"
      texto="Quando você fechar um pedido, ele aparece aqui com o status, os itens e o histórico de cada etapa — do pagamento à retirada."
    >
      <Link href="/novidades" className="oz-btn oz-btn-primary">
        Ver novidades
      </Link>
      <Link href="/" className="oz-btn oz-btn-tertiary">
        Ir para a vitrine
      </Link>
    </Painel>
  )
}

export function PedidoNaoAchado() {
  return (
    <Painel
      chapeu="Pedido não encontrado"
      titulo="Não achamos esse pedido na sua conta"
      texto="Confira o código na lista de pedidos. Se a compra foi feita sem entrar na conta, ela fica ligada ao e-mail usado no checkout — a gente confere para você."
      corDoFio="#A0533F"
      corDoChapeu="#A0533F"
    >
      <Link href="/conta/pedidos" className="oz-btn oz-btn-outline">
        Meus pedidos
      </Link>
      <a
        href={linkWhatsapp('Oi! Não estou achando um pedido meu na área da conta do site. Podem verificar?')}
        target="_blank"
        rel="noopener noreferrer"
        className="oz-btn oz-btn-tertiary"
      >
        Conferir no WhatsApp
      </a>
    </Painel>
  )
}

function Bloco({ altura, largura = '100%' }: { altura: number | string; largura?: number | string }) {
  return (
    <div style={{ height: altura, width: largura, background: '#F2EEE7', boxShadow: '0 0 0 1px #DFD8CB' }} />
  )
}

/** Enquanto os pedidos chegam do banco. */
export function EsqueletoPedidos({ quantidade = 3 }: { quantidade?: number }) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Carregando seus pedidos…</span>
      <div className="flex animate-pulse flex-col" aria-hidden="true" style={{ gap: 16 }}>
        {Array.from({ length: quantidade }, (_, i) => (
          <div key={i} style={{ background: '#FAF7F2', border: '1px solid #DFD8CB' }}>
            <div
              className="flex flex-wrap justify-between"
              style={{ gap: 16, padding: '16px 20px', borderBottom: '1px solid #DFD8CB' }}
            >
              <Bloco altura={11} largura={168} />
              <Bloco altura={11} largura={92} />
            </div>
            <div className="flex flex-wrap items-center" style={{ gap: 18, padding: 20 }}>
              <div className="flex" style={{ gap: 8 }}>
                <div style={{ width: 56, aspectRatio: '3/4', background: '#F2EEE7', boxShadow: '0 0 0 1px #DFD8CB' }} />
                <div style={{ width: 56, aspectRatio: '3/4', background: '#F2EEE7', boxShadow: '0 0 0 1px #DFD8CB' }} />
              </div>
              <div className="flex flex-col" style={{ flex: '1 1 200px', gap: 8 }}>
                <Bloco altura={12} largura="62%" />
                <Bloco altura={10} largura="44%" />
              </div>
              <Bloco altura={22} largura={104} />
              <Bloco altura={40} largura={128} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Esqueleto genérico para os formulários da conta. */
export function EsqueletoBloco({ altura = 320 }: { altura?: number }) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Carregando…</span>
      <div
        className="animate-pulse"
        aria-hidden="true"
        style={{ height: altura, background: '#FAF7F2', border: '1px solid #DFD8CB' }}
      />
    </div>
  )
}
