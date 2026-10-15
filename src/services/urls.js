// Базовый URL API. В проде nginx проксирует /api/* → бэкенд, в dev — Vite (см. vite.config).
export const API_BASE_URL = '/api';

/**
 * Приводит любой сохранённый URL картинки к рабочему виду.
 *
 * Картинки ВСЕГДА отдаём по пути /uploads/<файл> (тот же домен), а НЕ /api/uploads/...
 * Почему: в nginx есть regex-локация для статики `~* \.(jpg|png|...)$`. Она важнее,
 * чем обычный префикс `location /api/`, поэтому /api/uploads/x.jpg nginx искал
 * в папке фронтенда и отдавал 404. Для /uploads/ в nginx стоит `location ^~ /uploads/`,
 * который regex перебивает — запрос уходит в бэкенд.
 *
 *  • /uploads/x.jpg                         → /uploads/x.jpg
 *  • http://ilsatao.ru/uploads/x.jpg        → /uploads/x.jpg (и без mixed content на https)
 *  • http://127.0.0.1:8000/uploads/x.jpg    → /uploads/x.jpg
 *  • http://localhost:8000/uploads/x.jpg    → /uploads/x.jpg
 *  • /api/uploads/x.jpg                     → /uploads/x.jpg
 *  • https://images.unsplash.com/...        → как есть (внешний адрес)
 */
const OWN_HOSTS = new Set(['127.0.0.1', 'localhost', 'ilsatao.ru', 'www.ilsatao.ru', 'ilsatao.com', 'www.ilsatao.com']);

export function toImageUrl(url) {
    if (!url) return '';

    const uploadsPath = (path) => {
        const i = path.indexOf('/uploads/');
        return i >= 0 ? path.slice(i) : null;
    };

    // Относительный путь
    if (url.startsWith('/')) return uploadsPath(url) || url;

    // Абсолютный URL: если это наш сервер — превращаем в относительный /uploads/...
    try {
        const u = new URL(url);
        const isOwn = OWN_HOSTS.has(u.hostname) || u.port === '8000' ||
            (typeof window !== 'undefined' && u.hostname === window.location.hostname);
        const path = uploadsPath(u.pathname);
        if (isOwn && path) return path;
    } catch {
        // Не URL — вернём как есть
    }

    return url;
}


/**
 * Миниатюра (до 800 px, WebP) для карточек и списков: /uploads/x.jpeg → /uploads/thumbs/x.webp.
 * Бэкенд создаёт её при загрузке, а для старых фото — при первом запросе.
 * Внешние картинки (unsplash и т.п.) возвращаются как есть.
 */
export function toThumbUrl(url) {
    const full = toImageUrl(url);
    if (!full.startsWith('/uploads/') || full.startsWith('/uploads/thumbs/')) return full;
    const name = full.slice('/uploads/'.length);
    if (name.includes('/') || name.toLowerCase().endsWith('.svg')) return full;
    return `/uploads/thumbs/${name.replace(/\.[^.]+$/, '')}.webp`;
}
