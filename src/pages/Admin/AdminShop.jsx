import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Table, Button, Input, InputNumber, Switch, Select, Modal, Form, Space, Tag,
    Popconfirm, message, Card, Image,
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, MinusCircleOutlined,
} from '@ant-design/icons';
import ImageUploader from '../../components/ImageUploader';
import MultiImageUploader from '../../components/MultiImageUploader';
import {
    adminShopList, adminShopCreate, adminShopUpdate, adminShopDelete,
    invalidateShopCache, presetPrice, parseColor, rub,
} from '../../services/ShopApi.js';
import { toThumbUrl } from '../../services/urls.js';

/*
 * Общий раздел админки для коллекций магазина: товары бокса, готовые боксы, сумки.
 * Поля формы описаны в CONFIG — новую колонку/поле добавлять туда (и в схему src/shop_router.py).
 */

const BOX_CATEGORIES = ['Фрукты', 'Сладости', 'Орехи и сухофрукты', 'Чай и кофе', 'Для дома', 'Открытки и мелочи', 'Уход'];
const BAG_CATEGORIES = ['Шопер', 'Через плечо', 'Рюкзак', 'Поясная', 'Клатч', 'Дорожная', 'Деловая'];

const CONFIG = {
    box_items: {
        title: 'Товары для бокса',
        hint: 'Из них покупатель собирает бокс на /box. Лимит бокса — 5 кг и 30×30×30 см, поэтому вес и габариты обязательны.',
        defaults: { category: 'Сладости', price: 100, weight_g: 100, w: 10, h: 10, d: 5, active: true, sort: 100 },
    },
    box_presets: {
        title: 'Готовые боксы',
        hint: 'Набор из товаров бокса. Цена считается по составу минус скидка.',
        defaults: { items: [], discount: 5, color: '#C8362B', active: true, sort: 100 },
    },
    bags: {
        title: 'Сумки',
        hint: 'Каталог на /bags. Цвета — в формате «Название:#HEX», например «Чёрный:#151515».',
        defaults: { category: 'Шопер', price: 1990, colors: [], images: [], in_stock: true, active: true, sort: 100 },
    },
};

function Fields({ collection, boxItems }) {
    if (collection === 'box_items') {
        return (
            <>
                <Form.Item name="name" label="Название" rules={[{ required: true }]}><Input /></Form.Item>
                <Space wrap>
                    <Form.Item name="category" label="Категория" rules={[{ required: true }]}>
                        <Select style={{ width: 220 }} options={BOX_CATEGORIES.map((c) => ({ value: c }))} />
                    </Form.Item>
                    <Form.Item name="emoji" label="Значок (если нет фото)"><Input style={{ width: 120 }} maxLength={8} /></Form.Item>
                    <Form.Item name="price" label="Цена, ₽" rules={[{ required: true }]}><InputNumber min={0} /></Form.Item>
                    <Form.Item name="weight_g" label="Вес, г" rules={[{ required: true }]}><InputNumber min={1} max={5000} /></Form.Item>
                </Space>
                <Space wrap>
                    <Form.Item name="w" label="Ширина, см" rules={[{ required: true }]}><InputNumber min={0.1} max={30} step={0.5} /></Form.Item>
                    <Form.Item name="h" label="Высота, см" rules={[{ required: true }]}><InputNumber min={0.1} max={30} step={0.5} /></Form.Item>
                    <Form.Item name="d" label="Глубина, см" rules={[{ required: true }]}><InputNumber min={0.1} max={30} step={0.5} /></Form.Item>
                </Space>
                <Form.Item name="description" label="Описание"><Input.TextArea rows={2} maxLength={500} /></Form.Item>
                <Form.Item name="image" label="Фото"><ImageUploader hint="JPG, PNG, WEBP" /></Form.Item>
            </>
        );
    }
    if (collection === 'box_presets') {
        return (
            <>
                <Form.Item name="name" label="Название" rules={[{ required: true }]}><Input /></Form.Item>
                <Form.Item name="tagline" label="Подзаголовок"><Input maxLength={160} /></Form.Item>
                <Form.Item name="description" label="Описание"><Input.TextArea rows={2} maxLength={1000} /></Form.Item>
                <Space wrap>
                    <Form.Item name="discount" label="Скидка, %"><InputNumber min={0} max={90} /></Form.Item>
                    <Form.Item name="color" label="Цвет карточки"><Input type="color" style={{ width: 80 }} /></Form.Item>
                </Space>
                <Form.Item label="Состав">
                    <Form.List name="items">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name }) => (
                                    <Space key={key} align="baseline" className="flex">
                                        <Form.Item name={[name, 'item_id']} rules={[{ required: true, message: 'Товар' }]}>
                                            <Select
                                                showSearch optionFilterProp="label" style={{ width: 340 }}
                                                options={boxItems.map((i) => ({ value: i.id, label: `${i.emoji || ''} ${i.name} — ${rub(i.price)}` }))}
                                            />
                                        </Form.Item>
                                        <Form.Item name={[name, 'qty']} initialValue={1}><InputNumber min={1} max={50} /></Form.Item>
                                        <MinusCircleOutlined onClick={() => remove(name)} />
                                    </Space>
                                ))}
                                <Button type="dashed" onClick={() => add({ qty: 1 })} icon={<PlusOutlined />}>Добавить товар</Button>
                            </>
                        )}
                    </Form.List>
                </Form.Item>
                <Form.Item name="image" label="Фото (необязательно)"><ImageUploader hint="JPG, PNG, WEBP" /></Form.Item>
            </>
        );
    }
    return (
        <>
            <Form.Item name="name" label="Название" rules={[{ required: true }]}><Input /></Form.Item>
            <Space wrap>
                <Form.Item name="category" label="Категория" rules={[{ required: true }]}>
                    <Select style={{ width: 200 }} options={BAG_CATEGORIES.map((c) => ({ value: c }))} />
                </Form.Item>
                <Form.Item name="price" label="Цена, ₽" rules={[{ required: true }]}><InputNumber min={0} /></Form.Item>
                <Form.Item name="old_price" label="Старая цена, ₽"><InputNumber min={0} /></Form.Item>
                <Form.Item name="in_stock" label="В наличии" valuePropName="checked"><Switch /></Form.Item>
            </Space>
            <Space wrap>
                <Form.Item name="material" label="Материал"><Input style={{ width: 280 }} /></Form.Item>
                <Form.Item name="size" label="Размер"><Input style={{ width: 200 }} placeholder="38 × 30 × 12 см" /></Form.Item>
            </Space>
            <Form.Item name="colors" label="Цвета («Название:#HEX»)">
                <Select mode="tags" tokenSeparators={[',']} placeholder="Чёрный:#151515" />
            </Form.Item>
            <Form.Item name="description" label="Описание"><Input.TextArea rows={3} maxLength={2000} /></Form.Item>
            <Form.Item name="images" label="Фото (первое — главное)"><MultiImageUploader /></Form.Item>
        </>
    );
}

export default function AdminShop({ collection }) {
    const cfg = CONFIG[collection];
    const [rows, setRows] = useState([]);
    const [boxItems, setBoxItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [editing, setEditing] = useState(null); // null — закрыто, {} — новый, {...} — правка
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm();

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminShopList(collection);
            setRows(Array.isArray(data) ? data : []);
            if (collection === 'box_presets') setBoxItems(await adminShopList('box_items'));
        } catch (e) {
            message.error('Не удалось загрузить: ' + e.message);
        } finally {
            setLoading(false);
        }
    }, [collection]);

    useEffect(() => { load(); setSearch(''); }, [load]);

    const itemsById = useMemo(() => Object.fromEntries(boxItems.map((i) => [i.id, i])), [boxItems]);

    const open = (row) => {
        setEditing(row || {});
        form.resetFields();
        form.setFieldsValue(row ? { ...row } : { ...cfg.defaults });
    };

    const save = async () => {
        let values;
        try { values = await form.validateFields(); } catch { return; }
        const data = { ...cfg.defaults, ...editing, ...form.getFieldsValue(true) };
        delete data.id;
        setSaving(true);
        try {
            if (editing.id) await adminShopUpdate(collection, editing.id, data);
            else await adminShopCreate(collection, data);
            invalidateShopCache();
            message.success('Сохранено');
            setEditing(null);
            load();
        } catch (e) {
            message.error('Ошибка сохранения: ' + e.message);
        } finally {
            setSaving(false);
        }
        return values;
    };

    const toggleActive = async (row, active) => {
        try {
            const { id, ...rest } = row;
            await adminShopUpdate(collection, id, { ...rest, active });
            invalidateShopCache();
            setRows((prev) => prev.map((r) => (r.id === id ? { ...r, active } : r)));
        } catch (e) {
            message.error(e.message);
        }
    };

    const remove = async (id) => {
        try {
            await adminShopDelete(collection, id);
            invalidateShopCache();
            message.success('Удалено');
            setRows((prev) => prev.filter((r) => r.id !== id));
        } catch (e) {
            message.error(e.message);
        }
    };

    const filtered = rows.filter((r) =>
        !search.trim() || `${r.name} ${r.category || ''} ${r.tagline || ''}`.toLowerCase().includes(search.toLowerCase()));

    const pic = (r) => {
        const src = r.image || (r.images || [])[0];
        if (src) return <Image src={toThumbUrl(src)} width={48} height={48} style={{ objectFit: 'cover', borderRadius: 6 }} />;
        if (r.emoji) return <span style={{ fontSize: 28 }}>{r.emoji}</span>;
        return <span className="inline-block w-12 h-12 rounded-md" style={{ background: r.color || '#e2e8f0' }} />;
    };

    const columns = [
        { title: '', width: 70, render: (_, r) => pic(r) },
        { title: 'Название', dataIndex: 'name', render: (v, r) => (
            <div><div className="font-semibold">{v}</div>
                <div className="text-xs text-slate-500">{r.category || r.tagline || ''}</div></div>) },
    ];
    if (collection === 'box_items') {
        columns.push(
            { title: 'Цена', dataIndex: 'price', width: 100, render: rub, sorter: (a, b) => a.price - b.price },
            { title: 'Вес', dataIndex: 'weight_g', width: 90, render: (v) => `${v} г`, sorter: (a, b) => a.weight_g - b.weight_g },
            { title: 'Габариты', width: 130, render: (_, r) => `${r.w}×${r.h}×${r.d} см` },
        );
    } else if (collection === 'box_presets') {
        columns.push(
            { title: 'Состав', width: 90, render: (_, r) => `${(r.items || []).reduce((s, l) => s + l.qty, 0)} шт` },
            { title: 'Цена', width: 170, render: (_, r) => {
                const p = presetPrice(r, itemsById);
                return <span>{rub(p.final)} {r.discount ? <Tag color="red">−{r.discount}%</Tag> : null}</span>;
            } },
            { title: 'Вес / объём', width: 150, render: (_, r) => {
                const p = presetPrice(r, itemsById);
                const bad = p.overWeight || p.overVolume;
                return <span className={bad ? 'text-red-600 font-semibold' : ''}>{(p.weight / 1000).toFixed(2)} кг / {Math.round(p.volumePct)}%</span>;
            } },
        );
    } else {
        columns.push(
            { title: 'Цена', dataIndex: 'price', width: 110, render: rub, sorter: (a, b) => a.price - b.price },
            { title: 'Цвета', dataIndex: 'colors', width: 140, render: (cs) => (
                <Space size={4}>{(cs || []).map((c) => { const { name, hex } = parseColor(c);
                    return <span key={c} title={name} className="inline-block w-4 h-4 rounded-full border border-slate-300" style={{ background: hex }} />; })}</Space>) },
            { title: 'Наличие', dataIndex: 'in_stock', width: 100, render: (v) => (v ? <Tag color="green">Есть</Tag> : <Tag>Под заказ</Tag>) },
        );
    }
    columns.push(
        { title: 'Показ', dataIndex: 'active', width: 80, render: (v, r) => <Switch size="small" checked={v !== false} onChange={(c) => toggleActive(r, c)} /> },
        { title: '', width: 100, render: (_, r) => (
            <Space>
                <Button size="small" icon={<EditOutlined />} onClick={() => open(r)} />
                <Popconfirm title="Удалить?" okText="Да" cancelText="Нет" onConfirm={() => remove(r.id)}>
                    <Button size="small" danger icon={<DeleteOutlined />} />
                </Popconfirm>
            </Space>) },
    );

    return (
        <div className="space-y-4">
            <Card>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-bold m-0">{cfg.title}</h2>
                        <p className="text-slate-500 text-sm m-0 mt-1 max-w-2xl">{cfg.hint}</p>
                    </div>
                    <Space>
                        <Input.Search allowClear placeholder="Поиск" value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 220 }} />
                        <Button icon={<ReloadOutlined />} onClick={load} />
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => open(null)}>Добавить</Button>
                    </Space>
                </div>
            </Card>
            <Card bodyStyle={{ padding: 0 }}>
                <Table rowKey="id" loading={loading} dataSource={filtered} columns={columns}
                       pagination={{ pageSize: 50, hideOnSinglePage: true }} scroll={{ x: 800 }} />
            </Card>

            <Modal
                open={editing !== null}
                title={editing?.id ? `Редактирование: ${editing.name}` : `Новая запись — ${cfg.title}`}
                onCancel={() => setEditing(null)}
                onOk={save}
                okText="Сохранить"
                cancelText="Отмена"
                confirmLoading={saving}
                width={760}
                destroyOnHidden
            >
                <Form form={form} layout="vertical" preserve={false}>
                    <Fields collection={collection} boxItems={boxItems} />
                    <Space wrap>
                        <Form.Item name="sort" label="Порядок (меньше — выше)"><InputNumber /></Form.Item>
                        <Form.Item name="active" label="Показывать на сайте" valuePropName="checked"><Switch /></Form.Item>
                    </Space>
                </Form>
            </Modal>
        </div>
    );
}
