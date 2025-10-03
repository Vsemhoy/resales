import React, { useEffect, useState } from 'react';
import { ANTD_PAGINATION_LOCALE } from '../../../config/Localization';
import { Button, Collapse, Pagination, Spin } from 'antd';
import OrgNoteModalRow from '../../ORG_LIST/components/OrgModal/Tabs/TabComponents/RowTemplates/OrgNoteModalRow';
import dayjs from 'dayjs';
import { getMonthName } from '../../../components/helpers/TextHelpers';
import { PlusCircleFilled, PlusOutlined } from '@ant-design/icons';
import OrgNoteEditorSectionBox from '../components/sections/NotesTabSections/Rows/OrgNoteEditorSectionBox';
import { compareObjects } from '../../../components/helpers/CompareHelpers';
import OrgCallEditorSectionBox from '../components/sections/NotesTabSections/Rows/OrgCallEditorSectionBox';
import { BriefcaseIcon, PhoneIcon } from '@heroicons/react/24/solid';
import { TrashIcon } from '@heroicons/react/24/outline';

const CallsTabPage = (props) => {
	const { userdata } = props;

	const [orgId, setOrgId] = useState(null);
	const [show, setShow] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [total, setTotal] = useState(1);
	const [onPage, setOnPage] = useState(30);
	const [loading, setLoading] = useState(false);
	const [editMode, setEditMode] = useState(false);

	const [newLoading, setNewLoading] = useState(false);

	// Структурированные в коллапсы юниты
	const [structureItems, setStructureItems] = useState([]);
	const [originalData, setOriginalData] = useState([]);
	const [baseData, setBaseData] = useState([]);

	// Новые юниты
	const [temporaryUnits, setTemporaryUnits] = useState([]);
	const [newStructureItems, setNewStructureItems] = useState([]);

	const [editedItemsIds, setEditedItemsIds] = useState([]);
	const [openedNewSections, setOpenedNewSections] = useState([]);

	// const [departs, setDeparts] = useState(selects.)

	const [orgusers, setOrgUsers] = useState([]);



	useEffect(() => {
		setShow(props.show);
	}, [props.show]);

	useEffect(() => {
		setCurrentPage(props.current_page);
	}, [props.current_page]);

	useEffect(() => {
		
			setOrgId(props.item_id);
		
	}, [props.item_id]);

	useEffect(() => {
		if (props.current_page && props.current_page !== currentPage)
			setCurrentPage(props.current_page);
	}, [props.current_page]);

	// Максиму: заглушка
	const [departList, setDepartList] = useState(null);
	
	
	useEffect(() => {
		setDepartList(props.departaments);
	}, [props.departaments]);

	useEffect(() => {
		if (props.main_data && props.main_data.contacts) {
			setOrgUsers(props.main_data.contacts);
		} else {
			setOrgUsers([]);
		}
	}, [props.main_data]);


	useEffect(() => {
		if (editMode && props.on_change_data){
			// if (temporaryUnits.length > 0 || editedItemsIds.length > 0){
				props.on_change_data('calls', baseData.concat(temporaryUnits))
			// }
		}
	}, [baseData, temporaryUnits]);

  useEffect(() => {
	setTemporaryUnits([]);
	setNewStructureItems([]);
  }, [orgId]);


	// useEffect(() => {
	// 	if (props.edit_mode === false) {
	// 		if (editedItemsIds.length > 0 || newStructureItems.length > 0) {
	// 			if (window.confirm('У вас есть несохраненные заметки! Отменить изменения?')) {
	// 				setOriginalData([]);
	// 				setLoading(true);
	// 				setEditMode(props.edit_mode);
	// 				setTemporaryUnits([]);
	// 				setEditedItemsIds([]);
	// 				setTimeout(() => {
	// 					setBaseData(joinCallsAndMeetings(props.base_data?.calls, props.base_data?.meetings));
	// 				}, 1000);

	// 				setBaseData([]);
	// 				console.log('---------- 65 ---------', originalData);

	// 				setTimeout(() => {
	// 					setBaseData(joinCallsAndMeetings(props.base_data?.calls, props.base_data?.meetings));
	// 				}, 1000);
	// 			} else {
	// 				// alert('Нажмите кнопку [Редактировать] и заново сохраните данные');
	// 				if (props.on_break_discard) {
	// 					// setBaseData(props.base_data?.calls);
	// 					console.log('BREAK SETTER CALLLS ');
	// 					setOriginalData(
							
	// 						joinCallsAndMeetings(props.base_data?.calls, props.base_data?.meetings)
	// 					);
	// 					props.on_break_discard();
	// 				}
	// 			}
	// 		} else {
	// 			setEditMode(props.edit_mode);
	// 		}
	// 	} else {
	// 		setEditMode(props.edit_mode);
	// 	}
	// }, [props.edit_mode]);

	useEffect(() => {
		if (props.edit_mode === false){
			setTemporaryUnits([]);
		}
		setEditMode(props.edit_mode);
	}, [props.edit_mode]);

	const joinCallsAndMeetings = (calls, meetings) => {
		let result = [];
		if (calls && calls.length > 0) {
			for (let i = 0; i < calls.length; i++) {
				const element = calls[i];
				element._type = 'call';
				result.push(element);
			}
		}
		if (meetings && meetings.length > 0) {
			for (let i = 0; i < meetings.length; i++) {
				const element = meetings[i];
				element._type = 'meeting';
				result.push(element);
			}
		}

		result.sort((a, b) => dayjs(a).isAfter(dayjs(b)));
		return result;
	};

	useEffect(() => {
		if (props.base_data?.calls !== null && props.base_data?.calls?.length > 0) {
			let secids = [];
			// setDataList(baseOrgData.projects);
			let strdata = baseData.map((item) => {
				secids.push('callrow_' + item.id);
				return {
					key: 'callrow_' + item.id,
					label: (
						<div
							className={`sa-flex-space ${
								item.deleted === 1 && editMode ? 'sa-orgrow-deleted' : ''
							}`}
						>
							<div>
								{item._type === 'call' ? (
									<span title="Звонок" style={{ paddingRight: '9px', marginBottom: '-12px' }}>
										<PhoneIcon height={'18px'} />
									</span>
								) : (
									<span title="Встреча" style={{ paddingRight: '9px', marginBottom: '-12px' }}>
										<BriefcaseIcon height={'18px'} />
									</span>
								)}
								{item.theme}
								<span className="sa-date-text">
									{item?.date
										? ' - ' +
										  getMonthName(dayjs(item.date).month() + 1) +
										  ' ' +
										  dayjs(item.date).format('YYYY')
										: ''}
								</span>{' '}
								<span className={'sa-text-phantom'}>({item.id})</span>
							</div>
							{editMode && false && (
								<>
									{item.deleted === 1 ? (
										<Button
											size="small"
											color="danger"
											variant="filled"
											onClick={(ev) => {
												ev.stopPropagation();
												handleDeleteRealUnit(item.id, 0);
											}}
										>
											ВЕРНУТЬ
										</Button>
									) : (
										<Button
											title={"Удалить"}
											size="small"
											color="danger"
											variant="outlined"
											onClick={(ev) => {
												ev.stopPropagation();
												handleDeleteRealUnit(item.id, 1);
											}}
											icon=<TrashIcon height={'20px'} />
										>
											
										</Button>
									)}
								</>
							)}
						</div>
					),
					children: (
						<OrgCallEditorSectionBox
							color={item?._type === 'call' ? '#a6a6a6ff' : '#5a5a5aff'}
							data={item}
							on_delete={handleDeleteRealUnit}
							on_change={handleUpdateRealUnit}
							edit_mode={editMode}
							departaments={departList}
							org_users={orgusers}
							// selects_data={props.selects_data}
						/>
					),
				};
			});

			setStructureItems(strdata);
		} else {
			setStructureItems([]);
		}
		setLoading(false);
	}, [baseData, editMode]);



    /* ------------------------------------------------------- */
	useEffect(() => {
		console.log('ORIGINAL SETTER ------------------------------ ', props.base_data?.calls, props.base_data?.meetings);
		setOriginalData(JSON.parse(JSON.stringify( joinCallsAndMeetings(props.base_data?.calls, props.base_data?.meetings))));
		setBaseData(JSON.parse(JSON.stringify(joinCallsAndMeetings(props.base_data?.calls, props.base_data?.meetings))));
	}, [props.base_data]);



    /* ------------------------------------------------------- */




    /* ------------------------------------------------------- */
	useEffect(() => {
		let secids = [];
		setNewStructureItems(
			temporaryUnits.map((item) => {
				let nkey = 'new_callrow_' + item.id;
				secids.push(nkey);
				return {
					key: nkey,
					label: (
						<div className="sa-flex-space">
							<div>
								{item._type === 'call' ? (
									<span title="Звонок" style={{ paddingRight: '9px', marginBottom: '-12px' }}>
										<PhoneIcon height={'18px'} />
									</span>
								) : (
									<span title="Встреча" style={{ paddingRight: '9px', marginBottom: '-12px' }}>
										<BriefcaseIcon height={'18px'} />
									</span>
								)}
								{item.theme ? item.theme : '...'}
								<span className="sa-date-text">
									{item?.date
										? ' - ' +
										  getMonthName(dayjs(item.date).month() + 1) +
										  ' ' +
										  dayjs(item.date).format('YYYY')
										: ''}
								</span>{' '}
								<span className={'sa-text-phantom'}>({item.id})</span>
							</div>
							<Button
								size="small"
								onClick={(ev) => {
									ev.stopPropagation();
									handleDeleteBlankUnit(item.id);
								}}
							>
								Удалить
							</Button>
						</div>
					),
					children: (
						<OrgCallEditorSectionBox
							color={'#5b37dfff'}
							data={item}
							on_delete={handleDeleteBlankUnit}
							on_change={handleUpdateBlankUnit}
							on_blur={handleUpdateBlankUnit}
							edit_mode={editMode}
							departaments={departList}
							org_users={orgusers}
							// selects_data={props.selects_data}
						/>
					),
				};
			})
		);
		// secids.reverse();
		if (JSON.stringify(openedNewSections) !== JSON.stringify(secids)) {
			setOpenedNewSections(secids);
		}
		setNewLoading(false);
	}, [temporaryUnits, editMode]);





	const get_org_data_action = (org_id, ev, on) => {
		if (props.on_change_page && ev !== currentPage) {
			props.on_change_page(ev);
		}
	};

	const handleAddUnitBlank = (type) => {
		setNewLoading(true);
		setTimeout(() => {
			let spawn = {
				_type: type,
				command: 'create',
				id: 'new_' + dayjs().unix() + dayjs().millisecond() + temporaryUnits.length,
				id_orgs: props.item_id,
				id8staff_list: userdata.user.id,
				id8ref_departaments: 5,
				theme: '',
				date: dayjs().format('YYYY-MM-DD HH:mm:ss'), //"2016-09-04T21:00:00.000000Z",
				post: '',
				phone: '',
				note: '',
				result: '',
				subscriber: '',
				deleted: 0,
				creator: {
					id: userdata.user.id,
					surname: userdata?.user.surname,
					name: userdata?.user.name,
					secondname: userdata?.user.secondname,
				},
				departament: {
					id: 5,
					name: 'Отдел оптовых продаж',
					rang: 50,
					visible: true,
					deleted: false,
					position: null,
					icon: null,
				},
			};

			setTemporaryUnits((prevItems) => [spawn, ...prevItems]);
		}, 760);
	};

    /* ------------------------------------------------------- */
	const handleDeleteBlankUnit = (id) => {
		setTemporaryUnits(temporaryUnits.filter((item) => item.id !== id));
	};

    /* ------------------------------------------------------- */
	const handleDeleteRealUnit = (id, value) => {
		// const updata = {command: 'delete', id: id, deleted: 1};
		if (!editedItemsIds.includes(id)) {
			setEditedItemsIds([...editedItemsIds, id]);
		}

		setBaseData((prevData) => {
			// Удаляем элемент
			const filtered = prevData.filter((item) => item.id !== id);

			// Находим элемент для обновления
			const uitem = prevData.find((item) => item.id === id);
			if (uitem) {
				// Создаем обновленную версию
				const updatedItem = {
					...uitem,
					deleted: value,
					command: value === 1 ? 'delete' : 'update',
				};

				// Находим индекс оригинального элемента
				const originalIndex = prevData.findIndex((item) => item.id === id);

				// Вставляем на ту же позицию
				const newData = [...filtered];
				newData.splice(originalIndex, 0, updatedItem);

				return newData;
			}

			return filtered;
		});
	};

    /* ------------------------------------------------------- */
	const handleUpdateBlankUnit = (id, data) => {
		if (!editMode) {
			return;
		}
		setTemporaryUnits((prevUnits) => {
			const exists = prevUnits.some((item) => item.id === id);

			if (!exists) {
				// Добавляем новый элемент
				return [...prevUnits, data];
			} else {
				// Обновляем существующий
				return prevUnits.map((item) => (item.id === id ? data : item));
			}
		});
	};

  /* ------------------------------------------------------- */
	const handleUpdateRealUnit = (id, data) => {
		// let udata = originalData.filter((item) => item.id !== id);
		// udata.push(data);
		if (!editMode) {
			return;
		}
		

		const excluders = ['command', 'date', 'departament', 'creator', '_type'];
		let is_original = false;

		originalData.forEach((element) => {
			if (element.id === id) {
				is_original = compareObjects(element, data, {
					excludeFields: excluders,
					compareArraysDeep: false,
					ignoreNullUndefined: true,
				});
			}
		});

		if (is_original === false) {
			if (!editedItemsIds?.includes(id)) {
				setEditedItemsIds([...editedItemsIds, id]);
			}
      		data.command = 'update';
		} else {
			if (editedItemsIds?.includes(id)) {
				setEditedItemsIds(editedItemsIds.filter((item) => item !== id));
			}
      		data.command = '';
		}

		setBaseData((prevUnits) => {
			const exists = prevUnits.some((item) => item.id === id);
			if (!exists) {
				return [...prevUnits, data];
			} else {
				return prevUnits.map((item) => (item.id === id ? data : item));
			}
		});
	};

	// если в call_to_save не null, а timestamp, отправляем данные на обновление
	// useEffect(() => {
	// 	console.log('basedata', baseData, temporaryUnits);
	// 	if (props.call_to_save !== null && props.on_save !== null) {
	// 		props.on_save(baseData, temporaryUnits);
	// 	}
	// }, [props.call_to_save]);

	return (
		<div className={`${show ? '' : 'sa-orgpage-tab-hidder'}`}>

				<Spin spinning={loading}>
					<div className={'sa-orgtab-container'}>
						<div className={'sa-pa-6 sa-flex-space'} style={{ paddingTop: '9px' }}>
							<div>
								<Pagination
									disabled={editMode}
									size={'small'}
									current={currentPage}
									pageSizeOptions={[10, 30, 50, 100]}
									defaultPageSize={onPage}
									locale={ANTD_PAGINATION_LOCALE}
									showQuickJumper
									total={total}
									onChange={(ev, on) => {
										if (ev !== currentPage) {
											setCurrentPage(ev);
										}
										if (on !== onPage) {
											setOnPage(on);
										}
										get_org_data_action(orgId, ev, on);
									}}
								/>
							</div>
							<div className={'sa-flex-gap'}>
								{editMode && (
									<Button
										type={'primary'}
										icon={<PlusOutlined />}
										onClick={() => {
											handleAddUnitBlank('call');
										}}
										disabled={newStructureItems.length > 7 || newLoading}
									>
										Cоздать звонок
									</Button>
								)}
								{editMode && (
									<Button
										type={'primary'}
										icon={<PlusOutlined />}
										onClick={() => {
											handleAddUnitBlank('meeting');
										}}
										disabled={newStructureItems.length > 7 || newLoading}
									>
										Cоздать встречу
									</Button>
								)}
							</div>
						</div>
						<div>
							{newStructureItems.length > 0 && (
								<div className={'sa-org-temp-stack-collapse'}>
									<div className={'sa-org-temp-stack-collapse-header'}>Новые встречи / звонки</div>
									<Spin spinning={newLoading} delay={500}>
										<Collapse
											size={'small'}
											items={newStructureItems}
											activeKey={openedNewSections}
										/>
									</Spin>
								</div>
							)}

							<Collapse
								// defaultActiveKey={['st_commoninfo', 'st_departinfo', 'st_contactinfo']}
								// activeKey={modalSectionsOpened}
								size={'small'}
								// onChange={handleSectionChange}
								// onMouseDown={handleSectionClick}
								items={structureItems}
							/>
						</div>
					</div>
				</Spin>

		</div>
	);
};

export default CallsTabPage;
