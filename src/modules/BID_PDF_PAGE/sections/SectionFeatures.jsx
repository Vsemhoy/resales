import React from 'react'
import { Button } from 'antd'
import { RichTextEditor } from '../components/RichTextEditor'
import { Section, TabWrap } from '../components/FormParts'

export default function SectionFeatures({ data, onChange, companyId }) {
  const accent   = companyId === '3' ? '#269435' : '#FF5903'
  const features = data.features || [{ feature: '' }]

  const setFeature  = (i, val) => { const n = [...features]; n[i] = { feature: val }; onChange({ ...data, features: n }) }
  const addFeature  = () => onChange({ ...data, features: [...features, { feature: '' }] })
  const removeFeature = (i) => onChange({ ...data, features: features.filter((_, idx) => idx !== i) })

  return (
    <TabWrap>
      <Section title="Особенности системы" description="Каждый пункт — отдельная строка в разделе КП">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {features.map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <div style={{ width: 24, paddingTop: 8, color: '#8c8c8c', fontSize: 12, flexShrink: 0, textAlign: 'right' }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <RichTextEditor
                  value={f.feature}
                  onChange={val => setFeature(i, val)}
                  accent={accent}
                  placeholder="Опишите особенность системы..."
                />
              </div>
              <button
                onClick={() => removeFeature(i)}
                disabled={features.length === 1}
                style={{ border: 'none', background: 'none', cursor: features.length === 1 ? 'default' : 'pointer', color: '#ff4d4f', fontSize: 18, paddingTop: 4, opacity: features.length === 1 ? 0.3 : 1 }}
              >×</button>
            </div>
          ))}
          <Button size="small" onClick={addFeature} style={{ alignSelf: 'flex-start', marginTop: 4 }}>+ Добавить пункт</Button>
        </div>
      </Section>
    </TabWrap>
  )
}
