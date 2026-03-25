import React from 'react';
import { Button, Space } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined, CheckCircleOutlined, SaveOutlined } from '@ant-design/icons';

export const BidStatusActions = ({
    bidType,
    bidPlace,
    openModeStatus,
    isDirty,
    isSaving,
    isDisabledInput,
    isLoadingChangePlaceBtn,
    onSave,
    onToAdmin,
    onBackManager,
    onBackManagerWithSelect,
    onToBuh,
    onBackAdminWithSelect,
    onDone,
    onBackBuh,
}) => (
    <>
        {+bidType === 2 && +bidPlace === 1 && (
            <Space.Compact>
                <Button
                    className={'sa-select-custom-admin'}
                    disabled={isDisabledInput || (isLoadingChangePlaceBtn && isLoadingChangePlaceBtn !== 'toAdmin')}
                    loading={isLoadingChangePlaceBtn && isLoadingChangePlaceBtn === 'toAdmin'}
                    onClick={onToAdmin}
                >
                    Передать администратору <ArrowRightOutlined />
                </Button>
            </Space.Compact>
        )}
        {+bidType === 2 && +bidPlace === 2 && (
            <Space.Compact>
                <Button
                    className={'sa-select-custom-manager'}
                    disabled={isDisabledInput || (isLoadingChangePlaceBtn && isLoadingChangePlaceBtn !== 'backManager')}
                    loading={isLoadingChangePlaceBtn && isLoadingChangePlaceBtn === 'backManager'}
                    onClick={() => (isDirty ? onBackManager() : onBackManagerWithSelect())}
                >
                    <ArrowLeftOutlined /> Вернуть менеджеру
                </Button>
                <Button
                    className={'sa-select-custom-bugh'}
                    disabled={isDisabledInput || (isLoadingChangePlaceBtn && isLoadingChangePlaceBtn !== 'toBuh')}
                    loading={isLoadingChangePlaceBtn && isLoadingChangePlaceBtn === 'toBuh'}
                    onClick={onToBuh}
                >
                    Передать бухгалтеру <ArrowRightOutlined />
                </Button>
            </Space.Compact>
        )}
        {+bidType === 2 && +bidPlace === 3 && (
            <Space.Compact>
                <Button
                    className={'sa-select-custom-admin'}
                    disabled={isDisabledInput || (isLoadingChangePlaceBtn && isLoadingChangePlaceBtn !== 'backAdmin')}
                    loading={isLoadingChangePlaceBtn && isLoadingChangePlaceBtn === 'backAdmin'}
                    onClick={onBackAdminWithSelect}
                >
                    <ArrowLeftOutlined /> Вернуть администратору
                </Button>
                <Button
                    className={'sa-select-custom-end'}
                    disabled={isDisabledInput || (isLoadingChangePlaceBtn && isLoadingChangePlaceBtn !== 'done')}
                    loading={isLoadingChangePlaceBtn && isLoadingChangePlaceBtn === 'done'}
                    onClick={onDone}
                >
                    Завершить счет <CheckCircleOutlined />
                </Button>
            </Space.Compact>
        )}
        {+bidType === 2 && +bidPlace === 4 && (
            <Space.Compact>
                <Button
                    className={'sa-select-custom-bugh'}
                    disabled={openModeStatus !== 5 || (isLoadingChangePlaceBtn && isLoadingChangePlaceBtn !== 'backBuh')}
                    loading={isLoadingChangePlaceBtn && isLoadingChangePlaceBtn === 'backBuh'}
                    onClick={onBackBuh}
                >
                    <ArrowLeftOutlined /> Вернуть бухгалтеру
                </Button>
            </Space.Compact>
        )}

        <Button
            type={'primary'}
            style={{ width: '150px' }}
            icon={<SaveOutlined />}
            loading={isSaving}
            onClick={onSave}
            disabled={isDisabledInput} /* || openMode?.status === 4 */
        >
            {isSaving ? 'Сохраняем...' : 'Сохранить'}
        </Button>
    </>
);
