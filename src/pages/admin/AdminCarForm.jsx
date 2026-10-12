import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Card, Form, Input, InputNumber, Select, Button, Tabs,
    Checkbox, Space, Switch, message, Row, Col, Divider, Spin,
} from 'antd';
import {
    SaveOutlined, ArrowLeftOutlined, PlusOutlined, DeleteOutlined,
} from '@ant-design/icons';
import {
    CAR_DICTIONARIES,
    adminFetchCarRaw, adminCreateCar, adminUpdateCar,
} from '../../services/adminApi';
import { invalidateCarsCache } from '../../services/mockApi';

const { TextArea } = Input;

const EMPTY_VALUES = {
    popularity_rank: 1,
    brend: '',
    model: '',
    car_name: '',
    country: 'Китай',
    year: new Date().getFullYear(),
    condition: 'новая',
    mileage: 0,
    body_type: 'SUV',
    color: '',
    drive: 'полный',
    location: 'Шанхай',
    china_price: 0,
    description: '',

    engine_type: '',
    engine_volume: null,
    horsepower: null,
    engine_power: null,
    torque: null,

    acceleration: null,
    topSpeed: null,
    range: null,
    battery: null,
    charging: '',
    transmission: 'Автоматическая',
    consumption: null,

    length: null,
    width: null,
    height: null,
    wheelbase: null,
    clearance: null,
    weight: null,
    trunk: null,

    interior_color: '',
    interior_material: '',
    interior_seats: 5,
    interior_display: '',
    interior_audio: '',

    safety_abs: true,
    safety_esp: true,
    safety_ebp: false,
    safety_bas: false,
    safety_airbags: 6,
    safety_blind: false,
    safety_adaptive_cruise: false,
    safety_ext_stop: false,
    safety_line: false,

    features: [],
    images: [],
};

function SectionRow({ children }) {
    return <Row gutter={16}>{children}</Row>;
}

export default function AdminCarForm() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(isEdit);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isEdit) {
            form.setFieldsValue(EMPTY_VALUES);
            return;
        }

        setLoading(true);
        adminFetchCarRaw(id)
            .then((data) => {
                const normalized = {
                    ...EMPTY_VALUES,
                    ...data,
                    features: Array.isArray(data.features) ? data.features : [],
                    images:
                        Array.isArray(data.images) && data.images.length
                            ? data.images
                            : Array.isArray(data.photos)
                                ? data.photos
                                : [],
                };
                form.setFieldsValue(normalized);
            })
            .catch((e) => {
                message.error('Не удалось загрузить автомобиль: ' + e.message);
                navigate('/admin/cars');
            })
            .finally(() => setLoading(false));
    }, [id, isEdit, form, navigate]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            // Убираем возможный id/служебные поля
            const payload = { ...values };
            delete payload.id;

            setSubmitting(true);

            if (isEdit) {
                await adminUpdateCar(id, payload);
                message.success('Автомобиль обновлён');
            } else {
                await adminCreateCar(payload);
                message.success('Автомобиль добавлен');
            }

            invalidateCarsCache();
            navigate('/admin/cars');
        } catch (e) {
            if (e?.errorFields) return; // ошибки валидации — antd сам подсветит
            message.error('Ошибка сохранения: ' + e.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-24">
                <Spin size="large" />
            </div>
        );
    }

    /* ====== Таб 1: Основное ====== */
    const tabMain = (
        <SectionRow>
            <Col xs={24} md={8}>
                <Form.Item
                    name="popularity_rank"
                    label="Популярность (1–10)"
                    tooltip="Чем меньше число — тем выше в списке"
                >
                    <InputNumber min={1} max={10} style={{ width: '100%' }} />
                </Form.Item>
            </Col>

            <Col xs={24} md={8}>
                <Form.Item
                    name="brend"
                    label="Марка"
                    rules={[{ required: true, message: 'Укажите марку' }]}
                >
                    <Select
                        showSearch
                        placeholder="Выберите или введите"
                        options={CAR_DICTIONARIES.brands.map((b) => ({ value: b, label: b }))}
                        filterOption={(input, opt) =>
                            opt.value.toLowerCase().includes(input.toLowerCase())
                        }
                    />
                </Form.Item>
            </Col>

            <Col xs={24} md={8}>
                <Form.Item
                    name="model"
                    label="Модель"
                    rules={[{ required: true, message: 'Укажите модель' }]}
                >
                    <Input placeholder="Например, 001" />
                </Form.Item>
            </Col>

            <Col xs={24} md={8}>
                <Form.Item
                    name="car_name"
                    label="Полное название (опционально)"
                    tooltip="Если пусто — соберётся из марки и модели"
                >
                    <Input placeholder="Zeekr 001" />
                </Form.Item>
            </Col>

            <Col xs={24} md={8}>
                <Form.Item name="country" label="Страна">
                    <Select
                        allowClear
                        placeholder="Выберите страну"
                        options={CAR_DICTIONARIES.countries.map((c) => ({ value: c, label: c }))}
                    />
                </Form.Item>
            </Col>

            <Col xs={12} md={4}>
                <Form.Item name="year" label="Год">
                    <InputNumber min={1990} max={2030} style={{ width: '100%' }} />
                </Form.Item>
            </Col>

            <Col xs={12} md={4}>
                <Form.Item name="condition" label="Состояние">
                    <Select options={CAR_DICTIONARIES.conditions} />
                </Form.Item>
            </Col>

            <Col xs={12} md={6}>
                <Form.Item name="mileage" label="Пробег, км">
                    <InputNumber min={0} step={100} style={{ width: '100%' }} />
                </Form.Item>
            </Col>

            <Col xs={12} md={6}>
                <Form.Item name="body_type" label="Тип кузова">
                    <Select options={CAR_DICTIONARIES.bodyTypes.map((b) => ({ value: b, label: b }))} />
                </Form.Item>
            </Col>

            <Col xs={12} md={6}>
                <Form.Item name="color" label="Цвет">
                    <Select
                        allowClear
                        options={CAR_DICTIONARIES.colors.map((c) => ({ value: c, label: c }))}
                    />
                </Form.Item>
            </Col>

            <Col xs={12} md={6}>
                <Form.Item name="drive" label="Привод">
                    <Select options={CAR_DICTIONARIES.drives} />
                </Form.Item>
            </Col>

            <Col xs={24} md={12}>
                <Form.Item name="location" label="Локация">
                    <Select options={CAR_DICTIONARIES.locations.map((l) => ({ value: l, label: l }))} />
                </Form.Item>
            </Col>

            <Col xs={24} md={12}>
                <Form.Item
                    name="china_price"
                    label="Цена в Китае, ¥"
                    tooltip="До таможни и логистики"
                >
                    <InputNumber
                        min={0}
                        step={10000}
                        style={{ width: '100%' }}
                        formatter={(v) =>
                            v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : ''
                        }
                        parser={(v) => v.replace(/\s/g, '')}
                    />
                </Form.Item>
            </Col>

            <Col span={24}>
                <Form.Item name="description" label="Описание">
                    <TextArea rows={4} maxLength={2000} showCount />
                </Form.Item>
            </Col>
        </SectionRow>
    );

    /* ====== Таб 2: Двигатель и динамика ====== */
    const tabEngine = (
        <SectionRow>
            <Col xs={24} md={12}>
                <Form.Item name="engine_type" label="Тип двигателя">
                    <Select
                        allowClear
                        options={CAR_DICTIONARIES.engineTypes.map((t) => ({ value: t, label: t }))}
                    />
                </Form.Item>
            </Col>

            <Col xs={12} md={6}>
                <Form.Item name="engine_volume" label="Объём, л">
                    <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
                </Form.Item>
            </Col>

            <Col xs={12} md={6}>
                <Form.Item name="horsepower" label="Мощность, л.с.">
                    <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
            </Col>

            <Col xs={12} md={6}>
                <Form.Item name="engine_power" label="Мощность, кВт">
                    <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
                </Form.Item>
            </Col>

            <Col xs={12} md={6}>
                <Form.Item name="torque" label="Крутящий момент, Нм">
                    <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
            </Col>

            <Col xs={12} md={6}>
                <Form.Item name="acceleration" label="Разгон 0–100, сек">
                    <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
                </Form.Item>
            </Col>

            <Col xs={12} md={6}>
                <Form.Item name="topSpeed" label="Макс. скорость, км/ч">
                    <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
            </Col>

            <Col xs={12} md={6}>
                <Form.Item name="range" label="Запас хода, км">
                    <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
            </Col>

            <Col xs={12} md={6}>
                <Form.Item name="battery" label="Батарея, кВт·ч">
                    <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
                </Form.Item>
            </Col>

            <Col xs={24} md={12}>
                <Form.Item name="charging" label="Зарядка">
                    <Input placeholder="800V, 30 мин до 80%" />
                </Form.Item>
            </Col>

            <Col xs={24} md={6}>
                <Form.Item name="transmission" label="Коробка">
                    <Select
                        allowClear
                        options={CAR_DICTIONARIES.transmissions.map((t) => ({ value: t, label: t }))}
                    />
                </Form.Item>
            </Col>

            <Col xs={24} md={6}>
                <Form.Item name="consumption" label="Расход, кВт·ч/100км">
                    <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
                </Form.Item>
            </Col>
        </SectionRow>
    );

    /* ====== Таб 3: Габариты ====== */
    const tabDimensions = (
        <SectionRow>
            {[
                ['length', 'Длина, мм'],
                ['width', 'Ширина, мм'],
                ['height', 'Высота, мм'],
                ['wheelbase', 'Колёсная база, мм'],
                ['clearance', 'Клиренс, мм'],
                ['weight', 'Масса, кг'],
                ['trunk', 'Багажник, л'],
            ].map(([name, label]) => (
                <Col xs={12} md={6} key={name}>
                    <Form.Item name={name} label={label}>
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                </Col>
            ))}
        </SectionRow>
    );

    /* ====== Таб 4: Салон ====== */
    const tabInterior = (
        <SectionRow>
            <Col xs={12} md={8}>
                <Form.Item name="interior_color" label="Цвет салона">
                    <Input placeholder="Черный, бежевый..." />
                </Form.Item>
            </Col>
            <Col xs={12} md={8}>
                <Form.Item name="interior_material" label="Материал">
                    <Input placeholder="Кожа Nappa, эко-кожа..." />
                </Form.Item>
            </Col>
            <Col xs={12} md={8}>
                <Form.Item name="interior_seats" label="Мест">
                    <InputNumber min={1} max={9} style={{ width: '100%' }} />
                </Form.Item>
            </Col>
            <Col xs={24} md={12}>
                <Form.Item name="interior_display" label="Дисплей">
                    <Input placeholder='15.4" центральный сенсорный' />
                </Form.Item>
            </Col>
            <Col xs={24} md={12}>
                <Form.Item name="interior_audio" label="Аудиосистема">
                    <Input placeholder="12 динамиков премиум" />
                </Form.Item>
            </Col>
        </SectionRow>
    );

    /* ====== Таб 5: Безопасность ====== */
    const tabSafety = (
        <>
            <SectionRow>
                <Col xs={12} md={6}>
                    <Form.Item name="safety_airbags" label="Airbags, шт">
                        <InputNumber min={0} max={20} style={{ width: '100%' }} />
                    </Form.Item>
                </Col>
            </SectionRow>

            <Divider className="!my-4" />

            <Row gutter={16}>
                {[
                    ['safety_abs', 'ABS'],
                    ['safety_esp', 'ESP'],
                    ['safety_ebp', 'EBD'],
                    ['safety_bas', 'BAS'],
                    ['safety_blind', 'Контроль слепых зон'],
                    ['safety_adaptive_cruise', 'Адаптивный круиз'],
                    ['safety_ext_stop', 'Экстренное торможение'],
                    ['safety_line', 'Контроль полосы'],
                ].map(([name, label]) => (
                    <Col xs={12} md={6} key={name}>
                        <Form.Item name={name} valuePropName="checked" className="!mb-3">
                            <Checkbox>{label}</Checkbox>
                        </Form.Item>
                    </Col>
                ))}
            </Row>
        </>
    );

    /* ====== Таб 6: Медиа ====== */
    const tabMedia = (
        <>
            <Divider orientation="left">Особенности</Divider>
            <Form.List name="features">
                {(fields, { add, remove }) => (
                    <>
                        {fields.map(({ key, name, ...rest }) => (
                            <Space key={key} align="baseline" className="w-full mb-2">
                                <Form.Item {...rest} name={[name]} className="!mb-0 flex-1">
                                    <Input placeholder="Панорамная крыша, камера 360°..." />
                                </Form.Item>
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => remove(name)}
                                />
                            </Space>
                        ))}
                        <Button
                            type="dashed"
                            block
                            icon={<PlusOutlined />}
                            onClick={() => add('')}
                            className="mb-2"
                        >
                            Добавить особенность
                        </Button>
                    </>
                )}
            </Form.List>

            <Divider orientation="left" className="!mt-8">
                Изображения (URL)
            </Divider>
            <Form.List name="images">
                {(fields, { add, remove }) => (
                    <>
                        {fields.map(({ key, name, ...rest }) => (
                            <div key={key} className="flex gap-3 mb-3 items-start">
                                <Form.Item {...rest} name={[name]} className="!mb-0 flex-1">
                                    <Input placeholder="https://..." />
                                </Form.Item>
                                <Form.Item noStyle shouldUpdate>
                                    {() => {
                                        const url = form.getFieldValue(['images', name]);
                                        return url ? (
                                            <img
                                                src={url}
                                                alt="preview"
                                                className="w-16 h-12 object-cover rounded border border-slate-200"
                                                onError={(e) => (e.currentTarget.style.display = 'none')}
                                                onLoad={(e) => (e.currentTarget.style.display = 'block')}
                                            />
                                        ) : null;
                                    }}
                                </Form.Item>
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => remove(name)}
                                />
                            </div>
                        ))}
                        <Button
                            type="dashed"
                            block
                            icon={<PlusOutlined />}
                            onClick={() => add('')}
                        >
                            Добавить изображение
                        </Button>
                    </>
                )}
            </Form.List>
        </>
    );

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
                <div className="flex items-center gap-4">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/admin/cars')}
                    >
                        Назад
                    </Button>
                    <h1 className="text-2xl font-bold text-slate-800 m-0">
                        {isEdit ? `Редактирование авто #${id}` : 'Новое авто'}
                    </h1>
                </div>

                <Space>
                    <Button onClick={() => navigate('/admin/cars')}>Отмена</Button>
                    <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        loading={submitting}
                        onClick={handleSubmit}
                    >
                        {isEdit ? 'Сохранить' : 'Создать'}
                    </Button>
                </Space>
            </div>

            <Form
                form={form}
                layout="vertical"
                initialValues={EMPTY_VALUES}
                requiredMark="optional"
            >
                <Card styles={{ body: { paddingTop: 8 } }}>
                    <Tabs
                        defaultActiveKey="main"
                        destroyInactiveTabPane={false}
                        items={[
                            { key: 'main', label: 'Основное', children: tabMain },
                            { key: 'engine', label: 'Двигатель и динамика', children: tabEngine },
                            { key: 'dims', label: 'Габариты', children: tabDimensions },
                            { key: 'interior', label: 'Салон', children: tabInterior },
                            { key: 'safety', label: 'Безопасность', children: tabSafety },
                            { key: 'media', label: 'Медиа', children: tabMedia },
                        ]}
                    />
                </Card>

                <div className="flex justify-end gap-3 mt-6">
                    <Button onClick={() => navigate('/admin/cars')}>Отмена</Button>
                    <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        loading={submitting}
                        onClick={handleSubmit}
                    >
                        {isEdit ? 'Сохранить' : 'Создать'}
                    </Button>
                </div>
            </Form>
        </div>
    );
}