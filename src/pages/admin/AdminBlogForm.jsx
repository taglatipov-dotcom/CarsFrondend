import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Card, Form, Input, Button, Space, message, Row, Col, Divider, Spin, Alert,
    Segmented,
} from 'antd';
import {
    SaveOutlined, ArrowLeftOutlined, LinkOutlined, PictureOutlined,
    TagOutlined, UserOutlined, ClockCircleOutlined, CalendarOutlined,
    EyeOutlined, CodeOutlined,
} from '@ant-design/icons';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import {
    adminFetchBlogRaw, adminCreateBlog, adminUpdateBlog,
} from '../../services/adminApi';
import { invalidateBlogsCache } from '../../services/mockApi';
import ImageUploader from '../../components/ImageUploader';

const { TextArea } = Input;

const EMPTY_VALUES = {
    slug: '',
    title: '',
    excerpt: '',
    image: '',
    date: '',
    tag: '',
    author: 'Редакция ILSATAO',
    readTime: '5 мин',
    content: '',
};

/* Простой транслит для автогенерации slug */
const TRANSLIT_MAP = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh',
    з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
    п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts',
    ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

function slugify(str) {
    return (str || '')
        .toLowerCase()
        .split('')
        .map((ch) => TRANSLIT_MAP[ch] ?? ch)
        .join('')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80);
}

/* ============ МОДУЛИ И ФОРМАТЫ QUILL ============ */
const QUILL_MODULES = {
    toolbar: [
        [{ header: [1, 2, 3, 4, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ align: [] }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        ['clean'],
    ],
    clipboard: {
        matchVisual: false,
    },
};

const QUILL_FORMATS = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'indent',
    'align',
    'blockquote', 'code-block',
    'link', 'image',
];

/**
 * Обёртка над Quill + textarea для HTML-режима.
 */
function RichTextEditor({ value = '', onChange }) {
    const [mode, setMode] = useState('visual');

    return (
        <div className="rich-editor">
            <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
                <span className="text-sm text-slate-500">
                    {mode === 'visual'
                        ? 'Пишите как в Word — форматирование сохранится в HTML автоматически.'
                        : 'HTML-код. Полезно для таблиц, класса «lead», iframe и тонкой настройки.'}
                </span>
                <Segmented
                    size="small"
                    value={mode}
                    onChange={setMode}
                    options={[
                        { label: 'Визуально', value: 'visual', icon: <EyeOutlined /> },
                        { label: 'HTML', value: 'html', icon: <CodeOutlined /> },
                    ]}
                />
            </div>

            {mode === 'visual' ? (
                <>
                    <ReactQuill
                        theme="snow"
                        value={value}
                        onChange={onChange}
                        modules={QUILL_MODULES}
                        formats={QUILL_FORMATS}
                        placeholder="Начните печатать статью..."
                    />
                    <p className="text-xs text-slate-400 mt-2 mb-0">
                        Подсказка: в визуальном режиме недоступны таблицы и класс
                        <code className="mx-1 px-1 bg-slate-100 rounded">lead</code>
                        — для них переключитесь в HTML.
                    </p>
                </>
            ) : (
                <TextArea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    rows={22}
                    placeholder='<p class="lead">Вступительный абзац…</p>
<h2>Заголовок раздела</h2>
<p>Текст…</p>'
                    style={{
                        fontFamily:
                            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                        fontSize: 13,
                        lineHeight: 1.6,
                    }}
                />
            )}
        </div>
    );
}

export default function AdminBlogForm() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(isEdit);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isEdit) {
            form.setFieldsValue({
                ...EMPTY_VALUES,
                date: new Date()
                    .toLocaleDateString('ru-RU', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                    })
                    .replace(' г.', ''),
            });
            return;
        }

        setLoading(true);
        adminFetchBlogRaw(id)
            .then((data) => {
                form.setFieldsValue({
                    ...EMPTY_VALUES,
                    ...data,
                    content: data.content || '',
                });
            })
            .catch((e) => {
                message.error('Не удалось загрузить статью: ' + e.message);
                navigate('/admin/blog');
            })
            .finally(() => setLoading(false));
    }, [id, isEdit, form, navigate]);

    const handleGenerateSlug = () => {
        const title = form.getFieldValue('title');
        const slug = slugify(title);
        if (slug) form.setFieldsValue({ slug });
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            const payload = { ...values };
            delete payload.id;

            // Нормализация контента: убираем «пустой» Quill-параграф
            const cleanedContent = (payload.content || '')
                .replace(/<p><br><\/p>/g, '')
                .trim();
            payload.content = cleanedContent;

            setSubmitting(true);

            if (isEdit) {
                await adminUpdateBlog(id, payload);
                message.success('Статья обновлена');
            } else {
                await adminCreateBlog(payload);
                message.success('Статья добавлена');
            }

            invalidateBlogsCache();
            navigate('/admin/blog');
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
        <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
                <div className="flex items-center gap-4">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/admin/blog')}
                    >
                        Назад
                    </Button>
                    <h1 className="text-2xl font-bold text-slate-800 m-0">
                        {isEdit ? `Редактирование статьи #${id}` : 'Новая статья'}
                    </h1>
                </div>

                <Space>
                    <Button onClick={() => navigate('/admin/blog')}>Отмена</Button>
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
                        <Col xs={24} md={16}>
                            <Form.Item
                                name="title"
                                label="Заголовок"
                                rules={[{ required: true, message: 'Введите заголовок' }]}
                            >
                                <Input
                                    size="large"
                                    placeholder="Например: Как растаможить электромобиль из Китая в 2024 году"
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={8}>
                            <Form.Item
                                name="slug"
                                label={
                                    <span className="flex items-center gap-2">
                                        <LinkOutlined /> Slug (URL)
                                        <Button
                                            type="link"
                                            size="small"
                                            onClick={handleGenerateSlug}
                                            className="!p-0 !h-auto text-xs"
                                        >
                                            сгенерировать
                                        </Button>
                                    </span>
                                }
                                rules={[
                                    { required: true, message: 'Укажите slug' },
                                    {
                                        pattern: /^[a-z0-9-]+$/,
                                        message: 'Только a-z, 0-9 и дефисы',
                                    },
                                ]}
                            >
                                <Input size="large" placeholder="rastamozhka-2024" />
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item
                                name="excerpt"
                                label="Краткое описание (для карточки)"
                                rules={[{ required: true, message: 'Введите описание' }]}
                            >
                                <TextArea
                                    rows={2}
                                    maxLength={300}
                                    showCount
                                    placeholder="Полный гайд по расчёту пошлин, оформлению СБКТС и ЭПТС..."
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                name="image"
                                label={
                                    <span className="flex items-center gap-2">
                                        <PictureOutlined /> Обложка статьи
                                    </span>
                                }
                                tooltip="Рекомендуем горизонтальные картинки от 1200×600"
                            >
                                <ImageUploader hint="JPG, PNG, WEBP до 10 МБ" />
                            </Form.Item>
                        </Col>

                        <Col xs={12} md={6}>
                            <Form.Item
                                name="tag"
                                label={
                                    <span className="flex items-center gap-2">
                                        <TagOutlined /> Тег
                                    </span>
                                }
                            >
                                <Input placeholder="Таможня, Обзоры..." />
                            </Form.Item>
                        </Col>

                        <Col xs={12} md={6}>
                            <Form.Item
                                name="date"
                                label={
                                    <span className="flex items-center gap-2">
                                        <CalendarOutlined /> Дата
                                    </span>
                                }
                            >
                                <Input placeholder="12 Мая 2024" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                name="author"
                                label={
                                    <span className="flex items-center gap-2">
                                        <UserOutlined /> Автор
                                    </span>
                                }
                            >
                                <Input placeholder="Редакция ILSATAO" />
                            </Form.Item>
                        </Col>

                        <Col xs={12} md={6}>
                            <Form.Item
                                name="readTime"
                                label={
                                    <span className="flex items-center gap-2">
                                        <ClockCircleOutlined /> Время чтения
                                    </span>
                                }
                            >
                                <Input placeholder="7 мин" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation="left">Содержимое статьи</Divider>

                    <Alert
                        type="info"
                        showIcon
                        className="mb-4"
                        message="Редактор автоматически конвертирует текст в HTML"
                        description="Пишите в визуальном режиме как в Word — на выходе получится готовый HTML, который отобразится на странице статьи. Для таблиц, iframe и класса «lead» переключитесь на вкладку HTML."
                    />

                    <Form.Item
                        name="content"
                        rules={[
                            {
                                validator: (_, value) => {
                                    const plain = (value || '')
                                        .replace(/<[^>]*>/g, '')
                                        .trim();
                                    if (!plain) {
                                        return Promise.reject(
                                            new Error('Содержимое статьи не должно быть пустым')
                                        );
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <RichTextEditor />
                    </Form.Item>
                </Card>

                <div className="flex justify-end gap-3 mt-6">
                    <Button onClick={() => navigate('/admin/blog')}>Отмена</Button>
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