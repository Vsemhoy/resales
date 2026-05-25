import { api } from './http'

export const getCovers = (companyId = 2) =>
  api.get('/soma/pdf/covers', { params: { company_id: companyId } }).then(r => r.data)

export const putCover = (file, companyId = 2, type = 'cover') => {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('company_id', companyId)
  fd.append('type', type)
  return api.post('/soma/pdf/covers', fd).then(r => r.data)
}

export const deleteCover = (filename, companyId = 2) =>
  api.delete(`/soma/pdf/covers/${filename}`, { params: { company_id: companyId } })
