import React, { useEffect, useState } from 'react';

import './style/topmenu.css';
import { NavLink, useLocation } from 'react-router-dom';
import { BASE_ROUTE, CSRF_TOKEN, HTTP_HOST, PRODMODE } from '../../../config/config';
import { CloseCircleOutlined, HomeFilled } from '@ant-design/icons';
import LogoArstel, { LogoArstelLight } from '../../../assets/Comicon/Logos/LogoArstel';
import LogoRondo, { LogoRondoLight } from '../../../assets/Comicon/Logos/LogoRondo';
import { USER_ROLES } from '../../definitions/USERDEF';
import { Dropdown } from 'antd';
import { ShortName } from '../../helpers/TextHelpers';
import { ArrowTopRightOnSquareIcon, BarsArrowDownIcon, ClipboardDocumentListIcon, Cog6ToothIcon, ShieldCheckIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { PROD_AXIOS_INSTANCE } from '../../../config/Api';





const TopMenu = (props) => {
    const location = useLocation();
    const {userdata} = props;
    const [roleMenu, setRoleMenu] = useState([]);
    const [companiesMenu, setCompanieseMenu] = useState([]);
    // const [userMenu, setUserMenu] = useState([]);


    useEffect(() => {
        console.log('userdata', userdata)
        if (!userdata || userdata.length === 0){ return; };
        let activeRole = userdata.user.sales_role;
        let activeCompany = userdata.user.active_company;
        let roles = [];

        if (!activeRole || activeRole === 0){
            changeUserRole(1);
            activeRole = 1;
        };
        let comps = userdata.companies.filter((item)=>item.id > 1);


        console.log('comps', comps)
        for (let i = 0; i < comps.length; i++) {
            const company = comps[i];
            console.log('company', company)
            if (!activeCompany || activeCompany < 2){
                if (company.places && company.places.length > 0){
                    activeCompany = company.id;
                    changeUserCompany(activeCompany);
                    console.log('CHANGE', activeCompany)
                };

            }

            if (company.id === activeCompany && company.places.length > 0){
                for (let y = 0; y < company.places.length; y++) {
                    const place = company.places[y];
                    console.log('place', place)
                    roles.push({
                        key: 'rolecom_' + company.id + "_" + place.id,
                        label: (
                        <div 
                            className={`${place.place === activeRole ? "active" : ""}`}
                            onClick={() => {
                                if (place.place !== activeRole || company.id !== activeCompany) {
                                    changeUserRole(place.place);
                                }
                                // иначе — ничего
                                }}
                            >
                            {place.accessname}
                        </div>
                        ),
                        danger: (place.place === activeRole),
                        icon: (() => {
                        if (place.place === 1) {
                            return <UserCircleIcon height="18px" />;
                        } else if (place.place === 2) {
                            return <ClipboardDocumentListIcon height="18px" />;
                        } else if (place.place === 3) {
                            return <ShieldCheckIcon height="18px" />;
                        }
                        return null; // или <QuestionMarkIcon /> по умолчанию
                        })(),
                    })
                }
            }
        }

        setCompanieseMenu(
            comps.map((item) => ({
                key: 'compas_' + item.id,
                label: <div
                    className={`${item.id === activeCompany ? "active" : ""}`}
                        onClick={() => {
                            if (item.id !== activeCompany) {
                                changeUserCompany(item.id);
                            }
                            // иначе — ничего
                            }}
                >{item.name}</div>,
                danger: item.id === activeCompany,
            }))
        );

        setRoleMenu(roles);
    }, [userdata]);


    const userMenu = [

        {
            key: 'rwterw2',
            label: (
            <div>Настройки</div>
            ),
            icon: <Cog6ToothIcon height={'18px'} />,
        },
        {
            key: '3fgsd',
            label: (
            <div >
                Выйти из системы
            </div>
            ),
            icon: <ArrowTopRightOnSquareIcon height={'18px'} />,
        },
                /*{
            key: '1gsdf',
            label: (
                <Dropdown menu={{items:roleMenu}}>
                <div>Сменить роль</div></Dropdown>
            ),
            icon: <BarsArrowDownIcon height={'18px'} />
        },*/
    ]




      /** ------------------ FETCHES ---------------- */
        /**
         * Получение списка отделов
         * @param {*} req 
         * @param {*} res 
         */
        const set_user_role = async (newplace) => {
            if (PRODMODE) {
                try {
                    let response = await PROD_AXIOS_INSTANCE.post('/auth/me', {
                      place: newplace,
                      _token: CSRF_TOKEN
                    });
                    console.log('response', response);
                    if (response.data){
                        if (props.changed_user_data){
                            props.changed_user_data(response.data);
                        }
                    }
                } catch (e) {
                    console.log(e)
                } finally {
                    // setLoadingOrgs(false)

                }
            } else {
                //setUserAct(USDA);

            }
        }
    
        const set_user_company = async (newcom) => {
            if (PRODMODE) {
                try {
                    let response = await PROD_AXIOS_INSTANCE.post('/auth/me', {
                      id_company: newcom,
                      _token: CSRF_TOKEN
                    });
                    console.log('response', response);
                    if (response.data){
                        if (props.changed_user_data){
                            props.changed_user_data(response.data);
                        }
                    }
                } catch (e) {
                    console.log(e)
                } finally {
                    // setLoadingOrgs(false)

                }
            } else {
                //setUserAct(USDA);

            }
        }
    
    
      /** ------------------ FETCHES END ---------------- */








    const changeUserCompany = (company_id) => {
        console.log('company_id', company_id)
        set_user_company(company_id);
    };
    
    const changeUserRole = (role_id) => {
        set_user_role(role_id);
    };

  return (
    <div className='sa-top-menu' style={{padding:'0 12px'}}>
        <div className={'sa-flex-space'}>
        <div className={'sa-top-menu-buttons'}>
            <NavLink to={HTTP_HOST}>
                <div className={'sa-topmenu-button'} ><HomeFilled /></div>
            </NavLink>
            <NavLink to="/orgs" >
                <div className={'sa-topmenu-button'} >Организации</div>
            </NavLink>
            <NavLink to="/bids" >
                <div className={'sa-topmenu-button'} >Заявки</div>
            </NavLink>
            <NavLink to="/price" >
                <div className={'sa-topmenu-button'} >Прайс</div>
            </NavLink>
            {userdata && userdata.user && userdata.user.super && (
                <NavLink to="/orgs/534">
                    <div className={'sa-topmenu-button'}>Заявка</div>
                </NavLink>
            )}
            {userdata && userdata.user && userdata.user.super && (
                <NavLink to="/dev/icons/antdicons">
                    <div className={'sa-topmenu-button'}>DEV</div>
                </NavLink>
            )}
            {userdata && userdata.user && userdata.user.super && (
                <NavLink to="/curator/exmonitor">
                    <div className={'sa-topmenu-button'}>Exmo</div>
                </NavLink>
            )}
            <NavLink to="/curator" >
                <div className={'sa-topmenu-button'} >Кураторство</div>
            </NavLink>
            <NavLink to="/engineer" >
                <div className={'sa-topmenu-button'} >Инженеры</div>
            </NavLink>

        </div>

        {/* <div>
            <div style={{ height: '36px'}}>
            <LogoRondo height='145px'  />

            </div>
        </div> */}
        <div className={'sa-topmenu-userbox'}>

            <Dropdown menu={{ items: userMenu }}>
            <div className={'sa-flex-gap'}> 
                <div>
                {ShortName(props.userdata?.user?.surname, props.userdata?.user?.name, props.userdata?.user?.secondname)}
                </div>
                {/*<div>
                    {props.userdata?.user?.sales_role && USER_ROLES && (
                        <span
                            style={{color: `${USER_ROLES.find((item)=> item.id === props.userdata?.user?.sales_role)?.color}`, padding: '3px 12px', borderRadius: '3px'}}
                        >{USER_ROLES.find((item)=> item.id === props.userdata?.user?.sales_role)?.name}</span>
                    )}
                </div>*/}
            </div>
            </Dropdown> 
            <Dropdown menu={{items: companiesMenu}}>
            <div style={{padding: '2px 14px'}}>
                {props.userdata?.user?.active_company === 2 && (
                    <LogoArstelLight height='30px'  />

                )}
                {props.userdata?.user?.active_company === 3 && (
                    <LogoRondoLight height='30px'  />

                )}
            </div>
            </Dropdown>
        </div>
        </div>
    </div>
  );
};

export default TopMenu;