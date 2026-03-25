import React, {useCallback, useEffect, useRef, useState} from 'react';
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
import {BASE_ROUTE, CSRF_TOKEN, HTTP_HOST, HTTP_ROOT, PRODMODE, ROUTE_PREFIX} from '../../config/config';
import { PROD_AXIOS_INSTANCE } from '../../config/Api';
import './components/style/bidPage.css';
import {BID_INFO, CALC_INFO, CUR_COMPANY, CUR_CURRENCY, PROJECT_INFO, SELECTS} from './mock/mock';
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

const { TextArea } = Input;

const BidPage = (props) => {
    const queryClient = useQueryClient();
	const { bidId } = useParams();
    const { connected, emit } = useWebSocket();
	const navigate = useNavigate();
	const [isAlertVisible, setIsAlertVisible] = useState(false);
	const [draggedModelIndex, setDraggedModelIndex] = useState(null);
    const [isSend1c, setIsSend1c] = useState(0);
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
		if (isAlertVisible && alertType !== 'error') {
			const timer = setTimeout(() => {
				setIsAlertVisible(false);
			}, 3000);

			return () => clearTimeout(timer);
		}
	}, [isAlertVisible]);
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
				setIsAlertVisible(true);
				setAlertMessage(`Произошла ошибка!`);
				setAlertDescription(e.response?.data?.message || e.message || 'Неизвестная ошибка');
				setAlertType('error');
			}
		}
	};
	/*const fetchCalcModels = async () => {
		if (PRODMODE) {
			const requestId = ++calcRequestIdRef.current;
			try {
				//setIsLoadingSmall(true);
                const bid_info = {
                    bidCurrency: form.finance.currency,
                    bidPriceStatus: form.finance.priceStatus,
                    bidPercent: form.finance.percent,
                    bidNds: form.finance.nds,
                };
                const content = await calcModels(bid_info, form.models);
				if (content) {
					const isStaleRequest = calcRequestIdRef.current !== requestId;
					if (isStaleRequest) {
						//setTimeout(() => setIsLoadingSmall(false), 500);
						return;
					}
					if (hasLocalChanges) {
						if (content.models) {
							const mergedModels = mergeCalculatedModels(
								content.models,
								requestModelsSnapshot,
							);
							//setBidModels(mergedModels);
                            setForm(prev => ({
                                ...prev,
                                models: mergedModels,
                            }));
						}
						//setTimeout(() => setIsLoadingSmall(false), 500);
						return;
					}
					if (content.models) {
                        //setBidModels(content.models);
                        setForm(prev => ({
                            ...prev,
                            models: content.models,
                        }));
                    }
					//if (content.amounts) setAmounts(content.amounts);
					//if (content.models_data) setEngineerParameters(content.models_data);
				}
				//setTimeout(() => setIsLoadingSmall(false), 500);
			} catch (e) {
				console.log(e);
				setIsAlertVisible(true);
				setAlertMessage(`Произошла ошибка!`);
				setAlertDescription(e.response?.data?.message || e.message || 'Неизвестная ошибка');
				setAlertType('error');
				//setTimeout(() => setIsLoadingSmall(false), 500);
			}
		}
	};*/
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
				setIsAlertVisible(true);
				setAlertMessage(`Произошла ошибка!`);
				setAlertDescription(e.response?.data?.message || e.message || 'Неизвестная ошибка');
				setAlertType('error');
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
				setIsAlertVisible(true);
				setAlertMessage(`Произошла ошибка!`);
				setAlertDescription(e.response?.data?.message || e.message || 'Неизвестная ошибка');
				setAlertType('error');
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

					setIsAlertVisible(true);
					setAlertMessage('Успех!');
					setAlertDescription(response.message.message);
					setAlertType('success');
				}
			} catch (e) {
				console.log(e);
				setIsAlertVisible(true);
				setAlertMessage(`Произошла ошибка!`);
				setAlertDescription(e.response?.data?.message || e.message || 'Неизвестная ошибка');
				setAlertType('error');
			}
		}
	};
	const fetchSend1c = async () => {
		if (PRODMODE) {
			try {
				setIsLoading1c(true);
                const response = await toSent1C(bidId);
				if (response) {
					setIsAlertVisible(true);
					setAlertMessage('Успех!');
					setAlertDescription(response.message);
					setAlertType('success');
					setIsSend1c(1);
				}
				setTimeout(() => setIsLoading1c(false), 500);
			} catch (e) {
				console.log(e);
				setIsAlertVisible(true);
				setAlertMessage(`Произошла ошибка!`);
				setAlertDescription(e.response?.data?.message || e.message || 'Неизвестная ошибка');
				setAlertType('error');
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
				setIsAlertVisible(true);
				setAlertMessage(`Произошла ошибка!`);
				setAlertDescription(e.response?.data?.message || e.message || 'Неизвестная ошибка');
				setAlertType('error');
				setTimeout(() => setIsLoading1c(false), 500);
			}
		}
	};

    const handleSave = () => {
        saveBid(collectUpdates(), {
            onSuccess: () => {
                setTimeout(() => calculate(form.models, form.finance).then(), 0);
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
                        ? form.bill
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
    const handleModelsUpdate = useCallback((newModels) => {
        setForm(prev => ({ ...prev, models: newModels }));
    }, []);

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
	const editableModelFields = [
		'model_id',
		'model_name',
		'model_count',
		'percent',
		'presence',
		'sklad',
		'sort',
		'type_model',
		'currency',
		'not_available',
	];
	const getModelKey = (model) => `${model?.id ?? 'null'}:${model?.sort ?? 'null'}`;
	const pickEditableFields = (model) => {
		const picked = {};
		editableModelFields.forEach((field) => {
			if (Object.prototype.hasOwnProperty.call(model || {}, field)) {
				picked[field] = model[field];
			}
		});
		return picked;
	};
	const didEditableChange = (currentModel, requestModel) => {
		return editableModelFields.some(
			(field) => String(currentModel?.[field] ?? '') !== String(requestModel?.[field] ?? ''),
		);
	};
	const mergeCalculatedModels = (currentModels, serverModels, requestModels) => {
		if (!Array.isArray(currentModels) || currentModels.length === 0) return serverModels || [];
		if (!Array.isArray(serverModels) || serverModels.length === 0) return currentModels;

		const serverByKey = new Map(serverModels.map((model) => [getModelKey(model), model]));
		const requestByKey = new Map(
			(Array.isArray(requestModels) ? requestModels : []).map((model) => [getModelKey(model), model]),
		);

		return currentModels.map((currentModel) => {
			const key = getModelKey(currentModel);
			const serverModel = serverByKey.get(key);
			if (!serverModel) return currentModel;

			const requestModel = requestByKey.get(key);
			if (didEditableChange(currentModel, requestModel)) {
				return currentModel;
			}

			return {
				...serverModel,
				...pickEditableFields(currentModel),
			};
		});
	};
	const handleAddModel = () => {
	  let sort = 0;
	  if (form.models && form.models.length > 0) {
		  const lastModel = [...form.models].sort((a, b) => +a.sort - +b.sort)[form.models.length - 1];
		  sort = lastModel.sort + 1;
	  }
	  const bidModelsUpd = JSON.parse(JSON.stringify(form.models));
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
	  //setBidModels(bidModelsUpd);
      setForm(prev => ({
          ...prev,
          models: bidModelsUpd,
      }));
	};
	const handleDeleteModelFromBid = (bidModelId, bidModelSort, bidModelSelectId) => {
        const bidModelIdx = form.models.findIndex(model => (model.id === bidModelId && model.sort === bidModelSort));
        const bidModelsUpd = JSON.parse(JSON.stringify(form.models));
        bidModelsUpd.splice(bidModelIdx, 1);
        setForm(prev => ({
            ...prev,
            models: bidModelsUpd,
        }));
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
	};
	const handleChangeModel = (newId, oldId, oldSort) => {
	  const newModel = modelsSelect.find(model => model.id === newId);
	  const oldModel = form.models.find(model => (model.id === oldId && model.sort === oldSort));
	  const oldModelIdx = form.models.findIndex(model => (model.id === oldId && model.sort === oldSort));
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
	  const bidModelsUpd = JSON.parse(JSON.stringify(form.models));
	  bidModelsUpd[oldModelIdx] = newModelObj;
      setForm(prev => ({
          ...prev,
          models: bidModelsUpd,
      }));
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
	};
	const handleChangeModelInfo = (type, value, bidModelId, bidModelSort) => {
	  const bidModelIdx = form.models.findIndex(model => (model.id === bidModelId && model.sort === bidModelSort));
	  const bidModelsUpd = JSON.parse(JSON.stringify(form.models));
	  switch (type) {
          case 'model_count':
			  bidModelsUpd[bidModelIdx].model_count = value;
              setForm(prev => ({
                  ...prev,
                  models: bidModelsUpd,
              }));
			  break;
          case 'percent':
			  bidModelsUpd[bidModelIdx].percent = value;
              setForm(prev => ({
                  ...prev,
                  models: bidModelsUpd,
              }));
			  break;
		  case 'presence':
			  bidModelsUpd[bidModelIdx].presence = value;
              setForm(prev => ({
                  ...prev,
                  models: bidModelsUpd,
              }));
			  break;
		  case 'sklad':
			  bidModelsUpd[bidModelIdx].sklad = value;
              setForm(prev => ({
                  ...prev,
                  models: bidModelsUpd,
              }));
			  break;
	  }
	};
	const handleModelsRowDragStart = (index) => {
		if (isDisabledInputManager()) return;
		setDraggedModelIndex(index);
	};
	const handleModelsRowDrop = (dropIndex) => {
		if (isDisabledInputManager()) return;
		if (draggedModelIndex === null || draggedModelIndex === dropIndex) return;
		const reordered = [...sortedBidModels];
		const [moved] = reordered.splice(draggedModelIndex, 1);
		reordered.splice(dropIndex, 0, moved);
		/*setBidModels(reordered.map((model, idx) => ({
			...model,
			sort: idx + 1,
		})));*/
        setForm(prev => ({
            ...prev,
            models: reordered.map((model, idx) => ({
                ...model,
                sort: idx + 1,
            })),
        }));
		setDraggedModelIndex(null);
	};
	const handleModelsRowDragEnd = () => {
		setDraggedModelIndex(null);
	};
	const handleOpenModelInfoExtra = (modelId) => {
		setModelIdExtra(modelId);
		const name = form.models.find(model => model.model_id === modelId).model_name;
		setModelNameExtra(name);
	};
	const handleCloseDrawerExtra = () => {
		setModelIdExtra(null);
		setModelNameExtra('');
	};
    const addParseModels = (dataToAdd) => {
        console.log(dataToAdd);

        if (!dataToAdd || !dataToAdd.length) return;

        const aggregatedData = dataToAdd.reduce((acc, item) => {
            const existing = acc.find(x => x.id === item.id);
            if (existing) {
                existing.count += item.count;
            } else {
                acc.push({ ...item });
            }
            return acc;
        }, []);

        let sort = 0;
        if (form.models && form.models.length > 0) {
            const sorted = [...form.models].sort((a, b) => a.sort - b.sort);
            sort = sorted[sorted.length - 1].sort;
        }

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
                    model_count: newModel.count,
                    not_available: 0,
                    percent: 0,
                    presence: -2,
                    sort: sort + idx + 1,
                    type_model: model.type_model,
                    currency: model.currency,
                };
            });

        //setBidModels(prev => [...prev, ...arr]);
        //setBidModels(arr);
        setForm(prev => ({
            ...prev,
            models: arr,
        }));
        setIsParseModalOpen(false);
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
                                setTimeout(() => calculate(form.models, form.finance).then(), 0);
                            } else {
                                setIsAlertVisible(true);
                                setAlertMessage('Заполните поля!');
                                setAlertDescription('Эти поля должны быть заполнены: "Контактное лицо", "Плательщик", "Телефон"');
                                setAlertType('warning');
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
                                setTimeout(() => calculate(form.models, form.finance).then(), 0);
                            } else {
                                setIsAlertVisible(true);
                                setAlertMessage('Заполните поля!');
                                setAlertDescription('Количество моделей должно быть равно количеству на складе');
                                setAlertType('warning');
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
				<div className={'sa-info-list-hide-wrapper'}>
					<div className={'sa-info-list-row'}>
						<div className={'sa-list-row-label'}>
							<p>Контактное лицо</p>
						</div>
						<Select
							style={{ width: '100%', textAlign: 'left' }}
							value={form.baseInfo.orgUser}
							showSearch
							optionFilterProp="label"
							filterOption={(input, option) =>
								(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
							}
							options={prepareSelect(selects.orgUsers)}
                            onChange={(val) => setForm(prev => ({
                                ...prev,
                                baseInfo: { ...prev.baseInfo, orgUser: val }
                            }))}
							disabled={isDisabledInputManager()}
							defaultValue={(selects.orgUsers && selects.orgUsers.length > 0) ? selects.orgUsers[selects.orgUsers.length - 1].id : null}
						/>
					</div>
					<div className={'sa-info-list-row'}>
						<div className={'sa-list-row-label'}>
							<p>Защита проекта</p>
						</div>
						<Select
							style={{ width: '100%', textAlign: 'left' }}
							value={form.baseInfo.protectionProject}
							options={prepareSelect(selects.protection)}
                            onChange={(val) => setForm(prev => ({
                                ...prev,
                                baseInfo: { ...prev.baseInfo, protectionProject: val }
                            }))}
							disabled={isDisabledInputManager()}
						/>
					</div>
					<div className={'sa-info-list-row'}>
						<div className={'sa-list-row-label'}>
							<p>Объект</p>
						</div>
						<Input
							style={{ width: '100%', height: '32px' }}
							value={form.baseInfo.object}
                            onChange={(e) => setForm(prev => ({
                                ...prev,
                                baseInfo: { ...prev.baseInfo, object: e.target.value }
                            }))}
							disabled={isDisabledInputManager()}
						/>
					</div>
					<div className={'sa-info-list-row'}>
						<div className={'sa-list-row-label'}>
							<p>Срок реализации</p>
						</div>
						<Input
							style={{ width: '100%', height: '32px' }}
							value={form.baseInfo.sellBy}
                            onChange={(e) => setForm(prev => ({
                                ...prev,
                                baseInfo: { ...prev.baseInfo, sellBy: e.target.value }
                            }))}
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
							value={form.bill.requisite}
							options={prepareSelect(selects.requisite)}
                            onChange={(val) => setForm(prev => ({
                                ...prev,
                                bill: { ...prev.bill, requisite: val }
                            }))}
							disabled={isDisabledInputManager()}
						/>
					</div>
					<div className={'sa-info-list-row'}>
						<div className={'sa-list-row-label'}>
							<p>Способ транспортировки</p>
						</div>
						<Select
							style={{ width: '100%', textAlign: 'left' }}
							value={form.bill.conveyance}
							options={prepareSelect(selects.conveyance)}
                            onChange={(val) => setForm(prev => ({
                                ...prev,
                                bill: { ...prev.bill, conveyance: val }
                            }))}
							disabled={isDisabledInputManager()}
						/>
					</div>
					<div className={'sa-info-list-row'}>
						<div className={'sa-list-row-label'}>
							<p>Фактический адрес</p>
						</div>
						<Select
							style={{ width: '100%', textAlign: 'left' }}
							value={form.bill.factAddress}
							options={prepareSelect(selects.factAddress)}
                            onChange={(val) => setForm(prev => ({
                                ...prev,
                                bill: { ...prev.bill, factAddress: val }
                            }))}
							disabled={isDisabledInputManager()}
							defaultValue={(selects.factAddress && selects.factAddress.length > 0) ? selects.factAddress[selects.factAddress.length - 1].id : null}
						/>
					</div>
					<div className={'sa-info-list-row'}>
						<div className={'sa-list-row-label'}>
							<p>Телефон</p>
						</div>
						<Select
							style={{ width: '100%', textAlign: 'left' }}
							value={form.bill.phone}
							options={prepareSelect(selects.phones)}
                            onChange={(val) => setForm(prev => ({
                                ...prev,
                                bill: { ...prev.bill, phone: val }
                            }))}
							disabled={isDisabledInputManager()}
							defaultValue={(selects.phones && selects.phones.length > 0) ? selects.phones[selects.phones.length - 1].id : null}
						/>
					</div>
					<div className={'sa-info-list-row'}>
						<div className={'sa-list-row-label'}>
							<p>Email</p>
						</div>
						<Select
							style={{ width: '100%', textAlign: 'left' }}
							value={form.bill.email}
							options={prepareSelect(selects.emails)}
                            onChange={(val) => setForm(prev => ({
                                ...prev,
                                bill: { ...prev.bill, email: val }
                            }))}
							disabled={isDisabledInputManager()}
							defaultValue={(selects.emails && selects.emails.length > 0) ? selects.emails[selects.emails.length - 1].id : null}
						/>
					</div>
					<div className={'sa-info-list-row'}>
						<div className={'sa-list-row-label'}>
							<p>Страховка</p>
						</div>
						<Select
							style={{ width: '100%', textAlign: 'left' }}
							value={form.bill.insurance}
							options={prepareSelect(selects.insurance)}
                            onChange={(val) => setForm(prev => ({
                                ...prev,
                                bill: { ...prev.bill, insurance: val }
                            }))}
							disabled={isDisabledInputManager()}
						/>
					</div>
					<div className={'sa-info-list-row'}>
						<div className={'sa-list-row-label'}>
							<p>Упаковка</p>
						</div>
						<Select
							style={{ width: '100%', textAlign: 'left' }}
							value={form.bill.package}
							options={prepareSelect(selects.package)}
                            onChange={(val) => setForm(prev => ({
                                ...prev,
                                bill: { ...prev.bill, package: val }
                            }))}
							disabled={isDisabledInputManager()}
						/>
					</div>
					<div className={'sa-info-list-row'}>
						<div className={'sa-list-row-label'}>
							<p>Грузополучатель</p>
						</div>
						<Input
							style={{ width: '100%', height: '32px' }}
							value={form.bill.consignee}
                            onChange={(e) => setForm(prev => ({
                                ...prev,
                                bill: { ...prev.bill, consignee: e.target.value }
                            }))}
							disabled={isDisabledInputManager()}
						/>
					</div>
					<div className={'sa-info-list-row'}>
						<div className={'sa-list-row-label'}>
							<p>Доп. оборудование</p>
						</div>
						<Input
							style={{ width: '100%', height: '32px' }}
							value={form.bill.otherEquipment}
                            onChange={(e) => setForm(prev => ({
                                ...prev,
                                bill: { ...prev.bill, otherEquipment: e.target.value }
                            }))}
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
							value={form.comments.engineer}
							autoSize={{ minRows: 2, maxRows: 6 }}
                            onChange={(e) => setForm(prev => ({
                                ...prev,
                                comments: { ...prev.comments, engineer: e.target.value }
                            }))}
							disabled={isDisabledInput()}/**/
						/>
					</div>
					<div className={'sa-info-list-row'}>
						<div className={'sa-list-row-label'}>
							<p>Комментарий менеджера</p>
						</div>
						<TextArea
							value={form.comments.manager}
							autoSize={{ minRows: 2, maxRows: 6 }}
                            onChange={(e) => setForm(prev => ({
                                ...prev,
                                comments: { ...prev.comments, manager: e.target.value }
                            }))}
							disabled={isDisabledInputManager()}
						/>
					</div>
					<div className={'sa-info-list-row'}>
						<div className={'sa-list-row-label'}>
							<p>Комментарий администратора</p>
						</div>
						<TextArea
							value={form.comments.admin}
							autoSize={{ minRows: 2, maxRows: 6 }}
                            onChange={(e) => setForm(prev => ({
                                ...prev,
                                comments: { ...prev.comments, admin: e.target.value }
                            }))}
							disabled={isDisabledInputAdmin()}
						/>
					</div>
					<div className={'sa-info-list-row'}>
						<div className={'sa-list-row-label'}>
							<p>Комментарий бухгалтера</p>
						</div>
						<TextArea
							value={form.comments.accountant}
							autoSize={{ minRows: 2, maxRows: 6 }}
                            onChange={(e) => setForm(prev => ({
                                ...prev,
                                comments: { ...prev.comments, accountant: e.target.value }
                            }))}
                            disabled={isDisabledInputBuh()}
						/>
					</div>
					<div className={'sa-info-list-row'}>
						<div className={'sa-list-row-label'}>
							<p>Дополнительное оборудование</p>
						</div>
						<TextArea
							value={form.comments.addEquipment}
							autoSize={{ minRows: 2, maxRows: 6 }}
                            onChange={(e) => setForm(prev => ({
                                ...prev,
                                comments: { ...prev.comments, addEquipment: e.target.value }
                            }))}
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
							value={form.finance.currency}
							options={prepareSelect(selects.currency)}
                            onChange={(val) => {
                                setForm(prev => ({
                                    ...prev,
                                    finance: {...prev.finance, currency: val}
                                }));
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
							value={form.finance.priceStatus}
							options={prepareSelect(selects.price)}
                            onChange={(val) => {
                                setForm(prev => ({
                                    ...prev,
                                    finance: {...prev.finance, priceStatus: val}
                                }));
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
							value={form.finance.percent}
							type="number"
                            onChange={(e) => {
                                setForm(prev => ({
                                    ...prev,
                                    finance: {...prev.finance, percent: e.target.value }
                                }));
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
							value={form.finance.nds}
							options={prepareSelect(selects.nds)}
                            onChange={(val) => {
                                setForm(prev => ({
                                    ...prev,
                                    finance: {...prev.finance, nds: val}
                                }));
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
	const sortedBidModels = React.useMemo(() => {
		if (!form.models || form.models.length === 0) return [];
		return [...form.models].sort((a, b) => +a.sort - +b.sort);
	}, [form.models]);

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
											selects.companies &&
											selects.companies.find((comp) => comp.id === bidIdCompany) &&
											bidOrg &&
											bidOrg.name && (
												<div className={'sa-vertical-flex'} style={{ alignItems: 'baseline' }}>
													От компании
													<Tag
														style={{
															textAlign: 'center',
															fontSize: '14px',
														}}
														color={selects.companies.find((comp) => comp.id === bidIdCompany)?.color}
													>
														{selects.companies.find((comp) => comp.id === bidIdCompany)?.name}
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
													{isDirty && (
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
																if (isDirty) {
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
																						options={prepareSelect(selects.reasons)}
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
																			 options={prepareSelect(selects.reasons)}
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
																fetchBidPlace(4).then();
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
																fetchBidPlace(3).then();
															}}
													><ArrowLeftOutlined /> Вернуть бухгалтеру</Button>
												</Space.Compact>
											)}

											<Button
												type={'primary'}
												style={{ width: '150px' }}
												icon={<SaveOutlined />}
												loading={isSaving}
												onClick={() => handleSave()}
												disabled={isDisabledInput()} /* || openMode?.status === 4 */
											>
												{isSaving ? 'Сохраняем...' : 'Сохранить'}
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
                                            if (isDirty) {
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
								<Tooltip title={isSend1c ? 'Уже было отправлено в 1С' : 'Отправить в 1С'} placement={'right'}>
									<Badge count={bidFilesCount} color={'geekblue'}>
										<Button
											className={'sa-bid-page-btn'}
											color={isSend1c ? "danger" : "primary"}
											variant="outlined"
											style={{fontSize: '20px', fontWeight: 'bold'}}
											disabled={isLoading1c}
											onClick={() => {
												if (isSend1c) {
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
										if (isDirty) {
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
                                            if (isDirty) {
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
											if (isDirty) {
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
									{(sortedBidModels && sortedBidModels.length > 0) ?
										sortedBidModels.map((bidModel, idx) => (
											<div
												className={'sa-models-table-row'}
												key={`bid-model-${idx}-${bidModel.bid_id}-${bidModel.id}-${bidModel.sort}`}
												draggable={!isDisabledInputManager()}
												onDragStart={() => handleModelsRowDragStart(idx)}
												onDragOver={(e) => e.preventDefault()}
												onDrop={() => handleModelsRowDrop(idx)}
												onDragEnd={handleModelsRowDragEnd}
											>
												<div className={'sa-models-table-cell'}
													style={{cursor: 'grab'}}
												>
													<p>{idx + 1}</p>
												</div>
												<div className={'sa-models-table-cell align-left'}>
													<NameSelect
														options={prepareSelect(modelsSelect?.filter(option => [0, 1, 3].includes(option.type_model)))}
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
													{(isCalculating) ? (
														<LoadingOutlined/>
													) : (
														<p>{prepareAmount(+bidModel?.moneyOne, currencySymbol(bidModel))}</p>
													)}
												</div>
												<div className={'sa-models-table-cell'}>
													{(isCalculating) ? (
														<LoadingOutlined/>
													) : (
														<p>{prepareAmount(+bidModel?.moneyCount, currencySymbol(bidModel))}</p>
													)}
												</div>
												<div className={'sa-models-table-cell'}>
													<ModelSelect
														options={prepareSelect(selects.presence)}
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
									{(sortedBidModels && sortedBidModels.length > 0) ?
										sortedBidModels.map((bidModel, idx) => (
											<div
												className={'sa-models-table-row-two'}
												key={`bid-model-${idx}-${bidModel.bid_id}-${bidModel.id}-${bidModel.sort}`}
												draggable={!isDisabledInputManager()}
												onDragStart={() => handleModelsRowDragStart(idx)}
												onDragOver={(e) => e.preventDefault()}
												onDrop={() => handleModelsRowDrop(idx)}
												onDragEnd={handleModelsRowDragEnd}
											>
												<div className={'sa-models-table-cell'}
													style={{cursor: 'grab'}}
												>
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
													{(isCalculating) ? (
														<LoadingOutlined/>
													) : (
														<p>{prepareAmount(+bidModel?.moneyOne, currencySymbol(bidModel))}</p>
													)}
												</div>
												<div className={'sa-models-table-cell'}>
													{(isCalculating) ? (
														<LoadingOutlined/>
													) : (
														<p>{prepareAmount(+bidModel?.moneyCount, currencySymbol(bidModel))}</p>
													)}
												</div>
												<div className={'sa-models-table-cell'}>
													<ModelSelect
														options={prepareSelect(selects.presence)}
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
												{!isCalculating ? (
													<p>
														<span>{prepareEngineerParameter(engineerParams.unit)}</span> U
													</p>
												) : (
													<LoadingOutlined/>
												)}
											</div>
											<div className={'sa-footer-table-cell'}>
												<p>Высота шкафа: </p>
												{!isCalculating ? (
													<p>
														<span>{prepareEngineerParameter(engineerParams.box_size)}</span> U
													</p>
												) : (
													<LoadingOutlined/>
												)}
											</div>
										</div>
										<div className={'sa-footer-table-col'}>
											<div className={'sa-footer-table-cell'}>
												<p>Потр. мощ.: </p>
												{!isCalculating ? (
													<p>
														<span>
															{prepareEngineerParameter(engineerParams.power_consumption)}
														</span>{' '}
														кВт
													</p>
												) : (
													<LoadingOutlined/>
												)}
											</div>
											<div className={'sa-footer-table-cell'}>
												<p>Вых. мощность: </p>
												{!isCalculating ? (
													<p>
														<span>{prepareEngineerParameter(engineerParams.max_power)}</span> Вт
													</p>
												) : (
													<LoadingOutlined/>
												)}
											</div>
										</div>
										<div className={'sa-footer-table-col'}>
											<div className={'sa-footer-table-cell'}>
												<p>Мощность АС: </p>
												{!isCalculating ? (
													<p>
														<span>
															{prepareEngineerParameter(engineerParams.rated_power_speaker)}
														</span>{' '}
														Вт
													</p>
												) : (
													<LoadingOutlined/>
												)}
											</div>
											<div className={'sa-footer-table-cell'}>
												<p>Масса: </p>
												{!isCalculating ? (
													<p>
														<span>{prepareEngineerParameter(engineerParams.mass)}</span> кг
													</p>
												) : (
													<LoadingOutlined/>
												)}
											</div>
										</div>
										<div className={'sa-footer-table-col'}>
											<div className={'sa-footer-table-cell'}>
												<p>Объем:</p>
												{!isCalculating ? (
													<p>
														<span>{prepareEngineerParameter(engineerParams.size)}</span> m3
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
												{!isCalculating ? (
													<p>{prepareAmount(amounts.usd)} $</p>
												) : (
													<LoadingOutlined />
												)}
											</div>
											<div className={'sa-footer-amounts-cell cell-amount'}>
												{!isCalculating ? (
													<p>{prepareAmount(amounts.eur)} €</p>
												) : (
													<LoadingOutlined />
												)}
											</div>
											<div className={'sa-footer-amounts-cell cell-amount'}>
												{!isCalculating ? (
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
                             bid_models={form.models}
                             protection_project={form.baseInfo.protectionProject}
                             error_alert={(path, e) => {
                                 setIsAlertVisible(true);
                                 setAlertMessage(`Произошла ошибка! ${path}`);
                                 setAlertDescription(e.response?.data?.message || e.message || 'Неизвестная ошибка');
                                 setAlertType('error');
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
						bottom: 40,
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
