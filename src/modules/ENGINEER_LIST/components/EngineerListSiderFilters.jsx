import { PlusCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Affix, Button, Input, Select } from 'antd';
import React, { useEffect, useState } from 'react';

const EngineerListSiderFilters = (props) => {
	return (
		<Affix offsetTop={115}>
			<div className="sider-body sider-body-filters">
				<div className={'sider-unit'}>
					<div className="sider-unit-title">Компания</div>
					<div className="sider-unit-control">
						<Select
							placeholder=""
							style={{ width: '100%' }}
							options={props.filter_companies_select}
							onChange={(val) => props.on_change_filter_box('type', val)}
							allowClear
						/>
					</div>
				</div>

				<div className={'sider-unit'}>
					<div className="sider-unit-title">Оплата</div>
					<div className="sider-unit-control">
						<Select
							placeholder="Нет, есть, оплачен"
							style={{ width: '100%' }}
							options={props.filter_pay_select}
							onChange={(val) => props.on_change_filter_box('type', val)}
							allowClear
						/>
					</div>
				</div>

				<div className={'sider-unit'}>
					<div className="sider-unit-title">Подтверждение Администратора</div>
					<div className="sider-unit-control">
						<Select
							placeholder=""
							style={{ width: '100%' }}
							options={props.filter_admin_accept_select}
							onChange={(val) => props.on_change_filter_box('type', val)}
							allowClear
						/>
					</div>
				</div>

				<div className={'sider-unit'}>
					<div className="sider-unit-title">Упаковка</div>
					<div className="sider-unit-control">
						<Select
							placeholder=""
							style={{ width: '100%' }}
							options={props.filter_package_select}
							onChange={(val) => props.on_change_filter_box('type', val)}
							allowClear
						/>
					</div>
				</div>
				<div className={'sider-unit'}>
					<div className="sider-unit-title">Статус</div>
					<div className="sider-unit-control">
						<Select
							placeholder=""
							style={{ width: '100%' }}
							options={props.filter_price_select}
							onChange={(val) => props.on_change_filter_box('type', val)}
							allowClear
						/>
					</div>
				</div>
				<div className={'sider-unit'}>
					<div className="sider-unit-title">Валюта/Рубли</div>
					<div className="sider-unit-control">
						<Select
							placeholder=""
							style={{ width: '100%' }}
							options={props.filter_bid_currency_select}
							onChange={(val) => props.on_change_filter_box('type', val)}
							allowClear
						/>
					</div>
				</div>
				<div className={'sider-unit'}>
					<div className="sider-unit-title">НДС</div>
					<div className="sider-unit-control">
						<Select
							placeholder="Да, нет"
							style={{ width: '100%' }}
							options={props.filter_nds_select}
							onChange={(val) => props.on_change_filter_box('type', val)}
							allowClear
						/>
					</div>
				</div>
				<div className={'sider-unit'}>
					<div className="sider-unit-title">Реализация</div>
					<div className="sider-unit-control">
						<Select
							placeholder=""
							style={{ width: '100%' }}
							options={props.filter_complete_select}
							onChange={(val) => props.on_change_filter_box('type', val)}
							allowClear
						/>
					</div>
				</div>
			</div>
		</Affix>
	);
};

export default EngineerListSiderFilters;
