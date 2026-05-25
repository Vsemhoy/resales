import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { HtmlToPdf } from '../components/HtmlToPdf'
import { mm } from '../theme/units'

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


export function PdfFeatures({ theme, data, sectionNumber }) {
  const features = (data?.features || []).filter(f => f.feature)
  if (!features.length) return null

  return (
    <View>
      <SectionHeading theme={theme} number={sectionNumber} title="Особенности системы" />
      {features.map((f, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: mm(3) }}>
          <View style={{
            width: mm(6), height: mm(6), borderRadius: mm(3),
            backgroundColor: theme.accent, marginRight: mm(4), marginTop: mm(1), flexShrink: 0,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontSize: theme.fontSize.xs, color: theme.white, fontFamily: theme.fonts.bold, fontWeight: 700 }}>
              {i + 1}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <HtmlToPdf html={f.feature} theme={theme} />
          </View>
        </View>
      ))}
    </View>
  )
}
