import React, {useEffect, useState} from 'react';
import {Button, Flex, Input, Radio} from "antd";
import FullScreenSpin from "./components/FullScreenSpin";
import Print from "./components/Print";
import './style/print.css';
import {CSRF_TOKEN, PRODMODE} from "../../../../config/config";
import {useParams} from "react-router-dom";
import {PROD_AXIOS_INSTANCE} from "../../../../config/Api";
import {CALC_PDF, INFO_PDF, MODELS_PDF} from "../../mock/mock";

const BidPdfCreator = () => {
    const { bidId } = useParams();
    const [type, setType] = useState(1);
    const [isPrint, setIsPrint] = useState(false);
    const [isNeedCaclMoney, setIsNeedCaclMoney] = useState(true);
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [currency, setCurrency] = useState({ label: '$', value: '1' });
    const [info, setInfo] = useState({});
    const [models, setModels] = useState([]);
    const [amounts, setAmounts] = useState({});
    const [engineerParameters, setEngineerParameters] = useState({});
    const options = [
        { label: '$', value: '1' },
        { label: '€', value: '2' },
        { label: '₽', value: '3' },
    ];
    const [titleInfo, setTitleInfo] = useState({ manager: {}, contactPerson: {} });
    const [characteristicInfo, setCharacteristicInfo] = useState({});

    useEffect(() => {
        fetchInfoFromServer().then();
        fetchModelsFromServer().then();
    }, []);
    useEffect(() => {
        if (models && models.length > 0 && isNeedCaclMoney) {
            fetchCalcModels().then(() => {
                setIsNeedCaclMoney(false);
            });
        }
    }, [models]);
    useEffect(() => {
        if (isPrint) {
            const timer = setTimeout(() => {
                window.print();
                setIsPrint(false);
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [isPrint]);

    const fetchInfoFromServer = async () => {
        if (PRODMODE) {
            try {
                let response = await PROD_AXIOS_INSTANCE.get(`/api/sales/informationpng/${bidId}`, {
                    _token: CSRF_TOKEN,
                });
                if (response.data) {
                    setInfo(response.data);
                }
            } catch (e) {
                console.log(e);
            }
        } else {
            setInfo(INFO_PDF);
        }
    };
    const fetchModelsFromServer = async () => {
        if (PRODMODE) {
            try {
                let response = await PROD_AXIOS_INSTANCE.get(`/api/sales/anmodelpng/${bidId}`, {
                    _token: CSRF_TOKEN,
                });
                if (response.data) {
                    setModels(response.data);
                }
            } catch (e) {
                console.log(e);
            }
        } else {
            setModels(MODELS_PDF);
        }
    };
    const fetchCalcModels = async () => {
        if (PRODMODE) {
            try {
                let response = await PROD_AXIOS_INSTANCE.post('/api/sales/calcmodels', {
                    data: {
                        bid_info: {
                            bidCurrency: info?.titleInfo?.currency,
                            bidPriceStatus: info?.titleInfo?.statusmoney_id,
                            bidPercent: info?.titleInfo?.percent,
                            bidNds: info?.titleInfo?.nds > 0 ? 1 : 0,
                        },
                        bid_models: models,
                    },
                    _token: CSRF_TOKEN,
                });
                if (response.data.content) {
                    const content = response.data.content;
                    if (content.models) setModels(content.models);
                    if (content.amounts) setAmounts(content.amounts);
                    if (content.models_data) setEngineerParameters(content.models_data);
                }
            } catch (e) {
                console.log(e);
            }
        } else {
            if (CALC_PDF.models) setModels(CALC_PDF.models);
            if (CALC_PDF.amounts) setAmounts(CALC_PDF.amounts);
            if (CALC_PDF.models_data) setEngineerParameters(CALC_PDF.models_data);
        }
    };
    const handlePrint = () => {
        setIsPrint(true);
    };
    const handleCurrencyChange = (e) => {
        const selectedValue = e.target.value;
        const selectedOption = options.find(opt => opt.value === selectedValue);
        setCurrency(selectedOption || { label: '$', value: '1' });
    };

    return (
        <div className="app-pdf">
            <div className="edit-fields-wrapper">
                <Flex gap="middle" vertical style={{outline: '1px solid #99bad3', padding: '10px', borderRadius: '10px', background: '#fff'}}>
                    <div style={{fontWeight: 600}}>Создать PDF</div>
                    <Input
                        placeholder="Телефон"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                    <Input
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Radio.Group
                        block
                        options={options}
                        value={currency.value}
                        onChange={handleCurrencyChange}
                        optionType="button"
                        buttonStyle="solid"
                    />
                    <Button type="primary" onClick={handlePrint}>
                        Печать
                    </Button>
                </Flex>
            </div>

            {isPrint && (
                <Print
                    bidId={bidId}
                    type={type}
                    info={info}
                    models={models}
                    phone={phone}
                    email={email}
                    currency={currency}
                    amounts={amounts}
                />
            )}

            {isPrint && <FullScreenSpin />}
        </div>
    );
};

export default BidPdfCreator;
