import { useState } from 'react';
import { Modal, Form, Input, Rate, Button, message } from 'antd';
import {
    UserOutlined, CarOutlined, CheckCircleFilled,
} from '@ant-design/icons';
import { submitReview } from '../services/mockApi';

const { TextArea } = Input;

export default function ReviewSubmitModal({ open, onClose }) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            await submitReview(values);
            setSuccess(true);
            form.resetFields();
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 3200);
        } catch (e) {
            message.error('Не удалось отправить отзыв: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (loading) return;
        form.resetFields();
        setSuccess(false);
        onClose();
    };

    return (
        <Modal
            open={open}
            onCancel={handleClose}
            footer={null}
            width={600}
            centered
            className="review-submit-modal"
            closeIcon={
                <span className="!text-slate-500 hover:!text-slate-800 transition-colors text-xl">
                    ✕
                </span>
            }
            styles={{
                content: { padding: 0, borderRadius: '24px', overflow: 'hidden', position: 'relative' },
                body: { padding: 0 },
                close: { insetInlineEnd: 20, insetBlockStart: 20, zIndex: 10 },
            }}
        >
            {success ? (
                <div className="p-10 text-center">
                    <CheckCircleFilled className="text-7xl text-emerald-500 mb-5" />
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">
                        Спасибо за отзыв!
                    </h3>
                    <p className="text-slate-500 m-0 text-base">
                        Он появится на сайте после проверки модератором
                    </p>
                </div>
            ) : (
                <>
                    <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-6 pr-16">
                        <h3 className="text-xl font-bold text-white m-0">Оставить отзыв</h3>
                        <p className="text-white/90 text-base mt-1 mb-0">
                            Поделитесь опытом — мы будем благодарны
                        </p>
                    </div>

                    <div className="p-6 md:p-8">
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSubmit}
                            requiredMark={false}
                            initialValues={{ rating: 5 }}
                        >
                            <Form.Item
                                name="name"
                                label={<span className="font-semibold text-slate-700 text-base">Ваше имя *</span>}
                                rules={[
                                    { required: true, message: 'Введите имя' },
                                    { min: 2, message: 'Минимум 2 символа' },
                                ]}
                            >
                                <Input
                                    size="large"
                                    prefix={<UserOutlined className="text-slate-400" />}
                                    placeholder="Александр"
                                    className="!rounded-xl"
                                />
                            </Form.Item>

                            <Form.Item
                                name="car"
                                label={<span className="font-semibold text-slate-700 text-base">Какой автомобиль купили? *</span>}
                                rules={[
                                    { required: true, message: 'Укажите автомобиль' },
                                    { min: 2, message: 'Минимум 2 символа' },
                                ]}
                            >
                                <Input
                                    size="large"
                                    prefix={<CarOutlined className="text-slate-400" />}
                                    placeholder="Zeekr 001"
                                    className="!rounded-xl"
                                />
                            </Form.Item>

                            <Form.Item
                                name="rating"
                                label={<span className="font-semibold text-slate-700 text-base">Оценка *</span>}
                                rules={[{ required: true, message: 'Поставьте оценку' }]}
                            >
                                <Rate className="text-3xl text-amber-400" />
                            </Form.Item>

                            <Form.Item
                                name="text"
                                label={<span className="font-semibold text-slate-700 text-base">Отзыв *</span>}
                                rules={[
                                    { required: true, message: 'Напишите отзыв' },
                                    { min: 10, message: 'Минимум 10 символов' },
                                ]}
                            >
                                <TextArea
                                    rows={5}
                                    maxLength={1000}
                                    showCount
                                    placeholder="Расскажите о вашем опыте покупки..."
                                    className="!rounded-xl !text-base"
                                />
                            </Form.Item>

                            <Form.Item className="!mb-0">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    size="large"
                                    loading={loading}
                                    block
                                    className="!h-12 !rounded-xl !font-semibold !text-base !bg-gradient-to-r !from-violet-600 !to-fuchsia-600 !border-none hover:!from-violet-500 hover:!to-fuchsia-500 shadow-lg shadow-fuchsia-500/30"
                                >
                                    Отправить на модерацию
                                </Button>
                            </Form.Item>

                            <p className="text-xs text-slate-400 text-center mt-3 mb-0">
                                Отзыв появится на сайте после проверки модератором
                            </p>
                        </Form>
                    </div>
                </>
            )}
        </Modal>
    );
}