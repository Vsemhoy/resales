import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { mm } from '../theme/units'

const CURRENCY_SYMBOLS = { '1': '$', '2': '€', '3': '₽' }

function SectionHeading({ theme, number, title }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: mm(6), marginTop: mm(2) }} wrap={false}>
      <View style={{ width: mm(1.5), height: mm(10), backgroundColor: theme.accent, marginRight: mm(4) }} />
      <View>
        {number && <Text style={{ fontSize: theme.fontSize.xs, color: theme.accent, fontFamily: theme.fonts.regular, letterSpacing: 1 }}>РАЗДЕЛ {number}</Text>}
        <Text style={{ fontSize: theme.fontSize.lg, color: theme.black, fontWeight: 700, fontFamily: theme.fonts.bold }}>{title}</Text>
      </View>
    </View>
  )
}

const COL_WIDTHS = {
  num:      mm(8),
  name:     null, // flex: 1
  qty:      mm(14),
  price:    mm(22),
  total:    mm(22),
  presence: mm(18),
}

export function PdfSpecifications({ theme, models = [], currency, tableFootnote, sectionNumber }) {
  const sym = CURRENCY_SYMBOLS[currency?.value] || '₽'

  const fmt = (n) => {
    const num = parseFloat(n) || 0
    return num.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const totalSum = models.reduce((acc, m) => {
    const price = parseFloat(m.price) || 0
    return acc + price * (m.model_count || 0)
  }, 0)

  const cellBase = {
    paddingHorizontal: mm(2), paddingVertical: mm(2.5),
    fontSize: theme.fontSize.sm, fontFamily: theme.fonts.regular,
  }

  const headerCell = {
    ...cellBase,
    color: theme.white, fontWeight: 700, fontFamily: theme.fonts.bold,
    backgroundColor: theme.tableHeader,
  }

  return (
    <View break>
      <SectionHeading theme={theme} number={sectionNumber} title="Спецификация" />

      {/* Шапка таблицы */}
      <View style={{ flexDirection: 'row', borderRadius: mm(1) }} wrap={false}>
        <Text style={[headerCell, { width: COL_WIDTHS.num, textAlign: 'center' }]}>№</Text>
        <Text style={[headerCell, { flex: 1 }]}>Наименование</Text>
        <Text style={[headerCell, { width: COL_WIDTHS.qty, textAlign: 'center' }]}>Кол-во</Text>
        <Text style={[headerCell, { width: COL_WIDTHS.price, textAlign: 'right' }]}>Цена, {sym}</Text>
        <Text style={[headerCell, { width: COL_WIDTHS.total, textAlign: 'right' }]}>Сумма, {sym}</Text>
        <Text style={[headerCell, { width: COL_WIDTHS.presence, textAlign: 'center' }]}>Наличие</Text>
      </View>

      {/* Строки */}
      {models.map((m, i) => {
        const isEven = i % 2 === 1
        const price  = parseFloat(m.price) || 0
        const total  = price * (m.model_count || 0)
        const bg     = isEven ? theme.tableRowEven : theme.white
        const name   = m.info_model?.name || `Позиция ${i + 1}`
        const note   = m.info_model?.short_note || ''

        return (
          <View key={m.id || i} style={{ flexDirection: 'row', backgroundColor: bg }} wrap={false}>
            <Text style={[cellBase, { width: COL_WIDTHS.num, textAlign: 'center', color: theme.gray }]}>{i + 1}</Text>
            <View style={[{ flex: 1, paddingHorizontal: mm(2), paddingVertical: mm(2.5) }]}>
              <Text style={{ fontSize: theme.fontSize.sm, fontWeight: 600, fontFamily: theme.fonts.bold, color: theme.black }}>{name}</Text>
              {note && <Text style={{ fontSize: theme.fontSize.xs, color: theme.gray, fontFamily: theme.fonts.regular, marginTop: mm(0.5) }}>{note}</Text>}
            </View>
            <Text style={[cellBase, { width: COL_WIDTHS.qty, textAlign: 'center', color: theme.black }]}>{m.model_count || 0}</Text>
            <Text style={[cellBase, { width: COL_WIDTHS.price, textAlign: 'right', color: theme.black }]}>{fmt(price)}</Text>
            <Text style={[cellBase, { width: COL_WIDTHS.total, textAlign: 'right', fontWeight: 600, fontFamily: theme.fonts.bold, color: theme.black }]}>{fmt(total)}</Text>
            <Text style={[cellBase, { width: COL_WIDTHS.presence, textAlign: 'center', color: theme.gray }]}>
              {m.presence > 0 ? 'В наличии' : 'Под заказ'}
            </Text>
          </View>
        )
      })}

      {/* Итого */}
      <View style={{ flexDirection: 'row', backgroundColor: theme.tableTotal, marginTop: mm(0.5), borderRadius: mm(1) }} wrap={false}>
        <Text style={[headerCell, { flex: 1 }]}>ИТОГО</Text>
        <Text style={[headerCell, { width: COL_WIDTHS.qty }]} />
        <Text style={[headerCell, { width: COL_WIDTHS.price }]} />
        <Text style={[headerCell, { width: COL_WIDTHS.total, textAlign: 'right' }]}>{fmt(totalSum)}</Text>
        <Text style={[headerCell, { width: COL_WIDTHS.presence }]} />
      </View>

      {/* Сноска */}
      {tableFootnote && (
        <Text style={{ fontSize: theme.fontSize.xs, color: theme.gray, fontFamily: theme.fonts.regular, marginTop: mm(3), lineHeight: 1.5 }}>
          {stripHtml(tableFootnote)}
        </Text>
      )}
    </View>
  )
}

function stripHtml(html) {
  return (html || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
}
