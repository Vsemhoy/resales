import React, { useRef, useState } from 'react'
import { Image } from 'antd'
import { getFilePreviewSrc, getFileName } from '../api/files'
import { deleteFile } from '../api'
import { Field } from './FormParts'

export function FileUploadField({ label, role, draftId, value, onChange }) {
  const inputRef  = useRef(null)
  const [removing, setRemoving] = useState(false)

  const hasFile    = !!value
  const previewSrc = getFilePreviewSrc(value, draftId)
  const fileName   = getFileName(value)
  const isImage    = previewSrc && (
    value instanceof File ? value.type?.startsWith('image/') : value?.mime?.startsWith('image/')
  )

  const handleChange = (e) => {
    const file = e.target.files?.[0]
    if (file) onChange(file)
  }

  const handleRemove = async (e) => {
    e.stopPropagation()
    if (!draftId || value instanceof File) { onChange(null); return }
    setRemoving(true)
    try { await deleteFile(draftId, role) } catch {}
    finally { setRemoving(false); onChange(null) }
  }

  return (
    <Field label={label}>
      <input ref={inputRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={handleChange} />
      <div
        style={{
          border: '1.5px dashed #d9d9d9', borderRadius: 6, padding: 10, cursor: 'pointer',
          background: hasFile ? '#fafafa' : '#fff', minHeight: 64,
          display: 'flex', alignItems: 'center', gap: 10,
        }}
        onClick={() => !removing && inputRef.current?.click()}
      >
        {hasFile ? (
          <>
            {isImage && (
              <div onClick={e => e.stopPropagation()}>
                <Image
                  src={previewSrc}
                  alt={fileName}
                  height={60}
                  style={{ maxWidth: 100, objectFit: 'contain', borderRadius: 4 }}
                  preview={{ mask: '🔍' }}
                />
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: '#52c41a', fontWeight: 500 }}>✓ {fileName}</div>
              <div style={{ fontSize: 11, color: '#bfbfbf', marginTop: 2 }}>нажмите чтобы заменить</div>
            </div>
            <button
              onClick={handleRemove} disabled={removing}
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ff4d4f', fontSize: 18, lineHeight: 1, padding: '0 4px' }}
            >
              {removing ? '…' : '×'}
            </button>
          </>
        ) : (
          <div style={{ color: '#bfbfbf', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 18 }}>↑</span> Нажмите или перетащите файл
          </div>
        )}
      </div>
    </Field>
  )
}
