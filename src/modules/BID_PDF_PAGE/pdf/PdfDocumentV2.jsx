import React from 'react'
import { Document, Page } from '@react-pdf/renderer'
import { getConfig } from './pdf_config'
import { registerFonts } from './components/PdfFonts'
import { buildFigureRegistry } from './components/buildFigureRegistry'
import { PdfPageFrame }              from './PdfPageFrame'
import { PdfBlockCoverFull }         from './blocks/PdfBlockCoverFull'
import { PdfBlockCoverHat }          from './blocks/PdfBlockCoverHat'
import { PdfBlockFeatures }          from './blocks/PdfBlockFeatures'
import { PdfBlockSpecifications }    from './blocks/PdfBlockSpecifications'
import { PdfBlockSpecials }          from './blocks/PdfBlockSpecials'
import { PdfBlockSelectEquipment }   from './blocks/PdfBlockSelectEquipment'
import { PdfBlockRecommendations }   from './blocks/PdfBlockRecommendations'
import { PdfBlockCustom }            from './blocks/PdfBlockCustom'
import { PdfBlockPageBreak }         from './blocks/PdfBlockPageBreak'
import { PdfBlockRondoDelivery }     from './blocks/PdfBlockRondoDelivery'
import { PdfBlockSystemChars }       from './blocks/PdfBlockSystemChars'

registerFonts()

const CUSTOM_PREFIX    = 'custom_'
const PAGEBREAK_PREFIX = 'pageBreak_'

export function PdfDocumentV2({
  formData,
  draft,
  currency,
  companyId   = '2',
  orientation = 'v',
  enabledSections = {},
  sectionOrder    = [],
  models          = [],
  modelsData      = null,
  figuresEnabled  = true,
}) {
  const cfg = getConfig(companyId, orientation)
  const { layout, color, font: f } = cfg

  const coverMode = formData?.coverMode ?? 'cover'

  const figureRegistry = buildFigureRegistry({
    sectionOrder, enabledSections, formData, figuresEnabled,
  })

  // Нумерация разделов
  const sectionNumbers = {}
  let num = 1
  for (const key of sectionOrder) {
    if (key === 'cover' || key === 'toc') continue
    if (enabledSections[key]) sectionNumbers[key] = num++
  }

  const contentSections = sectionOrder.filter(k => k !== 'cover' && k !== 'toc')



  return (
    <Document>
      <Page
        size={layout.size}
        orientation={layout.orientation}
        style={{
          paddingTop:    layout.paddingTop,
          paddingBottom: layout.paddingBottom,
          paddingLeft:   layout.marginLeft,
          paddingRight:  layout.marginRight,
          fontFamily:    f.regular,
          backgroundColor: color.bgPage,
        }}
      >
        <PdfPageFrame cfg={cfg} draft={draft} companyId={companyId} />

        {/* Обложка */}
        {enabledSections.cover !== false && (
          coverMode === 'hat'
            ? <PdfBlockCoverHat  cfg={cfg} data={formData} draft={draft} />
            : <PdfBlockCoverFull cfg={cfg} data={formData} draft={draft} />
        )}

        {/* Секции по порядку */}
        {contentSections.map(key => {
          if (!enabledSections[key]) return null
          const n = sectionNumbers[key]

          if (key === 'features')
            return <PdfBlockFeatures key={key} cfg={cfg} data={formData} sectionNumber={n} />

          if (key === 'selectEquipment')
            return <PdfBlockSelectEquipment key={key} cfg={cfg} data={formData} sectionNumber={n} figureRegistry={figureRegistry} figuresEnabled={figuresEnabled} draft={draft} />

          if (key === 'recommendations')
            return <PdfBlockRecommendations key={key} cfg={cfg} data={formData} currency={currency} sectionNumber={n} />

          if (key === 'specifications')
            return <PdfBlockSpecifications key={key} cfg={cfg} models={models} currency={currency} tableFootnote={formData.tableFootnote} tableStyle={formData.tableStyle} sectionNumber={n} />

          if (key === 'specials')
            return <PdfBlockSpecials key={key} cfg={cfg} data={formData} models={models} sectionNumber={n} />

          if (key === 'rondoDelivery')
            return <PdfBlockRondoDelivery key={key} cfg={cfg} data={formData} sectionNumber={n} />

          if (key === 'systemChars')
            return <PdfBlockSystemChars key={key} cfg={cfg} modelsData={modelsData} sectionNumber={n} />

          if (key.startsWith(PAGEBREAK_PREFIX))
            return <PdfBlockPageBreak key={key} />

          if (key.startsWith(CUSTOM_PREFIX)) {
            const id    = key.replace(CUSTOM_PREFIX, '')
            const block = formData?._customSections?.[id]
            return block
              ? <PdfBlockCustom key={key} cfg={cfg} block={block} blockId={id} figureRegistry={figureRegistry} figuresEnabled={figuresEnabled} sectionNumber={sectionNumbers[key]} />
              : null
          }

          return null
        })}

      </Page>
    </Document>
  )
}
