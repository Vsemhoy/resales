import React from 'react'
import { Input, Button, InputNumber } from 'antd'
import { RichTextEditor } from '../components/RichTextEditor'
import { Section, Field, Grid2, TabWrap } from '../components/FormParts'

const EMPTY_REC = { 'recommendation-model': '', 'recommendation-count': 1, 'recommendation-text': '', 'recommendation-note': '' }

export default function SectionRecommendations({ data, onChange, companyId }) {
  const accent = companyId === '3' ? '#269435' : '#FF5903'
  const recs   = data.recommendations || [{ ...EMPTY_REC }]

  const setRec  = (i, key, val) => { const n = [...recs]; n[i] = { ...n[i], [key]: val }; onChange({ ...data, recommendations: n }) }
  const addRec  = () => onChange({ ...data, recommendations: [...recs, { ...EMPTY_REC }] })
  const removeRec = (i) => onChange({ ...data, recommendations: recs.filter((_, idx) => idx !== i) })

  return (
    <TabWrap>
      <Section title="Рекомендации" description="Оборудование не из основной спецификации">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {recs.map((rec, i) => (
            <div key={i} style={{ border: '1px solid #e8e8e8', borderRadius: 6, padding: 12, background: '#fafafa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#8c8c8c' }}>№{i + 1}</span>
                <button onClick={() => removeRec(i)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ff4d4f', fontSize: 18 }}>×</button>
              </div>
              <Grid2>
                <Field label="Наименование">
                  <Input placeholder="Модель оборудования" value={rec['recommendation-model'] || ''} onChange={e => setRec(i, 'recommendation-model', e.target.value)} />
                </Field>
                <Field label="Количество">
                  <InputNumber min={1} style={{ width: '100%' }} value={rec['recommendation-count'] || 1} onChange={val => setRec(i, 'recommendation-count', val)} />
                </Field>
              </Grid2>
              <Field label="Описание">
                <RichTextEditor value={rec['recommendation-text'] || ''} onChange={val => setRec(i, 'recommendation-text', val)} accent={accent} placeholder="Назначение и обоснование..." />
              </Field>
              <Field label="Примечание">
                <Input placeholder="Доп. условие, оговорка..." value={rec['recommendation-note'] || ''} onChange={e => setRec(i, 'recommendation-note', e.target.value)} />
              </Field>
            </div>
          ))}
          <Button size="small" onClick={addRec} style={{ alignSelf: 'flex-start' }}>+ Добавить позицию</Button>
        </div>
      </Section>
    </TabWrap>
  )
}
