import React, { useEffect, useState } from 'react';
import TorgPageSectionRow from '../../../TorgPageSectionRow';
import { Button, DatePicker, Input, Select } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { TORG_DELETE_SIZE, TORG_MAX_ROWS_TEXTAREA, TORG_MIN_ROWS_TEXTAREA } from '../../../TorgConfig';
import { TrashIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';


const BoLicenseMicroSectionTorg = (props) => {
  const [editMode, setEditMode] = useState(true); // true|false - режим редактирования

  // Оригинал объекта, в который сетапятся данные для отправки наружу
  const [baseData, setBaseData] = useState(null);

  const [itemId, setItemId] = useState(null);
  const [options, setOptions] = useState([]);
  const [selects, setSelects] = useState(null);
  // const [theme, setTheme] = useState('');
  // const [author, setAuthor] = useState(1);
  // const [date, setDate] = useState(null);
  // const [note, setNote] = useState('');
  // const [deleted, setDeleted] = useState(0);

  const [allowDelete, setAllowDelete] = useState(true);


  // const [comment, setComment] = useState('');
  // const [number, setNumber] = useState('');
  // const [id_orgs, setIdOrgs] = useState(null);
  // const [type, setType] = useState(1);
  // const [docType, setDocType] = useState(1);

    const [id, setId] = useState(null);
    const [id_an_orgs, setId_an_orgs] = useState(null); //id_orgsusers
    const [comment,    setComment]    = useState('');
    const [type,       setType]       = useState(1);
    const [docType,    setDocType]    = useState(1);
    const [name,       setName]       = useState('');
    const [deleted,    setDeleted]    = useState(0);
    const [start_date, setStart_date] = useState(0);
    const [end_date,   setEnd_date]   = useState(0);



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
      setId(props.data.id);
      setId_an_orgs(props.data.id_an_orgs);
      setType(      props.data.type);
      setDocType(   props.data.document_type);
      setComment(   props.data.comment);
      setDeleted(   props.data.deleted);
      setName(      props.data.name);
      setDeleted(   props.data.deleted);
      setStart_date(props.data.start_date ? dayjs.unix(props.data.start_date) : null);
      setEnd_date(  props.data.end_date ? dayjs.unix(props.data.end_date) : null);
    }
  }, [props.data]);

  useEffect(() => {
    if (deleted && props.on_delete){
      props.on_delete(itemId);
    }
  }, [deleted]);


 useEffect(() => {
    // //console.log('props.selects', props.selects)
    let arrak = [];
    if (props.selects){
      setSelects(props.selects);
      if (props?.selects?.tollic){
        for (const key in props?.selects?.tollic) {
            if (props?.selects?.tollic.hasOwnProperty(key)) {
              if (key.startsWith(String(docType))){
                const davalue = props.selects.tollic[key];
                arrak.push({
                  key: 'kivala_k' + key + '_' + id,
                  value: Number(key.split('-')[1]),
                  label: davalue
                });
              }
                // Your logic here
            }
        }
      }
    }
    // //console.log('ARRAK', arrak);
    setOptions(arrak);
  }, [props.selects, docType]);

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
                  props.on_change(id, baseData);
                  return;
            }
          }
  
        const timer = setTimeout(() => {
          // При сверх-быстром изменении полей в разных секциях могут быть гонки
        if (editMode  && baseData){
            if (props.on_change){
              // data.date = date ? date.format('DD.MM.YYYY HH:mm:ss') : null;
              
              // baseData.id_orgsusers = id_orgsusers;
              // baseData.number        = number?.trim();
              // baseData.comment      = comment?.trim();
              // baseData.ext          = ext;
              // baseData.deleted      = deleted;
             
              baseData.id_an_orgs    = id_an_orgs;
              baseData.type          = type;
              baseData.document_type = docType;
              baseData.name          = name;
              baseData.start_date    = start_date ? start_date.unix() : null;
              baseData.end_date      = end_date ? end_date.unix() : null;
              baseData.comment       = comment;
              baseData.deleted       = deleted;
              
              console.log('CHANGE BOLIC', baseData);
              if (baseData.command === undefined || baseData.command !== 'create'){
                if (deleted){
                  baseData.command = 'delete';
                } else {
                  baseData.command = 'update';
                }
              }
              props.on_change( id, baseData, 'bo_license');
            }
          }
            }, 500);
  
            return () => clearTimeout(timer);
  
    }, [
      type,
      deleted,
      BLUR_FLAG,
    ]);



  return (
    <div className={`sa-org-sub-sub-section-row ${deleted ? 'deleted' : ''} 
     ${baseData && baseData.command && baseData.command === 'create' ? 'sa-brand-new-row' : ''}
    `}>
            <TorgPageSectionRow
              explabel={'комм'}
              edit_mode={editMode}
              inputs={[
              {
                edit_mode: editMode,
                label: docType === 1 ? "Лицензия" : "Допуск СРО",
                input:
                  <Input
                    size={'small'}
                    key={'bodicden_2_' + baseData?.id + id}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    // placeholder="Controlled autosize"
                    autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                    readOnly={!editMode}
                    variant="borderless"
                    maxLength={255}
                    required={true}
                    onBlur={() => setBLUR_FLAG(dayjs().unix())}
                  />,
                  required: true,
                  value: name
              },
                {
                edit_mode: editMode,
                label: 'Начало действия',
                input:
                  <DatePicker
                    size={'small'}
                    key={'bodicfden_2_' + baseData?.id + id}
                    value={start_date}
                      onChange={(e) => {setStart_date(e);
                      setBLUR_FLAG(dayjs().unix());
                    }}
                    // placeholder="Controlled autosize"
                    readOnly={!editMode}
                    variant="borderless"
                    
                    required={false}
                    // onBlur={() => setBLUR_FLAG(dayjs().unix())}
                  />,
                  required: false,
                  value: start_date
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

          <TorgPageSectionRow
              explabel={'комм'}
              edit_mode={editMode}
              inputs={[
              {
                edit_mode: editMode,
                label:  "Вид лицензии/допуска",
                input:
                  <Select
                  key={'bodicdend_2_' + baseData?.id + id}
                    value={type}
                    options={options}
                    onChange={(ee)=>{
                      setType(ee);
                      setBLUR_FLAG(dayjs().unix()); 
                    }}
                    size={'small'}
                    variant="borderless"
                    disabled={!editMode}
                    />,
                  required: true,
                  value: type
              },
                {
                edit_mode: editMode,
                label: 'Конец действия',
                input:
                                    <DatePicker
                    size={'small'}
                    key={'bodicfddn_2_' + baseData?.id + id}
                    value={end_date}
                    onChange={e => {
                      setEnd_date(e);
                      setBLUR_FLAG(dayjs().unix());
                    }}
                    // placeholder="Controlled autosize"
                    readOnly={!editMode}
                    variant="borderless"
                    
                    required={false}
                    // onBlur={() => setBLUR_FLAG(dayjs().unix())}
                  />,
                  required: false,
                  value: end_date
              },
            ]}
            extratext={[
              {
                edit_mode: editMode,
                label: 'Комментарий',
                input:
                  
                  <TextArea
                    key={'bodicdesan_1_' + baseData?.id + id}
                    value={comment}
                    onChange={(e)=>setComment(e.target.value)}
                    // placeholder="Controlled autosize"
                    autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                    readOnly={!editMode}
                    variant="borderless"
                    maxLength={5000}
                    onBlur={() => setBLUR_FLAG(dayjs().unix())}
                    
                  />,
                  required: false,
                  value: comment
              },
            ]}
            action={<div></div>
            }
          />
          </div>
  );
};

export default BoLicenseMicroSectionTorg;