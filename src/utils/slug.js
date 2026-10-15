// ============ ПОНЯТНЫЕ АДРЕСА (ЧПУ) ============
// ВАЖНО: тот же алгоритм повторён на бэкенде в src/seo.py (slugify / car_slug).
// Меняете здесь — поменяйте и там, иначе ссылки сайта и sitemap разойдутся.

const TRANSLIT_MAP = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh',
    з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
    п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts',
    ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

export function slugify(str) {
    return (str || '')
        .toLowerCase()
        .split('')
        .map((ch) => TRANSLIT_MAP[ch] ?? ch)
        .join('')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80)
        .replace(/-+$/g, '');
}

/** «Zeekr 001 2026», id 7 → «zeekr-001-2026-7». id в конце — по нему ищем машину. */
export function carSlug(car) {
    const name = car?.name || car?.car_name || `${car?.brend || car?.brand || ''} ${car?.model || ''}`;
    return `${slugify(name) || 'car'}-${car.id}`;
}

export const carPath = (car) => `/car/${carSlug(car)}`;

/** «zeekr-001-2026-7» → 7, «7» → 7 (старые ссылки), мусор → null */
export function parseCarId(slug) {
    const m = String(slug || '').match(/(\d+)$/);
    return m ? Number(m[1]) : null;
}

/** Статьи: свой slug из админки; если его нет — старая ссылка по id. */
export const blogPath = (blog) => `/blog/${blog.slug || blog.id}`;
