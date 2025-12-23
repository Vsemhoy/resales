import {Affix, Alert, DatePicker, Input, Select} from 'antd';
import React, { useEffect, useState } from 'react';
import TableHeadNameWithSort from '../../../components/template/TABLE/TableHeadNameWithSort';
import CopyMessageView from "../../ENGINEER_PAGE/components/CopyMessageView";
import {BASE_ROUTE, CSRF_TOKEN, PRODMODE} from "../../../config/config";
import {PROD_AXIOS_INSTANCE} from "../../../config/Api";
import CuratorListRowNew from "./CuratorListRowNew";

const CuratorListTableNew = (props) => {
	const [sortOrders, setSortOrders] = useState([]);

	const [isPreviewOpen, setIsPreviewOpen] = useState(false);
	const [previewItem, setPreviewItem] = useState(null);

	const [openCopySpecification, setOpenCopySpecification] = useState(false);
	const [openAddIntoBidSpecification, setOpenAddIntoBidSpecification] = useState(false);
	const [openAddIntoBidSpecificationId, setOpenAddIntoBidSpecificationId] = useState(0);
	const [value, setValue] = useState(0);
	const [isLoadingSmall, setIsLoadingSmall] = useState(false);
	const [isAlertVisible, setIsAlertVisible] = useState(false);

	const [copyType, setCopyType] = useState(1);


	const [alertMessage, setAlertMessage] = useState('');
	const [alertDescription, setAlertDescription] = useState('');
	const [alertType, setAlertType] = useState('');

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
					<div className={'sa-table-box-curators sa-table-box-curators'}>
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
									Инициатор
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
								<div className={'sa-pa-3'}>Компания</div>
								<div className={'sa-pa-3'}>
									<Input
										size={'small'}
										style={{ width: '100%' }}
										variant="filled"
										onChange={(val) => props.on_change_filter_box('company_name', val.target.value)}
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
				{props.companies?.length > 0 &&
					props.companies.map((company, index) => (
						<CuratorListRowNew
							// activeRole={props.activeRole}
							data={company}
							// userData={props.userData}
							// superUser={props.superUser}
							// is_active={isPreviewOpen && previewItem === spec.id}
							// on_double_click={handlePreviewOpen}
							// key={index}
							// company_color={
							// 	props.base_companies?.find((item) => item.id === spec.id_company)?.color
							//}
						/>
					))}
			</div>


		</div>
	);
};

export default CuratorListTableNew;
