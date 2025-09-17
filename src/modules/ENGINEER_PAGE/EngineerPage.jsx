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
import { CSRF_TOKEN, PRODMODE } from '../../config/config';
import { PROD_AXIOS_INSTANCE } from '../../config/Api';
import './components/style/engPage.css'
// import { BID_INFO, CALC_INFO, CUR_COMPANY, CUR_CURRENCY, SELECTS, ALLMODELS_LIST } from './mock/mock';
import {SELECTS, ALLMODELS_LIST, CALC_INFO, MODELS_LIST, PREBID, CUR_COMPANY, CUR_CURRENCY} from './mock/mock';
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
  PlusOutlined, ProfileOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import NameSelect from './components/alan/NameSelect';
import ModelInput from './components/alan/ModelInput';
import ModelSelect from './components/alan/ModelSelect';
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
  const [bidPackageSelect, setBidPackageSelect] = useState([]);

  const [manager, setManager] = useState({name: "", surname: "", middlename: "", id_company: 0, id: 0, manager_name: ""});
  const [engineer, setEngineer] = useState({name: "", surname: "", middlename: "", id_company: 0, id: 0, engineer_name: ""});

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
    await fetchCurrencySelects();
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
        }
        // if (response.data && response.data.bid && response.data.bid_models) {
        //   const openMode = response.data.openmode;
        //   setOpenMode(openMode);
        //
        //   const bid = response.data.bid;
        //   setBidType(bid.type);
        //   setBidIdCompany(bid.id_company);
        //   setBidOrg(bid.properties.org);
        //   setBidPlace(bid.place);
        //   setBidOrgUser(bid.statuses.orguser); // пока что у меня есть только id, надо еще телефон и почту
        //   setBidProtectionProject(bid.statuses.protection);
        //   setBidObject(bid.properties.object);
        //   setBidSellBy(bid.properties.sellby);
        //
        //   setRequisite(bid.statuses.requisite);
        //   setConveyance(bid.statuses.conveyance);
        //   setFactAddress(bid.statuses.fact_address);
        //   setPhone(bid.statuses.org_phone);
        //   setEmail(bid.statuses.contact_email);
        //   setInsurance(bid.statuses.insurance);
        //   setBidPackage(bid.statuses.package);
        //   setConsignee(bid.properties.consignee);
        //   setOtherEquipment(bid.properties.other_equipment);
        //
        //   setBidCommentEngineer(bid.comments.engineer);
        //   setBidCommentManager(bid.comments.manager);
        //   setBidCommentAdmin(bid.comments.admin);
        //   setBidCommentAccountant(bid.comments.accountant);
        //   setBidCommentAddEquipment(bid.comments.add_equipment);
        //
        //   setBidCurrency(bid.finance.bid_currency);
        //   setBidPriceStatus(bid.statuses.price);
        //   setBidPercent(bid.finance.percent);
        //   setBidNds(bid.finance.nds);
        //
        //   setBidFilesCount(bid.files_count);
        //
        //   const models = response.data.bid_models;
        //   setBidModels(models);
        //   setEngineerParameters(response.data.models_data);
        //   setAmounts(response.data.amount);
        // }
      } catch (e) {
        console.log(e);
      }
    } else {
      console.log("HERE: 1");
      setManager(PREBID.manager);
      setEngineer(PREBID.engineer);
      // setOpenMode(BID.openmode);
      //
      // setBidType(BID.type);
      // setBidIdCompany(BID.id_company);
      // setBidOrg(BID.properties.org);
      // setBidPlace(BID.place);
      // setBidOrgUser(BID.statuses.orguser);
      // setBidProtectionProject(BID.statuses.protection);
      // setBidObject(BID.properties.object);
      // setBidSellBy(BID.properties.sellby);
      //
      // setRequisite(BID.statuses.requisite);
      // setConveyance(BID.statuses.conveyance);
      // setFactAddress(BID.statuses.fact_address);
      // setPhone(BID.statuses.org_phone);
      // setEmail(BID.statuses.contact_email);
      // setInsurance(BID.statuses.insurance);
      // setBidPackage(BID.statuses.package);
      // setConsignee(BID.properties.consignee);
      // setOtherEquipment(BID.properties.other_equipment);
      setBidCommentEngineer(PREBID.comment_engineer);
      setBidCommentManager(PREBID.comment_manager);
      // setBidCommentAdmin(BID.comments.admin);
      // setBidCommentAccountant(BID.comments.accountant);
      // setBidCommentAddEquipment(BID.comments.add_equipment);
      //
      // setBidCurrency(BID.finance.bid_currency);
      // setBidPriceStatus(BID.statuses.price);
      // setBidPercent(BID.finance.percent);
      // setBidNds(BID.finance.nds);
      //
      // setBidFilesCount(BID.files_count);
      //
      setBidModels(MODELS_LIST);
      setEngineerParameters(CALC_INFO.models_data);
      // setAmounts(AMOUNT);
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
  const handleOpenModelInfo = (modelId) => {};

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
                <Tooltip title={'Файлы'} placement={'right'}>
                  <Badge count={bidFilesCount} color={'geekblue'}>
                    <Button className={'sa-engineer-page-btn'}
                            color="primary"
                            variant="outlined"
                            icon={<DownloadOutlined className={'sa-engineer-page-btn-icon'}/>}
                    ></Button>
                  </Badge>
                </Tooltip>
                <Tooltip title={'Создать КП'} placement={'right'}>
                  <Button className={'sa-engineer-page-btn'}
                          color="primary"
                          variant="outlined"
                          icon={<ProfileOutlined  className={'sa-engineer-page-btn-icon'}/>}
                  ></Button>
                </Tooltip>
                <Tooltip title={'Создать счет'} placement={'right'}>
                  <Button className={'sa-engineer-page-btn'}
                          color="primary"
                          variant="outlined"
                          icon={<DollarOutlined className={'sa-engineer-page-btn-icon'}/>}
                  ></Button>
                </Tooltip>
              </div>
              <div className={'sa-engineer-page-info-wrapper'}>
                <div className={'sa-info-models-header'}>Основные данные</div>
                <div className={'sa-info-list'}>
                  <div className={'sa-info-list-row'}>
                    <div className={'sa-list-row-label'}><p>Комментарий инженера</p></div>
                    <TextArea
                        value={bidCommentEngineer}
                        autoSize={{minRows: 5, maxRows: 6}}
                        style={{fontSize: '18px'}}
                        onChange={(e) => setBidCommentEngineer(e.target.value)}
                    />
                  </div>
                  <div className={'sa-info-list-row'}>
                    <div className={'sa-list-row-label'}><p>Комментарий менеджера</p></div>
                    <TextArea
                        value={bidCommentManager}
                        autoSize={{minRows: 5, maxRows: 6}}
                        style={{fontSize: '18px'}}
                        onChange={(e) => setBidCommentManager(e.target.value)}
                    />
                    </div>
                </div>
              </div>
              <div className={'sa-engineer-page-models-wrapper'}>
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

                  <div
                      className={'sa-models-table-cell sa-models-table-cell-header'}
                      style={{ boxShadow: 'none' }}
                  >
                  </div>
                </div>
                <div className={'sa-models-table'}>
                  {bidModels
                      .sort((a, b) => +a.sort - +b.sort)
                      .map((bidModel, idx) => (
                          <div
                              className={'sa-models-table-row'}
                              key={`engineer-model-${idx}-${bidModel.bid_id}-${bidModel.id}-${bidModel.sort}`}
                          >
                            <div className={'sa-models-table-cell'}>
                              <p>{idx + 1}</p>
                            </div>
                            <div className={'sa-models-table-cell align-left'}>
                              <NameSelect
                                  options={prepareSelect(modelsSelect)}
                                  model={bidModel}
                                  onUpdateModelName={handleChangeModel}
                              />
                            </div>
                            <div className={'sa-models-table-cell'}>
                              <ModelInput
                                  value={bidModel.model_count}
                                  bidModelId={bidModel.id}
                                  bidModelSort={bidModel.sort}
                                  type={'model_count'}
                                  onChangeModel={handleChangeModelInfo}
                              />
                            </div>

                            <div
                                className={'sa-models-table-cell'}
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
                                  icon={<DeleteOutlined />}
                                  onClick={() => handleDeleteModelFromBid(bidModel.id)}
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
      </div>
  );
};

export default EngineerPage;
