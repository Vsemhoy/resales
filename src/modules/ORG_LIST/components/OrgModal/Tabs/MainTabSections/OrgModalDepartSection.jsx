import React, { useEffect, useState } from 'react';
import OrgModalRow from './OrgModalRow';
import { ORG_DEF_DATA } from '../../../mock/ORGDEFDATA';
import {
	FullNameWithOccupy,
	// ShortName,
	TextWithLineBreaks,
} from '../../../../../../components/helpers/TextHelpers';
// import { Tooltip } from 'antd';
import dayjs from 'dayjs';

const OrgModalToleranceSection = (props) => {
	const [orgData, setOrgData] = useState(ORG_DEF_DATA);

	useEffect(() => {
		if (props.data) {
			setOrgData(props.data);
		} else {
			setOrgData(ORG_DEF_DATA);
		}
	}, [props.data]);

	return (
		<div className={'sk-omt-stack'}>
			<OrgModalRow
				key={'rowfla00222'}
				titles={['Автор', 'Куратор']}
				datas={[
					orgData?.creator ? <span>{FullNameWithOccupy(orgData.creator)}</span> : '',
					orgData?.curator ? <span>{FullNameWithOccupy(orgData.curator)}</span> : '',
				]}
			/>

			{/* <OrgModalRow
            key={'rowfla00223'}
            titles={['Отдел']}
            datas={['Тестовая карточка организации']}
        /> */}

			<OrgModalRow
				key={'rowfla00224'}
				titles={['Статус $', 'Способ доставки']}
				datas={[orgData.statusmoney?.name, orgData.deliverytype?.name]}
			/>

			{/* <OrgModalRow key={'rowfla00225'} titles={['Комментарии']} datas={[orgData.comment]} /> */}

			{orgData.list && (
				<OrgModalRow
					key={'rowfla00226'}
					titles={['Списки', 'Комментарий']}
					datas={[orgData.list?.typelist?.name, <TextWithLineBreaks text={orgData.list.comment} />]}
				/>
			)}


		</div>
	);
};

export default OrgModalToleranceSection;
