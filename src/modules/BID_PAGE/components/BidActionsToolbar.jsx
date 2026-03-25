import React from 'react';
import { Badge, Button, Tooltip } from 'antd';
import {
    CopyOutlined,
    DollarOutlined,
    FilePdfOutlined,
    FileWordOutlined,
    HistoryOutlined,
    LayoutOutlined,
} from '@ant-design/icons';
import { BidFilesSection } from './BidFilesSection';

export const BidActionsToolbar = ({
    bidType,
    bidPlace,
    isDirty,
    isSend1c,
    isLoading1c,
    filesCount,
    isOpenBaseInfo,
    onToggleBaseInfo,
    onOpenFiles,
    onOpenHistory,
    onOpenDuplicate,
    onFetchWordFile,
    onNavigatePdf,
    onFetchSend1c,
    onFetchNewBid,
    openCustomModal,
    baseButtons,
    buttons1C,
    userRole,
    isSuper,
}) => {
    const canDuplicate = userRole === 1 || isSuper === 1;
    const canSend1c = +bidType === 2 && bidPlace === 3 && (userRole === 3 || isSuper === 1);

    return (
        <div className={'sa-bid-page-btns-wrapper'}>
            <Tooltip title={'Основная информация'} placement={'right'}>
                <Button
                    className={'sa-bid-page-btn'}
                    color="primary"
                    variant={isOpenBaseInfo ? 'solid' : 'outlined'}
                    icon={<LayoutOutlined className={'sa-bid-page-btn-icon'} />}
                    onClick={onToggleBaseInfo}
                ></Button>
            </Tooltip>
            {+bidType === 1 && (
                <Tooltip title={'Сохранить в WORD'} placement={'right'}>
                    <Button
                        className={'sa-bid-page-btn'}
                        color="primary"
                        variant="outlined"
                        icon={<FileWordOutlined className={'sa-bid-page-btn-icon'} />}
                        onClick={() => {
                            if (isDirty) {
                                openCustomModal(
                                    'word',
                                    'Создание Word документа',
                                    'У Вас есть несохраненные изменения! Подтвердите сохранение перед созданием документа.',
                                    [],
                                    baseButtons
                                );
                            } else {
                                onFetchWordFile();
                            }
                        }}
                    ></Button>
                </Tooltip>
            )}
            {canSend1c && (
                <Tooltip
                    title={isSend1c ? 'Уже было отправлено в 1С' : 'Отправить в 1С'}
                    placement={'right'}
                >
                    <Badge count={filesCount} color={'geekblue'}>
                        <Button
                            className={'sa-bid-page-btn'}
                            color={isSend1c ? 'danger' : 'primary'}
                            variant="outlined"
                            style={{ fontSize: '20px', fontWeight: 'bold' }}
                            disabled={isLoading1c}
                            onClick={() => {
                                if (isSend1c) {
                                    openCustomModal(
                                        '1c',
                                        'Отправить данные в 1С',
                                        'Данные уже были отправлены в 1С! Подтвердите повторную отправку данных.',
                                        [],
                                        buttons1C
                                    );
                                } else {
                                    onFetchSend1c();
                                }
                            }}
                        >
                            1С
                        </Button>
                    </Badge>
                </Tooltip>
            )}

            <Tooltip title={'Сохранить в PDF'} placement={'right'}>
                <Button
                    className={'sa-bid-page-btn'}
                    color="primary"
                    variant="outlined"
                    icon={<FilePdfOutlined className={'sa-bid-page-btn-icon'} />}
                    onClick={() => {
                        if (isDirty) {
                            openCustomModal(
                                'pdf',
                                'Переход в интерфейс создания PDF-документа',
                                'У Вас есть несохраненные изменения! Подтвердите сохранение перед сменой интерфейса.',
                                [],
                                baseButtons
                            );
                        } else {
                            onNavigatePdf();
                        }
                    }}
                ></Button>
            </Tooltip>
            <BidFilesSection bidType={bidType} filesCount={filesCount} onOpen={onOpenFiles} />
            <div className={'divider'}></div>
            <Tooltip title={'История'} placement={'right'}>
                <Button
                    className={'sa-bid-page-btn'}
                    color="primary"
                    variant="outlined"
                    icon={<HistoryOutlined className={'sa-bid-page-btn-icon'} />}
                    onClick={onOpenHistory}
                ></Button>
            </Tooltip>
            {canDuplicate && <div className={'divider'}></div>}
            {canDuplicate && (
                <Tooltip title={'Дублировать'} placement={'right'}>
                    <Button
                        className={'sa-bid-page-btn'}
                        color="primary"
                        variant="outlined"
                        icon={<CopyOutlined className={'sa-bid-page-btn-icon'} />}
                        onClick={() => {
                            if (isDirty) {
                                openCustomModal(
                                    'duplicate',
                                    'Создание дубликата',
                                    'У Вас есть несохраненные изменения! Подтвердите сохранение перед созданием дубликата.',
                                    [],
                                    baseButtons
                                );
                            } else {
                                onOpenDuplicate();
                            }
                        }}
                    ></Button>
                </Tooltip>
            )}
            {+bidType === 1 && (
                <Tooltip title={'Создать счет'} placement={'right'}>
                    <Button
                        className={'sa-bid-page-btn'}
                        color="primary"
                        variant="outlined"
                        icon={<DollarOutlined className={'sa-bid-page-btn-icon'} />}
                        onClick={() => {
                            if (isDirty) {
                                openCustomModal(
                                    'bill',
                                    'Создание счета на базе КП',
                                    'У Вас есть несохраненные изменения! Подтвердите сохранение перед созданием нового счета.',
                                    [],
                                    baseButtons
                                );
                            } else {
                                onFetchNewBid();
                            }
                        }}
                    ></Button>
                </Tooltip>
            )}
        </div>
    );
};

