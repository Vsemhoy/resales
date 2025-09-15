import React, { useEffect, useState } from 'react';
import OrgModalRow from './OrgModalRow';
import { ORG_DEF_DATA } from '../../../mock/ORGDEFDATA';

const OrgModalContactinfoSection = (props) => {
	const [orgData, setOrgData] = useState(ORG_DEF_DATA);

	useEffect(() => {
		if (props.data) {
			setOrgData(props.data);
		} else {
			setOrgData(ORG_DEF_DATA);
		}
	}, [props.data]);

	return (
		<div className={'sk-omt-stack'} style={{ borderLeft: '4px solid blueviolet' }}>
			<OrgModalRow
				key={'rowfla00322'}
				titles={['Город', 'Регион']}
				datas={[orgData?.town?.t_name, orgData?.region?.r_name]}
			/>

			{orgData.address && orgData.address.length > 0 && (
				<>
					{orgData.address.map((addr) => (
						<OrgModalRow
							key={'rowfla00323' + addr.id}
							titles={['Факт адрес', 'Индекс']}
							datas={[addr.address, addr.post_index]}
						/>
					))}
				</>
			)}

			{orgData.legaladdresses && orgData.legaladdresses.length > 0 && (
				<>
					{orgData.legaladdresses.map((addr) => (
						<OrgModalRow
							key={'rowfla00324' + addr.id}
							titles={['Юр адрес', 'Комментарий', 'Индекс']}
							datas={[addr.address, addr.post_index, addr.comment]}
						/>
					))}
				</>
			)}

			{orgData.phones && orgData.phones.length > 0 && (
				<>
					{orgData.phones.map((phon) => (
						<OrgModalRow
							key={'rowfla00325' + phon.id}
							titles={['Телефон', 'Добавочный']}
							datas={[phon.number, phon.ext]}
							comment={phon.comment}
						/>
					))}
				</>
			)}

			{orgData.emails && orgData.emails.length > 0 && (
				<>
					{orgData.emails.map((mail) => (
						<OrgModalRow
							key={'rowfla00326' + mail.id}
							titles={['Электронная почта']}
							datas={[mail.email]}
							comment={mail.comment}
						/>
					))}
				</>
			)}

			<OrgModalRow key={'rowfla00328'} titles={['Сайт']} datas={[orgData?.site]} />
		</div>
	);
};

export default OrgModalContactinfoSection;
