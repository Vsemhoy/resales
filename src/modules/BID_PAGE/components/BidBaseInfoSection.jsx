import React from 'react';
import { Input, Select, Tag, Tooltip } from 'antd';
import { InfoCircleOutlined, MinusOutlined } from '@ant-design/icons';

export const BidBaseInfoSection = ({
    values,
    templateWordCompanyOptions,
    orgUsersOptions,
    protectionOptions,
    projectOptions,
    isProjectsLoading,
    orgUsersDefaultValue,
    onChange,
    isDisabled,
    onOpenProject,
    createdAtLabel,
}) => (
    <div className={'sa-info-list-hide-wrapper'}>
        <div className={'sa-info-list-row'}>
            <div className={'sa-list-row-label'}>
                <p style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    Шаблон
                    <Tooltip title="Шаблон отвечает за то, от какой компании создаются документы в форматах Word и PDF. Также счёт появится в 1С выбранной компании.">
                        <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
                    </Tooltip>
                </p>
            </div>
            <Select
                style={{ width: '100%', textAlign: 'left' }}
                value={values.wordTemplateCompany}
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={templateWordCompanyOptions}
                onChange={(val) => onChange('wordTemplateCompany', val)}
                disabled={isDisabled}
            />
        </div>
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
            {isDisabled ? (
                values.project ? (
                    <Tag
                        style={{
                            minWidth: '35px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            marginInlineEnd: 0,
                        }}
                        color={'cyan'}
                        onClick={onOpenProject}
                    >
                        {+values.project}
                    </Tag>
                ) : (
                    <MinusOutlined />
                )
            ) : (
                <Select
                    style={{ width: '100%', textAlign: 'left' }}
                    value={values.project}
                    showSearch
                    allowClear
                    placeholder="Выберите проект"
                    optionFilterProp="label"
                    filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={projectOptions}
                    loading={isProjectsLoading}
                    onChange={(val) => onChange('project', val ?? null)}
                    disabled={isDisabled}
                    notFoundContent={isProjectsLoading ? 'Загрузка...' : 'Проекты не найдены'}
                />
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
