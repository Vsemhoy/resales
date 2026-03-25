import React from 'react';
import { Button } from 'antd';
import { DeleteOutlined, InfoCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import NameSelect from './NameSelect';
import ModelInput from './ModelInput';
import ModelSelect from './ModelSelect';

export const BidModelsRowPrimary = ({
    bidModel,
    index,
    draggable,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
    nameOptions,
    presenceOptions,
    isDisabledInputManager,
    isDisabledInput,
    isCalculating,
    prepareAmount,
    currencySymbol,
    onChangeModel,
    onChangeModelInfo,
    onOpenModelInfoExtra,
    onDelete,
}) => (
    <div
        className={'sa-models-table-row'}
        draggable={draggable}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
    >
        <div className={'sa-models-table-cell'} style={{ cursor: 'grab' }}>
            <p>{index + 1}</p>
        </div>
        <div className={'sa-models-table-cell align-left'}>
            <NameSelect
                options={nameOptions}
                model={bidModel}
                disabled={isDisabledInputManager}
                onUpdateModelName={onChangeModel}
            />
        </div>
        <div className={'sa-models-table-cell'}>
            <ModelInput
                value={bidModel.model_count}
                bidModelId={bidModel.id}
                bidModelSort={bidModel.sort}
                disabled={isDisabledInputManager}
                type={'model_count'}
                isOnlyPositive={true}
                onChangeModel={onChangeModelInfo}
            />
        </div>
        <div className={'sa-models-table-cell'}>
            <ModelInput
                value={bidModel.percent}
                bidModelId={bidModel.id}
                bidModelSort={bidModel.sort}
                disabled={isDisabledInputManager}
                type={'percent'}
                isOnlyPositive={false}
                onChangeModel={onChangeModelInfo}
            />
        </div>
        <div className={'sa-models-table-cell'}>
            {isCalculating ? (
                <LoadingOutlined />
            ) : (
                <p>{prepareAmount(+bidModel?.moneyOne, currencySymbol(bidModel))}</p>
            )}
        </div>
        <div className={'sa-models-table-cell'}>
            {isCalculating ? (
                <LoadingOutlined />
            ) : (
                <p>{prepareAmount(+bidModel?.moneyCount, currencySymbol(bidModel))}</p>
            )}
        </div>
        <div className={'sa-models-table-cell'}>
            <ModelSelect
                options={presenceOptions}
                value={bidModel.presence}
                bidModelId={bidModel.id}
                bidModelSort={bidModel.sort}
                disabled={isDisabledInput}
                type={'presence'}
                onChangeModel={onChangeModelInfo}
            />
        </div>
        <div className={'sa-models-table-cell'} style={{ padding: 0, boxShadow: 'none' }}>
            {bidModel.model_id && (
                <Button
                    color="primary"
                    variant="filled"
                    icon={<InfoCircleOutlined />}
                    onClick={onOpenModelInfoExtra}
                ></Button>
            )}
        </div>
        <div className={'sa-models-table-cell'} style={{ padding: 0 }}>
            <Button
                color="danger"
                variant="filled"
                icon={<DeleteOutlined />}
                onClick={onDelete}
                disabled={isDisabledInputManager}
            ></Button>
        </div>
    </div>
);

