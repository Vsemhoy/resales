import React, { useEffect, useState } from 'react';
import { useUserData } from '../../context/UserDataContext';
import './components/style/orglistpage.css';
import { BASE_ROUTE, CSRF_TOKEN, HTTP_ROOT, PRODMODE } from '../../config/config';
import { NavLink, useParams, useSearchParams } from 'react-router-dom';
import {
	Affix,
	Button,
	// DatePicker,
	Dropdown,
	// Input,
	Layout,
	Pagination,
	// Select,
	Spin,
	Tag,
	Tooltip,
} from 'antd';
import { Content } from 'antd/es/layout/layout';
import Sider from 'antd/es/layout/Sider';
// import { DocumentPlusIcon } from '@heroicons/react/16/solid';
import {
	// CaretDownFilled,
	// CaretUpFilled,
	CloseOutlined,
	// CloseSquareOutlined,
	FilterOutlined,
	LoadingOutlined,
	PlusOutlined,
} from '@ant-design/icons';
// import TableHeadNameWithSort from '../../components/template/TABLE/TableHeadNameWithSort';
import CurrencyMonitorBar from '../../components/template/CURRENCYMONITOR/CurrencyMonitorBar';
// import OrgListRow from './components/OrgListRow';
import OrgListPreviewModal from './components/OrgModal/OrgListPreviewModal';
import OrgListSiderFilter from './components/OrgListSiderFilters';
import OrgListTable from './components/OrgListTable';
// import { RectangleStackIcon } from '@heroicons/react/24/outline';
import {
	// filterSortClearMenu,
	OM_COMP_LIST,
	OM_ORG_FILTERDATA,
} from './components/mock/ORGLISTMOCK';
import { PROD_AXIOS_INSTANCE } from '../../config/Api';
import { ANTD_PAGINATION_LOCALE } from '../../config/Localization';
import { readOrgURL, updateURL, useURLParams } from '../../components/helpers/UriHelpers';
// import dayjs from 'dayjs';

const OrgListPage = () => {
	const { userdata } = useUserData();
	const { updateURL, readOrgURL } = useURLParams();
	const [searchParams, setSearchParams] = useSearchParams();

	const [baseCompanies, setBaseCompanies] = useState([]);
	const [companies, setCompanies] = useState([]);

	// Это селекты
	const [baseFiltersData, setBaseFilterstData] = useState(null);

	const [openedFilters, setOpenedFilters] = useState(false);

	const [urlParamsText, setUrlParamsText] = useState('');

	const [orgList, setOrgList] = useState([]);

	const [total, setTotal] = useState(0);
	const [onPage, setOnPage] = useState(30);
	const [currentPage, setCurrentPage] = useState(1);
	const [currentTab, setCurrentTab] = useState('m');
	const [previousPage, setPreviousPage] = useState(1);

	const [filterBox, setFilterBox] = useState({});
	const [orderBox, setOrderBox] = useState({});

	/** Сортировки как объект, где колонка - ключ, значение - ASC/DESC */

	const [isPreviewOpen, setIsPreviewOpen] = useState(false);
	const [showLoader, setShowLoader] = useState(false);
	const [previewItem, setPreviewItem] = useState(null);

	// Пресеты - преднастроенные фильтры
	const [filterSortClearMenu, setFilterSortClearMenu] = useState([]);

	const showGetItem = searchParams.get('show');
	const [targetRowId, setTargetRowId] = useState(searchParams.get('target'));

	// Список кураторов меняется в зависимости от выбранной компании
	const [selectCuratorList, setSelectCuratorList] = useState([]);

	const [filterAwaiter, setFilerAwaiter] = useState(null);

	const [SKIPPER, setSKIPPER] = useState(0);

	useEffect(() => {
		setShowLoader(true);
		// При загрузке — читаем URL
		const { _filters, _sorts, _page, _onPage, _show, _tab } = readOrgURL();

		// Устанавливаем стейт фильтров, сортировок, страницы
		setFilterBox(_filters);
		// (_filters);
		setCurrentPage(_page);
		setOnPage(_onPage);
		setOrderBox(_sorts);
		if (_show) {
			setPreviewItem(_show);
			setIsPreviewOpen(true);
		}
		if (_tab) {
			setCurrentTab(_tab);
		}

		// console.clear();

		if (PRODMODE) {
			// TODO: логика для PRODMODE
			get_org_filters();
			// get_orglist();
		} else {
			// TODO: логика для dev режима
			setBaseFilterstData(OM_ORG_FILTERDATA);
			setOrgList(OM_COMP_LIST);
			setBaseCompanies(OM_ORG_FILTERDATA?.companies);
			setShowLoader(false);
		}
		if (showGetItem !== null) {
			handlePreviewOpen(showGetItem);
			setTimeout(() => {
				setShowParam(showGetItem);
			}, 500);
		}
		setTimeout(() => {
			if (targetRowId) {
				let drow = document.querySelector('#orgrow_' + targetRowId);
				if (drow) {
					drow.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'start' });
				}
			}
		}, 300);
	}, []);

	useEffect(() => {
		const timer = setTimeout(() => {
			updateURL(filterBox, orderBox, currentPage, onPage, previewItem, currentTab);
			setFilerAwaiter(null);
		}, 150);

		// Очищаем таймер, если эффект пересоздаётся (чтобы не было утечек)
		return () => clearTimeout(timer);
	}, [filterBox, orderBox, onPage, currentPage, previewItem, currentTab]);

	// useEffect(() => {
	//   console.log("baseFiltersData",baseFiltersData);
	// }, [baseFiltersData]);

	/** Перелистывание страниц стрелками + CTRL */
	useEffect(() => {
		const handleKeyDown = (ev) => {
			if (!ev.ctrlKey) return; // игнорировать если Ctrl не нажат

			if (ev.key === 'ArrowRight' || ev.key === 'ArrowLeft') {
				ev.preventDefault();

				if (total / onPage <= 1) return;

				// const currentIndex = orgs.findIndex(item => item.id === selectedItem);
				// if (currentIndex === -1) return;

				let newIndex = currentPage;
				const maxPage = Math.ceil(total / onPage);

				if (ev.key === 'ArrowRight' && currentPage < Math.ceil(total / onPage)) {
					newIndex = currentPage + 1;
				} else if (ev.key === 'ArrowLeft' && currentPage > 1) {
					newIndex = currentPage - 1;
				}

				if (newIndex !== currentPage) {
					setCurrentPage(newIndex);
				}
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [onPage, currentPage, orgList, total]);

	useEffect(() => {
		if (baseFiltersData?.companies) {
			setCompanies(
				baseFiltersData?.companies?.map((item) => ({
					key: `kompa_${item.id}`,
					id: item.id,
					value: item.id,
					label: item.id === 1 ? 'Free company' : item.name,
				}))
			);
		}
	}, [baseFiltersData]);

	/** Заполняем селекты с кураторами */
	useEffect(() => {
		if (baseFiltersData && baseFiltersData.curators) {
			let asetCurators = [];
			if (!filterBox || !filterBox.companies || filterBox.companies === null) {
				asetCurators = baseFiltersData.curators.map((item) => ({
					key: 'curacu_' + item.id,
					label: item.fullname,
					value: item.id,
				}));
			} else {
				console.log('ELSE', filterBox.companies, baseFiltersData.curators);
				asetCurators = baseFiltersData.curators
					.filter((item) => parseInt(item.id_company) === parseInt(filterBox.companies))
					.map((item) => ({
						key: 'curacu_' + item.id,
						label: item.fullname,
						value: item.id,
					}));
			}
			setSelectCuratorList(asetCurators);
		}
	}, [filterBox, baseFiltersData?.curators]);

	/** При смене страницы, если открыт модал, меняем ИД открытой компании */
	useEffect(() => {
		let prevPage = previousPage;
		if (previewItem !== null && prevPage !== currentPage) {
			if (prevPage > currentPage) {
				// Move page back
				let newId = orgList[orgList.length - 1]?.id;
				if (newId) {
					setPreviewItem(newId);
				} else {
					setPreviewItem(null);
					setIsPreviewOpen(false);
				}
			} else {
				// move page forward
				let newId = orgList[0]?.id;
				setPreviewItem(newId);
			}
			setPreviousPage(currentPage);
		}
	}, [orgList]);

	useEffect(() => {
		console.log('SKIPPER', SKIPPER);
		if (SKIPPER === 0) {
			const timer = setTimeout(() => {
				get_orglist_async();
			}, 250);

			// Очищаем таймер, если эффект пересоздаётся (чтобы не было утечек)
			return () => clearTimeout(timer);
		} else {
			setSKIPPER(SKIPPER - 1);
		}
	}, [filterBox, orderBox, currentPage, onPage]);

	/** ------------------ FETCHES ---------------- */

	// const get_orglist = () => {
	//       const timer = setTimeout(() => {
	//         console.log('GETTER', dayjs().unix())
	//         get_orglist_async();
	//       }, 400);

	//     // Очищаем таймер, если эффект пересоздаётся (чтобы не было утечек)
	//     return () => clearTimeout(timer);
	// }

	/**
	 * Получение списка клиентов-компаний
	 * @param {*} req
	 * @param {*} res
	 */
	const get_orglist_async = async () => {
		if (PRODMODE) {
			setShowLoader(true);
			let sortBox =
				orderBox && orderBox.length > 0
					? orderBox.map((item) => ({
							field: item.key,
							order: item.order === 2 ? 'DESC' : 'ASC',
					  }))
					: [];

			// let sortBox = [];

			try {
				let response = await PROD_AXIOS_INSTANCE.post('/api/sales/orglist', {
					data: {
						sort_orders: sortBox,
						profiles: filterBox.profiles,
						name: filterBox.name,
						id: filterBox.id,
						curators: filterBox.curator,
						regions: filterBox.regions,
						price_statuses: filterBox.price_statuses,
						rate_lists: filterBox.rate_lists,
						towns: filterBox.towns,
						client_statuses: filterBox.client_statuses,
						profsound: filterBox.profsound,
						companies: filterBox.companies,
						contact_user: filterBox.contact_user,
						address: filterBox.address,
						phone: filterBox.phone,
						email: filterBox.email,
						site: filterBox.site,
						comment: filterBox.comment,
						// "created_until"  : filterBox.created_until ,
						// "created_before" : filterBox.created_before,
						// "updated_until"  : filterBox.updated_until ,
						// "updated_before" : filterBox.updated_before,

						created_date: [
							filterBox.created_before ? parseInt(filterBox.created_before) * 1000 : null,
							filterBox.created_until ? parseInt(filterBox.created_until) * 1000 : null,
						],
						active_date: [
							filterBox.updated_before ? parseInt(filterBox.updated_before) * 1000 : null,
							filterBox.updated_until ? parseInt(filterBox.updated_until) * 1000 : null,
						],
						page: currentPage,
						limit: onPage,
						inn: filterBox.inn,
					},
					_token: CSRF_TOKEN,
				});
				console.log('me: ', response);
				setOrgList(response.data.org_list);
				setTotal(response.data.total_count);

				let max = onPage * currentPage - (onPage - 1);
				if (response.data.total_count < max) {
					setCurrentPage(1);
				}
			} catch (e) {
				console.log(e);
			} finally {
				// setLoadingOrgs(false)
				setShowLoader(false);
			}
		} else {
			//setUserAct(USDA);
			setShowLoader(false);
		}
	};

	/**
	 * Получение списка select data
	 * @param {*} req
	 * @param {*} res
	 */
	const get_org_filters = async () => {
		if (PRODMODE) {
			try {
				let response = await PROD_AXIOS_INSTANCE.post('api/sales/orgfilterlist', {
					data: {},
					_token: CSRF_TOKEN,
				});
				console.log('me2: ', response);
				setBaseFilterstData(response.data.filters);
				setBaseCompanies(response.data.filters?.companies);
			} catch (e) {
				console.log(e);
			} finally {
				// setLoadingOrgs(false)
			}
		} else {
			//setUserAct(USDA);
		}
	};

	/** ------------------ FETCHES END ---------------- */

	const handleActivateSorter = (key, order) => {
		if (order === 0) {
			setOrderBox([]);
		} else {
			setOrderBox([{ key: key, order: order }]);
		}
	};

	const handlePreviewOpen = (item, state) => {
		console.log('HAPREOPENEJREK', item);
		setShowParam(item);
		setPreviewItem(item);
		setIsPreviewOpen(true);
	};

	const setShowParam = (value) => {
		updateURL(filterBox, orderBox, currentPage, onPage, value, currentTab);
		setFilerAwaiter(null);
		// if (value !== null){
		//   se
		//   searchParams.set('show', value);
		//   setSearchParams(searchParams);
		// } else {
		//   searchParams.delete('show');
		//   setSearchParams(searchParams);
		// }
	};

	// useEffect(() => {
	//   if (!isPreviewOpen){
	//     setShowParam(null);
	//   }
	// }, [isPreviewOpen]);

	/**
	 * Здесь сливаются фильтры от сайдбара и от хедера таблицы
	 * @param {*} filters
	 */
	const handleFilterChange = (filters) => {
		setFilterBox((prev) => {
			const updated = { ...prev }; // копируем старые фильтры

			// Проходим по каждому полю в пришедших фильтрах
			Object.keys(filters).forEach((key) => {
				const value = filters[key];
				// Превращаем пустую строку, null, undefined → в null
				updated[key] = value === '' || value === null || value === undefined ? null : value;
			});

			return updated;
		});
	};

	const triggerMyCompaniesFilterButton = () => {
		let value = filterBox.curator;
		let newValue = null;
		if (!value && userdata?.user?.id) {
			// ✅ Добавлена проверка
			newValue = userdata.user.id;
		}
		setFilterBox((prev) => {
			const updated = { ...prev }; // копируем старые фильтры
			updated.curator = newValue;
			return updated;
		});
		console.log('TRIIGGERED');
	};

	const triggerFreeCompaniesFilterButton = () => {
		let value = filterBox.companies;
		let newValue = null;
		if (!value) {
			newValue = 1;
		}
		setFilterBox((prev) => {
			const updated = { ...prev }; // копируем старые фильтры
			updated.companies = newValue;
			return updated;
		});
	};

	const handleSelectedItemChange = (item_id) => {
		// console.log('item', item_id);
		if (item_id !== previewItem) {
			setPreviewItem(item_id);
		}
	};

	/** Формирует меню кнопки очистки фильтров и сортиров */
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

	useEffect(() => {
		makeFilterMenu();
	}, [filterBox, orderBox]);

	const handleClearAllBoxes = () => {
		setFilterBox({});
		setOrderBox({});
	};

	const handleClearAllFilterBox = () => {
		setFilterBox({});
	};

	const handleClearOrderBox = () => {
		setOrderBox({});
	};

	const handleChangeOnPage = (evt) => {
		console.log(evt);
	};

	const handleOnChangeProcessFilter = (key) => {
		setFilerAwaiter(key);
	};

	// const handleModalTabChange = (tab) => {
	//   updateURL(filterBox,orderBox,currentPage,onPage,previewItem,tab);
	// }

	const handleCreateNewOrg = async () => {
		try {
			const format_data = {
				_token: CSRF_TOKEN,
			};
			let new_bid_response = await PROD_AXIOS_INSTANCE.post('/api/sales/orgcreate', format_data);
			if (new_bid_response) {
				window.open(BASE_ROUTE + '/orgs/' + new_bid_response.data.org_id, '_blank');
			}
		} catch (e) {
			console.log(e);
			if (!PRODMODE) {
				window.open('/orgs/' + targetRowId, '_blank');
			}
		}
		get_orglist_async();
	};

	return (
		<div
			className={`app-page ${openedFilters ? 'sa-filer-opened' : ''}`}
			style={{ paddingTop: '12px' }}
		>
			<Affix offsetTop={-10}>
				<div className={'sa-control-panel sa-flex-space sa-pa-12 sa-org-list-header'}>
					<div className={'sa-header-label-container'}>
						<div className={'sa-flex-space'}>
							<div>
								<h1 className={'sa-header-label-org'} style={{ width: '100% !important' }}>
									Клиенты
								</h1>
							</div>
							<div>
								<CurrencyMonitorBar />
							</div>
						</div>
						<div className={'sa-header-label-container-small'}>
							<div className={'sa-vertical-flex'}>
								<Button.Group>
									<Button
										onClick={() => {
											if (openedFilters) {
												setSKIPPER(1);
											}
											setOpenedFilters(!openedFilters);
										}}
										className={`${
											openedFilters ? 'sa-default-solid-btn-color' : 'sa-default-outlined-btn-color'
										}`}
										color={'default'}
										variant={openedFilters ? 'solid' : 'outlined'}
										icon={<FilterOutlined />}
									>
										Доп Фильтры
									</Button>
									{filterSortClearMenu.length > 0 && (
										<Tooltip title={'Очистить фильтры'} placement={'right'}>
											<Dropdown menu={{ items: filterSortClearMenu }}>
												<Button
													title="Очистить фильтры"
													color={'danger'}
													variant={'solid'}
													icon={filterAwaiter ? <LoadingOutlined /> : <CloseOutlined />}
													onClick={handleClearAllBoxes}
												></Button>
											</Dropdown>
										</Tooltip>
									)}
								</Button.Group>
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
								{userdata?.user?.sales_role === 1 && userdata?.acls?.includes(60) && (
									<Button type={'primary'} icon={<PlusOutlined />} onClick={handleCreateNewOrg}>
										Добавить
									</Button>
								)}

								{/* <RemoteSearchSelect
                    placeholder="Поиск..."
                    fetchOptions={fetchSearchResults}
                    debounceTimeout={500}
                    allowClear
                    style={{ width: '250px', textAlign: 'left' }}
                    onSelect={(value, option) => {
                      console.log('Selected:', value, option);
                    }}
                /> */}
							</div>
						</div>
					</div>
				</div>
			</Affix>

			<Layout className={'sa-layout sa-w-100'}>
				<Sider
					collapsed={!openedFilters}
					collapsedWidth={0}
					width={'300px'}
					style={{ backgroundColor: '#ffffff' }}
				>
					<div className={'sa-sider'}>
						{openedFilters && (
							<OrgListSiderFilter
								base_orgs={orgList}
								filter_presets={filterSortClearMenu}
								companies={companies}
								on_change_filters={handleFilterChange}
								base_filters={baseFiltersData}
								filters_data={filterBox}
								on_change_proc={handleOnChangeProcessFilter}
								open={openedFilters}
							/>
						)}
					</div>
				</Sider>
				<Content>
					<Affix offsetTop={94}>
						<div
							className={'sa-pagination-panel sa-pa-12'}
							style={{ minHeight: '54px' }}
						>
							<div className={'sa-flex-space'}>
								<div className={'sa-flex-gap'}>
									<Pagination
										size={openedFilters ? 'small' : 'middle'}
										defaultPageSize={onPage}
										defaultCurrent={1}
										current={currentPage}
										total={total}
										onChange={(ev, val) => {
											setCurrentPage(ev);
											setOnPage(val);
										}}
										showTotal={false}
										// onShowSizeChange={setOnPage}
										pageSizeOptions={[10, 30, 50, 100]}
										showQuickJumper
										locale={ANTD_PAGINATION_LOCALE}
									/>
									{/* <Button disabled
              size={'small'}
            >Всего {total}</Button> */}
								</div>
								<div></div>
								<div className={'sa-flex-gap'}>
									<Tooltip title="Я временный куратор">
										<Button
											color={'default'}
											size={openedFilters ? 'small' : 'middle'}
											variant={filterBox?.companies === 1 ? 'solid' : 'filled'}
											// onClick={()=>{setShowOnlyCrew(false); setShowOnlyMine(!showOnlyMine)}}
											onClick={triggerFreeCompaniesFilterButton}
										>
											Свободные
										</Button>
									</Tooltip>
									{/* <Tooltip title="Я временный куратор">
              <Button color="default" variant={false ? "solid" : "filled"} 
                  // onClick={()=>{setShowOnlyCrew(false); setShowOnlyMine(!showOnlyMine)}}
              >Временные</Button>
              </Tooltip> */}
									<Tooltip title="Компании с моим кураторством">
										<Button
											color={'default'}
											variant={filterBox?.curator === userdata?.user?.id ? 'solid' : 'filled'}
											onClick={triggerMyCompaniesFilterButton}
											size={openedFilters ? 'small' : 'middle'}
											// onClick={()=>{setShowOnlyCrew(false); setShowOnlyMine(!showOnlyMine)}}
										>
											Мои компании
										</Button>
									</Tooltip>
								</div>
							</div>
						</div>
					</Affix>

					<div className={`${openedFilters ? 'sa-pa-tb-12 sa-pa-s-3' : 'sa-pa-12'}`}>
						<Spin spinning={showLoader} delay={500}>
							<OrgListTable
								companies={companies}
								base_companies={baseCompanies}
								base_orgs={orgList}
								on_preview_open={handlePreviewOpen}
								on_set_sort_orders={setOrderBox}
								// userdata={userdata}
								on_change_filters={handleFilterChange}
								base_filters={filterBox}
								base_orders={orderBox}
								curator_list={selectCuratorList}
								selected_item={previewItem}
								on_select_change={handleSelectedItemChange}
								on_change_proc={handleOnChangeProcessFilter}
							/>
						</Spin>

						{/* {baseOrgs.length > 20 && (
            <div className={'sa-pagination-panel sa-pa-12'}>
              <div className={'sa-flex-space'}>
              <div className={'sa-flex-gap'}>
              <Pagination />
              <Button disabled>Всего {total}</Button>
              </div>
              <div>

              </div>
              <div>
                <Button type={'primary'} icon={<PlusOutlined/>}>Добавить</Button>
              </div>
              </div>
            </div>
          )} */}
						<div className={'sa-space-panel sa-pa-12'}></div>
					</div>
				</Content>
			</Layout>
			<OrgListPreviewModal
				is_open={isPreviewOpen}
				current_tab={currentTab}
				data={{ id: previewItem }}
				// name={orgList?.find((item) => item.id === previewItem)?.name}
				on_close={() => {
					setIsPreviewOpen(false);
					setPreviewItem(null);
				}}
				selects_data={baseFiltersData}
				on_change_tab={(tab) => {
					setCurrentTab(tab);
				}}
			/>
		</div>
	);
};

export default OrgListPage;
