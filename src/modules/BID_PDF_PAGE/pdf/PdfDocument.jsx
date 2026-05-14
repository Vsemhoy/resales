import React from 'react'
import { Document, Page, View } from '@react-pdf/renderer'
import { registerFonts } from './components/PdfFonts'
import { PdfHeader } from './components/PdfHeader'
import { PdfFooter } from './components/PdfFooter'
import { PdfCover } from './sections/PdfCover'
import { PdfFeatures } from './sections/PdfFeatures'
import { PdfSpecifications } from './sections/PdfSpecifications'
import { PdfToc } from './sections/PdfToc'
import { arstelTheme } from './theme/arstel'
import { rondoTheme } from './theme/rondo'
import { mm } from './theme/units'

registerFonts()

export function PdfDocument({ formData, draft, currency, companyId, enabledSections, sectionOrder, models = [] }) {
  const theme = companyId === '3' ? rondoTheme : arstelTheme
  const p     = theme.page

  // Считаем номера разделов для видимых секций (кроме cover и toc)
  const sectionNumbers = {}
  let num = 1
  for (const key of sectionOrder) {
    if (key === 'cover' || key === 'toc') continue
    if (enabledSections[key]) { sectionNumbers[key] = num++ }
  }

  const pageStyle = {
    fontFamily: theme.fonts.regular,
    paddingTop:    p.marginTop + mm(12),   // + header height
    paddingBottom: p.marginBottom + mm(14), // + footer height
    paddingLeft:   p.marginLeft,
    paddingRight:  p.marginRight,
  }

  return (
    <Document>
      <Page size={p.size} orientation={p.orientation} style={pageStyle}>

        <PdfHeader theme={theme} draft={draft} />
        <PdfFooter theme={theme} />

        {/* ── Секции по порядку ─────────────────────────────────────────────── */}
        {sectionOrder.map(key => {
          if (!enabledSections[key] && key !== 'cover') return null

          switch (key) {
            case 'cover':
              return (
                <PdfCover
                  key="cover"
                  theme={theme}
                  data={formData}
                  draft={draft}
                  currency={currency}
                />
              )

            case 'features':
              return enabledSections.features ? (
                <PdfFeatures
                  key="features"
                  theme={theme}
                  data={formData}
                  sectionNumber={sectionNumbers.features}
                />
              ) : null

            case 'specifications':
              return enabledSections.specifications ? (
                <PdfSpecifications
                  key="specifications"
                  theme={theme}
                  models={models}
                  currency={currency}
                  tableFootnote={formData.tableFootnote}
                  sectionNumber={sectionNumbers.specifications}
                />
              ) : null

            case 'toc':
              return enabledSections.toc ? (
                <PdfToc
                  key="toc"
                  theme={theme}
                  enabledSections={enabledSections}
                  sectionOrder={sectionOrder}
                />
              ) : null

            default:
              return null // остальные секции — stub, добавим позже
          }
        })}

      </Page>
    </Document>
  )
}
