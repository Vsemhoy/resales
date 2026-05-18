import { HTTP_HOST } from '../../../config/config'

// ─── Роли файлов верхнего уровня ─────────────────────────────────────────────
const TOP_LEVEL_ROLES = [
  'structuralDiagrams',
  'blockPlacements',
]

// ─── Извлечь File-объекты из formData перед сохранением ──────────────────────
export function extractFiles(formData) {
  const files     = {}
  const cleanData = { ...formData }

  // Верхний уровень
  for (const role of TOP_LEVEL_ROLES) {
    const val = formData[role]
    if (val instanceof File) files[role] = val
    if (val != null) cleanData[role] = null
  }

  // Кастомные блоки — роль: customBlock_{id}_image
  if (formData._customSections) {
    const cleanSections = {}
    for (const [id, block] of Object.entries(formData._customSections)) {
      const role = `customBlock_${id}_image`
      if (block.image instanceof File) {
        files[role]  = block.image
        cleanSections[id] = { ...block, image: null }
      } else {
        cleanSections[id] = block
      }
    }
    cleanData._customSections = cleanSections
  }

  // Акустика — файлы хранятся через accalcs API отдельно, не трогаем
  return { cleanData, files }
}

// ─── Восстановить файлы из ответа бэка в formData ───────────────────────────
export function restoreFilesIntoFormData(formData) {
  const backendFiles = formData?.files
  if (!backendFiles || !Object.keys(backendFiles).length) return formData

  const data = { ...formData }
  delete data.files

  for (const [role, fileInfo] of Object.entries(backendFiles)) {
    if (!fileInfo?.filename) continue

    if (TOP_LEVEL_ROLES.includes(role)) {
      data[role] = fileInfo   // { filename, mime }
    } else if (role.startsWith('customBlock_') && role.endsWith('_image')) {
      // customBlock_{id}_image → _customSections[id].image
      const id = role.replace('customBlock_', '').replace('_image', '')
      if (data._customSections?.[id]) {
        data._customSections = {
          ...data._customSections,
          [id]: { ...data._customSections[id], image: fileInfo },
        }
      }
    }
  }

  return data
}

// ─── URL для превью ───────────────────────────────────────────────────────────
export function getFilePreviewSrc(value, draftId) {
  if (!value) return null
  if (value instanceof File) return URL.createObjectURL(value)
  if (value?.mime?.startsWith('image/') && value?.filename) {
    return `${HTTP_HOST}/api/soma/pdf/files/${draftId}/${value.filename}`
  }
  return null
}

// ─── URL файла для PDF ────────────────────────────────────────────────────────
export function getFileUrl(draftId, filename) {
  if (!draftId || !filename) return null
  return `${HTTP_HOST}/api/soma/pdf/files/${draftId}/${filename}`
}

// ─── Имя файла ────────────────────────────────────────────────────────────────
export function getFileName(value) {
  if (!value) return null
  if (value instanceof File) return value.name
  if (value?.filename) return value.filename
  return null
}
