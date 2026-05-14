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

function stripHtml(html) {
  return (html || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim()
}

export function PdfSelectEquipment({ theme, data, sectionNumber }) {
  const text = stripHtml(data?.selectionOfEquipment || '')
  if (!text) return null

  return (
    <View>
      <SectionHeading theme={theme} number={sectionNumber} title="Выбор оборудования" />
      <Text style={{ fontSize: theme.fontSize.base, color: theme.black, fontFamily: theme.fonts.regular, lineHeight: 1.6 }}>
        {text}
      </Text>
    </View>
  )
}
