import React from 'react';
import { Empty } from 'antd';
import { BidModelsHeaderPrimary } from './BidModelsHeaderPrimary';
import { BidModelsHeaderSecondary } from './BidModelsHeaderSecondary';
import { BidModelsRowPrimary } from './BidModelsRowPrimary';
import { BidModelsRowSecondary } from './BidModelsRowSecondary';

export const BidModelsTable = ({
    isManager,
    sortedBidModels,
    nameOptionsPrimary,
    nameOptionsSecondary,
    presenceOptions,
    isDisabledInputManager,
    isDisabledInput,
    isDisabledInputAdmin,
    isCalculating,
    prepareAmount,
    currencySymbol,
    isErrorInput,
    onChangeModel,
    onChangeModelInfo,
    onOpenModelInfoExtra,
    onDeletePrimary,
    onCopyName,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
}) => (
    <>
        {isManager ? <BidModelsHeaderPrimary /> : <BidModelsHeaderSecondary />}
        <div className={'sa-models-table'}>
            {(sortedBidModels && sortedBidModels.length > 0) ? (
                sortedBidModels.map((bidModel, idx) =>
                    isManager ? (
                        <BidModelsRowPrimary
                            key={`bid-model-${idx}-${bidModel.bid_id}-${bidModel.id}-${bidModel.sort}`}
                            bidModel={bidModel}
                            index={idx}
                            draggable={!isDisabledInputManager}
                            onDragStart={() => onDragStart(idx)}
                            onDragOver={onDragOver}
                            onDrop={() => onDrop(idx)}
                            onDragEnd={onDragEnd}
                            nameOptions={nameOptionsPrimary}
                            presenceOptions={presenceOptions}
                            isDisabledInputManager={isDisabledInputManager}
                            isDisabledInput={isDisabledInput}
                            isCalculating={isCalculating}
                            prepareAmount={prepareAmount}
                            currencySymbol={currencySymbol}
                            onChangeModel={onChangeModel}
                            onChangeModelInfo={onChangeModelInfo}
                            onOpenModelInfoExtra={() => onOpenModelInfoExtra(bidModel.model_id)}
                            onDelete={() => onDeletePrimary(bidModel.id, bidModel.sort, bidModel.model_id)}
                        />
                    ) : (
                        <BidModelsRowSecondary
                            key={`bid-model-${idx}-${bidModel.bid_id}-${bidModel.id}-${bidModel.sort}`}
                            bidModel={bidModel}
                            index={idx}
                            draggable={!isDisabledInputManager}
                            onDragStart={() => onDragStart(idx)}
                            onDragOver={onDragOver}
                            onDrop={() => onDrop(idx)}
                            onDragEnd={onDragEnd}
                            nameOptions={nameOptionsSecondary}
                            presenceOptions={presenceOptions}
                            isDisabledInputManager={isDisabledInputManager}
                            isDisabledInputAdmin={isDisabledInputAdmin}
                            isCalculating={isCalculating}
                            prepareAmount={prepareAmount}
                            currencySymbol={currencySymbol}
                            isErrorInput={isErrorInput}
                            onChangeModel={onChangeModel}
                            onChangeModelInfo={onChangeModelInfo}
                            onOpenModelInfoExtra={() => onOpenModelInfoExtra(bidModel.model_id)}
                            onCopyName={onCopyName}
                        />
                    )
                )
            ) : (
                <Empty />
            )}
        </div>
    </>
);

