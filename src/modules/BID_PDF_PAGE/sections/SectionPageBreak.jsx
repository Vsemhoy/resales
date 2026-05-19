import React from 'react'
import { TabWrap } from '../components/FormParts'

export default function SectionPageBreak() {
  return (
    <TabWrap>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '32px 16px', gap: 12,
        border: '2px dashed #d9d9d9', borderRadius: 8, color: '#8c8c8c',
      }}>
        <div style={{ fontSize: 28 }}>↕</div>
        <div style={{ fontSize: 13, fontWeight: 600 }}>Разрыв страницы</div>
        <div style={{ fontSize: 12, textAlign: 'center', maxWidth: 280 }}>
          Всё что идёт после этого блока начнётся с новой страницы PDF
        </div>
      </div>
    </TabWrap>
  )
}
