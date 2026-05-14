import React from 'react'
import { Input, Button } from 'antd'
import { UndoOutlined } from '@ant-design/icons'
import { Section, Field, TabWrap } from '../components/FormParts'

const DELIVERY_DEFAULTS = [
  'Коммерческое предложение действительно при условии изменения курсов валют не более 3% от курсов, установленных ЦБ РФ на дату выставления КП.',
  'Срок поставки оборудования под заказ - 3 месяца с момента оплаты счета.',
  'Гарантийный срок на оборудование составляет 12 месяцев.',
  'По условиям договора поставка осуществляется при 100% предоплате со склада в Санкт-Петербурге. Цены указаны с учетом НДС 22%.',
]

const SITE_BY_COMPANY = { '2': 'arstel.com', '3': 'rondo-sound.ru' }

export default function SectionRondoDelivery({ data, onChange, companyId }) {
  const rd      = data.rondoDelivery || {}
  const set     = (key, val) => onChange({ ...data, rondoDelivery: { ...rd, [key]: val } })
  const items   = rd.deliveryItems || DELIVERY_DEFAULTS
  const setItem = (i, val) => { const n = [...items]; n[i] = val; set('deliveryItems', n) }

  // Дефолты из cover-полей
  const defaultName     = data.manager_name  || ''
  const defaultContacts = [data.tel, data.email, SITE_BY_COMPANY[companyId] ?? ''].filter(Boolean).join('\n')

  // Текущие значения — если не трогали, показываем дефолт
  const nameValue     = rd.byeName     ?? defaultName
  const contactsValue = rd.byeContacts ?? defaultContacts

  const nameChanged     = rd.byeName     !== undefined && rd.byeName     !== defaultName
  const contactsChanged = rd.byeContacts !== undefined && rd.byeContacts !== defaultContacts

  return (
    <TabWrap>
      <Section title="Условия поставки" description="Четыре пункта — отображаются карточками">
        {items.map((item, i) => (
          <Field key={i} label={`Пункт ${i + 1}`}>
            <Input.TextArea autoSize={{ minRows: 2 }} maxLength={250} value={item} onChange={e => setItem(i, e.target.value)} />
          </Field>
        ))}
      </Section>

      <Section title="Финальная страница" description="Блок с контактами менеджера">
        <Field label="Заголовок блока">
          <Input value={rd.byeLabel || 'Ваш менеджер'} onChange={e => set('byeLabel', e.target.value)} />
        </Field>

        <Field label="Имя менеджера">
          <div style={{ display: 'flex', gap: 6 }}>
            <Input
              value={nameValue}
              placeholder="Петр Петров"
              onChange={e => set('byeName', e.target.value)}
            />
            {nameChanged && (
              <Button
                size="small"
                icon={<UndoOutlined />}
                title="Сбросить к manager_name с обложки"
                onClick={() => set('byeName', defaultName)}
              />
            )}
          </div>
          {!rd.byeName && defaultName && (
            <div style={{ fontSize: 11, color: '#bfbfbf', marginTop: 3 }}>
              Подставлено из обложки: «{defaultName}»
            </div>
          )}
        </Field>

        <Field label="Контакты">
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
            <Input.TextArea
              autoSize={{ minRows: 3 }}
              value={contactsValue}
              onChange={e => set('byeContacts', e.target.value)}
            />
            {contactsChanged && (
              <Button
                size="small"
                icon={<UndoOutlined />}
                title="Сбросить к tel + email + сайт"
                onClick={() => set('byeContacts', defaultContacts)}
                style={{ flexShrink: 0 }}
              />
            )}
          </div>
          {!rd.byeContacts && defaultContacts && (
            <div style={{ fontSize: 11, color: '#bfbfbf', marginTop: 3 }}>
              Собрано из обложки: тел + email + {SITE_BY_COMPANY[companyId]}
            </div>
          )}
        </Field>
      </Section>
    </TabWrap>
  )
}
