import React from 'react'
import { Section, TabWrap } from '../components/FormParts'

export default function SectionToc() {
  return (
    <TabWrap>
      <Section title="Оглавление" description="Генерируется автоматически в конце документа по включённым секциям" />
    </TabWrap>
  )
}
