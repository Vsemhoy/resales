import React, { useEffect, useState } from 'react';
import OrgPageSectionRow, { OPS_TYPE } from '../../OrgPageSectionRow';
import { Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { TrashIcon } from '@heroicons/react/24/outline';
import { forIn } from 'lodash';
import dayjs from 'dayjs';


const OPMTRequisitesSection = (props) => {
  const [editMode, seteditMode] = useState(props.edit_mode ? props.edit_mode : false);

  const [id, setId] = useState(null);
  const [id_orgs, setId_orgs] = useState(null); //id_orgsusers
  const [requisites,    setRequisites]    = useState('');
  const [inn,    setInn]    = useState('');
  const [nameorg,       setNameorg]       = useState('');
  const [deleted,    setDeleted]    = useState(0);
  const [kpp, setKpp] = useState('');

  const [objectResult, setObjectResult] = useState({});

  const [options, setOptions] = useState([]);
  const [selects, setSelects] = useState(null);

  useEffect(() => {
    if (props.data?.id){
      setObjectResult(props.data);
      setId(props.data.id);
      setId_orgs(props.data.id_orgs);
      setInn(   props.data.inn);
      setRequisites(   props.data.requisites);
      setDeleted(   props.data.deleted);
      setNameorg(      props.data.nameorg);
      setDeleted(   props.data.deleted);
      setKpp(props.data.kpp);
    }
  }, [props.data]);


    useEffect(() => {
      seteditMode(props.edit_mode);
    }, [props.edit_mode]);





  const handleChangeData = (changed_data) => {
    // console.log('changed_data', changed_data)
    if (changed_data.id_orgs !== undefined) {
      setId_orgs(changed_data.id_orgs);

    } else if (changed_data.requisites !== undefined) {
      setRequisites(changed_data.requisites);

    } else if (changed_data.nameorg !== undefined) {
      setNameorg(changed_data.nameorg);


    } else if (changed_data.deleted !== undefined) {
      setDeleted(changed_data.deleted);

    } else if (changed_data.kpp !== undefined) {
      setKpp(changed_data.kpp);

    } else if (changed_data.inn !== undefined) {
      setInn(changed_data.inn);

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
      resultObject.nameorg          = nameorg;
      resultObject.kpp    = kpp;
      resultObject.inn    = inn;
      resultObject.requisites = requisites;
      resultObject.deleted = deleted;

      // console.log('result', resultObject)

      if (props.on_change) {
        props.on_change(id, resultObject);
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [
    id_orgs,
    requisites,   
    inn,   
    nameorg,      
    deleted,   
    kpp,
  ]);


  useEffect(() => {
    if (deleted){
      // console.log('ALARM', props)
      if (props.on_delete){
        console.log(id)
        props.on_delete(id, !deleted);
      }
    }
  }, [deleted]);


  return (
    <div className={`sa-org-sub-sub-section-row ${deleted ? 'deleted' : ''}`}>
      <OrgPageSectionRow
        key={'reqosito_dk' + id}
        edit_mode={editMode}
        titles={[ 'Организация']}
        datas={[
          {
            type: OPS_TYPE.STRING,
            value: nameorg,
            max: 250,
            required: true,
            nullable: false,
            placeholder: '',
            name: 'nameorg',
          },

        ]}

        action={<Button
          className='sa-org-sub-sub-section-row-action'
          size='small'
          color="danger"
          variant="outlined"
          icon={<TrashIcon height={'18px'} />}
          onClick={()=>{
            setDeleted(!deleted);
          }}
          />
        }
        // on_change={handleChangeData}
        on_blur={handleChangeData}
      />

      <OrgPageSectionRow
        key={'reqosito2_dk' + id}
        edit_mode={editMode}
        titles={['ИНН', 'КПП']}
        datas={[
          {
            type: OPS_TYPE.STRING,
            value: inn,
            min: 0,
            max: 100,
            required: true,
            nullable: true,
            placeholder: '',
            name: 'inn',
          },
          {
            type: OPS_TYPE.STRING,
            value: kpp,
            min: 0,
            max: 100,
            required: true,
            nullable: true,
            placeholder: '',
            name: 'kpp',
          },
        ]}
        comment={{
          type: OPS_TYPE.TEXTAREA,
          value: requisites,
          max: 2500,
          required: true,
          
          placeholder: '',
          name: 'requisites',
          label: 'реквизиты',
        }}
        action={<div
        className='sa-omt-filler'
        />}

        // on_change={handleChangeData}
        on_blur={handleChangeData}
      />
    </div>
  );
};

export default OPMTRequisitesSection;