import React, { useEffect, useState } from 'react';

import './style/topmenu.css';
import { NavLink, useLocation } from 'react-router-dom';
import { BASE_ROUTE, HTTP_HOST } from '../../../config/config';
import { HomeFilled } from '@ant-design/icons';
import LogoArstel, { LogoArstelLight } from '../../../assets/Comicon/Logos/LogoArstel';
import LogoRondo, { LogoRondoLight } from '../../../assets/Comicon/Logos/LogoRondo';
import { USER_ROLES } from '../../definitions/USERDEF';


const TopMenu = (props) => {
    const location = useLocation();

  return (
    <div className='sa-top-menu'>
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
            <NavLink to="/orgs/534" >
                <div className={'sa-topmenu-button'} >Заявка</div>
            </NavLink>
            <NavLink to="/dev/icons/antdicons" >
                <div className={'sa-topmenu-button'} >DEV</div>
            </NavLink>
            <NavLink to="/curator/exmonitor" >
                <div className={'sa-topmenu-button'} >Exmo</div>
            </NavLink>
        </div>

        {/* <div>
            <div style={{ height: '36px'}}>
            <LogoRondo height='145px'  />

            </div>
        </div> */}
        <div className={'sa-topmenu-userbox'}>
            <div>
                {props.userdata?.user?.sales_role && USER_ROLES && (
                    <span
                        style={{outline: `1px solid ${USER_ROLES.find((item)=> item.id === props.userdata?.user?.sales_role)?.color}`, padding: '3px 12px', borderRadius: '3px'}}
                    >{USER_ROLES.find((item)=> item.id === props.userdata?.user?.sales_role)?.name}</span>
                )}
            </div>
            <div> 
                {props.userdata?.user?.surname + " " + props.userdata?.user?.name + " " + props.userdata?.user?.secondname}
            </div>
            <div style={{padding: '2px 14px'}}>
                {props.userdata?.user?.id_company === 2 && (
                    <LogoArstelLight height='30px'  />

                )}
                {props.userdata?.user?.id_company === 3 && (
                    <LogoRondoLight height='30px'  />

                )}
            </div>
        </div>
        </div>
    </div>
  );
};

export default TopMenu;