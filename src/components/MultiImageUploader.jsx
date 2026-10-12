import { useRef, useState } from 'react';
import { Button, Image, message, Progress } from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    LoadingOutlined,
    PictureOutlined,
} from '@ant-design/icons';
import { uploadImage } from '../services/uploadApi';

const API_BASE_URL =
    typeof window !== 'undefined'
        ? `${window.location.protocol}//${window.location.hostname}:8000`
        : 'http://localhost:8000';

/** Если значение относительное (/uploads/...) — превращаем в абсолютный URL. */
function toAbsolute(url) {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) return API_BASE_URL + url;
    return url;
}

/**
 * Множественная загрузка изображений.
 *
 * value    — массив URL (строк)
 * onChange — получает новый массив
 * maxCount — лимит на общее количество изображений
 */
export default function MultiImageUploader({
                                               value = [],
                                               onChange,
                                               accept = 'image/jpeg,image/png,image/webp,image/gif,image/svg+xml',
                                               maxSizeMb = 10,
                                               maxCount = 20,
                                               hint,
                                           }) {
    const inputRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState({ done: 0, total: 0 });

    const images = Array.isArray(value) ? value : [];

    const validateFile = (file) => {
        if (!file.type.startsWith('image/')) {
            message.error(`${file.name}: не изображение`);
            return false;
        }
        if (file.size / 1024 / 1024 > maxSizeMb) {
            message.error(`${file.name}: больше ${maxSizeMb} МБ`);
            return false;
        }
        return true;
    };

    const handleFiles = async (files) => {
        const list = Array.from(files);
        if (list.length === 0) return;

        const remaining = maxCount - images.length;
        if (remaining <= 0) {
            message.error(`Максимум ${maxCount} изображений`);
            return;
        }

        const valid = list.filter(validateFile).slice(0, remaining);
        if (valid.length === 0) return;

        if (list.length > remaining) {
            message.warning(`Можно добавить ещё ${remaining} изображений`);
        }

        setLoading(true);
        setProgress({ done: 0, total: valid.length });

        const uploaded = [];
        for (let i = 0; i < valid.length; i += 1) {
            try {
                const url = await uploadImage(valid[i]);
                uploaded.push(url);
            } catch (e) {
                message.error(`${valid[i].name}: ${e.message}`);
            } finally {
                setProgress({ done: i + 1, total: valid.length });
            }
        }

        if (uploaded.length > 0) {
            onChange([...images, ...uploaded]);
            message.success(`Загружено ${uploaded.length} из ${valid.length}`);
        }

        setLoading(false);
        setProgress({ done: 0, total: 0 });
    };

    const handleInputChange = async (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            await handleFiles(files);
        }
        // reset — иначе повторный выбор тех же файлов не сработает
        if (inputRef.current) inputRef.current.value = '';
    };

    const handleRemove = (idx) => {
        onChange(images.filter((_, i) => i !== idx));
    };

    const handleClearAll = () => {
        if (images.length === 0) return;
        onChange([]);
    };

    return (
        <div className="flex flex-col gap-3">
            {/* Скрытый input — обычная нативная загрузка с multiple */}
            <input
                ref={inputRef}
                type="file"
                multiple
                accept={accept}
                onChange={handleInputChange}
                style={{ display: 'none' }}
            />

            {/* Превью-сетка */}
            {images.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                    {images.map((url, idx) => (
                        <div key={`${url}-${idx}`} className="relative group">
                            <Image
                                src={toAbsolute(url)}
                                width={140}
                                height={100}
                                style={{
                                    objectFit: 'cover',
                                    borderRadius: 10,
                                    border: '1px solid #e2e8f0',
                                }}
                                fallback="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTQwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2UyZThmMCIvPjwvc3ZnPg=="
                            />
                            <Button
                                danger
                                size="small"
                                icon={<DeleteOutlined />}
                                onClick={() => handleRemove(idx)}
                                className="!absolute !top-1 !right-1 !shadow-md"
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="w-[140px] h-[100px] rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400">
                    <PictureOutlined className="text-3xl" />
                </div>
            )}

            {/* Прогресс */}
            {loading && progress.total > 0 && (
                <div className="flex flex-col gap-1 max-w-[320px]">
                    <Progress
                        percent={Math.round((progress.done / progress.total) * 100)}
                        size="small"
                        status="active"
                    />
                    <span className="text-xs text-slate-500">
                        Загрузка {progress.done} / {progress.total}
                    </span>
                </div>
            )}

            {/* Кнопки */}
            <div className="flex flex-wrap items-center gap-3">
                <Button
                    icon={loading ? <LoadingOutlined /> : <PlusOutlined />}
                    onClick={() => inputRef.current?.click()}
                    disabled={loading}
                >
                    {images.length > 0 ? 'Добавить ещё' : 'Загрузить'}
                </Button>

                {images.length > 0 && !loading && (
                    <Button onClick={handleClearAll} danger type="text">
                        Удалить все ({images.length})
                    </Button>
                )}

                {hint && (
                    <span className="text-xs text-slate-400 leading-snug max-w-[260px]">
                        {hint}
                    </span>
                )}
            </div>
        </div>
    );
}