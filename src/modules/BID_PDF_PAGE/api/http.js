import axios from 'axios'
import { HTTP_HOST, CSRF_TOKEN } from '../../../config/config'

export const api = axios.create({
  baseURL: `${HTTP_HOST}/api`,
  timeout: 30000,
  withCredentials: true,
})

// XSRF — берём из config.js Sales-модуля (он уже задекодирован)
api.interceptors.request.use((config) => {
  if (CSRF_TOKEN) {
    config.headers['X-XSRF-TOKEN'] = CSRF_TOKEN
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    if ([401, 403, 419].includes(status)) {
      console.warn('Auth error:', status)
      window.location.href = `${HTTP_HOST}/login`
    }
    return Promise.reject(error)
  }
)
