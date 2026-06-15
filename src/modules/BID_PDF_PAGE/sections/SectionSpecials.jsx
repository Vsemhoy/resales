import React, { useState, useEffect } from 'react'
import { Spin, Input, Button, Checkbox, InputNumber, Segmented } from 'antd'
import { DownOutlined, RightOutlined, UndoOutlined } from '@ant-design/icons'
import { getBidModels } from '../api'
import { HTTP_HOST } from '../../../config/config'
import { Section, Field, TabWrap } from '../components/FormParts'
import { SectionNotes } from '../components/SectionNotes'

export default function SectionSpecials({ data, onChange, bidId, companyId, userRole }) {
  const accent = companyId === '3' ? '#269435' : '#FF5903'

  const [models,   setModels]   = useState([])
  const [loading,  setLoading]  = useState(false)
  const [expanded, setExpanded] = useState({})   // { [model_id]: bool }

  useEffect(() => {
    if (!bidId) return
    setLoading(true)
    getBidModels(bidId)
      .then(res => setModels(Array.isArray(res) ? res : (res?.models ?? [])))
      .catch(() => setModels([]))
      .finally(() => setLoading(false))
  }, [bidId])

  const ignored   = data.specialsIgnore    ?? []
  const overrides = data.specialsOverrides ?? {}

  const toggleIgnore = (id) => {
    const next = ignored.includes(id) ? ignored.filter(x => x !== id) : [...ignored, id]
    onChange({ ...data, specialsIgnore: next })
  }

  const toggleExpand = (id) =>
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  // Получить актуальный override для модели (или создать из оригинала)
  const getOverride = (model) => {
    const id = model.model_id ?? model.id
    if (overrides[id]) return overrides[id]
    return {
      description_kp: model.info_model?.description_kp ?? '',
      specials: (model.model_specials ?? []).map(s => s.special_name),
    }
  }

  const setOverride = (id, patch) => {
    onChange({
      ...data,
      specialsOverrides: {
        ...overrides,
        [id]: { ...getOverride({ model_id: id, info_model: models.find(m => (m.model_id ?? m.id) === id)?.info_model, model_specials: models.find(m => (m.model_id ?? m.id) === id)?.model_specials }), ...patch },
      },
    })
  }

  const resetOverride = (id) => {
    const next = { ...overrides }
    delete next[id]
    onChange({ ...data, specialsOverrides: next })
  }

  const imgBase = `${HTTP_HOST}/api/soma/pdf/modfiles/`
  const settings = data.specialsSettings ?? {}
  const setSetting = (key, val) => onChange({ ...data, specialsSettings: { ...settings, [key]: val } })

  return (
    <TabWrap>
      <Section title="Настройки вывода карточек">
        <Field label="Блоки">
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Checkbox
              checked={settings.showDescription ?? true}
              onChange={e => setSetting('showDescription', e.target.checked)}
            >Описание</Checkbox>
            <Checkbox
              checked={settings.showSpecials ?? true}
              onChange={e => setSetting('showSpecials', e.target.checked)}
            >Особенности</Checkbox>
            <Checkbox
              checked={settings.showChars ?? true}
              onChange={e => setSetting('showChars', e.target.checked)}
            >Характеристики</Checkbox>
          </div>
        </Field>
        <Field label="Характеристики">
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: '#595959' }}>Макс. штук:</span>
              <InputNumber
                min={1}
                max={30}
                value={settings.maxChars ?? 10}
                onChange={val => setSetting('maxChars', val)}
                style={{ width: 64 }}
                size="small"
              />
            </div>
            <Segmented
              size="small"
              value={settings.charsColumns ?? 2}
              onChange={val => setSetting('charsColumns', val)}
              options={[
                { label: '1 колонка', value: 1 },
                { label: '2 колонки', value: 2 },
              ]}
            />
          </div>
          {(settings.charsColumns ?? 2) === 2 && (
            <div style={{ fontSize: 11, color: '#bfbfbf', marginTop: 4 }}>
              При 2 колонках пункты длиннее 55 символов скрываются автоматически
            </div>
          )}
        </Field>
      </Section>

      {/* ── Список моделей ───────────────────────────────────────────────────── */}
      <Section title="Модели" description="Снимите галочку чтобы исключить модель. Раскройте карточку чтобы отредактировать тексты.">
        {loading && <div style={{ padding: 16, textAlign: 'center' }}><Spin size="small" /></div>}

        {!loading && models.length === 0 && (
          <div style={{ color: '#bfbfbf', fontSize: 12 }}>Модели не найдены</div>
        )}

        {!loading && models.map((model, idx) => {
          const id         = model.model_id ?? model.id
          const isIgnored  = ignored.includes(id)
          const isExpanded = !!expanded[id]
          const hasOverride= !!overrides[id]
          const name       = model.info_model?.name ?? `Модель #${id}`
          const shortNote  = model.info_model?.short_note ?? ''
          const ov         = getOverride(model)

          return (
            <div
              key={id}
              style={{
                border: `1px solid ${isExpanded ? accent : '#e8e8e8'}`,
                borderRadius: 8, marginBottom: 6, overflow: 'hidden',
                opacity: isIgnored ? 0.45 : 1,
                transition: 'opacity 0.15s, border-color 0.15s',
              }}
            >
              {/* ── Шапка карточки ─────────────────────────────────────────── */}
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                  background: isExpanded ? accent + '0d' : '#fafafa',
                  cursor: 'pointer', userSelect: 'none',
                }}
                onClick={() => !isIgnored && toggleExpand(id)}
              >
                {/* Номер */}
                <span style={{ color: accent, fontSize: 12, fontWeight: 700, width: 22, textAlign: 'right', flexShrink: 0 }}>
                  {idx + 1}
                </span>

                {/* Чекбокс включения */}
                <Checkbox
                  checked={!isIgnored}
                  onChange={e => { e.stopPropagation(); toggleIgnore(id) }}
                  onClick={e => e.stopPropagation()}
                />

                {/* Миниатюра */}
                <img
                  src={`${imgBase}${(model.info_model?.nameS ?? name).toLowerCase()}?size=xs`}
                  alt=""
                  style={{ height: 32, width: 48, objectFit: 'contain', flexShrink: 0 }}
                  onError={e => { e.target.style.display = 'none' }}
                />

                {/* Название + краткое описание */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#262626' }}>{name}</div>
                  {shortNote && <div style={{ fontSize: 11, color: '#8c8c8c', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{shortNote}</div>}
                </div>

                {/* Бейдж "изменено" */}
                {hasOverride && (
                  <span style={{ fontSize: 10, color: accent, background: accent + '1a', borderRadius: 4, padding: '2px 6px', flexShrink: 0 }}>
                    изменено
                  </span>
                )}

                {/* Стрелка */}
                {!isIgnored && (
                  <span style={{ color: '#bfbfbf', fontSize: 11, flexShrink: 0 }}>
                    {isExpanded ? <DownOutlined /> : <RightOutlined />}
                  </span>
                )}
              </div>

              {/* ── Раскрытая форма ─────────────────────────────────────────── */}
              {isExpanded && !isIgnored && (
                <div style={{ padding: '12px 14px', borderTop: `1px solid ${accent}33`, background: '#fff' }}>

                  <Field label="Описание для КП">
                    <Input.TextArea
                      autoSize={{ minRows: 3, maxRows: 8 }}
                      value={ov.description_kp}
                      onChange={e => setOverride(id, { ...ov, description_kp: e.target.value })}
                      placeholder={model.info_model?.description_kp ?? 'Описание...'}
                    />
                  </Field>

                  <Field label="Тезисы">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {ov.specials.map((sp, si) => (
                        <div key={si} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <span style={{ color: accent, fontSize: 11, width: 16, textAlign: 'right', flexShrink: 0 }}>•</span>
                          <Input
                            value={sp}
                            onChange={e => {
                              const next = [...ov.specials]
                              next[si] = e.target.value
                              setOverride(id, { ...ov, specials: next })
                            }}
                            placeholder={`Тезис ${si + 1}`}
                          />
                          <button
                            onClick={() => setOverride(id, { ...ov, specials: ov.specials.filter((_, i) => i !== si) })}
                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ff4d4f', fontSize: 16, flexShrink: 0 }}
                          >×</button>
                        </div>
                      ))}
                      <Button
                        size="small"
                        onClick={() => setOverride(id, { ...ov, specials: [...ov.specials, ''] })}
                        style={{ alignSelf: 'flex-start', marginTop: 2 }}
                      >+ Тезис</Button>
                    </div>
                  </Field>

                  {/* Сбросить к оригиналу */}
                  {hasOverride && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #f0f0f0' }}>
                      <Button
                        size="small"
                        icon={<UndoOutlined />}
                        onClick={() => resetOverride(id)}
                        style={{ color: '#8c8c8c' }}
                      >Сбросить к оригиналу</Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </Section>

      <SectionNotes
        notes={data._sectionNotes?.specials}
        onChange={notes => onChange({ ...data, _sectionNotes: { ...data._sectionNotes, specials: notes } })}
        backcolor={companyId === '3' ? '#269435' : '#FF5903'}
        userRole={userRole}
      />
    </TabWrap>
  )
}
