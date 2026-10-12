// ============ ADMIN API ============
import { adminFetch } from './AuthApi.js';

/* ============ СПРАВОЧНИКИ ДЛЯ ФОРМЫ ============ */
export const CAR_DICTIONARIES = {
    brands: [
        'Zeekr', 'Li Auto', 'Avatr', 'Voyah', 'Exeed', 'BYD', 'Nio', 'XPeng',
        'Hongqi', 'Geely', 'BMW', 'Mercedes-Benz', 'Audi', 'Porsche',
        'Volkswagen', 'Volvo', 'Land Rover', 'Toyota', 'Lexus', 'Honda',
        'Nissan', 'Mazda', 'Subaru', 'Mitsubishi', 'Hyundai', 'Kia',
        'Genesis', 'Tesla', 'Jeep',
    ],
    countries: ['Китай', 'Германия', 'Швеция', 'Великобритания', 'Япония', 'Корея', 'США'],
    bodyTypes: ['SUV', 'Sedan', 'MPV', 'Coupe', 'Hatchback', 'Wagon'],
    engineTypes: [
        'Бензиновый', 'Дизельный', 'Электрический',
        'Последовательный гибрид', 'Параллельный гибрид',
    ],
    conditions: [
        { value: 'новая', label: 'Новая' },
        { value: 'бу', label: 'С пробегом (бу)' },
    ],
    drives: [
        { value: 'передний', label: 'Передний' },
        { value: 'задний', label: 'Задний' },
        { value: 'полный', label: 'Полный' },
    ],
    colors: ['Серый металлик', 'Черный', 'Белый перламутр', 'Синий', 'Красный', 'Серебристый', 'Коричневый', 'Зелёный'],
    locations: ['Шанхай', 'Пекин', 'Гуанчжоу', 'Шэньчжэнь', 'Чэнду', 'Ханчжоу', 'Тяньцзинь', 'Ухань'],
    transmissions: ['Автоматическая', 'Роботизированная', 'Вариатор', 'Механическая'],
};

/* ============ CARS ============ */

export const adminFetchCarsList = () => adminFetch('/cars');

export const adminFetchCarRaw = (id) => adminFetch(`/cars/${id}`);

export const adminCreateCar = (data) =>
    adminFetch('/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

export const adminUpdateCar = (id, data) =>
    adminFetch(`/cars/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

export const adminDeleteCar = (id) =>
    adminFetch(`/cars/${id}`, { method: 'DELETE' });

/* ============ BLOG ============ */

export const adminFetchBlogsList = () => adminFetch('/blog');

export const adminFetchBlogRaw = (id) => adminFetch(`/blog/${id}`);

export const adminCreateBlog = (data) =>
    adminFetch('/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

export const adminUpdateBlog = (id, data) =>
    adminFetch(`/blog/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

export const adminDeleteBlog = (id) =>
    adminFetch(`/blog/${id}`, { method: 'DELETE' });

/* ============ REVIEWS ============ */

export const adminFetchReviewsList = () => adminFetch('/reviews');

export const adminFetchReviewRaw = (id) => adminFetch(`/reviews/${id}`);

export const adminCreateReview = (data) =>
    adminFetch('/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

export const adminUpdateReview = (id, data) =>
    adminFetch(`/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

export const adminDeleteReview = (id) =>
    adminFetch(`/reviews/${id}`, { method: 'DELETE' });

/* ============ REVIEWS MODERATION ============ */

export const adminFetchPendingReviews = () => adminFetch('/reviews/pending');

export const adminApproveReview = (id) =>
    adminFetch(`/reviews/pending/${id}/approve`, { method: 'POST' });

export const adminRejectReview = (id) =>
    adminFetch(`/reviews/pending/${id}`, { method: 'DELETE' });

/* ============ LEADS ============ */

export const LEAD_STATUSES = [
    { value: 'new',         label: 'Новая',      color: 'blue' },
    { value: 'in_progress', label: 'В работе',   color: 'orange' },
    { value: 'done',        label: 'Обработана', color: 'green' },
    { value: 'cancelled',   label: 'Отменена',   color: 'red' },
];

export const getLeadStatusMeta = (value) =>
    LEAD_STATUSES.find((s) => s.value === value) || {
        value: value || 'new',
        label: value || '—',
        color: 'default',
    };

export const adminFetchLeadsList = () => adminFetch('/leads');

export const adminFetchLeadRaw = (id) => adminFetch(`/leads/${id}`);

export const adminUpdateLead = (id, data) =>
    adminFetch(`/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

export const adminDeleteLead = (id) =>
    adminFetch(`/leads/${id}`, { method: 'DELETE' });