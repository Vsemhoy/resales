import React, { useEffect, useState } from 'react'
import { Alert, Button, Checkbox, Input, Modal, Space, Spin, Tag } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { getPriceProperties } from './priceProperties.api'

const MASS_DIMENSION_IDS = new Set([
  108, 109, 137, 152, 155, 156, 173, 180, 192, 293, 344,
  403, 404, 405, 406, 408, 409, 410, 411, 433, 443, 455, 557, 593, 696,
])

export default function PricePropertiesExportDialog({ userId, modelCount, exporting, onClose, onExport }) {
  const storageKey = `price_export_property_ids_${userId ?? 'local'}`
  const [savedIds, setSavedIds] = useState(() => {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey))
      return Array.isArray(value) ? value : null
    } catch {
      return null
    }
  })
  const [properties, setProperties] = useState(null)
  const [error, setError] = useState(false)
  const [retry, setRetry] = useState(0)
  const [query, setQuery] = useState('')
  const [selectedOnly, setSelectedOnly] = useState(false)

  useEffect(() => {
    let active = true
    setProperties(null)
    setError(false)
    getPriceProperties()
      .then(items => { if (active) setProperties(items) })
      .catch(() => { if (active) setError(true) })
    return () => { active = false }
  }, [retry])

  const saveSelection = (ids) => {
    setSavedIds(ids)
    try {
      if (ids === null) localStorage.removeItem(storageKey)
      else localStorage.setItem(storageKey, JSON.stringify(ids))
    } catch {
      // Выбор остаётся рабочим и без доступного localStorage.
    }
  }
  const defaults = (properties ?? [])
    .filter(property => MASS_DIMENSION_IDS.has(Number(property.id)))
    .map(property => Number(property.id))
  const selectedIds = new Set(Array.isArray(savedIds) ? savedIds.map(Number) : defaults)
  const selected = (properties ?? []).filter(property => selectedIds.has(Number(property.id)))
  const search = query.trim().toLocaleLowerCase('ru-RU')
  const visible = (properties ?? []).filter(property =>
    (!selectedOnly || selectedIds.has(Number(property.id))) &&
    `${property.name} ${property.dimension ?? ''} ${property.id}`.toLocaleLowerCase('ru-RU').includes(search),
  )

  return (
    <Modal open title="Экспорт прайса со свойствами" width={700}
      okText="Скачать Excel" cancelText="Закрыть" confirmLoading={exporting}
      okButtonProps={{ disabled: !properties || !selected.length || !modelCount }}
      cancelButtonProps={{ disabled: exporting }}
      closable={!exporting} keyboard={!exporting} maskClosable={!exporting}
      onCancel={onClose} onOk={() => onExport(selected)}>
      <p>Выгрузятся выбранные товары ({modelCount}) с текущими ценами. Выберите дополнительные колонки со свойствами.</p>
      <Input allowClear prefix={<SearchOutlined />} placeholder="Найти свойство по названию или ID"
        value={query} onChange={event => setQuery(event.target.value)} />
      <Space wrap style={{ margin: '12px 0' }}>
        <Checkbox checked={selectedOnly} onChange={event => setSelectedOnly(event.target.checked)}>
          Только выбранные ({selected.length})
        </Checkbox>
        <Button size="small" disabled={!properties || exporting} onClick={() => saveSelection(null)}>Вернуть массогабаритные</Button>
        <Button size="small" disabled={!selected.length || exporting} onClick={() => saveSelection([])}>Снять все</Button>
      </Space>
      {error ? (
        <Alert type="error" message="Не удалось загрузить свойства"
          action={<Button size="small" onClick={() => setRetry(value => value + 1)}>Повторить</Button>} />
      ) : !properties ? (
        <div style={{ padding: 20, textAlign: 'center' }}><Spin /></div>
      ) : (
        <div style={{ maxHeight: 340, overflowY: 'auto', paddingRight: 8 }}>
          {!visible.length && <p>Свойства не найдены.</p>}
          {visible.map(property => {
            const id = Number(property.id)
            return (
              <div key={id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '6px 0', borderBottom: '1px #c7c7c7 dashed' }}>
                <Checkbox disabled={exporting} checked={selectedIds.has(id)} onChange={event => {
                  const next = new Set(selectedIds)
                  if (event.target.checked) next.add(id)
                  else next.delete(id)
                  saveSelection([...next])
                }}>
                  {property.name}{property.dimension ? `, ${property.dimension}` : ''}
                  <span style={{ color: '#6a8090' }}> #{id}</span>
                </Checkbox>
                {MASS_DIMENSION_IDS.has(id) && <Tag>Массогабаритное</Tag>}
              </div>
            )
          })}
        </div>
      )}
    </Modal>
  )
}
