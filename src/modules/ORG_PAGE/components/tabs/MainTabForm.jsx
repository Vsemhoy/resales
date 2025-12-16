/**
 * MainTabForm.jsx - С ОРИГИНАЛЬНЫМ ВИЗУАЛЬНЫМ СТИЛЕМ
 * 
 * Использует OrgFormRow для сохранения внешнего вида
 * При этом вся логика на antd Form (без гонок!)
 */

import React, { useEffect, useRef, useState } from 'react';
import { Form, Input, Select, Button, Empty, Badge, Checkbox } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import { 
  ChevronRightIcon,
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import dayjs from 'dayjs';

// Кастомный компонент строки (визуально как TorgPageSectionRow)
import OrgFormRow, { SimpleOrgRow } from './OrgFormRow';

const { TextArea } = Input;
const CHEVRON_SIZE = 16;




const MainTabForm = ({ form, editMode, initialData, selects, orgId }) => {
  // Какие секции раскрыты
  const [openedSections, setOpenedSections] = useState([
    'main_row', 'info_row', 'contacts_row'
  ]);

  // Загрузка данных в форму
  useEffect(() => {
    if (initialData && form) {
      form.setFieldsValue({
        name: initialData.name || '',
        middlename: initialData.middlename || '',
        id8an_fs: initialData.id8an_fs,
        id8an_profiles: initialData.id8an_profiles,
        inn: initialData.inn || '',
        source: initialData.source || '',
        comment: initialData.comment || '',
        commentinlist: initialData.commentinlist || '',
        site: initialData.site || '',
        profsound: initialData.profsound,
        
        contacts: (initialData.contacts || []).map(c => ({ ...c, _modified: false })),
        phones: (initialData.phones || []).map(p => ({ ...p, _modified: false })),
        addresses: (initialData.address || []).map(a => ({ ...a, _modified: false })),
        emails: (initialData.emails || []).map(e => ({ ...e, _modified: false })),
      });
    }
  }, [initialData, form]);

  // Переключение секции
  const toggleSection = (key) => {
    setOpenedSections(prev => 
      prev.includes(key) 
        ? prev.filter(k => k !== key) 
        : [...prev, key]
    );
  };

  // Хелперы для работы со списками
  const markAsModified = (fieldPath, index) => {
    const item = form.getFieldValue([...fieldPath, index]);
    if (item && !String(item.id).startsWith('new_')) {
      form.setFieldValue([...fieldPath, index, 'command'], 'update');
    }
    form.setFieldValue([...fieldPath, index, '_modified'], true);
  };

  const handleRemove = (fieldPath, index) => {
    const items = form.getFieldValue(fieldPath);
    const item = items?.[index];
    if (!item) return;
    
    if (String(item.id).startsWith('new_')) {
      // Новый элемент - удаляем из массива
      form.setFieldValue(fieldPath, items.filter((_, i) => i !== index));
    } else {
      // Существующий - помечаем как удалённый
      form.setFieldValue([...fieldPath, index, 'deleted'], 1);
      form.setFieldValue([...fieldPath, index, 'command'], 'delete');
      form.setFieldValue([...fieldPath, index, '_modified'], true);
    }
  };

  const handleAdd = (fieldName, template) => {
    const items = form.getFieldValue(fieldName) || [];
    form.setFieldValue(fieldName, [
      {
        id: `new_${dayjs().unix()}_${items.length}`,
        id_orgs: orgId,
        ...template,
        command: 'create',
        _modified: true,
      },
      ...items,
    ]);
  };

  // Счётчики для бейджей
  const contactsCount = Form.useWatch('contacts', form)?.filter(c => c?.deleted !== 1).length || 0;

  // const hasChanges = form.isFieldsTouched();

  const [hasChanges, setHasChanges] = useState(false);

 const debounceRef = useRef(null); // храним ID таймера

  useEffect(() => {
    if (hasChanges) {
      console.log("Has changes");
    }
  }, [hasChanges]);

  const handleFormDataChange = (changed, all) => {
    // Отменяем предыдущий таймер, если он есть
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Устанавливаем новый таймер
    debounceRef.current = setTimeout(() => {
      console.log('Debounced change:', changed);
      setHasChanges(true); // или какая-то логика сравнения
    }, 500);
  };

  // Опционально: очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);


  

  return (
    <Form form={form} name="mainForm" disabled={!editMode}
    onValuesChange={handleFormDataChange}
    >
      <div className="sa-org-main-collapse-stack">
        
        {/* ==================== ОСНОВНАЯ ИНФОРМАЦИЯ ==================== */}
        <CollapsibleSection
          title="Основная информация"
          sectionKey="main_row"
          isOpen={openedSections.includes('main_row')}
          onToggle={() => toggleSection('main_row')}
          color="#4a90d9"
        >
          <div className="sa-org-collapse-content">
            {/* Название */}
            <OrgFormRow
              editMode={editMode}
              inputs={[
                {
                  name: 'name',
                  label: 'Название организации',
                  required: true,
                  children: (
                    <Input
                      variant="borderless"
                      maxLength={550}
                      disabled={!editMode}
                    />
                  ),
                },
              ]}
            />

            {/* Форма собственности + ИНН */}
            <OrgFormRow
              editMode={editMode}
              inputs={[
                {
                  name: 'id8an_fs',
                  label: 'Форма собственности',
                  children: (
                    <Select
                      variant="borderless"
                      showSearch
                      optionFilterProp="label"
                      disabled={!editMode}
                      options={selects?.fss?.map(item => ({
                        value: parseInt(item.id),
                        label: item.name,
                      }))}
                    />
                  ),
                },
                {
                  name: 'inn',
                  label: 'ИНН',
                  children: (
                    <Input
                      variant="borderless"
                      maxLength={12}
                      disabled={!editMode}
                    />
                  ),
                },
              ]}
            />

            {/* Профиль + Профзвук */}
            <OrgFormRow
              editMode={editMode}
              inputs={[
                {
                  name: 'id8an_profiles',
                  label: 'Профиль',
                  children: (
                    <Select
                      variant="borderless"
                      showSearch
                      optionFilterProp="label"
                      disabled={!editMode}
                      options={selects?.profiles?.map(item => ({
                        value: item.key || item.id,
                        label: item.label || item.name,
                      }))}
                    />
                  ),
                },
                {
                  name: 'profsound',
                  label: 'Профзвук',
                  children: (
                    <Select
                      variant="borderless"
                      disabled={!editMode}
                      options={selects?.profsound?.map(item => ({
                        value: item.key || item.id,
                        label: item.label || item.name,
                      }))}
                    />
                  ),
                },
              ]}
            />

            {/* Источник */}
            <OrgFormRow
              editMode={editMode}
              inputs={[
                {
                  name: 'source',
                  label: 'Источник',
                  children: (
                    <Input variant="borderless" disabled={!editMode} />
                  ),
                },
              ]}
            />

            {/* Комментарий */}
            <OrgFormRow
              editMode={editMode}
              inputs={[
                {
                  name: 'comment',
                  label: 'Комментарий',
                  children: (
                    <TextArea
                      variant="borderless"
                      autoSize={{ minRows: 1, maxRows: 6 }}
                      disabled={!editMode}
                    />
                  ),
                },
              ]}
            />

            {/* Памятка */}
            <OrgFormRow
              editMode={editMode}
              inputs={[
                {
                  name: 'commentinlist',
                  label: 'Памятка',
                  children: (
                    <Input variant="borderless" disabled={!editMode} />
                  ),
                },
              ]}
            />
          </div>
        </CollapsibleSection>

        {/* ==================== КОНТАКТНАЯ ИНФОРМАЦИЯ ==================== */}
        <CollapsibleSection
          title="Контактная информация"
          sectionKey="info_row"
          isOpen={openedSections.includes('info_row')}
          onToggle={() => toggleSection('info_row')}
          color="#87c16c"
          extraButton={
            editMode && (
              <div className={'sa-flex-space'}>
                <Button
                  size="small"
                  icon={<PlusCircleOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdd('phones', { number: '', ext: '', comment: '' });
                  }}
                >
                  Добавить телефон
                </Button>
                <Button
                  size="small"
                  icon={<PlusCircleOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdd('emails', { number: '', ext: '', comment: '' });
                  }}
                >
                  Добавить адрес
                </Button>
                              <Button
                  size="small"
                  icon={<PlusCircleOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdd('addresses', { number: '', ext: '', comment: '' });
                  }}
                >
                  Добавить email
                </Button>
                              <Button
                  size="small"
                  icon={<PlusCircleOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdd('legaladdresses', { number: '', ext: '', comment: '' });
                  }}
                >
                  Добавить юр.адрес
                </Button>
              </div>
            )
          }
        >
          <div className="sa-org-collapse-content">
            {/* Сайт */}
            <OrgFormRow
              editMode={editMode}
              inputs={[
                {
                  name: 'site',
                  label: 'Сайт',
                  children: (
                    <Input variant="borderless" disabled={!editMode} />
                  ),
                },
              ]}
            />

            {/* Телефоны */}
            <div className="sa-org-contactstack-box">
              <Form.List name="addresses">
                {(fields) => (
                  <>
                    {fields.length === 0 ? (
                      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Нет телефонов" />
                    ) : (
                      fields.map(({ key, name }) => {
                        const phone = form.getFieldValue(['addresses', name]);
                        if (phone?.deleted === 1) return null;

                        return (
                          <PhoneRow
                            key={key}
                            name={name}
                            editMode={editMode}
                            form={form}
                            onRemove={() => handleRemove(['addresses'], name)}
                            onModify={() => markAsModified(['addresses'], name)}
                          />
                        );
                      })
                    )}
                  </>
                )}
              </Form.List>
            </div>

            <div className="sa-org-contactstack-box">
              <Form.List name="legaladdresses">
                {(fields) => (
                  <>
                    {fields.length === 0 ? (
                      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Нет телефонов" />
                    ) : (
                      fields.map(({ key, name }) => {
                        const phone = form.getFieldValue(['legaladdresses', name]);
                        if (phone?.deleted === 1) return null;

                        return (
                          <PhoneRow
                            key={key}
                            name={name}
                            editMode={editMode}
                            form={form}
                            onRemove={() => handleRemove(['legaladdresses'], name)}
                            onModify={() => markAsModified(['legaladdresses'], name)}
                          />
                        );
                      })
                    )}
                  </>
                )}
              </Form.List>
            </div>

            <div className="sa-org-contactstack-box">
              <Form.List name="phones">
                {(fields) => (
                  <>
                    {fields.length === 0 ? (
                      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Нет телефонов" />
                    ) : (
                      fields.map(({ key, name }) => {
                        const phone = form.getFieldValue(['phones', name]);
                        if (phone?.deleted === 1) return null;

                        return (
                          <PhoneRow
                            key={key}
                            name={name}
                            editMode={editMode}
                            form={form}
                            onRemove={() => handleRemove(['phones'], name)}
                            onModify={() => markAsModified(['phones'], name)}
                          />
                        );
                      })
                    )}
                  </>
                )}
              </Form.List>
            </div>

            <div className="sa-org-contactstack-box">
              <Form.List name="emails">
                {(fields) => (
                  <>
                    {fields.length === 0 ? (
                      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Нет телефонов" />
                    ) : (
                      fields.map(({ key, name }) => {
                        const phone = form.getFieldValue(['emails', name]);
                        if (phone?.deleted === 1) return null;

                        return (
                          <PhoneRow
                            key={key}
                            name={name}
                            editMode={editMode}
                            form={form}
                            onRemove={() => handleRemove(['emails'], name)}
                            onModify={() => markAsModified(['emails'], name)}
                          />
                        );
                      })
                    )}
                  </>
                )}
              </Form.List>
            </div>
          </div>
        </CollapsibleSection>

        {/* ==================== КОНТАКТНЫЕ ЛИЦА ==================== */}
        <CollapsibleSection
          title="Контактные лица"
          sectionKey="contacts_row"
          isOpen={openedSections.includes('contacts_row')}
          onToggle={() => toggleSection('contacts_row')}
          color="#ca6f7e"
          badge={contactsCount}
          extraButton={
            editMode && (
              <Button
                size="small"
                icon={<PlusCircleOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAdd('contacts', {
                    lastname: '',
                    name: '',
                    middlename: '',
                    occupy: '',
                    comment: '',
                    job: 1,
                    deleted: 0,
                    contactstelephones: [],
                    contactmobiles: [],
                    contactemails: [],
                  });
                }}
              >
                Добавить контакт
              </Button>
            )
          }
        >
          <div className="sa-org-contactstack-box">
            <Form.List name="contacts">
              {(fields) => (
                <>
                  {fields.length === 0 ? (
                    <Empty description="Нет контактов" />
                  ) : (
                    fields.map(({ key, name }) => {
                      const contact = form.getFieldValue(['contacts', name]);
                      if (contact?.deleted === 1) return null;

                      return (
                        <ContactCard
                          key={key}
                          name={name}
                          editMode={editMode}
                          form={form}
                          onRemove={() => handleRemove(['contacts'], name)}
                          onModify={() => markAsModified(['contacts'], name)}
                        />
                      );
                    })
                  )}
                </>
              )}
            </Form.List>
          </div>
        </CollapsibleSection>

      </div>
    </Form>
  );
};

// =============================================================================
// КОМПОНЕНТ СВОРАЧИВАЕМОЙ СЕКЦИИ (как в оригинале)
// =============================================================================

const CollapsibleSection = ({ 
  title, 
  sectionKey, 
  isOpen, 
  onToggle, 
  children, 
  color = '#4a90d9',
  badge,
  extraButton 
}) => (
  <div 
    className={`sa-org-main-collapse-item sa-org-collapse-item ${isOpen ? 'sa-opened-item' : 'sa-collapsed-item'}`}
    style={{ boxShadow: `${color} -9px 0px 0px -0.5px` }}
  >
    <div 
      className="sa-org-collpase-header sa-och-top sa-flex-space"
      onClick={onToggle}
      style={{ cursor: 'pointer' }}
    >
      <div className="sa-flex">
        <div className="sa-pa-3 sa-lh-chevron">
          <span className={`sa-pa-3 sa-org-trigger-button ${isOpen ? 'active' : ''}`}>
            <ChevronRightIcon height={CHEVRON_SIZE} />
          </span>
        </div>
        <div className="sa-pa-3 sa-org-section-text">
          <div className="sa-org-section-label">{title}</div>
          {badge !== undefined && (
            <Badge count={badge} color="blue" />
          )}
        </div>
      </div>

      {extraButton && (
        <div className="sa-org-collapse-buttons" onClick={e => e.stopPropagation()}>
          {extraButton}
        </div>
      )}
    </div>

    <div className="sa-org-collapse-body">
      {children}
    </div>
  </div>
);

// =============================================================================
// СТРОКА ТЕЛЕФОНА
// =============================================================================

const PhoneRow = ({ name, editMode, form, onRemove, onModify }) => {
  const isNew = String(form.getFieldValue(['phones', name, 'id'])).startsWith('new_');

  return (
    <div className={`sa-org-sub-sub-section-row ${isNew ? 'sa-brand-new-row' : ''}`}>
      <SimpleOrgRow
        editMode={editMode}
        inputs={[
          {
            label: 'Номер',
            children: (
              <Form.Item name={[name, 'number']} noStyle>
                <Input 
                  variant="borderless" 
                  placeholder="Телефон"
                  disabled={!editMode}
                  onChange={onModify}
                />
              </Form.Item>
            ),
          },
          {
            label: 'Доб.',
            children: (
              <Form.Item name={[name, 'ext']} noStyle>
                <Input 
                  variant="borderless" 
                  placeholder="Добавочный"
                  disabled={!editMode}
                  onChange={onModify}
                />
              </Form.Item>
            ),
          },
          {
            label: 'Комментарий',
            children: (
              <Form.Item name={[name, 'comment']} noStyle>
                <Input 
                  variant="borderless" 
                  disabled={!editMode}
                  onChange={onModify}
                />
              </Form.Item>
            ),
          },
        ]}
        action={
          <Button 
            type="text" 
            danger 
            icon={<TrashIcon style={{ width: 16 }} />}
            onClick={onRemove}
          />
        }
      />
    </div>
  );
};

// =============================================================================
// КАРТОЧКА КОНТАКТА (с вложенными телефонами/email)
// =============================================================================

const ContactCard = ({ name, editMode, form, onRemove, onModify }) => {
  const [isOpen, setIsOpen] = useState(true);
  const contact = Form.useWatch(['contacts', name], form) || {};
  const isNew = String(contact.id).startsWith('new_');

  const fullName = [contact.lastname, contact.name, contact.middlename]
    .filter(Boolean).join(' ') || 'Новый контакт';

  // Добавление вложенного телефона
  const addNestedPhone = (fieldName) => {
    const phones = form.getFieldValue(['contacts', name, fieldName]) || [];
    form.setFieldValue(['contacts', name, fieldName], [
      ...phones,
      {
        id: `new_${dayjs().unix()}_${phones.length}`,
        number: '',
        comment: '',
        command: 'create',
        _modified: true,
      }
    ]);
    onModify();
  };

  // Удаление вложенного телефона
  const removeNestedPhone = (fieldName, index) => {
    const phones = form.getFieldValue(['contacts', name, fieldName]);
    const phone = phones?.[index];
    if (!phone) return;

    if (String(phone.id).startsWith('new_')) {
      form.setFieldValue(
        ['contacts', name, fieldName],
        phones.filter((_, i) => i !== index)
      );
    } else {
      form.setFieldValue(['contacts', name, fieldName, index, 'deleted'], 1);
      form.setFieldValue(['contacts', name, fieldName, index, 'command'], 'delete');
    }
    onModify();
  };

  return (
    <div 
      className={`sa-org-collapse-item sa-org-person-row ${isNew ? 'sa-brand-new-row' : ''} ${isOpen ? 'sa-opened-item' : 'sa-collapsed-item'}`}
    >
      {/* Заголовок карточки */}
      <div 
        className="sa-org-collpase-header sa-flex-space"
        onClick={() => setIsOpen(!isOpen)}
        style={{ cursor: 'pointer', padding: '4px 8px' }}
      >
        <div className="sa-flex">
          <span className={`sa-org-trigger-button ${isOpen ? 'active' : ''}`}>
            <ChevronRightIcon height={14} />
          </span>
          <span style={{ marginLeft: 8 }}>
            <UserIcon style={{ width: 14, marginRight: 4 }} />
            {fullName}
            {contact.occupy && (
              <span className="sa-occupy-namerow">— {contact.occupy}</span>
            )}
          </span>
        </div>
        
        {editMode && (
          <Button 
            size="small" 
            danger 
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
          >
            Удалить
          </Button>
        )}
      </div>

      {/* Тело карточки */}
      <div className="sa-org-collapse-body">
        <div className="sa-org-collapse-content">
          {/* ФИО */}
          <SimpleOrgRow
            editMode={editMode}
            inputs={[
              {
                label: 'Фамилия',
                children: (
                  <Form.Item name={[name, 'lastname']} noStyle>
                    <Input variant="borderless" disabled={!editMode} onChange={onModify} />
                  </Form.Item>
                ),
              },
              {
                label: 'Имя',
                children: (
                  <Form.Item name={[name, 'name']} noStyle>
                    <Input variant="borderless" disabled={!editMode} onChange={onModify} />
                  </Form.Item>
                ),
              },
              {
                label: 'Отчество',
                children: (
                  <Form.Item name={[name, 'middlename']} noStyle>
                    <Input variant="borderless" disabled={!editMode} onChange={onModify} />
                  </Form.Item>
                ),
              },
            ]}
          />

          {/* Должность */}
          <SimpleOrgRow
            editMode={editMode}
            inputs={[
              {
                label: 'Должность',
                children: (
                  <Form.Item name={[name, 'occupy']} noStyle>
                    <Input variant="borderless" disabled={!editMode} onChange={onModify} />
                  </Form.Item>
                ),
              },
            ]}
          />

          {/* Комментарий */}
          <SimpleOrgRow
            editMode={editMode}
            inputs={[
              {
                label: 'Комментарий',
                children: (
                  <Form.Item name={[name, 'comment']} noStyle>
                    <TextArea 
                      variant="borderless" 
                      autoSize={{ minRows: 1, maxRows: 3 }}
                      disabled={!editMode} 
                      onChange={onModify} 
                    />
                  </Form.Item>
                ),
              },
            ]}
          />

          {/* Рабочие телефоны */}
          <div style={{ padding: '8px 0' }}>
            <div className="sa-flex-space" style={{ marginBottom: 4 }}>
              <span><PhoneIcon style={{ width: 14 }} /> Рабочие телефоны</span>
              {editMode && (
                <Button 
                  size="small" 
                  icon={<PlusCircleOutlined />}
                  onClick={() => addNestedPhone('contactstelephones')}
                >
                  Добавить
                </Button>
              )}
            </div>
            
            <Form.List name={[name, 'contactstelephones']}>
              {(fields) => fields.map(({ key, name: phoneName }) => {
                const phone = form.getFieldValue(['contacts', name, 'contactstelephones', phoneName]);
                if (phone?.deleted === 1) return null;

                return (
                  <div key={key} className="sa-org-sub-sub-section-row">
                    <SimpleOrgRow
                      editMode={editMode}
                      inputs={[
                        {
                          label: 'Номер',
                          children: (
                            <Form.Item name={[phoneName, 'number']} noStyle>
                              <Input variant="borderless" disabled={!editMode} onChange={onModify} />
                            </Form.Item>
                          ),
                        },
                        {
                          label: 'Доб.',
                          children: (
                            <Form.Item name={[phoneName, 'ext']} noStyle>
                              <Input variant="borderless" disabled={!editMode} onChange={onModify} />
                            </Form.Item>
                          ),
                        },
                      ]}
                      action={
                        <Button 
                          type="text" 
                          danger 
                          size="small"
                          icon={<TrashIcon style={{ width: 14 }} />}
                          onClick={() => removeNestedPhone('contactstelephones', phoneName)}
                        />
                      }
                    />
                  </div>
                );
              })}
            </Form.List>
          </div>

          {/* Email */}
          <div style={{ padding: '8px 0' }}>
            <div className="sa-flex-space" style={{ marginBottom: 4 }}>
              <span><EnvelopeIcon style={{ width: 14 }} /> Email</span>
              {editMode && (
                <Button 
                  size="small" 
                  icon={<PlusCircleOutlined />}
                  onClick={() => addNestedPhone('contactemails')}
                >
                  Добавить
                </Button>
              )}
            </div>
            
            <Form.List name={[name, 'contactemails']}>
              {(fields) => fields.map(({ key, name: emailName }) => {
                const email = form.getFieldValue(['contacts', name, 'contactemails', emailName]);
                if (email?.deleted === 1) return null;

                return (
                  <div key={key} className="sa-org-sub-sub-section-row">
                    <SimpleOrgRow
                      editMode={editMode}
                      inputs={[
                        {
                          label: 'Email',
                          children: (
                            <Form.Item name={[emailName, 'email']} noStyle>
                              <Input variant="borderless" disabled={!editMode} onChange={onModify} />
                            </Form.Item>
                          ),
                        },
                      ]}
                      action={
                        <Button 
                          type="text" 
                          danger 
                          size="small"
                          icon={<TrashIcon style={{ width: 14 }} />}
                          onClick={() => removeNestedPhone('contactemails', emailName)}
                        />
                      }
                    />
                  </div>
                );
              })}
            </Form.List>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MainTabForm;
