import { useEffect, useRef, useState } from 'react';
import { Button, message } from 'antd';
import { SnippetsOutlined } from '@ant-design/icons';
import { extractImageFiles, readClipboardImages, isTypingTarget } from '../utils/clipboardImages.js';

/**
 * Обёртка для загрузчиков картинок: принимает файлы
 *  • вставкой Ctrl+V (кликните по области, затем Ctrl+V),
 *  • перетаскиванием файлов мышкой,
 *  • кнопкой «Вставить из буфера».
 * globalPaste — ловить Ctrl+V на всей странице (если фокус не в текстовом поле).
 * Включать только когда загрузчик на странице один, иначе непонятно, куда вставлять.
 */
export default function ImageDropZone({ onFiles, disabled, globalPaste = false, children, footer }) {
    const [dragOver, setDragOver] = useState(false);
    const [focused, setFocused] = useState(false);
    const onFilesRef = useRef(onFiles);
    onFilesRef.current = onFiles;

    const accept = (files) => {
        if (disabled) return;
        if (files.length === 0) {
            message.info('В буфере обмена нет картинки');
            return;
        }
        onFilesRef.current(files);
    };

    const handlePaste = (e) => {
        const files = extractImageFiles(e.clipboardData);
        if (files.length === 0) return; // пусть вставляется текст как обычно
        e.preventDefault();
        e.stopPropagation();
        accept(files);
    };

    useEffect(() => {
        if (!globalPaste) return undefined;
        const listener = (e) => {
            if (isTypingTarget(document.activeElement)) return;
            const files = extractImageFiles(e.clipboardData);
            if (files.length === 0) return;
            e.preventDefault();
            if (!disabled) onFilesRef.current(files);
        };
        document.addEventListener('paste', listener);
        return () => document.removeEventListener('paste', listener);
    }, [globalPaste, disabled]);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        accept(extractImageFiles(e.dataTransfer));
    };

    const handleClipboardButton = async () => {
        try {
            accept(await readClipboardImages());
        } catch (err) {
            if (err?.name === 'NotAllowedError') {
                message.warning('Разрешите доступ к буферу обмена или нажмите Ctrl+V в области загрузки');
            } else {
                message.warning(err.message || 'Не удалось прочитать буфер обмена');
            }
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <div
                tabIndex={0}
                onPaste={handlePaste}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`rounded-xl p-2 -m-2 outline-none transition-colors ${
                    dragOver
                        ? 'bg-violet-50 ring-2 ring-violet-400'
                        : focused
                            ? 'ring-2 ring-violet-200'
                            : ''
                }`}
            >
                {children}
            </div>

            <div className="flex flex-wrap items-center gap-3">
                {footer}
                <Button
                    icon={<SnippetsOutlined />}
                    onClick={handleClipboardButton}
                    disabled={disabled}
                >
                    Вставить из буфера
                </Button>
            </div>
            <span className="text-xs text-slate-400">
                {globalPaste
                    ? 'Ctrl+V в любом месте страницы, перетаскивание или кнопка'
                    : 'Кликните по области с фото и нажмите Ctrl+V, или перетащите файл'}
            </span>
        </div>
    );
}
