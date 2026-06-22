import React from 'react'
import { View, Text, Image } from '@react-pdf/renderer'
import { PdfSectionBar } from '../shared/PdfSectionBar'
import { HtmlToPdfV2, wrapJustify } from '../shared/HtmlToPdfV2'
import { HTTP_ROOT } from '../../../../config/config'

function resolveUrl(src, draftId) {
  if (!src) return null
  // base64 или готовый http — используем напрямую (preloadImages уже обработал)
  if (typeof src === 'string') {
    if (src.startsWith('data:') || src.startsWith('http')) return src
    // legacy: просто имя файла
    let rt = HTTP_ROOT + '/api/soma/pdf/files/' + draftId + '/' + src
    if (!rt.startsWith('http')) rt = 'http://' + rt
    return rt
  }
  // { filename, mime } объект (не конвертированный preloadImages)
  if (src?.filename) {
    let rt = HTTP_ROOT + '/api/soma/pdf/files/' + draftId + '/' + src.filename
    if (!rt.startsWith('http')) rt = 'http://' + rt
    return rt
  }
  return null
}

function stripHtml(html) {
  return (html || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
}

function FigureBlock({ cfg, src, figInfo, draft }) {
  const url = resolveUrl(src, draft?.id)
  if (!url) return null
  const { color, text, font, space, layout } = cfg
  return (
    <View style={{ marginVertical: space.sm }}>
      <Image src={url} style={{ width: layout.contentW * 0.74, maxHeight: layout.imgMaxH, objectFit: 'contain', marginLeft: 'auto', marginRight: 'auto' }} />
      {figInfo && (
        <Text style={{ fontSize: text.xs, color: color.textSecondary, fontFamily: font.regular, textAlign: 'center', marginTop: space.xs }}>
          Рисунок {figInfo.num}. {figInfo.title}
        </Text>
      )}
    </View>
  )
}

export function PdfBlockSelectEquipment({ cfg, data, sectionNumber, figureRegistry, figuresEnabled, draft, forceBreak = false }) {
  const hasContent = data?.selectionOfEquipment || data?.structuralDiagrams || data?.blockPlacements
  if (!hasContent) return null

  const { color, font: f, text: t, space } = cfg

  return (
    <View break={forceBreak} style={{ marginBottom: cfg.space.end}}>
      <PdfSectionBar cfg={cfg} number={sectionNumber} title="Выбор оборудования" />
      {<HtmlToPdfV2 html={wrapJustify(data.selectionOfEquipment)} cfg={cfg} />}
      <FigureBlock cfg={cfg} draft={draft} src={data?.structuralDiagrams} figInfo={figuresEnabled ? figureRegistry.get('structuralDiagrams') : null} />
      <FigureBlock cfg={cfg} draft={draft} src={data?.blockPlacements}    figInfo={figuresEnabled ? figureRegistry.get('blockPlacements')    : null} />
    </View>
  )
}
