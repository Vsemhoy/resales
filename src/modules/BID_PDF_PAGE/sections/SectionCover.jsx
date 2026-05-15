import React from 'react'
import { Input } from 'antd'
import { Section, Field, Grid2, TabWrap } from '../components/FormParts'
import { useCovers } from '../components/CoversDrawer'

export default function SectionCover({ data, onChange }) {
  const set = (key, val) => onChange({ ...data, [key]: val })

  return (
    <TabWrap>
      <Section title="Данные на обложку" description="Предзаполнено из КП — отредактируй если нужно">
        <Grid2>
          <Field label="Исходящий номер">
            <Input placeholder="81740" value={data.ext_number || ''} onChange={e => set('ext_number', e.target.value)} />
          </Field>
          <div />
          <Field label="Кому — имя (в дательном падеже)">
            <Input placeholder="Иванову Ивану" value={data.target_name || ''} onChange={e => set('target_name', e.target.value)} />
          </Field>
          <Field label="Кому — должность и организация">
            <Input placeholder="Директору ООО «Ромашка»" value={data.target_occupy || ''} onChange={e => set('target_occupy', e.target.value)} />
          </Field>
          <Field label="Адрес объекта">
            <Input placeholder="г. Санкт-Петербург, ул. Примерная, 1" value={data.object_address || ''} onChange={e => set('object_address', e.target.value)} />
          </Field>
          <Field label="Название объекта">
            <Input placeholder="АО Полиметалл" value={data.object_name || ''} onChange={e => set('object_name', e.target.value)} />
          </Field>
          <Field label="Выполнил — имя">
            <Input placeholder="Кошелев Александр" value={data.manager_name || ''} onChange={e => set('manager_name', e.target.value)} />
          </Field>
          <Field label="Выполнил — должность">
            <Input placeholder="Коммерческий директор" value={data.manager_occupy || ''} onChange={e => set('manager_occupy', e.target.value)} />
          </Field>
        </Grid2>
      </Section>

      <Section title="Контактные данные">
        <Grid2>
          <Field label="Телефон">
            <Input placeholder="+7 (812) 123-45-67" value={data.tel || ''} onChange={e => set('tel', e.target.value)} />
          </Field>
          <Field label="Email">
            <Input placeholder="sales@arstel.com" value={data.email || ''} onChange={e => set('email', e.target.value)} />
          </Field>
        </Grid2>
      </Section>

      <Section title="Картинка на обложку" description="Правая часть титульного листа">
        <CoverBlockPicker value={data.coverBlock ?? null} onChange={url => set('coverBlock', url)} />
      </Section>
    </TabWrap>
  )
}

function CoverBlockPicker({ value, onChange }) {
  const { covers, loading } = useCovers()

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {/* Без картинки */}
      <div
        onClick={() => onChange(null)}
        style={{
          width: 80, height: 60, border: `2px solid ${!value ? '#1677ff' : '#d9d9d9'}`,
          borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: 11, color: '#8c8c8c', background: '#fafafa',
        }}
      >
        Без картинки
      </div>
      {/* Скелетоны пока грузим */}
      {loading && [1,2,3].map(i => (
        <div key={i} style={{ width: 80, height: 60, borderRadius: 6, background: '#f0f0f0', animation: 'pulse 1.5s infinite' }} />
      ))}
      {/* Обложки с бэка */}
      {!loading && covers.map(cover => (
        <div
          key={cover.filename}
          onClick={() => onChange(value === cover.url ? null : cover.url)}
          title={cover.filename}
          style={{
            width: 80, height: 60, border: `2px solid ${value === cover.url ? '#1677ff' : '#d9d9d9'}`,
            borderRadius: 6, overflow: 'hidden', cursor: 'pointer', position: 'relative',
          }}
        >
          <img src={cover.url} alt={cover.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          {value === cover.url && (
            <div style={{ position: 'absolute', top: 2, right: 2, background: '#1677ff', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" width="10" height="10">
                <polyline points="2,6 5,9 10,3" />
              </svg>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
