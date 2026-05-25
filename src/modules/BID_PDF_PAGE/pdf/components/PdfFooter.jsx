import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { mm } from '../theme/units'

export function PdfFooter({ theme }) {
  const s = {
    wrap: {
      position: 'absolute', bottom: mm(6), left: theme.page.marginLeft,
      right: theme.page.marginRight, height: mm(8),
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    },
    divider: {
      position: 'absolute', bottom: mm(14), left: theme.page.marginLeft,
      right: theme.page.marginRight, height: 0.5, backgroundColor: theme.border,
    },
    pageNum: {
      fontSize: theme.fontSize.xs, color: theme.gray,
      fontFamily: theme.fonts.regular,
    },
    accent: {
      fontSize: theme.fontSize.xs, color: theme.accent,
      fontFamily: theme.fonts.regular, fontWeight: 600,
    },
  }

  return (
    <View fixed style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
      <View style={s.divider} />
      <View style={s.wrap}>
        <Text style={s.accent}>
          {theme.accent === '#FF5903' ? 'arstel.com' : 'rondo-sound.ru'}
        </Text>
        <Text style={s.pageNum} render={({ pageNumber, totalPages }) =>
          `${pageNumber} / ${totalPages}`
        } />
      </View>
    </View>
  )
}
