import React, { useEffect, useState } from 'react';
import {
  Affix,
  Alert,
  Badge,
  Button,
  Collapse,
  Input,
  Select,
  Spin,
  Steps,
  Tag,
  Tooltip,
} from 'antd';
import { useParams } from 'react-router-dom';
import {BASE_ROUTE, CSRF_TOKEN, PRODMODE} from '../../config/config';
import { PROD_AXIOS_INSTANCE } from '../../config/Api';
import './components/style/engPage.css'
// import { BID_INFO, CALC_INFO, CUR_COMPANY, CUR_CURRENCY, SELECTS, ALLMODELS_LIST } from './mock/mock';
import {SELECTS, ALLMODELS_LIST, CALC_INFO, MODELS_LIST, PREBID, CUR_COMPANY, CUR_CURRENCY} from './mock/mock';
import CurrencyMonitorBar from '../../components/template/CURRENCYMONITOR/CurrencyMonitorBar';
import {
  BlockOutlined, CheckOutlined,
  CopyOutlined,
  DeleteOutlined,
  DollarOutlined,
  DownloadOutlined, FileAddOutlined,
  FilePdfOutlined,
  FileSearchOutlined,
  FileWordOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
  MinusOutlined,
  PlusOutlined, ProfileOutlined,
  SaveOutlined, SendOutlined,
} from '@ant-design/icons';
import NameSelect from './components/alan/NameSelect';
import ModelInput from './components/alan/ModelInput';
import ModelSelect from './components/alan/ModelSelect';
import CopyMessageView from "./components/CopyMessageView";
import CustomModal from "../../components/helpers/modals/CustomModal";
import ModelInfoExtraDrawer from "../BID_PAGE/components/ModelInfoExtraDrawer";
import BidFilesDrawer from "../BID_LIST/components/BidFilesDrawer";
import EngineerFilesDrawer from "./components/EngineerFilesDrawer";
const { TextArea } = Input;

const EngineerPage = (props) => {
  const { bidId } = useParams();
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

  const [openMode, setOpenMode] = useState({}); // просмотр, редактирование
  /* ШАПКА СТРАНИЦЫ */
  const [bidType, setBidType] = useState(null);

  const [bidCommentEngineer, setBidCommentEngineer] = useState('');
  const [bidCommentManager, setBidCommentManager] = useState('');
  /* ФИНАНСОВЫЙ БЛОК */
  const [bidCurrency, setBidCurrency] = useState(0);
  const [bidPriceStatus, setBidPriceStatus] = useState(0);
  const [bidPercent, setBidPercent] = useState(0);
  const [bidNds, setBidNds] = useState(0);
  /* ФАЙЛЫ */
  const [bidFilesCount, setBidFilesCount] = useState(0);
  /* МОДЕЛИ */
  const [bidModels, setBidModels] = useState([]);
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
    const [companies, setCompanies] = useState([]);

  const [manager, setManager] = useState({name: "", surname: "", middlename: "", id_company: 0, id: 0, manager_name: ""});
  const [engineer, setEngineer] = useState({name: "", surname: "", middlename: "", id_company: 0, id: 0, engineer_name: ""});

  const [activeRole, setActiveRole] = useState(0);
  const [openCopySpecification, setOpenCopySpecification] = useState(false);
  const [openAddIntoBidSpecification, setOpenAddIntoBidSpecification] = useState(false);
  const [copyType, setCopyType] = useState(1);
  const [value, setValue] = useState(0);
  const [superUser, setSuperUser] = useState(false);
  const [modelIdExtra, setModelIdExtra] = useState(null);
  const [modelNameExtra, setModelNameExtra] = useState('');
  const [isEngineerFilesDrawerOpen, setIsEngineerFilesDrawerOpen] = useState(false);
  const [bidPlace, setBidPlace] = useState(2); // статус по пайплайну
  const [editMode, setEditMode] = useState(false);


  const handleKeyDown = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      setIsSavingInfo(true);
    }
  };

  useEffect(() => {
    if (!isMounted) {
      fetchInfo().then(() => {
        setIsNeedCalcMoney(true);
      });
      setIsMounted(true);
    }
  }, []);

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
    if (userData?.user?.id_departament === 7 || userData?.user?.id_departament === 8 || userData?.user?.id_departament === 20) {
      // if ([7,8,20].includes(userData?.user?.id_departament)) {
      setActiveRole(2);
    } else {
      setActiveRole(1);
    }
  }, [userData]);

  useEffect(() => {
    setSuperUser(props.userdata.user?.super);
  }, [props.userdata.user?.super]);

  useEffect(() => {
    if (isSavingInfo) {
      fetchUpdates().then(() => {
        setTimeout(() => setIsSavingInfo(false), 500);
      });
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSavingInfo]);
  useEffect(() => {
    if (isMounted && isNeedCalcMoney) {
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
  };
  const fetchBidInfo = async () => {
    if (PRODMODE) {
      try {
        let response = await PROD_AXIOS_INSTANCE.post(`/api/sales/engineer/` + bidId, {
          data: {},
          _token: CSRF_TOKEN
        });
        console.log(response);
        if (response.data && response.data.content.models) {
          console.log(response.data.content);
          const content = response.data.content;
          setManager(content.manager);
          setEngineer(content.engineer);

          setBidCommentEngineer(content.comment_engineer);
          setBidCommentManager(content.comment_manager);

          setBidModels(content.models);
          setEngineerParameters({
            unit: 0,
            box_size: 0,
            power_consumption: 0,
            max_power: 0,
            rated_power_speaker: 0,
            mass: 0,
            size: 0
          });

          setBidPlace(content.place);

          setBidFilesCount(content.files_count);

          setEditMode(content.edit);
        }
      } catch (e) {
        console.log(e);
      }
    } else {
      console.log("HERE: 1");
      setManager(PREBID.manager);
      // setEngineer(PREBID.engineer);
      setEngineer(null);

      setBidCommentEngineer(PREBID.comment_engineer);
      setBidCommentManager(PREBID.comment_manager);

      setBidModels(MODELS_LIST);
      setEngineerParameters(CALC_INFO.models_data);

      setBidPlace(2);

      setBidFilesCount(1);

      // setEditMode(!((bidPlace === 4) || (bidPlace === 1)));
      setEditMode(false)
    }
  };

  const acceptOrder = async (order_id, engineer) => {
    if (PRODMODE) {
      try {
        let response = await PROD_AXIOS_INSTANCE.post(
            '/api/sales/engineer/orders/accept/' + order_id,
            {
              _token: CSRF_TOKEN,
            }
        );

        setIsAlertVisible(true);
        setAlertMessage('Успех!');
        setAlertDescription(response.data.message);
        setAlertType('success');

        await fetchBidInfo();

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

      await fetchBidInfo();
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
      setModelsSelect(ALLMODELS_LIST);
    }
  };
  const fetchUpdates = async () => {
    console.log('fetchUpdates!');
    const data = {
      bid: {
        id: bidId,
        comments: {
          engineer: bidCommentEngineer,
          manager: bidCommentManager,
        },
      },
      bid_models: bidModels,
    };
    console.log(data);

    if (PRODMODE) {
      try {
        let response = await PROD_AXIOS_INSTANCE.put(`/api/sales/engineer/${bidId}`, {
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
            engineer: true,
            bid_models: bidModels,
          },
          _token: CSRF_TOKEN,
        });
        if (response.data.content) {
          const content = response.data.content;
          if (content.models) setBidModels(content.models);
          if (content.models_data) setEngineerParameters(content.models_data);
        }
        setTimeout(() => setIsLoadingSmall(false), 500);
      } catch (e) {
        console.log(e);
        setTimeout(() => setIsLoadingSmall(false), 500);
      }
    } else {
      setIsLoadingSmall(true);
      // setBidModels(CALC_INFO.models);
      // setEngineerParameters(CALC_INFO.models_data);
      setTimeout(() => setIsLoadingSmall(false), 500);
    }
  };

  const prepareSelect = (select) => {
    if (select) {
      return select.map((item) => ({value: item.id, label: item.name}));
    } else {
      return [];
    }
  };

  const prepareEngineerParameter = (engineerParameter) => {
    const rounded = (+engineerParameter).toFixed(2);
    return rounded % 1 === 0 ? Math.round(rounded) : rounded;
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
      "not_available": 0,
      "percent": null,
      "presence": null,
      "sort": sort,
      "name": "",
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
      "model_count": 1,
      "not_available": 0,
      "percent": 0,
      "presence": -2,
      "sort": oldModel.sort,
      "name": newModel.name,
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
  const handleOpenModelInfo = (modelId) => {
    setModelIdExtra(modelId);
    const name = bidModels.find(model => model.model_id === modelId).model_name;
    setModelNameExtra(name);
  };
  const handleCloseDrawerExtra = () => {
    setModelIdExtra(null);
    setModelNameExtra('');
  };

  const handleCopySpecification = async (spec_id) => {
    if (PRODMODE) {
      try {
        let response = await PROD_AXIOS_INSTANCE.post('/api/sales/engineer/orders/copy/' + bidId, {
          _token: CSRF_TOKEN,
          data: {
            bidId: spec_id
          }
        });

        setOpenCopySpecification(true);

        // window.open(BASE_ROUTE + '/api/sales/engineer/' + response.data.newId);
      } catch (e) {
        console.log(e);
        setTimeout(() => setIsLoadingSmall(false), 500);
      }
    }
  };

  const handleCopySpecificationIntoBid = async (value) => {
    if (PRODMODE) {
      try {
        let response = await PROD_AXIOS_INSTANCE.post('/api/sales/engineer/orders/intoBid/' + bidId, {
          _token: CSRF_TOKEN,
          data: {
            bidId: value,
            copyType,
          }
        });

        setOpenAddIntoBidSpecification(false);

        setIsAlertVisible(true);
        setAlertMessage('Успех!');
        setAlertDescription(response.data.message);
        setAlertType('success');

        setTimeout(() => {
          window.open(BASE_ROUTE + '/bids/' + response.data.content.bid_id, '_blank');
        }, 500);
      } catch (e) {
        console.log(e);
        setTimeout(() => setIsLoadingSmall(false), 500);
      }
    } else {
      window.open(BASE_ROUTE + '/bids/' + 1, '_blank');
    }
  };
  const handleCancel = () => {
    setOpenCopySpecification(false);
    setOpenAddIntoBidSpecification(false);
    setValue(0);
  };
  const handleOk = () => {
    setOpenCopySpecification(false);
    setOpenAddIntoBidSpecification(false);
    setValue(0);
  };
  const handleSetValue = (spec_id, type) => {
    handleOk();
    setValue(spec_id);

    switch (type){
      case 1:
        handleCopySpecification(spec_id).then( () => {setOpenCopySpecification(false)});
        break;

      case 2:
      case 3:
        handleCopySpecificationIntoBid(spec_id).then( () => {setOpenCopySpecification(false)});
        break;
    }
    console.log(spec_id, type);
  }



  const handleSpecificationFinal = async () => {
      if (PRODMODE){
        try {
          let response = await PROD_AXIOS_INSTANCE.post('/api/sales/engineer/orders/final/' + bidId, {
            _token: CSRF_TOKEN,
            data: {}
          });

          setIsAlertVisible(true);
          setAlertMessage('Успех!');
          setAlertDescription(response.data.message);
          setAlertType('success');

        } catch (e) {
          console.log(e);
          setTimeout(() => setIsLoadingSmall(false), 500);
        }
      } else {
        setIsAlertVisible(true);
        setAlertMessage('Успех!');
        setAlertDescription("Спецификация отправлена!");
        setAlertType('success');
      }
  }

  console.log(activeRole);

  return (
      <div className={'sa-engineer-page-container'}>
        <Spin size="large" spinning={isLoading}>
          <div className={'sa-engineer-page'}>
            <Affix>
              <div style={{ padding: '10px 12px 0 12px', backgroundColor: '#b4c9e1' }}>
                <div
                    className={'sa-control-panel sa-flex-space sa-pa-12 sa-list-header'}
                    style={{ margin: 0 }}
                >
                  <div className={'sa-header-label-container'}>
                    <div className={'sa-header-label-container-small'}>
                      <h1 className={`sa-header-label`}>
                       Спецификация
                      </h1>
                      <div className={'sa-engineer-steps-currency'}>
                        <div>
                          <CurrencyMonitorBar />
                        </div>
                      </div>
                    </div>
                    <div className={'sa-header-label-container-small'}>
                      {manager && (
                          <div className={'sa-vertical-flex'} style={{alignItems: 'baseline'}}>
                            От инженера
                            <Tag
                                style={{
                                  textAlign: 'center',
                                  fontSize: '14px',
                                }}
                                color="geekblue"
                            >
                              {engineer && (`${engineer.engineer_name}`)}
                            </Tag>
                            для
                            <Tag
                                style={{
                                  textAlign: 'center',
                                  fontSize: '14px',
                                }}
                                color={companies.find(comp => comp.id === manager.id_company)?.color}
                            >
                              {manager && (`${manager.manager_name}`)}
                            </Tag>
                          </div>
                      )}
                      <Button
                          type={'primary'}
                          style={{ width: '150px' }}
                          icon={<SaveOutlined />}
                          loading={isSavingInfo}
                          onClick={() => setIsSavingInfo(true)}
                          disabled={!editMode}
                      >
                        {isSavingInfo ? 'Сохраняем...' : 'Сохранить'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Affix>
            <div className={'sa-engineer-page-info-container'}>
              <div className={'sa-engineer-page-btns-wrapper'}>
                {(activeRole === 2 || superUser) ? (
                    <>
                      <Tooltip title={'Копировать спецификацию'} placement={'right'}>
                        <Button className={'sa-engineer-page-btn'}
                                color="primary"
                                variant="outlined"
                                disabled={!editMode}
                                icon={<CopyOutlined className={'sa-engineer-page-btn-icon'}/>}
                                onClick={() => {setOpenCopySpecification(true);}}
                        ></Button>
                      </Tooltip>
                      <Tooltip title={'Отправить спецификацию'} placement={'right'}>
                        <Button className={'sa-engineer-page-btn'}
                                color="primary"
                                variant="outlined"
                                disabled={!editMode}
                                icon={<SendOutlined className={'sa-engineer-page-btn-icon'}/>}
                                onClick={handleSpecificationFinal}
                        ></Button>
                      </Tooltip>
                    </>
                ) : ""}

                {(activeRole === 1 || superUser) ? (
                    <>
                      <Tooltip title={'Создать КП'} placement={'right'}>
                        <Button className={'sa-engineer-page-btn'}
                                color="primary"
                                variant="outlined"
                                disabled={editMode && +bidPlace === 4}
                                onClick={() => {
                                  setOpenAddIntoBidSpecification(true);
                                  setCopyType(3);
                                }}
                                icon={<ProfileOutlined className={'sa-engineer-page-btn-icon'}/>}
                        ></Button>
                      </Tooltip>
                      <Tooltip title={'Добавить в КП'} placement={'right'}>
                        <Button className={'sa-engineer-page-btn'}
                                color="primary"
                                variant="outlined"
                                disabled={editMode  && +bidPlace === 4}
                                onClick={() => {
                                  setOpenAddIntoBidSpecification(true);
                                  setCopyType(2);
                                }}
                                icon={<FileAddOutlined className={'sa-engineer-page-btn-icon'}/>}
                        ></Button>
                      </Tooltip>
                    </>
                ) : ""}

                <Tooltip title={'Файлы'} placement={'right'}>
                  <Badge count={bidFilesCount} color={'geekblue'}>
                    <Button className={'sa-engineer-page-btn'}
                            color="primary"
                            variant="outlined"
                            // disabled={!editMode}
                            icon={<DownloadOutlined className={'sa-engineer-page-btn-icon'}/>}
                            onClick={() => setIsEngineerFilesDrawerOpen(true)}
                    ></Button>
                  </Badge>
                </Tooltip>

                {(!engineer?.id && +bidPlace === 2) ? (
                        <>
                          <Tooltip title={'Принять заявку'} placement={'right'}>
                            <Button className={'sa-engineer-page-btn'}
                                    color="primary"
                                    variant="outlined"
                                    icon={<CheckOutlined className={'sa-engineer-page-btn-icon'}/>}
                                    onClick={() => {acceptOrder(bidId);}}
                            ></Button>
                          </Tooltip>
                        </>
                ) : ""}

              </div>
              <div className={'sa-engineer-page-info-wrapper'}>
                <div className={'sa-info-models-header'}>Основные данные</div>
                <div className={'custom-small-steps-container'}>
                  <Steps
                      className="sa-custom-steps custom-small-steps"
                      progressDot
                      size="small"
                      current={+bidPlace - 1}
                      items={[
                        {
                          title: 'Отклонено',
                          description: +bidPlace === 1 ? 'Текущий этап' : '',
                        },
                        {
                          title: 'Новая',
                          description: +bidPlace === 2 ? 'Текущий этап' : '',
                        },
                        {
                          title: 'В работе',
                          description: +bidPlace === 3 ? 'Текущий этап' : '',
                        },
                        {
                          title: 'Завершено',
                          description: +bidPlace === 4 ? 'Текущий этап' : '',
                        },
                      ]}
                  />
                </div>
                <div className={'sa-info-list'}>
                  <div className={'sa-info-list-row'}>
                    <div className={'sa-list-row-label'}><p>Комментарий инженера</p></div>
                    <TextArea
                        value={bidCommentEngineer}
                        autoSize={{minRows: 5, maxRows: 6}}
                        style={{fontSize: '18px'}}
                        onChange={(e) => setBidCommentEngineer(e.target.value)}
                        disabled={!editMode}
                    />
                  </div>
                  <div className={'sa-info-list-row'}>
                    <div className={'sa-list-row-label'}><p>Комментарий менеджера</p></div>
                    <TextArea
                        value={bidCommentManager}
                        autoSize={{minRows: 5, maxRows: 6}}
                        style={{fontSize: '18px'}}
                        onChange={(e) => setBidCommentManager(e.target.value)}
                        disabled={!editMode}
                    />
                    </div>
                </div>
              </div>
              <div className={'sa-engineer-page-models-wrapper'}>
                <div className={'sa-info-models-engineer-header'}>Спецификация оборудования и материалов</div>
                <div className={'sa-models-engineer-table-row sa-header-engineer-row'}>
                  <div className={'sa-models-table-engineer-cell sa-models-table-engineer-cell-header'}>
                    <p>№</p>
                  </div>
                  <div className={'sa-models-table-engineer-cell sa-models-table-engineer-cell-header'}>
                    <p className={'align-left'}>Название</p>
                  </div>
                  <div className={'sa-models-table-engineer-cell sa-models-table-engineer-cell-header'}>
                    <p className={'align-left'}>Кол-во</p>
                  </div>

                  <div
                      className={'sa-models-table-engineer-cell sa-models-table-engineer-cell-header'}
                      style={{ boxShadow: 'none' }}
                  >
                  </div>
                </div>
                <div className={'sa-models-table-engineer'}>
                  {bidModels
                      .sort((a, b) => +a.sort - +b.sort)
                      .map((bidModel, idx) => (
                          <div
                              className={'sa-models-engineer-table-row'}
                              key={`engineer-model-${idx}-${bidModel.bid_id}-${bidModel.id}-${bidModel.sort}`}
                          >
                            <div className={'sa-models-table-engineer-cell'}>
                              <p>{idx + 1}</p>
                            </div>
                            <div className={'sa-models-table-engineer-cell align-left'}>
                              <NameSelect
                                  options={prepareSelect(modelsSelect)}
                                  model={bidModel}
                                  onUpdateModelName={handleChangeModel}
                                  disabled={!editMode}
                              />
                            </div>
                            <div className={'sa-models-table-engineer-cell'}>
                              <ModelInput
                                  value={bidModel.model_count}
                                  bidModelId={bidModel.id}
                                  bidModelSort={bidModel.sort}
                                  type={'model_count'}
                                  onChangeModel={handleChangeModelInfo}
                                  disabled={!editMode}

                              />
                            </div>

                            <div
                                className={'sa-models-table-engineer-cell'}
                                style={{ padding: 0, boxShadow: 'none' }}
                            >
                              <Button
                                  color="primary"
                                  variant="filled"
                                  icon={<InfoCircleOutlined />}
                                  onClick={() => handleOpenModelInfo(bidModel.model_id)}
                              ></Button>

                              <Button
                                  color="danger"
                                  variant="filled"
                                  style={{marginLeft: "10px"}}
                                  icon={<DeleteOutlined />}
                                  onClick={() => handleDeleteModelFromBid(bidModel.id)}
                                  disabled={!editMode}
                              ></Button>
                            </div>

                          </div>
                      ))}
                </div>
                <div className={'sa-engineer-models-footer'}>
                  <div className={'sa-footer-btns'}>
                    <Button
                        style={{ width: '30%' }}
                        color="primary"
                        variant="outlined"
                        icon={<PlusOutlined />}
                        onClick={handleAddModel}
                        disabled={!editMode}
                    >
                      Добавить модель
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Spin>
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

        {openCopySpecification && (
            <CopyMessageView
                customText={"Введите ID спецификации, в которую нужно скопировать"}
                openCopySpecification={openCopySpecification}
                handleCancel={handleCancel}
                handleOk={handleOk}
                type={1}
                handleSetValue={handleSetValue}
            />
        )}

        <ModelInfoExtraDrawer model_id={modelIdExtra}
                              model_name={modelNameExtra}
                              closeDrawer={handleCloseDrawerExtra}
        />

        <EngineerFilesDrawer isOpenDrawer={isEngineerFilesDrawerOpen}
                        closeDrawer={() => setIsEngineerFilesDrawerOpen(false)}
                        bidId={bidId}
        />

        {openAddIntoBidSpecification && (
            <CopyMessageView
                customText={copyType === 3 ? "Введите ID организации, для которой нужно создать кп" : "Введите ID заявки, в которую нужно скопировать данные"}
                openCopySpecification={openAddIntoBidSpecification}
                handleCancel={handleCancel}
                handleOk={handleOk}
                type={copyType}
                handleSetValue={handleSetValue}
            />
        )}
      </div>
  );
};

export default EngineerPage;
