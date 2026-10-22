import React from 'react';
import { Tooltip } from 'antd';

const metrics = [
    { field: 'unit', title: 'Юниты', unit: 'U' },
    { field: 'mass', title: 'Вес', unit: 'кг' },
    { field: 'size', title: 'Объем', unit: 'м³' },
];

const formatNumber = (value) => value.toLocaleString('ru-RU', { maximumFractionDigits: 6 });
const parseNumber = (value) => {
    if (value === null || value === undefined || String(value).trim() === '') return null;
    const number = Number(String(value).replace(',', '.'));
    return Number.isFinite(number) ? number : null;
};

export const BidModelsMetricsHeader = () => metrics.map(({ field, title, unit }) => (
    <div key={field} className="sa-models-table-cell sa-models-table-cell-header">
        <p>{title}, {unit}</p>
    </div>
));

export const BidModelsMetrics = ({ info, count }) => metrics.map(({ field, title, unit }) => {
    const value = parseNumber(info?.[field]);
    const quantity = parseNumber(count);
    const total = value !== null && quantity !== null ? value * quantity : null;
    return (
        <div key={field} className="sa-models-table-cell">
            <Tooltip title={value === null ? `${title}: нет данных для одной модели` : `На одну модель: ${formatNumber(value)} ${unit}`}>
                <span className="sa-models-metric-value">
                    {total !== null && Number.isFinite(total) ? formatNumber(total) : '—'}
                </span>
            </Tooltip>
        </div>
    );
});
