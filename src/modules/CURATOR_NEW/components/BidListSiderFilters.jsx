import { PlusCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Affix, Button, Input } from 'antd';
import React, { useEffect, useState } from 'react';

const BidListSiderFilters = (props) => {
	const [filterPresetList, setFilterPresetList] = useState(props.filter_presets);

	return (
		<Affix offsetTop={0}>
			<div className="sider-body">
				<div className={'sider-unit'}>
					<div className="sider-unit-title">Контактное лицо</div>
					<div className="sider-unit-control">
						<Input placeholder="имя, телефон, заметка" allowClear />
					</div>
				</div>

				<div className={'sider-unit'}>
					<div className="sider-unit-title">Источник</div>
					<div className="sider-unit-control">
						<Input allowClear />
					</div>
				</div>

				<div className={'sider-unit'}>
					<div className="sider-unit-title">Лицензии и допуски</div>
					<div className="sider-unit-control">
						<Input allowClear />
					</div>
				</div>
				<br />
				<div className={'sider-unit-wrapper'}>
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

				<div className={'sider-unit-wrapper'}>
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

export default BidListSiderFilters;
