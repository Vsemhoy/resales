import React, { useState } from 'react'
import { Input } from 'antd'
import { ENGINEER_ROLES, MANAGER_ROLES } from '../useDraftStatus'

function formatTimestamp(iso) {
  if (!iso) return null
  const d = new Date(iso)
  if (isNaN(d.getTime())) return null
  const pad = n => String(n).padStart(2, '0')
  return `${pad(d.getDate())}.${pad(d.getMonth()+1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// notes: { noteEngineer, noteManager, noteEngineerAt, noteManagerAt }
// onChange(nextNotes)
export function SectionNotes({ notes, onChange, backcolor, userRole, flush = true }) {
  const [open, setOpen] = useState(false)
  const n = notes || {}

  const set = (key, val) => onChange({
    ...n,
    [key]:        val,
    [`${key}At`]: new Date().toISOString(),
  })

  const roleGroup = MANAGER_ROLES.includes(userRole) ? 'manager' : (ENGINEER_ROLES.includes(userRole) ? 'engineer' : null)
  const canEditEngNote = roleGroup === 'manager'
  const canEditManNote = roleGroup === 'engineer'

  const outerStyle = flush
    ? { marginTop: 16, background: `${backcolor + '46'}`, marginLeft: '-19px', width: 'calc(100% + 8px)', padding: '12px', border: '3px dashed white' }
    : { marginTop: 16, background: `${backcolor + '46'}`, width: '100%', padding: '12px', border: '3px dashed white' }

  return (
    <div style={outerStyle}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 'bold',
          color: '#525252', padding: 0, display: 'flex', alignItems: 'center', gap: 4,
          width: '100%', textAlign: 'left',
        }}
      >
        <span>{open ? '▾' : '▸'}</span>
        Служебные заметки
        {n.noteEngineer && (
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#ff7b00', display: 'inline-block', marginLeft: 4 }} />
        )}
        {n.noteManager && (
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#147ffa', display: 'inline-block', marginLeft: 4 }} />
        )}
      </button>

      {open && (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 1, padding: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#d48806', marginBottom: 6 }}>🔧 Сообщение инженеру</div>
            <Input.TextArea
              autoSize={{ minRows: 2 }}
              value={n.noteEngineer || ''}
              onChange={e => set('noteEngineer', e.target.value)}
              placeholder="Что сделать инженеру..."
              readOnly={!canEditEngNote}
              style={{ background: 'white', border: '1px solid #ffe58f', cursor: canEditEngNote ? 'text' : 'default' }}
            />
            {formatTimestamp(n.noteEngineerAt) && (
              <span style={{ marginTop: '6px', color: 'gray', display: 'block', fontSize: 11 }}>
                Последнее изменение: {formatTimestamp(n.noteEngineerAt)}
              </span>
            )}
          </div>

          <div style={{ background: '#e6f4ff', border: '1px solid #91caff', borderRadius: 1, padding: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#0958d9', marginBottom: 6 }}>📋 Сообщение менеджеру</div>
            <Input.TextArea
              autoSize={{ minRows: 2 }}
              value={n.noteManager || ''}
              onChange={e => set('noteManager', e.target.value)}
              placeholder="Что учесть менеджеру..."
              readOnly={!canEditManNote}
              style={{ background: 'white', border: '1px solid #91caff', cursor: canEditManNote ? 'text' : 'default' }}
            />
            {formatTimestamp(n.noteManagerAt) && (
              <span style={{ marginTop: '6px', color: 'gray', display: 'block', fontSize: 11 }}>
                Последнее изменение: {formatTimestamp(n.noteManagerAt)}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
