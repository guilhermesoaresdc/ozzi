import Link from 'next/link'
import { Card } from '@/components/admin/Card'
import type { BannerRow, NoticeRow } from '@/lib/database.types'
import { BOTAO } from './Pecas'
import { janela, janelaDoAviso, normalizarPeriodo, situacao, type Situacao } from './periodo'

interface Agendamento extends Situacao {
  chave: string
  nome: string
  janela: string
  local: string
}

const LOCAL: Record<BannerRow['tipo'], string> = {
  home_hero: 'Home · banner principal',
  categoria: 'Vitrine de categoria',
  faixa_colecao: 'Home · faixa da coleção',
}

const SEM_NOME: Record<BannerRow['tipo'], string> = {
  home_hero: 'Banner principal da home',
  categoria: 'Banner de categoria',
  faixa_colecao: 'Faixa da coleção',
}

/** O título do hero guarda as linhas separadas por "|" — no card cabe só a primeira. */
function nomeDoBanner(banner: BannerRow): string {
  const chapeu = banner.chapeu?.trim()
  if (chapeu) return chapeu
  const primeira = banner.titulo?.split('|')[0]?.trim()
  return primeira || SEM_NOME[banner.tipo]
}

/**
 * Cartões montados do que já tem data marcada: banners com início ou fim e
 * avisos da faixa com período. Sem isso, não há o que listar — e a tela diz isso.
 */
function montar(banners: BannerRow[], avisos: NoticeRow[]): Agendamento[] {
  const deBanners = banners
    .filter((b) => b.inicio || b.fim)
    .map((b) => ({
      chave: `banner-${b.id}`,
      nome: nomeDoBanner(b),
      janela: janela(b.inicio, b.fim),
      local: b.tipo === 'categoria' && b.slug ? `Vitrine · ${b.slug}` : LOCAL[b.tipo],
      ...situacao(b.ativo, b.inicio, b.fim),
    }))

  const deAvisos = avisos
    .filter((a) => normalizarPeriodo(a.periodo) !== 'sempre')
    .map((a) => ({
      chave: `aviso-${a.id}`,
      nome: a.texto,
      janela: janelaDoAviso(a.periodo),
      local: 'Faixa de avisos',
      rotulo: a.ativo ? 'No ar' : 'Desligado',
      cor: a.ativo ? '#5C7A5E' : '#8A8375',
    }))

  return [...deBanners, ...deAvisos]
}

export function Agendamentos({ banners, avisos }: { banners: BannerRow[]; avisos: NoticeRow[] }) {
  const itens = montar(banners, avisos)

  return (
    <Card
      titulo="Agendamentos"
      acao={
        <Link href="/admin/email" className="oz-btn oz-btn-tertiary" style={{ ...BOTAO, padding: '12px 20px' }}>
          + Agendar campanha
        </Link>
      }
    >
      {itens.length === 0 ? (
        <p style={{ fontSize: 13, lineHeight: 1.6, color: '#8A8375' }}>
          Nada com data marcada agora. Um banner com início ou fim, ou um aviso com período, aparece aqui
          assim que você salvar.
        </p>
      ) : (
        <ul
          className="grid gap-[14px]"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 230px), 1fr))' }}
        >
          {itens.map((item) => (
            <li
              key={item.chave}
              className="flex flex-col gap-[6px]"
              style={{ border: '1px solid #E4DDD1', padding: '14px 16px' }}
            >
              <span style={{ fontSize: 13.5, lineHeight: 1.4 }}>{item.nome}</span>
              <span style={{ fontSize: 11.5, color: '#8A8375' }}>
                {item.janela} · {item.local}
              </span>
              <span
                className="uppercase"
                style={{ fontSize: 10, letterSpacing: '.14em', color: item.cor, marginTop: 2 }}
              >
                {item.rotulo}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
