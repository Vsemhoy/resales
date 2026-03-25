import React from 'react';
import { Tag, Tooltip } from 'antd';

export const BidHeaderMeta = ({
    bidIdCompany,
    companies,
    bidOrg,
    userRole,
    isDirty,
    openMode,
    onOpenOrg,
}) => {
    if (!bidIdCompany || !companies || !bidOrg || !bidOrg.name) return null;

    const company = companies.find((comp) => comp.id === bidIdCompany);
    if (!company) return null;

    return (
        <div className={'sa-vertical-flex'} style={{ alignItems: 'baseline' }}>
            От компании
            <Tag
                style={{
                    textAlign: 'center',
                    fontSize: '14px',
                }}
                color={company.color}
            >
                {company.name}
            </Tag>
            для
            <Tag
                style={{
                    textAlign: 'center',
                    fontSize: '14px',
                    cursor: 'pointer',
                }}
                color="geekblue"
                onClick={onOpenOrg}
            >
                {bidOrg.name}
            </Tag>
            <Tag
                style={{
                    textAlign: 'center',
                    fontSize: '14px',
                    cursor: 'pointer',
                }}
            >
                №{bidOrg.id}
            </Tag>
            Ваша роль:
            {userRole === 1 && <Tag color={'blue'}>менеджер</Tag>}
            {userRole === 2 && <Tag color={'volcano'}>администратор</Tag>}
            {userRole === 3 && <Tag color={'magenta'}>бухгалтер</Tag>}
            {userRole === 4 && <Tag color={'gold'}>завершено</Tag>}
            Режим:{' '}
            <Tooltip title={openMode?.description}>
                <Tag color={openMode?.color}>{openMode?.tagtext}</Tag>
            </Tooltip>
            {isDirty && (
                <Tooltip title={'Не забудьте сохранить'}>
                    <Tag color="red-inverse">Есть несохраненные данные</Tag>
                </Tooltip>
            )}
        </div>
    );
};

