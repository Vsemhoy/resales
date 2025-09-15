import React, { useEffect, useState } from 'react';
import OrgModalRow from './OrgModalRow';

const OrgModalSupplyContractSection = (props) => {
	return (
		<div className={'sk-omt-stack'} style={{ borderLeft: '4px solid red' }}>
			<OrgModalRow
				key={'mkpbasdjl'}
				titles={['Название организации']}
				datas={['Тестовая карточка организации']}
				comment={'Здесь будет длинный комментарий ли очень длинный'}
			/>

			<OrgModalRow
				key={'mkpbasddjl'}
				titles={['Форма собственности', 'ИНН']}
				datas={['Тестовая карточка ', '']}
			/>

			<OrgModalRow key={'mkpb43asdjl'} titles={['Вид деятельности']} datas={['Тестовая  ']} />

			<OrgModalRow
				key={'mkpba3sddjl'}
				titles={['Второе название']}
				datas={['Тестова организации']}
			/>

			<OrgModalRow
				key={'mkpba5sddjl'}
				titles={['Профиль компании', 'Проф звук']}
				datas={['Тестовая карточка организации', '']}
			/>

			<OrgModalRow key={'mkpbasd6352djl'} titles={['Источник']} datas={['Тестовая  организации']} />

			<OrgModalRow
				key={'mkpb452asddjl'}
				titles={['Комментарий']}
				datas={[' карточка организации']}
			/>

			<OrgModalRow key={'mkpba6454sddjl'} titles={['Памятка']} datas={['Тестовая карточка ']} />
		</div>
	);
};

export default OrgModalSupplyContractSection;
