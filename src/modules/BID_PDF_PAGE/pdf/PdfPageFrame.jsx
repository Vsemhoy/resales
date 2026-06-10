import React from 'react'
import { View, Text, Image } from '@react-pdf/renderer'

const SITE_DEFAULTS = { '2': 'arstel.com', '3': 'rondo-sound.ru' }

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
  const mode     = fs.mode   || 'text'
  const siteText = fs.siteText ?? SITE_DEFAULTS[String(companyId)] ?? 'arstel.com'
  const logos    = Array.isArray(fs.logos) ? fs.logos.slice(0, 2) : []

  const LOGO_H = layout.marginBottom * 0.25   // ~10mm — вписывается в подвал

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
        bottom:           layout.marginBottom * 0.55,
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
        height:             layout.marginBottom * 0.55,
        paddingHorizontal:  layout.marginLeft,
        flexDirection:      'row',
        alignItems:         'center',
        justifyContent:     'space-between',
      }}>
        {/* Левая часть — текст сайта или логотипы */}
        {mode === 'logos' && logos.length > 0 ? (
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
