import { useState } from 'react';
import { Upload, Button, Image, message } from 'antd';
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

export default function ImageUploader({
                                          value = '',
                                          onChange,
                                          accept = 'image/jpeg,image/png,image/webp,image/gif,image/svg+xml',
                                          maxSizeMb = 10,
                                          hint,
                                      }) {
    const [loading, setLoading] = useState(false);

    const handleFile = async (file) => {
        setLoading(true);
        try {
            const url = await uploadImage(file);
            onChange?.(url);
            message.success('Изображение загружено');
        } catch (e) {
            message.error('Ошибка загрузки: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    const beforeUpload = (file) => {
        if (!file.type.startsWith('image/')) {
            message.error('Можно загружать только изображения');
            return Upload.LIST_IGNORE;
        }
        if (file.size / 1024 / 1024 > maxSizeMb) {
            message.error(`Файл должен быть меньше ${maxSizeMb} МБ`);
            return Upload.LIST_IGNORE;
        }
        handleFile(file);
        return false; // отменяем встроенную загрузку antd
    };

    return (
        <div className="flex flex-wrap items-start gap-3">
            {value ? (
                <div className="relative">
                    <Image
                        src={toAbsolute(value)}
                        width={140}
                        height={100}
                        style={{ objectFit: 'cover', borderRadius: 10, border: '1px solid #e2e8f0' }}
                        fallback="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTQwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2UyZThmMCIvPjwvc3ZnPg=="
                    />
                    <Button
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => onChange?.('')}
                        className="!absolute !top-1 !right-1 !shadow-md"
                    />
                </div>
            ) : (
                <div className="w-[140px] h-[100px] rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400">
                    <PictureOutlined className="text-3xl" />
                </div>
            )}

            <div className="flex flex-col gap-2">
                <Upload
                    showUploadList={false}
                    beforeUpload={beforeUpload}
                    accept={accept}
                    disabled={loading}
                >
                    <Button
                        icon={loading ? <LoadingOutlined /> : <PlusOutlined />}
                        disabled={loading}
                    >
                        {value ? 'Заменить' : 'Загрузить'}
                    </Button>
                </Upload>

                {hint && (
                    <span className="text-xs text-slate-400 leading-snug max-w-[220px]">
                        {hint}
                    </span>
                )}
            </div>
        </div>
    );
}