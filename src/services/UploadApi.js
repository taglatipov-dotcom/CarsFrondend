// ============ UPLOAD API ============
import { getToken, clearAuth } from './AuthApi.js';

const API_BASE_URL = '/api';

/**
 * Загружает файл на бэкенд. Возвращает абсолютный URL.
 * Требует авторизации (JWT в заголовке).
 */
export async function uploadImage(file) {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        // Content-Type НЕ ставим — браузер сам выставит multipart с boundary
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
    });

    if (res.status === 401) {
        clearAuth();
        if (window.location.pathname !== '/admin/login') {
            window.location.href = '/Admin/login';
        }
        throw new Error('Сессия истекла, войдите заново');
    }

    if (!res.ok) {
        let detail = `HTTP ${res.status}`;
        try {
            const data = await res.json();
            detail = data.detail || detail;
        } catch { /* ignore */ }
        throw new Error(detail);
    }

    const data = await res.json();
    return data.url;
}

/**
 * Публичная загрузка фото к отзыву — без JWT.
 * Использует эндпоинт /upload/public с ограничениями по типу и размеру.
 */
export async function uploadPublicImage(file) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE_URL}/upload/public`, {
        method: 'POST',
        headers: {}, // без Authorization
        body: formData,
    });

    if (!res.ok) {
        let detail = `HTTP ${res.status}`;
        try {
            const data = await res.json();
            detail = data.detail || detail;
        } catch { /* ignore */ }
        throw new Error(detail);
    }

    const data = await res.json();
    return data.url;
}