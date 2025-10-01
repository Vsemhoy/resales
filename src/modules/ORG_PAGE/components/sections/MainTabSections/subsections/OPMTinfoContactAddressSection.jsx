import React, { useEffect, useState } from 'react';
import OrgPageSectionRow, { OPS_TYPE } from '../../OrgPageSectionRow';
import { Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { TrashIcon } from '@heroicons/react/24/outline';


const OPMTinfoContactAddressSection = (props) => {
  const [editMode, seteditMode] = useState(props.edit_mode ? props.edit_mode : false);

  const [id, setId] = useState(null);
  const [idOrg, setIdOrg] = useState(null); //id_orgsusers
  const [address, setAddress] = useState('');
  const [post_index, setPost_index] = useState('');
  const [comment, setComment] = useState('');
  const [deleted, setDeleted] = useState(0);

  const [objectResult, setObjectResult] = useState({});

  useEffect(() => {
    if (props.data?.id){
      setObjectResult(props.data);

      setId(props.data.id);
      setIdOrg(props.data.id_orgsusers);
      setAddress(props.data.address);
      setPost_index(props.data.post_index);
      setComment(props.data.comment);
      setDeleted(props.data.deleted);
    }
  }, [props.data]);


    useEffect(() => {
      seteditMode(props.edit_mode);
    }, [props.edit_mode]);



  const handleChangeData = (changed_data) => {
    console.log('changed_data', changed_data)
    if  (changed_data.post_index !== undefined) {
      setPost_index(changed_data.post_index);
    } else if (changed_data.address !== undefined) {
      setAddress(changed_data.address);
    } else if (changed_data.comment !== undefined) {
      setComment(changed_data.comment);
    } 
  }



  useEffect(() => {
    const timer = setTimeout(() => {
      if (objectResult.id == null) {
        // Объект ещё не смонтировался. воизбежание гонок
        return;
      };
      let resultObject = objectResult;
      resultObject.address = address;
      resultObject.post_index = post_index;
      resultObject.deleted = deleted;
      resultObject.comment = comment;

      console.log('result', resultObject)

      if (props.on_change) {
        props.on_change(id, resultObject);
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [
    address,
    post_index,
    deleted,
    comment
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
				titles={['Факт. адрес','Индекс']}
				datas={[
					{
						type: OPS_TYPE.STRING,
						value: address,
						max: 255,
						required: true,
						nullable: true,
						placeholder: '',
						name: 'address',
					},
					{
						type: OPS_TYPE.STRING,
						value: post_index,
						min: 0,
						max: 99999999999999999,
						placeholder: '',
						name: 'post_index',
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
        // on_change={handleChangeData}
        on_blur={handleChangeData}
			/>

    </div>
  );
};

export default OPMTinfoContactAddressSection;