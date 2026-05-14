import React, { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Select, Checkbox, ConfigProvider, Spin, Tooltip } from 'antd'
import { BarsOutlined, FileOutlined, CodepenOutlined, PrinterOutlined } from '@ant-design/icons'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { getDraft } from './api'
import { restoreFilesIntoFormData } from './api/files'
import { useAutoSave } from './useAutoSave'
import {
  CURRENCY_OPTIONS, COMPANY_OPTIONS, ORIENTATION_OPTIONS, TARGET_OPTIONS,
  getVisibleSections, DEFAULT_SECTION_ORDER, DEFAULT_ENABLED,
} from './sectionConfig'
import classes from './BidPdfEditor.module.css'
import { SectionMiniPreview } from './components/SectionMiniPreview'

import SectionCover           from './sections/SectionCover'
import SectionToc             from './sections/SectionToc'
import SectionFeatures        from './sections/SectionFeatures'
import SectionSelectEquipment from './sections/SectionSelectEquipment'
import SectionAcoustic        from './sections/SectionAcoustic'
import SectionRecommendations from './sections/SectionRecommendations'
import SectionSpecials        from './sections/SectionSpecials'
import SectionSpecifications from './sections/SectionSpecifications'
import SectionRondoDelivery   from './sections/SectionRondoDelivery'

const SECTION_COMPONENTS = {
  cover:           SectionCover,
  toc:             SectionToc,
  features:        SectionFeatures,
  selectEquipment: SectionSelectEquipment,
  acoustic:        SectionAcoustic,
  recommendations: SectionRecommendations,
  specials:        SectionSpecials,
  specifications:  SectionSpecifications,
  rondoDelivery:   SectionRondoDelivery,
}

const COMPANY_ACCENT = { '2': '#FF5903', '3': '#269435' }

const COMPACT_THEME = {
  token: { borderRadius: 4, fontSize: 13 },
  components: {
    Button: { controlHeight: 30, fontSize: 13 },
    Select: { controlHeight: 30, fontSize: 13 },
  },
}

export default function BidPdfEditor() {
  const { bidId, draftId } = useParams()

  const [draft,    setDraft]    = useState(null)
  const [formData, setFormData] = useState({})
  const [loading,  setLoading]  = useState(true)
  const [isReady,  setIsReady]  = useState(false)

  const [companyId,    setCompanyId]    = useState('2')
  const [orientation,  setOrientation]  = useState('v')
  const [targetSystem, setTargetSystem] = useState('t')
  const [currency,     setCurrency]     = useState({ label: '₽', value: '3' })

  const [enabledSections, setEnabledSections] = useState(DEFAULT_ENABLED)
  const [sectionOrder,    setSectionOrder]    = useState(DEFAULT_SECTION_ORDER)
  const [activeSection,   setActiveSection]   = useState('cover')

  const { status: saveStatus, errMsg: saveErr } = useAutoSave(draftId, formData, currency, 2000, isReady)

  useEffect(() => {
    getDraft(draftId)
      .then(data => {
        setDraft(data)
        if (data.currency) setCurrency(data.currency)
        const fd = restoreFilesIntoFormData(data.form_data || {})
        const meta = fd._meta || {}
        setCompanyId(   meta.companyId    ?? String(data.id_company ?? '2'))
        setOrientation( meta.orientation  ?? 'v')
        setTargetSystem(meta.targetSystem ?? (data.kp_type === 2 ? 'p' : 't'))
        if (fd._enabledSections) setEnabledSections(prev => ({ ...prev, ...fd._enabledSections }))
        if (fd._sectionOrder)    setSectionOrder(fd._sectionOrder)
        setFormData(fd)
        setTimeout(() => setIsReady(true), 100)
      })
      .catch(e => console.error('Ошибка загрузки драфта:', e))
      .finally(() => setLoading(false))
  }, [draftId])

  const syncMeta = useCallback((patch) => {
    setFormData(fd => ({ ...fd, _meta: { ...(fd._meta || {}), ...patch } }))
  }, [])

  const handleCompany     = (v) => { setCompanyId(v);    syncMeta({ companyId: v }) }
  const handleOrientation = (v) => { setOrientation(v);  syncMeta({ orientation: v }) }
  const handleTarget      = (v) => { setTargetSystem(v); syncMeta({ targetSystem: v }) }
  const handleCurrency    = (v) => {
    const opt = CURRENCY_OPTIONS.find(o => o.value === v)
    setCurrency({ value: v, label: opt?.label ?? '₽' })
  }

  const toggleSection = useCallback((key) => {
    setEnabledSections(prev => {
      const next = { ...prev, [key]: !prev[key] }
      setFormData(fd => ({ ...fd, _enabledSections: next }))
      return next
    })
  }, [])

  const handleFormChange = useCallback((newData) => setFormData(newData), [])

  const handleDragEnd = ({ source, destination }) => {
    if (!destination || source.index === destination.index) return

    const draggableKeys = orderedDraggable.map(s => s.key)
    const newKeys       = [...draggableKeys]
    const [moved]       = newKeys.splice(source.index, 1)
    newKeys.splice(destination.index, 0, moved)

    // Вставляем новый порядок драггабельных обратно в полный sectionOrder
    const newOrder = [...sectionOrder]
    let vi = 0
    for (let i = 0; i < newOrder.length; i++) {
      if (draggableKeys.includes(newOrder[i])) newOrder[i] = newKeys[vi++]
    }

    setSectionOrder(newOrder)
    setFormData(fd => ({ ...fd, _sectionOrder: newOrder }))
  }

  // Видимые секции по targetSystem и в нужном порядке
  const visible        = getVisibleSections(targetSystem)
  const orderedVisible = sectionOrder.map(k => visible.find(s => s.key === k)).filter(Boolean)

  // Обложка — первая, TOC — последняя, всё остальное — драгабельная зона
  const coverSection      = orderedVisible.find(s => s.key === 'cover')
  const tocSection        = orderedVisible.find(s => s.key === 'toc')
  const orderedDraggable  = orderedVisible.filter(s => s.key !== 'cover' && s.key !== 'toc')

  const accent        = COMPANY_ACCENT[companyId] ?? '#FF5903'
  const activeSecDef  = orderedVisible.find(s => s.key === activeSection)
  const ActiveSection = activeSecDef ? SECTION_COMPONENTS[activeSecDef.key] : null

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 12 }}>
        <Spin size="large" />
        <span style={{ color: '#8c8c8c', fontSize: 13 }}>Загружаем КП...</span>
      </div>
    )
  }

  const renderSectionRow = (section, dragProps = {}, snapshot = {}) => {
    const isEnabled = section.required || enabledSections[section.key]
    const isActive  = activeSection === section.key
    return (
      <div
        className={[
          classes.sectionRow,
          isActive            ? classes.sectionRowActive   : '',
          !isEnabled          ? classes.sectionRowDisabled : '',
          snapshot.isDragging ? classes.sectionRowDragging : '',
        ].join(' ')}
        onClick={() => isEnabled && setActiveSection(section.key)}
        {...dragProps.row}
      >
        <span className={classes.dragHandle} {...(dragProps.handle || {})}>
          {section.draggable
            ? <BarsOutlined />
            : <span style={{ width: 14, display: 'inline-block' }} />
          }
        </span>
        <span className={classes.sectionLabel}>{section.label}</span>
        {!section.required && (
          <Checkbox
            checked={!!enabledSections[section.key]}
            onChange={() => toggleSection(section.key)}
            onClick={e => e.stopPropagation()}
          />
        )}
      </div>
    )
  }

  return (
    <ConfigProvider theme={{ ...COMPACT_THEME, token: { ...COMPACT_THEME.token, colorPrimary: accent } }}>
      <div className={classes.root}>

        {/* ── Топбар ────────────────────────────────────────────────────────── */}
        <div className={classes.topbar}>
          <div className={classes.topbarLeft}>
            <Select value={companyId}      onChange={handleCompany}     options={COMPANY_OPTIONS}     style={{ width: 90  }} />
            <Select value={orientation}    onChange={handleOrientation}  options={ORIENTATION_OPTIONS} style={{ width: 148 }}
              optionRender={opt => (
                <span>
                  <FileOutlined style={{ marginRight: 4, transform: `rotate(${opt.value === 'h' ? 90 : 0}deg)`, display: 'inline-block' }} />
                  {opt.label}
                </span>
              )}
            />
            <Select value={targetSystem}   onChange={handleTarget}       options={TARGET_OPTIONS}      style={{ width: 150 }} />
            <Select value={currency.value} onChange={handleCurrency}     options={CURRENCY_OPTIONS}    style={{ width: 64  }} />
          </div>
          <div className={classes.topbarRight}>
            <SaveIndicator status={saveStatus} errMsg={saveErr} />
            <Button danger icon={<CodepenOutlined />} size="small">Инженер работает!</Button>
            <Button type="primary" icon={<PrinterOutlined />} size="small"
              style={{ background: accent, borderColor: accent }}>В печать!</Button>
          </div>
        </div>

        {/* ── Строка названия заявки ────────────────────────────────────────── */}
        <div className={classes.titlebar}>
          <span className={classes.bidId}>#{bidId}</span>
          <span className={classes.bidObject}>{draft?.object || 'Без названия'}</span>
        </div>

        {/* ── Три колонки ───────────────────────────────────────────────────── */}
        <div className={classes.columns}>

          {/* Левая: список секций */}
          <div className={classes.sectionList}>

            {/* Обложка — фиксированная вверху, вне Droppable */}
            {coverSection && renderSectionRow(coverSection)}

            {/* Драгабельная зона */}
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="sections">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {orderedDraggable.map((section, index) => (
                      <Draggable key={section.key} draggableId={section.key} index={index}>
                        {(prov, snapshot) => (
                          <div ref={prov.innerRef} {...prov.draggableProps}>
                            {renderSectionRow(section, { row: {}, handle: prov.dragHandleProps }, snapshot)}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {/* Оглавление — фиксированное внизу, вне Droppable */}
            {tocSection && (
              <div className={classes.tocDivider} />
            )}
            {tocSection && renderSectionRow(tocSection)}

          </div>

          {/* Центр: активная секция */}
          <div className={classes.formArea}>
            {activeSecDef && (
              <div className={classes.sectionBlock}>
                <div className={classes.sectionTitle} style={{ borderColor: accent }}>
                  {activeSecDef.label}
                </div>
                {ActiveSection
                  ? <ActiveSection
                      data={formData}
                      onChange={handleFormChange}
                      currency={currency}
                      companyId={companyId}
                      orientation={orientation}
                      targetSystem={targetSystem}
                      draftId={draftId}
                      bidId={bidId}
                    />
                  : <div className={classes.sectionPlaceholder}>— секция в разработке —</div>
                }
              </div>
            )}
          </div>

          {/* Правая: минимап */}
          <div className={classes.minimap}>
            <div className={classes.minimapTitle}>Навигация</div>

            {coverSection && (
              <MiniCard
                section={coverSection}
                isActive={activeSection === 'cover'}
                isEnabled={enabledSections.cover ?? true}
                accent={accent}
                onClick={() => setActiveSection('cover')}
              />
            )}

            {orderedDraggable.map(section => {
              const isEnabled = section.required || enabledSections[section.key]
              return (
                <MiniCard
                  key={section.key}
                  section={section}
                  isActive={activeSection === section.key}
                  isEnabled={isEnabled}
                  accent={accent}
                  onClick={() => isEnabled && setActiveSection(section.key)}
                />
              )
            })}

            {tocSection && (
              <>
                <div className={classes.minimapDivider} />
                <MiniCard
                  section={tocSection}
                  isActive={activeSection === 'toc'}
                  isEnabled={!!enabledSections.toc}
                  accent={accent}
                  onClick={() => enabledSections.toc && setActiveSection('toc')}
                />
              </>
            )}
          </div>

        </div>
      </div>
    </ConfigProvider>
  )
}

// ─── MiniCard — плашка минимапа ───────────────────────────────────────────────
function MiniCard({ section, isActive, isEnabled, accent, onClick }) {
  return (
    <Tooltip title={section.label} placement="left">
      <div
        onClick={onClick}
        style={{
          width: '100%',
          height: 52,
          borderRadius: 5,
          border: `1.5px solid ${isActive ? accent : '#e8e8e8'}`,
          background: isActive ? accent + '0d' : '#fafafa',
          cursor: isEnabled ? 'pointer' : 'default',
          opacity: isEnabled ? 1 : 0.3,
          overflow: 'hidden',
          flexShrink: 0,
          transition: 'all 0.15s',
          position: 'relative',
        }}
      >
        <SectionMiniPreview
          sectionKey={section.key}
          accent={accent}
          isActive={isActive}
        />
        {/* Лейбл снизу */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          fontSize: 8, fontWeight: 600, textAlign: 'center',
          color: isActive ? accent : '#94a3b8',
          background: isActive ? accent + '15' : 'rgba(255,255,255,0.85)',
          padding: '1px 2px',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          textTransform: 'uppercase', letterSpacing: '0.03em',
        }}>
          {section.label}
        </div>
      </div>
    </Tooltip>
  )
}

function SaveIndicator({ status, errMsg }) {
  const map = {
    idle:    { text: '',                  color: 'transparent' },
    pending: { text: 'изменения...',      color: '#8c8c8c'     },
    saving:  { text: 'сохранение...',     color: '#1677ff'     },
    saved:   { text: 'сохранено ✓',      color: '#52c41a'     },
    error:   { text: errMsg || 'ошибка', color: '#ff4d4f'     },
  }
  const { text, color } = map[status] ?? map.idle
  return <span style={{ fontSize: 12, color, minWidth: 90, textAlign: 'right' }}>{text}</span>
}
