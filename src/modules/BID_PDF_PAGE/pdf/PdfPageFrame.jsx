import React from 'react'
import { View, Text, Image } from '@react-pdf/renderer'

// Хедер и футер — fixed, повторяются на каждой странице
export function PdfPageFrame({ cfg, draft, companyId }) {
  const { color, layout, text, font, weight } = cfg
  const siteName = companyId === '3' ? 'rondo-sound.ru' : 'arstel.com'
  const logoSrc  = companyId === '3' ? '/brands/rondo/logo.png' : '/brands/arstel/logo.png'

  return (
    <>
      {/* Хедер — только на первой странице */}
      <View
        fixed
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: layout.marginTop }}
        render={({ pageNumber }) => pageNumber > 1 ? null : (
          <View style={{
            paddingTop: layout.marginTop * 0.3,
            paddingHorizontal: layout.marginLeft,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: layout.marginTop,
          }}>
            <Text style={{ fontSize: text.sm, color: color.accent, fontFamily: font.bold, fontWeight: weight.bold }}>
              {companyId === '3' ? 'RONDO' : 'ARSTEL'}
            </Text>
            {draft?.object ? (
              <Text style={{ fontSize: text.xs, color: color.textSecondary, fontFamily: font.regular }}>
                {draft.object}
              </Text>
            ) : null}
          </View>
        )}
      />

      {/* Линия под хедером — только на первой странице */}
      <View
        fixed
        style={{ position: 'absolute', top: layout.marginTop - 1, left: layout.marginLeft, right: layout.marginRight, height: 0.5 }}
        render={({ pageNumber }) => pageNumber > 1 ? null : (
          <View style={{ height: 0.5, backgroundColor: color.divider }} />
        )}
      />

      {/* Футер */}
      <View fixed style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: layout.marginBottom,
        paddingBottom: layout.marginBottom * 0.25,
        paddingHorizontal: layout.marginLeft,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
      }}>
        <Text style={{ fontSize: text.xs, color: color.accent, fontFamily: font.bold, fontWeight: weight.semibold }}>
          {siteName}
        </Text>
        <Text
          style={{ fontSize: text.xs, color: color.textSecondary, fontFamily: font.regular }}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        />
      </View>

      {/* Линия над футером */}
      <View fixed style={{
        position: 'absolute',
        bottom: layout.marginBottom - 1,
        left: layout.marginLeft,
        right: layout.marginRight,
        height: 0.5,
        backgroundColor: color.divider,
      }} />
    </>
  )
}
