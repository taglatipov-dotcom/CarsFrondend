// ============ БОКСЫ И СУМКИ (бэкенд: src/shop_router.py) ============
// Публично: GET /shop/{collection} — только активные. Админка: /all, POST, PUT /{id}, DELETE /{id}.
// Коллекции: box_items (товары для бокса), box_presets (готовые боксы), bags (сумки).
import { API_BASE_URL } from './urls.js';
import { adminFetch } from './AuthApi.js';
import { sendLead } from './MockApi.js';

const _cache = {};

export async function fetchShop(collection) {
    if (_cache[collection]) return _cache[collection];
    const res = await fetch(`${API_BASE_URL}/shop/${collection}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    _cache[collection] = Array.isArray(data) ? data : [];
    return _cache[collection];
}

export const invalidateShopCache = (collection) => {
    if (collection) delete _cache[collection];
    else Object.keys(_cache).forEach((k) => delete _cache[k]);
};

const json = (method, body) => ({
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
});

export const adminShopList = (c) => adminFetch(`/shop/${c}/all`);
export const adminShopCreate = (c, data) => adminFetch(`/shop/${c}`, json('POST', data));
export const adminShopUpdate = (c, id, data) => adminFetch(`/shop/${c}/${id}`, json('PUT', data));
export const adminShopDelete = (c, id) => adminFetch(`/shop/${c}/${id}`, { method: 'DELETE' });

/* ---------- лимиты бокса ---------- */
export const BOX_LIMITS = { weightG: 5000, side: 30, volume: 30 * 30 * 30 };

export const itemVolume = (it) => (Number(it.w) || 0) * (Number(it.h) || 0) * (Number(it.d) || 0);

/** lines: [{item, qty}] → итоги и проверки */
export function boxTotals(lines) {
    let weight = 0, volume = 0, price = 0, count = 0;
    for (const { item, qty } of lines) {
        weight += (item.weight_g || 0) * qty;
        volume += itemVolume(item) * qty;
        price += (item.price || 0) * qty;
        count += qty;
    }
    return {
        weight, volume, price, count,
        weightPct: Math.min(100, (weight / BOX_LIMITS.weightG) * 100),
        volumePct: Math.min(100, (volume / BOX_LIMITS.volume) * 100),
        overWeight: weight > BOX_LIMITS.weightG,
        overVolume: volume > BOX_LIMITS.volume,
    };
}

/** Цена готового бокса со скидкой */
export function presetPrice(preset, itemsById) {
    const lines = (preset.items || [])
        .map((l) => ({ item: itemsById[l.item_id], qty: l.qty }))
        .filter((l) => l.item);
    const t = boxTotals(lines);
    const final = Math.round(t.price * (1 - (preset.discount || 0) / 100));
    return { ...t, lines, full: t.price, final };
}

export const rub = (n) => `${Math.round(n || 0).toLocaleString('ru-RU')} ₽`;

/** Заказ с /box или /bags → общие заявки (source = box / bags) */
export const sendShopOrder = ({ source, name, phone, contactMethod, text, total, consent }) =>
    sendLead({
        phone,
        contactMethod,
        preferences: `${name ? `Имя: ${name}\n` : ''}${text}`.slice(0, 4000),
        budget: total ? rub(total) : null,
        clientType: 'person',
        consent,
        source,
    });

/** «Чёрный:#111111» → { name, hex } */
export const parseColor = (s) => {
    const [name, hex] = String(s || '').split(':');
    return { name: (name || '').trim(), hex: (hex || '#999999').trim() };
};
