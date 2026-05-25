import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { mm } from '../theme/units'

export function PdfHeader({ theme, draft }) {
  return (
    <View fixed style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
      <View style={{
        position: 'absolute', top: mm(8), left: theme.page.marginLeft,
        right: theme.page.marginRight, height: mm(10),
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* TODO: Image лого — раскомментить когда проверим путь */}
        {/* <Image src="/brands/arstel/logo.png" style={{ height: mm(7) }} /> */}
        <Text style={{ fontSize: theme.fontSize.sm, color: theme.accent, fontFamily: theme.fonts.bold, fontWeight: 700 }}>
          {theme.accent === '#FF5903' ? 'ARSTEL' : 'RONDO'}
        </Text>
        {draft?.object && (
          <Text style={{ fontSize: theme.fontSize.xs, color: theme.gray, fontFamily: theme.fonts.regular }}>
            {draft.object}
          </Text>
        )}
      </View>
      <View style={{
        position: 'absolute', top: mm(18), left: theme.page.marginLeft,
        right: theme.page.marginRight, height: 0.5, backgroundColor: theme.border,
      }} />
    </View>
  )
}
