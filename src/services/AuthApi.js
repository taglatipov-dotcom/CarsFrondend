// ============ ADMIN AUTH ============
const API_BASE_URL =
    typeof window !== 'undefined'
        ? `${window.location.protocol}//${window.location.hostname}:8000`
        : 'http://localhost:8000';

const TOKEN_KEY = 'ilsatao_admin_token';
const USERNAME_KEY = 'ilsatao_admin_username';

export const getToken = () => localStorage.getItem(TOKEN_KEY) || '';
export const getUsername = () => localStorage.getItem(USERNAME_KEY) || '';
export const isAuthenticated = () => !!getToken();

export function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
}

export async function login(username, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
        let detail = 'Не удалось войти';
        try {
            const data = await res.json();
            detail = data.detail || detail;
        } catch {
            /* ignore */
        }
        throw new Error(detail);
    }

    const data = await res.json();
    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(USERNAME_KEY, data.username);
    return data;
}

export function logout() {
    clearAuth();
}

/**
 * Общая обёртка для всех запросов админки.
 * Добавляет Authorization, а при 401 — чистит токен и редиректит на /Admin/login.
 */
export async function adminFetch(path, options = {}) {
    const token = getToken();

    const headers = {
        Accept: 'application/json',
        ...(options.headers || {}),
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

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
        } catch {
            /* ignore */
        }
        throw new Error(detail);
    }

    // DELETE может вернуть тело — отдаём как есть
    return res.json();
}