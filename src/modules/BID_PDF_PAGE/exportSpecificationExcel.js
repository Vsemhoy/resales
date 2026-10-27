import ExcelJS from 'exceljs'
import { DEFAULT_BULLETS } from './utils/deliveryTerms'
import { buildSpecificationRows, CURRENCY_SYMBOLS } from './utils/specificationData'

const DARK = 'FF243447'
const PALE = 'FFF3F5F7'
const BORDER = { style: 'thin', color: { argb: 'FFDDE2E8' } }
const CELL_BORDER = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER }

function addSectionTitle(worksheet, rowNumber, title) {
  worksheet.mergeCells(rowNumber, 1, rowNumber, 7)
  const row = worksheet.getRow(rowNumber)
  row.height = 28
  const cell = row.getCell(1)
  cell.value = title
  cell.font = { name: 'Arial', size: 12, bold: true, color: { argb: DARK } }
  cell.alignment = { vertical: 'middle', wrapText: true }
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: PALE } }
}

async function addHeaderImage(workbook, worksheet) {
  const response = await fetch('/price_hat_arstel.png')
  if (!response.ok) throw new Error('Не удалось загрузить шапку Excel')
  const buffer = await response.arrayBuffer()
  const url = URL.createObjectURL(new Blob([buffer], { type: 'image/png' }))
  try {
    const image = await new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Не удалось прочитать шапку Excel'))
      img.src = url
    })
    const tableWidth = worksheet.columns.reduce((sum, column) => sum + Math.floor(column.width * 7 + 5), 0)
    const width = Math.min(800, tableWidth, image.naturalWidth)
    const height = width * image.naturalHeight / image.naturalWidth
    const imageId = workbook.addImage({ buffer, extension: 'png' })
    for (let row = 1; row <= 7; row += 1) {
      worksheet.getRow(row).height = (height + 12) * 0.75 / 7
    }
    worksheet.addImage(imageId, {
      tl: { col: 0, row: 0 },
      ext: { width, height },
      editAs: 'oneCell',
    })
  } finally {
    URL.revokeObjectURL(url)
  }
}

export async function buildSpecificationExcel({ models = [], modelsData, formData = {}, currency }) {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'КП PDF'
  workbook.calcProperties.fullCalcOnLoad = true
  const ws = workbook.addWorksheet('Спецификация', {
    views: [{ state: 'frozen', ySplit: 8 }],
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  })
  ws.columns = [
    { width: 6 }, { width: 28 }, { width: 52 }, { width: 11 },
    { width: 17 }, { width: 19 }, { width: 16 },
  ]
  ws.properties.defaultRowHeight = 18

  await addHeaderImage(workbook, ws)

  const symbol = CURRENCY_SYMBOLS[currency?.value] || '₽'
  const header = ws.getRow(8)
  header.values = ['№', 'Наименование', 'Описание', 'Кол-во', `Цена, ${symbol}`, `Сумма, ${symbol}`, 'Наличие']
  header.height = 28
  header.eachCell(cell => {
    cell.border = CELL_BORDER
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: DARK } }
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
  })
  ws.autoFilter = { from: 'A8', to: 'G8' }
  ws.pageSetup.printTitlesRow = '8:8'

  const rows = buildSpecificationRows(models, {
    withoutNds: formData._withoutNds,
    ndsPercent: formData._ndsPercent,
  })
  rows.forEach((item, index) => {
    const row = ws.addRow([
      item.number,
      item.name,
      item.note,
      Number(item.quantity),
      item.price,
      { formula: `D${index + 9}*E${index + 9}`, result: item.total },
      item.presence,
    ])
    row.height = 63
    row.eachCell({ includeEmpty: true }, (cell, column) => {
      cell.font = { name: 'Arial', size: 10, color: { argb: DARK }, bold: column === 2 }
      cell.alignment = { vertical: 'middle', wrapText: true, horizontal: [1, 4, 7].includes(column) ? 'center' : undefined }
      cell.border = CELL_BORDER
      if (index % 2 === 1) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: PALE } }
    })
    row.getCell(5).numFmt = '#,##0.00'
    row.getCell(6).numFmt = '#,##0.00'
  })

  const totalRowNumber = 9 + rows.length
  const totalRow = ws.getRow(totalRowNumber)
  ws.mergeCells(totalRowNumber, 1, totalRowNumber, 5)
  totalRow.getCell(1).value = 'ИТОГО'
  totalRow.getCell(6).value = rows.length
    ? { formula: `SUM(F9:F${totalRowNumber - 1})`, result: rows.reduce((sum, row) => sum + row.total, 0) }
    : 0
  totalRow.getCell(6).numFmt = `#,##0.00 "${symbol}"`
  totalRow.height = 27
  totalRow.eachCell({ includeEmpty: true }, cell => {
    cell.border = CELL_BORDER
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: DARK } }
    cell.alignment = { vertical: 'middle', horizontal: cell.col === 6 ? 'right' : 'left' }
  })

  addSectionTitle(ws, totalRowNumber + 2, 'Характеристики системы')
  const charsRow = totalRowNumber + 3
  const formatCharacteristic = (value, decimals = 0) => {
    if (value === null || value === undefined || value === '') return '—'
    const number = Number(value)
    return Number.isFinite(number) ? number.toFixed(decimals) : '—'
  }
  const md = modelsData || {}
  const characteristicCells = [
    [charsRow, 1, charsRow, 2, `Высота оборудования: ${formatCharacteristic(md.unit)} U`],
    [charsRow + 1, 1, charsRow + 1, 2, `Высота шкафа: ${formatCharacteristic(md.box_size)} U`],
    [charsRow, 3, charsRow, 3, `Потр. мощность: ${formatCharacteristic(md.power_consumption, 1)} Вт`],
    [charsRow + 1, 3, charsRow + 1, 3, `Вых. мощность: ${formatCharacteristic(md.max_power, 1)} Вт`],
    [charsRow, 4, charsRow, 5, `Мощность АС: ${formatCharacteristic(md.rated_power_speaker, 1)} Вт`],
    [charsRow + 1, 4, charsRow + 1, 5, `Масса: ${formatCharacteristic(md.mass, 2)} кг`],
    [charsRow, 6, charsRow + 1, 7, `Объём: ${formatCharacteristic(md.size, 3)} м³`],
  ]
  characteristicCells.forEach(([top, left, bottom, right, value]) => {
    if (top !== bottom || left !== right) ws.mergeCells(top, left, bottom, right)
    const cell = ws.getRow(top).getCell(left)
    cell.value = value
    cell.font = { name: 'Arial', size: 10, color: { argb: DARK } }
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
    cell.border = CELL_BORDER
  })
  ws.getRow(charsRow).height = 32
  ws.getRow(charsRow + 1).height = 32
  const termsTitleRow = charsRow + 3
  addSectionTitle(ws, termsTitleRow, 'Условия оплаты и поставки')
  const savedBullets = formData.rondoDelivery?.bullets
  const bullets = (Array.isArray(savedBullets) ? savedBullets : DEFAULT_BULLETS)
    .filter(bullet => bullet.title || bullet.text)
  let lastRow = termsTitleRow
  bullets.forEach(bullet => {
    const text = String(bullet.text || bullet.title || '').trim()
    const rowNumber = ++lastRow
    ws.mergeCells(rowNumber, 1, rowNumber, 7)
    const cell = ws.getRow(rowNumber).getCell(1)
    cell.value = text
    cell.font = { name: 'Arial', size: 10, color: { argb: DARK } }
    cell.alignment = { vertical: 'top', wrapText: true }
    const lines = text.split('\n').reduce((sum, line) => sum + Math.max(1, Math.ceil(line.length / 140)), 0)
    ws.getRow(rowNumber).height = lines * 12 + 4
  })
  ws.pageSetup.printArea = `A1:G${lastRow}`

  return workbook.xlsx.writeBuffer()
}
