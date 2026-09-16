import React, { useEffect, useState } from 'react';
import { Alert, Button, Modal, Table } from 'antd';
import dayjs from 'dayjs';

const renderValue = (value) => {
    if (value === null || value === undefined) return '—';
    return typeof value === 'object' ? JSON.stringify(value) : String(value);
};

const columns = [
    { title: 'ID', dataIndex: 'id', width: 90 },
    { title: 'Поле', dataIndex: 'field', width: 180 },
    { title: 'Старое значение', dataIndex: 'old_value', render: renderValue },
    { title: 'Новое значение', dataIndex: 'new_value', render: renderValue },
    {
        title: 'Дата и время', dataIndex: 'date', width: 180,
        render: (value) => {
            if (!value) return '—';
            const date = dayjs(typeof value === 'number' ? value * 1000 : value);
            return date.isValid() ? date.format('DD.MM.YYYY HH:mm:ss') : '—';
        },
    },
];

export default function BidRopHistoryModal({ bidId, onClose, loadHistory }) {
    const [pagination, setPagination] = useState({ page: 1, pageSize: 20 });
    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [retry, setRetry] = useState(0);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);
        setRows([]);
        Promise.resolve()
            .then(() => loadHistory(bidId, pagination))
            .then((result) => {
                if (!active) return;
                setRows(result.rows);
                setTotal(result.total);
            })
            .catch(() => {
                if (!active) return;
                setError('Не удалось загрузить историю изменений. Попробуйте ещё раз.');
            })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [bidId, pagination, loadHistory, retry]);

    return (
        <Modal title={`История РОП — бид №${bidId}`} open onCancel={onClose}
            footer={null} width={1100}>
            <Alert type="info" showIcon message="Демонстрационные данные. API истории изменений пока не подключён."
                style={{ marginBottom: 16 }} />
            {error && <Alert type="error" showIcon message={error}
                style={{ marginBottom: 16 }}
                action={<Button size="small" onClick={() => setRetry(value => value + 1)}>Повторить</Button>} />}
            <Table rowKey="id" columns={columns} dataSource={rows} loading={loading}
                size="small" bordered scroll={{ x: 850, y: 500 }}
                locale={{ emptyText: error ? 'История не загружена' : 'Изменений пока нет' }}
                onRow={() => ({ style: { whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' } })}
                pagination={{
                    current: pagination.page,
                    pageSize: pagination.pageSize,
                    total,
                    showSizeChanger: true,
                    pageSizeOptions: [20, 50, 100],
                    showTotal: count => `Всего: ${count}`,
                    onChange: (page, pageSize) => setPagination({
                        page: pageSize !== pagination.pageSize ? 1 : page,
                        pageSize,
                    }),
                }} />
        </Modal>
    );
}
