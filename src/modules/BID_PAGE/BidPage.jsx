import React, {useEffect, useState} from 'react';
import {Spin} from "antd";
import {useParams} from "react-router-dom";
import {CSRF_TOKEN, PRODMODE} from "../../config/config";
import {PROD_AXIOS_INSTANCE} from "../../config/Api";
import {DeleteOutlined} from "@ant-design/icons";

const BidPage = (props) => {
    const {bidId} = useParams();
    const [isMounted, setIsMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [bidActions, setBidActions] = useState({});
    const [bidComments, setBidComments] = useState({});
    const [bidFinance, setBidFinance] = useState({});
    const [bidIdCompany, setBidIdCompany] = useState(null);
    const [bidPlace, setBidPlace] = useState(null);
    const [bidProject, setBidProject] = useState(null);
    const [bidProperties, setBidProperties] = useState({});
    const [bidStatuses, setBidStatuses] = useState({});
    const [bidType, setBidType] = useState(null);


    const [bidModels, setBidModels] = useState([]);

    const [bidExtra, setBidExtra] = useState({});

    const [openMode, setOpenMode] = useState({});
    const [openMods, setOpenMods] = useState({});


    const [typeSelect, setTypeSelect] = useState([]);

    const [companyCurrency, setCompanyCurrency] = useState(null);
    const [bankCurrency, setBankCurrency] = useState(null);

    const [garbage, setGarbage] = useState([]);
    const [modelsSelect, setModelsSelect] = useState([]);

    useEffect(() => {
        if (!isMounted) {
            fetchInfo().then();
            setIsMounted(true);
        }
    }, []);

    const fetchInfo = async () => {
        setIsLoading(true);
        await fetchBidInfo();
        await fetchSelects();
        await fetchCurrencySelects();
        await fetchBidModels();
        setTimeout(() => setIsLoading(false), 500);
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
                    setBidActions(data.actions);
                    setBidComments(data.comments);
                    setBidFinance(data.finance);
                    setBidIdCompany(data.id_company);
                    setBidPlace(data.place);
                    setBidProject(data.project);
                    setBidProperties(data.properties);
                    setBidStatuses(data.statuses);
                    setBidType(data.type);

                    setBidModels(data.bid_models);

                    setBidExtra(data.extra);
                    setOpenMode(data.openmode);
                    setOpenMods(data._openmods);
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
                let response = await PROD_AXIOS_INSTANCE.post('/api/sales/bidselects', {
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
        <Spin spinning={isLoading}>
            <div style={{width:'100vw',height:'calc(100vh - 34px)', display:'flex',alignItems:'center',justifyContent:'center'}}>
                <DeleteOutlined />
            </div>
        </Spin>
    );
}

export default BidPage;
