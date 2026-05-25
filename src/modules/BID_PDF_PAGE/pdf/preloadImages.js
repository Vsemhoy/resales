import { HTTP_HOST } from '../../../config/config'
import { cleanAlphaNumeric } from '../utils/splitText'

// TEST 6 победил: img + proxy + crossOrigin='anonymous' → canvas → base64
// Прямой fetch и прямой img без crossOrigin — не работают из-за CORS

const PROXY      = `${HTTP_HOST}/api/soma/pdf/proxy-image`
const FILES_BASE = `${HTTP_HOST}/api/soma/pdf/files`
const MOD_FILES  = `${HTTP_HOST}/api/soma/pdf/modfiles`
const DEBUG = true

function resolveImageInput(src, draftId) {
  if (!src) return null

  if (typeof src === 'object' && src.filename) {
    return draftId ? `${FILES_BASE}/${draftId}/${src.filename}` : null
  }

  if (typeof src !== 'string') return null
  if (src.startsWith('http') || src.startsWith('data:') || src.startsWith('blob:') || src.startsWith('/')) return src

  // Legacy value: filename without path
  return draftId ? `${FILES_BASE}/${draftId}/${src}` : null
}

function toProxyUrl(url) {
  if (!url || typeof url !== 'string') return null
  if (url.startsWith('data:')) return url
  const path = url.startsWith('http') ? new URL(url).pathname : url
  return `${PROXY}?path=${encodeURIComponent(path)}`
}

function urlToBase64(url) {
  if (!url) return Promise.resolve(null)
  if (url.startsWith('data:')) return Promise.resolve(url)

  const proxyUrl = toProxyUrl(url)
  if (!proxyUrl) return Promise.resolve(null)


  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'   // ← ключ успеха из TEST 6
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width  = img.naturalWidth  || 800
        canvas.height = img.naturalHeight || 600
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height) // явно прозрачный фон — alpha сохраняется
        ctx.drawImage(img, 0, 0)
        const b64 = canvas.toDataURL('image/png')
        resolve(b64)
      } catch(e) {
        console.warn('canvas error:', proxyUrl, e)
        resolve(null)
      }
    }
    img.onerror = (e) => {
      console.warn('img load failed:', proxyUrl, e)
      resolve(null)
    }
    img.src = proxyUrl
  })
}

// File объект → data URL через FileReader (blob URL не работает в воркере react-pdf)
function fileToBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result)
    reader.onerror = () => resolve(null)
    reader.readAsDataURL(file)
  })
}

export async function preloadImages(formData, { draftId, models = [] } = {}) {
  const p = (label, src) => {
    if (src instanceof File) return fileToBase64(src)
    const resolved = resolveImageInput(src, draftId)
    return urlToBase64(resolved)
  }

  const [
    coverBlock,
    hatImage,
    structuralDiagrams,
    blockPlacements,
    specialsCoverBlock,
  ] = await Promise.all([
    p('coverBlock', formData.coverBlock),
    p('hatImage', formData.hatImage),
    p('structuralDiagrams', formData.structuralDiagrams),
    p('blockPlacements', formData.blockPlacements),
    p('specialsCoverBlock', formData.specialsCoverBlock),
  ])

  // Кастомные блоки
  let patchedSections = formData._customSections
  if (formData._customSections) {
    const entries = Object.entries(formData._customSections)
    const images  = await Promise.all(
      entries.map(([id, block]) => p(`custom:${id}`, block.image))
    )
    patchedSections = Object.fromEntries(
      entries.map(([id, block], i) => [
        id,
        images[i] ? { ...block, image: images[i] } : block,
      ])
    )
  }

  // Фото моделей: proxy → canvas с clearRect → base64 (alpha сохраняется)
  const modelImageEntries = await Promise.all(
    models.map(async (m) => {
      const id   = m.model_id ?? m.id
      const name = m.name || m.info_model?.name
      if (!name) return [id, null]
      const b64 = await urlToBase64(`${MOD_FILES}/${cleanAlphaNumeric(name)}`)
      return [id, b64]
    })
  )
  const _modelImages = Object.fromEntries(
    modelImageEntries.filter(([, b64]) => b64)
  )

  return {
    ...formData,
    ...(coverBlock         && { coverBlock }),
    ...(hatImage           && { hatImage }),
    ...(structuralDiagrams && { structuralDiagrams }),
    ...(blockPlacements    && { blockPlacements }),
    ...(specialsCoverBlock && { specialsCoverBlock }),
    ...(patchedSections    && { _customSections: patchedSections }),
    ...(Object.keys(_modelImages).length > 0 && { _modelImages }),
  }
}
