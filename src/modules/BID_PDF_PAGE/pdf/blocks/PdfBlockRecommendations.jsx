import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { PdfSectionBar } from '../shared/PdfSectionBar'

function stripHtml(html) {
  return (html || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
}

export function PdfBlockRecommendations({ cfg, data, sectionNumber }) {
  const recs = (data?.recommendations || []).filter(r => r['recommendation-model'])
  if (!recs.length) return null

  const { color, text, font, weight, space, layout } = cfg
  const cW = layout.contentW
  const W = {
    num: layout.tableColNumW,
    qty: layout.tableColQtyW,
  }
  const nameW = cW - W.num - W.qty - layout.tableColPriceW - layout.tableColTotalW - layout.tableColPresenceW
  const noteW = cW - W.num - nameW - W.qty

  const cellBase = { paddingHorizontal: space.xs, paddingVertical: space.xs }

  const headerStyle = {
    ...cellBase,
    fontSize: text.xs,
    fontFamily: font.bold,
    fontWeight: weight.bold,
    color: color.tableHeaderText,
    backgroundColor: color.tableHeader,
  }

  const rowText = (align = 'left') => ({
    ...cellBase,
    fontSize: text.sm,
    fontFamily: font.regular,
    color: color.textPrimary,
    textAlign: align,
  })

  return (
    <View style={{ marginBottom: cfg.space.end, borderBottom: '1px solid ' + color.tableRowEven}}>
      <PdfSectionBar cfg={cfg} number={sectionNumber} title="Рекомендации" />

      <View style={{ flexDirection: 'row' }} wrap={false}>
        <Text style={[headerStyle, { width: W.num, textAlign: 'center' }]}>№</Text>
        <Text style={[headerStyle, { width: nameW, textAlign: 'left' }]}>Наименование</Text>
        <Text style={[headerStyle, { width: W.qty, textAlign: 'center' }]}>Кол-во</Text>
        <Text style={[headerStyle, { width: noteW, textAlign: 'left' }]}>Примечание</Text>
      </View>

      {recs.map((rec, i) => {
        const bg = i % 2 === 1 ? color.tableRowEven : color.tableRowOdd
        const desc = stripHtml(rec['recommendation-text'])

        return (
          <View key={i} style={{ flexDirection: 'row', backgroundColor: bg }} wrap={false}>
            <Text style={[rowText('center'), { width: W.num, color: color.textSecondary }]}>{i + 1}</Text>

            <View style={{ width: nameW, ...cellBase }}>
              <Text style={{ fontSize: text.sm, fontFamily: font.bold, fontWeight: weight.semibold, color: color.textPrimary }}>
                {rec['recommendation-model']}
              </Text>
              {desc ? (
                <Text style={{ fontSize: text.xs, fontFamily: font.regular, color: color.textSecondary, marginTop: 1 }}>
                  {desc}
                </Text>
              ) : null}
            </View>

            <Text style={[rowText('center'), { width: W.qty }]}>{rec['recommendation-count'] || 0}</Text>
            <Text style={[rowText('left'), { width: noteW, color: color.textSecondary }]}>{rec['recommendation-note'] || ''}</Text>
          </View>
        )
      })}
    </View>
  )
}
