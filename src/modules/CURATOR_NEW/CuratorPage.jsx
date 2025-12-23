import React, { useEffect, useState } from 'react';
import {Affix, Alert, Button, Dropdown, Layout, Pagination, Select, Space, Spin, Tag, Tooltip} from 'antd';
import CurrencyMonitorBar from '../../components/template/CURRENCYMONITOR/CurrencyMonitorBar';
import {CaretLeftFilled, CloseOutlined, FilterOutlined, PlusOutlined} from '@ant-design/icons';
import RemoteSearchSelect from '../BID_LIST/components/RemoteSearchSelect';
import Sider from 'antd/es/layout/Sider';
import BidListSiderFilters from '../BID_LIST/components/BidListSiderFilters';
import { Content } from 'antd/es/layout/layout';
import { NavLink } from 'react-router-dom';
import { ANTD_PAGINATION_LOCALE } from '../../config/Localization';
import CuratorListTable from './components/CuratorListTable';
import { CSRF_TOKEN, PRODMODE } from '../../config/config';
import {CONFIRM_LIST, COUNT, SUPERVISOR} from './mock/mock';
import { PROD_AXIOS_INSTANCE } from '../../config/Api';
// import './components/style/eng.css';
import './components/style/'
import EngineerListSiderFilters from "../ENGINEER_LIST/components/EngineerListSiderFilters";
import EngineerListTable from "../ENGINEER_LIST/components/EngineerListTable";
import OrderListSider from "../ENGINEER_LIST/components/OrderListSider";
import NewOrderModal from "../ENGINEER_LIST/components/NewOrderModal";
import CuratorListTableNew from "../CURATOR_NEW/components/CuratorListTableNew";

const CuratorPageNEW = (props) => {
	const [isOpenedFilters, setIsOpenedFilters] = useState(true);
	const [isLoading, setIsLoading] = useState(false);
	const [isMounted, setIsMounted] = useState(false);
	const [buttonLoading, setButtonLoading] = useState(false);
	const [supervisor, setSupervisor] = useState(false);
	const [total, setTotal] = useState(0);
	const [companies, setCompanies] = useState([]);

	const fetchInfo = async () => {
		setIsLoading(true);
		await fetchNeedCuratorsApproved();
		// await fetchBids();
		setIsLoading(false);
	};

	useEffect(() => {
		fetchInfo().then();
		// if (showGetItem !== null){
		//     handlePreviewOpen(showGetItem);
		//     setTimeout(() => {
		//
		//         setShowParam(showGetItem);
		//     }, 2200);
		// }
		setIsMounted(true);
	}, []);

	const handlePreviewOpen = (item, state) => {
		console.log('HELLO', item);
		// setShowParam(item);
		// setPreviewItem(item);
		// setIsPreviewOpen(true);
	};

	const fetchNeedCuratorsApproved = async () => {
		if (PRODMODE) {
			let response = await PROD_AXIOS_INSTANCE.post('/api/v2/curators', {
				_token: CSRF_TOKEN,
			});
			setCompanies(response.data.curators);
			setSupervisor(response.data.supervisor);
			setTotal(response.data.count);
		} else {
			setCompanies(CONFIRM_LIST);
			setSupervisor(SUPERVISOR);
			setTotal(COUNT);
		}
	};

	const approve = async (status, id) => {
		setButtonLoading(true);
		if (PRODMODE) {
			let response = await PROD_AXIOS_INSTANCE.put('/api/curators/approved/' + id, {
				status: status,
				_token: CSRF_TOKEN,
			});

			await fetchNeedCuratorsApproved();
			setButtonLoading(false);
		} else {
			console.log('All is good', status, id);
			setButtonLoading(false);
		}
	};

	if (isLoading) return <Spin spinning={isLoading} style={{ marginTop: '150px' }}></Spin>;

	return (
		<div className={`app-page sa-app-page ${isOpenedFilters ? 'sa-filer-opened' : ''}`}>
			<Affix>
				<div className={'sa-control-panel sa-flex-space sa-pa-12 sa-list-header'}>
					<div className={'sa-header-label-container'}>
						<div className={'sa-header-label-container-small'}>
							<h1 className={'sa-header-label'}>Кураторство</h1>
						</div>
						<div className={'sa-header-label-container-small'}>
							<div className={'sa-vertical-flex'}>
								<Space.Compact>
									<Button
										onClick={() => {
											setIsOpenedFilters(!isOpenedFilters);
										}}
										className={`${
											isOpenedFilters
												? 'sa-default-solid-btn-color'
												: 'sa-default-outlined-btn-color'
										}`}
										color={'default'}
										variant={isOpenedFilters ? 'solid' : 'outlined'}
										icon={<FilterOutlined />}
									>
										Доп Фильтры
									</Button>
									{/*{filterSortClearMenu.length > 0 && (*/}
									{/*	<Tooltip title={'Очистить фильтры'} placement={'right'}>*/}
									{/*		<Dropdown menu={{ items: filterSortClearMenu }}>*/}
									{/*			<Button*/}
									{/*				color={'danger'}*/}
									{/*				variant={'solid'}*/}
									{/*				icon={<CloseOutlined />}*/}
									{/*				onClick={handleClearAllBoxes}*/}
									{/*			></Button>*/}
									{/*		</Dropdown>*/}
									{/*	</Tooltip>*/}
									{/*)}*/}
								</Space.Compact>
								<Tag
									style={{
										width: '160px',
										height: '32px',
										lineHeight: '27px',
										textAlign: 'center',
										fontSize: '14px',
									}}
									color="geekblue"
								>
									Всего найдено: {total}
								</Tag>
							</div>
							<div style={{ display: 'flex', alignItems: 'end' }}>
								{/*{activeRole === 1 && (*/}
								{/*	<Button*/}
								{/*		type={'primary'}*/}
								{/*		icon={<PlusOutlined />}*/}
								{/*		onClick={addNewSpec}*/}
								{/*		disabled={blockNewSpec}*/}
								{/*	>*/}
								{/*		Новая спецификация*/}
								{/*	</Button>*/}
								{/*)}*/}
								{/*{activeRole === 2 && (*/}
								{/*	<Button*/}
								{/*		type={'primary'}*/}
								{/*		icon={<PlusOutlined />}*/}
								{/*		onClick={() => setBlockNewSpec(true)}*/}
								{/*		// onClick={addNewOrder}*/}
								{/*		disabled={blockNewSpec}*/}
								{/*	>*/}
								{/*		Новая заявка*/}
								{/*	</Button>*/}
								{/*)}*/}
							</div>
						</div>
					</div>
				</div>
			</Affix>

			<Layout className={'sa-layout sa-w-100'}>
				<Sider
					collapsed={!isOpenedFilters}
					collapsedWidth={0}
					width={'300px'}
					style={{ backgroundColor: '#ffffff' }}
				>
					<div className={'sa-sider'}>
						{isOpenedFilters && (
							<EngineerListSiderFilters
								// filter_status_select={prepareSelectOptions(filterStatusSelect)}
								// filter_companies_select={prepareSelectOptions(filterCompaniesSelect)}
								// on_change_filter_box={handleUpdateFilterBox}
							/>
						)}
					</div>
				</Sider>

				<Content>
					<Affix offsetTop={106}>
						<div className={'sa-pagination-panel sa-pa-12-24 sa-back'}>
							<div className={'sa-flex-space'}>
								<div className={'sa-flex-gap'}>
									{/*{isBackRoute && (*/}
									{/*	<NavLink to={`/orgs?show=${fromOrgId}`}>*/}
									{/*		<Button type={'default'} icon={<CaretLeftFilled />}>*/}
									{/*			Назад в компанию*/}
									{/*		</Button>*/}
									{/*	</NavLink>*/}
									{/*)}*/}
									<Pagination
										// defaultPageSize={onPage}
										defaultCurrent={1}
										// current={currentPage}
										total={total}
										// onChange={setCurrentPage}
										showQuickJumper
										locale={ANTD_PAGINATION_LOCALE}
										size={isOpenedFilters ? 'small' : 'middle'}
									/>
								</div>
							</div>
						</div>
					</Affix>

					<div
						className={`${isOpenedFilters ? 'sa-pa-tb-12 sa-pa-s-3' : 'sa-pa-12'}`}
						style={{ paddingTop: 0 }}
					>
						<Spin spinning={isLoading}>
							<CuratorListTableNew
								// fetchBids={fetchBids}
								// activeRole={activeRole}
								companies={companies}
								// specs={specs}
								// filter_steps={prepareSelectOptions(filterStep)}
								// filter_protection_projects={prepareSelectOptions(filterProtectionProject)}
								// filter_bid_types={prepareSelectOptions(filterBidType)}
								// on_change_filter_box={handleUpdateFilterBox}
								// on_preview_open={handlePreviewOpen}
								// on_set_sort_orders={setOrderBox}
								// base_companies={baseCompanies}
								// userData={userdata}
								// superUser={superUser}
							/>
						</Spin>
						<div className={'sa-space-panel sa-pa-12'}></div>
					</div>
				</Content>
				<Sider
					collapsed={!isOpenedFilters}
					collapsedWidth={0}
					width={'350px'}
					style={{ backgroundColor: '#ffffff' }}
				>
					<div className={'sa-sider'}>
						{/*{isOpenedFilters && (*/}
						{/*	<OrderListSider*/}
						{/*		orders={orders}*/}
						{/*		returnOrderToSpec={returnOrderToSpec}*/}
						{/*		acceptOrder={acceptOrder}*/}
						{/*		activeRole={activeRole}*/}
						{/*		isOpenModal={isOpenModal}*/}
						{/*		modalOrderID={modalOrderID}*/}
						{/*		modalReason={modalReason}*/}
						{/*		handleOk={handleOk}*/}
						{/*		handleCancel={handleCancel}*/}
						{/*		handleSetText={handleSetText}*/}
						{/*		// filter_pay_select={prepareSelectOptions(filterPaySelect)}*/}
						{/*		// filter_admin_accept_select={prepareSelectOptions(filterAdminAcceptSelect)}*/}
						{/*		// filter_package_select={prepareSelectOptions(filterPackageSelect)}*/}
						{/*		// filter_price_select={prepareSelectOptions(filterPriceSelect)}*/}
						{/*		// filter_bid_currency_select={prepareSelectOptions(filterBidCurrencySelect)}*/}
						{/*		// filter_nds_select={prepareSelectOptions(filterNdsSelect)}*/}
						{/*		// filter_complete_select={prepareSelectOptions(filterCompleteSelect)}*/}
						{/*		// filter_companies_select={prepareSelectOptions(filterCompaniesSelect)}*/}
						{/*		// on_change_filter_box={handleUpdateFilterBox}*/}
						{/*	/>*/}
						{/*)}*/}
					</div>
				</Sider>

				{/*{blockNewSpec && (*/}
				{/*	<NewOrderModal*/}
				{/*		open={blockNewSpec}*/}
				{/*		text={modalText}*/}
				{/*		title={modalTitle}*/}
				{/*		engineers={modelEngineers}*/}
				{/*		engineersSelect={engineerSelect}*/}
				{/*		handleOk={handleModalOk}*/}
				{/*		handleCancel={handleModalCancel}*/}
				{/*		handleSetModalText={handleSetModalText}*/}
				{/*		handleSetModalTitle={handleSetModalTitle}*/}
				{/*		fileListM={modalFileList}*/}
				{/*	/>*/}
				{/*)}*/}

				{/*{isAlertVisible && (*/}
				{/*	<Alert*/}
				{/*		message={alertMessage}*/}
				{/*		description={alertDescription}*/}
				{/*		type={alertType}*/}
				{/*		showIcon*/}
				{/*		closable*/}
				{/*		style={{*/}
				{/*			position: 'fixed',*/}
				{/*			top: 20,*/}
				{/*			right: 20,*/}
				{/*			zIndex: 9999,*/}
				{/*			width: 350,*/}
				{/*		}}*/}
				{/*		onClose={() => setIsAlertVisible(false)}*/}
				{/*	/>*/}
				{/*)}*/}
			</Layout>
		</div>
	);
};

export default CuratorPageNEW;
