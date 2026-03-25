import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
	Affix,
	Badge,
	Button,
	Collapse,
	Input, Modal,
	Select,
	Spin,
	Steps,
	Tag,
	Tooltip,
	Space, Divider, message
} from 'antd';
import {NavLink, useNavigate, useParams} from 'react-router-dom';
import {BASE_ROUTE, CSRF_TOKEN, HTTP_HOST, HTTP_ROOT, PRODMODE, ROUTE_PREFIX} from '../../config/config';
import { PROD_AXIOS_INSTANCE } from '../../config/Api';
import './components/style/bidPage.css';
import {BID_INFO, CALC_INFO, CUR_COMPANY, CUR_CURRENCY, PROJECT_INFO, SELECTS} from './mock/mock';
import MODELS from './mock/mock_models';
import {
	CheckOutlined,
	LoadingOutlined,
	MinusOutlined,
} from '@ant-design/icons';
import ModelInfoExtraDrawer from "./components/ModelInfoExtraDrawer";
import ProjectInfo from "./components/ProjectInfo";
import BidDuplicationDrawer from "./components/BidDuplicationDrawer";
import BidHistoryDrawer from "../BID_LIST/components/BidHistoryDrawer";
import BidFilesDrawer from "../BID_LIST/components/BidFilesDrawer";
import DataParser from "./components/DataParser";
import FindSimilarDrawer from "./components/FindSimilarDrawer";
import { BidCommentsSection } from "./components/BidCommentsSection";
import { BidBaseInfoSection } from "./components/BidBaseInfoSection";
import { BidBillSection } from "./components/BidBillSection";
import { BidFinanceSection } from "./components/BidFinanceSection";
import { BidActionsToolbar } from "./components/BidActionsToolbar";
import { BidPageHeader } from "./components/BidPageHeader";
import { BidModelsTable } from "./components/BidModelsTable";
import { BidModelsFooter } from "./components/BidModelsFooter";
import dayjs from "dayjs";
import CustomModal from "../../components/helpers/modals/CustomModal";
import customModal from "../../components/helpers/modals/CustomModal";

import {useWebSocket} from "../../context/ResalesWebSocketContext";
import {useWebSocketSubscription} from "../../hooks/websockets/useWebSocketSubscription";

import OrgProjectEditorSectionBox from "../TORG_PAGE/components/sections/ext/OrgProjectEditorSectionBox.jsx"

import FindSimilar from "./components/FindSimilar";
import {
    calcModels, changePlace,
    getModels, getNewBid, getProjectInfo,
    getWordFile, toSent1C,
} from "./api/bids.api";
import {useBidSelects} from "./hooks/useBidSelects";
import {areObjectsEqual, areArraysEqual} from "./utils/areEqual";
import {useBidData} from "./hooks/useBidData";
import {useQueryClient} from "@tanstack/react-query";
import {useCalcModels} from "./hooks/useCalcModels";
import {useBidModels} from "./hooks/useBidModels";

const { TextArea } = Input;

const BidPage = (props) => {
    const queryClient = useQueryClient();
	const { bidId } = useParams();
    const { connected, emit } = useWebSocket();
	const navigate = useNavigate();
	const [isSend1c, setIsSend1c] = useState(0);
	const [isOpenBaseInfo, setIsOpenBaseInfo] = useState(false);
	const [userData, setUserData] = useState(null);
	const [bidActions, setBidActions] = useState({
		'create': null,
		'update': null,
		'view': null,
	});
	const [openMode, setOpenMode] = useState(null); // просмотр, редактирование

    /* ШАПКА СТРАНИЦЫ */
    const [bidType, setBidType] = useState(null);
    const [bidIdCompany, setBidIdCompany] = useState(null);
    const [bidOrg, setBidOrg] = useState({});
    const [bidCurator, setBidCurator] = useState({});
    const [bidPlace, setBidPlace] = useState(null); // статус по пайплайну

    const [form, setForm] = useState({
        baseInfo: {
            orgUser: null,
            protectionProject: null,
            object: null,
            sellBy: null
        },
        bill: {
            requisite: null,
            conveyance: null,
            factAddress: null,
            phone: null,
            email: null,
            insurance: null,
            package: null,
            consignee: null,
            otherEquipment: null,
        },
        comments: {
            engineer: null,
            manager: null,
            admin: null,
            accountant: null,
            addEquipment: null,
        },
        finance: {
            currency: null,
            priceStatus: null,
            percent: null,
            nds: null,
        },
        models: [],
    });
    const {
        serverData,
        isLoading,
        saveBid,
        isSaving,
        isDirty
    } = useBidData(bidId, form);

    const handleModelsUpdate = useCallback((newModels) => {
        setForm(prev => ({ ...prev, models: newModels }));
    }, []);
    const {
        isCalculating,
        amounts,
        engineerParams,
        calculate
    } = useCalcModels(
        form.models,
        form.finance,
        handleModelsUpdate,
    );

	/* ФАЙЛЫ */
	const [bidFilesCount, setBidFilesCount] = useState(0);

	/* ПРОЕКТ */
	const [bidProject, setBidProject] = useState(null); // проект из карточки организации

    /* СЕЛЕКТЫ */
    const selects = useBidSelects(bidOrg?.id, form.baseInfo.orgUser);

	/* СЕЛЕКТ ПО МОДЕЛЯМ */
	const [modelsSelect, setModelsSelect] = useState([]);
    const {
        sortedBidModels,
        handleAddModel,
        handleDeleteModelFromBid,
        handleChangeModel,
        handleChangeModelInfo,
        handleModelsRowDragStart,
        handleModelsRowDrop,
        handleModelsRowDragEnd,
        handleOpenModelInfoExtra,
        handleCloseDrawerExtra,
        addParseModels,
        modelIdExtra,
        modelNameExtra,
    } = useBidModels({
        bidId,
        formModels: form.models,
        setForm,
        modelsSelect,
        setModelsSelect,
        isDisabledInputManager: () => (openMode?.status !== 2),
    });
    const handleParseModels = useCallback((dataToAdd) => {
        addParseModels(dataToAdd);
        setIsParseModalOpen(false);
    }, [addParseModels]);

	/* ОСТАЛЬНОЕ */
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

	const showError = (content) => {
		messageApi.open({
			type: 'error',
			duration: 0,
			key: 'global-error',
			content: (
				<span>
					{content}{' '}
					<Button
						type="link"
						size="small"
						onClick={() => messageApi.destroy('global-error')}
					>
						Закрыть
					</Button>
				</span>
			),
		});
	};
	const showSuccess = (content) => {
		messageApi.open({
			type: 'success',
			duration: 3,
			content,
		});
	};
	const showWarning = (content) => {
		messageApi.open({
			type: 'warning',
			duration: 3,
			content,
		});
	};


    useEffect(() => {
        fetchModels().then();
    }, []);
    useEffect(() => {
        if (form.baseInfo.object) {
            setFindSimilarTitle(`Поиск похожих: "${form.baseInfo.object}"`);
        }
    }, [form.baseInfo.object]);
	useEffect(() => {
		if (bidProject) {
			fetchProjectInfo().then();
		}
	}, [bidProject]);
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
		if (openMode) {
			const handleKeyDown = (event) => {
				//console.log('event', event);
				if ((event.ctrlKey || event.metaKey) && event.code === 'KeyS' && openMode?.status !== 1 && openMode?.status !== 4 && openMode?.status !== 5) {
					event.preventDefault();
					handleSave();
				}
			};

			window.addEventListener('keydown', handleKeyDown);
			return () => {
				window.removeEventListener('keydown', handleKeyDown);
			};
		}
	}, [openMode]);
    useEffect(() => {
        if (form.models && form.models.length > 0 && modelsSelect && modelsSelect.length > 0) {
            setModelsSelect(prev => {
                return prev.map((model) => {
                    if (form.models.find(bidModel => +bidModel.model_id === +model.id)) {
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
    }, [form.models]);

    useEffect(() => {
        if (serverData) {

            setOpenMode(serverData.openmode);

            const { bid, bid_models } = serverData;

            setBidActions(bid.actions);
            setBidIdCompany(bid.id_company);
            setBidType(bid.type);
            setBidPlace(bid.place);
            setBidFilesCount(bid.files_count);
            setBidOrg(bid.base_info.org);
            setBidCurator(bid.base_info.curator);
            setBidProject(bid.base_info.project);
            setIsSend1c(bid.bill?.send1c);

            setForm({
                baseInfo: {
                    orgUser: bid.base_info.orguser,
                    protectionProject: bid.base_info.protection,
                    object: bid.base_info.object,
                    sellBy: bid.base_info.sellby,
                },
                bill: {
                    requisite: bid.bill?.requisite,
                    conveyance: bid.bill?.conveyance,
                    factAddress: bid.bill?.fact_address,
                    phone: bid.bill?.org_phone,
                    email: bid.bill?.contact_email,
                    insurance: bid.bill?.insurance,
                    package: bid.bill?.package,
                    consignee: bid.bill?.consignee,
                    otherEquipment: bid.bill?.other_equipment,
                },
                comments: {
                    engineer: bid.comments.engineer,
                    manager: bid.comments.manager,
                    admin: bid.comments.admin,
                    accountant: bid.comments.accountant,
                    addEquipment: bid.comments.add_equipment,
                },
                finance: {
                    currency: bid.finance.bid_currency,
                    priceStatus: bid.finance.status,
                    percent: bid.finance.percent,
                    nds: bid.finance.nds,
                },
                models: bid_models,
            });

            setIsLoadingChangePlaceBtn('');
        }
    }, [serverData]);

	const fetchModels = async () => {
		if (PRODMODE) {
			try {
                const models = await getModels();
				if (models) {
					setModelsSelect(models.models);
				}
			} catch (e) {
				console.log(e);
				showError(`Произошла ошибка! ${e.response?.data?.message || e.message || 'Неизвестная ошибка'}`);
			}
		}
	};
	const fetchWordFile = async () => {
		if (PRODMODE) {
			try {
                const data = {
                    bid_id: bidId,
                    new: true,
                    template_id: +bidIdCompany - 1,
                    type: 1
                };
                const response = await getWordFile(data);
				if (response) {
					const parts = response.data.file_link.split('/');
					const withSlash = '/' + parts.slice(1).join('/');
					window.open(`${HTTP_HOST}${withSlash}`, '_blank', 'noopener,noreferrer');
					setBidFilesCount(bidFilesCount + 1);
				}
			} catch (e) {
				console.log(e);
				showError(`Произошла ошибка! ${e.response?.data?.message || e.message || 'Неизвестная ошибка'}`);
			}
		}
	};
	const fetchNewBid = async () => {
		if (PRODMODE) {
			try {
                const data = {
                    bid: bidId,
                    org: bidOrg.id,
                    type: 2
                }
                const newId = await getNewBid(data);
				if (newId) {
					window.open(`${BASE_ROUTE}/bids/${newId}`, '_blank');
				}
			} catch (e) {
				console.log(e);
				showError(`Произошла ошибка! ${e.response?.data?.message || e.message || 'Неизвестная ошибка'}`);
			}
		}
	};
	const fetchBidPlace = async (newPlace, selectValue) => {
		console.log(selectValue)
		if (PRODMODE) {
			try {
                const data = {
                    bid: bidId,
                    stage: newPlace,
                    reason: selectValue
                };
                const response = await changePlace(bidId, data);
				if (response) {
                    queryClient.invalidateQueries({ queryKey: ['bid', bidId] });

					showSuccess(response.message.message);
				}
			} catch (e) {
				console.log(e);
				showError(`Произошла ошибка! ${e.response?.data?.message || e.message || 'Неизвестная ошибка'}`);
			}
		}
	};
	const fetchSend1c = async () => {
		if (PRODMODE) {
			try {
				setIsLoading1c(true);
                const response = await toSent1C(bidId);
				if (response) {
					showSuccess(response.message);
					setIsSend1c(1);
				}
				setTimeout(() => setIsLoading1c(false), 500);
			} catch (e) {
				console.log(e);
				showError(`Произошла ошибка! ${e.response?.data?.message || e.message || 'Неизвестная ошибка'}`);
				setTimeout(() => setIsLoading1c(false), 500);
			}
		}
	};
	const fetchProjectInfo = async () => {
		if (PRODMODE) {
			try {
                const response = await getProjectInfo(bidProject);
				if (response?.content) {
					setProjectInfo(response?.content?.project);
				}
			} catch (e) {
				console.log(e);
				showError(`Произошла ошибка! ${e.response?.data?.message || e.message || 'Неизвестная ошибка'}`);
				setTimeout(() => setIsLoading1c(false), 500);
			}
		}
	};

    const handleSave = () => {
        saveBid(collectUpdates(), {
            onSuccess: () => {
                showSuccess('Сохранено');
            },
            onError: (e) => {
                showError(`Произошла ошибка! ${e?.response?.data?.message || e?.message || 'Неизвестная ошибка'}`);
            },
        });
    };
    const collectUpdates = () => {
        return {
            bid: {
                id: bidId,
                id_company: bidIdCompany,
                place: bidPlace,
                type: bidType,
                files_count: bidFilesCount,
                base_info: {
                    org: bidOrg,
                    curator: bidCurator,
                    orguser: form.baseInfo.orgUser,
                    protection: form.baseInfo.protectionProject,
                    object: form.baseInfo.object,
                    sellby: form.baseInfo.sellBy,
                },
                bill:
                    +bidType === 2
                        ? {
                            consignee: form.bill.consignee,
                            contact_email: form.bill.email,
                            conveyance: form.bill.conveyance,
                            fact_address: form.bill.factAddress,
                            insurance: form.bill.insurance,
                            org_phone: form.bill.phone,
                            other_equipment: form.bill.otherEquipment,
                            package: form.bill.package,
                            requisite: form.bill.requisite,
                        }
                        : null,
                comments: {
                    engineer: form.comments.engineer,
                    manager: form.comments.manager,
                    admin: form.comments.admin,
                    accountant: form.comments.accountant,
                    add_equipment: form.comments.addEquipment,
                },
                finance: {
                    bid_currency: form.finance.currency,
                    status: form.finance.priceStatus,
                    percent: form.finance.percent,
                    nds: form.finance.nds,
                },
            },
            bid_models: form.models,
        };
    };

	const prepareSelect = (select) => {
	  if (select) {
		  return select.map((item) => ({value: item.id, label: item.name, used: item.used}));
	  } else {
		  return [];
	  }
	};
    const countOfComments = () => {
        return Object.values(form.comments).filter(Boolean).length;
	};
    const handleCommentChange = useCallback((field, value) => {
        setForm(prev => ({
            ...prev,
            comments: { ...prev.comments, [field]: value },
        }));
    }, []);
    const handleBaseInfoChange = useCallback((field, value) => {
        setForm(prev => ({
            ...prev,
            baseInfo: { ...prev.baseInfo, [field]: value },
        }));
    }, []);
    const handleBillChange = useCallback((field, value) => {
        setForm(prev => ({
            ...prev,
            bill: { ...prev.bill, [field]: value },
        }));
    }, []);
    const handleFinanceChange = useCallback((field, value) => {
        setForm(prev => ({
            ...prev,
            finance: { ...prev.finance, [field]: value },
        }));
    }, []);
    const handleToAdminClick = () => {
        setIsLoadingChangePlaceBtn('toAdmin');
        if (isDirty) {
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
                fetchBidPlace(2).then();
            } else {
                showWarning('Заполните поля! Эти поля должны быть заполнены: "Контактное лицо", "Плательщик", "Телефон"');
                setIsLoadingChangePlaceBtn('');
            }
        }
    };
    const handleBackManagerClick = () => {
        setIsLoadingChangePlaceBtn('backManager');
        openCustomModal(
            'backManager',
            'Вернуть менеджеру',
            'У Вас есть несохраненные изменения! Подтвердите сохранение перед тем как вернуть менеджеру.',
            [],
            baseButtons
        );
    };
    const handleBackManagerWithSelect = () => {
        openCustomModal(
            'backManagerWithSelect',
            'Вернуть менеджеру',
            'Укажите причину возврата менеджеру.',
            [<Select key="return-reason-select"
                     style={{width:'100%'}}
                     placeholder={'Причина возврата заявки'}
                     options={prepareSelect(selects.reasons)}
            />],
            returnButtons
        );
    };
    const handleToBuhClick = () => {
        setIsLoadingChangePlaceBtn('toBuh');
        if (isDirty) {
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
                fetchBidPlace(3).then();
            } else {
                showWarning('Заполните поля! Количество моделей должно быть равно количеству на складе');
                setIsLoadingChangePlaceBtn('');
            }
        }
    };
    const handleBackAdminWithSelect = () => {
        setIsLoadingChangePlaceBtn('backAdmin');
        openCustomModal(
            'backAdminWithSelect',
            'Вернуть администратору',
            'Укажите причину возврата администратору.',
            [<Select key="return-reason-select"
                     style={{width:'100%'}}
                     placeholder={'Причина возврата заявки'}
                     options={prepareSelect(selects.reasons)}
            />],
            returnButtons
        );
    };
    const handleDoneClick = () => {
        setIsLoadingChangePlaceBtn('done');
        setBidPlace(4);
        fetchBidPlace(4).then();
    };
    const handleBackBuhClick = () => {
        setIsLoadingChangePlaceBtn('backBuh');
        setBidPlace(3);
        fetchBidPlace(3).then();
    };
	const prepareEngineerParameter = (engineerParameter) => {
	  const rounded = (+engineerParameter).toFixed(2);
	  return rounded % 1 === 0 ? Math.round(rounded) : rounded;
	};
    const prepareAmount = (amount, symbol) => {
        console.log('amount', amount);
        const value = +amount;
        if (isNaN(value)) {
            return <MinusOutlined />;
        }
        const rounded = (value / 100).toFixed(2);
        let formatted = formatNumberWithSpaces(
            rounded % 1 === 0 ? Math.round(rounded) : rounded
        );
        return formatted + (symbol ? symbol : '');
    };
	const currencySymbol = (bidModel) => {
	  return +form.finance.currency === 1 ? '₽' : +form.finance.currency === 0 ? (bidModel.currency === 1 ? '€' : '$') : ''
	}
	const formatNumberWithSpaces = (number) => {
	  return new Intl.NumberFormat('ru-RU', {
		  minimumFractionDigits: 0,
		  maximumFractionDigits: 2
	  }).format(number);
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
					handleSave();
					setTimeout(() => fetchWordFile().then(), 200);
				}
				break;
            case 'pdf':
				if (+button_id === 2) {
					handleSave();
					setTimeout(() => navigate(`/bidsPDF/${bidId}`), 200);
				}
				break;
            case 'duplicate':
				if (+button_id === 2) {
					handleSave();
					setTimeout(() => setIsBidDuplicateDrawerOpen(true), 200);
				}
				break;
			case 'bill':
				if (+button_id === 2) {
					handleSave();
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
                    saveBid(collectUpdates(), {
                        onSuccess: () => {
                            if (isManagerDone()) {
                                setBidPlace(2);
                                fetchBidPlace(2).then();
                            } else {
                                showWarning('Заполните поля! Эти поля должны быть заполнены: "Контактное лицо", "Плательщик", "Телефон"');
                            }
                        }
                    });
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
					fetchBidPlace(1, selectValue).then();
				} else if (+button_id === 1) {
					setIsLoadingChangePlaceBtn('');
				}
				break;
			case 'toBuh':
                if (+button_id === 2) {
                    saveBid(collectUpdates(), {
                        onSuccess: () => {
                            if (isAdminDone()) {
                                setBidPlace(3);
                                fetchBidPlace(3).then();
                            } else {
                                showWarning('Заполните поля! Количество моделей должно быть равно количеству на складе');
                            }
                        }
                    });
                    setIsLoadingChangePlaceBtn('');
                }
				break;
			case 'backAdminWithSelect':
				if (+button_id === 2) {
					setBidPlace(2);
					fetchBidPlace(2, selectValue).then();
				} else if (+button_id === 1) {
					setIsLoadingChangePlaceBtn('');
				}
				break;
		}
		setIsOpenCustomModal(false);
	};
	const isErrorInput = (bidModelId) => {
		const model = form.models.find(model => model.id === bidModelId);
		return !(model && +model.model_count === +model.sklad);
	};
	const isManagerDone = () => {
		return (form.baseInfo.orgUser && form.bill.requisite && form.bill.phone);
	};
	const isAdminDone = () => {
		return !(form.models.find(model => +model.model_count !== +model.sklad));
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
                <BidBaseInfoSection
                    values={form.baseInfo}
                    orgUsersOptions={prepareSelect(selects.orgUsers)}
                    protectionOptions={prepareSelect(selects.protection)}
                    orgUsersDefaultValue={(selects.orgUsers && selects.orgUsers.length > 0) ? selects.orgUsers[selects.orgUsers.length - 1].id : null}
                    onChange={handleBaseInfoChange}
                    isDisabled={isDisabledInputManager()}
                    bidProjectId={bidProject}
                    onOpenProject={() => setIsProjectDataModalOpen(true)}
                    createdAtLabel={bidActions.create?.date ? dayjs(bidActions.create?.date * 1000).format("DD.MM.YYYY HH:mm:ss") : ''}
                />
			),
		},
		{
			key: 2,
			label: <div style={{ display: 'flex' }}>Плательщик</div>,
			children: (
                <BidBillSection
                    values={form.bill}
                    options={{
                        requisite: prepareSelect(selects.requisite),
                        conveyance: prepareSelect(selects.conveyance),
                        factAddress: prepareSelect(selects.factAddress),
                        phones: prepareSelect(selects.phones),
                        emails: prepareSelect(selects.emails),
                        insurance: prepareSelect(selects.insurance),
                        package: prepareSelect(selects.package),
                    }}
                    defaults={{
                        factAddress: (selects.factAddress && selects.factAddress.length > 0) ? selects.factAddress[selects.factAddress.length - 1].id : null,
                        phone: (selects.phones && selects.phones.length > 0) ? selects.phones[selects.phones.length - 1].id : null,
                        email: (selects.emails && selects.emails.length > 0) ? selects.emails[selects.emails.length - 1].id : null,
                    }}
                    onChange={handleBillChange}
                    isDisabled={isDisabledInputManager()}
                />
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
                <BidCommentsSection
                    values={form.comments}
                    onChange={handleCommentChange}
                    disabled={{
                        engineer: isDisabledInput(),
                        manager: isDisabledInputManager(),
                        admin: isDisabledInputAdmin(),
                        accountant: isDisabledInputBuh(),
                        addEquipment: isDisabledInput(),
                    }}
                />
			),
		},
		{
			key: 4,
			label: <div style={{ display: 'flex' }}>Финансовый блок</div>,
			children: (
                <BidFinanceSection
                    values={form.finance}
                    options={{
                        currency: prepareSelect(selects.currency),
                        price: prepareSelect(selects.price),
                        nds: prepareSelect(selects.nds),
                    }}
                    onChange={handleFinanceChange}
                    isDisabled={isDisabledInputManager()}
                />
			),
		},
	];

	const bufAlert = (content, type) => {
		if (type === 'error') return showError(content);
		if (type === 'warning') return showWarning(content);
		return showSuccess(content);
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
	return (
		<div className={'sa-bid-page-container'}>
			{contextHolder}
			<Spin size="large" spinning={isLoading}>
				<div className={'sa-bid-page'}>
					<Affix>
						<div style={{ padding: '10px 12px 0 12px' }}>
                            <BidPageHeader
                                bidType={bidType}
                                bidId={bidId}
                                bidIdCompany={bidIdCompany}
                                companies={selects.companies}
                                bidOrg={bidOrg}
                                userRole={userData?.user?.sales_role}
                                isDirty={isDirty}
                                openMode={openMode}
                                onOpenOrg={() => window.open(`${BASE_ROUTE}/orgs/${bidOrg.id}`, '_blank')}
                                statusActionsProps={{
                                    bidType,
                                    bidPlace,
                                    openModeStatus: openMode?.status,
                                    isDirty,
                                    isSaving,
                                    isDisabledInput: isDisabledInput(),
                                    isLoadingChangePlaceBtn,
                                    onSave: handleSave,
                                    onToAdmin: handleToAdminClick,
                                    onBackManager: handleBackManagerClick,
                                    onBackManagerWithSelect: handleBackManagerWithSelect,
                                    onToBuh: handleToBuhClick,
                                    onBackAdminWithSelect: handleBackAdminWithSelect,
                                    onDone: handleDoneClick,
                                    onBackBuh: handleBackBuhClick,
                                }}
                            />
						</div>
					</Affix>
					<div className={isOpenBaseInfo ?  'sa-bid-page-info-container' : 'sa-bid-page-info-container-closed'}>

                        <BidActionsToolbar
                            bidType={bidType}
                            bidPlace={bidPlace}
                            isDirty={isDirty}
                            isSend1c={isSend1c}
                            isLoading1c={isLoading1c}
                            filesCount={bidFilesCount}
                            isOpenBaseInfo={isOpenBaseInfo}
                            onToggleBaseInfo={() => setIsOpenBaseInfo(!isOpenBaseInfo)}
                            onOpenFiles={() => setIsBidFilesDrawerOpen(true)}
                            onOpenHistory={() => setIsBidHistoryDrawerOpen(true)}
                            onOpenDuplicate={() => setIsBidDuplicateDrawerOpen(true)}
                            onFetchWordFile={() => fetchWordFile().then()}
                            onNavigatePdf={() => navigate(`/bidsPDF/${bidId}`)}
                            onFetchSend1c={() => fetchSend1c().then()}
                            onFetchNewBid={() => fetchNewBid().then()}
                            openCustomModal={openCustomModal}
                            baseButtons={baseButtons}
                            buttons1C={buttons1C}
                            userRole={userData?.user?.sales_role}
                            isSuper={userData?.user?.super}
                        />

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

                            <BidModelsTable
                                isManager={userData?.user?.sales_role === 1}
                                sortedBidModels={sortedBidModels}
                                nameOptionsPrimary={prepareSelect(modelsSelect?.filter(option => [0, 1, 3].includes(option.type_model)))}
                                nameOptionsSecondary={prepareSelect(modelsSelect)}
                                presenceOptions={prepareSelect(selects.presence)}
                                isDisabledInputManager={isDisabledInputManager()}
                                isDisabledInput={isDisabledInput()}
                                isDisabledInputAdmin={isDisabledInputAdmin()}
                                isCalculating={isCalculating}
                                prepareAmount={prepareAmount}
                                currencySymbol={currencySymbol}
                                isErrorInput={isErrorInput}
                                onChangeModel={handleChangeModel}
                                onChangeModelInfo={handleChangeModelInfo}
                                onOpenModelInfoExtra={handleOpenModelInfoExtra}
                                onDeletePrimary={handleDeleteModelFromBid}
                                onCopyName={handleClick}
                                onDragStart={handleModelsRowDragStart}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleModelsRowDrop}
                                onDragEnd={handleModelsRowDragEnd}
                            />

							<BidModelsFooter
								isCalculating={isCalculating}
								engineerParams={engineerParams}
								amounts={amounts}
								prepareAmount={prepareAmount}
								prepareEngineerParameter={prepareEngineerParameter}
								onAddModel={handleAddModel}
								onOpenParse={() => setIsParseModalOpen(true)}
								onOpenFindSimilar={() => setIsFindSimilarDrawerOpen(true)}
								isDisabledInputManager={isDisabledInputManager()}
							/>
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
                        addParseModels={handleParseModels}
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
                             bid_models={form.models}
                             protection_project={form.baseInfo.protectionProject}
                             error_alert={(path, e) => {
                                 showError(`Произошла ошибка! ${path} ${e.response?.data?.message || e.message || 'Неизвестная ошибка'}`);
                              }}
                />
            </Modal>
			<ModelInfoExtraDrawer model_id={modelIdExtra}
								  model_name={modelNameExtra}
								  closeDrawer={handleCloseDrawerExtra}
			/>
			<BidDuplicationDrawer isOpenDrawer={isBidDuplicateDrawerOpen}
								  closeDrawer={() => setIsBidDuplicateDrawerOpen(false)}
								  bidId={bidId}
								  bidType={bidType}
                                  error_alert={(path, e) => {
                                      showError(`Произошла ошибка! ${path} ${e.response?.data?.message || e.message || 'Неизвестная ошибка'}`);
                                  }}
			/>
			<BidHistoryDrawer isOpenDrawer={isBidHistoryDrawerOpen}
							  closeDrawer={() => setIsBidHistoryDrawerOpen(false)}
							  bidId={bidId}
							  bidActions={bidActions}
                              error_alert={(path, e) => {
                                  showError(`Произошла ошибка! ${path} ${e.response?.data?.message || e.message || 'Неизвестная ошибка'}`);
                              }}
			/>
			<BidFilesDrawer isOpenDrawer={isBidFilesDrawerOpen}
							closeDrawer={() => setIsBidFilesDrawerOpen(false)}
							bidId={bidId}
                            bidType={bidType}
                            error_alert={(path, e) => {
                                showError(`Произошла ошибка! ${path} ${e.response?.data?.message || e.message || 'Неизвестная ошибка'}`);
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
		</div>
	);
};

export default BidPage;







