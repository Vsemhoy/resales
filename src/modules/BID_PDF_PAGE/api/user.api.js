import { api } from './http'

// Текущий пользователь
export const getUser = () =>
  api.get('/usda').then(r => r.data)

// Действующие менеджеры, имеющие доступ к выбранной компании.
export const getPdfManagers = () =>
  api.get('/soma/pdf/managers').then(r => r.data?.data ?? [])
