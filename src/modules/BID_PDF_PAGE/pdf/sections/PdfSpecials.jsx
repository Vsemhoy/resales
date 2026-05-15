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

export function PdfSpecials({ theme, data, models, sectionNumber }) {
  const ignored   = data?.specialsIgnore    ?? []
  const overrides = data?.specialsOverrides ?? {}

  const visible = (models || []).filter(m => {
    const id = m.model_id ?? m.id
    return !ignored.includes(id)
  })

  if (!visible.length) return null

  return (
    <View>
      <SectionHeading theme={theme} number={sectionNumber} title="Описание оборудования" />
      {visible.map((model, i) => {
        const id       = model.model_id ?? model.id
        const ov       = overrides[id]
        const name     = model.info_model?.name || ''
        const desc     = ov?.description_kp ?? model.info_model?.description_kp ?? ''
        const specials = ov?.specials ?? (model.model_specials || []).map(s => s.special_name)

        return (
          <View key={id} style={{ marginBottom: mm(10) }}>
            {/* Название */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: mm(3), paddingBottom: mm(2), borderBottomWidth: 0.5, borderBottomColor: theme.border }}>
              <View style={{ width: mm(5), height: mm(5), borderRadius: mm(2.5), backgroundColor: theme.accent, marginRight: mm(3) }} />
              <Text style={{ fontSize: theme.fontSize.md, color: theme.black, fontFamily: theme.fonts.bold, fontWeight: 700 }}>{name}</Text>
              <Text style={{ fontSize: theme.fontSize.xs, color: theme.gray, fontFamily: theme.fonts.regular, marginLeft: mm(3) }}>
                {model.info_model?.short_note || ''}
              </Text>
            </View>

            {/* Описание */}
            {desc ? (
              <Text style={{ fontSize: theme.fontSize.sm, color: theme.black, fontFamily: theme.fonts.regular, lineHeight: 1.6, marginBottom: mm(3) }}>
                {desc.replace(/<[^>]*>/g, '').trim()}
              </Text>
            ) : null}

            {/* Буллеты */}
            {specials.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {specials.map((sp, si) => (
                  <View key={si} style={{ flexDirection: 'row', alignItems: 'flex-start', width: '50%', marginBottom: mm(2), paddingRight: mm(4) }}>
                    <View style={{ width: mm(1.5), height: mm(1.5), borderRadius: mm(0.75), backgroundColor: theme.accent, marginRight: mm(2), marginTop: mm(1.5) }} />
                    <Text style={{ fontSize: theme.fontSize.xs, color: theme.black, fontFamily: theme.fonts.regular, flex: 1 }}>{sp}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )
      })}
    </View>
  )
}
