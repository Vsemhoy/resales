import { ArchiveBoxXMarkIcon, ArrowRightEndOnRectangleIcon, ArrowRightStartOnRectangleIcon, DocumentCurrencyDollarIcon, NewspaperIcon  } from '@heroicons/react/24/outline';
import {Button, Dropdown, Menu, Space, Tag, Tooltip} from 'antd';
import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  DeleteOutlined,
  DollarOutlined,
  FileDoneOutlined,
  InfoCircleOutlined,
  LogoutOutlined,
  SafetyOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import Name from "./alan/Name";
import Count from "./alan/Count";


const EngineerListRow = (props) => {
  const [data, setData] = useState([]);
  const [allModels, setAllModels] = useState(props.allModels ?? null);

  useEffect(() => {
    setData(props.data);
  }, [props.data])

  return (
    <Dropdown trigger={['contextMenu']}>
      {/*style={{color: compColor}}*/}
      <div className={`sa-table-box-engineer sa-table-box-row`} key={props.key}>
        <div className={'sa-table-box-cell'}>
          <div>
            {props.index + 1}
          </div>
        </div>
        <div className={'sa-table-box-cell'}>
          <div>
            <Name
                old={data.type_model !== 0}
                id={data.model_id}
                models={allModels}
                value={data.model_name}
                EDITMODE={props.EDITMODE}
                update_local_state={props.update_local_state}
                index={props.index}
            />
          </div>
        </div>
        <div className={'sa-table-box-cell'}>
          <div>
            <Count
                count={data.model_count}
                // disabled={el.type_model !== 0}
                EDITMODE={props.EDITMODE}
                update_local_state={props.update_local_state}
                index={props.index}
            />
          </div>
        </div>
        <div className={'sa-table-box-cell'}>
          <div style={{ justifyContent: 'flex-end'}}>
            <Space size="middle">
              <InfoCircleOutlined onClick={() => console.log("sdadas")}/>
              <DeleteOutlined
                  onClick={() => props.update_local_state("delete", "", props.index)}
              />
            </Space>
          </div>
          {/*<div style={{spacebeetwen: 'right'}}>*/}
          {/*  <InfoCircleOutlined onClick={() => console.log("sdadas")}/>*/}
          {/*  /!*setExtraId(el.model_id)*!/*/}


          {/*</div>*/}

        </div>
      </div>
    </Dropdown>
  );
};

export default EngineerListRow;
