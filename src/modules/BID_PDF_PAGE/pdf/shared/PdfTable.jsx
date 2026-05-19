import React from 'react'
import { View, Text } from '@react-pdf/renderer'

// Универсальная таблица
// cols: [{ key, label, width(mm), align('left'|'right'|'center'), flex }]
// rows: [{ [key]: value }]
// totals: { [key]: value } — если задан, рисуем строку итогов
export function PdfTable({ cfg, cols, rows, totals, showTotal = false }) {
  const { color, text, font, weight, space } = cfg

  const cellBase = {
    paddingHorizontal: space.xs,
    paddingVertical:   space.xs * 1.2,
    fontSize:          text.sm,
    fontFamily:        font.regular,
  }

  const colStyle = (col) => ({
    ...(col.width ? { width: col.width } : { flex: col.flex || 1 }),
    textAlign: col.align || 'left',
  })

  return (
    <View>
      {/* Шапка */}
      <View style={{ flexDirection: 'row' }} wrap={false}>
        {cols.map(col => (
          <Text key={col.key} style={[
            cellBase,
            colStyle(col),
            {
              backgroundColor: color.tableHeader,
              color:           color.tableHeaderText,
              fontFamily:      font.bold,
              fontWeight:      weight.bold,
              fontSize:        text.xs,
            },
          ]}>
            {col.label}
          </Text>
        ))}
      </View>

      {/* Строки */}
      {rows.map((row, ri) => (
        <View key={ri} style={{ flexDirection: 'row', backgroundColor: ri % 2 === 1 ? color.tableRowEven : color.tableRowOdd }} wrap={false}>
          {cols.map(col => (
            <Text key={col.key} style={[cellBase, colStyle(col), { color: color.textPrimary }]}>
              {row[col.key] ?? ''}
            </Text>
          ))}
        </View>
      ))}

      {/* Итого */}
      {showTotal && totals && (
        <View style={{ flexDirection: 'row', backgroundColor: color.tableTotal }} wrap={false}>
          {cols.map(col => (
            <Text key={col.key} style={[
              cellBase,
              colStyle(col),
              {
                color:      color.tableTotalText,
                fontFamily: font.bold,
                fontWeight: weight.bold,
                fontSize:   text.sm,
              },
            ]}>
              {totals[col.key] ?? ''}
            </Text>
          ))}
        </View>
      )}
    </View>
  )
}
