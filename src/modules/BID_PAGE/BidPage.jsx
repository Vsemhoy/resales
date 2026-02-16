import React, { useEffect, useState } from 'react';
import {
	Affix,
	Alert,
	Badge,
	Button,
	Collapse,
	Input, Modal,
	Select,
	Spin,
	Steps,
	Tag,
	Tooltip,
	Space, Empty, Divider, message
} from 'antd';
import {NavLink, useNavigate, useParams} from 'react-router-dom';
import {BASE_ROUTE, CSRF_TOKEN, HTTP_ROOT, PRODMODE} from '../../config/config';
import { PROD_AXIOS_INSTANCE } from '../../config/Api';
import './components/style/bidPage.css';
import {BID_INFO, CALC_INFO, CUR_COMPANY, CUR_CURRENCY, PROJECT, PROJECT_INFO, SELECTS} from './mock/mock';
import MODELS from './mock/mock_models';
import CurrencyMonitorBar from '../../components/template/CURRENCYMONITOR/CurrencyMonitorBar';
import {
	ArrowLeftOutlined,
	ArrowRightOutlined,
	BlockOutlined, CheckCircleOutlined, CheckOutlined,
	CopyOutlined,
	DeleteOutlined,
	DollarOutlined,
	DownloadOutlined,
	FilePdfOutlined,
	FileSearchOutlined,
	FileWordOutlined,
	HistoryOutlined,
	InfoCircleOutlined,
	LayoutOutlined,
	LoadingOutlined,
	MinusOutlined,
	PlusOutlined,
	SaveOutlined,
} from '@ant-design/icons';
import NameSelect from './components/NameSelect';
import ModelInput from './components/ModelInput';
import ModelSelect from './components/ModelSelect';
import ModelInfoExtraDrawer from "./components/ModelInfoExtraDrawer";
import ProjectInfo from "./components/ProjectInfo";
import BidDuplicationDrawer from "./components/BidDuplicationDrawer";
import BidHistoryDrawer from "../BID_LIST/components/BidHistoryDrawer";
import BidFilesDrawer from "../BID_LIST/components/BidFilesDrawer";
import DataParser from "./components/DataParser";
import FindSimilarDrawer from "./components/FindSimilarDrawer";
import dayjs from "dayjs";
import CustomModal from "../../components/helpers/modals/CustomModal";
import customModal from "../../components/helpers/modals/CustomModal";

import {useWebSocket} from "../../context/ResalesWebSocketContext";
import {useWebSocketSubscription} from "../../hooks/websockets/useWebSocketSubscription";

import OrgProjectEditorSectionBox from "../TORG_PAGE/components/sections/ext/OrgProjectEditorSectionBox.jsx"

import FindSimilar from "./components/FindSimilar";
const { TextArea } = Input;

const BidPage = (props) => {
	const { bidId } = useParams();
    const { connected, emit } = useWebSocket();
	const navigate = useNavigate();
	const [isMounted, setIsMounted] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingSmall, setIsLoadingSmall] = useState(false);
	const [isNeedCalcMoney, setIsNeedCalcMoney] = useState(false);
	const [isSavingInfo, setIsSavingInfo] = useState(false);
	const [isAlertVisible, setIsAlertVisible] = useState(false);

	const [lastUpdModel, setLastUpdModel] = useState(null);
	const [isUpdateAll, setIsUpdateAll] = useState(false);

	const [isOpenBaseInfo, setIsOpenBaseInfo] = useState(false);

	const [userData, setUserData] = useState(null);

	const [alertMessage, setAlertMessage] = useState('');
	const [alertDescription, setAlertDescription] = useState('');
	const [alertType, setAlertType] = useState('');

	const [bidActions, setBidActions] = useState({
		'create': null,
		'update': null,
		'view': null,
	});
	const [openMode, setOpenMode] = useState(null); // просмотр, редактирование
	const [isSmthChanged, setIsSmthChanged] = useState(false);
	const [defaultInfo, setDefaultInfo] = useState(null);
	/* ШАПКА СТРАНИЦЫ */
	const [bidType, setBidType] = useState(null);
	const [bidIdCompany, setBidIdCompany] = useState(null);
	const [bidOrg, setBidOrg] = useState({});
	const [bidCurator, setBidCurator] = useState({});
	const [bidPlace, setBidPlace] = useState(null); // статус по пайплайну
	const [companyCurrency, setCompanyCurrency] = useState(null);
	const [bankCurrency, setBankCurrency] = useState(null);
	/* БАЗОВЫЙ БЛОК */
	const [bidOrgUser, setBidOrgUser] = useState(null);
	const [bidProtectionProject, setBidProtectionProject] = useState(null);
	const [bidObject, setBidObject] = useState(null);
	const [bidSellBy, setBidSellBy] = useState(null); // срок реализации
	/* БЛОК ПЛАТЕЛЬЩИКА */
	const [requisite, setRequisite] = useState(null);
	const [conveyance, setConveyance] = useState(null);
	const [factAddress, setFactAddress] = useState(null);
	const [phone, setPhone] = useState(null);
	const [email, setEmail] = useState(null);
	const [insurance, setInsurance] = useState(null);
	const [bidPackage, setBidPackage] = useState(null);
	const [consignee, setConsignee] = useState(null);
	const [otherEquipment, setOtherEquipment] = useState(null);
	const [isSended1c, setIsSended1c] = useState(0);
	/* БЛОК КОММЕНТАРИЕВ */
	const [bidCommentEngineer, setBidCommentEngineer] = useState(null);
	const [bidCommentManager, setBidCommentManager] = useState(null);
	const [bidCommentAdmin, setBidCommentAdmin] = useState(null);
	const [bidCommentAccountant, setBidCommentAccountant] = useState(null);
	const [bidCommentAddEquipment, setBidCommentAddEquipment] = useState(null);
	/* ФИНАНСОВЫЙ БЛОК */
	const [bidCurrency, setBidCurrency] = useState(null);
	const [bidPriceStatus, setBidPriceStatus] = useState(null);
	const [bidPercent, setBidPercent] = useState(null);
	const [bidNds, setBidNds] = useState(null);
	/* ФАЙЛЫ */
	const [bidFilesCount, setBidFilesCount] = useState(0);
	/* ПРОЕКТ */
	const [bidProject, setBidProject] = useState(null); // проект из карточки организации
	/* МОДЕЛИ */
	const [bidModels, setBidModels] = useState([]);
	const [amounts, setAmounts] = useState({
		usd: 0,
		eur: 0,
		rub: 0,
	});
	const [engineerParameters, setEngineerParameters] = useState({
		unit: 0,
		box_size: 0,
		power_consumption: 0,
		max_power: 0,
		rated_power_speaker: 0,
		mass: 0,
		size: 0,
	});
	/* СЕЛЕКТ ПО МОДЕЛЯМ */
	const [modelsSelect, setModelsSelect] = useState([]);
	const [garbage, setGarbage] = useState([]);
	/* ВСЕ ОСТАЛЬНЫЕ СЕЛЕКТЫ */
	const [typeSelect, setTypeSelect] = useState([]);
	const [actionEnumSelect, setActionEnumSelect] = useState([]);
	const [adminAcceptSelect, setAdminAcceptSelect] = useState([]);
	const [bidCurrencySelect, setBidCurrencySelect] = useState([]);
	const [bidPresenceSelect, setBidPresenceSelect] = useState([]);
	const [completeSelect, setCompleteSelect] = useState([]);
	const [ndsSelect, setNdsSelect] = useState([]);
	const [packageSelect, setPackageSelect] = useState([]);
	const [paySelect, setPaySelect] = useState([]);
	const [presenceSelect, setPresenceSelect] = useState([]);
	const [priceSelect, setPriceSelect] = useState([]);
	const [protectionSelect, setProtectionSelect] = useState([]);
	const [stageSelect, setStageSelect] = useState([]);
	const [templateWordSelect, setTemplateWordSelect] = useState([]);
	const [companies, setCompanies] = useState([]);
	const [conveyanceSelect, setConveyanceSelect] = useState([]);
	const [insuranceSelect, setInsuranceSelect] = useState([]);
	/* ЭКСТРА СЕЛЕКТЫ */
	const [orgUsersSelect, setOrgUsersSelect] = useState([]);
	const [requisiteSelect, setRequisiteSelect] = useState([]);
	const [factAddressSelect, setFactAddressSelect] = useState([]);
	const [phoneSelect, setPhoneSelect] = useState([]);
	const [emailSelect, setEmailSelect] = useState([]);
	const [reasonsSelect, setReasonsSelect] = useState([]);
	/* ОСТАЛЬНОЕ */
	const [modelIdExtra, setModelIdExtra] = useState(null);
	const [modelNameExtra, setModelNameExtra] = useState('');
	const [isProjectDataModalOpen, setIsProjectDataModalOpen] = useState(false);
	const [isBidDuplicateDrawerOpen, setIsBidDuplicateDrawerOpen] = useState(false);
	const [isBidHistoryDrawerOpen, setIsBidHistoryDrawerOpen] = useState(false);
	const [isBidFilesDrawerOpen, setIsBidFilesDrawerOpen] = useState(false);
	const [isParseModalOpen, setIsParseModalOpen] = useState(false);
	const [isFindSimilarDrawerOpen, setIsFindSimilarDrawerOpen] = useState(false);
	const [isOpenCustomModal, setIsOpenCustomModal] = useState(false);
	const [customModalTitle, setCustomModalTitle] = useState('');
	const [customModalText, setCustomModalText] = useState('');
	const [customModalType, setCustomModalType] = useState('');
	const [customModalFilling, setCustomModalFilling] = useState([]);
	const [customModalButtons, setCustomModalButtons] = useState([]);
	const [customModalSelect, setCustomModalSelect] = useState(null);
	const [isLoading1c, setIsLoading1c] = useState(false);
	const [isLoadingChangePlaceBtn, setIsLoadingChangePlaceBtn] = useState('');
	const [projectInfo, setProjectInfo] = useState({
		id: null,
		id_orgs: null,
		id8an_projecttype: null,
		name: null,
		equipment: null,
		deleted: null,
		customer: null,
		address: null,
		stage: null,
		contactperson: null,
		id8staff_list: null,
		date: null,
		cost: null,
		bonus: null,
		comment: null,
		typepaec: null,
		date_end: null,
		erector_id: null,
		linkbid_id: null,
		date_create: null,
		id_company: null,
		author_id: null,
		author: null,
	});

	const [messageApi, contextHolder] = message.useMessage();
	const [socketTimestamp, setSocketTimestamp] = useState(0);
	const [findSimilarTitle, setFindSimilarTitle] = useState(`Поиск похожих`);


	useEffect(() => {
		if (!isMounted) {
			fetchInfo().then(() => {
				setIsNeedCalcMoney(true);
			});
			setIsMounted(true);
		}
	}, []);
	useEffect(() => {
		if (isMounted && bidOrg && bidOrg.id) {
			fetchOrgSelects().then();
		}
	}, [bidOrg]);
	useEffect(() => {
		if (isMounted && bidOrgUser) {
			fetchOrgUserSelects().then();
		}
	}, [bidOrgUser]);
	useEffect(() => {
		if (bidProject) {
			fetchProjectInfo().then();
		}
	}, [bidProject]);
    useEffect(() => {
		if (bidObject) {
            setFindSimilarTitle(`Поиск похожих: "${bidObject}"`);
        }
    }, [bidObject]);
	useEffect(() => {
		if (bidType) {
			document.title = `${+bidType === 1 ? 'КП' : +bidType === 2 ? 'Счет' : ''} | ${bidId}`;
		}
		return () => (document.title = 'Отдел продаж');
	}, [bidType]);
	useEffect(() => {
		if (props.userdata) {
			setUserData(props.userdata);
		}
	}, [props.userdata]);
    useEffect(() => {
		if (userData && userData.user) {
            setIsOpenBaseInfo(userData.user.sales_role === 2 || userData.user.sales_role === 3);
		}
	}, [userData]);
    useEffect(() => {
        console.log('CONNECTED bidPage', connected)
        if (connected) {
            const timestamp = +new Date();
            setSocketTimestamp(timestamp);
            emit('HIGHLIGHT_BID', {
                bidId: bidId,
                userId: props.userdata?.user?.id,
                userFIO: `${props.userdata?.user?.surname} ${props.userdata?.user?.name} ${props.userdata?.user?.secondname}`,
                timestamp,
            });

            return () => emit('UNHIGHLIGHT_BID', {
                bidId: bidId,
                userId: props.userdata?.user?.id,
                timestamp: socketTimestamp,
            });
        }
    }, [connected]);
	useEffect(() => {
		if (isSavingInfo) {
			fetchUpdates().then(() => {
				setTimeout(() => setIsSavingInfo(false), 500);
			});
		}
	}, [isSavingInfo]);
	useEffect(() => {
		if (openMode) {
			const handleKeyDown = (event) => {
				//console.log('event', event);
				if ((event.ctrlKey || event.metaKey) && event.code === 'KeyS' && openMode?.status !== 1 && openMode?.status !== 4 && openMode?.status !== 5) {
					event.preventDefault();
					setIsSavingInfo(prev => {
						if (!prev) {
							return true;
						}
						return prev;
					});
				}
			};

			window.addEventListener('keydown', handleKeyDown);
			return () => {
				window.removeEventListener('keydown', handleKeyDown);
			};
		}
	}, [openMode]);
	useEffect(() => {
		if (isMounted && isNeedCalcMoney) {
			// && bidCurrency && bidPriceStatus && bidPercent && bidNds && bidModels
			const timer = setTimeout(() => {
				fetchCalcModels().then(() => {
					//setIsNeedCalcMoney(false);
                    isNeedCalcModelsTimerSetter(false);
					setLastUpdModel(null);
					setIsUpdateAll(false);
				});
			}, 700);

			return () => clearTimeout(timer);
		}
	}, [isNeedCalcMoney]);
	useEffect(() => {
		if (isAlertVisible && alertType !== 'error') {
			const timer = setTimeout(() => {
				setIsAlertVisible(false);
			}, 3000);

			return () => clearTimeout(timer);
		}
	}, [isAlertVisible]);
	useEffect(() => {
		if (defaultInfo) {
			const bid = defaultInfo.bid;
			let flag = false;
			/* base info */
			if (+bid.base_info.orguser !== +bidOrgUser) flag = true;
			if (+bid.base_info.protection !== +bidProtectionProject) flag = true;
			if (bid.base_info.object !== bidObject) flag = true;
			if (bid.base_info.sellby !== bidSellBy) flag = true;
			/* bill */
			if (bid.bill) {
				if (+bid.bill.requisite !== +requisite) flag = true;
				if (+bid.bill.conveyance !== +conveyance) flag = true;
				if (+bid.bill.fact_address !== +factAddress) flag = true;
				if (+bid.bill.org_phone !== +phone) flag = true;
				if (+bid.bill.contact_email !== +email) flag = true;
				if (+bid.bill.insurance !== +insurance) flag = true;
				if (+bid.bill.package !== +bidPackage) flag = true;
				if (bid.bill.consignee !== consignee) flag = true;
				if (bid.bill.other_equipment !== otherEquipment) flag = true;
			}
			/* comments */
			if (bid.comments.engineer !== bidCommentEngineer) flag = true;
			if (bid.comments.manager !== bidCommentManager) flag = true;
			if (bid.comments.admin !== bidCommentAdmin) flag = true;
			if (bid.comments.accountant !== bidCommentAccountant) flag = true;
			if (bid.comments.add_equipment !== bidCommentAddEquipment) flag = true;
			/* finance */
			if (bid.finance.bid_currency !== bidCurrency) flag = true;
			if (bid.finance.status !== bidPriceStatus) flag = true;
			if (String(bid.finance.percent) !== String(bidPercent)) flag = true;
			if (bid.finance.nds !== bidNds) flag = true;
			/* bid_models */
			if (!areArraysEqual(defaultInfo.bid_models, bidModels)) flag = true;

			setIsSmthChanged(flag);
		}
	}, [
		/* base info */
		bidOrgUser, bidProtectionProject, bidObject, bidSellBy,
		/* bill */
		requisite, conveyance, factAddress, phone, email,
		insurance, bidPackage, consignee, otherEquipment,
		/* comments */
		bidCommentEngineer, bidCommentManager, bidCommentAdmin,
		bidCommentAccountant, bidCommentAddEquipment,
		/* finance */
		bidCurrency, bidPriceStatus, bidPercent, bidNds,
		/* bid_models */
		bidModels
	]);
    useEffect(() => {
        if (bidModels && bidModels.length > 0 && modelsSelect && modelsSelect.length > 0) {
            setModelsSelect(prev => {
                return prev.map((model) => {
                    if (bidModels.find(bidModel => +bidModel.model_id === +model.id)) {
                        return {
                            ...model,
                            used: true,
                        }
                    } else {
                        return {
                            ...model,
                            used: false,
                        }
                    }
                });
            });
        }
    }, [bidModels]);

	const fetchInfo = async () => {
		setIsLoading(true);
		await fetchBidInfo();
		await fetchBidModels();
		setTimeout(() => setIsLoading(false), 1000);
		await fetchSelects();
		await fetchCurrencySelects();
	};
	const fetchBidInfo = async () => {
		if (PRODMODE) {
			const path = `/api/sales/v2/offers/${bidId}`
			try {
				let response = await PROD_AXIOS_INSTANCE.post(path, {
					_token: CSRF_TOKEN,
				});
				console.log(response);
				if (response.data.content) {
					const content = response.data.content;
					const openMode = content?.openmode;
					setOpenMode(openMode);
					if (content.bid) {
						const bid = content?.bid;

						setBidActions(bid.actions);

						setBidIdCompany(bid.id_company);
						setBidType(bid.type);
						setBidPlace(bid.place);
						setBidFilesCount(bid.files_count);

						if (bid.base_info) {
							const baseInfo = bid.base_info;
							setBidOrg(baseInfo.org);
							setBidCurator(baseInfo.curator);
							setBidOrgUser(baseInfo.orguser);
							setBidProtectionProject(baseInfo.protection);
							setBidObject(baseInfo.object);
							setBidSellBy(baseInfo.sellby);
							setBidProject(baseInfo.project);
						}
						if (bid.bill) {
							const bill = bid.bill;
							setRequisite(bill.requisite);
							setConveyance(bill.conveyance);
							setFactAddress(bill.fact_address);
							setPhone(bill.org_phone);
							setEmail(bill.contact_email);
							setInsurance(bill.insurance);
							setBidPackage(bill.package);
							setConsignee(bill.consignee);
							setOtherEquipment(bill.other_equipment);
							setIsSended1c(bill.send1c);
						}
						if (bid.comments) {
							const comments = bid.comments;
							setBidCommentEngineer(comments.engineer);
							setBidCommentManager(comments.manager);
							setBidCommentAdmin(comments.admin);
							setBidCommentAccountant(comments.accountant);
							setBidCommentAddEquipment(comments.add_equipment);
						}
						if (bid.finance) {
							const finance = bid.finance;
							setBidCurrency(finance.bid_currency);
							setBidPriceStatus(finance.status);
							setBidPercent(finance.percent);
							setBidNds(finance.nds);
						}
					}
					if (content.bid_models) {
						setBidModels(content.bid_models);
					}
					setTimeout(() => {
						setDefaultInfo({
							bid: content.bid,
							bid_models: content.bid_models,
						});
					}, 500);
				}
				setIsLoadingChangePlaceBtn('');
			} catch (e) {
				console.log(e);
				setIsAlertVisible(true);
				setAlertMessage(`Произошла ошибка! ${path}`);
				setAlertDescription(e.response?.data?.message || e.message || 'Неизвестная ошибка');
				setAlertType('error');
				setIsLoadingChangePlaceBtn('');
			}
		} else {
			const openMode = BID_INFO?.openmode;
			setOpenMode(openMode);
			if (BID_INFO.bid) {
				const bid = BID_INFO?.bid;

				setBidActions(bid.actions);

				setBidIdCompany(bid.id_company);
				setBidType(bid.type);
				setBidPlace(bid.place);
				setBidFilesCount(bid.files_count);

				if (bid.base_info) {
					const baseInfo = bid.base_info;
					setBidOrg(baseInfo.org);
					setBidCurator(baseInfo.curator);
					setBidOrgUser(baseInfo.orguser);
					setBidProtectionProject(baseInfo.protection);
					setBidObject(baseInfo.object);
					setBidSellBy(baseInfo.sellby);
					setBidProject(baseInfo.project);
				}
				if (bid.bill) {
					const bill = bid.bill;
					setRequisite(bill.requisite);
					setConveyance(bill.conveyance);
					setFactAddress(bill.fact_address);
					setPhone(bill.org_phone);
					setEmail(bill.contact_email);
					setInsurance(bill.insurance);
					setBidPackage(bill.package);
					setConsignee(bill.consignee);
					setOtherEquipment(bill.other_equipment);
					setIsSended1c(bill.send1c);
				}
				if (bid.comments) {
					const comments = bid.comments;
					setBidCommentEngineer(comments.engineer);
					setBidCommentManager(comments.manager);
					setBidCommentAdmin(comments.admin);
					setBidCommentAccountant(comments.accountant);
					setBidCommentAddEquipment(comments.add_equipment);
				}
				if (bid.finance) {
					const finance = bid.finance;
					setBidCurrency(finance.bid_currency);
					setBidPriceStatus(finance.status);
					setBidPercent(finance.percent);
					setBidNds(finance.nds);
				}
			}
			if (BID_INFO.bid_models) {
				setBidModels(BID_INFO.bid_models);
			}
			setTimeout(() => {
				setDefaultInfo({
					bid: BID_INFO.bid,
					bid_models: BID_INFO.bid_models,
				});
			}, 500);
			setIsLoadingChangePlaceBtn('');
		}
	};
	const fetchSelects = async () => {
		if (PRODMODE) {
			const path = `/api/sales/v2/bidselects`;
			try {
				let response = await PROD_AXIOS_INSTANCE.post(path, {
					data: {},
					_token: CSRF_TOKEN,
				});
				if (response.data && response.data.selects) {
					const selects = response.data.selects;
					setTypeSelect(selects.type_select);
					setActionEnumSelect(selects.action_enum);
					setAdminAcceptSelect(selects.admin_accept_select);
					setBidCurrencySelect(selects.bid_currency_select);
					setBidPresenceSelect(selects.bid_presence_select);
					setCompleteSelect(selects.complete_select);
					setConveyanceSelect(selects.conveyance_select);
					setInsuranceSelect(selects.insurance_select);
					setNdsSelect(selects.nds_select);
					setPackageSelect(selects.package_select);
					setPaySelect(selects.pay_select);
					setPresenceSelect(selects.presence);
					setPriceSelect(selects.price_select);
					setProtectionSelect(selects.protection_select);
					setStageSelect(selects.stage_select);
					setTemplateWordSelect(selects.template_word_select);
					setCompanies(selects.companies);
                    setReasonsSelect(selects.reasons);
				}
			} catch (e) {
				console.log(e);
				setIsAlertVisible(true);
				setAlertMessage(`Произошла ошибка! ${path}`);
				setAlertDescription(e.response?.data?.message || e.message || 'Неизвестная ошибка');
				setAlertType('error');
			}
		} else {
			setTypeSelect(SELECTS.type_select);
			setActionEnumSelect(SELECTS.action_enum);
			setAdminAcceptSelect(SELECTS.admin_accept_select);
			setBidCurrencySelect(SELECTS.bid_currency_select);
			setBidPresenceSelect(SELECTS.bid_presence_select);
			setCompleteSelect(SELECTS.complete_select);
			setConveyanceSelect(SELECTS.conveyance_select);
			setInsuranceSelect(SELECTS.insurance_select);
			setNdsSelect(SELECTS.nds_select);
			setPackageSelect(SELECTS.package_select);
			setPaySelect(SELECTS.pay_select);
			setPresenceSelect(SELECTS.presence);
			setPriceSelect(SELECTS.price_select);
			setProtectionSelect(SELECTS.protection_select);
			setStageSelect(SELECTS.stage_select);
			setTemplateWordSelect(SELECTS.template_word_select);
			setCompanies(SELECTS.companies);
            setReasonsSelect(SELECTS.reasons);
		}
	};
	const fetchOrgSelects = async () => {
		if (PRODMODE) {
			const path = `/api/sales/v2/bidselects`;
			try {
				let response = await PROD_AXIOS_INSTANCE.post(path, {
					data: { orgId: bidOrg.id },
					_token: CSRF_TOKEN,
				});
				if (response.data && response.data.selects) {
					const selects = response.data.selects;
					setOrgUsersSelect(selects.orgusers_select);
					setRequisiteSelect(selects.requisite_select);
					setFactAddressSelect(selects.fact_address_select);
					setPhoneSelect(selects.org_phones_select);
				}
			} catch (e) {
				console.log(e);
				setIsAlertVisible(true);
				setAlertMessage(`Произошла ошибка! ${path}`);
				setAlertDescription(e.response?.data?.message || e.message || 'Неизвестная ошибка');
				setAlertType('error');
			}
		} else {
			setOrgUsersSelect(SELECTS.orgusers_select);
			setRequisiteSelect(SELECTS?.requisite_select);
			setFactAddressSelect(SELECTS?.fact_address_select);
			setPhoneSelect(SELECTS?.org_phones_select);
		}
	};
	const fetchOrgUserSelects = async () => {
		if (PRODMODE) {
			const path = `/api/sales/v2/bidselects`;
			try {
				let response = await PROD_AXIOS_INSTANCE.post(path, {
					data: { orgUserId: bidOrgUser },
					_token: CSRF_TOKEN,
				});
				if (response.data && response.data.selects) {
					const selects = response.data.selects;
					setEmailSelect(selects.contact_email_select);
				}
			} catch (e) {
				console.log(e);
				setIsAlertVisible(true);
				setAlertMessage(`Произошла ошибка! ${path}`);
				setAlertDescription(e.response?.data?.message || e.message || 'Неизвестная ошибка');
				setAlertType('error');
			}
		} else {
			setEmailSelect(SELECTS?.contact_email_select);
		}
	};
	const fetchCurrencySelects = async () => {
		if (PRODMODE) {
			const path = `/api/currency/getcurrency`;
			try {
				let response = await PROD_AXIOS_INSTANCE.post(path, {
					data: {},
					_token: CSRF_TOKEN,
				});
				if (response.data) {
					setCompanyCurrency(response.data.company);
					setBankCurrency(response.data.currency);
				}
			} catch (e) {
				console.log(e);
				setIsAlertVisible(true);
				setAlertMessage(`Произошла ошибка! ${path}`);
				setAlertDescription(e.response?.data?.message || e.message || 'Неизвестная ошибка');
				setAlertType('error');
			}
		} else {
			setCompanyCurrency(CUR_COMPANY);
			setBankCurrency(CUR_CURRENCY);
		}
	};
	const fetchBidModels = async () => {
		if (PRODMODE) {
			const path = `/api/sales/getmodels`;
			try {
				let response = await PROD_AXIOS_INSTANCE.get(path, {
					data: {},
					_token: CSRF_TOKEN,
				});
				if (response.data) {
					setGarbage(response.data.info);
					setModelsSelect(response.data.models);
				}
			} catch (e) {
				console.log(e);
				setIsAlertVisible(true);
				setAlertMessage(`Произошла ошибка! ${path}`);
				setAlertDescription(e.response?.data?.message || e.message || 'Неизвестная ошибка');
				setAlertType('error');
			}
		} else {
			setGarbage([]);
			setModelsSelect(MODELS);
		}
	};
	const fetchUpdates = async (newPlace) => {
		console.log('fetchUpdates');
		const data = {
			bid: {
				id: bidId,
				id_company: bidIdCompany,
				place: bidPlace,
				type: bidType,
				files_count: bidFilesCount,
				base_info: {
					org: bidOrg,
					curator: bidCurator,
					orguser: bidOrgUser,
					protection: bidProtectionProject,
					object: bidObject,
					sellby: bidSellBy,
				},
				bill:
					+bidType === 2
						? {
								requisite: requisite,
								conveyance: conveyance,
								fact_address: factAddress,
								org_phone: phone,
								contact_email: email,
								insurance: insurance,
								package: bidPackage,
								consignee: consignee,
								other_equipment: otherEquipment,
						  }
						: null,
				comments: {
					engineer: bidCommentEngineer,
					manager: bidCommentManager,
					admin: bidCommentAdmin,
					accountant: bidCommentAccountant,
					add_equipment: bidCommentAddEquipment,
				},
				finance: {
					bid_currency: bidCurrency,
					status: bidPriceStatus,
					percent: bidPercent,
					nds: bidNds,
				},
			},
			bid_models: bidModels,
		};
		console.log(data);
		const path = `/api/sales/updatebid/${bidId}`;
		if (PRODMODE) {
			try {
				let response = await PROD_AXIOS_INSTANCE.post(path, {
					data,
					_token: CSRF_TOKEN,
				});
				if (response.data.message) {
					setIsAlertVisible(true);
					setAlertMessage('Успех!');
					setAlertDescription(response.data.message);
					setAlertType('success');
					setIsSmthChanged(false);
					updateDefaultInfo();
				}
				if (newPlace && newPlace === 2) {
					if (isManagerDone()) {
						setBidPlace(2);
						fetchBidPlace(2).then(() => fetchBidInfo().then());
					} else {
						setIsAlertVisible(true);
						setAlertMessage('Заполните поля!');
						setAlertDescription('Эти поля должны быть заполнены: "Контактное лицо", "Плательщик", "Телефон"');
						setAlertType('warning');
					}
				} else if (newPlace && newPlace === 3) {
					if (isAdminDone()) {
						setBidPlace(3);
						fetchBidPlace(3).then(() => fetchBidInfo().then());
					} else {
						setIsAlertVisible(true);
						setAlertMessage('Заполните поля!');
						setAlertDescription('Количество моделей должно быть равно количеству на складе');
						setAlertType('warning');
					}
				}
			} catch (e) {
				console.log(e);
				setIsAlertVisible(true);
				setAlertMessage(`Произошла ошибка! ${path}`);
				setAlertDescription(e.response?.data?.message || e.message || 'Неизвестная ошибка');
				setAlertType('error');
			}
		} else {
			setIsAlertVisible(true);
			setAlertMessage(`Успех! ${path}`);
			setAlertDescription('Успешное обновление');
			setAlertType('success');
			setIsSmthChanged(false);
			updateDefaultInfo();
		}
	};
	const fetchCalcModels = async () => {
		console.log('fetchCalcModels');
		if (PRODMODE) {
			const path = `/api/sales/calcmodels`;
			try {
				setIsLoadingSmall(true);
				let response = await PROD_AXIOS_INSTANCE.post(path, {
					data: {
						bid_info: {
							bidCurrency,
							bidPriceStatus,
							bidPercent,
							bidNds,
						},
						bid_models: bidModels,
					},
					_token: CSRF_TOKEN,
				});
				if (response.data.content) {
					const content = response.data.content;
					if (content.models) setBidModels(content.models);
					if (content.amounts) setAmounts(content.amounts);
					if (content.models_data) setEngineerParameters(content.models_data);
				}
				setTimeout(() => setIsLoadingSmall(false), 500);
			} catch (e) {
				console.log(e);
				setIsAlertVisible(true);
				setAlertMessage(`Произошла ошибка! ${path}`);
				setAlertDescription(e.response?.data?.message || e.message || 'Неизвестная ошибка');
				setAlertType('error');
				setTimeout(() => setIsLoadingSmall(false), 500);
			}
		} else {
			setIsLoadingSmall(true);
			//setBidModels(CALC_INFO.models);
			//setAmounts(CALC_INFO.amounts);
			//setEngineerParameters(CALC_INFO.models_data);
			setTimeout(() => setIsLoadingSmall(false), 500);
		}
	};
	const fetchWordFile = async () => {
		if (PRODMODE) {
			const path = `/api/sales/makedoc`;
			try {
				let response = await PROD_AXIOS_INSTANCE.post(path, {
					data: {
						bid_id: bidId,
						new: true,
						template_id: +bidIdCompany - 1,
						type: 1
					},
					_token: CSRF_TOKEN,
				});
				if (response.data) {
					const parts = response.data.data.file_link.split('/');
					const withSlash = '/' + parts.slice(1).join('/');
					window.open(`${withSlash}`, '_blank', 'noopener,noreferrer');
					setBidFilesCount(bidFilesCount + 1);
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
	const fetchNewBid = async () => {
		if (PRODMODE) {
			const path = `/sales/data/makebid`;
			try {
				let response = await PROD_AXIOS_INSTANCE.post(path, {
					data: {
						bid: bidId,
						org: bidOrg.id,
						type: 2
					},
					_token: CSRF_TOKEN,
				});
				if (response.data) {
					window.open(`${BASE_ROUTE}/bids/${response.data.item_id}`, '_blank');
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
	const fetchBidPlace = async (newPlace, selectValue) => {
		console.log(selectValue)
		if (PRODMODE) {
			const path = `/sales/data/changebidstage`;
			try {
				let response = await PROD_AXIOS_INSTANCE.post(path, {
					bid_id: bidId,
					data: {
						bid: bidId,
						stage: newPlace,
						reason: selectValue
					},
					_token: CSRF_TOKEN,
				});
				if (response.data) {
					setIsAlertVisible(true);
					setAlertMessage('Успех!');
					setAlertDescription(response.data.message.message);
					setAlertType('success');
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
	const fetchSend1c = async () => {
		if (PRODMODE) {
			const path = `/api/sales/send1c/${bidId}`;
			try {
				console.log('send1c');
				setIsLoading1c(true);
				let response = await PROD_AXIOS_INSTANCE.post(path, {
					_token: CSRF_TOKEN,
				});
				if (response.data) {
					setIsAlertVisible(true);
					setAlertMessage('Успех!');
					setAlertDescription(response.data.message);
					setAlertType('success');
					setIsSended1c(1);
				}
				setTimeout(() => setIsLoading1c(false), 500);
			} catch (e) {
				console.log(e);
				setIsAlertVisible(true);
				setAlertMessage(`Произошла ошибка! ${path}`);
				setAlertDescription(e.response?.data?.message || e.message || 'Неизвестная ошибка');
				setAlertType('error');
				setTimeout(() => setIsLoading1c(false), 500);
			}
		} else {
			setIsLoading1c(true);
			setIsAlertVisible(true);
			setAlertMessage('Успех!');
			setAlertDescription("Заявка успешно передана в 1С");
			setAlertType('success');
			setIsSended1c(1);
			setTimeout(() => setIsLoading1c(false), 500);
		}
	};
	const fetchProjectInfo = async () => {
		if (PRODMODE) {
			const path = `/api/sales/v2/offers/project/${bidProject}`;
			try {
				let response = await PROD_AXIOS_INSTANCE.post(path, {
					_token: CSRF_TOKEN,
				});
				if (response.data?.content) {
					setProjectInfo(response.data?.content?.project);
				}
			} catch (e) {
				console.log(e);
				setIsAlertVisible(true);
				setAlertMessage(`Произошла ошибка! ${path}`);
				setAlertDescription(e.response?.data?.message || e.message || 'Неизвестная ошибка');
				setAlertType('error');
				setTimeout(() => setIsLoading1c(false), 500);
			}
		} else {
			setProjectInfo(PROJECT_INFO);
		}
	};

	const areArraysEqual = (arr1, arr2) => {
		// Проверка длины
		if (arr1.length !== arr2.length) return false;

		// Проверка каждого элемента
		return arr1.every((item, index) => {
			const item2 = arr2[index];

			// Если оба объекта
			if (typeof item === 'object' && item !== null &&
				typeof item2 === 'object' && item2 !== null) {
				return areObjectsEqual(item, item2);
			}

			// Для примитивов
			return item === item2;
		});
	};
	const areObjectsEqual = (obj1, obj2) => {
		const keys1 = Object.keys(obj1);
		const keys2 = Object.keys(obj2);

		//if (keys1.length !== keys2.length) return false;

		return keys1.every(key => {
			// Рекурсивная проверка для вложенных объектов
			if (typeof obj1[key] === 'object' && obj1[key] !== null &&
				typeof obj2[key] === 'object' && obj2[key] !== null) {
				return areObjectsEqual(obj1[key], obj2[key]);
			}
			if (key !== 'moneyOne' && key !== 'moneyCount') {
				return String(obj1[key]) === String(obj2[key]);
			} else {
				return true;
			}
		});
	};
	const prepareSelect = (select) => {
	  if (select) {
		  return select.map((item) => ({value: item.id, label: item.name, used: item.used}));
	  } else {
		  return [];
	  }
	};
	const countOfComments = () => {
	  return [
		  bidCommentEngineer,
		  bidCommentManager,
		  bidCommentAdmin,
		  bidCommentAccountant,
		  bidCommentAddEquipment
	  ].filter(comment => comment).length;
	};
	const prepareEngineerParameter = (engineerParameter) => {
	  const rounded = (+engineerParameter).toFixed(2);
	  return rounded % 1 === 0 ? Math.round(rounded) : rounded;
	};
	const prepareAmount = (amount, symbol) => {
	  const rounded = (+amount / 100).toFixed(2);
	  let formatted =  formatNumberWithSpaces(rounded % 1 === 0 ? Math.round(rounded) : rounded);
	  return formatted === `не число` ? <MinusOutlined /> : formatted + (symbol ? symbol : '');
	};
	const currencySymbol = (bidModel) => {
	  return +bidCurrency === 1 ? '₽' : +bidCurrency === 0 ? (bidModel.currency === 1 ? '€' : '$') : ''
	}
	const formatNumberWithSpaces = (number) => {
	  return new Intl.NumberFormat('ru-RU', {
		  minimumFractionDigits: 0,
		  maximumFractionDigits: 2
	  }).format(number);
	};
	const handleAddModel = () => {
	  let sort = 0;
	  if (bidModels && bidModels.length > 0) {
		  const lastModel = bidModels.sort((a, b) => +a.sort - +b.sort)[bidModels.length - 1];
		  sort = lastModel.sort + 1;
	  }
	  const bidModelsUpd = JSON.parse(JSON.stringify(bidModels));
	  bidModelsUpd.push({
		  "id": 0,
		  "bid_id": bidId,
		  "model_id": null,
		  "model_count": 1,
		  "model_name": "",
		  "not_available": 0,
		  "percent": null,
		  "presence": null,
		  "sort": sort,
		  "type_model": 0,
		  "currency": 0,
	  });
	  setBidModels(bidModelsUpd);
	};
	const handleDeleteModelFromBid = (bidModelId, bidModelSort, bidModelSelectId) => {
        const bidModelIdx = bidModels.findIndex(model => (model.id === bidModelId && model.sort === bidModelSort));
        const bidModelsUpd = JSON.parse(JSON.stringify(bidModels));
        bidModelsUpd.splice(bidModelIdx, 1);
        setBidModels(bidModelsUpd);
        setModelsSelect(prev => {
            const index = prev.findIndex(model => model.id === bidModelSelectId);
            if (index === -1) return prev;
            return prev.map((model, idx) => {
                if (+idx === +index) {
                    return {
                        ...model,
                        used: false,
                    }
                } else {
                    return model;
                }
            });
        });
	    //setIsNeedCalcMoney(true);
        isNeedCalcModelsTimerSetter(true);
	};
	const handleChangeModel = (newId, oldId, oldSort) => {
	  const newModel = modelsSelect.find(model => model.id === newId);
	  const oldModel = bidModels.find(model => (model.id === oldId && model.sort === oldSort));
	  const oldModelIdx = bidModels.findIndex(model => (model.id === oldId && model.sort === oldSort));
	  const newModelObj = {
		  "id": oldId,
		  "bid_id": bidId,
		  "model_id": newId,
		  "model_name": newModel.name,
		  "model_count": 1,
		  "not_available": 0,
		  "percent": 0,
		  "presence": -2,
		  "sort": oldModel.sort,
		  "type_model": newModel.type_model,
		  "currency": newModel.currency,
	  };
	  const bidModelsUpd = JSON.parse(JSON.stringify(bidModels));
	  bidModelsUpd[oldModelIdx] = newModelObj;
	  setBidModels(bidModelsUpd);
      setModelsSelect(prev => {
          const index = prev.findIndex(model => model.id === newId);
          if (index === -1) return prev;
          return prev.map((model, idx) => {
              if (+idx === +index) {
                  return {
                      ...model,
                      used: true,
                  }
              } else {
                  return {
                      ...model,
                      used: false,
                  };
              }
          });
      });
	  //setIsNeedCalcMoney(true);
      isNeedCalcModelsTimerSetter(true);
	  setLastUpdModel(newId);
	};
	const handleChangeModelInfo = (type, value, bidModelId, bidModelSort) => {
	  const bidModelIdx = bidModels.findIndex(model => (model.id === bidModelId && model.sort === bidModelSort));
	  const bidModelsUpd = JSON.parse(JSON.stringify(bidModels));
	  switch (type) {
		  case 'model_count':
			  bidModelsUpd[bidModelIdx].model_count = value;
			  setBidModels(bidModelsUpd);
			  //setIsNeedCalcMoney(true);
              isNeedCalcModelsTimerSetter(true);
			  setLastUpdModel(bidModels.find(model => model.id === bidModelId).model_id);
			  break;
		  case 'percent':
			  bidModelsUpd[bidModelIdx].percent = value;
			  setBidModels(bidModelsUpd);
			  //setIsNeedCalcMoney(true);
              isNeedCalcModelsTimerSetter(true);
			  setLastUpdModel(bidModels.find(model => model.id === bidModelId).model_id);
			  break;
		  case 'presence':
			  bidModelsUpd[bidModelIdx].presence = value;
			  setBidModels(bidModelsUpd);
			  break;
		  case 'sklad':
			  bidModelsUpd[bidModelIdx].sklad = value;
			  setBidModels(bidModelsUpd);
			  break;
	  }
	};
	const handleOpenModelInfoExtra = (modelId) => {
		setModelIdExtra(modelId);
		const name = bidModels.find(model => model.model_id === modelId).model_name;
		setModelNameExtra(name);
	};
	const handleCloseDrawerExtra = () => {
		setModelIdExtra(null);
		setModelNameExtra('');
	};
    const addParseModels = (dataToAdd) => {
        console.log(dataToAdd);

        if (!dataToAdd || !dataToAdd.length) return;

        // 🔁 Агрегируем dataToAdd: объединяем модели с одинаковым id, суммируя count
        const aggregatedData = dataToAdd.reduce((acc, item) => {
            const existing = acc.find(x => x.id === item.id);
            if (existing) {
                existing.count += item.count; // суммируем количество
            } else {
                acc.push({ ...item }); // глубокая копия, чтобы не мутировать оригинал
            }
            return acc;
        }, []);

        let sort = 0;
        if (bidModels && bidModels.length > 0) {
            // ✅ Безопасная сортировка: не мутировать оригинальный массив!
            const sorted = [...bidModels].sort((a, b) => a.sort - b.sort);
            sort = sorted[sorted.length - 1].sort;
        }

        // ✅ Используем aggregatedData вместо dataToAdd
        const arr = aggregatedData
            .filter(newModel =>
                modelsSelect.some(model => !model.used && model.id === newModel.id)
            )
            .map((newModel, idx) => {
                const model = modelsSelect.find(m => m.id === newModel.id);
                return {
                    id: 0,
                    bid_id: bidId,
                    model_id: model.id,
                    model_name: model.name,
                    model_count: newModel.count, // ← уже суммированное значение
                    not_available: 0,
                    percent: 0,
                    presence: -2,
                    sort: sort + idx + 1, // ← +1, если sort — последний номер, а не индекс (часто sort начинается с 1)
                    type_model: model.type_model,
                    currency: model.currency,
                };
            });

        // ✅ Без JSON.parse(JSON.stringify(...)) — используем spread для поверхностной копии (если объекты plain)
        setBidModels(prev => [...prev, ...arr]);
        isNeedCalcModelsTimerSetter(true);
        setIsParseModalOpen(false);
    };
	const updateDefaultInfo = () => {
		const defaultInfoUpd = JSON.parse(JSON.stringify(defaultInfo));
		defaultInfoUpd.bid.base_info.orguser = bidOrgUser;
		defaultInfoUpd.bid.base_info.protection = bidProtectionProject;
		defaultInfoUpd.bid.base_info.object = bidObject;
		defaultInfoUpd.bid.base_info.sellby = bidSellBy;

		if (defaultInfoUpd.bid.bill) {
			defaultInfoUpd.bid.bill.requisite = requisite;
			defaultInfoUpd.bid.bill.conveyance = conveyance;
			defaultInfoUpd.bid.bill.fact_address = factAddress;
			defaultInfoUpd.bid.bill.org_phone = phone;
			defaultInfoUpd.bid.bill.contact_email = email;
			defaultInfoUpd.bid.bill.insurance = insurance;
			defaultInfoUpd.bid.bill.package = bidPackage;
			defaultInfoUpd.bid.bill.consignee = consignee;
			defaultInfoUpd.bid.bill.other_equipment = otherEquipment;
		}

		defaultInfoUpd.bid.comments.engineer = bidCommentEngineer;
		defaultInfoUpd.bid.comments.manager = bidCommentManager;
		defaultInfoUpd.bid.comments.admin = bidCommentAdmin;
		defaultInfoUpd.bid.comments.accountant = bidCommentAccountant;
		defaultInfoUpd.bid.comments.add_equipment = bidCommentAddEquipment;

		defaultInfoUpd.bid.finance.bid_currency = bidCurrency;
		defaultInfoUpd.bid.finance.status = bidPriceStatus;
		defaultInfoUpd.bid.finance.percent = bidPercent;
		defaultInfoUpd.bid.finance.nds = bidNds;

		defaultInfoUpd.bid_models = bidModels;

		setDefaultInfo(defaultInfoUpd);
	};
	const openCustomModal = (type, title, text, filling, buttons) => {
		setCustomModalType(type);
		setCustomModalTitle(title);
		setCustomModalText(text);
		setCustomModalFilling(filling);
		setCustomModalButtons(buttons);
		setTimeout(() => setIsOpenCustomModal(true), 200);
	}
	const customClick = (button_id, selectValue) => {
		console.log(button_id)
		switch (customModalType) {
			case 'word':
				if (+button_id === 2) {
					setIsSavingInfo(true);
					setTimeout(() => fetchWordFile().then(), 200);
				}
				break;
            case 'pdf':
				if (+button_id === 2) {
					setIsSavingInfo(true);
					setTimeout(() => navigate(`/bidsPDF/${bidId}`), 200);
				}
				break;
            case 'duplicate':
				if (+button_id === 2) {
					setIsSavingInfo(true);
					setTimeout(() => setIsBidDuplicateDrawerOpen(true), 200);
				}
				break;
			case 'bill':
				if (+button_id === 2) {
					setIsSavingInfo(true);
					setTimeout(() => fetchNewBid().then(), 200);
				}
				break;
			case '1c':
				if (+button_id === 2) {
					fetchSend1c().then();
				}
				break;
			case 'toAdmin':
				if (+button_id === 2) {
					fetchUpdates(2).then();
                    setIsLoadingChangePlaceBtn('');
				}
				break;
			case 'backManager':
				openCustomModal(
					'backManagerWithSelect',
					'Вернуть менеджеру',
					'Укажите причину возврата менеджеру.',
					[<Select key="return-reason-select"
							 style={{width:'100%'}}
							 placeholder={'Причина возврата заявки'}
							 options={[]}
					/>],
					returnButtons
				);
				break;
			case 'backManagerWithSelect':
				if (+button_id === 2) {
					setBidPlace(1);
					fetchBidPlace(1, selectValue).then(() => fetchBidInfo().then());
				} else if (+button_id === 1) {
					setIsLoadingChangePlaceBtn('');
				}
				break;
			case 'toBuh':
				if (+button_id === 2) {
					fetchUpdates(3).then();
                    setIsLoadingChangePlaceBtn('');
				}
				break;
			case 'backAdminWithSelect':
				if (+button_id === 2) {
					setBidPlace(2);
					fetchBidPlace(2, selectValue).then(() => fetchBidInfo().then());
				} else if (+button_id === 1) {
					setIsLoadingChangePlaceBtn('');
				}
				break;
		}
		setIsOpenCustomModal(false);
	};
	const isErrorInput = (bidModelId) => {
		const model = bidModels.find(model => model.id === bidModelId);
		if (model && +model.model_count === +model.sklad) {
			return false;
		} else {
			return true;
		}
	};
	const isManagerDone = () => {
		return (bidOrgUser && requisite && phone);
	};
	const isAdminDone = () => {
		return !(bidModels.find(model => +model.model_count !== +model.sklad));
	};
	const isDisabledInput = () => {
		if (openMode?.status === 1 || openMode?.status === 5) return true;
	};
	const isDisabledInputManager = () => {
		return (openMode?.status !== 2);
	};
	const isDisabledInputAdmin = () => {
		return (openMode?.status !== 3);
	};
	const isDisabledInputBuh = () => {
		return (openMode?.status !== 4);
	};

	const baseButtons = [
		{
			id: 1,
			text: "Отменить",
			color: "default",
			variant: "outlined"
		},
		{
			id: 2,
			text: "Подтвердить и сохранить",
			color: "primary",
			variant: "solid"
		},
	];
	const returnButtons = [
		{
			id: 1,
			text: "Отменить",
			color: "default",
			variant: "outlined"
		},
		{
			id: 2,
			text: "Вернуть",
			color: "purple",
			variant: "solid"
		},
	];
	const buttons1C = [
		{
			id: 1,
			text: "Отменить",
			color: "default",
			variant: "outlined"
		},
		{
			id: 2,
			text: "Подтвердить повторную отправку в 1С",
			color: "danger",
			variant: "solid"
		},
	];

	const collapseItems = [
		{
			key: 1,
			label: <div style={{ display: 'flex' }}>Основная информация</div>,
			children: (
				<div className={'sa-info-list-hide-wrapper'}>
					<div className={'sa-info-list-row'}>
						<div className={'sa-list-row-label'}>
							<p>Контактное лицо</p>
						</div>
						<Select
							style={{ width: '100%', textAlign: 'left' }}
							value={bidOrgUser}
							showSearch
							optionFilterProp="label"
							filterOption={(input, option) =>
								(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
							}
							options={prepareSelect(orgUsersSelect)}
							onChange={(val) => setBidOrgUser(val)}
							disabled={isDisabledInputManager()}
							defaultValue={(orgUsersSelect && orgUsersSelect.length > 0) ? orgUsersSelect[orgUsersSelect.length - 1].id : null}
						/>
					</div>
					<div className={'sa-info-list-row'}>
						<div className={'sa-list-row-label'}>
							<p>Защита проекта</p>
						</div>
						<Select
							style={{ width: '100%', textAlign: 'left' }}
							value={bidProtectionProject}
							options={prepareSelect(protectionSelect)}
							onChange={(val) => setBidProtectionProject(val)}
							disabled={isDisabledInputManager()}
						/>
					</div>
					<div className={'sa-info-list-row'}>
						<div className={'sa-list-row-label'}>
							<p>Объект</p>
						</div>
						<Input
							style={{ width: '100%', height: '32px' }}
							value={bidObject}
							onChange={(e) => setBidObject(e.target.value)}
							disabled={isDisabledInputManager()}
						/>
					</div>
					<div className={'sa-info-list-row'}>
						<div className={'sa-list-row-label'}>
							<p>Срок реализации</p>
						</div>
						<Input
							style={{ width: '100%', height: '32px' }}
							value={bidSellBy}
							onChange={(e) => setBidSellBy(e.target.value)}
							disabled={isDisabledInputManager()}
						/>
					</div>
					<div className={'sa-info-list-row'}>
						<div className={'sa-list-row-label'}>
							<p>Связанный проект</p>
						</div>
						{bidProject ? (
							<Tag
								style={{
									width: '35px',
									height: '35px',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									cursor: 'pointer',
								}}
								color={'cyan'}
								onClick={() => setIsProjectDataModalOpen(true)}
							>
								{+bidProject}
							</Tag>
						) : (
							<MinusOutlined />
						)}
					</div>
                    <div className={'sa-info-list-row'}>
						<div className={'sa-list-row-label'}>
							<p>Дата создания</p>
						</div>
                        <Input
                            style={{ width: '100%', height: '32px' }}
                            value={bidActions.create?.date ? dayjs(bidActions.create?.date * 1000).format("DD.MM.YYYY HH:mm:ss") : ''}
                            disabled={true}
                        />
					</div>
				</div>
			),
		},
		{
			key: 2,
			label: <div style={{ display: 'flex' }}>Плательщик</div>,
			children: (
				<div className={'sa-info-list-hide-wrapper'}>
					<div className={'sa-info-list-row'}>
						<div className={'sa-list-row-label'}>
							<p>Плательщик</p>
						</div>
						<Select
							style={{ width: '100%', textAlign: 'left' }}
							value={requisite}
							options={prepareSelect(requisiteSelect)}
							onChange={(val) => setRequisite(val)}
							disabled={isDisabledInputManager()}
						/>
					</div>
					<div className={'sa-info-list-row'}>
						<div className={'sa-list-row-label'}>
							<p>Способ транспортировки</p>
						</div>
						<Select
							style={{ width: '100%', textAlign: 'left' }}
							value={conveyance}
							options={prepareSelect(conveyanceSelect)}
							onChange={(val) => setConveyance(val)}
							disabled={isDisabledInputManager()}
						/>
					</div>
					<div className={'sa-info-list-row'}>
						<div className={'sa-list-row-label'}>
							<p>Фактический адрес</p>
						</div>
						<Select
							style={{ width: '100%', textAlign: 'left' }}
							value={factAddress}
							options={prepareSelect(factAddressSelect)}
							onChange={(val) => setFactAddress(val)}
							disabled={isDisabledInputManager()}
							defaultValue={(factAddressSelect && factAddressSelect.length > 0) ? factAddressSelect[factAddressSelect.length - 1].id : null}
						/>
					</div>
					<div className={'sa-info-list-row'}>
						<div className={'sa-list-row-label'}>
							<p>Телефон</p>
						</div>
						<Select
							style={{ width: '100%', textAlign: 'left' }}
							value={phone}
							options={prepareSelect(phoneSelect)}
							onChange={(val) => setPhone(val)}
							disabled={isDisabledInputManager()}
							defaultValue={(phoneSelect && phoneSelect.length > 0) ? phoneSelect[phoneSelect.length - 1].id : null}
						/>
					</div>
					<div className={'sa-info-list-row'}>
						<div className={'sa-list-row-label'}>
							<p>Email</p>
						</div>
						<Select
							style={{ width: '100%', textAlign: 'left' }}
							value={email}
							options={prepareSelect(emailSelect)}
							onChange={(val) => setEmail(val)}
							disabled={isDisabledInputManager()}
							defaultValue={(emailSelect && emailSelect.length > 0) ? emailSelect[emailSelect.length - 1].id : null}
						/>
					</div>
					<div className={'sa-info-list-row'}>
						<div className={'sa-list-row-label'}>
							<p>Страховка</p>
						</div>
						<Select
							style={{ width: '100%', textAlign: 'left' }}
							value={insurance}
							options={prepareSelect(insuranceSelect)}
							onChange={(val) => setInsurance(val)}
							disabled={isDisabledInputManager()}
						/>
					</div>
					<div className={'sa-info-list-row'}>
						<div className={'sa-list-row-label'}>
							<p>Упаковка</p>
						</div>
						<Select
							style={{ width: '100%', textAlign: 'left' }}
							value={bidPackage}
							options={prepareSelect(packageSelect)}
							onChange={(val) => setBidPackage(val)}
							disabled={isDisabledInputManager()}
						/>
					</div>
					<div className={'sa-info-list-row'}>
						<div className={'sa-list-row-label'}>
							<p>Грузополучатель</p>
						</div>
						<Input
							style={{ width: '100%', height: '32px' }}
							value={consignee}
							onChange={(e) => setConsignee(e.target.value)}
							disabled={isDisabledInputManager()}
						/>
					</div>
					<div className={'sa-info-list-row'}>
						<div className={'sa-list-row-label'}>
							<p>Доп. оборудование</p>
						</div>
						<Input
							style={{ width: '100%', height: '32px' }}
							value={otherEquipment}
							onChange={(e) => setOtherEquipment(e.target.value)}
							disabled={isDisabledInputManager()}
						/>
					</div>
				</div>
			),
		},
		{
			key: 3,
			label: (
				<div style={{ display: 'flex' }}>
					Комментарии
					<Badge
						count={countOfComments()}
						color={'geekblue'}
						style={{ marginLeft: '8px', width: '20px' }}
					/>
				</div>
			),
			children: (
				<div className={'sa-info-list-hide-wrapper'}>
					<div className={'sa-info-list-row'}>
						<div className={'sa-list-row-label'}>
							<p>Комментарий инженера</p>
						</div>
						<TextArea
							value={bidCommentEngineer}
							autoSize={{ minRows: 2, maxRows: 6 }}
							onChange={(e) => setBidCommentEngineer(e.target.value)}
							disabled={isDisabledInput()}/**/
						/>
					</div>
					<div className={'sa-info-list-row'}>
						<div className={'sa-list-row-label'}>
							<p>Комментарий менеджера</p>
						</div>
						<TextArea
							value={bidCommentManager}
							autoSize={{ minRows: 2, maxRows: 6 }}
							onChange={(e) => setBidCommentManager(e.target.value)}
							disabled={isDisabledInputManager()}
						/>
					</div>
					<div className={'sa-info-list-row'}>
						<div className={'sa-list-row-label'}>
							<p>Комментарий администратора</p>
						</div>
						<TextArea
							value={bidCommentAdmin}
							autoSize={{ minRows: 2, maxRows: 6 }}
							onChange={(e) => setBidCommentAdmin(e.target.value)}
							disabled={isDisabledInputAdmin()}
						/>
					</div>
					<div className={'sa-info-list-row'}>
						<div className={'sa-list-row-label'}>
							<p>Комментарий бухгалтера</p>
						</div>
						<TextArea
							value={bidCommentAccountant}
							autoSize={{ minRows: 2, maxRows: 6 }}
							onChange={(e) => setBidCommentAccountant(e.target.value)}
							disabled={isDisabledInputBuh()}
						/>
					</div>
					<div className={'sa-info-list-row'}>
						<div className={'sa-list-row-label'}>
							<p>Дополнительное оборудование</p>
						</div>
						<TextArea
							value={bidCommentAddEquipment}
							autoSize={{ minRows: 2, maxRows: 6 }}
							onChange={(e) => setBidCommentAddEquipment(e.target.value)}
							disabled={isDisabledInput()}
						/>
					</div>
				</div>
			),
		},
		{
			key: 4,
			label: <div style={{ display: 'flex' }}>Финансовый блок</div>,
			children: (
				<div className={'sa-info-list-hide-wrapper'}>
					<div className={'sa-info-list-row'}>
						<div className={'sa-list-row-label'}>
							<p>Валюта</p>
						</div>
						<Select
							style={{ width: '100%', textAlign: 'left' }}
							value={bidCurrency}
							options={prepareSelect(bidCurrencySelect)}
							onChange={(val) => {
                                //const timerCurrency = setTimeout(() => {
                                    handleChangeFinanceBlock('bidCurrency', val);
                                //}, 700);
                                //return () => clearTimeout(timerCurrency);
							}}
							disabled={isDisabledInputManager()}
						/>
					</div>
					<div className={'sa-info-list-row'}>
						<div className={'sa-list-row-label'}>
							<p>Статус</p>
						</div>
						<Select
							style={{ width: '100%', textAlign: 'left' }}
							value={bidPriceStatus}
							options={prepareSelect(priceSelect)}
							onChange={(val) => {
                                //const timerPriceStatus = setTimeout(() => {
                                    handleChangeFinanceBlock('bidPriceStatus', val);
                                //}, 700);
                                //return () => clearTimeout(timerPriceStatus);
							}}
							disabled={isDisabledInputManager()}
						/>
					</div>
					<div className={'sa-info-list-row'}>
						<div className={'sa-list-row-label'}>
							<p>Добавить процент</p>
						</div>
						<Input
							style={{ width: '100%', height: '32px' }}
							value={bidPercent}
							type="number"
							onChange={(e) => {
                                //const timerPercent = setTimeout(() => {
                                    handleChangeFinanceBlock('bidPercent', e.target.value);
                                //}, 700);
                                //return () => clearTimeout(timerPercent);
							}}
							onWheel={(e) => e.target.blur()}
							disabled={isDisabledInputManager()}
						/>
					</div>
					<div className={'sa-info-list-row'}>
						<div className={'sa-list-row-label'}>
							<p>Вычесть НДС?</p>
						</div>
						<Select
							style={{ width: '100%', textAlign: 'left' }}
							value={bidNds}
							options={prepareSelect(ndsSelect)}
							onChange={(val) => {
                                //const timerNds = setTimeout(() => {
                                    handleChangeFinanceBlock('bidNds', val);
                                //}, 700);
                                //return () => clearTimeout(timerNds);
							}}
							disabled={isDisabledInputManager()}
						/>
					</div>
				</div>
			),
		},
	];

	const bufAlert = (content, type) => {
		messageApi.open({
			type: type,
			content: content,
		});
	};

	const handleClick = async (bidModelID) => {
		const result = modelsSelect.filter(item => item.id === bidModelID);

		try {
			await navigator.clipboard.writeText(result[0].name);
			console.log('Данные скопированы в буфер');
			bufAlert('Данные скопированы в буфер', 'success');
		} catch (err) {
			try {
				const textArea = document.createElement('textarea');
				textArea.value = result[0].name;
				document.body.appendChild(textArea);
				textArea.select();
				document.execCommand('copy');
				document.body.removeChild(textArea);
				bufAlert('Данные скопированы в буфер', 'success');
			} catch (err) {
				console.error('Ошибка копирования:', err);
				bufAlert('Проблемы с копированием в буфер', 'error');
			}
		}
	};

    const handleChangeFinanceBlock = (key, value) => {
        switch (key) {
            case 'bidCurrency':
                setBidCurrency(value);
                break;
            case 'bidPriceStatus':
                setBidPriceStatus(value);
                break;
            case 'bidPercent':
                setBidPercent(value);
                break;
            case 'bidNds':
                setBidNds(value);
                break;
        }
        //setIsNeedCalcMoney(true);
        isNeedCalcModelsTimerSetter(true);
        setIsUpdateAll(true);
    };

    const isNeedCalcModelsTimerSetter = (bool) => {
        const timer = setTimeout(() => {
            setIsNeedCalcMoney(bool);
        }, 500);

        return () => clearTimeout(timer);
    };

	return (
		<div className={'sa-bid-page-container'}>
			{contextHolder}
			<Spin size="large" spinning={isLoading}>
				<div className={'sa-bid-page'}>
					<Affix>
						<div style={{ padding: '10px 12px 0 12px' }}>
							<div
								className={'sa-control-panel sa-flex-space sa-pa-12 sa-list-header'}
								style={{ margin: 0 }}
							>
								<div className={'sa-header-label-container'}>
									<div className={'sa-header-label-container-small'}>
										<h1 className={`sa-header-label`}>
											{+bidType === 1 ? 'Коммерческое предложение ' : +bidType === 2 ? 'Счет ' : ''}
											<Tag style={{fontSize: '20px', lineHeight: '30px'}}>№{bidId}</Tag>
										</h1>
										<div className={'sa-bid-steps-currency'}>
											<div>
												<CurrencyMonitorBar />
											</div>
										</div>
									</div>
									<div className={'sa-header-label-container-small'}>
										{bidIdCompany &&
											companies &&
											companies.find((comp) => comp.id === bidIdCompany) &&
											bidOrg &&
											bidOrg.name && (
												<div className={'sa-vertical-flex'} style={{ alignItems: 'baseline' }}>
													От компании
													<Tag
														style={{
															textAlign: 'center',
															fontSize: '14px',
														}}
														color={companies.find((comp) => comp.id === bidIdCompany)?.color}
													>
														{companies.find((comp) => comp.id === bidIdCompany)?.name}
													</Tag>
													для
													<Tag
														style={{
															textAlign: 'center',
															fontSize: '14px',
															cursor: 'pointer',
														}}
														color="geekblue"
														onClick={() => window.open(`${BASE_ROUTE}/orgs/${bidOrg.id}`, '_blank')}
													>
														{bidOrg.name}
													</Tag>
                                                    <Tag style={{
                                                        textAlign: 'center',
                                                        fontSize: '14px',
                                                        cursor: 'pointer'
                                                    }}
                                                    >№{bidOrg.id}</Tag>
													Ваша роль:
													{userData && userData?.user?.sales_role === 1 && (
														<Tag color={'blue'}>менеджер</Tag>
													)}
													{userData && userData?.user?.sales_role === 2 && (
														<Tag color={'volcano'}>администратор</Tag>
													)}
													{userData && userData?.user?.sales_role === 3 && (
														<Tag color={'magenta'}>бухгалтер</Tag>
													)}
													{userData && userData?.user?.sales_role === 4 && (
														<Tag color={'gold'}>завершено</Tag>
													)}
													Режим:{' '}
													<Tooltip title={openMode.description}>
														<Tag color={openMode.color}>{openMode.tagtext}</Tag>
													</Tooltip>
													{isSmthChanged && (
														<Tooltip title={'Не забудьте сохранить'}>
															<Tag color='red-inverse'>Есть несохраненные данные</Tag>
														</Tooltip>
													)}
												</div>
											)
										}
										<div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
											{+bidType === 2 && +bidPlace === 1 && (
												<Space.Compact>
													<Button className={'sa-select-custom-admin'}
															disabled={isDisabledInput() || (isLoadingChangePlaceBtn && isLoadingChangePlaceBtn !== 'toAdmin')}
															loading={isLoadingChangePlaceBtn && isLoadingChangePlaceBtn === 'toAdmin'}
															onClick={() => {
																setIsLoadingChangePlaceBtn('toAdmin');
																if (isSmthChanged) {
																	openCustomModal(
																		'toAdmin',
																		'Передать администратору',
																		'У Вас есть несохраненные изменения! Подтвердите сохранение перед передачей администратору.',
																		[],
																		baseButtons
																	);
																} else {
																	if (isManagerDone()) {
																		setBidPlace(2);
																		fetchBidPlace(2).then(() => fetchBidInfo().then());
																	} else {
																		setIsAlertVisible(true);
																		setAlertMessage('Заполните поля!');
																		setAlertDescription('Эти поля должны быть заполнены: "Контактное лицо", "Плательщик", "Телефон"');
																		setAlertType('warning');
																		setIsLoadingChangePlaceBtn('');
																	}
																}
															}}
													>Передать администратору <ArrowRightOutlined /></Button>
												</Space.Compact>
											)}
											{+bidType === 2 && +bidPlace === 2 && (
												<Space.Compact>
													<Button className={'sa-select-custom-manager'}
															disabled={isDisabledInput() || (isLoadingChangePlaceBtn && isLoadingChangePlaceBtn !== 'backManager')}
															loading={isLoadingChangePlaceBtn && isLoadingChangePlaceBtn === 'backManager'}
															onClick={() => {
																setIsLoadingChangePlaceBtn('backManager');
																if (isSmthChanged) {
																	openCustomModal(
																		'backManager',
																		'Вернуть менеджеру',
																		'У Вас есть несохраненные изменения! Подтвердите сохранение перед тем как вернуть менеджеру.',
																		[],
																		baseButtons
																	);
																} else {
																	openCustomModal(
																		'backManagerWithSelect',
																		'Вернуть менеджеру',
																		'Укажите причину возврата менеджеру.',
																		[<Select key="return-reason-select"
																				 		style={{width:'100%'}}
																						placeholder={'Причина возврата заявки'}
																						options={prepareSelect(reasonsSelect)}
																		/>],
																		returnButtons
																	);
																}
															}}
													><ArrowLeftOutlined /> Вернуть менеджеру</Button>
													<Button className={'sa-select-custom-bugh'}
															disabled={isDisabledInput() || (isLoadingChangePlaceBtn && isLoadingChangePlaceBtn !== 'toBuh')}
															loading={isLoadingChangePlaceBtn && isLoadingChangePlaceBtn === 'toBuh'}
															onClick={() => {
																setIsLoadingChangePlaceBtn('toBuh');
																if (isSmthChanged) {
																	openCustomModal(
																		'toBuh',
																		'Передать бухгалтеру',
																		'У Вас есть несохраненные изменения! Подтвердите сохранение перед передачей бухгалтеру.',
																		[],
																		baseButtons
																	);
																} else {
																	if (isAdminDone()) {
																		setBidPlace(3);
																		fetchBidPlace(3).then(() => fetchBidInfo().then());
																	} else {
																		setIsAlertVisible(true);
																		setAlertMessage('Заполните поля!');
																		setAlertDescription('Количество моделей должно быть равно количеству на складе');
																		setAlertType('warning');
																		setIsLoadingChangePlaceBtn('');
																	}
																}
															}}
													>Передать бухгалтеру <ArrowRightOutlined /></Button>
												</Space.Compact>
											)}
											{+bidType === 2 && +bidPlace === 3 && (
												<Space.Compact>
													<Button className={'sa-select-custom-admin'}
															disabled={isDisabledInput() || (isLoadingChangePlaceBtn && isLoadingChangePlaceBtn !== 'backAdmin')}
															loading={isLoadingChangePlaceBtn && isLoadingChangePlaceBtn === 'backAdmin'}
															onClick={() => {
																setIsLoadingChangePlaceBtn('backAdmin');
																openCustomModal(
																	'backAdminWithSelect',
																	'Вернуть администратору',
																	'Укажите причину возврата администратору.',
																	[<Select key="return-reason-select"
																			 style={{width:'100%'}}
																			 placeholder={'Причина возврата заявки'}
																			 options={prepareSelect(reasonsSelect)}
																	/>],
																	returnButtons
																);
															}}
													><ArrowLeftOutlined /> Вернуть администратору</Button>
													<Button className={'sa-select-custom-end'}
															disabled={isDisabledInput() || (isLoadingChangePlaceBtn && isLoadingChangePlaceBtn !== 'done')}
															loading={isLoadingChangePlaceBtn && isLoadingChangePlaceBtn === 'done'}
															onClick={() => {
																setIsLoadingChangePlaceBtn('done');
																setBidPlace(4);
																fetchBidPlace(4).then(() => fetchBidInfo().then());
															}}
													>Завершить счет <CheckCircleOutlined /></Button>
												</Space.Compact>
											)}
											{+bidType === 2 && +bidPlace === 4 && (
												<Space.Compact>
													<Button className={'sa-select-custom-bugh'}
															disabled={openMode?.status !== 5 || (isLoadingChangePlaceBtn && isLoadingChangePlaceBtn !== 'backBuh')}
															loading={isLoadingChangePlaceBtn && isLoadingChangePlaceBtn === 'backBuh'}
															onClick={() => {
																setIsLoadingChangePlaceBtn('backBuh');
																setBidPlace(3);
																fetchBidPlace(3).then(() => fetchBidInfo().then());
															}}
													><ArrowLeftOutlined /> Вернуть бухгалтеру</Button>
												</Space.Compact>
											)}

											<Button
												type={'primary'}
												style={{ width: '150px' }}
												icon={<SaveOutlined />}
												loading={isSavingInfo}
												onClick={() => setIsSavingInfo(true)}
												disabled={isDisabledInput()} /* || openMode?.status === 4 */
											>
												{isSavingInfo ? 'Сохраняем...' : 'Сохранить'}
											</Button>
										</div>
									</div>
								</div>
							</div>
						</div>
					</Affix>
					<div className={isOpenBaseInfo ?  'sa-bid-page-info-container' : 'sa-bid-page-info-container-closed'}>

						<div className={'sa-bid-page-btns-wrapper'}>
                            <Tooltip title={'Основная информация'} placement={'right'}>
                                <Button
                                    className={'sa-bid-page-btn'}
                                    color="primary"
                                    variant={isOpenBaseInfo ? "solid" : "outlined"}
                                    icon={<LayoutOutlined className={'sa-bid-page-btn-icon'}/>}
                                    onClick={() => {
                                        setIsOpenBaseInfo(!isOpenBaseInfo);
                                    }}
                                ></Button>
                            </Tooltip>
							{+bidType === 1 && (
								<Tooltip title={'Сохранить в WORD'} placement={'right'}>
									<Button
										className={'sa-bid-page-btn'}
										color="primary"
										variant="outlined"
										icon={<FileWordOutlined className={'sa-bid-page-btn-icon'}/>}
										onClick={() => {
                                            if (isSmthChanged) {
                                                openCustomModal(
                                                    'word',
                                                    'Создание Word документа',
                                                    'У Вас есть несохраненные изменения! Подтвердите сохранение перед созданием документа.',
                                                    [],
                                                    baseButtons
                                                );
                                            } else {
                                                fetchWordFile().then();
                                            }
                                        }}
									></Button>
								</Tooltip>
							)}
							{(+bidType === 2 && bidPlace === 3 && (userData?.user?.sales_role === 3 || userData?.user?.super === 1)) && (
								<Tooltip title={isSended1c ? 'Уже было отправлено в 1С' : 'Отправить в 1С'} placement={'right'}>
									<Badge count={bidFilesCount} color={'geekblue'}>
										<Button
											className={'sa-bid-page-btn'}
											color={isSended1c ? "danger" : "primary"}
											variant="outlined"
											style={{fontSize: '20px', fontWeight: 'bold'}}
											disabled={isLoading1c}
											onClick={() => {
												if (isSended1c) {
													openCustomModal(
														'1c',
														'Отправить данные в 1С',
														'Данные уже были отправлены в 1С! Подтвердите повторную отправку данных.',
														[],
														buttons1C
													);
												} else {
													fetchSend1c().then();
												}
											}}
										>1С</Button>
									</Badge>
								</Tooltip>
							)}

							<Tooltip title={'Сохранить в PDF'} placement={'right'}>
								<Button
									className={'sa-bid-page-btn'}
									color="primary"
									variant="outlined"
									icon={<FilePdfOutlined className={'sa-bid-page-btn-icon'}/>}
									onClick={() => {
										if (isSmthChanged) {
											openCustomModal(
												'pdf',
												'Переход в интерфейс создания PDF-документа',
												'У Вас есть несохраненные изменения! Подтвердите сохранение перед сменой интерфейса.',
												[],
												baseButtons
											);
										} else {
											navigate(`/bidsPDF/${bidId}`);
										}
									}}
								></Button>
							</Tooltip>
							{+bidType === 1 && (
								<Tooltip title={'Файлы'} placement={'right'}>
									<Badge count={bidFilesCount} color={'geekblue'}>
										<Button
											className={'sa-bid-page-btn'}
											color="primary"
											variant="outlined"
											icon={<DownloadOutlined className={'sa-bid-page-btn-icon'}/>}
											onClick={() => setIsBidFilesDrawerOpen(true)}
										></Button>
									</Badge>
								</Tooltip>
							)}
							{+bidType === 2 && (
								<Tooltip title={'Счета'} placement={'right'}>
									<Badge count={bidFilesCount} color={'geekblue'}>
										<Button
											className={'sa-bid-page-btn'}
											color="primary"
											variant="outlined"
											icon={<DownloadOutlined className={'sa-bid-page-btn-icon'}/>}
											onClick={() => setIsBidFilesDrawerOpen(true)}
										></Button>
									</Badge>
								</Tooltip>
							)}
							<div className={'divider'}></div>
							<Tooltip title={'История'} placement={'right'}>
								<Button
									className={'sa-bid-page-btn'}
									color="primary"
									variant="outlined"
									icon={<HistoryOutlined className={'sa-bid-page-btn-icon'}/>}
									onClick={() => setIsBidHistoryDrawerOpen(true)}
								></Button>
							</Tooltip>
							{(userData?.user?.sales_role === 1 || userData?.user?.super === 1) && (
								<div className={'divider'}></div>
							)}
							{(userData?.user?.sales_role === 1 || userData?.user?.super === 1) && (
								<Tooltip title={'Дублировать'} placement={'right'}>
									<Button
										className={'sa-bid-page-btn'}
										color="primary"
										variant="outlined"
										icon={<CopyOutlined className={'sa-bid-page-btn-icon'}/>}
										onClick={() => {
                                            if (isSmthChanged) {
                                                openCustomModal(
                                                    'duplicate',
                                                    'Создание дубликата',
                                                    'У Вас есть несохраненные изменения! Подтвердите сохранение перед созданием дубликата.',
                                                    [],
                                                    baseButtons
                                                );
                                            } else {
                                                setIsBidDuplicateDrawerOpen(true);
                                            }
                                        }}
									></Button>
								</Tooltip>
							)}
							{+bidType === 1 && (
								<Tooltip title={'Создать счет'} placement={'right'}>
									<Button
										className={'sa-bid-page-btn'}
										color="primary"
										variant="outlined"
										icon={<DollarOutlined className={'sa-bid-page-btn-icon'}/>}
										onClick={() => {
											if (isSmthChanged) {
												openCustomModal(
													'bill',
													'Создание счета на базе КП',
													'У Вас есть несохраненные изменения! Подтвердите сохранение перед созданием нового счета.',
													[],
													baseButtons
												);
											} else {
												fetchNewBid().then();
											}
										}}
									></Button>
								</Tooltip>
							)}
						</div>

						<div className={'sa-bid-page-info-wrapper'}>
							<div className={'sa-info-models-header'}>Основные данные</div>
							{+bidType === 2 && (
								<div className={'custom-small-steps-container'}>
									<Steps
										className="sa-custom-steps custom-small-steps"
										progressDot
										size="small"
										current={+bidPlace - 1}
										items={[
											{
												title: 'Менеджер',
												description: +bidPlace === 1 ? 'Текущий этап' : '',
											},
											{
												title: 'Администратор',
												description: +bidPlace === 2 ? 'Текущий этап' : '',
											},
											{
												title: 'Бухгалтер',
												description: +bidPlace === 3 ? 'Текущий этап' : '',
											},
											{
												title: 'Завершено',
												description: +bidPlace === 4 ? 'Текущий этап' : '',
											},
										]}
									/>
								</div>
							)}
							<div className={'sa-info-list'}>
								<Collapse
									onChange={(val) => console.log(val)}
									size={'small'}
									defaultActiveKey={[1, 4]}
									items={collapseItems.filter((item) => {
										return !(bidType === 1 && item.key === 2);
									})}
								/>
							</div>
						</div>

						<div className={'sa-bid-page-models-wrapper'}>
							<div className={'sa-info-models-header'}>Спецификация оборудования и материалов</div>

							{ userData?.user?.sales_role === 1 ? (
								<div className={'sa-models-table-row sa-header-row'}>
									<div className={'sa-models-table-cell sa-models-table-cell-header'}>
										<p>№</p>
									</div>
									<div className={'sa-models-table-cell sa-models-table-cell-header'}>
										<p className={'align-left'}>Название</p>
									</div>
									<div className={'sa-models-table-cell sa-models-table-cell-header'}>
										<p className={'align-left'}>Кол-во</p>
									</div>
									<div className={'sa-models-table-cell sa-models-table-cell-header'}>
										<p className={'align-left'}>Процент</p>
									</div>
									<div className={'sa-models-table-cell sa-models-table-cell-header'}>
										<p>Цена</p>
									</div>
									<div className={'sa-models-table-cell sa-models-table-cell-header'}>
										<p>Сумма</p>
									</div>
									<div className={'sa-models-table-cell sa-models-table-cell-header'}>
										<p>Наличие</p>
									</div>
									<div className={'sa-models-table-cell sa-models-table-cell-header'}
										 style={{boxShadow: 'none'}}
									></div>
									<div className={'sa-models-table-cell sa-models-table-cell-header'}></div>
								</div>
							) : (
								<div className={'sa-models-table-row-two sa-header-row'}>
									<div className={'sa-models-table-cell sa-models-table-cell-header'}>
										<p>№</p>
									</div>
									<div className={'sa-models-table-cell sa-models-table-cell-header'}>
										<p className={'align-left'}>Название</p>
									</div>
									<div className={'sa-models-table-cell sa-models-table-cell-header'}>
										<p className={'align-left'}>Кол-во</p>
									</div>
									<div className={'sa-models-table-cell sa-models-table-cell-header'}>
										<p className={'align-left'}>Процент</p>
									</div>
									<div className={'sa-models-table-cell sa-models-table-cell-header'}>
										<p>Цена</p>
									</div>
									<div className={'sa-models-table-cell sa-models-table-cell-header'}>
										<p>Сумма</p>
									</div>
									<div className={'sa-models-table-cell sa-models-table-cell-header'}>
										<p>Наличие</p>
									</div>
									<div className={'sa-models-table-cell sa-models-table-cell-header'}>
										<p>Склад</p>
									</div>
									<div className={'sa-models-table-cell sa-models-table-cell-header'}
										 style={{boxShadow: 'none'}}
									></div>
								</div>
							)}
							{userData?.user?.sales_role === 1 ? (
								<div className={'sa-models-table'}>
									{(bidModels && bidModels.length > 0) ?
										bidModels.sort((a, b) => +a.sort - +b.sort).map((bidModel, idx) => (
											<div
												className={'sa-models-table-row'}
												key={`bid-model-${idx}-${bidModel.bid_id}-${bidModel.id}-${bidModel.sort}`}
											>
												<div className={'sa-models-table-cell'}>
													<p>{idx + 1}</p>
												</div>
												<div className={'sa-models-table-cell align-left'}>
													<NameSelect
														options={prepareSelect(modelsSelect)}
														model={bidModel}
														disabled={isDisabledInputManager()}
														onUpdateModelName={handleChangeModel}
													/>
												</div>
												<div className={'sa-models-table-cell'}>
													<ModelInput
														value={bidModel.model_count}
														bidModelId={bidModel.id}
														bidModelSort={bidModel.sort}
														disabled={isDisabledInputManager()}
														type={'model_count'}
                                                        isOnlyPositive={true}
														onChangeModel={handleChangeModelInfo}
													/>
												</div>
												<div className={'sa-models-table-cell'}>
													<ModelInput
														value={bidModel.percent}
														bidModelId={bidModel.id}
														bidModelSort={bidModel.sort}
														disabled={isDisabledInputManager()}
														type={'percent'}
                                                        isOnlyPositive={false}
														onChangeModel={handleChangeModelInfo}
													/>
												</div>
												<div className={'sa-models-table-cell'}>
													{(isLoadingSmall && +lastUpdModel === +bidModel.model_id) || isUpdateAll ? (
														<LoadingOutlined/>
													) : (
														<p>{prepareAmount(+bidModel?.moneyOne, currencySymbol(bidModel))}</p>
													)}
												</div>
												<div className={'sa-models-table-cell'}>
													{(isLoadingSmall && +lastUpdModel === +bidModel.model_id) || isUpdateAll ? (
														<LoadingOutlined/>
													) : (
														<p>{prepareAmount(+bidModel?.moneyCount, currencySymbol(bidModel))}</p>
													)}
												</div>
												<div className={'sa-models-table-cell'}>
													<ModelSelect
														options={prepareSelect(presenceSelect)}
														value={bidModel.presence}
														bidModelId={bidModel.id}
														bidModelSort={bidModel.sort}
														disabled={isDisabledInput()}
														type={'presence'}
														onChangeModel={handleChangeModelInfo}
													/>
												</div>
												<div
													className={'sa-models-table-cell'}
													style={{padding: 0, boxShadow: 'none'}}
												>
													{bidModel.model_id && (
														<Button
															color="primary"
															variant="filled"
															icon={<InfoCircleOutlined/>}
															onClick={() => handleOpenModelInfoExtra(bidModel.model_id)}
														></Button>
													)}
												</div>
												<div className={'sa-models-table-cell'} style={{padding: 0}}>
													<Button
														color="danger"
														variant="filled"
														icon={<DeleteOutlined/>}
														onClick={( ) => handleDeleteModelFromBid(bidModel.id, bidModel.sort, bidModel.model_id)}
														disabled={isDisabledInputManager()}
													></Button>
												</div>
											</div>
										)) : (
											<Empty/>
										)
									}
								</div>
							) : (
								<div className={'sa-models-table'}>
									{(bidModels && bidModels.length > 0) ?
										bidModels.sort((a, b) => +a.sort - +b.sort).map((bidModel, idx) => (
											<div
												className={`sa-models-table-row-two ${Math.random()}`}
												key={`bid-model-${idx}-${bidModel.bid_id}-${bidModel.id}-${bidModel.sort}-${Math.random()}`}
											>
												<div className={'sa-models-table-cell'}>
													<p>{idx + 1}</p>
												</div>
												<div className={'sa-models-table-cell align-left'}>
													<NameSelect
														options={prepareSelect(modelsSelect)}
														model={bidModel}
														disabled={isDisabledInputManager()}
														onUpdateModelName={handleChangeModel}
													/>

													<Button
														icon={<CopyOutlined />}
														onClick={() => handleClick(bidModel.model_id)}
													/>
												</div>
												<div className={'sa-models-table-cell'}>
													<ModelInput
														value={bidModel.model_count}
														bidModelId={bidModel.id}
														bidModelSort={bidModel.sort}
														disabled={isDisabledInputManager()}
														type={'model_count'}
														onChangeModel={handleChangeModelInfo}
														error={isErrorInput(bidModel.id)}
                                                        isOnlyPositive={true}
													/>
												</div>
												<div className={'sa-models-table-cell'}>
													<ModelInput
														value={bidModel.percent}
														bidModelId={bidModel.id}
														bidModelSort={bidModel.sort}
														disabled={isDisabledInputManager()}
														type={'percent'}
														onChangeModel={handleChangeModelInfo}
													/>
												</div>
												<div className={'sa-models-table-cell'}>
													{(isLoadingSmall && +lastUpdModel === +bidModel.model_id) || isUpdateAll ? (
														<LoadingOutlined/>
													) : (
														<p>{prepareAmount(+bidModel?.moneyOne, currencySymbol(bidModel))}</p>
													)}
												</div>
												<div className={'sa-models-table-cell'}>
													{(isLoadingSmall && +lastUpdModel === +bidModel.model_id) || isUpdateAll ? (
														<LoadingOutlined/>
													) : (
														<p>{prepareAmount(+bidModel?.moneyCount, currencySymbol(bidModel))}</p>
													)}
												</div>
												<div className={'sa-models-table-cell'}>
													<ModelSelect
														options={prepareSelect(presenceSelect)}
														value={bidModel.presence}
														bidModelId={bidModel.id}
														bidModelSort={bidModel.sort}
														disabled={(isDisabledInputManager() && isDisabledInputAdmin())}
														type={'presence'}
														onChangeModel={handleChangeModelInfo}
													/>
												</div>
												<div className={'sa-models-table-cell'}>
													<ModelInput
														value={bidModel.sklad}
														bidModelId={bidModel.id}
														bidModelSort={bidModel.sort}
														disabled={isDisabledInputAdmin()}
														type={'sklad'}
														onChangeModel={handleChangeModelInfo}
													/>
												</div>
												<div
													className={'sa-models-table-cell'}
													style={{padding: 0, boxShadow: 'none'}}
												>
													{bidModel.model_id && (
														<Button
															color="primary"
															variant="filled"
															icon={<InfoCircleOutlined/>}
															onClick={() => handleOpenModelInfoExtra(bidModel.model_id)}
														></Button>
													)}
												</div>
											</div>
										)) : (
											<Empty/>
										)
									}
								</div>
							)}

							<div className={'sa-bid-models-footer'}>
								<div className={'sa-footer-btns'}>
									<Button
										style={{width: '30%'}}
										color="primary"
										variant="outlined"
										icon={<PlusOutlined/>}
										onClick={handleAddModel}
										disabled={isDisabledInputManager()}
									>
										Добавить модель
									</Button>
									<Button
										style={{width: '30%'}}
										color="primary"
										variant="filled"
										icon={<FileSearchOutlined/>}
										onClick={() => setIsParseModalOpen(true)}
										disabled={isDisabledInputManager()}
									>
										Анализ сырых данных
									</Button>
									<Button
										style={{width: '30%'}}
										color="primary"
										variant="filled"
										icon={<BlockOutlined/>}
										onClick={() => setIsFindSimilarDrawerOpen(true)}
									>
										Похожие
									</Button>
								</div>
								<div className={'sa-footer-table-amounts'}>
									<div className={'sa-footer-table'}>
										<div className={'sa-footer-table-col'}>
											<div className={'sa-footer-table-cell'}>
												<p>Высота об-ния: </p>
												{!isLoadingSmall ? (
													<p>
														<span>{prepareEngineerParameter(engineerParameters.unit)}</span> U
													</p>
												) : (
													<LoadingOutlined/>
												)}
											</div>
											<div className={'sa-footer-table-cell'}>
												<p>Высота шкафа: </p>
												{!isLoadingSmall ? (
													<p>
														<span>{prepareEngineerParameter(engineerParameters.box_size)}</span> U
													</p>
												) : (
													<LoadingOutlined/>
												)}
											</div>
										</div>
										<div className={'sa-footer-table-col'}>
											<div className={'sa-footer-table-cell'}>
												<p>Потр. мощ.: </p>
												{!isLoadingSmall ? (
													<p>
														<span>
															{prepareEngineerParameter(engineerParameters.power_consumption)}
														</span>{' '}
														кВт
													</p>
												) : (
													<LoadingOutlined/>
												)}
											</div>
											<div className={'sa-footer-table-cell'}>
												<p>Вых. мощность: </p>
												{!isLoadingSmall ? (
													<p>
														<span>{prepareEngineerParameter(engineerParameters.max_power)}</span> Вт
													</p>
												) : (
													<LoadingOutlined/>
												)}
											</div>
										</div>
										<div className={'sa-footer-table-col'}>
											<div className={'sa-footer-table-cell'}>
												<p>Мощность АС: </p>
												{!isLoadingSmall ? (
													<p>
														<span>
															{prepareEngineerParameter(engineerParameters.rated_power_speaker)}
														</span>{' '}
														Вт
													</p>
												) : (
													<LoadingOutlined/>
												)}
											</div>
											<div className={'sa-footer-table-cell'}>
												<p>Масса: </p>
												{!isLoadingSmall ? (
													<p>
														<span>{prepareEngineerParameter(engineerParameters.mass)}</span> кг
													</p>
												) : (
													<LoadingOutlined/>
												)}
											</div>
										</div>
										<div className={'sa-footer-table-col'}>
											<div className={'sa-footer-table-cell'}>
												<p>Объем:</p>
												{!isLoadingSmall ? (
													<p>
														<span>{prepareEngineerParameter(engineerParameters.size)}</span> m3
													</p>
												) : (
													<LoadingOutlined/>
												)}
											</div>
										</div>
									</div>
									<div className={'sa-footer-amounts'}>
										<div className={'sa-footer-amounts-col'}>
											<div className={'sa-footer-amounts-cell'}>
												<p>Сумма в долларах</p>
											</div>
											<div className={'sa-footer-amounts-cell'}>
												<p>Сумма в евро</p>
											</div>
											<div className={'sa-footer-amounts-cell'}>
												<p>Сумма в рублях</p>
											</div>
										</div>
										<div className={'sa-footer-amounts-col'}>
											<div className={'sa-footer-amounts-cell cell-amount'}>
												{!isLoadingSmall ? (
													<p>{prepareAmount(amounts.usd)} $</p>
												) : (
													<LoadingOutlined />
												)}
											</div>
											<div className={'sa-footer-amounts-cell cell-amount'}>
												{!isLoadingSmall ? (
													<p>{prepareAmount(amounts.eur)} €</p>
												) : (
													<LoadingOutlined />
												)}
											</div>
											<div className={'sa-footer-amounts-cell cell-amount'}>
												{!isLoadingSmall ? (
													<p>{prepareAmount(amounts.rub)} ₽</p>
												) : (
													<LoadingOutlined />
												)}
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

					</div>
				</div>
			</Spin>
			<Modal
				title="Информация о связанном проекте"
				open={isProjectDataModalOpen}
				onCancel={() => setIsProjectDataModalOpen(false)}
				footer={null}
				className={'sa-bid-page-modal'}
				width={'830px'}
				styles={{
					body: {
						height: "450px",
						overflowY: "auto",
						width: '100%',
						display: 'flex',
						// justifyContent: 'center',
						alignItems: 'center',
					}
				}}
			>
				<OrgProjectEditorSectionBox
					color={"#2599c7ff"}
					data={projectInfo}
					on_delete={() => {}}
					on_change={() => {}}
					on_blur={() => {}}
					edit_mode={false}
				/>
			</Modal>
            <DataParser openModal={isParseModalOpen}
                        closeModal={() => setIsParseModalOpen(false)}
                        addParseModels={(dataToAdd) => addParseModels(dataToAdd)}
                        models={modelsSelect}
            />
            <Modal
                title={findSimilarTitle}
                open={isFindSimilarDrawerOpen}
                onCancel={() => setIsFindSimilarDrawerOpen(false)}
                footer={null}
                className={'sa-bid-page-modal'}
                width={'80%'}
                styles={{
                    body: {
                        height: "600px",
                        overflowY: "auto",
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                    }
                }}
            >
                <FindSimilar bid_id={bidId}
                             bid_models={bidModels}
                             protection_project={bidProtectionProject}
                             error_alert={(path, e) => {
                                 setIsAlertVisible(true);
                                 setAlertMessage(`Произошла ошибка! ${path}`);
                                 setAlertDescription(e.response?.data?.message || e.message || 'Неизвестная ошибка');
                                 setAlertType('error');
                             }}
                />
            </Modal>
            {/*<FindSimilarDrawer isOpenDrawer={isFindSimilarDrawerOpen}
                               closeDrawer={() => setIsFindSimilarDrawerOpen(false)}
                               bid_id={bidId}
                               bid_models={bidModels}
                               protection_project={bidProtectionProject}
                               error_alert={(path, e) => {
                                   setIsAlertVisible(true);
                                   setAlertMessage(`Произошла ошибка! ${path}`);
                                   setAlertDescription(e.response?.data?.message || e.message || 'Неизвестная ошибка');
                                   setAlertType('error');
                               }}
            />*/}
			<ModelInfoExtraDrawer model_id={modelIdExtra}
								  model_name={modelNameExtra}
								  closeDrawer={handleCloseDrawerExtra}
			/>
			<BidDuplicationDrawer isOpenDrawer={isBidDuplicateDrawerOpen}
								  closeDrawer={() => setIsBidDuplicateDrawerOpen(false)}
								  bidId={bidId}
								  bidType={bidType}
								  error_alert={(path, e) => {
									  setIsAlertVisible(true);
									  setAlertMessage(`Произошла ошибка! ${path}`);
									  setAlertDescription(e.response?.data?.message || e.message || 'Неизвестная ошибка');
									  setAlertType('error');
								  }}
			/>
			<BidHistoryDrawer isOpenDrawer={isBidHistoryDrawerOpen}
							  closeDrawer={() => setIsBidHistoryDrawerOpen(false)}
							  bidId={bidId}
							  bidActions={bidActions}
							  error_alert={(path, e) => {
								  setIsAlertVisible(true);
								  setAlertMessage(`Произошла ошибка! ${path}`);
								  setAlertDescription(e.response?.data?.message || e.message || 'Неизвестная ошибка');
								  setAlertType('error');
							  }}
			/>
			<BidFilesDrawer isOpenDrawer={isBidFilesDrawerOpen}
							closeDrawer={() => setIsBidFilesDrawerOpen(false)}
							bidId={bidId}
                            bidType={bidType}
							error_alert={(path, e) => {
								setIsAlertVisible(true);
								setAlertMessage(`Произошла ошибка! ${path}`);
								setAlertDescription(e.response?.data?.message || e.message || 'Неизвестная ошибка');
								setAlertType('error');
							}}
			/>
			<CustomModal
				customClick={customClick}
				customType={customModalType}
				customText={customModalText}
				customTitle={customModalTitle}
				customFilling={customModalFilling}
				customButtons={customModalButtons}
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
	);
};

export default BidPage;
