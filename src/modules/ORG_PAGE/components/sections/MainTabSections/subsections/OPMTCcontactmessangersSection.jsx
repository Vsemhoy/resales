import React, { useEffect, useState } from 'react';
import OrgPageSectionRow, { OPS_TYPE } from '../../OrgPageSectionRow';
import { Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { TrashIcon } from '@heroicons/react/24/outline';


const OPMTCcontactmessangersSection = (props) => {
  const [editMode, seteditMode] = useState(props.edit_mode ? props.edit_mode : false);

  const [id, setId] = useState(null);
  const [idOrg, setIdOrg] = useState(null); //id_orgsusers
  const [identifier, setIdentifier] = useState('');
  const [messangers_id, setMessangers_id] = useState('');
  const [deleted, setDeleted] = useState(0);

  const [objectResult, setObjectResult] = useState({});

  const [selects, setSelects] = useState(null);

  useEffect(() => {
    if (props.data?.id){
      setObjectResult(props.data);

      setId(props.data.id);
      setIdOrg(props.data.id_orgsusers);
      setIdentifier(props.data.identifier);
      setMessangers_id(props.data.messangers_id);
      setDeleted(props.data.deleted);
    }
  }, [props.data]);


    useEffect(() => {
      seteditMode(props.edit_mode);
    }, [props.edit_mode]);



  const handleChangeData = (changed_data) => {
    console.log('changed_data', changed_data)
    if  (changed_data.messangers_id !== undefined) {
      setMessangers_id(changed_data.messangers_id);
    } else if (changed_data.identifier !== undefined) {
      setIdentifier(changed_data.identifier);
    } 
  }

  // useEffect(() => {
  //   if (props.selects){
  //     console.clear();
  //     console.log('SE LE CT BI',props.selects);
  //     setSelects(props.selects);
  //   }
  // }, [props.selects]);

    useEffect(() => {
      if (props.selects){
        setSelects(props.selects);
      }
    }, [props.selects, editMode]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (objectResult.id == null) {
        // Объект ещё не смонтировался. воизбежание гонок
        return;
      };
      let resultObject = objectResult;
      resultObject.identifier = identifier;
      resultObject.messangers_id = messangers_id;
      resultObject.deleted = deleted;

      console.log('result', resultObject)

      if (props.on_change) {
        props.on_change(id, resultObject);
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [
    identifier,
    messangers_id,
    deleted
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

  return (
    <div className={`sa-org-sub-sub-section-row ${deleted ? 'deleted' : ''}`}>
      <OrgPageSectionRow
				key={'fakmmfdfj_hhls_dk' + id}
				edit_mode={editMode}
				titles={['Идентификатор пользователя','Мессенджер']}
				datas={[
					{
						type: OPS_TYPE.STRING,
						value: identifier,
						max: 255,
						required: false,
						nullable: true,
						placeholder: '@contact_id',
						name: 'identifier',
					},
					{
						type: OPS_TYPE.SELECT,
						value: messangers_id ? messangers_id : 1,
						min: 0,
						max: 99999999999999999,
						placeholder: 'Telegram',
            options: selects?.messangers?.map((item)=>({
              key: 'messsages_' + item.id,
              value: item.id,
              label: item.name
            })),
            name: 'messangers_id',
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

    </div>
  );
};

export default OPMTCcontactmessangersSection;