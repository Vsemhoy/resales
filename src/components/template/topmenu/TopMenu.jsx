import React, { useEffect, useState } from 'react';

import './style/topmenu.css';
import { NavLink, useLocation } from 'react-router-dom';
import { BASE_ROUTE } from '../../../config/config';
import { HomeFilled } from '@ant-design/icons';


const TopMenu = (props) => {
    const location = useLocation();

  return (
    <div className='sa-top-menu'>
        <div className={'sa-top-menu-buttons'}>
            <NavLink to={BASE_ROUTE}>
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
        </div>
        
    </div>
  );
};

export default TopMenu;