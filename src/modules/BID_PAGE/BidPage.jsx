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
} from 'antd';
import {useNavigate, useParams} from 'react-router-dom';
import {BASE_ROUTE, CSRF_TOKEN, PRODMODE} from '../../config/config';
import { PROD_AXIOS_INSTANCE } from '../../config/Api';
import './components/style/bidPage.css';
import { BID_INFO, CALC_INFO, CUR_COMPANY, CUR_CURRENCY, SELECTS } from './mock/mock';
import MODELS from './mock/mock_models';
import CurrencyMonitorBar from '../../components/template/CURRENCYMONITOR/CurrencyMonitorBar';
import {
	BlockOutlined,
	CopyOutlined,
	DeleteOutlined,
	DollarOutlined,
	DownloadOutlined,
	FilePdfOutlined,
	FileSearchOutlined,
	FileWordOutlined,
	HistoryOutlined,
	InfoCircleOutlined,
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
const { TextArea } = Input;

const BidPage = (props) => {
	const { bidId } = useParams();
	const navigate = useNavigate();
	const [isMounted, setIsMounted] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingSmall, setIsLoadingSmall] = useState(false);
	const [isNeedCalcMoney, setIsNeedCalcMoney] = useState(false);
	const [isSavingInfo, setIsSavingInfo] = useState(false);
	const [isAlertVisible, setIsAlertVisible] = useState(false);

	const [lastUpdModel, setLastUpdModel] = useState(null);
	const [isUpdateAll, setIsUpdateAll] = useState(false);

	const [userData, setUserData] = useState(null);

	const [alertMessage, setAlertMessage] = useState('');
	const [alertDescription, setAlertDescription] = useState('');
	const [alertType, setAlertType] = useState('');

	const [bidActions, setBidActions] = useState({
		'create': null,
		'update': null,
		'view': null,
	});
	const [openMode, setOpenMode] = useState({}); // просмотр, редактирование
	const [isSmthChanged, setIsSmthChanged] = useState(false);
	/* ШАПКА СТРАНИЦЫ */
	const [bidType, setBidType] = useState(null);
	const [bidIdCompany, setBidIdCompany] = useState(null);
	const [bidOrg, setBidOrg] = useState({});
	const [bidCurator, setBidCurator] = useState({});
	const [bidPlace, setBidPlace] = useState(null); // статус по пайплайну
	const [companyCurrency, setCompanyCurrency] = useState(null);
	const [bankCurrency, setBankCurrency] = useState(null);
	/* БАЗОВЫЙ БЛОК */
	const [bidOrgUser, setBidOrgUser] = useState('');
	const [bidProtectionProject, setBidProtectionProject] = useState('');
	const [bidObject, setBidObject] = useState('');
	const [bidSellBy, setBidSellBy] = useState(''); // срок реализации
	/* БЛОК ПЛАТЕЛЬЩИКА */
	const [requisite, setRequisite] = useState(null);
	const [conveyance, setConveyance] = useState(null);
	const [factAddress, setFactAddress] = useState(null);
	const [phone, setPhone] = useState(null);
	const [email, setEmail] = useState(null);
	const [insurance, setInsurance] = useState(null);
	const [bidPackage, setBidPackage] = useState(null);
	const [consignee, setConsignee] = useState('');
	const [otherEquipment, setOtherEquipment] = useState('');
	/* БЛОК КОММЕНТАРИЕВ */
	const [bidCommentEngineer, setBidCommentEngineer] = useState('');
	const [bidCommentManager, setBidCommentManager] = useState('');
	const [bidCommentAdmin, setBidCommentAdmin] = useState('');
	const [bidCommentAccountant, setBidCommentAccountant] = useState('');
	const [bidCommentAddEquipment, setBidCommentAddEquipment] = useState('');
	/* ФИНАНСОВЫЙ БЛОК */
	const [bidCurrency, setBidCurrency] = useState(0);
	const [bidPriceStatus, setBidPriceStatus] = useState(0);
	const [bidPercent, setBidPercent] = useState(0);
	const [bidNds, setBidNds] = useState(0);
	/* ЛОГИ */
	const [bidActionsLogs, setBidActionsLogs] = useState({});
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
	/* ОСТАЛЬНОЕ */
	const [modelIdExtra, setModelIdExtra] = useState(null);
	const [modelNameExtra, setModelNameExtra] = useState('');
	const [isProjectDataModalOpen, setIsProjectDataModalOpen] = useState(false);
	const [isBidDuplicateDrawerOpen, setIsBidDuplicateDrawerOpen] = useState(false);
	const [isBidHistoryDrawerOpen, setIsBidHistoryDrawerOpen] = useState(false);
	const [isBidFilesDrawerOpen, setIsBidFilesDrawerOpen] = useState(false);

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
		if (isSavingInfo) {
			fetchUpdates().then(() => {
				setTimeout(() => setIsSavingInfo(false), 500);
			});
		}
	}, [isSavingInfo]);
	useEffect(() => {
		const handleKeyDown = (event) => {
			console.log('event', event)
			if ((event.ctrlKey || event.metaKey) && event.key === 's') {
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
	}, []);
	useEffect(() => {
		if (isMounted && isNeedCalcMoney) {
			// && bidCurrency && bidPriceStatus && bidPercent && bidNds && bidModels
			const timer = setTimeout(() => {
				fetchCalcModels().then(() => {
					setIsNeedCalcMoney(false);
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
			try {
				let response = await PROD_AXIOS_INSTANCE.post(`/api/sales/v2/offers/${bidId}`, {
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
				}
			} catch (e) {
				console.log(e);
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
		}
	};
	const fetchSelects = async () => {
		if (PRODMODE) {
			try {
				let response = await PROD_AXIOS_INSTANCE.post('/api/sales/v2/bidselects', {
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
				}
			} catch (e) {
				console.log(e);
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
		}
	};
	const fetchOrgSelects = async () => {
		if (PRODMODE) {
			try {
				let response = await PROD_AXIOS_INSTANCE.post('/api/sales/v2/bidselects', {
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
			try {
				let response = await PROD_AXIOS_INSTANCE.post('/api/sales/v2/bidselects', {
					data: { orgUserId: bidOrgUser },
					_token: CSRF_TOKEN,
				});
				if (response.data && response.data.selects) {
					const selects = response.data.selects;
					setEmailSelect(selects.contact_email_select);
				}
			} catch (e) {
				console.log(e);
			}
		} else {
			setEmailSelect(SELECTS?.contact_email_select);
		}
	};
	const fetchCurrencySelects = async () => {
		if (PRODMODE) {
			try {
				let response = await PROD_AXIOS_INSTANCE.post('/api/currency/getcurrency', {
					data: {},
					_token: CSRF_TOKEN,
				});
				if (response.data) {
					setCompanyCurrency(response.data.company);
					setBankCurrency(response.data.currency);
				}
			} catch (e) {
				console.log(e);
			}
		} else {
			setCompanyCurrency(CUR_COMPANY);
			setBankCurrency(CUR_CURRENCY);
		}
	};
	const fetchBidModels = async () => {
		if (PRODMODE) {
			try {
				let response = await PROD_AXIOS_INSTANCE.get('/api/sales/getmodels', {
					data: {},
					_token: CSRF_TOKEN,
				});
				if (response.data) {
					setGarbage(response.data.info);
					setModelsSelect(response.data.models);
				}
			} catch (e) {
				console.log(e);
			}
		} else {
			setGarbage([]);
			setModelsSelect(MODELS);
		}
	};
	const fetchUpdates = async () => {
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
		if (PRODMODE) {
			try {
				let response = await PROD_AXIOS_INSTANCE.post(`/api/sales/updatebid/${bidId}`, {
					data,
					_token: CSRF_TOKEN,
				});
				if (response.data.message) {
					setIsAlertVisible(true);
					setAlertMessage('Успех!');
					setAlertDescription(response.data.message);
					setAlertType('success');
				}
			} catch (e) {
				console.log(e);
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
		}
	};
	const fetchCalcModels = async () => {
		console.log('fetchCalcModels');
		if (PRODMODE) {
			try {
				setIsLoadingSmall(true);
				let response = await PROD_AXIOS_INSTANCE.post('/api/sales/calcmodels', {
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
			try {
				let response = await PROD_AXIOS_INSTANCE.post('/api/sales/makedoc', {
					data: {
						bid_id: bidId,
						new: true,
						template_id: bidIdCompany - 1,
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
			}
		}
	};
	const fetchNewBid = async () => {
		if (PRODMODE) {
			try {
				let response = await PROD_AXIOS_INSTANCE.post('/sales/data/makebid', {
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
			}
		}
	};

	const prepareSelect = (select) => {
	  if (select) {
		  return select.map((item) => ({value: item.id, label: item.name}));
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
		  "model_count": null,
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
	const handleDeleteModelFromBid = (bidModelId) => {
	  const bidModelIdx = bidModels.findIndex(model => model.id === bidModelId);
	  const bidModelsUpd = JSON.parse(JSON.stringify(bidModels));
	  bidModelsUpd.splice(bidModelIdx, 1);
	  setBidModels(bidModelsUpd);
	  setIsNeedCalcMoney(true);
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
	  setIsNeedCalcMoney(true);
	  setLastUpdModel(newId);
	};
	const handleChangeModelInfo = (type, value, bidModelId, bidModelSort) => {
	  const bidModelIdx = bidModels.findIndex(model => (model.id === bidModelId && model.sort === bidModelSort));
	  const bidModelsUpd = JSON.parse(JSON.stringify(bidModels));
	  switch (type) {
		  case 'model_count':
			  bidModelsUpd[bidModelIdx].model_count = value;
			  setBidModels(bidModelsUpd);
			  setIsNeedCalcMoney(true);
			  setLastUpdModel(bidModels.find(model => model.id === bidModelId).model_id);
			  break;
		  case 'percent':
			  bidModelsUpd[bidModelIdx].percent = value;
			  setBidModels(bidModelsUpd);
			  setIsNeedCalcMoney(true);
			  setLastUpdModel(bidModels.find(model => model.id === bidModelId).model_id);
			  break;
		  case 'presence':
			  bidModelsUpd[bidModelIdx].presence = value;
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
							options={prepareSelect(orgUsersSelect)}
							onChange={(val) => setBidOrgUser(val)}
							disabled={openMode?.status === 1}
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
							disabled={openMode?.status === 1}
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
							disabled={openMode?.status === 1}
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
							disabled={openMode?.status === 1}
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
							disabled={openMode?.status === 1}
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
							disabled={openMode?.status === 1}
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
							disabled={openMode?.status === 1}
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
							disabled={openMode?.status === 1}
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
							disabled={openMode?.status === 1}
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
							disabled={openMode?.status === 1}
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
							disabled={openMode?.status === 1}
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
							disabled={openMode?.status === 1}
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
							disabled={openMode?.status === 1}
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
							disabled={openMode?.status === 1}
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
							disabled={openMode?.status === 1}
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
							disabled={openMode?.status === 1}
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
							disabled={openMode?.status === 1}
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
							disabled={openMode?.status === 1}
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
								setBidCurrency(val);
								setIsNeedCalcMoney(true);
								setIsUpdateAll(true);
							}}
							disabled={openMode?.status === 1}
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
								setBidPriceStatus(val);
								setIsNeedCalcMoney(true);
								setIsUpdateAll(true);
							}}
							disabled={openMode?.status === 1}
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
								setBidPercent(e.target.value);
								setIsNeedCalcMoney(true);
								setIsUpdateAll(true);
							}}
							disabled={openMode?.status === 1}
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
								setBidNds(val);
								setIsNeedCalcMoney(true);
								setIsUpdateAll(true);
							}}
							disabled={openMode?.status === 1}
						/>
					</div>
				</div>
			),
		},
	];

	return (
		<div className={'sa-bid-page-container'}>
			<Spin size="large" spinning={isLoading}>
				<div className={'sa-bid-page'}>
					<Affix>
						<div style={{ padding: '10px 12px 0 12px', backgroundColor: '#b4c9e1' }}>
							<div
								className={'sa-control-panel sa-flex-space sa-pa-12 sa-list-header'}
								style={{ margin: 0 }}
							>
								<div className={'sa-header-label-container'}>
									<div className={'sa-header-label-container-small'}>
										<h1 className={`sa-header-label`}>
											{+bidType === 1 ? 'Коммерческое предложение' : +bidType === 2 ? 'Счет' : ''}
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
														}}
														color="geekblue"
													>
														{bidOrg.name}
													</Tag>
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
											)}
										<Button
											type={'primary'}
											style={{ width: '150px' }}
											icon={<SaveOutlined />}
											loading={isSavingInfo}
											onClick={() => setIsSavingInfo(true)}
											disabled={openMode?.status === 1}
										>
											{isSavingInfo ? 'Сохраняем...' : 'Сохранить'}
										</Button>
									</div>
								</div>
							</div>
						</div>
					</Affix>
					<div className={'sa-bid-page-info-container'}>
						<div className={'sa-bid-page-btns-wrapper'}>
							<Tooltip title={'Дублировать'} placement={'right'}>
								<Button
									className={'sa-bid-page-btn'}
									color="primary"
									variant="outlined"
									icon={<CopyOutlined className={'sa-bid-page-btn-icon'} />}
									onClick={() => setIsBidDuplicateDrawerOpen(true)}
								></Button>
							</Tooltip>
							<Tooltip title={'История'} placement={'right'}>
								<Button
									className={'sa-bid-page-btn'}
									color="primary"
									variant="outlined"
									icon={<HistoryOutlined className={'sa-bid-page-btn-icon'} />}
									onClick={() => setIsBidHistoryDrawerOpen(true)}
								></Button>
							</Tooltip>
							<Tooltip title={'Сохранить в PDF'} placement={'right'}>
								<Button
									className={'sa-bid-page-btn'}
									color="primary"
									variant="outlined"
									icon={<FilePdfOutlined className={'sa-bid-page-btn-icon'} />}
									onClick={() => navigate(`/bidsPDF/${bidId}`)}
								></Button>
							</Tooltip>
							{+bidType === 1 && (
								<Tooltip title={'Сохранить в WORD'} placement={'right'}>
									<Button
										className={'sa-bid-page-btn'}
										color="primary"
										variant="outlined"
										icon={<FileWordOutlined className={'sa-bid-page-btn-icon'} />}
										onClick={() => fetchWordFile()}
									></Button>
								</Tooltip>
							)}
							{+bidType === 1 && (
								<Tooltip title={'Файлы'} placement={'right'}>
									<Badge count={bidFilesCount} color={'geekblue'}>
										<Button
											className={'sa-bid-page-btn'}
											color="primary"
											variant="outlined"
											icon={<DownloadOutlined className={'sa-bid-page-btn-icon'} />}
											onClick={() => setIsBidFilesDrawerOpen(true)}
										></Button>
									</Badge>
								</Tooltip>
							)}
							{+bidType === 1 && (
								<Tooltip title={'Создать счет'} placement={'right'}>
									<Button
										className={'sa-bid-page-btn'}
										color="primary"
										variant="outlined"
										icon={<DollarOutlined className={'sa-bid-page-btn-icon'} />}
										onClick={() => fetchNewBid()}
									></Button>
								</Tooltip>
							)}
							{+bidType === 2 && (
								<Tooltip title={'Счета'} placement={'right'}>
									<Badge count={bidFilesCount} color={'geekblue'}>
										<Button
											className={'sa-bid-page-btn'}
											color="primary"
											variant="outlined"
											icon={<DownloadOutlined className={'sa-bid-page-btn-icon'} />}
											onClick={() => setIsBidFilesDrawerOpen(true)}
										></Button>
									</Badge>
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
								<div
									className={'sa-models-table-cell sa-models-table-cell-header'}
									style={{ boxShadow: 'none' }}
								></div>
								<div className={'sa-models-table-cell sa-models-table-cell-header'}></div>
							</div>
							<div className={'sa-models-table'}>
								{bidModels
									.sort((a, b) => +a.sort - +b.sort)
									.map((bidModel, idx) => (
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
													openMode={openMode}
													onUpdateModelName={handleChangeModel}
												/>
											</div>
											<div className={'sa-models-table-cell'}>
												<ModelInput
													value={bidModel.model_count}
													bidModelId={bidModel.id}
													bidModelSort={bidModel.sort}
													openMode={openMode}
													type={'model_count'}
													onChangeModel={handleChangeModelInfo}
												/>
											</div>
											<div className={'sa-models-table-cell'}>
												<ModelInput
													value={bidModel.percent}
													bidModelId={bidModel.id}
													bidModelSort={bidModel.sort}
													openMode={openMode}
													type={'percent'}
													onChangeModel={handleChangeModelInfo}
												/>
											</div>
											<div className={'sa-models-table-cell'}>
												{(isLoadingSmall && +lastUpdModel === +bidModel.model_id) || isUpdateAll ? (
													<LoadingOutlined />
												) : (
													<p>{prepareAmount(+bidModel?.moneyOne, currencySymbol(bidModel))}</p>
												)}
											</div>
											<div className={'sa-models-table-cell'}>
												{(isLoadingSmall && +lastUpdModel === +bidModel.model_id) || isUpdateAll ? (
													<LoadingOutlined />
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
													openMode={openMode}
													type={'presence'}
													onChangeModel={handleChangeModelInfo}
												/>
											</div>
											<div
												className={'sa-models-table-cell'}
												style={{ padding: 0, boxShadow: 'none' }}
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
											<div className={'sa-models-table-cell'} style={{ padding: 0 }}>
												<Button
													color="danger"
													variant="filled"
													icon={<DeleteOutlined />}
													onClick={() => handleDeleteModelFromBid(bidModel.id)}
													disabled={openMode?.status === 1}
												></Button>
											</div>
										</div>
									))}
							</div>
							<div className={'sa-bid-models-footer'}>
								<div className={'sa-footer-btns'}>
									<Button
										style={{ width: '30%' }}
										color="primary"
										variant="outlined"
										icon={<PlusOutlined />}
										onClick={handleAddModel}
										disabled={openMode?.status === 1}
									>
										Добавить модель
									</Button>
									<Button
										style={{ width: '30%' }}
										color="primary"
										variant="filled"
										icon={<FileSearchOutlined />}
										disabled={openMode?.status === 1}
									>
										Анализ сырых данных
									</Button>
									<Button
										style={{ width: '30%' }}
										color="primary"
										variant="filled"
										icon={<BlockOutlined />}
										disabled={openMode?.status === 1}
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
													<LoadingOutlined />
												)}
											</div>
											<div className={'sa-footer-table-cell'}>
												<p>Высота шкафа: </p>
												{!isLoadingSmall ? (
													<p>
														<span>{prepareEngineerParameter(engineerParameters.box_size)}</span> U
													</p>
												) : (
													<LoadingOutlined />
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
													<LoadingOutlined />
												)}
											</div>
											<div className={'sa-footer-table-cell'}>
												<p>Вых. мощность: </p>
												{!isLoadingSmall ? (
													<p>
														<span>{prepareEngineerParameter(engineerParameters.max_power)}</span> Вт
													</p>
												) : (
													<LoadingOutlined />
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
													<LoadingOutlined />
												)}
											</div>
											<div className={'sa-footer-table-cell'}>
												<p>Масса: </p>
												{!isLoadingSmall ? (
													<p>
														<span>{prepareEngineerParameter(engineerParameters.mass)}</span> кг
													</p>
												) : (
													<LoadingOutlined />
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
													<LoadingOutlined />
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
				onOk={() => setIsProjectDataModalOpen(false)}
				onCancel={() => setIsProjectDataModalOpen(false)}
			>
				<ProjectInfo project={bidProject}/>
			</Modal>
			<ModelInfoExtraDrawer model_id={modelIdExtra}
								  model_name={modelNameExtra}
								  closeDrawer={handleCloseDrawerExtra}
			/>
			<BidDuplicationDrawer isOpenDrawer={isBidDuplicateDrawerOpen}
								  closeDrawer={() => setIsBidDuplicateDrawerOpen(false)}
								  bidId={bidId}
								  bidType={bidType}
			/>
			<BidHistoryDrawer isOpenDrawer={isBidHistoryDrawerOpen}
							  closeDrawer={() => setIsBidHistoryDrawerOpen(false)}
							  bidId={bidId}
							  bidActions={bidActions}
			/>
			<BidFilesDrawer isOpenDrawer={isBidFilesDrawerOpen}
							closeDrawer={() => setIsBidFilesDrawerOpen(false)}
							bidId={bidId}
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
