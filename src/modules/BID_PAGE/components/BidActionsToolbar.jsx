import React, { useState } from 'react';
import { Badge, Button, Tooltip, Drawer, Tag } from 'antd';
import {
    CopyOutlined,
    DollarOutlined,
    FilePdfOutlined,
    FileWordOutlined,
    HistoryOutlined,
    LayoutOutlined,
    PlusOutlined,
    FileTextOutlined,
} from '@ant-design/icons';
import { BidFilesSection } from './BidFilesSection';
import { HTTP_HOST } from '../../../config/config';
import { PROD_AXIOS_INSTANCE } from '../../../config/Api';

const KP_TYPE_LABEL  = { 1: 'Трансляционная', 2: 'Профессиональная' }
const COMPANY_LABEL  = { 2: 'Arstel', 3: 'Rondo' }
const COMPANY_COLOR  = { 2: '#FF5903', 3: '#269435' }

export const BidActionsToolbar = ({
    bidId,
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

    const [drawerOpen,  setDrawerOpen]  = useState(false)
    const [drafts,      setDrafts]      = useState([])
    const [draftsLoading, setDraftsLoading] = useState(false)

    const handlePdfClick = async () => {
        setDraftsLoading(true)
        onNavigatePdf()
        setDraftsLoading(false)
    }

    const openPdf = () => {
        if (isDirty) {
            openCustomModal(
                'pdf',
                'Переход в интерфейс создания PDF-документа',
                'У Вас есть несохраненные изменения! Подтвердите сохранение перед сменой интерфейса.',
                [],
                baseButtons
            );
        } else {
            handlePdfClick()
        }
    }

    const formatDate = (str) => {
        if (!str) return ''
        const d = new Date(str)
        return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    }

    return (
        <div className={'sa-bid-page-btns-wrapper'}>
            <Tooltip title={'Основная информация'} placement={'right'}>
                <Button
                    className={'sa-bid-page-btn'}
                    color="primary"
                    variant={isOpenBaseInfo ? 'solid' : 'outlined'}
                    icon={<LayoutOutlined className={'sa-bid-page-btn-icon'} />}
                    onClick={onToggleBaseInfo}
                />
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
                                openCustomModal('word', 'Создание Word документа', 'У Вас есть несохраненные изменения! Подтвердите сохранение перед созданием документа.', [], baseButtons);
                            } else {
                                onFetchWordFile();
                            }
                        }}
                    />
                </Tooltip>
            )}

            {canSend1c && (
                <Tooltip title={isSend1c ? 'Уже было отправлено в 1С' : 'Отправить в 1С'} placement={'right'}>
                    <Badge count={filesCount} color={'geekblue'}>
                        <Button
                            className={'sa-bid-page-btn'}
                            color={isSend1c ? 'danger' : 'primary'}
                            variant="outlined"
                            style={{ fontSize: '20px', fontWeight: 'bold' }}
                            disabled={isLoading1c}
                            onClick={() => {
                                if (isSend1c) {
                                    openCustomModal('1c', 'Отправить данные в 1С', 'Данные уже были отправлены в 1С! Подтвердите повторную отправку данных.', [], buttons1C);
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

            {/* PDF кнопка */}
            <Tooltip title={'Создать PDF'} placement={'right'}>
                <Button
                    className={'sa-bid-page-btn'}
                    color="primary"
                    variant="outlined"
                    icon={<FilePdfOutlined className={'sa-bid-page-btn-icon'} />}
                    loading={draftsLoading}
                    onClick={openPdf}
                />
            </Tooltip>

            <BidFilesSection bidType={bidType} filesCount={filesCount} onOpen={onOpenFiles} />
            <div className={'divider'} />

            <Tooltip title={'История'} placement={'right'}>
                <Button
                    className={'sa-bid-page-btn'}
                    color="primary"
                    variant="outlined"
                    icon={<HistoryOutlined className={'sa-bid-page-btn-icon'} />}
                    onClick={onOpenHistory}
                />
            </Tooltip>

            {canDuplicate && <div className={'divider'} />}
            {canDuplicate && (
                <Tooltip title={'Дублировать'} placement={'right'}>
                    <Button
                        className={'sa-bid-page-btn'}
                        color="primary"
                        variant="outlined"
                        icon={<CopyOutlined className={'sa-bid-page-btn-icon'} />}
                        onClick={() => {
                            if (isDirty) {
                                openCustomModal('duplicate', 'Создание дубликата', 'У Вас есть несохраненные изменения! Подтвердите сохранение перед созданием дубликата.', [], baseButtons);
                            } else {
                                onOpenDuplicate();
                            }
                        }}
                    />
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
                                openCustomModal('bill', 'Создание счета на базе КП', 'У Вас есть несохраненные изменения! Подтвердите сохранение перед созданием нового счета.', [], baseButtons);
                            } else {
                                onFetchNewBid();
                            }
                        }}
                    />
                </Tooltip>
            )}

            {/* Дровер со списком драфтов */}
            <Drawer
                title="Черновики КП"
                placement="right"
                width={360}
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                extra={
                    <Button
                        type="primary"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => { setDrawerOpen(false); onNavigatePdf() }}
                    >
                        Новый
                    </Button>
                }
            >
                {drafts?.map(draft => {
                    const color   = COMPANY_COLOR[draft.id_company] ?? '#1677ff'
                    const company = COMPANY_LABEL[draft.id_company] ?? '?'
                    const kpType  = KP_TYPE_LABEL[draft.kp_type]    ?? '?'
                    const creator = draft.creator
                        ? `${draft.creator.name} ${draft.creator.surname}`
                        : '—'

                    return (
                        <div
                            key={draft.id}
                            style={{
                                border: '1px solid #e8e8e8', borderRadius: 8,
                                padding: '12px 14px', marginBottom: 10,
                                cursor: 'pointer', transition: 'border-color 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = color}
                            onMouseLeave={e => e.currentTarget.style.borderColor = '#e8e8e8'}
                            onClick={() => {
                                setDrawerOpen(false)
                                window.location.href = `/bidsPDF/${bidId}/${draft.id}`
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                <FileTextOutlined style={{ color }} />
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#262626', flex: 1 }}>
                                    Драфт #{draft.id}
                                </span>
                                <Tag color={color} style={{ margin: 0, fontSize: 11 }}>{company}</Tag>
                            </div>
                            <div style={{ fontSize: 12, color: '#595959', marginBottom: 4 }}>{kpType}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8c8c8c' }}>
                                <span>{creator}</span>
                                <span>{formatDate(draft.updated_at)}</span>
                            </div>
                        </div>
                    )
                })}
            </Drawer>
        </div>
    );
};
