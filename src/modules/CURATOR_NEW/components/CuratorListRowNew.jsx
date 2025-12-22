import {
	ArchiveBoxXMarkIcon,
	ArrowRightEndOnRectangleIcon,
	ArrowRightStartOnRectangleIcon,
	DocumentCurrencyDollarIcon,
	NewspaperIcon,
} from '@heroicons/react/24/outline';
import { Button, Dropdown, Menu, Tag, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
	CopyOutlined,
	DollarOutlined, FileAddOutlined,
	FileDoneOutlined,
	LogoutOutlined, ProfileOutlined,
	SafetyOutlined, SendOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
// import PositionList from './PositionList';

const CuratorListRowNew = (props) => {
	const [active, setActive] = useState(false);
	const [compColor, setCompColor] = useState('#00000000');
	const [activeRole, setActiveRole] = useState(0);

	const [data, setData] = useState(props.data);

	useEffect(() => {
		setData(props.data);
	}, [props.data]);

	useEffect(() => {
		setActive(props.is_active);
	}, [props.is_active]);

	useEffect(() => {
		setCompColor(props.company_color);
	}, [props.company_color]);

	useEffect(() => {
		setActiveRole(props.activeRole);
	}, [props.activeRole]);

	const handleDoubleClick = () => {
		if (props.on_double_click) {
			props.on_double_click(data);
		}
	};

	return (
		<Dropdown trigger={['contextMenu']}>
			<div
				className={`sa-table-box-engineers sa-table-box-row ${active ? 'active' : ''}`}
				key={props.key}
				style={{ color: compColor }}
			>
				<div className={'sa-table-box-cell'}>
					<div>
						{data.id}
					</div>
				</div>
				<div className={'sa-table-box-cell'}>
					<div>{dayjs.unix(data.created_at).format('DD.MM.YYYY')}</div>
				</div>
				<div className={'sa-table-box-cell'}>
					<div>{data.full_name}</div>
				</div>
				<div className={'sa-table-box-cell text-align-center'}>
					{/*<div>{data.comment}</div>*/}
					<div><NavLink to={'/engineer/' + data.org_id}>{data.org_name}</NavLink></div>
				</div>
				<div className={'sa-table-box-cell'}>
					<div>

					</div>
				</div>
				<div className={'sa-table-box-cell'} style={{ display: 'inline-block' }} >
					<div>
						<div style={{ display: 'flex', gap: '8px' }}>
							{(props.activeRole === 1 || props.superUser === 1) && (
								<div style={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-around'}}>
									<Tooltip title={'Копировать'}>
										<Button type={'primary'} style={{ width: '32px' }} icon={<CopyOutlined />}
												onClick={() => {
													props.openModalEngeneerCopy(true, data.id, 1);
												}}
										></Button>
									</Tooltip>
									<Tooltip title={'Отправить'}>
										<Button type={'primary'} style={{ width: '32px' }} danger icon={<SendOutlined />}
												onClick={() => {
													props.engeneerFinal(data.id);
												}}
										></Button>
									</Tooltip>
								</div>
							)}

							{((props.activeRole === 2 || props.superUser === 1) && data.status === 4) && (
								<div style={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-around'}}>
									<Tooltip title={'Создать КП'}>
										<Button type={'primary'} style={{ width: '32px' }} icon={<ProfileOutlined />}
												onClick={() => {
													props.openModalManager(true, data.id, 3);
												}}
										></Button>
									</Tooltip>
									<Tooltip title={'Добавить в КП'}>
										<Button type={'primary'} style={{ width: '32px' }} danger icon={<FileAddOutlined />}
												onClick={() => {
													props.openModalManager(true, data.id, 2);
												}}
										></Button>
									</Tooltip>

								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</Dropdown>
	);
};

export default CuratorListRowNew;
