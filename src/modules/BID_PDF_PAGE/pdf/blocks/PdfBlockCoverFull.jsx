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
            Коммерческое предложение{data?.ext_number ? `  № ${String(data.ext_number || '').trim()}` : ''}
          </Text>
          {data?.coverTitle && data.coverTitle !== 'Коммерческое предложение' ? (
            <Text style={{ fontSize: text.xs, color: color.textSecondary, fontFamily: font.regular, marginBottom: space.xs, letterSpacing: 0.5 }}>
              {String(data.coverTitle || '').trim()}
            </Text>
          ) : null}
          {data?.object_name ? (
            <Text style={{ fontSize: text.xs, color: color.textSecondary, fontFamily: font.regular, marginBottom: space.xs, letterSpacing: 0.5 }}>
              {String(data.object_name || '').trim()}
            </Text>
          ) : null}

          <Text style={{ fontSize: text.xxl, color: color.textPrimary, fontFamily: font.bold, fontWeight: weight.bold, lineHeight: 1.2, marginBottom: space.sm }}>
            {draft?.object || 'Система звукового оповещения'}
          </Text>

          {data?.object_address ? (
            <Text style={{ fontSize: text.sm, color: color.textSecondary, fontFamily: font.regular, marginBottom: space.xl }}>
              {String(data.object_address || '').trim()}
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
                  {String(data.target_name || '').trim()}
                </Text>
              )}
              {data.target_occupy && (
                <Text style={{ fontSize: text.xs, color: color.textSecondary, fontFamily: font.regular, marginTop: space.xxs }}>
                  {String(data.target_occupy || '').trim()}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Низ: менеджер */}
        <View style={{ paddingBottom: space.lg }}>
          {data?.manager_name && (
            <Text style={{ fontSize: text.sm, color: color.textPrimary, fontFamily: font.bold, fontWeight: weight.semibold }}>
              {String(data.manager_name || '').trim()}
            </Text>
          )}
          {data?.manager_occupy && (
            <Text style={{ fontSize: text.xs, color: color.textSecondary, fontFamily: font.regular }}>
              {String(data.manager_occupy || '').trim()}
            </Text>
          )}
          {(data?.tel || data?.email) && (
            <View style={{ marginTop: space.sm }}>
              {data.tel   && <Text style={{ fontSize: text.xs, color: color.textSecondary, fontFamily: font.regular }}>{String(data.tel || '').trim()}</Text>}
              {data.email && <Text style={{ fontSize: text.xs, color: color.textSecondary, fontFamily: font.regular }}>{String(data.email || '').trim()}</Text>}
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
