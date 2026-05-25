import React from 'react'
import { View, Text, Image } from '@react-pdf/renderer'
import { PdfSectionBar } from '../shared/PdfSectionBar'

const DELIVERY_DEFAULTS = [
  'Коммерческое предложение действительно при условии изменения курсов валют не более 3% от курсов, установленных ЦБ РФ на дату выставления КП.',
  'Срок поставки оборудования под заказ — 3 месяца с момента оплаты счета.',
  'Гарантийный срок на оборудование составляет 12 месяцев.',
  'По условиям договора поставка осуществляется при 100% предоплате со склада в Санкт-Петербурге. Цены указаны с учётом НДС 22%.',
]

const ARROW_IMG = `${window.location.origin}/brands/rondo/p14_arrows.png`
const TRUCK_IMG = `${window.location.origin}/brands/rondo/p14_delivery.png`

function Card({ text, cfg }) {
  const { color, text: t, font, weight, space } = cfg
  return (
    <View style={{
      backgroundColor: color.bgMuted,
      borderRadius:    space.xs,
      padding:         space.md,
      flexDirection:   'row',
      alignItems:      'center',
      gap:             space.sm,
    }}>
      <Image
        src={ARROW_IMG}
        style={{ width: space.xl, height: space.xl, flexShrink: 0 }}
      />
      <Text style={{
        flex:       1,
        fontSize:   t.sm,
        fontFamily: font.regular,
        fontWeight: weight.regular,
        color:      color.textSecondary,
        lineHeight: 1.5,
      }}>
        {text}
      </Text>
    </View>
  )
}

export function PdfBlockRondoDelivery({ cfg, data, sectionNumber }) {
  const { color, text, font, weight, space } = cfg

  const rd      = data?.rondoDelivery || {}
  const items   = rd.deliveryItems || DELIVERY_DEFAULTS
  const byeLabel    = rd.byeLabel    || 'Ваш менеджер'
  const byeName     = rd.byeName     || data?.manager_name || ''
  const byeContacts = rd.byeContacts || [data?.tel, data?.email].filter(Boolean).join('\n')

  const [card0, card1, card2, card3] = items

  return (
    <View style={{ marginBottom: cfg.space.end }}>
      <PdfSectionBar cfg={cfg} number={sectionNumber} title="Условия поставки" />

      {/* Первая карточка — во всю ширину */}
      {card0 ? <Card text={card0} cfg={cfg} /> : null}

      {/* Средний ряд: две карточки + грузовик */}
      <View style={{ flexDirection: 'row', gap: space.lg, marginTop: space.sm }}>
        <View style={{ flex: 1, gap: space.sm }}>
          {card1 ? <Card text={card1} cfg={cfg} /> : null}
          {card2 ? <Card text={card2} cfg={cfg} /> : null}
        </View>
        <View style={{ width: space.xxl * 6, alignItems: 'center', justifyContent: 'center' }}>
          <Image
            src={TRUCK_IMG}
            style={{ width: space.xxl * 6, height: space.xxl * 4, objectFit: 'contain' }}
          />
        </View>
      </View>

      {/* Нижний текст (4-й пункт) */}
      {card3 ? (
        <Text style={{
          fontSize:   text.xs,
          fontFamily: font.regular,
          color:      color.textMuted,
          lineHeight: 1.5,
          marginTop:  space.md,
        }}>
          {card3}
        </Text>
      ) : null}

      {/* Блок с контактами менеджера */}
      {(byeName || byeContacts) ? (
        <View style={{
          marginTop:       space.xl,
          padding:         space.md,
          borderLeftWidth: 3,
          borderLeftColor: color.accent,
          backgroundColor: color.bgSubtle,
        }}>
          <Text style={{
            fontSize:   text.xs,
            fontFamily: font.bold,
            fontWeight: weight.semibold,
            color:      color.accent,
            marginBottom: space.xxs,
            textTransform: 'uppercase',
          }}>
            {byeLabel}
          </Text>
          {byeName ? (
            <Text style={{
              fontSize:   text.base,
              fontFamily: font.bold,
              fontWeight: weight.bold,
              color:      color.textPrimary,
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
      ) : null}
    </View>
  )
}
