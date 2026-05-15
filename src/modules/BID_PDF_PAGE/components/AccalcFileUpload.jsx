import React, { useRef, useState } from 'react'
import { Image } from 'antd'
import { uploadAccalcFile, wasteAccalcFiles, getAccalcFileUrl } from '../api/accalcs'

export function AccalcFileUpload({ draftId, prefix = '', value, onChange, label = 'Файл' }) {
  const inputRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const previewUrl = getAccalcFileUrl(draftId, value)
  const hasFile    = !!value

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true); setError(null)
    try {
      const { filename } = await uploadAccalcFile(draftId, file, prefix, value || null)
      onChange(filename)
    } catch {
      setError('Ошибка загрузки')
    } finally {
      setLoading(false); e.target.value = ''
    }
  }

  const handleRemove = async (e) => {
    e.stopPropagation()
    if (!value) return
    try { await wasteAccalcFiles(draftId, [value]) } catch {}
    onChange(null)
  }

  return (
    <div style={{ marginBottom: 8 }}>
      {label && <div style={{ fontSize: 12, fontWeight: 500, color: '#595959', marginBottom: 4 }}>{label}</div>}
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
      <div
        onClick={() => !loading && inputRef.current?.click()}
        style={{
          border: `1.5px dashed ${error ? '#ff4d4f' : '#d9d9d9'}`, borderRadius: 6,
          padding: 8, cursor: 'pointer', background: hasFile ? '#fafafa' : '#fff',
          minHeight: 56, display: 'flex', alignItems: 'center', gap: 8,
          transition: 'border-color 0.15s',
        }}
      >
        {loading && <span style={{ fontSize: 12, color: '#8c8c8c' }}>Загрузка...</span>}
        {!loading && hasFile && (
          <>
            <div onClick={e => e.stopPropagation()}>
              <Image
                src={previewUrl} alt=""
                height={48} style={{ maxWidth: 80, objectFit: 'contain', borderRadius: 3 }}
                preview={{ mask: '🔍' }}
                onError={() => {}}
              />
            </div>
            <span style={{ flex: 1, fontSize: 12, color: '#52c41a', fontWeight: 500 }}>✓ {value}</span>
            <button
              onClick={handleRemove}
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ff4d4f', fontSize: 18 }}
            >×</button>
          </>
        )}
        {!loading && !hasFile && (
          <span style={{ color: '#bfbfbf', fontSize: 12 }}>↑ Нажмите для загрузки изображения</span>
        )}
      </div>
      {error && <div style={{ fontSize: 11, color: '#ff4d4f', marginTop: 3 }}>{error}</div>}
    </div>
  )
}

// Собрать все filename из одного помещения (для удаления при removeRoom)
export function collectRoomFilenames(room) {
  const files = []
  const imageSections = ['placement', 'reverberation', 'directSpl', 'totalSpl']
  const stiSections   = ['sti', 'alcons']
  for (const key of imageSections) {
    for (const img of (room[key]?.images || [])) {
      if (img.file) files.push(img.file)
    }
  }
  for (const key of stiSections) {
    if (room[key]?.page1?.image?.file) files.push(room[key].page1.image.file)
    if (room[key]?.page2?.image?.file) files.push(room[key].page2.image.file)
  }
  return files
}
