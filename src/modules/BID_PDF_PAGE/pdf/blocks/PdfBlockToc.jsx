import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { PdfSectionBar } from '../shared/PdfSectionBar'

export function PdfBlockToc({ cfg, sectionNumbers, enabledSections, sectionOrder, getLabel, sectionPageNumbers = {}, forceBreak = false }) {
  const { color, text, font, weight, space } = cfg

  // Собираем строки: только включённые драггабельные секции (не pageBreak, не custom)
  const rows = sectionOrder
    .filter(key => {
      if (!enabledSections[key]) return false
      if (key.startsWith('pageBreak_') || key.startsWith('custom_')) return false
      if (key === 'cover' || key === 'toc') return false
      return sectionNumbers[key] != null
    })
    .map(key => ({
      key,
      num:   sectionNumbers[key],
      label: getLabel(key),
    }))

  if (!rows.length) return null

  return (
    <View break={forceBreak} style={{ marginBottom: space.end }}>
      <PdfSectionBar cfg={cfg} title="Содержание" />

      {/* Строки */}
      {rows.map(({ key, num, label }) => (
        <View
          key={key}
          style={{
            flexDirection:  'row',
            alignItems:     'flex-end',
            marginBottom:   space.sm,
          }}
        >
          {/* Номер */}
          <Text style={{
            fontSize:   text.sm,
            fontFamily: font.bold,
            fontWeight: weight.semibold,
            color:      color.accent,
            width:      space.xxl,
            flexShrink: 0,
          }}>
            {num}.
          </Text>

          {/* Название */}
          <Text style={{
            fontSize:   text.sm,
            fontFamily: font.regular,
            fontWeight: weight.regular,
            color:      color.textPrimary,
            flexShrink: 1,
          }}>
            {label}
          </Text>

          {/* Пунктирная линия */}
          <View style={{
            flex:              1,
            borderBottomWidth: 0.5,
            borderBottomStyle: 'dashed',
            borderBottomColor: color.divider,
            marginHorizontal:  space.xs,
            marginBottom:      2,
          }} />

          {/* Страница */}
          <Text style={{
            fontSize:   text.sm,
            fontFamily: font.bold,
            fontWeight: weight.semibold,
            color:      sectionPageNumbers[key] ? color.textPrimary : color.textMuted,
            minWidth:   space.xl,
            textAlign:  'right',
          }}>
            {sectionPageNumbers[key] ?? '—'}
          </Text>
        </View>
      ))}
    </View>
  )
}
