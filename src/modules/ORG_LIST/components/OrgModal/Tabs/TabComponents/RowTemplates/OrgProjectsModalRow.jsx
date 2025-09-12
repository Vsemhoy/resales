import React, { useEffect, useState } from 'react';
import OrgModalRow from '../../MainTabSections/OrgModalRow';
import dayjs from 'dayjs';
import { TextWithLineBreaks } from '../../../../../../../components/helpers/TextHelpers';
import { NavLink } from 'react-router-dom';

const OrgProjectsModalRow = (props) => {
	const [baseData, setBaseData] = useState(null);
	const [orgId, setOrgId] = useState(null);

	useEffect(() => {
		setBaseData(props.data);
	}, [props.data]);

	useEffect(() => {
		setOrgId(props.org_id);
	}, [props.org_id]);

	const getProjTypeName = (type) => {
		if (type === 3) {
			return <div title="Защита и РРРРРР проекта">ЗП и РП</div>;
		} else if (type === 2) {
			return <div title="РРРРРР проекта">РП</div>;
		} else if (type === 1) {
			return <div title="Защита проекта">ЗП</div>;
		} else {
			return '';
		}
	};

	return (
		<div className={'sa-org-row-wrapper'}>
			<div
				className={`sa-org-bill-tab-form  ${baseData?.deleted === 1 ? 'sa-org-section-deleted' : ''}`}
			>
				<OrgModalRow
					key={'rowfla00322519_' + orgId}
					titles={['Куратор', 'Дата']}
					datas={[
						baseData?.curator
							? baseData.curator.surname +
								' ' +
								baseData.curator.name +
								' ' +
								baseData.curator.secondname
							: '',
						baseData?.date ? dayjs(baseData.date).format('DD.MM.YYYY') : '',
					]}
				/>

				<OrgModalRow
					key={'rowfla00322419a_' + orgId}
					titles={['Объект']}
					datas={[baseData?.name]}
				/>

				<OrgModalRow
					key={'rowfla00322419b_' + orgId}
					titles={['Адрес']}
					datas={[baseData?.address]}
				/>

				<OrgModalRow
					key={'rowfla00322519c_' + orgId}
					titles={['Заказчик', 'Этап']}
					datas={[baseData?.customer, baseData?.stage]}
				/>

				<OrgModalRow
					key={'rowfla00322519d_' + orgId}
					titles={['Оборудование', 'Тип СОУЭ']}
					datas={[baseData?.equipment, baseData?.typepaec]}
				/>

				<OrgModalRow
					key={'rowfla00322519e_' + orgId}
					titles={['Контактное лицо', 'Состояние']}
					datas={[baseData?.contactperson, baseData?.stage]}
				/>

				<OrgModalRow
					key={'rowfla00322519f_' + orgId}
					titles={['Стоимость', 'Вознаграждение']}
					datas={[baseData?.cost, baseData?.bonus]}
				/>

				<OrgModalRow
					key={'rowfla00322519g_' + orgId}
					titles={['Защита проекта/тип']}
					datas={[getProjTypeName(baseData?.id8an_projecttype)]}
				/>

				<OrgModalRow
					key={'rowfla00322519h_' + orgId}
					titles={['Монтажная организация']}
					datas={[baseData?.creator]}
				/>

				<OrgModalRow
					key={'rowfla00322519j_' + orgId}
					titles={['Связанное КП']}
					datas={[
						baseData?.linkbid_id !== 0 ? (
							<NavLink to={'/bids/' + baseData?.linkbid_id}>Коммерческое предложение</NavLink>
						) : (
							''
						),
					]}
				/>

				<OrgModalRow
					key={'rowfla00322719l_' + orgId}
					titles={['Комментарий']}
					datas={[<TextWithLineBreaks text={baseData?.comment} />]}
				/>
			</div>
		</div>
	);
};

export default OrgProjectsModalRow;
