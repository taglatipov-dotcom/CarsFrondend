/* Векторные иллюстрации — пока у товаров нет фото. Линии рисуются (fx-draw), цвет плавно меняется (fx-morph).
   pathLength="1" нужен для анимации рисования. */

const P = { pathLength: 1, vectorEffect: 'non-scaling-stroke' };

/** Сумка по категории. color — основной цвет, line — цвет линий. */
export function BagArt({ category = 'Шопер', color = '#C9B28A', line = '#161513', className = '', draw = false }) {
    const shade = 'rgba(0,0,0,0.12)';
    const common = { fill: color, stroke: line, strokeWidth: 1.5, strokeLinejoin: 'round', ...P };
    const strap = { fill: 'none', stroke: line, strokeWidth: 1.5, strokeLinecap: 'round', ...P };
    let body;
    switch (category) {
        case 'Рюкзак':
            body = (<>
                <path {...strap} d="M78 52 C78 28 122 28 122 52" />
                <path {...common} d="M58 62 Q58 50 70 50 H130 Q142 50 142 62 V168 Q142 178 132 178 H68 Q58 178 58 168 Z" />
                <path {...common} fill={shade} d="M72 112 H128 V160 Q128 166 122 166 H78 Q72 166 72 160 Z" />
                <path {...strap} d="M72 124 H128" />
                <path {...strap} d="M58 78 Q100 92 142 78" />
            </>);
            break;
        case 'Через плечо':
            body = (<>
                <path {...strap} d="M62 104 L100 22 L138 104" />
                <path {...common} d="M48 104 Q48 96 56 96 H144 Q152 96 152 104 V160 Q152 170 142 170 H58 Q48 170 48 160 Z" />
                <path {...common} fill={shade} d="M48 104 Q48 96 56 96 H144 Q152 96 152 104 V128 Q100 146 48 128 Z" />
                <circle {...common} fill={line} cx="100" cy="134" r="3" />
            </>);
            break;
        case 'Поясная':
            body = (<>
                <path {...strap} d="M14 112 Q100 82 186 112" />
                <path {...common} d="M44 104 Q100 76 156 104 Q164 128 150 146 Q100 162 50 146 Q36 128 44 104 Z" />
                <path {...strap} d="M52 118 Q100 104 148 118" />
            </>);
            break;
        case 'Клатч':
            body = (<>
                <path {...strap} d="M150 96 Q186 70 172 40" />
                <path {...common} d="M34 96 Q34 88 42 88 H158 Q166 88 166 96 V146 Q166 154 158 154 H42 Q34 154 34 146 Z" />
                <path {...common} fill={shade} d="M34 96 Q34 88 42 88 H158 Q166 88 166 96 L100 128 Z" />
                <circle {...common} fill={line} cx="100" cy="126" r="4" />
            </>);
            break;
        case 'Дорожная':
            body = (<>
                <path {...strap} d="M70 82 Q70 52 100 52 Q130 52 130 82" />
                <path {...common} d="M24 104 Q24 82 48 82 H152 Q176 82 176 104 V156 Q176 168 164 168 H36 Q24 168 24 156 Z" />
                <path {...strap} d="M24 108 H176" />
                <path {...common} fill={shade} d="M150 120 H170 V150 H150 Z" />
            </>);
            break;
        case 'Деловая':
            body = (<>
                <path {...strap} d="M82 66 V54 Q82 48 88 48 H112 Q118 48 118 54 V66" />
                <path {...common} d="M30 72 Q30 66 36 66 H164 Q170 66 170 72 V160 Q170 166 164 166 H36 Q30 166 30 160 Z" />
                <path {...strap} d="M30 100 H170" />
                <path {...common} fill={line} d="M94 94 H106 V108 H94 Z" />
            </>);
            break;
        case 'Шопер':
        default:
            body = (<>
                <path {...strap} d="M72 72 V58 Q72 30 100 30 Q128 30 128 58 V72" />
                <path {...common} d="M46 72 H154 L162 176 H38 Z" />
                <path {...common} fill={shade} d="M46 72 H154 L155 86 H45 Z" />
            </>);
    }
    return (
        <svg viewBox="0 0 200 200" className={`fx-morph ${draw ? 'fx-draw' : ''} ${className}`} aria-hidden="true">
            <ellipse cx="100" cy="186" rx="64" ry="6" fill="rgba(0,0,0,0.10)" />
            {body}
        </svg>
    );
}

/** Подарочный бокс с бантом (линиями). fill — цвет коробки. */
export function GiftArt({ fill = 'none', line = '#E5483A', ribbon, className = '', draw = true }) {
    const r = ribbon || line;
    const s = { stroke: line, strokeWidth: 1.4, strokeLinejoin: 'round', strokeLinecap: 'round', ...P };
    return (
        <svg viewBox="0 0 240 240" className={`${draw ? 'fx-draw' : ''} ${className}`} aria-hidden="true">
            {/* коробка в изометрии */}
            <path {...s} fill={fill} d="M40 104 L120 136 L200 104 L200 184 L120 216 L40 184 Z" />
            <path {...s} fill={fill === 'none' ? 'none' : 'rgba(255,255,255,0.10)'} d="M30 88 L120 52 L210 88 L120 124 Z" />
            <path {...s} d="M30 88 V104 L120 140 L210 104 V88" fill="none" />
            <path {...s} d="M120 124 V216" />
            {/* лента */}
            <path {...s} stroke={r} d="M75 70 L165 106 M165 70 L75 106" />
            <path {...s} stroke={r} d="M78 117 V198 M162 117 V198" opacity=".7" />
            {/* бант */}
            <path {...s} stroke={r} d="M120 88 C96 52 72 64 92 82 C100 90 112 90 120 88 Z" />
            <path {...s} stroke={r} d="M120 88 C144 52 168 64 148 82 C140 90 128 90 120 88 Z" />
            <path {...s} stroke={r} d="M120 88 L106 112 M120 88 L134 112" />
            {/* размеры (blueprint) */}
            <path {...s} stroke="currentColor" opacity=".35" d="M40 196 L40 206 M120 228 L120 236 M40 202 L120 232" />
            <path {...s} stroke="currentColor" opacity=".35" d="M214 100 L224 100 M214 180 L224 180 M219 100 L219 180" />
        </svg>
    );
}

/** Силуэт машины (для витрины) — линиями. */
export function CarArt({ line = '#C8A15A', className = '' }) {
    const s = { stroke: line, strokeWidth: 1.4, fill: 'none', strokeLinejoin: 'round', strokeLinecap: 'round', ...P };
    return (
        <svg viewBox="0 0 320 140" className={`fx-draw ${className}`} aria-hidden="true">
            <path {...s} d="M18 100 Q16 78 40 74 L96 66 Q124 40 168 38 Q214 38 246 64 L286 72 Q304 76 304 96 V104 H18 Z" />
            <path {...s} d="M108 66 Q130 46 166 46 Q200 46 226 66 Z" />
            <path {...s} d="M164 46 V66" />
            <circle {...s} cx="80" cy="104" r="20" /><circle {...s} cx="80" cy="104" r="8" />
            <circle {...s} cx="250" cy="104" r="20" /><circle {...s} cx="250" cy="104" r="8" />
            <path {...s} opacity=".35" d="M10 128 H310 M60 128 V122 M270 128 V122" />
        </svg>
    );
}
