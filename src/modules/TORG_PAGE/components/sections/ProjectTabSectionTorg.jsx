import React, { useEffect, useState } from 'react';
import TorgPageSectionRow from '../TorgPageSectionRow';
import { AutoComplete, DatePicker, Input, Select, Tooltip } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { TORG_CHEVRON_SIZE, TORG_MAX_ROWS_TEXTAREA, TORG_MIN_ROWS_TEXTAREA } from '../TorgConfig';
import {
	ChevronDownIcon,
	ChevronUpIcon,
	QuestionMarkCircleIcon,
	TrashIcon,
} from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import {
	FullNameText,
	FullNameWithOccupy,
	getMonthName,
	ShortName,
} from '../../../../components/helpers/TextHelpers';
import { after } from 'lodash';
import { CSRF_TOKEN, PRODMODE } from '../../../../config/config';
import { PROD_AXIOS_INSTANCE } from '../../../../config/Api';
import { ORG_ERECTORS_MOCK, ORG_LINKBID_MOCK } from '../../../ORG_PAGE/components/mock/ORGPAGEMOCK';
import { Option } from 'antd/es/mentions';
import { LockFilled } from '@ant-design/icons';

const ProjectTabSectionTorg = (props) => {
	const [refreshMark, setRefreshMark] = useState(null);
	const [collapsed, setCollapsed] = useState(false);
	const [editMode, setEditMode] = useState(true); // true|false - режим редактирования

	const [data, setData] = useState(null);
	const [orgId, setOrgId] = useState(0);
	const [itemId, setItemId] = useState(null);
	const [projType, setProjType] = useState(0);
	const [deleted, setDeleted] = useState(0);
	const [name, setName] = useState('');
	const [equipment, setEquipment] = useState('');
	const [customer, setCustomer] = useState('');
	const [curator, setCurator] = useState('');
	const [address, setAddress] = useState('');
	const [stage, setStage] = useState('');
	const [contactperson, setContactperson] = useState('');
	// const [staffList,   setStaflist] = useState(0); // Создатель id8staff_list
	const [date, setDate] = useState(dayjs());
	const [cost, setCost] = useState('');
	const [bonus, setBonus] = useState('');
	const [comment, setComment] = useState('');
	const [typePeac, setTypePeac] = useState('');
	const [dateEnd, setDateEnd] = useState(null);
	const [erector, setErector] = useState('');
	// const [linkbidId,   setLinkbidId] = useState([]);
	const [bidsId, setBidsId] = useState([]);
	const [dateCreate, setDateCreate] = useState(dayjs().unix());
	const [idCompany, setIdCompany] = useState('');
	const [authorId, setAuthorId] = useState(null);
	const [author, setAuthor] = useState(null);

	const [searchErector, setSearchErector] = useState(props.data.erector_id);
	const [searchBid, setSearchBid] = useState('');

	const [_type, set_type] = useState(null);

	const [allowDelete, setAllowDelete] = useState(true);

	const [selects, setSelects] = useState(null);
	const [orgContacts, setOrgContacts] = useState([]);

	// Флаг для блюра — обновление в массиве уровнем ниже
	const [BLUR_FLAG, setBLUR_FLAG] = useState(null);
	// Флаг для действия — отправка в глобальный коллектор
	const [ACTION_FLAG, setACTION_FLAG] = useState(null);

	const [transContainer, setTransContainer] = useState([]);

	const [mountOrgList, setMountOrgList] = useState([]);
	const [mountBidList, setMountBidList] = useState([]);

	const [userdata, setUserdata] = useState(props.user_data);

	// ██    ██ ███████ ███████
	// ██    ██ ██      ██
	// ██    ██ █████   █████
	// ██    ██ ██      ██
	//  ██████  ██      ██
	useEffect(() => {
		setEditMode(props.edit_mode);
	}, [props.edit_mode]);

	useEffect(() => {
		setRefreshMark(props.refresh_mark);
	}, [props.refresh_mark]);

	useEffect(() => {
		setUserdata(props.user_data);
	}, [props.user_data]);

	const [authorFullName, setAuthorFullName] = useState('');
	const [authorShortName, setAuthorShortName] = useState('');

	useEffect(() => {
		setAuthorFullName(FullNameText(props.data?.curator));
		setAuthorShortName(
			ShortName(
				props.data?.curator?.surname,
				props.data?.curator?.name,
				props.data?.curator?.secondname
			)
		);
	}, [props.data?.curator]);

	useEffect(() => {
		setData(props.data);
		if (props.data.id) {
			setItemId(props.data.id);
			setOrgId(props.data.id_orgs);
			setProjType(props.data.id8an_projecttype ? props.data.id8an_projecttype : null);
			setName(props.data.name);
			setEquipment(props.data.equipment);
			setDeleted(props.data.deleted);
			setCustomer(props.data.customer);
			setAddress(props.data.address);
			setStage(props.data.stage);
			setContactperson(props.data.contactperson);
			setCurator(props.data.id8staff_list);
			setCost(props.data.cost);
			setBonus(props.data.bonus);
			setComment(props.data.comment);
			setTypePeac(props.data.typepaec);
			setDateEnd(props.data.date_end);
			setErector(props.data.erector_id);
			setSearchErector(props.data.erector_id);
			// setLinkbidId(props.data?.bidsId );
			setBidsId(props.data?.bidsId);
			setDateCreate(props.data.date_create);
			setIdCompany(props.data.id_company);

			setAuthorId(props.data.author_id);
			setAuthor(props.data.author);
			setDate(props.data?.date ? dayjs(props.data.date) : null);

			set_type(props.data.type);
		}
	}, [props.data]);

	useEffect(() => {
		setSelects(props.selects);
	}, [props.selects]);

	useEffect(() => {
		if (props.org_contacts) {
			let usess = [];
			let uids = [];
			let fusers = props.org_contacts.filter(
				(item) => !(!item.lastname && !item.name && !item.middlename)
			);

			for (let i = 0; i < fusers.length; i++) {
				const element = fusers[i];
				if (!uids.includes(element.id)) {
					let nm = `${
						(element.lastname ? element.lastname : '') +
						(element.lastname ? ' ' : '') +
						(element.name ? element.name : '') +
						(element.name ? ' ' : '') +
						(element.middlename ? element.middlename : '')
					}`;
					usess.push({
						key: 'kjfealllo' + element.id,
						value: element.value,
						label: nm,
					});
				}
			}
			setOrgContacts(usess);
		}
	}, [props.org_contacts]);

	// ██    ██ ███████ ███████       ██   ██
	// ██    ██ ██      ██             ██ ██
	// ██    ██ █████   █████   █████   ███
	// ██    ██ ██      ██             ██ ██
	//  ██████  ██      ██            ██   ██

	const handleDeleteItem = () => {
		if (allowDelete) {
			setDeleted(!deleted);
		}
		setTimeout(() => {
			setBLUR_FLAG();
			if (props.on_delete) {
				props.on_delete(itemId);
			}
		}, 1000);
	};

	useEffect(() => {
		setAllowDelete(props.allow_delete);
	}, [props.allow_delete]);

	useEffect(() => {
		setCollapsed(props.collapsed);
	}, [props.collapsed]);

	/**
	 * Архитектура основы от Алана такова,
	 * что загружаются сразу все 35000 компаний в список без всякой фильтрации
	 * @param {*} id
	 */
	const get_orgautofill_action = async (id) => {
    if (!searchErector){ return; }
		if (PRODMODE) {
			try {
				let response = await PROD_AXIOS_INSTANCE.post('/api/sales/passportselects', {
					data: {
						erector: searchErector,
					},
					_token: CSRF_TOKEN,
				});
				if (response.data) {
					setMountOrgList(response.data.selects.erector);
					// if (props.changed_user_data){
					//     props.changed_user_data(response.data);
					// }
				}
			} catch (e) {
				console.log(e);
			} finally {
			}
		} else {
			setMountOrgList(ORG_ERECTORS_MOCK);
		}
	};

	const get_bidautofill_action = async (id) => {
    if (!orgId){ return; }
		if (PRODMODE) {
			try {
				let response = await PROD_AXIOS_INSTANCE.post('/api/sales/passportselects', {
					data: { linkbid: searchBid, org_id: orgId },
					_token: CSRF_TOKEN,
				});
				if (response.data) {
					setMountBidList(response.data.selects.linkbid);
				}
			} catch (e) {
				console.log(e);
			} finally {
			}
		} else {
			setMountBidList(ORG_LINKBID_MOCK);
		}
	};

	/** -------------------API------------------ */

	useEffect(() => {
		get_orgautofill_action();
	}, [searchErector]);

	useEffect(() => {
		get_bidautofill_action();
	}, [searchBid]);

	useEffect(() => {
		if (!BLUR_FLAG) return;
		// if (editMode && !collapsed && data && data.command === 'create' && deleted){
		//   // Лазейка для удаления созданных в обход таймаута - позволяет избежать гонок при очень быстром удалении
		//       if (props.on_change){
		//         data.deleted = deleted;
		//             data.command = 'delete';
		//             props.on_change('notes', itemId, data);
		//             return;
		//       }
		//     }
		const timer = setTimeout(() => {
			// При сверх-быстром изменении полей в разных секциях могут быть гонки
			if (editMode && !collapsed && data) {
				if (props.on_change) {
					data.name = name;
					data.equipment = equipment;
					data.customer = customer;
					data.address = address;
					data.stage = stage;
					data.contactperson = contactperson;
					data.cost = cost;
					data.bonus = bonus;
					data.comment = comment;
					data.typepaec = typePeac;
					data.erector = erector;
					data.erector_id = erector;
					data.bidsId = bidsId;
					data.idCompany = idCompany;
					data.authorId = authorId;
					data.author = author;
					data.date = date ? date.format('DD.MM.YYYY HH:mm:ss') : null;
					data.id8an_projecttype = projType;
					data.date_end = dateEnd;

					data.deleted = deleted;

					if (data.command === undefined || data.command !== 'create') {
						if (deleted) {
							data.command = 'delete';
						} else {
							data.command = 'update';
						}
					}

					props.on_change('projects', itemId, data);
				}
			}
		}, 500);

		return () => clearTimeout(timer);
	}, [BLUR_FLAG]);

	useEffect(() => {
		if (!ACTION_FLAG) {
			return;
		}
		const timer = setTimeout(() => {
			// При сверх-быстром изменении полей в разных секциях могут быть гонки
			if (editMode && data) {
				if (props.on_collect) {
					const newData = JSON.parse(JSON.stringify(data));
					newData.name = name;
					newData.equipment = equipment;
					newData.customer = customer;
					newData.address = address;
					newData.stage = stage;
					newData.contactperson = contactperson;
					newData.cost = cost;
					newData.bonus = bonus;
					newData.comment = comment;
					newData.typepaec = typePeac;
					newData.erector = erector;
					newData.erector_id = erector;
					newData.bidsId = bidsId;
					newData.idCompany = idCompany;
					newData.authorId = authorId;
					newData.author = author;
					newData.date = date ? date.format('DD.MM.YYYY HH:mm:ss') : null;
					newData.id8an_projecttype = projType;
					data.date_end = dateEnd;

					newData.deleted = deleted;

					if (newData.command === undefined || newData.command !== 'create') {
						if (deleted) {
							newData.command = 'delete';
						} else {
							newData.command = 'update';
						}
					}
					props.on_collect(newData);
				}
			}
		}, 500);

		return () => clearTimeout(timer);
	}, [
		orgId,
		projType,
		name,
		equipment,
		customer,
		address,
		stage,
		contactperson,
		date,
		cost,
		bonus,
		comment,
		typePeac,
		dateEnd,
		erector,
		bidsId,
		idCompany,
		authorId,
		author,
		deleted,
	]);



	return (
		<div
			className={`sa-org-collapse-item
       ${collapsed ? 'sa-collapsed-item' : 'sa-opened-item'}
       ${deleted ? 'deleted' : ''} 
       ${editMode ? 'sa-org-item-yesedit' : 'sa-org-item-notedit'} 
       ${
					userdata?.user?.id !== authorId || userdata?.user?.id !== data?.curator?.id
						? 'sa-noedit-item'
						: ''
				}`}
		>
			<div
				className={'sa-org-collpase-header sa-flex-space'}
				onClick={(ev) => {
					ev.preventDefault();
					ev.stopPropagation();
					setCollapsed(!collapsed);
				}}
			>
				<div className={'sa-flex'}>
					<div className={'sa-pa-6'}>
						{collapsed ? (
							<span
								className={'sa-pa-3 sa-org-trigger-button'}
								onClick={() => {
									setCollapsed(!collapsed);
								}}
							>
								<ChevronDownIcon height={TORG_CHEVRON_SIZE} />
							</span>
						) : (
							<span
								className={'sa-pa-3 sa-org-trigger-button'}
								onClick={() => {
									setCollapsed(!collapsed);
								}}
							>
								<ChevronUpIcon height={TORG_CHEVRON_SIZE} />
							</span>
						)}
					</div>
					<div className={'sa-pa-6 sa-org-section-text'}>
						<div className="sa-org-section-label">{name ? name : 'Без темы '}</div>
						<span className="sa-date-text">
							{date !== null
								? ` - ` +
								  (date ? getMonthName(dayjs(date).month() + 1) : '') +
								  ' ' +
								  date?.format('YYYY')
								: ''}
						</span>{' '}
						<span className="sa-author-text">
							{authorShortName !== null ? ` - ` + authorShortName + ' ' : ''}
							{(userdata?.user?.id !== data?.curator?.id) && (
								<Tooltip
									placement={'right'}
									title={
										<div>
											<div>Этот проект может редактировать только создатель записи</div>
										</div>
									}
									className={'sa-lock-mark'}
								>
									<LockFilled height={'22px'} />
								</Tooltip>
							)}
						</span>{' '}
						{itemId && <div className={'sa-org-row-header-id sa-text-phantom'}>({itemId})</div>}
					</div>
				</div>
				<div className={'sa-flex'}>
					{allowDelete && editMode && (
						<span
							className={'sa-pa-3 sa-org-remove-button'}
							onClick={() => {
								setACTION_FLAG(1);
								handleDeleteItem();
							}}
						>
							<TrashIcon height={TORG_CHEVRON_SIZE} />
						</span>
					)}
					{/* {(userdata?.user?.id !== authorId || userdata?.user?.id !== data?.curator?.id) && (
            <Tooltip placement={'left'} title={<div>
              <div>Редактировать проекты может только создатель записи</div>
              <div>Удалять проекты нельзя</div>
            </div>} className={'sa-org-question-mark'}>
              <QuestionMarkCircleIcon height={'22px'} />
            </Tooltip>
          )} */}
				</div>
			</div>
			<div className={'sa-org-collapse-body'}>
				<div className={'sa-org-collapse-content'}>
					<TorgPageSectionRow
            trans_key={`trans_projaaha_${itemId}`}
						key={`projaaha_${itemId}`}
						edit_mode={editMode}
						inputs={[
							{
								label: 'Автор',
								input: (
									<Input
										key={'texpard_2_' + data?.id}
										value={authorFullName}
										// onChange={e => setNote(e.target.value)}
										readOnly={true}
										variant="borderless"
										disabled={true}
									/>
								),
							},
							{
								label: 'Дата',
								input: (
									<DatePicker
										key={'texpard_3_' + data?.id}
										value={date}
										// onChange={e => setNote(e.target.value)}
										readOnly={true}
										variant="borderless"
										disabled={true}
										format={'DD-MM-YYYY'}
									/>
								),
							},
						]}
						extratext={[]}
					/>

					<TorgPageSectionRow
            trans_key={`trans_projaadha_${itemId}`}
						key={`projaadha_${itemId}`}
						edit_mode={editMode}
						inputs={[
							{
								edit_mode: editMode,
								label: 'Объект',
								input: (
									<Input
										key={'texpard_4_' + data?.id}
										value={name}
										onChange={(e) => {
											setName(e.target.value);
											setACTION_FLAG(1);
										}}
										// placeholder="Controlled autosize"
										readOnly={!editMode}
										variant="borderless"
										maxLength={200}
										required={true}
										onBlur={() => {
											setBLUR_FLAG(dayjs().unix());
										}}
									/>
								),
								required: true,
								value: name,
							},
						]}
						extratext={[]}
					/>

					<TorgPageSectionRow
          trans_key={`trans_projdaaha_${itemId}`}
						key={`projdaaha_${itemId}`}
						edit_mode={editMode}
						inputs={[
							{
								edit_mode: editMode,
								label: 'Адрес',
								input: (
									<Input
										key={'texpard_5_' + data?.id}
										value={address}
										onChange={(e) => {
											setAddress(e.target.value);
											setACTION_FLAG(1);
										}}
										// placeholder="Controlled autosize"
										readOnly={!editMode}
										variant="borderless"
										maxLength={200}
										required={true}
										onBlur={() => {
											setBLUR_FLAG(dayjs().unix());
										}}
									/>
								),
								required: true,
								value: address,
							},
						]}
						extratext={[]}
					/>

					<TorgPageSectionRow
            trans_key={`trans_prsojaaha_${itemId}`}
						key={`prsojaaha_${itemId}`}
						edit_mode={editMode}
						inputs={[
							{
								edit_mode: editMode,
								label: 'Заказчик',
								input: (
									<Input
										key={'texpard_6_' + data?.id}
										value={customer}
										onChange={(e) => {
											setCustomer(e.target.value);
											setACTION_FLAG(1);
										}}
										// placeholder="Controlled autosize"
										readOnly={!editMode}
										variant="borderless"
										maxLength={200}
										required={true}
										onBlur={() => {
											setBLUR_FLAG(dayjs().unix());
										}}
									/>
								),
								required: true,
								value: customer,
							},
							{
								edit_mode: editMode,
								label: 'Этап',
								input: (
									<Input
										key={'texpard_7_' + data?.id}
										value={stage}
										onChange={(e) => {
											setStage(e.target.value);
											setACTION_FLAG(1);
										}}
										// placeholder="Controlled autosize"
										readOnly={!editMode}
										variant="borderless"
										maxLength={200}
										onBlur={() => {
											setBLUR_FLAG(dayjs().unix());
										}}
									/>
								),
								required: true,
								value: stage,
							},
						]}
						extratext={[]}
					/>

					<TorgPageSectionRow
          trans_key={`trans_pssrojaaha_${itemId}`}
						key={`pssrojaaha_${itemId}`}
						edit_mode={editMode}
						inputs={[
							{
								edit_mode: editMode,
								label: 'Оборудование',
								input: (
									<Input
										key={'texpard_8_' + data?.id}
										value={equipment}
										onChange={(e) => {
											setEquipment(e.target.value);
											setACTION_FLAG(1);
										}}
										// placeholder="Controlled autosize"
										readOnly={!editMode}
										variant="borderless"
										maxLength={200}
										onBlur={() => {
											setBLUR_FLAG(dayjs().unix());
										}}
									/>
								),
								required: false,
								value: equipment,
							},
							{
								edit_mode: editMode,
								label: 'Тип СОУЭ',
								input: (
									<Input
										key={'texpard_9_' + data?.id}
										value={typePeac}
										onChange={(e) => {
											setTypePeac(e.target.value);
											setACTION_FLAG(1);
										}}
										// placeholder="Controlled autosize"
										readOnly={!editMode}
										variant="borderless"
										maxLength={200}
										onBlur={() => {
											setBLUR_FLAG(dayjs().unix());
										}}
									/>
								),
								required: true,
								value: typePeac,
							},
						]}
						extratext={[]}
					/>

					<TorgPageSectionRow
          trans_key={`trans_projaasfdha_${itemId}`}
						key={`projaasfdha_${itemId}`}
						edit_mode={editMode}
						inputs={[
							{
								edit_mode: editMode,
								label: 'Контактное лицо',
								input: (
									<AutoComplete
										disabled={!editMode}
										key={'texpard_10_' + data?.id}
										placeholder={'Фамилия Имя Отчество'}
										value={contactperson}
										size="small"
										variant="borderless"
										onChange={(e) => {
											console.log(e);
											setContactperson(e);
											setBLUR_FLAG(dayjs().unix());
											setACTION_FLAG(1);
										}}
										options={transContainer['cpers'] ? transContainer['cpers'] : []}
										onSearch={(text) => {
											let filteredOptions = [];
											let cmod = transContainer;
											if (orgContacts && text !== null && text) {
												filteredOptions = orgContacts?.filter((item) =>
													item.label.toLowerCase().includes(text?.toLowerCase())
												);
												// Список подгоняется в зависимости от того, что введено пользователем
												cmod['cpers'] = filteredOptions?.map((obj) => ({
													key: obj.key,
													value: obj.label,
													label: obj.label,
												}));
												setTransContainer(cmod);
											} else {
												cmod['cpers'] = [];
												setTransContainer(cmod);
											}
										}}
									/>
								),
								required: true,
								value: contactperson,
								disabled: !editMode,
								readOnly: !editMode,
							},
							{
								edit_mode: editMode,
								label: 'Дата завершения',
								input: (
									<DatePicker
										key={'texpard_11_' + data?.id}
										value={dateEnd ? dayjs(dateEnd) : null}
										onChange={(ee) => {
											setDateEnd(ee ? ee.format('YYYY-MM-DD') : null);
											setACTION_FLAG(1);
										}}
										readOnly={!editMode}
										variant="borderless"
										maxLength={200}
										onBlur={() => {
											setBLUR_FLAG(dayjs().unix());
										}}
										disabled={!editMode}
										// format={'DD-MM-YYYY'}
									/>
								),
								required: false,
								value: dateEnd,
							},
						]}
						extratext={[]}
					/>

					<TorgPageSectionRow
          trans_key={`trans_projaahdssaa_${itemId}`}
						key={`projaahdssaa_${itemId}`}
						edit_mode={editMode}
						inputs={[
							{
								edit_mode: editMode,
								label: 'Стоимость',
								input: (
									<Input
										key={'texpard_12_' + data?.id}
										value={cost}
										onChange={(e) => {
											setCost(e.target.value);
											setACTION_FLAG(1);
										}}
										// placeholder="Controlled autosize"

										readOnly={!editMode}
										variant="borderless"
										maxLength={200}
										onBlur={() => {
											setBLUR_FLAG(dayjs().unix());
										}}
									/>
								),
								required: false,
								value: cost,
							},
							{
								edit_mode: editMode,
								label: 'Вознаграждение',
								input: (
									<Input
										key={'texpard_13_' + data?.id}
										value={bonus}
										onChange={(e) => {
											setBonus(e.target.value);
											setACTION_FLAG(1);
										}}
										// placeholder="Controlled autosize"
										readOnly={!editMode}
										variant="borderless"
										maxLength={200}
										onBlur={() => {
											setBLUR_FLAG(dayjs().unix());
										}}
									/>
								),
								required: false,
								value: bonus,
							},
						]}
						extratext={[]}
					/>

					<TorgPageSectionRow
          trans_key={`trans_projaahdsssaa_${itemId}`}
						key={`projaahdsssaa_${itemId}`}
						edit_mode={editMode}
						inputs={[
							{
								edit_mode: editMode,
								label: 'Тип проекта',
								input: (
									<Select
										key={'texpard_14_' + data?.id}
										value={projType}
										size="small"
										onChange={(e) => {
											setProjType(e);
											setACTION_FLAG(1);
											setBLUR_FLAG(dayjs().unix());
										}}
										// placeholder="Controlled autosize"
										options={selects?.projecttype?.map((item) => ({
											key: 'keyadflj' + item.id,
											value: item.id,
											label: item.name,
										}))}
										readOnly={!editMode}
										variant="borderless"
										maxLength={200}
										disabled={!editMode}
									/>
								),
								required: true,
								value: projType,
							},
						]}
						extratext={[]}
					/>

					<TorgPageSectionRow
          trans_key={`trans_projaaha5ewe_${itemId}`}
						key={`projaaha5ewe_${itemId}`}
						edit_mode={editMode}
						inputs={[
							{
								edit_mode: editMode,
								label: 'Монтажная организация',
								input: (
									<Select
										size="small"
										variant="borderless"
										allowClear={true}
										showSearch={true}
										optionFilterProp="children"
										onSearch={(et) => {
											setSearchErector(et);
										}}
										required={false}
										value={erector}
										placeholder={'Название организации'}
										onChange={(ev) => {
											setErector(ev);
											setBLUR_FLAG(dayjs().unix());
											setACTION_FLAG(1);
										}}
										disabled={!editMode}
									>
										{mountOrgList &&
											mountOrgList?.map((opt) => (
												<Select.Option key={'olokm' + opt.value} value={opt.value}>
													{opt.label}
												</Select.Option>
											))}
									</Select>
								),

								required: false,
								value: erector,
							},
						]}
						extratext={[]}
					/>

					<TorgPageSectionRow
          trans_key={`trans_projaahaewe_${itemId}`}
						key={`projaahaewe_${itemId}`}
						edit_mode={editMode}
						inputs={[
							{
								edit_mode: editMode,
								label: 'Связанное КП',
								input: (
									<Select
										size="small"
										variant="borderless"
										mode={'multiple'}
										allowClear={true}
										showSearch={true}
										optionFilterProp="children"
										onSearch={(et) => {
											setSearchBid(et);
										}}
										// options={mountBidList}
										required={false}
										value={bidsId}
										placeholder={'ID кп/счета'}
										onChange={(ev) => {
											setBidsId(ev);
											setBLUR_FLAG(dayjs().unix());
											setACTION_FLAG(1);
										}}
										disabled={!editMode}
									>
										{mountBidList &&
											mountBidList?.map((opt) => (
												<Option key={'olokhom' + opt.value} value={opt.value}>
													{opt.label}
												</Option>
											))}
									</Select>
								),

								required: false,
								value: bidsId,
							},
						]}
						extratext={[]}
					/>

					<TorgPageSectionRow
          trans_key={`trans_projaahaqee_${itemId}`}
						key={`projaahaqee_${itemId}`}
						edit_mode={editMode}
						inputs={[
							{
								edit_mode: editMode,
								label: 'Заметка',
								input: (
									<TextArea
										key={'texpard_45_' + data?.id}
										value={comment}
										onChange={(e) => {
											setComment(e.target.value);
											setACTION_FLAG(1);
										}}
										// placeholder="Controlled autosize"
										autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
										readOnly={!editMode}
										variant="borderless"
										maxLength={5000}
										required={false}
										onBlur={() => {
											setBLUR_FLAG(dayjs().unix());
										}}
									/>
								),
								required: false,
								value: comment,
							},
						]}
						extratext={[]}
					/>
				</div>
			</div>
		</div>
	);
};

export default ProjectTabSectionTorg;
