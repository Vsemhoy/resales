import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { PdfSectionBar } from '../shared/PdfSectionBar'

const DEFAULT_BULLETS = [
  { id: 'b1', title: 'Срок поставки',     text: 'Срок поставки оборудования под заказ — 3 месяца с момента оплаты счета.', decorated: true  },
  { id: 'b2', title: 'НДС',              text: 'Цены указаны с учётом НДС 22%.', decorated: true  },
  { id: 'b3', title: 'Гарантия',         text: 'Гарантийный срок на оборудование составляет 12 месяцев.', decorated: true  },
  { id: 'b4', title: 'Срок действия КП', text: 'Коммерческое предложение действительно при условии изменения курсов валют не более 3% от курсов, установленных ЦБ РФ на дату выставления КП.', decorated: true  },
  { id: 'b5', title: 'Доставка',         text: 'Доставка в регионы осуществляется транспортной компанией.', decorated: false },
]

// ─── Один буллет ─────────────────────────────────────────────────────────────
function Bullet({ bullet, cfg, isLast }) {
  const { color, text, font, weight, space } = cfg
  const DOT_SIZE = 5

  return (
    <View style={{ flexDirection: 'row', marginBottom: isLast ? 0 : space.xxxs }} wrap={false}>

      {/* Точка-буллет */}
      <View style={{
        width:           DOT_SIZE,
        height:          DOT_SIZE,
        borderRadius:    DOT_SIZE / 2,
        backgroundColor: color.accent,
        marginTop:       text.sm * 0.45, // визуально по центру первой строки
        marginRight:     space.sm,
        flexShrink:      0,
      }} />

      {/* Контент */}
      {bullet.decorated ? (
        // С фоном
        <View style={{
          flex:            1,
          backgroundColor: color.bgMuted,
          borderRadius:    space.xxxs,
          paddingHorizontal: space.sm,
          paddingVertical:   space.xs,
        }}>
          {bullet.title ? (
            <Text style={{
              fontSize:     text.base,
              fontFamily:   font.bold,
              fontWeight:   weight.semibold,
              color:        color.textPrimary,
              marginBottom: 2,
            }}>
              {bullet.title}
            </Text>
          ) : null}
          <Text style={{
            fontSize:   text.sm,
            fontFamily: font.regular,
            fontWeight: weight.regular,
            color:      color.textSecondary,
            paddingTop: space.xxxs,
            lineHeight: 1.5,
          }}>
            {bullet.text}
          </Text>
        </View>
      ) : (
        // Без фона
        <View style={{ flex: 1 }}>
          {bullet.title ? (
            <Text style={{
              fontSize:     text.base,
              fontFamily:   font.bold,
              fontWeight:   weight.semibold,
              color:        color.textPrimary,
              marginBottom: 2,
            }}>
              {bullet.title}
            </Text>
          ) : null}
          <Text style={{
            paddingTop: space.xxxs,
            fontSize:   text.sm,
            fontFamily: font.regular,
            fontWeight: weight.regular,
            color:      color.textSecondary,
            lineHeight: 1.5,
          }}>
            {bullet.text}
          </Text>
        </View>
      )}
    </View>
  )
}

// ─── Блок менеджера ───────────────────────────────────────────────────────────
function ManagerBlock({ cfg, data }) {
  const { color, text, font, weight, space } = cfg
  const rd          = data?.rondoDelivery || {}
  const byeLabel    = rd.byeLabel    || 'Ваш менеджер'
  const byeName     = rd.byeName     || data?.manager_name || ''
  const byeContacts = rd.byeContacts || [data?.tel, data?.email].filter(Boolean).join('\n')

  if (!byeName && !byeContacts) return null

  return (
    <View style={{
      marginTop:         space.xl,
      paddingLeft:       space.md,
      borderLeftWidth:   1,
      borderLeftColor:   color.tableTotal,
      // backgroundColor:   color.bgSubtle,
    }}>
      <Text style={{
        fontSize:     text.xs,
        fontFamily:   font.bold,
        fontWeight:   weight.semibold,
        color:        color.accent,
        marginBottom: space.xxs,
        textTransform: 'uppercase',
      }}>
        {byeLabel}
      </Text>
      {byeName ? (
        <Text style={{
          fontSize:     text.base,
          fontFamily:   font.bold,
          fontWeight:   weight.bold,
          color:        color.textPrimary,
          marginBottom: space.xs,
        }}>
          {byeName}
        </Text>
      ) : null}
      {byeContacts ? (
        <Text style={{
          fontSize:   text.sm,
          fontFamily: font.regular,
          color:      color.textSecondary,
          lineHeight: 1.6,
        }}>
          {byeContacts}
        </Text>
      ) : null}
    </View>
  )
}

// ─── Главный блок ─────────────────────────────────────────────────────────────
export function PdfBlockRondoDelivery({ cfg, data, sectionNumber }) {
  const { space } = cfg
  const rd      = data?.rondoDelivery || {}
  const bullets = (rd.bullets?.length ? rd.bullets : DEFAULT_BULLETS)
    .filter(b => b.text || b.title)

  return (
    <View style={{ marginBottom: space.end }}>
      <PdfSectionBar cfg={cfg} number={sectionNumber} title="Условия оплаты и поставки" />

      <View style={{ gap: space.sm }}>
        {bullets.map((bullet, i) => (
          <Bullet
            key={bullet.id ?? i}
            bullet={bullet}
            cfg={cfg}
            isLast={i === bullets.length - 1}
          />
        ))}
      </View>

      <ManagerBlock cfg={cfg} data={data} />
    </View>
  )
}
