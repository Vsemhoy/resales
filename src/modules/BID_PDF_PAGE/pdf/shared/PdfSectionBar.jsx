import React from 'react'
import { View, Text } from '@react-pdf/renderer'

// Заголовок секции: цветная полоска слева + номер + название
export function PdfSectionBar({ cfg, number, title }) {
  const { color, text, font, weight, space } = cfg
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: space.md, marginTop: space.md }} wrap={false}>
      <View style={{ width: 1.5, height: text.lg * 1.8, backgroundColor: color.sectionBar, marginRight: space.sm }} />
      <View>
        {number !== undefined && (
          <Text style={{ fontSize: text.xs, color: color.accent, fontFamily: font.regular, fontWeight: weight.semibold, letterSpacing: 0.8 }}>
            РАЗДЕЛ {number}
          </Text>
        )}
        <Text style={{ fontSize: text.lg, color: color.textPrimary, fontFamily: font.bold, fontWeight: weight.bold, lineHeight: 1.2 }}>
          {title}
        </Text>
      </View>
    </View>
  )
}
