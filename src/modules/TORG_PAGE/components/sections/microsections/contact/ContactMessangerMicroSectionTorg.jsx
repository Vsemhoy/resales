import React, { useEffect, useState } from 'react';
import TorgPageSectionRow from '../../../TorgPageSectionRow';
import { Button, Input, Select } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { TORG_DELETE_SIZE, TORG_MAX_ROWS_TEXTAREA, TORG_MIN_ROWS_TEXTAREA } from '../../../TorgConfig';
import { TrashIcon } from '@heroicons/react/24/outline';


const ContactMessangerMicroSectionTorg = (props) => {
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

  const [identifier, setIdentifier] = useState('');
  const [messangers_id, setMessangers_id] = useState(1);
// 
  const [id_orgsusers, setIdOrgsusers] = useState(null);
  const [deleted, setDeleted] = useState(0);

const [selects, setSelects] = useState(null);

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
      setIdentifier(props.data.identifier);
      setMessangers_id(props.data.messangers_id);
      setDeleted(props.data?.deleted);


    }
  }, [props.data]);

  useEffect(() => {
    if (deleted && props.on_delete){
      props.on_delete(itemId);
    }
  }, [deleted]);

    useEffect(() => {
        if (props.selects){
        setSelects(props.selects);
        }
    }, [props.selects, editMode]);


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
              
              baseData.id_orgsusers     = id_orgsusers;
              baseData.identifier       = identifier?.trim();
              baseData.messangers_id    = messangers_id;
              baseData.deleted          = deleted;
             
  
              if (baseData.command === undefined || baseData.command !== 'create'){
                if (deleted){
                  baseData.command = 'delete';
                } else {
                  baseData.command = 'update';
                }
              }
              props.on_change( itemId, baseData, 'contact_messanger');
            }
          }
            }, 500);
  
            return () => clearTimeout(timer);
  
    }, [
      id_orgsusers,
      identifier,
      messangers_id,
      deleted,
    ]);



  return (
    <div className={`sa-org-sub-sub-section-row ${deleted ? 'deleted' : ''}`}>
            <TorgPageSectionRow
              explabel={'комм'}
              edit_mode={editMode}
              inputs={[
              {
                edit_mode: editMode,
                label: 'Идентификатор пользователя',
                input:
                  
                  <Input
                    key={'contdnumber_' + baseData?.id + orgId}
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder={'@contact_id'}
                    autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                    readOnly={!editMode}
                    variant="borderless"
                    maxLength={250}
                    required={true}
                    
                  />,
                  required: true,
                  value: identifier
              },
                {
                edit_mode: editMode,
                label: 'Мессенджер',
                input:
                  
                  <Select
                    size='small'
                    key={'contdfnumber_' + baseData?.id + orgId}
                    value={messangers_id}
                    type={'number'}
                    onChange={e => setMessangers_id(e)}
                    // placeholder="Controlled autosize"
                    autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                    disabled={!editMode}
                    variant="borderless"
                    maxLength={250}
                    required={true}
                    options={selects?.messangers?.map((item)=>({
                        key: 'messsages_' + item.id,
                        value: item.id,
                        label: item.name
                        }))}
                  />,
                  required: false,
                  value: setMessangers_id
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
                }}
                />
            }
          />
          </div>
  );
};

export default ContactMessangerMicroSectionTorg;