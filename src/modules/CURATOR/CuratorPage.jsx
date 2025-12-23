import React, { useEffect, useState } from 'react';
import {Affix, Alert, Button, Dropdown, Layout, Pagination, Select, Space, Spin, Tag, Tooltip} from 'antd';
import { Content } from 'antd/es/layout/layout';
import CuratorListTable from './components/CuratorListTable';
import { CSRF_TOKEN, PRODMODE } from '../../config/config';
import {CONFIRM_LIST, COUNT, SUPERVISOR} from './mock/mock';
import { PROD_AXIOS_INSTANCE } from '../../config/Api';
import './components/style/curatorlistpage.css';
import CurrencyMonitorBar from "../../components/template/CURRENCYMONITOR/CurrencyMonitorBar";
import {CaretLeftFilled, CloseOutlined, FilterOutlined} from "@ant-design/icons";
import Sider from "antd/es/layout/Sider";
import {NavLink, useSearchParams} from "react-router-dom";
import BidListTable from "../BID_LIST/components/BidListTable";
import dayjs from "dayjs";
import {BID_LIST, FILTERS} from "../BID_LIST/mock/mock";
import CuratorOrdersListSiderFilters from "./components/CuratorOrdersListSiderFilters";
import OrderListSider from "../ENGINEER_LIST/components/OrderListSider";
import CuratorOrdersListTable from "./components/CuratorOrdersListTable";
import Helper from "../../components/helpers/Helper";

const CuratorPageNEW = (props) => {
	const { userdata } = props;
	const [isMounted, setIsMounted] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isOpenedFilters, setIsOpenedFilters] = useState(false);
	const [total, setTotal] = useState(0);
	const [searchParams, setSearchParams] = useSearchParams();
	const [onPage, setOnPage] = useState(parseInt(searchParams.get('onPage')) || 30);
	const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('currentPage')) || 1);

	const [curatorOrders, setCuratorOrders] = useState([]);

	const [filterSortClearMenu, setFilterSortClearMenu] = useState([]);
	const [companies, setCompanies] = useState([]);

	const [filterCompaniesSelect, setFilterCompaniesSelect] = useState([]);
	const [filterUsersSelect, setFilterUsersSelect] = useState([]);

	const [supervisor, setSupervisor] = useState(false);



	const [isAlertVisible, setIsAlertVisible] = useState(false);
	const [alertMessage, setAlertMessage] = useState('');
	const [alertDescription, setAlertDescription] = useState('');
	const [alertType, setAlertType] = useState('');


	const [filterBox, setFilterBox] = useState({
		/* header */
		order_id: searchParams.get('order_id') || null,
		company_name: searchParams.get('company_name') || null,
		user_name: searchParams.get('user_name') || null,
		// type: parseInt(searchParams.get('type')) || null,
		// protect_status: parseInt(searchParams.get('protect_status')) || null,
		// stage_status: parseInt(searchParams.get('stage_status')) || null,
		dates: searchParams.get('dates') || null,
		// manager: parseInt(searchParams.get('manager')) || null,
		// bill_number: searchParams.get('bill_number') || null,
		// comment: searchParams.get('comment') || null,
		// object_name: searchParams.get('object_name') || null,
		// /* sider */
		// target_company: parseInt(searchParams.get('target_company')) || null,
		// pay_status: parseInt(searchParams.get('pay_status')) || null,
		// admin_accept: parseInt(searchParams.get('admin_accept')) || null,
		// package: parseInt(searchParams.get('package')) || null,
		// price: parseInt(searchParams.get('price')) || null,
		// bid_currency: parseInt(searchParams.get('bid_currency')) || null,
		// nds: parseInt(searchParams.get('nds')) || null,
		// complete: parseInt(searchParams.get('complete')) || null,
	});

	const initialFilterBox = {
		/* header */
		order_id: null,
		company_name: null,
		user_name: null,
		// protect_status: null,
		// stage_status: null,
		// dates: null,
		// manager: null,
		// bill_number: null,
		// comment: null,
		// object_name: null,
		// /* sider */
		// target_company: null,
		// pay_status: null,
		// admin_accept: null,
		// package: null,
		// price: null,
		// bid_currency: null,
		// nds: null,
		// complete: null,
	};

	const handleSearchParamsChange = (key, value) => {
		setSearchParams((prevParams) => {
			const newParams = new URLSearchParams(prevParams);
			if (value) {
				newParams.set(key, value);
			} else {
				newParams.delete(key);
			}
			return newParams;
		});
	};

	const handleSearchParamsZeroing = (obj) => {
		setSearchParams((prevParams) => {
			const newParams = new URLSearchParams(prevParams);
			for (const key in obj) {
				if (obj[key] === null) {
				}
				{
					newParams.delete(key);
				}
			}

			setTimeout(() => console.log(newParams), 1000);

			return newParams;
		});
	};

	const handleClearAllFilterBox = () => {
		setFilterBox(initialFilterBox);
		setTimeout(() => handleSearchParamsZeroing(initialFilterBox), 1000);
	};

	const handleClearAllBoxes = () => {
		handleClearAllFilterBox();
	};

	useEffect(() => {
		fetchInfo().then();
		// if (showGetItem !== null) {
		// 	handlePreviewOpen(showGetItem);
		// 	setTimeout(() => {}, 2200);
		// }
		setIsMounted(true);

		handleSearchParamsChange('currentPage', currentPage);
		handleSearchParamsChange('onPage', onPage);
	}, []);

	useEffect(() => {
		if (isMounted && currentPage && onPage && filterBox) {
			const timer = setTimeout(() => {
				setIsLoading(true);
				fetchCuratorOrders().then(() => {
					setIsLoading(false);
				});
			}, 200);

			return () => clearTimeout(timer);
		}
	}, [currentPage, onPage, filterBox]);

	const fetchInfo = async () => {
		setIsLoading(true);
		await fetchFilterSelects();
		await fetchCuratorOrders();
		setIsLoading(false);
	};

	const fetchCuratorOrders = async () => {
		if (PRODMODE) {
			let dates = null;
			if (filterBox.dates) {
				const dateObj = dayjs.unix(filterBox.dates);
				dates = [dateObj.startOf('day').unix() * 1000, dateObj.endOf('day').unix() * 1000];
			}
			const data = {
				/* header */
				company_name: filterBox.company_name,
				user_name: filterBox.user_name,
				order_id: filterBox.order_id,
				// type: filterBox.type,
				// protect_status: filterBox.protect_status,
				// stage_status: filterBox.stage_status,
				dates: dates,
				// manager: filterBox.manager,
				// bill_number: filterBox.bill_number,
				// comment: filterBox.comment,
				// object_name: filterBox.object_name,
				// /* sider */
				// target_company: filterBox.target_company,
				// pay_status: filterBox.pay_status,
				// admin_accept: filterBox.admin_accept,
				// package: filterBox.package,
				// price: filterBox.price,
				// bid_currency: filterBox.bid_currency,
				// nds: filterBox.nds,
				// complete_status: filterBox.complete,

				to: 0,
				page: currentPage,
				limit: onPage,
			};
			console.log(data);
			const path = `/api/v2/curators`;
			try {
				let response = await PROD_AXIOS_INSTANCE.post(path, {
					data,
					_token: CSRF_TOKEN,
				});
				setCuratorOrders(response.data.curators)
				//setBids(response.data.bid_list);
				setTotal(response.data.count);
				setSupervisor(response.data.supervisor);

				let max = onPage * currentPage - (onPage - 1);
				if (response.data.count < max) {
					setCurrentPage(1);
					handleSearchParamsChange('currentPage', 1);
				}
			} catch (e) {
				console.log(e);
				setIsAlertVisible(true);
				setAlertMessage(`Произошла ошибка! ${path}`);
				setAlertDescription(e.response?.data?.message || e.message || 'Неизвестная ошибка');
				setAlertType('error');
			}
		} else {
			console.log(123);
			setCuratorOrders(CONFIRM_LIST);
			setTotal(COUNT);
			setSupervisor(SUPERVISOR);
		}
	};

	const handleUpdateFilterBoxHeader = (newFilterBox) => {
		const filterBoxUpd = JSON.parse(JSON.stringify(filterBox));

		if (filterBox.order_id !== newFilterBox.order_id) {
			filterBoxUpd.order_id = newFilterBox.order_id;
			handleSearchParamsChange('order_id', newFilterBox.order_id);
		}
		if (filterBox.company_name !== newFilterBox.company_name) {
			filterBoxUpd.company_name = newFilterBox.company_name;
			handleSearchParamsChange('company_name', newFilterBox.company_name);
		}
		if (filterBox.dates !== newFilterBox.dates) {
			filterBoxUpd.dates = newFilterBox.dates;
			handleSearchParamsChange('dates', newFilterBox.dates);
		}

		if (filterBox.user_name !== newFilterBox.user_name) {
			filterBoxUpd.user_name = newFilterBox.user_name;
			handleSearchParamsChange('user_name', newFilterBox.user_name);
		}


		// if (filterBox.type !== newFilterBox.type) {
		// 	filterBoxUpd.type = newFilterBox.type;
		// 	handleSearchParamsChange('type', newFilterBox.type);
		// }
		// if (filterBox.protect_status !== newFilterBox.protect_status) {
		// 	filterBoxUpd.protect_status = newFilterBox.protect_status;
		// 	handleSearchParamsChange('protect_status', newFilterBox.protect_status);
		// }
		// if (filterBox.stage_status !== newFilterBox.stage_status) {
		// 	filterBoxUpd.stage_status = newFilterBox.stage_status;
		// 	handleSearchParamsChange('stage_status', newFilterBox.stage_status);
		// }
		//
		// if (filterBox.manager !== newFilterBox.manager) {
		// 	filterBoxUpd.manager = newFilterBox.manager;
		// 	handleSearchParamsChange('manager', newFilterBox.manager);
		// }
		// if (filterBox.bill_number !== newFilterBox.bill_number) {
		// 	filterBoxUpd.bill_number = newFilterBox.bill_number;
		// 	handleSearchParamsChange('bill_number', newFilterBox.bill_number);
		// }
		// if (filterBox.comment !== newFilterBox.comment) {
		// 	filterBoxUpd.comment = newFilterBox.comment;
		// 	handleSearchParamsChange('comment', newFilterBox.comment);
		// }
		// if (filterBox.object_name !== newFilterBox.object_name) {
		// 	filterBoxUpd.object_name = newFilterBox.object_name;
		// 	handleSearchParamsChange('object_name', newFilterBox.object_name);
		// }
		console.log(areObjectsEqual(filterBox, filterBoxUpd));
		console.log(searchParams);
		if (!areObjectsEqual(filterBox, filterBoxUpd)) {
			setFilterBox(filterBoxUpd);
		}
	};

	const fetchFilterSelects = async () => {
		if (PRODMODE) {
			const path = `/api/sales/filterlist`;
			try {
				let response = await PROD_AXIOS_INSTANCE.post(path, {
					_token: CSRF_TOKEN,
				});
				if (response.data) {
					const filters = response.data.content;
					// setFilterStep(filters.step);
					// setFilterProtectionProject(filters.protection_project);
					// setFilterBidType(filters.type_select);
					// setFilterPaySelect(filters.pay_select);
					// setFilterAdminAcceptSelect(filters.admin_accept_select);
					// setFilterPackageSelect(filters.package_select);
					// setFilterPriceSelect(filters.price_select);
					// setFilterBidCurrencySelect(filters.bid_currency_select);
					// setFilterNdsSelect(filters.nds_select);
					// setFilterCompleteSelect(filters.complete_select);
					// setFilterManagersSelect(filters.managers);
					setFilterCompaniesSelect(filters.companies);
					setFilterUsersSelect(filters.users);
				}
			} catch (e) {
				console.log(e);
				setIsAlertVisible(true);
				setAlertMessage(`Произошла ошибка! ${path}`);
				setAlertDescription(e.response?.data?.message || e.message || 'Неизвестная ошибка');
				setAlertType('error');
			}
		} else {
			// setFilterStep(FILTERS.step);
			// setFilterProtectionProject(FILTERS.protection_project);
			// setFilterBidType(FILTERS.type_select);
			// setFilterPaySelect(FILTERS.pay_select);
			// setFilterAdminAcceptSelect(FILTERS.admin_accept_select);
			// setFilterPackageSelect(FILTERS.package_select);
			// setFilterPriceSelect(FILTERS.price_select);
			// setFilterBidCurrencySelect(FILTERS.bid_currency_select);
			// setFilterNdsSelect(FILTERS.nds_select);
			// setFilterCompleteSelect(FILTERS.complete_select);
			// setFilterManagersSelect(FILTERS.managers_select);
			setFilterCompaniesSelect(FILTERS.companies);
			setFilterUsersSelect(FILTERS.users);
		}
	};

	function areObjectsEqual(obj1, obj2) {
		const keys = Object.keys(obj1);

		for (const key of keys) {
			const value1 = obj1[key];
			const value2 = obj2[key];

			// Если оба значения null - считаем равными
			if (value1 === null && value2 === null) {
				continue; // переходим к следующему ключу
			}

			// Если одно значение null, а другое нет - не равны
			if (value1 === null || value2 === null) {
				return false;
			}

			// Если оба не null - сравниваем как обычно
			if (value1 !== value2) {
				return false;
			}
		}

		return true;
	}

	const handleUpdateFilterBoxSider = (newFilterBox) => {
		const filterBoxUpd = JSON.parse(JSON.stringify(filterBox));

		if (filterBox.target_company !== newFilterBox.target_company) {
			filterBoxUpd.target_company = newFilterBox.target_company;
			handleSearchParamsChange('target_company', newFilterBox.target_company);
		}
		if (filterBox.pay_status !== newFilterBox.pay_status) {
			filterBoxUpd.pay_status = newFilterBox.pay_status;
			handleSearchParamsChange('pay_status', newFilterBox.pay_status);
		}
		if (filterBox.admin_accept !== newFilterBox.admin_accept) {
			filterBoxUpd.admin_accept = newFilterBox.admin_accept;
			handleSearchParamsChange('admin_accept', newFilterBox.admin_accept);
		}
		if (filterBox.package !== newFilterBox.package) {
			filterBoxUpd.package = newFilterBox.package;
			handleSearchParamsChange('package', newFilterBox.package);
		}
		if (filterBox.price !== newFilterBox.price) {
			filterBoxUpd.price = newFilterBox.price;
			handleSearchParamsChange('price', newFilterBox.price);
		}
		if (filterBox.bid_currency !== newFilterBox.bid_currency) {
			filterBoxUpd.bid_currency = newFilterBox.bid_currency;
			handleSearchParamsChange('bid_currency', newFilterBox.bid_currency);
		}
		if (filterBox.nds !== newFilterBox.nds) {
			filterBoxUpd.nds = newFilterBox.nds;
			handleSearchParamsChange('nds', newFilterBox.nds);
		}
		if (filterBox.complete !== newFilterBox.complete) {
			filterBoxUpd.complete = newFilterBox.complete;
			handleSearchParamsChange('complete', newFilterBox.complete);
		}
		console.log(areObjectsEqual(filterBox, filterBoxUpd));
		if (!areObjectsEqual(filterBox, filterBoxUpd)) {
			setFilterBox(filterBoxUpd);
		}
	};

	const handleRerenderPage = () => {
		fetchCuratorOrders().then();
	};

	
	const handleStatusChange = async (order_id, status) => {
		if (PRODMODE) {
			const path = `/api/v2/curators/approved/` + order_id;
			try {
				let response = await PROD_AXIOS_INSTANCE.put(path, {
					data: {
						status:status
					},
					_token: CSRF_TOKEN,
				});

				setIsAlertVisible(true);
				setAlertMessage(`Успешно`);
				let message = status === 1 ? "Успешное подтверждение" : "Вы отклонили заявку"
				setAlertDescription(message);
				setAlertType('success');

				await fetchCuratorOrders()
			} catch (e) {
				console.log(e);
				setIsAlertVisible(true);
				setAlertMessage(`Произошла ошибка! ${path}`);
				setAlertDescription(e.response?.data?.message || e.message || 'Неизвестная ошибка');
				setAlertType('error');
			}
		} else {
			setIsAlertVisible(true);
			setAlertMessage(`Успешно`);
			let message = status === 1 ? "Успешное подтверждение" : "Вы отклонили заявку"
			setAlertDescription(message);
			setAlertType('success');
		}
	}

	return (
		<div className={`app-page sa-app-page ${isOpenedFilters ? 'sa-filer-opened' : ''}`}>
			<Affix>
				<div style={{ padding: '0', backgroundColor: '#b4c9e1' }}>
					<div className={'sa-control-panel sa-flex-space sa-pa-12 sa-list-header'}>
						<div className={'sa-header-label-container'}>
							<div className={'sa-header-label-container-small'}>
								<h1 className={'sa-header-label'}>Кураторство</h1>
								<div>
									<CurrencyMonitorBar />
								</div>
							</div>
							<div className={'sa-header-label-container-small'}>
								<div className={'sa-vertical-flex'}>
									<Space.Compact>
										<Button
											onClick={() => {
												setIsOpenedFilters(!isOpenedFilters);
											}}
											className={`${
												isOpenedFilters
													? 'sa-default-solid-btn-color'
													: 'sa-default-outlined-btn-color'
											}`}
											color={'default'}
											variant={isOpenedFilters ? 'solid' : 'outlined'}
											icon={<FilterOutlined />}
										>
											Доп Фильтры
										</Button>
										{filterSortClearMenu.length > 0 && (
											<Tooltip title={'Очистить фильтры'} placement={'right'}>
												<Dropdown menu={{ items: filterSortClearMenu }}>
													<Button
														color={'danger'}
														variant={'solid'}
														icon={<CloseOutlined />}
														onClick={handleClearAllBoxes}
													></Button>
												</Dropdown>
											</Tooltip>
										)}
									</Space.Compact>
									<Tag
										style={{
											width: '160px',
											height: '32px',
											lineHeight: '27px',
											textAlign: 'center',
											fontSize: '14px',
										}}
										color="geekblue"
									>
										Всего найдено: {total}
									</Tag>
								</div>
								<div style={{ display: 'flex', alignItems: 'end' }}>
									{/*{activeRole > 0 && (*/}
									{/*	<div>*/}
									{/*		{isOneRole ? (*/}
									{/*			<div*/}
									{/*				style={{*/}
									{/*					display: 'flex',*/}
									{/*					alignItems: 'center',*/}
									{/*					gap: '5px',*/}
									{/*					justifyContent: 'end',*/}
									{/*				}}*/}
									{/*			>*/}
									{/*				Роль:*/}
									{/*				<Tag*/}
									{/*					className={`*/}
                                  {/*  sa-tag-custom*/}
                                  {/*  ${activeRole === 1 ? 'sa-select-custom-manager' : ''}*/}
                                  {/*  ${activeRole === 2 ? 'sa-select-custom-admin' : ''}*/}
                                  {/*  ${activeRole === 3 ? 'sa-select-custom-bugh' : ''}*/}
                                  {/*`}*/}
									{/*				>*/}
									{/*					{roles.find((role) => role.value === activeRole)?.label ||*/}
									{/*						'Неизвестная роль'}*/}
									{/*				</Tag>*/}
									{/*			</div>*/}
									{/*		) : (*/}
									{/*			<div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>*/}
									{/*				Роль:*/}
									{/*				<Select*/}
									{/*					className={`*/}
                                  {/*      ${activeRole === 1 ? 'sa-select-custom-manager' : ''}*/}
                                  {/*      ${activeRole === 2 ? 'sa-select-custom-admin' : ''}*/}
                                  {/*      ${activeRole === 3 ? 'sa-select-custom-bugh' : ''}*/}
                                  {/*    `}*/}
									{/*					style={{ width: '150px', marginRight: '8px' }}*/}
									{/*					options={roles.filter((role) => userdata.acls.includes(role.acl))}*/}
									{/*					value={activeRole}*/}
									{/*					onChange={fetchChangeRole}*/}
									{/*				/>*/}
									{/*			</div>*/}
									{/*		)}*/}
									{/*	</div>*/}
									{/*)}*/}
								</div>
							</div>
						</div>
					</div>
				</div>
			</Affix>

			<Layout className={'sa-layout sa-w-100'}>
				<Sider
					collapsed={!isOpenedFilters}
					collapsedWidth={0}
					width={'300px'}
					style={{ backgroundColor: '#ffffff', overflow: 'hidden' }}
				>
					<div className={'sa-sider'}>
						{isOpenedFilters && (
							<CuratorOrdersListSiderFilters
								// filter_pay_select={prepareSelectOptions(filterPaySelect)}
								// filter_admin_accept_select={prepareSelectOptions(filterAdminAcceptSelect)}
								// filter_package_select={prepareSelectOptions(filterPackageSelect)}
								// filter_price_select={prepareSelectOptions(filterPriceSelect)}
								// filter_bid_currency_select={prepareSelectOptions(filterBidCurrencySelect)}
								// filter_nds_select={prepareSelectOptions(filterNdsSelect)}
								// filter_complete_select={prepareSelectOptions(filterCompleteSelect)}
								filter_users_select={Helper.prepareSelectOptions(filterUsersSelect)}
								filter_companies_select={Helper.prepareSelectOptions(filterCompaniesSelect)}
								filter_box={filterBox}
								on_change_filter_box={handleUpdateFilterBoxSider}
							/>
						)}
					</div>
				</Sider>

				<Content>
					<Affix offsetTop={106}>
						<div className={'sa-pagination-panel sa-pa-12-24 sa-back'}>
							<div className={'sa-flex-space'}>
								<div className={'sa-flex-gap'}>
									<Pagination
										defaultCurrent={1}
										pageSize={onPage}
										pageSizeOptions={[30, 50, 100, 200, 300]}
										current={currentPage}
										total={total}
										onChange={(val, newOnPage) => {
											if (val !== currentPage) {
												handleSearchParamsChange('currentPage', val);
												setCurrentPage(val);
											}
											if (newOnPage !== onPage) {
												handleSearchParamsChange('onPage', newOnPage);
												setOnPage(newOnPage);
											}
										}}
										showQuickJumper
										locale={{
											items_per_page: 'на странице',
											jump_to: 'Перейти',
											jump_to_confirm: 'OK',
											page: 'Страница',
										}}
									/>
								</div>
								<div></div>
								<div className={'sa-flex-gap'}>
									{/*<Tooltip placement="bottom" title="Я временный куратор">
                    <Button color="default" variant={false ? "solid" : "filled"}
                        // onClick={()=>{setShowOnlyCrew(false); setShowOnlyMine(!showOnlyMine)}}
                    >Временные</Button>
                  </Tooltip>*/}
									{/*<Tooltip placement="bottom" title="Заявки созданные Вами">*/}
									{/*	<Button*/}
									{/*		color="default"*/}
									{/*		variant={myBids ? 'solid' : 'filled'}*/}
									{/*		onClick={() => {*/}
									{/*			setMyBids(!myBids);*/}
									{/*		}}*/}
									{/*	>*/}
									{/*		Мои заявки*/}
									{/*	</Button>*/}
									{/*</Tooltip>*/}
								</div>
							</div>
						</div>
					</Affix>

					<div
						className={`${isOpenedFilters ? 'sa-pa-tb-12 sa-pa-s-3' : 'sa-pa-12'} sa-table`}
						style={{ paddingTop: 0 }}
					>
						<Spin spinning={isLoading}>
							<CuratorOrdersListTable
								companies={companies}
								orders={curatorOrders}

								on_change_filter_box={handleUpdateFilterBoxHeader}

								filter_box={filterBox}

								supervisor={supervisor}

								handleStatusChange={handleStatusChange}

								userdata={userdata}
								rerenderPage={handleRerenderPage}
								success_alert={(message) => {
									setIsAlertVisible(true);
									setAlertMessage(`Успех!`);
									setAlertDescription(message);
									setAlertType('success');
								}}
								error_alert={(path, e) => {
									setIsAlertVisible(true);
									setAlertMessage(`Произошла ошибка! ${path}`);
									setAlertDescription(
										e.response?.data?.message || e.message || 'Неизвестная ошибка'
									);
									setAlertType('error');
								}}
							/>
						</Spin>
						<div className={'sa-space-panel sa-pa-12'}></div>
					</div>
				</Content>
			</Layout>
			{isAlertVisible && (
				<Alert
					message={alertMessage}
					description={alertDescription}
					type={alertType}
					showIcon
					closable
					style={{
						position: 'fixed',
						top: 20,
						right: 20,
						zIndex: 9999,
						width: 350,
					}}
					onClose={() => setIsAlertVisible(false)}
				/>
			)}
		</div>
	);
};

export default CuratorPageNEW;
