import {
    CarOutlined,
    SafetyCertificateOutlined,
    DollarOutlined,
    DeleteOutlined,
    PercentageOutlined,
    CarFilled,
} from '@ant-design/icons';

/* Ставка нашей комиссии от суммы всех расходов (цена авто + таможня + логистика) */
export const COMMISSION_RATE = 0.03;

/* Фиксированные логистические расходы, ₽ */
export const LOGISTICS_COST = 345000;

/* Цвета статей — приглушённые, в тон палитре сайта; различаются и по светлоте */
const ROWS = [
    { key: 'price',      name: 'Цена автомобиля',         color: '#14211C', Icon: CarOutlined },
    { key: 'sbor',       name: 'Таможенный сбор',         color: '#5F8F6E', Icon: SafetyCertificateOutlined },
    { key: 'tax',        name: 'Таможенная пошлина',      color: '#8A6A2F', Icon: SafetyCertificateOutlined },
    { key: 'excise',     name: 'Акциз',                   color: '#B5523B', Icon: PercentageOutlined },
    { key: 'nds',        name: 'НДС',                     color: '#3F6E86', Icon: PercentageOutlined },
    { key: 'util',       name: 'Утилизационный сбор',     color: '#C8A15A', Icon: DeleteOutlined },
    { key: 'logistics',  name: 'Логистические расходы',   color: '#7F918A', Icon: CarFilled },
    { key: 'commission', name: `Наша комиссия (${Math.round(COMMISSION_RATE * 100)}%)`, color: '#2A3D35', Icon: DollarOutlined },
];

/** Статьи расходов и итог «под ключ» в рублях из ответа calcus (normalizeCostBreakdown). */
export function computeCost(costData) {
    if (!costData) return { rows: [], total: 0 };
    const base =
        (costData.price || 0) + (costData.sbor || 0) + (costData.tax || 0) +
        (costData.excise || 0) + (costData.nds || 0) + (costData.util || 0) + LOGISTICS_COST;
    const commission = Math.round(base * COMMISSION_RATE);
    const values = { ...costData, logistics: LOGISTICS_COST, commission };
    const total = base + commission;
    const rows = ROWS
        .map((r) => ({ ...r, value: Math.round(values[r.key] || 0) }))
        .filter((r) => r.value > 0)
        .map((r) => ({ ...r, percent: total > 0 ? ((r.value / total) * 100).toFixed(1) : '0' }));
    return { rows, total };
}

export const formatRub = (n) => `${Math.round(n || 0).toLocaleString('ru-RU')} ₽`;

/** Кольцевая диаграмма + список статей. Рисуется на светлом фоне (paper). */
export default function CostBreakdown({ rows }) {
    const radius = 70;
    const strokeWidth = 26;
    const circumference = 2 * Math.PI * radius;
    const total = rows.reduce((s, r) => s + r.value, 0);

    let running = 0;
    const segments = rows.map((r) => {
        const len = total > 0 ? (r.value / total) * circumference : 0;
        const seg = { ...r, len, offset: running };
        running += len;
        return seg;
    });

    return (
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="relative w-44 h-44 flex-shrink-0">
                <svg viewBox="0 0 200 200" className="w-full h-full" role="img" aria-label="Доли статей расходов">
                    <g transform="rotate(-90 100 100)">
                        <circle cx="100" cy="100" r={radius} fill="transparent" stroke="rgb(20 33 28 / 0.08)" strokeWidth={strokeWidth} />
                        {segments.map((s) => (
                            <circle
                                key={s.key}
                                cx="100"
                                cy="100"
                                r={radius}
                                fill="transparent"
                                stroke={s.color}
                                strokeWidth={strokeWidth}
                                strokeDasharray={`${Math.max(0, s.len - 1.5)} ${circumference}`}
                                strokeDashoffset={-s.offset}
                                className="transition-all duration-700 ease-out"
                            >
                                <title>{`${s.name}: ${formatRub(s.value)} (${s.percent}%)`}</title>
                            </circle>
                        ))}
                    </g>
                </svg>
            </div>

            <div className="flex-1 w-full flex flex-col">
                {rows.map(({ key, name, color, Icon, value, percent }) => (
                    <div key={key} className="flex items-center justify-between gap-3 py-2 border-b border-ink/10 last:border-b-0">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
                            <Icon style={{ color: '#14211C', opacity: 0.45, fontSize: 16 }} />
                            <span className="text-ink text-base md:text-lg truncate">{name}</span>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <span className="font-semibold text-ink text-base md:text-lg whitespace-nowrap">{formatRub(value)}</span>
                            <span className="text-sm text-ink/55 w-12 text-right">{percent}%</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
