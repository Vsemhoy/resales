import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { mm } from '../theme/units'

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

export function PdfFeatures({ theme, data, sectionNumber }) {
  const features = data?.features || []
  if (!features.length) return null

  return (
    <View break>
      <SectionHeading theme={theme} number={sectionNumber} title="Особенности системы" />
      <View style={{ gap: mm(3) }}>
        {features.map((f, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start' }} wrap={false}>
            <View style={{
              width: mm(6), height: mm(6), borderRadius: mm(3),
              backgroundColor: theme.accent, marginRight: mm(4), marginTop: mm(1), flexShrink: 0,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ fontSize: theme.fontSize.xs, color: theme.white, fontFamily: theme.fonts.bold, fontWeight: 700 }}>
                {i + 1}
              </Text>
            </View>
            <Text style={{ fontSize: theme.fontSize.base, color: theme.black, fontFamily: theme.fonts.regular, lineHeight: 1.5, flex: 1 }}>
              {stripHtml(f.feature || '')}
            </Text>
          </View>
        ))}
      </View>
    </View>
  )
}

// Простая очистка от HTML тегов для @react-pdf
function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim()
}
