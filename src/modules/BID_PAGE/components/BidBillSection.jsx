import React from 'react';
import { Input, Select } from 'antd';

export const BidBillSection = ({
    values,
    options,
    defaults,
    onChange,
    isDisabled,
}) => (
    <div className={'sa-info-list-hide-wrapper'}>
        <div className={'sa-info-list-row'}>
            <div className={'sa-list-row-label'}>
                <p>Плательщик</p>
            </div>
            <Select
                style={{ width: '100%', textAlign: 'left' }}
                value={values.requisite}
                options={options.requisite}
                onChange={(val) => onChange('requisite', val)}
                disabled={isDisabled}
            />
        </div>
        <div className={'sa-info-list-row'}>
            <div className={'sa-list-row-label'}>
                <p>Способ транспортировки</p>
            </div>
            <Select
                style={{ width: '100%', textAlign: 'left' }}
                value={values.conveyance}
                options={options.conveyance}
                onChange={(val) => onChange('conveyance', val)}
                disabled={isDisabled}
            />
        </div>
        <div className={'sa-info-list-row'}>
            <div className={'sa-list-row-label'}>
                <p>Фактический адрес</p>
            </div>
            <Select
                style={{ width: '100%', textAlign: 'left' }}
                value={values.factAddress}
                options={options.factAddress}
                onChange={(val) => onChange('factAddress', val)}
                disabled={isDisabled}
                defaultValue={defaults.factAddress}
            />
        </div>
        <div className={'sa-info-list-row'}>
            <div className={'sa-list-row-label'}>
                <p>Телефон</p>
            </div>
            <Select
                style={{ width: '100%', textAlign: 'left' }}
                value={values.phone}
                options={options.phones}
                onChange={(val) => onChange('phone', val)}
                disabled={isDisabled}
                defaultValue={defaults.phone}
            />
        </div>
        <div className={'sa-info-list-row'}>
            <div className={'sa-list-row-label'}>
                <p>Email</p>
            </div>
            <Select
                style={{ width: '100%', textAlign: 'left' }}
                value={values.email}
                options={options.emails}
                onChange={(val) => onChange('email', val)}
                disabled={isDisabled}
                defaultValue={defaults.email}
            />
        </div>
        <div className={'sa-info-list-row'}>
            <div className={'sa-list-row-label'}>
                <p>Страховка</p>
            </div>
            <Select
                style={{ width: '100%', textAlign: 'left' }}
                value={values.insurance}
                options={options.insurance}
                onChange={(val) => onChange('insurance', val)}
                disabled={isDisabled}
            />
        </div>
        <div className={'sa-info-list-row'}>
            <div className={'sa-list-row-label'}>
                <p>Упаковка</p>
            </div>
            <Select
                style={{ width: '100%', textAlign: 'left' }}
                value={values.package}
                options={options.package}
                onChange={(val) => onChange('package', val)}
                disabled={isDisabled}
            />
        </div>
        <div className={'sa-info-list-row'}>
            <div className={'sa-list-row-label'}>
                <p>Грузополучатель</p>
            </div>
            <Input
                style={{ width: '100%', height: '32px' }}
                value={values.consignee}
                onChange={(e) => onChange('consignee', e.target.value)}
                disabled={isDisabled}
            />
        </div>
        <div className={'sa-info-list-row'}>
            <div className={'sa-list-row-label'}>
                <p>Доп. оборудование</p>
            </div>
            <Input
                style={{ width: '100%', height: '32px' }}
                value={values.otherEquipment}
                onChange={(e) => onChange('otherEquipment', e.target.value)}
                disabled={isDisabled}
            />
        </div>
    </div>
);

