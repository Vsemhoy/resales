import React from 'react'
import { Section, TabWrap } from '../components/FormParts'

export default function SectionSystemChars() {
  return (
    <TabWrap>
      <Section
        title="Характеристики системы"
        description="Данные рассчитываются автоматически из спецификации — суммируются по всем позициям"
      >
        <div style={{ color: '#8c8c8c', fontSize: 12, lineHeight: 1.7 }}>
          <div>• Общая потребляемая мощность, Вт</div>
          <div>• Общая выходная мощность, Вт</div>
          <div>• Общая мощность громкоговорителей, Вт</div>
          <div>• Общая высота, U</div>
          <div>• Масса брутто, кг</div>
          <div>• Объём с учётом упаковки, м³</div>
        </div>
      </Section>
    </TabWrap>
  )
}
