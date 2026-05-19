import React from 'react'
import { Document, Page } from '@react-pdf/renderer'
import { getConfig } from './pdf_config'
import { registerFonts } from './components/PdfFonts'
import { PdfPageFrame } from './PdfPageFrame'
import { PdfBlockCoverFull } from './blocks/PdfBlockCoverFull'
import { PdfBlockCoverHat }  from './blocks/PdfBlockCoverHat'

registerFonts()

export function PdfDocumentV2({
  formData,
  draft,
  currency,
  companyId   = '2',
  orientation = 'v',
  enabledSections = {},
  sectionOrder    = [],
  models          = [],
  figuresEnabled  = true,
}) {
  const cfg = getConfig(companyId, orientation)
  const { layout } = cfg

  const coverMode = formData?.coverMode ?? 'cover'

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
          fontFamily:    cfg.font.regular,
          backgroundColor: cfg.color.bgPage,
        }}
      >
        {/* Хедер и футер */}
        <PdfPageFrame cfg={cfg} draft={draft} companyId={companyId} />

        {/* ── Обложка ───────────────────────────────────────────────────── */}
        {(enabledSections.cover !== false) && (
          coverMode === 'hat'
            ? <PdfBlockCoverHat  cfg={cfg} data={formData} draft={draft} />
            : <PdfBlockCoverFull cfg={cfg} data={formData} draft={draft} />
        )}

        {/* TODO: остальные секции — добавляем по одной */}

      </Page>
    </Document>
  )
}
