// Заглушка секции — скопируй как шаблон для каждой из:
// SectionCover, SectionToc, SectionFeatures, SectionSelectEquipment,
// SectionAcoustic, SectionRecommendations, SectionSpecials, SectionRondoDelivery

import React from 'react'

export default function SectionCover({ data, onChange, companyId, draftId }) {
  // data       — весь formData (читаем своё, пишем через onChange)
  // onChange   — (newData) => void, передаём весь formData с патчем
  // companyId  — '2' (Arstel) | '3' (Rondo)
  // draftId    — id драфта (для загрузки файлов)

  return (
    <div style={{ padding: '12px' }}>
      {/* TODO: форма обложки */}
      <span style={{ color: '#bfbfbf', fontSize: 12 }}>SectionCover — в разработке</span>
    </div>
  )
}
