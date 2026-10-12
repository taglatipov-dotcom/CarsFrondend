import { useEffect, useMemo, useState } from 'react';
import {
    Table, Button, Input, Popconfirm, message, Tag, Image, Space, Card, Spin,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined,
} from '@ant-design/icons';
import {
    adminFetchCarsList, adminDeleteCar,
} from '../../services/AdminApi.js';
import { invalidateCarsCache } from '../../services/MockApi.js';

export default function AdminCars() {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    const load = async () => {
        setLoading(true);
        try {
            const data = await adminFetchCarsList();
            setCars(Array.isArray(data) ? data : []);
        } catch (e) {
            message.error('Не удалось загрузить список: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleDelete = async (id) => {
        try {
            await adminDeleteCar(id);
            invalidateCarsCache();
            message.success(`Автомобиль #${id} удалён`);
            setCars((prev) => prev.filter((c) => c.id !== id));
        } catch (e) {
            message.error('Ошибка удаления: ' + e.message);
        }
    };

    const filtered = useMemo(() => {
        if (!search.trim()) return cars;
        const q = search.toLowerCase();
        return cars.filter(
            (c) =>
                String(c.id).includes(q) ||
                (c.brend || '').toLowerCase().includes(q) ||
                (c.model || '').toLowerCase().includes(q) ||
                (c.car_name || '').toLowerCase().includes(q)
        );
    }, [cars, search]);

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            width: 70,
            sorter: (a, b) => a.id - b.id,
            defaultSortOrder: 'ascend',
        },
        {
            title: 'Фото',
            dataIndex: 'images',
            width: 80,
            render: (images, record) => {
                const url = (images && images[0]) || (record.photos && record.photos[0]);
                return url ? (
                    <Image
                        src={url}
                        width={56}
                        height={40}
                        style={{ objectFit: 'cover', borderRadius: 6 }}
                        preview={false}
                        fallback="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1NiIgaGVpZ2h0PSI0MCI+PHJlY3Qgd2lkdGg9IjU2IiBoZWlnaHQ9IjQwIiBmaWxsPSIjZTJlOGYwIi8+PC9zdmc+"
                    />
                ) : (
                    <div className="w-14 h-10 bg-slate-100 rounded" />
                );
            },
        },
        {
            title: 'Марка',
            dataIndex: 'brend',
            render: (v) => <span className="font-semibold">{v || '—'}</span>,
        },
        { title: 'Модель', dataIndex: 'model' },
        { title: 'Год', dataIndex: 'year', width: 80 },
        {
            title: 'Цена в Китае',
            dataIndex: 'china_price',
            width: 150,
            render: (v) =>
                v ? `${Number(v).toLocaleString('ru-RU')} ¥` : <span className="text-slate-400">—</span>,
        },
        {
            title: 'Популярность',
            dataIndex: 'popularity_rank',
            width: 120,
            render: (v) =>
                v ? <Tag color="purple">#{v}</Tag> : <span className="text-slate-400">—</span>,
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
                        onClick={() => navigate(`/admin/cars/${record.id}/edit`)}
                    >
                        Изменить
                    </Button>
                    <Popconfirm
                        title="Удалить автомобиль?"
                        description={`#${record.id} ${record.brend || ''} ${record.model || ''}`}
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
        <Card
            title={
                <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-lg font-bold">Автомобили</span>
                    <Tag color="blue">{cars.length} шт.</Tag>
                </div>
            }
            extra={
                <Space>
                    <Input
                        placeholder="Поиск по ID / марке / модели"
                        prefix={<SearchOutlined />}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        allowClear
                        style={{ width: 280 }}
                    />
                    <Button icon={<ReloadOutlined />} onClick={load}>
                        Обновить
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/Admin/cars/new')}
                    >
                        Добавить
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
                scroll={{ x: 1000 }}
            />
        </Card>
    );
}