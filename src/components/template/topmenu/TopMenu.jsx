import React, { useEffect, useState } from 'react';

import './style/topmenu.css';
import { NavLink, useLocation } from 'react-router-dom';
import { BASE_ROUTE, HTTP_HOST } from '../../../config/config';
import { HomeFilled } from '@ant-design/icons';
import LogoArstel from '../../../assets/Comicon/Logos/LogoArstel';
import LogoRondo from '../../../assets/Comicon/Logos/LogoRondo';


const TopMenu = (props) => {
    const location = useLocation();

  return (
    <div className='sa-top-menu'>
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
        
    </div>
  );
};

export default TopMenu;