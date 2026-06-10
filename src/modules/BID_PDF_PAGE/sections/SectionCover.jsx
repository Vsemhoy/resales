import React, { useRef, useState } from 'react'
import { Button, Input, Segmented } from 'antd'
import { PlusOutlined, UndoOutlined } from '@ant-design/icons'
import { Image } from 'antd'
import { Section, Field, Grid2, TabWrap } from '../components/FormParts'
import { useCovers, CoversDrawer } from '../components/CoversDrawer'

const SITE_DEFAULTS = { '2': 'arstel.com', '3': 'rondo-sound.ru' }

const FOOTER_LOGO_OPTIONS = [
  { key: 'arstel',  label: 'Arstel',  src: '/brands/footer/logo_arstel.png'  },
  { key: 'rondo',   label: 'Rondo',   src: '/brands/footer/logo_rondo.png'   },
  { key: 'interm',  label: 'Inter-M', src: '/brands/footer/logo_interm.png'  },
  { key: 'affa',    label: 'AFFA',    src: '/brands/footer/logo_affa.png'    },
  { key: 'lda',     label: 'LDA',     src: '/brands/footer/logo_lda.png'     },
]

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

function formatToday() {
  const d = new Date()
  return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`
}

export default function SectionCover({ data, onChange, draftId, companyId }) {
  const accent    = companyId === '3' ? '#269435' : '#FF5903'
  const set       = (key, val) => onChange({ ...data, [key]: val })
  const coverMode = data.coverMode ?? 'hat'   // дефолт — шапка

  // Снимок первоначальных значений с бэка (только при первом рендере)
  const initRef = useRef(null)
  if (!initRef.current) {
    initRef.current = {
      date:          formatToday(),
      ext_number:    data.ext_number    || '',
      target_name:   data.target_name   || '',
      target_occupy: data.target_occupy || '',  // уже собран в BidPdfEditor (роль + название орг.)
      manager_name:  data.manager_name  || '',
      manager_occupy:data.manager_occupy|| '',
      tel:           data.tel           || '',
      email:         data.email         || '',
    }
  }
  const D = initRef.current

  const companyName = data.client_company?.name || ''

  const hatHeaderTextDefault = HAT_HEADER_TEXT_DEFAULTS[String(companyId)] ?? ''
  const hatHeaderTextValue   = data.hatHeaderText ?? hatHeaderTextDefault
  const hatHeaderTextChanged = data.hatHeaderText !== undefined && data.hatHeaderText !== hatHeaderTextDefault

  // Хелпер: поле с кнопкой сброса к дефолту
  const ResetField = ({ label, fieldKey, placeholder, textarea }) => {
    const current  = data[fieldKey] ?? D[fieldKey]
    const changed  = current !== D[fieldKey]
    const InputEl  = textarea ? Input.TextArea : Input
    return (
      <Field label={label}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
          <InputEl
            placeholder={placeholder}
            value={current}
            onChange={e => set(fieldKey, e.target.value)}
            autoSize={textarea ? { minRows: 2 } : undefined}
            style={{ flex: 1 }}
          />
          {changed && (
            <Button size="small" icon={<UndoOutlined />}
              title="Сбросить к исходному значению"
              onClick={() => set(fieldKey, D[fieldKey])}
              style={{ flexShrink: 0 }}
            />
          )}
        </div>
      </Field>
    )
  }

  return (
    <TabWrap>
      {/* Режим обложки */}
      <Section title="Вид первой страницы">
        <Segmented
          value={coverMode}
          onChange={v => set('coverMode', v)}
          options={[
            { label: '📄 Обложка', value: 'cover', disabled: true },
            { label: '🖼 Шапка',   value: 'hat' },
          ]}
          style={{ marginBottom: 8 }}
        />
        <div style={{ fontSize: 12, color: '#8c8c8c' }}>
          Баннер во всю ширину без полей — потом строка с реквизитами
        </div>
      </Section>

      {/* РЕЖИМ: ШАПКА */}
      <Section title="Картинка-баннер" description="Растягивается на всю ширину страницы без полей">
        <CoverBlockPicker value={data.hatImage ?? null} onChange={url => set('hatImage', url)} accent={accent} companyId={companyId} type="hat" />
      </Section>

      <Section title="Текст шапки" description="Показывается справа снизу на баннере">
        <Field label="Текст шапки">
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
            <Input.TextArea
              value={hatHeaderTextValue}
              onChange={e => set('hatHeaderText', e.target.value)}
              autoSize={{ minRows: 5 }}
              style={{ width: '100%', textAlign: 'right' }}
            />
            {hatHeaderTextChanged && (
              <Button size="small" icon={<UndoOutlined />}
                title="Сбросить к дефолтному тексту шапки компании"
                onClick={() => set('hatHeaderText', hatHeaderTextDefault)}
                style={{ flexShrink: 0 }}
              />
            )}
          </div>
        </Field>
      </Section>

      <Section title="Реквизиты" description="Строка под баннером">
        <Grid2>
          {/* Дата — дефолт сегодня */}
          <Field label="Дата">
            <div style={{ display: 'flex', gap: 6 }}>
              <Input
                placeholder={formatToday()}
                value={data.date ?? D.date}
                onChange={e => set('date', e.target.value)}
              />
              {(data.date ?? D.date) !== D.date && (
                <Button size="small" icon={<UndoOutlined />}
                  title="Сбросить к сегодняшней дате"
                  onClick={() => set('date', D.date)}
                />
              )}
            </div>
          </Field>

          <ResetField label="Исходящий номер" fieldKey="ext_number" placeholder="129874" />

          {/* Кому: должность+компания сверху, имя снизу */}
          <ResetField
            label="Кому — должность и организация"
            fieldKey="target_occupy"
            placeholder={companyName ? `Директору ${companyName}` : 'Менеджеру ООО «Кабель Контракт Юг»'}
          />
          <ResetField
            label="Кому — имя"
            fieldKey="target_name"
            placeholder="Ромашнику Гиви Рашидову"
          />
        </Grid2>
      </Section>

      <Section title="Заголовок КП" description="По центру под реквизитами">
        <Field>
          <div style={{ display: 'flex', gap: 6 }}>
            <Input
              value={data.coverTitle ?? 'Коммерческое предложение'}
              onChange={e => set('coverTitle', e.target.value)}
              placeholder="Коммерческое предложение"
            />
            {data.coverTitle && data.coverTitle !== 'Коммерческое предложение' && (
              <Button size="small" icon={<UndoOutlined />}
                title="Сбросить к стандартному"
                onClick={() => set('coverTitle', 'Коммерческое предложение')}
              />
            )}
          </div>
        </Field>
      </Section>

      <Section title="Менеджер">
        <Grid2>
          <ResetField label="Имя"       fieldKey="manager_name"   placeholder="Кошелев Александр" />
          <ResetField label="Должность" fieldKey="manager_occupy" placeholder="Коммерческий директор" />
          <ResetField label="Телефон"   fieldKey="tel"            placeholder="+7 (812) 123-45-67" />
          <ResetField label="Email"     fieldKey="email"          placeholder="sales@arstel.com" />
        </Grid2>
      </Section>

      {/* ─── Конструктор подвала ──────────────────────────────────────────── */}
      <FooterSection data={data} set={set} companyId={companyId} />

    </TabWrap>
  )
}

// ─── Пикер обложек ────────────────────────────────────────────────────────────
function CoverBlockPicker({ value, onChange, accent, companyId, type = 'cover' }) {
  const { covers, loading, reload } = useCovers(companyId)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const filtered = covers.filter(c => c.filename.startsWith(type + '_'))

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <div
          onClick={() => onChange(null)}
          style={{
            width: 80, height: 60, borderRadius: 6, flexShrink: 0,
            border: `2px solid ${!value ? accent : '#d9d9d9'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: 11, color: '#8c8c8c', background: '#fafafa',
          }}
        >Без картинки</div>

        {loading && [1,2,3].map(i => (
          <div key={i} style={{ width: 80, height: 60, borderRadius: 6, background: '#f0f0f0', flexShrink: 0 }} />
        ))}

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
                src={cover.url} alt={cover.filename}
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

// ─── Конструктор подвала ──────────────────────────────────────────────────────
function FooterSection({ data, set, companyId }) {
  const fs        = data.footerSettings || {}
  const setFs     = (key, val) => set('footerSettings', { ...fs, [key]: val })
  const mode      = fs.mode     || 'text'
  const siteText  = fs.siteText ?? SITE_DEFAULTS[String(companyId)] ?? ''
  const logos     = fs.logos    || []
  const siteDefault = SITE_DEFAULTS[String(companyId)] ?? ''

  const toggleLogo = (key) => {
    if (logos.includes(key)) {
      setFs('logos', logos.filter(k => k !== key))
    } else if (logos.length < 2) {
      setFs('logos', [...logos, key])
    }
  }

  return (
    <div style={{ outline: '14px solid rgb(252 250 241)', boxShadow: 'rgba(0, 0, 0, 0.29) 1px -3px 0px 13px', marginTop: '32px' }}>
    <div style={{ background: '#f6f0cf4d', outline: '4px dashed rgb(252 250 241)', boxShadow: '0px -8px 0px #0000004a', marginTop: '32px', paddingTop: '12px' }}>
    <Section title="Подвал" description="Отображается на каждой странице PDF">
      <Field label="Режим">
        <Segmented
          size="small"
          value={mode}
          onChange={v => setFs('mode', v)}
          options={[
            { label: 'Текст сайта', value: 'text'  },
            { label: 'Логотипы',   value: 'logos' },
          ]}
        />
      </Field>

      {mode === 'text' && (
        <Field label="Текст">
          <div style={{ display: 'flex', gap: 6 }}>
            <Input
              value={siteText}
              onChange={e => setFs('siteText', e.target.value)}
              placeholder={siteDefault}
            />
            {siteText !== siteDefault && (
              <Button size="small" icon={<UndoOutlined />}
                title="Сбросить к дефолту компании"
                onClick={() => setFs('siteText', siteDefault)}
              />
            )}
          </div>
        </Field>
      )}

      {mode === 'logos' && (
        <Field label={`Логотипы (макс. 2, выбрано ${logos.length})`}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {FOOTER_LOGO_OPTIONS.map(opt => {
              const selected = logos.includes(opt.key)
              const disabled = !selected && logos.length >= 2
              return (
                <div
                  key={opt.key}
                  onClick={() => !disabled && toggleLogo(opt.key)}
                  style={{
                    border:       `2px solid ${selected ? '#1677ff' : '#d9d9d9'}`,
                    borderRadius:  6,
                    padding:      '6px 10px',
                    cursor:        disabled ? 'not-allowed' : 'pointer',
                    opacity:       disabled ? 0.4 : 1,
                    background:    selected ? '#e6f4ff' : '#fafafa',
                    display:      'flex',
                    alignItems:   'center',
                    gap:           6,
                    transition:   'all 0.15s',
                  }}
                >
                  <img src={opt.src} alt={opt.label} style={{ height: 18, objectFit: 'contain' }} />
                  <span style={{ fontSize: 11, color: selected ? '#1677ff' : '#595959', fontWeight: selected ? 600 : 400 }}>
                    {opt.label}
                  </span>
                </div>
              )
            })}
          </div>
          {logos.length === 2 && (
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>
              Максимум 2 логотипа. Снимите выбор чтобы добавить другой.
            </div>
          )}
        </Field>
      )}
    </Section>
    </div>
    </div>
  )
}
