// Строит сквозной реестр рисунков в порядке секций
// Возвращает Map: figureKey → { num, title }

const CUSTOM_PREFIX = 'custom_'

export function buildFigureRegistry({ sectionOrder, enabledSections, formData, figuresEnabled }) {
  const registry = new Map()
  if (!figuresEnabled) return registry

  let num = 1

  for (const key of sectionOrder) {
    if (!enabledSections[key] && key !== 'cover') continue

    // ── Выбор оборудования ────────────────────────────────────────────────
    if (key === 'selectEquipment') {
      if (formData.structuralDiagrams) {
        const title = formData.structuralDiagramsTitle ?? 'Структурная схема проекта'
        if (title) registry.set('structuralDiagrams', { num: num++, title })
      }
      if (formData.blockPlacements) {
        const title = formData.blockPlacementsTitle ?? 'Размещение блоков системы в шкафах'
        if (title) registry.set('blockPlacements', { num: num++, title })
      }
    }

    // ── Кастомные блоки ───────────────────────────────────────────────────
    if (key.startsWith(CUSTOM_PREFIX)) {
      const id    = key.replace(CUSTOM_PREFIX, '')
      const block = formData._customSections?.[id]
      if (block?.image) {
        const title = block.imageTitle ?? `Блок ${block.title || ''}`.trim()
        if (title) registry.set(`custom_${id}_image`, { num: num++, title })
      }
    }

    // ── Акустический расчёт ───────────────────────────────────────────────
    if (key === 'acoustic') {
      const rooms = formData.acousticCalculation?.rooms || []
      const imageSections = ['placement', 'reverberation', 'directSpl', 'totalSpl']
      const stiSections   = ['sti', 'alcons']

      for (const room of rooms) {
        for (const sec of imageSections) {
          for (const img of (room[sec]?.images || [])) {
            if (img.file && img.description) {
              registry.set(`${room.id}_${sec}_img_${img.id}`, { num: num++, title: img.description })
            }
          }
        }
        for (const sec of stiSections) {
          const p1 = room[sec]?.page1?.image
          const p2 = room[sec]?.page2?.image
          if (p1?.file && p1?.description) registry.set(`${room.id}_${sec}_page1`, { num: num++, title: p1.description })
          if (p2?.file && p2?.description) registry.set(`${room.id}_${sec}_page2`, { num: num++, title: p2.description })
        }
      }
    }
  }

  return registry
}
