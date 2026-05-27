import React, { useRef, useState } from 'react'
import { Drawer, Button, Spin, Popconfirm, Image } from 'antd'
import { PictureOutlined, DeleteOutlined, CheckOutlined, CloseOutlined, UploadOutlined } from '@ant-design/icons'
import { getCovers, putCover, deleteCover } from '../api/covers.api'
import { useEffect } from 'react'

// ─── Хук — один инстанс на весь пикер ───────────────────────────────────────
export function useCovers(companyId) {
  const [covers,  setCovers]  = useState([])
  const [loading, setLoading] = useState(false)

  const reload = () => {
    if (!companyId) return
    setLoading(true)
    getCovers(companyId)
      .then(data => setCovers(Array.isArray(data) ? data : []))
      .catch(() => setCovers([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { reload() }, [companyId])

  return { covers, loading, reload }
}

// ─── Дровер — получает covers снаружи, не хранит свой стейт ─────────────────
export function CoversDrawer({ open, onClose, selectedUrl, onSelect, companyId, type = 'cover', covers = [], onReload }) {
  const [uploading, setUploading] = useState(false)
  const [deleting,  setDeleting]  = useState(null)
  const inputRef = useRef(null)

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    try {
      await Promise.all(files.map(f => putCover(f, companyId, type)))
      onReload?.()
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDelete = async (filename) => {
    setDeleting(filename)
    try {
      await deleteCover(filename, companyId)
      if (selectedUrl?.includes(filename)) onSelect(null)
      onReload?.()
    } finally {
      setDeleting(null)
    }
  }

  const typeLabel = type === 'hat' ? 'шапок' : 'обложек'

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <PictureOutlined />
          <span>Менеджер {typeLabel}</span>
          <span style={{ fontSize: 12, color: '#8c8c8c', fontWeight: 400 }}>
            {covers.length} файлов
          </span>
        </div>
      }
      placement="right"
      width="100%"
      open={open}
      onClose={onClose}
      closable={false}
      extra={
        <Button icon={<CloseOutlined />} onClick={onClose}>
          Закрыть
        </Button>
      }
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleUpload}
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: 12,
      }}>
        {/* Без картинки */}
        <CoverCard
          label="Без картинки"
          isSelected={!selectedUrl}
          onClick={() => { onSelect(null); onClose() }}
        />

        {/* Обложки */}
        {covers.map(cover => (
          <CoverCard
            key={cover.filename}
            url={cover.url}
            label={cover.filename.replace(/^(cover|hat)_/, '')}
            isSelected={selectedUrl === cover.url}
            isDeleting={deleting === cover.filename}
            onClick={() => { onSelect(cover.url === selectedUrl ? null : cover.url); onClose() }}
            onDelete={() => handleDelete(cover.filename)}
          />
        ))}

        {/* Последний тайл — Загрузить */}
        <div
          onClick={() => inputRef.current?.click()}
          style={{
            border: '2px dashed #d9d9d9', borderRadius: 8, cursor: 'pointer',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 8, minHeight: 148,
            color: '#8c8c8c', background: '#fafafa', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#1677ff'; e.currentTarget.style.color = '#1677ff' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#d9d9d9'; e.currentTarget.style.color = '#8c8c8c' }}
        >
          {uploading ? <Spin /> : <>
            <UploadOutlined style={{ fontSize: 24 }} />
            <span style={{ fontSize: 12 }}>Загрузить</span>
          </>}
        </div>
      </div>
    </Drawer>
  )
}

// ─── Карточка ─────────────────────────────────────────────────────────────────
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
      <div style={{
        height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundImage: 'linear-gradient(45deg, #dbdbdb 25%, #F6F0CF 25%, #F6F0CF 50%, #dbdbdb 50%, #dbdbdb 75%, #F6F0CF 75%, #F6F0CF 100%)',
        backgroundSize: '15px 15px', overflow: 'hidden',
      }}>
        {url
          ? <Image src={url} alt={label}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              preview={{ mask: '🔍' }}
              onClick={e => e.stopPropagation()}
            />
          : <PictureOutlined style={{ fontSize: 32, color: '#bfbfbf' }} />
        }
      </div>
      <div style={{ padding: '6px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ flex: 1, fontSize: 11, color: '#595959', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {label}
        </span>
        {onDelete && (
          <Popconfirm title="Удалить?" okText="Да" cancelText="Нет"
            onConfirm={e => { e?.stopPropagation(); onDelete() }}
            onCancel={e => e?.stopPropagation()}
          >
            <button onClick={e => e.stopPropagation()} disabled={!!isDeleting}
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ff4d4f', fontSize: 14, padding: '0 2px', opacity: isDeleting ? 0.4 : 1 }}>
              <DeleteOutlined />
            </button>
          </Popconfirm>
        )}
      </div>
      {isSelected && (
        <div style={{ position: 'absolute', top: 6, right: 6, background: '#1677ff', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckOutlined style={{ color: '#fff', fontSize: 11 }} />
        </div>
      )}
    </div>
  )
}
