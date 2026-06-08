import React from 'react'
import { Input, Button, Switch, Tooltip } from 'antd'
import { UndoOutlined, PlusOutlined, DeleteOutlined, HolderOutlined } from '@ant-design/icons'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Section, Field, TabWrap } from '../components/FormParts'

export const DEFAULT_BULLETS = [
  { id: 'b1', title: 'Срок поставки',     text: 'Срок поставки оборудования под заказ — 3 месяца с момента оплаты счета.',                                                                              decorated: false, color: 'default' },
  { id: 'b2', title: 'НДС',              text: 'Цены указаны с учётом НДС 22%.',                                                                                                                        decorated: false, color: 'default' },
  { id: 'b3', title: 'Гарантия',         text: 'Гарантийный срок на оборудование составляет 12 месяцев.',                                                                                               decorated: false, color: 'default' },
  { id: 'b4', title: 'Срок действия КП', text: 'Коммерческое предложение действительно при условии изменения курсов валют не более 3% от курсов, установленных ЦБ РФ на дату выставления КП.',       decorated: false, color: 'default' },
  { id: 'b5', title: 'Доставка',         text: 'Доставка в регионы осуществляется транспортной компанией.',                                                                                             decorated: false, color: 'default' },
]

export const COLOR_OPTIONS = [
  { key: 'default', label: 'Обычный',   bg: '#f0f0f0', fg: '#595959' },
  { key: 'accent',  label: 'Акцент',    bg: '#fff3e8', fg: '#c45d0e' },
  { key: 'cold',    label: 'Холодный',  bg: '#dbeafe', fg: '#1e40af' },
  { key: 'warn',    label: 'Внимание',  bg: '#fef9c3', fg: '#854d0e' },
  { key: 'danger',  label: 'Опасность', bg: '#fee2e2', fg: '#991b1b' },
]

const SITE_BY_COMPANY = { '2': 'arstel.com', '3': 'rondo-sound.ru' }

export default function SectionRondoDelivery({ data, onChange, companyId }) {
  const rd      = data.rondoDelivery || {}
  const set     = (key, val) => onChange({ ...data, rondoDelivery: { ...rd, [key]: val } })
  const bullets = rd.bullets || DEFAULT_BULLETS

  const setBullet = (id, field, val) =>
    set('bullets', bullets.map(b => b.id === id ? { ...b, [field]: val } : b))

  const deleteBullet = (id) =>
    set('bullets', bullets.filter(b => b.id !== id))

  const addBullet = () =>
    set('bullets', [...bullets, { id: `b${Date.now()}`, title: '', text: '', decorated: true, color: 'default' }])

  const onDragEnd = ({ source, destination }) => {
    if (!destination || destination.index === source.index) return
    const next = [...bullets]
    const [moved] = next.splice(source.index, 1)
    next.splice(destination.index, 0, moved)
    set('bullets', next)
  }

  // Менеджер
  const defaultName     = data.manager_name || ''
  const defaultContacts = [data.tel, data.email, SITE_BY_COMPANY[companyId] ?? ''].filter(Boolean).join('\n')
  const nameValue       = rd.byeName     ?? defaultName
  const contactsValue   = rd.byeContacts ?? defaultContacts
  const nameChanged     = rd.byeName     !== undefined && rd.byeName     !== defaultName
  const contactsChanged = rd.byeContacts !== undefined && rd.byeContacts !== defaultContacts

  return (
    <TabWrap>
      <Section
        title="Условия оплаты и поставки"
        description="Перетаскивайте, редактируйте, переключайте стиль"
      >
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="bullets">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}
                style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {bullets.map((bullet, index) => (
                  <Draggable key={bullet.id} draggableId={bullet.id} index={index}>
                    {(drag, snapshot) => {
                      const colorOpt = COLOR_OPTIONS.find(c => c.key === (bullet.color || 'default')) || COLOR_OPTIONS[0]
                      return (
                        <div
                          ref={drag.innerRef}
                          {...drag.draggableProps}
                          style={{
                            border: '1px solid #f0f0f0',
                            borderLeft: `3px solid ${bullet.decorated ? colorOpt.bg : '#e0e0e0'}`,
                            borderRadius: 6,
                            padding: '10px 12px',
                            background: snapshot.isDragging ? '#f0f7ff' : '#fff',
                            display: 'flex', flexDirection: 'column', gap: 6,
                            ...drag.draggableProps.style,
                          }}
                        >
                          {/* Строка: ручка + заголовок + свитч + удалить */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span {...drag.dragHandleProps}
                              style={{ cursor: 'grab', color: '#bfbfbf', fontSize: 16 }}>
                              <HolderOutlined />
                            </span>
                            <Input
                              placeholder="Заголовок пункта"
                              value={bullet.title}
                              onChange={e => setBullet(bullet.id, 'title', e.target.value)}
                              style={{ flex: 1, fontWeight: 600 }}
                              size="small"
                            />
                            <Tooltip title={bullet.decorated ? 'С фоном — убрать' : 'Без фона — добавить'}>
                              <Switch
                                size="small"
                                checked={bullet.decorated}
                                onChange={val => setBullet(bullet.id, 'decorated', val)}
                              />
                            </Tooltip>
                            <Button
                              size="small" type="text" danger
                              icon={<DeleteOutlined />}
                              onClick={() => deleteBullet(bullet.id)}
                            />
                          </div>

                          {/* Текст */}
                          <Input.TextArea
                            placeholder="Текст пункта"
                            autoSize={{ minRows: 2 }}
                            value={bullet.text}
                            onChange={e => setBullet(bullet.id, 'text', e.target.value)}
                            style={{ fontSize: 12 }}
                          />

                          {/* Палитра — только если decorated */}
                          {bullet.decorated && (
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                              {COLOR_OPTIONS.map(opt => (
                                <button
                                  key={opt.key}
                                  onClick={() => setBullet(bullet.id, 'color', opt.key)}
                                  style={{
                                    padding: '2px 8px',
                                    borderRadius: 4,
                                    border: `1.5px solid ${(bullet.color || 'default') === opt.key ? opt.fg : 'transparent'}`,
                                    background: opt.bg,
                                    color: opt.fg,
                                    fontSize: 11,
                                    fontWeight: (bullet.color || 'default') === opt.key ? 700 : 400,
                                    cursor: 'pointer',
                                  }}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    }}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginTop: 8 }}>
          <Button
            type="dashed" icon={<PlusOutlined />}
            onClick={addBullet}
            style={{ flex: 1 }}
          >
            Добавить пункт
          </Button>
          <Button
            icon={<UndoOutlined />}
            onClick={() => set('bullets', DEFAULT_BULLETS)}
            title="Сбросить к дефолтным 5 пунктам"
            size="small"
          />
        </div>
      </Section>

      {/* Менеджер */}
      <Section title="Блок менеджера" description="Контакты внизу раздела">
        <Field label="Заголовок">
          <Input value={rd.byeLabel || 'Ваш менеджер'} onChange={e => set('byeLabel', e.target.value)} />
        </Field>
        <Field label="Имя">
          <div style={{ display: 'flex', gap: 6 }}>
            <Input value={nameValue} placeholder="Петр Петров" onChange={e => set('byeName', e.target.value)} />
            {nameChanged && <Button size="small" icon={<UndoOutlined />} onClick={() => set('byeName', defaultName)} />}
          </div>
        </Field>
        <Field label="Контакты">
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
            <Input.TextArea autoSize={{ minRows: 3 }} value={contactsValue} onChange={e => set('byeContacts', e.target.value)} />
            {contactsChanged && <Button size="small" icon={<UndoOutlined />} onClick={() => set('byeContacts', defaultContacts)} style={{ flexShrink: 0 }} />}
          </div>
        </Field>
      </Section>
    </TabWrap>
  )
}
