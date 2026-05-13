import { api } from './http'

// Поиск КП (bids) с дебаунсом на фронте
// Бэк фильтрует по active_company пользователя
export const searchBids = (query = '', type = '', limit = 12) =>
  api.get('/soma/bids/search', {
    params: { q: query, kp_type: type, limit },
  }).then(r => r.data)

// Получить один bid с его драфтами
export const getBidWithDrafts = (bidId) =>
  api.get(`/soma/bids/${bidId}/drafts`).then(r => r.data)

// Список моделей конкретного КП для модалки спецификации
// export const getBidModels = (bidId) =>
//   api.get(`/soma/bids/${bidId}/models`).then(r => r.data)
