import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { mm } from '../theme/units'

const CURRENCY_SYMBOLS = { '1': '$', '2': '€', '3': '₽' }

function SectionHeading({ theme, number, title }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: mm(6), marginTop: mm(4) }}>
      <View style={{ width: mm(1.5), height: mm(10), backgroundColor: theme.accent, marginRight: mm(4) }} />
      <View>
        {number && (
          <Text style={{ fontSize: theme.fontSize.xs, color: theme.accent, fontFamily: theme.fonts.regular }}>
            РАЗДЕЛ {number}
          </Text>
        )}
        <Text style={{ fontSize: theme.fontSize.lg, color: theme.black, fontFamily: theme.fonts.bold, fontWeight: 700 }}>
          {title}
        </Text>
      </View>
    </View>
  )
}

function stripHtml(html) {
  return (html || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
}

function getPresenceLabel(model) {
  const presenceName = model.precence?.name || model.presence_data?.name || model.presenceInfo?.name || model.presence?.name
  if (presenceName) return presenceName

  return Number(model.presence) > 0 ? '\u0412 \u043d\u0430\u043b.' : '+'
}

export function PdfSpecifications({ theme, models, currency, tableFootnote, sectionNumber }) {
  const sym  = CURRENCY_SYMBOLS[currency?.value] || '₽'
  const rows = models || []

  const fmt = (n) => Number(parseFloat(n) || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const totalSum = rows.reduce((acc, m) => acc + (parseFloat(m.price) || 0) * (m.model_count || 0), 0)

  // Ширины колонок
  const W = { num: mm(8), qty: mm(14), price: mm(24), total: mm(24), presence: mm(20) }

  const headerCell = {
    paddingHorizontal: mm(2), paddingVertical: mm(2.5),
    fontSize: theme.fontSize.xs, fontFamily: theme.fonts.bold, fontWeight: 700,
    color: theme.white, backgroundColor: theme.tableHeader,
  }
  const cell = {
    paddingHorizontal: mm(2), paddingVertical: mm(2.5),
    fontSize: theme.fontSize.sm, fontFamily: theme.fonts.regular, color: theme.black,
  }

  return (
    <View>
      <SectionHeading theme={theme} number={sectionNumber} title="Спецификация" />

      {/* Шапка */}
      <View style={{ flexDirection: 'row' }}>
        <Text style={[headerCell, { width: W.num, textAlign: 'center' }]}>№</Text>
        <Text style={[headerCell, { flex: 1 }]}>Наименование</Text>
        <Text style={[headerCell, { width: W.qty, textAlign: 'center' }]}>Кол-во</Text>
        <Text style={[headerCell, { width: W.price, textAlign: 'right' }]}>Цена, {sym}</Text>
        <Text style={[headerCell, { width: W.total, textAlign: 'right' }]}>Сумма, {sym}</Text>
        <Text style={[headerCell, { width: W.presence, textAlign: 'center' }]}>Наличие</Text>
      </View>

      {/* Строки */}
      {rows.map((m, i) => {
        const price = parseFloat(m.price) || 0
        const total = price * (m.model_count || 0)
        const bg    = i % 2 === 1 ? theme.tableRowEven : theme.white
        const name  = m.info_model?.name || `Позиция ${i + 1}`
        const note  = m.info_model?.short_note || ''

        return (
          <View key={m.id || i} style={{ flexDirection: 'row', backgroundColor: bg }}>
            <Text style={[cell, { width: W.num, textAlign: 'center', color: theme.gray }]}>{i + 1}</Text>
            <View style={{ flex: 1, paddingHorizontal: mm(2), paddingVertical: mm(2) }}>
              <Text style={{ fontSize: theme.fontSize.sm, fontFamily: theme.fonts.bold, fontWeight: 600, color: theme.black }}>{name}</Text>
              {note ? <Text style={{ fontSize: theme.fontSize.xs, fontFamily: theme.fonts.regular, color: theme.gray, marginTop: mm(0.5) }}>{note}</Text> : null}
            </View>
            <Text style={[cell, { width: W.qty, textAlign: 'center' }]}>{m.model_count || 0}</Text>
            <Text style={[cell, { width: W.price, textAlign: 'right' }]}>{fmt(price)}</Text>
            <Text style={[cell, { width: W.total, textAlign: 'right', fontFamily: theme.fonts.bold, fontWeight: 600 }]}>{fmt(total)}</Text>
            <Text style={[cell, { width: W.presence, textAlign: 'center', color: theme.gray }]}>
              {getPresenceLabel(m)}
            </Text>
          </View>
        )
      })}

      {/* Итого */}
      <View style={{ flexDirection: 'row', backgroundColor: theme.tableTotal, marginTop: mm(1) }}>
        <Text style={[headerCell, { flex: 1 }]}>ИТОГО</Text>
        <Text style={[headerCell, { width: W.qty }]} />
        <Text style={[headerCell, { width: W.price }]} />
        <Text style={[headerCell, { width: W.total, textAlign: 'right' }]}>{fmt(totalSum)} {sym}</Text>
        <Text style={[headerCell, { width: W.presence }]} />
      </View>

      {tableFootnote ? (
        <Text style={{ fontSize: theme.fontSize.xs, color: theme.gray, fontFamily: theme.fonts.regular, marginTop: mm(3) }}>
          {stripHtml(tableFootnote)}
        </Text>
      ) : null}
    </View>
  )
}
