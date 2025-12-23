/**
 * CallsTabForm.jsx - Вкладка звонков/встреч на Ant Design Form
 * 
 * АРХИТЕКТУРА:
 * - Один Form.useForm() на всю вкладку (передаётся от родителя)
 * - Form.List для массива звонков/встреч
 * - Данные хранятся в форме, не в локальных useState
 * - calls и meetings объединяются в один список с полем type
 * 
 * ПРАВИЛА:
 * - Чужие записи редактировать нельзя
 * - Свои существующие записи удалять нельзя
 * - Новые записи (id начинается с 'new_') можно удалять
 * 
 * СТИЛИ: используем префикс sat- (orgpage-forms.css)
 */

import React, { useEffect, useState, useCallback} from 'react';
import { 
  Form, Button, Input, DatePicker, Pagination, 
  Spin, Empty, Select, message, 
  AutoComplete
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ChevronRightIcon, TrashIcon, PhoneIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import debounce from 'lodash/debounce';

import { PROD_AXIOS_INSTANCE } from '../../../../config/Api';
import { CSRF_TOKEN, PRODMODE } from '../../../../config/config';
import { MODAL_CALLS_LIST } from '../../../ORG_LIST/components/mock/MODALCALLSTABMOCK';
import { ANTD_PAGINATION_LOCALE } from '../../../../config/Localization';

import '../style/orgpage-forms.css';

const { TextArea } = Input;

// Конфиг
const TEXTAREA_MIN_ROWS = 3;
const TEXTAREA_MAX_ROWS = 10;
const CHEVRON_SIZE = 16;

// Типы записей
const CALL_TYPES = [
  { value: 'call', label: 'Звонок', icon: PhoneIcon },
  { value: 'meeting', label: 'Встреча', icon: UserGroupIcon },
];

const CallsTabForm = ({ 
  form,           // Form instance от родителя
  orgId,          // ID организации
  editMode,       // Режим редактирования
  isActive,       // Активна ли вкладка
  userdata,       // Данные пользователя
  onDataChange,   // Callback при изменении данных
  _selects,
  _departs
}) => {
  // Состояния загрузки и пагинации
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [total, setTotal] = useState(0);
  
  // Оригинальные данные для сравнения
  const [originalData, setOriginalData] = useState([]);
  
  // UI состояния
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [newItemLoading, setNewItemLoading] = useState(false);

  // ===================== ЗАГРУЗКА ДАННЫХ =====================
  
    const [selects, setSelects] = useState([]);
    const [departs, setDeparts] = useState([]);


    const [autocomName, setAutocomName] = useState('');
    const [autocomPhone, setAutocomPhone] = useState('');
    
    useEffect(() => {
      console.log(_selects);
        if (_selects){
          setSelects(_selects);
        }
    }, [_selects]);

    useEffect(() => {
      if (_departs){
        setDeparts(_departs);
      }
    }, [_departs]);


  const loadCalls = useCallback(async () => {
    if (!orgId) return;
    
    setLoading(true);
    try {
      if (PRODMODE) {
        const response = await PROD_AXIOS_INSTANCE.post(
          `/api/sales/v2/orglist/${orgId}/c`,
          {
            data: { page: currentPage, limit: pageSize },
            _token: CSRF_TOKEN,
          }
        );
        
        if (response.data?.content) {
          // Объединяем calls и meetings в один массив
    
          const calls = (response.data.content.calls || []).map(c => ({ ...c, type: 'call', date: c.date ? dayjs(c.date) : null }));
          const meetings = (response.data.content.meetings || []).map(m => ({ ...m, type: 'meeting' , date: m.date ? dayjs(m.date) : null }));
          const combined = [...calls, ...meetings].sort((a, b) => 
            dayjs(b.date).valueOf() - dayjs(a.date).valueOf()
          );
          
          console.log(calls, 'calls');

          setOriginalData(JSON.parse(JSON.stringify(combined)));
          setTotal(response.data.total || combined.length);
          
          form.setFieldsValue({ 
            existingCalls: combined,
            newCalls: [] 
          });
        }
      } else {
        // DEV MODE - используем мок
        const calls = (MODAL_CALLS_LIST.calls || []).map(c => ({ ...c, type: 'call', date: c.date ? dayjs(c.date) : null }));
        const meetings = (MODAL_CALLS_LIST.meetings || []).map(m => ({ ...m, type: 'meeting' , date: m.date ? dayjs(m.date) : null }));
        const combined = [...calls, ...meetings].sort((a, b) => 
          dayjs(b.date).valueOf() - dayjs(a.date).valueOf()
        );
        
        setOriginalData(JSON.parse(JSON.stringify(combined)));
        setTotal(combined.length);
        
        form.setFieldsValue({ 
          existingCalls: combined,
          newCalls: [] 
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки звонков:', error);
      message.error('Не удалось загрузить звонки');
    } finally {
      setLoading(false);
    }
  }, [orgId, currentPage, pageSize, form]);

  // Загрузка при изменении orgId или пагинации
  useEffect(() => {
    if (orgId) {
      const timer = setTimeout(loadCalls, 300);
      return () => clearTimeout(timer);
    }
  }, [orgId, currentPage, pageSize, loadCalls]);

  // Сброс при смене организации
  useEffect(() => {
    if (!orgId) {
      form.setFieldsValue({ existingCalls: [], newCalls: [] });
      setOriginalData([]);
      setExpandedKeys([]);
    }
  }, [orgId, form]);

  // Скролл вверх при активации
  useEffect(() => {
    if (isActive && editMode) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isActive, editMode]);

  // ===================== СОЗДАНИЕ НОВОЙ ЗАПИСИ =====================
  
  const handleAddCall = useCallback((type = 'call') => {
    if (!userdata?.user) return;
    
    setNewItemLoading(true);
    
    setTimeout(() => {
      const newCall = {
        command: 'create',
        type,
        id: `new_${dayjs().unix()}${dayjs().millisecond()}`,
        id_orgs: orgId,
        id8staff_list: userdata.user.id,
        id8ref_departaments: userdata.user.id_departament || 0,
        date: dayjs(),
        next_call_date: null,
        subscriber: '',
        post: '',
        phone: '',
        theme: '',
        note: '',
        result: '',
        deleted: 0,
        creator: {
          id: userdata.user.id,
          surname: userdata.user.surname,
          name: userdata.user.name,
          secondname: userdata.user.secondname,
        },
        departament: userdata.user.departament || null,
      };
      
      const currentNewCalls = form.getFieldValue('newCalls') || [];
      form.setFieldsValue({ 
        newCalls: [newCall, ...currentNewCalls] 
      });
      
      // Разворачиваем новую запись
      setExpandedKeys(prev => [...prev, newCall.id]);
      onDataChange?.('c', true);
      setNewItemLoading(false);
    }, 300);
  }, [orgId, userdata, form, onDataChange]);

  // ===================== УДАЛЕНИЕ ЗАПИСИ =====================
  
  const handleDeleteNewCall = useCallback((callId, removeFunc) => {
    removeFunc();
    const remainingNew = (form.getFieldValue('newCalls') || []).filter(c => c?.id !== callId);
    onDataChange?.('c', remainingNew.length > 0);
  }, [form, onDataChange]);

  // ===================== ПРОВЕРКА ПРАВ =====================
  
  const canEditCall = useCallback((call) => {
    if (!userdata?.user?.id) return false;
    return userdata.user.id === call?.id8staff_list || 
           userdata.user.id === call?.creator?.id;
  }, [userdata]);

  // ===================== ХЕЛПЕРЫ =====================
  
  const getCreatorFullName = (creator) => {
    if (!creator) return '';
    return `${creator.surname || ''} ${creator.name || ''} ${creator.secondname || ''}`.trim();
  };

  const getCreatorShortName = (creator) => {
    if (!creator) return '';
    const surname = creator.surname || '';
    const nameInitial = creator.name ? creator.name[0] + '.' : '';
    const secondInitial = creator.secondname ? creator.secondname[0] + '.' : '';
    return `${surname} ${nameInitial}${secondInitial}`.trim();
  };

  const formatCallDate = (date) => {
    if (!date) return '';
    const d = dayjs(date);
    const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    return `${d.format('DD')} ${months[d.month()]} ${d.format('YYYY')}`;
  };

  const getTypeLabel = (type) => {
    return CALL_TYPES.find(t => t.value === type)?.label || type;
  };

  const toggleExpanded = (callId) => {
    setExpandedKeys(prev => 
      prev.includes(callId) 
        ? prev.filter(k => k !== callId)
        : [...prev, callId]
    );
  };

  const handleFieldChange = useCallback(
    debounce(() => {
      const cfs = collectCallsForSave(form, originalData);
      console.log(cfs);
      onDataChange?.('c', true, { orig: originalData, chan: cfs });
    }, 500),
    [onDataChange, originalData],
  );

  // ===================== РЕНДЕР =====================
  
  if (!isActive) {
    return <div className="sat-tab-hidden" />;
  }

  return (
    <div className="sat-tab-container">
      <Spin spinning={loading}>
        {/* Toolbar */}
        <div className="sat-tab-toolbar">
          <Pagination
            disabled={editMode}
            size="small"
            current={currentPage}
            pageSize={pageSize}
            pageSizeOptions={[50, 100]}
            locale={ANTD_PAGINATION_LOCALE}
            showQuickJumper
            total={total}
            onChange={(page, size) => {
              if (page !== currentPage) setCurrentPage(page);
              if (size !== pageSize) setPageSize(size);
            }}
          />
          
          {editMode && (
            <div className="sat-toolbar-buttons">
              <Button
                type="primary"
                icon={<PhoneIcon height={14} />}
                onClick={() => handleAddCall('call')}
                disabled={newItemLoading || (form.getFieldValue('newCalls')?.length || 0) > 7}
                loading={newItemLoading}
              >
                Добавить звонок
              </Button>
              <Button
                type="primary"
                icon={<UserGroupIcon height={14} />}
                onClick={() => handleAddCall('meeting')}
                disabled={newItemLoading || (form.getFieldValue('newCalls')?.length || 0) > 7}
                loading={newItemLoading}
                style={{ marginLeft: 8 }}
              >
                Добавить встречу
              </Button>
            </div>
          )}
        </div>

        {/* Контент */}
        <div className="sat-tab-content">
          <Form 
            form={form} 
            layout="vertical"
            onValuesChange={handleFieldChange}
          >
            {/* Новые записи */}
            <Form.Item noStyle shouldUpdate>
              {() => {
                const newCalls = form.getFieldValue('newCalls') || [];
                if (newCalls.length === 0) return null;
                
                return (
                  <Spin spinning={newItemLoading}>
                    <div className="sat-stack-new">
                      <div className="sat-stack-new-header">Новые записи</div>
                      
                      <Form.List name="newCalls">
                        {(fields, { remove }) => (
                          <>
                            {fields.map(({ key, name }) => {
                              const call = form.getFieldValue(['newCalls', name]);
                              const isExpanded = expandedKeys.includes(call?.id);
                              
                              return (
                                <CallCard
                                  key={key}
                                  fieldName={name}
                                  prefix="newCalls"
                                  call={call}
                                  isExpanded={isExpanded}
                                  canEdit={true}
                                  canDelete={true}
                                  onToggle={() => toggleExpanded(call?.id)}
                                  onDelete={() => handleDeleteNewCall(call?.id, () => remove(name))}
                                  getCreatorFullName={getCreatorFullName}
                                  getCreatorShortName={getCreatorShortName}
                                  formatCallDate={formatCallDate}
                                  getTypeLabel={getTypeLabel}
                                  _selects={selects}
                                  _departs={departs}
                                />
                              );
                            })}
                          </>
                        )}
                      </Form.List>
                    </div>
                  </Spin>
                );
              }}
            </Form.Item>

            {/* Существующие записи */}
            <Form.Item noStyle shouldUpdate>
              {() => {
                const existingCalls = form.getFieldValue('existingCalls') || [];
                const newCalls = form.getFieldValue('newCalls') || [];
                
                if (existingCalls.length === 0 && newCalls.length === 0) {
                  return <Empty description="Нет звонков и встреч" />;
                }
                
                if (existingCalls.length === 0) return null;
                
                return (
                  <div className="sat-stack-existing">
                    <Form.List name="existingCalls">
                      {(fields) => (
                        <>
                          {fields.map(({ key, name }) => {
                            const call = form.getFieldValue(['existingCalls', name]);
                            const isExpanded = expandedKeys.includes(call?.id);
                            const canEdit = editMode && canEditCall(call);
                            const isDeleted = call?.deleted === 1;
                            
                            return (
                              <CallCard
                                key={key}
                                fieldName={name}
                                prefix="existingCalls"
                                call={call}
                                isExpanded={isExpanded}
                                isDeleted={isDeleted}
                                canEdit={canEdit}
                                canDelete={false}
                                onToggle={() => toggleExpanded(call?.id)}
                                getCreatorFullName={getCreatorFullName}
                                getCreatorShortName={getCreatorShortName}
                                formatCallDate={formatCallDate}
                                getTypeLabel={getTypeLabel}
                                _selects={selects}
                                _departs={departs}
                              />
                            );
                          })}
                        </>
                      )}
                    </Form.List>
                  </div>
                );
              }}
            </Form.Item>
          </Form>
        </div>
      </Spin>
    </div>
  );
};


// =============================================================================
// КОМПОНЕНТ КАРТОЧКИ ЗВОНКА/ВСТРЕЧИ
// =============================================================================

const CallCard = ({
  fieldName,
  call,
  isExpanded,
  isDeleted,
  canEdit,
  canDelete,
  onToggle,
  onDelete,
  getCreatorFullName,
  getCreatorShortName,
  formatCallDate,
  getTypeLabel,
  _selects,
  _departs
}) => {
  const theme = call?.theme || '';
  const date = call?.date ? dayjs(call.date) : null;
  const nextCallDate = call?.next_call_date ? dayjs(call.next_call_date) : null;
  const type = call?.type || 'call';
  

    const [selects, setSelects] = useState([]);
    const [departs, setDeparts] = useState([]);
    
    useEffect(() => {
      console.log(_selects);
      if (_selects){
        setSelects(_selects);
      }
    }, [_selects]);
    
    useEffect(() => {
      console.log(_departs);
      if (_departs){
        setDeparts(_departs);
      }
    }, [_departs]);

  // Определяем классы
  const itemClasses = [
    'sat-collapse-item',
    isExpanded ? 'sat-expanded' : 'sat-collapsed',
    isDeleted ? 'sat-deleted' : '',
    !canEdit ? 'sat-readonly' : '',
  ].filter(Boolean).join(' ');

  // Иконка типа
  const TypeIcon = type === 'meeting' ? UserGroupIcon : PhoneIcon;

  return (
    <div className={itemClasses}>
      {/* Header */}
      <div className="sat-collapse-header" onClick={onToggle}>
        <div className="sat-collapse-header-left">
          {/* Trigger */}
          <span className={`sat-trigger-btn ${isExpanded ? 'sat-expanded' : ''}`}>
            <ChevronRightIcon height={CHEVRON_SIZE} />
          </span>
          
          {/* Type Icon */}
          <span className="sat-header-type-icon">
            <TypeIcon height={CHEVRON_SIZE} />
          </span>
          
          {/* Text */}
          <div className="sat-header-text">
            <span className="sat-header-title">
              {theme || 'Без темы'}
            </span>
            {call?.subscriber && (
              <span className="sat-header-subscriber">
                — {call.subscriber}
              </span>
            )}
            {date && (
              <span className="sat-header-date">
                — {formatCallDate(date)}
              </span>
            )}
            {call?.creator && (
              <span className="sat-header-author">
                — {getCreatorShortName(call.creator)}
              </span>
            )}
            {call?.id && (
              <span className="sat-header-id">
                ({call.id})
              </span>
            )}
          </div>
        </div>
        
        <div className="sat-collapse-header-right">
          {canDelete && (
            <span 
              className="sat-delete-btn" 
              onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
            >
              <Button
                danger
                size="small"
                icon={<TrashIcon height={CHEVRON_SIZE} />}
              />
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="sat-collapse-body">
        <div className="sat-collapse-content">
          

          {/* Автор и Отдел (readonly) */}
          <div className="sat-section">
            <div className="sat-row-wrapper">
              <div className="sat-row sat-2-col">
                <div>
                  <div className="sat-legend">Автор</div>
                  <div className="sat-content">
                    <div className="sat-content-inner">
                      <Input
                        value={getCreatorFullName(call?.creator)}
                        readOnly
                        disabled
                        variant="borderless"
                        className="sat-notedit"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="sat-legend">Дата</div>
                  <div className="sat-content">
                    <div className="sat-content-inner">
                      <Form.Item name={[fieldName, 'date']} noStyle>
                        <DatePicker
                          disabled={!canEdit}
                          variant={canEdit ? 'underlined' : 'borderless'}
                          format="DD.MM.YYYY"
                          style={{ width: '100%' }}
                          className={canEdit ? 'sat-canedit' : 'sat-notedit'}
                          placeholder={canEdit ? 'Выберите дату' : ''}
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Тип и Тема */}
          <div className="sat-section">
            <div className="sat-row-wrapper">
              <div className="sat-row sat-2-col">

                <div className={!theme && canEdit ? 'sat-required' : ''}>
                  <div className="sat-legend">Тема</div>
                  <div className="sat-content">
                    <div className="sat-content-inner">
                      <Form.Item name={[fieldName, 'theme']} noStyle>
                        <Input
                          placeholder={canEdit ? 'Тема звонка/встречи' : ''}
                          maxLength={500}
                          readOnly={!canEdit}
                          variant={canEdit ? 'underlined' : 'borderless'}
                          className={canEdit ? 'sat-canedit' : 'sat-notedit'}
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>

                <div className='sat-not-required'>
                  <div className="sat-legend">Отдел</div>
                  <div className="sat-content">
                    <div className="sat-content-inner">

                      <Select
                        variant="borderless"
                        className={canEdit ? 'sat-canedit' : 'sat-notedit'}
                        options={!departs ? [] : departs.map((item) => ({
                          key: 'mise_' + item.id,
                          value: item.id,
                          label: item.name
                        }))}
                        />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Контактное лицо и Должность */}
          <div className="sat-section">
            <div className="sat-row-wrapper">
              <div className="sat-row sat-2-col">
                <div>
                  <div className="sat-legend">Контактное лицо</div>
                  <div className="sat-content">
                    <div className="sat-content-inner">
                      <Form.Item name={[fieldName, 'subscriber']} noStyle >
                          <AutoComplete
                            maxLength={200}
                            readOnly={!canEdit}
                            placeholder={'Фамилия Имя Отчество'}
                            size="small"
                            variant={canEdit ? 'borderless' : 'borderless'}
                            className={canEdit ? 'sat-canedit' : 'sat-notedit'}
                            onSearch={(text)=>{ console.log(text);}}
                            // onClick={ ()=>{setTrigger(dayjs().unix())}}
                            // onChange={(e) => {
                            //   setSubscriber(e);
                            //   setBLUR_FLAG(dayjs().unix());
                            //   setACTION_FLAG(1);
                            // }}
                            // options={transContainer['cpers'] ? transContainer['cpers'] : []}
                            // onSearch={(text) => {
                            //   let filteredOptions = [];
                            //   let cmod = transContainer;
                            //   if (orgContacts && text !== null && text) {
                            //     filteredOptions = orgContacts?.filter((item) =>
                            //       item.label.toLowerCase().includes(text?.toLowerCase())
                            //     );
                            //     // Список подгоняется в зависимости от того, что введено пользователем
                            //     cmod['cpers'] = filteredOptions?.map((obj) => ({
                            //       key: obj.key,
                            //       value: obj.label,
                            //       label: obj.label,
                            //     }));
                            //     setTransContainer(cmod);
                            //   } else {
                            //     cmod['cpers'] = [];
                            //     setTransContainer(cmod);
                            //   }
                            // }}
                            
                          />
                      </Form.Item>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="sat-legend">Должность</div>
                  <div className="sat-content">
                    <div className="sat-content-inner">
                      <Form.Item name={[fieldName, 'post']} noStyle>
                        <Input
                          placeholder={canEdit ? 'Должность' : ''}
                          maxLength={200}
                          readOnly={!canEdit}
                          variant={canEdit ? 'underlined' : 'borderless'}
                          className={canEdit ? 'sat-canedit' : 'sat-notedit'}
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Телефон */}
          <div className="sat-section">
            <div className="sat-row-wrapper">
              <div className="sat-row sat-1-col">
                <div>
                  <div className="sat-legend">Телефон</div>
                  <div className="sat-content">
                    <div className="sat-content-inner">
                      <Form.Item name={[fieldName, 'phone']} noStyle>
                        <Input
                          placeholder={canEdit ? 'Телефон' : ''}
                          maxLength={100}
                          readOnly={!canEdit}
                          variant={canEdit ? 'underlined' : 'borderless'}
                          className={canEdit ? 'sat-canedit' : 'sat-notedit'}
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Дата и Дата след. звонка */}
          <div className="sat-section">
            <div className="sat-row-wrapper">
              <div className="sat-row sat-2-col">
                <div>
                  <div className="sat-legend">Дата</div>
                  <div className="sat-content">
                    <div className="sat-content-inner">
                      <Form.Item name={[fieldName, 'date']} noStyle>
                        <DatePicker
                          disabled={!canEdit}
                          variant={canEdit ? 'underlined' : 'borderless'}
                          format="DD.MM.YYYY"
                          style={{ width: '100%' }}
                          className={canEdit ? 'sat-canedit' : 'sat-notedit'}
                          placeholder={canEdit ? 'Выберите дату' : ''}
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="sat-legend">Дата след. звонка</div>
                  <div className="sat-content">
                    <div className="sat-content-inner">
                      <Form.Item name={[fieldName, 'next_call_date']} noStyle>
                        <DatePicker
                          disabled={!canEdit}
                          variant={canEdit ? 'underlined' : 'borderless'}
                          format="DD.MM.YYYY"
                          style={{ width: '100%' }}
                          className={canEdit ? 'sat-canedit' : 'sat-notedit'}
                          placeholder={canEdit ? 'Выберите дату' : ''}
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Заметка */}
          <div className="sat-section">
            <div className="sat-row-wrapper">
              <div className="sat-row sat-1-col">
                <div>
                  <div className="sat-legend">Заметка</div>
                  <div className="sat-content">
                    <div className="sat-content-inner">
                      <Form.Item name={[fieldName, 'note']} noStyle>
                        <TextArea
                          placeholder={canEdit ? 'Текст заметки...' : ''}
                          maxLength={5000}
                          readOnly={!canEdit}
                          variant={canEdit ? 'underlined' : 'borderless'}
                          autoSize={{ minRows: TEXTAREA_MIN_ROWS, maxRows: TEXTAREA_MAX_ROWS }}
                          className={canEdit ? 'sat-canedit' : 'sat-notedit'}
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Результат */}
          <div className="sat-section">
            <div className="sat-row-wrapper">
              <div className="sat-row sat-1-col">
                <div>
                  <div className="sat-legend">Результат</div>
                  <div className="sat-content">
                    <div className="sat-content-inner">
                      <Form.Item name={[fieldName, 'result']} noStyle>
                        <TextArea
                          placeholder={canEdit ? 'Результат звонка/встречи...' : ''}
                          maxLength={2000}
                          readOnly={!canEdit}
                          variant={canEdit ? 'underlined' : 'borderless'}
                          autoSize={{ minRows: 2, maxRows: 6 }}
                          className={canEdit ? 'sat-canedit' : 'sat-notedit'}
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

export const collectCallsForSave = (form, originalData = []) => {
  const values = form.getFieldsValue();
  const result = [];
  
  // Новые записи
  const newCalls = values.newCalls || [];
  newCalls.forEach(call => {
    if (call && !call.deleted) {
      result.push({
        ...call,
        command: 'create',
        date: call.date ? dayjs(call.date).format('DD.MM.YYYY HH:mm:ss') : null,
        next_call_date: call.next_call_date ? dayjs(call.next_call_date).format('DD.MM.YYYY HH:mm:ss') : null,
      });
    }
  });
  
  // Существующие записи - только изменённые
  const existingCalls = values.existingCalls || [];
  existingCalls.forEach((call) => {
    if (!call) return;
    
    const original = originalData.find(o => o.id === call.id);
    if (!original) return;
    
    const isChanged = 
      call.theme !== original.theme ||
      call.note !== original.note ||
      call.result !== original.result ||
      call.subscriber !== original.subscriber ||
      call.post !== original.post ||
      call.phone !== original.phone ||
      call.type !== original.type ||
      call.deleted !== original.deleted ||
      !datesEqual(call.date, original.date) ||
      !datesEqual(call.next_call_date, original.next_call_date);
    
    if (isChanged) {
      result.push({
        ...call,
        command: call.deleted ? 'delete' : 'update',
        date: call.date ? dayjs(call.date).format('DD.MM.YYYY HH:mm:ss') : null,
        next_call_date: call.next_call_date ? dayjs(call.next_call_date).format('DD.MM.YYYY HH:mm:ss') : null,
      });
    }
  });
  
  return result;
};

// Сравнение дат
const datesEqual = (date1, date2) => {
  if (!date1 && !date2) return true;
  if (!date1 || !date2) return false;
  return dayjs(date1).format('YYYY-MM-DD') === dayjs(date2).format('YYYY-MM-DD');
};


export default CallsTabForm;
