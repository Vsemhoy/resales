/**
 * MainTabForm.jsx - Основная информация организации
 * 
 * АРХИТЕКТУРА:
 * - Один Form.useForm() на всю вкладку (передаётся от родителя)
 * - Секционная структура для удобства
 * - Form.List для массивов (phones, emails, addresses, contacts)
 * 
 * СЕКЦИИ:
 * 1. Основная информация (name, middlename, site, inn, kindofactivity)
 * 2. Классификация (профиль, статус, отношения, тип клиента)
 * 3. География (регион, город)
 * 4. Контактные данные организации (phones, emails, addresses)
 * 5. Контактные лица (contacts - сложная вложенная структура)
 * 6. Документы (licenses, tolerance, requisites)
 * 7. Служебная информация (curator, creator, source, comments)
 * 
 * СТИЛИ: используем префикс sat- (orgpage-forms.css)
 */

import React, { useEffect, useState, useCallback } from 'react';
import { 
  Form, Button, Input, Select, Spin, message, 
  Collapse, Tooltip, Tag, Divider
} from 'antd';
import { 
  PlusOutlined, DeleteOutlined, PhoneOutlined, 
  MailOutlined, HomeOutlined, UserOutlined,
  FileTextOutlined, SafetyCertificateOutlined
} from '@ant-design/icons';
import { 
  ChevronRightIcon, TrashIcon, PlusCircleIcon,
  BuildingOfficeIcon, UserCircleIcon
} from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import debounce from 'lodash/debounce';

import { PROD_AXIOS_INSTANCE } from '../../../../config/Api';
import { CSRF_TOKEN, PRODMODE } from '../../../../config/config';
import { ORGLIST_MODAL_MOCK_MAINTAB } from '../../../ORG_LIST/components/mock/ORGLISTMODALMOCK';

import '../style/orgpage-forms.css';

const { TextArea } = Input;

// Конфиг
const TEXTAREA_MIN_ROWS = 2;
const TEXTAREA_MAX_ROWS = 6;
const CHEVRON_SIZE = 16;


const MainTabForm = ({ 
  form,           // Form instance от родителя
  orgId,          // ID организации
  editMode,       // Режим редактирования
  isActive,       // Активна ли вкладка
  userdata,       // Данные пользователя
  selects,        // Справочники для Select'ов
  onDataChange,   // Callback при изменении данных
}) => {
  // Состояния
  const [loading, setLoading] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  
  // UI состояния
  const [expandedSections, setExpandedSections] = useState(['basic', 'contacts']);

  // ===================== ЗАГРУЗКА ДАННЫХ =====================
  
  const loadMainData = useCallback(async () => {
    if (!orgId) return;
    
    setLoading(true);
    try {
      let data;
      
      if (PRODMODE) {
        const response = await PROD_AXIOS_INSTANCE.get(
          `/api/sales/v2/orglist/${orgId}`
        );
        data = response.data?.content;
      } else {
        // DEV MODE
        data = ORGLIST_MODAL_MOCK_MAINTAB;
      }
      
      if (data) {
        setOriginalData(JSON.parse(JSON.stringify(data)));
        
        // Преобразуем данные для формы
        const formData = transformDataForForm(data);
        form.setFieldsValue(formData);
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      message.error('Не удалось загрузить данные организации');
    } finally {
      setLoading(false);
    }
  }, [orgId, form]);

  // Загрузка при изменении orgId
  useEffect(() => {
    if (orgId) {
      const timer = setTimeout(loadMainData, 300);
      return () => clearTimeout(timer);
    }
  }, [orgId, loadMainData]);

  // Сброс при смене организации
  useEffect(() => {
    if (!orgId) {
      form.resetFields();
      setOriginalData(null);
    }
  }, [orgId, form]);

  // ===================== ПРЕОБРАЗОВАНИЕ ДАННЫХ =====================
  
  const transformDataForForm = (data) => {
    return {
      // Основная информация
      name: data.name || '',
      middlename: data.middlename || '',
      site: data.site || '',
      inn: data.inn || '',
      kindofactivity: data.kindofactivity || '',
      
      // Классификация
      id8an_profiles: data.id8an_profiles || null,
      id8an_status: data.id8an_status || null,
      id8an_relations: data.id8an_relations || null,
      id8an_customertypes: data.id8an_customertypes || null,
      id8an_dept: data.id8an_dept || null,
      
      // География
      id8org_regions: data.id8org_regions || null,
      id8org_towns: data.id8org_towns || null,
      
      // Финансы
      id8an_statusmoney: data.id8an_statusmoney || null,
      id8an_conveyance: data.id8an_conveyance || null,
      
      // Контактные данные организации
      phones: data.phones || [],
      emails: data.emails || [],
      addresses: data.address || [],
      legaladdresses: data.legaladdresses || [],
      
      // Контактные лица
      contacts: data.contacts || [],
      
      // Документы
      licenses: data.active_licenses || [],
      tolerance: data.active_tolerance || [],
      requisites: data.requisites || [],
      
      // Служебная информация
      source: data.source || '',
      comment: data.comment || '',
      commentinlist: data.commentinlist || '',
      
      // Readonly
      creator: data.creator || null,
      curator: data.curator || null,
      region: data.region || null,
      town: data.town || null,
      list: data.list || null,
    };
  };

  // ===================== ДОБАВЛЕНИЕ ЭЛЕМЕНТОВ =====================
  
  const createNewPhone = () => ({
    id: `new_${Date.now()}`,
    id_orgs: orgId,
    number: '',
    ext: '',
    comment: '',
    deleted: 0,
  });

  const createNewEmail = () => ({
    id: `new_${Date.now()}`,
    id_orgs: orgId,
    email: '',
    comment: '',
    deleted: 0,
  });

  const createNewAddress = () => ({
    id: `new_${Date.now()}`,
    id_orgs: orgId,
    address: '',
    post_index: '',
    comment: '',
    deleted: 0,
  });

  const createNewContact = () => ({
    id: `new_${Date.now()}`,
    id_orgs: orgId,
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
    contactmessangers: [],
  });

  const createNewContactPhone = (contactId) => ({
    id: `new_${Date.now()}`,
    id_orgsusers: contactId,
    number: '',
    ext: '',
    comment: '',
    deleted: 0,
  });

  const createNewContactEmail = (contactId) => ({
    id: `new_${Date.now()}`,
    id_orgsusers: contactId,
    email: '',
    comment: '',
    deleted: 0,
  });

  // ===================== ХЕЛПЕРЫ =====================
  
  const getPersonFullName = (person) => {
    if (!person) return '';
    return `${person.surname || ''} ${person.name || ''} ${person.secondname || ''}`.trim();
  };

  const toggleSection = (key) => {
    setExpandedSections(prev => 
      prev.includes(key) 
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  const handleFieldChange = useCallback(
    debounce(() => {
      const mfs = collectMainForSave(form, originalData);
      console.log(mfs);
      onDataChange?.('m', true, { orig: originalData, chan: mfs });
    }, 500),
    [onDataChange, originalData],
  );

  // ===================== РЕНДЕР =====================
  
  if (!isActive) {
    return <div className="sat-tab-hidden" />;
  }

  return (
    <div className="sat-tab-container sat-main-tab">
      <Spin spinning={loading}>
        <div className="sat-tab-content">
          <Form 
            form={form} 
            layout="vertical"
            onValuesChange={handleFieldChange}
          >
            
            {/* ==================== СЕКЦИЯ: ОСНОВНАЯ ИНФОРМАЦИЯ ==================== */}
            <SectionHeader 
              title="Основная информация" 
              icon={<BuildingOfficeIcon height={18} />}
              sectionKey="basic"
              expanded={expandedSections.includes('basic')}
              onToggle={toggleSection}
            />
            
            {expandedSections.includes('basic') && (
              <div className="sat-section-content">
                
                {/* Название */}
                <div className="sat-section">
                  <div className="sat-row-wrapper">
                    <div className="sat-row sat-1-col">
                      <div>
                        <div className="sat-legend">Название организации</div>
                        <div className="sat-content">
                          <div className="sat-content-inner">
                            <Form.Item name="name" noStyle>
                              <Input
                                placeholder={editMode ? 'Название' : ''}
                                maxLength={500}
                                readOnly={!editMode}
                                variant={editMode ? 'underlined' : 'borderless'}
                                className={editMode ? 'sat-canedit' : 'sat-notedit'}
                              />
                            </Form.Item>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Второе название и Сайт */}
                <div className="sat-section">
                  <div className="sat-row-wrapper">
                    <div className="sat-row sat-2-col">
                      <div>
                        <div className="sat-legend">Второе название</div>
                        <div className="sat-content">
                          <div className="sat-content-inner">
                            <Form.Item name="middlename" noStyle>
                              <Input
                                placeholder={editMode ? 'Альтернативное название' : ''}
                                maxLength={300}
                                readOnly={!editMode}
                                variant={editMode ? 'underlined' : 'borderless'}
                                className={editMode ? 'sat-canedit' : 'sat-notedit'}
                              />
                            </Form.Item>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="sat-legend">Сайт</div>
                        <div className="sat-content">
                          <div className="sat-content-inner">
                            <Form.Item name="site" noStyle>
                              <Input
                                placeholder={editMode ? 'www.example.com' : ''}
                                maxLength={200}
                                readOnly={!editMode}
                                variant={editMode ? 'underlined' : 'borderless'}
                                className={editMode ? 'sat-canedit' : 'sat-notedit'}
                              />
                            </Form.Item>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ИНН и Источник */}
                <div className="sat-section">
                  <div className="sat-row-wrapper">
                    <div className="sat-row sat-2-col">
                      <div>
                        <div className="sat-legend">ИНН</div>
                        <div className="sat-content">
                          <div className="sat-content-inner">
                            <Form.Item name="inn" noStyle>
                              <Input
                                placeholder={editMode ? 'ИНН' : ''}
                                maxLength={12}
                                readOnly={!editMode}
                                variant={editMode ? 'underlined' : 'borderless'}
                                className={editMode ? 'sat-canedit' : 'sat-notedit'}
                              />
                            </Form.Item>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="sat-legend">Источник</div>
                        <div className="sat-content">
                          <div className="sat-content-inner">
                            <Form.Item name="source" noStyle>
                              <Input
                                placeholder={editMode ? 'Источник информации' : ''}
                                maxLength={200}
                                readOnly={!editMode}
                                variant={editMode ? 'underlined' : 'borderless'}
                                className={editMode ? 'sat-canedit' : 'sat-notedit'}
                              />
                            </Form.Item>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Вид деятельности */}
                <div className="sat-section">
                  <div className="sat-row-wrapper">
                    <div className="sat-row sat-1-col">
                      <div>
                        <div className="sat-legend">Вид деятельности</div>
                        <div className="sat-content">
                          <div className="sat-content-inner">
                            <Form.Item name="kindofactivity" noStyle>
                              <TextArea
                                placeholder={editMode ? 'Описание деятельности' : ''}
                                maxLength={1000}
                                readOnly={!editMode}
                                variant={editMode ? 'underlined' : 'borderless'}
                                autoSize={{ minRows: TEXTAREA_MIN_ROWS, maxRows: TEXTAREA_MAX_ROWS }}
                                className={editMode ? 'sat-canedit' : 'sat-notedit'}
                              />
                            </Form.Item>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== СЕКЦИЯ: КЛАССИФИКАЦИЯ ==================== */}
            <SectionHeader 
              title="Классификация" 
              icon={<FileTextOutlined />}
              sectionKey="classification"
              expanded={expandedSections.includes('classification')}
              onToggle={toggleSection}
            />
            
            {expandedSections.includes('classification') && (
              <div className="sat-section-content">
                
                {/* Профиль и Статус */}
                <div className="sat-section">
                  <div className="sat-row-wrapper">
                    <div className="sat-row sat-2-col">
                      <div>
                        <div className="sat-legend">Профиль</div>
                        <div className="sat-content">
                          <div className="sat-content-inner">
                            <Form.Item name="id8an_profiles" noStyle>
                              <Select
                                placeholder="Выберите профиль"
                                options={selects?.profiles || []}
                                disabled={!editMode}
                                variant={editMode ? 'underlined' : 'borderless'}
                                className={editMode ? 'sat-canedit' : 'sat-notedit'}
                                style={{ width: '100%' }}
                                allowClear
                              />
                            </Form.Item>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="sat-legend">Статус</div>
                        <div className="sat-content">
                          <div className="sat-content-inner">
                            <Form.Item name="id8an_status" noStyle>
                              <Select
                                placeholder="Выберите статус"
                                options={selects?.statuses || []}
                                disabled={!editMode}
                                variant={editMode ? 'underlined' : 'borderless'}
                                className={editMode ? 'sat-canedit' : 'sat-notedit'}
                                style={{ width: '100%' }}
                                allowClear
                              />
                            </Form.Item>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Тип клиента и Отдел */}
                <div className="sat-section">
                  <div className="sat-row-wrapper">
                    <div className="sat-row sat-2-col">
                      <div>
                        <div className="sat-legend">Тип клиента</div>
                        <div className="sat-content">
                          <div className="sat-content-inner">
                            <Form.Item name="id8an_customertypes" noStyle>
                              <Select
                                placeholder="Тип клиента"
                                options={selects?.customerTypes || []}
                                disabled={!editMode}
                                variant={editMode ? 'underlined' : 'borderless'}
                                className={editMode ? 'sat-canedit' : 'sat-notedit'}
                                style={{ width: '100%' }}
                                allowClear
                              />
                            </Form.Item>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="sat-legend">Отдел</div>
                        <div className="sat-content">
                          <div className="sat-content-inner">
                            <Form.Item name="id8an_dept" noStyle>
                              <Select
                                placeholder="Отдел"
                                options={selects?.departments || []}
                                disabled={!editMode}
                                variant={editMode ? 'underlined' : 'borderless'}
                                className={editMode ? 'sat-canedit' : 'sat-notedit'}
                                style={{ width: '100%' }}
                                allowClear
                              />
                            </Form.Item>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Статус по деньгам и Доставка */}
                <div className="sat-section">
                  <div className="sat-row-wrapper">
                    <div className="sat-row sat-2-col">
                      <div>
                        <div className="sat-legend">Статус по деньгам</div>
                        <div className="sat-content">
                          <div className="sat-content-inner">
                            <Form.Item name="id8an_statusmoney" noStyle>
                              <Select
                                placeholder="Статус"
                                options={selects?.statusMoney || []}
                                disabled={!editMode}
                                variant={editMode ? 'underlined' : 'borderless'}
                                className={editMode ? 'sat-canedit' : 'sat-notedit'}
                                style={{ width: '100%' }}
                                allowClear
                              />
                            </Form.Item>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="sat-legend">Способ доставки</div>
                        <div className="sat-content">
                          <div className="sat-content-inner">
                            <Form.Item name="id8an_conveyance" noStyle>
                              <Select
                                placeholder="Доставка"
                                options={selects?.conveyance || []}
                                disabled={!editMode}
                                variant={editMode ? 'underlined' : 'borderless'}
                                className={editMode ? 'sat-canedit' : 'sat-notedit'}
                                style={{ width: '100%' }}
                                allowClear
                              />
                            </Form.Item>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== СЕКЦИЯ: ГЕОГРАФИЯ ==================== */}
            <SectionHeader 
              title="География" 
              icon={<HomeOutlined />}
              sectionKey="geo"
              expanded={expandedSections.includes('geo')}
              onToggle={toggleSection}
            />
            
            {expandedSections.includes('geo') && (
              <div className="sat-section-content">
                
                {/* Регион и Город */}
                <div className="sat-section">
                  <div className="sat-row-wrapper">
                    <div className="sat-row sat-2-col">
                      <div>
                        <div className="sat-legend">Регион</div>
                        <div className="sat-content">
                          <div className="sat-content-inner">
                            <Form.Item name="id8org_regions" noStyle>
                              <Select
                                placeholder="Выберите регион"
                                options={selects?.regions || []}
                                disabled={!editMode}
                                variant={editMode ? 'underlined' : 'borderless'}
                                className={editMode ? 'sat-canedit' : 'sat-notedit'}
                                style={{ width: '100%' }}
                                showSearch
                                optionFilterProp="label"
                                allowClear
                              />
                            </Form.Item>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="sat-legend">Город</div>
                        <div className="sat-content">
                          <div className="sat-content-inner">
                            <Form.Item name="id8org_towns" noStyle>
                              <Select
                                placeholder="Выберите город"
                                options={selects?.towns || []}
                                disabled={!editMode}
                                variant={editMode ? 'underlined' : 'borderless'}
                                className={editMode ? 'sat-canedit' : 'sat-notedit'}
                                style={{ width: '100%' }}
                                showSearch
                                optionFilterProp="label"
                                allowClear
                              />
                            </Form.Item>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== СЕКЦИЯ: ТЕЛЕФОНЫ ОРГАНИЗАЦИИ ==================== */}
            <SectionHeader 
              title="Телефоны организации" 
              icon={<PhoneOutlined />}
              sectionKey="phones"
              expanded={expandedSections.includes('phones')}
              onToggle={toggleSection}
              badge={form.getFieldValue('phones')?.filter(p => !p.deleted)?.length}
            />
            
            {expandedSections.includes('phones') && (
              <div className="sat-section-content">
                <Form.List name="phones">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name }) => {
                        const phone = form.getFieldValue(['phones', name]);
                        if (phone?.deleted) return null;
                        
                        return (
                          <div key={key} className="sat-section">
                            <div className="sat-row-wrapper">
                              <div className="sat-row sat-3-col">
                                <div>
                                  <div className="sat-legend">Номер</div>
                                  <div className="sat-content">
                                    <div className="sat-content-inner">
                                      <Form.Item name={[name, 'number']} noStyle>
                                        <Input
                                          placeholder="+7-XXX-XXX-XX-XX"
                                          maxLength={50}
                                          readOnly={!editMode}
                                          variant={editMode ? 'underlined' : 'borderless'}
                                          className={editMode ? 'sat-canedit' : 'sat-notedit'}
                                        />
                                      </Form.Item>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <div className="sat-legend">Доб.</div>
                                  <div className="sat-content">
                                    <div className="sat-content-inner">
                                      <Form.Item name={[name, 'ext']} noStyle>
                                        <Input
                                          placeholder="Доб."
                                          maxLength={10}
                                          readOnly={!editMode}
                                          variant={editMode ? 'underlined' : 'borderless'}
                                          className={editMode ? 'sat-canedit' : 'sat-notedit'}
                                        />
                                      </Form.Item>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <div className="sat-legend">Комментарий</div>
                                  <div className="sat-content">
                                    <div className="sat-content-inner">
                                      <Form.Item name={[name, 'comment']} noStyle>
                                        <Input
                                          placeholder="Комментарий"
                                          maxLength={100}
                                          readOnly={!editMode}
                                          variant={editMode ? 'underlined' : 'borderless'}
                                          className={editMode ? 'sat-canedit' : 'sat-notedit'}
                                        />
                                      </Form.Item>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {editMode && String(phone?.id).startsWith('new_') && (
                                <div className="sat-action-block">
                                  <Button
                                    type="text"
                                    danger
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    onClick={() => remove(name)}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      
                      {editMode && (
                        <Button
                          type="dashed"
                          onClick={() => add(createNewPhone())}
                          icon={<PlusOutlined />}
                          style={{ marginTop: 8 }}
                        >
                          Добавить телефон
                        </Button>
                      )}
                    </>
                  )}
                </Form.List>
              </div>
            )}

            {/* ==================== СЕКЦИЯ: EMAIL ОРГАНИЗАЦИИ ==================== */}
            <SectionHeader 
              title="Email организации" 
              icon={<MailOutlined />}
              sectionKey="emails"
              expanded={expandedSections.includes('emails')}
              onToggle={toggleSection}
              badge={form.getFieldValue('emails')?.filter(e => !e.deleted)?.length}
            />
            
            {expandedSections.includes('emails') && (
              <div className="sat-section-content">
                <Form.List name="emails">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name }) => {
                        const email = form.getFieldValue(['emails', name]);
                        if (email?.deleted) return null;
                        
                        return (
                          <div key={key} className="sat-section">
                            <div className="sat-row-wrapper">
                              <div className="sat-row sat-2-col">
                                <div>
                                  <div className="sat-legend">Email</div>
                                  <div className="sat-content">
                                    <div className="sat-content-inner">
                                      <Form.Item name={[name, 'email']} noStyle>
                                        <Input
                                          placeholder="email@example.com"
                                          maxLength={100}
                                          readOnly={!editMode}
                                          variant={editMode ? 'underlined' : 'borderless'}
                                          className={editMode ? 'sat-canedit' : 'sat-notedit'}
                                        />
                                      </Form.Item>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <div className="sat-legend">Комментарий</div>
                                  <div className="sat-content">
                                    <div className="sat-content-inner">
                                      <Form.Item name={[name, 'comment']} noStyle>
                                        <Input
                                          placeholder="Комментарий"
                                          maxLength={200}
                                          readOnly={!editMode}
                                          variant={editMode ? 'underlined' : 'borderless'}
                                          className={editMode ? 'sat-canedit' : 'sat-notedit'}
                                        />
                                      </Form.Item>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {editMode && String(email?.id).startsWith('new_') && (
                                <div className="sat-action-block">
                                  <Button
                                    type="text"
                                    danger
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    onClick={() => remove(name)}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      
                      {editMode && (
                        <Button
                          type="dashed"
                          onClick={() => add(createNewEmail())}
                          icon={<PlusOutlined />}
                          style={{ marginTop: 8 }}
                        >
                          Добавить email
                        </Button>
                      )}
                    </>
                  )}
                </Form.List>
              </div>
            )}

            {/* ==================== СЕКЦИЯ: АДРЕСА ==================== */}
            <SectionHeader 
              title="Адреса" 
              icon={<HomeOutlined />}
              sectionKey="addresses"
              expanded={expandedSections.includes('addresses')}
              onToggle={toggleSection}
              badge={form.getFieldValue('addresses')?.filter(a => !a.deleted)?.length}
            />
            
            {expandedSections.includes('addresses') && (
              <div className="sat-section-content">
                <Form.List name="addresses">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name }) => {
                        const addr = form.getFieldValue(['addresses', name]);
                        if (addr?.deleted) return null;
                        
                        return (
                          <div key={key} className="sat-section">
                            <div className="sat-row-wrapper">
                              <div className="sat-row sat-1-col">
                                <div>
                                  <div className="sat-legend">Адрес</div>
                                  <div className="sat-content">
                                    <div className="sat-content-inner">
                                      <Form.Item name={[name, 'address']} noStyle>
                                        <Input
                                          placeholder="Адрес"
                                          maxLength={500}
                                          readOnly={!editMode}
                                          variant={editMode ? 'underlined' : 'borderless'}
                                          className={editMode ? 'sat-canedit' : 'sat-notedit'}
                                        />
                                      </Form.Item>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {editMode && String(addr?.id).startsWith('new_') && (
                                <div className="sat-action-block">
                                  <Button
                                    type="text"
                                    danger
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    onClick={() => remove(name)}
                                  />
                                </div>
                              )}
                            </div>
                            <div className="sat-row-wrapper">
                              <div className="sat-row sat-2-col">
                                <div>
                                  <div className="sat-legend">Индекс</div>
                                  <div className="sat-content">
                                    <div className="sat-content-inner">
                                      <Form.Item name={[name, 'post_index']} noStyle>
                                        <Input
                                          placeholder="Индекс"
                                          maxLength={10}
                                          readOnly={!editMode}
                                          variant={editMode ? 'underlined' : 'borderless'}
                                          className={editMode ? 'sat-canedit' : 'sat-notedit'}
                                        />
                                      </Form.Item>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <div className="sat-legend">Комментарий</div>
                                  <div className="sat-content">
                                    <div className="sat-content-inner">
                                      <Form.Item name={[name, 'comment']} noStyle>
                                        <Input
                                          placeholder="Комментарий"
                                          maxLength={200}
                                          readOnly={!editMode}
                                          variant={editMode ? 'underlined' : 'borderless'}
                                          className={editMode ? 'sat-canedit' : 'sat-notedit'}
                                        />
                                      </Form.Item>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      
                      {editMode && (
                        <Button
                          type="dashed"
                          onClick={() => add(createNewAddress())}
                          icon={<PlusOutlined />}
                          style={{ marginTop: 8 }}
                        >
                          Добавить адрес
                        </Button>
                      )}
                    </>
                  )}
                </Form.List>
              </div>
            )}

            {/* ==================== СЕКЦИЯ: КОНТАКТНЫЕ ЛИЦА ==================== */}
            <SectionHeader 
              title="Контактные лица" 
              icon={<UserOutlined />}
              sectionKey="contacts"
              expanded={expandedSections.includes('contacts')}
              onToggle={toggleSection}
              badge={form.getFieldValue('contacts')?.filter(c => !c.deleted)?.length}
            />
            
            {expandedSections.includes('contacts') && (
              <div className="sat-section-content">
                <Form.List name="contacts">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name }) => {
                        const contact = form.getFieldValue(['contacts', name]);
                        if (contact?.deleted) return null;
                        
                        return (
                          <ContactCard
                            key={key}
                            fieldName={name}
                            contact={contact}
                            editMode={editMode}
                            form={form}
                            onRemove={() => remove(name)}
                            createNewContactPhone={createNewContactPhone}
                            createNewContactEmail={createNewContactEmail}
                          />
                        );
                      })}
                      
                      {editMode && (
                        <Button
                          type="dashed"
                          onClick={() => add(createNewContact())}
                          icon={<PlusOutlined />}
                          style={{ marginTop: 8 }}
                        >
                          Добавить контакт
                        </Button>
                      )}
                    </>
                  )}
                </Form.List>
              </div>
            )}

            {/* ==================== СЕКЦИЯ: КОММЕНТАРИИ ==================== */}
            <SectionHeader 
              title="Комментарии" 
              icon={<FileTextOutlined />}
              sectionKey="comments"
              expanded={expandedSections.includes('comments')}
              onToggle={toggleSection}
            />
            
            {expandedSections.includes('comments') && (
              <div className="sat-section-content">
                
                {/* Комментарий */}
                <div className="sat-section">
                  <div className="sat-row-wrapper">
                    <div className="sat-row sat-1-col">
                      <div>
                        <div className="sat-legend">Комментарий</div>
                        <div className="sat-content">
                          <div className="sat-content-inner">
                            <Form.Item name="comment" noStyle>
                              <TextArea
                                placeholder={editMode ? 'Комментарий' : ''}
                                maxLength={2000}
                                readOnly={!editMode}
                                variant={editMode ? 'underlined' : 'borderless'}
                                autoSize={{ minRows: TEXTAREA_MIN_ROWS, maxRows: TEXTAREA_MAX_ROWS }}
                                className={editMode ? 'sat-canedit' : 'sat-notedit'}
                              />
                            </Form.Item>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Памятка в списке */}
                <div className="sat-section">
                  <div className="sat-row-wrapper">
                    <div className="sat-row sat-1-col">
                      <div>
                        <div className="sat-legend">Памятка в списке</div>
                        <div className="sat-content">
                          <div className="sat-content-inner">
                            <Form.Item name="commentinlist" noStyle>
                              <TextArea
                                placeholder={editMode ? 'Краткая памятка' : ''}
                                maxLength={500}
                                readOnly={!editMode}
                                variant={editMode ? 'underlined' : 'borderless'}
                                autoSize={{ minRows: 1, maxRows: 3 }}
                                className={editMode ? 'sat-canedit' : 'sat-notedit'}
                              />
                            </Form.Item>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== СЕКЦИЯ: СЛУЖЕБНАЯ ИНФОРМАЦИЯ ==================== */}
            <SectionHeader 
              title="Служебная информация" 
              icon={<SafetyCertificateOutlined />}
              sectionKey="service"
              expanded={expandedSections.includes('service')}
              onToggle={toggleSection}
            />
            
            {expandedSections.includes('service') && (
              <div className="sat-section-content">
                <Form.Item noStyle shouldUpdate>
                  {() => {
                    const curator = form.getFieldValue('curator');
                    const creator = form.getFieldValue('creator');
                    const list = form.getFieldValue('list');
                    
                    return (
                      <>
                        {/* Куратор и Автор */}
                        <div className="sat-section">
                          <div className="sat-row-wrapper">
                            <div className="sat-row sat-2-col">
                              <div>
                                <div className="sat-legend">Куратор</div>
                                <div className="sat-content">
                                  <div className="sat-content-inner">
                                    <Input
                                      value={getPersonFullName(curator)}
                                      readOnly
                                      disabled
                                      variant="borderless"
                                      className="sat-notedit"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div>
                                <div className="sat-legend">Автор записи</div>
                                <div className="sat-content">
                                  <div className="sat-content-inner">
                                    <Input
                                      value={getPersonFullName(creator)}
                                      readOnly
                                      disabled
                                      variant="borderless"
                                      className="sat-notedit"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Чёрный список */}
                        {list && (
                          <div className="sat-section">
                            <div className="sat-row-wrapper">
                              <div className="sat-row sat-1-col">
                                <div>
                                  <div className="sat-legend">⚠️ Чёрный список</div>
                                  <div className="sat-content">
                                    <div className="sat-content-inner">
                                      <Tag color="red">{list.typelist?.name}</Tag>
                                      <span style={{ marginLeft: 8, color: '#666' }}>
                                        {list.comment}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  }}
                </Form.Item>
              </div>
            )}

          </Form>
        </div>
      </Spin>
    </div>
  );
};


// =============================================================================
// КОМПОНЕНТ ЗАГОЛОВКА СЕКЦИИ
// =============================================================================

const SectionHeader = ({ title, icon, sectionKey, expanded, onToggle, badge }) => (
  <div 
    className={`sat-section-header ${expanded ? 'sat-expanded' : ''}`}
    onClick={() => onToggle(sectionKey)}
  >
    <div className="sat-section-header-left">
      <span className={`sat-trigger-btn ${expanded ? 'sat-expanded' : ''}`}>
        <ChevronRightIcon height={CHEVRON_SIZE} />
      </span>
      <span className="sat-section-icon">{icon}</span>
      <span className="sat-section-title">{title}</span>
      {badge > 0 && (
        <Tag color="blue" style={{ marginLeft: 8 }}>{badge}</Tag>
      )}
    </div>
  </div>
);


// =============================================================================
// КОМПОНЕНТ КАРТОЧКИ КОНТАКТА
// =============================================================================

const ContactCard = ({ 
  fieldName, 
  contact, 
  editMode, 
  form,
  onRemove,
  createNewContactPhone,
  createNewContactEmail,
}) => {
  const [expanded, setExpanded] = useState(false);
  const canDelete = editMode && String(contact?.id).startsWith('new_');
  
  const fullName = [
    contact?.lastname,
    contact?.name,
    contact?.middlename
  ].filter(Boolean).join(' ').trim() || 'Новый контакт';

  return (
    <div className={`sat-collapse-item ${expanded ? 'sat-expanded' : 'sat-collapsed'}`}>
      {/* Header */}
      <div className="sat-collapse-header" onClick={() => setExpanded(!expanded)}>
        <div className="sat-collapse-header-left">
          <span className={`sat-trigger-btn ${expanded ? 'sat-expanded' : ''}`}>
            <ChevronRightIcon height={CHEVRON_SIZE} />
          </span>
          <UserCircleIcon height={18} style={{ color: '#1890ff', marginRight: 6 }} />
          <div className="sat-header-text">
            <span className="sat-header-title">{fullName}</span>
            {contact?.occupy && (
              <span className="sat-header-date">— {contact.occupy}</span>
            )}
          </div>
        </div>
        
        <div className="sat-collapse-header-right">
          {canDelete && (
            <span 
              className="sat-delete-btn" 
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
            >
              <Button danger size="small" icon={<TrashIcon height={CHEVRON_SIZE} />} />
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="sat-collapse-body">
        <div className="sat-collapse-content">
          
          {/* ФИО */}
          <div className="sat-section">
            <div className="sat-row-wrapper">
              <div className="sat-row sat-3-col">
                <div>
                  <div className="sat-legend">Фамилия</div>
                  <div className="sat-content">
                    <div className="sat-content-inner">
                      <Form.Item name={[fieldName, 'lastname']} noStyle>
                        <Input
                          placeholder="Фамилия"
                          maxLength={100}
                          readOnly={!editMode}
                          variant={editMode ? 'underlined' : 'borderless'}
                          className={editMode ? 'sat-canedit' : 'sat-notedit'}
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="sat-legend">Имя</div>
                  <div className="sat-content">
                    <div className="sat-content-inner">
                      <Form.Item name={[fieldName, 'name']} noStyle>
                        <Input
                          placeholder="Имя"
                          maxLength={100}
                          readOnly={!editMode}
                          variant={editMode ? 'underlined' : 'borderless'}
                          className={editMode ? 'sat-canedit' : 'sat-notedit'}
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="sat-legend">Отчество</div>
                  <div className="sat-content">
                    <div className="sat-content-inner">
                      <Form.Item name={[fieldName, 'middlename']} noStyle>
                        <Input
                          placeholder="Отчество"
                          maxLength={100}
                          readOnly={!editMode}
                          variant={editMode ? 'underlined' : 'borderless'}
                          className={editMode ? 'sat-canedit' : 'sat-notedit'}
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Должность */}
          <div className="sat-section">
            <div className="sat-row-wrapper">
              <div className="sat-row sat-1-col">
                <div>
                  <div className="sat-legend">Должность</div>
                  <div className="sat-content">
                    <div className="sat-content-inner">
                      <Form.Item name={[fieldName, 'occupy']} noStyle>
                        <Input
                          placeholder="Должность"
                          maxLength={200}
                          readOnly={!editMode}
                          variant={editMode ? 'underlined' : 'borderless'}
                          className={editMode ? 'sat-canedit' : 'sat-notedit'}
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Телефоны контакта */}
          <Divider orientation="left" plain style={{ margin: '8px 0', fontSize: 12 }}>
            <PhoneOutlined /> Телефоны
          </Divider>
          
          <Form.List name={[fieldName, 'contactstelephones']}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name: phoneName }) => {
                  const phone = form.getFieldValue(['contacts', fieldName, 'contactstelephones', phoneName]);
                  if (phone?.deleted) return null;
                  
                  return (
                    <div key={key} className="sat-section">
                      <div className="sat-row-wrapper">
                        <div className="sat-row sat-3-col">
                          <div>
                            <div className="sat-legend">Номер</div>
                            <div className="sat-content">
                              <div className="sat-content-inner">
                                <Form.Item name={[phoneName, 'number']} noStyle>
                                  <Input
                                    placeholder="+7-XXX-XXX-XX-XX"
                                    maxLength={50}
                                    readOnly={!editMode}
                                    variant={editMode ? 'underlined' : 'borderless'}
                                    className={editMode ? 'sat-canedit' : 'sat-notedit'}
                                  />
                                </Form.Item>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="sat-legend">Доб.</div>
                            <div className="sat-content">
                              <div className="sat-content-inner">
                                <Form.Item name={[phoneName, 'ext']} noStyle>
                                  <Input
                                    placeholder="Доб."
                                    maxLength={10}
                                    readOnly={!editMode}
                                    variant={editMode ? 'underlined' : 'borderless'}
                                    className={editMode ? 'sat-canedit' : 'sat-notedit'}
                                  />
                                </Form.Item>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="sat-legend">Комментарий</div>
                            <div className="sat-content">
                              <div className="sat-content-inner">
                                <Form.Item name={[phoneName, 'comment']} noStyle>
                                  <Input
                                    placeholder="Комментарий"
                                    maxLength={100}
                                    readOnly={!editMode}
                                    variant={editMode ? 'underlined' : 'borderless'}
                                    className={editMode ? 'sat-canedit' : 'sat-notedit'}
                                  />
                                </Form.Item>
                              </div>
                            </div>
                          </div>
                        </div>
                        {editMode && String(phone?.id).startsWith('new_') && (
                          <div className="sat-action-block">
                            <Button
                              type="text"
                              danger
                              size="small"
                              icon={<DeleteOutlined />}
                              onClick={() => remove(phoneName)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {editMode && (
                  <Button
                    type="link"
                    size="small"
                    onClick={() => add(createNewContactPhone(contact?.id))}
                    icon={<PlusOutlined />}
                  >
                    Добавить телефон
                  </Button>
                )}
              </>
            )}
          </Form.List>

          {/* Мобильные контакта */}
          <Divider orientation="left" plain style={{ margin: '8px 0', fontSize: 12 }}>
            <PhoneOutlined /> Мобильные
          </Divider>
          
          <Form.List name={[fieldName, 'contactmobiles']}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name: mobileName }) => {
                  const mobile = form.getFieldValue(['contacts', fieldName, 'contactmobiles', mobileName]);
                  if (mobile?.deleted) return null;
                  
                  return (
                    <div key={key} className="sat-section">
                      <div className="sat-row-wrapper">
                        <div className="sat-row sat-2-col">
                          <div>
                            <div className="sat-legend">Номер</div>
                            <div className="sat-content">
                              <div className="sat-content-inner">
                                <Form.Item name={[mobileName, 'number']} noStyle>
                                  <Input
                                    placeholder="+7-XXX-XXX-XX-XX"
                                    maxLength={50}
                                    readOnly={!editMode}
                                    variant={editMode ? 'underlined' : 'borderless'}
                                    className={editMode ? 'sat-canedit' : 'sat-notedit'}
                                  />
                                </Form.Item>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="sat-legend">Комментарий</div>
                            <div className="sat-content">
                              <div className="sat-content-inner">
                                <Form.Item name={[mobileName, 'comment']} noStyle>
                                  <Input
                                    placeholder="Комментарий"
                                    maxLength={100}
                                    readOnly={!editMode}
                                    variant={editMode ? 'underlined' : 'borderless'}
                                    className={editMode ? 'sat-canedit' : 'sat-notedit'}
                                  />
                                </Form.Item>
                              </div>
                            </div>
                          </div>
                        </div>
                        {editMode && String(mobile?.id).startsWith('new_') && (
                          <div className="sat-action-block">
                            <Button
                              type="text"
                              danger
                              size="small"
                              icon={<DeleteOutlined />}
                              onClick={() => remove(mobileName)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {editMode && (
                  <Button
                    type="link"
                    size="small"
                    onClick={() => add(createNewContactPhone(contact?.id))}
                    icon={<PlusOutlined />}
                  >
                    Добавить мобильный
                  </Button>
                )}
              </>
            )}
          </Form.List>

          {/* Email контакта */}
          <Divider orientation="left" plain style={{ margin: '8px 0', fontSize: 12 }}>
            <MailOutlined /> Email
          </Divider>
          
          <Form.List name={[fieldName, 'contactemails']}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name: emailName }) => {
                  const email = form.getFieldValue(['contacts', fieldName, 'contactemails', emailName]);
                  if (email?.deleted) return null;
                  
                  return (
                    <div key={key} className="sat-section">
                      <div className="sat-row-wrapper">
                        <div className="sat-row sat-2-col">
                          <div>
                            <div className="sat-legend">Email</div>
                            <div className="sat-content">
                              <div className="sat-content-inner">
                                <Form.Item name={[emailName, 'email']} noStyle>
                                  <Input
                                    placeholder="email@example.com"
                                    maxLength={100}
                                    readOnly={!editMode}
                                    variant={editMode ? 'underlined' : 'borderless'}
                                    className={editMode ? 'sat-canedit' : 'sat-notedit'}
                                  />
                                </Form.Item>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="sat-legend">Комментарий</div>
                            <div className="sat-content">
                              <div className="sat-content-inner">
                                <Form.Item name={[emailName, 'comment']} noStyle>
                                  <Input
                                    placeholder="Комментарий"
                                    maxLength={200}
                                    readOnly={!editMode}
                                    variant={editMode ? 'underlined' : 'borderless'}
                                    className={editMode ? 'sat-canedit' : 'sat-notedit'}
                                  />
                                </Form.Item>
                              </div>
                            </div>
                          </div>
                        </div>
                        {editMode && String(email?.id).startsWith('new_') && (
                          <div className="sat-action-block">
                            <Button
                              type="text"
                              danger
                              size="small"
                              icon={<DeleteOutlined />}
                              onClick={() => remove(emailName)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {editMode && (
                  <Button
                    type="link"
                    size="small"
                    onClick={() => add(createNewContactEmail(contact?.id))}
                    icon={<PlusOutlined />}
                  >
                    Добавить email
                  </Button>
                )}
              </>
            )}
          </Form.List>

          {/* Комментарий контакта */}
          <div className="sat-section" style={{ marginTop: 8 }}>
            <div className="sat-row-wrapper">
              <div className="sat-row sat-1-col">
                <div>
                  <div className="sat-legend">Комментарий</div>
                  <div className="sat-content">
                    <div className="sat-content-inner">
                      <Form.Item name={[fieldName, 'comment']} noStyle>
                        <TextArea
                          placeholder={editMode ? 'Комментарий к контакту' : ''}
                          maxLength={500}
                          readOnly={!editMode}
                          variant={editMode ? 'underlined' : 'borderless'}
                          autoSize={{ minRows: 1, maxRows: 3 }}
                          className={editMode ? 'sat-canedit' : 'sat-notedit'}
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};


// =============================================================================
// УТИЛИТА ДЛЯ СБОРА ДАННЫХ ПЕРЕД СОХРАНЕНИЕМ
// =============================================================================

export const collectMainForSave = (form, originalData) => {
  if (!originalData) return null;
  
  const values = form.getFieldsValue();
  const result = {
    changed: false,
    fields: {},
    phones: [],
    emails: [],
    addresses: [],
    contacts: [],
  };

  // Простые поля
  const simpleFields = [
    'name', 'middlename', 'site', 'inn', 'kindofactivity', 'source',
    'comment', 'commentinlist',
    'id8an_profiles', 'id8an_status', 'id8an_relations', 'id8an_customertypes',
    'id8an_dept', 'id8org_regions', 'id8org_towns', 'id8an_statusmoney', 'id8an_conveyance'
  ];

  simpleFields.forEach(field => {
    if (values[field] !== originalData[field]) {
      result.changed = true;
      result.fields[field] = values[field];
    }
  });

  // Телефоны
  result.phones = collectArrayChanges(
    values.phones || [],
    originalData.phones || [],
    ['number', 'ext', 'comment', 'deleted']
  );
  if (result.phones.length > 0) result.changed = true;

  // Emails
  result.emails = collectArrayChanges(
    values.emails || [],
    originalData.emails || [],
    ['email', 'comment', 'deleted']
  );
  if (result.emails.length > 0) result.changed = true;

  // Адреса
  result.addresses = collectArrayChanges(
    values.addresses || [],
    originalData.address || [],
    ['address', 'post_index', 'comment', 'deleted']
  );
  if (result.addresses.length > 0) result.changed = true;

  // Контакты (сложная структура)
  result.contacts = collectContactsChanges(
    values.contacts || [],
    originalData.contacts || []
  );
  if (result.contacts.length > 0) result.changed = true;

  return result;
};

// Сбор изменений массива
const collectArrayChanges = (current, original, fields) => {
  const result = [];

  current.forEach(item => {
    if (!item) return;
    
    // Новый элемент
    if (String(item.id).startsWith('new_')) {
      if (!item.deleted) {
        result.push({ ...item, command: 'create' });
      }
      return;
    }

    // Существующий элемент
    const orig = original.find(o => o.id === item.id);
    if (!orig) return;

    const isChanged = fields.some(f => item[f] !== orig[f]);
    if (isChanged) {
      result.push({
        ...item,
        command: item.deleted ? 'delete' : 'update'
      });
    }
  });

  return result;
};

// Сбор изменений контактов
const collectContactsChanges = (current, original) => {
  const result = [];

  current.forEach(contact => {
    if (!contact) return;

    const contactResult = {
      ...contact,
      phones: [],
      mobiles: [],
      emails: [],
    };

    // Новый контакт
    if (String(contact.id).startsWith('new_')) {
      if (!contact.deleted) {
        contactResult.command = 'create';
        result.push(contactResult);
      }
      return;
    }

    // Существующий контакт
    const orig = original.find(o => o.id === contact.id);
    if (!orig) return;

    const contactFields = ['lastname', 'name', 'middlename', 'occupy', 'comment', 'deleted'];
    const isContactChanged = contactFields.some(f => contact[f] !== orig[f]);

    // Телефоны контакта
    contactResult.phones = collectArrayChanges(
      contact.contactstelephones || [],
      orig.contactstelephones || [],
      ['number', 'ext', 'comment', 'deleted']
    );

    // Мобильные контакта
    contactResult.mobiles = collectArrayChanges(
      contact.contactmobiles || [],
      orig.contactmobiles || [],
      ['number', 'comment', 'deleted']
    );

    // Email контакта
    contactResult.emails = collectArrayChanges(
      contact.contactemails || [],
      orig.contactemails || [],
      ['email', 'comment', 'deleted']
    );

    const hasNestedChanges = 
      contactResult.phones.length > 0 ||
      contactResult.mobiles.length > 0 ||
      contactResult.emails.length > 0;

    if (isContactChanged || hasNestedChanges) {
      contactResult.command = contact.deleted ? 'delete' : 'update';
      result.push(contactResult);
    }
  });

  return result;
};


export default MainTabForm;
