import React, { useState, useRef, useEffect } from 'react'
import { Input, Switch, Button } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { RichTextEditor } from '../components/RichTextEditor'
import { AccalcFileUpload, collectRoomFilenames } from '../components/AccalcFileUpload'
import { wasteAccalcFiles, SECTION_PREFIXES } from '../api/accalcs'
import { ACOUSTIC_TEMPLATES } from '../components/acousticTemplates'
import { buildFigureMap } from '../utils/figureNumbers'
import { Section, Field } from '../components/FormParts'

// ─── Утилиты (на уровне модуля) ───────────────────────────────────────────────
function uuid() { return Math.random().toString(36).slice(2, 10) }

function emptyImage(desc) {
  return { id: uuid(), file: null, description: desc || '', shrinkHeight: false, cropToCenter: false }
}

function emptySection(key) {
  return {
    enabled: false,
    images: [emptyImage(ACOUSTIC_TEMPLATES[key]?.imageDescription || '')],
    text: ACOUSTIC_TEMPLATES[key]?.text || '',
  }
}

function emptyStiSection(key) {
  return {
    enabled: false,
    page1: {
      text:  ACOUSTIC_TEMPLATES[key]?.page1Text || '',
      image: { file: null, description: ACOUSTIC_TEMPLATES[key]?.page1ImageDescription || '' },
    },
    page2: {
      image: { file: null, description: ACOUSTIC_TEMPLATES[key]?.page2ImageDescription || '' },
      text:  ACOUSTIC_TEMPLATES[key]?.page2Text || '',
    },
  }
}

function emptyRoom() {
  return {
    id:                  uuid(),
    name:                ACOUSTIC_TEMPLATES.roomName || 'Помещение',
    placement:           { ...emptySection('placement'), enabled: true },
    reverberation:       emptySection('reverberation'),
    directSpl:           emptySection('directSpl'),
    totalSpl:            emptySection('totalSpl'),
    sti:                 emptyStiSection('sti'),
    alcons:              emptyStiSection('alcons'),
    conclusion:          { enabled: false, text: ACOUSTIC_TEMPLATES.conclusion || '' },
    roomRecommendations: { enabled: false, items: [...(ACOUSTIC_TEMPLATES.roomRecommendations || [])] },
  }
}

const SUBSECTION_LABELS = {
  placement:     'Размещение акустических систем',
  reverberation: 'Расчёт времени реверберации',
  directSpl:     'Расчёт Direct SPL',
  totalSpl:      'Расчёт Total SPL',
}

const MAX_ROOMS  = 30
const MAX_IMAGES = 10

// ─── Главный компонент ────────────────────────────────────────────────────────
export default function SectionAcoustic({ data, onChange, draftId, companyId }) {
  const accent = companyId === '3' ? '#269435' : '#FF5903'

  const ac = data.acousticCalculation || {
    intro: ACOUSTIC_TEMPLATES.intro || '',
    rooms: [],
    finalConclusion: { enabled: false, text: ACOUSTIC_TEMPLATES.finalConclusion || '' },
  }

  const [activeRoomId, setActiveRoomId] = useState(() => ac.rooms?.[0]?.id ?? null)

  const introRef      = useRef(null)
  const conclusionRef = useRef(null)
  const roomRefs      = useRef({})

  useEffect(() => {
    if (!activeRoomId && ac.rooms?.length > 0) setActiveRoomId(ac.rooms[0].id)
  }, [ac.rooms?.length])

  const figureMap = buildFigureMap(ac.rooms || [])

  const setAc    = (patch) => onChange({ ...data, acousticCalculation: { ...ac, ...patch } })
  const setRooms = (rooms) => setAc({ rooms })

  const addRoom = () => {
    if ((ac.rooms || []).length >= MAX_ROOMS) return
    const room = emptyRoom()
    setRooms([...(ac.rooms || []), room])
    setActiveRoomId(room.id)
    setTimeout(() => roomRefs.current[room.id]?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  const removeRoom = (id) => {
    const room = (ac.rooms || []).find(r => r.id === id)
    if (room) wasteAccalcFiles(draftId, collectRoomFilenames(room)).catch(() => {})
    const next = (ac.rooms || []).filter(r => r.id !== id)
    setRooms(next)
    setActiveRoomId(next[0]?.id ?? null)
  }

  const updateRoom = (id, patch) =>
    setRooms((ac.rooms || []).map(r => r.id === id ? { ...r, ...patch } : r))

  const handleNavRoom = (id) => {
    setActiveRoomId(id)
    roomRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const scrollTo = (el) => el?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

      {/* ── Левая: контент ──────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 32px' }}>

        {/* Введение */}
        <div ref={introRef}>
          <Section title="Введение в раздел 2" description="Общий вводный текст">
            <RichTextEditor
              value={ac.intro || ''} onChange={val => setAc({ intro: val })}
              accent={accent} placeholder="В рамках проектирования системы..."
            />
          </Section>
        </div>

        {/* Помещения */}
        <div style={{ marginTop: 8 }}>
          {(ac.rooms || []).length === 0 && (
            <div style={{ padding: 32, textAlign: 'center', color: '#bfbfbf', border: '1.5px dashed #e8e8e8', borderRadius: 8 }}>
              Добавьте первое помещение в навигаторе справа →
            </div>
          )}
          {(ac.rooms || []).map((room, idx) => (
            <div
              key={room.id}
              ref={el => { roomRefs.current[room.id] = el }}
              style={{ marginBottom: 24 }}
            >
              <RoomForm
                room={room} index={idx}
                onUpdate={patch => updateRoom(room.id, patch)}
                onRemove={() => removeRoom(room.id)}
                draftId={draftId} figureMap={figureMap} accent={accent}
              />
            </div>
          ))}
        </div>

        {/* Заключение */}
        <div ref={conclusionRef} style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #e8e8e8' }}>
          <Section title="Заключение" description="Общий вывод по всему акустическому расчёту">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Switch size="small"
                checked={!!ac.finalConclusion?.enabled}
                onChange={v => setAc({ finalConclusion: { ...ac.finalConclusion, enabled: v } })}
              />
              <span style={{ fontSize: 12, color: '#595959' }}>Включить заключение</span>
            </div>
            {ac.finalConclusion?.enabled && (
              <RichTextEditor
                value={ac.finalConclusion?.text || ''}
                onChange={val => setAc({ finalConclusion: { ...ac.finalConclusion, text: val } })}
                accent={accent} placeholder="Заключение по акустическому расчёту..."
              />
            )}
          </Section>
        </div>
      </div>

      {/* ── Правая: навигатор (fixed — единственное что работает) ────────────── */}
      <div style={{
        width: 156, flexShrink: 0, borderLeft: '1px solid #0000001a',
        background: '#ffffff', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          width: 156, position: 'fixed', bottom: 0,
          height: 'calc(100vh - 434px)', top: '141px',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ padding: '15px 10px 4px', fontSize: 10, fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Навигация
          </div>

          <NavItem label="Введение" sub onClick={() => scrollTo(introRef.current)} />

          <div style={{ flex: 1, overflowY: 'auto', padding: '2px 6px' }}>
            {(ac.rooms || []).map((room, idx) => (
              <NavItem
                key={room.id}
                prefix={`2.${idx + 1}`}
                label={room.name || 'Без названия'}
                active={activeRoomId === room.id}
                accent={accent}
                onClick={() => handleNavRoom(room.id)}
              />
            ))}
          </div>

          <div style={{ padding: '4px 8px', borderTop: '1px solid #e8e8e8', borderBottom: '1px solid #e8e8e8' }}>
            <Button size="small" icon={<PlusOutlined />} block onClick={addRoom}
              disabled={(ac.rooms || []).length >= MAX_ROOMS} style={{ fontSize: 11 }}>
              Помещение
            </Button>
          </div>

          <NavItem
            label="Заключение" sub dimmed={!ac.finalConclusion?.enabled}
            onClick={() => scrollTo(conclusionRef.current)}
          />
        </div>
      </div>

    </div>
  )
}

// ─── Пункт навигации ──────────────────────────────────────────────────────────
function NavItem({ prefix, label, active, accent, onClick, sub, dimmed }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: sub ? '5px 8px' : '6px 8px', borderRadius: 5,
        cursor: 'pointer', marginBottom: 2,
        background: active ? accent + '18' : 'transparent',
        border: `1px solid ${active ? accent + '40' : 'transparent'}`,
        opacity: dimmed ? 0.4 : 1, transition: 'all 0.12s',
      }}
    >
      {prefix && (
        <span style={{ fontSize: 10, color: accent, fontWeight: 700, flexShrink: 0, width: 20 }}>
          {prefix}
        </span>
      )}
      <span style={{
        fontSize: sub ? 11 : 12, fontStyle: sub ? 'italic' : 'normal',
        fontWeight: active ? 600 : 400, color: active ? '#262626' : '#595959',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
      }}>
        {label}
      </span>
    </div>
  )
}

// ─── Форма помещения ──────────────────────────────────────────────────────────
function RoomForm({ room, index, onUpdate, onRemove, draftId, figureMap, accent }) {
  const setSection = (key, patch) => onUpdate({ [key]: { ...room[key], ...patch } })

  return (
    <div style={{ border: `1.5px solid ${accent}30`, borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: accent + '0a' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: accent }}>Раздел 2.{index + 1}</span>
        <Button size="small" danger icon={<DeleteOutlined />}
          onClick={() => { if (window.confirm(`Удалить «${room.name || 'помещение'}»?`)) onRemove() }}>
          Удалить
        </Button>
      </div>

      <div style={{ padding: '12px 14px' }}>
        <Field label="Название помещения">
          <Input placeholder="Большой зал" value={room.name || ''} onChange={e => onUpdate({ name: e.target.value })} />
        </Field>

        {Object.entries(SUBSECTION_LABELS).map(([key, label]) => (
          <ImageTextSection key={key} label={label} data={room[key]}
            onChange={patch => setSection(key, patch)}
            draftId={draftId} roomId={room.id} sectionKey={key} figureMap={figureMap} accent={accent}
          />
        ))}

        <StiAlconsSection label="Расчёт коэффициента STI" data={room.sti}
          onChange={patch => setSection('sti', patch)}
          draftId={draftId} roomId={room.id} sectionKey="sti" figureMap={figureMap} accent={accent}
        />
        <StiAlconsSection label="Расчёт Alcons" data={room.alcons}
          onChange={patch => setSection('alcons', patch)}
          draftId={draftId} roomId={room.id} sectionKey="alcons" figureMap={figureMap} accent={accent}
        />

        <SubBlock label="Выводы" enabled={room.conclusion?.enabled} onToggle={v => setSection('conclusion', { enabled: v })} accent={accent}>
          <RichTextEditor value={room.conclusion?.text || ''} onChange={val => setSection('conclusion', { text: val })} accent={accent} placeholder="Выводы по помещению..." />
        </SubBlock>

        <SubBlock label="Рекомендации" enabled={room.roomRecommendations?.enabled} onToggle={v => setSection('roomRecommendations', { enabled: v })} accent={accent}>
          <RoomRecommendations items={room.roomRecommendations?.items || []} onChange={items => setSection('roomRecommendations', { items })} />
        </SubBlock>
      </div>
    </div>
  )
}

// ─── Подраздел: картинки + текст ─────────────────────────────────────────────
function ImageTextSection({ label, data, onChange, draftId, roomId, sectionKey, figureMap, accent }) {
  const images = data?.images || []
  const addImage    = () => { if (images.length < MAX_IMAGES) onChange({ images: [...images, emptyImage()] }) }
  const updateImage = (id, patch) => onChange({ images: images.map(img => img.id === id ? { ...img, ...patch } : img) })
  const removeImage = (id) => onChange({ images: images.filter(img => img.id !== id) })

  return (
    <SubBlock label={label} enabled={data?.enabled} onToggle={v => onChange({ enabled: v })} accent={accent}>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 6 }}>Картинки ({images.length}/{MAX_IMAGES})</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {images.map((img, i) => {
            const figNum = figureMap?.get(`${roomId}_${sectionKey}_img_${img.id}`)
            return (
              <div key={img.id} style={{ border: '1px solid #e8e8e8', borderRadius: 6, padding: 10, background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: '#8c8c8c' }}>#{i + 1}{figNum ? ` — Рис. ${figNum}` : ''}</span>
                  <button onClick={() => removeImage(img.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ff4d4f', fontSize: 16 }}>×</button>
                </div>
                <AccalcFileUpload draftId={draftId} prefix={SECTION_PREFIXES[sectionKey] || sectionKey} value={img.file} onChange={val => updateImage(img.id, { file: val })} label={null} />
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: '#8c8c8c', flexShrink: 0 }}>{figNum ? `Рис. ${figNum}.` : 'Рис. ?.'}</span>
                  <Input size="small" placeholder="Название картинки..." value={img.description || ''} onChange={e => updateImage(img.id, { description: e.target.value })} />
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
                  {[['shrinkHeight', 'Уменьшить высоту (~50%)'], ['cropToCenter', 'Уменьшить ширину (~60%)']].map(([k, lbl]) => (
                    <label key={k} style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                      <input type="checkbox" checked={!!img[k]} onChange={e => updateImage(img.id, { [k]: e.target.checked })} />
                      {lbl}
                    </label>
                  ))}
                </div>
              </div>
            )
          })}
          {images.length < MAX_IMAGES && (
            <Button size="small" onClick={addImage} style={{ alignSelf: 'flex-start' }}>+ Картинка</Button>
          )}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 4 }}>Текст к разделу</div>
        <RichTextEditor value={data?.text || ''} onChange={val => onChange({ text: val })} placeholder="Описание результатов..." />
      </div>
    </SubBlock>
  )
}

// ─── STI / Alcons ─────────────────────────────────────────────────────────────
function StiAlconsSection({ label, data, onChange, draftId, roomId, sectionKey, figureMap, accent }) {
  const setPage      = (page, patch) => onChange({ [page]: { ...data?.[page], ...patch } })
  const setPageImage = (page, patch) => setPage(page, { image: { ...data?.[page]?.image, ...patch } })
  const f1 = figureMap?.get(`${roomId}_${sectionKey}_page1`)
  const f2 = figureMap?.get(`${roomId}_${sectionKey}_page2`)

  return (
    <SubBlock label={label} enabled={data?.enabled} onToggle={v => onChange({ enabled: v })} accent={accent}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#8c8c8c', marginBottom: 6 }}>
        Страница 1 — текст (42%) + картинка {f1 ? `(Рис. ${f1})` : ''}
      </div>
      <RichTextEditor value={data?.page1?.text || ''} onChange={val => setPage('page1', { text: val })} placeholder="Текст левой колонки..." />
      <div style={{ marginTop: 8 }}>
        <AccalcFileUpload label="Картинка (правая колонка)" draftId={draftId} prefix={SECTION_PREFIXES[sectionKey] || sectionKey} value={data?.page1?.image?.file} onChange={val => setPageImage('page1', { file: val })} />
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#8c8c8c', flexShrink: 0 }}>{f1 ? `Рис. ${f1}.` : 'Рис. ?.'}</span>
          <Input size="small" placeholder="Название..." value={data?.page1?.image?.description || ''} onChange={e => setPageImage('page1', { description: e.target.value })} />
        </div>
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#8c8c8c', margin: '16px 0 6px' }}>
        Страница 2 — картинка (55%) + текст снизу {f2 ? `(Рис. ${f2})` : ''}
      </div>
      <AccalcFileUpload label="Картинка (верхние 55%)" draftId={draftId} prefix={SECTION_PREFIXES[sectionKey] || sectionKey} value={data?.page2?.image?.file} onChange={val => setPageImage('page2', { file: val })} />
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: '#8c8c8c', flexShrink: 0 }}>{f2 ? `Рис. ${f2}.` : 'Рис. ?.'}</span>
        <Input size="small" placeholder="Название..." value={data?.page2?.image?.description || ''} onChange={e => setPageImage('page2', { description: e.target.value })} />
      </div>
      <RichTextEditor value={data?.page2?.text || ''} onChange={val => setPage('page2', { text: val })} placeholder="Текст нижней части..." />
    </SubBlock>
  )
}

// ─── Рекомендации помещения ───────────────────────────────────────────────────
function RoomRecommendations({ items, onChange }) {
  const setItem = (i, val) => { const n = [...items]; n[i] = { feature: val }; onChange(n) }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: 6 }}>
          <Input value={item.feature || ''} onChange={e => setItem(i, e.target.value)} placeholder="Рекомендация..." />
          <button onClick={() => onChange(items.filter((_, idx) => idx !== i))} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ff4d4f', fontSize: 18 }}>×</button>
        </div>
      ))}
      <Button size="small" onClick={() => onChange([...items, { feature: '' }])} style={{ alignSelf: 'flex-start' }}>+ Добавить</Button>
    </div>
  )
}

// ─── Подблок со свитчом ───────────────────────────────────────────────────────
function SubBlock({ label, enabled, onToggle, accent, children }) {
  return (
    <div style={{ marginBottom: 12, borderRadius: 8, border: `1px solid ${enabled ? accent + '35' : '#e8e8e8'}`, overflow: 'hidden' }}>
      <div
        onClick={() => onToggle(!enabled)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 12px', background: enabled ? accent + '08' : '#fafafa', cursor: 'pointer' }}
      >
        <span style={{ fontSize: 12, fontWeight: 600, color: enabled ? '#262626' : '#8c8c8c' }}>{label}</span>
        <Switch size="small" checked={!!enabled} onChange={onToggle} onClick={e => e.stopPropagation()} />
      </div>
      {enabled && <div style={{ padding: 12 }}>{children}</div>}
    </div>
  )
}
