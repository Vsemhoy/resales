import { api } from './http'

// Справочник моделей для селекта
export const getModels = () =>
  api.get('/sales/getmodels').then(r => r.data.models)

// Пересчёт цен по валюте
export const calcModels = (bidInfo, bidModels) =>
  api.post('/sales/calcmodels', {
    data: { bid_info: bidInfo, bid_models: bidModels },
  }).then(r => r.data.content)

// Курсы валют
export const getCurrency = () =>
  api.post('/currency/getcurrency').then(r => r.data)

// Справочник брендов (для отображения в спецификации)
export const getBrands = () =>
  api.get('/soma/pdf/info/brands').then(r => r.data)

// Справочники для формы (статусы, наличие и т.д.)
export const getBidSelects = (params = {}) =>
  api.post('/sales/v2/bidselects', { data: params }).then(r => r.data.selects)
