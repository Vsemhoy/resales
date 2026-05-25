import React from 'react'
import { View, Text, Image } from '@react-pdf/renderer'

function absUrl(src) {
  console.log('PROXY', src)
  if (!src || typeof src !== 'string') return null
  if (src.startsWith('http') || src.startsWith('data:') || src.startsWith('blob:')) return src
  return `${window.location.origin}${src}`
}

export function PdfBlockCoverFull({ cfg, data, draft }) {
  const { color, layout, text, font, weight, space, cover } = cfg
  const coverUrl = absUrl(data?.coverBlock)

  return (
    <View style={{ flexDirection: 'row', minHeight: layout.contentH * 0.85 }}>

      {/* ── Левая колонка ──────────────────────────────────────────────── */}
      <View style={{ flex: 1, paddingRight: space.xl, paddingTop: space.xxl, justifyContent: 'space-between' }}>

        {/* Верх: КП + название */}
        <View>
          <Text style={{ fontSize: text.xs, color: color.textSecondary, fontFamily: font.regular, marginBottom: space.md, letterSpacing: 0.5 }}>
            Коммерческое предложение{data?.ext_number ? `  № ${data.ext_number}` : ''}
          </Text>

          <Text style={{ fontSize: text.xxl, color: color.textPrimary, fontFamily: font.bold, fontWeight: weight.bold, lineHeight: 1.2, marginBottom: space.sm }}>
            {draft?.object || 'Система звукового оповещения'}
          </Text>

          {data?.object_address ? (
            <Text style={{ fontSize: text.sm, color: color.textSecondary, fontFamily: font.regular, marginBottom: space.xl }}>
              {data.object_address}
            </Text>
          ) : <View style={{ marginBottom: space.xl }} />}

          {/* Акцент-полоска */}
          <View style={{ height: 2.5, width: space.xxl * 1.5, backgroundColor: color.accent, marginBottom: space.xl }} />

          {/* Кому */}
          {(data?.target_name || data?.target_occupy) && (
            <View>
              <Text style={{ fontSize: text.xs, color: color.textMuted, fontFamily: font.regular, marginBottom: space.xxs }}>
                Кому
              </Text>
              {data.target_name && (
                <Text style={{ fontSize: text.base, color: color.textPrimary, fontFamily: font.bold, fontWeight: weight.semibold }}>
                  {data.target_name}
                </Text>
              )}
              {data.target_occupy && (
                <Text style={{ fontSize: text.xs, color: color.textSecondary, fontFamily: font.regular, marginTop: space.xxs }}>
                  {data.target_occupy}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Низ: менеджер */}
        <View style={{ paddingBottom: space.lg }}>
          {data?.manager_name && (
            <Text style={{ fontSize: text.sm, color: color.textPrimary, fontFamily: font.bold, fontWeight: weight.semibold }}>
              {data.manager_name}
            </Text>
          )}
          {data?.manager_occupy && (
            <Text style={{ fontSize: text.xs, color: color.textSecondary, fontFamily: font.regular }}>
              {data.manager_occupy}
            </Text>
          )}
          {(data?.tel || data?.email) && (
            <View style={{ marginTop: space.sm }}>
              {data.tel   && <Text style={{ fontSize: text.xs, color: color.textSecondary, fontFamily: font.regular }}>{data.tel}</Text>}
              {data.email && <Text style={{ fontSize: text.xs, color: color.textSecondary, fontFamily: font.regular }}>{data.email}</Text>}
            </View>
          )}
        </View>
      </View>

      {/* ── Правая колонка — картинка ───────────────────────────────────── */}
      <View style={{ width: cover.fullRightColW, overflow: 'hidden', borderRadius: 2 }}>
        {coverUrl
          ? <Image src={coverUrl} style={{ width: cover.fullRightColW, height: '100%', objectFit: 'cover' }} />
          : <View style={{ flex: 1, backgroundColor: color.accentLight }} />
        }
      </View>

    </View>
  )
}
