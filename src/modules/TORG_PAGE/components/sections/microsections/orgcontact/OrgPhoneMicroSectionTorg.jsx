import React, { useEffect, useState } from 'react';
import TorgPageSectionRow from '../../../TorgPageSectionRow';
import { Button, Input } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { TORG_DELETE_SIZE, TORG_MAX_ROWS_TEXTAREA, TORG_MIN_ROWS_TEXTAREA, TORG_SECOND_DELAY } from '../../../TorgConfig';
import { TrashIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';


const OrgPhoneMicroSectionTorg = (props) => {
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


  const [comment, setComment] = useState('');
  const [number, setNumber] = useState('');
  const [ext, setExt] = useState('');
  const [deleted, setDeleted] = useState(0);

  const [BLUR_FLAG, setBLUR_FLAG] = useState(null);
    const [ACTION_FLAG, setACTION_FLAG] = useState(null);

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

      setNumber(props.data?.number);
      setComment(props.data?.comment ? props.data?.comment : "");
      setExt(props.data?.ext ? props.data?.ext : "");
      setDeleted(props.data?.deleted);


    }
  }, [props.data]);

  useEffect(() => {
    setAllowDelete(props.allow_delete);
  }, [props.allow_delete]);

  useEffect(() => {
    if (deleted && props.on_delete){
      props.on_delete(itemId);
    }
  }, [deleted]);


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
      // if (editMode  && baseData && baseData.command === 'create' && deleted){
      //   // Лазейка для удаления созданных в обход таймаута - позволяет избежать гонок при очень быстром удалении
      //       if (props.on_change){
      //          baseData.deleted = deleted;
      //         props.on_change(itemId, baseData, 'org_phone');
      //         return;
      //       }
      //     }
  
        const timer = setTimeout(() => {
          // При сверх-быстром изменении полей в разных секциях могут быть гонки
        if (editMode  && baseData){
            if (props.on_change){
              // data.date = date ? date.format('DD.MM.YYYY HH:mm:ss') : null;
              
              baseData.number       = number;
              baseData.comment      = comment;
              baseData.ext          = ext;
              baseData.deleted      = deleted;
             
  
              if (baseData.command === undefined || baseData.command !== 'create'){
                if (deleted){
                  baseData.command = 'delete';
                } else {
                  baseData.command = 'update';
                }
              }
              props.on_change( itemId, baseData, 'contact_phone');
            }
          }
            }, 500);
  
            return () => clearTimeout(timer);
  
    }, [
      BLUR_FLAG,
      deleted,
    ]);

   useEffect(() => {
    if (!editMode) return;
      const timer = setTimeout(() => {
        if (ACTION_FLAG){
          if (props.on_change && baseData) {
            const payload = {
            ...baseData,
            number: number?.trim(),
            comment: comment?.trim(),
            ext: ext?.trim(),
            deleted: deleted,
            command: baseData.command === 'create' 
            ? 'create' 
            : deleted ? 'delete' : 'update'
          };
          if (props.on_collect){
            props.on_collect(payload);
          }
        }
      }
    }, 500);
  
    return () => clearTimeout(timer);

}, [number, comment, ext, deleted, editMode]);

 useEffect(() => {
    setBLUR_FLAG(null);
    setACTION_FLAG(null);
  }, [props.org_id]);

  return (
    <div className={`sa-org-sub-sub-section-row ${deleted ? 'deleted' : ''}
     ${baseData && baseData.command && baseData.command === 'create' ? 'sa-brand-new-row' : ''}
    `}>
            <TorgPageSectionRow
              key={'totoddtl_' + itemId}
              explabel={'комм'}
              edit_mode={editMode}
              inputs={[
              {
                edit_mode: editMode,
                label: 'Телефон',
                input:
                  <Input
                    trans_key={'ttans_csontnumber1_' + baseData?.id + orgId}
                    key={'csontnumber1_' + baseData?.id + orgId}
                    value={number}
                     onChange={e => {
                      setNumber(e.target.value);
                      if (!ACTION_FLAG){ setACTION_FLAG(1)}
                    }}
                    // placeholder="Controlled autosize"
                    
                    readOnly={!editMode}
                    variant="borderless"
                    maxLength={55}
                    required={true}
                    onBlur={()=>{setBLUR_FLAG(dayjs().unix())}}
                  />,
                  required: true,
                  value: number
              },
                {
                edit_mode: editMode,
                label: 'Добавочн.',
                input:
                  
                  <Input
                    key={'csontnumber2_' + baseData?.id + orgId}
                    value={ext}
                    type={'number'}
                     onChange={e => {
                      setExt(e.target.value);
                      if (!ACTION_FLAG){ setACTION_FLAG(1)};
                    }}
                    // placeholder="Controlled autosize"
                
                    readOnly={!editMode}
                    variant="borderless"
                    maxLength={64}
                    required={false}
                    onBlur={()=>{setBLUR_FLAG(dayjs().unix())}}
                  />,
                  required: false,
                  value: ext
              },
            ]}
            extratext={[
              {
                edit_mode: editMode,
                label: 'Комментарий',
                input:
                  
                  <TextArea
                    key={'csontnumber3_' + baseData?.id + orgId}
                    value={comment}
                     onChange={(e)=>{
                      setComment(e.target.value);
                      if (!ACTION_FLAG){ setACTION_FLAG(1)}
                      }}
                    // placeholder="Controlled autosize"
                    autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                    readOnly={!editMode}
                    variant="borderless"
                    maxLength={5000}
                    onBlur={()=>{setBLUR_FLAG(dayjs().unix())}}
                  />,
                  required: false,
                  value: comment
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
                    setACTION_FLAG(1);
                }}
                />
            }
          />
          </div>
  );
};

export default OrgPhoneMicroSectionTorg;