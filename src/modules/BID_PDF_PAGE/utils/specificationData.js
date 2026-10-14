import { cleanModelName } from './splitText'

export const CURRENCY_SYMBOLS = { '1': '$', '2': '€', '3': '₽' }

export function getPresenceLabel(model) {
  const presenceName = model.precence?.name || model.presence_data?.name || model.presenceInfo?.name || model.presence?.name
  if (presenceName) return presenceName
  return Number(model.presence) > 0 ? 'В нал.' : '+'
}

function withoutNdsPrice(price, ndsPercent) {
  const numericPrice = Number.parseFloat(price) || 0
  const numericNds = Number(ndsPercent)
  const normalizedNds = Number.isFinite(numericNds) && numericNds > 0 ? numericNds : 0
  return normalizedNds > 0 ? numericPrice / (1 + normalizedNds / 100) : numericPrice
}

export function buildSpecificationRows(models = [], { withoutNds = false, ndsPercent = 0 } = {}) {
  return models.map((model, index) => {
    const rawPrice = withoutNds
      ? withoutNdsPrice(model.price, ndsPercent)
      : (Number.parseFloat(model.price) || 0)
    const quantity = model.model_count || 0
    const price = rawPrice / 100

    return {
      model,
      number: index + 1,
      name: cleanModelName(model.name || model.info_model?.name || `Позиция ${index + 1}`),
      note: model.info_model?.short_note_new || model.info_model?.short_note || '',
      quantity,
      price,
      total: price * quantity,
      presence: getPresenceLabel(model),
    }
  })
}
