import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { CSRF_TOKEN, PRODMODE } from '../../config/config';
import {
	useLocation,
	useNavigate,
	useParams,
	useSearchParams,
} from 'react-router-dom';
import { Affix, Alert, Button, DatePicker, Input, Layout, Pagination, Select, Tag, Tooltip } from 'antd';
import { formLogger, LOG_ACTIONS } from '../../components/helpers/FormLogger';

import {  CircleStackIcon, ExclamationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import {
	ArrowSmallLeftIcon,
	ClipboardDocumentCheckIcon,
	PencilIcon,
	XMarkIcon,
} from '@heroicons/react/24/outline';
import { CloseOutlined, ExclamationOutlined, FlagFilled, FlagOutlined, LoadingOutlined } from '@ant-design/icons';

import './components/style/torgpage.css';
import '../ORG_LIST/components/style/orgmodal.css';


import OrgListModalBillsTab from '../ORG_LIST/components/OrgModal/Tabs/OrgListModalBillsTab';
import OrgListModalOffersTab from '../ORG_LIST/components/OrgModal/Tabs/OrgListModalOffersTab';
import OrgListModalHistoryTab from '../ORG_LIST/components/OrgModal/Tabs/OrgListModalHistoryTab';
import { PROD_AXIOS_INSTANCE } from '../../config/Api';
import { useURLParams } from '../../components/helpers/UriHelpers';
import { ORGLIST_MODAL_MOCK_MAINTAB } from '../ORG_LIST/components/mock/ORGLISTMODALMOCK';
import { MODAL_NOTES_LIST } from '../ORG_LIST/components/mock/MODALNOTESTABMOCK';
import { MODAL_CALLS_LIST } from '../ORG_LIST/components/mock/MODALCALLSTABMOCK';
import { OM_ORG_FILTERDATA } from '../ORG_LIST/components/mock/ORGLISTMOCK';
import { DEPARTAMENTS_MOCK } from './components/mock/ORGPAGEMOCK';
import CustomModal from '../../components/helpers/modals/CustomModal';
import { FlushOrgData, IsSameComparedSomeOrgData, MAIN_ORG_DATA_IGNORE_KEYS } from './components/handlers/OrgPageDataHandler';
import TabNotesTorg from './components/tabs/TabNotesTorg';
import TabProjectsTorg from './components/tabs/TabProjectsTorg';
import TabCallsTorg from './components/tabs/TabCallsTorg';
import TabMainTorg from './components/tabs/TabMainTorg';

import {useWebSocket} from "../../context/ResalesWebSocketContext";
import {useWebSocketSubscription} from "../../hooks/websockets/useWebSocketSubscription";
import dayjs from 'dayjs';

const tabNames = [
	{
		link: 'm',
		name: 'Основная информация',
	},
	{ link: 'b', name: 'Счета' },
	{ link: 'o', name: 'КП' },
	{ link: 'p', name: 'Проекты' },
	{ link: 'c', name: 'Встречи/Звонки' },
	{ link: 'n', name: 'Заметки' },
	{ link: 'h', name: 'История' },
];

const TorgPage = (props) => {

	
	const { userdata } = props;
		// 1. Настройка глубины (по умолчанию 30 дней)
	formLogger.setMaxAgeDays(30);
	formLogger.setUser(userdata.user.id, `${userdata.user.surname} ${userdata.user.name}`, userdata.user.active_role);


	const { getCurrentParamsString } = useURLParams();
	const [departList, setDepartList] = useState(null);

	//   const [openResponsive, setOpenResponsive] = useState(false);
	const [searchParams, setSearchParams] = useSearchParams();
	const navigate = useNavigate();

	const [isSmthChanged, setIsSmthChanged] = useState(false);

	const { item_id } = useParams();

	const [BLOCK_DELAY, setBlockDelay] = useState(null);
	const [BLOCK_SAVE, setBlockSave] = useState(false);

	// m - main
	// b - bills
	// o - offers
	// p - projects
	// c - calls
	// n - notes
	// h - history
	const [activeTab, setActiveTab] = useState('m');
	const [prevTab, setPrevTab]     = useState('m');

	const [pageProject, setPageProject] = useState(1);
	const [pageNotes, setPageNotes] = useState(1);
	const [pageCalls, setPageCalls] = useState(1);

	const [baseCompanies, setBaseCompanies] = useState([]);
	const location = useLocation();
	const [editMode, setEditMode] = useState(false);
	// const [companies, setCompanies] = useState([]);

	const [itemId, setItemId] = useState(item_id ? parseInt(item_id) : 'new');

	const [backeReturnPath, setBackeReturnPath] = useState(null);

	// /** Пачка данных компании, но не все данные */
	// const [baseOrgData, setBaseOrgDate] = useState(null);

	const [COLLECTOR, setCOLLECTOR] = useState({});

	const [baseMainData, setBaseMainData] = useState(null);
	// const [baseProjectsData, setBaseProjectsData] = useState(null);
	const [baseCallsData, setBaseCallsData] = useState(null);
	const [baseNotesData, setBaseNotesData] = useState(null);

	// Контейнеры, куда сохраняются данные из вкладок при нажатии кнопки сохранить
	// Далее дебаунс вызывает фильтрацию данных и отправку на сервер
	const [tempMainData, setTempMainData] = useState(null);
	const [tempProjectsData, setTempProjectsData] = useState([]);
	const [tempCallsData, setTempCallsData] = useState([]);
	const [tempNotesData, setTempNotesData] = useState([]);

	const [tempMain_contacts, setTempMain_contacts] = useState([]);
	const [tempMain_phones, setTempMain_phones] = useState([]);
	const [tempMain_addresses, setTempMain_addresses] = useState([]);
	const [tempMain_legalAddresses, setTempMain_legalAddresses] = useState([]);
	const [tempMain_emails, setTempMain_emails] = useState([]);
	const [tempMain_bo_licenses, setTempMain_bo_licenses] = useState([]);
	const [tempMain_an_licenses, setTempMain_an_licenses] = useState([]);
	const [tempMain_an_tolerances, setTempMain_an_tolerances] = useState([]);
	const [tempMain_an_requisites, setTempMain_an_requisites] = useState([]);


const tempMainDataRef = useRef(null);
const tempProjectsDataRef = useRef(tempProjectsData);
const tempCallsDataRef = useRef(tempCallsData);
const tempNotesDataRef = useRef(tempNotesData);

const tempMain_contactsRef = useRef(tempMain_contacts);
const tempMain_phonesRef = useRef(tempMain_phones);
const tempMain_addressesRef = useRef(tempMain_addresses);
const tempMain_legalAddressesRef = useRef(tempMain_legalAddresses);
const tempMain_emailsRef = useRef(tempMain_emails);
const tempMain_bo_licensesRef = useRef(tempMain_bo_licenses);
const tempMain_an_licensesRef = useRef(tempMain_an_licenses);
const tempMain_an_tolerancesRef = useRef(tempMain_an_tolerances);
const tempMain_an_requisitesRef = useRef(tempMain_an_requisites);

const [viewersBySocket, setViewersBySocket] = useState([]);
const [lockBySocket, setLockBySocket] = useState(false);
const [lockUser, setLockUser] = useState(null);
const { connected, emit } = useWebSocket();
const [socketBusyOrglist, setsocketBusyOrglist] = useState([
		/*{org_id: 14, user_id: 17, username: "Комаров Вениамин Столович", action: 'edit'},*/
	]);

const [curatorRequestSent, setCuratorRequestSent] = useState(false);

const [orgName, setOrgName] = useState('');

	// /*const [socketBusyOrgIds, setSocketBusyOrgIds] = useState([14, 16, 22, 40]);*/
		//
		useWebSocketSubscription('ACTIVE_HIGHLIGHTS_LIST_ORGS', ({ activeUsers }) => setsocketBusyOrglist(prev => {
				return activeUsers.map((usr) => {
						return {
								org_id: usr.orgId,
								user_id: usr.userId,
								username: usr.userFIO,
								action: usr.action,
						}
				});
		}));


		useEffect(() => {
			formLogger.setComId(item_id);
			formLogger.log('PAGE_OPEN', { id: item_id });
		}, []);

		// Подписываюсь на открытие орпейджа
		useEffect(() => {
				console.log('CONNECTED orgPage', connected)
				if (connected) {
						emit('HIGHLIGHT_ORG', {
								orgId: itemId,
								userId: userdata?.user?.id,
								userFIO: `${userdata?.user?.surname} ${userdata?.user?.name} ${userdata?.user?.secondname}`,
								action: editMode ? 'edit' : 'observe'
						});

						return () => emit('UNHIGHLIGHT_ORG', {
								orgId: itemId,
								userId: userdata?.user?.id,
						});
				}
		}, [connected]);

		// подписка на активность оргс, чтобы отслеживать состояния
		useEffect(() => {
						if (connected && userdata.user.id) {
								emit('SUBSCRIBE_ORG_ACTIVITY', userdata?.user?.id);
								return () => emit('UNSUBSCRIBE_ORG_ACTIVITY', userdata?.user?.id);
						}
				}, [connected, userdata?.user?.id]);
		

		useEffect(() => {
				if (!itemId) return;
				emit('HIGHLIGHT_ORG', {
						orgId: itemId,
						userId: userdata?.user?.id,
						userFIO: `${userdata?.user?.surname} ${userdata?.user?.name} ${userdata?.user?.secondname}`,
						action: editMode ? 'edit' : 'observe'
				});
		}, [editMode]);


		useEffect(() => {
			if (editMode){ return; }
			let coms = socketBusyOrglist.filter((item)=> item.org_id === itemId);
			if (coms.length === 0){
				if (lockBySocket){
					// If was not edit mode
					refreshPage();
					setLockBySocket(false);
				}
			} else {
				let edor  = coms.find((item)=> item.action === 'edit');
				if (edor){
					if (!lockBySocket){
						setLockUser(edor);
						setLockBySocket(true);
					}
				} else {
					if (lockBySocket){
						setLockUser(null);
						setLockBySocket(false);
						refreshPage();
					}
				}

				setViewersBySocket(coms.filter((item)=> item.action === 'explore'));
			}
		}, [socketBusyOrglist]);


		const refreshPage = () => {
			let lid  = itemId;
					setItemId(0);
					setTimeout(() => {
						setItemId(lid);
					}, 950);
					setTimeout(() => {
						
						get_main_data_action(lid);
					}, 350);
		}

useEffect(() => {
  tempMainDataRef.current = tempMainData;
  tempProjectsDataRef.current = tempProjectsData;
  tempCallsDataRef.current = tempCallsData;
  tempNotesDataRef.current = tempNotesData;

  tempMain_contactsRef.current = tempMain_contacts;
  tempMain_phonesRef.current = tempMain_phones;
  tempMain_addressesRef.current = tempMain_addresses;
  tempMain_legalAddressesRef.current = tempMain_legalAddresses;
  tempMain_emailsRef.current = tempMain_emails;
  tempMain_bo_licensesRef.current   = tempMain_bo_licenses;
  tempMain_an_licensesRef.current   = tempMain_an_licenses;
  tempMain_an_tolerancesRef.current = tempMain_an_tolerances;
  tempMain_an_requisitesRef.current = tempMain_an_requisites;
}, [
  tempMainData,
  tempProjectsData,
  tempCallsData,
  tempNotesData,
  tempMain_contacts,
  tempMain_phones,
  tempMain_addresses,
  tempMain_legalAddresses,
  tempMain_emails,
  tempMain_bo_licenses,
  tempMain_an_licenses,
  tempMain_an_tolerances,
  tempMain_an_requisites,

]);



	// При нажатии кнопочки сохранить - сюда вставляется Timestamp, слушатели в компонентах видят изменение, отправляею данные в сохранятор
	const [callToSaveAction, setCallToSaveAction] = useState(null);
	const [blockOnSave, setBlockOnSave] = useState(false);
	const [loading, setLoading] = useState(false);

	const [saveProcess, setSaveProcess] = useState(0);

	const [baseFiltersData, setBaseFilterstData] = useState(null);



	const [isOpenCustomModal,  setIsOpenCustomModal]  = useState(false);
	const [customModalTitle,   setCustomModalTitle]   = useState('Некоторые данные не сохранены. Выйти из режима редактирования и отменить изменения?');
	const [customModalText,    setCustomModalText]    = useState('');
	const [customModalType,    setCustomModalType]    = useState('');
	const [customModalColumns, setCustomModalColumns] = useState([
		{
			id: 1,
			text: "Отменить все изменения",
			color: "danger",
			variant: "outlined"
		},
		{
			id: 2,
			text: "Остаться в редакторе",
			color: "primary",
			variant: "outlined"
		},

	]);


	const [isAlertVisible, setIsAlertVisible] = useState(false);
	const [alertMessage, setAlertMessage] = useState('');
	const [alertDescription, setAlertDescription] = useState('');
	const [alertType, setAlertType] = useState('');


	useEffect(() => {
		if (!editMode) return;

		let collect = {};

		collect.main = tempMainData;
		collect.contacts = tempMain_contacts;
		collect.org_phones = tempMain_phones;
		collect.org_emails = tempMain_emails;
		collect.org_addresses = tempMain_addresses;
		collect.org_legaladdresses = tempMain_legalAddresses;
		collect.org_requisites = tempMain_an_requisites;
		collect.org_an_licenses = tempMain_an_licenses;
		collect.org_an_tolerances = tempMain_an_tolerances;
		collect.org_bo_licenses = tempMain_bo_licenses;
		collect.projects = tempProjectsData.filter((item)=> item.command !== undefined  );
		collect.calls = tempCallsData.filter((item)=> item.command !== undefined );
		collect.notes = tempNotesData.filter((item)=> item.command !== undefined  );

		log_save_action('useEffect');
		
		setCOLLECTOR(collect);

	}, [
		tempMain_contacts, 
		tempMain_addresses,
		tempMain_emails,
		tempMain_legalAddresses,
		tempMain_phones,
		tempMain_an_licenses,
		tempMain_an_requisites,
		tempMain_bo_licenses,
		tempMain_an_tolerances,
		tempMainData,
		tempProjectsData,
		tempCallsData,
		tempNotesData
	]);


	useEffect(() => {
		if (!editMode){
			setBlockSave(false);
		}
	}, [editMode]);


	useEffect(() => {
		if (!BLOCK_SAVE){
			setBlockSave(true);
		};
		const timer = setTimeout(() => {
							setBlockSave(false);
		}, 3000);
		return () => clearTimeout(timer);
	}, [BLOCK_DELAY]);



	useEffect(() => {
		if (isAlertVisible && alertType !== 'error') {
			const timer = setTimeout(() => {
				setIsAlertVisible(false);
			}, 3000);

			return () => clearTimeout(timer);
		}
	}, [isAlertVisible]);

	useEffect(()=>{
		setIsSmthChanged(false);
		setTempMainData(null);
	}, [itemId])


	useEffect(() => {
		setLoading(true);
		let rp = getCurrentParamsString();

		if (rp.includes('frompage=orgs')) {
			rp = rp.replace('frompage=orgs&', '');
			rp = rp.replace('frompage=orgs', '');
			rp = '/orgs?' + rp;
			setBackeReturnPath(rp);
		}
		if (rp.includes('frompage=bids')) {
			rp = rp.replace('frompage=bids&', '');
			rp = rp.replace('frompage=bids', '');
			console.log('rp', rp);
			rp = '/bids?' + rp;
			setBackeReturnPath(rp);
		}
		let t = searchParams.get('tab');
		if (t && ['m', 'b', 'o', 'p', 'c', 'n', 'h'].includes(t)) {
			setSearchParams({ tab: t });
			setActiveTab(t);
		} else {
			//   searchParams.set('tab', "m");
			setSearchParams({ tab: 'm' });
			setActiveTab('m');
		}

		if (PRODMODE) {
			get_org_filters();

			get_main_data_action(item_id);

      get_departs();
		} else {
			setBaseFilterstData(OM_ORG_FILTERDATA);

			setBaseMainData(FlushOrgData(ORGLIST_MODAL_MOCK_MAINTAB));
			setBaseNotesData(MODAL_NOTES_LIST);
			// setBaseProjectsData(MODAL_PROJECTS_LIST);
			setBaseCallsData(MODAL_CALLS_LIST);

      setDepartList(DEPARTAMENTS_MOCK);
			setTimeout(() => {
				setLoading(false);
			}, 1000);
		}
	}, []);





	useEffect(() => {
		if (userdata !== null && userdata.companies && userdata.companies.lenght > 0) {
			setBaseCompanies(userdata.companies);
		}
	}, [userdata]);




  // useEffect(() => {
  //   const handleKeyDown = (event) => {
  //     // Ctrl + S
	// 		console.log(event.key);
  //     if (event.ctrlKey && event.key === 's') {
  //       event.preventDefault(); // Блокируем стандартное сохранение браузера
  //       if (editMode){
	// 				handleSaveData();
	// 				alert('YOu pressed save')
  //       } else {
	// 				setEditMode(true);
	// 				alert('YOu pressed make edit 2 ' + editMode)
  //       }
  //     }

  //   };

	// 	document.addEventListener('keydown', handleKeyDown);
	// 	console.log('✅ Listener ДОБАВЛЕН');
		
	// 	return () => {
	// 		document.removeEventListener('keydown', handleKeyDown);
	// 		console.log('🧹 Listener УДАЛЕН');
	// 	};
  // }, [editMode]);




// const handleKeyDown = useCallback((event) => {
//   if (event.ctrlKey && event.key === 's') {
//     event.preventDefault();
//     if (editMode) {
// 			alert('YOu pressed save')
//       handleSaveData();
//     } else {
//       // setEditMode(true);
//     }
//   }
// }, [editMode]);

// useEffect(() => {
//   document.addEventListener('keydown', handleKeyDown);
//   return () => document.removeEventListener('keydown', handleKeyDown);
// }, [handleKeyDown]);


	const handleDiscard = () => {
		
			let itt  = itemId;
			setTempMainData(null);
			setBaseMainData(null);
			if (PRODMODE) {
				setItemId(0);
				
				setTimeout(() => {
					setItemId(itt);
				}, 2600);
				setTimeout(() => {
					
					get_main_data_action(itt);
				}, 1000);
				} else {

					setItemId(0);
					setBaseMainData(null);
					setTimeout(() => {
						
						
						setItemId(itt);
					}, 1200);
					setTimeout(() => {
						setBaseMainData(FlushOrgData(ORGLIST_MODAL_MOCK_MAINTAB));
						setBaseNotesData(MODAL_NOTES_LIST);
						// setBaseProjectsData(MODAL_PROJECTS_LIST);
						setBaseCallsData(MODAL_CALLS_LIST);
	
					}, 1000);

					clearTemps();
				}
				
			setTempMainData(null);
			setEditMode(false);
			setIsSmthChanged(false);
			setBlockSave(false);
			setBlockOnSave(false);
	}







	const companies = useMemo(() => {
		return baseCompanies.map((item) => ({
			key: `kompa_${item.id}`,
			id: item.id,
			label: item.name,
		}));
	}, [baseCompanies]);

	const goBack = () => {
		// const returnPath = location.state?.from;
		const referrer = document.referrer;
		if (backeReturnPath) {

			navigate(backeReturnPath);
		} else {
			// navigate('/orgs');
			window.close();
		}
	};

	const triggerEditMode = () => {
		let newMode = !editMode;
		setEditMode(newMode);
		if (newMode) {
			searchParams.set('mode', 'edit');
			setSearchParams(searchParams);
		} else {
			searchParams.delete('mode');
			setSearchParams(searchParams);
		}
	};

	const handleChangeTab = (tabLit) => {
		setActiveTab(tabLit);
		searchParams.set('tab', tabLit);
		setSearchParams(searchParams);
	};





	/** ----------------------- FETCHES -------------------- */

	const get_main_data_action = async (id) => {
		setLoading(true);
		try {
			let response = await PROD_AXIOS_INSTANCE.post('/api/sales/v2/orglist/' + id + '/m', {
				data: {},
				_token: CSRF_TOKEN,
			});
			
			if (response.data) {
				if (response.data.button_curator_status){
					setCuratorRequestSent(response.data.button_curator_status);
				};
				setBaseMainData(FlushOrgData(response.data.content));
				setOrgName(response.data.content.name)
				setLoading(false);

				formLogger.setComCurator(response.data.content?.id8staff_list);
				formLogger.setComIdCompany(response.data.content?.id_company);
				formLogger.setComName(baseMainData?.name);
			}
				
		} catch (e) {
			console.log(e);
		} finally {

		}
			setTimeout(() => {
				setLoading(false);
			}, 1000);
	};

	useEffect(() => {
		formLogger.setComName(baseMainData?.name);
		if (lockBySocket){
				formLogger.setComState(3);
				formLogger.setComEditor(lockUser ? lockUser.username : '?');
		} else {
			if (editMode){
				formLogger.setComState(2);
				formLogger.setComEditor(userdata?.user?.id);
			} else {
				formLogger.setComState(1);
				formLogger.setComEditor(null);
			}
		}

		if (editMode){
			formLogger.log(LOG_ACTIONS.EDIT_MODE_ENTER, {
						currentTab: activeTab,
			}, { orgId: item_id, orgName: baseMainData?.name });
		} else {
			if (COLLECTOR && Object.keys(COLLECTOR).length > 0) {
				formLogger.log(LOG_ACTIONS.EDIT_MODE_EXIT, {
					currentTab: activeTab,
				}, { orgId: item_id, orgName: baseMainData?.name });
			}
		}
	}, [lockBySocket, editMode]);


	useEffect(() => {
		formLogger.setComId(item_id);
	}, [item_id]);

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


  	const get_departs = async () => {
		if (PRODMODE) {
			try {
				let response = await PROD_AXIOS_INSTANCE.post('/api/timeskud/claims/getdepartments', {
					data: {},
					_token: CSRF_TOKEN,
				});
				if (response){
          setDepartList(response.data.content);
        }
			} catch (e) {
				console.log(e);
			} finally {
				// setLoadingOrgs(false)
			}
		} else {
			//setUserAct(USDA);
		}
	};





	const update_data_action = async () => {
		log_save_action('save_action');

		let data = {
								// С объектами ref не работает, только с массивами
								main : tempMainData, //Ref.current?.ID ? tempMainDataRef.current : null,
								contacts : tempMain_contactsRef.current,
								org_phones : tempMain_phonesRef.current,
								org_emails : tempMain_emailsRef.current,
								org_addresses : tempMain_addressesRef.current,
								org_legaladdresses : tempMain_legalAddressesRef.current,
								org_requisites : tempMain_an_requisitesRef.current,
								org_an_licenses : tempMain_an_licensesRef.current,
								org_an_tolerances : tempMain_an_tolerancesRef.current,
								org_bo_licenses : tempMain_bo_licensesRef.current,

								projects : tempProjectsDataRef.current, // Ref.filter((item)=> itemRef.command !== undefined  ),
								calls : tempCallsDataRef.current, //Ref.filter((item)=> itemRef.command !== undefined ),
								notes : tempNotesDataRef.current, //.filter((item)=> item.command !== undefined  ),
					};

							const payload = data;
					
							// КРИТИЧНО: Логируем payload ПЕРЕД отправкой
							await formLogger.logBeforeSave(payload, { 
								orgId: item_id, 
								orgName: baseMainData?.name 
							});

		if (PRODMODE) {
			setSaveProcess(20);
			try {
				let response = await PROD_AXIOS_INSTANCE.put('/api/sales/v2/updateorglist/' + itemId, {
					data: data,
					_token: CSRF_TOKEN,
				});
				if (response.status === 200){
          // При успешной записи - очищаем все временные списки и загружаем данные заново
					clearTemps();
					setIsAlertVisible(true);
					setAlertMessage(`Успех!`);
					setAlertDescription(response.message || 'Данные успешно обновлены');
					setAlertType('success');
					setSaveProcess(60);
					formLogger.logSaveSuccess(response, { orgId: item_id });
        } else {
					setIsAlertVisible(true);
					setAlertMessage(`Произошла ошибка!`);
					setAlertDescription(response.message || 'Неизвестная ошибка сервера');
					setAlertType('error');
					setBlockSave(false);
					setBlockOnSave(false);
					formLogger.logError('SAVE_FAILED', { 
									payload, // Сохраняем данные которые пытались отправить
									orgId: item_id,
									orgName: baseMainData?.name,
									response: response?.data?.message || response.message || 'Неизвестная ошибка сервера'
								});
				}
			} catch (e) {
				console.log(e);
					setIsAlertVisible(true);
					setAlertMessage(`Ошибка на стороне сервера`);
					setAlertDescription(e.response?.data?.message || e.message || 'Неизвестная ошибка сервера');
					setAlertType('error');
					setBlockSave(false);
					setBlockOnSave(false);
					formLogger.logError('SAVE_FAILED', e, { 
									payload, // Сохраняем данные которые пытались отправить
									orgId: item_id,
									orgName: baseMainData?.name,
									response: e.response?.data?.message || e.message || 'Неизвестная ошибка'
								});
			} finally {
				// setLoadingOrgs(false)

			}
		} else {
			setTimeout(() => {
				setSaveProcess(100);
				setBlockOnSave(false);
				setBlockSave(false);
		}, 2000);
			clearTemps();
		}

	};




	const  log_save_action = async (src = null) => {
		let data = {
								// С объектами ref не работает, только с массивами
								main : tempMainData, //Ref.current?.ID ? tempMainDataRef.current : null,
								contacts : tempMain_contactsRef.current,
								org_phones : tempMain_phonesRef.current,
								org_emails : tempMain_emailsRef.current,
								org_addresses : tempMain_addressesRef.current,
								org_legaladdresses : tempMain_legalAddressesRef.current,
								org_requisites : tempMain_an_requisitesRef.current,
								org_an_licenses : tempMain_an_licensesRef.current,
								org_an_tolerances : tempMain_an_tolerancesRef.current,
								org_bo_licenses : tempMain_bo_licensesRef.current,

								projects : tempProjectsDataRef.current, // Ref.filter((item)=> itemRef.command !== undefined  ),
								calls : tempCallsDataRef.current, //Ref.filter((item)=> itemRef.command !== undefined ),
								notes : tempNotesDataRef.current, //.filter((item)=> item.command !== undefined  ),
								__src : src
					};

					formLogger.log('FORM_SNAPSHOT', data);
		if (PRODMODE && itemId) {
			setSaveProcess(20);
			try {
				let response = await PROD_AXIOS_INSTANCE.put('/api/sales/v2/logupdateorglist/' + itemId, {
					data: data,
					save_pushed: src === 'save_action' ? true : false,
					_token: CSRF_TOKEN,
				});
				if (response.status === 200){
          // При успешной записи - очищаем все временные списки и загружаем данные заново
				
        } else {
					
				}
			} catch (e) {
				console.log(e);
			} finally {
				// setLoadingOrgs(false)

			}
		}
	}


	/** ----------------------- FETCHES -------------------- */




	const handleSaveData = () => {
		
		setBlockOnSave(true);
		setSaveProcess(5);

		setTimeout(() => {
			update_data_action();
		}, 1500);

			setIsSmthChanged(false);
			setTempMainData(null);
	};

	useEffect(() => {
		console.log('COLLECTOR MODIFIED', COLLECTOR);
		if (isEmptyObject(COLLECTOR)){
			setTimeout(() => {
				setIsSmthChanged(false);
			}, 1500);
		} else {
			setIsSmthChanged(true);
		}
	}, [COLLECTOR]);





	const handleTabDataChange = (tab_name, data) => {
		if (!editMode) return;
	 if (tab_name === 'projects'){
			// if (JSON.stringify(data) !== JSON.stringify(baseProjectsData)){
				setTempProjectsData(data);
			// } else {
			// 	setTempProjectsData([]);
			// }

		} else if (tab_name === 'notes'){
			if (JSON.stringify(data) !== JSON.stringify(baseNotesData)){
				setTempNotesData(data);
			} else {
				setTempNotesData([]);
			}

		} else if (tab_name === 'calls'){
			if (JSON.stringify(data) !== JSON.stringify(baseCallsData)){
				setTempCallsData(data);
			} else {
				setTempCallsData([]);
			}
		}
	}




useEffect(() => {
  // console.log('🔥 useEffect keydown ЗАПУЩЕН', editMode);
  
  const handleKeyDown = (event) => {
    if (event.ctrlKey && (event.key === 's' || event.key === 'S' || event.key === 'ы' || event.key === 'Ы')) {
			if (editMode){
				event.preventDefault();
				// console.log('✅ Ctrl+S пойман!');
				handleSaveData();
			}
      
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  
  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
}, [editMode, 
		tempMain_contacts, 
		tempMain_addresses,
		tempMain_emails,
		tempMain_legalAddresses,
		tempMain_phones,
		tempMain_an_licenses,
		tempMain_an_requisites,
		tempMain_bo_licenses,
		tempMain_an_tolerances,
		tempMainData,
		tempProjectsData,
		tempCallsData,
		tempNotesData
]);
	



	const customClick = (button_id) => {
		if (button_id === 1){
			handleDiscard();
		}
		setIsOpenCustomModal(false)
	}


	
	// Очистка данных для сохранения (измененных)
	const clearTemps = () => {
		let iid = itemId;
		setItemId(null);
		setSaveProcess(80);
		get_main_data_action(iid);
		// get_notes_data_action(iid);
		// get_org_calls_action(iid);
		// get_projects_data_action(iid);
				setTempMainData(null);
	
				setTempProjectsData([]);
				setTempCallsData([]);
				setTempNotesData([]);
				setTempMain_an_licenses([]);
				setTempMain_addresses([]);
				setTempMain_an_requisites([]);
				setTempMain_an_tolerances([]);
				
				setTempMain_emails([]);
				setTempMain_bo_licenses([]);
				setTempMain_legalAddresses([]);
				setTempMain_phones([]);
				setTempMain_contacts([]);

			setTimeout(() => {
				setTempMainData(null);
	
				setTempProjectsData([]);
				setTempCallsData([]);
				setTempNotesData([]);
				setTempMain_an_licenses([]);
				setTempMain_addresses([]);
				setTempMain_an_requisites([]);
				setTempMain_an_tolerances([]);
				
				setTempMain_emails([]);
				setTempMain_bo_licenses([]);
				setTempMain_legalAddresses([]);
				setTempMain_phones([]);
				setTempMain_contacts([]);
				
			}, 1500);


		setTimeout(() => {
			setItemId(iid);
			

		}, 1200);
		setTimeout(() => {
				setSaveProcess(100);
				setBlockOnSave(false);
		}, 2000);
	}



	const handleCallBecomeCurator = async () => {
			// http://192.168.1.16/api/curators/create
			let luand = window.confirm("Вы точно хотите запросить кураторство для " + baseMainData?.name + "?");

			if (!luand) return;

			try {
					const format_data = {
						
						_token: CSRF_TOKEN,
						data: {
							id_org: itemId,
						},
					};

					formLogger.log('CURATOR_REQUEST', { id: item_id, current_curator: baseMainData.id8staff_list, target_curator: userdata?.user?.id });

					let response = await PROD_AXIOS_INSTANCE.post(
						"/api/curators/create",
						format_data,
					);
					if (response) {
						// alert("Заявка на кураторство отправлена");
						setCuratorRequestSent(true);

							if (response.status === 200 || response.data.status === 2){
								// При успешной записи - очищаем все временные списки и загружаем данные заново
								clearTemps();
								setIsAlertVisible(true);
								setAlertMessage(`Успех!`);
								setAlertDescription(response.data.message || 'Заявка на кураторство отправлена');
								setAlertType('success');
								setSaveProcess(60);
								formLogger.log('CURATOR_REQUEST', { id: item_id, current_curator: baseMainData.id8staff_list, target_curator: userdata?.user?.id, status: 'ok', message: 'success' });
							} else {
								setIsAlertVisible(true);
								setAlertMessage(`Произошла ошибка!`);
								setAlertDescription(response.data?.message || 'Неизвестная ошибка сервера');
								setAlertType('error');
								setBlockSave(false);
								setBlockOnSave(false);
								formLogger.log('CURATOR_REQUEST_FAILED', { id: item_id, current_curator: baseMainData.id8staff_list, target_curator: userdata?.user?.id, status: 'fail', message: response.data?.message || 'Неизвестная ошибка сервера' });
							}
					}
				} catch (e) {
					console.log(e);
					setIsAlertVisible(true);
					setAlertMessage(`Ошибка на стороне сервера`);
					setAlertDescription(e.response?.data?.message || e.message || 'Неизвестная ошибка');
					setAlertType('error');
					setBlockSave(false);
					setBlockOnSave(false);
				  formLogger.log('CURATOR_REQUEST_FAILED', { id: item_id, current_curator: baseMainData.id8staff_list, target_curator: userdata?.user?.id, status: 'fail', message: e.response?.data?.message || e.message || 'Неизвестная ошибка' });
			}
	}


	const handleMainDataChange = (data) => {
		if (itemId && editMode){
			setTempMainData(data);
		}
	}


	useEffect(() => {
		console.log('baseMainData', baseMainData);
	}, [baseMainData]);


	// Подготовка Контактов к отправке
	const handleContactChange = (data)=>{
		// console.log('EXTERNAL CALL TO UPDATE CONTACTS', data);
		if (data.command === 'create' && data.deleted){
			// Удаление только что добавленного
			setTempMain_contacts(tempMain_contacts.filter((item) => item.id !== data.id));
			// console.log('clear');
		} else {
			let existed = tempMain_contacts.find((item)=>item.id === data.id);
			if (!existed){
				if (data.command){
					setTempMain_contacts([data, ...tempMain_contacts]);
					// console.log('append');
				}
			} else {
				setTempMain_contacts(tempMain_contacts.map((item) => (
					item.id === data.id ? data : item
				)))
				// console.log('filter');
			}
		}
	}

	// Подготовка адресов к отправке
	const handleAddressChange = (data)=>{
			if (data.command === 'create' && data.deleted){
				// Удаление только что добавленного
				// tempMain_addressesRef.current = tempMain_addresses.filter((item) => item.id !== data.id);
				setTempMain_addresses(tempMain_addresses.filter((item) => item.id !== data.id));
			} else {
				let existed = tempMain_addresses.find((item)=>item.id === data.id);
				if (!existed){
					if (data.command){
						// tempMain_addressesRef.current = [data, ...tempMain_addresses];
						setTempMain_addresses([data, ...tempMain_addresses]);
					}
				} else {
					// tempMain_addressesRef.current = tempMain_addressesRef.current.map((item) => (
					// 	item.id === data.id ? data : item
					// ));
					setTempMain_addresses(tempMain_addresses.map((item) => (
						item.id === data.id ? data : item
					)));
				}
			}
	}

		// Подготовка адресов к отправке
	const handleLegalAddressChange = (data)=>{
		if (data.command === 'create' && data.deleted){
			// Удаление только что добавленного
			setTempMain_legalAddresses(tempMain_legalAddresses.filter((item) => item.id !== data.id));
		} else {
			let existed = tempMain_legalAddresses.find((item)=>item.id === data.id);
			if (!existed){
				// Вставка
				if (data.command){
					setTempMain_legalAddresses([data, ...tempMain_legalAddresses]);
				}
			} else {
				// Обновление
				setTempMain_legalAddresses(tempMain_legalAddresses.map((item) => (
					item.id === data.id ? data : item
				)))
			}
		}
	}

		// Подготовка email адресов к отправке
	const handleEmailChange = (data)=>{
		if (data.command === 'create' && data.deleted){
			// Удаление только что добавленного
			setTempMain_emails(tempMain_emails.filter((item) => item.id !== data.id));
		} else {
			let existed = tempMain_emails.find((item)=>item.id === data.id);
			if (!existed){
				if (data.command){
					setTempMain_emails([data, ...tempMain_emails]);
				}
			} else {
				setTempMain_emails(tempMain_emails.map((item) => (
					item.id === data.id ? data : item
				)))
			}
		}
	}

		// Подготовка адресов к отправке
	const handlePhoneChange = (data)=>{
		if (data.command === 'create' && data.deleted){
			// Удаление только что добавленного
			setTempMain_phones(tempMain_phones.filter((item) => item.id !== data.id));
		} else {
			let existed = tempMain_phones.find((item)=>item.id === data.id);
			if (!existed){
				if (data.command){
					setTempMain_phones([data, ...tempMain_phones]);
				}
			} else {
				setTempMain_phones(tempMain_phones.map((item) => (
					item.id === data.id ? data : item
				)))
			}
		}
	}


	// Подготовка адресов к отправке
	const handleBoLicenseChange = (data)=>{
		if (data.command === 'create' && data.deleted){
			// Удаление только что добавленного
			setTempMain_bo_licenses(tempMain_bo_licenses.filter((item) => item.id !== data.id));
		} else {
			let existed = tempMain_bo_licenses.find((item)=>item.id === data.id);
			if (!existed){
				if (data.command){
					setTempMain_bo_licenses([data, ...tempMain_bo_licenses]);
				}
			} else {
				setTempMain_bo_licenses(tempMain_bo_licenses.map((item) => (
					item.id === data.id ? data : item
				)))
			}
		}
	}

		// Подготовка адресов к отправке
	const handleAnLicenseChange = (data)=>{
		if (data.command === 'create' && data.deleted){
			// Удаление только что добавленного
			setTempMain_an_licenses(tempMain_an_licenses.filter((item) => item.id !== data.id));
		} else {
			let existed = tempMain_an_licenses.find((item)=>item.id === data.id);
			if (!existed){
				if (data.command){
					setTempMain_an_licenses([data, ...tempMain_an_licenses]);
				}
			} else {
				setTempMain_an_licenses(tempMain_an_licenses.map((item) => (
					item.id === data.id ? data : item
				)))
			}
		}
	}

		// Подготовка адресов к отправке
	const handleAnToleranceChange = (data)=>{
		if (data.command === 'create' && data.deleted){
			// Удаление только что добавленного
			setTempMain_an_tolerances(tempMain_an_tolerances.filter((item) => item.id !== data.id));
		} else {
			let existed = tempMain_an_tolerances.find((item)=>item.id === data.id);
			if (!existed){
				if (data.command){
					setTempMain_an_tolerances([data, ...tempMain_an_tolerances]);
				}
			} else {
				setTempMain_an_tolerances(tempMain_an_tolerances.map((item) => (
					item.id === data.id ? data : item
				)))
			}
		}
	}

		// Подготовка адресов к отправке
	const handleRequisitesChange = (data)=>{
		if (data.command === 'create' && data.deleted){
			// Удаление только что добавленного
			setTempMain_an_requisites(tempMain_an_requisites.filter((item) => item.id !== data.id));
		} else {
			let existed = tempMain_an_requisites.find((item)=>item.id === data.id);
			if (!existed){
				if (data.command){
					setTempMain_an_requisites([data, ...tempMain_an_requisites]);
				}
			} else {
				setTempMain_an_requisites(tempMain_an_requisites.map((item) => (
					item.id === data.id ? data : item
				)))
			}
		}
	}




	const sectionUpdateHandler = (section, id, data) => {
		if (section === 'notes'){
			let catchObject = tempNotesData.find((item)=> item.id === id);
			if (catchObject){
				if (data.command && data.command === 'create' && data.deleted && data.id.includes('new')){
					// Удаление временного элемента из стека
					sectionDeleteHandler(section, id);
					return;
				}
				setTempNotesData(tempNotesData.map(item => item.id === id ? data : item));
			} else {
				// Чтоб не залетел пустой
				if (!(data.command && data.command === 'create' && data.deleted && data.id.includes('new'))){
					setTempNotesData([data, ...tempNotesData]);
				}
			}
		};
		if (section === 'projects'){
			let catchObject = tempProjectsData.find((item)=> item.id === id);
			if (catchObject){
				if (data.command && data.command === 'create' && data.deleted && data.id.includes('new')){
					// Удаление временного элемента из стека
					sectionDeleteHandler(section, id);
					return;
				}
				setTempProjectsData(tempProjectsData.map(item => item.id === id ? data : item));
			} else {
				if (!(data.command && data.command === 'create' && data.deleted && data.id.includes('new'))){
					setTempProjectsData([data, ...tempProjectsData]);
				}
			}
		};
		if (section === 'calls'){
			let catchObject = tempCallsData.find((item)=> item.id === id);
			if (catchObject){
				if (data.command && data.command === 'create' && data.deleted && data.id.includes('new')){
					// Удаление временного элемента из стека
					sectionDeleteHandler(section, id);
					return;
				}
				setTempCallsData(tempCallsData.map(item => item.id === id ? data : item));
			} else {
				if (!(data.command && data.command === 'create' && data.deleted && data.id.includes('new'))){
					setTempCallsData([data, ...tempCallsData]);
				}
			}
		};
	}

	const sectionDeleteHandler = (section, id) => {
		// Удаление временного элемента из стека
		if (section === 'notes'){
			setTempNotesData(tempNotesData.filter((item)=> item.id !== id));
		};
		if (section === 'projects'){
			setTempProjectsData(tempProjectsData.filter((item)=> item.id !== id));
		};
		if (section === 'calls'){
			setTempCallsData(tempCallsData.filter((item)=> item.id !== id));
		};
	}


	function isEmptyObject(obj) {
  return Object.values(obj).every(value => {
    if (Array.isArray(value)) {
      return value.length === 0;
    }
    return value === null;
  });
}




	// useEffect(() => {
	// 	if (prevTab !== activeTab){
	// 		formLogger.log('TAB_CHANGE', { from: prevTab, to: activeTab, org_id: item_id, time: dayjs() })
	// 	}
	// }, [activeTab]);



	return (
		<>
			<div className="app-page">
				<div className="sa-orgpage-body sa-mw-1400">
        		<Affix offsetTop={0}>
					<div className="sa-orgpage-header" style={{ paddingTop: '4px', paddingBottom: '4px' }}>
						<div className={'sa-flex-space'}>
							<div className={'sa-flex-space'}>
								{backeReturnPath && (
									<div className={'sa-orgpage-header-button'} onClick={goBack}>
										<ArrowSmallLeftIcon height={'30px'} />
									</div>
								)}
								<div className={'sa-orgpage-header-title'} style={{ paddingLeft: '12px' }}>
									Паспорт организации ({itemId}) /{' '}
									{tabNames.find((item) => item.link === activeTab)?.name}
								</div>
							</div>
							<div></div>
							<div className={'sa-orp-menu'}>
								{tabNames.map((tab, index) => (
									<div
										key={'tab_index_' + index}
										className={`sa-orp-menu-button  ${activeTab === tab.link ? 'active' : ''}
										${'m' === tab.link && (tempMainData || 
											tempMain_contacts?.length ||
										tempMain_addresses?.length ||
										tempMain_emails?.length ||
										tempMain_legalAddresses?.length ||
										tempMain_phones?.length ||
										tempMain_an_licenses?.length ||
										tempMain_an_requisites?.length ||
										tempMain_bo_licenses?.length ||
										tempMain_an_tolerances?.length) ?    'sa-mite-has-some' : ''}
										${'n' === tab.link && tempNotesData?.length    ? 'sa-mite-has-some' : ''}
										${'p' === tab.link && tempProjectsData?.length ? 'sa-mite-has-some' : ''}
										${'c' === tab.link && tempCallsData?.length    ? 'sa-mite-has-some' : ''}
										`}
										onClick={() => {
											handleChangeTab(tab.link);
										}}
									>
										{tab.name}

									</div>
								))}
							</div>
						</div>
					</div>
          </Affix>

					<div className={'sa-outlet-body'}>
          <Affix offsetTop={36} className={` ${lockBySocket ? 'sa-busy-header' : ''}`}>    
						<div className={'sa-orgpage-sub-header sa-flex-space'}>
							<div className={'sa-orgpage-sub-name'}>{baseMainData?.name}</div>
							<div>
								
							</div>
							<div className={'sa-flex sa-orgpage-sub-control'} style={{ padding: '6px' }}>
								{/* {editMode && (
                            <div onClick={triggerEditMode}>
                                <XMarkIcon height={'22px'}/> Просмотр
                            </div>
                        )} */}
								{editMode && isSmthChanged && (
									<div style={{display: 'flex', alignItems: 'flex-end', paddingRight: '12px'}}>
										<Tooltip title={'Не забудьте сохранить'}>
											<Tag color='red-inverse'>Есть несохраненные данные</Tag>
										</Tooltip>
									</div>
								)}

								{curatorRequestSent ? (
										<Tooltip title={'Заявка на кураторство подана'} placement={'left'}>
											<Button style={{marginRight: '12px'}}
												disabled
												color="cyan" variant="outlined"
												icon={<FlagOutlined />}
												>
												</Button>
										</Tooltip>
								) : (
									<>
									{userdata && userdata.acls && (userdata.acls.includes(137) || userdata.acls.includes(138) || userdata.acls.includes(139))
									&&
									!editMode && !lockBySocket && userdata?.user?.id !== baseMainData?.curator?.id && (
										<Tooltip title={'Запросить кураторство'} placement={'left'}>
											<Button style={{marginRight: '12px'}}
											color="cyan" variant="outlined"
											icon={<FlagOutlined />}
												onClick={handleCallBecomeCurator}>
												</Button>
										</Tooltip>
									)}
									{!editMode && userdata?.user?.id === baseMainData?.curator?.id && (
										<Tooltip title={'Вы куратор этой организации'} placement={'left'}>
											<Button style={{marginRight: '12px'}}
											className={'sa-me-curator'}
											color="default" variant="text"
											icon={<FlagFilled />}
											>
												</Button>
											</Tooltip>
									)}
									</>
								)}


								{editMode ? (
									<div>
										{blockOnSave ? (
											<Button icon={<LoadingOutlined />} color="primary" variant="solid">
												Сохраняю...
											</Button>
										) : (
											<Button
												icon={<ClipboardDocumentCheckIcon height={'16px'} />}
												// disabled={blockOnSave || BLOCK_SAVE}
												onClick={handleSaveData}
												color="primary"
												variant="solid"
												disabled={!isSmthChanged}
												title={`${isSmthChanged ? '' : 'Нет данных для сохранения'}`}
											>
												Сохранить
											</Button>
										)}

										<Button
											color="primary"
											variant="outlined"
											onClick={()=>{isSmthChanged ? setIsOpenCustomModal(true) : setEditMode(false)}}
											icon={<XMarkIcon height={'16px'} />}
										>
											Закрыть редактирование
										</Button>
									</div>
								) : (
									<div>
										{lockBySocket ? (
											<div className='sa-editor-org-name'>
												Редактирует: {lockUser ? lockUser.username : ''}
											</div>
										):(
										<Button
										color="primary"
											variant="outlined"
											onClick={triggerEditMode}
											icon={<PencilIcon height={'16px'} />}
										>
											Редактировать
										</Button>

										)}
									</div>
								)}
								
							</div>
						</div>
            		</Affix>  
						{blockOnSave && (
							<div className={'sa-orgpage-loader'}>
								<div className="sa-orgpage-loader-chunk" style={{ width: saveProcess + '%' }}></div>
							</div>
						)}


						{activeTab === 'o' && (
							<OrgListModalOffersTab
							data={{ id: itemId }}
							environment={'editor'} 
							org_name={orgName}
							/>
						)}

						{activeTab === 'b' && (
							<OrgListModalBillsTab
								data={{ id: itemId }}
								environment={'editor'}
								org_name={orgName}
							/>
						)}

						<TabMainTorg
							show={activeTab === 'm'}
							edit_mode={editMode}
							item_id={itemId}
							call_to_save={callToSaveAction}
							base_data={baseMainData}
							userdata={userdata}
              selects={baseFiltersData}

							// on_change_name={(orNamen)=>{setOrgName(orNamen)}}

							do_delay={(val)=>{setBlockDelay(val)}}
							is_loading={loading}

							on_change_main_data={handleMainDataChange}
							on_change_contact={handleContactChange}
							on_change_address={handleAddressChange}
							on_change_phone={handlePhoneChange}
							on_change_legal_address={handleLegalAddressChange}
							on_change_email={handleEmailChange}
							on_change_bo_license={handleBoLicenseChange}
							on_change_an_license={handleAnLicenseChange}
							on_change_an_tolerance={handleAnToleranceChange}
							on_change_requisite={handleRequisitesChange}
						/>

						<TabCallsTorg
							active_tab={activeTab === 'c'}
							edit_mode={editMode}
							org_id={itemId}
							call_to_save={callToSaveAction}
							base_data={baseCallsData}
							// on_save={handleDataChangeApprove}
							active_page={pageCalls}
							on_change_page={(p) => {
								setPageCalls(p);
							}}
							current_page={pageCalls}
							userdata={userdata}
							selects={baseFiltersData}
							departaments={departList}
							main_data={baseMainData}
							on_change_section={sectionUpdateHandler}
						/>


						<TabProjectsTorg
								active_tab={activeTab === 'p'}
								edit_mode={editMode}
								org_id={itemId}
								userdata={userdata}
								on_change_section={sectionUpdateHandler}
								on_delete_section={sectionDeleteHandler}

								call_to_save={callToSaveAction}

								active_page={pageProject}
								on_change_page={(p) => {
									setPageProject(p);
								}}
								current_page={pageProject}
								on_change_data={handleTabDataChange}
								selects={baseFiltersData}
								main_data={baseMainData}
						/>

							

						<TabNotesTorg
							active_tab={activeTab === 'n'}
							edit_mode={editMode}
							org_id={itemId}
              userdata={userdata}
							on_change_section={sectionUpdateHandler}
							on_delete_section={sectionDeleteHandler}

							call_to_save={callToSaveAction}
							base_data={baseNotesData}

							active_page={pageNotes}
							on_change_page={(p) => {
								setPageNotes(p);
							}}
							current_page={pageNotes}
							on_change_data={handleTabDataChange}
							selects={baseFiltersData}
						/>


						{activeTab === 'h' && (
							<OrgListModalHistoryTab data={{ id: itemId }} environment={'editor'} />
						)}
					</div>


				</div>

				<CustomModal
					customClick={customClick}
					customType={customModalType}
					customText={customModalText}
					customTitle={customModalTitle}
					customButtons={customModalColumns}
					open={isOpenCustomModal}
				/>
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
		</>
	);
};

export default TorgPage;
