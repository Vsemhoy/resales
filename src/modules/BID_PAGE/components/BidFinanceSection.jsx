import React from 'react';
import { Input, Select } from 'antd';

export const BidFinanceSection = ({
    values,
    options,
    onChange,
    isDisabled,
}) => (
    <div className={'sa-info-list-hide-wrapper'}>
        <div className={'sa-info-list-row'}>
            <div className={'sa-list-row-label'}>
                <p>Валюта</p>
            </div>
            <Select
                style={{ width: '100%', textAlign: 'left' }}
                value={values.currency}
                options={options.currency}
                onChange={(val) => onChange('currency', val)}
                disabled={isDisabled}
            />
        </div>
        <div className={'sa-info-list-row'}>
            <div className={'sa-list-row-label'}>
                <p>Статус</p>
            </div>
            <Select
                style={{ width: '100%', textAlign: 'left' }}
                value={values.priceStatus}
                options={options.price}
                onChange={(val) => onChange('priceStatus', val)}
                disabled={isDisabled}
            />
        </div>
        <div className={'sa-info-list-row'}>
            <div className={'sa-list-row-label'}>
                <p>Добавить процент</p>
            </div>
            <Input
                style={{ width: '100%', height: '32px' }}
                value={values.percent}
                type="number"
                onChange={(e) => onChange('percent', e.target.value)}
                onWheel={(e) => e.target.blur()}
                disabled={isDisabled}
            />
        </div>
        <div className={'sa-info-list-row'}>
            <div className={'sa-list-row-label'}>
                <p>Вычесть НДС?</p>
            </div>
            <Select
                style={{ width: '100%', textAlign: 'left' }}
                value={values.nds}
                options={options.nds}
                onChange={(val) => onChange('nds', val)}
                disabled={isDisabled}
            />
        </div>
    </div>
);

