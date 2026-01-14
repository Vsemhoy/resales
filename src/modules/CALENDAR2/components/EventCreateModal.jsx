/**
 * EventCreateModal.jsx
 * 
 * Модальное окно для создания события из календаря
 * 
 * Доступные типы для создания:
 * - 6: Встреча
 * - 7: Звонок
 * - 10: Заметка (для компании)
 * - 13: Проект
 * - 14: Приватная заметка
 * - 15: Публичная заметка
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Modal, Form, Select, Input, DatePicker, 
  TimePicker, Button, Space, Divider, Radio,
  Tooltip
} from 'antd';
import {
  PhoneOutlined,
  TeamOutlined,
  FileTextOutlined,
  ProjectOutlined,
  LockOutlined,
  GlobalOutlined,
  EditOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { 
  EVENT_TYPES, 
  CREATABLE_EVENT_TYPES,
  MOCK_ORGANIZATIONS,
} from './mock/CALENDARMOCK';
import CalendarModalFormNote from './ModalForms/CalendarModalFormNote';
import CalendarModalFormCall from './ModalForms/CalendarModalFormCall';
import CalendarModalFormProject from './ModalForms/CalendarModalFormProject';
import CalendarModalFormMyNotes from './ModalForms/CalendarModalFormMyNotes';
import { CSRF_TOKEN, PRODMODE } from '../../../config/config';
import { PROD_AXIOS_INSTANCE } from '../../../config/Api';
import { ORG_ERECTORS_MOCK } from '../../TORG_PAGE/components/mock/ORGPAGEMOCK';

const { TextArea } = Input;
const { Option } = Select;

// Иконки для типов
const TYPE_ICONS = {
  6: <TeamOutlined />,
  7: <PhoneOutlined />,
  10: <FileTextOutlined />,
  13: <ProjectOutlined />,
  14: <LockOutlined />,
  15: <GlobalOutlined />,
};



const EventCreateModal = ({
  visible,
  date,
  onCancel,
  onCreate,
  organizations,
  userdata,
  companies,
  selects
}) => {
  const [form] = Form.useForm();
  const [selectedType, setSelectedType] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [mountOrgList, setMountOrgList] = useState([]);
  const [erector, setErector] = useState('');
  const [searchErector, setSearchErector] = useState(null);

  const [formData, setFormData] = useState({});
  const [formDate, setFormDate] = useState(dayjs());
  const [dateDisabled, setDateDisabled] = useState(true);
  


  // Сброс формы при открытии
  useEffect(() => {
    if (visible) {
      form.resetFields();
      setSelectedType(null);
      
      // Устанавливаем дату
      if (date) {
        form.setFieldsValue({ 
          event_date: date,
          event_time: dayjs().hour(10).minute(0),
        });
      }
    }
  }, [visible, date, form]);

  useEffect(() => {
      console.log('selectedType', selectedType)
  }, [selectedType]);

  useEffect(() => {
    console.log('date', date)
  }, [date]);

  // Доступные типы для создания
  const creatableTypes = useMemo(() => {
    return EVENT_TYPES.filter(t => CREATABLE_EVENT_TYPES.includes(t.id));
  }, []);

  // Нужна ли организация для выбранного типа
  const needsOrganization = useMemo(() => {
    return [6, 7, 10, 13].includes(selectedType);
  }, [selectedType]);

  // Обработчик выбора типа
  const handleTypeSelect = (typeId) => {
    setSelectedType(typeId);
    form.setFieldsValue({ type: typeId });
  };


  const get_orgautofill_action = async (id) => {
    if (!searchErector){ return; }
    if (PRODMODE) {
      try {
        let response = await PROD_AXIOS_INSTANCE.post('/api/sales/passportselects', {
          data: {
            erector: searchErector,
          },
          _token: CSRF_TOKEN,
        });
        if (response.data) {
          setMountOrgList(response.data.selects.erector);
          // if (props.changed_user_data){
          //     props.changed_user_data(response.data);
          // }
        }
      } catch (e) {
        console.log(e);
      } finally {
      }
    } else {
      setMountOrgList(ORG_ERECTORS_MOCK);
    }
  };


  // Отправка формы
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const eventData = {
        ...values,
        event_date: values.event_date.format('YYYY-MM-DD'),
        event_time: values.event_time?.format('HH:mm:ss') || null,
        user_id: userdata?.user?.id,
        user_name: `${userdata?.user?.surname || ''} ${(userdata?.user?.name || '')[0] || ''}.${(userdata?.user?.secondname || '')[0] || ''}.`.trim(),
        id_company: userdata?.user?.id_company,
        department_id: userdata?.user?.id_departament,
        private: values.type === 14 ? 1 : 0,
      };

      // Получаем название организации
      if (values.org_id) {
        const org = organizations.find(o => o.id === values.org_id);
        eventData.org_name = org?.name || null;
      }

      await onCreate(eventData);
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    console.log('formData', formData)
  }, [formData]);

  useEffect(() => {
    setFormDate(date);
  }, [date]);

  useEffect(() => {
    if (!formDate) return;
    if (formDate.unix() < dayjs().subtract(2, "D").unix()){
      // alert("Нельзя установить дату меньше вчерашней");
      setFormDate(dayjs());
    }
  }, [formDate]);

  return ( 
    <Modal
      open={visible}
      title="Создать событие"
      onCancel={onCancel}
      footer={null}
      width={520}
      className="event-create-modal"
      destroyOnClose
    >
      <div className="event-create-content">
        {/* Выбор типа события */}
        {!selectedType ? (
          <div className="event-type-selector">
            <div className="event-type-title">
              Выберите тип события
            </div>
            <div className="event-type-grid">
              {creatableTypes.map(type => (
                
                <div
                  key={type.id}
                  className="event-type-card"
                  style={{ 
                    borderColor: type.color,
                    backgroundColor: `${type.color}20`,
                  }}
                  onClick={() => handleTypeSelect(type.id)}
                >
                  <div 
                    className="event-type-card-icon"
                    style={{ color: type.color }}
                    
                  >
                    {TYPE_ICONS[type.id]}
                  </div>
                  <div className="event-type-card-name">{type.name}</div>
                  <div className="event-type-card-hint">{type.title}</div>
                </div>
                  
              ))}
            </div>
          </div>
        ) : (
          <div className="event-form-container">

            {/* Кнопка назад к выбору типа */}
            <div className="event-form-back">
              <Button 
                type="link" 
                onClick={() => setSelectedType(null)}
              >
                ← Выбрать другой тип
              </Button>
              <Tooltip
                title={(selectedType === 15 && "Публичные заметки могут видеть все пользователи модуля")
                  || (selectedType === 14 && "Персональные заметки видны только вам")
                }>
              <div 
                className="event-form-type-badge"
                style={{ 
                  backgroundColor: EVENT_TYPES.find(t => t.id === selectedType)?.color 
                }}
              >
                {TYPE_ICONS[selectedType]}
                {EVENT_TYPES.find(t => t.id === selectedType)?.name}
              </div>
              </Tooltip>
            </div>

            <Divider style={{ margin: '12px 0' }} />

            {/* Форма */}

            <div className='event-form-toolbar'>
                <p></p>
                <span>Целевая компания</span>
                <Select
                  // size="small"
                  // variant="borderless"
                  allowClear={true}
                  showSearch={true}
                  optionFilterProp="children"
                  onSearch={(et) => {
                    setSearchErector(et);
                  }}
                  required={false}
                  value={erector}
                  placeholder={'Название организации'}
                  onChange={(ev) => {
                    setErector(ev);
                  }}
                  style={{width: '100%'}}
                  variant={'underlined'}
                >
                  {mountOrgList &&
                    mountOrgList?.map((opt) => (
                      <Select.Option key={'olokm' + opt.value} value={opt.value}>
                        {opt.label}
                      </Select.Option>
                    ))}
                    
                </Select>
            </div>
            
            {selectedType === 10 && (
              <CalendarModalFormNote
                  date={date}
                  on_change={setFormData}
                  companies={companies}
                  selects={selects}
                />
            )}
            {selectedType === 6 && (
              <CalendarModalFormCall
                  type={"meeting"}
                  date={date}
                  on_change={setFormData}
                  companies={companies}
                  selects={selects}
                />
            )}
            {selectedType === 7 && (
              <CalendarModalFormCall
                  type={"call"}
                  date={date}
                  on_change={setFormData}
                  companies={companies}
                  selects={selects}
                />
            )}
            {selectedType === 13 && (
              <CalendarModalFormProject
                  date={date}
                  on_change={setFormData}
                  companies={companies}
                  selects={selects}
                />
            )}
            {selectedType === 14 && (
              <CalendarModalFormMyNotes
                  date={date}
                  on_change={setFormData}
                  is_private={false}
                  companies={companies}
                  selects={selects}
                />
            )}
            {selectedType === 15 && (
              <CalendarModalFormMyNotes
                  date={date}
                  on_change={setFormData}
                  is_private={true}
                  companies={companies}
                  selects={selects}
                />
            )}

            <div >
               <span>Дата</span> <span onClick={()=>{setDateDisabled(!dateDisabled)}}><EditOutlined  /></span>
                          <DatePicker value={formDate} 
                            showTime
                            onChange={setFormDate}
                            variant={'underlined'}
                            disabled={dateDisabled} style={{ width: '100%' }} />
              <p></p>
              <div className='sa-flex-space'>
                <div></div>
                <Button >Сохранить</Button>
              </div>
            </div>

            {selectedType === 100 && (
               <Form
                form={form}
                layout="vertical"
                requiredMark={false}
              >
                <Form.Item name="type" hidden>
                  <Input />
                </Form.Item>

                {/* Дата и время */}
                <Space style={{ width: '100%' }} size="middle">
                  <Form.Item
                    name="event_date"
                    label="Дата"
                    rules={[{ required: true, message: 'Укажите дату' }]}
                    style={{ flex: 1 }}
                  >
                    <DatePicker 
                      style={{ width: '100%' }}
                      format="DD.MM.YYYY"
                      placeholder="Выберите дату"
                    />
                  </Form.Item>

                  <Form.Item
                    name="event_time"
                    label="Время"
                    style={{ flex: 1 }}
                  >
                    <TimePicker 
                      style={{ width: '100%' }}
                      format="HH:mm"
                      minuteStep={15}
                      placeholder="Выберите время"
                    />
                  </Form.Item>
                </Space>

                {/* Организация (если нужна) */}
                {needsOrganization && (
                  <Form.Item
                    name="org_id"
                    label="Организация"
                    rules={[{ required: true, message: 'Выберите организацию' }]}
                  >
                    <Select
                      showSearch
                      placeholder="Начните вводить название..."
                      filterOption={(input, option) =>
                        option.children.toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {organizations.map(org => (
                        <Option key={org.id} value={org.id}>
                          {org.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                )}

                {/* Тема/Название */}
                <Form.Item
                  name="theme"
                  label={selectedType === 13 ? 'Название проекта' : 'Тема'}
                  rules={[{ required: true, message: 'Укажите тему' }]}
                >
                  <Input 
                    placeholder={
                      selectedType === 7 ? 'Тема звонка...' :
                      selectedType === 6 ? 'Тема встречи...' :
                      selectedType === 13 ? 'Название проекта...' :
                      'Тема заметки...'
                    }
                    maxLength={200}
                  />
                </Form.Item>

                {/* Контактное лицо (для звонков и встреч) */}
                {[6, 7].includes(selectedType) && (
                  <Space style={{ width: '100%' }} size="middle">
                    <Form.Item
                      name="subscriber"
                      label="Контактное лицо"
                      style={{ flex: 2 }}
                    >
                      <Input placeholder="ФИО" maxLength={100} />
                    </Form.Item>
                    
                    <Form.Item
                      name="phone"
                      label="Телефон"
                      style={{ flex: 1 }}
                    >
                      <Input placeholder="+7..." maxLength={20} />
                    </Form.Item>
                  </Space>
                )}

                {/* Описание/Заметка */}
                <Form.Item
                  name="content"
                  label={selectedType === 7 ? 'Результат звонка' : 'Описание'}
                >
                  <TextArea
                    placeholder={
                      selectedType === 7 ? 'Результат разговора...' :
                      selectedType === 6 ? 'Итоги встречи...' :
                      'Текст заметки...'
                    }
                    autoSize={{ minRows: 3, maxRows: 6 }}
                    maxLength={2000}
                    showCount
                  />
                </Form.Item>

                {/* Кнопки */}
                <Form.Item style={{ marginBottom: 0, marginTop: 16 }}>
                  <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                    <Button onClick={onCancel}>
                      Отмена
                    </Button>
                    <Button 
                      type="primary" 
                      onClick={handleSubmit}
                      loading={submitting}
                    >
                      Создать
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            )}
           


          </div>
        )}
      </div>
    </Modal>
  );
};

export default EventCreateModal;
