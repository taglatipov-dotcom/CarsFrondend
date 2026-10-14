import { useEffect, useMemo, useState, useCallback } from 'react';
import {
    Table, Button, Input, Popconfirm, message, Tag, Avatar, Rate, Space, Card,
    Tabs, Badge, Tooltip,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined,
    UserOutlined, CheckOutlined, CloseOutlined,
} from '@ant-design/icons';
import {
    adminFetchReviewsList,
    adminDeleteReview,
    adminFetchPendingReviews,
    adminApproveReview,
    adminRejectReview,
} from '../../services/AdminApi.js';
import { invalidateReviewsCache } from '../../services/MockApi.js';
import { toImageUrl } from '../../services/urls.js';

export default function AdminReviews() {
    const [reviews, setReviews] = useState([]);
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pendingLoading, setPendingLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('published');
    const navigate = useNavigate();

    const loadPublished = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminFetchReviewsList();
            setReviews(Array.isArray(data) ? data : []);
        } catch (e) {
            message.error('Не удалось загрузить отзывы: ' + e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadPending = useCallback(async () => {
        setPendingLoading(true);
        try {
            const data = await adminFetchPendingReviews();
            setPending(Array.isArray(data) ? data : []);
        } catch (e) {
            message.error('Не удалось загрузить очередь модерации: ' + e.message);
        } finally {
            setPendingLoading(false);
        }
    }, []);

    const loadAll = useCallback(async () => {
        await Promise.all([loadPublished(), loadPending()]);
    }, [loadPublished, loadPending]);

    useEffect(() => {
        loadAll();
    }, [loadAll]);

    /* ============ Действия над опубликованными ============ */

    const handleDelete = async (id) => {
        try {
            await adminDeleteReview(id);
            invalidateReviewsCache();
            message.success(`Отзыв #${id} удалён`);
            setReviews((prev) => prev.filter((r) => r.id !== id));
        } catch (e) {
            message.error('Ошибка удаления: ' + e.message);
        }
    };

    /* ============ Действия модерации ============ */

    const handleApprove = async (id) => {
        try {
            await adminApproveReview(id);
            invalidateReviewsCache();
            message.success(`Отзыв #${id} одобрен и опубликован`);
            // Убираем из очереди
            setPending((prev) => prev.filter((r) => r.id !== id));
            // Перезагружаем опубликованные
            loadPublished();
        } catch (e) {
            message.error('Ошибка одобрения: ' + e.message);
        }
    };

    const handleReject = async (id) => {
        try {
            await adminRejectReview(id);
            message.success(`Отзыв #${id} отклонён`);
            setPending((prev) => prev.filter((r) => r.id !== id));
        } catch (e) {
            message.error('Ошибка отклонения: ' + e.message);
        }
    };

    /* ============ Фильтр по поиску ============ */

    const filtered = useMemo(() => {
        if (!search.trim()) return reviews;
        const q = search.toLowerCase();
        return reviews.filter(
            (r) =>
                String(r.id).includes(q) ||
                (r.name || '').toLowerCase().includes(q) ||
                (r.car || '').toLowerCase().includes(q) ||
                (r.text || '').toLowerCase().includes(q),
        );
    }, [reviews, search]);

    /* ============ Колонки опубликованных ============ */

    const publishedColumns = [
        {
            title: 'ID',
            dataIndex: 'id',
            width: 70,
            sorter: (a, b) => a.id - b.id,
            defaultSortOrder: 'ascend',
        },
        {
            title: 'Аватар',
            dataIndex: 'avatar',
            width: 80,
            render: (url) =>
                url ? (
                    <Avatar size={48} src={toImageUrl(url)} icon={<UserOutlined />} />
                ) : (
                    <Avatar size={48} icon={<UserOutlined />} className="bg-slate-300" />
                ),
        },
        {
            title: 'Клиент',
            dataIndex: 'name',
            width: 180,
            render: (v) => <span className="font-semibold">{v || '—'}</span>,
        },
        {
            title: 'Рейтинг',
            dataIndex: 'rating',
            width: 130,
            render: (v) => <Rate disabled defaultValue={v} className="text-amber-400 text-base" />,
        },
        {
            title: 'Текст отзыва',
            dataIndex: 'text',
            render: (v) => (
                <div className="text-slate-600 line-clamp-2 max-w-md">{v || '—'}</div>
            ),
        },
        {
            title: 'Автомобиль',
            dataIndex: 'car',
            width: 160,
            render: (v) => (v ? <Tag color="purple">{v}</Tag> : <span className="text-slate-400">—</span>),
        },
        {
            title: 'Действия',
            width: 160,
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/admin/reviews/${record.id}/edit`)}
                    >
                        Изменить
                    </Button>
                    <Popconfirm
                        title="Удалить отзыв?"
                        description={`#${record.id} — ${record.name || ''}`}
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

    /* ============ Колонки модерации ============ */

    const pendingColumns = [
        {
            title: 'ID',
            dataIndex: 'id',
            width: 70,
        },
        {
            title: 'Клиент',
            dataIndex: 'name',
            width: 180,
            render: (v) => <span className="font-semibold">{v || '—'}</span>,
        },
        {
            title: 'Рейтинг',
            dataIndex: 'rating',
            width: 130,
            render: (v) => <Rate disabled defaultValue={v} className="text-amber-400 text-base" />,
        },
        {
            title: 'Текст отзыва',
            dataIndex: 'text',
            render: (v) => (
                <div className="text-slate-600 max-w-md">{v || '—'}</div>
            ),
        },
        {
            title: 'Автомобиль',
            dataIndex: 'car',
            width: 160,
            render: (v) => (v ? <Tag color="purple">{v}</Tag> : <span className="text-slate-400">—</span>),
        },
        {
            title: 'Отправлено',
            dataIndex: 'submitted_at',
            width: 180,
            render: (v) => {
                if (!v) return '—';
                try {
                    const d = new Date(v);
                    return d.toLocaleString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    });
                } catch {
                    return v;
                }
            },
        },
        {
            title: 'Действия',
            width: 220,
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Опубликовать на сайте">
                        <Button
                            type="primary"
                            size="small"
                            icon={<CheckOutlined />}
                            onClick={() => handleApprove(record.id)}
                            className="!bg-emerald-500 hover:!bg-emerald-600 !border-none"
                        >
                            Одобрить
                        </Button>
                    </Tooltip>
                    <Popconfirm
                        title="Отклонить отзыв?"
                        description="Отзыв будет удалён из очереди без возможности восстановления"
                        okText="Отклонить"
                        cancelText="Отмена"
                        okButtonProps={{ danger: true }}
                        onConfirm={() => handleReject(record.id)}
                    >
                        <Button size="small" danger icon={<CloseOutlined />}>
                            Отклонить
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const tabItems = [
        {
            key: 'published',
            label: (
                <span className="font-semibold">
                    Опубликованные ({reviews.length})
                </span>
            ),
            children: (
                <Table
                    rowKey="id"
                    loading={loading}
                    columns={publishedColumns}
                    dataSource={filtered}
                    pagination={{ pageSize: 20, showSizeChanger: false }}
                    scroll={{ x: 1100 }}
                />
            ),
        },
        {
            key: 'pending',
            label: (
                <Badge count={pending.length} offset={[8, 0]} size="small">
                    <span className="font-semibold pr-2">На модерации</span>
                </Badge>
            ),
            children: pending.length === 0 && !pendingLoading ? (
                <div className="text-center py-16 text-slate-400">
                    <CheckOutlined className="text-4xl mb-3 text-emerald-400" />
                    <p className="text-base m-0">Очередь пуста — все отзывы обработаны</p>
                </div>
            ) : (
                <Table
                    rowKey="id"
                    loading={pendingLoading}
                    columns={pendingColumns}
                    dataSource={pending}
                    pagination={{ pageSize: 20, showSizeChanger: false }}
                    scroll={{ x: 1100 }}
                />
            ),
        },
    ];

    return (
        <Card
            title={
                <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-lg font-bold">Отзывы клиентов</span>
                    {pending.length > 0 && (
                        <Tag color="orange">
                            {pending.length} ждёт модерации
                        </Tag>
                    )}
                </div>
            }
            extra={
                <Space>
                    <Input
                        placeholder="Поиск по ID / имени / авто / тексту"
                        prefix={<SearchOutlined />}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        allowClear
                        style={{ width: 300 }}
                        disabled={activeTab === 'pending'}
                    />
                    <Button icon={<ReloadOutlined />} onClick={loadAll}>
                        Обновить
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/Admin/reviews/new')}
                    >
                        Добавить отзыв
                    </Button>
                </Space>
            }
            styles={{ body: { padding: 0 } }}
        >
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
                className="px-6 pt-4"
            />
        </Card>
    );
}