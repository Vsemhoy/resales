import ExcelJS from 'exceljs'
import { api } from './api/http'
import { cleanAlphaNumeric } from './utils/splitText'
import { buildSpecificationRows, CURRENCY_SYMBOLS } from './utils/specificationData'
import { HAT_HEADER_TEXT_DEFAULTS } from './utils/companyHeader'

const COMPANY_NAMES = { '2': 'ООО «АРСТЕЛ»', '3': 'ООО «РОНДО-САУНД»' }
const DARK = 'FF243447'
const ACCENT = 'FFFF7700'
const PALE = 'FFF3F5F7'
const BORDER = { style: 'thin', color: { argb: 'FFDDE2E8' } }

function plainText(html) {
  if (!html) return ''
  const element = document.createElement('div')
  element.innerHTML = String(html).replace(/<br\s*\/?\s*>/gi, '\n').replace(/<\/p>/gi, '\n')
  return (element.textContent || '').trim()
}

function addMergedText(ws, rowNumber, from, to, value, style = {}) {
  ws.mergeCells(rowNumber, from, rowNumber, to)
  const cell = ws.getRow(rowNumber).getCell(from)
  cell.value = value
  cell.font = { name: 'Arial', size: 10, color: { argb: DARK }, ...style.font }
  cell.alignment = { vertical: 'middle', wrapText: true, ...style.alignment }
  if (style.fill) cell.fill = style.fill
  return cell
}

async function imageToJpegBuffer(arrayBuffer) {
  const url = URL.createObjectURL(new Blob([arrayBuffer], { type: 'image/png' }))
  try {
    const image = await new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Не удалось прочитать фото модели'))
      img.src = url
    })
    const scale = Math.min(1, 260 / Math.max(image.naturalWidth, image.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas недоступен')
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    const jpeg = await new Promise((resolve, reject) =>
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Не удалось сжать фото')), 'image/jpeg', 0.8)
    )
    return { buffer: await jpeg.arrayBuffer(), width: canvas.width, height: canvas.height }
  } finally {
    URL.revokeObjectURL(url)
  }
}

async function loadModelPhoto(name) {
  const filename = cleanAlphaNumeric(name)
  if (!filename) return null
  try {
    const response = await api.get(`/soma/pdf/modfilesautocut/${encodeURIComponent(filename)}`, {
      params: { size: 'xs' },
      responseType: 'arraybuffer',
      timeout: 12000,
    })
    return await imageToJpegBuffer(response.data)
  } catch (error) {
    // Отсутствие одной фотографии не должно ломать спецификацию целиком.
    if (error.response?.status !== 404) console.warn('Excel model photo failed:', name, error)
    return null
  }
}

async function addModelPhotos(workbook, worksheet, rows, firstRow) {
  const names = [...new Set(rows.map(row => row.name))]
  const photos = new Map()
  let next = 0
  await Promise.all(Array.from({ length: Math.min(4, names.length) }, async () => {
    while (next < names.length) {
      const name = names[next++]
      photos.set(name, await loadModelPhoto(name))
    }
  }))

  const imageIds = new Map()
  rows.forEach((row, index) => {
    const photo = photos.get(row.name)
    if (!photo) return
    let imageId = imageIds.get(row.name)
    if (imageId === undefined) {
      imageId = workbook.addImage({ buffer: photo.buffer, extension: 'jpeg' })
      imageIds.set(row.name, imageId)
    }
    const height = Math.min(75, 75 * photo.height / photo.width)
    const width = Math.min(75, 75 * photo.width / photo.height)
    worksheet.addImage(imageId, {
      tl: { col: 2 + (75 - width) / 180, row: firstRow + index - 1 + (75 - height) / 85 },
      ext: { width, height },
      editAs: 'oneCell',
    })
  })
}

export async function buildSpecificationExcel({ models = [], formData = {}, currency, companyId }) {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'КП PDF'
  workbook.calcProperties.fullCalcOnLoad = true
  const ws = workbook.addWorksheet('Спецификация', {
    views: [{ state: 'frozen', ySplit: 8 }],
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  })
  ws.columns = [
    { width: 6 }, { width: 52 }, { width: 14 }, { width: 11 },
    { width: 17 }, { width: 19 }, { width: 16 },
  ]
  ws.properties.defaultRowHeight = 18

  const companyName = COMPANY_NAMES[String(companyId)] || 'Коммерческое предложение'
  addMergedText(ws, 1, 1, 7, companyName, { font: { size: 14, bold: true } })
  ws.getRow(1).height = 27

  const headerText = String(formData.hatHeaderText ?? HAT_HEADER_TEXT_DEFAULTS[String(companyId)] ?? '').trim()
  addMergedText(ws, 2, 1, 4, headerText, { font: { size: 9 }, alignment: { vertical: 'top' } })
  const recipient = [formData.target_occupy, formData.target_company, formData.target_name].filter(Boolean).join('\n')
  addMergedText(ws, 2, 5, 7, recipient, { font: { size: 9 }, alignment: { horizontal: 'right', vertical: 'top' } })
  ws.getRow(2).height = Math.max(48, Math.min(100, Math.max(headerText.split('\n').length, recipient.split('\n').length) * 13))

  addMergedText(ws, 3, 1, 7, [formData.ext_number && `Исх. № ${formData.ext_number}`, formData.date].filter(Boolean).join('    '), { font: { size: 9 } })
  ws.getRow(3).height = 20
  addMergedText(ws, 4, 1, 7, String(formData.coverTitle || 'Коммерческое предложение').replace(/[ \t]*\+[ \t]*/g, '\n'), {
    font: { size: 13, bold: true }, alignment: { horizontal: 'center' },
  })
  ws.getRow(4).height = 38
  addMergedText(ws, 5, 1, 7, formData.object_address || '', { font: { size: 9 }, alignment: { horizontal: 'center' } })
  ws.getRow(5).height = 21
  const manager = [formData.manager_name, formData.manager_occupy, formData.tel, formData.email].filter(Boolean).join(' · ')
  addMergedText(ws, 6, 1, 7, manager, { font: { size: 9 } })
  ws.getRow(6).height = 21
  ws.getRow(7).height = 11

  const symbol = CURRENCY_SYMBOLS[currency?.value] || '₽'
  const header = ws.getRow(8)
  header.values = ['№', 'Наименование', 'Фото', 'Кол-во', `Цена, ${symbol}`, `Сумма, ${symbol}`, 'Наличие']
  header.height = 28
  header.eachCell(cell => {
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
      [item.name, item.note].filter(Boolean).join('\n'),
      '',
      Number(item.quantity),
      item.price,
      { formula: `D${index + 9}*E${index + 9}`, result: item.total },
      item.presence,
    ])
    row.height = 63
    row.eachCell({ includeEmpty: true }, (cell, column) => {
      cell.font = { name: 'Arial', size: 10, color: { argb: DARK }, bold: column === 2 }
      cell.alignment = { vertical: 'middle', wrapText: true, horizontal: [1, 3, 4, 7].includes(column) ? 'center' : undefined }
      cell.border = { bottom: BORDER }
      if (index % 2 === 1) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: PALE } }
    })
    row.getCell(5).numFmt = '#,##0.00'
    row.getCell(6).numFmt = '#,##0.00'
  })

  await addModelPhotos(workbook, ws, rows, 9)

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
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: DARK } }
    cell.alignment = { vertical: 'middle', horizontal: cell.col === 6 ? 'right' : 'left' }
  })

  const footnote = plainText(formData.tableFootnote)
  if (footnote) {
    const rowNumber = totalRowNumber + 2
    addMergedText(ws, rowNumber, 1, 7, footnote, { font: { size: 9 }, alignment: { vertical: 'top' } })
    ws.getRow(rowNumber).height = Math.min(100, Math.max(32, footnote.split('\n').length * 14))
  }
  ws.pageSetup.printArea = `A1:G${footnote ? totalRowNumber + 2 : totalRowNumber}`

  return workbook.xlsx.writeBuffer()
}
