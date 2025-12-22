/**
 * OrgPage.jsx - Пример интеграции NotesTabForm
 * 
 * Показываю только релевантные части для интеграции вкладки заметок
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Form, Button, message, Modal, Affix, Tag, Tooltip, Alert, Spin } from 'antd';
import _ from 'lodash';

import { 
  PencilIcon, 
  XMarkIcon, 
  ArrowSmallLeftIcon,
  ClipboardDocumentCheckIcon 
} from '@heroicons/react/24/outline';
import { LoadingOutlined, FlagOutlined, FlagFilled } from '@ant-design/icons';

import { CSRF_TOKEN, PRODMODE } from '../../config/config';
import { PROD_AXIOS_INSTANCE } from '../../config/Api';

// Формы вкладок
import NotesTabForm, { collectNotesForSave } from './components/forms/NotesTabForm';
// import MainTabForm from './components/tabs/MainTabForm';
// import ProjectsTabForm from './components/tabs/ProjectsTabForm';
// import CallsTabForm from './components/tabs/CallsTabForm';

// Старые компоненты для вкладок, которые пока не переписаны
import OrgListModalBillsTab from '../ORG_LIST/components/OrgModal/Tabs/OrgListModalBillsTab';
import OrgListModalOffersTab from '../ORG_LIST/components/OrgModal/Tabs/OrgListModalOffersTab';
import OrgListModalHistoryTab from '../ORG_LIST/components/OrgModal/Tabs/OrgListModalHistoryTab';

import './components/style/orgpage.css';
import OrgComparatorModal from './components/modals/OrgComparatorModal';
import ProjectsTabForm from './components/forms/ProjectsTabForm';

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


  const [notesCompat,    setNotesCompat]    = useState(null);
  const [projectsCompat, setprojectsCompat] = useState(null);
  const [callsCompat,    setCallsCompat]    = useState(null);

  // ===================== СОСТОЯНИЯ =====================
  const [orgId, setOrgId] = useState(item_id ? parseInt(item_id) : null);
  const [activeTab, setActiveTab] = useState('m');
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showComparator, setShowComparator] = useState(false);
  
  // Индикаторы изменений по вкладкам
  const [changedTabs, setChangedTabs] = useState({
    m: false, // main
    p: false, // projects
    c: false, // calls
    n: false, // notes
  });

  // Данные организации
  const [orgData, setOrgData] = useState(null);
  const [orgName, setOrgName] = useState('');

  // Оригинальные данные для сравнения (для определения изменений)
  const originalDataRef = useRef({
    notes: [],
    projects: [],
    calls: [],
  });



  // ===================== COMPUTED =====================
  const hasChanges = Object.values(changedTabs).some(Boolean);

  // ===================== ОБРАБОТЧИКИ ИЗМЕНЕНИЙ =====================
  
  /**
   * Callback от дочерних форм при изменении данных
   */
  const handleDataChange = useCallback((tabKey, hasChanges, compat) => {
    console.log(tabKey, hasChanges);
    if (tabKey === 'n'){
      setNotesCompat(compat);
    } else if (tabKey === 'p'){
      setprojectsCompat(compat);
    } else if (tabKey === 'c'){
      setCallsCompat(compat);
    };

    setChangedTabs(prev => ({
      ...prev,
      [tabKey]: hasChanges
    }));
  }, []);

  // ===================== СОХРАНЕНИЕ =====================
  
  /**
   * Собирает данные со всех форм и отправляет на сервер
   */
  const handleSave = async () => {
    setSaving(true);
    
    try {
      // Валидация активных форм
      // await mainForm.validateFields();
      // await notesForm.validateFields(); // если нужна валидация
      
      // Собираем данные со всех форм
      const payload = {
        // main: mainForm.getFieldsValue(),
        notes: collectNotesForSave(notesForm, originalDataRef.current.notes),
        // projects: collectProjectsForSave(projectsForm, originalDataRef.current.projects),
        // calls: collectCallsForSave(callsForm, originalDataRef.current.calls),
      };
      
      console.log('📤 Payload для сохранения:', payload);
      
      if (PRODMODE) {
        const response = await PROD_AXIOS_INSTANCE.put(
          `/api/sales/v2/updateorglist/${orgId}`,
          {
            data: payload,
            _token: CSRF_TOKEN,
          }
        );
        
        if (response.status === 200) {
          message.success('Данные успешно сохранены');
          
          // Сбрасываем индикаторы изменений
          setChangedTabs({ m: false, p: false, c: false, n: false });
          
          // Перезагружаем данные (можно оптимизировать)
          // loadOrgData();
        } else {
          message.error(response.data?.message || 'Ошибка сохранения');
        }
      } else {
        // DEV MODE
        console.log('🧪 DEV: Сохранение (симуляция)', payload);
        await new Promise(resolve => setTimeout(resolve, 1000));
        message.success('DEV: Данные "сохранены"');
        setChangedTabs({ m: false, p: false, c: false, n: false });
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      message.error(error.message || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  // ===================== ОТМЕНА ИЗМЕНЕНИЙ =====================
  
  const handleDiscard = () => {
    // Сбрасываем формы к исходным данным
    notesForm.resetFields();
    // mainForm.resetFields();
    // projectsForm.resetFields();
    // callsForm.resetFields();
    
    setChangedTabs({ m: false, p: false, c: false, n: false });
    setEditMode(false);
  };

  // ===================== ПЕРЕКЛЮЧЕНИЕ ТАБОВ =====================
  
  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    searchParams.set('tab', tabKey);
    setSearchParams(searchParams);
  };

  // ===================== РЕНДЕР =====================

  const openComparatorModal = () => {
    setShowComparator(true);
  }

  
  return (
    <div className="app-page">
      <div className="sa-orgpage-body sa-mw-1400">
        
        {/* Header с табами */}
        <Affix offsetTop={0}>
          <div className="sa-orgpage-header">
            <div className="sa-flex-space">
              <div className="sa-orgpage-header-title">
                Паспорт организации ({orgId}) / {TAB_CONFIG.find(t => t.key === activeTab)?.label}
              </div>
              
              <div className="sa-orp-menu">
                {TAB_CONFIG.map(tab => (
                  <div
                    key={tab.key}
                    className={`sa-orp-menu-button 
                      ${activeTab === tab.key ? 'active' : ''}
                      ${changedTabs[tab.key] ? 'sa-mite-has-some' : ''}
                    `}
                    onClick={() => handleTabChange(tab.key)}
                  >
                    {tab.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Affix>

        {/* Sub-header с кнопками */}
        <Affix offsetTop={36}>
          <div className="sa-orgpage-sub-header sa-flex-space">
            <div className="sa-orgpage-sub-name">{orgName || '...'}</div>
            
            <div className="sa-flex sa-orgpage-sub-control">
              {editMode && hasChanges && (
                <Tooltip title="Не забудьте сохранить">
                  <Tag 
                    onClick={openComparatorModal}
                  color="red-inverse">Есть несохраненные данные</Tag>
                </Tooltip>
              )}
              
              {editMode ? (
                <>
                  <Button
                    type="primary"
                    icon={saving ? <LoadingOutlined /> : <ClipboardDocumentCheckIcon height={16} />}
                    onClick={handleSave}
                    disabled={!hasChanges || saving}
                    loading={saving}
                  >
                    {saving ? 'Сохраняю...' : 'Сохранить'}
                  </Button>
                  
                  <Button
                    icon={<XMarkIcon height={16} />}
                    onClick={() => hasChanges ? Modal.confirm({
                      title: 'Отменить изменения?',
                      content: 'Несохранённые данные будут потеряны',
                      onOk: handleDiscard,
                    }) : setEditMode(false)}
                  >
                    Закрыть редактирование
                  </Button>
                </>
              ) : (
                <Button
                  icon={<PencilIcon height={16} />}
                  onClick={() => setEditMode(true)}
                >
                  Редактировать
                </Button>
              )}
            </div>
          </div>
        </Affix>

        {/* Контент вкладок */}
        <div className="sa-outlet-body">
          
          {/* Счета - старый компонент */}
          {activeTab === 'b' && (
            <OrgListModalBillsTab
              data={{ id: orgId }}
              environment="editor"
              org_name={orgName}
            />
          )}

          {/* КП - старый компонент */}
          {activeTab === 'o' && (
            <OrgListModalOffersTab
              data={{ id: orgId }}
              environment="editor"
              org_name={orgName}
            />
          )}

          {/* Основная информация - TODO: MainTabForm */}
          {activeTab === 'm' && (
            <div>TODO: MainTabForm</div>
          )}

          {/* Проекты - TODO: ProjectsTabForm */}
          {activeTab === 'p' && (
            <ProjectsTabForm
              form={projectsForm}
              orgId={orgId}
              editMode={editMode}
              isActive={activeTab === 'p'}
              userdata={userdata}
              onDataChange={handleDataChange}
            />
          )}

          {/* Звонки - TODO: CallsTabForm */}
          {activeTab === 'c' && (
            <div>TODO: CallsTabForm</div>
          )}

          {/* ✅ ЗАМЕТКИ - новый компонент на antd Form */}
          <NotesTabForm
            form={notesForm}
            orgId={orgId}
            editMode={editMode}
            isActive={activeTab === 'n'}
            userdata={userdata}
            onDataChange={handleDataChange}
            // getPack={}
          />

          {/* История - старый компонент */}
          {activeTab === 'h' && (
            <OrgListModalHistoryTab
              data={{ id: orgId }}
              environment="editor"
            />
          )}
        </div>
      </div>

      {/* Модальное окно, отображающее различия в данных форм */}
      <OrgComparatorModal
        open={showComparator}
        data={{
          notes: notesCompat,
          projects: projectsCompat,
          calls: callsCompat
        }}
        onCancel={()=>{setShowComparator(false)}}
        />


    </div>
  );
};

export default OrgPage;

// https://claude.ai/share/3bd89980-0d5a-466b-8ba5-0006ceb4d5ef
