import React, { useState } from 'react'
import { Input, Button, Select, Switch } from 'antd'
import { DeleteOutlined, PlusOutlined, HolderOutlined } from '@ant-design/icons'
import { RichTextEditor } from '../components/RichTextEditor'
import { FileUploadField } from '../components/FileUploadField'
import { Field, Section, TabWrap } from '../components/FormParts'

const COL_TYPES = [
  { value: 'text',     label: 'Текст'   },
  { value: 'number',   label: 'Число'   },
  { value: 'currency', label: 'Валюта'  },
]

const uuid = () => Math.random().toString(36).slice(2, 8)

const emptyCol = () => ({ id: uuid(), label: 'Колонка', type: 'text', width: '' })
const emptyRow = (cols) => ({ id: uuid(), cells: Object.fromEntries(cols.map(c => [c.id, ''])) })

export default function SectionCustomBlock({ data, onChange, onRemove, draftId, companyId, sectionNumber, blockIndex }) {
  const accent  = companyId === '3' ? '#269435' : '#FF5903'
  const block   = data || {}
  const set     = (key, val) => onChange({ ...block, [key]: val })

  const cols    = block.columns || []
  const rows    = block.rows    || []

  // ── Колонки ─────────────────────────────────────────────────────────────
  const addCol    = () => set('columns', [...cols, emptyCol()])
  const updateCol = (id, patch) => set('columns', cols.map(c => c.id === id ? { ...c, ...patch } : c))
  const removeCol = (id) => {
    const nextCols = cols.filter(c => c.id !== id)
    const nextRows = rows.map(r => { const cells = { ...r.cells }; delete cells[id]; return { ...r, cells } })
    onChange({ ...block, columns: nextCols, rows: nextRows })
  }

  // ── Строки ──────────────────────────────────────────────────────────────
  const addRow    = () => set('rows', [...rows, emptyRow(cols)])
  const updateCell= (rowId, colId, val) =>
    set('rows', rows.map(r => r.id === rowId ? { ...r, cells: { ...r.cells, [colId]: val } } : r))
  const removeRow = (id) => set('rows', rows.filter(r => r.id !== id))

  const hasTable = cols.length > 0

  return (
    <TabWrap>
      {/* Название блока */}
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

      {/* Текст сверху */}
      <Section title="Текст над таблицей" description="Необязательно">
        <RichTextEditor
          value={block.textAbove || ''}
          onChange={val => set('textAbove', val)}
          accent={accent}
          placeholder="Вводный текст перед таблицей..."
        />
      </Section>

      {/* Картинка */}
      <Section title="Изображение" description="Растягивается на всю ширину между текстами">
        <FileUploadField
          label={null}
          role="customBlockImage"
          draftId={draftId}
          value={block.image}
          onChange={val => set('image', val)}
        />
      </Section>

      {/* Таблица */}
      <Section title="Таблица" description="Если колонки не заданы — таблица не отображается">

        {/* Колонки */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 6 }}>Колонки</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {cols.map(col => (
              <div key={col.id} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <HolderOutlined style={{ color: '#bfbfbf', cursor: 'grab' }} />
                <Input
                  value={col.label}
                  onChange={e => updateCol(col.id, { label: e.target.value })}
                  placeholder="Название"
                  style={{ flex: 2 }}
                />
                <Select
                  value={col.type}
                  onChange={v => updateCol(col.id, { type: v })}
                  options={COL_TYPES}
                  style={{ flex: 1 }}
                />
                <Input
                  value={col.width}
                  onChange={e => updateCol(col.id, { width: e.target.value })}
                  placeholder="Ширина %"
                  style={{ width: 80 }}
                />
                <button
                  onClick={() => removeCol(col.id)}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ff4d4f', fontSize: 16 }}
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
            <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 6 }}>Строки</div>

            {/* Шапка */}
            {cols.length > 0 && (
              <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                <div style={{ width: 24 }} />
                {cols.map(col => (
                  <div key={col.id} style={{ flex: col.width ? `0 0 ${col.width}` : 1, fontSize: 11, color: '#8c8c8c', fontWeight: 600 }}>
                    {col.label}
                  </div>
                ))}
                <div style={{ width: 24 }} />
              </div>
            )}

            {/* Строки */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {rows.map((row, ri) => (
                <div key={row.id} style={{ display: 'flex', gap: 4, alignItems: 'center', background: ri % 2 ? '#fafafa' : '#fff', borderRadius: 4, padding: '2px 0' }}>
                  <span style={{ width: 24, textAlign: 'right', fontSize: 11, color: '#bfbfbf' }}>{ri + 1}</span>
                  {cols.map(col => (
                    <Input
                      key={col.id}
                      value={row.cells[col.id] || ''}
                      onChange={e => updateCell(row.id, col.id, e.target.value)}
                      style={{ flex: col.width ? `0 0 ${col.width}` : 1 }}
                      type={col.type === 'number' || col.type === 'currency' ? 'number' : 'text'}
                    />
                  ))}
                  <button
                    onClick={() => removeRow(row.id)}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ff4d4f', fontSize: 16, width: 24 }}
                  >×</button>
                </div>
              ))}
              <Button size="small" icon={<PlusOutlined />} onClick={addRow} style={{ alignSelf: 'flex-start', marginTop: 4 }}>
                Строка
              </Button>
            </div>
          </div>
        )}
      </Section>

      {/* Текст снизу */}
      <Section title="Текст под таблицей" description="Необязательно">
        <RichTextEditor
          value={block.textBelow || ''}
          onChange={val => set('textBelow', val)}
          accent={accent}
          placeholder="Итоговый текст, сноски..."
        />
      </Section>

      {/* Сообщения */}
      <NoteFields data={block} onChange={onChange} />

      {/* Удаление блока */}
      {onRemove && (
        <DeleteBlockButton onRemove={onRemove} title={block.title} />
      )}
    </TabWrap>
  )
}

// ─── Сообщения инженеру / менеджеру ──────────────────────────────────────────
export function NoteFields({ data, onChange }) {
  const [open, setOpen] = useState(false)
  const set = (key, val) => onChange({ ...data, [key]: val })

  return (
    <div style={{ marginTop: 16 }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          border: 'none', background: 'none', cursor: 'pointer',
          fontSize: 12, color: '#8c8c8c', padding: 0,
          display: 'flex', alignItems: 'center', gap: 4,
        }}
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
            <div style={{ fontSize: 11, fontWeight: 600, color: '#d48806', marginBottom: 6 }}>
              🔧 Сообщение инженеру
            </div>
            <Input.TextArea
              autoSize={{ minRows: 2 }}
              value={data?.noteEngineer || ''}
              onChange={e => set('noteEngineer', e.target.value)}
              placeholder="Что сделать инженеру по этой секции..."
              style={{ background: 'transparent', border: '1px solid #ffe58f' }}
            />
          </div>

          <div style={{ background: '#e6f4ff', border: '1px solid #91caff', borderRadius: 6, padding: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#0958d9', marginBottom: 6 }}>
              📋 Сообщение менеджеру
            </div>
            <Input.TextArea
              autoSize={{ minRows: 2 }}
              value={data?.noteManager || ''}
              onChange={e => set('noteManager', e.target.value)}
              placeholder="Что учесть менеджеру по этой секции..."
              style={{ background: 'transparent', border: '1px solid #91caff' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Кнопка удаления блока с подтверждением ──────────────────────────────────
function DeleteBlockButton({ onRemove, title }) {
  const [confirm, setConfirm] = React.useState(false)

  if (!confirm) {
    return (
      <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
        <button
          onClick={() => setConfirm(true)}
          style={{
            border: '1px solid #ffccc7', background: '#fff2f0', color: '#ff4d4f',
            borderRadius: 6, padding: '6px 16px', cursor: 'pointer', fontSize: 13,
          }}
        >
          🗑 Удалить блок
        </button>
      </div>
    )
  }

  return (
    <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #ffccc7', background: '#fff2f0', borderRadius: 8, padding: 16 }}>
      <div style={{ fontSize: 13, color: '#262626', marginBottom: 12 }}>
        Удалить блок <strong>«{title || 'Без названия'}»</strong>? Это действие нельзя отменить.
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={onRemove}
          style={{ border: 'none', background: '#ff4d4f', color: '#fff', borderRadius: 6, padding: '6px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
        >
          Да, удалить
        </button>
        <button
          onClick={() => setConfirm(false)}
          style={{ border: '1px solid #d9d9d9', background: '#fff', color: '#595959', borderRadius: 6, padding: '6px 16px', cursor: 'pointer', fontSize: 13 }}
        >
          Отмена
        </button>
      </div>
    </div>
  )
}
