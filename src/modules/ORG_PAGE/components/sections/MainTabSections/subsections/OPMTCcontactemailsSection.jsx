import React, { useEffect, useState } from 'react';
import OrgPageSectionRow, { OPS_TYPE } from '../../OrgPageSectionRow';
import { Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { TrashIcon } from '@heroicons/react/24/outline';


const OPMTCcontactemailsSection = (props) => {
  const [editMode, seteditMode] = useState(props.edit_mode ? props.edit_mode : false);

  const [id, setId] = useState(null);
  const [idOrg, setIdOrg] = useState(null); //id_orgsusers
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [deleted, setDeleted] = useState(0);

  const [objectResult, setObjectResult] = useState({});

  useEffect(() => {
    if (props.data?.id){
      setObjectResult(props.data);

      setId(props.data.id);
      setIdOrg(props.data.id_orgsusers);
      setEmail(props.data.email);
      setComment(props.data.comment);
      setDeleted(props.data.deleted);
    }
  }, [props.data]);


    useEffect(() => {
      seteditMode(props.edit_mode);
    }, [props.edit_mode]);



  const handleChangeData = (changed_data) => {
    console.log('changed_data', changed_data)
    if (changed_data.comment !== undefined) {
      setComment(changed_data.comment);
    } else if (changed_data.email !== undefined) {
      setEmail(changed_data.email);
    } 
  }


  useEffect(() => {
    const timer = setTimeout(() => {
      if (objectResult.id == null) {
        // Объект ещё не смонтировался. воизбежание гонок
        return;
      };
      let resultObject = objectResult;
      resultObject.email = email;
      resultObject.comment = comment;
      resultObject.deleted = deleted;

      console.log('result', resultObject)

      if (props.on_change) {
        props.on_change(id, resultObject);
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [
    email,
    comment,
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
				key={'fakmfdfj_hhls_dk' + id}
				edit_mode={editMode}
				titles={['Email']}
				datas={[
					{
						type: OPS_TYPE.STRING,
						value: email,
						max: 50,
						required: false,
						nullable: false,
						placeholder: '',
						name: 'email',
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
        on_change={handleChangeData}
        on_blur={handleChangeData}
			/>

    </div>
  );
};

export default OPMTCcontactemailsSection;