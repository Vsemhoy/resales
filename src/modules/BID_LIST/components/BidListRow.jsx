import {
	ArchiveBoxXMarkIcon,
	ArrowRightEndOnRectangleIcon,
	ArrowRightStartOnRectangleIcon,
	DocumentCurrencyDollarIcon,
	NewspaperIcon,
} from '@heroicons/react/24/outline';
import { Dropdown, Menu, Tag, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
	DollarOutlined,
	FileDoneOutlined,
	LogoutOutlined,
	SafetyOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import PositionList from './PositionList';
import {BASE_ROUTE, CSRF_TOKEN, PRODMODE} from "../../../config/config";
import {PROD_AXIOS_INSTANCE} from "../../../config/Api";

const BidListRow = (props) => {
	const navigate = useNavigate();

	const [active, setActive] = useState(false);
	const [compColor, setCompColor] = useState('#00000000');
	const [data, setData] = useState(props.data);
	const [acls, setAcls] = useState(null);
	const [menuItems, setMenuItems] = useState([]);

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
		if (props.userdata && props?.userdata?.acls) {
			setAcls(props?.userdata?.acls);
		}
	}, [props.userdata]);
	useEffect(() => {
		if (acls && acls.length > 0) {
			setMenuItems(getMenu());
		}
	}, [acls]);

	const fetchNewBid = async (type) => {
		if (PRODMODE) {
			const path = `/sales/data/makebid`;
			try {
				let response = await PROD_AXIOS_INSTANCE.post(path, {
					data: {
						bid: data.id,
						org: data.org_id,
						type: type
					},
					_token: CSRF_TOKEN,
				});
				if (response.data) {
					window.open(`${BASE_ROUTE}/bids/${response.data.item_id}`, '_blank');
				}
			} catch (e) {
				console.log(e);
				props.error_alert(path, e);
			}
		}
	};
	const fetchDeleteBid = async () => {
		if (PRODMODE) {
			const path = `/api/sales/deletebid/${data.id}`;
			try {
				let response = await PROD_AXIOS_INSTANCE.delete(path);
				if (response.data) {
					props.rerenderPage();
				}
			} catch (e) {
				console.log(e);
				props.error_alert(path, e);
			}
		}
	};

	const getMenu = () => {
		const arr = [
			{
				key: '1',
				icon: <NewspaperIcon height="18px" />,
				label: <div onClick={() => fetchNewBid(1)}>Дублировать КП</div>,
			},
			{
				key: '2',
				icon: <DocumentCurrencyDollarIcon height="18px" />,
				label: <div onClick={() => fetchNewBid(2)}>Дублировать Счет</div>,
			},
		];
		if (acls.includes(63) && (data.id_company < 2 || data.id_company === props?.userdata?.user?.active_company)) {
			arr.push({
				key: '3',
				icon: <ArchiveBoxXMarkIcon height="18px" />,
				label: <div onClick={fetchDeleteBid}>Удалить</div>,
			});
		}
		return arr;
	};
	const handleDoubleClick = () => {
		if (props.on_double_click) {
			props.on_double_click(data);
			window.open(`${BASE_ROUTE}/resales/bids/${data.id}`, '_blank');
		}
	};

	return (
		<Dropdown menu={{ items: menuItems }} trigger={['contextMenu']}>
			<div
				className={`sa-table-box-bids sa-table-box-row ${active ? 'active' : ''}`}
				style={{ color: compColor, cursor: 'pointer' }}
				onDoubleClick={handleDoubleClick}
			>
				<div
					className={'sa-table-box-cell'}
					//style={{background:'#ff870002', borderLeft:'6px solid #ff8700'}}
				>
					<div>
						<NavLink to={`/bids/${data.id}`} target={'_blank'}>
							{data.id}
						</NavLink>
					</div>
				</div>
				<div className={'sa-table-box-cell'}>
					<div className={'text-align-left'}>
						<NavLink to={`/orgs/${data.id}`}>{data.company_name}</NavLink>
					</div>
				</div>
				<div className={'sa-table-box-cell'}>
					<Tooltip title={data.type_status_name}>
						<div>
							{data.type_status === 1 && <FileDoneOutlined />}
							{data.type_status === 2 && <DollarOutlined />}
						</div>
					</Tooltip>
				</div>
				<div className={'sa-table-box-cell'}>
					<Tooltip
						title={
							data.protection_project === 1
								? 'Защита проекта'
								: data.protection_project === 2
									? 'Реализация проекта'
									: ''
						}
					>
						<div>
							{data.protection_project === 1 && <SafetyOutlined />}
							{data.protection_project === 2 && <LogoutOutlined />}
						</div>
					</Tooltip>
				</div>
				<div className={'sa-table-box-cell'}>
					<div>
						{data.stage_id === 1 && <Tag color={'blue'}>менеджер</Tag>}
						{data.stage_id === 2 && <Tag color={'volcano'}>администратор</Tag>}
						{data.stage_id === 3 && <Tag color={'magenta'}>бухгалтер</Tag>}
						{data.stage_id === 4 && <Tag color={'gold'}>завершено</Tag>}
					</div>
				</div>
				<div className={'sa-table-box-cell'}>
					<div>{dayjs.unix(data.date).format('DD.MM.YYYY')}</div>
				</div>
				<div className={'sa-table-box-cell'}>
					<div>{data.username}</div>
				</div>
				<div className={'sa-table-box-cell'}>
					<div>{data.bill_number}</div>
				</div>
				<div className={'sa-table-box-cell text-align-left'}>
					<div>{data.comment}</div>
				</div>
				<div className={'sa-table-box-cell text-align-left'}>
					<div>{data.object}</div>
				</div>
				<div className={'sa-table-box-cell'}>
					<div>
						<Tooltip
							placement="leftTop"
							title={<PositionList bidId={data.id} path={'/sales/data/getbidmodels'} />}
							color="white"
							styles={{
								body: {
									color: 'black',
									border: '1px solid #d9d9d9',
								},
								root: {
									maxWidth: '400px'
								}
							}}
						>
							<Tag color={'purple'}>{data.models_count}</Tag>
						</Tooltip>
					</div>
				</div>
				<div className={'sa-table-box-cell'}>
					<div>
						<Tooltip
							placement="leftTop"
							title={<PositionList bidId={data.id} path={'/api/sales/doclist'} />}
							color="white"
							style={{
								maxWidth: '300px',
								overflow: 'hidden',
								wordWrap: 'break-word',
							}}
							styles={{
								body: {
									color: 'black',
									border: '1px solid #d9d9d9',
								},
								root: {
									maxWidth: '400px'
								}
							}}
						>
							<Tag color={'cyan'}>{data.files_count}</Tag>
						</Tooltip>
					</div>
				</div>
			</div>
		</Dropdown>
	);
};

export default BidListRow;
