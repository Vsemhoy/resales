import React from 'react'
import { View, Text, Image } from '@react-pdf/renderer'
import { mm } from '../theme/units'

function getEffectiveWidths(cols) {
  const defined   = cols.reduce((s, c) => s + (parseFloat(c.width) || 0), 0)
  const autoCols  = cols.filter(c => !parseFloat(c.width))
  const autoWidth = autoCols.length > 0 ? (100 - defined) / autoCols.length : 0
  return cols.map(c => ({ ...c, effectiveWidth: parseFloat(c.width) || autoWidth }))
}

function colSum(rows, colId) {
  return rows.reduce((s, r) => s + (parseFloat(r.cells[colId]) || 0), 0)
}

const fmt = (n) => Number(n).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
import { HtmlToPdf } from '../components/HtmlToPdf'

function SectionHeading({ theme, title }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: mm(6), marginTop: mm(4) }}>
      <View style={{ width: mm(1.5), height: mm(10), backgroundColor: theme.accent, marginRight: mm(4) }} />
      <Text style={{ fontSize: theme.fontSize.lg, color: theme.black, fontFamily: theme.fonts.bold, fontWeight: 700 }}>
        {title || 'Блок'}
      </Text>
    </View>
  )
}

export function PdfCustomBlock({ theme, block, blockId, figureRegistry = new Map(), figuresEnabled = true }) {
  if (!block) return null

  const cols       = block.columns || []
  const rows       = block.rows    || []
  const totals     = block.totals    || {}
  const showTotal  = block.showTotal ?? false
  const withWidths = getEffectiveWidths(cols)
  const hasTable   = cols.length > 0 && rows.length > 0

  const coverUrl = block.image && typeof block.image === 'string'
    ? (block.image.startsWith('http') ? block.image : `${window.location.origin}${block.image}`)
    : null

  return (
    <View>
      <SectionHeading theme={theme} title={block.title} />

      {/* Текст сверху */}
      {block.textAbove && <HtmlToPdf html={block.textAbove} theme={theme} />}

      {/* Картинка */}
      {coverUrl && (
        <View style={{ marginVertical: mm(4) }}>
          <Image src={coverUrl} style={{ width: '100%', objectFit: 'contain' }} />
          {figuresEnabled && figureRegistry.get(`custom_${blockId}_image`) && (
            <Text style={{ fontSize: theme.fontSize.xs, color: theme.gray, fontFamily: theme.fonts.regular, textAlign: 'center', marginTop: mm(2) }}>
              {`Рисунок ${figureRegistry.get('custom_' + blockId + '_image').num}. ${figureRegistry.get('custom_' + blockId + '_image').title}`}
            </Text>
          )}
        </View>
      )}

      {/* Таблица */}
      {hasTable && (
        <View style={{ marginVertical: mm(4) }}>
          {/* Шапка */}
          <View style={{ flexDirection: 'row' }}>
            {withWidths.map(col => (
              <Text
                key={col.id}
                style={{
                  width: `${col.effectiveWidth}%`,
                  padding: mm(2.5), paddingHorizontal: mm(3),
                  fontSize: theme.fontSize.xs, fontFamily: theme.fonts.bold,
                  fontWeight: 700, color: theme.white,
                  backgroundColor: theme.tableHeader,
                  textAlign: col.align || (col.type !== 'text' ? 'right' : 'left'),
                }}
              >
                {col.label}
              </Text>
            ))}
          </View>

          {/* Строки */}
          {rows.map((row, ri) => (
            <View key={row.id} style={{ flexDirection: 'row', backgroundColor: ri % 2 === 1 ? theme.tableRowEven : theme.white }}>
              {withWidths.map(col => (
                <Text
                  key={col.id}
                  style={{
                    flex: col.width ? undefined : 1,
                    width: col.width ? `${col.width}` : undefined,
                    padding: mm(2.5), paddingHorizontal: mm(3),
                    fontSize: theme.fontSize.sm, fontFamily: theme.fonts.regular,
                    color: theme.black,
                    textAlign: col.type !== 'text' ? 'right' : 'left',
                  }}
                >
                  {row.cells[col.id] || ''}
                </Text>
              ))}
            </View>
          ))}
          {/* Строка итогов */}
          {showTotal && rows.length > 0 && (
            <View style={{ flexDirection: 'row', borderTopWidth: 2, borderTopColor: theme.accent, marginTop: mm(1) }}>
              {withWidths.map(col => {
                const isNum = col.type === 'number' || col.type === 'currency'
                const val   = isNum ? (col.type === 'currency' ? fmt(colSum(rows, col.id)) : String(colSum(rows, col.id))) : (totals[col.id] || '')
                return (
                  <Text key={col.id} style={{
                    width: `${col.effectiveWidth}%`,
                    padding: mm(2.5), paddingHorizontal: mm(3),
                    fontSize: theme.fontSize.sm, fontFamily: theme.fonts.bold,
                    fontWeight: 700, color: theme.accent,
                    textAlign: col.align || (col.type !== 'text' ? 'right' : 'left'),
                    backgroundColor: theme.accent + '11',
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
      {block.textBelow && <HtmlToPdf html={block.textBelow} theme={theme} />}
    </View>
  )
}
