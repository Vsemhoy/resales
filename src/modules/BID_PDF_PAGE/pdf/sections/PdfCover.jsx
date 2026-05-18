import React from 'react'
import { View, Text, Image } from '@react-pdf/renderer'
import { mm } from '../theme/units'

function absUrl(src) {
  if (!src) return null
  if (typeof src === 'object' && src.filename) return null // восстановим из api отдельно
  if (src.startsWith('http')) return src
  return `${window.location.origin}${src}`
}

// ─── Режим: Обложка (полная страница) ─────────────────────────────────────────
function CoverFull({ theme, data, draft }) {
  const coverUrl = data?.coverBlock
    ? (data.coverBlock.startsWith('http') ? data.coverBlock : `${window.location.origin}${data.coverBlock}`)
    : null

  return (
    <View style={{ flexDirection: 'row', minHeight: mm(240) }}>
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

      <View style={{ width: mm(70), overflow: 'hidden', borderRadius: mm(2) }}>
        {coverUrl
          ? <Image src={coverUrl} style={{ width: mm(70), height: mm(240), objectFit: 'cover' }} />
          : <View style={{ flex: 1, backgroundColor: theme.accent + '22' }} />
        }
      </View>
    </View>
  )
}

// ─── Режим: Шапка (баннер + реквизиты) ───────────────────────────────────────
function CoverHat({ theme, data, draft }) {
  // Картинка без полей — растягиваем через отрицательные отступы
  const hatSrc = data?.hatImage
  const hatUrl = hatSrc && typeof hatSrc === 'string'
    ? (hatSrc.startsWith('http') ? hatSrc : `${window.location.origin}${hatSrc}`)
    : null

  const p = theme.page

  return (
    <View>
      {/* Баннер — на всю ширину без полей */}
      {hatUrl && (
        <View style={{
          marginTop:    -p.marginTop,
          marginLeft:   -p.marginLeft,
          marginRight:  -p.marginRight,
          marginBottom: mm(8),
        }}>
          <Image
            src={hatUrl}
            style={{ width: mm(210), height: mm(55), objectFit: 'cover' }}
          />
        </View>
      )}
      {!hatUrl && (
        <View style={{
          marginTop: -p.marginTop, marginLeft: -p.marginLeft, marginRight: -p.marginRight,
          marginBottom: mm(8), height: mm(55), backgroundColor: theme.accent + '22',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ fontSize: theme.fontSize.sm, color: theme.accent, fontFamily: theme.fonts.regular }}>
            Загрузите баннер-шапку
          </Text>
        </View>
      )}

      {/* Строка реквизитов */}
      <View style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: theme.border, paddingBottom: mm(6), marginBottom: mm(6) }}>
        {/* Левый блок: исх номер + дата */}
        <View style={{ flex: 1 }}>
          {data?.ext_number ? (
            <View style={{ flexDirection: 'row', marginBottom: mm(2) }}>
              <Text style={{ fontSize: theme.fontSize.sm, color: theme.gray, fontFamily: theme.fonts.regular, width: mm(30) }}>Исх. номер</Text>
              <Text style={{ fontSize: theme.fontSize.sm, color: theme.black, fontFamily: theme.fonts.bold, fontWeight: 600 }}>
                № {data.ext_number}
              </Text>
            </View>
          ) : null}
          {data?.date ? (
            <View style={{ flexDirection: 'row' }}>
              <Text style={{ fontSize: theme.fontSize.sm, color: theme.gray, fontFamily: theme.fonts.regular, width: mm(30) }}>Дата</Text>
              <Text style={{ fontSize: theme.fontSize.sm, color: theme.black, fontFamily: theme.fonts.regular }}>{data.date}</Text>
            </View>
          ) : null}
        </View>

        {/* Правый блок: кому */}
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          {data?.target_occupy ? (
            <Text style={{ fontSize: theme.fontSize.sm, color: theme.gray, fontFamily: theme.fonts.regular }}>
              {data.target_occupy}
            </Text>
          ) : null}
          {data?.target_name ? (
            <Text style={{ fontSize: theme.fontSize.sm, color: theme.black, fontFamily: theme.fonts.bold, fontWeight: 600 }}>
              {data.target_name}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Тема письма */}
      <Text style={{ fontSize: theme.fontSize.md, color: theme.black, fontFamily: theme.fonts.bold, fontWeight: 700, marginBottom: mm(4) }}>
        {draft?.object || 'Коммерческое предложение'}
      </Text>
    </View>
  )
}

// ─── Экспорт ──────────────────────────────────────────────────────────────────
export function PdfCover({ theme, data, draft }) {
  const mode = data?.coverMode ?? 'cover'
  if (mode === 'hat') return <CoverHat theme={theme} data={data} draft={draft} />
  return <CoverFull theme={theme} data={data} draft={draft} />
}
