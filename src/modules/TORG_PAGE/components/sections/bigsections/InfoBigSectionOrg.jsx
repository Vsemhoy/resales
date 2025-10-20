import React, { useEffect, useState } from 'react';
import TorgPageSectionRow from '../../TorgPageSectionRow';
import { Input, Select } from 'antd';
import dayjs from 'dayjs';
import TextArea from 'antd/es/input/TextArea';
import { TORG_MAX_ROWS_TEXTAREA, TORG_MIN_ROWS_TEXTAREA } from '../../TorgConfig';
import { ShortName } from '../../../../../components/helpers/TextHelpers';

const InfoBigSectionOrg = (props) => {
  const [editMode, setEditMode] = useState(false);

  const [selects, setSelects] = useState([]);

  const [itemId,         setItemId]           = useState(0);
  const [statusmoney, setStatusmoney]         = useState(0);
  const [conveyance, setConveyance]           = useState(0);
  const [typeList, setTypeList] = useState(0);
  const [listComment,       setListComment] = useState('');

  const [author, setAuthor] = useState(''); //id8staff_list7author
  const [curator, setCurator] = useState('');

    const [BLUR_FLAG, setBLUR_FLAG] = useState(null);
    const [ACTION_FLAG, setACTION_FLAG] = useState(null);

  useEffect(() => {
    setEditMode(props.edit_mode)
  }, [props.edit_mode]);

    useEffect(() => {
      setBLUR_FLAG(null);
      setACTION_FLAG(null);
    }, [props.data.id, props.org_id]);

  useEffect(() => {
    if (props.data?.id){
          setItemId(props.data?.id);
          // setObjectResult(props.data);
          if (props.data?.creator){
            setAuthor(ShortName(props.data?.creator?.surname, props.data?.creator?.name, props.data?.creator?.secondname));
          } else {
            setAuthor('');
          };
          if (props.data?.curator){
            setCurator(ShortName(props.data?.curator?.surname, props.data?.curator?.name, props.data?.curator?.secondname));
          } else {
            setCurator('');
          };
    
          setStatusmoney(props.data?.id8an_statusmoney);
          setConveyance(props.data?.id8an_conveyance);
          
          setTypeList(props.data?.list?.id8an_typelist ? props.data?.list?.id8an_typelist : 0);
          setListComment(props.data?.list?.comment ? props.data?.list?.comment : '');
      };
    
  }, [props.data]);

  useEffect(() => {
    if (BLUR_FLAG === null){ return; }
      if (props.on_blur){
        props.on_blur(collectData());
      }
  }, [
    BLUR_FLAG,
  ]);


  useEffect(() => {
    setSelects(props.selects);
  }, [props.selects]);

  const collectData = () => ({
    id8an_statusmoney: statusmoney,
    id8an_conveyance: conveyance,
    list:
			{
				id8an_typelist: typeList,
				comment: listComment,
				id_orgs: itemId,
			}
  });

    // Для отправки прямо в коллектор по кейдауну
    useEffect(() => {
      if (ACTION_FLAG && props.on_change && editMode){
        const timer = setTimeout(() => {
          props.on_change(collectData());
      }, 500);
      return () => clearTimeout(timer);
      }
    }, [   
      statusmoney,
      conveyance,
      listComment,
      listComment,
      ]);


  return (
    <div className={'sa-org-collapse-content'}>

            
            {/* ===================================================================================================== */}
            <TorgPageSectionRow
                
               
                inputs={[
                {
                  label: 'Автор',
                  input:
                  <Input
                      key={'nameserow' + itemId}
                      value={props.author}
                      // onChange={e => setAddress(e.target.value)}
  
                      // placeholder="Controlled autosize"
                      readOnly={true}
                      variant="borderless"
                      maxLength={1550}
                      required={false}
                    />
                  
                   
                },
                  {
                  label: 'Куратор',
                  input:
                    <Input
                      key={'nameserow' + itemId}
                      value={props.curator}
                      // onChange={e => setAddress(e.target.value)}
  
                      // placeholder="Controlled autosize"
                      readOnly={true}
                      variant="borderless"
                      maxLength={1550}
                      required={false}
                    />,
                    required: false,
                    value: curator
                },
              ]}
            action={
              <div></div>
            }
            
            />
  
            
            {/* ===================================================================================================== */}
            <TorgPageSectionRow
                
                edit_mode={editMode}
                inputs={[
                {
                  edit_mode: editMode,
                  label: 'Статус $',
                  input:
                    
                    <Select
                    showSearch
                                    filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                }
                      key={'fsr2ow_' + itemId}
                      value={parseInt(statusmoney)}
                      onChange={(ee)=>{
                        setStatusmoney(ee);
                        setACTION_FLAG(1);
                        setBLUR_FLAG(dayjs().unix());
                        }}
                      // placeholder="Controlled autosize"
                      // readOnly={!editMode}
                      variant="borderless"
                      maxLength={2500}
                      required={true}
                      size={'small'}
                      options={selects?.price_statuses?.map((item)=>({
                        key: "fsprofle_" + item.key ? item.key : item.id  ,
                        value: item.key ? item.key : item.id,
                        label: item.label ? item.label : item.name,
                      }))}
                      disabled={!editMode}
                    />,
                    required: true,
                    value: statusmoney
                },
                  {
                  edit_mode: editMode,
                  label: 'Способ доставки',
                  input:
                    
                    <Select
                    showSearch
                                    filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                }
                      key={'fs54row_' + itemId}
                      value={parseInt(conveyance)}
                      onChange={(ee)=>{
                        setConveyance(ee);
                        setACTION_FLAG(1);
                        setBLUR_FLAG(dayjs().unix());
                        }}
                      // placeholder="Controlled autosize"
                      // readOnly={!editMode}
                      variant="borderless"
                      maxLength={2500}
                      required={true}
                      size={'small'}
                      options={selects?.conveyance?.map((item)=>({
                        key: "fsseb_" + item.id,
                        value: item.id,
                        label: item.name,
                      }))}
                      disabled={!editMode}
                    />,
                    required: false,
                    value: conveyance
                },
              ]}

            
            />
            {/* ===================================================================================================== */}

            <TorgPageSectionRow
                edit_mode={editMode}
                inputs={[
                   {
                  edit_mode: editMode,
                  label: 'Списки',
                  input:
                    
                    <Select
                      showSearch
                      key={'fsr2ow_' + itemId}
                      value={typeList}
                      onChange={(ee)=>{
                        setTypeList(ee);
                        setACTION_FLAG(1);
                        setBLUR_FLAG(dayjs().unix());
                        }}
                      // placeholder="Controlled autosize"
                      // readOnly={!editMode}
                      variant="borderless"
                      maxLength={2500}
                      required={true}
                      size={'small'}
                      options={selects?.rate_lists?.map((item)=>({
                        key: "fssebli_" + item.id,
                        value: item.id,
                        label: item.name,
                      }))}
                      disabled={!editMode}
                    />,
                    required: true,
                    value: typeList
                },
                {
                  edit_mode: editMode,
                  label: 'Коммент. списка',
                  input:
                    <Input
                      key={'nameserow' + itemId}
                      value={listComment}
                      // onChange={e => setAddress(e.target.value)}
                      onBlur={()=>{setBLUR_FLAG(dayjs().unix());}}
                      onChange={e => {
                        setListComment(e.target.value);
                        setACTION_FLAG(1);
                      }}
                      // placeholder="Controlled autosize"
                      readOnly={!editMode}
                      variant="borderless"
                      maxLength={1550}
                      required={false}
                    />,
                    required: false,
                    value: listComment
                },
              ]}
             
            />
            
            {/* ===================================================================================================== */}

          </div>
  );
};

export default InfoBigSectionOrg;