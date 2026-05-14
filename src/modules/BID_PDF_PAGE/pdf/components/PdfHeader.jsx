import React from 'react'
import { View, Text, Image } from '@react-pdf/renderer'
import { mm } from '../theme/units'

export function PdfHeader({ theme, draft }) {
  const s = {
    wrap: {
      position: 'absolute', top: mm(8), left: theme.page.marginLeft,
      right: theme.page.marginRight, height: mm(10),
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    },
    logo: { height: mm(7), objectFit: 'contain' },
    divider: {
      position: 'absolute', top: mm(18), left: theme.page.marginLeft,
      right: theme.page.marginRight, height: 0.5, backgroundColor: theme.border,
    },
    object: {
      fontSize: theme.fontSize.xs, color: theme.gray,
      fontFamily: theme.fonts.regular,
    },
  }

  const logoSrc = theme.accent === '#FF5903'
    ? '/brands/arstel/logo.png'
    : '/brands/rondo/logo.png'

  return (
    <View fixed style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
      <View style={s.wrap}>
        <Image src={logoSrc} style={s.logo} />
        {draft?.object && <Text style={s.object}>{draft.object}</Text>}
      </View>
      <View style={s.divider} />
    </View>
  )
}
