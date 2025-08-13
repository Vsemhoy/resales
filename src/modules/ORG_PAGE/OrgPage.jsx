import React, { useEffect, useMemo, useState } from 'react';

import './components/style/orgpage.css';
import { PRODMODE } from '../../config/config';
import { NavLink, Outlet, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button, DatePicker, Input, Layout, Pagination, Select } from 'antd';
import { Content } from 'antd/es/layout/layout';
import Sider from 'antd/es/layout/Sider';
import { ArrowSmallLeftIcon } from '@heroicons/react/24/solid';
import { ArrowLeftCircleIcon, ClipboardDocumentCheckIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';


    const tabNames = [{ 
          link: '', name: "Основная информация"},
        { link: 'bills', name: "Счета"},
        { link: 'offers', name: "КП"},
        { link: 'meetings', name: "Встречи/Звонки"},
        { link: 'notes', name: "Заметки"},
        { link: 'history', name: "История"}];



const OrgPage = (props) => {
    const {userdata} = props;
      const [searchParams, setSearchParams] = useSearchParams();
    const [baseCompanies, setBaseCompanies] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const [editMode, setEditMode] = useState(false);
    // const [companies, setCompanies] = useState([]);

    let {item_id} = useParams();
    let {tab_id} = useParams();

    const [itemId, setItemId] = useState(item_id? item_id : 'new');
    const [tabId, setTabId] = useState(tab_id !== undefined ? tab_id : tabNames[0].link);

    const [test, setTest] = useState('hello');

    const [backeReturnPath, setBackeReturnPath] = useState(null);




    const [openedFilters, setOpenedFilters] = useState(false);

    const [baseOrgs, setBaseOrgs] = useState([1,2,3,4,5,6,7,8,9,0]);



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
                        Паспорт организации
                    </div>
                </div>
                <div></div>
                <div className={'sa-orp-menu'}>
                    {tabNames.map((tab)=>(
                        tab.link !== "" ? (

                        <NavLink to={`/orgs/${itemId}/${tab.link}`}>
                        <div className={'sa-orp-menu-button'}>
                            {tab.name}
                        </div>
                        </NavLink>
                        ) : (
                            // Эта проверка, чтобы пункт меню, который логически является родителем для соседних не подсвечивался
                        <NavLink to={`/orgs/${itemId}`} className={`${location.pathname.endsWith(itemId) ? '' : 'not-active'}`}>
                            <div className={'sa-orp-menu-button'}>
                                {tab.name}
                            </div>
                        </NavLink>
                        )

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


            <Outlet  />

            
        </div>
    </div>



    </div>
    </>
  );
};

export default OrgPage;
