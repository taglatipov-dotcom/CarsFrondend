import { useState, useEffect, useRef } from 'react';
import { Modal, Form, Input, Checkbox, Button, Select, message } from 'antd';
import { PhoneOutlined, CheckCircleFilled, MessageOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { sendLead } from '../services/MockApi.js';

const { TextArea } = Input;

/* ============ КАСТОМНОЕ ПОЛЕ ТЕЛЕФОНА С МАСКОЙ ============ */

// 10 цифр номера без кода страны → «+7 (987) 498-17-37»
function formatPhone(raw) {
    let formatted = '+7';
    if (raw.length > 0) formatted += ` (${raw.slice(0, 3)}`;
    if (raw.length > 3) formatted += `) ${raw.slice(3, 6)}`;
    if (raw.length > 6) formatted += `-${raw.slice(6, 8)}`;
    if (raw.length > 8) formatted += `-${raw.slice(8, 10)}`;
    return formatted;
}

// Любой ввод/вставка → 10 цифр номера без кода страны.
//   «+7 (987) 498-17-37», «89874981737», «+7 +7 987…», «9874981737» → «9874981737»
function phoneDigits(value) {
    const str = String(value || '').trim();
    let digits = str.replace(/\D/g, '');
    // Наш префикс «+7» — служебный, это не цифра номера
    if (str.startsWith('+7')) digits = digits.slice(1);
    // Вставили номер целиком с кодом страны (8… или 7…)
    if (digits.length > 10 && /^[78]/.test(digits)) digits = digits.slice(1);
    return digits.slice(0, 10);
}

function PhoneInput({ value = '', onChange }) {
    // Цифры номера (без +7) — для отображения
    const digits = phoneDigits(value);
    const len = digits.length;

    // Какая цифра показывается в позиции i (или 0 в качестве placeholder)
    const d = (i) => (i < len ? digits[i] : '0');
    // Цвет цифры: введённая — чёрная, placeholder — серая
    const c = (i) => (i < len ? 'text-slate-900' : 'text-slate-400');

    const handleChange = (e) => {
        const next = e.target.value;
        let raw = phoneDigits(next);

        // Баг был здесь: стирание «)» или «-» не меняло цифры, маска тут же
        // возвращала символ — и номер нельзя было стереть дальше.
        // Если строка стала короче, а цифры те же — удаляем последнюю цифру.
        if (next.length < (value || '').length && raw === digits) {
            raw = raw.slice(0, -1);
        }

        onChange(formatPhone(raw));
    };

    // Курсор всегда в конце — пользователь не сможет «застрять» посреди прозрачного текста
    const moveCursorToEnd = (e) => {
        const input = e.target;
        const end = input.value.length;
        setTimeout(() => input.setSelectionRange(end, end), 0);
    };

    return (
        <div className="relative w-full h-11 rounded-xl border border-slate-200 bg-white overflow-hidden focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100 transition-all">
            {/* Иконка телефона */}
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-base">
                <PhoneOutlined />
            </div>

            {/* Слой отображения с цветными цифрами */}
            <div className="absolute inset-0 flex items-center pl-10 pr-3 pointer-events-none text-base leading-none whitespace-pre">
                <span className="text-slate-900">+7 (</span>
                <span className={c(0)}>{d(0)}</span>
                <span className={c(1)}>{d(1)}</span>
                <span className={c(2)}>{d(2)}</span>
                <span className="text-slate-900">) </span>
                <span className={c(3)}>{d(3)}</span>
                <span className={c(4)}>{d(4)}</span>
                <span className={c(5)}>{d(5)}</span>
                <span className="text-slate-900">-</span>
                <span className={c(6)}>{d(6)}</span>
                <span className={c(7)}>{d(7)}</span>
                <span className="text-slate-900">-</span>
                <span className={c(8)}>{d(8)}</span>
                <span className={c(9)}>{d(9)}</span>
            </div>

            {/* Реальный input — прозрачный текст, видимый курсор */}
            <input
                type="tel"
                value={value}
                onChange={handleChange}
                onFocus={moveCursorToEnd}
                onClick={moveCursorToEnd}
                className="absolute inset-0 w-full h-full bg-transparent outline-none border-none text-transparent pl-10 pr-3 text-base"
                style={{ caretColor: '#0f172a' }}
                autoComplete="off"
            />
        </div>
    );
}

export default function LeadModal({
                                      open,
                                      onClose,
                                      title = 'Оставить заявку',
                                      subtitle = 'Заполните форму — менеджер свяжется с вами в течение 15 минут',
                                      successText = 'Мы свяжемся с вами в течение 15 минут',
                                      defaultValues = {}
                                  }) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const consentValue = Form.useWatch('consent', form);
    const isSubmitDisabled = !consentValue;

    useEffect(() => {
        if (open) {
            // Телефон всегда начинается с "+7" (либо из defaultValues, либо пустой)
            const defaultPhone = defaultValues.phone && defaultValues.phone.trim() !== ''
                ? defaultValues.phone
                : '+7';

            form.setFieldsValue({
                consent: false,
                newsletter: false,
                contactMethod: '',
                preferences: '',
                budget: undefined,
                ...defaultValues,
                phone: defaultPhone,
            });
        }
    }, [open]);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            await sendLead(values);
            setSuccess(true);
            form.resetFields();
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 2500);
        } catch (e) {
            message.error('Не удалось отправить заявку. Попробуйте позже.');
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
            width={620}
            centered
            className="lead-modal"
            closeIcon={
                <span className="!text-slate-500 hover:!text-slate-800 transition-colors text-xl">
                    ✕
                </span>
            }
            styles={{
                content: { padding: 0, borderRadius: '24px', overflow: 'hidden', position: 'relative' },
                body: { padding: 0 },
                close: {
                    insetInlineEnd: 20,
                    insetBlockStart: 20,
                    zIndex: 10,
                },
            }}
        >
            {success ? (
                <div className="p-10 text-center">
                    <CheckCircleFilled className="text-7xl text-emerald-500 mb-5" />
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">
                        Заявка отправлена!
                    </h3>
                    <p className="text-slate-500 m-0 text-base">{successText}</p>
                </div>
            ) : (
                <>
                    <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-6 pr-16">
                        <h3 className="text-xl font-bold text-white m-0">{title}</h3>
                        <p className="text-white/90 text-base mt-1 mb-0">{subtitle}</p>
                    </div>

                    <div className="p-6 md:p-8">
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSubmit}
                            requiredMark={false}
                            initialValues={{ consent: false, newsletter: false }}
                        >
                            <Form.Item
                                name="phone"
                                label={<span className="font-semibold text-slate-700 text-base">Телефон *</span>}
                                rules={[
                                    { required: true, message: 'Введите номер телефона' },
                                    {
                                        validator: (_, value) => {
                                            if (phoneDigits(value).length === 10) return Promise.resolve();
                                            return Promise.reject(new Error('Введите номер полностью'));
                                        }
                                    }
                                ]}
                            >
                                <PhoneInput />
                            </Form.Item>

                            <Form.Item
                                name="contactMethod"
                                label={<span className="font-semibold text-slate-700 text-base">Предпочтительный способ связи</span>}
                            >
                                <Input
                                    size="large"
                                    prefix={<MessageOutlined className="text-slate-400" />}
                                    placeholder="Например: Max, ВК, звонок..."
                                    className="!rounded-xl !text-base"
                                />
                            </Form.Item>

                            <Form.Item
                                name="preferences"
                                label={<span className="font-semibold text-slate-700 text-base">Предпочтения по автомобилю</span>}
                            >
                                <TextArea
                                    rows={3}
                                    placeholder="Например: Zeekr 001, 2024 г., полный привод, цвет — белый..."
                                    className="!rounded-xl !text-base"
                                    maxLength={500}
                                    showCount
                                />
                            </Form.Item>

                            <Form.Item
                                name="budget"
                                label={<span className="font-semibold text-slate-700 text-base">Бюджет (необязательно)</span>}
                            >
                                <Select
                                    size="large"
                                    placeholder="Выберите диапазон"
                                    className="!rounded-xl w-full [&_.ant-select-selector]:!text-base [&_.ant-select-selector]:!rounded-xl"
                                    allowClear
                                    options={[
                                        { value: '1.5-2', label: '1.5 – 2 млн ₽' },
                                        { value: '2-3', label: '2 – 3 млн ₽' },
                                        { value: '3-4', label: '3 – 4 млн ₽' },
                                        { value: '4+', label: '4 млн ₽ и более' },
                                    ]}
                                />
                            </Form.Item>

                            <div className="flex flex-col gap-3 mb-5 p-4 rounded-2xl bg-slate-50 border border-slate-100">

                                <Form.Item
                                    name="consent"
                                    valuePropName="checked"
                                    className="!mb-0"
                                    rules={[
                                        {
                                            validator: (_, value) =>
                                                value
                                                    ? Promise.resolve()
                                                    : Promise.reject(new Error('Необходимо согласие на обработку данных'))
                                        }
                                    ]}
                                >
                                    <Checkbox className="!items-start [&>span:last-child]:!pl-2">
                                        <span className="text-base text-slate-700 leading-snug">
                                            Я даю{' '}
                                            <Link
                                                to="/privacy"
                                                target="_blank"
                                                className="!text-violet-600 hover:!text-fuchsia-600 font-semibold underline"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                согласие на обработку персональных данных
                                            </Link>
                                            {' '}*
                                        </span>
                                    </Checkbox>
                                </Form.Item>

                                <Form.Item
                                    name="newsletter"
                                    valuePropName="checked"
                                    className="!mb-0"
                                >
                                    <Checkbox className="!items-start [&>span:last-child]:!pl-2">
                                        <span className="text-base text-slate-700 leading-snug">
                                            Я согласен получать информационные рассылки о новых поступлениях и акциях
                                        </span>
                                    </Checkbox>
                                </Form.Item>
                            </div>

                            <Form.Item className="!mb-0">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    size="large"
                                    loading={loading}
                                    disabled={isSubmitDisabled}
                                    block
                                    className={`!h-12 !rounded-xl !font-semibold !text-base transition-all ${
                                        isSubmitDisabled
                                            ? '!bg-slate-200 !text-slate-400 !border-none !shadow-none cursor-not-allowed'
                                            : '!bg-gradient-to-r !from-violet-600 !to-fuchsia-600 !border-none hover:!from-violet-500 hover:!to-fuchsia-500 shadow-lg shadow-fuchsia-500/30'
                                    }`}
                                >
                                    Отправить заявку
                                </Button>
                            </Form.Item>

                            {isSubmitDisabled && (
                                <p className="text-sm text-slate-500 text-center mt-3 mb-0">
                                    Для отправки заявки отметьте согласие на обработку данных
                                </p>
                            )}
                        </Form>
                    </div>
                </>
            )}
        </Modal>
    );
}