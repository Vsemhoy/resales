import React from 'react'
import { Input } from 'antd'
import { RichTextEditor } from '../components/RichTextEditor'
import { Section, Field, TabWrap } from '../components/FormParts'

const DELIVERY_DEFAULTS = [
  'Коммерческое предложение действительно при условии изменения курсов валют не более 3% от курсов, установленных ЦБ РФ на дату выставления КП.',
  'Срок поставки оборудования под заказ - 3 месяца с момента оплаты счета.',
  'Гарантийный срок на оборудование составляет 12 месяцев.',
  'По условиям договора поставка осуществляется при 100% предоплате со склада в Санкт-Петербурге. Цены указаны с учетом НДС 22%.',
]

export default function SectionRondoDelivery({ data, onChange, companyId }) {
  const accent  = companyId === '3' ? '#269435' : '#FF5903'
  const rd      = data.rondoDelivery || {}
  const set     = (key, val) => onChange({ ...data, rondoDelivery: { ...rd, [key]: val } })
  const items   = rd.deliveryItems || DELIVERY_DEFAULTS
  const setItem = (i, val) => { const n = [...items]; n[i] = val; set('deliveryItems', n) }

  return (
    <TabWrap>
      <Section title="Условия поставки" description="Четыре пункта — отображаются карточками">
        {items.map((item, i) => (
          <Field key={i} label={`Пункт ${i + 1}`}>
            <RichTextEditor value={item} onChange={val => setItem(i, val)} accent={accent} />
          </Field>
        ))}
      </Section>

      <Section title="Финальная страница" description="Блок с контактами менеджера">
        <Field label="Заголовок блока">
          <Input value={rd.byeLabel || 'Ваш менеджер'} onChange={e => set('byeLabel', e.target.value)} />
        </Field>
        <Field label="Имя менеджера">
          <Input placeholder="Петр Петров" value={rd.byeName || ''} onChange={e => set('byeName', e.target.value)} />
        </Field>
        <Field label="Контакты">
          <Input.TextArea
            placeholder={'+7 (812) 339-8972\nzakaz@rondo-sound.ru\nrondo-sound.ru'}
            autoSize={{ minRows: 3 }}
            value={rd.byeContacts || ''}
            onChange={e => set('byeContacts', e.target.value)}
          />
        </Field>
      </Section>
    </TabWrap>
  )
}
