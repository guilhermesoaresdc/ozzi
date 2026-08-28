import Link from 'next/link'
import type { ReactNode } from 'react'

/** Linha de lista clicável: mesmo desenho do CardRow, porém navegável. */
export function LinhaLink({
  href,
  py = 14,
  ultima = false,
  children,
}: {
  href: string
  py?: number
  ultima?: boolean
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      className="oz-table-row flex items-center gap-[14px] px-[22px] transition-colors"
      style={{
        paddingTop: py,
        paddingBottom: py,
        borderBottom: ultima ? undefined : '1px solid #E4DDD1',
      }}
    >
      {children}
    </Link>
  )
}
