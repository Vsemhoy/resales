import React from 'react'
import { Section, Field, TabWrap } from '../components/FormParts'
import { FileUploadField } from '../components/FileUploadField'
import { RichTextEditor } from '../components/RichTextEditor'

export default function SectionSelectEquipment({ data, onChange, draftId, companyId }) {
  const accent = companyId === '3' ? '#269435' : '#FF5903'
  const set = (key, val) => onChange({ ...data, [key]: val })

  return (
    <TabWrap>
      <Section title="Выбор оборудования" description="Текст раздела и схемы">
        <Field label="Описание выбора оборудования">
          <RichTextEditor
            value={data.selectionOfEquipment || ''}
            onChange={val => set('selectionOfEquipment', val)}
            accent={accent}
            placeholder="Для данного объекта предлагается построение системы..."
          />
        </Field>
      </Section>
      <Section title="Схемы">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <FileUploadField label="Структурная схема проекта" role="structuralDiagrams" draftId={draftId} value={data.structuralDiagrams} onChange={val => set('structuralDiagrams', val)} />
          <FileUploadField label="Размещение блоков системы в шкафах" role="blockPlacements" draftId={draftId} value={data.blockPlacements} onChange={val => set('blockPlacements', val)} />
        </div>
      </Section>
    </TabWrap>
  )
}
