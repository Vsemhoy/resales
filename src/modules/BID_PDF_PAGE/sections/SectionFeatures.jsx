import React from 'react'
import { Section, TabWrap } from '../components/FormParts'
import { RichTextEditor } from '../components/RichTextEditor'

export default function SectionFeatures({ data, onChange, companyId }) {
  const accent = companyId === '3' ? '#269435' : '#FF5903'

  return (
    <TabWrap>
      <Section
        title="Особенности системы и требования заказчика"
        description="Используй форматирование редактора: нумерованные списки, буллеты, жирный текст"
      >
        <RichTextEditor
          value={data.featuresContent || ''}
          onChange={val => onChange({ ...data, featuresContent: val })}
          accent={accent}
          placeholder="1. Система озвучивания на 100В...&#10;2. Резервирование питания..."
        />
      </Section>
    </TabWrap>
  )
}
