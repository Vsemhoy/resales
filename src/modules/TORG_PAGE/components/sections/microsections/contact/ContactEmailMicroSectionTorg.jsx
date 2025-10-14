import React, { useEffect, useState } from 'react';
import TorgPageSectionRow from '../../../TorgPageSectionRow';
import { Button, Input } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { TORG_DELETE_SIZE, TORG_MAX_ROWS_TEXTAREA, TORG_MIN_ROWS_TEXTAREA } from '../../../TorgConfig';
import { TrashIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';


const ContactEmailMicroSectionTorg = (props) => {
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
  const [email, setEmail] = useState('');
  const [id_orgsusers, setIdOrgsusers] = useState(null);
  const [deleted, setDeleted] = useState(0);

      const [BLUR_FLAG, setBLUR_FLAG] = useState(null);


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

      setIdOrgsusers(props.data?.id_orgsusers);
      setEmail(props.data?.email);
      setComment(props.data?.comment);
      setDeleted(props.data?.deleted);


    }


  }, [props.data]);

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
        if (!BLUR_FLAG && (Boolean(deleted) === Boolean(props.data?.deleted))) return;
      if (editMode  && baseData && baseData.command === 'create' && deleted){
        // Лазейка для удаления созданных в обход таймаута - позволяет избежать гонок при очень быстром удалении
            if (props.on_change){
              baseData.deleted = deleted;
                  baseData.command = 'delete';
                  props.on_change('notes', itemId, baseData);
                  return;
            }
          }
  
        const timer = setTimeout(() => {
          // При сверх-быстром изменении полей в разных секциях могут быть гонки
        if (editMode  && baseData){
            if (props.on_change){
              // data.date = date ? date.format('DD.MM.YYYY HH:mm:ss') : null;
              
              baseData.id_orgsusers = id_orgsusers;
              baseData.email        = email?.trim();
              baseData.comment      = comment?.trim();
              baseData.deleted      = deleted;
             
  
              if (baseData.command === undefined || baseData.command !== 'create'){
                if (deleted){
                  baseData.command = 'delete';
                } else {
                  baseData.command = 'update';
                }
              }
              props.on_change( itemId, baseData, 'contact_email');
            }
          }
            }, 500);
  
            return () => clearTimeout(timer);
  
    }, [
      id_orgsusers,
      BLUR_FLAG,
      deleted
    ]);



  return (
    <div className={`sa-org-sub-sub-section-row ${deleted ? 'deleted' : ''}`}>
            <TorgPageSectionRow
              explabel={'комм'}
              edit_mode={editMode}
              inputs={[
              {
                edit_mode: editMode,
                label: 'Email',
                input:
                  
                  <Input
                    key={'coeentemail_' + baseData?.id + orgId}
                    value={email}
                    type={'email'}
                    onChange={e => setEmail(e.target.value)}
                    // placeholder="Controlled autosize"
                    autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                    readOnly={!editMode}
                    variant="borderless"
                    maxLength={64}
                    required={true}
                    onBlur={()=>{setBLUR_FLAG(dayjs().unix())}}
                  />,
                  required: true,
                  value: email
              },
            ]}
            extratext={[
              {
                edit_mode: editMode,
                label: 'Комментарий',
                input:
                  
                  <TextArea
                    key={'coeentemail_2_' + baseData?.id + orgId}
                    value={comment}
                    onChange={(e)=>setComment(e.target.value)}
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
            action={editMode && (<Button
                className='sa-org-sub-sub-section-row-action'
                size='small'
                color="danger"
                variant="outlined"
                icon={<TrashIcon height={TORG_DELETE_SIZE} />}
                onClick={()=>{
                    setDeleted(!deleted);
                }}
                />)
            }
          />
          </div>
  );
};

export default ContactEmailMicroSectionTorg;