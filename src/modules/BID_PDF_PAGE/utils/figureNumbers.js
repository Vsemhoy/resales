// ─── Сквозная нумерация рисунков ─────────────────────────────────────────────
// Обходит все комнаты и секции в том же порядке что и PDF-рендер
// Возвращает Map: ключ → номер рисунка
//
// Ключи:
//   {roomId}_{section}_img_{imageId}   — для секций с массивом картинок
//   {roomId}_{section}_page1           — для STI/Alcons страница 1
//   {roomId}_{section}_page2           — для STI/Alcons страница 2

const IMAGE_SECTIONS = ['placement', 'reverberation', 'directSpl', 'totalSpl']
const STI_SECTIONS   = ['sti', 'alcons']

export function buildFigureMap(rooms = []) {
  const map = new Map()
  let counter = 1

  for (const room of rooms) {
    // placement, reverberation, directSpl, totalSpl — массивы картинок
    for (const sectionKey of IMAGE_SECTIONS) {
      const section = room[sectionKey]
      if (!section?.enabled) continue
      for (const img of (section.images || [])) {
        if (img.file) {  // считаем только загруженные
          map.set(`${room.id}_${sectionKey}_img_${img.id}`, counter++)
        }
      }
    }

    // STI и Alcons — две фиксированные страницы
    for (const sectionKey of STI_SECTIONS) {
      const section = room[sectionKey]
      if (!section?.enabled) continue
      if (section.page1?.image?.file) {
        map.set(`${room.id}_${sectionKey}_page1`, counter++)
      }
      if (section.page2?.image?.file) {
        map.set(`${room.id}_${sectionKey}_page2`, counter++)
      }
    }
  }

  return map
}

// ─── Хелперы получения номера ─────────────────────────────────────────────────
export function getFigureNum(figureMap, key) {
  return figureMap.get(key) ?? null
}

export function getFigureLabel(figureMap, key) {
  const num = figureMap.get(key)
  return num != null ? `Рисунок ${num}.` : 'Рисунок ?.'
}
