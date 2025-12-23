/**
 * ProjectsTabForm.jsx - Вкладка проектов на Ant Design Form
 * 
 * АРХИТЕКТУРА:
 * - Один Form.useForm() на всю вкладку (передаётся от родителя)
 * - Form.List для массива проектов
 * - Данные хранятся в форме, не в локальных useState
 * 
 * ПРАВИЛА:
 * - Чужие проекты редактировать нельзя (проверка по author_id или curator.id)
 * - Свои существующие проекты удалять нельзя
 * - Новые проекты (id начинается с 'new_') можно удалять
 * 
 * СТИЛИ: используем префикс sat- (orgpage-forms.css)
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  Form, Button, Input, DatePicker, Pagination, 
  Spin, Empty, Select, message 
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ChevronRightIcon, TrashIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';

import { PROD_AXIOS_INSTANCE } from '../../../../config/Api';
import { CSRF_TOKEN, PRODMODE } from '../../../../config/config';
import { MODAL_PROJECTS_LIST } from '../../../ORG_LIST/components/mock/MODALPROJECTSTABMOCK';
import { ANTD_PAGINATION_LOCALE } from '../../../../config/Localization';

import '../style/orgpage-forms.css';

const { TextArea } = Input;

// Конфиг
const TEXTAREA_MIN_ROWS = 2;
const TEXTAREA_MAX_ROWS = 6;
const CHEVRON_SIZE = 16;
const DEBOUNCE_MS = 400;

const ProjectsTabForm = ({ 
  form,           // Form instance от родителя
  orgId,          // ID организации
  editMode,       // Режим редактирования
  isActive,       // Активна ли вкладка
  userdata,       // Данные пользователя
  selects,        // Данные для селектов (типы проектов и т.д.)
  orgContacts,    // Контакты организации для поля contactperson
  onDataChange,   // Callback при изменении данных
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
  
  const loadProjects = useCallback(async () => {
    if (!orgId) return;
    
    setLoading(true);
    try {
      if (PRODMODE) {
        const response = await PROD_AXIOS_INSTANCE.post(
          `/api/sales/v2/orglist/${orgId}/p`,
          {
            data: { page: currentPage, limit: pageSize },
            _token: CSRF_TOKEN,
          }
        );
        
        // if (response.data?.content?.projects) {
        //   const projects = response.data.content.projects;
        //   setOriginalData(JSON.parse(JSON.stringify(projects)));
        //   setTotal(response.data.total || projects.length);
          
        //   form.setFieldsValue({ 
        //     existingProjects: projects,
        //     newProjects: [] 
        //   });
        // }
        if(response.data?.content?.projects)  {
            const projects = response.data.content.projects;
            
            // Преобразуем даты в объект dayjs
            const projectsWithDayjsDates = projects.map((project) => ({
                ...project,
                date: project.date ? dayjs(project.date) : null,  // Преобразуем дату в объект Day.js или устанавливаем значение null, если дата не определена
                date_end: project.date_end ? dayjs(project.date_end) : null,
            }));
            
            setOriginalData(JSON.parse(JSON.stringify(projectsWithDayjsDates)));
            setTotal(response.data.total || projects.length);
            form.setFieldsValue({ 
                existingProjects: projectsWithDayjsDates,
                newProjects: [] 
            });
        }
      } else {
        // DEV MODE - используем мок
        const projects = MODAL_PROJECTS_LIST.projects;

        const projectsWithDayjsDates = projects.map((project) => ({
            ...project,
            date: project.date ? dayjs(project.date) : null,
            date_end: project.date_end ? dayjs(project.date_end) : null,
        }));

        setOriginalData(JSON.parse(JSON.stringify(projectsWithDayjsDates)));
        setTotal(projectsWithDayjsDates.length);
        
        form.setFieldsValue({ 
          existingProjects: projectsWithDayjsDates,
          newProjects: [] 
        });

        console.log('projects', projects)
      }
    } catch (error) {
      console.error('Ошибка загрузки проектов:', error);
      message.error('Не удалось загрузить проекты');
    } finally {
      setLoading(false);
    }
  }, [orgId, currentPage, pageSize, form]);

  // Загрузка при изменении orgId или пагинации
  useEffect(() => {
    if (orgId) {
      const timer = setTimeout(loadProjects, 300);
      return () => clearTimeout(timer);
    }
  }, [orgId, currentPage, pageSize, loadProjects]);

  // Сброс при смене организации
  useEffect(() => {
    if (!orgId) {
      form.setFieldsValue({ existingProjects: [], newProjects: [] });
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

  // ===================== СОЗДАНИЕ НОВОГО ПРОЕКТА =====================
  
  const handleAddProject = useCallback(() => {
    if (!userdata?.user) return;
    
    setNewItemLoading(true);
    
    setTimeout(() => {
      const newProject = {
        command: 'create',
        id: `new_${dayjs().unix()}${dayjs().millisecond()}`,
        id_orgs: orgId,
        id8staff_list: userdata.user.id,
        date: dayjs(),
        id8an_projecttype: 0,
        name: '',
        equipment: '',
        customer: '',
        address: '',
        stage: '',
        contactperson: '',
        cost: '',
        bonus: '',
        comment: '',
        typepaec: '',
        deleted: 0,
        date_end: null,
        erector_id: null,
        erector: null, // Объект монтажника для отображения
        linkbid_id: [],
        bidsId: [],
        date_create: dayjs().unix(),
        id_company: userdata.user.active_company,
        created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        author_id: userdata.user.id,
        author: userdata.user.id,
        curator: {
          id: userdata.user.id,
          surname: userdata.user.surname,
          name: userdata.user.name,
          secondname: userdata.user.secondname,
        },
      };
      
      const currentNewProjects = form.getFieldValue('newProjects') || [];
      form.setFieldsValue({ 
        newProjects: [newProject, ...currentNewProjects] 
      });
      
      // Разворачиваем новый проект
      setExpandedKeys(prev => [...prev, newProject.id]);
      onDataChange?.('p', true);
      setNewItemLoading(false);
    }, 300);
  }, [orgId, userdata, form, onDataChange]);

  // ===================== УДАЛЕНИЕ ПРОЕКТА =====================
  
  const handleDeleteNewProject = useCallback((projectId, removeFunc) => {
    removeFunc();
    const remainingNew = (form.getFieldValue('newProjects') || []).filter(p => p?.id !== projectId);
    onDataChange?.('p', remainingNew.length > 0);
  }, [form, onDataChange]);

  // ===================== ПРОВЕРКА ПРАВ =====================
  
  const canEditProject = useCallback((project) => {
    if (!userdata?.user?.id) return false;
    return userdata.user.id === project?.author_id || 
           userdata.user.id === project?.curator?.id;
  }, [userdata]);

  // ===================== ХЕЛПЕРЫ =====================
  
  const getCuratorFullName = (curator) => {
    if (!curator) return '';
    return `${curator.surname || ''} ${curator.name || ''} ${curator.secondname || ''}`.trim();
  };

  const getCuratorShortName = (curator) => {
    if (!curator) return '';
    const surname = curator.surname || '';
    const nameInitial = curator.name ? curator.name[0] + '.' : '';
    const secondInitial = curator.secondname ? curator.secondname[0] + '.' : '';
    return `${surname} ${nameInitial}${secondInitial}`.trim();
  };

  const formatProjectDate = (date) => {
    if (!date) return '';
    const d = dayjs(date);
    const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    return `${months[d.month()]} ${d.format('YYYY')}`;
  };

  const toggleExpanded = (projectId) => {
    setExpandedKeys(prev => 
      prev.includes(projectId) 
        ? prev.filter(k => k !== projectId)
        : [...prev, projectId]
    );
  };

  const handleFieldChange = useCallback(() => {
    onDataChange?.('p', true);
  }, [onDataChange]);

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
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddProject}
              disabled={newItemLoading || (form.getFieldValue('newProjects')?.length || 0) > 7}
              loading={newItemLoading}
            >
              Создать проект
            </Button>
          )}
        </div>

        {/* Контент */}
        <div className="sat-tab-content">
          <Form 
            form={form} 
            layout="vertical"
            onValuesChange={handleFieldChange}
          >
            {/* Новые проекты */}
            <Form.Item noStyle shouldUpdate>
              {() => {
                const newProjects = form.getFieldValue('newProjects') || [];
                if (newProjects.length === 0) return null;
                
                return (
                  <Spin spinning={newItemLoading}>
                    <div className="sat-stack-new">
                      <div className="sat-stack-new-header">Новые проекты</div>
                      
                      <Form.List name="newProjects">
                        {(fields, { remove }) => (
                          <>
                            {fields.map(({ key, name }) => {
                              const project = form.getFieldValue(['newProjects', name]);
                              const isExpanded = expandedKeys.includes(project?.id);
                              
                              return (
                                <ProjectCard
                                  key={key}
                                  fieldName={name}
                                  prefix="newProjects"
                                  project={project}
                                  isExpanded={isExpanded}
                                  canEdit={true}
                                  canDelete={true}
                                  selects={selects}
                                  orgContacts={orgContacts}
                                  onToggle={() => toggleExpanded(project?.id)}
                                  onDelete={() => handleDeleteNewProject(project?.id, () => remove(name))}
                                  getCuratorFullName={getCuratorFullName}
                                  getCuratorShortName={getCuratorShortName}
                                  formatProjectDate={formatProjectDate}
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

            {/* Существующие проекты */}
            <Form.Item noStyle shouldUpdate>
              {() => {
                const existingProjects = form.getFieldValue('existingProjects') || [];
                const newProjects = form.getFieldValue('newProjects') || [];
                
                if (existingProjects.length === 0 && newProjects.length === 0) {
                  return <Empty description="Нет проектов" />;
                }
                
                if (existingProjects.length === 0) return null;
                
                return (
                  <div className="sat-stack-existing">
                    <Form.List name="existingProjects">
                      {(fields) => (
                        <>
                          {fields.map(({ key, name }) => {
                            const project = form.getFieldValue(['existingProjects', name]);
                            const isExpanded = expandedKeys.includes(project?.id);
                            const canEdit = editMode && canEditProject(project);
                            const isDeleted = project?.deleted === 1;
                            
                            return (
                              <ProjectCard
                                key={key}
                                fieldName={name}
                                prefix="existingProjects"
                                project={project}
                                isExpanded={isExpanded}
                                isDeleted={isDeleted}
                                canEdit={canEdit}
                                canDelete={false}
                                selects={selects}
                                orgContacts={orgContacts}
                                onToggle={() => toggleExpanded(project?.id)}
                                getCuratorFullName={getCuratorFullName}
                                getCuratorShortName={getCuratorShortName}
                                formatProjectDate={formatProjectDate}
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
// КОМПОНЕНТ КАРТОЧКИ ПРОЕКТА
// =============================================================================



const ProjectCard = ({
  fieldName,
  prefix,
  project,
  isExpanded,
  isDeleted,
  canEdit,
  canDelete,
  selects,
  orgContacts,
  onToggle,
  onDelete,
  getCuratorFullName,
  getCuratorShortName,
  formatProjectDate,
}) => {
  console.log('project', project)
  const name = project?.name || '';
  // const date = project?.date ? dayjs(project.date) : null;
  // const dateEnd = project?.date_end ? dayjs(project.date_end) : null;

// if (project.date) {
//   result.push({
//     ...project,
//     command: project.deleted ? 'delete' : 'update',
//     date: dayjs(project.date).format('DD.MM.YYYY HH:mm:ss'),
//     date_end: project.date_end ? dayjs(project.date_end).format('DD.MM.YYYY HH:mm:ss') : null,
//   });
// }

// if (project.date_end) {
//   result.push({
//     ...project,
//     command: project.deleted ? 'delete' : 'update',
//     date: dayjs(project.date).format('DD.MM.YYYY HH:mm:ss'),
//     date_end: dayjs(project.date_end).format('DD.MM.YYYY HH:mm:ss'),
//   });
// }
  
  const date = project?.date && dayjs(project.date).isValid() ? 
             dayjs(project.date) : null;
  const dateEnd = project?.date_end && dayjs(project.date_end).isValid() ? 
                 dayjs(project.date_end) : null;
  
  // Состояние для автокомплита монтажника
  const [erectorOptions, setErectorOptions] = useState([]);
  const [erectorLoading, setErectorLoading] = useState(false);
  const searchTimeoutRef = useRef(null);
  
  // Определяем классы
  const itemClasses = [
    'sat-collapse-item',
    isExpanded ? 'sat-expanded' : 'sat-collapsed',
    isDeleted ? 'sat-deleted' : '',
    !canEdit ? 'sat-readonly' : '',
  ].filter(Boolean).join(' ');

  // ===================== АВТОКОМПЛИТ МОНТАЖНИКА =====================
  
  const handleErectorSearch = async (searchText) => {
    if (!searchText || searchText.length < 2) {
      setErectorOptions([]);
      return;
    }
    
    // Debounce
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(async () => {
      setErectorLoading(true);
      try {
        if (PRODMODE) {
          const response = await PROD_AXIOS_INSTANCE.post('/api/sales/v2/erectors/search', {
            query: searchText,
            _token: CSRF_TOKEN,
          });
          
          if (response.data?.results) {
            setErectorOptions(response.data.results.map(item => ({
              value: item.id,
              label: `${item.surname || ''} ${item.name || ''} ${item.secondname || ''}`.trim(),
              data: item,
            })));
          }
        } else {
          // DEV MODE - мок данные
          setErectorOptions([
            { value: 1, label: 'Иванов Иван Иванович', data: { id: 1, surname: 'Иванов', name: 'Иван', secondname: 'Иванович' } },
            { value: 2, label: 'Петров Пётр Петрович', data: { id: 2, surname: 'Петров', name: 'Пётр', secondname: 'Петрович' } },
          ].filter(opt => opt.label.toLowerCase().includes(searchText.toLowerCase())));
        }
      } catch (error) {
        console.error('Ошибка поиска монтажника:', error);
      } finally {
        setErectorLoading(false);
      }
    }, DEBOUNCE_MS);
  };

  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // ===================== ОПЦИИ ДЛЯ СЕЛЕКТОВ =====================
  
  // Контакты организации для поля contactperson
  const contactOptions = (orgContacts || []).map(contact => ({
    value: contact.id || contact.name,
    label: contact.name || `${contact.surname || ''} ${contact.firstname || ''}`.trim(),
  }));

  // Типы проектов (если есть в selects)
  const projectTypeOptions = (selects?.projectTypes || []).map(type => ({
    value: type.id,
    label: type.name,
  }));

  return (
    <div className={itemClasses}>
      {/* Header */}
      <div className="sat-collapse-header" onClick={onToggle}>
        <div className="sat-collapse-header-left">
          <span className={`sat-trigger-btn ${isExpanded ? 'sat-expanded' : ''}`}>
            <ChevronRightIcon height={CHEVRON_SIZE} />
          </span>
          
          <div className="sat-header-text">
            <span className="sat-header-title">
              {name || 'Без названия'}
            </span>
            {project?.type?.name && (
              <span className="sat-header-badge">
                [{project.type.name}]
              </span>
            )}
            {date && (
              <span className="sat-header-date">
                — {formatProjectDate(date)}
              </span>
            )}
            {project?.curator && (
              <span className="sat-header-author">
                — {getCuratorShortName(project.curator)}
              </span>
            )}
            {project?.id && (
              <span className="sat-header-id">
                ({project.id})
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
          
          {/* Название проекта */}
          <div className="sat-section">
            <div className="sat-row-wrapper">
              <div className="sat-row sat-1-col">
                <div className={!name && canEdit ? 'sat-required' : ''}>
                  <div className="sat-legend">Название проекта</div>
                  <div className="sat-content">
                    <div className="sat-content-inner">
                      <Form.Item name={[fieldName, 'name']} noStyle>
                        <Input
                          placeholder={canEdit ? 'Введите название' : ''}
                          maxLength={500}
                          readOnly={!canEdit}
                          variant={canEdit ? 'outlined' : 'borderless'}
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Заказчик и Адрес */}
          <div className="sat-section">
            <div className="sat-row-wrapper">
              <div className="sat-row sat-2-col">
                <div>
                  <div className="sat-legend">Заказчик</div>
                  <div className="sat-content">
                    <div className="sat-content-inner">
                      <Form.Item name={[fieldName, 'customer']} noStyle>
                        <Input
                          placeholder={canEdit ? 'Заказчик' : ''}
                          maxLength={300}
                          readOnly={!canEdit}
                          variant={canEdit ? 'outlined' : 'borderless'}
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="sat-legend">Адрес</div>
                  <div className="sat-content">
                    <div className="sat-content-inner">
                      <Form.Item name={[fieldName, 'address']} noStyle>
                        <Input
                          placeholder={canEdit ? 'Адрес' : ''}
                          maxLength={500}
                          readOnly={!canEdit}
                          variant={canEdit ? 'outlined' : 'borderless'}
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Оборудование */}
          <div className="sat-section">
            <div className="sat-row-wrapper">
              <div className="sat-row sat-1-col">
                <div>
                  <div className="sat-legend">Оборудование</div>
                  <div className="sat-content">
                    <div className="sat-content-inner">
                      <Form.Item name={[fieldName, 'equipment']} noStyle>
                        <TextArea
                          placeholder={canEdit ? 'Оборудование' : ''}
                          maxLength={2000}
                          readOnly={!canEdit}
                          variant={canEdit ? 'outlined' : 'borderless'}
                          autoSize={{ minRows: TEXTAREA_MIN_ROWS, maxRows: TEXTAREA_MAX_ROWS }}
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Этап и Контактное лицо */}
          <div className="sat-section">
            <div className="sat-row-wrapper">
              <div className="sat-row sat-2-col">
                <div>
                  <div className="sat-legend">Этап</div>
                  <div className="sat-content">
                    <div className="sat-content-inner">
                      <Form.Item name={[fieldName, 'stage']} noStyle>
                        <Input
                          placeholder={canEdit ? 'Этап' : ''}
                          maxLength={200}
                          readOnly={!canEdit}
                          variant={canEdit ? 'outlined' : 'borderless'}
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="sat-legend">Контактное лицо</div>
                  <div className="sat-content">
                    <div className="sat-content-inner">
                      {canEdit ? (
                        <Form.Item name={[fieldName, 'contactperson']} noStyle>
                          <Select
                            showSearch
                            allowClear
                            placeholder="Выберите контакт"
                            optionFilterProp="label"
                            options={contactOptions}
                            style={{ width: '100%' }}
                            variant="outlined"
                          />
                        </Form.Item>
                      ) : (
                        <Input
                          value={project?.contactperson || ''}
                          readOnly
                          variant="borderless"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Дата начала и Дата окончания */}
          <div className="sat-section">
            <div className="sat-row-wrapper">
              <div className="sat-row sat-2-col">
                <div>
                  <div className="sat-legend">Дата начала</div>
                  <div className="sat-content">
                    <div className="sat-content-inner">
                      <Form.Item name={[fieldName, 'date']} noStyle>
                        <DatePicker
                          disabled={!canEdit}
                          variant={canEdit ? 'outlined' : 'borderless'}
                          format="DD-MM-YYYY"
                          style={{ width: '100%' }}
                          placeholder={canEdit ? 'Выберите дату' : ''}
                          allowClear
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="sat-legend">Дата окончания</div>
                  <div className="sat-content">
                    <div className="sat-content-inner">
                      <Form.Item name={[fieldName, 'date_end']} noStyle>
                        <DatePicker
                          disabled={!canEdit}
                          variant={canEdit ? 'outlined' : 'borderless'}
                          format="DD-MM-YYYY"
                          style={{ width: '100%' }}
                          placeholder={canEdit ? 'Выберите дату' : ''}
                          allowClear
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Стоимость и Бонус */}
          <div className="sat-section">
            <div className="sat-row-wrapper">
              <div className="sat-row sat-2-col">
                <div>
                  <div className="sat-legend">Стоимость</div>
                  <div className="sat-content">
                    <div className="sat-content-inner">
                      <Form.Item name={[fieldName, 'cost']} noStyle>
                        <Input
                          placeholder={canEdit ? 'Стоимость' : ''}
                          maxLength={50}
                          readOnly={!canEdit}
                          variant={canEdit ? 'outlined' : 'borderless'}
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="sat-legend">Бонус</div>
                  <div className="sat-content">
                    <div className="sat-content-inner">
                      <Form.Item name={[fieldName, 'bonus']} noStyle>
                        <Input
                          placeholder={canEdit ? 'Бонус' : ''}
                          maxLength={50}
                          readOnly={!canEdit}
                          variant={canEdit ? 'outlined' : 'borderless'}
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Монтажник (автокомплит) */}
          <div className="sat-section">
            <div className="sat-row-wrapper">
              <div className="sat-row sat-1-col">
                <div>
                  <div className="sat-legend">Монтажник</div>
                  <div className="sat-content">
                    <div className="sat-content-inner">
                      {canEdit ? (
                        <Form.Item name={[fieldName, 'erector_id']} noStyle>
                          <Select
                            showSearch
                            allowClear
                            placeholder="Начните вводить ФИО"
                            filterOption={false}
                            onSearch={handleErectorSearch}
                            loading={erectorLoading}
                            options={erectorOptions}
                            style={{ width: '100%' }}
                            variant="outlined"
                            notFoundContent={erectorLoading ? <Spin size="small" /> : 'Не найдено'}
                          />
                        </Form.Item>
                      ) : (
                        <Input
                          value={project?.erector ? `${project.erector.surname || ''} ${project.erector.name || ''}`.trim() : ''}
                          readOnly
                          variant="borderless"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Тип СОУЭ */}
          <div className="sat-section">
            <div className="sat-row-wrapper">
              <div className="sat-row sat-1-col">
                <div>
                  <div className="sat-legend">Тип СОУЭ</div>
                  <div className="sat-content">
                    <div className="sat-content-inner">
                      <Form.Item name={[fieldName, 'typepaec']} noStyle>
                        <Input
                          placeholder={canEdit ? 'Тип СОУЭ' : ''}
                          maxLength={200}
                          readOnly={!canEdit}
                          variant={canEdit ? 'outlined' : 'borderless'}
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Комментарий */}
          <div className="sat-section">
            <div className="sat-row-wrapper">
              <div className="sat-row sat-1-col">
                <div>
                  <div className="sat-legend">Комментарий</div>
                  <div className="sat-content">
                    <div className="sat-content-inner">
                      <Form.Item name={[fieldName, 'comment']} noStyle>
                        <TextArea
                          placeholder={canEdit ? 'Комментарий' : ''}
                          maxLength={5000}
                          readOnly={!canEdit}
                          variant={canEdit ? 'outlined' : 'borderless'}
                          autoSize={{ minRows: TEXTAREA_MIN_ROWS, maxRows: TEXTAREA_MAX_ROWS }}
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Куратор и Дата создания (readonly) */}
          <div className="sat-section">
            <div className="sat-row-wrapper">
              <div className="sat-row sat-2-col">
                <div>
                  <div className="sat-legend">Куратор</div>
                  <div className="sat-content">
                    <div className="sat-content-inner">
                      <Input
                        value={getCuratorFullName(project?.curator)}
                        readOnly
                        disabled
                        variant="borderless"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="sat-legend">Дата создания</div>
                  <div className="sat-content">
                    <div className="sat-content-inner">
                      <Input
                        value={project?.created_at ? dayjs(project.created_at).format('DD-MM-YYYY HH:mm') : ''}
                        readOnly
                        disabled
                        variant="borderless"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Связанные заявки (если есть) */}
          {(project?.bidsId?.length > 0 || project?.linkbid_id?.length > 0) && (
            <div className="sat-section">
              <div className="sat-row-wrapper">
                <div className="sat-row sat-1-col">
                  <div>
                    <div className="sat-legend">Связанные заявки</div>
                    <div className="sat-content">
                      <div className="sat-content-inner">
                        <Input
                          value={(project?.bidsId || project?.linkbid_id || []).join(', ')}
                          readOnly
                          disabled
                          variant="borderless"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};


// =============================================================================
// УТИЛИТА ДЛЯ СБОРА ДАННЫХ ПЕРЕД СОХРАНЕНИЕМ
// =============================================================================

export const collectProjectsForSave = (form, originalData = []) => {
  const values = form.getFieldsValue();
  const result = [];
  
  // Новые проекты
  const newProjects = values.newProjects || [];
  newProjects.forEach(project => {
    if (project && !project.deleted) {
      result.push({
        ...project,
        command: 'create',
        date: project.date ? dayjs(project.date).format('DD.MM.YYYY HH:mm:ss') : null,
        date_end: project.date_end ? dayjs(project.date_end).format('DD.MM.YYYY HH:mm:ss') : null,
      });
    }
  });
  
  // Существующие проекты - только изменённые
  const existingProjects = values.existingProjects || [];
  existingProjects.forEach((project) => {
    if (!project) return;
    
    const original = originalData.find(o => o.id === project.id);
    if (!original) return;
    
    // Проверяем, изменился ли проект
    const fieldsToCompare = [
      'name', 'equipment', 'customer', 'address', 'stage', 
      'contactperson', 'cost', 'bonus', 'comment', 'typepaec',
      'erector_id', 'deleted'
    ];
    
    const isChanged = fieldsToCompare.some(field => project[field] !== original[field]) ||
      (project.date?.valueOf?.() !== dayjs(original.date)?.valueOf?.()) ||
      (project.date_end?.valueOf?.() !== dayjs(original.date_end)?.valueOf?.());
    
    if (isChanged) {
      result.push({
        ...project,
        command: project.deleted ? 'delete' : 'update',
        date: project.date ? dayjs(project.date).format('DD.MM.YYYY HH:mm:ss') : null,
        date_end: project.date_end ? dayjs(project.date_end).format('DD.MM.YYYY HH:mm:ss') : null,
      });
    }
  });
  
  return result;
};


export default ProjectsTabForm;


