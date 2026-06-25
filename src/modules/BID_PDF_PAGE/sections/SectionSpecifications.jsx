import React from 'react'
import { Button } from 'antd'
import { UndoOutlined } from '@ant-design/icons'
import { RichTextEditor } from '../components/RichTextEditor'
import { Section, Field, TabWrap } from '../components/FormParts'

const FOOTNOTE_DEFAULT = 'По условиям договора поставка осуществляется при 100% предоплате со склада в Санкт-Петербурге. Цены указаны с учетом НДС 22%. Срок поставки оборудования под заказ - 3 месяца с момента оплаты счета.'

// Визуальный скелетон-превью таблицы
function TableSkeletonPreview({ style }) {
  const isCompact = style === 'compact'
  const rows      = isCompact ? 8 : 4

  const colWidths = isCompact
    ? ['8%', '30%', '32%', '10%', '10%', '10%']
    : ['8%', '42%', '10%', '10%', '10%', '18%']

  return (
    <div style={{ width: '100%', fontSize: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 2 }}>
        {colWidths.map((w, i) => (
          <div key={i} style={{ width: w, height: 8, background: i === colWidths.length - 1 && !isCompact ? '#222' : '#bfbfbf', borderRadius: 2, opacity: i === colWidths.length - 1 && !isCompact ? 0.4 : 1 }} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 2, marginBottom: 2, background: i % 2 === 1 ? '#f5f5f5' : 'transparent', minHeight: isCompact ? 10 : 20, alignItems: 'center', padding: '2px 0' }}>
          {colWidths.map((w, j) => (
            <div key={j} style={{ width: w, height: 6, background: j === colWidths.length - 1 && !isCompact ? '#222' : '#d9d9d9', borderRadius: 2, opacity: j > 0 ? 0.4 : 1 }} />
          ))}
        </div>
      ))}
    </div>
  )
}

const TABLE_STYLES = [
  { id: 'default', label: 'С картинками' },
  { id: 'compact', label: 'Без картинок' },
]

export default function SectionSpecifications({ data, onChange, companyId }) {
  const accent     = companyId === '3' ? '#269435' : '#FF5903'
  const tableStyle = data.tableStyle ?? 'compact'
  const tableFootnoteDefault = data._tableFootnoteDefault || FOOTNOTE_DEFAULT
  const set        = (key, val) => onChange({ ...data, [key]: val })

  return (
    <TabWrap>
      <Section title="Стиль таблицы спецификации">
        <div style={{ display: 'flex', gap: 12 }}>
          {TABLE_STYLES.map(opt => {
            const isActive = tableStyle === opt.id
            return (
              <div
                key={opt.id}
                onClick={() => set('tableStyle', opt.id)}
                style={{
                  flex: 1, border: `2px solid ${isActive ? accent : '#d9d9d9'}`,
                  borderRadius: 8, padding: 12, cursor: 'pointer',
                  background: isActive ? accent + '0d' : '#fafafa',
                  transition: 'all 0.15s',
                }}
              >
                <TableSkeletonPreview style={opt.id} />
                <div style={{ fontSize: 12, fontWeight: 600, textAlign: 'center', marginTop: 8, color: isActive ? accent : '#595959' }}>
                  {opt.label}
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      <Section title="Текст под таблицей" description="Выводится мелким шрифтом после итоговой строки">
        <Field>
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <RichTextEditor
                value={data.tableFootnote || ''}
                onChange={val => set('tableFootnote', val)}
                accent={accent}
                placeholder="Например: цены указаны с учётом НДС 20%, действительны до..."
              />
            </div>
            {(data.tableFootnote ?? '') !== tableFootnoteDefault && (
              <Button
                size="small"
                icon={<UndoOutlined />}
                onClick={() => set('tableFootnote', tableFootnoteDefault)}
                title="Сбросить к дефолтному тексту"
              />
            )}
          </div>
        </Field>
      </Section>
    </TabWrap>
  )
}
