import { ArchiveBoxXMarkIcon, ArrowRightEndOnRectangleIcon, ArrowRightStartOnRectangleIcon, DocumentCurrencyDollarIcon, NewspaperIcon  } from '@heroicons/react/24/outline';
import {Button, Dropdown, Menu, Tag, Tooltip} from 'antd';
import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {DollarOutlined, FileDoneOutlined, LogoutOutlined, SafetyOutlined} from "@ant-design/icons";
import dayjs from "dayjs";
import {CSRF_TOKEN, PRODMODE} from "../../../config/config";
import {PROD_AXIOS_INSTANCE} from "../../../config/Api";
import {CONFIRM_LIST} from "../mock/mock";


const CuratorListRow = (props) => {

  const [active, setActive] = useState(false);
  // const menu = (
  //   <Menu>
  //     <Menu.Item key="1"
  //       icon={<ArrowRightEndOnRectangleIcon  height={"18px"} />}
  //     >Запросить кураторство</Menu.Item>
  //     <Menu.Item key="2"
  //       icon={<ArrowRightStartOnRectangleIcon height={"18px"} />}
  //     >Передать кураторство</Menu.Item>
  //     <Menu.Item key="3"
  //     icon={<NewspaperIcon height={"18px"} />}
  //     >Создать КП</Menu.Item>
  //     <Menu.Item key="4"
  //     icon={<DocumentCurrencyDollarIcon height={"18px"} />}
  //     >Создать Счёт</Menu.Item>
  //     <Menu.Item key="5"
  //     icon={<ArchiveBoxXMarkIcon height={"18px"}/>}
  //     >Удалить</Menu.Item>
  //   </Menu>
  // );

  const [data, setData] = useState(props.data);

  const [compColor, setCompColor] = useState("#00000000");
  const [pressButton, setPressButton] = useState(null);

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
    <Dropdown trigger={['contextMenu']}>
      <div className={`sa-table-box-curators sa-table-box-row ${active ? 'active' : ''}`} key={props.key}
           style={{color: compColor}}
           onDoubleClick={handleDoubleClick}>
        <div className={'sa-table-box-cell'}>
          <div>
            {dayjs.unix(data.created_at).format('DD.MM.YYYY')}
          </div>
        </div>
        <div className={'sa-table-box-cell'}>
          <div>
            {data.full_name}
          </div>
        </div>
        <div className={'sa-table-box-cell'}>
          <div>
            <NavLink to={`/orgs/${data.org_id}`}>
              {data.org_name} ({data.org_id})
            </NavLink>
          </div>
        </div>
        <div className={'sa-table-box-cell'}>
        <Button
              // className={style.menu_action__btn}
              size={"small"}
              color="danger"
              loading={pressButton !== null && !pressButton}
              disabled={pressButton !== null && pressButton}
              variant="filled"
              onClick={(_) => {
                props.approve(false, data.id)
                setPressButton(false)
              }}
          >
            {props.supervisor ? "Отклонить" : "Отозвать"}
          </Button>
          {props.supervisor && (
              <Button
                  // className={style.menu_action__btn}
                  size={"small"}
                  color="primary"
                  loading={pressButton !== null && pressButton}
                  disabled={pressButton !== null && !pressButton}
                  variant="filled"
                  onClick={(_) => {
                    props.approve(true, data.id)
                    setPressButton(true)
                  }}
              >
                Подтвердить
              </Button>
          )}
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

export default CuratorListRow;