import React from 'react'
import { View, Text, Image } from '@react-pdf/renderer'
import { PdfSectionBar } from '../shared/PdfSectionBar'
import { HtmlToPdfV2, wrapJustify } from '../shared/HtmlToPdfV2'
import { HTTP_ROOT } from '../../../../config/config'
import { cleanAlphaNumeric } from '../../utils/splitText'

const CURRENCY_SYMBOLS = { '1': '$', '2': '€', '3': '₽' }

const fmt = (n) => Number(parseFloat(n) || 0)
  .toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function modelPhotoUrl(name) {
  let rt = HTTP_ROOT + '/api/soma/pdf/modfilesautocut/' + cleanAlphaNumeric(name)
  if (!rt.startsWith('http')) rt = 'http://' + rt
  return rt
}

export function PdfBlockSpecifications({ cfg, models = [], currency, tableFootnote, sectionNumber, tableStyle = 'compact' }) {
  const { color, text, font, weight, space, layout } = cfg
  if (!models.length) return null

  const withPhotos = tableStyle === 'default'
  const photoW     = layout.tableColPhotoW

  const sym  = CURRENCY_SYMBOLS[currency?.value] || '₽'
  const cW   = layout.contentW

  const W = {
    num:      layout.tableColNumW,
    qty:      layout.tableColQtyW,
    price:    layout.tableColPriceW,
    total:    layout.tableColTotalW,
    presence: layout.tableColPresenceW,
  }
  const nameW = cW - W.num - W.qty - W.price - W.total - W.presence - (withPhotos ? photoW : 0)

  const totalSum = models.reduce((s, m) => s + (parseFloat(m.price) || 0) * (m.model_count || 0), 0)

  const cellBase = { paddingHorizontal: space.xs, paddingVertical: space.xs }

  const headerStyle = {
    ...cellBase,
    fontSize:    text.xs,
    fontFamily:  font.bold,
    fontWeight:  weight.bold,
    color:       color.tableHeaderText,
    backgroundColor: color.tableHeader,
  }

  const rowText = (align = 'left') => ({
    ...cellBase,
    fontSize:   text.sm,
    fontFamily: font.regular,
    color:      color.textPrimary,
    textAlign:  align,
  })

  return (
    <View style={{ marginBottom: cfg.space.end}}>
      <PdfSectionBar cfg={cfg} number={sectionNumber} title="Спецификация" />

      {/* Шапка */}
      <View style={{ flexDirection: 'row' }} wrap={false}>
        <Text style={[headerStyle, { width: W.num,      textAlign: 'center' }]}>№</Text>
        <Text style={[headerStyle, { width: nameW,      textAlign: 'left'   }]}>Наименование</Text>
        <Text style={[headerStyle, { width: W.qty,      textAlign: 'center' }]}>Кол-во</Text>
        <Text style={[headerStyle, { width: W.price,    textAlign: 'right'  }]}>Цена, {sym}</Text>
        <Text style={[headerStyle, { width: W.total,    textAlign: 'right'  }]}>Сумма, {sym}</Text>
        <Text style={[headerStyle, { width: W.presence, textAlign: 'center' }]}>Наличие</Text>
        {withPhotos && (
          <Text style={[headerStyle, { width: photoW, textAlign: 'center' }]}>Фото</Text>
        )}
      </View>

      {/* Строки */}
      {models.map((m, i) => {
        const price = parseFloat(m.price) || 0
        const total = price * (m.model_count || 0)
        const bg    = i % 2 === 1 ? color.tableRowEven : color.tableRowOdd
        const name  = m.info_model?.name || `Позиция ${i + 1}`
        const note  = m.info_model?.short_note_new || m.info_model?.short_note || ''

        return (
          <View key={m.id || i} style={{ flexDirection: 'row', backgroundColor: bg }} wrap={false}>
            <Text style={[rowText('center'), { width: W.num, color: color.textSecondary }]}>{i + 1}</Text>
            <View style={{ width: nameW, ...cellBase }}>
              <Text style={{ fontSize: text.sm, fontFamily: font.bold, fontWeight: weight.semibold, color: color.textPrimary }}>
                {name}
              </Text>
              {note ? (
                <Text style={{ fontSize: text.xs, fontFamily: font.regular, color: color.textSecondary, marginTop: 1 }}>
                  {note}
                </Text>
              ) : null}
            </View>
            <Text style={[rowText('center'), { width: W.qty  }]}>{m.model_count || 0}</Text>
            <Text style={[rowText('right'),  { width: W.price}]}>{fmt(price)}</Text>
            <Text style={[rowText('right'),  { width: W.total, fontFamily: font.bold, fontWeight: weight.semibold }]}>{fmt(total)}</Text>
            <Text style={[rowText('center'), { width: W.presence, color: color.textSecondary }]}>
              {m.presence > 0 ? 'В нал.' : 'Заказ'}
            </Text>
            {withPhotos && (
              <View style={{ width: photoW, ...cellBase, alignItems: 'center', justifyContent: 'center' }}>
                <Image
                  src={modelPhotoUrl(name)}
                  style={{ width: photoW - space.sm * 2, height: space.xxl * 2, objectFit: 'contain' }}
                />
              </View>
            )}
          </View>
        )
      })}

      {/* Итого */}
      <View style={{ flexDirection: 'row', backgroundColor: color.tableTotal, marginTop: 1 }} wrap={false}>
        <Text style={[headerStyle, { width: W.num + nameW + W.qty + W.price }]}>ИТОГО</Text>
        <Text style={[headerStyle, { width: W.total, textAlign: 'right' }]}>{fmt(totalSum)} {sym}</Text>
        <Text style={[headerStyle, { width: W.presence }]} />
        {withPhotos && <Text style={[headerStyle, { width: photoW }]} />}
      </View>


      {/* Сноска */}
      {tableFootnote ? (
        <View>
          <View style={{ height: space.sm }}></View>
            <View style={{padding: space.sm, backgroundColor: color.tableRowEven, fontSize: '0.5rem'}}>
              <HtmlToPdfV2 html={wrapJustify(tableFootnote)} cfg={cfg} />
            </View>

        </View>
      ) : null}
    </View>
  )
}
