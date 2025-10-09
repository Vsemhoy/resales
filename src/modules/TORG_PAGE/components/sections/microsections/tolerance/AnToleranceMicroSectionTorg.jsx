import React, { useEffect, useState } from 'react';
import TorgPageSectionRow from '../../../TorgPageSectionRow';
import { Button, Input } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { TORG_DELETE_SIZE, TORG_MAX_ROWS_TEXTAREA, TORG_MIN_ROWS_TEXTAREA } from '../../../TorgConfig';
import { TrashIcon } from '@heroicons/react/24/outline';


const AnToleranceMicroSectionTorg = (props) => {
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
  const [id_orgsusers, setIdOrgsusers] = useState(null);
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

      setIdOrgsusers(props.data?.id_orgsusers);
      setNumber(props.data?.number);
      setComment(props.data?.comment);
      setExt(props.data?.ext);
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
              baseData.number        = number?.trim();
              baseData.comment      = comment?.trim();
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
      id_orgsusers,
      number,
      comment,
      deleted,
      ext
    ]);



  return (
    <div className={`sa-org-sub-sub-section-row ${deleted ? 'deleted' : ''}`}>
            <TorgPageSectionRow
              explabel={'комм'}
              edit_mode={editMode}
              inputs={[
              {
                edit_mode: editMode,
                label: 'Контактный телефон',
                input:
                  
                  <Input
                    key={'csontnumber_' + baseData?.id + orgId}
                    value={number}
                    onChange={e => setNumber(e.target.value)}
                    // placeholder="Controlled autosize"
                    autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                    readOnly={!editMode}
                    variant="borderless"
                    maxLength={25}
                    required={true}
                  />,
                  required: true,
                  value: number
              },
                {
                edit_mode: editMode,
                label: 'Добавочн.',
                input:
                  
                  <Input
                    key={'csontnumber_' + baseData?.id + orgId}
                    value={ext}
                    type={'number'}
                    onChange={e => setExt(e.target.value)}
                    // placeholder="Controlled autosize"
                    autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                    readOnly={!editMode}
                    variant="borderless"
                    maxLength={25}
                    required={false}
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
                    key={'cossntnumber_2_' + baseData?.id + orgId}
                    value={comment}
                    onChange={(e)=>setComment(e.target.value)}
                    // placeholder="Controlled autosize"
                    autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                    readOnly={!editMode}
                    variant="borderless"
                    maxLength={5000}
                    
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
                }}
                />
            }
          />
          </div>
  );
};

export default AnToleranceMicroSectionTorg;