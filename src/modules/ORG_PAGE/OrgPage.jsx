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
import { Affix, Button, DatePicker, Input, Layout, Pagination, Select, Tag, Tooltip } from 'antd';

import { ArrowSmallLeftIcon } from '@heroicons/react/24/solid';
import {
	ArrowLeftCircleIcon,
	ClipboardDocumentCheckIcon,
	PencilIcon,
	PhoneXMarkIcon,
	XMarkIcon,
} from '@heroicons/react/24/outline';
import { CloseOutlined, LoadingOutlined } from '@ant-design/icons';

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

	const [itemId, setItemId] = useState(item_id ? item_id : 'new');

	const [backeReturnPath, setBackeReturnPath] = useState(null);

	// /** Пачка данных компании, но не все данные */
	// const [baseOrgData, setBaseOrgDate] = useState(null);

	const [openedFilters, setOpenedFilters] = useState(false);

	const [baseOrgs, setBaseOrgs] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]);

	const [baseMainData, setBaseMainData] = useState(null);
	const [baseProjectsData, setBaseProjectsData] = useState(null);
	const [baseCallsData, setBaseCallsData] = useState(null);
	const [baseNotesData, setBaseNotesData] = useState(null);

	// Контейнеры, куда сохраняются данные из вкладок при нажатии кнопки сохранить
	// Далее дебаунс вызывает фильтрацию данных и отправку на сервер
	const [tempMainData, setTempMainData] = useState(null);
	const [tempProjectsData, setTempProjectsData] = useState(null);
	const [tempCallsData, setTempCallsData] = useState(null);
	const [tempNotesData, setTempNotesData] = useState(null);

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

			setBaseMainData(ORGLIST_MODAL_MOCK_MAINTAB);
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
      }

    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);



	const handleDiscard = () => {
		if (isSmthChanged){
			let itt  = itemId;
			if (PRODMODE) {
				setItemId(0);
				setBaseMainData(null);
				setItemId(itt);
				setTimeout(() => {
					
					get_main_data_action(item_id);
					// get_notes_data_action(item_id);
					// get_org_calls_action(item_id);
					// get_projects_data_action(item_id);

				}, 500);
				} else {
					setItemId(0);
					setBaseMainData(null);

					setItemId(itt);
					setTimeout(() => {
						setBaseMainData(ORGLIST_MODAL_MOCK_MAINTAB);
						setBaseNotesData(MODAL_NOTES_LIST);
						setBaseProjectsData(MODAL_PROJECTS_LIST);
						setBaseCallsData(MODAL_CALLS_LIST);
	
					}, 500);

					clearTemps();
				}

		}
		setEditMode(false);
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
				setBaseMainData(response.data.content);
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
				setBaseCallsData(response.data.content.map((item)=>{
					item._savecontact = false;
					return item;
				}));
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

	const update_data_action = async (dataToUpdate) => {
		if (PRODMODE) {
			try {
				let response = await PROD_AXIOS_INSTANCE.put('/api/sales/v2/updateorglist/' + itemId, {
					data: dataToUpdate,
					_token: CSRF_TOKEN,
				});
				if (response){
          // При успешной записи - очищаем все временные списки и загружаем данные заново
					clearTemps();

        }
			} catch (e) {
				console.log(e);
			} finally {
				// setLoadingOrgs(false)

			}
		} else {
			//setUserAct(USDA);
			console.log('SEND', dataToUpdate);
		}
	};

	/** ----------------------- FETCHES -------------------- */

	/**
	 * Коллбэк при нажатии сохранить данные - находит разницу и отправляет на сервер, обновляет стейты
	 * @param {*} data
	 * @param {*} section
	 */
	const handleDataChangeApprove = (data, section) => {
		// setBlockOnSave(true);
		// const timer = setTimeout(() => {
		// 	switch (section) {
		// 		case 'main':
		// 			setTempMainData(data);
		// 			break;
		// 		case 'calls':
		// 			setTempCallsData(data);
		// 			break;
		// 		case 'projects':
		// 			setTempProjectsData(data);
		// 			break;
		// 		case 'notes':
		// 			setTempNotesData(data);
		// 			break;
		// 	}
		// }, 400);

		// return () => clearTimeout(timer);
	};

	useEffect(() => {
		if (PRODMODE){
			get_notes_data_action(item_id);
		}
	}, [pageNotes]);

	useEffect(() => {
		if (PRODMODE){
			get_org_calls_action(item_id);
		}
	}, [pageCalls]);

	useEffect(() => {
		if (PRODMODE){
			get_projects_data_action(item_id);
		}
	}, [pageProject]);

	const handleSaveData = () => {
		setBlockOnSave(true);
		setSaveProcess(5);
		setBlockOnSave(true);
		setTimeout(() => {
			setSaveProcess(100);
			setBlockOnSave(false);
		}, 2000);


		let saveData = {};
			if (tempMainData){
				saveData.orgData = tempMainData;
			}
			if (tempProjectsData && tempProjectsData.length > 0){
				saveData.projects = tempProjectsData;
			}
			if (tempCallsData && tempCallsData.length > 0){
				saveData.calls = tempCallsData;
			}
			if (tempNotesData && tempNotesData.length > 0){
				saveData.notes = tempNotesData;
			}
			
		update_data_action(saveData);
		console.log('SAVEDATA FIN', saveData);


			setIsSmthChanged(false);
	};

	useEffect(() => {
		if (editMode === false){ return; }
		console.log(tempMainData, tempNotesData, tempCallsData);
		console.log('isSmthChanged',isSmthChanged);
	}, [isSmthChanged]);

	const handleMaintabObjectDataChange = (key, dataarr) => {
		if (!editMode){ return; }
		console.log('MAIN TAB OBJECT SETTER');
		console.log(key, "-", dataarr);

		if (key === 'emails'){
			setTempMain_emails(dataarr);
		} else if (key === 'licenses'){
			setTempMain__an_licenses(dataarr);
		} else if (key === 'tolerances'){
			setTempMain_an_tolerances(dataarr);
		} else if (key === 'bo_licenses'){
			setTempMain_bo_licenses(dataarr);
		} else if (key === 'requisites'){
			setTempMain_an_requisites(dataarr);
		} else if (key === 'phones'){
			setTempMain_phones(dataarr);
		} else if (key === 'address'){
			setTempMain_addresses(dataarr);
		} else if (key === 'legaladdresses'){
			setTempMain_legalAddresses(dataarr);
		} else if (key === 'emails'){
			setTempMain_emails(dataarr);
		}
	};

	useEffect(() => {
		if (!editMode){ return; }
		let copyData = tempMainData ?  JSON.parse(JSON.stringify(tempMainData)) : {};
			if (copyData){
				copyData.active_licenses =     tempMain_an_licenses;
				copyData.active_tolerance =    tempMain_an_tolerances;
				copyData.active_licenses_bo =  tempMain_bo_licenses;
				copyData.legaladdresses =      tempMain_legalAddresses;
				copyData.address =             tempMain_addresses;
				copyData.emails =              tempMain_emails;
				copyData.phones =              tempMain_phones;
				copyData.requisites =          tempMain_an_requisites;
				
				setTempMainData(copyData);
				console.log('END POINT ALT', copyData);
			}
	}, [
		tempMain_an_licenses,
		tempMain_an_tolerances,
		tempMain_bo_licenses,
		tempMain_legalAddresses,
		tempMain_addresses,
		tempMain_emails,
		tempMain_phones,
		tempMain_an_requisites,
	]);


	const handleTabDataChange = (tab_name, data) => {
		console.log('END POOINT', tab_name, data);
		if (tab_name === 'main' && data && data.active_licenses){
			let copyData = JSON.parse(JSON.stringify(data));
			if (JSON.stringify(data) !== JSON.stringify(baseMainData)){
				copyData.active_licenses =     tempMain_an_licenses;
				copyData.active_tolerance =    tempMain_an_tolerances;
				copyData.active_licenses_bo =  tempMain_bo_licenses;
				copyData.legaladdresses =      tempMain_legalAddresses;
				copyData.address =             tempMain_addresses;
				copyData.emails =              tempMain_emails;
				copyData.phones =              tempMain_phones;
				copyData.requisites =          tempMain_an_requisites;
				
				setTempMainData(copyData);
			} else {
				setTempMainData(null);
			}

		} else if (tab_name === 'projects'){
			if (JSON.stringify(data) !== JSON.stringify(baseProjectsData)){
				setTempProjectsData(data);
			} else {
				setTempProjectsData(null);
			}

		} else if (tab_name === 'notes'){
			if (JSON.stringify(data) !== JSON.stringify(baseNotesData)){
				setTempNotesData(data);
			} else {
				setTempNotesData(null);
			}

		} else if (tab_name === 'calls'){
			if (JSON.stringify(data) !== JSON.stringify(baseCallsData)){
				setTempCallsData(data);
			} else {
				setTempCallsData(null);
			}

		}
		
	}

		useEffect(() => {
			if (tempCallsData || tempNotesData || tempProjectsData || tempMainData ||
				tempMain_addresses?.length > 0 || tempMain_an_licenses?.length > 0 || tempMain_an_requisites?.length > 0 ||
				tempMain_an_requisites?.length > 0 || tempMain_an_tolerances?.length > 0 || tempMain_emails?.length > 0 ||
				tempMain_legalAddresses?.length > 0 || tempMain_phones?.length > 0
			){
				console.log('CHANGE LISTENER', tempCallsData, tempNotesData, tempProjectsData);

				setIsSmthChanged(true);
			}  else 
				{
				setIsSmthChanged(false);
			}
		}, [tempCallsData, tempMainData, tempNotesData, tempProjectsData,
			tempMain_addresses, tempMain_an_licenses, tempMain_an_requisites,
			tempMain_an_requisites, tempMain_an_tolerances, tempMain_emails,
			tempMain_legalAddresses, tempMain_phones
		]);

	const customClick = (button_id) => {
		if (button_id === 1){
			handleDiscard();
		}
		setIsOpenCustomModal(false)
	}

	// Очистка данных для сохранения (измененных)
	const clearTemps = () => {
			if (tempMainData || tempMain_an_licenses || tempMain_an_tolerances || tempMain_bo_licenses ||
				 tempMain_an_requisites || tempMain_addresses || tempMain_emails || tempMain_legalAddresses || tempMain_phones){
				setTempMainData(null);
				setTempMain_an_requisites(null);
				setTempMain__an_licenses(null);
				setTempMain_an_tolerances(null);
				setTempMain_bo_licenses(null);
				setTempMain_emails(null);
				setTempMain_legalAddresses(null);
				setTempMain_phones(null);
				setTempMain_addresses(null);

				get_main_data_action(itemId);
			}
			if (tempProjectsData && tempProjectsData.length > 0){
					setTempProjectsData(null);
					get_projects_data_action(itemId);
				}
				if (tempCallsData && tempCallsData.length > 0){
					setTempCallsData(null);
					get_org_calls_action(itemId);
				}
				if (tempNotesData && tempNotesData.length > 0){
					setTempNotesData(null);
					get_notes_data_action(itemId);
				}


				if (tempMain_addresses && tempMain_addresses.length > 0){
					setTempMain_addresses(null);
				}

				if (tempMain_an_licenses && tempMain_an_licenses.length > 0){
					setTempMain__an_licenses(null);
				}

				if (tempMain_an_requisites && tempMain_an_requisites.length > 0){
					setTempMain_an_requisites(null);
				}


				if (tempMain_an_tolerances && tempMain_an_tolerances.length > 0){
					setTempMain_an_tolerances(null);
				}


				if (tempMain_bo_licenses && tempMain_bo_licenses.length > 0){
					setTempMain_bo_licenses(null);
				}

				if (tempMain_emails && tempMain_emails.length > 0){
					setTempMain_emails(null);
				}
				
				if (tempMain_legalAddresses && tempMain_legalAddresses.length > 0){
					setTempMain_legalAddresses(null);
				}

				if (tempMain_phones && tempMain_phones.length > 0){
					setTempMain_phones(null);
				}
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
										className={`sa-orp-menu-button  ${activeTab === tab.link ? 'active' : ''}`}
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
								{isSmthChanged && (
									<div style={{display: 'flex', alignItems: 'flex-end', paddingRight: '12px'}}>
										<Tooltip title={'Не забудьте сохранить'}>
											<Tag color='red-inverse'>Есть несохраненные данные</Tag>
										</Tooltip>
									</div>
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
												disabled={blockOnSave}
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
							on_save={handleDataChangeApprove}
							userdata={userdata}
              selects={baseFiltersData}
							on_change_data={handleTabDataChange}
							on_change_main_data_part={handleMaintabObjectDataChange}
						/>

						<CallsTabPage
							show={activeTab === 'c'}
							edit_mode={editMode}
							item_id={itemId}
							call_to_save={callToSaveAction}
							base_data={baseCallsData}
							on_save={handleDataChangeApprove}
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
							on_save={handleDataChangeApprove}
							active_page={pageProject}
							on_change_page={(p) => {
								setPageProject(p);
							}}
							current_page={pageProject}
							userdata={userdata}
							on_change_data={handleTabDataChange}
							selects={baseFiltersData}
						/>

						<NotesTabPage
							show={activeTab === 'n'}
							edit_mode={editMode}
							item_id={itemId}
							call_to_save={callToSaveAction}
							base_data={baseNotesData}
							on_save={handleDataChangeApprove}
							active_page={pageNotes}
							on_change_page={(p) => {
								setPageNotes(p);
							}}
							current_page={pageNotes}
							userdata={userdata}
							on_change_data={handleTabDataChange}
						/>

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
			</div>
		</>
	);
};

export default OrgPage;
