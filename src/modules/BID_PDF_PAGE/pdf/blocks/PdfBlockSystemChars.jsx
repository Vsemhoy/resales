import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { PdfSectionBar } from '../shared/PdfSectionBar'

function fmt(val, decimals = 1) {
  if (val === null || val === undefined) return '—'
  const n = Number(val)
  if (isNaN(n) || n === 0) return '—'
  return n % 1 === 0 ? String(n) : n.toFixed(decimals)
}

function CharRow({ label, value, cfg }) {
  const { color, text, font, weight, space } = cfg
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: space.sm, maxWidth: 440 }}>
      <Text style={{
        fontSize: text.sm, fontFamily: font.regular,
        fontWeight: weight.regular, color: color.textPrimary, flexShrink: 1,
      }}>
        {label}
      </Text>
      <View style={{
        flex: 1, borderBottomWidth: 0.5, borderBottomColor: color.divider,
        marginHorizontal: space.xs, marginBottom: 2,
      }} />
      <Text style={{
        fontSize: text.sm, fontFamily: font.bold, fontWeight: weight.semibold,
        color: color.textPrimary, minWidth: 40, textAlign: 'right',
      }}>
        {value}
      </Text>
    </View>
  )
}

function GroupTitle({ children, cfg }) {
  const { color, text, font, weight, space } = cfg
  return (
    <Text style={{
      fontSize: text.sm, fontFamily: font.bold, fontWeight: weight.bold,
      color: color.accent, textTransform: 'uppercase',
      marginBottom: space.sm, marginTop: space.md,
    }}>
      {children}
    </Text>
  )
}

export function PdfBlockSystemChars({ cfg, modelsData, sectionNumber, forceBreak = false }) {
  if (!modelsData) return null

  const md = modelsData

  return (
    <View break={forceBreak} style={{ marginBottom: cfg.space.end }}>
      <PdfSectionBar cfg={cfg} number={sectionNumber} title="Характеристики системы" />

      <GroupTitle cfg={cfg}>Мощностные характеристики системы</GroupTitle>
      <CharRow cfg={cfg} label="Общая потребляемая мощность, Вт"     value={fmt(md.power_consumption, 1)} />
      <CharRow cfg={cfg} label="Общая выходная мощность, Вт"          value={fmt(md.max_power, 1)} />
      <CharRow cfg={cfg} label="Общая мощность громкоговорителей, Вт" value={fmt(md.rated_power_speaker, 1)} />

      <GroupTitle cfg={cfg}>Массогабаритные характеристики оборудования по спецификации</GroupTitle>
      <CharRow cfg={cfg} label="Общая высота, U"             value={fmt(md.box_size, 0)} />
      <CharRow cfg={cfg} label="Масса брутто, кг"            value={fmt(md.mass, 1)} />
      <CharRow cfg={cfg} label="Объём с учётом упаковки, м³" value={fmt(md.size, 3)} />
    </View>
  )
}
