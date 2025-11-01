import React, {useCallback, useEffect, useRef, useState} from 'react';
import './components/style/bidlistpage.css';
import {CSRF_TOKEN, PRODMODE} from '../../config/config';
import {NavLink, useParams, useSearchParams} from 'react-router-dom';
import {Affix, Alert, Button, Dropdown, Layout, Pagination, Select, Space, Spin, Tag, Tooltip,} from 'antd';
import {Content} from 'antd/es/layout/layout';
import Sider from 'antd/es/layout/Sider';
import {CaretLeftFilled, CloseOutlined, FilterOutlined} from '@ant-design/icons';
import CurrencyMonitorBar from '../../components/template/CURRENCYMONITOR/CurrencyMonitorBar';
import BidListTable from './components/BidListTable';
import BidListSiderFilters from './components/BidListSiderFilters';
import {PROD_AXIOS_INSTANCE} from '../../config/Api';
import {BID_LIST, FILTERS} from './mock/mock';
import dayjs from 'dayjs';
import {useWebSocketSubscription} from "../../hooks/websockets/useWebSocketSubscription";
import {useWebSocket} from "../../context/ResalesWebSocketContext";

const BidListPage = (props) => {
	const { userdata } = props;
    const { connected, emit } = useWebSocket();

	const [searchParams, setSearchParams] = useSearchParams();

	const [isAlertVisible, setIsAlertVisible] = useState(false);
	const [alertMessage, setAlertMessage] = useState('');
	const [alertDescription, setAlertDescription] = useState('');
	const [alertType, setAlertType] = useState('');

	const [isMounted, setIsMounted] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isOpenedFilters, setIsOpenedFilters] = useState(false);
	const [isHasRole, setIsHasRole] = useState(false);
	const [isOneRole, setIsOneRole] = useState(true);

	const [fromPage, setFromPage] = useState(searchParams.get('frompage') || null);
	const [fromView, setFromView] = useState(searchParams.get('fromview') || null);
	const [fromTab, setFromTab] = useState(searchParams.get('fromtab') || null);
	const [fromId, setFromId] = useState(parseInt(searchParams.get('fromid')) || null);

	const [fromOrgId, setFromOrgId] = useState(0);

	/* в шапке таблицы */
	const [filterStep, setFilterStep] = useState([]);
	const [filterProtectionProject, setFilterProtectionProject] = useState([]);
	const [filterBidType, setFilterBidType] = useState([]);
	/* в фильтрах sider */
	const [filterPaySelect, setFilterPaySelect] = useState([]);
	const [filterAdminAcceptSelect, setFilterAdminAcceptSelect] = useState([]);
	const [filterPackageSelect, setFilterPackageSelect] = useState([]);
	const [filterPriceSelect, setFilterPriceSelect] = useState([]);
	const [filterBidCurrencySelect, setFilterBidCurrencySelect] = useState([]);
	const [filterNdsSelect, setFilterNdsSelect] = useState([]);
	const [filterCompleteSelect, setFilterCompleteSelect] = useState([]);
	const [filterManagersSelect, setFilterManagersSelect] = useState([]);
	const [filterCompaniesSelect, setFilterCompaniesSelect] = useState([]);

	const [filterSortClearMenu, setFilterSortClearMenu] = useState([]);

	const [total, setTotal] = useState(0);
	const [onPage, setOnPage] = useState(parseInt(searchParams.get('onPage')) || 30);
	const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('currentPage')) || 1);

	const [bids, setBids] = useState([]);

	const [myBids, setMyBids] = useState(false);

	const initialFilterBox = {
		/* header */
		bid_id: null,
		company_name: null,
		type: null,
		protect_status: null,
		stage_status: null,
		dates: null,
		manager: null,
		bill_number: null,
		comment: null,
		object_name: null,
		/* sider */
		target_company: null,
		pay_status: null,
		admin_accept: null,
		package: null,
		price: null,
		bid_currency: null,
		nds: null,
		complete: null,
	};
	const [filterBox, setFilterBox] = useState({
		/* header */
		bid_id: searchParams.get('bid_id') || null,
		company_name: searchParams.get('company_name') || null,
		type: parseInt(searchParams.get('type')) || null,
		protect_status: parseInt(searchParams.get('protect_status')) || null,
		stage_status: parseInt(searchParams.get('stage_status')) || null,
		dates: searchParams.get('dates') || null,
		manager: parseInt(searchParams.get('manager')) || null,
		bill_number: searchParams.get('bill_number') || null,
		comment: searchParams.get('comment') || null,
		object_name: searchParams.get('object_name') || null,
		/* sider */
		target_company: parseInt(searchParams.get('target_company')) || null,
		pay_status: parseInt(searchParams.get('pay_status')) || null,
		admin_accept: parseInt(searchParams.get('admin_accept')) || null,
		package: parseInt(searchParams.get('package')) || null,
		price: parseInt(searchParams.get('price')) || null,
		bid_currency: parseInt(searchParams.get('bid_currency')) || null,
		nds: parseInt(searchParams.get('nds')) || null,
		complete: parseInt(searchParams.get('complete')) || null,
	});
	const parseArraySort = (stringOfSorts) => {
		const arr = [];
		stringOfSorts.split(' ').forEach((item) => {
			if (item) {
				let a = item.split('-');
				arr.push({ key: a[0], order: a[1] });
			}
		});
		return arr;
	};
	const [orderBox, setOrderBox] = useState([]);

	const [sortOrders, setSortOrders] = useState([]);

	const [userInfo, setUserInfo] = useState(null);
	const [activeRole, setActiveRole] = useState(0);
	const [roles, setRoles] = useState([
		{
			value: 1,
			label: 'Менеджер',
			acl: 89,
		},
		{
			value: 2,
			label: 'Администратор',
			acl: 90,
		},
		{
			value: 3,
			label: 'Бухгалтер',
			acl: 91,
		},
	]);

	const [baseCompanies, setBaseCompanies] = useState([]);
	const [companies, setCompanies] = useState([]);
	const { item_id } = useParams();
	const [isPreviewOpen, setIsPreviewOpen] = useState(false);
	const [previewItem, setPreviewItem] = useState(null);
	const showGetItem = null; //searchParams.get('show');



    useEffect(() => {
        console.log(bids)
    }, [bids]);
    const [highlightData, setHighlightData] = useState(null);
    const highlightDataRef = useRef();
    highlightDataRef.current = highlightData;
    const setHighlightBids = useCallback((data) => {
        const activeUsers = data?.activeUsers || [];
        const bidsWithUsers = activeUsers.reduce((acc, item) => {
            if (!acc[item.bidId]) {
                acc[item.bidId] = {
                    bidId: item.bidId,
                    users: []
                };
            }
            if (!acc[item.bidId].users.find(user => user.userId === item.userId)) {
                acc[item.bidId].users.push({
                    userId: item.userId,
                    userFIO: item.userFIO
                });
            }
            return acc;
        }, {});

        setHighlightData(bidsWithUsers);
    }, []);
    const setBidsWithHighlight = useCallback((newBids) => {
        if (highlightDataRef.current) {
            // Если есть данные подсветки - применяем их
            const highlightedBids = newBids.map(bid => {
                const bidHighlightInfo = highlightDataRef.current[bid.id];
                if (bidHighlightInfo) {
                    return {
                        ...bid,
                        highlight: true,
                        editor: bidHighlightInfo.users.map(user => user.userFIO).join(', '),
                        userCount: bidHighlightInfo.users.length
                    }
                }
                return bid;
            });
            setBids(highlightedBids);
        } else {
            // Если данных подсветки еще нет - просто устанавливаем заявки
            setBids(newBids);
        }
    }, [highlightDataRef.current]);
    const handleHighlightBid = useCallback((data) => {
        console.log('HIGHLIGHT_BID', data);
        setBids(prev => {
            return prev.map(bid => {
                if (+bid.id === +data.bidId) {
                    return {
                        ...bid,
                        highlight: true,
                        editor: data.userFIO,
                    }
                } else return bid;
            });
        });
    }, []);
    const handleUnHighlightBid = useCallback((data) => {
        console.log('UNHIGHLIGHT_BID', data);
        setBids(prev => {
            return prev.map(bid => {
                if (+bid.id === +data.bidId) {
                    return {
                        ...bid,
                        highlight: false,
                        editor: null,
                    }
                } else return bid;
            });
        });
    }, []);
    const refreshPage = useCallback((data) => {
        fetchBids().then();
    }, []);

    useWebSocketSubscription('ACTIVE_HIGHLIGHTS_LIST', setHighlightBids);
    useWebSocketSubscription('HIGHLIGHT_BID', handleHighlightBid);
    useWebSocketSubscription('UNHIGHLIGHT_BID', handleUnHighlightBid);
    useWebSocketSubscription('refresh_page', refreshPage);

	useEffect(() => {
		fetchInfo().then();
		if (showGetItem !== null) {
			handlePreviewOpen(showGetItem);
			setTimeout(() => {}, 2200);
		}
		setIsMounted(true);
		if (searchParams.get('sort')) {
			setOrderBox(parseArraySort(searchParams.get('sort')));
		}

		handleSearchParamsChange('currentPage', currentPage);
		handleSearchParamsChange('onPage', onPage);
	}, []);
	useEffect(() => {
		if (isMounted && currentPage && onPage && filterBox && orderBox) {
			const timer = setTimeout(() => {
				setIsLoading(true);
				fetchBids().then(() => {
					setIsLoading(false);
				});
			}, 200);

			return () => clearTimeout(timer);
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
		if (userdata !== null && userdata.user && userdata.user.sales_role) {
			setUserInfo(userdata.user);
			setActiveRole(userdata.user.sales_role);
		}
	}, [userdata]);
    useEffect(() => {
        console.log('CONNECTED bidList', connected)
        if (connected) {
            emit('SUBSCRIBE_BID_ACTIVITY', userdata?.user?.id);
            return () => emit('UNSUBSCRIBE_BID_ACTIVITY', userdata?.user?.id);
        }
    }, [connected]);
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
		}
	}, [isPreviewOpen]);
	useEffect(() => {
		makeFilterMenu();
	}, [filterBox, orderBox]);
	useEffect(() => {
		if (filterBox.manager && userInfo && +filterBox.manager === +userInfo.id) {
			setMyBids(true);
		} else {
			setTimeout(() => {
				setMyBids(false);
			}, 500);
		}
	}, [filterBox]);
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
		setIsLoading(false);
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
					setFilterStep(filters.step);
					setFilterProtectionProject(filters.protection_project);
					setFilterBidType(filters.type_select);
					setFilterPaySelect(filters.pay_select);
					setFilterAdminAcceptSelect(filters.admin_accept_select);
					setFilterPackageSelect(filters.package_select);
					setFilterPriceSelect(filters.price_select);
					setFilterBidCurrencySelect(filters.bid_currency_select);
					setFilterNdsSelect(filters.nds_select);
					setFilterCompleteSelect(filters.complete_select);
					setFilterManagersSelect(filters.managers);
					setFilterCompaniesSelect(filters.companies);
				}
			} catch (e) {
				console.log(e);
				setIsAlertVisible(true);
				setAlertMessage(`Произошла ошибка! ${path}`);
				setAlertDescription(e.response?.data?.message || e.message || 'Неизвестная ошибка');
				setAlertType('error');
			}
		} else {
			setFilterStep(FILTERS.step);
			setFilterProtectionProject(FILTERS.protection_project);
			setFilterBidType(FILTERS.type_select);
			setFilterPaySelect(FILTERS.pay_select);
			setFilterAdminAcceptSelect(FILTERS.admin_accept_select);
			setFilterPackageSelect(FILTERS.package_select);
			setFilterPriceSelect(FILTERS.price_select);
			setFilterBidCurrencySelect(FILTERS.bid_currency_select);
			setFilterNdsSelect(FILTERS.nds_select);
			setFilterCompleteSelect(FILTERS.complete_select);
			setFilterManagersSelect(FILTERS.managers_select);
			setFilterCompaniesSelect(FILTERS.companies);
		}
	};
	const fetchBids = async () => {
		if (PRODMODE) {
			let dates = null;
			if (filterBox.dates) {
				const dateObj = dayjs.unix(filterBox.dates);
				dates = [dateObj.startOf('day').unix() * 1000, dateObj.endOf('day').unix() * 1000];
			}
			const data = {
				/* header */
				bid_id: filterBox.bid_id,
				company_name: filterBox.company_name,
				type: filterBox.type,
				protect_status: filterBox.protect_status,
				stage_status: filterBox.stage_status,
				dates: dates,
				manager: filterBox.manager,
				bill_number: filterBox.bill_number,
				comment: filterBox.comment,
				object_name: filterBox.object_name,
				/* sider */
				target_company: filterBox.target_company,
				pay_status: filterBox.pay_status,
				admin_accept: filterBox.admin_accept,
				package: filterBox.package,
				price: filterBox.price,
				bid_currency: filterBox.bid_currency,
				nds: filterBox.nds,
				complete_status: filterBox.complete,

				to: 0,
				page: currentPage,
				limit: onPage,
				sort_orders: prepareOrderBox(orderBox),
			};
			console.log(data);
			const path = `/sales/data/offerlist`;
			try {
				let response = await PROD_AXIOS_INSTANCE.post(path, {
					data,
					_token: CSRF_TOKEN,
				});
                setBidsWithHighlight(response.data.bid_list)
                //setBids(response.data.bid_list);
				setTotal(response.data.total_count);

				let max = onPage * currentPage - (onPage - 1);
				if (response.data.total_count < max) {
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
			setBids(BID_LIST);
			setTotal(33000);
		}
	};
	const fetchChangeRole = async (sales_role) => {
		if (PRODMODE) {
			const path = `/auth/me`;
			try {
				let response = await PROD_AXIOS_INSTANCE.post(path, {
					place: sales_role,
					_token: CSRF_TOKEN,
				});
				console.log('response', response);
				if (response.data) {
					if (props.changed_user_data) {
						props.changed_user_data(response.data);
					}
				}
			} catch (e) {
				console.log(e);
				setIsAlertVisible(true);
				setAlertMessage(`Произошла ошибка! ${path}`);
				setAlertDescription(e.response?.data?.message || e.message || 'Неизвестная ошибка');
				setAlertType('error');
			}
		}
	};

	const prepareOrderBox = (orders) => {
		if (!Array.isArray(orders)) {
			return [];
		}

		return orders.map((order) => {
			if (order.order === 1) {
				return { ...order, order: 'ASC' };
			} else if (order.order === 2) {
				return { ...order, order: 'DESC' };
			} else {
				return order;
			}
		});
	};
	const handleActivateSorter = (key, order) => {
		if (order === 0) {
			setSortOrders([]);
		} else {
			setSortOrders([{ key: key, order: order }]);
		}
	};
	const handlePreviewOpen = (item, state) => {
		console.log('HELLO', item);
		setPreviewItem(item);
		setIsPreviewOpen(true);
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
	const handleUpdateFilterBoxHeader = (newFilterBox) => {
		const filterBoxUpd = JSON.parse(JSON.stringify(filterBox));

		if (filterBox.bid_id !== newFilterBox.bid_id) {
			filterBoxUpd.bid_id = newFilterBox.bid_id;
			handleSearchParamsChange('bid_id', newFilterBox.bid_id);
		}
		if (filterBox.company_name !== newFilterBox.company_name) {
			filterBoxUpd.company_name = newFilterBox.company_name;
			handleSearchParamsChange('company_name', newFilterBox.company_name);
		}
		if (filterBox.type !== newFilterBox.type) {
			filterBoxUpd.type = newFilterBox.type;
			handleSearchParamsChange('type', newFilterBox.type);
		}
		if (filterBox.protect_status !== newFilterBox.protect_status) {
			filterBoxUpd.protect_status = newFilterBox.protect_status;
			handleSearchParamsChange('protect_status', newFilterBox.protect_status);
		}
		if (filterBox.stage_status !== newFilterBox.stage_status) {
			filterBoxUpd.stage_status = newFilterBox.stage_status;
			handleSearchParamsChange('stage_status', newFilterBox.stage_status);
		}
		if (filterBox.dates !== newFilterBox.dates) {
			filterBoxUpd.dates = newFilterBox.dates;
			handleSearchParamsChange('dates', newFilterBox.dates);
		}
		if (filterBox.manager !== newFilterBox.manager) {
			filterBoxUpd.manager = newFilterBox.manager;
			handleSearchParamsChange('manager', newFilterBox.manager);
		}
		if (filterBox.bill_number !== newFilterBox.bill_number) {
			filterBoxUpd.bill_number = newFilterBox.bill_number;
			handleSearchParamsChange('bill_number', newFilterBox.bill_number);
		}
		if (filterBox.comment !== newFilterBox.comment) {
			filterBoxUpd.comment = newFilterBox.comment;
			handleSearchParamsChange('comment', newFilterBox.comment);
		}
		if (filterBox.object_name !== newFilterBox.object_name) {
			filterBoxUpd.object_name = newFilterBox.object_name;
			handleSearchParamsChange('object_name', newFilterBox.object_name);
		}
		console.log(areObjectsEqual(filterBox, filterBoxUpd));
		console.log(searchParams);
		if (!areObjectsEqual(filterBox, filterBoxUpd)) {
			setFilterBox(filterBoxUpd);
		}
	};
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
	const arraysEqualIgnore = (arr1, arr2) => {
		if (arr1.length !== arr2.length) {
			return false;
		}

		// Создаем копии и сортируем по key для consistent comparison
		const sorted1 = [...arr1].sort((a, b) => a.key - b.key);
		const sorted2 = [...arr2].sort((a, b) => a.key - b.key);

		// Сравниваем каждый объект
		for (let i = 0; i < sorted1.length; i++) {
			if (sorted1[i].key !== sorted2[i].key || sorted1[i].order !== sorted2[i].order) {
				return false;
			}
		}

		return true;
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
	const handleUpdateOrderBox = (newOrderBox) => {
		if (!arraysEqualIgnore(orderBox, newOrderBox)) {
			setOrderBox(newOrderBox);
			handleSearchParamsSortChange(newOrderBox);
		}
	};
	const handleClearAllFilterBox = () => {
		setFilterBox(initialFilterBox);
		setTimeout(() => handleSearchParamsZeroing(initialFilterBox), 1000);
	};
	const handleClearOrderBox = () => {
		setOrderBox([]);
		handleSearchParamsSortChange([]);
	};
	const handleClearAllBoxes = () => {
		handleClearAllFilterBox();
		handleClearOrderBox();
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

			/*const arr = [
          "bid_id", "company_name", "type", "protect_status",
          "stage_status", "dates", "manager", "bill_number", "comment",
          "object_name", "target_company", "pay_status", "admin_accept", "package", "price", "bid_currency",
          "nds", "complete"
      ];
      arr.forEach(key => {
        newParams.delete(key);
      });*/
			setTimeout(() => console.log(newParams), 1000);

			return newParams;
		});
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
	const handleSearchParamsSortChange = (sortBoxArray) => {
		setSearchParams((prevParams) => {
			const newParams = new URLSearchParams(prevParams);
			if (sortBoxArray && sortBoxArray.length > 0) {
				let sortUpd = '';
				sortBoxArray.forEach((sort) => {
					console.log(sort.order);
					sortUpd += `${sort.key}-${sort.order}` + ` `;
				});
				newParams.set('sort', sortUpd);
				console.log(sortUpd);
			} else {
				newParams.delete('sort');
			}
			return newParams;
		});
	};
	const handleRerenderPage = () => {
		fetchBids().then();
	};
	const backUrl = () => {
		return (
			`/${fromPage}` +
			(fromView === 'modal' ? `?show=${fromId}&` : fromView === 'full' ? `/${fromId}?` : '') +
			`tab=${fromTab}`
		);
	};

	return (
		<div className={`app-page sa-app-page ${isOpenedFilters ? 'sa-filer-opened' : ''}`}>
			<Affix>
				<div style={{ padding: '0', backgroundColor: '#b4c9e1' }}>
					<div className={'sa-control-panel sa-flex-space sa-pa-12 sa-list-header'}>
						<div className={'sa-header-label-container'}>
							<div className={'sa-header-label-container-small'}>
								<h1 className={'sa-header-label'}>Список заявок</h1>
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
									{activeRole > 0 && (
										<div>
											{isOneRole ? (
												<div
													style={{
														display: 'flex',
														alignItems: 'center',
														gap: '5px',
														justifyContent: 'end',
													}}
												>
													Роль:
													<Tag
														className={`
                                    sa-tag-custom
                                    ${activeRole === 1 ? 'sa-select-custom-manager' : ''}
                                    ${activeRole === 2 ? 'sa-select-custom-admin' : ''}
                                    ${activeRole === 3 ? 'sa-select-custom-bugh' : ''}
                                  `}
													>
														{roles.find((role) => role.value === activeRole)?.label ||
															'Неизвестная роль'}
													</Tag>
												</div>
											) : (
												<div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
													Роль:
													<Select
														className={`
                                        ${activeRole === 1 ? 'sa-select-custom-manager' : ''}
                                        ${activeRole === 2 ? 'sa-select-custom-admin' : ''}
                                        ${activeRole === 3 ? 'sa-select-custom-bugh' : ''}
                                      `}
														style={{ width: '150px', marginRight: '8px' }}
														options={roles.filter((role) => userdata.acls.includes(role.acl))}
														value={activeRole}
														onChange={fetchChangeRole}
													/>
												</div>
											)}
										</div>
									)}
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
							<BidListSiderFilters
								filter_pay_select={prepareSelectOptions(filterPaySelect)}
								filter_admin_accept_select={prepareSelectOptions(filterAdminAcceptSelect)}
								filter_package_select={prepareSelectOptions(filterPackageSelect)}
								filter_price_select={prepareSelectOptions(filterPriceSelect)}
								filter_bid_currency_select={prepareSelectOptions(filterBidCurrencySelect)}
								filter_nds_select={prepareSelectOptions(filterNdsSelect)}
								filter_complete_select={prepareSelectOptions(filterCompleteSelect)}
								filter_companies_select={prepareSelectOptions(filterCompaniesSelect)}
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
									{fromId && (
										<NavLink to={backUrl()}>
											<Button type={'default'} icon={<CaretLeftFilled />}>
												Назад в компанию
											</Button>
										</NavLink>
									)}
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
									<Tooltip placement="bottom" title="Заявки созданные Вами">
										<Button
											color="default"
											variant={myBids ? 'solid' : 'filled'}
											onClick={() => {
												setMyBids(!myBids);
											}}
										>
											Мои заявки
										</Button>
									</Tooltip>
								</div>
							</div>
						</div>
					</Affix>

					<div
						className={`${isOpenedFilters ? 'sa-pa-tb-12 sa-pa-s-3' : 'sa-pa-12'} sa-table`}
						style={{ paddingTop: 0 }}
					>
						<Spin spinning={isLoading}>
							<BidListTable
								companies={companies}
								bids={bids}
								filter_steps={prepareSelectOptions(filterStep)}
								filter_protection_projects={prepareSelectOptions(filterProtectionProject)}
								filter_bid_types={prepareSelectOptions(filterBidType)}
								filter_managers={prepareSelectOptions(filterManagersSelect)}
								user_info={userInfo}
								my_bids={myBids}
								filter_box={filterBox}
								order_box={orderBox}
								on_change_filter_box={handleUpdateFilterBoxHeader}
								on_preview_open={handlePreviewOpen}
								on_set_sort_orders={handleUpdateOrderBox}
								base_companies={filterCompaniesSelect}
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

export default BidListPage;
