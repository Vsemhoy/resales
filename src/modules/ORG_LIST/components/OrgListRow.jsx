import { Dropdown, Menu } from 'antd';
import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';


const OrgListRow = (props) => {

  const menu = (
    <Menu>
      <Menu.Item key="1">Запросить кураторство</Menu.Item>
      <Menu.Item key="2">Передать кураторство</Menu.Item>
      <Menu.Item key="3">Создать КП</Menu.Item>
      <Menu.Item key="4">Создать Счёт</Menu.Item>
      <Menu.Item key="5">Удалить</Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={['contextMenu']}>
      <div className={'sa-table-box-orgs sa-table-box-row'} key={props.key}
        style={{ color:'#ff8700'}}
      >
        <div className={'sa-table-box-cell'}
        // style={{background:'#ff870002', borderLeft:'6px solid #ff8700'}}
        >
        <NavLink to={'/orgs/4234'}>
        <div
        
        >35667</div>
        </NavLink>
        </div>
        <div className={'sa-table-box-cell'}
        >
        <NavLink to={'/orgs/4234'}>
        <div>Название / второе название</div>
        </NavLink>
        </div>
        <div className={'sa-table-box-cell'}>
        <div>Дата отвязки</div>
        </div>
        <div className={'sa-table-box-cell'}>
        <div>Компания</div>
        </div>
        <div className={'sa-table-box-cell'}>
        <div>1</div>
        </div>
        <div className={'sa-table-box-cell'}>
        <div>1</div>
        </div>
        <div className={'sa-table-box-cell'}>
        <div>1</div>
        </div>
        <div className={'sa-table-box-cell'}>
        <div>1</div>
        </div>
        <div className={'sa-table-box-cell'}>
        <div>1</div>
        </div>
        <div className={'sa-table-box-cell'}>
        <div>1</div>
        </div>
        {/* <div className={'sa-table-box-cell'}>
        <div>1</div>
        </div>
        <div className={'sa-table-box-cell'}>
        <div>1</div>
        </div> */}

    </div>
    </Dropdown>
  );
};

export default OrgListRow;