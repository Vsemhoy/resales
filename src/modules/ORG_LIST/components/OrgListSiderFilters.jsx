import { PlusCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Affix, Button, DatePicker, Input, Select } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

const OrgListSiderFilter = (props) => {
	const [filterPresetList, setFilterPresetList] = useState(props.filter_presets);

	const [baseFilterList, setBaseFilterList] = useState(props.base_filters);

	const [filterCompany, setFilterCompany] = useState(null);
	const [filterName, setFilterName] = useState(null);
	const [filterRegion, setFilterRegion] = useState(null);
	// const [filterTown, setFilterTown] = useState(null);

	const [filterAddress, setFilterAddress] = useState(null);
	const [filterProfile, setFilterProfile] = useState(null);
	const [filterContactFace, setFilterContactFace] = useState(null);
	const [filterPriceStatus, setFilterPriceStatus] = useState(null);
	const [filterLists, setFilterLists] = useState(null);
	const [filterStatus, setFilterStatus] = useState(null);
	const [filterProfsound, setFilterProfsound] = useState(null);
	const [filterPhone, setFilterPhone] = useState(null);
	const [filterEmail, setFilterEmail] = useState(null);
	const [filterWebsite, setFilterWebsite] = useState(null);
	const [filterCreator, setFilterCreator] = useState(null);
	// const [filterCreatedAt,    setFilterCreatedAt] = useState([null, null]);
	// const [filterUpdatedAt,    setFilterupdatedAt] = useState([null, null]);

	const [filterCreatedUntil, setFilterCreatedUntil] = useState(null);
	const [filterCreatedBefore, setFilterCreatedBefore] = useState(null);
	const [filterUpdatedUntil, setFilterUpdatedUntil] = useState(null);
	const [filterUpdatedBefore, setFilterUpdatedBefore] = useState(null);

	const [listProfiles, setListProfiles] = useState([]);
	const [listStatuses, setListStatuses] = useState([]);
	const [listLists, setListLists] = useState([]);
	const [listProfSound, setListProfSound] = useState([]);
	const [listPrices, setListPrices] = useState([]);
	const [listRegions, setListRegions] = useState([]);
	const [listClientStatuses, setListClientStatuses] = useState([]);
	const [listCreators, setListCreators] = useState([]);



	const [SKIPPER, setSKIPPER] = useState(2);

	useEffect(() => {
		console.log('filterCompany', filterCompany);
	}, [filterCompany]);

	useEffect(() => {
		// if (SKIPPER !== 0){
		//     console.log('SKIPPER LEFT',SKIPPER);
		//     setSKIPPER(SKIPPER - 1);
		//     return;
		// }

		if (!props.open) {
			console.log('SKIPPER LEFT', SKIPPER);
			return;
		}
		if (props.on_change_proc) {
			props.on_change_proc(dayjs().unix());
		}
		// Создаём отложенную отправку через setTimeout
		const timer = setTimeout(() => {
			let filterBox = props.filterBox ?? {};

			filterBox.companies = toNullable(filterCompany);
			filterBox.address = toNullable(filterAddress);
			filterBox.contact_user = toNullable(filterContactFace);
			filterBox.email = toNullable(filterEmail);
			filterBox.phone = toNullable(filterPhone);
			filterBox.regions = toNullable(filterRegion);
			filterBox.price_statuses = toNullable(filterPriceStatus);
			filterBox.client_statuses = toNullable(filterStatus);
			filterBox.site = toNullable(filterWebsite);
			filterBox.profiles = toNullable(filterProfile);
			filterBox.profsound = toNullable(filterProfsound);
			filterBox.creator = toNullable(filterCreator);
			// filterBox.created_date    = [filterCreatedBefore, filterCreatedUntil];
			// filterBox.updated_date    = [filterUpdateddBefore, filterUpdatedUntil];
			filterBox.created_until = toNullable(filterCreatedUntil);
			filterBox.created_before = toNullable(filterCreatedBefore);
			filterBox.updated_until = toNullable(filterUpdatedUntil);
			filterBox.updated_before = toNullable(filterUpdatedBefore);
			filterBox.rate_lists = toNullable(filterLists);

			if (props.on_change_filters) {
				props.on_change_filters(filterBox);
			}
		}, 500);
		// Очищаем таймер, если эффект пересоздаётся (чтобы не было утечек)
		return () => clearTimeout(timer);
	}, [
		filterCompany,
		filterAddress,
		filterProfile,
		filterContactFace,
		filterPriceStatus,
		filterLists,
		filterStatus,
		filterProfsound,
		filterPhone,
		filterEmail,
		filterWebsite,
		// filterCreatedAt,
		// filterUpdatedAt,
		filterCreatedUntil,
		filterCreatedBefore,
		filterUpdatedUntil,
		filterUpdatedBefore,
		filterRegion,
		filterCreator,
	]);

	useEffect(() => {
		console.log('props.filters_data', props.filters_data);
		if (props.filters_data) {
			if (props.filters_data.companies) {
				setFilterCompany(parseInt(props.filters_data.companies));
			} else {
				setFilterCompany(null);
			}
			if (props.filters_data.regions) {
				setFilterRegion(props.filters_data.regions ? parseInt(props.filters_data.regions) : null);
			} else {
				setFilterRegion(null);
			}
			if (props.filters_data.profsound) {
				setFilterProfsound(parseInt(props.filters_data.profsound));
			} else {
				setFilterProfsound(null);
			}
			if (props.filters_data.rate_lists) {
				setFilterLists(parseInt(props.filters_data.rate_lists));
			} else {
				setFilterLists(null);
			}
			if (props.filters_data.client_statuses) {
				setFilterStatus(parseInt(props.filters_data.client_statuses));
			} else {
				setFilterStatus(null);
			}
			if (props.filters_data.profiles) {
				setFilterProfile(parseInt(props.filters_data.profiles));
			} else {
				setFilterProfile(null);
			}
			if (props.filters_data.price_statuses) {
				setFilterPriceStatus(parseInt(props.filters_data.price_statuses));
			} else {
				setFilterPriceStatus(null);
			}

			if (props.filters_data.address) {
				setFilterAddress(props.filters_data.address);
			} else {
				setFilterAddress(null);
			}
			if (props.filters_data.contact_user) {
				setFilterContactFace(props.filters_data.contact_user);
			} else {
				setFilterContactFace(null);
			}

			if (props.filters_data.email) {
				setFilterEmail(props.filters_data.email);
			} else {
				setFilterEmail(null);
			}
			if (props.filters_data.phone) {
				setFilterPhone(props.filters_data.phone);
			} else {
				setFilterPhone(null);
			}
			if (props.filters_data.name) {
				setFilterName(props.filters_data.name);
			} else {
				setFilterName(null);
			}
			if (props.filters_data.creator) {
				setFilterCreator(props.filters_data.creator ? parseInt(props.filters_data.creator) : null);
			} else {
				setFilterCreator(null);
			}
			if (props.filters_data.site) {
				setFilterWebsite(props.filters_data.site);
			} else {
				setFilterWebsite(null);
			}

			if (props.filters_data.created_until) {
				setFilterCreatedUntil(props.filters_data.created_until);
			} else {
				setFilterCreatedUntil(null);
			}

			if (props.filters_data.created_before) {
				setFilterCreatedBefore(props.filters_data.created_before);
			} else {
				setFilterCreatedBefore(null);
			}

			if (props.filters_data.updated_until) {
				setFilterUpdatedUntil(props.filters_data.updated_until);
			} else {
				setFilterUpdatedUntil(null);
			}

			if (props.filters_data.updated_before) {
				setFilterUpdatedBefore(props.filters_data.updated_before);
			} else {
				setFilterUpdatedBefore(null);
			}
			// if (props.filters_data.created_date && props.filters_data.created_date[0] !== null){
			//     setFilterCreatedAt([ dayjs.unix(props.filters_data.created_date[0]), dayjs.unix(props.filters_data.created_date[1])]);
			// } else {
			//     setFilterCreatedAt([null, null]);
			// }
			// if (props.filters_data.updated_date && props.filters_data.updated_date !== null){
			//     setFilterupdatedAt([ dayjs.unix(props.filters_data.updated_date[0]), dayjs.unix(props.filters_data.updated_date[1])]);
			// } else {
			//     setFilterupdatedAt([null, null]);
			// }
		}
	}, [props.filters_data]);

	useEffect(() => {
		console.log('rops.base_filters', props.base_filters);
		if (
			props.base_filters === null ||
			props.base_filters === undefined ||
			props.base_filters.price_statuses === null
		) {
			return;
		}
		setListPrices(
			props.base_filters.price_statuses.map((item) => ({
				key: `clistat_${item.id}`,
				value: item.value,
				label: item.name,
			}))
		);

		setListRegions(
			props.base_filters.regions.map((item) => ({
				key: `clistat2_${item.id}`,
				value: item.value,
				label: item.name,
			}))
		);

		setListPrices(
			props.base_filters.price_statuses.map((item) => ({
				key: `clistat3_${item.id}`,
				value: item.value,
				label: item.name,
			}))
		);

		setListProfiles(
			props.base_filters.profiles.map((item) => ({
				key: `clistat4_${item.id}`,
				value: item.value,
				label: item.name,
			}))
		);

		setListProfSound(
			props.base_filters.profsound.map((item) => ({
				key: `clistat5_${item.key}`,
				value: item.value,
				label: item.label,
			}))
		);

		setListClientStatuses(
			props.base_filters.client_statuses.map((item) => ({
				key: `clistat6_${item.id}`,
				value: item.value,
				label: item.name,
			}))
		);

		setListLists(
			props.base_filters.rate_lists.map((item) => ({
				key: `clistat6_${item.id}`,
				value: item.value,
				label: item.name,
			}))
		);

		if (
			props.base_filters?.curators !== null &&
			props.base_filters?.curators !== '' &&
			props.base_filters?.curators !== 'null' &&
			props.base_filters?.curators !== NaN &&
			props.base_filters?.curators !== undefined
		) {
			setListCreators(props.base_filters.curators);
		} else {
			setListCreators(null);
		}

	}, [props.base_filters]);

	// Утилита: если строка пустая — возвращаем null
	const toNullable = (value) => {
		return value === '' || value === null || value === undefined ? null : value;
	};

	return (
		<Affix offsetTop={100}>
			<div className="sider-body sider-body-filters sa-sai-orgs">
				<div className={'sider-unit'}>
					<div className="sider-unit-title">Компания</div>
					<div className="sider-unit-control">
						<Select
							style={{ width: '100%' }}
							options={props.companies}
							allowClear
							value={filterCompany}
							onChange={setFilterCompany}
						/>
					</div>
				</div>

				<div className={'sider-unit'}>
					<div className="sider-unit-title">Контактное лицо</div>
					<div className="sider-unit-control">
						<Input
							placeholder="имя, телефон, заметка"
							allowClear
							value={filterContactFace}
							onChange={(ev) => {
								setFilterContactFace(ev.target.value);
							}}
						/>
					</div>
				</div>

				<div className={'sider-unit'}>
					<div className="sider-unit-title">Регион</div>
					<div className="sider-unit-control">
						{/* <Select  style={{ width: '100%' }}
                    options={listRegions} 
                    allowClear
                    value={filterRegion}
                    onChange={setFilterRegion}
                 /> */}
						<Select
						style={{ width: '100%' }}
							placeholder="Северо-западный..."
							allowClear
							value={filterRegion}
							onChange={(ev) => {
								setFilterRegion(ev);
							}}
							options={listRegions}
						/>
					</div>
				</div>

				<div className={'sider-unit'}>
					<div className="sider-unit-title">Адрес</div>
					<div className="sider-unit-control">
						<Input
							placeholder="Набережная 42"
							allowClear
							value={filterAddress}
							onChange={(ev) => {
								setFilterAddress(ev.target.value);
							}}
						/>
					</div>
				</div>

				<div className={'sider-unit'}>
					<div className="sider-unit-title">Профиль</div>
					<div className="sider-unit-control">
						<Select
							style={{ width: '100%' }}
							options={listProfiles}
							allowClear
							value={filterProfile}
							onChange={setFilterProfile}
						/>
					</div>
				</div>

				<div className={'sider-unit'}>
					<div className="sider-unit-title">Статус цен</div>
					<div className="sider-unit-control">
						<Select
							style={{ width: '100%' }}
							allowClear
							value={filterPriceStatus}
							onChange={setFilterPriceStatus}
							options={listPrices}
						/>
					</div>
				</div>

				<div className={'sider-unit'}>
					<div className="sider-unit-title">Списки</div>
					<div className="sider-unit-control">
						<Select
							style={{ width: '100%' }}
							options={listLists}
							allowClear
							value={filterLists}
							onChange={setFilterLists}
						/>
					</div>
				</div>

				<div className={'sider-unit'}>
					<div className="sider-unit-title">Статус</div>
					<div className="sider-unit-control">
						<Select
							style={{ width: '100%' }}
							options={listClientStatuses}
							allowClear
							value={filterStatus}
							onChange={setFilterStatus}
						/>
					</div>
				</div>

				<div className={'sider-unit'}>
					<div className="sider-unit-title">Профзвук</div>
					<div className="sider-unit-control">
						<Select
							style={{ width: '100%' }}
							options={listProfSound}
							allowClear
							value={filterProfsound}
							onChange={setFilterProfsound}
						/>
					</div>
				</div>

				<div className={'sider-unit'}>
					<div className="sider-unit-title">Телефон</div>
					<div className="sider-unit-control">
						<Input
							placeholder="812"
							allowClear
							value={filterPhone}
							onChange={(ev) => {
								setFilterPhone(ev.target.value);
							}}
						/>
					</div>
				</div>

				<div className={'sider-unit'}>
					<div className="sider-unit-title">Электронная почта</div>
					<div className="sider-unit-control">
						<Input
							placeholder="email@list.com"
							allowClear
							value={filterEmail}
							onChange={(ev) => {
								setFilterEmail(ev.target.value);
							}}
						/>
					</div>
				</div>

				<div className={'sider-unit'}>
					<div className="sider-unit-title">Вебсайт</div>
					<div className="sider-unit-control">
						<Input
							placeholder="website.ru"
							allowClear
							value={filterWebsite}
							onChange={(ev) => {
								setFilterWebsite(ev.target.value);
							}}
						/>
					</div>
				</div>

				<div className={'sider-unit'}>
					<div className="sider-unit-title">Создатель</div>
					<div className="sider-unit-control">
						<Select
						style={{ width: '100%' }}
							placeholder="кто создал карточку клиента"
							allowClear
							value={filterCreator}
							onChange={(ev) => {
								setFilterCreator(ev);
							}}
							options={listCreators}
						/>
					</div>
				</div>

				<div className={'sider-unit'}>
					<div className="sider-unit-title">Дата создания</div>
					<div className="sider-unit-control">
						<DatePicker.RangePicker
							value={[
								filterCreatedBefore ? dayjs.unix(filterCreatedBefore) : null,
								filterCreatedUntil ? dayjs.unix(filterCreatedUntil) : null,
							]}
							allowClear
							// onChange={setFilterCreatedAt}
							onChange={(date) => {
								console.log(date);
								if (date) {
									setFilterCreatedBefore(date[0] !== null ? date[0].unix() : null);
									setFilterCreatedUntil(date[1] !== null ? date[1].unix() : null);
								} else {
									setFilterCreatedBefore(null);
									setFilterCreatedUntil(null);
								}
							}}
							allowEmpty={[true, true]}
						/>
					</div>
				</div>

				<div className={'sider-unit'}>
					<div className="sider-unit-title">Дата последнего обновления</div>
					<div className="sider-unit-control">
						<DatePicker.RangePicker
							value={[
								filterUpdatedBefore ? dayjs.unix(filterUpdatedBefore) : null,
								filterUpdatedUntil ? dayjs.unix(filterUpdatedUntil) : null,
							]}
							allowClear
							// onChange={setFilterupdatedAt}
							onChange={(date) => {
								if (date) {
									setFilterUpdatedBefore(date[0] !== null ? date[0].unix() : null);
									setFilterUpdatedUntil(date[1] !== null ? date[1].unix() : null);
								} else {
									setFilterUpdatedBefore(null);
									setFilterUpdatedUntil(null);
								}
							}}
							allowEmpty={[true, true]}
						/>
					</div>
				</div>

				{/* <div className={'sider-unit'}>
        <div className='sider-unit-title'>Дата создания</div>
            <div className='sider-unit-control'>
                <DatePicker
                style={{ width: '100%' }}
                value={filterCreatedUntil ? dayjs.unix(filterCreatedUntil) : null}
                allowClear
                onChange={(date) => setFilterCreatedUntil(date ? date.unix() : null)}
                placeholder='Создано до'
                format={'DD.MM.YYYY'}
                />
            </div>
            <div className='sider-unit-control'>
                <DatePicker 
                style={{ width: '100%' }}
                value={filterCreatedBefore ? dayjs.unix(filterCreatedBefore) : null}
                allowClear
                onChange={(date) => setFilterCreatedBefore(date ? date.unix() : null)}
                placeholder='Создано после'
                format={'DD.MM.YYYY'}
                />
            </div>
        </div>

        <div className={'sider-unit'}>
            <div className='sider-unit-title'>Дата последнего обновления</div>
                <div className='sider-unit-control'>
                    <DatePicker 
                    style={{ width: '100%' }}
                    value={filterUpdatedUntil ? dayjs.unix(filterUpdatedUntil) : null}
                    allowClear
                    onChange={(date) => setFilterUpdatedUntil(date ? date.unix() : null)}
                    placeholder='Обновлено до'
                    format={'DD.MM.YYYY'}
                    />
                </div>
                <div className='sider-unit-control'>
                    <DatePicker 
                    style={{ width: '100%' }}
                    value={filterUpdatedBefore ? dayjs.unix(filterUpdatedBefore) : null}
                    allowClear
                    onChange={(date) => setFilterUpdatedBefore(date ? date.unix() : null)}
                    placeholder='Обновлено после'
                    format={'DD.MM.YYYY'}
                    />
                </div>
        </div> */}

				<br />
				<div className={'sider-unit-wrapper'} style={{ display: 'none' }}>
					<div className="sider-unit-wrapper-title">
						<span>Кураторство</span>
					</div>
					<div className={'sider-unit'}>
						<div className="sider-unit-title">Дата снятия кураторства</div>
						<div className="sider-unit-control">
							<Input allowClear />
						</div>
					</div>

					<div className={'sider-unit'}>
						<div className="sider-unit-title">Name of the...</div>
						<div className="sider-unit-control">
							<Input allowClear />
						</div>
					</div>

					<div className={'sider-unit'}>
						<div className="sider-unit-title">Name of the...</div>
						<div className="sider-unit-control">
							<Input allowClear />
						</div>
					</div>
				</div>

				<div className={'sider-unit-wrapper'} style={{ display: 'none' }}>
					<div className="sider-unit-wrapper-title">
						<span>Мои фильтры</span>
					</div>
					<div className={'sider-unit'}>
						<div className="sider-unit-title">Сохранить фильтр</div>
						<div className="sider-unit-control">
							<div className="sa-flex-space">
								<Input allowClear placeholder="Мой регион" />
								<Button icon={<PlusCircleIcon height={'18px'} />}></Button>
							</div>
						</div>
					</div>
					<div>
						{filterPresetList.map((item) => (
							<div className={'filter-preset-item sa-flex-space'}>
								<div className="filter-preset-item-label">{item.label}</div>
								<span className="filter-preset-item-remover">
									<TrashIcon height={'18px'} />
								</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</Affix>
	);
};

export default OrgListSiderFilter;
