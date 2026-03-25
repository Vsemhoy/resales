import React from 'react';
import { Input } from 'antd';

const { TextArea } = Input;

export const BidCommentsSection = ({ values, onChange, disabled }) => (
    <div className={'sa-info-list-hide-wrapper'}>
        <div className={'sa-info-list-row'}>
            <div className={'sa-list-row-label'}>
                <p>Комментарий инженера</p>
            </div>
            <TextArea
                value={values.engineer}
                autoSize={{ minRows: 2, maxRows: 6 }}
                onChange={(e) => onChange('engineer', e.target.value)}
                disabled={disabled.engineer}
            />
        </div>
        <div className={'sa-info-list-row'}>
            <div className={'sa-list-row-label'}>
                <p>Комментарий менеджера</p>
            </div>
            <TextArea
                value={values.manager}
                autoSize={{ minRows: 2, maxRows: 6 }}
                onChange={(e) => onChange('manager', e.target.value)}
                disabled={disabled.manager}
            />
        </div>
        <div className={'sa-info-list-row'}>
            <div className={'sa-list-row-label'}>
                <p>Комментарий администратора</p>
            </div>
            <TextArea
                value={values.admin}
                autoSize={{ minRows: 2, maxRows: 6 }}
                onChange={(e) => onChange('admin', e.target.value)}
                disabled={disabled.admin}
            />
        </div>
        <div className={'sa-info-list-row'}>
            <div className={'sa-list-row-label'}>
                <p>Комментарий бухгалтера</p>
            </div>
            <TextArea
                value={values.accountant}
                autoSize={{ minRows: 2, maxRows: 6 }}
                onChange={(e) => onChange('accountant', e.target.value)}
                disabled={disabled.accountant}
            />
        </div>
        <div className={'sa-info-list-row'}>
            <div className={'sa-list-row-label'}>
                <p>Дополнительное оборудование</p>
            </div>
            <TextArea
                value={values.addEquipment}
                autoSize={{ minRows: 2, maxRows: 6 }}
                onChange={(e) => onChange('addEquipment', e.target.value)}
                disabled={disabled.addEquipment}
            />
        </div>
    </div>
);

