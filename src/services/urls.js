// Базовый URL API. В прод — относительный /api, в dev — можно и /api
// (Vite тогда проксирует на 8000, см. vite.config).
export const API_BASE_URL = '/api';

/**
 * Приводит любой сохранённый URL картинки к рабочему виду.
 *  • https://... → как есть (актуальный внешний URL)
 *  • /uploads/... → API_BASE_URL + путь
 *  • http://127.0.0.1:8000/uploads/... → заменяем на API_BASE_URL + путь
 *  • http://localhost:8000/uploads/... → то же
 *  • http://<host>:8000/uploads/... → то же
 */
export function toImageUrl(url) {
    if (!url) return '';

    // Уже относительный путь
    if (url.startsWith('/')) return `${API_BASE_URL}${url}`;

    // Абсолютный URL — проверяем, не внутренний ли это адрес
    try {
        const u = new URL(url);
        const isInternal =
            u.hostname === '127.0.0.1' ||
            u.hostname === 'localhost' ||
            u.port === '8000';

        if (isInternal && u.pathname.startsWith('/uploads/')) {
            return `${API_BASE_URL}${u.pathname}`;
        }
    } catch {
        // Не URL — вернём как есть
    }

    return url;
}