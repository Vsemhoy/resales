import React from 'react'
import { View, Text, Image } from '@react-pdf/renderer'
import { mm } from '../theme/units'

export function PdfCover({ theme, data, draft }) {
  // @react-pdf/renderer требует абсолютный URL для картинок
  const rawUrl   = data?.coverBlock || null
  const coverUrl = rawUrl && !rawUrl.startsWith('http')
    ? `${window.location.origin}${rawUrl}`
    : rawUrl

  return (
    <View style={{ flexDirection: 'row', minHeight: mm(240) }}>

      {/* Левая колонка */}
      <View style={{ flex: 1, paddingTop: mm(20), paddingBottom: mm(10), paddingRight: mm(8) }}>
        <Text style={{ fontSize: theme.fontSize.xs, color: theme.gray, fontFamily: theme.fonts.regular, marginBottom: mm(4) }}>
          Коммерческое предложение{data?.ext_number ? ` № ${data.ext_number}` : ''}
        </Text>

        <Text style={{ fontSize: theme.fontSize.xl, color: theme.black, fontFamily: theme.fonts.bold, fontWeight: 700, marginBottom: mm(3) }}>
          {draft?.object || 'Система'}
        </Text>

        {data?.object_address ? (
          <Text style={{ fontSize: theme.fontSize.sm, color: theme.gray, fontFamily: theme.fonts.regular, marginBottom: mm(8) }}>
            {data.object_address}
          </Text>
        ) : null}

        <View style={{ height: 2, width: mm(20), backgroundColor: theme.accent, marginBottom: mm(8) }} />

        {data?.target_name ? (
          <View style={{ marginBottom: mm(8) }}>
            <Text style={{ fontSize: theme.fontSize.xs, color: theme.gray, fontFamily: theme.fonts.regular, marginBottom: mm(1) }}>Кому</Text>
            <Text style={{ fontSize: theme.fontSize.base, color: theme.black, fontFamily: theme.fonts.bold, fontWeight: 600 }}>{data.target_name}</Text>
            {data?.target_occupy ? (
              <Text style={{ fontSize: theme.fontSize.xs, color: theme.gray, fontFamily: theme.fonts.regular, marginTop: mm(1) }}>{data.target_occupy}</Text>
            ) : null}
          </View>
        ) : null}

        {data?.manager_name ? (
          <View style={{ marginTop: mm(20) }}>
            <Text style={{ fontSize: theme.fontSize.sm, color: theme.black, fontFamily: theme.fonts.bold, fontWeight: 600 }}>{data.manager_name}</Text>
            {data?.manager_occupy ? (
              <Text style={{ fontSize: theme.fontSize.xs, color: theme.gray, fontFamily: theme.fonts.regular }}>{data.manager_occupy}</Text>
            ) : null}
            {data?.tel ? (
              <Text style={{ fontSize: theme.fontSize.xs, color: theme.gray, fontFamily: theme.fonts.regular, marginTop: mm(2) }}>{data.tel}</Text>
            ) : null}
            {data?.email ? (
              <Text style={{ fontSize: theme.fontSize.xs, color: theme.gray, fontFamily: theme.fonts.regular }}>{data.email}</Text>
            ) : null}
          </View>
        ) : null}
      </View>

      {/* Правая колонка */}
      <View style={{ width: mm(70), overflow: 'hidden', borderRadius: mm(2) }}>
        {coverUrl
          ? <Image src={coverUrl} style={{ width: mm(70), height: mm(240), objectFit: 'cover' }} />
          : <View style={{ flex: 1, backgroundColor: theme.accent + '22' }} />
        }
      </View>

    </View>
  )
}
