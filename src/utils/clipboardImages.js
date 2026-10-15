// ============ КАРТИНКИ ИЗ БУФЕРА ОБМЕНА / DRAG & DROP ============

const EXT_BY_TYPE = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
};

// У скриншотов из буфера имя всегда «image.png» — даём понятное уникальное имя
function withName(blob, index = 0) {
    const ext = EXT_BY_TYPE[blob.type] || 'png';
    const name = `vstavka-${Date.now()}-${index + 1}.${ext}`;
    return new File([blob], name, { type: blob.type || 'image/png' });
}

/** Достаёт картинки из события paste/drop (e.clipboardData / e.dataTransfer). */
export function extractImageFiles(dataTransfer) {
    if (!dataTransfer) return [];
    const result = [];

    // items — надёжнее для скриншотов (Win+Shift+S, PrintScreen)
    if (dataTransfer.items && dataTransfer.items.length) {
        for (const item of dataTransfer.items) {
            if (item.kind === 'file' && item.type.startsWith('image/')) {
                const f = item.getAsFile();
                if (f) result.push(f);
            }
        }
    }
    // files — для файлов, скопированных в проводнике, и для drag & drop
    if (result.length === 0 && dataTransfer.files && dataTransfer.files.length) {
        for (const f of dataTransfer.files) {
            if (f.type.startsWith('image/')) result.push(f);
        }
    }

    return result.map((f, i) => (f.name && f.name !== 'image.png' ? f : withName(f, i)));
}

/** Кнопка «Вставить из буфера»: Clipboard API (работает на https и localhost). */
export async function readClipboardImages() {
    if (!navigator.clipboard?.read) {
        throw new Error('Браузер не даёт доступ к буферу — нажмите Ctrl+V в области загрузки');
    }
    const items = await navigator.clipboard.read();
    const files = [];
    for (const item of items) {
        const type = item.types.find((t) => t.startsWith('image/'));
        if (type) files.push(withName(await item.getType(type), files.length));
    }
    return files;
}

/** true, если фокус в поле ввода — тогда глобальную вставку не перехватываем. */
export function isTypingTarget(el) {
    if (!el) return false;
    const tag = el.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
}
