import React from 'react'
import { Input, Segmented } from 'antd'
import { Image } from 'antd'
import { FileOutlined, PictureOutlined } from '@ant-design/icons'
import { Section, Field, Grid2, TabWrap } from '../components/FormParts'
import { useCovers } from '../components/CoversDrawer'

export default function SectionCover({ data, onChange, draftId, companyId }) {
  const accent    = companyId === '3' ? '#269435' : '#FF5903'
  const set       = (key, val) => onChange({ ...data, [key]: val })
  const coverMode = data.coverMode ?? 'cover'   // 'cover' | 'hat'

  return (
    <TabWrap>
      {/* Режим обложки */}
      <Section title="Вид первой страницы">
        <Segmented
          value={coverMode}
          onChange={v => set('coverMode', v)}
          options={[
            { label: <span>📄 Обложка</span>,  value: 'cover' },
            { label: <span>🖼 Шапка</span>,    value: 'hat'   },
          ]}
          style={{ marginBottom: 8 }}
        />
        <div style={{ fontSize: 12, color: '#8c8c8c' }}>
          {coverMode === 'cover'
            ? 'Полная страница обложки — с картинкой справа и реквизитами'
            : 'Баннер во всю ширину без полей — потом строка с реквизитами'}
        </div>
      </Section>

      {/* РЕЖИМ: ОБЛОЖКА */}
      {coverMode === 'cover' && (
        <>
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
            <CoverBlockPicker value={data.coverBlock ?? null} onChange={url => set('coverBlock', url)} accent={accent} />
          </Section>
        </>
      )}

      {/* РЕЖИМ: ШАПКА */}
      {coverMode === 'hat' && (
        <>
          <Section title="Картинка-баннер" description="Растягивается на всю ширину страницы без полей (~1/4 высоты)">
            <CoverBlockPicker value={data.hatImage ?? null} onChange={url => set('hatImage', url)} accent={accent} />
          </Section>

          <Section title="Реквизиты" description="Строка под баннером">
            <Grid2>
              <Field label="Исходящий номер">
                <Input placeholder="81740" value={data.ext_number || ''} onChange={e => set('ext_number', e.target.value)} />
              </Field>
              <Field label="Дата">
                <Input placeholder="15.01.2025" value={data.date || ''} onChange={e => set('date', e.target.value)} />
              </Field>
              <Field label="Кому — организация">
                <Input placeholder="ООО «Кабель Контракт Юг»" value={data.target_occupy || ''} onChange={e => set('target_occupy', e.target.value)} />
              </Field>
              <Field label="Кому — имя">
                <Input placeholder="Ромашнику Гиви Рашидову" value={data.target_name || ''} onChange={e => set('target_name', e.target.value)} />
              </Field>
            </Grid2>
          </Section>

          <Section title="Менеджер">
            <Grid2>
              <Field label="Имя">
                <Input placeholder="Кошелев Александр" value={data.manager_name || ''} onChange={e => set('manager_name', e.target.value)} />
              </Field>
              <Field label="Должность">
                <Input placeholder="Коммерческий директор" value={data.manager_occupy || ''} onChange={e => set('manager_occupy', e.target.value)} />
              </Field>
              <Field label="Телефон">
                <Input placeholder="+7 (812) 123-45-67" value={data.tel || ''} onChange={e => set('tel', e.target.value)} />
              </Field>
              <Field label="Email">
                <Input placeholder="sales@arstel.com" value={data.email || ''} onChange={e => set('email', e.target.value)} />
              </Field>
            </Grid2>
          </Section>
        </>
      )}
    </TabWrap>
  )
}

// ─── Пикер обложек ────────────────────────────────────────────────────────────
function CoverBlockPicker({ value, onChange, accent }) {
  const { covers, loading } = useCovers()

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      <div
        onClick={() => onChange(null)}
        style={{
          width: 80, height: 60,
          border: `2px solid ${!value ? accent : '#d9d9d9'}`,
          borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: 11, color: '#8c8c8c', background: '#fafafa',
        }}
      >Без картинки</div>

      {loading && [1,2,3].map(i => (
        <div key={i} style={{ width: 80, height: 60, borderRadius: 6, background: '#f0f0f0' }} />
      ))}

      {!loading && covers.map(cover => {
        const isSelected = value === cover.url
        return (
          <div
            key={cover.filename}
            title={cover.filename}
            style={{
              width: 80, height: 60,
              border: `2px solid ${isSelected ? accent : '#d9d9d9'}`,
              borderRadius: 6, overflow: 'hidden', position: 'relative',
              // Шахматка — видно формат картинки
              backgroundImage: 'linear-gradient(45deg, #dbdbdb 25%, #F6F0CF 25%, #F6F0CF 50%, #dbdbdb 50%, #dbdbdb 75%, #F6F0CF 75%, #F6F0CF 100%)',
              backgroundSize: '15px 15px',
            }}
          >
            {/* Картинка с просмотром — не трогает выбор */}
            <Image
              src={cover.url}
              alt={cover.filename}
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
              preview={{ mask: <span style={{ fontSize: 14 }}>🔍</span> }}
            />

            {/* Плашка "Выбрать" внизу */}
            <div
              onClick={() => onChange(isSelected ? null : cover.url)}
              style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: isSelected ? accent : 'rgba(0,0,0,0.45)',
                color: '#fff', fontSize: 10, fontWeight: 600,
                textAlign: 'center', padding: '2px 0', cursor: 'pointer',
                letterSpacing: '0.03em',
              }}
            >
              {isSelected ? '✓ Выбрано' : 'Выбрать'}
            </div>
          </div>
        )
      })}
    </div>
  )
}
