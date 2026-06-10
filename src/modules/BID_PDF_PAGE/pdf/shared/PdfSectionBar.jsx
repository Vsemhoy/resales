import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { mm } from '../theme/units'

export function PdfSectionBar({ cfg, number, title }) {
  const { color, text, font, weight, space } = cfg

  const numStr    = number !== undefined ? `${number}.` : null
  const numDigits = numStr ? String(number).length : 0
  const numWidth  = numDigits >= 2 ? mm(12) : mm(8)

  return (
    <View style={{ marginTop: space.md * 0.7, marginBottom: space.lg }} wrap={false}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
        {numStr && (
          <Text style={{
            fontFamily:  font.bold,
            fontWeight:  weight.bold,
            fontSize:    text.lg,
            color:       color.accent,
            width:       numWidth,
            flexShrink:  0,
            lineHeight:  1.2,
          }}>
            {numStr}
          </Text>
        )}
        <Text style={{
          fontFamily:  font.bold,
          fontWeight:  weight.bold,
          fontSize:    text.lg,
          color:       color.textPrimary,
          flex:        1,
          lineHeight:  1.2,
        }}>
          {title}
        </Text>
      </View>
      <View style={{
        height:          mm(0.3),
        backgroundColor: color.accent,
        marginTop:       mm(1.5),
      }} />
    </View>
  )
}
