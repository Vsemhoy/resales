import { HTTP_HOST } from '../../../config/config'

// TEST 6 победил: img + proxy + crossOrigin='anonymous' → canvas → base64
// Прямой fetch и прямой img без crossOrigin — не работают из-за CORS

const PROXY = `${HTTP_HOST}/api/soma/pdf/proxy-image`
const FILES_BASE = `${HTTP_HOST}/api/soma/pdf/files`
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
  if (DEBUG) console.log('[pdf-img] proxy url:', proxyUrl)

  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'   // ← ключ успеха из TEST 6
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width  = img.naturalWidth  || 800
        canvas.height = img.naturalHeight || 600
        canvas.getContext('2d').drawImage(img, 0, 0)
        const b64 = canvas.toDataURL('image/png')
        if (DEBUG) console.log('[pdf-img] base64 ready, len:', b64?.length, 'src:', url)
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

export async function preloadImages(formData, { draftId } = {}) {
  const p = (label, src) => {
    const resolved = resolveImageInput(src, draftId)
    if (DEBUG) console.log('[pdf-img] input:', label, src, 'resolved:', resolved)
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

  return {
    ...formData,
    ...(coverBlock         && { coverBlock }),
    ...(hatImage           && { hatImage }),
    ...(structuralDiagrams && { structuralDiagrams }),
    ...(blockPlacements    && { blockPlacements }),
    ...(specialsCoverBlock && { specialsCoverBlock }),
    ...(patchedSections    && { _customSections: patchedSections }),
  }
}
