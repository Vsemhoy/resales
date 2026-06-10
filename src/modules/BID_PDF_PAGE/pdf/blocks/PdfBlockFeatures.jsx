import React from 'react'
import { View } from '@react-pdf/renderer'
import { PdfSectionBar } from '../shared/PdfSectionBar'
import { HtmlToPdfV2, wrapJustify } from '../shared/HtmlToPdfV2'

export function PdfBlockFeatures({ cfg, data, sectionNumber, forceBreak = false }) {
  if (!data?.featuresContent) return null

  return (
    <View break={forceBreak} style={{ marginBottom: cfg.space.end}}>
      <PdfSectionBar cfg={cfg} number={sectionNumber} title="Особенности системы и требования заказчика" />
      <HtmlToPdfV2 html={wrapJustify(data.featuresContent)} cfg={cfg} />
    </View>
  )
}
