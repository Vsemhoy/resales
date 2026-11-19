import { Input, Select, Skeleton } from 'antd';
import React, { useEffect, useState } from 'react';
import OrgListRow from './OrgListRow';
import dayjs from 'dayjs';
import {CaretDownFilled, CaretUpFilled, IdcardOutlined, ProjectOutlined} from "@ant-design/icons";
import {BriefcaseIcon, InboxStackIcon, PhoneArrowUpRightIcon} from "@heroicons/react/24/solid";

const OrgTableSortButton = ({ sortKey, sortOrders, onSort }) => {
	const order = Number((Array.isArray(sortOrders) ? sortOrders : []).find((item) => item.key === sortKey)?.order) || 0;
	const nextOrder = order === 0 ? 1 : order === 1 ? 2 : 0;

	return (
		<button
			type="button"
			className={`sa-org-table-sort-button ${order ? 'is-active' : ''}`}
			aria-label={`Сортировать колонку ${sortKey}`}
			title={order === 2 ? 'Сортировка по возрастанию' : order === 1 ? 'Сортировка по убыванию' : 'Сортировать'}
			onClick={() => onSort(sortKey, nextOrder)}
		>
			<span className="sa-org-table-sort-arrows" aria-hidden="true">
				<CaretUpFilled className={order === 2 ? 'is-selected' : ''} />
				<CaretDownFilled className={order === 1 ? 'is-selected' : ''} />
			</span>
		</button>
	);
};

const OrgListTable = (props) => {
	const [userdata, setUserdata] = useState(null);
	const [sortOrders, setSortOrders] = useState([]);

	const [curatorList, setCuratorList] = useState(props.curator_list);

	const [isPreviewOpen, setIsPreviewOpen] = useState(false);
	const [previewItem, setPreviewItem] = useState(null);

	const [filterInn, setFilterInn] = useState(null);
	const [filterName, setFilterName] = useState(null);

	const [filterTown, setFilterTown] = useState(null);
	const [filterComment, setFilterComment] = useState(null);
	const [filterId, setFilterId] = useState(null);
	const [filterProfile, setFilterProfile] = useState(null);
	// const [filterClaims, setFilterClaims] = useState(null);
	// const [filterMeetings, setFilterMeetings] = useState(null);
	// const [filterCalls, setFilterCalls] = useState(null);
	const [filterCurator, setFilterCurator] = useState(null);

	/** Выделенная строка */
	const [selectedItem, setSelectedItem] = useState(null);

	

	const [socketBusyOrglist, setsocketBusyOrglist] = useState([]);

	useEffect(() => {
		setsocketBusyOrglist(props.busy_orgs);
	}, [props.busy_orgs]);

	useEffect(() => {
		setSelectedItem(props.selected_item);
	}, [props.selected_item]);

	// Утилита: если строка пустая — возвращаем null
	const toNullable = (value) => {
		return value === '' || value === null || value === undefined ? null : value;
	};

	useEffect(() => {
		setCuratorList(props.curator_list);
	}, [props.curator_list]);

	useEffect(() => {
		if (props.on_change_proc) {
			props.on_change_proc(dayjs().unix());
		}
		// Создаём отложенную отправку через setTimeout
		const timer = setTimeout(() => {
			const filterBox = {};

			console.log('MOUNT TOP FILTERS', props.base_filters);

			filterBox.towns = toNullable(filterTown);
			filterBox.id = toNullable(filterId);
			filterBox.name = toNullable(filterName);
			filterBox.inn = toNullable(filterInn);
			filterBox.comment = toNullable(filterComment);

			console.log(filterBox);
			if (props.on_change_filters) {
				props.on_change_filters(filterBox);
				console.log('CALLBACK');
			}
		}, 400);

		// Очищаем таймер, если эффект пересоздаётся (чтобы не было утечек)
		return () => clearTimeout(timer);
	}, [filterTown, filterId, filterName, filterInn, filterComment]);

	useEffect(() => {
		setUserdata(props.userdata);
	}, [props.userdata]);

	useEffect(() => {
		// if (props.curator_list){

		//   setCuratorList(props.curator_list);
		// }
		console.log(props.base_filters);
		if (props.base_filters?.towns !== null) {
			setFilterTown(props.base_filters.towns);
		} else {
			setFilterTown(null);
		}
		if (props.base_filters?.id !== null) {
			setFilterId(props.base_filters.id);
		} else {
			setFilterId(null);
		}
		if (props.base_filters?.name !== null) {
			setFilterName(props.base_filters.name);
		} else {
			setFilterName(null);
		}
		if (props.base_filters?.inn !== null) {
			setFilterInn(props.base_filters.inn);
		} else {
			setFilterInn(null);
		}
		if (props.base_filters?.comment !== null) {
			setFilterComment(props.base_filters.comment);
		}
		if (
			props.base_filters?.profiles !== null &&
			props.base_filters?.profiles !== undefined &&
			props.base_filters?.profiles !== '' &&
			props.base_filters?.profiles !== 'null' &&
			!Number.isNaN(Number(props.base_filters?.profiles))
		) {
			setFilterProfile(Number(props.base_filters.profiles));
		} else {
			setFilterProfile(null);
		}
		if (
			props.base_filters?.curator !== null &&
			props.base_filters?.curator !== '' &&
			props.base_filters?.curator !== 'null' &&
			!Number.isNaN(Number(props.base_filters?.curator)) &&
			props.base_filters?.curator !== undefined
		) {
			setFilterCurator(parseInt(props.base_filters.curator));
		} else {
			setFilterCurator(null);
		}
	}, [props.base_filters, props.curator_list, props.profiles]);

	const handlePreviewOpen = (item, state) => {
		console.log('HEllo');
		// setPreviewItem(item);
		// setIsPreviewOpen(true);
		console.log(item, state);
		if (props.on_preview_open) {
			props.on_preview_open(item, state);
		}
	};

	useEffect(() => {
		setSortOrders(Array.isArray(props.base_orders) ? props.base_orders : []);
	}, [props.base_orders]);

	/**
	 * Обработчик сортировки колонок таблицы.
	 * @param {name} key
	 * @param {int} order
	 */
	const handleActivateSorter = (key, order) => {
		let newSorts = [];
		const currentSorts = Array.isArray(sortOrders) ? sortOrders : [];
		for (let i = 0; i < currentSorts.length; i++) {
			const element = currentSorts[i];
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
		if (props.on_set_sort_orders) {
			props.on_set_sort_orders(newSorts);
		}
	};

	/** Перемещение по списку компаний вверх-вних стрелками + CTRL */
	useEffect(() => {
		const handleKeyDown = (ev) => {
			if (!ev.ctrlKey) return; // игнорировать если Ctrl не нажат

			if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
				ev.preventDefault();

				const orgs = props.base_orgs;
				if (!orgs || orgs.length === 0) return;

				const currentIndex = orgs.findIndex((item) => item.id === selectedItem);
				if (currentIndex === -1) return;

				let newIndex = currentIndex;

				if (ev.key === 'ArrowDown' && currentIndex < orgs.length - 1) {
					newIndex = currentIndex + 1;
				} else if (ev.key === 'ArrowUp' && currentIndex > 0) {
					newIndex = currentIndex - 1;
				}

				if (newIndex !== currentIndex) {
					setSelectedItem(orgs[newIndex].id);
					// Optionally, notify parent component if needed
					if (props.on_select_change) {
						props.on_select_change(orgs[newIndex].id);
					}
				}
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [selectedItem, props.base_orgs, props.on_select_change]);

	return (
		<div className={'sa-table-box'}>
			<div className={'sa-table-box-header'}>
					<div className={'sa-table-box-orgs sa-table-box-row'}>
						<div className={'sa-table-box-cell'}>
							<div className="sa-org-table-column-header">
								<Input
									aria-label="Фильтр по id"
									className="sa-org-table-column-filter"
									placeholder="id"
									value={filterId ?? ''}
									onChange={(ev) => setFilterId(ev.target.value)}
									allowClear
								/>
								<OrgTableSortButton sortKey="id" sortOrders={sortOrders} onSort={handleActivateSorter} />
							</div>
						</div>
						<div className={'sa-table-box-cell'}>
							<div className="sa-org-table-column-header">
								<Input
									aria-label="Фильтр по названию организации"
									className="sa-org-table-column-filter"
									placeholder="Название организации"
									value={filterName ?? ''}
									onChange={(ev) => setFilterName(ev.target.value)}
									allowClear
								/>
								<OrgTableSortButton sortKey="name" sortOrders={sortOrders} onSort={handleActivateSorter} />
							</div>
						</div>
						<div className={'sa-table-box-cell'}>
							<div className="sa-org-table-column-header">
								<Input
									aria-label="Фильтр по городу"
									className="sa-org-table-column-filter"
									placeholder="Город"
									value={filterTown ?? ''}
									onChange={(ev) => setFilterTown(ev.target.value)}
									allowClear
								/>
								<OrgTableSortButton sortKey="town" sortOrders={sortOrders} onSort={handleActivateSorter} />
							</div>
						</div>
						<div className={'sa-table-box-cell'}>
							<div className="sa-org-table-column-header">
								<Select
									aria-label="Фильтр по профилю"
									className="sa-org-table-column-filter sa-org-table-column-filter--select"
								placeholder={<IdcardOutlined aria-label="Профиль" title="Профиль" />}
									size="small"
									options={(props.profiles || []).map((profile) => ({
										value: Number(profile.id),
										label: profile.ext || String(profile.id),
									}))}
									allowClear
									onChange={(value) => {
										setFilterProfile(value ?? null);
										props.on_change_filters?.({ profiles: value ?? null });
									}}
									value={filterProfile}
								/>
							</div>
						</div>
						<div className={'sa-table-box-cell'}>
							<div className="sa-org-table-column-header">
								<Input
									aria-label="Фильтр по памятке"
									className="sa-org-table-column-filter"
									placeholder="Памятка"
									value={filterComment ?? ''}
									onChange={(ev) => setFilterComment(ev.target.value)}
									allowClear
								/>
								<OrgTableSortButton sortKey="comment" sortOrders={sortOrders} onSort={handleActivateSorter} />
							</div>
						</div>
						<div className={'sa-table-box-cell'}>
							<div className="sa-org-table-column-header">
								<Input
									aria-label="Фильтр по ИНН"
									className="sa-org-table-column-filter"
									placeholder="ИНН"
									value={filterInn ?? ''}
									onChange={(ev) => setFilterInn(ev.target.value)}
									allowClear
								/>
							</div>
						</div>
						<div className={'sa-table-box-cell'}>
							<div className="sa-org-table-column-header">
								<Select
									aria-label="Фильтр по куратору"
									className="sa-org-table-column-filter sa-org-table-column-filter--select"
									placeholder="Куратор"
									size="small"
									showSearch
									optionFilterProp="label"
									options={curatorList}
									allowClear
									onChange={(value) => {
										setFilterCurator(value ?? null);
										props.on_change_filters?.({ curator: value ?? null });
									}}
									value={filterCurator}
								/>
								<OrgTableSortButton sortKey="curator" sortOrders={sortOrders} onSort={handleActivateSorter} />
							</div>
						</div>
						<div className={'sa-table-box-cell'}>
							<div className="sa-org-table-column-header sa-org-table-column-header--properties">
								<span>Свойства</span>
							</div>
						</div>

						<div className={'sa-table-box-cell'}>
							<div className="sa-org-table-column-header sa-org-table-column-header--icon">
								<div className={'sa-pa-3'}>
									<InboxStackIcon height={'18px'}/>
								</div>
							</div>
						</div>
						<div className={'sa-table-box-cell'}>
							<div className="sa-org-table-column-header sa-org-table-column-header--icon">
								<div className={'sa-pa-3'}>
									<BriefcaseIcon height={'18px'}/>
								</div>
							</div>
						</div>
						<div className={'sa-table-box-cell'}>
							<div className="sa-org-table-column-header sa-org-table-column-header--icon">
								<div className={'sa-pa-3'}>
									<PhoneArrowUpRightIcon height={'18px'}/>
								</div>
							</div>
						</div>
						<div className={'sa-table-box-cell'}>
							<div className="sa-org-table-column-header sa-org-table-column-header--icon">
								<div className={'sa-pa-3'}>
									<ProjectOutlined height={'18px'}/>
								</div>


							</div>
						</div>
					</div>
			</div>

			<div className={'sa-table-box-stack'} aria-busy={props.loading}>
				{props.loading ? Array.from({ length: 20 }, (_, row) => (
					<div className="sa-table-box-orgs sa-table-box-row sa-org-skeleton-row" key={`skeleton-${row}`} aria-hidden="true">
						{Array.from({ length: 12 }, (_, column) => (
							<div className="sa-table-box-cell" key={column}>
								<Skeleton.Input active size="small" block />
							</div>
						))}
					</div>
				)) : props.base_orgs.map((borg, index) => (
					<OrgListRow
						filter_name={filterName}
						data={borg}
						is_active={selectedItem === borg.id}
						on_double_click={handlePreviewOpen}
						key={`borg_${borg.id}`}
						userdata={userdata}
						company_color={props.base_companies?.find((item) => item.id === borg.id_company)?.color}
						company_name={props.base_companies?.find((item) => item.id === borg.id_company)?.name}
						busy={socketBusyOrglist.filter((item)=> item.org_id === borg.id)}
                        profiles={props?.profiles}
					/>
				))}
			</div>
		</div>
	);
};

export default OrgListTable;
