import { PROD_AXIOS_INSTANCE } from '../../config/Api'

const PRICE_DATA = '/api/sales/price'
const MODEL_BATCH_SIZE = 500
const PAGE_BATCH_SIZE = 4

async function getRemainingPages(path, params, totalPages) {
  const pages = []
  for (let page = 2; page <= totalPages; page += PAGE_BATCH_SIZE) {
    const batch = await Promise.all(
      Array.from({ length: Math.min(PAGE_BATCH_SIZE, totalPages - page + 1) }, (_, index) =>
        PROD_AXIOS_INSTANCE.get(path, {
          params: { ...params, page: page + index },
        }).then(response => response.data),
      ),
    )
    pages.push(...batch)
  }
  return pages
}

export async function getPriceProperties() {
  const first = await PROD_AXIOS_INSTANCE.get(`${PRICE_DATA}/properties`, {
    params: { page: 1, limit: 500 },
  })
  const firstPage = first.data
  const totalPages = Math.ceil((firstPage.total || 0) / (firstPage.limit || 500))
  const otherPages = await getRemainingPages(`${PRICE_DATA}/properties`, { limit: 500 }, totalPages)
  return [...new Map([firstPage, ...otherPages]
    .flatMap(page => page.items || [])
    .map(property => [Number(property.id), property])).values()]
}

export async function getPriceModelPropertyValues({ modelIds, propertyIds }) {
  const valuesByModel = new Map(modelIds.map(id => [Number(id), new Map()]))
  if (!propertyIds.length || !modelIds.length) return valuesByModel

  const uniqueModelIds = [...valuesByModel.keys()]
  for (let offset = 0; offset < uniqueModelIds.length; offset += MODEL_BATCH_SIZE * PAGE_BATCH_SIZE) {
    const batch = await Promise.all(
      Array.from({ length: Math.min(PAGE_BATCH_SIZE, Math.ceil((uniqueModelIds.length - offset) / MODEL_BATCH_SIZE)) }, (_, index) =>
        PROD_AXIOS_INSTANCE.post(`${PRICE_DATA}/model-properties`, {
          model_ids: uniqueModelIds.slice(offset + index * MODEL_BATCH_SIZE, offset + (index + 1) * MODEL_BATCH_SIZE),
          property_ids: propertyIds,
        }).then(response => response.data),
      ),
    )
    for (const page of batch) {
      if (!Array.isArray(page.items)) throw new Error('Сервер не вернул значения свойств для прайса.')
      for (const property of page.items) {
        valuesByModel.get(Number(property.id_model))?.set(Number(property.id_propertie), property.value)
      }
    }
  }

  return valuesByModel
}
