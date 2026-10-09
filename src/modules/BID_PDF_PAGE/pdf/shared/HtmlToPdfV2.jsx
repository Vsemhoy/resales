import React from 'react'
import { View } from '@react-pdf/renderer'
import { Text, protectPdfText } from './PdfText'

function getTextAlign(node) {
  const style = node.getAttribute?.('style') || ''
  const match = style.match(/text-align\s*:\s*(justify|left|right|center)/)
  return match ? match[1] : null
}

function parseHtml(html) {
  if (!html) return []
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html')
  return Array.from(doc.body.firstChild.childNodes)
}

// Инлайн-ноды: bold, italic, plain text
function renderInline(node, cfg, key) {
  const { color, text: t, font, weight } = cfg

  if (node.nodeType === Node.TEXT_NODE) {
    const content = protectPdfText(node.textContent)
    if (!content) return null
    return (
      <Text key={key} style={{ fontFamily: font.regular, fontSize: t.base, color: color.textPrimary }}>
        {content}
      </Text>
    )
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return null

  const tag      = node.tagName.toLowerCase()
  const children = Array.from(node.childNodes).map((c, i) => renderInline(c, cfg, `${key}-${i}`))

  if (tag === 'strong' || tag === 'b')
    return <Text key={key} style={{ fontFamily: font.bold, fontWeight: weight.bold, fontSize: t.base, color: color.textPrimary }}>{children}</Text>
  if (tag === 'em' || tag === 'i')
    return <Text key={key} style={{ fontFamily: font.regular, fontStyle: 'italic', fontSize: t.base, color: color.textPrimary }}>{children}</Text>
  if (tag === 'mark')
    return <Text key={key} style={{ fontFamily: font.regular, fontSize: t.base, color: color.accent }}>{children}</Text>
  if (tag === 'br')
    return <Text key={key}>{'\n'}</Text>

  return <Text key={key} style={{ fontFamily: font.regular, fontSize: t.base, color: color.textPrimary }}>{children}</Text>
}

// Блочные ноды
function renderBlock(node, cfg, key) {
  const { color, text: t, font, weight, space } = cfg

  if (node.nodeType === Node.TEXT_NODE) {
    const content = node.textContent.trim()
    if (!content) return null
    return (
      <Text key={key} style={{ fontFamily: font.regular, fontSize: t.base, color: color.textPrimary, lineHeight: 1.6, marginBottom: space.xs }}>
        {content}
      </Text>
    )
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return null

  const tag = node.tagName.toLowerCase()

  if (tag === 'p') {
    const align    = getTextAlign(node) || 'left'
    const children = Array.from(node.childNodes).map((c, i) => renderInline(c, cfg, `${key}-${i}`))
    return (
      <Text key={key} style={{ fontFamily: font.regular, fontSize: t.base, color: color.textPrimary, lineHeight: 1.6, marginBottom: space.xs, textAlign: align }}>
        {children}
      </Text>
    )
  }

  if (tag === 'h1' || tag === 'h2' || tag === 'h3') {
    const size = tag === 'h1' ? t.xl : tag === 'h2' ? t.lg : t.md
    return (
      <Text key={key} style={{ fontFamily: font.bold, fontWeight: weight.bold, fontSize: size, color: color.textPrimary, marginBottom: space.sm, marginTop: space.xs }}>
        {node.textContent}
      </Text>
    )
  }

  if (tag === 'ul') {
    const items = Array.from(node.querySelectorAll(':scope > li'))
    return (
      <View key={key} style={{ marginBottom: space.sm }}>
        {items.map((li, i) => (
          <View key={i} wrap={false} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: space.xs }}>
            <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: color.textSecondary, marginRight: space.sm, marginTop: t.base * 0.45, flexShrink: 0 }} />
            <Text style={{ fontFamily: font.regular, fontSize: t.base, color: color.textPrimary, lineHeight: 1.5, flex: 1 }}>
              {li.textContent}
            </Text>
          </View>
        ))}
      </View>
    )
  }

  if (tag === 'ol') {
    const items = Array.from(node.querySelectorAll(':scope > li'))
    return (
      <View key={key} style={{ marginBottom: space.sm }}>
        {items.map((li, i) => (
          <View key={i} wrap={false} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: space.xs }}>
            <Text style={{ fontFamily: font.bold, fontWeight: weight.bold, fontSize: t.sm, color: color.textPrimary, width: space.xl, flexShrink: 0 }}>
              {i + 1}.
            </Text>
            <Text style={{ fontFamily: font.regular, fontSize: t.base, color: color.textPrimary, lineHeight: 1.5, flex: 1 }}>
              {li.textContent}
            </Text>
          </View>
        ))}
      </View>
    )
  }

  if (tag === 'blockquote') {
    return (
      <View key={key} style={{ borderLeftWidth: 2, borderLeftColor: color.accent, paddingLeft: space.md, marginBottom: space.sm }}>
        <Text style={{ fontFamily: font.regular, fontStyle: 'italic', fontSize: t.base, color: color.textSecondary, lineHeight: 1.6 }}>
          {node.textContent}
        </Text>
      </View>
    )
  }

  return null
}

// ─── Применить justify ко всему HTML (для кнопки в тулбаре без TextAlign ext) ──
export function wrapJustify(html) {
  if (!html) return html
  // Оборачиваем все <p> без явного text-align в justify
  return html.replace(/<p(?![^>]*text-align)([^>]*)>/g, '<p$1 style="text-align:justify">')
}

// ─── Экспорт ──────────────────────────────────────────────────────────────────
export function HtmlToPdfV2({ html, cfg }) {
  if (!html) return null
  const nodes = parseHtml(html)
  return (
    <>
      {nodes.map((node, i) => renderBlock(node, cfg, `n-${i}`))}
    </>
  )
}
