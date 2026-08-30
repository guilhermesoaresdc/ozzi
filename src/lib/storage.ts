'use client'

import { createClient } from '@/lib/supabase/client'
import { SUPABASE_URL } from '@/lib/supabase/config'

export const BUCKET = 'produtos'

export const TIPOS_IMAGEM = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
export const TIPOS_VIDEO = ['video/mp4', 'video/webm', 'video/quicktime']

export const MAX_IMAGEM_BYTES = 5 * 1024 * 1024
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024

export type TipoMidia = 'imagem' | 'video' | 'ambos'

export function aceitaDoTipo(tipo: TipoMidia): string {
  if (tipo === 'imagem') return TIPOS_IMAGEM.join(',')
  if (tipo === 'video') return TIPOS_VIDEO.join(',')
  return [...TIPOS_IMAGEM, ...TIPOS_VIDEO].join(',')
}

export function ehVideo(url: string): boolean {
  return /\.(mp4|webm|mov)(\?|$)/i.test(url)
}

/** URL pública de um arquivo do bucket. */
export function urlPublica(caminho: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${caminho}`
}

function extensaoDe(file: File): string {
  const porNome = file.name.split('.').pop()?.toLowerCase()
  if (porNome && /^[a-z0-9]{2,5}$/.test(porNome)) return porNome
  const porTipo: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/avif': 'avif',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/quicktime': 'mov',
  }
  return porTipo[file.type] ?? 'bin'
}

function megabytes(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`
}

export function validarArquivo(file: File, tipo: TipoMidia): string | null {
  const imagem = TIPOS_IMAGEM.includes(file.type)
  const video = TIPOS_VIDEO.includes(file.type)

  if (tipo === 'imagem' && !imagem) return `"${file.name}" não é uma imagem JPG, PNG, WebP ou AVIF.`
  if (tipo === 'video' && !video) return `"${file.name}" não é um vídeo MP4, WebM ou MOV.`
  if (tipo === 'ambos' && !imagem && !video) return `"${file.name}" não é uma imagem nem um vídeo aceito.`

  const limite = video ? MAX_VIDEO_BYTES : MAX_IMAGEM_BYTES
  if (file.size > limite) {
    return `"${file.name}" tem ${megabytes(file.size)}; o limite é ${megabytes(limite)}.`
  }
  return null
}

export interface ResultadoEnvio {
  url?: string
  erro?: string
}

/**
 * Envia um arquivo do dispositivo para o Storage do Supabase.
 * A escrita passa pela sessão do admin — o RLS do bucket exige is_admin().
 */
export async function enviarArquivo(file: File, pasta: string, tipo: TipoMidia = 'ambos'): Promise<ResultadoEnvio> {
  const invalido = validarArquivo(file, tipo)
  if (invalido) return { erro: invalido }

  const supabase = createClient()
  const nome = `${crypto.randomUUID()}.${extensaoDe(file)}`
  const caminho = `${pasta.replace(/^\/+|\/+$/g, '')}/${nome}`

  const { error } = await supabase.storage.from(BUCKET).upload(caminho, file, {
    cacheControl: '31536000',
    upsert: false,
    contentType: file.type,
  })

  if (error) {
    // A causa mais comum é sessão sem papel de admin; a mensagem crua não ajuda a cliente.
    const permissao = /row-level security|unauthorized|jwt/i.test(error.message)
    return {
      erro: permissao
        ? 'Sua sessão não tem permissão para enviar arquivos. Entre de novo como administrador.'
        : `Não consegui enviar "${file.name}": ${error.message}`,
    }
  }

  return { url: urlPublica(caminho) }
}
