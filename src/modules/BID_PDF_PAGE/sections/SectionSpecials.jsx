import React, { useState, useEffect } from 'react'
import { Spin } from 'antd'
import { getBidModels } from '../api'
import { HTTP_HOST } from '../../../config/config'
import { Section, TabWrap } from '../components/FormParts'
import { COVER_BLOCKS } from '../components/coverBlocks'

export default function SectionSpecials({ data, onChange, bidId }) {
  const [models,  setModels]  = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!bidId) return
    setLoading(true)
    getBidModels(bidId)
      .then(res => setModels(Array.isArray(res) ? res : (res?.models ?? [])))
      .catch(() => setModels([]))
      .finally(() => setLoading(false))
  }, [bidId])

  const ignored     = data.specialsIgnore ?? []
  const toggleIgnore = (id) => {
    const next = ignored.includes(id) ? ignored.filter(x => x !== id) : [...ignored, id]
    onChange({ ...data, specialsIgnore: next })
  }

  const imgBase = `${HTTP_HOST}/api/soma/pdf/modfiles/`

  return (
    <TabWrap>
      <Section title="Картинка на обложку раздела" description="Страница-заголовок раздела">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <div
            onClick={() => onChange({ ...data, specialsCoverBlock: null })}
            style={{
              width: 80, height: 60, border: `2px solid ${!data.specialsCoverBlock ? '#1677ff' : '#d9d9d9'}`,
              borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 11, color: '#8c8c8c', background: '#fafafa',
            }}
          >Без картинки</div>
          {COVER_BLOCKS.map(block => (
            <div
              key={block.filename}
              onClick={() => onChange({ ...data, specialsCoverBlock: data.specialsCoverBlock === block.url ? null : block.url })}
              title={block.name}
              style={{
                width: 80, height: 60,
                border: `2px solid ${data.specialsCoverBlock === block.url ? '#1677ff' : '#d9d9d9'}`,
                borderRadius: 6, overflow: 'hidden', cursor: 'pointer',
              }}
            >
              <img src={block.url} alt={block.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Фильтр моделей" description="Отмеченные модели не попадут в раздел описания">
        {loading && <div style={{ padding: 16, textAlign: 'center' }}><Spin size="small" /></div>}
        {!loading && models.length === 0 && <div style={{ color: '#bfbfbf', fontSize: 12 }}>Модели не найдены</div>}
        {!loading && models.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {models.map((model, idx) => {
              const id       = model.model_id ?? model.id
              const isIgnored = ignored.includes(id)
              const name     = model.info_model?.name
              return (
                <label
                  key={id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px',
                    borderRadius: 6, cursor: 'pointer', background: isIgnored ? '#fff2f0' : '#fafafa',
                    border: `1px solid ${isIgnored ? '#ffccc7' : '#e8e8e8'}`,
                    opacity: isIgnored ? 0.6 : 1,
                  }}
                >
                  <span style={{ color: '#1677ff', fontSize: 12, width: 20, textAlign: 'right', flexShrink: 0 }}>{idx + 1}</span>
                  <input type="checkbox" checked={isIgnored} onChange={() => toggleIgnore(id)} />
                  <span style={{ flex: 1, fontSize: 12, fontWeight: 500 }}>{name}</span>
                  {name && (
                    <img
                      src={`${imgBase}${name.toLowerCase().replace(/[^a-z0-9]/g, '')}?size=xs`}
                      alt="" style={{ height: 28, objectFit: 'contain' }}
                      onError={e => { e.target.style.display = 'none' }}
                    />
                  )}
                </label>
              )
            })}
          </div>
        )}
      </Section>
    </TabWrap>
  )
}
