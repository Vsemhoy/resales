import React, { useEffect, useState } from 'react';
import OrgPageSectionRow, { OPS_TYPE } from '../OrgPageSectionRow';
import { PRODMODE } from '../../../../../config/config';
import { OM_ORG_FILTERDATA } from '../../../../ORG_LIST/components/mock/ORGLISTMOCK';
import { Button } from 'antd';

import { CameraIcon, DevicePhoneMobileIcon, EnvelopeIcon, PaperAirplaneIcon, PhoneIcon, TrashIcon } from '@heroicons/react/24/outline';
import OPMTCcontactstelephonesSection from './subsections/OPMTCcontactstelephonesSection';
import OPMTCcontactmobilesSection from './subsections/OPMTCcontactmobilesSection';
import OPMTCcontacthomephonesSection from './subsections/OPMTCcontacthomephonesSection';
import OPMTCcontactemailsSection from './subsections/OPMTCcontactemailsSection';
import OPMTCcontactmessangersSection from './subsections/OPMTCcontactmessangersSection';
import dayjs from 'dayjs';
import { compareObjects } from '../../../../../components/helpers/CompareHelpers';

const OrgPageMainTabContactsSection = (props) => {
	const [editMode, seteditMode] = useState(props.edit_mode ? props.edit_mode : false);
	const [filterData, setFilterData] = useState([]);

  const [itemId, setItemId] = useState(0);

  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [unsubscribe, setUnsubscribe] = useState('');
  const [comment, setComment] = useState('');
  const [occupy, setOccupy] = useState('');
  const [job, setJob] = useState('');
  const [exittoorg_id, setExittoorg_id] = useState('');

  const [objectResult, setObjectResult] = useState({});

  const [contactstelephones, setContactstelephones] = useState([]);
  const [contactmobiles,     setContactmobiles]     = useState([]);
  const [contacthomephones,  setContacthomephones]  = useState([]);
  const [contactemails,      setContactemails]      = useState([]);
  const [contactmessangers,  setContactmessangers]  = useState([]);

  const [newContactstelephones, setNewContactstelephones] = useState([]);
  const [newContactmobiles,     setNewContactmobiles]     = useState([]);
  const [newContacthomephones,  setNewContacthomephones]  = useState([]);
  const [newContactemails,      setNewContactemails]      = useState([]);
  const [newContactmessangers,  setNewContactmessangers]  = useState([]);
  
  const [originalContactstelephones, setOriginalContactstelephones] = useState([]);
  const [originalContactmobiles,     setOriginalContactmobiles]     = useState([]);
  const [originalContacthomephones,  setOriginalContacthomephones]  = useState([]);
  const [originalContactemails,      setOriginalContactemails]      = useState([]);
  const [originalContactmessangers,  setOriginalContactmessangers]  = useState([]);


  const [editedMessangersIds,    setEditedMessangersIds]    = useState([]);
  const [editedEmailsIds,        setEditedEmailsIds]        = useState([]);
  const [editedContactphonesIds, setEditedContactphonesIds] = useState([]);
  const [editedMobilephonesIds,  setEditedMobilephonesIds]  = useState([]);
  const [editedHomephonesIds,    setEditedHomephonesIds]    = useState([]);




  useEffect(() => {
    if (props.data?.id){
      setItemId(props.data?.id);
      setObjectResult(props.data);

      setContactstelephones(props.data.contactstelephones);
      setContactmobiles(props.data.contactmobiles);
      setContacthomephones(props.data.contacthomephones);
      setContactemails(props.data.contactemails);
      setContactmessangers(props.data.contactmessangers);

      setOriginalContactstelephones(JSON.parse(JSON.stringify(props.data.contactstelephones)));
      setOriginalContactmobiles(    JSON.parse(JSON.stringify(props.data.contactmobiles    )));
      setOriginalContacthomephones( JSON.parse(JSON.stringify(props.data.contacthomephones )));
      setOriginalContactemails(     JSON.parse(JSON.stringify(props.data.contactemails     )));
      setOriginalContactmessangers( JSON.parse(JSON.stringify(props.data.contactmessangers )));
    }

  }, [props.data]);

	useEffect(() => {
		seteditMode(props.edit_mode);
	}, [props.edit_mode]);

	useEffect(() => {
		if (PRODMODE) {
		} else {
			setFilterData(OM_ORG_FILTERDATA);
		}
	}, []);





  /* ----------------- MESSANGER --------------------- */
  /**
   * Добавление нового элемента в стек новых
   */
  const handleAddMessanger = ()=>{
    let item = {
          id: 'new_' + dayjs().unix() + '_' + newContactmessangers.length ,
          id_orgsusers:  itemId,
          identifier: '',
          messangers_id: 0,
          deleted: 0,
          command: "create",
        };
    setNewContactmessangers([...newContactmessangers, item]);
  }

  /**
   * Удаление напрочь только что добавленной записи
   * @param {*} id 
   */
  const handleDeleteNewMessanger = (id) => {
    console.log('delete', id)
    setNewContactmessangers(newContactmessangers.filter((item)=>item.id !== id));
  }

  /**
   * Обновление новой только что добавленной записи
   * @param {*} id 
   * @param {*} data 
   * @returns 
   */
  const handleUpdateNewMessangerUnit = (id, data) => {
    // let udata = originalData.filter((item) => item.id !== id);
    // udata.push(data);
    console.log('CALL TU NEW UPDATE');
    if (!editMode) {
      return;
    }

    data.command = 'create';

    setNewContactmessangers((prevUnits) => {
      const exists = prevUnits.some((item) => item.id === id);
      if (!exists) {
        return [...prevUnits, data];
      } else {
        return prevUnits.map((item) => (item.id === id ? data : item));
      }
    });
  };

  /**
   * Обновление и удаление существующей записи
   * @param {*} id 
   * @param {*} data 
   * @returns 
   */
  const handleUpdateMessangerUnit = (id, data) => {
    // let udata = originalData.filter((item) => item.id !== id);
    // udata.push(data);
    console.log('CALL TU REAL UPDATE');
    if (!editMode) {
      return;
    }

    const excluders = ['command', 'date'];
    let is_original = false;

    originalContactmessangers.forEach((element) => {
      if (element.id === id) {
        console.log('element, data', element, data)
        is_original = compareObjects(element, data, {
          excludeFields: excluders,
          compareArraysDeep: false,
          ignoreNullUndefined: true,
        });
      }
    });
    console.log('is_original', is_original)
    if (is_original === false) {
      if (!editedMessangersIds?.includes(id)) {
        setEditedMessangersIds([...editedMessangersIds, id]);
      }
      data.command = "update";
    } else {
      if (editedMessangersIds?.includes(id)) {
        setEditedMessangersIds(editedMessangersIds.filter((item) => item !== id));
      }
      data.command = '';
    }
    if (data.deleted === true){
      data.command = "delete";
    } 

    console.log('data', data)
    setContactmessangers((prevUnits) => {
      const exists = prevUnits.some((item) => item.id === id);
      if (!exists) {
        return [...prevUnits, data];
      } else {
        return prevUnits.map((item) => (item.id === id ? data : item));
      }
    });
  };
    /* ----------------- MESSANGER END --------------------- */







	return (
		<div className={'sk-omt-stack'} style={{ borderLeft: '4px solid ' + props.color }}>

			<OrgPageSectionRow
        key={'faksdj_dk' + itemId}
				edit_mode={editMode}
				columns={2}
				titles={['Имя', 'Отчество']}
				datas={[
					{
						type: OPS_TYPE.STRING,
						value: name,
						max: 50,
						required: true,
						nullable: false,
						placeholder: '',
						name: 'name',
					},
					{
						type: OPS_TYPE.STRING,
						value: lastName,
						min: 0,
						max: 120,
						placeholder: '',
						name: 'surname',
					},
				]}
				on_change={(data) => console.log('Изменения:', data)}
			/>

			<OrgPageSectionRow
				key={'fakfdfj_dk' + itemId}
				edit_mode={editMode}
				titles={['Фамилия', 'Должность']}
				datas={[
					{
						type: OPS_TYPE.STRING,
						value: middleName,
						max: 50,
						required: false,
						nullable: false,
						placeholder: '',
						name: 'middlename',
					},
					{
						type: OPS_TYPE.STRING,
						value: occupy,
						min: 0,
						max: 120,
						placeholder: '',
						name: 'occupy',
					},
				]}
			/>

      <OrgPageSectionRow
				key={'fsdksdj_dk' + itemId}
				edit_mode={editMode}
				titles={['Комментарий']}
				datas={[
					{
						type: OPS_TYPE.TEXTAREA,
						value: comment,
						max: 5000,
						required: false,
						nullable: false,
						placeholder: '',
						name: 'comment',
					}
				]}
			/>

      <OrgPageSectionRow
				key={'fs5462j_dk' + itemId}
				edit_mode={editMode}
				titles={['Работает ли','Новая организация']}
				datas={[
					{
						type: OPS_TYPE.CHECKBOX,
						value: job,
						max: 5000,
						required: false,
						nullable: false,
						placeholder: '',
						name: 'job',
					},
          {
						type: OPS_TYPE.UINTEGER,
						value: exittoorg_id,
						max: 999999,
						required: false,
						nullable: true,
            allowClear: true,
						placeholder: 'Id компании, куда ушел',
						name: 'exittoorg_id',
					}
				]}
			/>

      <OrgPageSectionRow
				key={'f734654dj_dk' + itemId}
				edit_mode={editMode}
				titles={['Запретить рассылку']}
				datas={[
					{
						type: OPS_TYPE.CHECKBOX,
						value: unsubscribe,
						max: 5000,
						required: false,
						nullable: false,
						placeholder: '',
						name: 'unsubscribe',
					}
				]}
			/>

      <div>
      {contactstelephones.map((item)=>(
        <OPMTCcontactstelephonesSection
        key={'OPMTCcontactstelephonesSection' + item.id}
          data={item}
          edit_mode={editMode}

        />
      ))}</div>

      <div>
      {contactmobiles.map((item)=>(
        <OPMTCcontactmobilesSection
        key={'OPMTCcontactmobilesSection' + item.id}
          data={item}
          edit_mode={editMode}

        />
      ))}</div>

      <div>
      {contacthomephones.map((item)=>(
        <OPMTCcontacthomephonesSection
          key={'OPMTCcontacthomephonesSection' + item.id}
          data={item}
          edit_mode={editMode}

        />
      ))}</div>

      <div>
      {contactemails.map((item)=>(
        <OPMTCcontactemailsSection
          key={'OPMTCcontactemailsSection' + item.id}
          data={item}
          edit_mode={editMode}

        />
      ))}</div>



      <div>
      {contactmessangers.map((item)=>(
        <OPMTCcontactmessangersSection
          key={'OPMTCcontactmessangersSection' + item.id}
          data={item}
          edit_mode={editMode}
          on_change={handleUpdateMessangerUnit}
        />
      ))}</div>
      {newContactmessangers.length > 0 && (
        <div className='sa-org-temp-stack-collapse'>
        {newContactmessangers.map((item)=>(
          <OPMTCcontactmessangersSection
            key={'newOPMTCcontactmessangersSection' + item.id}
            data={item}
            edit_mode={editMode}
            on_delete={handleDeleteNewMessanger}
            on_change={handleUpdateNewMessangerUnit}
          />
        ))}</div>
      )}

			



      {editMode && (
      <div className={'sk-omt-stack-control sa-flex-space'}>
        <div></div>
        <div>
          <div className={'sa-org-contactstack-addrow'}>
            Добавить
            <div>
              <Button
                title='Добавить контактный телефон'
                size='small'
                color="primary"
                variant="outlined"
                icon={<PhoneIcon height={'20px'}/>}
                onClick={(ev) => {
                  ev.stopPropagation();
                }}
                >Конт. телефон</Button>
              <Button
              title='Добавить мобильный телефон'
                size='small'
                color="primary"
                variant="outlined"
                icon={<DevicePhoneMobileIcon height={'20px'}/>}
                onClick={(ev) => {
                  ev.stopPropagation();
                }}
                >Моб. телефон</Button>
              <Button
              title='Добавить домашний телефон'
                size='small'
                color="primary"
                variant="outlined"
                icon={<CameraIcon height={'20px'}/>}
                onClick={(ev) => {
                  ev.stopPropagation();
                }}
                >Дом. телефон</Button>
              <Button
              title='Добавить эл. почту'
                size='small'
                color="primary"
                variant="outlined"
                icon={<EnvelopeIcon height={'20px'}/>}
                onClick={(ev) => {
                  ev.stopPropagation();
                }}
                >Эл. почту</Button>
              <Button
              title='Добавить мессенджер'
                size='small'
                color="primary"
                variant="outlined"
                icon={<PaperAirplaneIcon height={'20px'}/>}
                onClick={(ev) => {
                  ev.stopPropagation();
                  handleAddMessanger();
                }}
                >Мессенджер</Button>
                </div>
            </div>
        </div>
      </div>
      )}
		</div>
	);
};

export default OrgPageMainTabContactsSection;
