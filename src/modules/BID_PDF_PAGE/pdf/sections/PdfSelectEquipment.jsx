import React from 'react'
import { View, Text, Image } from '@react-pdf/renderer'
import { mm } from '../theme/units'
import { HtmlToPdf } from '../components/HtmlToPdf'

function SectionHeading({ theme, number, title }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: mm(6), marginTop: mm(4) }}>
      <View style={{ width: mm(1.5), height: mm(10), backgroundColor: theme.accent, marginRight: mm(4) }} />
      <View>
        {number && <Text style={{ fontSize: theme.fontSize.xs, color: theme.accent, fontFamily: theme.fonts.regular }}>РАЗДЕЛ {number}</Text>}
        <Text style={{ fontSize: theme.fontSize.lg, color: theme.black, fontFamily: theme.fonts.bold, fontWeight: 700 }}>{title}</Text>
      </View>
    </View>
  )
}

function FigureBlock({ src, figInfo, theme }) {
  if (!src) return null
  const absUrl = src.startsWith('http') ? src : `${window.location.origin}${src}`
  return (
    <View style={{ marginVertical: mm(4) }}>
      <Image src={absUrl} style={{ width: '100%', objectFit: 'contain', maxHeight: mm(120) }} />
      {figInfo && (
        <Text style={{ fontSize: theme.fontSize.xs, color: theme.gray, fontFamily: theme.fonts.regular, textAlign: 'center', marginTop: mm(2) }}>
          Рисунок {figInfo.num}. {figInfo.title}
        </Text>
      )}
    </View>
  )
}

export function PdfSelectEquipment({ theme, data, sectionNumber, figureRegistry = new Map(), figuresEnabled = true }) {
  if (!data?.selectionOfEquipment && !data?.structuralDiagrams && !data?.blockPlacements) return null

  return (
    <View>
      <SectionHeading theme={theme} number={sectionNumber} title="Выбор оборудования" />
      {data.selectionOfEquipment && <HtmlToPdf html={data.selectionOfEquipment} theme={theme} />}
      <FigureBlock
        src={data.structuralDiagrams}
        figInfo={figuresEnabled ? figureRegistry.get('structuralDiagrams') : null}
        theme={theme}
      />
      <FigureBlock
        src={data.blockPlacements}
        figInfo={figuresEnabled ? figureRegistry.get('blockPlacements') : null}
        theme={theme}
      />
    </View>
  )
}
