import React from 'react'
import { View, Text, Image } from '@react-pdf/renderer'

function absUrl(src) {
  if (!src || typeof src !== 'string') return null
  if (src.startsWith('http') || src.startsWith('data:') || src.startsWith('blob:')) return src
  return `${window.location.origin}${src}`
}

export function PdfBlockCoverHat({ cfg, data, draft }) {
  const { color, layout, text, font, weight, space, cover } = cfg
  const hatUrl = absUrl(data?.hatImage)

  return (
    <View>
      {/* Баннер — за поля через отрицательные отступы */}
      <View style={{
        marginTop:    -layout.marginTop,
        marginLeft:   -layout.marginLeft,
        marginRight:  -layout.marginRight,
        marginBottom:  space.lg,
      }}>
        {hatUrl
          ? <Image src={hatUrl} style={{ width: layout.pageW, height: cover.hatHeight, objectFit: 'cover' }} />
          : <View style={{ width: layout.pageW, height: cover.hatHeight, backgroundColor: color.accentLight }} />
        }
      </View>

      {/* Строка реквизитов */}
      <View style={{
        flexDirection: 'row',
        paddingBottom: space.md,
        marginBottom:  space.md,
        borderBottomWidth: 0.5,
        borderBottomColor: color.divider,
      }}>
        {/* Левый блок */}
        <View style={{ flex: 1 }}>
          {data?.ext_number && (
            <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: space.xs }}>
              <Text style={{ fontSize: text.sm, color: color.textSecondary, fontFamily: font.regular, width: space.xxl * 1.8 }}>
                Исх. номер
              </Text>
              <Text style={{ fontSize: text.sm, color: color.textPrimary, fontFamily: font.bold, fontWeight: weight.semibold }}>
                № {data.ext_number}
              </Text>
            </View>
          )}
          {data?.date && (
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text style={{ fontSize: text.sm, color: color.textSecondary, fontFamily: font.regular, width: space.xxl * 1.8 }}>
                Дата
              </Text>
              <Text style={{ fontSize: text.sm, color: color.textPrimary, fontFamily: font.regular }}>
                {data.date}
              </Text>
            </View>
          )}
        </View>

        {/* Правый блок — кому */}
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          {data?.target_occupy && (
            <Text style={{ fontSize: text.sm, color: color.textSecondary, fontFamily: font.regular }}>
              {data.target_occupy}
            </Text>
          )}
          {data?.target_name && (
            <Text style={{ fontSize: text.sm, color: color.textPrimary, fontFamily: font.bold, fontWeight: weight.semibold }}>
              {data.target_name}
            </Text>
          )}
        </View>
      </View>

      {/* Тема */}
      {/* <Text style={{ fontSize: text.xl, color: color.textPrimary, fontFamily: font.bold, fontWeight: weight.bold, marginBottom: space.lg }}>
        {draft?.object || 'Коммерческое предложение'}
      </Text> */}
            <Text style={{ fontSize: text.xl, color: color.textPrimary, fontFamily: font.bold, fontWeight: weight.bold, marginBottom: space.lg }}>
        {'Коммерческое предложение'}
      </Text>
    </View>
  )
}
