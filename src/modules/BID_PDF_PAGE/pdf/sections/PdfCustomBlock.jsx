import React from 'react'
import { View, Text, Image } from '@react-pdf/renderer'
import { mm } from '../theme/units'
import { HtmlToPdf } from '../components/HtmlToPdf'

function SectionHeading({ theme, title }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: mm(6), marginTop: mm(4) }}>
      <View style={{ width: mm(1.5), height: mm(10), backgroundColor: theme.accent, marginRight: mm(4) }} />
      <Text style={{ fontSize: theme.fontSize.lg, color: theme.black, fontFamily: theme.fonts.bold, fontWeight: 700 }}>
        {title || 'Блок'}
      </Text>
    </View>
  )
}

export function PdfCustomBlock({ theme, block }) {
  if (!block) return null

  const cols = block.columns || []
  const rows = block.rows    || []
  const hasTable = cols.length > 0 && rows.length > 0

  const coverUrl = block.image && typeof block.image === 'string'
    ? (block.image.startsWith('http') ? block.image : `${window.location.origin}${block.image}`)
    : null

  return (
    <View>
      <SectionHeading theme={theme} title={block.title} />

      {/* Текст сверху */}
      {block.textAbove && <HtmlToPdf html={block.textAbove} theme={theme} />}

      {/* Картинка */}
      {coverUrl && (
        <View style={{ marginVertical: mm(4) }}>
          <Image src={coverUrl} style={{ width: '100%', objectFit: 'contain' }} />
        </View>
      )}

      {/* Таблица */}
      {hasTable && (
        <View style={{ marginVertical: mm(4) }}>
          {/* Шапка */}
          <View style={{ flexDirection: 'row' }}>
            {cols.map(col => (
              <Text
                key={col.id}
                style={{
                  flex: col.width ? undefined : 1,
                  width: col.width ? `${col.width}` : undefined,
                  padding: mm(2.5), paddingHorizontal: mm(3),
                  fontSize: theme.fontSize.xs, fontFamily: theme.fonts.bold,
                  fontWeight: 700, color: theme.white,
                  backgroundColor: theme.tableHeader,
                  textAlign: col.type !== 'text' ? 'right' : 'left',
                }}
              >
                {col.label}
              </Text>
            ))}
          </View>

          {/* Строки */}
          {rows.map((row, ri) => (
            <View key={row.id} style={{ flexDirection: 'row', backgroundColor: ri % 2 === 1 ? theme.tableRowEven : theme.white }}>
              {cols.map(col => (
                <Text
                  key={col.id}
                  style={{
                    flex: col.width ? undefined : 1,
                    width: col.width ? `${col.width}` : undefined,
                    padding: mm(2.5), paddingHorizontal: mm(3),
                    fontSize: theme.fontSize.sm, fontFamily: theme.fonts.regular,
                    color: theme.black,
                    textAlign: col.type !== 'text' ? 'right' : 'left',
                  }}
                >
                  {row.cells[col.id] || ''}
                </Text>
              ))}
            </View>
          ))}
        </View>
      )}

      {/* Текст снизу */}
      {block.textBelow && <HtmlToPdf html={block.textBelow} theme={theme} />}
    </View>
  )
}
