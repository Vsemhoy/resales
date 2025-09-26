import { Affix, DatePicker, Input, Select } from 'antd';
import React, { useEffect, useState } from 'react';
import TableHeadNameWithSort from '../../../components/template/TABLE/TableHeadNameWithSort';
import EngineerListRow from './EngineerListRow';

const EngineerListTable = (props) => {
	const [sortOrders, setSortOrders] = useState([]);

	const [isPreviewOpen, setIsPreviewOpen] = useState(false);
	const [previewItem, setPreviewItem] = useState(null);

	const handlePreviewOpen = (item, state) => {
		console.log('Hello');
		// setPreviewItem(item);
		// setIsPreviewOpen(true);
		if (props.on_preview_open) {
			props.on_preview_open(item, state);
		}
	};

	/**
	 * Обработчик сортировки колонок в таблице - триггер: клик на TableHeadNameWithSort
	 * @param {name} key
	 * @param {int} order
	 */
	const handleActivateSorter = (key, order) => {
		let newSorts = [];
		for (let i = 0; i < sortOrders.length; i++) {
			const element = sortOrders[i];
			if (element.order !== 0) {
				if (element.key !== key) {
					newSorts.push(element);
				}
			}
		}
		if (order === 0) {
		} else {
			newSorts.push({ key: key, order: order });
		}
		setSortOrders(newSorts);
	};

	useEffect(() => {
		console.log('sortOrders', sortOrders);
		if (props.on_set_sort_orders) {
			props.on_set_sort_orders(sortOrders);
		}
	}, [sortOrders]);

	return (
		<div className={'sa-table-box'} style={{ marginRight: 'auto ' }}>
			<Affix offsetTop={156}>
				<div className={'sa-table-box-header'}>
					<div className={'sa-table-box-engineers sa-table-box-row'}>
						<div className={'sa-table-box-cell'}>
							<div className={'sa-table-head-on'}>
								<TableHeadNameWithSort
									sort_key={'id'}
									on_sort_change={handleActivateSorter}
									active_sort_items={sortOrders}
								>
									id
								</TableHeadNameWithSort>
								<div className={'sa-pa-3'}>
									<Input
										type={'number'}
										size={'small'}
										style={{ width: '100%' }}
										variant="filled"
										onChange={(val) => props.on_change_filter_box('bid_id', val.target.value)}
									/>
								</div>
							</div>
						</div>
						<div className={'sa-table-box-cell'}>
							<div className={'sa-table-head-on'}>
								<TableHeadNameWithSort
									sort_key={'created_at'}
									on_sort_change={handleActivateSorter}
									active_sort_items={sortOrders}
								>
									Дата создания
								</TableHeadNameWithSort>
								<div className={'sa-pa-3'}>
									<DatePicker
										size={'small'}
										style={{ width: '100%' }}
										variant="filled"
										onChange={(val) => {
											if (val) {
												props.on_change_filter_box('created_at', [
													val.startOf('day').unix() * 1000,
													val.endOf('day').unix() * 1000,
												]);
											} else {
												props.on_change_filter_box('created_at', null);
											}
										}}
									/>
								</div>
							</div>
						</div>
						<div className={'sa-table-box-cell'}>
							<div className={'sa-table-head-on'}>
								<TableHeadNameWithSort
									sort_key={'username'}
									on_sort_change={handleActivateSorter}
									active_sort_items={sortOrders}
								>
									{props.activeRole === 2 ? "Инженер" : "Менеджер"}
								</TableHeadNameWithSort>
								<div className={'sa-pa-3'}>
									<Input
										size={'small'}
										style={{ width: '100%' }}
										variant="filled"
										onChange={(val) => props.on_change_filter_box('manager', val.target.value)}
									/>
								</div>
							</div>
						</div>
						<div className={'sa-table-box-cell'}>
							<div className={'sa-table-head-on'}>
								<div className={'sa-pa-3'}>Комментарий</div>
								<div className={'sa-pa-3'}>
									<Input
										size={'small'}
										style={{ width: '100%' }}
										variant="filled"
										onChange={(val) => props.on_change_filter_box('comment', val.target.value)}
									/>
								</div>
							</div>
						</div>
						<div className={'sa-table-box-cell'}>
							<div className={'sa-table-head-on'}>Спецификация</div>
						</div>
						<div className={'sa-table-box-cell'}>
							<div className={'sa-table-head-on'}>
								<div className={'sa-pa-3'}>Действия</div>
							</div>
						</div>
					</div>
				</div>
			</Affix>
			<div className={'sa-table-box-stack'}>
				{props.specs?.length > 0 &&
					props.specs.map((spec, index) => (
						<EngineerListRow
							activeRole={props.activeRole}
							data={spec}
							userData={props.userData}
							superUser={props.superUser}
							is_active={isPreviewOpen && previewItem === spec.id}
							on_double_click={handlePreviewOpen}
							key={index}
							company_color={
								props.base_companies?.find((item) => item.id === spec.id_company)?.color
							}
						/>
					))}
			</div>
		</div>
	);
};

export default EngineerListTable;
