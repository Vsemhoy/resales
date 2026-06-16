import React from 'react'
import { View, Text, Image } from '@react-pdf/renderer'
import { mm } from '../theme/units'

const HAT_TEXT_DEFAULTS = {
  '2': `ООО «АРСТЕЛ»\n+7 (812) 207-50-97\nsales@arstel.com\nwww.arstel.com`,
  '3': `ООО «РОНДО-САУНД»\n196006, Россия, Санкт-Петербург\nМосковский проспект, дом 91, литера А\nпомещение 11Н, офис 229\nzakaz@rondo-sound.ru\nwww.rondo-sound.ru\n+7 (812) 339 8972`,
}

function absUrl(src) {
  if (!src || typeof src !== 'string') return null
  if (src.startsWith('http') || src.startsWith('data:') || src.startsWith('blob:')) return src
  return `${window.location.origin}${src}`
}

export function PdfBlockCoverHat({ cfg, data, draft, companyId }) {
  const { color, layout, text, font, weight, space, cover } = cfg
  const hatUrl = absUrl(data?.hatImage)

  // Если hatHeaderText не сохранён явно — берём дефолт компании
  const rawHeaderText = data?.hatHeaderText ?? HAT_TEXT_DEFAULTS[String(companyId)] ?? ''
  const hatHeaderText = typeof rawHeaderText === 'string' ? rawHeaderText.trim() : ''

  return (
    <View>
      {/* Баннер — за поля через отрицательные отступы */}
      <View style={{
        position:      'relative',
        height:         cover.hatHeight,
        marginTop:    -layout.marginTop,
        marginLeft:   -layout.marginLeft,
        marginRight:  -layout.marginRight,
        marginBottom:  space.lg,
      }}>
        {hatUrl
          ? <Image src={hatUrl} style={{ width: layout.pageW, height: cover.hatHeight, objectFit: 'fill' }} />
          : <View style={{ width: layout.pageW, height: cover.hatHeight, backgroundColor: color.accentLight }} />
        }
        {hatHeaderText ? (
          <View style={{
            position: 'absolute',
            right:    mm(12),
            bottom:   mm(4),
            width:    layout.pageW * 0.5,
          }}>
            <Text style={{ fontSize: text.sm, color: color.textPrimary, textAlign: 'right', lineHeight: 1.6 }}>
              {hatHeaderText}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Строка реквизитов */}
      <View style={{
        flexDirection:     'row',
        paddingBottom:      space.md,
        marginBottom:       space.md,
        borderBottomWidth:  0.5,
        borderBottomColor:  color.divider,
      }}>
        {/* Левый блок — исх. номер и дата */}
        <View style={{ flex: 1 }}>
          {data?.ext_number ? (
            <Text style={{ fontSize: text.sm, color: color.textPrimary, fontFamily: font.bold, fontWeight: weight.semibold, marginBottom: 2 }}>
              {'Исх. № '}{String(data.ext_number || '').trim()}
            </Text>
          ) : null}
          {data?.date ? (
            <Text style={{ fontSize: text.sm, color: color.textSecondary, fontFamily: font.regular }}>
              {String(data.date || '').trim()}
            </Text>
          ) : null}
        </View>

        {/* Правый блок — кому */}
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          {data?.target_occupy ? (
            <Text style={{ fontSize: text.sm, color: color.textSecondary, fontFamily: font.regular }}>
              {String(data.target_occupy || '').trim()}
            </Text>
          ) : null}
          {data?.target_name ? (
            <Text style={{ fontSize: text.sm, color: color.textPrimary, fontFamily: font.bold, fontWeight: weight.semibold }}>
              {String(data.target_name || '').trim()}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Заголовок КП — редактируемый, по центру */}
      <Text style={{ fontSize: text.xl, color: color.textPrimary, fontFamily: font.bold, fontWeight: weight.bold, marginBottom: space.lg, textAlign: 'center' }}>
        {data?.coverTitle || 'Коммерческое предложение'}
      </Text>
    </View>
  )
}
