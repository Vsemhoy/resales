import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { PdfSectionBar } from '../shared/PdfSectionBar'
import { HtmlToPdfV2, wrapJustify } from '../shared/HtmlToPdfV2'

export function PdfBlockSpecials({ cfg, data, models = [], sectionNumber }) {
  const { color, text, font, weight, space } = cfg
  const ignored   = data?.specialsIgnore    ?? []
  const overrides = data?.specialsOverrides ?? {}

  const visible = models.filter(m => !ignored.includes(m.model_id ?? m.id))
  if (!visible.length) return null

  return (
    <View>
      <PdfSectionBar cfg={cfg} number={sectionNumber} title="Описание оборудования" />

      {visible.map((model, i) => {
        const id       = model.model_id ?? model.id
        const ov       = overrides[id]
        const name     = model.info_model?.name || ''
        const caption  = model.info_model?.caption || ''
        const shortNote= model.info_model?.short_note_new || model.info_model?.short_note || ''
        const desc     = ov?.description_kp ?? model.info_model?.description_kp ?? ''
        const specials = ov?.specials ?? (model.model_specials || []).map(s => s.special_name)

        return (
          <View key={id} style={{ marginBottom: space.xl }} wrap={false}>
            {/* Шапка модели */}
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              borderBottomWidth: 0.5, borderBottomColor: color.divider,
              paddingBottom: space.xs, marginBottom: space.sm,
            }}>
              <View style={{ width: 3, height: text.lg * 1.4, backgroundColor: color.accent, marginRight: space.sm }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: text.md, fontFamily: font.bold, fontWeight: weight.bold, color: color.textPrimary }}>
                  {name}
                </Text>
                {shortNote ? (
                  <Text style={{ fontSize: text.xs, fontFamily: font.regular, color: color.textSecondary, marginTop: 1 }}>
                    {shortNote}
                  </Text>
                ) : null}
              </View>
            </View>

            {/* Описание + буллеты в две колонки */}
            <View style={{ flexDirection: 'row', gap: space.lg }}>

              {/* Описание */}
              {desc ? (
                <View style={{ flex: 3 }}>
                  <HtmlToPdfV2 html={wrapJustify(desc)} cfg={cfg} />
                </View>
              ) : null}

              {/* Буллеты */}
              {specials.length > 0 && (
                <View style={{ flex: 2 }}>
                  {specials.map((sp, si) => (
                    <View key={si} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: space.xs }}>
                      <View style={{
                        width: 3, height: 3, borderRadius: 1.5,
                        backgroundColor: color.accent,
                        marginRight: space.xs, marginTop: text.sm * 0.4,
                        flexShrink: 0,
                      }} />
                      <Text style={{ fontSize: text.xs, fontFamily: font.regular, color: color.textPrimary, flex: 1, lineHeight: 1.5 }}>
                        {sp}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )
      })}
    </View>
  )
}
