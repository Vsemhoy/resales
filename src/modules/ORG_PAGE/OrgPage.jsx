import React, { useEffect, useMemo, useState } from 'react';

import { CSRF_TOKEN, PRODMODE } from '../../config/config';
import {
	NavLink,
	Outlet,
	useLocation,
	useNavigate,
	useParams,
	useSearchParams,
} from 'react-router-dom';
import { Affix, Alert, Button, DatePicker, Input, Layout, Pagination, Select, Tag, Tooltip } from 'antd';

import { ArrowSmallLeftIcon, CircleStackIcon, ExclamationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import {
	ArrowLeftCircleIcon,
	ClipboardDocumentCheckIcon,
	PencilIcon,
	PhoneXMarkIcon,
	XMarkIcon,
} from '@heroicons/react/24/outline';
import { CloseOutlined, ExclamationOutlined, LoadingOutlined } from '@ant-design/icons';

import dayjs from 'dayjs';
import './components/style/orgpage.css';
import '../ORG_LIST/components/style/orgmodal.css';

import MainTabPage from './tabs/MainTabPage';
import CallsTabPage from './tabs/CallsTabPage';
import NotesTabPage from './tabs/NotesTabPage';
import ProjectsTabPage from './tabs/ProjectsTabPage';

import OrgListModalBillsTab from '../ORG_LIST/components/OrgModal/Tabs/OrgListModalBillsTab';
import OrgListModalOffersTab from '../ORG_LIST/components/OrgModal/Tabs/OrgListModalOffersTab';
import OrgListModalHistoryTab from '../ORG_LIST/components/OrgModal/Tabs/OrgListModalHistoryTab';
import { PROD_AXIOS_INSTANCE } from '../../config/Api';
import { useURLParams } from '../../components/helpers/UriHelpers';
import { ORGLIST_MODAL_MOCK_MAINTAB } from '../ORG_LIST/components/mock/ORGLISTMODALMOCK';
import { MODAL_NOTES_LIST } from '../ORG_LIST/components/mock/MODALNOTESTABMOCK';
import { MODAL_PROJECTS_LIST } from '../ORG_LIST/components/mock/MODALPROJECTSTABMOCK';
import { MODAL_CALLS_LIST } from '../ORG_LIST/components/mock/MODALCALLSTABMOCK';
import { OM_ORG_FILTERDATA } from '../ORG_LIST/components/mock/ORGLISTMOCK';
import { DEPARTAMENTS_MOCK } from './components/mock/ORGPAGEMOCK';
import CustomModal from '../../components/helpers/modals/CustomModal';
import { FlushOrgData, IsSameComparedSomeOrgData, MAIN_ORG_DATA_IGNORE_KEYS } from './components/handlers/OrgPageDataHandler';
import TabNotesTorg from '../TORG_PAGE/components/tabs/TabNotesTorg';

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
// Максиму: Я поставил заглушку, departList чтобы сбилдить проект
// let departList = [];

/**
 *
 * Пайплайн:
 * 1. Загрузить все данные для вкладок - разные фетчи в разные контейнеры?
 * - Основная информация
 * - Проекты
 * - Всетречи\Звонки
 * - Заметки
 * 2. Смонтировать компоненты вышеуказанных данных независимо от таба
 * 3. Передать данные
 * 4. Отрендерить данные
 * 5. Сделать один центр обновления данных
 * 6. Сделать механику получения только измененных данных
 * 7. Отправлять на обновление только измененные данные
 * 8. Сделать мултисекционные компоненты
 * 9. Сделать мультистроковые компоненты
 * 10. Раскидать данные, собрать данные
 */



const OrgPage = (props) => {
	const { userdata } = props;
	const { updateURL, getCurrentParamsString, getFullURLWithParams } = useURLParams();
	const [departList, setDepartList] = useState(null);
	const [open, setOpen] = useState(false);
	//   const [openResponsive, setOpenResponsive] = useState(false);
	const [searchParams, setSearchParams] = useSearchParams();
	const navigate = useNavigate();

	const [isSmthChanged, setIsSmthChanged] = useState(false);

	const { item_id } = useParams();
	const onPage = 30;

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
	const [baseProjectsData, setBaseProjectsData] = useState(null);
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
	const [tempMain_an_licenses, setTempMain__an_licenses] = useState([]);
	const [tempMain_an_tolerances, setTempMain_an_tolerances] = useState([]);
	const [tempMain_an_requisites, setTempMain_an_requisites] = useState([]);

	// При нажатии кнопочки сохранить - сюда вставляется Timestamp, слушатели в компонентах видят изменение, отправляею данные в сохранятор
	const [callToSaveAction, setCallToSaveAction] = useState(null);
	const [blockOnSave, setBlockOnSave] = useState(false);
	const [loading, setLoading] = useState(false);

	const [saveProcess, setSaveProcess] = useState(0);

	const [baseFiltersData, setBaseFilterstData] = useState(null);

	const [refreshMark, setRefreshMark] = useState(null);

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

		console.log(collect);
		setCOLLECTOR(collect);

		if (
			tempMainData != null || 
			tempMain_contacts?.length ||
		tempMain_addresses?.length ||
		tempMain_emails?.length ||
		tempMain_legalAddresses?.length ||
		tempMain_phones?.length ||
		tempMain_an_licenses?.length ||
		tempMain_an_requisites?.length ||
		tempMain_bo_licenses?.length ||
		tempMain_an_tolerances?.length ||
		tempCallsData?.length ||
		tempProjectsData?.length ||
		tempNotesData?.length
		) {
			setTimeout(() => {
				console.log('SOME CHANGED')
				setIsSmthChanged(true);
			}, 1500);
		} else {
			setIsSmthChanged(false);
		}

	}, [tempMain_contacts, 
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
		console.log("ORG_ID:", itemId);
	}, [itemId])


	useEffect(() => {
		setLoading(true);
		let rp = getCurrentParamsString();

		if (rp.includes('frompage=orgs')) {
			rp.replace('frompage=orgs&', '');
			rp.replace('frompage=orgs', '');
			rp = '/orgs?' + rp;
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
			get_notes_data_action(item_id);
			get_org_calls_action(item_id);
			get_projects_data_action(item_id);

      get_departs();
		} else {
			setBaseFilterstData(OM_ORG_FILTERDATA);

			setBaseMainData(FlushOrgData(ORGLIST_MODAL_MOCK_MAINTAB));
			setBaseNotesData(MODAL_NOTES_LIST);
			setBaseProjectsData(MODAL_PROJECTS_LIST);
			setBaseCallsData(MODAL_CALLS_LIST);

      setDepartList(DEPARTAMENTS_MOCK);
		}
	}, []);

	// Патч для фиксирования хедера в модалке, ибо модалка рендерится в body
	useEffect(() => {
		if (open) {
			document.body.classList.add('sa-org-page-open');
		} else {
			document.body.classList.remove('sa-org-page-open');
		}
		document.body.classList.remove('sa-org-modal-open');
	}, [open]);



	useEffect(() => {
		if (userdata !== null && userdata.companies && userdata.companies.lenght > 0) {
			setBaseCompanies(userdata.companies);
		}
	}, [userdata]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl + S
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault(); // Блокируем стандартное сохранение браузера
        if (editMode){
          handleSaveData();
        } else {
          setEditMode(true);
        }
      }
      
      // Ctrl + X
      if (event.ctrlKey && event.key === 'x') {
        event.preventDefault();
        handleDiscard();
		setTempMainData(null);
      }

    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);



	const handleDiscard = () => {
		
			let itt  = itemId;
			setTempMainData(null);
			setBaseMainData(null);
			if (PRODMODE) {
				setItemId(0);
				
				setTimeout(() => {
					setItemId(itt);
				}, 3200);
				setTimeout(() => {
					
					get_main_data_action(itt);
					get_notes_data_action(itt);
					get_org_calls_action(itt);
					get_projects_data_action(itt);

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
						setBaseProjectsData(MODAL_PROJECTS_LIST);
						setBaseCallsData(MODAL_CALLS_LIST);
	
					}, 1000);

					clearTemps();
				}
				
			setTempMainData(null);
			setEditMode(false);
			setIsSmthChanged(false);
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
			// if (backeReturnPath.includes('?')){
			//     if (backeReturnPath.includes("target=" + itemId))
			//     console.log('NAVIGATE', backeReturnPath  + "&target=" + itemId)
			//     navigate(backeReturnPath  + "&target=" + itemId);
			// } else {
			//     console.log('NAVIGATE', backeReturnPath  + "?target=" + itemId)
			// }
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
		try {
			let response = await PROD_AXIOS_INSTANCE.post('/api/sales/v2/orglist/' + id + '/m', {
				data: {},
				_token: CSRF_TOKEN,
			});
			console.log('response', response);
			if (response.data) {
				// if (props.changed_user_data){
				//     props.changed_user_data(response.data);
				// }
				// setBaseMainData(FlushOrgData(response.data.content));
				setBaseMainData(FlushOrgData(response.data.content));
				setLoading(false);
				
			}
		} catch (e) {
			console.log(e);
		} finally {
			setTimeout(() => {
				setLoading(false);
			}, 1000);
		}
	};

	const get_org_calls_action = async (id) => {
		try {
			let response = await PROD_AXIOS_INSTANCE.post('/api/sales/v2/orglist/' + id + '/c', {
				data: {
					page: pageCalls,
					limit: onPage,
				},
				_token: CSRF_TOKEN,
			});
			console.log('response', response);
			if (response.data) {
				// if (props.changed_user_data){
				//     props.changed_user_data(response.data);
				// }
				// setBaseCallsData(response.data.content?.calls.map((item)=>{
				// 	item._savecontact = false;
				// 	return item;
				// }));
				// setBaseCallsData(response.data.content?.calls.map((item)=>{
				// 	item._savecontact = false;
				// 	return item;
				// }));
				setBaseCallsData(response.data.content);
				setLoading(false);

			}
		} catch (e) {
			console.log(e);
		} finally {
			setTimeout(() => {
				setLoading(false);
			}, 1000);
		}
	};

	const get_projects_data_action = async (id) => {
		try {
			let response = await PROD_AXIOS_INSTANCE.post('/api/sales/v2/orglist/' + id + '/p', {
				data: {
					page: pageProject,
					limit: onPage,
				},
				_token: CSRF_TOKEN,
			});
			console.log('response', response);
			if (response.data) {
				// if (props.changed_user_data){
				//     props.changed_user_data(response.data);
				// }
				setBaseProjectsData(response.data.content);
				setLoading(false);

			}
		} catch (e) {
			console.log(e);
		} finally {
			setTimeout(() => {
				setLoading(false);
			}, 1000);
		}
	};

	const get_notes_data_action = async (id) => {
		try {
			let response = await PROD_AXIOS_INSTANCE.post('/api/sales/v2/orglist/' + id + '/n', {
				data: {
					page: pageNotes,
					limit: onPage,
				},
				_token: CSRF_TOKEN,
			});
			console.log('response', response);
			if (response.data) {
				// if (props.changed_user_data){
				//     props.changed_user_data(response.data);
				// }
				setBaseNotesData(response.data.content);
				setLoading(false);
			}
		} catch (e) {
			console.log(e);
		} finally {
			setTimeout(() => {
				setLoading(false);
			}, 1000);
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
		if (PRODMODE) {
			setSaveProcess(20);
			try {
				let response = await PROD_AXIOS_INSTANCE.put('/api/sales/v2/updateorglist/' + itemId, {
					data: COLLECTOR,
					_token: CSRF_TOKEN,
				});
				console.log('response.status', response.status)
				if (response.status === 200){
          // При успешной записи - очищаем все временные списки и загружаем данные заново
					clearTemps();
					setIsAlertVisible(true);
					setAlertMessage(`Успех!`);
					setAlertDescription(response.message || 'Данные успешно обновлены');
					setAlertType('success');
					setSaveProcess(60);
        } else {
					setIsAlertVisible(true);
					setAlertMessage(`Произошла ошибка!`);
					setAlertDescription(response.message || 'Неизвестная ошибка сервера');
					setAlertType('error');
				}
			} catch (e) {
				console.log(e);
					setIsAlertVisible(true);
					setAlertMessage(`Ошибка на стороне сервера`);
					setAlertDescription(e.response?.data?.message || e.message || 'Неизвестная ошибка');
					setAlertType('error');
			} finally {
				// setLoadingOrgs(false)

			}
		} else {
			//setUserAct(USDA);
			// console.log('SEND', dataToUpdate);
			setTimeout(() => {
				setSaveProcess(100);
				setBlockOnSave(false);
		}, 2000);
			clearTemps();
		}

	};

	/** ----------------------- FETCHES -------------------- */



	useEffect(() => {
		if (PRODMODE){
			get_notes_data_action(itemId);
		}
	}, [pageNotes]);

	useEffect(() => {
		if (PRODMODE){
			get_org_calls_action(itemId);
		}
	}, [pageCalls]);

	useEffect(() => {
		if (PRODMODE){
			get_projects_data_action(itemId);
		}
	}, [pageProject]);


	const handleSaveData = () => {
		setBlockOnSave(true);
		setSaveProcess(5);
		setBlockOnSave(true);


		let saveData = {};
		setTimeout(() => {
			console.log('tempMainData', tempMainData)

			
			update_data_action();
			console.log('SAVEDATA FIN', COLLECTOR);
		}, 5000);

			setIsSmthChanged(false);
			setTempMainData(null);
	};



	// const handleMaintabObjectDataChange = (key, dataarr) => {
	// 	if (!editMode){ return; }
	// 	console.log('MAIN TAB OBJECT SETTER');
	// 	console.log(key, "-", dataarr);

	// 	if (key === 'emails'){
	// 		setTempMain_emails(dataarr);
	// 	} else if (key === 'active_licenses'){
	// 		setTempMain__an_licenses(dataarr);
	// 	} else if (key === 'active_tolerance'){
	// 		setTempMain_an_tolerances(dataarr);
	// 	} else if (key === 'active_licenses_bo'){
	// 		setTempMain_bo_licenses(dataarr);
	// 	} else if (key === 'requisites'){
	// 		setTempMain_an_requisites(dataarr);
	// 	} else if (key === 'phones'){
	// 		setTempMain_phones(dataarr);
	// 	// } else if (key === 'contacts'){
	// 	// 	setTempMain_contacts(dataarr);
	// 	} else if (key === 'address'){
	// 		setTempMain_addresses(dataarr);
	// 	} else if (key === 'legaladdresses'){
	// 		setTempMain_legalAddresses(dataarr);
	// 	} else if (key === 'emails'){
	// 		setTempMain_emails(dataarr);
	// 	}
	// };

	// useEffect(() => {
	// 	if (!editMode){ return; }
	// 	let copyData = tempMainData ? tempMainData :  JSON.parse(JSON.stringify(baseMainData));
	// 		if (copyData){
	// 			copyData.active_licenses =     tempMain_an_licenses;
	// 			copyData.active_tolerance =    tempMain_an_tolerances;
	// 			copyData.active_licenses_bo =  tempMain_bo_licenses;
	// 			copyData.legaladdresses =      tempMain_legalAddresses;
	// 			copyData.address =             tempMain_addresses;
	// 			copyData.emails =              tempMain_emails;
	// 			copyData.phones =              tempMain_phones;
	// 			copyData.requisites =          tempMain_an_requisites;
	// 			copyData.contacts =            tempMain_contacts;
	// 			setTempMainData(copyData);
	// 			console.log('END POINT ALT', copyData);
	// 		}
	// }, [
	// 	tempMain_an_licenses,
	// 	tempMain_an_tolerances,
	// 	tempMain_bo_licenses,
	// 	tempMain_legalAddresses,
	// 	tempMain_addresses,
	// 	tempMain_emails,
	// 	tempMain_phones,
	// 	tempMain_an_requisites,
	// 	tempMain_contacts
	// ]);







	const handleTabDataChange = (tab_name, data) => {
		if (!editMode) return;
		console.log('END POOINT', tab_name, data);
	 if (tab_name === 'projects'){
			if (JSON.stringify(data) !== JSON.stringify(baseProjectsData)){
				setTempProjectsData(data);
			} else {
				setTempProjectsData([]);
			}

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











		// useEffect(() => {
		// 	if (tempCallsData || tempNotesData || tempProjectsData || !IsSameComparedSomeOrgData(tempMainData, baseMainData)  ||
		// 		tempMain_addresses?.length > 0 || tempMain_an_licenses?.length > 0 || tempMain_an_requisites?.length > 0 ||
		// 		tempMain_an_requisites?.length > 0 || tempMain_an_tolerances?.length > 0 || tempMain_emails?.length > 0 ||
		// 		tempMain_legalAddresses?.length > 0 || tempMain_phones?.length > 0
		// 	){
		// 		console.log('CHANGE LISTENER', tempCallsData, tempNotesData, tempProjectsData);

		// 		setIsSmthChanged(true);
		// 	}  else 
		// 		{
		// 		setIsSmthChanged(false);
		// 	}
		// }, [tempCallsData, tempMainData, tempNotesData, tempProjectsData,
		// 	tempMain_addresses, tempMain_an_licenses, tempMain_an_requisites,
		// 	tempMain_an_requisites, tempMain_an_tolerances, tempMain_emails,
		// 	tempMain_legalAddresses, tempMain_phones
		// ]);

	const customClick = (button_id) => {
		if (button_id === 1){
			handleDiscard();
		}
		setIsOpenCustomModal(false)
	}


	
	// Очистка данных для сохранения (измененных)
	const clearTemps = () => {
		let iid = itemId;
		setSaveProcess(80);
		setItemId(0);
		get_main_data_action(iid);
		get_notes_data_action(iid);
		get_org_calls_action(iid);
		get_projects_data_action(iid);

			// if (tempMainData || tempMain_an_licenses || tempMain_an_tolerances || tempMain_bo_licenses ||
			// 	 tempMain_an_requisites || tempMain_addresses || tempMain_emails || tempMain_legalAddresses || tempMain_phones){
			// 	setTempMainData(null);
			// 	setTempMain_an_requisites([]);
			// 	setTempMain__an_licenses([]);
			// 	setTempMain_an_tolerances([]);
			// 	setTempMain_bo_licenses([]);
			// 	setTempMain_emails([]);
			// 	setTempMain_legalAddresses([]);
			// 	setTempMain_phones([]);
			// 	setTempMain_addresses([]);
			// 	setTempMain_contacts([]);

			// 	get_main_data_action(iid);
			// }
			setTimeout(() => {
				setTempMainData(null);
	
				setTempProjectsData([]);
				setTempCallsData([]);
				setTempNotesData([]);
				setTempMain__an_licenses([]);
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
			try {
					const format_data = {
						
						_token: CSRF_TOKEN,
						data: {
							id_org: itemId,
						},
					};
					let new_bid_response = await PROD_AXIOS_INSTANCE.post(
						"/api/curators/create",
						format_data,
					);
					if (new_bid_response) {
						alert("Заявка на кураторство отправлена");
					}
				} catch (e) {
					console.log(e);
					
			}
	}


	const handleMainDataChange = (data) => {
		if (itemId && editMode){
			setTempMainData(data);
		}
	}


	// const handleContactChange = (data)=>{
	// 	console.log('data', data);
	// 	// setTempMain_contacts(data.filter((item)=>item.action));
	// }

	// Подготовка Контактов к отправке
	const handleContactChange = (data)=>{
		console.log('data', data)
		if (data.command === 'create' && data.deleted){
			// Удаление только что добавленного
			setTempMain_contacts(tempMain_contacts.filter((item) => item.id !== data.id));
		} else {
			let existed = tempMain_contacts.find((item)=>item.id === data.id);
			if (!existed){
				if (data.command){
					setTempMain_contacts([data, ...tempMain_contacts]);
				}
			} else {
				setTempMain_contacts(tempMain_contacts.map((item) => (
					item.id === data.id ? data : item
				)))
			}
		}
	}

	// Подготовка адресов к отправке
	const handleAddressChange = (data)=>{
			if (data.command === 'create' && data.deleted){
				// Удаление только что добавленного
				setTempMain_addresses(tempMain_addresses.filter((item) => item.id !== data.id));
			} else {
				let existed = tempMain_addresses.find((item)=>item.id === data.id);
				if (!existed){
					if (data.command){
					setTempMain_addresses([data, ...tempMain_addresses]);
					}
				} else {
					setTempMain_addresses(tempMain_addresses.map((item) => (
						item.id === data.id ? data : item
					)))
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
			setTempMain__an_licenses(tempMain_an_licenses.filter((item) => item.id !== data.id));
		} else {
			let existed = tempMain_an_licenses.find((item)=>item.id === data.id);
			if (!existed){
				if (data.command){
					setTempMain__an_licenses([data, ...tempMain_an_licenses]);
				}
			} else {
				setTempMain__an_licenses(tempMain_an_licenses.map((item) => (
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
				console.log('COMMAND', data);
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
		console.log('section, id, data', section, id, data);
		if (section === 'notes'){
			let catchObject = tempNotesData.find((item)=> item.id === id);
			if (catchObject){
				if (data.action && data.action === 'delete' && data.id.contains('new')){
					// Удаление временного элемента из стека
					sectionDeleteHandler(section, id);
					return;
				}
				setTempNotesData(tempNotesData.map(item => item.id === id ? data : item));
			} else {
				setTempNotesData([data, ...tempNotesData]);
			}
		};
		if (section === 'projects'){
			let catchObject = tempProjectsData.find((item)=> item.id === id);
			if (catchObject){
				if (data.action && data.action === 'delete' && data.id.contains('new')){
					// Удаление временного элемента из стека
					sectionDeleteHandler(section, id);
					return;
				}
				setTempProjectsData(tempProjectsData.map(item => item.id === id ? data : item));
			} else {
				setTempProjectsData([data, ...tempProjectsData]);
			}
		};
		if (section === 'calls'){
			let catchObject = tempCallsData.find((item)=> item.id === id);
			if (catchObject){
				if (data.action && data.action === 'delete' && data.id.contains('new')){
					// Удаление временного элемента из стека
					sectionDeleteHandler(section, id);
					return;
				}
				setTempCallsData(tempCallsData.map(item => item.id === id ? data : item));
			} else {
				setTempCallsData([data, ...tempCallsData]);
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
										${'n' === tab.link && tempNotesData?.length ?    'sa-mite-has-some' : ''}
										${'p' === tab.link && tempProjectsData?.length ? 'sa-mite-has-some' : ''}
										${'c' === tab.link && tempCallsData?.length ?    'sa-mite-has-some' : ''}
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
          <Affix offsetTop={36}>    
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

								{!editMode && userdata?.user?.id !== baseMainData?.curator?.id && (
									<Button style={{marginRight: '12px'}}
										onClick={handleCallBecomeCurator}>
											Запрос.Кураторство
										</Button>
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
												disabled={blockOnSave || BLOCK_SAVE}
												onClick={handleSaveData}
												color="primary"
												variant="solid"
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
						</div>
            </Affix>  
						{blockOnSave && (
							<div className={'sa-orgpage-loader'}>
								<div className="sa-orgpage-loader-chunk" style={{ width: saveProcess + '%' }}></div>
							</div>
						)}

						{/* <div onClick={triggerEditMode}>
                                <PencilIcon height={'22px'}/> Редактировать
                            </div> */}

						{activeTab === 'o' && (
							// <OffersTabPage
							//     edit_mode={editMode}
							//     item_id={itemId}
							// />
							<OrgListModalOffersTab data={{ id: itemId }} environment={'editor'} />
						)}

						{activeTab === 'b' && (
							<OrgListModalBillsTab
								data={{ id: itemId }}
								environment={'editor'}
								// selects_data={selectsData}
								// org_name={orgName}
								// on_load={handleChangeName}
							/>
						)}

						<MainTabPage
							show={activeTab === 'm'}
							edit_mode={editMode}
							item_id={itemId}
							call_to_save={callToSaveAction}
							base_data={baseMainData}
							// on_save={handleDataChangeApprove}
							userdata={userdata}
              				selects={baseFiltersData}

							do_delay={(val)=>{setBlockDelay(val)}}
							// on_change_data={handleTabDataChange}
							// on_change_main_data_part={handleMaintabObjectDataChange}

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

						<CallsTabPage
							show={activeTab === 'c'}
							edit_mode={editMode}
							item_id={itemId}
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
							on_change_data={handleTabDataChange}
						/>

						<ProjectsTabPage
							show={activeTab === 'p'}
							edit_mode={editMode}
							item_id={itemId}
							call_to_save={callToSaveAction}
							base_data={baseProjectsData}
							// on_save={handleDataChangeApprove}
							active_page={pageProject}
							on_change_page={(p) => {
								setPageProject(p);
							}}
							current_page={pageProject}
							userdata={userdata}
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
							// on_save={handleDataChangeApprove}
							active_page={pageNotes}
							on_change_page={(p) => {
								setPageNotes(p);
							}}
							current_page={pageNotes}
							on_change_data={handleTabDataChange}
						/>

						{/* <NotesTabPage
							show={activeTab === 'n'}
							edit_mode={editMode}
							item_id={itemId}
							call_to_save={callToSaveAction}
							base_data={baseNotesData}
							// on_save={handleDataChangeApprove}
							active_page={pageNotes}
							on_change_page={(p) => {
								setPageNotes(p);
							}}
							current_page={pageNotes}
							userdata={userdata}
							on_change_data={handleTabDataChange}
						/> */}

						{activeTab === 'h' && (
							// <HistoryTabPage
							//     edit_mode={editMode}
							//     item_id={itemId}
							//  />
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

export default OrgPage;
