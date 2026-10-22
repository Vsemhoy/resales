import React from 'react';
import { BidModelsMetricsHeader } from './BidModelsMetrics';

export const BidModelsHeaderSecondary = ({ showMetrics }) => (
    <div className={`sa-models-table-row-two sa-header-row${showMetrics ? ' sa-models-with-metrics' : ''}`}>
        <div className={'sa-models-table-cell sa-models-table-cell-header'}>
            <p>№</p>
        </div>
        <div className={'sa-models-table-cell sa-models-table-cell-header'}>
            <p className={'align-left'}>Название</p>
        </div>
        <div className={'sa-models-table-cell sa-models-table-cell-header'}>
            <p className={'align-left'}>Кол-во</p>
        </div>
        <div className={'sa-models-table-cell sa-models-table-cell-header'}>
            <p className={'align-left'}>Процент</p>
        </div>
        <div className={'sa-models-table-cell sa-models-table-cell-header'}>
            <p>Цена</p>
        </div>
        <div className={'sa-models-table-cell sa-models-table-cell-header'}>
            <p>Сумма</p>
        </div>
        <div className={'sa-models-table-cell sa-models-table-cell-header'}>
            <p>Наличие</p>
        </div>
        {showMetrics && <BidModelsMetricsHeader />}
        <div className={'sa-models-table-cell sa-models-table-cell-header'}>
            <p>Склад</p>
        </div>
        <div
            className={'sa-models-table-cell sa-models-table-cell-header'}
            style={{ boxShadow: 'none' }}
        ></div>
    </div>
);

