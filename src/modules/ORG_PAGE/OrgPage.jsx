/**
 * OrgPage.jsx - Главный контейнер страницы организации
 * 
 * АРХИТЕКТУРА:
 * - OrgPage управляет: загрузкой данных, сохранением, переключением табов, WebSocket
 * - Каждая вкладка — отдельная Form со своим useForm()
 * - Данные получаем/отправляем в ТОМ ЖЕ ФОРМАТЕ, что и раньше
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Form, Button, Tabs, message, Modal, Affix, Tag, Tooltip, Alert, Spin } from 'antd';
import { 
  PencilIcon, 
  XMarkIcon, 
  ArrowSmallLeftIcon,
  ClipboardDocumentCheckIcon 
} from '@heroicons/react/24/outline';
import { LoadingOutlined, FlagOutlined, FlagFilled } from '@ant-design/icons';

import { CSRF_TOKEN, PRODMODE } from '../../config/config';
import { PROD_AXIOS_INSTANCE } from '../../config/Api';
import { useWebSocket } from '../../context/ResalesWebSocketContext';
import { useWebSocketSubscription } from '../../hooks/websockets/useWebSocketSubscription';

// Формы вкладок
import MainTabForm from './components/tabs/MainTabForm';
// import ProjectsTabForm from './components/tabs/ProjectsTabForm';
// import NotesTabForm from './components/tabs/NotesTabForm';
// import CallsTabForm from './components/tabs/CallsTabForm';

// Старые компоненты для вкладок, которые пока не переписаны
import OrgListModalBillsTab from '../ORG_LIST/components/OrgModal/Tabs/OrgListModalBillsTab';
import OrgListModalOffersTab from '../ORG_LIST/components/OrgModal/Tabs/OrgListModalOffersTab';
import OrgListModalHistoryTab from '../ORG_LIST/components/OrgModal/Tabs/OrgListModalHistoryTab';

import './components/style/orgpage.css';

const TAB_CONFIG = [
  { key: 'm', label: 'Основная информация' },
  { key: 'b', label: 'Счета' },
  { key: 'o', label: 'КП' },
  { key: 'p', label: 'Проекты' },
  { key: 'c', label: 'Встречи/Звонки' },
  { key: 'n', label: 'Заметки' },
  { key: 'h', label: 'История' },
];

const OrgPage = ({ userdata }) => {
  const { item_id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // ===================== ФОРМЫ =====================
  // Каждая вкладка имеет свой инстанс формы
  const [mainForm] = Form.useForm();
  const [projectsForm] = Form.useForm();
  const [notesForm] = Form.useForm();
  const [callsForm] = Form.useForm();

  // ===================== СОСТОЯНИЯ =====================
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('m');
  
  // Базовые данные с сервера (оригинал для сравнения)
  const [baseData, setBaseData] = useState(null);
  const [selects, setSelects] = useState(null);
  
  // WebSocket состояния
  const [lockBySocket, setLockBySocket] = useState(false);
  const [lockUser, setLockUser] = useState(null);
  const { connected, emit } = useWebSocket();

  // ===================== ПРОВЕРКА ИЗМЕНЕНИЙ =====================
  /**
   * ВАЖНО: Form.isFieldsTouched() проверяет, были ли поля изменены
   * Это заменяет все наши BLUR_FLAG, ACTION_FLAG и tempData
   */
  const hasUnsavedChanges = useCallback(() => {
    return (
      mainForm.isFieldsTouched() ||
      projectsForm.isFieldsTouched() ||
      notesForm.isFieldsTouched() ||
      callsForm.isFieldsTouched()
    );
  }, [mainForm, projectsForm, notesForm, callsForm]);

  // ===================== ЗАГРУЗКА ДАННЫХ =====================
  const loadMainData = async () => {
    setLoading(true);
    try {
      const response = await PROD_AXIOS_INSTANCE.post(
        `/api/sales/v2/orglist/${item_id}/m`,
        { data: {}, _token: CSRF_TOKEN }
      );
      
      if (response.data?.content) {
        setBaseData(response.data.content);
        
        // Устанавливаем данные в форму
        // Формат данных НЕ МЕНЯЕТСЯ - просто передаём как есть
        mainForm.setFieldsValue(transformServerToForm(response.data.content));
      }
    } catch (e) {
      console.error('Ошибка загрузки:', e);
      message.error('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const loadSelects = async () => {
    try {
      const response = await PROD_AXIOS_INSTANCE.post(
        '/api/sales/orgfilterlist',
        { data: {}, _token: CSRF_TOKEN }
      );
      setSelects(response.data.filters);
    } catch (e) {
      console.error('Ошибка загрузки фильтров:', e);
    }
  };

  useEffect(() => {
    if (PRODMODE) {
      loadMainData();
      loadSelects();
    }
  }, [item_id]);

  // ===================== СОХРАНЕНИЕ =====================
  /**
   * ФОРМАТ ОТПРАВКИ НЕ МЕНЯЕТСЯ!
   * Собираем данные из форм и отправляем в том же формате
   */
  const handleSave = async () => {
    setSaving(true);
    
    try {
      // Получаем все значения из форм
      const mainValues = mainForm.getFieldsValue(true);
      const projectsValues = projectsForm.getFieldsValue(true);
      const notesValues = notesForm.getFieldsValue(true);
      const callsValues = callsForm.getFieldsValue(true);

      // Собираем payload В ТОМ ЖЕ ФОРМАТЕ, что и раньше
      const payload = buildSavePayload(mainValues, projectsValues, notesValues, callsValues, baseData);

      const response = await PROD_AXIOS_INSTANCE.put(
        `/api/sales/v2/updateorglist/${item_id}`,
        { data: payload, _token: CSRF_TOKEN }
      );

      if (response.status === 200) {
        message.success('Данные сохранены');
        
        // Сбрасываем состояние "изменено" и перезагружаем данные
        mainForm.resetFields();
        projectsForm.resetFields();
        notesForm.resetFields();
        callsForm.resetFields();
        
        await loadMainData();
      }
    } catch (e) {
      console.error('Ошибка сохранения:', e);
      message.error(e.response?.data?.message || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  // ===================== ВЫХОД ИЗ РЕДАКТИРОВАНИЯ =====================
  const handleExitEditMode = () => {
    if (hasUnsavedChanges()) {
      Modal.confirm({
        title: 'Есть несохранённые изменения',
        content: 'Отменить все изменения и выйти из редактирования?',
        okText: 'Отменить изменения',
        cancelText: 'Остаться',
        okButtonProps: { danger: true },
        onOk: () => {
          // Сброс форм к начальным значениям
          mainForm.resetFields();
          projectsForm.resetFields();
          notesForm.resetFields();
          callsForm.resetFields();
          setEditMode(false);
        },
      });
    } else {
      setEditMode(false);
    }
  };

  // ===================== WEBSOCKET =====================
  useWebSocketSubscription('ACTIVE_HIGHLIGHTS_LIST_ORGS', ({ activeUsers }) => {
    const editors = activeUsers.filter(u => 
      u.orgId === parseInt(item_id) && 
      u.action === 'edit' && 
      u.userId !== userdata?.user?.id
    );
    
    if (editors.length > 0 && !editMode) {
      setLockBySocket(true);
      setLockUser(editors[0]);
    } else {
      setLockBySocket(false);
      setLockUser(null);
    }
  });

  useEffect(() => {
    if (connected && item_id) {
      emit('HIGHLIGHT_ORG', {
        orgId: parseInt(item_id),
        userId: userdata?.user?.id,
        userFIO: `${userdata?.user?.surname} ${userdata?.user?.name}`,
        action: editMode ? 'edit' : 'observe'
      });
      
      return () => emit('UNHIGHLIGHT_ORG', {
        orgId: parseInt(item_id),
        userId: userdata?.user?.id,
      });
    }
  }, [connected, item_id, editMode]);

  // ===================== CTRL+S =====================
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && (e.key === 's' || e.key === 'ы')) {
        e.preventDefault();
        if (editMode && hasUnsavedChanges()) {
          handleSave();
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editMode, hasUnsavedChanges]);

  // ===================== РЕНДЕР =====================
  return (
    <div className="app-page">
      <div className="org-page-body">
        
        {/* Шапка с табами */}
        <Affix offsetTop={0}>
          <div className="org-page-header">
            <div className="org-page-title">
              Паспорт организации ({item_id}) / {TAB_CONFIG.find(t => t.key === activeTab)?.label}
            </div>
            
            <div className="org-page-tabs">
              {TAB_CONFIG.map(tab => (
                <div
                  key={tab.key}
                  className={`org-tab ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setSearchParams({ tab: tab.key });
                  }}
                >
                  {tab.label}
                </div>
              ))}
            </div>
          </div>
        </Affix>

        {/* Подшапка с кнопками */}
        <Affix offsetTop={40}>
          <div className="org-page-subheader">
            <div className="org-name">{baseData?.name}</div>
            
            <div className="org-controls">
              {editMode && hasUnsavedChanges() && (
                <Tag color="red">Есть несохранённые данные</Tag>
              )}
              
              {editMode ? (
                <>
                  <Button
                    type="primary"
                    icon={saving ? <LoadingOutlined /> : <ClipboardDocumentCheckIcon style={{ width: 16 }} />}
                    onClick={handleSave}
                    disabled={!hasUnsavedChanges() || saving}
                    loading={saving}
                  >
                    Сохранить
                  </Button>
                  <Button onClick={handleExitEditMode}>
                    Закрыть редактирование
                  </Button>
                </>
              ) : (
                <>
                  {lockBySocket ? (
                    <span>Редактирует: {lockUser?.userFIO}</span>
                  ) : (
                    <Button 
                      type="primary" 
                      ghost
                      icon={<PencilIcon style={{ width: 16 }} />}
                      onClick={() => setEditMode(true)}
                    >
                      Редактировать
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </Affix>

        {/* Контент вкладок */}
        <Spin spinning={loading}>
          <div className="org-page-content">
            
            {/* Основная информация - НАША НОВАЯ ФОРМА */}
            {activeTab === 'm' && (
              <MainTabForm
                form={mainForm}
                editMode={editMode}
                initialData={baseData}
                selects={selects}
                orgId={item_id}
              />
            )}

            {/* Счета - старый компонент */}
            {activeTab === 'b' && (
              <OrgListModalBillsTab data={{ id: item_id }} environment="editor" />
            )}

            {/* КП - старый компонент */}
            {activeTab === 'o' && (
              <OrgListModalOffersTab data={{ id: item_id }} environment="editor" />
            )}

            {/* Проекты - TODO: ProjectsTabForm */}
            {activeTab === 'p' && (
              <div>Проекты (TODO: ProjectsTabForm)</div>
              // <ProjectsTabForm form={projectsForm} editMode={editMode} orgId={item_id} />
            )}

            {/* Звонки - TODO: CallsTabForm */}
            {activeTab === 'c' && (
              <div>Звонки (TODO: CallsTabForm)</div>
              // <CallsTabForm form={callsForm} editMode={editMode} orgId={item_id} />
            )}

            {/* Заметки - TODO: NotesTabForm */}
            {activeTab === 'n' && (
              <div>Заметки (TODO: NotesTabForm)</div>
              // <NotesTabForm form={notesForm} editMode={editMode} orgId={item_id} />
            )}

            {/* История - старый компонент */}
            {activeTab === 'h' && (
              <OrgListModalHistoryTab data={{ id: item_id }} environment="editor" />
            )}
            
          </div>
        </Spin>
      </div>
    </div>
  );
};

// ===================== ХЕЛПЕРЫ =====================

/**
 * Преобразование данных сервера в формат формы
 * ВАЖНО: Структура почти не меняется, просто добавляем служебные поля
 */
function transformServerToForm(serverData) {
  if (!serverData) return {};
  
  return {
    // Скалярные поля - как есть
    name: serverData.name,
    middlename: serverData.middlename,
    id8an_fs: serverData.id8an_fs,
    id8an_profiles: serverData.id8an_profiles,
    inn: serverData.inn,
    source: serverData.source,
    comment: serverData.comment,
    commentinlist: serverData.commentinlist,
    kindofactivity: serverData.kindofactivity,
    site: serverData.site,
    profsound: serverData.profsound,
    id8an_statusmoney: serverData.id8an_statusmoney,
    id8an_conveyance: serverData.id8an_conveyance,
    
    // Массивы - добавляем _modified для отслеживания
    contacts: (serverData.contacts || []).map(c => ({ ...c, _modified: false })),
    phones: (serverData.phones || []).map(p => ({ ...p, _modified: false })),
    addresses: (serverData.address || []).map(a => ({ ...a, _modified: false })),
    legalAddresses: (serverData.legaladdresses || []).map(a => ({ ...a, _modified: false })),
    emails: (serverData.emails || []).map(e => ({ ...e, _modified: false })),
    requisites: (serverData.requisites || []).map(r => ({ ...r, _modified: false })),
    anLicenses: (serverData.active_licenses || []).map(l => ({ ...l, _modified: false })),
    anTolerances: (serverData.active_tolerance || []).map(t => ({ ...t, _modified: false })),
    boLicenses: (serverData.active_licenses_bo || []).map(l => ({ ...l, _modified: false })),
  };
}

/**
 * Сборка payload для сохранения В ТОМ ЖЕ ФОРМАТЕ, что и раньше
 */
function buildSavePayload(mainValues, projectsValues, notesValues, callsValues, baseData) {
  // Проверяем изменения в основных полях
  const mainFields = ['name', 'middlename', 'id8an_fs', 'id8an_profiles', 'inn', 
    'source', 'comment', 'commentinlist', 'kindofactivity', 'site', 'profsound',
    'id8an_statusmoney', 'id8an_conveyance'];
  
  let mainPayload = null;
  const hasMainChanges = mainFields.some(f => mainValues[f] !== baseData?.[f]);
  
  if (hasMainChanges) {
    mainPayload = {};
    mainFields.forEach(f => {
      mainPayload[f] = mainValues[f];
    });
    mainPayload.id = baseData?.id;
  }

  // Фильтруем только изменённые элементы массивов
  const filterModified = (items) => (items || [])
    .filter(item => item._modified || item.command)
    .map(({ _modified, ...rest }) => rest);

  return {
    main: mainPayload,
    contacts: filterModified(mainValues.contacts),
    org_phones: filterModified(mainValues.phones),
    org_emails: filterModified(mainValues.emails),
    org_addresses: filterModified(mainValues.addresses),
    org_legaladdresses: filterModified(mainValues.legalAddresses),
    org_requisites: filterModified(mainValues.requisites),
    org_an_licenses: filterModified(mainValues.anLicenses),
    org_an_tolerances: filterModified(mainValues.anTolerances),
    org_bo_licenses: filterModified(mainValues.boLicenses),
    projects: filterModified(projectsValues?.items),
    notes: filterModified(notesValues?.items),
    calls: filterModified(callsValues?.items),
  };
}

export default OrgPage;
