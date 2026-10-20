import React from 'react'
import { View } from '@react-pdf/renderer'
import { Text } from '../shared/PdfText'
import { defaultManagerContacts } from '../../utils/managerContacts'

export function PdfBlockManager({ cfg, data, companyId }) {
  if (data?.showManager === false) return null

  const { color, text, font, weight, space } = cfg
  const position = String(data?.manager_occupy ?? '').trim()
  const name = String(data?.manager_name ?? '').trim()
  const contacts = String(data?.managerContacts ?? defaultManagerContacts(companyId, data?.email)).trim()
  if (!position && !name && !contacts) return null

  return (
    <View wrap={false} style={{ marginTop: space.xl }}>
      {position ? (
        <Text style={{
          fontSize: text.sm,
          fontFamily: font.regular,
          fontWeight: weight.regular,
          color: color.accent,
          marginBottom: space.xxs,
        }}>
          {position}
        </Text>
      ) : null}
      {name ? (
        <Text style={{
          fontSize: text.base,
          fontFamily: font.regular,
          fontWeight: weight.medium,
          color: color.textPrimary,
          marginBottom: space.xs,
        }}>
          {name}
        </Text>
      ) : null}
      {contacts ? (
        <Text style={{
          fontSize: text.sm,
          fontFamily: font.regular,
          fontWeight: weight.regular,
          color: color.textSecondary,
          lineHeight: 1.6,
        }}>
          {contacts}
        </Text>
      ) : null}
    </View>
  )
}
