import React, { useEffect, useState } from 'react';
import TorgPageSectionRow from '../../../TorgPageSectionRow';
import { Button, Input } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { TORG_DELETE_SIZE, TORG_MAX_ROWS_TEXTAREA, TORG_MIN_ROWS_TEXTAREA } from '../../../TorgConfig';
import { TrashIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';


const RequisiteMicroSectionTorg = (props) => {
  const [editMode, setEditMode] = useState(true); // true|false - режим редактирования

  // Оригинал объекта, в который сетапятся данные для отправки наружу
  const [baseData, setBaseData] = useState(null);

  const [itemId, setItemId] = useState(null);
  const [orgId, setOrgId] = useState(null);
  // const [theme, setTheme] = useState('');
  // const [author, setAuthor] = useState(1);
  // const [date, setDate] = useState(null);
  // const [note, setNote] = useState('');
  // const [deleted, setDeleted] = useState(0);

  const [allowDelete, setAllowDelete] = useState(true);


  const [requisites, setRequisites] = useState('');
  const [orgName, setOrgName] = useState('');
  const [inn, setInn] = useState('');
  const [kpp, setKpp] = useState(null);
  const [deleted, setDeleted] = useState(0);



  // ██    ██ ███████ ███████ 
  // ██    ██ ██      ██      
  // ██    ██ █████   █████   
  // ██    ██ ██      ██      
  //  ██████  ██      ██      
  useEffect(() => {
    setEditMode(props.edit_mode);
  }, [props.edit_mode]);

  useEffect(() => {
    setBaseData(JSON.parse(JSON.stringify(props.data)));

    if (props.data.id) {
      setItemId(props.data.id);
      setOrgId(props.data.id_orgs);

      setKpp(props.data?.kpp);
      setOrgName(props.data?.nameorg);
      setRequisites(props.data?.requisites);
      setInn(props.data?.inn);
      setDeleted(props.data?.deleted);


    }


  }, [props.data]);

  useEffect(() => {
    if (deleted && props.on_delete){
      props.on_delete(itemId);
    }
  }, [deleted]);

    const [BLUR_FLAG, setBLUR_FLAG] = useState(null);

  // ██    ██ ███████ ███████       ██   ██ 
  // ██    ██ ██      ██             ██ ██  
  // ██    ██ █████   █████   █████   ███   
  // ██    ██ ██      ██             ██ ██  
  //  ██████  ██      ██            ██   ██ 


  const handleDeleteItem = () => {
    if (props.on_delete) {
      props.on_delete(itemId);
    };
    if (allowDelete) {
      setDeleted(!deleted);
    }
  }

  useEffect(() => {
    setAllowDelete(props.allow_delete);
  }, [props.allow_delete]);


    useEffect(() => {
      // При монтировании компонента форма не отправляется
      // Если не проверять deleted, то после монтирования формы и нажатии удалить - форма не отправится
      if (!BLUR_FLAG && (Boolean(deleted) === Boolean(props.data?.deleted))) return;
      if (editMode  && baseData && baseData.command === 'create' && deleted){
        // Лазейка для удаления созданных в обход таймаута - позволяет избежать гонок при очень быстром удалении
            if (props.on_change){
              baseData.deleted = deleted;
              props.on_change(itemId, baseData,'requisites');
              return;
            }
          }
  
        const timer = setTimeout(() => {
          // При сверх-быстром изменении полей в разных секциях могут быть гонки
        if (editMode  && baseData){
            if (props.on_change){
              // data.date = date ? date.format('DD.MM.YYYY HH:mm:ss') : null;
              
              baseData.kpp = kpp;
              baseData.nameorg        = orgName?.trim();
              baseData.requisites      = requisites?.trim();
              baseData.inn          = inn?.trim();
              baseData.deleted      = deleted;
             
  
              if (baseData.command === undefined || baseData.command !== 'create'){
                if (deleted){
                  baseData.command = 'delete';
                } else {
                  baseData.command = 'update';
                }
              }
              props.on_change( itemId, baseData, 'requisite');
            }
          }
            }, 500);
  
            return () => clearTimeout(timer);
  
    }, [
      BLUR_FLAG,
      deleted,
    ]);



  return (
    <div className={`sa-org-sub-sub-section-row ${deleted ? 'deleted' : ''} 
     ${baseData && baseData.command && baseData.command === 'create' ? 'sa-brand-new-row' : ''}
    `}>
            <TorgPageSectionRow
              edit_mode={editMode}
              inputs={[
              {
                edit_mode: editMode,
                label: 'Организация',
                input:
                  
                  <Input
                    key={'orgreques_1_' + baseData?.id + orgId}
                    value={orgName}
                    onChange={e => setOrgName(e.target.value)}
                    // placeholder="Controlled autosize"
                    readOnly={!editMode}
                    variant="borderless"
                    maxLength={200}
                    required={true}
                    onBlur={()=>{setBLUR_FLAG(dayjs().unix());}}
                  />,
                  required: true,
                  value: orgName
              },
               
            ]}
            
            action={<Button
                className='sa-org-sub-sub-section-row-action'
                size='small'
                color="danger"
                variant="outlined"
                icon={<TrashIcon height={TORG_DELETE_SIZE} />}
                onClick={()=>{
                    setDeleted(!deleted);
                    setBLUR_FLAG(dayjs().unix());
                }}
                />
            }
          />

          <TorgPageSectionRow
              explabel={'Реквизиты'}
              edit_mode={editMode}
              inputs={[
              {
                edit_mode: editMode,
                label: 'ИНН',
                input:
                  
                  <Input
                    key={'orgreques_2_' + baseData?.id + orgId}
                    value={inn}
                    onChange={e => setInn(e.target.value)}
                    // placeholder="Controlled autosize"
                    readOnly={!editMode}
                    variant="borderless"
                    maxLength={64}
                    required={true}
                    onBlur={()=>{setBLUR_FLAG(dayjs().unix());}}
                  />,
                  required: true,
                  value: inn
              },
                {
                edit_mode: editMode,
                label: 'КПП',
                input:
                  
                  <Input
                    key={'orgreques_3_' + baseData?.id + orgId}
                    value={kpp}
                    // type={'number'}
                    onChange={e => setKpp(e.target.value)}
                    // placeholder="Controlled autosize"
                    readOnly={!editMode}
                    variant="borderless"
                    maxLength={64}
                    required={false}
                    onBlur={()=>{setBLUR_FLAG(dayjs().unix());}}
                  />,
                  required: false,
                  value: kpp
              },
            ]}
            extratext={[
              {
                edit_mode: editMode,
                label: 'Реквизиты',
                input:
                  
                  <TextArea
                    key={'orgreques_4_' + baseData?.id + orgId}
                    value={requisites}
                    onChange={(e)=>setRequisites(e.target.value)}
                    // placeholder="Controlled autosize"
                    autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                    readOnly={!editMode}
                    variant="borderless"
                    maxLength={5000}
                    required={true}
                    onBlur={()=>{setBLUR_FLAG(dayjs().unix());}}
                  />,
                  required: false,
                  value: requisites
              },
            ]}
           
          />
          </div>
  );
};

export default RequisiteMicroSectionTorg;