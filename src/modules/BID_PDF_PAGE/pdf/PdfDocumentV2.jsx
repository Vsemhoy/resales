import React from 'react'
import { Document, Page, View, Text } from '@react-pdf/renderer'
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
import { PdfBlockToc }               from './blocks/PdfBlockToc'
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
  capturePageNumber  = null,   // (key, pageNum) => void — первый проход
  sectionPageNumbers = {},     // { key: pageNum } — второй проход
}) {
  const cfg = getConfig(companyId, orientation)
  const { layout, color, font: f } = cfg

  const coverMode = formData?.coverMode ?? 'hat'

  const figureRegistry = buildFigureRegistry({
    sectionOrder, enabledSections, formData, figuresEnabled,
  })

  // Нумерация разделов
  const sectionNumbers = {}
  let num = 1
  for (const key of sectionOrder) {
    if (key === 'cover' || key === 'toc') continue
    if (key === 'pageBreak' || key.startsWith('pageBreak_')) continue   // разрывы не нумеруем
    if (enabledSections[key]) sectionNumbers[key] = num++
  }

  const contentSections = sectionOrder.filter(k =>
    k !== 'cover' && k !== 'toc' && k !== 'pageBreak'
  )

  // Метки разделов для оглавления
  const SECTION_LABELS = {
    features:        'Особенности системы',
    selectEquipment: 'Выбор оборудования',
    acoustic:        'Акустический расчёт',
    specifications:  'Спецификация',
    recommendations: 'Рекомендации',
    systemChars:     'Характеристики системы',
    rondoDelivery:   'Условия оплаты и поставки',
    specials:        'Описание оборудования',
  }
  const getLabel = (key) => {
    if (key.startsWith('custom_')) {
      const id = key.replace('custom_', '')
      return formData?._customSections?.[id]?.title || 'Блок'
    }
    return SECTION_LABELS[key] || key
  }



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
        <PdfPageFrame cfg={cfg} draft={draft} companyId={companyId} formData={formData} />

        {/* Обложка */}
        {enabledSections.cover !== false && (
          coverMode === 'hat'
            ? <PdfBlockCoverHat  cfg={cfg} data={formData} draft={draft} companyId={companyId} />
            : <PdfBlockCoverFull cfg={cfg} data={formData} draft={draft} />
        )}

        {/* Секции по порядку */}
        {contentSections.map((key, idx) => {
          if (!enabledSections[key]) return null
          const n = sectionNumbers[key]

          if (key === 'pageBreak' || key.startsWith(PAGEBREAK_PREFIX)) return null

          // Ищем назад пропуская отключённые секции:
          // если встретили pageBreak — break нужен, если включённую секцию — нет
          const forceBreak = (() => {
            for (let i = idx - 1; i >= 0; i--) {
              const k = contentSections[i]
              if (k === 'pageBreak' || k.startsWith(PAGEBREAK_PREFIX)) {
                return enabledSections[k] !== false
              }
              if (enabledSections[k]) return false  // включённая секция — стоп
              // отключённая — продолжаем смотреть назад
            }
            return false
          })()

          // Phantom Text — захватывает номер страницы секции в первом проходе
          const phantom = capturePageNumber
            ? <Text render={({ pageNumber }) => { capturePageNumber(key, pageNumber); return '' }}
                    style={{ fontSize: 0.01, lineHeight: 0 }} />
            : null

          // Когда разрыв нужен — View break, иначе Fragment (без лишнего враппера)
          const wrap = (block) => forceBreak
            ? <View key={key} break>{phantom}{block}</View>
            : <React.Fragment key={key}>{phantom}{block}</React.Fragment>

          if (key === 'features')
            return wrap(<PdfBlockFeatures cfg={cfg} data={formData} sectionNumber={n} />)

          if (key === 'selectEquipment')
            return wrap(<PdfBlockSelectEquipment cfg={cfg} data={formData} sectionNumber={n} figureRegistry={figureRegistry} figuresEnabled={figuresEnabled} draft={draft} />)

          if (key === 'recommendations')
            return wrap(<PdfBlockRecommendations cfg={cfg} data={formData} currency={currency} sectionNumber={n} />)

          if (key === 'specifications')
            return wrap(<PdfBlockSpecifications cfg={cfg} models={models} currency={currency} tableFootnote={formData.tableFootnote} tableStyle={formData.tableStyle} modelImages={formData._modelImages ?? {}} withoutNds={formData._withoutNds} ndsPercent={formData._ndsPercent} sectionNumber={n} />)

          if (key === 'specials')
            return wrap(<PdfBlockSpecials cfg={cfg} data={formData} models={models} sectionNumber={n} />)

          if (key === 'rondoDelivery')
            return wrap(<PdfBlockRondoDelivery cfg={cfg} data={formData} sectionNumber={n} />)

          if (key === 'systemChars')
            return wrap(<PdfBlockSystemChars cfg={cfg} modelsData={modelsData} sectionNumber={n} />)

          if (key.startsWith(CUSTOM_PREFIX)) {
            const id    = key.replace(CUSTOM_PREFIX, '')
            const block = formData?._customSections?.[id]
            return block
              ? wrap(<PdfBlockCustom cfg={cfg} block={block} blockId={id} figureRegistry={figureRegistry} figuresEnabled={figuresEnabled} sectionNumber={sectionNumbers[key]} />)
              : null
          }

          return null
        })}

        {/* Оглавление — в конце документа, только так можно получить страницы */}
        {enabledSections.toc !== false && (() => {
          // Ищем назад от конца, пропуская отключённые секции
          const tocBreak = (() => {
            for (let i = contentSections.length - 1; i >= 0; i--) {
              const k = contentSections[i]
              if (k === 'pageBreak' || k.startsWith(PAGEBREAK_PREFIX)) {
                return enabledSections[k] !== false
              }
              if (enabledSections[k]) return false
            }
            return false
          })()
          return (
            <PdfBlockToc
              cfg={cfg}
              sectionNumbers={sectionNumbers}
              enabledSections={enabledSections}
              sectionOrder={sectionOrder}
              getLabel={getLabel}
              sectionPageNumbers={sectionPageNumbers}
              forceBreak={tocBreak}
            />
          )
        })()}

      </Page>
    </Document>
  )
}
