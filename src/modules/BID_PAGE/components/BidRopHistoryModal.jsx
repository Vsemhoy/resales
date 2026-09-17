import React, { useEffect, useState } from 'react';
import { Alert, Button, Modal, Table } from 'antd';
import dayjs from 'dayjs';
import { getRopHistoryFieldLabel, getRopHistoryValue, getVisibleBidChanges, getVisibleModelChanges } from '../utils/ropHistoryFields';

const renderValue = value => {
    if (value === null) return <span style={{ color: '#888' }}>null</span>;
    if (value === undefined) return '—';
    if (value === '') return '""';
    return typeof value === 'object' ? JSON.stringify(value) : String(value);
};
const actionLabels = { update: 'Изменение', create: 'Добавление', delete: 'Удаление' };
const detailColumns = (entity, selects) => [
    { title: 'Поле', dataIndex: 'column', width: 230, render: value => getRopHistoryFieldLabel(value, entity) },
    { title: 'Старое значение', dataIndex: 'old', render: (value, row) => renderValue(getRopHistoryValue(value, row.column, entity, selects)) },
    { title: 'Новое значение', dataIndex: 'new', render: (value, row) => renderValue(getRopHistoryValue(value, row.column, entity, selects)) },
];
const ChangeTable = ({ changes, entity = 'bid', selects }) => (
    <Table size="small" bordered pagination={false} columns={detailColumns(entity, selects)}
        dataSource={(entity === 'model' ? getVisibleModelChanges(changes) : changes)
            .map((change, index) => ({ ...change, key: index }))}
        locale={{ emptyText: 'Нет отображаемых изменений' }}
        onRow={() => ({ style: { whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' } })} />
);
const SaveDetails = ({ record, selects }) => (
    <div style={{ display: 'grid', gap: 16, padding: 8 }}>
        {!!getVisibleBidChanges(record).length && <section>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Поля бида</div>
            <ChangeTable changes={getVisibleBidChanges(record)} selects={selects} />
        </section>}
        {(record.changes?.models || []).map((model, index) => {
            const changes = model.action === 'update' ? (model.changes || []) :
                [...new Set([...Object.keys(model.old || {}), ...Object.keys(model.new || {})])]
                    .map(column => ({
                        column,
                        old: model.old === null ? null : model.old?.[column],
                        new: model.new === null ? null : model.new?.[column],
                    }));
            return <section key={model.id + '-' + index}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>
                    Позиция #{model.id} — {actionLabels[model.action] || model.action}
                </div>
                <ChangeTable changes={changes} entity="model" selects={selects} />
            </section>;
        })}
        {!getVisibleBidChanges(record).length && !record.changes?.models?.length && 'В сохранении нет отображаемых изменений'}
    </div>
);
const columns = [
    { title: 'ID сохранения', dataIndex: 'id', width: 140 },
    {
        title: 'Дата и время', dataIndex: 'created_at', width: 180,
        render: value => {
            if (!value) return '—';
            const date = dayjs(value);
            return date.isValid() ? date.format('DD.MM.YYYY HH:mm:ss') : '—';
        },
    },
    {
        title: 'Автор', dataIndex: 'user', width: 230,
        render: user => user?.name || (user?.id != null ? 'Удалённый пользователь (ID ' + user.id + ')' : '—'),
    },
    {
        title: 'Изменения', key: 'summary',
        render: (_, record) => {
            const models = record.changes?.models || [];
            const parts = ['Полей бида: ' + getVisibleBidChanges(record).length];
            for (const [action, label] of [['update', 'Изменено позиций'], ['create', 'Добавлено позиций'], ['delete', 'Удалено позиций']]) {
                const count = models.filter(model => model.action === action).length;
                if (count) parts.push(label + ': ' + count);
            }
            return parts.join(' · ');
        },
    },
];

export default function BidRopHistoryModal({ bidId, onClose, loadHistory, selects }) {
    const [pagination, setPagination] = useState({ page: 1, pageSize: 20 });
    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retry, setRetry] = useState(0);
    const [expandedRowKeys, setExpandedRowKeys] = useState([]);

    useEffect(() => {
        let active = true;
        const controller = new AbortController();
        setLoading(true);
        setError(null);
        setRows([]);
        setExpandedRowKeys([]);
        Promise.resolve()
            .then(() => loadHistory(bidId, { page: pagination.page, per_page: pagination.pageSize }, controller.signal))
            .then(result => {
                if (!active) return;
                setRows(result.data);
                setTotal(result.meta.total);
            })
            .catch(error => {
                if (!active) return;
                const messages = {
                    403: 'Нет доступа к истории РОП.',
                    404: 'Бид или API истории не найден.',
                    422: 'Некорректные параметры запроса истории.',
                };
                setError(messages[error.response?.status] || 'Не удалось загрузить историю изменений. Попробуйте ещё раз.');
            })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; controller.abort(); };
    }, [bidId, pagination, loadHistory, retry]);

    return (
        <Modal title={'История РОП — бид №' + bidId} open onCancel={onClose} footer={null} width="95vw"
            style={{ top: '2.5vh', paddingBottom: 0, maxWidth: '95vw' }}
            styles={{
                content: { height: '95vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
                header: { flexShrink: 0 },
                body: { flex: 1, minHeight: 0, overflow: 'auto' },
            }}>
            <div style={{ marginBottom: 12 }}>Каждая строка — отдельное сохранение. Раскройте строку, чтобы увидеть все изменения.</div>
            {error && <Alert type="error" showIcon message={error}
                style={{ marginBottom: 16 }}
                action={<Button size="small" onClick={() => setRetry(value => value + 1)}>Повторить</Button>} />}
            <Table rowKey="id" columns={columns} dataSource={rows}
                loading={{ spinning: loading, tip: 'Загрузка истории…' }}
                size="small" bordered scroll={{ x: 850 }}
                expandable={{
                    expandedRowRender: record => <SaveDetails record={record} selects={selects} />,
                    expandedRowKeys,
                    onExpandedRowsChange: setExpandedRowKeys,
                    expandRowByClick: true,
                }}
                locale={{ emptyText: loading ? ' ' : error ? 'История не загружена' : 'Сохранений пока нет' }}
                pagination={{
                    current: pagination.page,
                    pageSize: pagination.pageSize,
                    total,
                    showSizeChanger: true,
                    pageSizeOptions: [20, 50, 100],
                    showTotal: count => 'Всего сохранений: ' + count,
                    onChange: (page, pageSize) => setPagination({
                        page: pageSize !== pagination.pageSize ? 1 : page,
                        pageSize,
                    }),
                }} />
        </Modal>
    );
}
