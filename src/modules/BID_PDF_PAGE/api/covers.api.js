import { api } from './http'

// Список обложек
export async function getCovers() {
  const res = await api.get('/soma/pdf/covers')
  return res.data // [{ filename, url, size, created_at }]
}

// Загрузить новую обложку
export async function putCover(file) {
  const fd = new FormData()
  fd.append('file', file)
  const res = await api.post('/soma/pdf/covers', fd)
  return res.data // { filename, url }
}

// Удалить обложку
export async function deleteCover(filename) {
  await api.delete(`/soma/pdf/covers/${filename}`)
}
