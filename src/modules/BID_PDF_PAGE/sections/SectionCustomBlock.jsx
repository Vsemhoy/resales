import React, { useState, useMemo } from 'react'
import { Input, Button, Select, Switch } from 'antd'
import { PlusOutlined, HolderOutlined } from '@ant-design/icons'
import { RichTextEditor } from '../components/RichTextEditor'
import { FileUploadField } from '../components/FileUploadField'
import { Field, Section, TabWrap } from '../components/FormParts'

const COL_TYPES = [
  { value: 'text',     label: 'Текст'   },
  { value: 'number',   label: 'Число'   },
  { value: 'currency', label: 'Валюта'  },
]

const ALIGN_OPTIONS = [
  { value: 'left',   label: '⬅ Лево'  },
  { value: 'center', label: '↔ Центр' },
  { value: 'right',  label: '➡ Право' },
]

const uuid = () => Math.random().toString(36).slice(2, 8)
const emptyCol = () => ({ id: uuid(), label: 'Колонка', type: 'text', width: '', align: 'left' })
const emptyRow = (cols) => ({ id: uuid(), cells: Object.fromEntries(cols.map(c => [c.id, ''])) })

function getEffectiveWidths(cols) {
  const defined   = cols.reduce((s, c) => s + (parseFloat(c.width) || 0), 0)
  const autoCols  = cols.filter(c => !parseFloat(c.width))
  const autoWidth = autoCols.length > 0 ? (100 - defined) / autoCols.length : 0
  return cols.map(c => ({ ...c, effectiveWidth: parseFloat(c.width) || autoWidth }))
}

function colSum(rows, colId) {
  return rows.reduce((s, r) => s + (parseFloat(r.cells[colId]) || 0), 0)
}

const fmt = (n) => Number(n).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function SectionCustomBlock({
  data, onChange, onRemove, draftId, companyId, sectionNumber, blockIndex,
  figureRegistry = new Map(), figuresEnabled = true
}) {
  const accent = companyId === '3' ? '#269435' : '#FF5903'
  const block  = data || {}
  const set    = (key, val) => onChange({ ...block, [key]: val })

  const cols     = block.columns  || []
  const rows     = block.rows     || []
  const totals   = block.totals   || {}
  const showTotal = block.showTotal ?? false

  const withWidths = useMemo(() => getEffectiveWidths(cols), [cols])

  const addCol    = () => set('columns', [...cols, emptyCol()])
  const updateCol = (id, patch) => set('columns', cols.map(c => c.id === id ? { ...c, ...patch } : c))
  const removeCol = (id) => {
    const nextCols = cols.filter(c => c.id !== id)
    const nextRows = rows.map(r => { const cells = { ...r.cells }; delete cells[id]; return { ...r, cells } })
    const nextTots = { ...totals }; delete nextTots[id]
    onChange({ ...block, columns: nextCols, rows: nextRows, totals: nextTots })
  }

  const addRow     = () => set('rows', [...rows, emptyRow(cols)])
  const updateCell = (rowId, colId, val) =>
    set('rows', rows.map(r => r.id === rowId ? { ...r, cells: { ...r.cells, [colId]: val } } : r))
  const removeRow  = (id) => set('rows', rows.filter(r => r.id !== id))

  const setTotal   = (colId, val) => set('totals', { ...totals, [colId]: val })

  const hasTable = cols.length > 0

  return (
    <TabWrap>
      <Section title="Название раздела">
        <Field>
          <Input
            value={block.title || ''}
            onChange={e => set('title', e.target.value)}
            placeholder="Например: Монтажные работы"
            style={{ fontSize: 14, fontWeight: 600 }}
          />
        </Field>
      </Section>

      <Section title="Текст над таблицей" description="Необязательно">
        <RichTextEditor
          value={block.textAbove || ''} onChange={val => set('textAbove', val)}
          accent={accent} placeholder="Вводный текст..."
        />
      </Section>

      <Section title="Изображение" description="Растягивается на всю ширину между текстами">
        <FileUploadField
          label={null} role={`customBlock_${data?.id || 'block'}_image`}
          draftId={draftId} value={block.image}
          onChange={val => set('image', val)}
        />
        {block.image && figuresEnabled && (() => {
          const figKey = `custom_${data?.id || 'block'}_image`
          const fig    = figureRegistry.get(figKey)
          return (
            <Field label={fig ? `Рис. ${fig.num} — подпись` : 'Подпись к рисунку'}>
              <Input
                value={block.imageTitle ?? `Блок ${block.title || ''}`}
                onChange={e => set('imageTitle', e.target.value)}
                placeholder={`Блок ${block.title || ''}`}
                size="small"
                prefix={fig
                  ? <span style={{ color: '#8c8c8c', fontSize: 11, whiteSpace: 'nowrap' }}>Рис. {fig.num}.</span>
                  : null}
              />
            </Field>
          )
        })()}
      </Section>

      <Section title="Таблица" description="Если колонки не заданы — таблица не отображается">

        {/* Конфигуратор колонок */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
            <span>Колонки</span>
            {cols.length > 0 && (
              <span style={{ fontSize: 11, color: '#bfbfbf' }}>
                сумма ширин: {cols.reduce((s,c) => s + (parseFloat(c.width)||0), 0).toFixed(0)}%
              </span>
            )}
          </div>

          {cols.length > 0 && (
            <div style={{ display: 'flex', gap: 4, marginBottom: 4, paddingLeft: 20, fontSize: 10, color: '#bfbfbf' }}>
              <div style={{ flex: 2 }}>Название</div>
              <div style={{ width: 90 }}>Тип</div>
              <div style={{ width: 90 }}>Выравнивание</div>
              <div style={{ width: 72 }}>Ширина %</div>
              <div style={{ width: 24 }} />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {cols.map(col => (
              <div key={col.id} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <HolderOutlined style={{ color: '#bfbfbf', cursor: 'grab', fontSize: 12 }} />
                <Input
                  value={col.label}
                  onChange={e => updateCol(col.id, { label: e.target.value })}
                  placeholder="Название"
                  style={{ flex: 2 }}
                  size="small"
                />
                <Select
                  value={col.type}
                  onChange={v => updateCol(col.id, { type: v })}
                  options={COL_TYPES}
                  style={{ width: 90 }}
                  size="small"
                />
                <Select
                  value={col.align || 'left'}
                  onChange={v => updateCol(col.id, { align: v })}
                  options={ALIGN_OPTIONS}
                  style={{ width: 90 }}
                  size="small"
                />
                <Input
                  value={col.width}
                  onChange={e => updateCol(col.id, { width: e.target.value })}
                  placeholder="авто"
                  style={{ width: 72 }}
                  size="small"
                  suffix="%"
                />
                <button
                  onClick={() => removeCol(col.id)}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ff4d4f', fontSize: 16, width: 24, flexShrink: 0 }}
                >×</button>
              </div>
            ))}
            <Button size="small" icon={<PlusOutlined />} onClick={addCol} style={{ alignSelf: 'flex-start', marginTop: 4 }}>
              Колонка
            </Button>
          </div>
        </div>

        {/* Строки */}
        {hasTable && (
          <div>
            <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Строки</span>
              {rows.length > 0 && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
                  <Switch size="small" checked={showTotal} onChange={v => set('showTotal', v)} />
                  Строка итогов
                </label>
              )}
            </div>

            <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
              <div style={{ width: 28 }} />
              {withWidths.map(col => (
                <div key={col.id} style={{
                  flex: `0 0 calc(${col.effectiveWidth}% - 8px)`,
                  fontSize: 10, color: '#8c8c8c', fontWeight: 600,
                  textAlign: col.align || 'left',
                }}>
                  {col.label}
                </div>
              ))}
              <div style={{ width: 24 }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {rows.map((row, ri) => (
                <div key={row.id} style={{ display: 'flex', gap: 4, alignItems: 'center', background: ri % 2 ? '#fafafa' : '#fff', borderRadius: 4, width: 'calc(100% - 30px)' }}>
                  <span style={{ width: 28, textAlign: 'right', fontSize: 11, color: '#bfbfbf', flexShrink: 0 }}>{ri + 1}</span>
                  {withWidths.map(col => (
                    <Input
                      key={col.id}
                      value={row.cells[col.id] || ''}
                      onChange={e => updateCell(row.id, col.id, e.target.value)}
                      style={{ flex: `0 0 calc(${col.effectiveWidth}% - 8px)`, textAlign: col.align || 'left' }}
                      size="small"
                      type={col.type !== 'text' ? 'number' : 'text'}
                    />
                  ))}
                  <button
                    onClick={() => removeRow(row.id)}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ff4d4f', fontSize: 16, width: 24, flexShrink: 0 }}
                  >×</button>
                </div>
              ))}
            </div>

            {/* Строка итогов */}
            {showTotal && rows.length > 0 && (
              <div style={{ marginTop: 6, borderTop: `2px solid ${accent}`, paddingTop: 4 }}>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <span style={{ width: 28, textAlign: 'right', fontSize: 10, color: accent, fontWeight: 700, flexShrink: 0 }}>Σ</span>
                  {withWidths.map(col => (
                    <div key={col.id} style={{ flex: `0 0 calc(${col.effectiveWidth}% - 8px)` }}>
                      {col.type === 'text'
                        ? <Input
                            size="small"
                            value={totals[col.id] || ''}
                            onChange={e => setTotal(col.id, e.target.value)}
                            placeholder="Итог..."
                            style={{ background: accent + '08', borderColor: accent + '44', textAlign: col.align || 'left' }}
                          />
                        : <div style={{
                            fontSize: 12, fontWeight: 700, color: accent,
                            textAlign: col.align || 'right',
                            padding: '2px 6px', background: accent + '08',
                            borderRadius: 4, border: `1px solid ${accent}44`,
                          }}>
                            {col.type === 'currency' ? fmt(colSum(rows, col.id)) : colSum(rows, col.id)}
                          </div>
                      }
                    </div>
                  ))}
                  <div style={{ width: 24 }} />
                </div>
              </div>
            )}

            <Button size="small" icon={<PlusOutlined />} onClick={addRow} style={{ marginTop: 8 }}>
              Строка
            </Button>
          </div>
        )}
      </Section>

      <Section title="Текст под таблицей" description="Необязательно">
        <RichTextEditor
          value={block.textBelow || ''} onChange={val => set('textBelow', val)}
          accent={accent} placeholder="Итоговый текст, сноски..."
        />
      </Section>

      <NoteFields data={block} onChange={onChange} />
      {onRemove && <DeleteBlockButton onRemove={onRemove} title={block.title} />}
    </TabWrap>
  )
}

export function NoteFields({ data, onChange }) {
  const [open, setOpen] = useState(false)
  const set = (key, val) => onChange({ ...data, [key]: val })
  return (
    <div style={{ marginTop: 16 }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, color: '#8c8c8c', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}
      >
        <span>{open ? '▾' : '▸'}</span>
        Служебные заметки
        {(data?.noteEngineer || data?.noteManager) && (
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#faad14', display: 'inline-block', marginLeft: 4 }} />
        )}
      </button>
      {open && (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 6, padding: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#d48806', marginBottom: 6 }}>🔧 Сообщение инженеру</div>
            <Input.TextArea autoSize={{ minRows: 2 }} value={data?.noteEngineer || ''} onChange={e => set('noteEngineer', e.target.value)} placeholder="Что сделать инженеру..." style={{ background: 'transparent', border: '1px solid #ffe58f' }} />
          </div>
          <div style={{ background: '#e6f4ff', border: '1px solid #91caff', borderRadius: 6, padding: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#0958d9', marginBottom: 6 }}>📋 Сообщение менеджеру</div>
            <Input.TextArea autoSize={{ minRows: 2 }} value={data?.noteManager || ''} onChange={e => set('noteManager', e.target.value)} placeholder="Что учесть менеджеру..." style={{ background: 'transparent', border: '1px solid #91caff' }} />
          </div>
        </div>
      )}
    </div>
  )
}

function DeleteBlockButton({ onRemove, title }) {
  const [confirm, setConfirm] = useState(false)
  if (!confirm) return (
    <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
      <button onClick={() => setConfirm(true)} style={{ border: '1px solid #ffccc7', background: '#fff2f0', color: '#ff4d4f', borderRadius: 6, padding: '6px 16px', cursor: 'pointer', fontSize: 13 }}>
        🗑 Удалить блок
      </button>
    </div>
  )
  return (
    <div style={{ marginTop: 24, background: '#fff2f0', borderRadius: 8, padding: 16, border: '1px solid #ffccc7' }}>
      <div style={{ fontSize: 13, color: '#262626', marginBottom: 12 }}>
        Удалить блок <strong>«{title || 'Без названия'}»</strong>? Это нельзя отменить.
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onRemove} style={{ border: 'none', background: '#ff4d4f', color: '#fff', borderRadius: 6, padding: '6px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Да, удалить</button>
        <button onClick={() => setConfirm(false)} style={{ border: '1px solid #d9d9d9', background: '#fff', color: '#595959', borderRadius: 6, padding: '6px 16px', cursor: 'pointer', fontSize: 13 }}>Отмена</button>
      </div>
    </div>
  )
}
