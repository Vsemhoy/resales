import React from 'react'
import { Document, Page, View, Text } from '@react-pdf/renderer'
import { arstelTheme } from './theme/arstel'
import { rondoTheme } from './theme/rondo'
import { PdfCover }            from './sections/PdfCover'
import { PdfFeatures }         from './sections/PdfFeatures'
import { PdfSelectEquipment }  from './sections/PdfSelectEquipment'
import { PdfRecommendations }  from './sections/PdfRecommendations'
import { PdfSpecifications }   from './sections/PdfSpecifications'
import { PdfSpecials }         from './sections/PdfSpecials'
import { PdfToc }              from './sections/PdfToc'
import { PdfCustomBlock }      from './sections/PdfCustomBlock'
import { mm } from './theme/units'

const CUSTOM_PREFIX = 'custom_'

export function PdfDocument({ formData, draft, currency, companyId, enabledSections, sectionOrder, models = [] }) {
  const theme = companyId === '3' ? rondoTheme : arstelTheme
  const p     = theme.page

  // Нумерация разделов — TOC и Cover не нумеруются
  const sectionNumbers = {}
  let num = 1
  for (const key of sectionOrder) {
    if (key === 'cover' || key === 'toc') continue
    if (enabledSections[key]) sectionNumbers[key] = num++
  }

  // Секции без cover и toc — они рендерятся отдельно
  const contentSections = sectionOrder.filter(k => k !== 'cover' && k !== 'toc')

  return (
    <Document>
      <Page size="A4" style={{
        paddingTop: mm(28), paddingBottom: mm(28),
        paddingLeft: p.marginLeft, paddingRight: p.marginRight,
        fontFamily: theme.fonts.regular,
      }}>

        {/* Хедер fixed */}
        <View fixed style={{ position: 'absolute', top: mm(8), left: p.marginLeft, right: p.marginRight, flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: theme.fontSize.sm, color: theme.accent, fontFamily: theme.fonts.bold }}>
            {companyId === '3' ? 'RONDO' : 'ARSTEL'}
          </Text>
          <Text style={{ fontSize: theme.fontSize.xs, color: theme.gray }}>{draft?.object || ''}</Text>
        </View>

        {/* Футер fixed */}
        <View fixed style={{ position: 'absolute', bottom: mm(8), left: p.marginLeft, right: p.marginRight, flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: theme.fontSize.xs, color: theme.accent }}>
            {companyId === '3' ? 'rondo-sound.ru' : 'arstel.com'}
          </Text>
          <Text
            style={{ fontSize: theme.fontSize.xs, color: theme.gray }}
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
        </View>

        {/* Обложка — всегда первая */}
        {enabledSections.cover !== false && (
          <PdfCover theme={theme} data={formData} draft={draft} currency={currency} />
        )}

        {/* Контентные секции в порядке из редактора */}
        {contentSections.map(key => {
          if (!enabledSections[key]) return null
          const n = sectionNumbers[key]

          switch (key) {
            case 'features':
              return <PdfFeatures        key={key} theme={theme} data={formData} sectionNumber={n} />
            case 'selectEquipment':
              return <PdfSelectEquipment key={key} theme={theme} data={formData} sectionNumber={n} />
            case 'recommendations':
              return <PdfRecommendations key={key} theme={theme} data={formData} currency={currency} sectionNumber={n} />
            case 'specifications':
              return <PdfSpecifications  key={key} theme={theme} models={models} currency={currency} tableFootnote={formData.tableFootnote} sectionNumber={n} />
            case 'specials':
              return <PdfSpecials        key={key} theme={theme} data={formData} models={models} sectionNumber={n} />
            default:
              if (key.startsWith(CUSTOM_PREFIX)) {
                const id    = key.replace(CUSTOM_PREFIX, '')
                const block = formData?._customSections?.[id]
                if (!block) return null
                return <PdfCustomBlock key={key} theme={theme} block={block} />
              }
              return null
          }
        })}

        {/* TOC — всегда последний */}
        {enabledSections.toc && (
          <PdfToc theme={theme} enabledSections={enabledSections} sectionOrder={sectionOrder} />
        )}

      </Page>
    </Document>
  )
}
