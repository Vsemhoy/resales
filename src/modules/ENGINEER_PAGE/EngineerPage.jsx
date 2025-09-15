import React, {useEffect, useState} from 'react';
import {Affix, Badge, Button, Collapse, Input, Select, Spin, Steps, Tag, Tooltip} from "antd";
import {useParams} from "react-router-dom";
import {CSRF_TOKEN, PRODMODE} from "../../config/config";
import {PROD_AXIOS_INSTANCE} from "../../config/Api";
import './components/style/engPage.css'
// import {AMOUNT, BID, BID_MODELS, CUR_COMPANY, CUR_CURRENCY, MODELS_DATA, SELECTS} from "./mock/mock";
import {PREBID, SELECTS, ALLMODELS_LIST, MODELS_LIST, CALC_INFO} from "./mock/mock";
// import MODELS from './mock/mock_models';
import CurrencyMonitorBar from "../../components/template/CURRENCYMONITOR/CurrencyMonitorBar";
import {
  BlockOutlined,
  CopyOutlined, DeleteOutlined, DollarOutlined, DownloadOutlined, FilePdfOutlined,
  FileSearchOutlined, FileWordOutlined,
  HistoryOutlined, InfoCircleOutlined, LoadingOutlined,
  PlusOutlined, ProfileOutlined,
  SaveOutlined
} from "@ant-design/icons";
import Panel from "antd/es/splitter/Panel";
const { TextArea } = Input;

const EngineerPage = (props) => {
  const {bidId} = useParams();
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSmall, setIsLoadingSmall] = useState(false);
  const [isNeedCalcMoney, setIsNeedCalcMoney] = useState(false);
  const [isSavingInfo, setIsSavingInfo] = useState(false);

  const [lastUpdModel, setLastUpdModel] = useState(null);
  const [isUpdateAll, setIsUpdateAll] = useState(false);

  const [userData, setUserData] = useState(null);

  const [openMode, setOpenMode] = useState({}); // просмотр, редактирование
  /* ШАПКА СТРАНИЦЫ */
  const [bidType, setBidType] = useState(null);
  const [bidIdCompany, setBidIdCompany] = useState(null);
  const [bidOrg, setBidOrg] = useState({});
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
    rub: 0
  });
  const [engineerParameters, setEngineerParameters] = useState({
    unit: 0,
    box_size: 0,
    power_consumption: 0,
    max_power: 0,
    rated_power_speaker: 0,
    mass: 0,
    size: 0
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
  const [conveyanceSelect, setConveyanceSelect] = useState([]);
  const [insuranceSelect, setInsuranceSelect] = useState([]);
  const [ndsSelect, setNdsSelect] = useState([]);
  const [packageSelect, setPackageSelect] = useState([]);
  const [paySelect, setPaySelect] = useState([]);
  const [presenceSelect, setPresenceSelect] = useState([]);
  const [priceSelect, setPriceSelect] = useState([]);
  const [protectionSelect, setProtectionSelect] = useState([]);
  const [stageSelect, setStageSelect] = useState([]);
  const [templateWordSelect, setTemplateWordSelect] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [orgUsersSelect, setOrgUsersSelect] = useState([]);

  /*  PREBINFO */
  const [manager, setManager] = useState({name: "", surname: "", middlename: "", id_company: 0, id: 0, manager_name: ""});
  const [engineer, setEngineer] = useState({name: "", surname: "", middlename: "", id_company: 0, id: 0, engineer_name: ""});

  useEffect(() => {
    console.log(bidId);
    if (!isMounted) {
      fetchInfo().then(() => {
        // setIsNeedCalcMoney(true);
      });
      setIsMounted(true);
    }
  }, []);

  useEffect(() => {
    if (props.userdata) {
      setUserData(props.userdata);
    }
  }, [props.userdata]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        if (!isSavingInfo) {
          fetchUpdates().then();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSavingInfo]);
  useEffect(() => {
    if (isMounted && isNeedCalcMoney) { // && bidCurrency && bidPriceStatus && bidPercent && bidNds && bidModels
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

  const fetchInfo = async () => {
    setIsLoading(true);
    await fetchBidInfo();
    await fetchBidModels();
    setTimeout(() => setIsLoading(false), 1000);
    await fetchSelects();
    // await fetchCurrencySelects();
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
  const fetchSelects = async () => {
    if (PRODMODE) {
      try {
        let response = await PROD_AXIOS_INSTANCE.post('/api/sales/v2/bidselects', {
          data: {},
          _token: CSRF_TOKEN
        });
        if (response.data && response.data.selects) {
          const selects = response.data.selects;
          // setTypeSelect(selects.type_select);
          // setActionEnumSelect(selects.action_enum);
          // setAdminAcceptSelect(selects.admin_accept_select);
          // setBidCurrencySelect(selects.bid_currency_select);
          // setBidPresenceSelect(selects.bid_presence_select);
          // setCompleteSelect(selects.complete_select);
          // setConveyanceSelect(selects.conveyance_select);
          // setInsuranceSelect(selects.insurance_select);
          // setNdsSelect(selects.nds_select);
          // setPackageSelect(selects.package_select);
          // setPaySelect(selects.pay_select);
          // setPresenceSelect(selects.presence);
          // setPriceSelect(selects.price_select);
          // setProtectionSelect(selects.protection_select);
          // setStageSelect(selects.stage_select);
          // setTemplateWordSelect(selects.template_word_select);
          setCompanies(selects.companies);
        }
      } catch (e) {
        console.log(e);
      }
    } else {
      // setTypeSelect(SELECTS.type_select);
      // setActionEnumSelect(SELECTS.action_enum);
      // setAdminAcceptSelect(SELECTS.admin_accept_select);
      // setBidCurrencySelect(SELECTS.bid_currency_select);
      // setBidPresenceSelect(SELECTS.bid_presence_select);
      // setCompleteSelect(SELECTS.complete_select);
      // setConveyanceSelect(SELECTS.conveyance_select);
      // setInsuranceSelect(SELECTS.insurance_select);
      // setNdsSelect(SELECTS.nds_select);
      // setPackageSelect(SELECTS.package_select);
      // setPaySelect(SELECTS.pay_select);
      // setPresenceSelect(SELECTS.presence);
      // setPriceSelect(SELECTS.price_select);
      // setProtectionSelect(SELECTS.protection_select);
      // setStageSelect(SELECTS.stage_select);
      // setTemplateWordSelect(SELECTS.template_word_select);
      setCompanies(SELECTS.companies);
    }
  };
  // const fetchExtraSelects = async () => {
  //   if (PRODMODE) {
  //     try {
  //       let response = await PROD_AXIOS_INSTANCE.post('/api/sales/v2/bidselects', {
  //         data: {orgId: bidOrg.id},
  //         _token: CSRF_TOKEN
  //       });
  //       if (response.data && response.data.selects) {
  //         const selects = response.data.selects;
  //         setOrgUsersSelect(selects.orgusers_select);
  //       }
  //     } catch (e) {
  //       console.log(e);
  //     }
  //   } else {
  //     setOrgUsersSelect(SELECTS.orgusers_select);
  //   }
  // };
  // const fetchCurrencySelects = async () => {
  //   if (PRODMODE) {
  //     try {
  //       let response = await PROD_AXIOS_INSTANCE.post('/api/currency/getcurrency', {
  //         data: {},
  //         _token: CSRF_TOKEN
  //       });
  //       if (response.data) {
  //         setCompanyCurrency(response.data.company);
  //         setBankCurrency(response.data.currency);
  //       }
  //     } catch (e) {
  //       console.log(e);
  //     }
  //   } else {
  //     setCompanyCurrency(CUR_COMPANY);
  //     setBankCurrency(CUR_CURRENCY);
  //   }
  // };
  const fetchBidModels = async () => {
    if (PRODMODE) {
      try {
        let response = await PROD_AXIOS_INSTANCE.get('/api/sales/getmodels', {
          data: {},
          _token: CSRF_TOKEN
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
    console.log('fetchUpdates')
    if (PRODMODE) {
      try {
        setIsSavingInfo(true);

        setTimeout(() => setIsSavingInfo(false), 500);
      } catch (e) {
        console.log(e);
        setTimeout(() => setIsSavingInfo(false), 500);
      }
    } else {
      setIsSavingInfo(true);
      setTimeout(() => setIsSavingInfo(false), 500);
    }
  };

  const fetchCalcModels = async () => {
    console.log('fetchCalcModels')
    if (PRODMODE) {
      try {
        setIsLoadingSmall(true);
        let response = await PROD_AXIOS_INSTANCE.post('/api/sales/calcmodels', {
          data: {
            bid_info: {
              bidCurrency,
              bidPriceStatus,
              bidPercent,
              bidNds
            },
            bid_models: bidModels
          },
          _token: CSRF_TOKEN
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
      setIsSavingInfo(true);
      setTimeout(() => setIsLoadingSmall(false), 500);
    }
  };

  const prepareSelect = (select) => {
    return select.map((item) => ({value: item.id, label: item.name}));
  };

  const prepareEngineerParameter = (engineerParameter) => {
    const rounded = (+engineerParameter).toFixed(2);
    return rounded % 1 === 0 ? Math.round(rounded) : rounded;
  };

  const handleChangeModel = (newId, oldId, sort) => {
    const newModel = modelsSelect.find(model => model.id === newId);
    const oldModel = bidModels.find(model => (model.id === oldId && model.sort === sort));
    console.log(oldModel);
    console.log(newModel);
    const oldModelIdx = bidModels.findIndex(model => (model.id === oldId && model.sort === sort));
    const newModelObj = {
      "id": 0,
      "model_id": newId,
      "model_count": 1,
      "model_name": newModel.name,
      "sort": oldModel.sort,
    };
    const bidModelsUpd = JSON.parse(JSON.stringify(bidModels));
    bidModelsUpd[oldModelIdx] = newModelObj;
    setBidModels(bidModelsUpd);
    setIsNeedCalcMoney(true);
    setLastUpdModel(newId);
  }
  const handleChangeModelCount = (value, bidModelId, sort) => {
    const bidModelIdx = bidModels.findIndex(model => (model.id === bidModelId && model.sort === sort));
    const bidModelsUpd = JSON.parse(JSON.stringify(bidModels));
    // console.log(bidModelsUpd[sort-1]);
    bidModelsUpd[bidModelIdx].model_count = parseInt(value);
    setBidModels(bidModelsUpd);
    setIsNeedCalcMoney(true);
    setLastUpdModel(bidModels.find(model => model.id === bidModelId).model_id);
  };

  const handleAddModel = () => {
    const lastModel = bidModels[bidModels.length - 1];
    const bidModelsUpd = JSON.parse(JSON.stringify(bidModels));
    bidModelsUpd.push({
      "id": 0,
      "model_id": null,
      "model_count": null,
      "model_name": "",
      "sort": lastModel.sort + 1,
    });
    setBidModels(bidModelsUpd);
  };


  return (
      <div className={'sa-engineer-page-container'}>
        <Spin size="large" spinning={isLoading}>
          <div className={'sa-engineer-page'}>
            <Affix>
              <div style={{padding: '10px 12px 0 12px', backgroundColor: '#b4c9e1'}}>
                <div className={'sa-control-panel sa-flex-space sa-pa-12 sa-list-header'} style={{margin:0}}>
                  <div className={'sa-header-label-container'}>
                    <div className={'sa-header-label-container-small'}>
                      <h1 className={`sa-header-label`}>Спецификация</h1>
                      <div className={'sa-bid-steps-currency'}>
                        <div>
                          <CurrencyMonitorBar/>
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
                            {/*Ваша роль:*/}
                            {/*{userData && userData?.user?.sales_role === 1 && (*/}
                            {/*    <Tag color={'blue'}>Менеджер</Tag>*/}
                            {/*)}*/}
                            {/*{userData && userData?.user?.sales_role === 2 && (*/}
                            {/*    <Tag color={'volcano'}>Администратор</Tag>*/}
                            {/*)}*/}
                            {/*{userData && userData?.user?.sales_role === 3 && (*/}
                            {/*    <Tag color={'magenta'}>Бухгалтер</Tag>*/}
                            {/*)}*/}
                            {/*{userData && userData?.user?.sales_role === 4 && (*/}
                            {/*    <Tag color={'gold'}>Завершено</Tag>*/}
                            {/*)}*/}
                          </div>
                      )}
                      <Button type={'primary'}
                              style={{width: '150px'}}
                              icon={<SaveOutlined />}
                              loading={isSavingInfo}
                              onClick={fetchUpdates}
                      >{isSavingInfo ? 'Сохраняем...' : 'Сохранить'}</Button>
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
              <div className={'sa-bid-page-info-wrapper'}>
                <div className={'sa-info-models-header'}>Основные данные</div>
                <div className={'sa-info-list'}>
                  <div className={'sa-info-list-row'}>
                    <div className={'sa-list-row-label'}><p>Комментарий
                      инженера</p></div>
                    <TextArea
                        value={bidCommentEngineer}
                        autoSize={{minRows: 5, maxRows: 6}}
                        style={{fontSize: '18px'}}
                        onChange={(e) => setBidCommentEngineer(e.target.value)}
                    />
                  </div>
                  <div className={'sa-info-list-row'}>
                    <div className={'sa-list-row-label'}><p>Комментарий
                      менеджера</p></div>
                    <TextArea
                        value={bidCommentManager}
                        autoSize={{minRows: 5, maxRows: 6}}
                        style={{fontSize: '18px'}}
                        onChange={(e) => setBidCommentManager(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className={'sa-bid-page-models-wrapper'}>
                <div className={'sa-info-models-header'}>Спецификация оборудования и материалов</div>
                <div className={'sa-models-table-row sa-header-row'}>
                  <div className={'sa-models-table-cell sa-models-table-cell-header'}><p>№</p></div>
                  <div className={'sa-models-table-cell sa-models-table-cell-header'}><p
                      className={'align-left'}>Название</p></div>
                  <div className={'sa-models-table-cell sa-models-table-cell-header'}><p
                      className={'align-left'}>Кол-во</p></div>
                  <div className={'sa-models-table-cell sa-models-table-cell-header'} style={{boxShadow: 'none'}}></div>
                  {/*<div className={'sa-models-table-cell sa-models-table-cell-header'}></div>*/}
                </div>
                <div className={'sa-models-table'}>
                  {bidModels.map((bidModel, idx) => (
                      <div className={'sa-models-table-row'}
                           key={`bid-model-${idx}-${bidModel.bid_id}-${bidModel.id}-${bidModel.sort}`}>
                        <div className={'sa-models-table-cell'}><p>{idx + 1}</p></div>
                        <div className={'sa-models-table-cell align-left'}>
                          <Select style={{width: '100%'}}
                                  bordered={false}
                                  value={bidModel.model_id}
                                  options={prepareSelect(modelsSelect)}
                                  showSearch
                                  optionFilterProp="label"
                                  filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
                                  onChange={(val) => handleChangeModel(val, bidModel.id, bidModel.sort)}
                          />
                        </div>
                        <div className={'sa-models-table-cell'}>
                          <Input style={{width: '100%'}}
                                 type="number"
                                 value={bidModel.model_count}
                                 onChange={(e) => handleChangeModelCount(e.target.value, bidModel.id, bidModel.sort)}
                          />
                        </div>
                        <div className={'sa-models-table-cell'} style={{padding: 0, boxShadow: 'none'}}>
                          <Button color="primary" variant="filled" icon={<InfoCircleOutlined />}></Button>
                        </div>
                        <div className={'sa-models-table-cell'} style={{padding: 0}}>
                          <Button color="danger" variant="filled" icon={<DeleteOutlined />}></Button>
                        </div>
                      </div>
                  ))}
                </div>
                <div className={'sa-bid-models-footer'}>
                  <div className={'sa-footer-btns'}>
                    <Button style={{width: '30%'}}
                            color="primary"
                            variant="outlined"
                            icon={<PlusOutlined/>}
                            onClick={handleAddModel}
                    >Добавить модель</Button>
                    {/*<Button style={{width: '30%'}} color="primary" variant="filled"*/}
                    {/*        icon={<FileSearchOutlined/>}>Анализ сырых данных</Button>*/}
                    {/*<Button style={{width: '30%'}} color="primary" variant="filled"*/}
                    {/*        icon={<BlockOutlined/>}>Похожие</Button>*/}
                  </div>
                  <div className={'sa-footer-table-amounts'}>
                    <div className={'sa-footer-table'}>
                      <div className={'sa-footer-table-col'}>
                        <div className={'sa-footer-table-cell'}><p>
                          Высота об-ния:{' '}
                          {!isLoadingSmall ? (
                                  <span>{prepareEngineerParameter(engineerParameters.unit)}</span>
                          ) : (
                              <LoadingOutlined/>
                          )}{' '}
                          U
                        </p></div>
                        <div className={'sa-footer-table-cell'}><p>
                          Высота шкафа:{' '}
                          {!isLoadingSmall ? (
                                  <span>{prepareEngineerParameter(engineerParameters.box_size)}</span>
                          ) : (
                              <LoadingOutlined/>
                          )}{' '}
                          U
                        </p></div>
                      </div>
                      <div className={'sa-footer-table-col'}>
                        <div className={'sa-footer-table-cell'}><p>
                          Потр. мощ.:{' '}
                          {!isLoadingSmall ? (
                                  <span>{prepareEngineerParameter(engineerParameters.power_consumption)}</span>
                          ) : (
                              <LoadingOutlined/>
                          )}{' '}
                          кВт
                        </p></div>
                        <div className={'sa-footer-table-cell'}><p>
                          Вых. мощность:{' '}
                          {!isLoadingSmall ? (
                                  <span>{prepareEngineerParameter(engineerParameters.max_power)}</span>
                          ) : (
                              <LoadingOutlined/>
                          )}{' '}
                          Вт
                        </p></div>
                      </div>
                      <div className={'sa-footer-table-col'}>
                        <div className={'sa-footer-table-cell'}><p>
                          Мощность АС:{' '}
                          {!isLoadingSmall ? (
                                  <span>{prepareEngineerParameter(engineerParameters.rated_power_speaker)}</span>
                          ) : (
                              <LoadingOutlined/>
                          )}{' '}
                          Вт
                        </p></div>
                        <div className={'sa-footer-table-cell'}><p>
                          Масса:{' '}
                          {!isLoadingSmall ? (
                                  <span>{prepareEngineerParameter(engineerParameters.mass)}</span>
                          ) : (
                              <LoadingOutlined/>
                          )}{' '}
                          кг
                        </p></div>
                      </div>
                      <div className={'sa-footer-table-col'}>
                        <div className={'sa-footer-table-cell'}>
                          <p>
                            Объем: {' '}
                            {!isLoadingSmall ? (
                                    <span>{prepareEngineerParameter(engineerParameters.size)}</span>
                            ) : (
                                <LoadingOutlined/>
                            )}{' '}
                            m3
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Spin>
      </div>
  );
}

export default EngineerPage;




// import React, { useEffect, useState } from 'react';
//
// import {Button, Col, Layout, Row} from 'antd';
// import {Content, Header} from 'antd/es/layout/layout';
//
// import './components/style/engineerpage.css';
// import TextArea from "antd/es/input/TextArea";
// import EngineerTable from "./components/EngineerTable";
// import {useParams} from "react-router-dom";
// import {CSRF_TOKEN, PRODMODE} from "../../config/config";
// import {ALLMODELS_LIST, MODELS_LIST} from "./mock/mock";
// import {PROD_AXIOS_INSTANCE} from "../../config/Api";
// import {Footer} from "antd/es/modal/shared";
//
// const EngineerPage = (props) => {
//   const { userdata } = props;
//
//   const {item_id} = useParams();
//
//   const [isMounted, setIsMounted] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//
//   const [models, setModels] = useState([]);
//   const [allModels, setAllModels] = useState([]);
//   const [editMode, setEditMode] = useState(false);
//   const [commentEngineer, setCommentEngineer] = useState("");
//
//   useEffect(() => {
//     if (!isMounted) {
//       fetchInfo().then(() => setIsMounted(true));
//     }
//   }, []);
//
//   const fetchInfo = async () => {
//     setIsLoading(true);
//     await fetchAllModels();
//     await fetchModelsBySpec();
//     setIsLoading(false);
//   };
//
//   const fetchAllModels = async () => {
//     if (PRODMODE){
//       let response = await PROD_AXIOS_INSTANCE.get('/api/sales/getmodels')
//
//       setAllModels(response.data.models);
//     } else {
//       setAllModels(ALLMODELS_LIST);
//     }
//   }
//
//   const fetchModelsBySpec = async () => {
//     if (PRODMODE){
//       try {
//         let response = await PROD_AXIOS_INSTANCE.post('/api/sales/engineer/' + item_id, {
//           _token: CSRF_TOKEN,
//           data: {}
//         })
//
//         setEditMode(response.data.content.edit);
//         setModels(response.data.content.models);
//         setCommentEngineer(response.data.content.comment);
//       } catch (e) {
//         console.log(e);
//       }
//     } else {
//       setEditMode(true);
//       setModels(MODELS_LIST);
//       setCommentEngineer("Hello world!")
//     }
//   }
//
//   const fetchUpdate = async (model, comment) => {
//     console.log("commentEngineer: ", comment);
//
//     if (PRODMODE){
//       let response = await PROD_AXIOS_INSTANCE.put('/api/sales/engineer/' + item_id, {
//         _token: CSRF_TOKEN,
//         data: {
//           models: model,
//           comment: comment
//         }
//       })
//     } else {
//       console.log("commentEngineer: ", comment);
//     }
//   }
//
//   // useEffect(() => {
//   //   if (isMounted) {
//   //     const timer = setTimeout(() => {
//   //       setIsLoading(true);
//   //       fetchUpdate().then(() => {
//   //         setIsLoading(false);
//   //       });
//   //     }, 200);
//   //
//   //     return () => clearTimeout(timer);
//   //   }
//   // }, [models, commentEngineer]);
//
//   const update_local_state = (type, value, index) => {
//     const modelsUpdate = JSON.parse(JSON.stringify(models));
//     let commentEngineerUpdate = JSON.parse(JSON.stringify(commentEngineer));
//
//     switch (type){
//       case "model":
//         modelsUpdate[index] = {
//           ...modelsUpdate[index],
//           model_id: value.value,
//           model_name: value.label,
//           model_count: value.count,
//         }
//         // fetchUpdate(modelsUpdate, commentEngineerUpdate).then()
//         break;
//
//       case "count":
//         modelsUpdate[index] = {
//           ...modelsUpdate[index],
//           model_count: value,
//         }
//
//         // fetchUpdate(modelsUpdate, commentEngineerUpdate).then()
//         break;
//
//       case "delete":
//         if (!editMode){
//           modelsUpdate.splice(index, 1);
//           // fetchUpdate(modelsUpdate, commentEngineerUpdate).then()
//         }
//         break;
//
//       case "comment":
//         commentEngineerUpdate = value;
//         // fetchUpdate(modelsUpdate, commentEngineerUpdate).then()
//         break;
//
//       case "new":
//         modelsUpdate.push({
//           model_id: value.value,
//           model_name: value.label,
//           model_count: value.count
//         });
//         break;
//
//       case "save":
//         console.log(modelsUpdate, commentEngineerUpdate)
//         break;
//     }
//
//     setModels(modelsUpdate);
//     setCommentEngineer(commentEngineerUpdate);
//   }
//
//   return (
//       <Layout style={{ background: '#b4cbe4', minHeight: '100vh' }}>
//         <Header style={{ background: '#b4cbe4', padding: '0 24px' }}>
//           <h1>Спецификация</h1>
//         </Header>
//         <Layout style={{ background: '#b4cbe4', padding: '24px' }}>
//           <Content>
//             <Row>
//               <Col span={9}>
//                 <div style={{
//                   // background: '#b4cbe4',
//                   padding: '24px',
//                   // borderRadius: '8px',
//                   // height: '100%'
//                 }}>
//                   <h3>Комментарий инженера</h3>
//                   <TextArea
//                       rows={5}
//                       placeholder="Введите текст..."
//                       style={{ width: "600px", fontSize: '18px' }}
//                       value={commentEngineer}
//                       disabled={!editMode}
//                       onChange={(e) =>  update_local_state("comment", e.target.value, 1)}
//                   />
//                 </div>
//               </Col>
//               <Col span={15}>
//                 <div style={{
//                   // background: '#fff',
//                   padding: '24px',
//                   // borderRadius: '8px',
//                   // height: '100%'
//                 }}>
//                   <h3>Основное содержимое</h3>
//                   <EngineerTable
//                       loading={isLoading}
//                       allModels={allModels}
//                       models={models}
//                       update_local_state={update_local_state}
//                       EDITMODE={!editMode}
//                   />
//                 </div>
//               </Col>
//             </Row>
//           </Content>
//           <Content>
//             <Row>
//               <Col span={9}>
//                 <Button> Закрыть </Button>
//               </Col>
//               <Col span={15}>
//                 <Button type={"primary"} style={{width: "100%"}} onClick={(e) => update_local_state("save", 1, 1)}> Сохранить </Button>
//               </Col>
//             </Row>
//           </Content>
//         </Layout>
//       </Layout>
//   );
// };
//
// export default EngineerPage;