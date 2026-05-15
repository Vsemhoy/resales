// ─── Cover Blocks ─────────────────────────────────────────────────────────────
// Vite сканирует /public/coverblocks/ на этапе сборки.
// Добавил картинку в папку → она сама появится в галерее. Магия!
//
// import.meta.glob с as:'url' возвращает финальный публичный URL файла.
// В dev это вроде /coverblocks/kompoz_3_2.png
// В prod — то же самое (nginx раздаёт из dist/coverblocks/)

const modules = import.meta.glob('/public/coverblocks/*', { eager: true, as: 'url' })

// Превращаем объект в массив { name, url }
// name — имя файла без расширения, для отображения
export const COVER_BLOCKS = Object.entries(modules).map(([path, url]) => {
  const filename = path.split('/').pop()                    // 'kompoz_3_2.png'
  const name     = filename.replace(/\.[^.]+$/, '')        // 'kompoz_3_2'
  return { name, filename, url }
})
