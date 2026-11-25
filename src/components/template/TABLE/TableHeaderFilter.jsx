import React from 'react';
import { CaretDownFilled, CaretUpFilled } from '@ant-design/icons';

export default function TableHeaderFilter({ label, children, sortKey, sortOrders, onSort }) {
	const order = Number(sortOrders?.find(item => item.key === sortKey)?.order) || 0;

	return (
		<div className="sa-table-header-filter">
			<div className="sa-table-header-filter-field">
				<span className="sa-table-header-filter-label" aria-hidden={children ? true : undefined}>{label}</span>
				{children && React.cloneElement(children, {
					size: 'small',
					placeholder: ' ',
					'aria-label': children.props['aria-label'] ?? label,
				})}
			</div>
			{onSort && (
				<button
					type="button"
					className={`sa-table-header-filter-sort${order ? ' is-active' : ''}`}
					aria-label={`Сортировать колонку «${label}»`}
					title={order === 2 ? 'Сортировка по возрастанию' : order === 1 ? 'Сортировка по убыванию' : 'Сортировать'}
					onClick={() => onSort(sortKey, (order + 1) % 3)}
				>
					<CaretUpFilled className={order === 2 ? 'is-selected' : ''} aria-hidden="true" />
					<CaretDownFilled className={order === 1 ? 'is-selected' : ''} aria-hidden="true" />
				</button>
			)}
		</div>
	);
}
