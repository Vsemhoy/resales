import React, { useEffect, useState } from 'react';
import './currencymonitorbar.css';
import {CSRF_TOKEN, PRODMODE} from "../../../config/config";
import {PROD_AXIOS_INSTANCE} from "../../../config/Api";
import {CUR_COMPANY, CUR_CURRENCY} from "../../../modules/ENGINEER_PAGE/mock/mock";
import {Spin} from "antd";

const CurrencyMonitorBar = (props) => {
	const [isMounted, setIsMounted] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [companyCurrency, setCompanyCurrency] = useState([{id_company: 0, value: 0, name_ru: 'Евро', charcode: 'EUR',}]);
	const [bankCurrency, setBankCurrency] = useState([{charcode: 'EUR', name_ru: 'Евро', value: 0, sign: '€',}]);

	useEffect(() => {
		if (!isMounted) {
			fetchInfo().then(() => {setIsMounted(true);});
		}
	}, []);

	const fetchInfo = async () => {
		setIsLoading(true);
		setTimeout(() => setIsLoading(false), 1000);
		await fetchCurrencySelects();
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

	return (
		<Spin size="large" spinning={isLoading}>
			<div className={'sa-currency-monitor-bar'}>
				<div title="Курс ЦБ" className={'sa-cura-cb'}>
					USD: <span>{bankCurrency.find(bank => bank.charcode === "USD")?.value}</span>
				</div>
				<div title="Курс продаж" className={'sa-cura-loc'}>
					USD: <span>{companyCurrency.find(cur => cur.charcode === "USD")?.value}</span>
				</div>
				<div title="Курс ЦБ" className={'sa-cura-cb'}>
					EUR: <span>{bankCurrency.find(bank => bank.charcode === "EUR")?.value}</span>
				</div>
				<div title="Курс продаж" className={'sa-cura-loc'}>
					EUR: <span>{companyCurrency.find(cur => cur.charcode === "EUR")?.value}</span>
				</div>
			</div>
		</Spin>
	);
};

export default CurrencyMonitorBar;
