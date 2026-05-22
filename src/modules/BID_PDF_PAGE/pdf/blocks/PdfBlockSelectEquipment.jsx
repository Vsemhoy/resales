import React from 'react'
import { View, Text, Image } from '@react-pdf/renderer'
import { PdfSectionBar } from '../shared/PdfSectionBar'
import { HtmlToPdfV2, wrapJustify } from '../shared/HtmlToPdfV2'
import { HTTP_ROOT } from '../../../../config/config'

function absUrl(src) {
  let rt = HTTP_ROOT + "/api/soma/pdf/files/24/" + src;
  if (!rt.startsWith("http")){
    rt = "http://" + rt;
  }
  return rt;
}

function stripHtml(html) {
  return (html || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
}

function FigureBlock({ cfg, src, figInfo }) {
  const raw = typeof src === 'string' ? src : src?.filename
  const url = absUrl(raw)
  if (!url) return null
  const { color, text, font, space, layout } = cfg
  return (
    <View style={{ marginVertical: space.sm }}>
      <Image src={url} style={{ width: layout.contentW, maxHeight: layout.imgMaxH, objectFit: 'contain' }} />
      {figInfo && (
        <Text style={{ fontSize: text.xs, color: color.textSecondary, fontFamily: font.regular, textAlign: 'center', marginTop: space.xs }}>
          Рисунок {figInfo.num}. {figInfo.title}
        </Text>
      )}
    </View>
  )
}

export function PdfBlockSelectEquipment({ cfg, data, sectionNumber, figureRegistry = new Map(), figuresEnabled = true }) {
  const hasContent = data?.selectionOfEquipment || data?.structuralDiagrams || data?.blockPlacements
  if (!hasContent) return null

  const { color, font: f, text: t, space } = cfg

  return (
    <View style={{ marginBottom: cfg.space.end}}>
      <PdfSectionBar cfg={cfg} number={sectionNumber} title="Выбор оборудования" />
      {<HtmlToPdfV2 html={wrapJustify(data.selectionOfEquipment)} cfg={cfg} />}
      <FigureBlock cfg={cfg} src={data?.structuralDiagrams} figInfo={figuresEnabled ? figureRegistry.get('structuralDiagrams') : null} />
      <FigureBlock cfg={cfg} src={data?.blockPlacements}    figInfo={figuresEnabled ? figureRegistry.get('blockPlacements')    : null} />
    </View>
  )
}
