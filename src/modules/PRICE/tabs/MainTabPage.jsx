import React, { useEffect, useState } from 'react';
import OrgPageMainTabCommonSection from '../components/sections/OrgPageMainTabCommonSection';
// import { useNavigate, useSearchParams } from 'react-router-dom';

const MainTabPage = (props) => {
	const [editMode, seteditMode] = useState(props.edit_mode ? props.edit_mode : false);

	useEffect(() => {
		seteditMode(props.edit_mode);
	}, [props.edit_mode]);

	return (
		<div className={'sk-omt-stack'} style={{ borderLeft: '4px solid seagreen' }}>
			<OrgPageMainTabCommonSection edit_mode={editMode} />
		</div>
	);
};

export default MainTabPage;
