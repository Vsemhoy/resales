import { useEffect, useRef, useState } from 'react';
import { Alert, Button, DatePicker, Form, Modal, Select, Space, Spin, Table, Tag, Typography, message } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import ruRU from 'antd/es/date-picker/locale/ru_RU';
import { createSubstitution, listManagers, listSubstitutions, revokeSubstitution } from './api';
import { errorMessage, fullName, moscowToday, substitutionStatus } from './helpers';
import './style.css';

const formatDate = (value) => value ? dayjs(value).format('DD.MM.YYYY') : '—';

export default function ManagerSubstitutionsPage({ userdata }) {
    const companyId = userdata?.user?.active_company;
    const company = userdata?.companies?.find((item) => String(item.id) === String(companyId));
    return <Substitutions key={`${companyId}:${userdata?.user?.id}:${userdata?.user?.sales_role}`}
        companyName={company?.name || `Компания №${companyId}`} />;
}

function Substitutions({ companyName }) {
    const [form] = Form.useForm();
    const [notice, noticeContext] = message.useMessage();
    const [rows, setRows] = useState([]);
    const [meta, setMeta] = useState({});
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [revision, setRevision] = useState(0);
    const [loading, setLoading] = useState(true);
    const [listError, setListError] = useState('');
    const [open, setOpen] = useState(false);
    const [managers, setManagers] = useState([]);
    const [managersLoading, setManagersLoading] = useState(false);
    const [managersError, setManagersError] = useState('');
    const [managersRevision, setManagersRevision] = useState(0);
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);
    const [revokeTarget, setRevokeTarget] = useState(null);
    const [revoking, setRevoking] = useState(false);
    const [revokeError, setRevokeError] = useState('');
    const [today, setToday] = useState(moscowToday);
    const lifetime = useRef(null);
    const mutationPending = useRef(false);
    const managerId = Form.useWatch('manager_id', form);
    const substituteId = Form.useWatch('substitute_id', form);
    const startsOn = Form.useWatch('starts_on', form);
    const endsOn = Form.useWatch('ends_on', form);
    const canManage = meta.can_manage === true;
    const refresh = () => setRevision((value) => value + 1);

    useEffect(() => {
        const controller = new AbortController();
        lifetime.current = controller;
        const timer = setInterval(() => setToday(moscowToday()), 30000);
        return () => { controller.abort(); clearInterval(timer); };
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setListError('');
        listSubstitutions(page, perPage, controller.signal).then(({ data }) => {
            if (controller.signal.aborted) return;
            if (page > Math.max(1, data.meta.last_page)) {
                setPage(Math.max(1, data.meta.last_page));
                return;
            }
            setRows(data.data);
            setMeta(data.meta);
            if (data.meta.can_manage !== true) { setOpen(false); setRevokeTarget(null); }
        }).catch((error) => {
            if (controller.signal.aborted) return;
            setRows([]);
            setMeta({});
            setOpen(false);
            setRevokeTarget(null);
            setListError(errorMessage(error));
        }).finally(() => {
            if (!controller.signal.aborted) setLoading(false);
        });
        return () => controller.abort();
    }, [page, perPage, revision]);

    useEffect(() => {
        if (!open) return;
        const controller = new AbortController();
        setManagersLoading(true);
        setManagersError('');
        listManagers(controller.signal).then(({ data }) => {
            if (!controller.signal.aborted) setManagers(data.data);
        }).catch((error) => {
            if (!controller.signal.aborted) {
                setManagers([]);
                setManagersError(errorMessage(error));
            }
        }).finally(() => {
            if (!controller.signal.aborted) setManagersLoading(false);
        });
        return () => controller.abort();
    }, [open, managersRevision]);

    const save = async (values) => {
        if (!canManage || mutationPending.current) return;
        mutationPending.current = true;
        setSaving(true);
        setFormError('');
        const signal = lifetime.current.signal;
        try {
            await createSubstitution({
                manager_id: values.manager_id,
                substitute_id: values.substitute_id,
                starts_on: values.starts_on.format('YYYY-MM-DD'),
                ends_on: values.ends_on.format('YYYY-MM-DD'),
            }, signal);
            if (signal.aborted) return;
            setOpen(false);
            notice.success('Замещение назначено');
            setPage(1);
            refresh();
        } catch (error) {
            if (signal.aborted) return;
            const errors = error.response?.data?.errors;
            if (error.response?.status === 422 && errors) {
                const knownFields = ['manager_id', 'substitute_id', 'starts_on', 'ends_on'];
                const fields = Object.entries(errors).map(([key, value]) => ({
                    name: key.replace(/^data\./, ''),
                    errors: (Array.isArray(value) ? value : [value]).map(String),
                }));
                form.setFields(fields.filter((field) => knownFields.includes(field.name)));
                const otherErrors = fields.filter((field) => !knownFields.includes(field.name))
                    .flatMap((field) => field.errors);
                setFormError(otherErrors.join(' ') || errorMessage(error));
            } else setFormError(errorMessage(error));
            if (error.response?.status === 403) setMeta((value) => ({ ...value, can_manage: false }));
        } finally {
            mutationPending.current = false;
            if (!signal.aborted) setSaving(false);
        }
    };

    const revoke = async () => {
        if (!canManage || !revokeTarget || mutationPending.current) return;
        mutationPending.current = true;
        setRevoking(true);
        setRevokeError('');
        const signal = lifetime.current.signal;
        try {
            await revokeSubstitution(revokeTarget.id, signal);
            if (signal.aborted) return;
            setRevokeTarget(null);
            notice.success('Замещение отключено');
            refresh();
        } catch (error) {
            if (signal.aborted) return;
            setRevokeError(errorMessage(error));
            if (error.response?.status === 403) setMeta((value) => ({ ...value, can_manage: false }));
        } finally {
            mutationPending.current = false;
            if (!signal.aborted) setRevoking(false);
        }
    };

    const columns = [
        { title: 'Кого заменяют', key: 'manager', render: (_, row) => fullName(row.manager) },
        { title: 'Кто заменяет', key: 'substitute', render: (_, row) => fullName(row.substitute) },
        { title: 'Период', key: 'period', render: (_, row) =>
            <span style={{ whiteSpace: 'nowrap' }}>{formatDate(row.starts_on)} — {formatDate(row.ends_on)}</span> },
        { title: 'Статус', key: 'status', render: (_, row) => {
            const status = substitutionStatus(row, today);
            return <Tag color={status.color}>{status.label}</Tag>;
        } },
        ...(canManage ? [{
            title: 'Действия', key: 'actions', render: (_, row) =>
                ['active', 'scheduled'].includes(substitutionStatus(row, today).key) ? (
                    <Button danger size="small" disabled={loading || saving || revoking} onClick={() => {
                        setRevokeError(''); setRevokeTarget(row);
                    }}>Отключить</Button>
                ) : '—',
        }] : []),
    ];
    const options = managers.map((person) => ({ value: person.id, label: fullName(person) }));
    const manager = managers.find((person) => person.id === managerId);
    const substitute = managers.find((person) => person.id === substituteId);

    return (
        <main className="manager-substitutions">
            {noticeContext}
            <div className="manager-substitutions-header">
                <div>
                    <Typography.Title level={3} style={{ margin: 0 }}>Замещения менеджеров</Typography.Title>
                    <Typography.Text type="secondary">{companyName} · Обе даты периода включительно</Typography.Text>
                </div>
                <Space wrap>
                    <Button icon={<ReloadOutlined />} onClick={refresh} disabled={loading || saving || revoking}>Обновить</Button>
                    {canManage && <Button type="primary" icon={<PlusOutlined />} disabled={loading} onClick={() => {
                        form.resetFields();
                        form.setFieldsValue({ starts_on: dayjs(moscowToday()) });
                        setManagersLoading(true); setFormError(''); setOpen(true);
                    }}>Назначить замещение</Button>}
                </Space>
            </div>
            {!loading && !listError && !canManage &&
                <Alert type="info" showIcon message="Мои замещения" description="Здесь показаны ваши замещения. Управление доступно руководителю." />}
            {listError && <Alert type="error" showIcon message={listError}
                action={<Button onClick={refresh}>Повторить</Button>} />}
            <Table rowKey="id" columns={columns} dataSource={rows} loading={loading} scroll={{ x: 800 }}
                locale={{ emptyText: listError ? 'Список недоступен' : 'Замещений пока нет' }}
                pagination={{
                    current: page, pageSize: perPage, total: meta.total || 0, showSizeChanger: true,
                    pageSizeOptions: [10, 20, 50], showTotal: (total) => `Всего: ${total}`,
                    onChange: (nextPage, nextSize) => {
                        setPage(nextSize === perPage ? nextPage : 1); setPerPage(nextSize);
                    },
                }} />
            <Modal title="Назначить замещение" open={open} okText="Назначить" cancelText="Отмена"
                onOk={() => form.submit()} onCancel={() => !saving && setOpen(false)} confirmLoading={saving}
                closable={!saving} maskClosable={!saving} keyboard={!saving}
                cancelButtonProps={{ disabled: saving }}
                okButtonProps={{ disabled: !canManage || managersLoading || !!managersError }}>
                <Spin spinning={managersLoading} tip="Загрузка менеджеров…">
                <Form form={form} layout="vertical" onFinish={save} disabled={saving || managersLoading}>
                    {formError && <Alert type="error" showIcon message={formError} style={{ marginBottom: 16 }} />}
                    {managersError && <Alert type="error" showIcon message={managersError}
                        action={<Button onClick={() => setManagersRevision((value) => value + 1)}>Повторить</Button>} />}
                    <Form.Item name="manager_id" label="Кого заменяют" rules={[{ required: true, message: 'Выберите менеджера' }]}>
                        <Select showSearch optionFilterProp="label" loading={managersLoading} options={options}
                            placeholder="Выберите менеджера" disabled={saving || managersLoading || !!managersError} />
                    </Form.Item>
                    <Form.Item name="substitute_id" label="Кто заменяет" dependencies={['manager_id']}
                        rules={[{ required: true, message: 'Выберите заместителя' }, {
                            validator: (_, value) => value != null && value === form.getFieldValue('manager_id')
                                ? Promise.reject(new Error('Выберите другого сотрудника')) : Promise.resolve(),
                        }]}>
                        <Select showSearch optionFilterProp="label" loading={managersLoading}
                            options={options.filter((item) => item.value !== managerId)}
                            placeholder="Выберите заместителя" disabled={saving || managersLoading || !!managersError} />
                    </Form.Item>
                    <div className="manager-substitutions-dates">
                        <Form.Item name="starts_on" label="Дата начала" rules={[{ required: true, message: 'Укажите дату начала' }]}>
                            <DatePicker locale={ruRU} format="DD.MM.YYYY" style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item name="ends_on" label="Дата окончания" dependencies={['starts_on']}
                            rules={[{ required: true, message: 'Укажите дату окончания' }, {
                                validator: (_, value) => value && startsOn && value.isBefore(startsOn, 'day')
                                    ? Promise.reject(new Error('Окончание не раньше начала')) : Promise.resolve(),
                            }]}>
                            <DatePicker locale={ruRU} format="DD.MM.YYYY" style={{ width: '100%' }}
                                disabledDate={(date) => startsOn && date.isBefore(startsOn, 'day')} />
                        </Form.Item>
                    </div>
                    <Typography.Paragraph type="secondary">
                        {manager && substitute && startsOn && endsOn
                            ? `${fullName(substitute)} будет замещать ${fullName(manager)} с ${formatDate(startsOn)} по ${formatDate(endsOn)} включительно. Компания: ${companyName}.`
                            : 'Обе даты включительно. Для изменения периода отключите старое замещение и создайте новое.'}
                    </Typography.Paragraph>
                </Form>
                </Spin>
            </Modal>
            <Modal title="Отключить замещение?" open={!!revokeTarget} okText="Отключить" cancelText="Отмена"
                okButtonProps={{ danger: true, disabled: !canManage }} confirmLoading={revoking}
                onOk={revoke} onCancel={() => !revoking && setRevokeTarget(null)}
                closable={!revoking} maskClosable={!revoking} keyboard={!revoking}
                cancelButtonProps={{ disabled: revoking }}>
                {revokeError && <Alert type="error" showIcon message={revokeError} />}
                <p>{fullName(revokeTarget?.manager)} → {fullName(revokeTarget?.substitute)}</p>
                <p>Доступ по этому назначению прекратится сразу. Запись останется в истории.</p>
            </Modal>
        </main>
    );
}
