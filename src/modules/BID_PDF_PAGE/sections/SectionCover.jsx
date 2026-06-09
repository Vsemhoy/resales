import React, { useState } from 'react'
import { Button, Input, Segmented } from 'antd'
import { PlusOutlined, PictureOutlined, UndoOutlined } from '@ant-design/icons'
import { Image } from 'antd'
import { Section, Field, Grid2, TabWrap } from '../components/FormParts'
import { useCovers, CoversDrawer } from '../components/CoversDrawer'

const HAT_HEADER_TEXT_DEFAULTS = {
  '2': `ООО «АРСТЕЛ»
+7 (812) 207-50-97
sales@arstel.com
www.arstel.com`,
  '3': `ООО «РОНДО-САУНД»
196006, Россия, Санкт-Петербург
Московский проспект, дом 91, литера А
помещение 11Н, офис 229
zakaz@rondo-sound.ru
www.rondo-sound.ru
+7 (812) 339 8972`,
}

export default function SectionCover({ data, onChange, draftId, companyId }) {
  const accent    = companyId === '3' ? '#269435' : '#FF5903'
  const set       = (key, val) => onChange({ ...data, [key]: val })
  const coverMode = data.coverMode ?? 'cover'   // 'cover' | 'hat'
  const hatHeaderTextDefault = HAT_HEADER_TEXT_DEFAULTS[String(companyId)] ?? ''
  const hatHeaderTextValue = data.hatHeaderText ?? hatHeaderTextDefault
  const hatHeaderTextChanged = data.hatHeaderText !== undefined && data.hatHeaderText !== hatHeaderTextDefault

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
            <CoverBlockPicker value={data.coverBlock ?? null} onChange={url => set('coverBlock', url)} accent={accent} companyId={companyId} type="cover" />
          </Section>
        </>
      )}

      {/* РЕЖИМ: ШАПКА */}
      {coverMode === 'hat' && (
        <>
          <Section title="Картинка-баннер" description="Растягивается на всю ширину страницы без полей (~1/4 высоты)">
            <CoverBlockPicker value={data.hatImage ?? null} onChange={url => set('hatImage', url)} accent={accent} companyId={companyId} type="hat" />
          </Section>

          <Section title="Текст шапки" description="Показывается справа под баннером">
            <Field label="Текст шапки">
              <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                <Input.TextArea
                  value={hatHeaderTextValue}
                  onChange={e => set('hatHeaderText', e.target.value)}
                  autoSize={{ minRows: 5 }}
                  style={{ width: '100%', textAlign: 'right' }}
                />
                {hatHeaderTextChanged && (
                  <Button
                    size="small"
                    icon={<UndoOutlined />}
                    title="Сбросить к дефолтному тексту шапки компании"
                    onClick={() => set('hatHeaderText', hatHeaderTextDefault)}
                    style={{ flexShrink: 0 }}
                  />
                )}
              </div>
              {!data.hatHeaderText && hatHeaderTextDefault && (
                <div style={{ fontSize: 11, color: '#bfbfbf', marginTop: 3 }}>
                  Подставлен дефолт для компании
                </div>
              )}
            </Field>
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
// ─── Пикер обложек ────────────────────────────────────────────────────────────
function CoverBlockPicker({ value, onChange, accent, companyId, type = 'cover' }) {
  const { covers, loading, reload } = useCovers(companyId)  // единственный инстанс
  const [drawerOpen, setDrawerOpen] = useState(false)

  const filtered = covers.filter(c => c.filename.startsWith(type + '_'))

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {/* Без картинки */}
        <div
          onClick={() => onChange(null)}
          style={{
            width: 80, height: 60, borderRadius: 6, flexShrink: 0,
            border: `2px solid ${!value ? accent : '#d9d9d9'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: 11, color: '#8c8c8c', background: '#fafafa',
          }}
        >Без картинки</div>

        {/* Скелетоны */}
        {loading && [1,2,3].map(i => (
          <div key={i} style={{ width: 80, height: 60, borderRadius: 6, background: '#f0f0f0', flexShrink: 0 }} />
        ))}

        {/* Тайлы */}
        {!loading && filtered.map(cover => {
          const isSelected = value === cover.url
          return (
            <div
              key={cover.filename}
              title={cover.filename.replace(/^(cover|hat)_/, '')}
              style={{
                width: 80, height: 60, borderRadius: 6, flexShrink: 0,
                border: `2px solid ${isSelected ? accent : '#d9d9d9'}`,
                overflow: 'hidden', position: 'relative', cursor: 'pointer',
                backgroundImage: 'linear-gradient(45deg, #dbdbdb 25%, #F6F0CF 25%, #F6F0CF 50%, #dbdbdb 50%, #dbdbdb 75%, #F6F0CF 75%, #F6F0CF 100%)',
                backgroundSize: '15px 15px',
              }}
            >
              <Image
                src={cover.url}
                alt={cover.filename}
                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                preview={{ mask: <span style={{ fontSize: 14 }}>🔍</span> }}
              />
              <div
                onClick={() => onChange(isSelected ? null : cover.url)}
                style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  background: isSelected ? accent : 'rgba(0,0,0,0.45)',
                  color: '#fff', fontSize: 10, fontWeight: 600,
                  textAlign: 'center', padding: '2px 0', cursor: 'pointer',
                }}
              >
                {isSelected ? '✓ Выбрано' : 'Выбрать'}
              </div>
            </div>
          )
        })}

        {/* + Добавить */}
        {!loading && (
          <div
            onClick={() => setDrawerOpen(true)}
            style={{
              width: 80, height: 60, borderRadius: 6, flexShrink: 0,
              border: '2px dashed #d9d9d9',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 2,
              cursor: 'pointer', color: '#8c8c8c', background: '#fafafa',
              fontSize: 10, transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#d9d9d9'; e.currentTarget.style.color = '#8c8c8c' }}
          >
            <PlusOutlined style={{ fontSize: 16 }} />
            <span>Добавить</span>
          </div>
        )}
      </div>

      {/* Дровер получает covers и reload — своего стейта не держит */}
      <CoversDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        selectedUrl={value}
        onSelect={onChange}
        companyId={companyId}
        type={type}
        covers={filtered}
        onReload={reload}
      />
    </>
  )
}
