import { api } from './http'

import { HTTP_HOST } from '../../../config/config'

const BASE = HTTP_HOST

// ─── Загрузить файл ───────────────────────────────────────────────────────────
// prefix      — префикс секции: 'placement', 'rev', 'direct', 'total', 'sti', 'alcons'
// oldFilename — если передан, бэк удалит его перед сохранением нового
// Возвращает { filename: "rev_abc123.jpg" }
export async function uploadAccalcFile(draftId, file, prefix = '', oldFilename = null) {
  const fd = new FormData()
  fd.append('file', file)
  if (prefix)      fd.append('prefix', prefix)
  if (oldFilename) fd.append('old_filename', oldFilename)
  const res = await api.post(`/soma/pdf/accalcs/store/${draftId}`, fd)
  return res.data // { filename }
}

// ─── Удалить файлы (сборщик мусора) ──────────────────────────────────────────
export async function wasteAccalcFiles(draftId, filenames = []) {
  if (!draftId) return
  const clean = filenames.filter(Boolean)
  if (!clean.length) return
  await api.post(`/soma/pdf/accalcs/waste/${draftId}`, { filenames: clean })
}

// ─── URL для отображения файла ────────────────────────────────────────────────
export function getAccalcFileUrl(draftId, filename) {
  if (!draftId || !filename) return null
  return `${BASE}/api/soma/pdf/accalcs/${draftId}/${filename}`
}

// ─── Префиксы секций ──────────────────────────────────────────────────────────
export const SECTION_PREFIXES = {
  placement:    'placement',
  reverberation: 'rev',
  directSpl:    'direct',
  totalSpl:     'total',
  sti:          'sti',
  alcons:       'alcons',
}
