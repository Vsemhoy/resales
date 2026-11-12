import { PROD_AXIOS_INSTANCE } from '../../config/Api'

const CATALOG_DATA = '/api/catalog/data'
const PAGE_LIMIT = 250
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
  const first = await PROD_AXIOS_INSTANCE.get(`${CATALOG_DATA}/getproperties`, {
    params: { page: 1, limit: 500 },
  })
  const firstPage = first.data
  const totalPages = Math.ceil((firstPage.total || 0) / (firstPage.limit || 500))
  const otherPages = await getRemainingPages(`${CATALOG_DATA}/getproperties`, { limit: 500 }, totalPages)
  return [...new Map([firstPage, ...otherPages]
    .flatMap(page => page.items || [])
    .map(property => [Number(property.id), property])).values()]
}

export async function getPriceModelPropertyValues({ categoryIds, modelIds, propertyIds }) {
  const valuesByModel = new Map()
  if (!propertyIds.length || !modelIds.length) return valuesByModel

  const selectedModels = new Set(modelIds.map(Number))
  const params = {
    cats: [...new Set(categoryIds.map(Number).filter(Number.isFinite))].join(',') || undefined,
    property_ids: propertyIds.join(','),
    limit: PAGE_LIMIT,
  }
  const first = await PROD_AXIOS_INSTANCE.get(`${CATALOG_DATA}/getmodels`, {
    params: { ...params, page: 1 },
  })
  const firstPage = first.data
  const totalPages = Math.ceil((firstPage.total || 0) / (firstPage.limit || PAGE_LIMIT))
  const otherPages = await getRemainingPages(`${CATALOG_DATA}/getmodels`, params, totalPages)

  for (const model of [firstPage, ...otherPages].flatMap(page => page.items || [])) {
    const modelId = Number(model.id)
    if (!selectedModels.has(modelId)) continue
    if (!Array.isArray(model.an_modelproper)) {
      throw new Error('Каталог не вернул значения свойств. Обновите API каталога.')
    }
    valuesByModel.set(modelId, new Map(model.an_modelproper.map(property => [
      Number(property.id_propertie), property.value,
    ])))
  }

  const missingModels = [...selectedModels].filter(id => !valuesByModel.has(id))
  if (missingModels.length) {
    throw new Error(`Каталог не вернул свойства для ${missingModels.length} выбранных моделей.`)
  }

  return valuesByModel
}
