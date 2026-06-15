import { api } from './http'

export const updateDraftStatus = (draftId, status) =>
  api.patch(`/soma/pdf/drafts/${draftId}/status`, { status }).then(r => r.data)
