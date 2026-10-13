import { api } from './http'

export const compressPdf = (blob, filename, dpi) => {
  const formData = new FormData()
  formData.append('file', blob, filename)
  formData.append('dpi', String(dpi))

  return api.post('/soma/pdf/compress', formData, {
    responseType: 'blob',
    timeout: 300000,
  })
}

export const getCompressionErrorMessage = async (error) => {
  const data = error.response?.data
  try {
    const payload = data instanceof Blob ? JSON.parse(await data.text()) : data
    if (error.response?.status === 422 && payload?.errors?.file) {
      return 'Сервер не принял PDF. Проверьте размер файла и лимит загрузки на сервере.'
    }
    if (typeof payload?.message === 'string' && payload.message.trim()) {
      return payload.message.trim()
    }
  } catch {
    // Laravel or the web server may return an HTML error page.
  }

  if (error.response?.status === 413) return 'PDF превышает допустимый размер загрузки.'
  if (error.response?.status === 422) return 'Сервер не принял PDF. Проверьте размер и формат файла.'
  if (error.response?.status === 503) return 'Сервис сжатия PDF недоступен.'
  if (error.response?.status === 502) return 'Сервис сжатия PDF вернул ошибку.'
  if (error.code === 'ECONNABORTED') return 'Превышено время ожидания сжатия PDF.'
  return 'Не удалось связаться с сервисом сжатия PDF.'
}
