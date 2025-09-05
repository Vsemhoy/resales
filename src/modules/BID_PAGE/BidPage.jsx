import React, {useEffect, useState} from 'react';
import {Select, Spin} from "antd";
import {useParams} from "react-router-dom";
import {CSRF_TOKEN, PRODMODE} from "../../config/config";
import {PROD_AXIOS_INSTANCE} from "../../config/Api";
import {DeleteOutlined} from "@ant-design/icons";
import './components/style/bidPage.css'

const BidPage = (props) => {
    const {bidId} = useParams();
    const [isMounted, setIsMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);


    /* ШАПКА СТРАНИЦЫ */
    const [bidType, setBidType] = useState(null);
    const [bidIdCompany, setBidIdCompany] = useState(null);
    const [bidOrg, setBidOrg] = useState(null);
    const [bidPlace, setBidPlace] = useState(null); // статус по пайплайну
    const [openMode, setOpenMode] = useState({}); // просмотр, редактирование
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


    useEffect(() => {
        if (!isMounted) {
            fetchInfo().then();
            setIsMounted(true);
        }
    }, []);

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
                if (response.data) {
                    const data = response.data;

                }
            } catch (e) {
                console.log(e);
            }
        } else {

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
                    //setTypeSelect(response.data.selects.type_select);
                }
            } catch (e) {
                console.log(e);
            }
        } else {
            //setTypeSelect([]);
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
            setCompanyCurrency(null);
            setBankCurrency(null);
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
            setCompanyCurrency([]);
            setModelsSelect([]);
        }
    };

    return (
        <div className={'sa-bid-page-container'}>
            <Spin size="large" spinning={isLoading}>
                <div className={'sa-bid-page'}>
                    {bidId}
                </div>
            </Spin>
        </div>
    );
}

export default BidPage;
