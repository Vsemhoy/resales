// ─── Переиспользуемые части форм ──────────────────────────────────────────────

import React from 'react'

const sectionStyle = {
  marginBottom: 20,
}
const sectionHeadStyle = {
  marginBottom: 10,
}
const sectionTitleStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: '#262626',
  marginBottom: 2,
}
const sectionDescStyle = {
  fontSize: 12,
  color: '#8c8c8c',
}
const fieldStyle = {
  marginBottom: 12,
}
const fieldLabelStyle = {
  display: 'block',
  fontSize: 12,
  fontWeight: 500,
  color: '#595959',
  marginBottom: 4,
}
const fieldHintStyle = {
  fontSize: 11,
  color: '#bfbfbf',
  marginTop: 3,
}

export function Section({ title, description, children }) {
  return (
    <div style={sectionStyle}>
      <div style={sectionHeadStyle}>
        {title       && <div style={sectionTitleStyle}>{title}</div>}
        {description && <div style={sectionDescStyle}>{description}</div>}
      </div>
      <div>{children}</div>
    </div>
  )
}

export function Field({ label, hint, children }) {
  return (
    <div style={fieldStyle}>
      {label && <label style={fieldLabelStyle}>{label}</label>}
      {children}
      {hint  && <div style={fieldHintStyle}>{hint}</div>}
    </div>
  )
}

export function Grid2({ children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
      {children}
    </div>
  )
}

export function TabWrap({ children }) {
  return <div style={{ padding: '16px' }}>{children}</div>
}
