import { ArchiveBoxXMarkIcon, ArrowRightEndOnRectangleIcon, ArrowRightStartOnRectangleIcon, DocumentCurrencyDollarIcon, NewspaperIcon  } from '@heroicons/react/24/outline';
import {Button, Dropdown, Menu, Tag, Tooltip} from 'antd';
import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {DollarOutlined, FileDoneOutlined, LogoutOutlined, SafetyOutlined} from "@ant-design/icons";
import dayjs from "dayjs";
import PositionList from "./PositionList";


const EngineerListRow = (props) => {

  const [active, setActive] = useState(false);
  const [compColor, setCompColor] = useState("#00000000");

  const [data, setData] = useState(props.data);

  useEffect(() => {
    setData(props.data);
    console.log(props.data)
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
      <div className={`sa-table-box-engineers sa-table-box-row ${active ? 'active' : ''}`} key={props.key}
           style={{color: compColor}}>
        <div className={'sa-table-box-cell'}>
          <div>
            <NavLink to={'/engineer/' + data.id}>
              {data.id}
            </NavLink>
          </div>
        </div>
        <div className={'sa-table-box-cell'}>
          <div>
            <Tooltip
                placement="leftTop"
                title={<PositionList bidId={data.id}/>}
                color="white"
                overlayInnerStyle={{
                  color: 'black',
                  border: '1px solid #d9d9d9'
                }}
            >
              <Tag color={"magenta"}>{data.specs_count}</Tag>
            </Tooltip>
          </div>
        </div>
        <div className={'sa-table-box-cell'}>
          <div>{dayjs.unix(data.created_at).format('DD.MM.YYYY')}</div>
        </div>
        <div className={'sa-table-box-cell'}>
          <div>{data.engineer}</div>
        </div>
        <div className={'sa-table-box-cell text-align-left'}>
          <div>{data.comment}</div>
        </div>
        <div className={'sa-table-box-cell'} style={{display: "inline-block"}}>
          <div>
            <div style={{display: "flex", gap: "8px"}}>
              {![89, 90, 91].includes(props.activeRole) ? (
                  <>
                    <Button type={"primary"} style={{width: "100px"}}>
                      Копировать
                    </Button>
                    <Button type={"primary"} danger>
                      Отправить
                    </Button>
                  </>
              ) : (
                  <>
                    <Button type={"primary"} style={{width: "100px"}}>
                      КП
                    </Button>
                    <Button type={"primary"} danger>
                      СЧЕТ
                    </Button>
                  </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Dropdown>
  );
};

export default EngineerListRow;
