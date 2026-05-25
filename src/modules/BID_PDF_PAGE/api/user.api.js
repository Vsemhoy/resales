import { api } from './http'

// Текущий пользователь
export const getUser = () =>
  api.get('/usda').then(r => r.data)
