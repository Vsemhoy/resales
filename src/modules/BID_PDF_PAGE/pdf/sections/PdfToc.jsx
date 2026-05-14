import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { mm } from '../theme/units'

const SECTION_TITLES = {
  features:        'Особенности системы',
  selectEquipment: 'Выбор оборудования',
  acoustic:        'Акустический расчёт',
  recommendations: 'Рекомендации',
  specifications:  'Спецификация',
  specials:        'Описание оборудования',
  rondoDelivery:   'Условия поставки',
}

export function PdfToc({ theme, enabledSections, sectionOrder }) {
  const visible = sectionOrder.filter(key =>
    key !== 'toc' && key !== 'cover' && enabledSections[key] && SECTION_TITLES[key]
  )

  return (
    <View>
      {/* Заголовок */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: mm(8), marginTop: mm(4) }}>
        <View style={{ width: mm(1.5), height: mm(10), backgroundColor: theme.accent, marginRight: mm(4) }} />
        <Text style={{ fontSize: theme.fontSize.lg, color: theme.black, fontFamily: theme.fonts.bold, fontWeight: 700 }}>
          Оглавление
        </Text>
      </View>

      {/* Пункты */}
      {visible.map((key, i) => (
        <View key={key} style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: mm(4) }}>
          <Text style={{ fontSize: theme.fontSize.base, color: theme.gray, fontFamily: theme.fonts.regular, width: mm(8) }}>
            {i + 1}.
          </Text>
          <Text style={{ fontSize: theme.fontSize.base, color: theme.black, fontFamily: theme.fonts.regular }}>
            {SECTION_TITLES[key]}
          </Text>
          <View style={{ flex: 1, borderBottomWidth: 1, borderBottomColor: theme.border, borderBottomStyle: 'dashed', marginHorizontal: mm(3), marginBottom: mm(1) }} />
          <Text style={{ fontSize: theme.fontSize.base, color: theme.accent, fontFamily: theme.fonts.bold, fontWeight: 700 }}>
            —
          </Text>
        </View>
      ))}
    </View>
  )
}
