import {
	ArchiveBoxXMarkIcon,
	ArrowRightEndOnRectangleIcon,
	ArrowRightStartOnRectangleIcon,
	DocumentCurrencyDollarIcon,
	LinkIcon,
	NewspaperIcon,
} from '@heroicons/react/24/outline';
import { Dropdown, Menu, Tag, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
	DollarOutlined,
	FileDoneOutlined,
	LogoutOutlined,
	SafetyOutlined, UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import PositionList from './PositionList';
import {BASE_ROUTE, CSRF_TOKEN, PRODMODE} from "../../../config/config";
import {PROD_AXIOS_INSTANCE} from "../../../config/Api";
import HighlightText from '../../../components/helpers/HighlightText';
import { useURLParams } from '../../../components/helpers/UriHelpers';

const BidListRow = (props) => {
	const navigate = useNavigate();

const { getCurrentParamsString } = useURLParams();

	const [active, setActive] = useState(false);
	const [compColor, setCompColor] = useState('#00000000');
	const [data, setData] = useState(props.data);
	const [acls, setAcls] = useState(null);
	const [menuItems, setMenuItems] = useState([]);

	// Название компании в поиске
	const [filterName, setFilterName] = useState(null);

	useEffect(() => {
		if (props.filter_name){
			setFilterName(props.filter_name);
		} else {
			setFilterName(null);
		}
	}, [props.filter_name]);

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
	}, [acls, props.filter_triggered]);

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
					props.rerenderPage();
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
				let response = await PROD_AXIOS_INSTANCE.delete(path, {
					_token: CSRF_TOKEN,
				});
				if (response.data) {
					props.rerenderPage();
					props.success_alert(response.data.message);
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
				icon: <NewspaperIcon height="18px" onClick={() => fetchNewBid(1)}/>,
				label: <div onClick={() => fetchNewBid(1)}>Дублировать КП</div>,
			},
			{
				key: '2',
				icon: <DocumentCurrencyDollarIcon height="18px" onClick={() => fetchNewBid(2)}/>,
				label: <div onClick={() => fetchNewBid(2)}>Дублировать Счет</div>,
			},
		];
		if (acls.includes(63) && (data.id_company < 2 || data.id_company === props?.userdata?.user?.active_company)) {
			arr.push({
				key: '3',
				icon: <ArchiveBoxXMarkIcon height="18px" onClick={fetchDeleteBid}/>,
				label: <div onClick={fetchDeleteBid}>Удалить</div>,
			});
		};

		arr.push({
				key: '4',
				icon: <LinkIcon height="18px"/>,
				label: <NavLink to={`/orgs/${data.org_id}?frompage=bids&` + getCurrentParamsString()}><div>Перейти в организацию</div></NavLink>,
			});
		return arr;
	};
	const handleDoubleClick = () => {
		if (props.on_double_click) {
			props.on_double_click(data);
			window.open(`${BASE_ROUTE}/bids/${data.id}`, '_blank');
		}
	};

	return (
		<Dropdown menu={{ items: menuItems }} trigger={['contextMenu']}>
			<Tooltip title={ data.editor || data.last_message ?
                (<div>
                    <div>{data.editor ? `Редактирует: ${data.editor}` : ''}</div>
                    <div>{data.last_message ? `Причина возврата: ${data.last_message}` : ''}</div>
                </div>) : null
            }>
				<div
					className={`
                        sa-table-box-bids 
                        sa-table-box-row 
                        ${active ? 'active' : ''} 
                        ${data.last_message ? 'sa-error-row' : ''}
                        ${data?.highlight ? 'sa-busy-row' : ''}
					`}
					style={{color: compColor, cursor: 'pointer'}}
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
							<NavLink to={`/bids/${data.id}`} target={'_blank'}>
								<HighlightText text={data.company_name} highlight={filterName}/>
							</NavLink>
						</div>
					</div>
					<div className={'sa-table-box-cell'}>
						<Tooltip title={data.type_status_name}>
							<div>
								{data.type_status === 1 && <FileDoneOutlined/>}
								{data.type_status === 2 && <DollarOutlined/>}
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
								{data.protection_project === 1 && <SafetyOutlined/>}
								{data.protection_project === 2 && <LogoutOutlined/>}
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
								title={<PositionList bidId={data.id} fetch_path={'/sales/data/getbidmodels'}
													 error_alert={props.error_alert}/>}
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
								title={<PositionList bidId={data.id} fetch_path={'/api/sales/doclist'}
													 error_alert={props.error_alert}/>}
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
					<div className="sa-table-box-cell">
						{data.contact_user && (
							<Tooltip title={data.contact_user}>
								<UserOutlined/>
							</Tooltip>
						)}
					</div>
				</div>
			</Tooltip>
		</Dropdown>
	);
};

export default BidListRow;
