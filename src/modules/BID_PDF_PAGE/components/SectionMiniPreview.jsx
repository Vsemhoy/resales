import React from 'react'

// ─── Базовые примитивы ────────────────────────────────────────────────────────
const Bar  = ({ w = '100%', h = 3, o = 1, r = 2, style = {} }) => (
  <div style={{ width: w, height: h, borderRadius: r, background: 'currentColor', opacity: o, flexShrink: 0, ...style }} />
)
const Rect = ({ w, h, o = 0.15, r = 2, style = {} }) => (
  <div style={{ width: w, height: h, borderRadius: r, background: 'currentColor', opacity: o, flexShrink: 0, ...style }} />
)
const Row  = ({ gap = 2, children, style = {} }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap, ...style }}>{children}</div>
)
const Col  = ({ gap = 2, children, style = {} }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap, ...style }}>{children}</div>
)

// ─── Схемки по типу секции ────────────────────────────────────────────────────

function PreviewCover() {
  return (
    <Row style={{ height: '100%', gap: 3, padding: 4 }}>
      <Col gap={2} style={{ flex: 1.2 }}>
        <Bar w="60%" h={2} o={0.5} />
        <Bar w="90%" h={4} o={0.9} />
        <Bar w="75%" h={2} o={0.4} />
        <div style={{ flex: 1 }} />
        <Bar w="50%" h={2} o={0.35} />
        <Bar w="40%" h={2} o={0.35} />
      </Col>
      <Rect w={22} h="100%" o={0.12} r={2} />
    </Row>
  )
}

function PreviewToc() {
  return (
    <Col gap={2} style={{ padding: 4, justifyContent: 'center' }}>
      {[0.8, 0.5, 0.6, 0.5, 0.7].map((o, i) => (
        <Row key={i} gap={2}>
          <Bar w="55%" h={2} o={o} />
          <div style={{ flex: 1 }} />
          <Bar w={6} h={2} o={0.3} />
        </Row>
      ))}
    </Col>
  )
}

function PreviewFeatures() {
  return (
    <Col gap={3} style={{ padding: 4, justifyContent: 'center' }}>
      {[0.9, 0.7, 0.8].map((o, i) => (
        <Row key={i} gap={3} style={{ alignItems: 'flex-start' }}>
          <Rect w={8} h={8} o={0.2} r={1} />
          <Col gap={1} style={{ flex: 1 }}>
            <Bar w="90%" h={2} o={o} />
            <Bar w="60%" h={2} o={o * 0.5} />
          </Col>
        </Row>
      ))}
    </Col>
  )
}

function PreviewSelectEquipment() {
  return (
    <Col gap={3} style={{ padding: 4 }}>
      <Col gap={1}>
        <Bar w="80%" h={2} o={0.8} />
        <Bar w="95%" h={2} o={0.4} />
        <Bar w="70%" h={2} o={0.4} />
      </Col>
      <Row gap={3}>
        <Rect w={24} h={16} o={0.15} r={2} />
        <Rect w={24} h={16} o={0.15} r={2} />
      </Row>
    </Col>
  )
}

function PreviewAcoustic() {
  return (
    <Col gap={2} style={{ padding: 4 }}>
      <Row gap={2}>
        <Rect w={28} h={18} o={0.15} r={2} />
        <Col gap={1} style={{ flex: 1 }}>
          <Bar w="100%" h={2} o={0.7} />
          <Bar w="80%"  h={2} o={0.4} />
          <Bar w="90%"  h={2} o={0.4} />
        </Col>
      </Row>
      <Row gap={1}>
        {[0.6, 0.4, 0.7, 0.5, 0.6].map((o, i) => (
          <Rect key={i} w="18%" h={10} o={o * 0.25} r={1} />
        ))}
      </Row>
    </Col>
  )
}

function PreviewSpecifications() {
  const cols = ['10%', '38%', '14%', '14%', '14%']
  return (
    <Col gap={1} style={{ padding: 4, justifyContent: 'center' }}>
      {/* header */}
      <Row gap={1}>
        {cols.map((w, i) => <Rect key={i} w={w} h={3} o={0.5} r={1} style={{ flex: i === 1 ? 1 : undefined }} />)}
      </Row>
      {/* rows */}
      {[0.25, 0.15, 0.25, 0.15, 0.2].map((o, i) => (
        <Row key={i} gap={1} style={{ background: i % 2 === 1 ? 'rgba(0,0,0,0.04)' : 'transparent', borderRadius: 1 }}>
          {cols.map((w, j) => <Rect key={j} w={w} h={4} o={j === 0 ? 0.4 : o} r={1} style={{ flex: j === 1 ? 1 : undefined }} />)}
        </Row>
      ))}
      {/* total */}
      <Row gap={1}>
        {cols.map((w, i) => <Rect key={i} w={w} h={3} o={i > 2 ? 0.6 : 0.2} r={1} style={{ flex: i === 1 ? 1 : undefined }} />)}
      </Row>
    </Col>
  )
}

function PreviewRecommendations() {
  return (
    <Col gap={3} style={{ padding: 4, justifyContent: 'center' }}>
      {[1, 2].map(n => (
        <Col key={n} gap={1} style={{ background: 'rgba(0,0,0,0.05)', borderRadius: 2, padding: 3 }}>
          <Bar w="70%" h={2} o={0.8} />
          <Bar w="95%" h={2} o={0.35} />
          <Bar w="60%" h={2} o={0.35} />
        </Col>
      ))}
    </Col>
  )
}

function PreviewSpecials() {
  return (
    <Col gap={2} style={{ padding: 4, justifyContent: 'center' }}>
      {[0.9, 0.7, 0.8].map((o, i) => (
        <Row key={i} gap={2}>
          <Rect w={14} h={10} o={0.15} r={1} />
          <Col gap={1} style={{ flex: 1 }}>
            <Bar w="90%" h={2} o={o} />
            <Bar w="60%" h={2} o={o * 0.5} />
          </Col>
        </Row>
      ))}
    </Col>
  )
}

function PreviewRondoDelivery() {
  return (
    <Col gap={2} style={{ padding: 4, justifyContent: 'center' }}>
      <Row gap={2}>
        {[1, 2, 3, 4].map(i => (
          <Col key={i} gap={1} style={{ flex: 1, background: 'rgba(0,0,0,0.06)', borderRadius: 2, padding: 3 }}>
            <Bar w="80%" h={2} o={0.7} />
            <Bar w="95%" h={2} o={0.3} />
            <Bar w="60%" h={2} o={0.3} />
          </Col>
        ))}
      </Row>
      <Row gap={2} style={{ justifyContent: 'center' }}>
        <Rect w={20} h={14} o={0.12} r={10} />
        <Col gap={1}>
          <Bar w={32} h={2} o={0.7} />
          <Bar w={24} h={2} o={0.35} />
        </Col>
      </Row>
    </Col>
  )
}

// ─── Заглушка для неизвестных ─────────────────────────────────────────────────
function PreviewDefault() {
  return (
    <Col gap={2} style={{ padding: 4, justifyContent: 'center' }}>
      <Bar w="80%" h={2} o={0.6} />
      <Bar w="60%" h={2} o={0.35} />
      <Bar w="70%" h={2} o={0.35} />
    </Col>
  )
}

const PREVIEW_MAP = {
  cover:           PreviewCover,
  toc:             PreviewToc,
  features:        PreviewFeatures,
  selectEquipment: PreviewSelectEquipment,
  acoustic:        PreviewAcoustic,
  specifications:  PreviewSpecifications,
  recommendations: PreviewRecommendations,
  specials:        PreviewSpecials,
  rondoDelivery:   PreviewRondoDelivery,
}

// ─── Экспортируемый компонент ─────────────────────────────────────────────────
// accent — цвет бренда, isActive — подсвечен ли блок
export function SectionMiniPreview({ sectionKey, accent = '#888', isActive = false }) {
  const Preview = PREVIEW_MAP[sectionKey] ?? PreviewDefault
  const color   = isActive ? accent : '#94a3b8'

  return (
    <div style={{
      width: '100%', height: '100%',
      color,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <Preview />
    </div>
  )
}
