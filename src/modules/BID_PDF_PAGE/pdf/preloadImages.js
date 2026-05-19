import { HTTP_HOST } from '../../../config/config'

// TEST 6 победил: img + proxy + crossOrigin='anonymous' → canvas → base64
// Прямой fetch и прямой img без crossOrigin — не работают из-за CORS

const PROXY = `${HTTP_HOST}/api/soma/pdf/proxy-image`

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
        canvas.getContext('2d').drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/png'))
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

export async function preloadImages(formData) {
  const p = urlToBase64

  const [
    coverBlock,
    hatImage,
    structuralDiagrams,
    blockPlacements,
    specialsCoverBlock,
  ] = await Promise.all([
    p(formData.coverBlock),
    p(formData.hatImage),
    p(typeof formData.structuralDiagrams === 'string' ? formData.structuralDiagrams : null),
    p(typeof formData.blockPlacements    === 'string' ? formData.blockPlacements    : null),
    p(formData.specialsCoverBlock),
  ])

  // Кастомные блоки
  let patchedSections = formData._customSections
  if (formData._customSections) {
    const entries = Object.entries(formData._customSections)
    const images  = await Promise.all(
      entries.map(([, block]) => p(typeof block.image === 'string' ? block.image : null))
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
