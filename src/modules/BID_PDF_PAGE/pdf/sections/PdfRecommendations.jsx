import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { mm } from '../theme/units'

function SectionHeading({ theme, number, title }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: mm(6), marginTop: mm(4) }}>
      <View style={{ width: mm(1.5), height: mm(10), backgroundColor: theme.accent, marginRight: mm(4) }} />
      <View>
        {number && <Text style={{ fontSize: theme.fontSize.xs, color: theme.accent, fontFamily: theme.fonts.regular }}>РАЗДЕЛ {number}</Text>}
        <Text style={{ fontSize: theme.fontSize.lg, color: theme.black, fontFamily: theme.fonts.bold, fontWeight: 700 }}>{title}</Text>
      </View>
    </View>
  )
}

export function PdfRecommendations({ theme, data, currency, sectionNumber }) {
  const recs = (data?.recommendations || []).filter(r => r['recommendation-model'])
  if (!recs.length) return null

  const sym = { '1': '$', '2': '€', '3': '₽' }[currency?.value] || '₽'

  return (
    <View>
      <SectionHeading theme={theme} number={sectionNumber} title="Рекомендации" />
      {recs.map((rec, i) => (
        <View key={i} style={{ marginBottom: mm(6), borderLeftWidth: 2, borderLeftColor: theme.accent, paddingLeft: mm(4) }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: mm(2) }}>
            <Text style={{ fontSize: theme.fontSize.base, color: theme.black, fontFamily: theme.fonts.bold, fontWeight: 700, flex: 1 }}>
              {rec['recommendation-model']}
            </Text>
            {rec['recommendation-count'] > 1 && (
              <Text style={{ fontSize: theme.fontSize.sm, color: theme.gray, fontFamily: theme.fonts.regular }}>
                {rec['recommendation-count']} шт.
              </Text>
            )}
          </View>
          {rec['recommendation-text'] ? (
            <Text style={{ fontSize: theme.fontSize.sm, color: theme.black, fontFamily: theme.fonts.regular, lineHeight: 1.5 }}>
              {rec['recommendation-text'].replace(/<[^>]*>/g, '').trim()}
            </Text>
          ) : null}
          {rec['recommendation-note'] ? (
            <Text style={{ fontSize: theme.fontSize.xs, color: theme.gray, fontFamily: theme.fonts.regular, marginTop: mm(1) }}>
              {rec['recommendation-note']}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  )
}
