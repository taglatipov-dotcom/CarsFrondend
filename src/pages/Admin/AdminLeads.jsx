import { useEffect, useMemo, useState, useCallback } from 'react';
import {
    Table, Button, Input, Popconfirm, message, Tag, Space, Card, Select,
    Modal, Descriptions, Form, Rate,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import {
    SearchOutlined, ReloadOutlined, DeleteOutlined, EyeOutlined,
    CheckOutlined, CloseOutlined, InboxOutlined,
} from '@ant-design/icons';
import {
    adminFetchLeadsList,
    adminUpdateLead,
    adminDeleteLead,
    LEAD_STATUSES,
    getLeadStatusMeta,
} from '../../services/AdminApi.js';

const { TextArea } = Input;

export default function AdminLeads() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selected, setSelected] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminFetchLeadsList();
            setLeads(Array.isArray(data) ? data : []);
        } catch (e) {
            message.error('Не удалось загрузить заявки: ' + e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleDelete = async (id) => {
        try {
            await adminDeleteLead(id);
            message.success(`Заявка #${id} удалена`);
            setLeads((prev) => prev.filter((l) => l.id !== id));
        } catch (e) {
            message.error('Ошибка удаления: ' + e.message);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            const updated = await adminUpdateLead(id, { status });
            setLeads((prev) => prev.map((l) => (l.id === id ? updated : l)));
            if (selected && selected.id === id) setSelected(updated);
            message.success('Статус обновлён');
        } catch (e) {
            message.error('Ошибка обновления: ' + e.message);
        }
    };

    const filtered = useMemo(() => {
        let result = leads;
        if (statusFilter !== 'all') {
            result = result.filter((l) => l.status === statusFilter);
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (l) =>
                    String(l.id).includes(q) ||
                    (l.phone || '').toLowerCase().includes(q) ||
                    (l.preferences || '').toLowerCase().includes(q) ||
                    (l.contact_method || '').toLowerCase().includes(q),
            );
        }
        return result;
    }, [leads, search, statusFilter]);

    const counts = useMemo(() => {
        return leads.reduce(
            (acc, l) => {
                acc[l.status] = (acc[l.status] || 0) + 1;
                return acc;
            },
            { new: 0, in_progress: 0, done: 0, cancelled: 0 },
        );
    }, [leads]);

    const fmtDate = (iso) => {
        if (!iso) return '—';
        try {
            return new Date(iso).toLocaleString('ru-RU', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
            });
        } catch { return iso; }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            width: 70,
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: 'Дата',
            dataIndex: 'created_at',
            width: 160,
            render: fmtDate,
            sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
            defaultSortOrder: 'descend',
        },
        {
            title: 'Телефон',
            dataIndex: 'phone',
            width: 190,
            render: (v) => <span className="font-semibold">{v || '—'}</span>,
        },
        {
            title: 'Способ связи',
            dataIndex: 'contact_method',
            width: 140,
            render: (v) => v || <span className="text-slate-400">—</span>,
        },
        {
            title: 'Предпочтения',
            dataIndex: 'preferences',
            render: (v) => (
                <div className="text-slate-600 line-clamp-2 max-w-md">
                    {v || '—'}
                </div>
            ),
        },
        {
            title: 'Бюджет',
            dataIndex: 'budget',
            width: 110,
            render: (v) => v ? <Tag>{v}</Tag> : <span className="text-slate-400">—</span>,
        },
        {
            title: 'Статус',
            dataIndex: 'status',
            width: 170,
            render: (v, record) => {
                const meta = getLeadStatusMeta(v);
                return (
                    <Select
                        size="small"
                        value={v}
                        onChange={(val) => updateStatus(record.id, val)}
                        style={{ width: 140 }}
                        options={LEAD_STATUSES.map((s) => ({
                            value: s.value,
                            label: (
                                <Tag color={s.color} style={{ margin: 0 }}>
                                    {s.label}
                                </Tag>
                            ),
                        }))}
                    />
                );
            },
        },
        {
            title: 'Действия',
            width: 130,
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => setSelected(record)}
                    />
                    <Popconfirm
                        title="Удалить заявку?"
                        description={`#${record.id} — ${record.phone}`}
                        okText="Удалить"
                        cancelText="Отмена"
                        okButtonProps={{ danger: true }}
                        onConfirm={() => handleDelete(record.id)}
                    >
                        <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <>
            <Card
                title={
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-lg font-bold">
                            <InboxOutlined className="mr-2 text-violet-500" />
                            Заявки
                        </span>
                        <Tag color="blue">Всего: {leads.length}</Tag>
                        {counts.new > 0 && <Tag color="blue">Новые: {counts.new}</Tag>}
                        {counts.in_progress > 0 && <Tag color="orange">В работе: {counts.in_progress}</Tag>}
                        {counts.done > 0 && <Tag color="green">Готово: {counts.done}</Tag>}
                    </div>
                }
                extra={
                    <Space>
                        <Select
                            value={statusFilter}
                            onChange={setStatusFilter}
                            style={{ width: 160 }}
                            options={[
                                { value: 'all', label: 'Все статусы' },
                                ...LEAD_STATUSES.map((s) => ({ value: s.value, label: s.label })),
                            ]}
                        />
                        <Input
                            placeholder="Поиск по ID / телефону / тексту"
                            prefix={<SearchOutlined />}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            allowClear
                            style={{ width: 300 }}
                        />
                        <Button icon={<ReloadOutlined />} onClick={load}>
                            Обновить
                        </Button>
                    </Space>
                }
                styles={{ body: { padding: 0 } }}
            >
                <Table
                    rowKey="id"
                    loading={loading}
                    columns={columns}
                    dataSource={filtered}
                    pagination={{ pageSize: 20, showSizeChanger: false }}
                    scroll={{ x: 1300 }}
                />
            </Card>

            <LeadDetailsModal
                lead={selected}
                onClose={() => setSelected(null)}
                onUpdate={(updated) => {
                    setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
                    setSelected(updated);
                }}
            />
        </>
    );
}

/* ============ МОДАЛКА ПРОСМОТРА / РЕДАКТИРОВАНИЯ ============ */

function LeadDetailsModal({ lead, onClose, onUpdate }) {
    const [form] = Form.useForm();
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (lead) {
            form.setFieldsValue({
                status: lead.status,
                comment: lead.comment || '',
            });
        }
    }, [lead, form]);

    if (!lead) return null;

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);
            const updated = await adminUpdateLead(lead.id, values);
            message.success('Заявка обновлена');
            onUpdate(updated);
        } catch (e) {
            if (e?.errorFields) return;
            message.error('Ошибка сохранения: ' + e.message);
        } finally {
            setSaving(false);
        }
    };

    const fmtDate = (iso) => {
        if (!iso) return '—';
        try {
            return new Date(iso).toLocaleString('ru-RU', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
            });
        } catch { return iso; }
    };

    return (
        <Modal
            open={!!lead}
            onCancel={onClose}
            footer={null}
            width={640}
            centered
            title={<span className="text-xl font-bold">Заявка #{lead.id}</span>}
        >
            <Descriptions
                column={1}
                size="small"
                bordered
                className="mb-4"
                labelStyle={{ width: 180, fontWeight: 600, background: '#f8fafc' }}
            >
                <Descriptions.Item label="Дата">{fmtDate(lead.created_at)}</Descriptions.Item>
                <Descriptions.Item label="Телефон">
                    <a href={`tel:${lead.phone}`} className="font-semibold text-violet-600">
                        {lead.phone}
                    </a>
                </Descriptions.Item>
                <Descriptions.Item label="Способ связи">
                    {lead.contact_method || '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Бюджет">
                    {lead.budget || '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Предпочтения">
                    <span className="whitespace-pre-wrap">{lead.preferences || '—'}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Согласие">
                    {lead.consent ? <Tag color="green">Да</Tag> : <Tag color="red">Нет</Tag>}
                </Descriptions.Item>
                <Descriptions.Item label="Рассылка">
                    {lead.newsletter ? <Tag color="green">Да</Tag> : <Tag color="default">Нет</Tag>}
                </Descriptions.Item>
                <Descriptions.Item label="Источник">
                    {lead.source || '—'}
                </Descriptions.Item>
            </Descriptions>

            <Form form={form} layout="vertical">
                <Form.Item
                    name="status"
                    label={<span className="font-semibold">Статус</span>}
                >
                    <Select
                        options={LEAD_STATUSES.map((s) => ({
                            value: s.value,
                            label: <Tag color={s.color} style={{ margin: 0 }}>{s.label}</Tag>,
                        }))}
                    />
                </Form.Item>

                <Form.Item
                    name="comment"
                    label={<span className="font-semibold">Комментарий менеджера</span>}
                >
                    <TextArea
                        rows={4}
                        maxLength={2000}
                        showCount
                        placeholder="Что уже сделано по заявке, договорённости и т.д."
                    />
                </Form.Item>

                <div className="flex justify-end gap-3">
                    <Button onClick={onClose}>Закрыть</Button>
                    <Button
                        type="primary"
                        loading={saving}
                        onClick={handleSave}
                        className="!bg-gradient-to-r !from-violet-600 !to-fuchsia-600 !border-none"
                    >
                        Сохранить
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}