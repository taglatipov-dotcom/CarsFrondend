// ============ КОНФИГ API ============
// Бэкенд работает на том же сервере, порт 8000.
// Динамически собираем URL из текущего хоста — работает и на localhost, и на проде.
const API_BASE_URL =
    typeof window !== 'undefined'
        ? `${window.location.protocol}//${window.location.hostname}:8000`
        : 'http://localhost:8000';

async function httpGet(path) {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
    return res.json();
}

async function httpPost(path, body) {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`POST ${path} → ${res.status}`);
    return res.json();
}


// ============ ПЕРЕВОД ТИПОВ КУЗОВА ============
export const BODY_TYPE_LABELS = {
    SUV:       'Внедорожник',
    Sedan:     'Седан',
    MPV:       'Минивэн',
    Coupe:     'Купе',
    Hatchback: 'Хэтчбек',
    Wagon:     'Универсал',
};

export const translateBodyType = (code) =>
    BODY_TYPE_LABELS[code] || code || '—';

// ============ БЮДЖЕТНАЯ ТАМОЖНЯ ============
// Критерии «бюджетного» авто:
//   • возраст 3–5 лет (от текущего года)
//   • мощность до 160 л.с.
//   • двигатель бензиновый или дизельный
//   • объём двигателя до 1.5 л
export const BUDGET_AGE_MIN = 3;
export const BUDGET_AGE_MAX = 5;
export const BUDGET_HP_MAX = 160;
export const BUDGET_VOLUME_MAX = 1.5;

export const isBudgetCustomCar = (car) => {
    if (!car) return false;

    const currentYear = new Date().getFullYear();
    const year = Number(car.year) || 0;
    const age = year > 0 ? currentYear - year : Infinity;

    const hp = Number(car.horsepower) || 0;
    const volume = Number(car.engineVolume) || 0;
    const type = car.engineType || '';

    return (
        age >= BUDGET_AGE_MIN &&
        age <= BUDGET_AGE_MAX &&
        hp > 0 && hp <= BUDGET_HP_MAX &&
        (type === 'Бензиновый' || type === 'Дизельный') &&
        volume > 0 && volume <= BUDGET_VOLUME_MAX
    );
};

// ============ СПРАВОЧНИКИ (пока статические) ============
// TODO: заменить на GET /brands, GET /dictionaries/*
const brandData = {
    "Zeekr": { country: "Китай", models: ["001", "007", "X"] },
    "Li Auto": { country: "Китай", models: ["L7", "L8", "L9"] },
    "Avatr": { country: "Китай", models: ["11", "12"] },
    "Voyah": { country: "Китай", models: ["Free", "Dreamer"] },
    "Exeed": { country: "Китай", models: ["RX", "TXL"] },
    "BYD": { country: "Китай", models: ["Han", "Tang", "Seal"] },
    "Nio": { country: "Китай", models: ["ET5", "ET7", "ES6"] },
    "XPeng": { country: "Китай", models: ["P7", "G9", "G6"] },
    "Hongqi": { country: "Китай", models: ["H9", "E-HS9"] },
    "Geely": { country: "Китай", models: ["Monjaro", "Coolray", "Atlas"] },
    "BMW": { country: "Германия", models: ["i4", "iX", "X5"] },
    "Mercedes-Benz": { country: "Германия", models: ["EQS", "EQE", "GLE"] },
    "Audi": { country: "Германия", models: ["e-tron", "Q8", "A6"] },
    "Porsche": { country: "Германия", models: ["Taycan", "Cayenne", "Macan"] },
    "Volkswagen": { country: "Германия", models: ["ID.4", "ID.6", "Touareg"] },
    "Volvo": { country: "Швеция", models: ["XC90", "XC60", "EX30"] },
    "Land Rover": { country: "Великобритания", models: ["Range Rover", "Defender"] },
    "Toyota": { country: "Япония", models: ["Camry", "RAV4", "Land Cruiser"] },
    "Lexus": { country: "Япония", models: ["RX", "NX", "LX"] },
    "Honda": { country: "Япония", models: ["CR-V", "Accord", "Pilot"] },
    "Nissan": { country: "Япония", models: ["X-Trail", "Qashqai", "Patrol"] },
    "Mazda": { country: "Япония", models: ["CX-5", "CX-9", "MX-30"] },
    "Subaru": { country: "Япония", models: ["Outback", "Forester"] },
    "Mitsubishi": { country: "Япония", models: ["Outlander", "Pajero"] },
    "Hyundai": { country: "Корея", models: ["Tucson", "Santa Fe", "Palisade"] },
    "Kia": { country: "Корея", models: ["Sportage", "Sorento", "EV6"] },
    "Genesis": { country: "Корея", models: ["GV70", "GV80", "G80"] },
    "Tesla": { country: "США", models: ["Model 3", "Model Y", "Model S"] },
    "Jeep": { country: "США", models: ["Grand Cherokee", "Wrangler"] },
};

export const popularBrands = ["Zeekr", "Li Auto", "BMW", "Toyota", "Tesla"];
export const allBrands = Object.keys(brandData);

export const brandsByCountry = Object.entries(brandData).reduce((acc, [brand, info]) => {
    if (!acc[info.country]) acc[info.country] = [];
    acc[info.country].push(brand);
    return acc;
}, {});

// ============ АДАПТЕР: backend (snake_case) → frontend (nested) ============
function adaptCar(raw) {
    if (!raw) return null;

    const brand = raw.brend || '';
    const model = raw.model || '';
    const name = raw.car_name || `${brand} ${model}`.trim() || 'Автомобиль';

    const condition =
        raw.condition === 'бу' || raw.condition === 'used' ? 'used' : 'new';

    const driveShortMap = { 'полный': 'AWD', 'задний': 'RWD', 'передний': 'FWD' };
    const driveRuMap    = { 'полный': 'Полный', 'задний': 'Задний', 'передний': 'Передний' };

    // На карточках сайта показываем реальную цену авто в юанях — то,
    // что админ вводит в поле «Цена в Китае, ¥».
    const price = Number(raw.china_price) || 0;

    const safety = [];
    if (raw.safety_abs) safety.push('ABS');
    if (raw.safety_esp) safety.push('ESP');
    if (raw.safety_ebp) safety.push('EBD');
    if (raw.safety_bas) safety.push('BAS');
    if (raw.safety_airbags) safety.push(`Airbags (${raw.safety_airbags} шт)`);
    if (raw.safety_blind) safety.push('Система контроля слепых зон');
    if (raw.safety_adaptive_cruise) safety.push('Адаптивный круиз-контроль');
    if (raw.safety_ext_stop) safety.push('Автоматическое экстренное торможение');
    if (raw.safety_line) safety.push('Контроль полосы движения');

    const images =
        (raw.images && raw.images.length) ? raw.images
            : (raw.photos && raw.photos.length) ? raw.photos
                : ['https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=1200'];

    const hp = raw.horsepower ?? raw.engine_power ?? 0;
    const engineVolume = Number(raw.engine_volume) || null;

    return {
        id: raw.id,
        popularityRank: raw.popularity_rank ?? 9999,
        brand,
        model,
        name,
        country: raw.country || '—',
        year: raw.year || new Date().getFullYear(),
        price,
        oldPrice: null,
        currency: 'CNY',
        condition,
        mileage: raw.mileage ?? 0,
        bodyType: raw.body_type || 'SUV',
        color: raw.color || '—',
        drive: driveShortMap[raw.drive] || 'AWD',
        available: true,
        location: raw.location || 'Шанхай',
        createdAt: raw.created_at || new Date().toISOString().slice(0, 10),
        engineType: raw.engine_type || '—',
        engineVolume,           // ← числовое значение (1.4, 1.5, …) или null
        horsepower: hp,
        images,

        specs: {
            engine: raw.engine_type || '—',
            engineVolume: engineVolume ? `${engineVolume} л` : '—',
            power: hp ? `${hp} л.с.` : '—',
            torque: raw.torque ? `${raw.torque} Нм` : '—',
            acceleration: raw.acceleration ? `${raw.acceleration} сек` : '—',
            topSpeed: raw.topSpeed ? `${raw.topSpeed} км/ч` : '—',
            range: raw.range ? `${raw.range} км` : '—',
            battery: raw.battery ? `${raw.battery} кВтч` : '—',
            charging: raw.charging || '—',
            transmission: raw.transmission || 'Автоматическая',
            drive: driveRuMap[raw.drive] || '—',
            consumption: raw.consumption ? `${raw.consumption} кВт·ч/100км` : '—',
            fuelType: raw.engine_type || '—',
        },

        dimensions: {
            length:    raw.length    ? `${raw.length} мм`    : '—',
            width:     raw.width     ? `${raw.width} мм`     : '—',
            height:    raw.height    ? `${raw.height} мм`    : '—',
            wheelbase: raw.wheelbase ? `${raw.wheelbase} мм` : '—',
            clearance: raw.clearance ? `${raw.clearance} мм` : '—',
            weight:    raw.weight    ? `${raw.weight} кг`    : '—',
            trunk:     raw.trunk     ? `${raw.trunk} л`      : '—',
            seats:     raw.interior_seats || 5,
        },

        interior: {
            color:    raw.interior_color    || '—',
            material: raw.interior_material || '—',
            seats:    raw.interior_seats ? `Мест: ${raw.interior_seats}` : '—',
            display:  raw.interior_display  || '—',
            audio:    raw.interior_audio    || '—',
        },

        safety,
        features: raw.features || [],

        description:
            raw.description ||
            `${name}${raw.year ? `, ${raw.year} год` : ''} — современный автомобиль с отличными характеристиками.`,

        _raw: raw,
    };
}

// ============ КЭШ ============
let _allCarsCache = null;
let _allCarsPromise = null;
const _carsByIdCache = new Map();

let _blogsCache = null;
let _blogByIdCache = null;
let _reviewsCache = null;

async function loadAllCars() {
    if (_allCarsCache) return _allCarsCache;
    if (_allCarsPromise) return _allCarsPromise;

    _allCarsPromise = httpGet('/cars')
        .then((raw) => {
            _allCarsCache = Array.isArray(raw) ? raw.map(adaptCar).filter(Boolean) : [];
            _allCarsPromise = null;
            return _allCarsCache;
        })
        .catch((err) => {
            _allCarsPromise = null;
            console.error('[api] Не удалось загрузить машины:', err);
            throw err;
        });

    return _allCarsPromise;
}

/* ============ CARS ============ */

export const canServeCarsFromCache = ({ page = 1, limit = 40 } = {}) => {
    return !!(page === 1 && limit === 40 && _allCarsCache);
};

export const fetchCars = async ({ filters = {}, page = 1, limit = 40 } = {}) => {
    const all = await loadAllCars();

    let result = all;
    const { brand, bodyType, engineType, price, budgetCustoms } = filters;

    if (brand && brand !== 'All') {
        result = result.filter((c) => c.brand === brand);
    }
    if (bodyType && bodyType !== 'All') {
        result = result.filter((c) => c.bodyType === bodyType);
    }
    if (engineType && engineType !== 'All') {
        result = result.filter((c) => c.engineType === engineType);
    }
    if (price === 'under3') {
        result = result.filter((c) => c.price < 3000000);
    } else if (price === '3to5') {
        result = result.filter((c) => c.price >= 3000000 && c.price <= 5000000);
    } else if (price === 'over5') {
        result = result.filter((c) => c.price > 5000000);
    }
    if (budgetCustoms) {
        result = result.filter(isBudgetCustomCar);
    }

    result = [...result].sort((a, b) => a.popularityRank - b.popularityRank);

    const total = result.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(Math.max(page, 1), totalPages);
    const startIndex = (safePage - 1) * limit;
    const paginatedCars = result.slice(startIndex, startIndex + limit);

    return {
        cars: paginatedCars,
        total,
        totalPages,
        page: safePage,
        limit,
    };
};

export const fetchCarById = async (id) => {
    const numericId = Number(id);

    if (_carsByIdCache.has(numericId)) return _carsByIdCache.get(numericId);

    if (_allCarsCache) {
        const found = _allCarsCache.find((c) => c.id === numericId);
        if (found) {
            _carsByIdCache.set(numericId, found);
            return found;
        }
    }

    try {
        const raw = await httpGet(`/cars/${numericId}`);
        const car = adaptCar(raw);
        if (car) _carsByIdCache.set(numericId, car);
        return car;
    } catch (e) {
        console.error(`[api] Не удалось загрузить машину #${numericId}:`, e);
        return null;
    }
};

/* ============ CALCULATOR ============ */

export const fetchCarCost = async (rawCar) => {
    if (!rawCar) throw new Error('Нет данных автомобиля для расчёта');

    const params = new URLSearchParams();
    const FIELDS = [
        'brend', 'model', 'car_name', 'country', 'year', 'condition',
        'mileage', 'body_type', 'color', 'drive', 'location', 'china_price',
        'engine_type', 'engine_volume', 'horsepower', 'engine_power',
        'torque', 'acceleration', 'topSpeed', 'range', 'battery',
        'charging', 'transmission', 'consumption',
        'length', 'width', 'height', 'wheelbase', 'clearance', 'weight', 'trunk',
    ];

    for (const key of FIELDS) {
        const v = rawCar[key];
        if (v !== undefined && v !== null && v !== '') {
            params.append(key, v);
        }
    }

    const res = await fetch(`${API_BASE_URL}/cars/cal?${params.toString()}`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
    });

    if (!res.ok) throw new Error(`POST /cars/cal → ${res.status}`);
    return res.json();
};

export const normalizeCostBreakdown = (raw, fallback = {}) => {
    const num = (v) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
    };

    const price  = num(raw?.price)  || num(fallback.price);
    const sbor   = num(raw?.sbor)   || num(fallback.sbor);
    const tax    = num(raw?.tax)    || num(fallback.tax);
    const excise = num(raw?.excise) || num(fallback.excise);
    const nds    = num(raw?.nds)    || num(fallback.nds);
    const util   = num(raw?.util)   || num(fallback.util);

    const apiTotal  = num(raw?.total)  || (sbor + tax + excise + nds + util);
    const apiTotal2 = num(raw?.total2) || (price + apiTotal);

    return {
        price,
        sbor,
        tax,
        excise,
        nds,
        util,
        apiTotal,
        apiTotal2,
    };
};

/* ============ BLOG ============ */

export const fetchBlogs = async () => {
    if (_blogsCache) return _blogsCache;

    const data = await httpGet('/blog');
    _blogsCache = Array.isArray(data) ? data : [];
    return _blogsCache;
};

export const fetchBlogById = async (id) => {
    const numericId = Number(id);
    if (!_blogByIdCache) _blogByIdCache = new Map();

    if (_blogByIdCache.has(numericId)) {
        return _blogByIdCache.get(numericId);
    }

    try {
        const blog = await httpGet(`/blog/${numericId}`);
        _blogByIdCache.set(numericId, blog);
        return blog;
    } catch (e) {
        console.error(`[api] Не удалось загрузить статью #${numericId}:`, e);
        return null;
    }
};

/* ============ REVIEWS ============ */
export const fetchReviews = async () => {
    if (_reviewsCache) return _reviewsCache;

    const data = await httpGet('/reviews');
    _reviewsCache = Array.isArray(data) ? data : [];
    return _reviewsCache;
};

export const submitReview = async (data) => {
    return httpPost('/reviews/submit', data);
};

/* ============ LEADS ============ */
export const sendLead = async (data) => {
    const payload = {
        phone: data.phone || '',
        contact_method: data.contactMethod || null,
        preferences: data.preferences || null,
        budget: data.budget ? String(data.budget) : null,
        consent: !!data.consent,
        newsletter: !!data.newsletter,
        source: data.source || 'site',
    };
    return httpPost('/leads', payload);
};

/* ============ ГЕТТЕРЫ КЭША ============ */
export const getBlogsCache = () => _blogsCache;
export const getReviewsCache = () => _reviewsCache;

/* ============ ИНВАЛИДАЦИЯ КЭША АВТО ============ */
export const invalidateCarsCache = () => {
    _allCarsCache = null;
    _allCarsPromise = null;
    _carsByIdCache.clear();
};

/* ============ ИНВАЛИДАЦИЯ КЭША БЛОГА ============ */
export const invalidateBlogsCache = () => {
    _blogsCache = null;
    _blogByIdCache = null;
};

/* ============ ИНВАЛИДАЦИЯ КЭША ОТЗЫВОВ ============ */
export const invalidateReviewsCache = () => {
    _reviewsCache = null;
};