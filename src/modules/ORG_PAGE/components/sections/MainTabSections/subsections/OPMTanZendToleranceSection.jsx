import React, { useEffect, useState } from 'react';
import OrgPageSectionRow, { OPS_TYPE } from '../../OrgPageSectionRow';
import { Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { TrashIcon } from '@heroicons/react/24/outline';
import { forIn } from 'lodash';
import dayjs from 'dayjs';




const OPMTanZendToleranceSection  = (props) => {
  const [editMode, seteditMode] = useState(props.edit_mode ? props.edit_mode : false);

  const [id, setId] = useState(null);
  const [id_orgs, setId_orgs] = useState(null); //id_orgsusers
  const [comment,    setComment]    = useState('');
  const [type,       setType]       = useState(1);
  const [docType,    setDocType]    = useState(1);
  const [number,       setNumber]       = useState('');
  const [deleted,    setDeleted]    = useState(0);
  // const [start_date, setStart_date] = useState(0);
  // const [end_date,   setEnd_date]   = useState(0);

  const [objectResult, setObjectResult] = useState({});

  const [options, setOptions] = useState([]);
  const [selects, setSelects] = useState(null);

  useEffect(() => {
    if (props.data?.id){
      setObjectResult(props.data);
      setId(        props.data.id);
      setId_orgs(   props.data.id_orgs);
      setType(      props.data.type);
      setDocType(   props.data.document_type);
      setComment(   props.data.comment);
      setDeleted(   props.data.deleted);
      setNumber(    props.data.number);
      // setStart_date(props.data.start_date);
      // setEnd_date(  props.data.end_date);
    }
  }, [props.data]);


    useEffect(() => {
      seteditMode(props.edit_mode);
    }, [props.edit_mode]);


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
                  key: 'kivalas3_k' + key + '_' + id,
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
  }, [props.selects, docType]);


  const handleChangeData = (changed_data) => {
    console.log('changed_data', changed_data)
    if (changed_data.id_orgs !== undefined) {
      setId_orgs(changed_data.id_orgs);

    } else if (changed_data.comment !== undefined) {
      setComment(changed_data.comment);

    } else if (changed_data.number !== undefined) {
      setNumber(changed_data.number);

    } else if (changed_data.type !== undefined) {
      setType(changed_data.type);

    // } else if (changed_data.document_type !== undefined) {
    //   setDocType(changed_data.document_type);

    } else if (changed_data.deleted !== undefined) {
      setDeleted(changed_data.deleted);

    // } else if (changed_data.start_date !== undefined) {
    //   setStart_date(changed_data.start_date === null ? null : changed_data.start_date.unix());

    // } else if (changed_data.end_date !== undefined) {
    //   setEnd_date(changed_data.end_date === null ? null : changed_data.end_date.unix());

    } else if (changed_data.id_orgs !== undefined) {
      setId_orgs(changed_data.id_orgs);
    } 
  }


  useEffect(() => {
    const timer = setTimeout(() => {
      if (objectResult.id == null) {
        // Объект ещё не смонтировался. воизбежание гонок
        return;
      };
      let resultObject = objectResult;

      resultObject.id_orgs    = id_orgs;
      resultObject.type          = type;
      resultObject.document_type = docType;
      resultObject.number          = number;
      // resultObject.start_date    = start_date;
      // resultObject.end_date      = end_date;
      resultObject.comment = comment;
      resultObject.deleted = deleted;

      console.log('result', resultObject)

      if (props.on_change) {
        props.on_change(id, resultObject);
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [
    id_orgs,
    comment,   
    type,      
    // docType,   
    number,      
    deleted,   
    // start_date,
    // end_date,  
  ]);


  useEffect(() => {
    if (deleted){
      console.log('ALARM', props)
      if (props.on_delete){
        console.log(id)
        props.on_delete(id, !deleted);
      }
    }
  }, [deleted]);


  useEffect(() => {
    console.log('options', options)
  }, [options]);

  return (
    <div className={`sa-org-sub-sub-section-row ${deleted ? 'deleted' : ''}`}>
      {/* <OrgPageSectionRow
        key={'fotolpddk_dk' + id}
        edit_mode={editMode}
        titles={[ docType === 1 ? 'Лицензия МЧС': 'Допуск СРО', 'Начало действия']}
        datas={[
          {
            type: OPS_TYPE.STRING,
            value: number,
            max: 50,
            required: false,
            nullable: false,
            placeholder: '',
            number: 'number',
          },
          {
            type: OPS_TYPE.DATE,
            value: start_date ? dayjs.unix(start_date) : null,
            min: 0,
            max: 9,
            nullable: false,
            placeholder: '',
            number: 'start_date',
          },
        ]}

        action={<Button
          classNumber='sa-org-sub-sub-section-row-action'
          size='small'
          color="danger"
          variant="outlined"
          icon={<TrashIcon height={'18px'} />}
          onClick={()=>{
            setDeleted(!deleted);
          }}
          />
        }
        on_change={handleChangeData}
        on_blur={handleChangeData}
      /> */}

      <OrgPageSectionRow
        key={'otoldssdk_dk' + id}
        edit_mode={editMode}
        titles={[docType === 1 ? "Лицензия" : "Допуск", 'Номер']}
        datas={[
          {
            type: OPS_TYPE.SELECT,
            value: type,
            max: 150,
            options: options,
            required: false,
            nullable: false,
            placeholder: '',
            name: 'type',
          },
          {
            type: OPS_TYPE.STRING,
            value: number,
            min: 0,
            max: 120,
            placeholder: '',
            name: 'number',
          },
        ]}
        comment={{
          type: OPS_TYPE.TEXTAREA,
          value: comment,
          max: 2500,
          required: false,
          nullable: true,
          placeholder: '',
          name: 'comment',
        }}
        action={<Button
          classNumber='sa-org-sub-sub-section-row-action'
          size='small'
          color="danger"
          variant="outlined"
          icon={<TrashIcon height={'18px'} />}
          onClick={()=>{
            setDeleted(!deleted);
        }}
      />}

        on_change={handleChangeData}
        on_blur={handleChangeData}
      />
    </div>
  );
};

export default OPMTanZendToleranceSection;