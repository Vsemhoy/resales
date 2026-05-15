import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Spin } from 'antd'
import { getDrafts, createDraft } from './api'

// Маршрут: /bidsPDF/:bidId
// Ищет последний драфт для этого бида — если есть, редиректит на него.
// Если нет — создаёт новый и редиректит.
export default function BidPdfPage() {
  const { bidId }  = useParams()
  const navigate   = useNavigate()
  const [error, setError] = useState(null)

  useEffect(() => {
    getDrafts({ bid_id: bidId })
      .then(data => {
        const list = Array.isArray(data) ? data : (data.data ?? [])

        if (list.length > 0) {
          const latest = list[list.length - 1]
          navigate(`/bidsPDF/${bidId}/${latest.id}`, { replace: true })
        } else {
          return createDraft({
            bidId:    Number(bidId),
            kpType:   'arstel-broadcast',   // дефолт — потом меняется в редакторе
            currency: { label: '₽', value: '3' },
          }).then(draft => {
            navigate(`/bidsPDF/${bidId}/${draft.id}`, { replace: true })
          })
        }
      })
      .catch(() => setError('Не удалось открыть КП — проверьте соединение'))
  }, [bidId])

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#ff4d4f', fontSize: 14 }}>
        {error}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 12 }}>
      <Spin size="large" />
      <span style={{ color: '#8c8c8c', fontSize: 13 }}>Открываем КП...</span>
    </div>
  )
}
