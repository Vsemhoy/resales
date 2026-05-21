import React from 'react'
import { View, Text, Image } from '@react-pdf/renderer'
import { PdfSectionBar } from '../shared/PdfSectionBar'
import { HtmlToPdfV2, wrapJustify } from '../shared/HtmlToPdfV2'

function absUrl(src) {
  if (!src || typeof src !== 'string') return null
  if (src.startsWith('http') || src.startsWith('data:') || src.startsWith('blob:')) return src
  return `${window.location.origin}${src}`
}

function stripHtml(html) {
  return (html || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
}

function getEffectiveWidths(cols) {
  const defined  = cols.reduce((s, c) => s + (parseFloat(c.width) || 0), 0)
  const autoCols = cols.filter(c => !parseFloat(c.width))
  const auto     = autoCols.length > 0 ? (100 - defined) / autoCols.length : 0
  return cols.map(c => ({ ...c, ew: parseFloat(c.width) || auto }))
}

function colSum(rows, colId) {
  return rows.reduce((s, r) => s + (parseFloat(r.cells[colId]) || 0), 0)
}

const fmt = (n) => Number(n).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function PdfBlockCustom({ cfg, block, blockId, figureRegistry = new Map(), figuresEnabled = true, sectionNumber }) {
  if (!block) return null

  const { color, text, font, weight, space, layout } = cfg
  const cols      = block.columns || []
  const rows      = block.rows    || []
  const totals    = block.totals  || {}
  const showTotal = block.showTotal ?? false
  const withW     = getEffectiveWidths(cols)

  const imgUrl  = absUrl(block.image)
  const figInfo = figuresEnabled ? figureRegistry.get(`custom_${blockId}_image`) : null

  const cellBase = { paddingHorizontal: space.xs, paddingVertical: space.xs }

  return (
    <View style={{ marginBottom: cfg.space.end}}>
      <PdfSectionBar cfg={cfg} number={sectionNumber} title={block.title || 'Блок'} />

      {/* Текст сверху */}
      {<HtmlToPdfV2 html={wrapJustify(block.textAbove)} cfg={cfg} />}

      {/* Картинка */}
      {imgUrl && (
        <View style={{ marginVertical: space.sm }}>
          <Image src={imgUrl} style={{ width: layout.contentW, maxHeight: layout.imgMaxH, objectFit: 'contain' }} />
          {figInfo && (
            <Text style={{ fontSize: text.xs, color: color.textSecondary, fontFamily: font.regular, textAlign: 'center', marginTop: space.xs }}>
              Рисунок {figInfo.num}. {figInfo.title}
            </Text>
          )}
        </View>
      )}

      {/* Таблица */}
      {cols.length > 0 && rows.length > 0 && (
        <View style={{ marginVertical: space.sm }}>
          {/* Шапка */}
          <View style={{ flexDirection: 'row' }} wrap={false}>
            {withW.map(col => (
              <Text key={col.id} style={{
                ...cellBase,
                width: `${col.ew}%`,
                fontSize: text.xs, fontFamily: font.bold, fontWeight: weight.bold,
                color: color.tableHeaderText, backgroundColor: color.tableHeader,
                textAlign: col.align || 'left',
              }}>
                {col.label}
              </Text>
            ))}
          </View>

          {/* Строки */}
          {rows.map((row, ri) => (
            <View key={ri} style={{ flexDirection: 'row', backgroundColor: ri % 2 === 1 ? color.tableRowEven : color.tableRowOdd }} wrap={false}>
              {withW.map(col => (
                <Text key={col.id} style={{
                  ...cellBase,
                  width: `${col.ew}%`,
                  fontSize: text.sm, fontFamily: font.regular, color: color.textPrimary,
                  textAlign: col.align || 'left',
                }}>
                  {row.cells[col.id] || ''}
                </Text>
              ))}
            </View>
          ))}

          {/* Итого */}
          {showTotal && (
            <View style={{ flexDirection: 'row', backgroundColor: color.tableTotal }} wrap={false}>
              {withW.map(col => {
                const isNum = col.type === 'number' || col.type === 'currency'
                const val   = isNum
                  ? (col.type === 'currency' ? fmt(colSum(rows, col.id)) : String(colSum(rows, col.id)))
                  : (totals[col.id] || '')
                return (
                  <Text key={col.id} style={{
                    ...cellBase,
                    width: `${col.ew}%`,
                    fontSize: text.sm, fontFamily: font.bold, fontWeight: weight.bold,
                    color: color.tableTotalText, textAlign: col.align || 'left',
                  }}>
                    {val}
                  </Text>
                )
              })}
            </View>
          )}
        </View>
      )}

      {/* Текст снизу */}
      {<HtmlToPdfV2 html={wrapJustify(block.textBelow)} cfg={cfg} />}
    </View>
  )
}
