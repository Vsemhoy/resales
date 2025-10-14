import React, { useEffect, useState } from 'react';
import TorgPageSectionRow from '../../../TorgPageSectionRow';
import { Button, Input, Select } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { TORG_DELETE_SIZE, TORG_MAX_ROWS_TEXTAREA, TORG_MIN_ROWS_TEXTAREA } from '../../../TorgConfig';
import { TrashIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';


const AnLicenseMicroSectionTorg = (props) => {
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


  const [comment, setComment] = useState('');
  const [number, setNumber] = useState('');
  const [id_orgs, setIdOrgs] = useState(null);
  const [type, setType] = useState(1);
  const [docType, setDocType] = useState(1);


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

      console.log('TYPE', props.data);
      setIdOrgs(    props.data.id_orgs);
      if (props.doc_type ===  1){
        setType( parseInt(props.data.id8an_typelicenses));
      } else {
        setType( parseInt(props.data.id8an_typetolerance));
      }
      setDocType(   props.doc_type);
      setComment(   props.data.comment);
      setDeleted(   props.data.deleted);
      setNumber(    props.data.number);
    }
  }, [props.data]);

  useEffect(() => {
    if (deleted && props.on_delete){
      props.on_delete(itemId);
    }
  }, [deleted]);

  useEffect(() => {
    setDocType(props.doc_type);
  }, [props.doc_type]);


    useEffect(() => {
      let arrak = [];
      if (props.selects){
        setSelects(props.selects);
        if (props?.selects?.tollic){
          for (const key in props?.selects?.tollic) {
              if (props?.selects?.tollic.hasOwnProperty(key)) {
                if (key.startsWith(String(docType))){
                  const davalue = props.selects.tollic[key];
                  arrak.push({
                    key: 'kivalas3_k' + key + '_' + itemId,
                    value: Number(key.split('-')[1]),
                    label: davalue
                  });
                }
                  // Your logic here
              }
          }
        }
      }
      setOptions(arrak);
    }, [props.selects, docType, type]);

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
                  baseData.command = 'delete';
                  props.on_change('notes', itemId, baseData);
                  return;
            }
          }
  
        const timer = setTimeout(() => {
          // При сверх-быстром изменении полей в разных секциях могут быть гонки
        if (editMode  && baseData){
            if (props.on_change){
             
              baseData.id_orgs = id_orgs;
              if (props.doc_type ===  1){
                baseData.id8an_typelicenses  = type;
              } else {
                baseData.id8an_typetolerance = type;
              }
              baseData.document_type = docType;
              baseData.comment = comment;
              baseData.deleted = deleted;
              baseData.number = number;
  
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
      id_orgs,
      type,
      deleted,
      BLUR_FLAG,
    ]);



  return (
    <div className={`sa-org-sub-sub-section-row ${deleted ? 'deleted' : ''}`}>
            <TorgPageSectionRow
              explabel={'комм'}
              edit_mode={editMode}
              inputs={[
              {
                edit_mode: editMode,
                label: docType === 1 ? "Лицензия" : "Допуск",
                input:
                  <Select
                  key={'analicensde_2_' + baseData?.id + id_orgs}
                    value={type}
                    options={options}
                    onChange={(ee)=>{
                      setBLUR_FLAG(dayjs().unix());
                      setType(ee);
                      }}
                    size={'small'}
                    variant="borderless"
                    disabled={!editMode}
                    />,
                  required: true,
                  value: number
              },
                {
                edit_mode: editMode,
                label: 'Номер',
                input:
                  
                  <Input
                    size={'small'}
                    key={'analicense_2_' + baseData?.id + id_orgs}
                    value={number}
                    // type={'number'}
                    onChange={e => setNumber(e.target.value)}
                    // placeholder="Controlled autosize"
                    autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                    readOnly={!editMode}
                    variant="borderless"
                    maxLength={55}
                    required={false}
                    onBlur={() => setBLUR_FLAG(dayjs().unix())}
                  />,
                  required: false,
                  value: number
              },
            ]}
            extratext={[
              {
                edit_mode: editMode,
                label: 'Комментарий',
                input:
                  
                  <TextArea
                    key={'analicense_1_' + baseData?.id + id_orgs}
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

export default AnLicenseMicroSectionTorg;