import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Card, Form, Input, Button, Space, message, Row, Col, Spin, Rate,
} from 'antd';
import {
    SaveOutlined, ArrowLeftOutlined, UserOutlined, CarOutlined,
    PictureOutlined,
} from '@ant-design/icons';
import {
    adminFetchReviewRaw, adminCreateReview, adminUpdateReview,
} from '../../services/adminApi';
import { invalidateReviewsCache } from '../../services/mockApi';
import ImageUploader from '../../components/ImageUploader';

const { TextArea } = Input;

const EMPTY_VALUES = {
    name: '',
    avatar: '',
    rating: 5,
    text: '',
    car: '',
};

export default function AdminReviewForm() {
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
        adminFetchReviewRaw(id)
            .then((data) => {
                form.setFieldsValue({ ...EMPTY_VALUES, ...data });
            })
            .catch((e) => {
                message.error('Не удалось загрузить отзыв: ' + e.message);
                navigate('/admin/reviews');
            })
            .finally(() => setLoading(false));
    }, [id, isEdit, form, navigate]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload = { ...values };
            delete payload.id;

            setSubmitting(true);

            if (isEdit) {
                await adminUpdateReview(id, payload);
                message.success('Отзыв обновлён');
            } else {
                await adminCreateReview(payload);
                message.success('Отзыв добавлен');
            }

            invalidateReviewsCache();
            navigate('/admin/reviews');
        } catch (e) {
            if (e?.errorFields) return;
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

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
                <div className="flex items-center gap-4">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/admin/reviews')}
                    >
                        Назад
                    </Button>
                    <h1 className="text-2xl font-bold text-slate-800 m-0">
                        {isEdit ? `Редактирование отзыва #${id}` : 'Новый отзыв'}
                    </h1>
                </div>

                <Space>
                    <Button onClick={() => navigate('/admin/reviews')}>Отмена</Button>
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
                <Card>
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="name"
                                label={
                                    <span className="flex items-center gap-2">
                                        <UserOutlined /> Имя клиента
                                    </span>
                                }
                                rules={[{ required: true, message: 'Введите имя' }]}
                            >
                                <Input size="large" placeholder="Александр Смирнов" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                name="car"
                                label={
                                    <span className="flex items-center gap-2">
                                        <CarOutlined /> Купленный автомобиль
                                    </span>
                                }
                                rules={[{ required: true, message: 'Укажите авто' }]}
                            >
                                <Input size="large" placeholder="Zeekr 001" />
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item
                                name="avatar"
                                label={
                                    <span className="flex items-center gap-2">
                                        <PictureOutlined /> Аватар (опционально)
                                    </span>
                                }
                                tooltip="Если не загрузить — на сайте покажем стандартную иконку пользователя"
                            >
                                <ImageUploader
                                    hint="Рекомендуем квадратное изображение от 200×200"
                                    accept="image/jpeg,image/png,image/webp"
                                />
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item
                                name="rating"
                                label="Рейтинг"
                                rules={[{ required: true, message: 'Поставьте оценку' }]}
                            >
                                <Rate className="text-2xl text-amber-400" />
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item
                                name="text"
                                label="Текст отзыва"
                                rules={[
                                    { required: true, message: 'Введите текст' },
                                    { min: 10, message: 'Слишком коротко, минимум 10 символов' },
                                ]}
                            >
                                <TextArea
                                    rows={6}
                                    maxLength={1000}
                                    showCount
                                    placeholder="Заказывал Zeekr 001. Ребята взяли на себя всю логистику и таможню..."
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                <div className="flex justify-end gap-3 mt-6">
                    <Button onClick={() => navigate('/admin/reviews')}>Отмена</Button>
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