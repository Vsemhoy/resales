import { ArchiveBoxXMarkIcon, ArrowRightEndOnRectangleIcon, ArrowRightStartOnRectangleIcon, DocumentCurrencyDollarIcon, NewspaperIcon  } from '@heroicons/react/24/outline';
import {Dropdown, Menu, Tag, Tooltip} from 'antd';
import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {DollarOutlined, FileDoneOutlined, LogoutOutlined, SafetyOutlined} from "@ant-design/icons";
import dayjs from "dayjs";
import PositionList from "./PositionList";


const BidListRow = (props) => {

  const [active, setActive] = useState(false);
  const [compColor, setCompColor] = useState("#00000000");
  const menu = (
    <Menu>
      <Menu.Item key="1"
        icon={<ArrowRightEndOnRectangleIcon  height={"18px"} />}
      >Запросить кураторство</Menu.Item>
      <Menu.Item key="2"
        icon={<ArrowRightStartOnRectangleIcon height={"18px"} />}
      >Передать кураторство</Menu.Item>
      <Menu.Item key="3"
      icon={<NewspaperIcon height={"18px"} />}
      >Создать КП</Menu.Item>
      <Menu.Item key="4"
      icon={<DocumentCurrencyDollarIcon height={"18px"} />}
      >Создать Счёт</Menu.Item>
      <Menu.Item key="5"
      icon={<ArchiveBoxXMarkIcon height={"18px"}/>}
      >Удалить</Menu.Item>
    </Menu>
  );

  const [data, setData] = useState(props.data);

  useEffect(() => {
    setData(props.data);
  }, [props.data]);


  useEffect(() => {
    setActive(props.is_active);
  }, [props.is_active]);

  useEffect(() => {
    setCompColor(props.company_color);
  }, [props.company_color]);

  const handleDoubleClick = () => {
    if (props.on_double_click){
      props.on_double_click(data);
    }
  }

  return (
    <Dropdown overlay={menu} trigger={['contextMenu']}>
      <div className={`sa-table-box-bids sa-table-box-row ${active ? 'active' : ''}`} key={props.key}
           style={{color: compColor}}
           onDoubleClick={handleDoubleClick}
      >
        <div className={'sa-table-box-cell'}
             //style={{background:'#ff870002', borderLeft:'6px solid #ff8700'}}
        >
          <div

          >
            <NavLink to={`/bids/${data.id}`}>
              {data.id}
            </NavLink>
          </div>
        </div>
        <div className={'sa-table-box-cell'}
        >
          <div className={'text-align-left'}>
            <NavLink to={`/orgs/${data.id}`}>
              {data.company_name}
            </NavLink>
          </div>
        </div>
        <div className={'sa-table-box-cell'}>
          <Tooltip title={data.type_status_name}>
            <div>
              {data.type_status === 1 && (
                  <FileDoneOutlined/>
              )}
              {data.type_status === 2 && (
                  <DollarOutlined/>
              )}
            </div>
          </Tooltip>
        </div>
        <div className={'sa-table-box-cell'}>
          <Tooltip
              title={data.protection_project === 1 ? 'Защита проекта' : data.protection_project === 2 ? 'Реализация проекта' : ''}>
            <div>
              {data.protection_project === 1 && (
                  <SafetyOutlined/>
              )}
              {data.protection_project === 2 && (
                  <LogoutOutlined/>
              )}
            </div>
          </Tooltip>
        </div>
        <div className={'sa-table-box-cell'}>
          <div>
            {data.stage_id === 1 && (
                <Tag color={'blue'}>менеджер</Tag>
            )}
            {data.stage_id === 2 && (
                <Tag color={'volcano'}>администратор</Tag>
            )}
            {data.stage_id === 3 && (
                <Tag color={'magenta'}>бухгалтер</Tag>
            )}
            {data.stage_id === 4 && (
                <Tag color={'gold'}>завершено</Tag>
            )}
          </div>
        </div>
        <div className={'sa-table-box-cell'}>
          <div>{dayjs.unix(data.date).format('DD.MM.YYYY')}</div>
        </div>
        <div className={'sa-table-box-cell'}>
          <div>{data.username}</div>
        </div>
        <div className={'sa-table-box-cell'}>
          <div>{data.bill_number}</div>
        </div>
        <div className={'sa-table-box-cell text-align-left'}>
          <div>{data.comment}</div>
        </div>
        <div className={'sa-table-box-cell text-align-left'}>
          <div>{data.object}</div>
        </div>
        <div className={'sa-table-box-cell'}>
          <div>
            <Tooltip
                placement="leftTop"
                title={<PositionList bidId={data.id} path={'/sales/data/getbidmodels'} />}
                color="white"
                overlayInnerStyle={{
                  color: 'black',
                  border: '1px solid #d9d9d9'
                }}
            >
              <Tag color={"purple"}>{data.models_count}</Tag>
            </Tooltip>
          </div>
        </div>
        <div className={'sa-table-box-cell'}>
          <div>
            <Tooltip
                placement="leftTop"
                title={<PositionList bidId={data.id} path={'/api/sales/doclist'} />}
                color="white"
                style={{
                  maxWidth: '300px',
                  overflow: 'hidden',
                  wordWrap: 'break-word'
                }}
                overlayInnerStyle={{
                  color: 'black',
                  border: '1px solid #d9d9d9'
                }}
                overlayStyle={{ maxWidth: '400px' }}
            >
              <Tag color={"cyan"}>{data.files_count}</Tag>
            </Tooltip>
          </div>
        </div>

      </div>
    </Dropdown>
  );
};

export default BidListRow;
