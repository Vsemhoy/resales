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
import ProjectsTabForm, { collectProjectsForSave } from './components/forms/ProjectsTabForm';
import CallsTabForm, { collectCallsForSave } from './components/forms/CallsTabForm';
import MainTabForm, { collectMainForSave } from './components/forms/MainTabForm';
import { useURLParams } from '../../components/helpers/UriHelpers';
import { OM_ORG_FILTERDATA } from '../ORG_LIST/components/mock/ORGLISTMOCK';
import { DEPARTAMENTS_MOCK } from '../TORG_PAGE/components/mock/ORGPAGEMOCK';

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
  

  const [selects, setSelects] = useState({});

  const { getCurrentParamsString } = useURLParams();

  const [departList, setDepartList] = useState(null);
  const [baseCompanies, setBaseCompanies] = useState([]);

  const [backeReturnPath, setBackeReturnPath] = useState(null);
  // const [baseFiltersData, setBaseFilterstData] = useState(null);


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

  useEffect(() => {
    // эффект
  }, []);


// Устанавливаем базовые компании из объекта пользователя до получения списка компаниий из фильтров
  useEffect(() => {
    if (userdata !== null && userdata.companies && userdata.companies.lenght > 0) {
      setBaseCompanies(userdata.companies);
    }
  }, [userdata]);


  useEffect(() => {
    setLoading(true);
    let rp = getCurrentParamsString();

    if (rp.includes('frompage=orgs')) {
      rp = rp.replace('frompage=orgs&', '');
      rp = rp.replace('frompage=orgs', '');
      rp = '/orgs?' + rp;
      setBackeReturnPath(rp);
    }
    if (rp.includes('frompage=bids')) {
      rp = rp.replace('frompage=bids&', '');
      rp = rp.replace('frompage=bids', '');
      console.log('rp', rp);
      rp = '/bids?' + rp;
      setBackeReturnPath(rp);
    }
    let t = searchParams.get('tab');
    if (t && ['m', 'b', 'o', 'p', 'c', 'n', 'h'].includes(t)) {
      setSearchParams({ tab: t });
      setActiveTab(t);
    } else {
      //   searchParams.set('tab', "m");
      setSearchParams({ tab: 'm' });
      setActiveTab('m');
    }

    if (PRODMODE) {
      get_org_filters();

      // get_main_data_action(item_id);

      get_departs();
    } else {
      console.log(OM_ORG_FILTERDATA);
      setSelects(OM_ORG_FILTERDATA);
      setBaseCompanies(OM_ORG_FILTERDATA.companies);

      // setBaseMainData(FlushOrgData(ORGLIST_MODAL_MOCK_MAINTAB));
      // setBaseNotesData(MODAL_NOTES_LIST);
      // // setBaseProjectsData(MODAL_PROJECTS_LIST);
      // setBaseCallsData(MODAL_CALLS_LIST);

      setDepartList(DEPARTAMENTS_MOCK);
      setTimeout(() => {
        setLoading(false);
        
      }, 1000);
    }
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
        projects: collectProjectsForSave(projectsForm, originalDataRef.current.projects),
        calls: collectCallsForSave(callsForm, originalDataRef.current.calls),
        main: collectMainForSave(mainForm, originalDataRef.current.main)
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


  /**
   * Получение списка select data
   * @param {*} req
   * @param {*} res
   */
  const get_org_filters = async () => {
    if (PRODMODE) {
      try {
        let response = await PROD_AXIOS_INSTANCE.post('api/sales/orgfilterlist', {
          data: {},
          _token: CSRF_TOKEN,
        });
        setSelects(response.data.filters);
        setBaseCompanies(response.data.filters?.companies);
      } catch (e) {
        console.log(e);
      } finally {
        // setLoadingOrgs(false)
      }
    } else {
      //setUserAct(USDA);
    }
  };


    const get_departs = async () => {
    if (PRODMODE) {
      try {
        let response = await PROD_AXIOS_INSTANCE.post('/api/timeskud/claims/getdepartments', {
          data: {},
          _token: CSRF_TOKEN,
        });
        if (response){
          setDepartList(response.data.content);
        }
      } catch (e) {
        console.log(e);
      } finally {
        // setLoadingOrgs(false)
      }
    } else {
      //setUserAct(USDA);
    }
  };




  // ===================== ОТМЕНА ИЗМЕНЕНИЙ =====================
  
  const handleDiscard = () => {
    // Сбрасываем формы к исходным данным
    notesForm.resetFields();
    // mainForm.resetFields();
    projectsForm.resetFields();
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
            <MainTabForm
              form={mainForm}
              orgId={orgId}
              editMode={editMode}
              isActive={activeTab === 'm'}
              userdata={userdata}
              selects={selects}   // Объект со справочниками
              onDataChange={handleDataChange}
            />
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
              selects={selects}
            />
          )}

          {/* Звонки - TODO: CallsTabForm */}
          {activeTab === 'c' && (
            <CallsTabForm
              form={callsForm}
              orgId={orgId}
              editMode={editMode}
              isActive={activeTab === 'c'}
              userdata={userdata}
              onDataChange={handleDataChange}
              _selects={selects}
              _departs={departList}
            />
          )}

          {/* ✅ ЗАМЕТКИ - новый компонент на antd Form */}
          <NotesTabForm
            form={notesForm}
            orgId={orgId}
            editMode={editMode}
            isActive={activeTab === 'n'}
            userdata={userdata}
            onDataChange={handleDataChange}
            selects={selects}
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
