import { useState } from 'react';
import { Upload, Button, Image, message } from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    LoadingOutlined,
    PictureOutlined,
} from '@ant-design/icons';
import { uploadImage } from '../services/UploadApi.js';
import { toImageUrl } from '../services/urls.js';
import ImageDropZone from './ImageDropZone.jsx';

export default function ImageUploader({
                                          value = '',
                                          onChange,
                                          accept = 'image/jpeg,image/png,image/webp,image/gif,image/svg+xml',
                                          maxSizeMb = 10,
                                          hint,
                                          globalPaste = false,
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
        return false;
    };

    // Вставка/перетаскивание: берём первую картинку, проверяем как обычный файл
    const handleDropped = (files) => {
        const file = files[0];
        if (!file) return;
        if (file.size / 1024 / 1024 > maxSizeMb) {
            message.error(`Файл должен быть меньше ${maxSizeMb} МБ`);
            return;
        }
        handleFile(file);
    };

    return (
        <ImageDropZone
            onFiles={handleDropped}
            disabled={loading}
            globalPaste={globalPaste}
            footer={
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
            }
        >
            <div className="flex flex-wrap items-start gap-3">
                {value ? (
                    <div className="relative">
                        <Image
                            src={toImageUrl(value)}
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
                    <div className="w-[140px] h-[100px] rounded-xl border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-slate-400 gap-1">
                        {loading ? <LoadingOutlined className="text-2xl" /> : <PictureOutlined className="text-3xl" />}
                        <span className="text-[11px]">Ctrl+V сюда</span>
                    </div>
                )}

                {hint && (
                    <span className="text-xs text-slate-400 leading-snug max-w-[220px] self-center">
                        {hint}
                    </span>
                )}
            </div>
        </ImageDropZone>
    );
}
