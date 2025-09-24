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

			</div>
		</Affix>
	);
};

export default EngineerListSiderFilters;
