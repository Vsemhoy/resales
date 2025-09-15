import React, { useEffect, useState } from 'react';
import OrgModalRow from './OrgModalRow';
import { ORG_DEF_DATA } from '../../../mock/ORGDEFDATA';
import dayjs from 'dayjs';

const OrgModalPayersSection = (props) => {
	const [orgData, setOrgData] = useState(ORG_DEF_DATA);

	useEffect(() => {
		if (props.data) {
			setOrgData(props.data);
		} else {
			setOrgData(ORG_DEF_DATA);
		}
	}, [props.data]);

	return (
		<div className={'sk-omt-stack'} style={{ borderLeft: '4px solid yellow' }}>
			{orgData.requisites && orgData.requisites.length > 0 && (
				<>
					{orgData.requisites.map((req) => {
						// const namel = req.document_type === 1 ? "Лицензия МЧС" : "Допуск СРО";
						// const key = `${req.document_type}-${req.type}`;
						// const tupel = props.selects_data.tolreq[key];

						return (
							<div className={'sa-tolreq-group'}>
								<OrgModalRow
									key={'rowfla00228' + req.id}
									titles={['Название']}
									datas={[req.nameorg]}
									comment={req.requisites}
									comment_title={'Реквизиты'}
								/>
								<OrgModalRow
									key={'rowfla00228' + req.id + 'extra'}
									titles={['ИНН', 'КПП']}
									datas={[req.inn, req.kpp]}
								/>
							</div>
						);
					})}
				</>
			)}
		</div>
	);
};

export default OrgModalPayersSection;
