import {Affix, Alert, DatePicker, Input, Select} from 'antd';
import React, { useEffect, useState } from 'react';
import TableHeadNameWithSort from '../../../components/template/TABLE/TableHeadNameWithSort';
import EngineerListRow from './EngineerListRow';
import CopyMessageView from "../../ENGINEER_PAGE/components/CopyMessageView";
import {BASE_ROUTE, CSRF_TOKEN, PRODMODE} from "../../../config/config";
import {PROD_AXIOS_INSTANCE} from "../../../config/Api";

const EngineerListTable = (props) => {
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

	const handleCopySpecification = async () => {
		if (PRODMODE) {
			try {
				let response = await PROD_AXIOS_INSTANCE.post('/api/sales/engineer/orders/copy/' + openAddIntoBidSpecificationId, {
					_token: CSRF_TOKEN,
					data: {
						bidId: value
					}
				});

				setOpenCopySpecification(true);

				// window.open(BASE_ROUTE + '/api/sales/engineer/' + response.data.newId);
			} catch (e) {
				console.log(e);
				setTimeout(() => setIsLoadingSmall(false), 500);
			}
		}
	};

	const handleCopySpecificationIntoBid = async () => {
		if (PRODMODE) {
			try {
				let response = await PROD_AXIOS_INSTANCE.post('/api/sales/engineer/orders/intoBid/' + openAddIntoBidSpecificationId, {
					_token: CSRF_TOKEN,
					data: {
						bidId: value,
						copyType,
					}
				});

				setOpenAddIntoBidSpecification(true);

				setIsAlertVisible(true);
				setAlertMessage('Успех!');
				setAlertDescription(response.data.message);
				setAlertType('success');

				setTimeout(() => {
					window.open(BASE_ROUTE + '/bids/' + response.data.content.bid_id, '_blank');
				}, 500);
			} catch (e) {
				console.log(e);
				setTimeout(() => setIsLoadingSmall(false), 500);
			}
		} else {
			window.open(BASE_ROUTE + '/bids/' + 1, '_blank');
		}
	};

	const handleCancel = () => {
		setOpenCopySpecification(false);
		setOpenAddIntoBidSpecification(false);
		setValue(0);
	};
	const handleOk = () => {
		console.log(11111)
		setOpenCopySpecification(false);
		setOpenAddIntoBidSpecification(false);
		setValue(0);
	};

	const handleSetValue = (spec_id, type) => {
		handleOk();
		setValue(spec_id);

		switch (type){
			case 1:
				handleCopySpecification().then( () => {
					setOpenCopySpecification(false);
					setOpenAddIntoBidSpecification(false);
				});
				break;

			case 2:
			case 3:
				handleCopySpecificationIntoBid().then( () => {
					setOpenCopySpecification(false);
					setOpenAddIntoBidSpecification(false);
				});
				break;
		}
		console.log(spec_id, type, openAddIntoBidSpecificationId);
	}

	const handleSpecificationFinal = async () => {
		console.log(openAddIntoBidSpecificationId);
		if (PRODMODE){
			try {
				let response = await PROD_AXIOS_INSTANCE.post('/api/sales/engineer/orders/final/' + openAddIntoBidSpecificationId, {
					_token: CSRF_TOKEN,
					data: {}
				});

				setIsAlertVisible(true);
				setAlertMessage('Успех!');
				setAlertDescription(response.data.message);
				setAlertType('success');

				props.fetchBids()

			} catch (e) {
				console.log(e);
				setTimeout(() => setIsLoadingSmall(false), 500);
			}
		} else {
			props.fetchBids()

			setIsAlertVisible(true);
			setAlertMessage('Успех!');
			setAlertDescription("Спецификация отправлена!");
			setAlertType('success');
		}
	}

	const handleOpenModalEngeneerCopy = (open, id, type) => {
		setOpenCopySpecification(open);
		setOpenAddIntoBidSpecificationId(id);
		setCopyType(type);
	};
	const handleEngeneerFinal = (id) => {
		setOpenAddIntoBidSpecificationId(id);
		handleSpecificationFinal().then();
	};
	const handleOpenModalManager = (open, id, type) => {
		setOpenAddIntoBidSpecification(open);
		setOpenAddIntoBidSpecificationId(id);
		setCopyType(type);
	};

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
							openModalEngeneerCopy={handleOpenModalEngeneerCopy}
							engeneerFinal={handleEngeneerFinal}
							openModalManager={handleOpenModalManager}
							company_color={
								props.base_companies?.find((item) => item.id === spec.id_company)?.color
							}
						/>
					))}
			</div>

			{openAddIntoBidSpecification && (
				<CopyMessageView
					customText={copyType === 3 ? "Введите ID организации, для которой нужно создать кп" : "Введите ID заявки, в которую нужно скопировать данные"}
					openCopySpecification={openAddIntoBidSpecification}
					handleCancel={handleCancel}
					handleOk={handleOk}
					type={copyType}
					handleSetValue={handleSetValue}
				/>
			)}

			{openCopySpecification && (
				<CopyMessageView
					customText={"Введите ID спецификации, в которую нужно скопировать"}
					openCopySpecification={openCopySpecification}
					handleCancel={handleCancel}
					handleOk={handleOk}
					type={1}
					handleSetValue={handleSetValue}
				/>
			)}

			{isAlertVisible && (
				<Alert
					message={alertMessage}
					description={alertDescription}
					type={alertType}
					showIcon
					closable
					style={{
						position: 'fixed',
						top: 20,
						right: 20,
						zIndex: 9999,
						width: 350,
					}}
					onClose={() => setIsAlertVisible(false)}
				/>
			)}

		</div>
	);
};

export default EngineerListTable;
