import React, {useEffect, useState} from 'react';
import {Affix, Badge, Button, Collapse, Input, Select, Spin, Steps, Tag, Tooltip} from "antd";
import {useParams} from "react-router-dom";
import {CSRF_TOKEN, PRODMODE} from "../../config/config";
import {PROD_AXIOS_INSTANCE} from "../../config/Api";
import './components/style/bidPage.css'
import {BID, BID_MODELS, CUR_COMPANY, CUR_CURRENCY, SELECTS} from "./mock/mock";
import MODELS from './mock/mock_models';
import CurrencyMonitorBar from "../../components/template/CURRENCYMONITOR/CurrencyMonitorBar";
import {
    BlockOutlined,
    CopyOutlined, DeleteOutlined, DollarOutlined, DownloadOutlined, FilePdfOutlined,
    FileSearchOutlined, FileWordOutlined,
    HistoryOutlined, InfoCircleOutlined,
    PlusOutlined,
    SaveOutlined
} from "@ant-design/icons";
import Panel from "antd/es/splitter/Panel";
const { TextArea } = Input;

const BidPage = (props) => {
    const {bidId} = useParams();
    const [isMounted, setIsMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSavingInfo, setIsSavingInfo] = useState(false);

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
    /* ПРОЕКТ */
    const [bidProject, setBidProject] = useState(null); // проект из карточки организации
    /* МОДЕЛИ */
    const [bidModels, setBidModels] = useState([]);
    const [amounts, setAmounts] = useState({});
    const [engineerParameters, setEngineerParameters] = useState({});
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


    useEffect(() => {
        if (!isMounted) {
            fetchInfo().then();
            setIsMounted(true);
        }
    }, []);
    useEffect(() => {
        if (isMounted && bidOrg && bidOrg.id) {
            fetchExtraSelects().then();
        }
    }, [bidOrg]);
    useEffect(() => {
        if (bidType) {
            document.title = `${+bidType === 1 ? 'КП' : +bidType === 2 ? 'Счет' : ''} | ${bidId}`;
        }
    }, [bidType]);
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
                let response = await PROD_AXIOS_INSTANCE.get(`/api/sales/offers/${bidId}?_token=${CSRF_TOKEN}&from_socket=false`, {
                    data: {},
                    _token: CSRF_TOKEN
                });
                console.log(response);
                if (response.data && response.data.bid && response.data.bid_models) {
                    const openMode = response.data.openmode;
                    setOpenMode(openMode);

                    const bid = response.data.bid;
                    setBidType(bid.type);
                    setBidIdCompany(bid.id_company);
                    setBidOrg(bid.properties.org);
                    setBidPlace(bid.place);
                    setBidOrgUser(bid.statuses.orguser); // пока что у меня есть только id, надо еще телефон и почту
                    setBidProtectionProject(bid.statuses.protection);
                    setBidObject(bid.properties.object);
                    setBidSellBy(bid.properties.sellby);
                    setBidCommentEngineer(bid.comments.engineer);
                    setBidCommentManager(bid.comments.manager);
                    setBidCommentAdmin(bid.comments.admin);
                    setBidCommentAccountant(bid.comments.accountant);
                    setBidCommentAddEquipment(bid.comments.add_equipment);
                    setBidCurrency(bid.finance.bid_currency);
                    setBidPriceStatus(bid.statuses.price);
                    setBidPercent(bid.finance.percent);
                    setBidNds(bid.finance.nds);

                    const models = response.data.bid_models;
                    setBidModels(models);
                    // Надо будет так
                    //const models = response.data.models;
                    //setBidModels(models.bid_models);
                    //setAmounts(models.amounts);
                    //setEngineerParameters(models.engineer_parameters);
                }
            } catch (e) {
                console.log(e);
            }
        } else {
            setOpenMode(BID.openmode);

            setBidType(BID.type);
            setBidIdCompany(BID.id_company);
            setBidOrg(BID.properties.org);
            setBidPlace(BID.place);
            setBidOrgUser(BID.statuses.orguser);
            setBidProtectionProject(BID.statuses.protection);
            setBidObject(BID.properties.object);
            setBidSellBy(BID.properties.sellby);
            setBidCommentEngineer(BID.comments.engineer);
            setBidCommentManager(BID.comments.manager);
            setBidCommentAdmin(BID.comments.admin);
            setBidCommentAccountant(BID.comments.accountant);
            setBidCommentAddEquipment(BID.comments.add_equipment);
            setBidCurrency(BID.finance.bid_currency);
            setBidPriceStatus(BID.statuses.price);
            setBidPercent(BID.finance.percent);
            setBidNds(BID.finance.nds);

            setBidModels(BID_MODELS);
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
    const fetchExtraSelects = async () => {
        if (PRODMODE) {
            try {
                let response = await PROD_AXIOS_INSTANCE.post('/api/sales/v2/bidselects', {
                    data: {orgId: bidOrg.id},
                    _token: CSRF_TOKEN
                });
                if (response.data && response.data.selects) {
                    const selects = response.data.selects;
                    setOrgUsersSelect(selects.orgusers_select);
                }
            } catch (e) {
                console.log(e);
            }
        } else {

        }
    };
    const fetchCurrencySelects = async () => {
        if (PRODMODE) {
            try {
                let response = await PROD_AXIOS_INSTANCE.post('/api/currency/getcurrency', {
                    data: {},
                    _token: CSRF_TOKEN
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
            setModelsSelect(MODELS);
        }
    };

    const fetchUpdates = async () => {
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

    const countOfComments = () => {
        return [
            bidCommentEngineer,
            bidCommentManager,
            bidCommentAdmin,
            bidCommentAccountant,
            bidCommentAddEquipment
        ].filter(comment => comment).length;
    };

    return (
        <div className={'sa-bid-page-container'}>
            <Spin size="large" spinning={isLoading}>
                <div className={'sa-bid-page'}>
                    <Affix>
                        <div style={{padding: '10px 12px 0 12px', backgroundColor: '#b4c9e1'}}>
                            <div className={'sa-control-panel sa-flex-space sa-pa-12 sa-list-header'} style={{margin:0}}>
                                <div className={'sa-header-label-container'}>
                                    <div className={'sa-header-label-container-small'}>
                                        <h1 className={`sa-header-label`}>
                                            {
                                                +bidType === 1 ? 'Коммерческое предложение' :
                                                +bidType === 2 ? 'Счет' : ''
                                            }
                                        </h1>
                                        <div className={'sa-bid-steps-currency'}>
                                            {/*{+bidType === 2 && (
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
                                            )}*/}
                                            <div>
                                                <CurrencyMonitorBar/>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={'sa-header-label-container-small'}>
                                        {(bidIdCompany && companies && companies.find(comp => comp.id === bidIdCompany) && bidOrg && bidOrg.name) && (
                                            <div className={'sa-vertical-flex'} style={{alignItems: 'baseline'}}>
                                                От компании
                                                <Tag
                                                    style={{
                                                        textAlign: 'center',
                                                        fontSize: '14px',
                                                    }}
                                                    color={companies.find(comp => comp.id === bidIdCompany)?.color}
                                                >{companies.find(comp => comp.id === bidIdCompany)?.name}</Tag>
                                                для
                                                <Tag
                                                    style={{
                                                        textAlign: 'center',
                                                        fontSize: '14px',
                                                    }}
                                                    color="geekblue"
                                                >{bidOrg.name}</Tag>
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
                                                Режим: <Tooltip title={openMode.description}><Tag color={openMode.color}>{openMode.tagtext}</Tag></Tooltip>
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
                    <div className={'sa-bid-page-info-container'}>
                        <div className={'sa-bid-page-btns-wrapper'}>
                            <Tooltip title={'Дублировать'} placement={'right'}>
                                <Button className={'sa-bid-page-btn'}
                                        color="primary"
                                        variant="outlined"
                                        icon={<CopyOutlined className={'sa-bid-page-btn-icon'}/>}
                                ></Button>
                            </Tooltip>
                            <Tooltip title={'История'} placement={'right'}>
                                <Button className={'sa-bid-page-btn'}
                                        color="primary"
                                        variant="outlined"
                                        icon={<HistoryOutlined className={'sa-bid-page-btn-icon'}/>}
                                ></Button>
                            </Tooltip>
                            <Tooltip title={'Сохранить в PDF'} placement={'right'}>
                                <Button className={'sa-bid-page-btn'}
                                        color="primary"
                                        variant="outlined"
                                        icon={<FilePdfOutlined className={'sa-bid-page-btn-icon'}/>}
                                ></Button>
                            </Tooltip>
                            {+bidType !== 2 && (
                                <Tooltip title={'Сохранить в WORD'} placement={'right'}>
                                    <Button className={'sa-bid-page-btn'}
                                            color="primary"
                                            variant="outlined"
                                            icon={<FileWordOutlined className={'sa-bid-page-btn-icon'}/>}
                                    ></Button>
                                </Tooltip>
                            )}
                            <Tooltip title={'Файлы'} placement={'right'}>
                                <Badge count={30} color={'geekblue'}>
                                    <Button className={'sa-bid-page-btn'}
                                            color="primary"
                                            variant="outlined"
                                            icon={<DownloadOutlined className={'sa-bid-page-btn-icon'}/>}
                                    ></Button>
                                </Badge>
                            </Tooltip>
                            {+bidType !== 2 && (
                                <Tooltip title={'Создать счет'} placement={'right'}>
                                    <Button className={'sa-bid-page-btn'}
                                            color="primary"
                                            variant="outlined"
                                            icon={<DollarOutlined className={'sa-bid-page-btn-icon'}/>}
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
                                <div className={'sa-info-list-row'}>
                                    <div className={'sa-list-row-label'}><p>Контактное лицо</p></div>
                                    <Select style={{width: '100%', textAlign: 'left'}}
                                            value={bidOrgUser}
                                            options={orgUsersSelect}
                                    />
                                </div>
                                <div className={'sa-info-list-row'}>
                                    <div className={'sa-list-row-label'}><p>Защита проекта</p></div>
                                    <Select style={{width: '100%', textAlign: 'left'}}
                                            value={bidProtectionProject}
                                            options={protectionSelect}
                                    />
                                </div>
                                <div className={'sa-info-list-row'}>
                                    <div className={'sa-list-row-label'}><p>Объект</p></div>
                                    <Input style={{width: '100%', height: '32px'}}
                                           value={bidObject}
                                    />
                                </div>
                                <div className={'sa-info-list-row'}>
                                    <div className={'sa-list-row-label'}><p>Срок реализации</p></div>
                                    <Input style={{width: '100%', height: '32px'}}
                                    />
                                </div>
                                <div className={'sa-info-list-row'}>
                                    <div className={'sa-list-row-label'}><p>Связанный проект</p></div>
                                    <Input style={{width: '100%', height: '32px'}}
                                           value={bidProject}
                                    />
                                </div>

                                <br/>

                                {+bidType === 2 && (
                                    <Collapse onChange={(val) => console.log(val)}
                                              size={'small'}
                                              items={[
                                                  {
                                                      key: '1',
                                                      label: (
                                                          <div style={{display: 'flex'}}>
                                                              Плательщик
                                                          </div>
                                                      ),
                                                      children: <div className={'sa-info-list-hide-wrapper'}>
                                                          <div className={'sa-info-list-row'}>
                                                              <div className={'sa-list-row-label'}><p>Плательщик</p>
                                                              </div>
                                                              <Select style={{width: '100%', textAlign: 'left'}}
                                                                      value={bidProtectionProject}
                                                                      options={protectionSelect}
                                                              />
                                                          </div>
                                                          <div className={'sa-info-list-row'}>
                                                              <div className={'sa-list-row-label'}><p>Способ
                                                                  транспортировки</p></div>
                                                              <Select style={{width: '100%', textAlign: 'left'}}
                                                                      value={bidProtectionProject}
                                                                      options={protectionSelect}
                                                              />
                                                          </div>
                                                          <div className={'sa-info-list-row'}>
                                                              <div className={'sa-list-row-label'}><p>Фактический
                                                                  адрес</p></div>
                                                              <Select style={{width: '100%', textAlign: 'left'}}
                                                                      value={bidProtectionProject}
                                                                      options={protectionSelect}
                                                              />
                                                          </div>
                                                          <div className={'sa-info-list-row'}>
                                                              <div className={'sa-list-row-label'}><p>Телефон</p></div>
                                                              <Select style={{width: '100%', textAlign: 'left'}}
                                                                      value={bidProtectionProject}
                                                                      options={protectionSelect}
                                                              />
                                                          </div>
                                                          <div className={'sa-info-list-row'}>
                                                              <div className={'sa-list-row-label'}><p>Email</p></div>
                                                              <Select style={{width: '100%', textAlign: 'left'}}
                                                                      value={bidProtectionProject}
                                                                      options={protectionSelect}
                                                              />
                                                          </div>
                                                          <div className={'sa-info-list-row'}>
                                                              <div className={'sa-list-row-label'}><p>Страховка</p>
                                                              </div>
                                                              <Select style={{width: '100%', textAlign: 'left'}}
                                                                      value={bidProtectionProject}
                                                                      options={protectionSelect}
                                                              />
                                                          </div>
                                                          <div className={'sa-info-list-row'}>
                                                              <div className={'sa-list-row-label'}><p>Упаковка</p></div>
                                                              <Select style={{width: '100%', textAlign: 'left'}}
                                                                      value={bidProtectionProject}
                                                                      options={protectionSelect}
                                                              />
                                                          </div>
                                                          <div className={'sa-info-list-row'}>
                                                              <div className={'sa-list-row-label'}>
                                                                  <p>Грузополучатель</p></div>
                                                              <Input style={{width: '100%', height: '32px'}}
                                                                     value={bidCommentAddEquipment}
                                                              />
                                                          </div>
                                                          <div className={'sa-info-list-row'}>
                                                              <div className={'sa-list-row-label'}><p>Доп.
                                                                  оборудование</p></div>
                                                              <Input style={{width: '100%', height: '32px'}}
                                                                     value={bidCommentAddEquipment}
                                                              />
                                                          </div>
                                                      </div>,
                                                  }
                                              ]}
                                    />
                                )}

                                <br/>


                                {/*<Badge count={5} color={'geekblue'}>*/}

                                <Collapse onChange={(val) => console.log(val)}
                                          size={'small'}
                                          style={{width:'100%'}}
                                          items={[
                                              {
                                                  key: 1,
                                                  label: (
                                                      <div style={{display: 'flex'}}>
                                                            Комментарии
                                                            <Badge
                                                                count={countOfComments()}
                                                                color={'geekblue'}
                                                                style={{ marginLeft: '8px', width: '20px' }}
                                                            />
                                                      </div>
                                                  ),
                                                  children: <div className={'sa-info-list-hide-wrapper'}>
                                                              <div className={'sa-info-list-row'}>
                                                                  <div className={'sa-list-row-label'}><p>Комментарий
                                                                      инженера</p></div>
                                                                  <TextArea
                                                                      value={bidCommentEngineer}
                                                                      autoSize={{minRows: 2, maxRows: 6}}
                                                                  />
                                                              </div>
                                                              <div className={'sa-info-list-row'}>
                                                                  <div className={'sa-list-row-label'}><p>Комментарий
                                                                      менеджера</p></div>
                                                                  <TextArea
                                                                      value={bidCommentManager}
                                                                      autoSize={{minRows: 2, maxRows: 6}}
                                                                  />
                                                              </div>
                                                              <div className={'sa-info-list-row'}>
                                                                  <div className={'sa-list-row-label'}><p>Комментарий
                                                                      администратора</p></div>
                                                                  <TextArea
                                                                      value={bidCommentAdmin}
                                                                      autoSize={{minRows: 2, maxRows: 6}}
                                                                  />
                                                              </div>
                                                              <div className={'sa-info-list-row'}>
                                                                  <div className={'sa-list-row-label'}><p>Комментарий
                                                                      бухгалтера</p></div>
                                                                  <TextArea
                                                                      value={bidCommentAccountant}
                                                                      autoSize={{minRows: 2, maxRows: 6}}
                                                                  />
                                                              </div>
                                                              <div className={'sa-info-list-row'}>
                                                                  <div className={'sa-list-row-label'}><p>Дополнительное
                                                                      оборудование</p></div>
                                                                  <TextArea
                                                                      value={bidCommentAddEquipment}
                                                                      autoSize={{minRows: 2, maxRows: 6}}
                                                                  />
                                                              </div>
                                                          </div>
                                              }
                                          ]}
                                />


                                <br/>

                                <div className={'sa-info-list-row'}>
                                    <div className={'sa-list-row-label'}><p>Валюта</p></div>
                                    <Select style={{width: '100%', textAlign: 'left'}}
                                            value={bidCurrency}
                                            options={bidCurrencySelect}
                                    />
                                </div>
                                <div className={'sa-info-list-row'}>
                                    <div className={'sa-list-row-label'}><p>Статус</p></div>
                                    <Select style={{width: '100%', textAlign: 'left'}}
                                            value={bidPriceStatus}
                                            options={priceSelect}
                                    />
                                </div>
                                <div className={'sa-info-list-row'}>
                                    <div className={'sa-list-row-label'}><p>Добавить процент</p></div>
                                    <Input style={{width: '100%', height: '32px'}}
                                           value={bidPercent}
                                    />
                                </div>
                                <div className={'sa-info-list-row'}>
                                    <div className={'sa-list-row-label'}><p>Вычесть НДС?</p></div>
                                    <Select style={{width: '100%', textAlign: 'left'}}
                                            value={bidNds}
                                            options={ndsSelect}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={'sa-bid-page-models-wrapper'}>
                            <div className={'sa-info-models-header'}>Спецификация оборудования и материалов</div>
                            <div className={'sa-models-table-row sa-header-row'}>
                                <div className={'sa-models-table-cell'}><p>№</p></div>
                                <div className={'sa-models-table-cell'}><p className={'align-left'}>Название</p></div>
                                <div className={'sa-models-table-cell'}><p className={'align-left'}>Кол-во</p></div>
                                <div className={'sa-models-table-cell'}><p className={'align-left'}>Процент</p></div>
                                <div className={'sa-models-table-cell'}><p>Цена</p></div>
                                <div className={'sa-models-table-cell'}><p>Сумма</p></div>
                                <div className={'sa-models-table-cell'}><p>Наличие</p></div>
                                <div className={'sa-models-table-cell'} style={{boxShadow: 'none'}}></div>
                                <div className={'sa-models-table-cell'}></div>
                            </div>
                            <div className={'sa-models-table'}>
                                {bidModels.map((bidModel, idx) => (
                                    <div className={'sa-models-table-row'}
                                         key={`bid-model-${idx}-${bidModel.bid_id}-${bidModel.id}`}>
                                        <div className={'sa-models-table-cell'}><p>{idx + 1}</p></div>
                                        <div className={'sa-models-table-cell align-left'}>
                                            <Select style={{width: '100%'}}
                                                    bordered={false}
                                                    value={bidModel.model_id}
                                                    options={modelsSelect.map(model => ({
                                                        value: model.id,
                                                        label: model.name
                                                    }))}
                                                    showSearch
                                                    optionFilterProp="label"
                                                    filterOption={(input, option) =>
                                                        option.label.toLowerCase().includes(input.toLowerCase())
                                                    }
                                            />
                                        </div>
                                        <div className={'sa-models-table-cell'}>
                                            <Input style={{width: '100%'}}
                                                // bordered={false}
                                                   type="number"
                                                   value={bidModel.model_count}
                                            />
                                        </div>
                                        <div className={'sa-models-table-cell'}>
                                            <Input style={{width: '100%'}}
                                                // bordered={false}
                                                   type="number"
                                                   value={bidModel.percent}
                                            />
                                        </div>
                                        <div className={'sa-models-table-cell'}>
                                            {/*<p>{bidModel.price}</p>*/}
                                            <p>{bidModel.model_id} {+bidCurrency === 1 ? '$' : +bidCurrency === 2 ? '₽' : ''}</p>
                                        </div>
                                        <div className={'sa-models-table-cell'}>
                                            {/*<p>{bidModel.amount}</p>*/}
                                            <p>{bidModel.model_id * 2} {+bidCurrency === 1 ? '$' : +bidCurrency === 2 ? '₽' : ''}</p>
                                        </div>
                                        <div className={'sa-models-table-cell'}>
                                            <Select style={{width: '100%'}}
                                                    bordered={false}
                                                    value={bidModel.presence}
                                                    options={presenceSelect}
                                                    // options={presenceSelect.map(presence => ({value: presence.id, label: presence.name}))}
                                                    showSearch
                                                    optionFilterProp="label"
                                                    filterOption={(input, option) =>
                                                        option.label.toLowerCase().includes(input.toLowerCase())
                                                    }
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
                                    <Button style={{width: '30%'}} color="primary" variant="outlined"
                                            icon={<PlusOutlined/>}>Добавить модель</Button>
                                    <Button style={{width: '30%'}} color="primary" variant="filled"
                                            icon={<FileSearchOutlined/>}>Анализ сырых данных</Button>
                                    <Button style={{width: '30%'}} color="primary" variant="filled"
                                            icon={<BlockOutlined/>}>Похожие</Button>
                                </div>
                                <div className={'sa-footer-table-amounts'}>
                                    <div className={'sa-footer-table'}>
                                        <div className={'sa-footer-table-col'}>
                                            <div className={'sa-footer-table-cell'}><p>Высота об-ния: 25U</p></div>
                                            <div className={'sa-footer-table-cell'}><p>Высота шкафа: 23U</p></div>
                                        </div>
                                        <div className={'sa-footer-table-col'}>
                                            <div className={'sa-footer-table-cell'}><p>Потр. мощ.: 1.29кВт</p></div>
                                            <div className={'sa-footer-table-cell'}><p>Вых. мощность: 360Вт</p></div>
                                        </div>
                                        <div className={'sa-footer-table-col'}>
                                            <div className={'sa-footer-table-cell'}><p>Мощность АС: 368Вт</p></div>
                                            <div className={'sa-footer-table-cell'}><p>Масса: 196.2кг</p></div>
                                        </div>
                                        <div className={'sa-footer-table-col'}>
                                            <div className={'sa-footer-table-cell'}>
                                                <p>Объем: 633.09 m3</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={'sa-footer-amounts'}>
                                        <div className={'sa-footer-amounts-col'}>
                                            <div className={'sa-footer-amounts-cell'}><p>Сумма в долларах</p></div>
                                            <div className={'sa-footer-amounts-cell'}><p>Сумма в евро</p></div>
                                            <div className={'sa-footer-amounts-cell'}><p>Сумма в рублях</p></div>
                                        </div>
                                        <div className={'sa-footer-amounts-col'}>
                                            <div className={'sa-footer-amounts-cell cell-amount'}><p>14 276,79 $</p></div>
                                            <div className={'sa-footer-amounts-cell cell-amount'}><p>13 710,251 €</p></div>
                                            <div className={'sa-footer-amounts-cell cell-amount'}><p>1 727 491,59 ₽</p></div>
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

export default BidPage;
