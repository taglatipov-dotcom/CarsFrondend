import { useEffect, useMemo, useState } from 'react';
import {
    Table, Button, Input, Popconfirm, message, Tag, Image, Space, Card,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined,
} from '@ant-design/icons';
import { adminFetchBlogsList, adminDeleteBlog } from '../../services/AdminApi.js';
import { invalidateBlogsCache } from '../../services/MockApi.js';

export default function AdminBlogs() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    const load = async () => {
        setLoading(true);
        try {
            const data = await adminFetchBlogsList();
            setBlogs(Array.isArray(data) ? data : []);
        } catch (e) {
            message.error('Не удалось загрузить список статей: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleDelete = async (id) => {
        try {
            await adminDeleteBlog(id);
            invalidateBlogsCache();
            message.success(`Статья #${id} удалена`);
            setBlogs((prev) => prev.filter((b) => b.id !== id));
        } catch (e) {
            message.error('Ошибка удаления: ' + e.message);
        }
    };

    const filtered = useMemo(() => {
        if (!search.trim()) return blogs;
        const q = search.toLowerCase();
        return blogs.filter(
            (b) =>
                String(b.id).includes(q) ||
                (b.title || '').toLowerCase().includes(q) ||
                (b.slug || '').toLowerCase().includes(q) ||
                (b.tag || '').toLowerCase().includes(q) ||
                (b.author || '').toLowerCase().includes(q),
        );
    }, [blogs, search]);

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            width: 70,
            sorter: (a, b) => a.id - b.id,
            defaultSortOrder: 'ascend',
        },
        {
            title: 'Обложка',
            dataIndex: 'image',
            width: 100,
            render: (url) =>
                url ? (
                    <Image
                        src={url}
                        width={72}
                        height={48}
                        style={{ objectFit: 'cover', borderRadius: 6 }}
                        preview={false}
                        fallback="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI3MiIgaGVpZ2h0PSI0OCI+PHJlY3Qgd2lkdGg9IjcyIiBoZWlnaHQ9IjQ4IiBmaWxsPSIjZTJlOGYwIi8+PC9zdmc+"
                    />
                ) : (
                    <div className="w-[72px] h-[48px] bg-slate-100 rounded" />
                ),
        },
        {
            title: 'Заголовок',
            dataIndex: 'title',
            render: (v, r) => (
                <div>
                    <div className="font-semibold text-slate-800">{v}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                        slug: {r.slug}
                    </div>
                </div>
            ),
        },
        {
            title: 'Тег',
            dataIndex: 'tag',
            width: 130,
            render: (v) => (v ? <Tag color="purple">{v}</Tag> : '—'),
        },
        { title: 'Дата', dataIndex: 'date', width: 140 },
        { title: 'Автор', dataIndex: 'author', width: 180 },
        {
            title: 'Действия',
            width: 160,
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/admin/blog/${record.id}/edit`)}
                    >
                        Изменить
                    </Button>
                    <Popconfirm
                        title="Удалить статью?"
                        description={`#${record.id} ${record.title || ''}`}
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
                    <span className="text-lg font-bold">Статьи блога</span>
                    <Tag color="blue">{blogs.length} шт.</Tag>
                </div>
            }
            extra={
                <Space>
                    <Input
                        placeholder="Поиск по ID / заголовку / slug / тегу"
                        prefix={<SearchOutlined />}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        allowClear
                        style={{ width: 320 }}
                    />
                    <Button icon={<ReloadOutlined />} onClick={load}>
                        Обновить
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/admin/blog/new')}
                    >
                        Добавить статью
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