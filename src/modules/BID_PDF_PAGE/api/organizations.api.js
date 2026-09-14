import { api } from './http'
import { CSRF_TOKEN } from '../../../config/config'

let ownershipFormsPromise = null

export const getOrganizationInfo = (organizationId) =>
  api.post(`/sales/v2/orglist/${organizationId}/m`, {
    data: {},
    _token: CSRF_TOKEN,
  })
    .then(response => response.data?.content ?? response.data)

export const getOrganizationOwnershipForms = () => {
  if (!ownershipFormsPromise) {
    ownershipFormsPromise = api.post('/sales/orgfilterlist', {
      data: {},
      _token: CSRF_TOKEN,
    })
      .then(response => response.data?.filters?.fss ?? [])
      .catch(error => {
        ownershipFormsPromise = null
        throw error
      })
  }

  return ownershipFormsPromise
}
