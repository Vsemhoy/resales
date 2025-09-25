import React, { useEffect, useState } from 'react';

import './components/style/engineerlistpage.css';
import { BASE_ROUTE, CSRF_TOKEN, PRODMODE } from '../../config/config';
import { NavLink, useParams, useSearchParams } from 'react-router-dom';
import {
	Affix,
	Button,
	Space,
	Dropdown,
	Layout,
	Pagination,
	message,
	Spin,
	Tag,
	Tooltip, Alert,
} from 'antd';
import { Content } from 'antd/es/layout/layout';
import Sider from 'antd/es/layout/Sider';
import { CaretLeftFilled, CloseOutlined, FilterOutlined, PlusOutlined } from '@ant-design/icons';
import CurrencyMonitorBar from '../../components/template/CURRENCYMONITOR/CurrencyMonitorBar';
import EngineerListTable from './components/EngineerListTable';
import EngineerListSiderFilters from './components/EngineerListSiderFilters';
import { PROD_AXIOS_INSTANCE } from '../../config/Api';
import { BID_LIST, FILTERS, ORDERS, ORDERSSTATUS, SPECS_LIST } from './mock/mock';
import { ANTD_PAGINATION_LOCALE } from '../../config/Localization';
import { c } from 'react/compiler-runtime';
import OrderListSider from './components/OrderListSider';
import NewOrderModal from "./components/NewOrderModal";

const EngineerListPage = (props) => {
	const { userdata } = props;

	const [isMounted, setIsMounted] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isOpenedFilters, setIsOpenedFilters] = useState(true);
	const [isHasRole, setIsHasRole] = useState(false);
	const [isOneRole, setIsOneRole] = useState(true);
	const [isBackRoute, setIsBackRoute] = useState(false);

	const [fromOrgId, setFromOrgId] = useState(0);

	/* в шапке таблицы */
	const [filterStep, setFilterStep] = useState([]);
	const [filterProtectionProject, setFilterProtectionProject] = useState([]);
	const [filterBidType, setFilterBidType] = useState([]);
	/* в фильтрах sider */
	const [filterPaySelect, setFilterPaySelect] = useState([]);
	const [filterAdminAcceptSelect, setFilterAdminAcceptSelect] = useState([]);
	const [filterPackageSelect, setFilterPackageSelect] = useState([]);
	const [filterStatusSelect, setFilterStatusSelect] = useState([]);
	const [filterBidCurrencySelect, setFilterBidCurrencySelect] = useState([]);
	const [filterNdsSelect, setFilterNdsSelect] = useState([]);
	const [filterCompleteSelect, setFilterCompleteSelect] = useState([]);
	const [filterCompaniesSelect, setFilterCompaniesSelect] = useState([]);

	const [filterSortClearMenu, setFilterSortClearMenu] = useState([]);

	const [total, setTotal] = useState(0);
	const [onPage, setOnPage] = useState(30);
	const [currentPage, setCurrentPage] = useState(1);

	const [blockNewSpec, setBlockNewSpec] = useState(false);
	const [specs, setSpecs] = useState([]);

	const [filterBox, setFilterBox] = useState({
		id_company: null,
		status: null,
	});
	const [orderBox, setOrderBox] = useState({});

	const [sortOrders, setSortOrders] = useState([]);

	const [searchParams, setSearchParams] = useSearchParams();
	const [baseCompanies, setBaseCompanies] = useState([]);
	const [companies, setCompanies] = useState([]);
	const { item_id } = useParams();
	const [isPreviewOpen, setIsPreviewOpen] = useState(false);
	const [previewItem, setPreviewItem] = useState(null);
	const showGetItem = searchParams.get('show');
	const [activeRole, setActiveRole] = useState(1);
	const [messageApi, contextHolder] = message.useMessage();

	const [orders, setOrders] = useState([]);
	const [ordersStatus, setOrdersStatus] = useState([]);
	const [isOpenModal, setIsOpenModal] = useState(false);
	const [modalOrderID, setModalOrderID] = useState(0);
	const [modalReason, setModalReason] = useState('');
	const [superUser, setSuperUser] = useState(false);

	const [isAlertVisible, setIsAlertVisible] = useState(false);
	const [alertMessage, setAlertMessage] = useState('');
	const [alertDescription, setAlertDescription] = useState('');
	const [alertType, setAlertType] = useState('');

	const success = (content) => {
		messageApi.open({
			type: 'success',
			content: content,
		});
	};

	useEffect(() => {
		setSuperUser(props.userdata.user?.super);
	}, [props.userdata.user?.super]);

	useEffect(() => {
		fetchInfo().then();
		if (showGetItem !== null) {
			handlePreviewOpen(showGetItem);
			setTimeout(() => {
				setShowParam(showGetItem);
			}, 2200);
		}
		setIsMounted(true);
	}, []);

	useEffect(() => {
		if (isMounted) {
			setIsLoading(true);
			fetchBids().then(() => {
				setIsLoading(false);
			});
		}
	}, [currentPage, onPage, filterBox, orderBox]);

	useEffect(() => {
		if (userdata !== null && userdata.companies && userdata.companies.length > 0) {
			setBaseCompanies(userdata.companies);
		}
		if (userdata !== null && userdata.acls) {
			// 89 - менеджер
			// 91 - администратор
			// 90 - бухгалтер
			const found = userdata.acls.filter((num) => [89, 90, 91].includes(num));
			if (found) setIsHasRole(true);
			console.log('found', found.length);
			setIsOneRole(found.length === 1);
		}
		if (userdata !== null && userdata.user && userdata.user.id_departament) {
			if ([7,8,20].includes(userdata.user.id_departament)) {
			  setActiveRole(1);
			} else {
			  setActiveRole(2);
			}
		}
	}, [userdata]);

	useEffect(() => {
		setCompanies(
			baseCompanies.map((item) => ({
				key: `kompa_${item.id}`,
				id: item.id,
				label: item.name,
			}))
		);
	}, [baseCompanies]);

	useEffect(() => {
		if (!isPreviewOpen) {
			setShowParam(null);
		}
	}, [isPreviewOpen]);

	useEffect(() => {
		makeFilterMenu();
	}, [filterBox, orderBox]);

	useEffect(() => {
		if (isAlertVisible && alertType !== 'error') {
			const timer = setTimeout(() => {
				setIsAlertVisible(false);
			}, 3000);

			return () => clearTimeout(timer);
		}
	}, [isAlertVisible]);

	const fetchInfo = async () => {
		setIsLoading(true);
		await fetchFilterSelects();
		await fetchBids();
		await fetchOrders();
		setIsLoading(false);
	};

	const fetchFilterSelects = async () => {
		if (PRODMODE) {
			try {
				let response = await PROD_AXIOS_INSTANCE.post('/api/sales/engineer/filter/list', {
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
					setFilterStatusSelect(filters.price_select);
					// setFilterBidCurrencySelect(filters.bid_currency_select);
					// setFilterNdsSelect(filters.nds_select);
					// setFilterCompleteSelect(filters.complete_select);
					setFilterCompaniesSelect(filters.companies);
					setBaseCompanies(filters.companies);
				}
			} catch (e) {
				console.log(e);
			}
		} else {
			// setFilterStep(FILTERS.step);
			// setFilterProtectionProject(FILTERS.protection_project);
			// setFilterBidType(FILTERS.type_select);
			// setFilterPaySelect(FILTERS.pay_select);
			// setFilterAdminAcceptSelect(FILTERS.admin_accept_select);
			// setFilterPackageSelect(FILTERS.package_select);
			setFilterStatusSelect(FILTERS.statuses);
			// setFilterBidCurrencySelect(FILTERS.bid_currency_select);
			// setFilterNdsSelect(FILTERS.nds_select);
			// setFilterCompleteSelect(FILTERS.complete_select);
			setFilterCompaniesSelect(FILTERS.companies);
			setBaseCompanies(FILTERS.companies);
		}
	};

	const fetchBids = async () => {
		if (PRODMODE) {
			const data = {
				id_company: filterBox.id_company,
				status: filterBox.status,
				sort_orders: orderBox,
			};
			try {
				let response = await PROD_AXIOS_INSTANCE.post('/api/sales/engineer', {
					data,
					_token: CSRF_TOKEN,
				});
				setSpecs(response.data.content.specs);
				setTotal(response.data.content.total_count);

				let max = onPage * currentPage - (onPage - 1);
				if (response.data.total_count < max) {
					setCurrentPage(1);
				}
			} catch (e) {
				console.log(e);
			}
		} else {
			setSpecs(SPECS_LIST);
			setTotal(33000);
		}
	};

	const handlePreviewOpen = (item, state) => {
		console.log('HELLO', item);
		setShowParam(item);
		setPreviewItem(item);
		setIsPreviewOpen(true);
	};

	const setShowParam = (value) => {
		if (value !== null) {
			searchParams.set('show', value);
			setSearchParams(searchParams);
		} else {
			searchParams.delete('show');
			setSearchParams(searchParams);
		}
	};

	const prepareSelectOptions = (options) => {
		if (options && options.length > 0) {
			return options.map((option) => {
				return {
					key: `option-${option.id}-${option.name}`,
					value: option.id,
					label: option.name,
					boss_id: option.boss_id,
					id_company: option.id_company,
					count: option.count,
					match: option.match,
				};
			});
		} else {
			return [];
		}
	};

	const handleUpdateFilterBox = (key, value) => {
		if (!filterBox) return 0;
		const fb = JSON.parse(JSON.stringify(filterBox));
		fb[key] = value;
		setFilterBox(fb);
		console.log(fb);
	};

	const makeFilterMenu = () => {
		let clearItems = [];
		let hasFilter = false;
		let hasSorter = false;

		for (const key in filterBox) {
			const fib = filterBox[key];
			if (fib !== null) {
				if (key === 'updated_date' && fib[0] !== null) {
					hasFilter = true;
				} else if (key === 'created_date' && fib[0] !== null) {
					hasFilter = true;
				} else if (
					key !== 'updated_date' &&
					key !== 'created_date' &&
					key !== 'page' &&
					key !== 'onpage' &&
					key !== 'limit'
				)
					hasFilter = true;
			}
		}
		for (const key in orderBox) {
			const fib = orderBox[key];
			if (fib !== null) {
				hasSorter = true;
			}
		}

		if (hasFilter) {
			clearItems.push({
				key: 'clarboxofilta',
				value: 'clear_filters',
				label: <div onClick={handleClearAllFilterBox}>Очистить фильтры</div>,
			});
		}

		if (hasSorter) {
			clearItems.push({
				key: 'clarboxsorta',
				value: 'clear_filters',
				label: <div onClick={handleClearOrderBox}>Очистить cортировки</div>,
			});
		}
		setFilterSortClearMenu(clearItems);
	};

	const handleClearAllFilterBox = () => {
		setFilterBox({
			id_company: null,
			status: null,
		});
	};

	const handleClearOrderBox = () => {
		setOrderBox({});
	};

	const handleClearAllBoxes = () => {
		setFilterBox({});
		setOrderBox({});
	};

	const fetchNewSpec = async () => {
		if (PRODMODE) {
			let response = await PROD_AXIOS_INSTANCE.post('/api/sales/engineer/add', {
				_token: CSRF_TOKEN,
				data: {},
			});

			window.open(BASE_ROUTE + '/engineer/' + response.data.spec);
		} else {
			window.open(BASE_ROUTE + '/engineer/' + 1);
		}
	};

	const fetchNewOrder = async () => {
		if (PRODMODE) {
			let response = await PROD_AXIOS_INSTANCE.post('/api/sales/engineer/orders/new', {
				_token: CSRF_TOKEN,
			});

			await fetchOrders();
			success('Заявка успешно сформирована');
		} else {
			success('Заявка успешно сформирована');
		}
	};

	const fetchOrders = async () => {
		if (PRODMODE) {
			try {
				let response = await PROD_AXIOS_INSTANCE.post('/api/sales/engineer/orders/show', {
					_token: CSRF_TOKEN,
					data: {},
				});
				console.log(response);

				setOrders(response.data.content.orders);
				setOrdersStatus(response.data.content.order_status);
			} catch (e) {
				console.log(e);
			}
		} else {
			setOrders(ORDERS);
			setOrdersStatus(ORDERSSTATUS);
		}
	};

	// const addNewSpec = () => {
	// 	setBlockNewSpec(true);
	// 	fetchNewSpec().then((r) => setBlockNewSpec(false));
	// };

	const addNewOrder = () => {
		setBlockNewSpec(true);
		fetchNewOrder().then((r) => setBlockNewSpec(false));
	};

	useEffect(() => {
		console.log(orders);
	}, [orders]);

	const returnOrderToSpec = (order_id, who) => {
		console.log(order_id);
		console.log(who);
		if (PRODMODE) {
			if (who === 'engineer') {
				setIsOpenModal(true);
				setModalOrderID(order_id);
			} else {
				let response = PROD_AXIOS_INSTANCE.post('/api/sales/engineer/orders/delete/' + order_id, {
					_token: CSRF_TOKEN,
					data: {
						reason: modalReason,
					},
				});

				const updatedOrders = orders.filter((order) => order.id !== order_id);
				setOrders(updatedOrders);
				success('Заявка успешно отозвана');
			}
		} else {
			if (who === 'engineer') {
				setIsOpenModal(true);
				setModalOrderID(order_id);
			} else {
				const updatedOrders = orders.filter((order) => order.id !== order_id);
				setOrders(updatedOrders);

				success('Заявка успешно отозвана');
			}
		}
	};

	const handleCancel = () => {
		setIsOpenModal(false);
		setModalReason('');
	};
	const handleOk = () => {
		setIsOpenModal(false);
		console.log('HERE: ', modalReason);

		const updatedOrders = orders.filter((order) => order.id !== modalOrderID);
		setOrders(updatedOrders);
		setModalReason('');
	};

	const handleSetText = (text) => {
		setModalReason(text);
	};

	const [modalText, setModalText] = useState("");
	const [modalFileList, setModalFileList] = useState([]);

	const handleSetModalText = (text) => {
		setModalText(text);
	};

	const handleModalCancel = () => {
		console.log('HERE: handleModalCancel');
		setBlockNewSpec(false);
		setModalText("");
		setModalFileList([]);
	};
	const handleModalOk = (text, files) => {
		console.log('HERE: handleModalOk', text);
		setModalText(text);
		setModalFileList(files);
		console.log(files)

		fetchCreateNewOrder(files, text).then(() => {
			setBlockNewSpec(false);
		});
	};

	const fetchCreateNewOrder = async (files, text) => {
		if (PRODMODE) {
			const formData = new FormData();
			formData.append('_token', CSRF_TOKEN);
			formData.append('data', JSON.stringify({text: text}));

			console.log("Files: ", files);
			console.log("Text: ", text);

			files.forEach((file, index) => {
				formData.append('files[]', file.originFileObj || file);
			});

			let response = await PROD_AXIOS_INSTANCE.post('/api/sales/engineer/orders/new', formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				}
			});
			success('Заявка успешно создана');
		} else {
			success('Заявка успешно создана');
		}
	}

	const acceptOrder = async (order_id, engineer) => {
		if (PRODMODE) {
			try {
				let response = await PROD_AXIOS_INSTANCE.post('/api/sales/engineer/orders/accept/' + order_id, {
					_token: CSRF_TOKEN,
				})

				setIsAlertVisible(true);
				setAlertMessage('Успех!');
				setAlertDescription(response.data.message);
				setAlertType('success');

				const updatedOrders = orders.filter((order) => order.id !== order_id);
				setOrders(updatedOrders);
			} catch (e) {
				console.log(e)
				setIsAlertVisible(true);
				setAlertMessage('Произошла ошибка!');
				setAlertDescription(e.response?.data?.message || e.message || 'Неизвестная ошибка');
				setAlertType('error');
			}
		} else {
			setIsAlertVisible(true);
			setAlertMessage('Успех!');
			setAlertDescription('Успешное обновление');
			setAlertType('success');

			const updatedOrders = orders.filter((order) => order.id !== order_id);
			setOrders(updatedOrders);
		}
	}


	return (
		<div className={`app-page sa-app-page ${isOpenedFilters ? 'sa-filer-opened' : ''}`}>
			{contextHolder}
			<Affix>
				<div className={'sa-control-panel sa-flex-space sa-pa-12 sa-list-header'}>
					<div className={'sa-header-label-container'}>
						<div className={'sa-header-label-container-small'}>
							<h1 className={'sa-header-label'}>Спецификации</h1>
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
								{/*{activeRole === 1 && (*/}
								{/*	<Button*/}
								{/*		type={'primary'}*/}
								{/*		icon={<PlusOutlined />}*/}
								{/*		onClick={addNewSpec}*/}
								{/*		disabled={blockNewSpec}*/}
								{/*	>*/}
								{/*		Новая спецификация*/}
								{/*	</Button>*/}
								{/*)}*/}
								{activeRole === 2 && (
									<Button
										type={'primary'}
										icon={<PlusOutlined />}
										onClick={() => setBlockNewSpec(true)}
										// onClick={addNewOrder}
										disabled={blockNewSpec}
									>
										Новая заявка
									</Button>
								)}
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
					style={{ backgroundColor: '#ffffff' }}
				>
					<div className={'sa-sider'}>
						{isOpenedFilters && (
							<EngineerListSiderFilters
								filter_status_select={prepareSelectOptions(filterStatusSelect)}
								filter_companies_select={prepareSelectOptions(filterCompaniesSelect)}
								on_change_filter_box={handleUpdateFilterBox}
							/>
						)}
					</div>
				</Sider>

				<Content>
					<Affix offsetTop={106}>
						<div className={'sa-pagination-panel sa-pa-12-24 sa-back'}>
							<div className={'sa-flex-space'}>
								<div className={'sa-flex-gap'}>
									{isBackRoute && (
										<NavLink to={`/orgs?show=${fromOrgId}`}>
											<Button type={'default'} icon={<CaretLeftFilled />}>
												Назад в компанию
											</Button>
										</NavLink>
									)}
									<Pagination
										defaultPageSize={onPage}
										defaultCurrent={1}
										current={currentPage}
										total={total}
										onChange={setCurrentPage}
										showQuickJumper
										locale={ANTD_PAGINATION_LOCALE}
									/>
								</div>
							</div>
						</div>
					</Affix>

					<div
						className={`${isOpenedFilters ? 'sa-pa-tb-12 sa-pa-s-3' : 'sa-pa-12'}`}
						style={{ paddingTop: 0 }}
					>
						<Spin spinning={isLoading}>
							<EngineerListTable
								activeRole={activeRole}
								companies={companies}
								specs={specs}
								filter_steps={prepareSelectOptions(filterStep)}
								filter_protection_projects={prepareSelectOptions(filterProtectionProject)}
								filter_bid_types={prepareSelectOptions(filterBidType)}
								on_change_filter_box={handleUpdateFilterBox}
								on_preview_open={handlePreviewOpen}
								on_set_sort_orders={setOrderBox}
								base_companies={baseCompanies}
								userData={userdata}
								superUser={superUser}
							/>
						</Spin>
						<div className={'sa-space-panel sa-pa-12'}></div>
					</div>
				</Content>
				<Sider
					collapsed={!isOpenedFilters}
					collapsedWidth={0}
					width={'350px'}
					style={{ backgroundColor: '#ffffff' }}
				>
					<div className={'sa-sider'}>
						{isOpenedFilters && (
							<OrderListSider
								orders={orders}
								returnOrderToSpec={returnOrderToSpec}
								acceptOrder={acceptOrder}
								activeRole={activeRole}
								isOpenModal={isOpenModal}
								modalOrderID={modalOrderID}
								modalReason={modalReason}
								handleOk={handleOk}
								handleCancel={handleCancel}
								handleSetText={handleSetText}
								// filter_pay_select={prepareSelectOptions(filterPaySelect)}
								// filter_admin_accept_select={prepareSelectOptions(filterAdminAcceptSelect)}
								// filter_package_select={prepareSelectOptions(filterPackageSelect)}
								// filter_price_select={prepareSelectOptions(filterPriceSelect)}
								// filter_bid_currency_select={prepareSelectOptions(filterBidCurrencySelect)}
								// filter_nds_select={prepareSelectOptions(filterNdsSelect)}
								// filter_complete_select={prepareSelectOptions(filterCompleteSelect)}
								// filter_companies_select={prepareSelectOptions(filterCompaniesSelect)}
								// on_change_filter_box={handleUpdateFilterBox}
							/>
						)}
					</div>
				</Sider>

				{blockNewSpec && (
					<NewOrderModal
						open={blockNewSpec}
						text={modalText}
						handleOk={handleModalOk}
						handleCancel={handleModalCancel}
						handleSetModalText={handleSetModalText}
						fileListM={modalFileList}
					/>
				)}

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
			</Layout>
		</div>
	);
};

export default EngineerListPage;
