import type { Metadata } from 'next'
import { FormConsultor } from '@/components/loja/consultor/FormConsultor'

export const metadata: Metadata = {
  title: 'Consultoria de cor',
  description:
    'Descubra seu subtom de pele e a paleta de cores que te valoriza, e veja quais peças da Ozzi combinam com você.',
}

export default function ConsultorPage() {
  return (
    <div className="shell-narrow py-14 pb-24">
      <span className="oz-eyebrow">Consultoria Ozzi</span>
      <h1
        className="font-display mt-5"
        style={{ fontSize: 'clamp(34px,4.4vw,52px)', fontWeight: 300, lineHeight: 1.05, letterSpacing: '-.015em' }}
      >
        Quais cores
        <br />
        combinam com você
      </h1>
      <p className="mt-5 max-w-[520px]" style={{ fontSize: 15.5, lineHeight: 1.72, color: '#5C574D' }}>
        Toda pele tem um subtom, e ele decide quais cores te iluminam e quais te apagam.
        Descubra o seu e veja, na hora, quais peças em pronta entrega foram feitas para você.
      </p>
      <p className="mt-4 max-w-[520px]" style={{ fontSize: 12.5, lineHeight: 1.7, color: '#8A8375' }}>
        Isso é leitura de cor, não julgamento de corpo nem de rosto. Sua foto é usada
        só para a análise e não fica guardada.
      </p>

      <FormConsultor />
    </div>
  )
}
