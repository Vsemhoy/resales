import React from 'react'
import { View, Text, Image } from '@react-pdf/renderer'

const SITE_DEFAULTS = { '2': 'arstel.com', '3': 'rondo-sound.ru' }

const REQUISITES_DEFAULTS = {
  '2': `ООО «Арстел», ИНН 7810346024, КПП 781001001, ОГРН 1157847127767
Р/с 40702810690080000773 в ПАО «Банк «Санкт-Петербург»
к/с 30101810900000000790, БИК 044030790`,
  '3': `ООО «РОНДО-САУНД», ИНН: 7810914647, КПП: 781001001, ОГРН: 1217800034462
Р/с: 40702810190080001269 в ПАО БАНК «САНКТ-ПЕТЕРБУРГ»
К/с: 30101810900000000790, БИК: 044030790`,
}

const FOOTER_LOGOS = {
  arstel: '/brands/footer/logo_arstel.png',
  rondo:  '/brands/footer/logo_rondo.png',
  interm: '/brands/footer/logo_interm.png',
  affa:   '/brands/footer/logo_affa.png',
  lda:    '/brands/footer/logo_lda.png',
}

function logoUrl(key) {
  return `${window.location.origin}${FOOTER_LOGOS[key]}`
}

export function PdfPageFrame({ cfg, draft, companyId, formData }) {
  const { color, layout, text, font, weight, space } = cfg

  const fs       = formData?.footerSettings || {}
  const variant  = fs.variant || 'simple'
  const mode     = fs.mode   || 'text'
  const siteText = fs.siteText ?? SITE_DEFAULTS[String(companyId)] ?? 'arstel.com'
  const logos    = Array.isArray(fs.logos) ? fs.logos.slice(0, 2) : []
  const requisitesText = (fs.requisitesText ?? REQUISITES_DEFAULTS[String(companyId)] ?? '')
    .split(/\r?\n/).slice(0, 3).join('\n')

  const LOGO_H = layout.marginBottom * 0.25   // ~10mm — вписывается в подвал
  const footerHeight = variant === 'requisites'
    ? layout.marginBottom * 0.9
    : layout.marginBottom * 0.55

  return (
    <>
      {/* Хедер — только на первой странице */}
      <View
        fixed
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: layout.marginTop }}
        render={({ pageNumber }) => pageNumber > 1 ? null : (
          <View style={{
            paddingTop:         layout.marginTop * 0.3,
            paddingHorizontal:  layout.marginLeft,
            flexDirection:      'row',
            alignItems:         'center',
            justifyContent:     'space-between',
            height:             layout.marginTop,
          }}>
            <Text style={{ fontSize: text.lg, color: color.accent, fontFamily: font.bold, fontWeight: weight.bold }}>
              {companyId === '3' ? 'RONDO' : 'ARSTEL'}
            </Text>
            {draft?.object ? (
              <Text style={{ fontSize: text.lg, color: color.textSecondary, fontFamily: font.regular }}>
                {draft.object}
              </Text>
            ) : null}
          </View>
        )}
      />

      {/* Линия под хедером — только первая страница */}
      <View
        fixed
        style={{ position: 'absolute', top: layout.marginTop - 1, left: layout.marginLeft, right: layout.marginRight, height: 0.5 }}
        render={({ pageNumber }) => pageNumber > 1 ? null : (
          <View style={{ height: 0.5, backgroundColor: color.divider }} />
        )}
      />

      {/* Линия над футером — опущена ниже */}
      <View fixed style={{
        position:        'absolute',
        bottom:           footerHeight,
        left:             layout.marginLeft,
        right:            layout.marginRight,
        height:           0.5,
        backgroundColor:  color.divider,
      }} />

      {/* Футер */}
      <View fixed style={{
        position:          'absolute',
        bottom:             0,
        left:               0,
        right:              0,
        height:             footerHeight,
        paddingHorizontal:  layout.marginLeft,
        paddingTop:         variant === 'requisites' ? space.sm : 0,
        flexDirection:      'row',
        alignItems:         variant === 'requisites' ? 'flex-start' : 'center',
        justifyContent:     'space-between',
      }}>
        {/* Левая часть — текст сайта или логотипы */}
        {variant === 'requisites' ? (
          <Text style={{
            flex:        1,
            marginRight: space.lg,
            fontSize:    text.sm,
            lineHeight:  1.35,
            color:       color.textPrimary,
            fontFamily:  font.regular,
            fontWeight:  weight.regular,
            textAlign:   'left',
          }}>
            {requisitesText}
          </Text>
        ) : mode === 'logos' && logos.length > 0 ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
            {logos.map(key => (
              <Image
                key={key}
                src={logoUrl(key)}
                style={{ height: LOGO_H, maxWidth: LOGO_H * 4, objectFit: 'contain' }}
              />
            ))}
          </View>
        ) : (
          <Text style={{
            fontSize:   text.md,
            color:      color.accent,
            fontFamily: font.regular,
            fontWeight: weight.regular,
          }}>
            {siteText}
          </Text>
        )}

        {/* Номер страницы — жирнее */}
        <Text
          style={{
            fontSize:   text.sm,
            color:      color.textSecondary,
            fontFamily: font.bold,
            fontWeight: weight.bold,
          }}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        />
      </View>
    </>
  )
}
