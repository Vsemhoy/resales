import { api } from './http'
import { CSRF_TOKEN } from '../../../config/config'

// Поиск КП (bids) с дебаунсом на фронте
// Бэк фильтрует по active_company пользователя
export const searchBids = (query = '', type = '', limit = 12) =>
  api.get('/soma/bids/search', {
    params: { q: query, kp_type: type, limit },
  }).then(r => r.data)

// Получить один bid с его драфтами
export const getBidWithDrafts = (bidId) =>
  api.get(`/soma/bids/${bidId}/drafts`).then(r => r.data)

// Полная карточка заявки нужна, чтобы получить ID связанного проекта.
export const getBidInfo = (bidId) =>
  api.post(`/sales/v2/offers/${bidId}`, {
    _token: CSRF_TOKEN,
  }).then(r => r.data?.content ?? r.data)

// Проект хранит самостоятельный адрес объекта.
export const getProjectInfo = (projectId) =>
  api.post(`/sales/v2/offers/project/${projectId}`, {
    _token: CSRF_TOKEN,
  }).then(r => r.data?.content?.project ?? r.data?.project ?? r.data)

// Список моделей конкретного КП для модалки спецификации
// export const getBidModels = (bidId) =>
//   api.get(`/soma/bids/${bidId}/models`).then(r => r.data)
