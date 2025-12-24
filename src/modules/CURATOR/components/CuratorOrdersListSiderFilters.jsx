import { PlusCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Affix, Button, Input, Select } from 'antd';
import React, { useEffect, useState } from 'react';

const BidListSiderFilters = (props) => {
	const [targetStatus, setTargetStatus] = useState(null);
	const [user, setUser] = useState(null);
	const [adminAccept, setAdminAccept] = useState(null);
	const [packageStatus, setPackageStatus] = useState(null);
	const [priceStatus, setPriceStatus] = useState(null);
	const [bidCurrency, setBidCurrency] = useState(null);
	const [nds, setNds] = useState(null);
	const [completeStatus, setCompleteStatus] = useState(null);

	useEffect(() => {
		if (props.filter_box.target_status !== targetStatus) {
			setTargetStatus(props.filter_box.target_status);
		}
		if (props.filter_box.user !== user) {
			setUser(props.filter_box.user);
		}
		// if (props.filter_box.admin_accept !== adminAccept) {
		// 	setAdminAccept(props.filter_box.admin_accept);
		// }
		// if (props.filter_box.package !== packageStatus) {
		// 	setPackageStatus(props.filter_box.package);
		// }
		// if (props.filter_box.price !== priceStatus) {
		// 	setPriceStatus(props.filter_box.price);
		// }
		// if (props.filter_box.bid_currency !== bidCurrency) {
		// 	setBidCurrency(props.filter_box.bid_currency);
		// }
		// if (props.filter_box.nds !== nds) {
		// 	setNds(props.filter_box.nds);
		// }
		// if (props.filter_box.complete !== completeStatus) {
		// 	setCompleteStatus(props.filter_box.complete);
		// }
	}, [props.filter_box]);

	useEffect(() => {
		const timer = setTimeout((filterBox) => {
			const newFilterBox = {
				target_status: targetStatus ?? null,
				user: user ?? null,
				// pay_status: payStatus ?? null,
				// admin_accept: adminAccept ?? null,
				// package: packageStatus ?? null,
				// price: priceStatus ?? null,
				// bid_currency: bidCurrency ?? null,
				// nds: nds ?? null,
				// complete: completeStatus ?? null,
			};
			props.on_change_filter_box(newFilterBox);
		}, 700); // ⏱️ 1 секунда задержки
		return () => clearTimeout(timer);
	}, [
		targetStatus,
		user
		// payStatus,
		// adminAccept,
		// packageStatus,
		// priceStatus,
		// bidCurrency,
		// nds,
		// completeStatus,
	]);

	return (
		<Affix offsetTop={115}>
			<div className="sider-body sider-body-filters">
				<div className={'sider-unit'}>
					<div className="sider-unit-title">Компания</div>
					<div className="sider-unit-control">
						<Select
							placeholder=""
							style={{ width: '100%' }}
							value={targetStatus}
							options={props.filter_statuses_select}
							onChange={(val) => setTargetStatus(val)}
							allowClear
						/>
					</div>
				</div>

				{/*<div className={'sider-unit'}>*/}
				{/*	<div className="sider-unit-title">Инициатор</div>*/}
				{/*	<div className="sider-unit-control">*/}
				{/*		<Select*/}
				{/*			placeholder=""*/}
				{/*			style={{ width: '100%' }}*/}
				{/*			value={user}*/}
				{/*			options={props.filter_users_select}*/}
				{/*			onChange={(val) => setUser(val)}*/}
				{/*			allowClear*/}
				{/*		/>*/}
				{/*	</div>*/}
				{/*</div>*/}

				{/*<div className={'sider-unit'}>*/}
				{/*	<div className="sider-unit-title">Подтверждение Администратора</div>*/}
				{/*	<div className="sider-unit-control">*/}
				{/*		<Select*/}
				{/*			placeholder=""*/}
				{/*			style={{ width: '100%' }}*/}
				{/*			value={adminAccept}*/}
				{/*			options={props.filter_admin_accept_select}*/}
				{/*			onChange={(val) => setAdminAccept(val)}*/}
				{/*			allowClear*/}
				{/*		/>*/}
				{/*	</div>*/}
				{/*</div>*/}

				{/*<div className={'sider-unit'}>*/}
				{/*	<div className="sider-unit-title">Упаковка</div>*/}
				{/*	<div className="sider-unit-control">*/}
				{/*		<Select*/}
				{/*			placeholder=""*/}
				{/*			style={{ width: '100%' }}*/}
				{/*			value={packageStatus}*/}
				{/*			options={props.filter_package_select}*/}
				{/*			onChange={(val) => setPackageStatus(val)}*/}
				{/*			allowClear*/}
				{/*		/>*/}
				{/*	</div>*/}
				{/*</div>*/}
				{/*<div className={'sider-unit'}>*/}
				{/*	<div className="sider-unit-title">Статус</div>*/}
				{/*	<div className="sider-unit-control">*/}
				{/*		<Select*/}
				{/*			placeholder=""*/}
				{/*			style={{ width: '100%' }}*/}
				{/*			value={priceStatus}*/}
				{/*			options={props.filter_price_select}*/}
				{/*			onChange={(val) => setPriceStatus(val)}*/}
				{/*			allowClear*/}
				{/*		/>*/}
				{/*	</div>*/}
				{/*</div>*/}
				{/*<div className={'sider-unit'}>*/}
				{/*	<div className="sider-unit-title">Валюта/Рубли</div>*/}
				{/*	<div className="sider-unit-control">*/}
				{/*		<Select*/}
				{/*			placeholder=""*/}
				{/*			style={{ width: '100%' }}*/}
				{/*			value={bidCurrency}*/}
				{/*			options={props.filter_bid_currency_select}*/}
				{/*			onChange={(val) => setBidCurrency(val)}*/}
				{/*			allowClear*/}
				{/*		/>*/}
				{/*	</div>*/}
				{/*</div>*/}
				{/*<div className={'sider-unit'}>*/}
				{/*	<div className="sider-unit-title">НДС</div>*/}
				{/*	<div className="sider-unit-control">*/}
				{/*		<Select*/}
				{/*			placeholder="Да, нет"*/}
				{/*			style={{ width: '100%' }}*/}
				{/*			value={nds}*/}
				{/*			options={props.filter_nds_select}*/}
				{/*			onChange={(val) => setNds(val)}*/}
				{/*			allowClear*/}
				{/*		/>*/}
				{/*	</div>*/}
				{/*</div>*/}
				{/*<div className={'sider-unit'}>*/}
				{/*	<div className="sider-unit-title">Реализация</div>*/}
				{/*	<div className="sider-unit-control">*/}
				{/*		<Select*/}
				{/*			placeholder=""*/}
				{/*			style={{ width: '100%' }}*/}
				{/*			value={completeStatus}*/}
				{/*			options={props.filter_complete_select}*/}
				{/*			onChange={(val) => setCompleteStatus(val)}*/}
				{/*			allowClear*/}
				{/*		/>*/}
				{/*	</div>*/}
				{/*</div>*/}
			</div>
		</Affix>
	);
};

export default BidListSiderFilters;
