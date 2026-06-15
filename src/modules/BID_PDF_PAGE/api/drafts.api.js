import { api } from './http'
import { HTTP_HOST } from '../../../config/config'
export const kpTypeToBackend = (kpType) => {
  const map = {
    'arstel-broadcast': { kp_type: 1, id_company: 2 },
    'arstel-pro':       { kp_type: 2, id_company: 2 },
    'rondo-broadcast':  { kp_type: 1, id_company: 3 },
    'rondo-pro':        { kp_type: 2, id_company: 3 },
  }
  return map[kpType] ?? { kp_type: 1, id_company: 2 }
}

export const backendToKpType = (id_company, kp_type) => {
  if (id_company === 2 && kp_type === 1) return 'arstel-broadcast'
  if (id_company === 2 && kp_type === 2) return 'arstel-pro'
  if (id_company === 3 && kp_type === 1) return 'rondo-broadcast'
  if (id_company === 3 && kp_type === 2) return 'rondo-pro'
  return 'arstel-broadcast'
}

export const getDrafts = (params = {}) =>
  api.get('/soma/pdf/drafts', { params }).then(r => r.data)

// Серверный список с пагинацией/сортировкой/фильтрами для SOMA_PDF_LIST
// params: { page, limit, sort_by, sort_order, id, bid_id, status, id_company, org, manager, engineer, mine }
export const getDraftsList = (params = {}) =>
  api.get('/soma/pdf/drafts', { params }).then(r => r.data)

export const getDraft = (id) =>
  api.get(`/soma/pdf/drafts/${id}`).then(r => r.data)

// Модели КП для модалки спецификации
export const getBidModels = (bidId) =>
  api.get(`/soma/pdf/draft_bid_models/${bidId}`).then(r => r.data)

export const createDraft = ({ kpType, bidId, object, currency }) => {
  const { kp_type, id_company } = kpTypeToBackend(kpType)
  return api.post('/soma/pdf/drafts', {
    bid_id:     bidId ?? null,
    kp_type,
    id_company,
    object:     object ?? '',
    currency:   currency ?? { label: '₽', value: '3' },
    form_data:  {},
  }).then(r => r.data)
}

// currency — на верхний уровень, не внутрь form_data
export const saveDraft = (id, formData, currency) =>
  api.put(`/soma/pdf/drafts/${id}`, {
    form_data: formData,
    ...(currency ? { currency } : {}),
  }).then(r => r.data)

export const saveDraftWithFiles = (id, formData, currency, files = {}) => {
  const fd = new FormData()
  fd.append('_method', 'PUT')  // Laravel method spoofing — PUT не поддерживает файлы
  fd.append('form_data', JSON.stringify(formData))
  if (currency) fd.append('currency', JSON.stringify(currency))
  Object.entries(files).forEach(([role, file]) => {
    if (file instanceof File) fd.append(role, file)
  })
  // POST вместо PUT — Axios сам ставит multipart/form-data с boundary
  return api.post(`/soma/pdf/drafts/${id}`, fd).then(r => r.data)
}

export const deleteFile = (draftId, role) =>
  api.delete(`/soma/pdf/files/${draftId}/${role}`).then(r => r.data)

export const getDraftModels = (draftId) =>
  api.get(`/soma/pdf/drafts/${draftId}/models`).then(r => r.data)

export const getDraftSpecials = (draftId) =>
  api.get(`/soma/pdf/drafts/${draftId}/specials`).then(r => r.data)

export const deleteDraft = (id) =>
  api.delete(`/soma/pdf/drafts/${id}`).then(r => r.data)

export const restoreDraft = (id) =>
  api.post(`/soma/pdf/restore/${id}`).then(r => r.data)

export const getFileUrl = (draftId, filename) => {
  const host = HTTP_HOST
  return `${host}/api/soma/pdf/files/${draftId}/${filename}`
}




