import React, { useState, useEffect } from 'react'
import { Spin, Input, Button, Checkbox, InputNumber, Segmented, Tooltip } from 'antd'
import { DownOutlined, RightOutlined, UndoOutlined, WarningOutlined } from '@ant-design/icons'
import { getBidModels } from '../api'
import { HTTP_HOST } from '../../../config/config'
import { Section, Field, TabWrap } from '../components/FormParts'
import { SectionNotes } from '../components/SectionNotes'

function getModelKey(model, index) {
  const rowId = model.bid_model_id ?? model.id
  return rowId != null ? `bid_model_${rowId}` : `model_${model.model_id ?? 'unknown'}_${index}`
}

function getLegacyModelKey(model) {
  return model.model_id ?? model.id
}

function hasText(value) {
  return String(value ?? '').replace(/<[^>]*>/g, ' ').trim().length > 0
}

function getModelProperties(model) {
  return model.model_properties ?? model.properties ?? model.characteristics ?? []
}

function getModelIssues(model, override, hasMissingImage = false) {
  const specials = override?.specials ?? []
  return {
    noDescription: !hasText(override?.description_kp),
    noSpecials: !specials.some(hasText),
    noProperties: getModelProperties(model).length === 0,
    noImage: hasMissingImage,
  }
}

const MODEL_ISSUE_FILTERS = [
  { value: 'noDescription', label: '\u041d\u0435\u0442 \u043e\u043f\u0438\u0441\u0430\u043d\u0438\u044f' },
  { value: 'noSpecials', label: '\u041d\u0435\u0442 \u0442\u0435\u0437\u0438\u0441\u043e\u0432' },
  { value: 'noProperties', label: '\u041d\u0435\u0442 \u0441\u0432\u043e\u0439\u0441\u0442\u0432' },
  { value: 'noImage', label: '\u041d\u0435\u0442 \u0444\u043e\u0442\u043e' },
]

const MODEL_ISSUE_LABELS = {
  noDescription: '\u043d\u0435\u0442 \u043e\u043f\u0438\u0441\u0430\u043d\u0438\u044f',
  noSpecials: '\u043d\u0435\u0442 \u0442\u0435\u0437\u0438\u0441\u043e\u0432',
  noProperties: '\u043d\u0435\u0442 \u0441\u0432\u043e\u0439\u0441\u0442\u0432',
  noImage: '\u043d\u0435\u0442 \u0444\u043e\u0442\u043e',
}

export default function SectionSpecials({ data, onChange, bidId, companyId, userRole }) {
  const accent = companyId === '3' ? '#269435' : '#FF5903'

  const [models,   setModels]   = useState([])
  const [loading,  setLoading]  = useState(false)
  const [expanded, setExpanded] = useState({})   // { [model_id]: bool }
  const [issueFilters, setIssueFilters] = useState([])
  const [missingImages, setMissingImages] = useState({})

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

  const modelEntries = models.map((model, index) => ({
    id: getModelKey(model, index),
    legacyId: getLegacyModelKey(model),
  }))

  const toggleIgnore = (id, legacyId, shiftKey) => {
    const isIgnored = ignored.includes(id) || ignored.includes(legacyId)
    const shouldIgnore = !isIgnored
    const keys = new Set(modelEntries.flatMap((entry) => [entry.id, entry.legacyId]))
    const next = shiftKey
      ? (shouldIgnore ? [...new Set([...ignored, ...modelEntries.map((entry) => entry.id)])] : ignored.filter((key) => !keys.has(key)))
      : (shouldIgnore ? [...ignored, id] : ignored.filter((key) => key !== id && key !== legacyId))
    onChange({ ...data, specialsIgnore: next })
  }

  const toggleExpand = (id, shiftKey) => {
    const shouldExpand = !expanded[id]
    setExpanded(prev => shiftKey
      ? Object.fromEntries(modelEntries.map((entry) => [entry.id, shouldExpand]))
      : { ...prev, [id]: shouldExpand })
  }

  // Получить актуальный override для модели (или создать из оригинала)
  const getOverride = (model, index) => {
    const id = getModelKey(model, index)
    const legacyId = getLegacyModelKey(model)
    if (overrides[id] || overrides[legacyId]) return overrides[id] ?? overrides[legacyId]
    return {
      description_kp: model.info_model?.description_kp ?? '',
      specials: (model.model_specials ?? []).map(s => s.special_name),
    }
  }

  const setOverride = (model, index, patch) => {
    const id = getModelKey(model, index)
    onChange({
      ...data,
      specialsOverrides: {
        ...overrides,
        [id]: { ...getOverride(model, index), ...patch },
      },
    })
  }

  const resetOverride = (model, index) => {
    const next = { ...overrides }
    delete next[getModelKey(model, index)]
    onChange({ ...data, specialsOverrides: next })
  }

  const imgBase = `${HTTP_HOST}/api/soma/pdf/modfiles/`

  const setImageMissing = (id, isMissing) => {
    setMissingImages(prev => prev[id] === isMissing ? prev : { ...prev, [id]: isMissing })
  }

  const getModelImageSrc = (model, index) => {
    const modelName = model.info_model?.name ?? `\u041c\u043e\u0434\u0435\u043b\u044c #${model.model_id ?? model.id ?? index + 1}`
    return `${imgBase}${(model.info_model?.nameS ?? modelName).toLowerCase()}?size=xs`
  }

  useEffect(() => {
    if (!models.length) return undefined

    let cancelled = false
    models.forEach((model, index) => {
      const id = getModelKey(model, index)
      const img = new Image()
      img.onload = () => { if (!cancelled) setImageMissing(id, false) }
      img.onerror = () => { if (!cancelled) setImageMissing(id, true) }
      img.src = getModelImageSrc(model, index)
    })

    return () => { cancelled = true }
  }, [models, imgBase])

  const settings = data.specialsSettings ?? {}
  const setSetting = (key, val) => onChange({ ...data, specialsSettings: { ...settings, [key]: val } })

  const visibleModels = issueFilters.length === 0
    ? models
    : models.filter((model, index) => {
      const id = getModelKey(model, index)
      const issues = getModelIssues(model, getOverride(model, index), !!missingImages[id])
      return issueFilters.some(filter => issues[filter])
    })

  const issueCounts = models.reduce((acc, model, index) => {
    const id = getModelKey(model, index)
    const issues = getModelIssues(model, getOverride(model, index), !!missingImages[id])
    Object.entries(issues).forEach(([key, hasIssue]) => {
      if (hasIssue) acc[key] = (acc[key] ?? 0) + 1
    })
    return acc
  }, {})

  const toggleIssueFilter = (filter) => {
    setIssueFilters(prev => prev.includes(filter)
      ? prev.filter(item => item !== filter)
      : [...prev, filter])
  }

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

        {!loading && models.length > 0 && (
          <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: '#8c8c8c' }}>{'\u0424\u0438\u043b\u044c\u0442\u0440:'}</span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {MODEL_ISSUE_FILTERS.map(filter => {
                const isActive = issueFilters.includes(filter.value)
                const count = issueCounts[filter.value] ?? 0
                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => toggleIssueFilter(filter.value)}
                    style={{
                      border: `1px solid ${isActive ? accent : '#d9d9d9'}`,
                      background: isActive ? accent + '14' : '#fafafa',
                      color: isActive ? accent : '#595959',
                      borderRadius: 999,
                      padding: '3px 9px',
                      fontSize: 12,
                      lineHeight: '18px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span>{filter.label}</span>
                    <span style={{
                      minWidth: 18,
                      height: 18,
                      padding: '0 5px',
                      borderRadius: 999,
                      background: isActive ? accent : '#e8e8e8',
                      color: isActive ? '#fff' : '#8c8c8c',
                      fontSize: 11,
                      fontWeight: 700,
                      textAlign: 'center',
                    }}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
            {issueFilters.length > 0 && (
              <span style={{ fontSize: 12, color: '#bfbfbf' }}>
                {visibleModels.length} / {models.length}
              </span>
            )}
          </div>
        )}
        {!loading && models.length === 0 && (
          <div style={{ color: '#bfbfbf', fontSize: 12 }}>Модели не найдены</div>
        )}

        {!loading && models.length > 0 && visibleModels.length === 0 && (
          <div style={{ color: '#bfbfbf', fontSize: 12 }}>
            {'\u041f\u043e \u0432\u044b\u0431\u0440\u0430\u043d\u043d\u044b\u043c \u0444\u0438\u043b\u044c\u0442\u0440\u0430\u043c \u043c\u043e\u0434\u0435\u043b\u0438 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u044b'}
          </div>
        )}

        {!loading && visibleModels.map((model) => {
          const idx        = models.indexOf(model)
          const id         = getModelKey(model, idx)
          const legacyId   = getLegacyModelKey(model)
          const isIgnored  = ignored.includes(id) || ignored.includes(legacyId)
          const isExpanded = !!expanded[id]
          const hasOverride= !!(overrides[id] || overrides[legacyId])
          const name       = model.info_model?.name ?? `Модель #${model.model_id ?? model.id ?? idx + 1}`
          const shortNote  = model.info_model?.short_note ?? ''
          const ov         = getOverride(model, idx)
          const issues     = getModelIssues(model, ov, !!missingImages[id])
          const issueNames = Object.entries(issues)
            .filter(([, hasIssue]) => hasIssue)
            .map(([key]) => MODEL_ISSUE_LABELS[key])
          const hasIssue   = issueNames.length > 0

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
                onClick={event => !isIgnored && toggleExpand(id, event.shiftKey)}
              >
                {/* Номер */}
                <span style={{ color: accent, fontSize: 12, fontWeight: 700, width: 22, textAlign: 'right', flexShrink: 0 }}>
                  {idx + 1}
                </span>

                {/* Чекбокс включения */}
                <Checkbox
                  checked={!isIgnored}
                  onChange={e => { e.stopPropagation(); toggleIgnore(id, legacyId, e.nativeEvent?.shiftKey) }}
                  onClick={e => e.stopPropagation()}
                />

                {/* Миниатюра */}
                <img
                  src={getModelImageSrc(model, idx)}
                  alt=""
                  style={{ height: 32, width: 48, objectFit: 'contain', flexShrink: 0 }}
                  onLoad={e => { e.currentTarget.style.display = ''; setImageMissing(id, false) }}
                  onError={e => { e.currentTarget.style.display = 'none'; setImageMissing(id, true) }}
                />

                {/* Название + краткое описание */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#262626' }}>
                    <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
                    {hasIssue && (
                      <Tooltip title={`\u041d\u0443\u0436\u043d\u043e \u043f\u0440\u0438\u0447\u0435\u0441\u0430\u0442\u044c: ${issueNames.join(', ')}`}>
                        <WarningOutlined style={{ color: '#faad14', flexShrink: 0 }} />
                      </Tooltip>
                    )}
                  </div>
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
                      onChange={e => setOverride(model, idx, { ...ov, description_kp: e.target.value })}
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
                              setOverride(model, idx, { ...ov, specials: next })
                            }}
                            placeholder={`Тезис ${si + 1}`}
                          />
                          <button
                            onClick={() => setOverride(model, idx, { ...ov, specials: ov.specials.filter((_, i) => i !== si) })}
                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ff4d4f', fontSize: 16, flexShrink: 0 }}
                          >×</button>
                        </div>
                      ))}
                      <Button
                        size="small"
                        onClick={() => setOverride(model, idx, { ...ov, specials: [...ov.specials, ''] })}
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
                        onClick={() => resetOverride(model, idx)}
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
