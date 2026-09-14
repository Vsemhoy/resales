import { api } from './http'

export const MORPHER_CASES = [
  'nominative',
  'genitive',
  'dative',
  'accusative',
  'instrumental',
  'prepositional',
]

export const getMorpherWordIndexes = (value = '') =>
  String(value).trim().split(/\s+/).filter(Boolean).map((_, index) => index)

// Редакторский разбор: все падежи, совпавшие записи и пропущенные слова.
export const declineMorpherPhrase = (value, indexes = getMorpherWordIndexes(value), gender) =>
  api.post('/v1/morpher/decline/phrase', {
    value,
    indexes,
    ...(gender ? { gender } : {}),
  }).then(r => r.data?.data ?? r.data)

// Production-разбор: только подтверждённая запись указанного типа.
export const declineMorpherVerified = (type, value, grammaticalCase = 'dative', gender) =>
  api.post('/v1/morpher/decline', {
    type,
    value,
    case: grammaticalCase,
    ...(gender ? { gender } : {}),
  }).then(r => r.data?.data ?? r.data)
