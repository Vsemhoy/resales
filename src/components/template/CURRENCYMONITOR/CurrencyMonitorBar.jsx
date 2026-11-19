import ClassicView from './CurrencyMonitorBar.classic.jsx';
import { usePageTheme } from '../../../context/PageThemeContext';
import React, { useEffect, useState } from 'react';
import './currencymonitorbar.css';
import {CSRF_TOKEN, PRODMODE, ROUTE_PREFIX} from "../../../config/config";
import {PROD_AXIOS_INSTANCE} from "../../../config/Api";
import {CUR_COMPANY, CUR_CURRENCY} from "../../../modules/ENGINEER_PAGE/mock/mock";
import {Skeleton, Popover, Button} from "antd";
import {DollarOutlined} from '@ant-design/icons';

const CurrencyMonitorBar = (props) => {
	const [isMounted, setIsMounted] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [companyCurrency, setCompanyCurrency] = useState([{id_company: 0, value: 0, name_ru: 'Евро', charcode: 'EUR',}]);
	const [bankCurrency, setBankCurrency] = useState([{charcode: 'EUR', name_ru: 'Евро', value: 0, sign: '€',}]);

	useEffect(() => {
		if (!isMounted) {
			fetchInfo().then(() => {setIsMounted(true);});
		}
	}, []);

	const fetchInfo = async () => {
		setIsLoading(true);
		try {
			await fetchCurrencySelects();
		} finally {
			setIsLoading(false);
		}
	};

	const fetchCurrencySelects = async () => {
		if (PRODMODE) {
			try {
				let response = await PROD_AXIOS_INSTANCE.post(`${ROUTE_PREFIX}/currency/getcurrency`, {
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

	const rates = (
			<div className={'sa-currency-monitor-bar'} aria-busy={isLoading}>
				{isLoading ? Array.from({ length: 4 }, (_, index) => (
					<Skeleton.Input key={index} active size="small" style={{ width: 65, minWidth: 65, height: 16 }} />
				)) : <>
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
				</>}
			</div>
	);
	return <>
		<div className="sa-currency-expanded">{rates}</div>
		<Popover title="Курсы валют" content={rates} trigger={['hover', 'click']}>
			<Button className="sa-currency-collapsed" aria-label="Курсы валют" icon={<DollarOutlined />} />
		</Popover>
	</>;
};

const ThemedCurrencyMonitorBar = (props) => {
 const theme = usePageTheme();
 return theme === 'main' ? <CurrencyMonitorBar {...props} /> : <ClassicView {...props} />;
};
export default ThemedCurrencyMonitorBar;
