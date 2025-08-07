import { ArchiveBoxXMarkIcon, ArrowRightEndOnRectangleIcon, ArrowRightStartOnRectangleIcon, DocumentCurrencyDollarIcon, NewspaperIcon  } from '@heroicons/react/24/outline';
import { Dropdown, Menu } from 'antd';
import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';


const OrgListRow = (props) => {

  const [active, setActive] = useState(false);
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

  const handleDoubleClick = () => {
    if (props.on_double_click){
      props.on_double_click(data);
    }
  }

  return (
    <Dropdown overlay={menu} trigger={['contextMenu']}>
      <div className={`sa-table-box-orgs sa-table-box-row ${active ? 'active':''}`} key={props.key}
        style={{ color:'#ff8700'}}
        onDoubleClick={handleDoubleClick}
      >
        <div className={'sa-table-box-cell'}
        // style={{background:'#ff870002', borderLeft:'6px solid #ff8700'}}
        >
        <div
        
        >
        <NavLink to={'/orgs/4234'}>
          35667
        </NavLink>
          </div>
        </div>
        <div className={'sa-table-box-cell'}
        >
        <div>
        <NavLink to={'/orgs/4234'}>
          Название / второе название
        </NavLink>
          </div>
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