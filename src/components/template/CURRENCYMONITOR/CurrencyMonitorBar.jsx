import React, { useEffect, useState } from 'react';
import './currencymonitorbar.css';

const CurrencyMonitorBar = (props) => {
	return (
		<div className={'sa-currency-monitor-bar'}>
			<div title="Курс ЦБ" className={'sa-cura-cb'}>
				USD: <span>78</span>
			</div>
			<div title="Курс продаж" className={'sa-cura-loc'}>
				USD: <span>115</span>
			</div>
			<div title="Курс ЦБ" className={'sa-cura-cb'}>
				EUR: <span>88</span>
			</div>
			<div title="Курс продаж" className={'sa-cura-loc'}>
				EUR: <span>120</span>
			</div>
		</div>
	);
};

export default CurrencyMonitorBar;
