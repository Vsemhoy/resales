import React from 'react'
import { View, Text, Image } from '@react-pdf/renderer'

import { PdfSectionBar } from '../shared/PdfSectionBar'
import { HtmlToPdfV2, wrapJustify } from '../shared/HtmlToPdfV2'

import { HTTP_ROOT } from '../../../../config/config'
import { cleanAlphaNumeric } from '../../utils/splitText'

function absUrl(name) {
  let rt = HTTP_ROOT + '/api/soma/pdf/modfilesautocut/' + name

  if (!rt.startsWith('http')) {
    rt = 'http://' + rt
  }

  return rt
}

// Какие характеристики скрываем
const EXCLUDE_PROPS = [
  'склад',
  'ожидаемая дата',
  'количество единиц оборудования в групповой',
  'габаритные размеры групповой',
  'масса оборудования в групповой',
  'тест батареи',
  'напряжение питания',
  'входов/выходов типа «сухой контакт»',
]

function shouldExclude(name = '') {
  const lower = name.toLowerCase()

  return EXCLUDE_PROPS.some(ex => lower.includes(ex))
}

// Нормализация характеристик
function normalizeChars(chars) {
  if (!chars) return []

  const arr = Array.isArray(chars)
    ? chars
    : Object.values(chars)

  return arr
    .filter(c => c?.property_name && !shouldExclude(c.property_name))
    .slice(0, 12)
}

// Строка характеристики
function CharRow({ c, cfg }) {
  const { color, text, font, weight, space } = cfg

  const value = c.dimension
    ? `${c.value} ${c.dimension}`.trim()
    : c.value

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: space.xs,
      }}
    >
      <Text
        style={{
          fontSize: text.xs,
          fontFamily: font.regular,
          color: color.textSecondary,
          flexShrink: 1,
        }}
      >
        {c.property_name}
      </Text>

      <View
        style={{
          flex: 1,
          borderBottomWidth: 0.5,
          borderBottomColor: color.divider,
          marginHorizontal: space.xs,
          marginBottom: 2,
        }}
      />

      <Text
        style={{
          fontSize: text.xs,
          fontFamily: font.bold,
          fontWeight: weight.bold,
          color: color.textPrimary,
          maxWidth: 120,
          textAlign: 'right',
        }}
      >
        {value}
      </Text>
    </View>
  )
}

export function PdfBlockSpecials({
  cfg,
  data,
  models = [],
  sectionNumber,
}) {
  const { color, text, font, weight, space } = cfg

  const ignored = data?.specialsIgnore ?? []
  const overrides = data?.specialsOverrides ?? {}

  const seen = new Set()
  const visible = models
    .filter(m => !ignored.includes(m.model_id ?? m.id))
    .filter(m => {
      const id = m.model_id ?? m.id
      if (seen.has(id)) return false
      seen.add(id)
      return true
    })

  if (!visible.length) return null

  return (
    <View style={{ marginBottom: cfg.space.end }}>
      <PdfSectionBar
        cfg={cfg}
        number={sectionNumber}
        title="Описание оборудования"
      />

      {visible.map((model) => {
        const id = model.model_id ?? model.id

        const ov = overrides[id]

        const name =
          model.info_model?.name || ''

        const shortNote =
          model.info_model?.short_note_new ||
          model.info_model?.short_note ||
          ''

        const desc =
          ov?.description_kp ??
          model.info_model?.description_kp ??
          ''

        const specials =
          ov?.specials ??
          (model.model_specials || []).map(
            s => s.special_name
          )

        // Характеристики
          console.log('ov', ov)
          console.log('ov1', model.info_model?.characteristics)
          console.log('ov2', model)

        const chars = normalizeChars(
          ov?.characteristics ??
          model.info_model?.characteristics ??
          model.characteristics
        )

        // Делим на 2 колонки
        const half = Math.ceil(chars.length / 2)

        const col1 = chars.slice(0, half)
        const col2 = chars.slice(half)

        const imgUrl = absUrl(cleanAlphaNumeric(name))

        return (
          <View
            key={id}
            style={{
              marginBottom: space.xl,
            }}
            wrap={false}
          >
            {/* Шапка */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',

                borderBottomWidth: 0.5,
                borderBottomColor: color.divider,

                paddingBottom: space.xs,
                marginBottom: space.sm,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: text.md,
                    fontFamily: font.bold,
                    fontWeight: weight.bold,
                    color: color.textPrimary,
                  }}
                >
                  {name}
                </Text>

                {shortNote ? (
                  <Text
                    style={{
                      fontSize: text.xs,
                      fontFamily: font.regular,
                      color: color.textSecondary,
                      marginTop: 1,
                    }}
                  >
                    {shortNote}
                  </Text>
                ) : null}
              </View>
            </View>

            {/* Основной блок */}
            <View style={{ flexDirection: 'row' }}>

              {/* Левая колонка */}
              <View
                style={{
                  flex: 1,
                  paddingRight: space.lg,
                }}
              >
                {/* Описание */}
                {desc ? (
                  <View>
                    <HtmlToPdfV2
                      html={wrapJustify(desc)}
                      cfg={cfg}
                    />
                  </View>
                ) : null}

                {/* Буллеты */}
                {specials.length > 0 ? (
                  <View
                    style={{
                      marginTop: desc
                        ? space.sm
                        : 0,
                    }}
                  >
                    {specials.map((sp, si) => (
                      <View
                        key={si}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'flex-start',
                          marginBottom: space.xs,
                        }}
                      >
                        <View
                          style={{
                            width: 3,
                            height: 3,
                            borderRadius: 1.5,

                            backgroundColor:
                              color.accent,

                            marginRight: space.xs,

                            marginTop:
                              text.sm * 0.4,

                            flexShrink: 0,
                          }}
                        />

                        <Text
                          style={{
                            fontSize: text.xs,
                            fontFamily:
                              font.regular,

                            color:
                              color.textPrimary,

                            flex: 1,
                            lineHeight: 1.5,
                          }}
                        >
                          {sp}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>

              {/* Правая колонка */}
              <View
                style={{
                  width: 160,
                  alignSelf: 'flex-start',
                }}
              >
                <Image
                  src={imgUrl}
                  style={{
                    width: 160,
                    height: 100,
                    objectFit: 'contain',
                  }}
                />
              </View>
            </View>

            {/* Характеристики */}
            {chars.length > 0 && (
              <View
                style={{
                  marginTop: space.md,
                }}
              >
                <Text
                  style={{
                    fontSize: text.sm,
                    fontFamily: font.bold,
                    fontWeight: weight.bold,

                    color: color.accent,

                    marginBottom: space.sm,

                    textTransform: 'uppercase',
                  }}
                >
                  Технические характеристики
                </Text>

                <View
                  style={{
                    flexDirection: 'row',
                  }}
                >
                  {/* Левая колонка */}
                  <View
                    style={{
                      flex: 1,
                      paddingRight: space.lg,
                    }}
                  >
                    {col1.map((c, i) => (
                      <CharRow
                        key={i}
                        c={c}
                        cfg={cfg}
                      />
                    ))}
                  </View>

                  {/* Правая колонка */}
                  <View style={{ flex: 1 }}>
                    {col2.map((c, i) => (
                      <CharRow
                        key={i}
                        c={c}
                        cfg={cfg}
                      />
                    ))}
                  </View>
                </View>
              </View>
            )}
          </View>
        )
      })}
    </View>
  )
}