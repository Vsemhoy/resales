import React from 'react';
import { Button } from 'antd';
import { CopyOutlined, InfoCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import NameSelect from './NameSelect';
import ModelInput from './ModelInput';
import ModelSelect from './ModelSelect';

export const BidModelsRowSecondary = ({
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
    isDisabledInputAdmin,
    isCalculating,
    prepareAmount,
    currencySymbol,
    isErrorInput,
    onChangeModel,
    onChangeModelInfo,
    onOpenModelInfoExtra,
    onCopyName,
}) => (
    <div
        className={'sa-models-table-row-two'}
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
            <Button
                icon={<CopyOutlined />}
                onClick={() => onCopyName(bidModel.model_id)}
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
                error={isErrorInput(bidModel.id)}
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
                disabled={(isDisabledInputManager && isDisabledInputAdmin)}
                type={'presence'}
                onChangeModel={onChangeModelInfo}
            />
        </div>
        <div className={'sa-models-table-cell'}>
            <ModelInput
                value={bidModel.sklad}
                bidModelId={bidModel.id}
                bidModelSort={bidModel.sort}
                disabled={isDisabledInputAdmin}
                type={'sklad'}
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
    </div>
);
