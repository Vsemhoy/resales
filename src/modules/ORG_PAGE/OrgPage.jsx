import React, { useEffect, useMemo, useState } from 'react';

import { PRODMODE } from '../../config/config';
import { NavLink, Outlet, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button, DatePicker, Input, Layout, Pagination, Select } from 'antd';

import { ArrowSmallLeftIcon } from '@heroicons/react/24/solid';
import { ArrowLeftCircleIcon, ClipboardDocumentCheckIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { CloseOutlined } from '@ant-design/icons';



import dayjs from 'dayjs';
import './components/style/orgpage.css';


import OffersTabPage from './tabs/OffersTabPage';
import BillsTabPage from './tabs/BillsTabPage';
import MainTabPage from './tabs/MainTabPage';
import MeetingsTabPage from './tabs/MeetingsTabPage';
import NotesTabPage from './tabs/NotesTabPage';
import HistoryTabPage from './tabs/HistoryTabPage';
import ProjectsTabPage from './tabs/OffersTabPage';



    const tabNames = [{ 
          link: 'm', name: "Основная информация"},
        { link: 'b', name: "Счета"},
        { link: 'o', name: "КП"},
        { link: 'p', name: "Проекты"},
        { link: 'c', name: "Встречи/Звонки"},
        { link: 'n', name: "Заметки"},
        { link: 'h', name: "История"}];



const OrgPage = (props) => {
    const {userdata} = props;

    const [open, setOpen] = useState(false);
    //   const [openResponsive, setOpenResponsive] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const [orgId, setOrgId] = useState(246);
    // m - main
    // b - bills
    // o - offers
    // p - projects
    // c - calls
    // n - notes
    // h - history
    const [activeTab, setActiveTab] = useState('m');


    const [baseCompanies, setBaseCompanies] = useState([]);
    const location = useLocation();
    const [editMode, setEditMode] = useState(false);
    // const [companies, setCompanies] = useState([]);

    let {item_id} = useParams();
    let {tab_id} = useParams();

    const [itemId, setItemId] = useState(item_id? item_id : 'new');
    const [tabId, setTabId] = useState(tab_id !== undefined ? tab_id : tabNames[0].link);

    const [test, setTest] = useState('hello');

    const [backeReturnPath, setBackeReturnPath] = useState(null);

    // /** Пачка данных компании, но не все данные */
    // const [baseOrgData, setBaseOrgDate] = useState(null);


    const [openedFilters, setOpenedFilters] = useState(false);

    const [baseOrgs, setBaseOrgs] = useState([1,2,3,4,5,6,7,8,9,0]);


    useEffect(() => {
        let t = searchParams.get('tab');
        if (t && ['m','b','o', 'p','c','n','h'].includes(t)) {
          setActiveTab(t);
        } else {
          searchParams.set('tab', "m");
          setSearchParams(searchParams);
          setActiveTab('m');
        }
    }, []);




    useEffect(() => {
        let returnPath = location.state?.from;
        if (!returnPath){
            if (window.history.length > 1){
                returnPath = "/orgs";
            };
        };
        setBackeReturnPath(returnPath);
        console.log('returnPath', searchParams.get('mode'))

        if (searchParams.get('mode')){
            setEditMode(searchParams.get('mode') === 'edit');
            
        }
        console.log('first', dayjs().millisecond())

      if (PRODMODE){

      } else {

      }

    }, []);



    useEffect(() => {
      if (userdata !== null && userdata.companies && userdata.companies.lenght > 0){
        setBaseCompanies(userdata.companies);
      }
    }, [userdata]);

    // useEffect(() => {
    //   setCompanies(baseCompanies.map((item)=>({
    //     key: `kompa_${item.id}`,
    //     id: item.id,
    //     label: item.name
    //   })));
    // }, [baseCompanies]);

    const companies = useMemo(() => {
        return baseCompanies.map((item) => ({
        key: `kompa_${item.id}`,
        id: item.id,
        label: item.name,
        }));
    }, [baseCompanies]);


    const goBack = () => {
        // const returnPath = location.state?.from;
        const referrer = document.referrer;
        if (backeReturnPath) {
            navigate(backeReturnPath);
        } else {
        // navigate('/orgs');
        window.close();
        }
    };

    const triggerEditMode = ()=> {
        let newMode = !editMode;
        setEditMode(newMode);
        if (newMode){
            searchParams.set('mode', "edit");
            setSearchParams(searchParams);

        } else {
            searchParams.set('mode', "view");
            setSearchParams(searchParams);
        }
    };


    const handleChangeTab = (tabLit) => {
        setActiveTab(tabLit);
        searchParams.set('tab', tabLit);
        setSearchParams(searchParams);
    }


  return (
    <>
    <br />
    <div className='app-page'>
        


    <div className='sa-orgpage-body sa-mw-1200'>
        <div className='sa-orgpage-header'>
            <div className={'sa-flex-space'}>
                <div className={'sa-flex-space'}>
                    <div className={'sa-orgpage-header-button'}
                        onClick={goBack}
                    >   
                        {backeReturnPath ? (
                            <ArrowSmallLeftIcon height={'30px'} />
                        ) : (
                            <CloseOutlined />
                        )}
                    </div>
                    <div className={'sa-orgpage-header-title'}>
                        Паспорт организации ({itemId})
                    </div>
                </div>
                <div></div>
                <div className={'sa-orp-menu'}>
                    {tabNames.map((tab)=>(
                       

                        
                        <div className={`sa-orp-menu-button  ${activeTab === tab.link ? "active" : ""}`} onClick={()=>{handleChangeTab(tab.link)}}>
                            {tab.name}
                        </div>
                        

                    ))}
                </div>
            </div>
        </div>

        <div className={'sa-outlet-body'}>
                <div className={'sa-orgpage-sub-header sa-flex-space'}>
                    <div className={'sa-orgpage-sub-name'}>
                        Компния Рога и компания
                    </div>
                    <div className={'sa-flex sa-orgpage-sub-control'}>
                        {editMode && (
                            <div onClick={triggerEditMode}>
                                <XMarkIcon height={'22px'}/> Просмотр
                            </div>
                        )}


                        {editMode ? (
                            <div>
                               <ClipboardDocumentCheckIcon  height={'22px'}/> Сохранить
                            </div>
                        ) : (
                            <div onClick={triggerEditMode}>
                                <PencilIcon height={'22px'}/> Редактировать
                            </div>
                        )}

                    </div>
                </div>


            {activeTab === 'm' && (
                <MainTabPage
                    edit_mode={editMode}
                    item_id={itemId}
                 />
            )}


            {activeTab === 'o' && (
                <OffersTabPage
                    edit_mode={editMode}
                    item_id={itemId}
                />
            )}

            {activeTab === 'b' && (
                <BillsTabPage
                    edit_mode={editMode}
                    item_id={itemId}
                 />
            )}

            {activeTab === 'c' && (
                <MeetingsTabPage
                    edit_mode={editMode}
                    item_id={itemId}
                 />
            )}

            {activeTab === 'p' && (
                <ProjectsTabPage
                    edit_mode={editMode}
                    item_id={itemId}
                 />
            )}

            {activeTab === 'n' && (
                <NotesTabPage
                    edit_mode={editMode}
                    item_id={itemId}
                 />
            )}

            {activeTab === 'h' && (
                <HistoryTabPage
                    edit_mode={editMode}
                    item_id={itemId}
                 />
            )}
            
        </div>
    </div>



    </div>
    </>
  );
};

export default OrgPage;
