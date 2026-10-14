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

function getTextColor(node) {
  const value = node.style?.color?.trim()
  if (!value) return null

  if (/^#[\da-f]{3}(?:[\da-f]{3})?$/i.test(value)) return value

  const rgb = value.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i)
  if (rgb) {
    const channels = rgb.slice(1).map(Number)
    if (channels.every(channel => channel <= 255)) {
      return `#${channels.map(channel => channel.toString(16).padStart(2, '0')).join('')}`
    }
  }

  return null
}

// Инлайн-ноды: цвет наследуется через span/strong/em и не сбрасывается на тексте.
function renderInline(node, cfg, key, inheritedColor = cfg.color.textPrimary) {
  const { color, font, weight } = cfg

  if (node.nodeType === Node.TEXT_NODE) {
    const content = protectPdfText(node.textContent)
    if (!content) return null
    return (
      <Text key={key} style={{ color: inheritedColor }}>
        {content}
      </Text>
    )
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return null

  const tag      = node.tagName.toLowerCase()
  const textColor = getTextColor(node) || (tag === 'mark' ? color.accent : inheritedColor)
  const children = Array.from(node.childNodes).map((c, i) => renderInline(c, cfg, `${key}-${i}`, textColor))

  if (tag === 'strong' || tag === 'b')
    return <Text key={key} style={{ fontFamily: font.bold, fontWeight: weight.bold, color: textColor }}>{children}</Text>
  if (tag === 'em' || tag === 'i')
    return <Text key={key} style={{ fontStyle: 'italic', color: textColor }}>{children}</Text>
  if (tag === 'mark')
    return <Text key={key} style={{ color: textColor }}>{children}</Text>
  if (tag === 'br')
    return <Text key={key}>{'\n'}</Text>

  return <Text key={key} style={{ color: textColor }}>{children}</Text>
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
    const textColor = getTextColor(node) || color.textPrimary
    const children = Array.from(node.childNodes).map((c, i) => renderInline(c, cfg, `${key}-${i}`, textColor))
    return (
      <Text key={key} style={{ fontFamily: font.regular, fontSize: t.base, color: textColor, lineHeight: 1.6, marginBottom: space.xs, textAlign: align }}>
        {children}
      </Text>
    )
  }

  if (tag === 'h1' || tag === 'h2' || tag === 'h3') {
    const size = tag === 'h1' ? t.xl : tag === 'h2' ? t.lg : t.md
    const textColor = getTextColor(node) || color.textPrimary
    return (
      <Text key={key} style={{ fontFamily: font.bold, fontWeight: weight.bold, fontSize: size, color: textColor, marginBottom: space.sm, marginTop: space.xs }}>
        {Array.from(node.childNodes).map((c, i) => renderInline(c, cfg, `${key}-${i}`, textColor))}
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
              {Array.from(li.childNodes).map((c, childIndex) => renderInline(c, cfg, `${key}-${i}-${childIndex}`, getTextColor(li) || color.textPrimary))}
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
              {Array.from(li.childNodes).map((c, childIndex) => renderInline(c, cfg, `${key}-${i}-${childIndex}`, getTextColor(li) || color.textPrimary))}
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
