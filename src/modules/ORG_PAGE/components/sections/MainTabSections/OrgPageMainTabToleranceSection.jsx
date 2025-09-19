

import React, { useEffect, useState } from 'react';
import OrgPageSectionRow from '../OrgPageSectionRow';
import { PRODMODE } from '../../../../../config/config';
import { OM_ORG_FILTERDATA } from '../../../../ORG_LIST/components/mock/ORGLISTMOCK';

const OrgPageMainTabToleranceSection = (props) => {
	const [editMode, seteditMode] = useState(props.edit_mode ? props.edit_mode : false);
	const [filterData, setFilterData] = useState([]);

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
				edit_mode={editMode}
				columns={2}
				titles={['Имя', 'Возраст', 'Дата рождения']}
				datas={[
					{
						type: 'string',
						value: 'Иван',
						max: 50,
						required: true,
						nullable: false,
						placeholder: '',
						name: 'username',
					},
					{
						type: 'uinteger',
						value: 25,
						min: 0,
						max: 120,
						placeholder: '',
						name: 'userbirth',
					},
					{
						type: 'date',
						value: '1999-03-15',
						placeholder: '',
						name: 'userage',
					},
				]}
				comment={{
					type: 'textarea',
					value: `Иван Это важный клиент
B ybjfkldsajklf fajsdlk fjlaksjdfklajs kdlfjaksljdfkasj dklfjas kldfa
asdklfjaskld jfkasjdfas dfkjaslkdfjklasjdfas
d
faskdjfklasj dkfljsdklfjsakl`,
					max: 500,
					required: false,
					nullable: true,
					placeholder: '',
					name: 'usercomment',
				}}
				on_change={(data) => console.log('Изменения:', data)}
			/>

			<OrgPageSectionRow
				key={'fklasddjl'}
				edit_mode={editMode}
				titles={['Форма собственности', 'ИНН']}
				datas={[
					{
						type: 'select',
						value: 9,
						options: filterData.profiles,
						max: 50,
						required: true,
						nullable: false,
						placeholder: '',
						name: 'username',
					},
					{
						type: 'uinteger',
						value: 25,
						min: 0,
						max: 120,
						placeholder: '',
						name: 'userbirth',
					},
				]}
			/>

			<OrgPageSectionRow key={'fkl43asdjl'} titles={['Вид деятельности']} datas={['Тестовая  ']} />

			<OrgPageSectionRow
				key={'fkla3sddjl'}
				titles={['Второе название']}
				datas={['Тестова организации']}
			/>

			<OrgPageSectionRow
				key={'fkla5sddjl'}
				titles={['Профиль компании', 'Проф звук']}
				datas={['Тестовая карточка организации', '']}
			/>

			<OrgPageSectionRow
				key={'fklasd6352djl'}
				titles={['Источник']}
				datas={['Тестовая  организации']}
			/>

			<OrgPageSectionRow
				key={'fkl452asddjl'}
				titles={['Комментарий']}
				datas={[' карточка организации']}
			/>

			<OrgPageSectionRow
				key={'fkla6454sddjl'}
				titles={['Памятка']}
				datas={['Тестовая карточка ']}
			/>
		</div>
	);
};

export default OrgPageMainTabToleranceSection;
