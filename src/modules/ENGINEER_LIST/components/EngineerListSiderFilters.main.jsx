import { PlusCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Affix, Button, Input, Select } from 'antd';
import React, { useEffect, useState } from 'react';

const EngineerListSiderFilters = (props) => {
	return (
		<div className="sa-org-sidebar-filters"><div className="sa-org-sidebar-heading">Фильтры спецификаций</div>
			<div className="sider-body sider-body-filters">
				<div className={'sider-unit'}>
					<div className="sider-unit-title">Компания</div>
					<div className="sider-unit-control">
						<Select
							placeholder=""
							style={{ width: '100%' }}
							options={props.filter_companies_select}
							onChange={(val) => props.on_change_filter_box('id_company', val)}
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
							options={props.filter_status_select}
							onChange={(val) => props.on_change_filter_box('status', val)}
							allowClear
						/>
					</div>
				</div>

			</div>
		</div>
	);
};

export default EngineerListSiderFilters;
