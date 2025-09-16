import React, { useEffect, useState } from 'react';
import OrgPageSectionRow, { OPS_TYPE } from '../OrgPageSectionRow';
import { PRODMODE } from '../../../../../config/config';
import { OM_ORG_FILTERDATA } from '../../../../ORG_LIST/components/mock/ORGLISTMOCK';
import { Button } from 'antd';

import { CameraIcon, DevicePhoneMobileIcon, EnvelopeIcon, PaperAirplaneIcon, PhoneIcon, TrashIcon } from '@heroicons/react/24/outline';

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

  useEffect(() => {
    setItemId(props.data?.id);
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

	return (
		<div className={'sk-omt-stack'} style={{ borderLeft: '4px solid ' + props.color }}>
			{/* <OrgPageSectionRow
            edit_mode={editMode}
            key={'fklasdjl'}
            titles={['Название организации']}
            datas={['Тестовая карточка организации']}
            comment={"Здесь будет длинный комментарий ли очень длинный"}
        /> */}

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
// 				comment={{
// 					type: 'textarea',
// 					value: `Иван Это важный клиент
// B ybjfkldsajklf fajsdlk fjlaksjdfklajs kdlfjaksljdfkasj dklfjas kldfa
// asdklfjaskld jfkasjdfas dfkjaslkdfjklasjdfas
// d
// faskdjfklasj dkfljsdklfjsakl`,
// 					max: 500,
// 					required: false,
// 					nullable: true,
// 					placeholder: '',
// 					name: 'usercomment',
// 				}}
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
                }}
                >Мессенджер</Button>
                </div>
            </div>
        </div>
      </div>
		</div>
	);
};

export default OrgPageMainTabContactsSection;
