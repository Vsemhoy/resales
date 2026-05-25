import React from 'react'
import { Input } from 'antd'
import { Section, Field, TabWrap } from '../components/FormParts'
import { FileUploadField } from '../components/FileUploadField'
import { RichTextEditor } from '../components/RichTextEditor'

export default function SectionSelectEquipment({ data, onChange, draftId, companyId, figureRegistry = new Map(), figuresEnabled = true }) {
  const accent = companyId === '3' ? '#269435' : '#FF5903'
  const set = (key, val) => onChange({ ...data, [key]: val })

  return (
    <TabWrap>
      <Section title="Выбор оборудования" description="Текст раздела">
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Структурная схема */}
          <div>
            <FileUploadField
              label="Структурная схема проекта"
              role="structuralDiagrams"
              draftId={draftId}
              value={data.structuralDiagrams}
              onChange={val => set('structuralDiagrams', val)}
            />
            {data.structuralDiagrams && figuresEnabled && (
              <Field label={
                figureRegistry.get('structuralDiagrams')
                  ? `Рис. ${figureRegistry.get('structuralDiagrams').num} — подпись`
                  : 'Подпись к рисунку'
              }>
                <Input
                  value={data.structuralDiagramsTitle ?? 'Структурная схема проекта'}
                  onChange={e => set('structuralDiagramsTitle', e.target.value)}
                  placeholder="Структурная схема проекта"
                  size="small"
                  prefix={figureRegistry.get('structuralDiagrams')
                    ? <span style={{ color: '#8c8c8c', fontSize: 11, whiteSpace: 'nowrap' }}>Рис. {figureRegistry.get('structuralDiagrams').num}.</span>
                    : null}
                />
              </Field>
            )}
          </div>

          {/* Размещение блоков */}
          <div>
            <FileUploadField
              label="Размещение блоков системы в шкафах"
              role="blockPlacements"
              draftId={draftId}
              value={data.blockPlacements}
              onChange={val => set('blockPlacements', val)}
            />
            {data.blockPlacements && figuresEnabled && (
              <Field label={
                figureRegistry.get('blockPlacements')
                  ? `Рис. ${figureRegistry.get('blockPlacements').num} — подпись`
                  : 'Подпись к рисунку'
              }>
                <Input
                  value={data.blockPlacementsTitle ?? 'Размещение блоков системы в шкафах'}
                  onChange={e => set('blockPlacementsTitle', e.target.value)}
                  placeholder="Размещение блоков системы в шкафах"
                  size="small"
                  prefix={figureRegistry.get('blockPlacements')
                    ? <span style={{ color: '#8c8c8c', fontSize: 11, whiteSpace: 'nowrap' }}>Рис. {figureRegistry.get('blockPlacements').num}.</span>
                    : null}
                />
              </Field>
            )}
          </div>

        </div>
      </Section>
    </TabWrap>
  )
}
