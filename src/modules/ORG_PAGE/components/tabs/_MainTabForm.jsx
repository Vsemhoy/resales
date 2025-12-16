// Пример полной реализации MainTabForm на antd Form
// Файл: modules/TORG_PAGE/components/tabs/MainTabForm.jsx

import React, { useEffect, useState, useCallback } from 'react';
import { 
  Form, 
  Input, 
  Select, 
  Collapse, 
  Badge, 
  Button, 
  Empty, 
  Spin,
  Checkbox,
  Divider 
} from 'antd';
import { 
  PlusCircleOutlined, 
  DeleteOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  UserOutlined
} from '@ant-design/icons';
import { debounce } from 'lodash';
import dayjs from 'dayjs';

const { Panel } = Collapse;
const { TextArea } = Input;

// ============================================================================
// ХУКИ
// ============================================================================

/**
 * Хук для загрузки опций с сервера (автозаполнение)
 */
const useServerOptions = (fetchFn, deps = []) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(
    debounce(async (value) => {
      if (!value || value.length < 2) {
        setOptions([]);
        return;
      }
      setLoading(true);
      try {
        const result = await fetchFn(value);
        setOptions(result);
      } catch (e) {
        console.error(e);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    deps
  );

  return { options, loading, search, setOptions };
};

// ============================================================================
// ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ
// ============================================================================

/**
 * Компонент для элемента телефона
 */
const PhoneItem = ({ name, restField, editMode, onRemove, onChange }) => (
  <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
    <Form.Item
      {...restField}
      name={[name, 'number']}
      style={{ flex: 2, marginBottom: 0 }}
      rules={[{ pattern: /^[\d\+\-\(\)\s]+$/, message: 'Некорректный формат' }]}
    >
      <Input 
        placeholder="Номер телефона"
        onChange={onChange}
        disabled={!editMode}
      />
    </Form.Item>
    
    <Form.Item
      {...restField}
      name={[name, 'ext']}
      style={{ flex: 1, marginBottom: 0 }}
    >
      <Input 
        placeholder="Доб."
        onChange={onChange}
        disabled={!editMode}
      />
    </Form.Item>
    
    <Form.Item
      {...restField}
      name={[name, 'comment']}
      style={{ flex: 2, marginBottom: 0 }}
    >
      <Input 
        placeholder="Комментарий"
        onChange={onChange}
        disabled={!editMode}
      />
    </Form.Item>
    
    {editMode && (
      <Button
        danger
        icon={<DeleteOutlined />}
        onClick={onRemove}
      />
    )}
  </div>
);

/**
 * Компонент для элемента email
 */
const EmailItem = ({ name, restField, editMode, onRemove, onChange }) => (
  <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
    <Form.Item
      {...restField}
      name={[name, 'email']}
      style={{ flex: 2, marginBottom: 0 }}
      rules={[{ type: 'email', message: 'Некорректный email' }]}
    >
      <Input 
        placeholder="Email"
        onChange={onChange}
        disabled={!editMode}
      />
    </Form.Item>
    
    <Form.Item
      {...restField}
      name={[name, 'comment']}
      style={{ flex: 2, marginBottom: 0 }}
    >
      <Input 
        placeholder="Комментарий"
        onChange={onChange}
        disabled={!editMode}
      />
    </Form.Item>
    
    {editMode && (
      <Button
        danger
        icon={<DeleteOutlined />}
        onClick={onRemove}
      />
    )}
  </div>
);

/**
 * Компонент для элемента адреса
 */
const AddressItem = ({ name, restField, editMode, onRemove, onChange, showPostIndex = true }) => (
  <div style={{ marginBottom: 16, padding: 12, background: '#fafafa', borderRadius: 4 }}>
    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
      <Form.Item
        {...restField}
        name={[name, 'address']}
        style={{ flex: 3, marginBottom: 0 }}
      >
        <Input 
          placeholder="Адрес"
          onChange={onChange}
          disabled={!editMode}
        />
      </Form.Item>
      
      {showPostIndex && (
        <Form.Item
          {...restField}
          name={[name, 'post_index']}
          style={{ flex: 1, marginBottom: 0 }}
        >
          <Input 
            placeholder="Индекс"
            onChange={onChange}
            disabled={!editMode}
          />
        </Form.Item>
      )}
      
      {editMode && (
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={onRemove}
        />
      )}
    </div>
    
    <Form.Item
      {...restField}
      name={[name, 'comment']}
      style={{ marginBottom: 0 }}
    >
      <Input 
        placeholder="Комментарий к адресу"
        onChange={onChange}
        disabled={!editMode}
      />
    </Form.Item>
  </div>
);

// ============================================================================
// КОМПОНЕНТ КОНТАКТА
// ============================================================================

const ContactItem = ({ name, restField, form, editMode, selects, onRemove }) => {
  const [expanded, setExpanded] = useState(true);
  
  const contactData = Form.useWatch(['contacts', name], form) || {};
  const isDeleted = contactData.deleted === 1;
  
  // Помечаем контакт как изменённый
  const markModified = useCallback(() => {
    const contact = form.getFieldValue(['contacts', name]);
    if (contact && !String(contact.id).startsWith('new_')) {
      if (contact.command !== 'create' && contact.command !== 'delete') {
        form.setFieldValue(['contacts', name, 'command'], 'update');
      }
    }
    form.setFieldValue(['contacts', name, '_modified'], true);
  }, [form, name]);
  
  // Обработчик удаления вложенного элемента
  const handleNestedRemove = useCallback((fieldPath, index, remove) => {
    const items = form.getFieldValue(fieldPath);
    const item = items?.[index];
    
    if (!item) return;
    
    if (String(item.id).startsWith('new_')) {
      remove(index);
    } else {
      form.setFieldValue([...fieldPath, index, 'deleted'], 1);
      form.setFieldValue([...fieldPath, index, 'command'], 'delete');
      form.setFieldValue([...fieldPath, index, '_modified'], true);
    }
    markModified();
  }, [form, markModified]);
  
  // Добавление нового вложенного элемента
  const handleNestedAdd = useCallback((add, template) => {
    add({
      id: `new_${dayjs().unix()}_${Math.random().toString(36).substr(2, 9)}`,
      ...template,
      command: 'create',
      _modified: true,
    });
    markModified();
  }, [markModified]);

  if (isDeleted) {
    return null;
  }

  const fullName = [
    contactData.lastname,
    contactData.name,
    contactData.middlename
  ].filter(Boolean).join(' ') || 'Новый контакт';

  return (
    <Collapse 
      activeKey={expanded ? ['contact'] : []}
      onChange={() => setExpanded(!expanded)}
      style={{ marginBottom: 16 }}
    >
      <Panel
        header={
          <span>
            <UserOutlined style={{ marginRight: 8 }} />
            {fullName}
            {contactData.occupy && (
              <span style={{ color: '#888', marginLeft: 8 }}>
                — {contactData.occupy}
              </span>
            )}
          </span>
        }
        key="contact"
        extra={
          editMode && (
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              Удалить
            </Button>
          )
        }
      >
        {/* ФИО */}
        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item
            {...restField}
            name={[name, 'lastname']}
            label="Фамилия"
            style={{ flex: 1 }}
          >
            <Input onChange={markModified} disabled={!editMode} />
          </Form.Item>
          
          <Form.Item
            {...restField}
            name={[name, 'name']}
            label="Имя"
            style={{ flex: 1 }}
          >
            <Input onChange={markModified} disabled={!editMode} />
          </Form.Item>
          
          <Form.Item
            {...restField}
            name={[name, 'middlename']}
            label="Отчество"
            style={{ flex: 1 }}
          >
            <Input onChange={markModified} disabled={!editMode} />
          </Form.Item>
        </div>

        {/* Должность */}
        <Form.Item
          {...restField}
          name={[name, 'occupy']}
          label="Должность"
        >
          <Input onChange={markModified} disabled={!editMode} />
        </Form.Item>

        {/* Комментарий */}
        <Form.Item
          {...restField}
          name={[name, 'comment']}
          label="Комментарий"
        >
          <TextArea 
            autoSize={{ minRows: 1, maxRows: 4 }} 
            onChange={markModified}
            disabled={!editMode}
          />
        </Form.Item>

        {/* Чекбоксы */}
        <div style={{ display: 'flex', gap: 24 }}>
          <Form.Item
            {...restField}
            name={[name, 'unsubscribe']}
            valuePropName="checked"
            getValueFromEvent={(e) => e.target.checked ? 1 : 0}
            getValueProps={(value) => ({ checked: value === 1 })}
          >
            <Checkbox onChange={markModified} disabled={!editMode}>
              Отписан от рассылки
            </Checkbox>
          </Form.Item>
          
          <Form.Item
            {...restField}
            name={[name, 'job']}
            valuePropName="checked"
            getValueFromEvent={(e) => e.target.checked ? 1 : 0}
            getValueProps={(value) => ({ checked: value === 1 })}
          >
            <Checkbox onChange={markModified} disabled={!editMode}>
              Работает
            </Checkbox>
          </Form.Item>
        </div>

        <Divider orientation="left">Контактные данные</Divider>

        {/* Рабочие телефоны */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span><PhoneOutlined /> Рабочие телефоны</span>
            {editMode && (
              <Button
                size="small"
                icon={<PlusCircleOutlined />}
                onClick={() => {
                  const phones = form.getFieldValue(['contacts', name, 'contactstelephones']) || [];
                  form.setFieldValue(
                    ['contacts', name, 'contactstelephones'],
                    [...phones, {
                      id: `new_${dayjs().unix()}_${phones.length}`,
                      number: '',
                      ext: '',
                      comment: '',
                      command: 'create',
                      _modified: true,
                    }]
                  );
                  markModified();
                }}
              >
                Добавить
              </Button>
            )}
          </div>
          
          <Form.List name={[name, 'contactstelephones']}>
            {(fields, { remove }) => (
              <>
                {fields.length === 0 ? (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Нет телефонов" />
                ) : (
                  fields.map(({ key, name: phoneName, ...phoneRestField }) => {
                    const phone = form.getFieldValue(['contacts', name, 'contactstelephones', phoneName]);
                    if (phone?.deleted === 1) return null;
                    
                    return (
                      <PhoneItem
                        key={key}
                        name={phoneName}
                        restField={phoneRestField}
                        editMode={editMode}
                        onChange={markModified}
                        onRemove={() => handleNestedRemove(
                          ['contacts', name, 'contactstelephones'],
                          phoneName,
                          remove
                        )}
                      />
                    );
                  })
                )}
              </>
            )}
          </Form.List>
        </div>

        {/* Мобильные телефоны */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span><PhoneOutlined /> Мобильные телефоны</span>
            {editMode && (
              <Button
                size="small"
                icon={<PlusCircleOutlined />}
                onClick={() => {
                  const mobiles = form.getFieldValue(['contacts', name, 'contactmobiles']) || [];
                  form.setFieldValue(
                    ['contacts', name, 'contactmobiles'],
                    [...mobiles, {
                      id: `new_${dayjs().unix()}_${mobiles.length}`,
                      number: '',
                      comment: '',
                      command: 'create',
                      _modified: true,
                    }]
                  );
                  markModified();
                }}
              >
                Добавить
              </Button>
            )}
          </div>
          
          <Form.List name={[name, 'contactmobiles']}>
            {(fields, { remove }) => (
              <>
                {fields.length === 0 ? (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Нет мобильных" />
                ) : (
                  fields.map(({ key, name: mobileName, ...mobileRestField }) => {
                    const mobile = form.getFieldValue(['contacts', name, 'contactmobiles', mobileName]);
                    if (mobile?.deleted === 1) return null;
                    
                    return (
                      <PhoneItem
                        key={key}
                        name={mobileName}
                        restField={mobileRestField}
                        editMode={editMode}
                        onChange={markModified}
                        onRemove={() => handleNestedRemove(
                          ['contacts', name, 'contactmobiles'],
                          mobileName,
                          remove
                        )}
                      />
                    );
                  })
                )}
              </>
            )}
          </Form.List>
        </div>

        {/* Email */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span><MailOutlined /> Email адреса</span>
            {editMode && (
              <Button
                size="small"
                icon={<PlusCircleOutlined />}
                onClick={() => {
                  const emails = form.getFieldValue(['contacts', name, 'contactemails']) || [];
                  form.setFieldValue(
                    ['contacts', name, 'contactemails'],
                    [...emails, {
                      id: `new_${dayjs().unix()}_${emails.length}`,
                      email: '',
                      comment: '',
                      command: 'create',
                      _modified: true,
                    }]
                  );
                  markModified();
                }}
              >
                Добавить
              </Button>
            )}
          </div>
          
          <Form.List name={[name, 'contactemails']}>
            {(fields, { remove }) => (
              <>
                {fields.length === 0 ? (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Нет email" />
                ) : (
                  fields.map(({ key, name: emailName, ...emailRestField }) => {
                    const email = form.getFieldValue(['contacts', name, 'contactemails', emailName]);
                    if (email?.deleted === 1) return null;
                    
                    return (
                      <EmailItem
                        key={key}
                        name={emailName}
                        restField={emailRestField}
                        editMode={editMode}
                        onChange={markModified}
                        onRemove={() => handleNestedRemove(
                          ['contacts', name, 'contactemails'],
                          emailName,
                          remove
                        )}
                      />
                    );
                  })
                )}
              </>
            )}
          </Form.List>
        </div>

      </Panel>
    </Collapse>
  );
};

// ============================================================================
// ГЛАВНЫЙ КОМПОНЕНТ ФОРМЫ
// ============================================================================

const MainTabForm = ({ form, editMode, initialData, selects, orgId }) => {
  const [activeKeys, setActiveKeys] = useState(['main', 'info', 'contacts']);
  
  // Установка начальных значений
  useEffect(() => {
    if (initialData && form) {
      form.setFieldsValue({
        // Основные поля
        name: initialData.name || '',
        middlename: initialData.middlename || '',
        id8an_fs: initialData.id8an_fs,
        id8an_profiles: initialData.id8an_profiles,
        inn: initialData.inn || '',
        source: initialData.source || '',
        comment: initialData.comment || '',
        commentinlist: initialData.commentinlist || '',
        kindofactivity: initialData.kindofactivity || '',
        site: initialData.site || '',
        profsound: initialData.profsound,
        
        // Массивы
        contacts: (initialData.contacts || []).map(c => ({
          ...c,
          _modified: false,
        })),
        phones: (initialData.phones || []).map(p => ({
          ...p,
          _modified: false,
        })),
        addresses: (initialData.address || []).map(a => ({
          ...a,
          _modified: false,
        })),
        legalAddresses: (initialData.legaladdresses || []).map(a => ({
          ...a,
          _modified: false,
        })),
        emails: (initialData.emails || []).map(e => ({
          ...e,
          _modified: false,
        })),
        requisites: (initialData.requisites || []).map(r => ({
          ...r,
          _modified: false,
        })),
        anLicenses: (initialData.active_licenses || []).map(l => ({
          ...l,
          _modified: false,
        })),
        anTolerances: (initialData.active_tolerance || []).map(t => ({
          ...t,
          _modified: false,
        })),
        boLicenses: (initialData.active_licenses_bo || []).map(l => ({
          ...l,
          _modified: false,
        })),
      });
    }
  }, [initialData, form]);

  // Обработчик удаления элемента из списка
  const handleListItemRemove = useCallback((fieldPath, index, remove) => {
    const items = form.getFieldValue(fieldPath);
    const item = items?.[index];
    
    if (!item) return;
    
    if (String(item.id).startsWith('new_')) {
      remove(index);
    } else {
      form.setFieldValue([fieldPath, index, 'deleted'], 1);
      form.setFieldValue([fieldPath, index, 'command'], 'delete');
      form.setFieldValue([fieldPath, index, '_modified'], true);
    }
  }, [form]);

  // Обработчик добавления элемента в список
  const handleListItemAdd = useCallback((add, template, fieldName) => {
    const items = form.getFieldValue(fieldName) || [];
    add({
      id: `new_${dayjs().unix()}_${items.length}`,
      ...template,
      command: 'create',
      _modified: true,
    });
  }, [form]);

  // Счётчики для бейджей
  const contactsCount = Form.useWatch('contacts', form)?.filter(c => c?.deleted !== 1).length || 0;
  const requisitesCount = Form.useWatch('requisites', form)?.filter(r => r?.deleted !== 1).length || 0;

  return (
    <Form
      form={form}
      name="mainForm"
      layout="vertical"
      disabled={!editMode}
      preserve={true}
    >
      <Collapse 
        activeKey={activeKeys} 
        onChange={setActiveKeys}
        style={{ marginBottom: 24 }}
      >
        
        {/* ============ ОСНОВНАЯ ИНФОРМАЦИЯ ============ */}
        <Panel header="Основная информация" key="main">
          <Form.Item
            name="name"
            label="Название организации"
            rules={[{ required: true, message: 'Введите название организации' }]}
          >
            <Input maxLength={550} placeholder="ООО Компания" />
          </Form.Item>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="id8an_fs"
              label="Форма собственности"
              style={{ flex: 1 }}
            >
              <Select
                showSearch
                allowClear
                optionFilterProp="label"
                placeholder="Выберите форму"
                options={selects?.fss?.map(item => ({
                  value: parseInt(item.id),
                  label: item.name,
                }))}
              />
            </Form.Item>

            <Form.Item 
              name="inn" 
              label="ИНН" 
              style={{ flex: 1 }}
              rules={[
                { pattern: /^\d{10,12}$/, message: 'ИНН должен содержать 10-12 цифр' }
              ]}
            >
              <Input maxLength={12} placeholder="1234567890" />
            </Form.Item>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="id8an_profiles"
              label="Профиль"
              style={{ flex: 1 }}
            >
              <Select
                showSearch
                allowClear
                optionFilterProp="label"
                placeholder="Выберите профиль"
                options={selects?.profiles?.map(item => ({
                  value: item.key || item.id,
                  label: item.label || item.name,
                }))}
              />
            </Form.Item>

            <Form.Item 
              name="profsound" 
              label="Профзвук" 
              style={{ flex: 1 }}
            >
              <Select
                allowClear
                placeholder="Выберите"
                options={selects?.profsound?.map(item => ({
                  value: item.key || item.id,
                  label: item.label || item.name,
                }))}
              />
            </Form.Item>
          </div>

          <Form.Item name="source" label="Источник">
            <Input maxLength={550} placeholder="Откуда узнали о компании" />
          </Form.Item>

          <Form.Item name="site" label="Сайт">
            <Input maxLength={550} placeholder="https://example.com" />
          </Form.Item>

          <Form.Item name="comment" label="Комментарий">
            <TextArea 
              autoSize={{ minRows: 2, maxRows: 6 }} 
              maxLength={5000}
              placeholder="Дополнительная информация"
            />
          </Form.Item>

          <Form.Item name="commentinlist" label="Памятка">
            <Input maxLength={5550} placeholder="Краткая памятка" />
          </Form.Item>
        </Panel>

        {/* ============ КОНТАКТНАЯ ИНФОРМАЦИЯ ============ */}
        <Panel header="Контактная информация организации" key="info">
          
          {/* Телефоны организации */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontWeight: 500 }}>
                <PhoneOutlined style={{ marginRight: 8 }} />
                Телефоны организации
              </span>
              {editMode && (
                <Button
                  size="small"
                  icon={<PlusCircleOutlined />}
                  onClick={() => {
                    const phones = form.getFieldValue('phones') || [];
                    form.setFieldValue('phones', [
                      ...phones,
                      {
                        id: `new_${dayjs().unix()}_${phones.length}`,
                        number: '',
                        ext: '',
                        comment: '',
                        id_orgs: orgId,
                        command: 'create',
                        _modified: true,
                      }
                    ]);
                  }}
                >
                  Добавить телефон
                </Button>
              )}
            </div>
            
            <Form.List name="phones">
              {(fields, { remove }) => (
                <>
                  {fields.length === 0 ? (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Нет телефонов" />
                  ) : (
                    fields.map(({ key, name, ...restField }) => {
                      const phone = form.getFieldValue(['phones', name]);
                      if (phone?.deleted === 1) return null;
                      
                      return (
                        <PhoneItem
                          key={key}
                          name={name}
                          restField={restField}
                          editMode={editMode}
                          onChange={() => {
                            const p = form.getFieldValue(['phones', name]);
                            if (p && !String(p.id).startsWith('new_')) {
                              form.setFieldValue(['phones', name, 'command'], 'update');
                            }
                            form.setFieldValue(['phones', name, '_modified'], true);
                          }}
                          onRemove={() => handleListItemRemove('phones', name, remove)}
                        />
                      );
                    })
                  )}
                </>
              )}
            </Form.List>
          </div>

          <Divider />

          {/* Фактические адреса */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontWeight: 500 }}>
                <HomeOutlined style={{ marginRight: 8 }} />
                Фактические адреса
              </span>
              {editMode && (
                <Button
                  size="small"
                  icon={<PlusCircleOutlined />}
                  onClick={() => {
                    const addresses = form.getFieldValue('addresses') || [];
                    form.setFieldValue('addresses', [
                      ...addresses,
                      {
                        id: `new_${dayjs().unix()}_${addresses.length}`,
                        address: '',
                        post_index: '',
                        comment: '',
                        id_orgs: orgId,
                        command: 'create',
                        _modified: true,
                      }
                    ]);
                  }}
                >
                  Добавить адрес
                </Button>
              )}
            </div>
            
            <Form.List name="addresses">
              {(fields, { remove }) => (
                <>
                  {fields.length === 0 ? (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Нет адресов" />
                  ) : (
                    fields.map(({ key, name, ...restField }) => {
                      const address = form.getFieldValue(['addresses', name]);
                      if (address?.deleted === 1) return null;
                      
                      return (
                        <AddressItem
                          key={key}
                          name={name}
                          restField={restField}
                          editMode={editMode}
                          onChange={() => {
                            const a = form.getFieldValue(['addresses', name]);
                            if (a && !String(a.id).startsWith('new_')) {
                              form.setFieldValue(['addresses', name, 'command'], 'update');
                            }
                            form.setFieldValue(['addresses', name, '_modified'], true);
                          }}
                          onRemove={() => handleListItemRemove('addresses', name, remove)}
                        />
                      );
                    })
                  )}
                </>
              )}
            </Form.List>
          </div>

          <Divider />

          {/* Юридические адреса */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontWeight: 500 }}>
                <HomeOutlined style={{ marginRight: 8 }} />
                Юридические адреса
              </span>
              {editMode && (
                <Button
                  size="small"
                  icon={<PlusCircleOutlined />}
                  onClick={() => {
                    const legalAddresses = form.getFieldValue('legalAddresses') || [];
                    form.setFieldValue('legalAddresses', [
                      ...legalAddresses,
                      {
                        id: `new_${dayjs().unix()}_${legalAddresses.length}`,
                        address: '',
                        post_index: '',
                        comment: '',
                        id_orgs: orgId,
                        command: 'create',
                        _modified: true,
                      }
                    ]);
                  }}
                >
                  Добавить адрес
                </Button>
              )}
            </div>
            
            <Form.List name="legalAddresses">
              {(fields, { remove }) => (
                <>
                  {fields.length === 0 ? (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Нет юридических адресов" />
                  ) : (
                    fields.map(({ key, name, ...restField }) => {
                      const address = form.getFieldValue(['legalAddresses', name]);
                      if (address?.deleted === 1) return null;
                      
                      return (
                        <AddressItem
                          key={key}
                          name={name}
                          restField={restField}
                          editMode={editMode}
                          onChange={() => {
                            const a = form.getFieldValue(['legalAddresses', name]);
                            if (a && !String(a.id).startsWith('new_')) {
                              form.setFieldValue(['legalAddresses', name, 'command'], 'update');
                            }
                            form.setFieldValue(['legalAddresses', name, '_modified'], true);
                          }}
                          onRemove={() => handleListItemRemove('legalAddresses', name, remove)}
                        />
                      );
                    })
                  )}
                </>
              )}
            </Form.List>
          </div>

          <Divider />

          {/* Email адреса организации */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontWeight: 500 }}>
                <MailOutlined style={{ marginRight: 8 }} />
                Email адреса
              </span>
              {editMode && (
                <Button
                  size="small"
                  icon={<PlusCircleOutlined />}
                  onClick={() => {
                    const emails = form.getFieldValue('emails') || [];
                    form.setFieldValue('emails', [
                      ...emails,
                      {
                        id: `new_${dayjs().unix()}_${emails.length}`,
                        email: '',
                        comment: '',
                        id_orgs: orgId,
                        command: 'create',
                        _modified: true,
                      }
                    ]);
                  }}
                >
                  Добавить email
                </Button>
              )}
            </div>
            
            <Form.List name="emails">
              {(fields, { remove }) => (
                <>
                  {fields.length === 0 ? (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Нет email адресов" />
                  ) : (
                    fields.map(({ key, name, ...restField }) => {
                      const email = form.getFieldValue(['emails', name]);
                      if (email?.deleted === 1) return null;
                      
                      return (
                        <EmailItem
                          key={key}
                          name={name}
                          restField={restField}
                          editMode={editMode}
                          onChange={() => {
                            const e = form.getFieldValue(['emails', name]);
                            if (e && !String(e.id).startsWith('new_')) {
                              form.setFieldValue(['emails', name, 'command'], 'update');
                            }
                            form.setFieldValue(['emails', name, '_modified'], true);
                          }}
                          onRemove={() => handleListItemRemove('emails', name, remove)}
                        />
                      );
                    })
                  )}
                </>
              )}
            </Form.List>
          </div>
        </Panel>

        {/* ============ КОНТАКТНЫЕ ЛИЦА ============ */}
        <Panel 
          header={
            <span>
              <UserOutlined style={{ marginRight: 8 }} />
              Контактные лица
              <Badge 
                count={contactsCount} 
                style={{ marginLeft: 8 }}
                showZero
              />
            </span>
          } 
          key="contacts"
        >
          {editMode && (
            <Button
              style={{ marginBottom: 16 }}
              icon={<PlusCircleOutlined />}
              onClick={() => {
                const contacts = form.getFieldValue('contacts') || [];
                form.setFieldValue('contacts', [
                  {
                    id: `new_${dayjs().unix()}_${contacts.length}`,
                    id_orgs: orgId,
                    lastname: '',
                    name: '',
                    middlename: '',
                    occupy: '',
                    comment: '',
                    job: 1,
                    unsubscribe: 0,
                    deleted: 0,
                    exittoorg_id: null,
                    contactstelephones: [],
                    contactmobiles: [],
                    contacthomephones: [],
                    contactemails: [],
                    contactmessangers: [],
                    command: 'create',
                    _modified: true,
                  },
                  ...contacts,
                ]);
              }}
            >
              Добавить контакт
            </Button>
          )}
          
          <Form.List name="contacts">
            {(fields, { remove }) => (
              <>
                {fields.length === 0 ? (
                  <Empty description="Нет контактных лиц" />
                ) : (
                  fields.map(({ key, name, ...restField }) => {
                    const contact = form.getFieldValue(['contacts', name]);
                    if (contact?.deleted === 1) return null;
                    
                    return (
                      <ContactItem
                        key={key}
                        name={name}
                        restField={restField}
                        form={form}
                        editMode={editMode}
                        selects={selects}
                        onRemove={() => handleListItemRemove('contacts', name, remove)}
                      />
                    );
                  })
                )}
              </>
            )}
          </Form.List>
        </Panel>

        {/* ============ РЕКВИЗИТЫ/ПЛАТЕЛЬЩИКИ ============ */}
        <Panel 
          header={
            <span>
              Фирмы/плательщики
              <Badge 
                count={requisitesCount} 
                style={{ marginLeft: 8 }}
                showZero
              />
            </span>
          } 
          key="requisites"
        >
          {editMode && (
            <Button
              style={{ marginBottom: 16 }}
              icon={<PlusCircleOutlined />}
              onClick={() => {
                const requisites = form.getFieldValue('requisites') || [];
                form.setFieldValue('requisites', [
                  {
                    id: `new_${dayjs().unix()}_${requisites.length}`,
                    id_orgs: orgId,
                    name: '',
                    inn: '',
                    kpp: '',
                    ogrn: '',
                    bank: '',
                    bik: '',
                    rs: '',
                    ks: '',
                    comment: '',
                    deleted: 0,
                    command: 'create',
                    _modified: true,
                  },
                  ...requisites,
                ]);
              }}
            >
              Добавить плательщика
            </Button>
          )}
          
          <Form.List name="requisites">
            {(fields, { remove }) => (
              <>
                {fields.length === 0 ? (
                  <Empty description="Нет реквизитов" />
                ) : (
                  fields.map(({ key, name, ...restField }) => {
                    const requisite = form.getFieldValue(['requisites', name]);
                    if (requisite?.deleted === 1) return null;
                    
                    // Здесь можно добавить RequisiteItem компонент аналогично ContactItem
                    return (
                      <div 
                        key={key} 
                        style={{ 
                          marginBottom: 16, 
                          padding: 16, 
                          border: '1px solid #d9d9d9',
                          borderRadius: 8 
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                          <span style={{ fontWeight: 500 }}>
                            {requisite?.name || 'Новый плательщик'}
                          </span>
                          {editMode && (
                            <Button
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleListItemRemove('requisites', name, remove)}
                            >
                              Удалить
                            </Button>
                          )}
                        </div>
                        
                        <Form.Item
                          {...restField}
                          name={[name, 'name']}
                          label="Наименование"
                        >
                          <Input disabled={!editMode} />
                        </Form.Item>
                        
                        <div style={{ display: 'flex', gap: 16 }}>
                          <Form.Item
                            {...restField}
                            name={[name, 'inn']}
                            label="ИНН"
                            style={{ flex: 1 }}
                          >
                            <Input disabled={!editMode} />
                          </Form.Item>
                          
                          <Form.Item
                            {...restField}
                            name={[name, 'kpp']}
                            label="КПП"
                            style={{ flex: 1 }}
                          >
                            <Input disabled={!editMode} />
                          </Form.Item>
                          
                          <Form.Item
                            {...restField}
                            name={[name, 'ogrn']}
                            label="ОГРН"
                            style={{ flex: 1 }}
                          >
                            <Input disabled={!editMode} />
                          </Form.Item>
                        </div>
                        
                        <Form.Item
                          {...restField}
                          name={[name, 'bank']}
                          label="Банк"
                        >
                          <Input disabled={!editMode} />
                        </Form.Item>
                        
                        <div style={{ display: 'flex', gap: 16 }}>
                          <Form.Item
                            {...restField}
                            name={[name, 'bik']}
                            label="БИК"
                            style={{ flex: 1 }}
                          >
                            <Input disabled={!editMode} />
                          </Form.Item>
                          
                          <Form.Item
                            {...restField}
                            name={[name, 'rs']}
                            label="Р/с"
                            style={{ flex: 2 }}
                          >
                            <Input disabled={!editMode} />
                          </Form.Item>
                          
                          <Form.Item
                            {...restField}
                            name={[name, 'ks']}
                            label="К/с"
                            style={{ flex: 2 }}
                          >
                            <Input disabled={!editMode} />
                          </Form.Item>
                        </div>
                      </div>
                    );
                  })
                )}
              </>
            )}
          </Form.List>
        </Panel>

      </Collapse>
    </Form>
  );
};

export default MainTabForm;
