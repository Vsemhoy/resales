import React from 'react';
import { Input, Select, Tag } from 'antd';
import { MinusOutlined } from '@ant-design/icons';

export const BidBaseInfoSection = ({
    values,
    orgUsersOptions,
    protectionOptions,
    orgUsersDefaultValue,
    onChange,
    isDisabled,
    bidProjectId,
    onOpenProject,
    createdAtLabel,
}) => (
    <div className={'sa-info-list-hide-wrapper'}>
        <div className={'sa-info-list-row'}>
            <div className={'sa-list-row-label'}>
                <p>Контактное лицо</p>
            </div>
            <Select
                style={{ width: '100%', textAlign: 'left' }}
                value={values.orgUser}
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={orgUsersOptions}
                onChange={(val) => onChange('orgUser', val)}
                disabled={isDisabled}
                defaultValue={orgUsersDefaultValue}
            />
        </div>
        <div className={'sa-info-list-row'}>
            <div className={'sa-list-row-label'}>
                <p>Защита проекта</p>
            </div>
            <Select
                style={{ width: '100%', textAlign: 'left' }}
                value={values.protectionProject}
                options={protectionOptions}
                onChange={(val) => onChange('protectionProject', val)}
                disabled={isDisabled}
            />
        </div>
        <div className={'sa-info-list-row'}>
            <div className={'sa-list-row-label'}>
                <p>Объект</p>
            </div>
            <Input
                style={{ width: '100%', height: '32px' }}
                value={values.object}
                onChange={(e) => onChange('object', e.target.value)}
                disabled={isDisabled}
            />
        </div>
        <div className={'sa-info-list-row'}>
            <div className={'sa-list-row-label'}>
                <p>Срок реализации</p>
            </div>
            <Input
                style={{ width: '100%', height: '32px' }}
                value={values.sellBy}
                onChange={(e) => onChange('sellBy', e.target.value)}
                disabled={isDisabled}
            />
        </div>
        <div className={'sa-info-list-row'}>
            <div className={'sa-list-row-label'}>
                <p>Связанный проект</p>
            </div>
            {bidProjectId ? (
                <Tag
                    style={{
                        width: '35px',
                        height: '35px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                    }}
                    color={'cyan'}
                    onClick={onOpenProject}
                >
                    {+bidProjectId}
                </Tag>
            ) : (
                <MinusOutlined />
            )}
        </div>
        <div className={'sa-info-list-row'}>
            <div className={'sa-list-row-label'}>
                <p>Дата создания</p>
            </div>
            <Input
                style={{ width: '100%', height: '32px' }}
                value={createdAtLabel}
                disabled={true}
            />
        </div>
    </div>
);

