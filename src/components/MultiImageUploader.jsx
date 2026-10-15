import { useRef, useState } from 'react';
import { Button, Image, message, Progress, Tooltip } from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    LoadingOutlined,
    PictureOutlined,
    StarFilled,
    StarOutlined,
    HolderOutlined,
} from '@ant-design/icons';
import { uploadImage } from '../services/UploadApi.js';
import { toImageUrl, toThumbUrl } from '../services/urls.js';
import ImageDropZone from './ImageDropZone.jsx';

export default function MultiImageUploader({
                                               value = [],
                                               onChange,
                                               accept = 'image/jpeg,image/png,image/webp,image/gif,image/svg+xml',
                                               maxSizeMb = 10,
                                               maxCount = 20,
                                               hint,
                                               uploadFn,
                                               globalPaste = false,
                                           }) {
    const inputRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState({ done: 0, total: 0 });

    const doUpload = uploadFn || uploadImage;
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
                const url = await doUpload(valid[i]);
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
        if (inputRef.current) inputRef.current.value = '';
    };

    // ---------- Порядок фото (первое — главное в каталоге) ----------
    const [dragIdx, setDragIdx] = useState(null);
    const [overIdx, setOverIdx] = useState(null);

    const moveImage = (from, to) => {
        if (from === to || from == null || to == null) return;
        const next = [...images];
        const [item] = next.splice(from, 1);
        next.splice(to, 0, item);
        onChange(next);
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
            <input
                ref={inputRef}
                type="file"
                multiple
                accept={accept}
                onChange={handleInputChange}
                style={{ display: 'none' }}
            />

            <ImageDropZone
                onFiles={handleFiles}
                disabled={loading}
                globalPaste={globalPaste}
                footer={
                    <>
                        <Button
                            icon={loading ? <LoadingOutlined /> : <PlusOutlined />}
                            onClick={() => inputRef.current?.click()}
                            disabled={loading}
                        >
                            {images.length > 0 ? 'Добавить ещё' : 'Загрузить фото'}
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
                    </>
                }
            >
                <div className="flex flex-wrap gap-3">
                    {images.map((url, idx) => (
                        <div
                            key={`${url}-${idx}`}
                            draggable={!loading}
                            onDragStart={(e) => {
                                setDragIdx(idx);
                                e.dataTransfer.effectAllowed = 'move';
                                e.dataTransfer.setData('text/plain', String(idx));
                                // метка «это перестановка фото», чтобы ImageDropZone не принял её за файл
                                e.dataTransfer.setData('application/x-ilsatao-photo', String(idx));
                            }}
                            onDragOver={(e) => {
                                if (dragIdx === null) return;
                                e.preventDefault();
                                if (overIdx !== idx) setOverIdx(idx);
                            }}
                            onDrop={(e) => {
                                if (dragIdx === null) return;
                                e.preventDefault();
                                e.stopPropagation();
                                moveImage(dragIdx, idx);
                                setDragIdx(null);
                                setOverIdx(null);
                            }}
                            onDragEnd={() => { setDragIdx(null); setOverIdx(null); }}
                            className={`relative group cursor-grab active:cursor-grabbing rounded-[10px] transition-all ${
                                dragIdx === idx ? 'opacity-40' : ''
                            } ${overIdx === idx && dragIdx !== idx ? 'ring-2 ring-violet-500 ring-offset-2' : ''}`}
                        >
                            {idx === 0 ? (
                                <span className="absolute bottom-1 left-1 z-10 bg-violet-600 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full shadow flex items-center gap-1 pointer-events-none">
                                    <StarFilled /> Главное
                                </span>
                            ) : (
                                <Tooltip title="Сделать главным (первым в каталоге)">
                                    <Button
                                        size="small"
                                        icon={<StarOutlined />}
                                        onClick={() => moveImage(idx, 0)}
                                        className="!absolute !bottom-1 !left-1 !z-10 !shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                    />
                                </Tooltip>
                            )}
                            <span className="absolute top-1 left-1 z-10 bg-black/50 text-white text-xs rounded px-1 pointer-events-none flex items-center gap-0.5">
                                <HolderOutlined /> {idx + 1}
                            </span>
                            <Image
                                src={toThumbUrl(url)}
                                preview={{ src: toImageUrl(url) }}
                                draggable={false}
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
                    <div className="w-[140px] h-[100px] rounded-xl border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-slate-400 gap-1">
                        <PictureOutlined className="text-3xl" />
                        <span className="text-[11px]">Ctrl+V сюда</span>
                    </div>
                </div>
            </ImageDropZone>

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
        </div>
    );
}
