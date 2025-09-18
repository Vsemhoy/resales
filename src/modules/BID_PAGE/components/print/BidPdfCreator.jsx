import React, {useEffect, useState} from 'react';
import {Button, Flex, Input, Radio} from "antd";
import FullScreenSpin from "./components/FullScreenSpin";
import Print from "./components/Print";
import './style/print.css';
import {PRODMODE} from "../../../../config/config";
import {useParams} from "react-router-dom";

const BidPdfCreator = () => {
    const { bidId } = useParams();
    const [type] = useState(1);
    const [isPrint, setIsPrint] = useState(false);
    const [email, setEmail] = useState('');
    const [currency, setCurrency] = useState({ label: '$', value: '1' });

    const options = [
        { label: '$', value: '1' },
        { label: '€', value: '2' },
        { label: '₽', value: '3' },
    ];

    const [titleInfo, setTitleInfo] = useState({ manager: {}, contactPerson: {} });
    const [characteristicInfo, setCharacteristicInfo] = useState({});

    useEffect(() => {
        getInfoFromServer();
    }, []);

    const getInfoFromServer = () => {
        if (PRODMODE) {
            try {
                fetch(`/test.json`)
                    .then(res => res.json())
                    .then(res => {
                        setTitleInfo(res.titleInfo);
                        setCharacteristicInfo(res.characteristicInfo);
                    });
            } catch (e) {
                console.log(e);
            }
        }
    }

    const handlePrint = () => {
        setIsPrint(true);
    }

    useEffect(() => {
        if (isPrint) {
            const timer = setTimeout(() => {
                window.print();
                setIsPrint(false);
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [isPrint]);

    const handleCurrencyChange = (e) => {
        const selectedValue = e.target.value;
        const selectedOption = options.find(opt => opt.value === selectedValue);
        setCurrency(selectedOption || { label: '$', value: '1' });
    }

    return (
        <div className="app-pdf">
            <div className="edit-fields-wrapper">
                <Flex gap="middle" vertical style={{outline: '1px solid #99bad3', padding: '10px', borderRadius: '10px', background: '#fff'}}>
                    <div style={{fontWeight: 600}}>Создать PDF</div>
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
                    info={{
                        titleInfo,
                        characteristicInfo
                    }}
                    email={email}
                    currency={currency}
                />
            )}

            {isPrint && <FullScreenSpin />}
        </div>
    );
};

export default BidPdfCreator;
