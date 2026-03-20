import {Affix, DatePicker, Empty, Input, Select} from 'antd';
import React, { useEffect, useState } from 'react';
import TableHeadNameWithSort from '../../../components/template/TABLE/TableHeadNameWithSort';
import dayjs from 'dayjs';
import CuratorOrdersListRow from "./CuratorOrdersListRow";
import {CSRF_TOKEN, PRODMODE} from "../../../config/config";
import {PROD_AXIOS_INSTANCE} from "../../../config/Api";
import {CONFIRM_LIST, COUNT, SUPERVISOR} from "../mock/mock";

const CuratorOrdersListTable = (props) => {
	const [sortOrders, setSortOrders] = useState([]);

	const [isPreviewOpen, setIsPreviewOpen] = useState(false);
	const [previewItem, setPreviewItem] = useState(null);

	// Название компании в поиске
	const [filterName, setFilterName] = useState(null);
	const [filterTriggered, setFilterTriggered] = useState(null);

	const [orderId, setOrderId] = useState(null);
	const [orgId, setOrgId] = useState(null);
	const [companyName, setCompanyName] = useState(null);
	const [userName, setUserName] = useState(null);
	const [dates, setDates] = useState(null);

	useEffect(() => {
		if (props.filter_box.order_id !== orderId) {
			setOrderId(props.filter_box.order_id);
		}
        if (props.filter_box.org_id !== orgId) {
            setOrgId(props.filter_box.org_id);
        }
		if (props.filter_box.company_name !== companyName) {
			setCompanyName(props.filter_box.company_name);
			setFilterName(props.filter_box.company_name);
		}
		if (props.filter_box.user_name !== userName) {
			setUserName(props.filter_box.user_name);
		}
		if (props.filter_box.dates !== dates) {
			setDates(props.filter_box.dates);
		}
		setFilterTriggered(dayjs().unix());
	}, [props.filter_box]);

	useEffect(() => {
		console.log('sortOrders', sortOrders);
		if (props.on_set_sort_orders) {
			props.on_set_sort_orders(sortOrders);
		}
	}, [sortOrders]);

	useEffect(() => {
		const timer = setTimeout((filterBox) => {
			const newFilterBox = {
				order_id: orderId ?? null,
				org_id: orgId ?? null,
				company_name: companyName ?? null,
				user_name: userName ?? null,
				dates: dates ?? null,
			};
			console.log(newFilterBox);
			props.on_change_filter_box(newFilterBox);
			setFilterTriggered(dayjs().unix());
		}, 700); // ⏱️ 1 секунда задержки
		return () => clearTimeout(timer);
	}, [
		orderId,
        orgId,
		companyName,
		userName,
		dates,
	]);


	useEffect(() => {
		const timer = setTimeout((filterBox) => {
			setFilterName(companyName);
		}, 1500);
		return () => clearTimeout(timer);
	}, [companyName]);

	useEffect(() => {
		console.log('sortOrders', sortOrders);
		if (props.on_set_sort_orders) {
			props.on_set_sort_orders(sortOrders);
		}
	}, [sortOrders]);

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

	const handlePreviewOpen = (item, state) => {
		console.log('HELLO', item);
		setPreviewItem(item);
		setIsPreviewOpen(true);
	};

	return (
		<div className={'sa-table-box'}>
			<Affix offsetTop={156}>
				<div className={'sa-table-box-header'}>
					<div
						className={'sa-table-box-curators sa-table-box-row sa-table-box-row-header'}
					>
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
										style={{width: '100%'}}
										variant="filled"
										allowClear
										value={orderId}
										onChange={(val) =>
											val.target.value && +val.target.value !== 0
												? setOrderId(val.target.value)
												: setOrderId(null)
										}
									/>
								</div>
							</div>
						</div>
						<div className={'sa-table-box-cell'}>
							<div className={'sa-table-head-on'}>
								<TableHeadNameWithSort
									sort_key={'date'}
									on_sort_change={handleActivateSorter}
									active_sort_items={sortOrders}
								>
									Дата заявки
								</TableHeadNameWithSort>
								<div className={'sa-pa-3'}>
									<DatePicker
										size={'small'}
										style={{width: '100%'}}
										variant="filled"
										allowClear
										value={dates ? dayjs.unix(Number(dates)) : null}
										onChange={(date, dateString) => {
											console.log(date);
											console.log(dateString);
											setDates(date ? date.unix() : null);
										}}
										format="DD.MM.YYYY"
									/>
								</div>
							</div>
						</div>
                        <div className={'sa-table-head-on'}>
                            <TableHeadNameWithSort
                                sort_key={'org_id'}
                                on_sort_change={handleActivateSorter}
                                active_sort_items={sortOrders}
                            >
                                id организации
                            </TableHeadNameWithSort>
                            <div className={'sa-pa-3'}>
                                <Input
                                    type={'number'}
                                    size={'small'}
                                    style={{width: '100%'}}
                                    variant="filled"
                                    allowClear
                                    value={orgId}
                                    onChange={(val) =>
                                        val.target.value && +val.target.value !== 0
                                            ? setOrgId(val.target.value)
                                            : setOrgId(null)
                                    }
                                />
                            </div>
                        </div>
						<div className={'sa-table-box-cell'}>
							<div className={'sa-table-head-on'}>
								<TableHeadNameWithSort
									sort_key={'company_name'}
									on_sort_change={handleActivateSorter}
									active_sort_items={sortOrders}
								>
									Название организации
								</TableHeadNameWithSort>
								<div className={'sa-pa-3'}>
									<Input
										size={'small'}
										style={{width: '100%'}}
										variant="filled"
										allowClear
										value={companyName}
										onChange={(val) =>
											val.target.value && +val.target.value !== 0
												? setCompanyName(val.target.value)
												: setCompanyName(null)
										}
									/>
								</div>
							</div>
						</div>
						<div className={'sa-table-box-cell'}>
							<div className={'sa-table-head-on'}>
								<TableHeadNameWithSort
									sort_key={'user_name'}
									on_sort_change={handleActivateSorter}
									active_sort_items={sortOrders}
								>
									Инициатор
								</TableHeadNameWithSort>
								<div className={'sa-pa-3'}>
									<Input
										size={'small'}
										style={{width: '100%'}}
										variant="filled"
										allowClear
										value={userName}
										onChange={(val) =>
											val.target.value && +val.target.value !== 0
												? setUserName(val.target.value)
												: setUserName(null)
										}
									/>
								</div>
							</div>
						</div>
						<div className={'sa-table-box-cell'}>
							<div className={'sa-table-head-on'}>
								{props.supervisor ? ("Действия") : ("Статус")}
							</div>
						</div>
					</div>
				</div>
			</Affix>

			<div className={'sa-table-box-stack'}>
				{(props.orders && props.orders.length > 0) ?
					props.orders.map((order, index) => (
						<CuratorOrdersListRow
							filter_triggered={filterTriggered}
							filter_name={filterName}
							data={order}
							is_active={isPreviewOpen && previewItem === order.id}
							on_double_click={handlePreviewOpen}
							key={`order-row-${order.id}`}
							company_color={props.base_companies?.find((item) => item.id === order.id_company)?.color}
							userdata={props?.userdata}
							rerenderPage={props.rerenderPage}
							success_alert={props.success_alert}
							error_alert={props.error_alert}
							supervisor={props.supervisor}
							handleStatusChange={props.handleStatusChange}
						/>
					)) : (
						<Empty/>
					)
				}
			</div>
		</div>
	);
};

export default CuratorOrdersListTable;
