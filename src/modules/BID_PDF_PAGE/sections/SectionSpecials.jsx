import React, { useState, useEffect } from 'react'
import { Spin, Input, Button, Checkbox, Image } from 'antd'
import { DownOutlined, RightOutlined, UndoOutlined } from '@ant-design/icons'
import { getBidModels } from '../api'
import { HTTP_HOST } from '../../../config/config'
import { Section, Field, TabWrap } from '../components/FormParts'
import { useCovers } from '../components/CoversDrawer'

export default function SectionSpecials({ data, onChange, bidId, companyId }) {
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

  return (
    <TabWrap>
      {/* ── Обложка раздела ─────────────────────────────────────────────────── */}
      <Section title="Картинка на обложку раздела" description="Страница-заголовок раздела">
        <CoverPicker
          value={data.specialsCoverBlock}
          onChange={url => onChange({ ...data, specialsCoverBlock: url })}
          accent={accent}
        />
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
    </TabWrap>
  )
}

// ─── Пикер обложек — тянет с апи как в SectionCover ─────────────────────────
function CoverPicker({ value, onChange, accent }) {
  const { covers, loading } = useCovers()

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      <div
        onClick={() => onChange(null)}
        style={{
          width: 80, height: 60, border: `2px solid ${!value ? accent : '#d9d9d9'}`,
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
    </div>
  )
}
