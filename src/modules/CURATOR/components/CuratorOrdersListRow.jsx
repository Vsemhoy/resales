import {
	ArchiveBoxXMarkIcon,
	ArrowRightEndOnRectangleIcon,
	ArrowRightStartOnRectangleIcon,
	DocumentCurrencyDollarIcon,
	LinkIcon,
	NewspaperIcon,
} from '@heroicons/react/24/outline';
import {Button, Dropdown, Menu, Tag, Tooltip} from 'antd';
import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
	DollarOutlined,
	FileDoneOutlined,
	LogoutOutlined,
	SafetyOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {BASE_ROUTE, CSRF_TOKEN, PRODMODE} from "../../../config/config";
import {PROD_AXIOS_INSTANCE} from "../../../config/Api";
import HighlightText from '../../../components/helpers/HighlightText';
import { useURLParams } from '../../../components/helpers/UriHelpers';

const CuratorOrdersListRow = (props) => {
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
                        sa-table-box-curators 
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
							{data.id}
						</div>
					</div>

					<div className={'sa-table-box-cell'}>
						<div>{dayjs.unix(data.created_at).format('DD.MM.YYYY')}</div>
					</div>
					<div className={'sa-table-box-cell'}>
						<div className={'text-align-center'}>
							<NavLink to={`/orgs/${data.org_id}`} target={'_blank'}>
								<HighlightText text={data.org_name} highlight={filterName}/>
							</NavLink>
						</div>
					</div>
					<div className={'sa-table-box-cell'}>
						<div className={'text-align-center'}>
							<HighlightText text={data.full_name} highlight={filterName}/>
						</div>
					</div>

					<div className={'sa-table-box-cell'}>
						{props.supervisor ? (
							<div className={'text-align-center'}>
								<Button type="primary" children="Принять" onClick={() => {props.handleStatusChange(data.id, 1)}}/>
								<Button type="primary" danger children="Отклонить" onClick={() => {props.handleStatusChange(data.id, 2)}} style={{ marginLeft: '20px' }} />
							</div>
						) : (
							<div>
								{data.status}
							</div>
						)}
					</div>
				</div>
			</Tooltip>
		</Dropdown>
	);
};

export default CuratorOrdersListRow;
