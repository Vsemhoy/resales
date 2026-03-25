import React from 'react';
import { Tag } from 'antd';
import CurrencyMonitorBar from '../../../components/template/CURRENCYMONITOR/CurrencyMonitorBar';
import { BidHeaderMeta } from './BidHeaderMeta';
import { BidStatusActions } from './BidStatusActions';

export const BidPageHeader = ({
    bidType,
    bidId,
    bidIdCompany,
    companies,
    bidOrg,
    userRole,
    isDirty,
    openMode,
    onOpenOrg,
    statusActionsProps,
}) => (
    <div
        className={'sa-control-panel sa-flex-space sa-pa-12 sa-list-header'}
        style={{ margin: 0 }}
    >
        <div className={'sa-header-label-container'}>
            <div className={'sa-header-label-container-small'}>
                <h1 className={`sa-header-label`}>
                    {+bidType === 1
                        ? 'Коммерческое предложение '
                        : +bidType === 2
                        ? 'Счет '
                        : ''}
                    <Tag style={{ fontSize: '20px', lineHeight: '30px' }}>№{bidId}</Tag>
                </h1>
                <div className={'sa-bid-steps-currency'}>
                    <div>
                        <CurrencyMonitorBar />
                    </div>
                </div>
            </div>
            <div className={'sa-header-label-container-small'}>
                <BidHeaderMeta
                    bidIdCompany={bidIdCompany}
                    companies={companies}
                    bidOrg={bidOrg}
                    userRole={userRole}
                    isDirty={isDirty}
                    openMode={openMode}
                    onOpenOrg={onOpenOrg}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <BidStatusActions {...statusActionsProps} />
                </div>
            </div>
        </div>
    </div>
);
