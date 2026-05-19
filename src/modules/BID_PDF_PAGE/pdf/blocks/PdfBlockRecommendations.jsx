import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { PdfSectionBar } from '../shared/PdfSectionBar'
import { HtmlToPdfV2, wrapJustify } from '../shared/HtmlToPdfV2'

export function PdfBlockRecommendations({ cfg, data, currency, sectionNumber }) {
  const recs = (data?.recommendations || []).filter(r => r['recommendation-model'])
  if (!recs.length) return null

  const { color, text, font, weight, space } = cfg
  const sym = { '1': '$', '2': '€', '3': '₽' }[currency?.value] || '₽'

  return (
    <View>
      <PdfSectionBar cfg={cfg} number={sectionNumber} title="Рекомендации" />
      {recs.map((rec, i) => (
        <View key={i} style={{
          borderLeftWidth: 2, borderLeftColor: color.accent,
          paddingLeft: space.md, marginBottom: space.lg,
        }} wrap={false}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: space.xs }}>
            <Text style={{ fontSize: text.base, fontFamily: font.bold, fontWeight: weight.bold, color: color.textPrimary, flex: 1 }}>
              {rec['recommendation-model']}
            </Text>
            {rec['recommendation-count'] > 1 && (
              <Text style={{ fontSize: text.sm, color: color.textSecondary, fontFamily: font.regular }}>
                {rec['recommendation-count']} шт.
              </Text>
            )}
          </View>
          {rec['recommendation-text'] ? (
            <HtmlToPdfV2 html={wrapJustify(rec['recommendation-text'])} cfg={cfg} />
          ) : null}
          {rec['recommendation-note'] ? (
            <Text style={{ fontSize: text.xs, color: color.textSecondary, fontFamily: font.regular }}>
              {rec['recommendation-note']}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  )
}
