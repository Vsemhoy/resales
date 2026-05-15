import React from 'react'
import { Text, View } from '@react-pdf/renderer'
import { mm } from '../theme/units'

// ─── Парсим HTML-строку в дерево нод через DOMParser ─────────────────────────
function parseHtml(html) {
  if (!html) return []
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html')
  return Array.from(doc.body.firstChild.childNodes)
}

// ─── Рендер инлайн-ноды (внутри абзаца) ──────────────────────────────────────
function renderInline(node, theme, key) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent
    if (!text) return null
    return (
      <Text key={key} style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.base, color: theme.black }}>
        {text}
      </Text>
    )
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return null
  const tag = node.tagName.toLowerCase()
  const children = Array.from(node.childNodes).map((c, i) => renderInline(c, theme, `${key}-${i}`))

  switch (tag) {
    case 'strong':
    case 'b':
      return (
        <Text key={key} style={{ fontFamily: theme.fonts.bold, fontWeight: 700, fontSize: theme.fontSize.base, color: theme.black }}>
          {children}
        </Text>
      )
    case 'em':
    case 'i':
      return (
        <Text key={key} style={{ fontFamily: theme.fonts.regular, fontStyle: 'italic', fontSize: theme.fontSize.base, color: theme.black }}>
          {children}
        </Text>
      )
    case 'mark':
      return (
        <Text key={key} style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.base, color: theme.accent, backgroundColor: theme.accent + '22' }}>
          {children}
        </Text>
      )
    case 'br':
      return <Text key={key}>{'\n'}</Text>
    default:
      return <Text key={key} style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.base }}>{children}</Text>
  }
}

// ─── Рендер блочной ноды ──────────────────────────────────────────────────────
function renderBlock(node, theme, key) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent.trim()
    if (!text) return null
    return (
      <Text key={key} style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.base, color: theme.black, lineHeight: 1.6, marginBottom: mm(3) }}>
        {text}
      </Text>
    )
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return null
  const tag = node.tagName.toLowerCase()

  switch (tag) {
    case 'p': {
      const children = Array.from(node.childNodes).map((c, i) => renderInline(c, theme, `${key}-${i}`))
      return (
        <Text key={key} style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.base, color: theme.black, lineHeight: 1.6, marginBottom: mm(3) }}>
          {children}
        </Text>
      )
    }

    case 'h1':
    case 'h2':
    case 'h3': {
      const size = tag === 'h1' ? theme.fontSize.xl : tag === 'h2' ? theme.fontSize.lg : theme.fontSize.md
      return (
        <Text key={key} style={{ fontFamily: theme.fonts.bold, fontWeight: 700, fontSize: size, color: theme.black, marginBottom: mm(3), marginTop: mm(2) }}>
          {node.textContent}
        </Text>
      )
    }

    case 'ul': {
      const items = Array.from(node.querySelectorAll('li'))
      return (
        <View key={key} style={{ marginBottom: mm(3) }}>
          {items.map((li, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: mm(2) }}>
              <View style={{ width: mm(1.5), height: mm(1.5), borderRadius: mm(0.75), backgroundColor: theme.accent, marginRight: mm(3), marginTop: mm(2) }} />
              <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.base, color: theme.black, lineHeight: 1.5, flex: 1 }}>
                {li.textContent}
              </Text>
            </View>
          ))}
        </View>
      )
    }

    case 'ol': {
      const items = Array.from(node.querySelectorAll('li'))
      return (
        <View key={key} style={{ marginBottom: mm(3) }}>
          {items.map((li, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: mm(2) }}>
              <Text style={{ fontFamily: theme.fonts.bold, fontWeight: 700, fontSize: theme.fontSize.sm, color: theme.accent, width: mm(6), marginRight: mm(3) }}>
                {i + 1}.
              </Text>
              <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.base, color: theme.black, lineHeight: 1.5, flex: 1 }}>
                {li.textContent}
              </Text>
            </View>
          ))}
        </View>
      )
    }

    case 'blockquote':
      return (
        <View key={key} style={{ borderLeftWidth: 2, borderLeftColor: theme.accent, paddingLeft: mm(4), marginBottom: mm(3) }}>
          <Text style={{ fontFamily: theme.fonts.regular, fontStyle: 'italic', fontSize: theme.fontSize.base, color: theme.gray, lineHeight: 1.6 }}>
            {node.textContent}
          </Text>
        </View>
      )

    case 'br':
      return <Text key={key}>{'\n'}</Text>

    default:
      return null
  }
}

// ─── Основной компонент ───────────────────────────────────────────────────────
export function HtmlToPdf({ html, theme }) {
  if (!html) return null
  const nodes = parseHtml(html)
  return (
    <>
      {nodes.map((node, i) => renderBlock(node, theme, `n-${i}`))}
    </>
  )
}
