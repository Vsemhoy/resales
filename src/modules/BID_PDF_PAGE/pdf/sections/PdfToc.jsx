import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { mm } from '../theme/units'

const SECTION_TITLES = {
  cover:           'Обложка',
  features:        'Особенности системы',
  selectEquipment: 'Выбор оборудования',
  acoustic:        'Акустический расчёт',
  recommendations: 'Рекомендации',
  specifications:  'Спецификация',
  specials:        'Описание оборудования',
  rondoDelivery:   'Условия поставки',
}

export function PdfToc({ theme, enabledSections, sectionOrder, targetSystem }) {
  const visible = sectionOrder.filter(key => {
    if (key === 'toc' || key === 'cover') return false
    return enabledSections[key]
  })

  return (
    <View break>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: mm(8) }} wrap={false}>
        <View style={{ width: mm(1.5), height: mm(10), backgroundColor: theme.accent, marginRight: mm(4) }} />
        <Text style={{ fontSize: theme.fontSize.lg, color: theme.black, fontWeight: 700, fontFamily: theme.fonts.bold }}>
          Оглавление
        </Text>
      </View>

      {visible.map((key, i) => {
        const title = SECTION_TITLES[key] || key
        return (
          <View key={key} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: mm(3) }} wrap={false}>
            <Text style={{ fontSize: theme.fontSize.base, color: theme.gray, fontFamily: theme.fonts.regular, width: mm(8) }}>
              {i + 1}.
            </Text>
            <Text style={{ fontSize: theme.fontSize.base, color: theme.black, fontFamily: theme.fonts.regular, flex: 1 }}>
              {title}
            </Text>
            {/* Точки */}
            <View style={{ flex: 1, borderBottom: `1pt dotted ${theme.border}`, marginHorizontal: mm(2), marginBottom: mm(1) }} />
            <Text style={{ fontSize: theme.fontSize.base, color: theme.accent, fontFamily: theme.fonts.bold, fontWeight: 700, width: mm(8), textAlign: 'right' }}>
              —
            </Text>
          </View>
        )
      })}
    </View>
  )
}
