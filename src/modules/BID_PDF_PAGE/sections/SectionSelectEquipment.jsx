import React from 'react'
import { Input } from 'antd'
import { Section, Field, TabWrap } from '../components/FormParts'
import { FileUploadField } from '../components/FileUploadField'
import { RichTextEditor } from '../components/RichTextEditor'

export default function SectionSelectEquipment({ data, onChange, draftId, companyId }) {
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
            {data.structuralDiagrams && (
              <Field label="Подпись к рисунку">
                <Input
                  value={data.structuralDiagramsTitle ?? 'Структурная схема проекта'}
                  onChange={e => set('structuralDiagramsTitle', e.target.value)}
                  placeholder="Структурная схема проекта"
                  size="small"
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
            {data.blockPlacements && (
              <Field label="Подпись к рисунку">
                <Input
                  value={data.blockPlacementsTitle ?? 'Размещение блоков системы в шкафах'}
                  onChange={e => set('blockPlacementsTitle', e.target.value)}
                  placeholder="Размещение блоков системы в шкафах"
                  size="small"
                />
              </Field>
            )}
          </div>

        </div>
      </Section>
    </TabWrap>
  )
}
