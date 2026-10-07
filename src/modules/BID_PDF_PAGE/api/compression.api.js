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
