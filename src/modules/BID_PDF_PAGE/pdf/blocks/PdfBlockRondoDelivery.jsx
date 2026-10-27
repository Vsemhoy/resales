import React from 'react'
import { View } from '@react-pdf/renderer'
import { Text } from '../shared/PdfText'
import { PdfSectionBar } from '../shared/PdfSectionBar'
import { applyNonBreakingSpacesPro } from '../../utils/splitText'

import { DEFAULT_BULLETS } from '../../utils/deliveryTerms'


function getBg(colorKey, cfg) {
  if (!colorKey || colorKey === 'default') return cfg.color.bgMuted
  if (colorKey === 'accent') return cfg.color.accentLight ?? '#fff3e8'
  if (colorKey === 'cold')   return cfg.color.bulletCold
  if (colorKey === 'warn')   return cfg.color.bulletWarn
  if (colorKey === 'danger') return cfg.color.bulletDanger
  return cfg.color.bgMuted
}

function Bullet({ bullet, cfg, isLast }) {
  const { color, text, font, weight, space } = cfg
  const DOT_SIZE = 5

  return (
    <View style={{ flexDirection: 'row', marginBottom: isLast ? 0 : space.xxxs }} wrap={false}>
      <View style={{
        width:           DOT_SIZE,
        height:          DOT_SIZE,
        borderRadius:    DOT_SIZE / 2,
        backgroundColor: color.accent,
        marginTop:       text.xxs * 0.45,
        marginRight:     space.sm,
        flexShrink:      0,
      }} />

      {bullet.decorated ? (
        <View style={{
          flex:              1,
          backgroundColor:   getBg(bullet.color, cfg),
          borderRadius:      space.xxxs,
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
          {bullet.text ? (
            <Text style={{
              fontSize:   text.sm,
              fontFamily: font.regular,
              fontWeight: weight.regular,
              color:      color.textSecondary,
              paddingTop: space.xxxs,
              lineHeight: 1.5,
            }}>
              {applyNonBreakingSpacesPro(bullet.text)}
            </Text>
          ) : null}
        </View>
      ) : (
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
          {bullet.text ? (
            <Text style={{
              paddingTop: space.xxxs,
              fontSize:   text.sm,
              fontFamily: font.regular,
              fontWeight: weight.regular,
              color:      color.textSecondary,
              lineHeight: 1.5,
            }}>
              {applyNonBreakingSpacesPro(bullet.text)}
            </Text>
          ) : null}
        </View>
      )}
    </View>
  )
}

export function PdfBlockRondoDelivery({ cfg, data, sectionNumber, forceBreak = false }) {
  const { space } = cfg
  const rd      = data?.rondoDelivery || {}
  // Пустой сохранённый массив означает, что пользователь удалил все пункты.
  const bullets = (Array.isArray(rd.bullets) ? rd.bullets : DEFAULT_BULLETS)
    .filter(b => b.text || b.title)

  return (
    <View break={forceBreak} style={{ marginBottom: space.end }}>
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

    </View>
  )
}
