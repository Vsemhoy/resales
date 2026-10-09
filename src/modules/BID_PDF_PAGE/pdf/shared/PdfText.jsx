import React from 'react'
import { Text as ReactPdfText } from '@react-pdf/renderer'

// Keep the rule local as well as global: this prevents @react-pdf from using
// emergency character-level wrapping for an individual Text node.
export const noPdfHyphenation = word => [word]

const SHORT_WORDS = new Set([
  'а', 'без', 'бы', 'в', 'во', 'да', 'для', 'до', 'за', 'же', 'и', 'из',
  'из-за', 'из-под', 'к', 'как', 'ко', 'ли', 'на', 'не', 'ни', 'но', 'о',
  'об', 'он', 'от', 'по', 'под', 'при', 'про', 'раз', 'с', 'со', 'так',
  'то', 'у', 'уж', 'что', 'это', 'я',
])

const ADDRESS_ABBREVIATIONS = new Set([
  'г.', 'д.', 'к.', 'корп.', 'лит.', 'обл.', 'оф.', 'пер.', 'пом.', 'пр.',
  'пр-т', 'просп.', 'стр.', 'ул.',
])

function shouldStickToNextWord(token) {
  const normalized = token.toLocaleLowerCase('ru-RU')
  return SHORT_WORDS.has(normalized)
    || ADDRESS_ABBREVIATIONS.has(normalized)
    || /^\d+$/.test(normalized)
}

/**
 * Moves short words, address abbreviations and standalone numbers to the next
 * word using NBSP. Explicit line breaks remain untouched.
 */
export function protectPdfText(value) {
  if (typeof value !== 'string' || !value) return value

  const parts = value.split(/([ \t]+)/)

  for (let i = 0; i < parts.length - 2; i += 2) {
    const token = parts[i]
    const separator = parts[i + 1]
    const nextToken = parts[i + 2]

    if (
      token
      && separator
      && nextToken
      && !token.includes('\n')
      && !nextToken.startsWith('\n')
      && shouldStickToNextWord(token)
    ) {
      parts[i + 1] = '\u00A0'
    }
  }

  return parts.join('')
}

function protectChildren(children) {
  return React.Children.map(children, child => (
    typeof child === 'string' ? protectPdfText(child) : child
  ))
}

/** Drop-in replacement for @react-pdf/renderer Text. */
export function Text({ children, ...props }) {
  return (
    <ReactPdfText hyphenationCallback={noPdfHyphenation} {...props}>
      {protectChildren(children)}
    </ReactPdfText>
  )
}
