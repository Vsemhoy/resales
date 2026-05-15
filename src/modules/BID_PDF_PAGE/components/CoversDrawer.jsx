import React, { useState, useEffect, useRef } from 'react'
import { Drawer, Button, Spin, Popconfirm, Image } from 'antd'
import { PictureOutlined, UploadOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons'
import { getCovers, putCover, deleteCover } from '../api/covers.api'

// ─── Хук ─────────────────────────────────────────────────────────────────────
export function useCovers() {
  const [covers,  setCovers]  = useState([])
  const [loading, setLoading] = useState(false)

  const reload = () => {
    setLoading(true)
    getCovers()
      .then(data => setCovers(Array.isArray(data) ? data : []))
      .catch(() => setCovers([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { reload() }, [])

  // Синхронизация между всеми инстансами хука
  useEffect(() => {
    const handler = () => reload()
    window.addEventListener('soma-covers-updated', handler)
    return () => window.removeEventListener('soma-covers-updated', handler)
  }, [])

  return { covers, loading, reload }
}

// ─── Дровер ──────────────────────────────────────────────────────────────────
export function CoversDrawer({ open, onClose, selectedUrl, onSelect }) {
  const { covers, loading, reload } = useCovers()
  const [uploading, setUploading] = useState(false)
  const [deleting,  setDeleting]  = useState(null)
  const inputRef = useRef(null)

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    try {
      await Promise.all(files.map(f => putCover(f)))
      window.dispatchEvent(new Event('soma-covers-updated'))
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDelete = async (filename) => {
    setDeleting(filename)
    try {
      await deleteCover(filename)
      if (selectedUrl?.includes(filename)) onSelect(null)
      window.dispatchEvent(new Event('soma-covers-updated'))
    } finally {
      setDeleting(null)
    }
  }

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <PictureOutlined />
          <span>Менеджер обложек</span>
          <span style={{ fontSize: 12, color: '#8c8c8c', fontWeight: 400 }}>
            {covers.length} файлов
          </span>
        </div>
      }
      placement="right"
      width="100%"
      open={open}
      onClose={onClose}
      extra={
        <>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleUpload}
          />
          <Button
            type="primary"
            icon={<UploadOutlined />}
            loading={uploading}
            onClick={() => inputRef.current?.click()}
          >
            Загрузить
          </Button>
        </>
      }
    >
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <Spin />
        </div>
      )}

      {!loading && covers.length === 0 && (
        <div style={{ textAlign: 'center', padding: 64, color: '#bfbfbf' }}>
          <PictureOutlined style={{ fontSize: 48, display: 'block', marginBottom: 12 }} />
          Нет обложек. Загрузите первую!
        </div>
      )}

      {!loading && covers.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 12,
        }}>
          {/* Без обложки */}
          <CoverCard
            label="Без обложки"
            isSelected={!selectedUrl}
            onClick={() => onSelect(null)}
          />
          {covers.map(cover => (
            <CoverCard
              key={cover.filename}
              url={cover.url}
              label={cover.filename}
              isSelected={selectedUrl === cover.url}
              isDeleting={deleting === cover.filename}
              onClick={() => onSelect(cover.url === selectedUrl ? null : cover.url)}
              onDelete={() => handleDelete(cover.filename)}
            />
          ))}
        </div>
      )}
    </Drawer>
  )
}

// ─── Карточка обложки ─────────────────────────────────────────────────────────
function CoverCard({ url, label, isSelected, isDeleting, onClick, onDelete }) {
  return (
    <div
      onClick={onClick}
      style={{
        border: `2px solid ${isSelected ? '#1677ff' : '#e8e8e8'}`,
        borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
        background: isSelected ? '#e6f4ff' : '#fafafa',
        transition: 'all 0.15s', position: 'relative',
      }}
    >
      {/* Превью */}
      <div style={{ height: 120, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {url
          ? (
            <Image
              src={url} alt={label}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              preview={{ mask: '🔍 Открыть' }}
              onClick={e => e.stopPropagation()}
            />
          )
          : <PictureOutlined style={{ fontSize: 32, color: '#bfbfbf' }} />
        }
      </div>

      {/* Подпись */}
      <div style={{ padding: '6px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{
          flex: 1, fontSize: 11, color: '#595959',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {label}
        </span>
        {onDelete && (
          <Popconfirm
            title="Удалить обложку?"
            okText="Да" cancelText="Нет"
            onConfirm={e => { e?.stopPropagation(); onDelete() }}
            onCancel={e => e?.stopPropagation()}
          >
            <button
              onClick={e => e.stopPropagation()}
              disabled={!!isDeleting}
              style={{
                border: 'none', background: 'none', cursor: 'pointer',
                color: '#ff4d4f', fontSize: 14, padding: '0 2px', flexShrink: 0,
                opacity: isDeleting ? 0.4 : 1,
              }}
            >
              <DeleteOutlined />
            </button>
          </Popconfirm>
        )}
      </div>

      {/* Галочка выбранной */}
      {isSelected && (
        <div style={{
          position: 'absolute', top: 6, right: 6,
          background: '#1677ff', borderRadius: '50%',
          width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CheckOutlined style={{ color: '#fff', fontSize: 11 }} />
        </div>
      )}
    </div>
  )
}
