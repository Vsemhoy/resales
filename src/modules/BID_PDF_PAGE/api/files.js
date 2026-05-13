import { HTTP_HOST } from '../../../config/config'

// ─── Роли файлов ─────────────────────────────────────────────────────────────
const TOP_LEVEL_ROLES = [
  'structuralDiagrams',
  'blockPlacements',
]

const ACOUSTIC_ROLES = [
  'placementOfAcousticSystems_placementOfAcousticSystems_file',
  'placementOfAcousticSystems_lineArrayConfiguration_file',
  'calculatingReverberationTime_reverberationTime_file',
  'calculatingDirectSpl_levelDistributionMap_file',
  'calculatingDirectSpl_levelDistributionChart_file',
  'calculatingCoefficientSti_levelDistributionMap_file',
  'calculatingCoefficientSti_levelDistributionChart_file',
  'calculatingAlcons_levelDistributionMap_file',
  'calculatingAlcons_levelDistributionChart_file',
]

/**
 * Вычленяет File-объекты из formData перед сохранением.
 * Возвращает cleanData (без File и без объектов-превью) и files { [role]: File }.
 */
export function extractFiles(formData) {
  const files = {}
  const cleanData = { ...formData }

  for (const role of TOP_LEVEL_ROLES) {
    const val = formData[role]
    if (val instanceof File) files[role] = val
    if (val != null) cleanData[role] = null
  }

  if (formData.acousticCalculation) {
    const ac = { ...formData.acousticCalculation }
    for (const role of ACOUSTIC_ROLES) {
      const val = ac[role]
      if (val instanceof File) files[role] = val
      if (val != null) ac[role] = null
    }
    cleanData.acousticCalculation = ac
  }

  return { cleanData, files }
}

/**
 * Восстанавливает файлы из formData.files в нужные поля формы.
 * Бэк возвращает: formData.files[role] = { filename, mime }
 * Файлы загружаются по запросу при необходимости.
 *
 * Храним объект { filename, mime } — FileUploadField будет подгружать файл по URL при клике.
 */
export function restoreFilesIntoFormData(formData) {
  const backendFiles = formData?.files
  if (!backendFiles || !Object.keys(backendFiles).length) return formData

  const data = { ...formData }
  delete data.files

  for (const [role, fileInfo] of Object.entries(backendFiles)) {
    if (!fileInfo?.filename) continue

    if (TOP_LEVEL_ROLES.includes(role)) {
      data[role] = fileInfo   // { filename, mime }
    } else if (ACOUSTIC_ROLES.includes(role)) {
      data.acousticCalculation = {
        ...data.acousticCalculation,
        [role]: fileInfo,
      }
    }
  }

  return data
}


/**
 * Возвращает src для <img> из значения поля.
 * value может быть: File | { filename, mime } | null
 */
export function getFilePreviewSrc(value, draftId) {
  if (!value) return null
  if (value instanceof File) return URL.createObjectURL(value)
  // Если есть файл на бэке — используем превью по URL (если картинка)
  if (value?.mime?.startsWith('image/')) {
    const host = HTTP_HOST
    return `${host}/api/soma/pdf/files/${draftId}/${value.filename}`
  }
  return null
}

/**
 * Возвращает имя файла из значения поля.
 */
export function getFileName(value) {
  if (!value) return null
  if (value instanceof File) return value.name
  if (value?.filename) return value.filename
  return null
}
