import React from 'react'
import { View, Text, Image } from '@react-pdf/renderer'
import { mm } from '../theme/units'

export function PdfCover({ theme, data, draft, currency }) {
  const s = {
    page: {
      flex: 1, minHeight: mm(257), // A4 height - margins
      flexDirection: 'row',
    },
    left: {
      flex: 1, paddingTop: mm(30), paddingBottom: mm(10),
      flexDirection: 'column', justifyContent: 'space-between',
    },
    right: {
      width: mm(70), backgroundColor: theme.grayLight,
      overflow: 'hidden',
    },
    coverImg: { width: '100%', height: '100%', objectFit: 'cover' },

    kpLabel: {
      fontSize: theme.fontSize.xs, color: theme.gray, letterSpacing: 1.5,
      textTransform: 'uppercase', fontFamily: theme.fonts.regular,
      marginBottom: mm(4),
    },
    title: {
      fontSize: theme.fontSize.xl, color: theme.black, fontWeight: 700,
      fontFamily: theme.fonts.bold, marginBottom: mm(2), lineHeight: 1.3,
    },
    subtitle: {
      fontSize: theme.fontSize.sm, color: theme.gray,
      fontFamily: theme.fonts.regular, lineHeight: 1.5,
    },

    divider: { height: 2, width: mm(20), backgroundColor: theme.accent, marginVertical: mm(8) },

    toLabel: { fontSize: theme.fontSize.xs, color: theme.gray, fontFamily: theme.fonts.regular, marginBottom: mm(1) },
    toName:  { fontSize: theme.fontSize.base, color: theme.black, fontWeight: 600, fontFamily: theme.fonts.bold },
    toOccupy:{ fontSize: theme.fontSize.xs, color: theme.gray, fontFamily: theme.fonts.regular, marginTop: mm(1) },

    bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    managerBlock: {},
    managerName:  { fontSize: theme.fontSize.sm, color: theme.black, fontWeight: 600, fontFamily: theme.fonts.bold },
    managerOccupy:{ fontSize: theme.fontSize.xs, color: theme.gray, fontFamily: theme.fonts.regular },
    contactBlock: { alignItems: 'flex-end' },
    contact:      { fontSize: theme.fontSize.xs, color: theme.gray, fontFamily: theme.fonts.regular, lineHeight: 1.6 },
  }

  return (
    <View style={s.page} break>
      {/* Левая колонка */}
      <View style={s.left}>
        {/* Верхний блок */}
        <View>
          <Text style={s.kpLabel}>Коммерческое предложение</Text>
          {data?.ext_number && (
            <Text style={[s.kpLabel, { marginBottom: mm(8) }]}>№ {data.ext_number}</Text>
          )}
          <Text style={s.title}>{draft?.object || 'Система'}</Text>
          {data?.object_address && (
            <Text style={s.subtitle}>{data.object_address}</Text>
          )}
          <View style={s.divider} />
          {(data?.target_name || data?.target_occupy) && (
            <View>
              <Text style={s.toLabel}>Кому</Text>
              {data.target_name   && <Text style={s.toName}>{data.target_name}</Text>}
              {data.target_occupy && <Text style={s.toOccupy}>{data.target_occupy}</Text>}
            </View>
          )}
        </View>

        {/* Нижний блок */}
        <View style={s.bottomRow}>
          <View style={s.managerBlock}>
            {data?.manager_name   && <Text style={s.managerName}>{data.manager_name}</Text>}
            {data?.manager_occupy && <Text style={s.managerOccupy}>{data.manager_occupy}</Text>}
          </View>
          <View style={s.contactBlock}>
            {data?.tel   && <Text style={s.contact}>{data.tel}</Text>}
            {data?.email && <Text style={s.contact}>{data.email}</Text>}
          </View>
        </View>
      </View>

      {/* Правая колонка — картинка */}
      <View style={s.right}>
        {data?.coverBlock
          ? <Image src={data.coverBlock} style={s.coverImg} />
          : <View style={{ flex: 1, backgroundColor: theme.accent + '22' }} />
        }
      </View>
    </View>
  )
}
