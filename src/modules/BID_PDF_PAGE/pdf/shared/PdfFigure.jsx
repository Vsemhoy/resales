import React from 'react'
import { View, Text, Image } from '@react-pdf/renderer'

function absUrl(src) {
  if (!src || typeof src !== 'string') return null
  if (src.startsWith('http') || src.startsWith('data:')) return src
  return `${window.location.origin}${src}`
}

// Картинка с подписью
export function PdfFigure({ cfg, src, figInfo, maxH, maxW, style = {} }) {
  const url = absUrl(src)
  if (!url) return null
  const { color, text, font, space } = cfg

  return (
    <View style={{ marginVertical: space.sm, ...style }}>
      <Image
        src={url}
        style={{
          maxWidth:   maxW || cfg.layout.imgMaxW,
          maxHeight:  maxH || cfg.layout.imgMaxH,
          objectFit:  'contain',
          alignSelf:  'center',
        }}
      />
      {figInfo && (
        <Text style={{
          fontSize:    text.xs,
          color:       color.textSecondary,
          fontFamily:  font.regular,
          textAlign:   'center',
          marginTop:   space.xs,
        }}>
          Рисунок {figInfo.num}. {figInfo.title}
        </Text>
      )}
    </View>
  )
}
