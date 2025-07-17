import React, { useEffect, useMemo, useState } from 'react';

import './components/style/orgpage.css';
import { PRODMODE } from '../../config/config';
import { NavLink, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button, DatePicker, Input, Layout, Pagination, Select } from 'antd';
import { Content } from 'antd/es/layout/layout';
import Sider from 'antd/es/layout/Sider';

    const tabNames = [{ 
          link: '', name: "Основная информация"},
        { link: 'bills', name: "Счета"},
        { link: 'offers', name: "КП"},
        { link: 'meetings', name: "Встречи/Звонки"},
        { link: 'notes', name: "Заметки"},
        { link: 'history', name: "История"}];



const OrgPage = (props) => {
    const {userdata} = props;
    const [baseCompanies, setBaseCompanies] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    // const [companies, setCompanies] = useState([]);

    let {item_id} = useParams();
    let {tab_id} = useParams();

    const [itemId, setItemId] = useState(item_id? item_id : 'new');
    const [tabId, setTabId] = useState(tab_id !== undefined ? tab_id : tabNames[0].link);

    const [test, setTest] = useState('hello');






    const [openedFilters, setOpenedFilters] = useState(false);

    const [baseOrgs, setBaseOrgs] = useState([1,2,3,4,5,6,7,8,9,0]);



    useEffect(() => {
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



  return (
    <>
    <br />
    <div className='app-page'>
        


    <div className='sa-orgpage-body sa-mw-1200'>
        <div className='sa-orgpage-header'>
            <div className={'sa-flex-space'}>
                <div>Паспорт организации</div>
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
            <h1>Паспорт организации</h1>
            <Outlet  />

            <Input value={test} onChange={(ev)=>{setTest(ev.target.value)}} ></Input>
        </div>
    </div>



    </div>
    </>
  );
};

export default OrgPage;
