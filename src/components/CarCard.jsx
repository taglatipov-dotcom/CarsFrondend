import { Link } from 'react-router-dom';
import { FireOutlined } from '@ant-design/icons';
import { toImageUrl, toThumbUrl } from '../services/urls.js';
import { isBudgetCustomCar } from '../services/MockApi.js';
import { carPath } from '../utils/slug.js';

const FALLBACK_IMAGE =
    'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=1200';

/**
 * Карточка автомобиля для каталога и главной.
 *
 * Фото у машин разных пропорций (3:4, 1:1, 16:9), поэтому:
 *  • задний слой — то же фото, растянутое (cover) и размытое: заполняет рамку;
 *  • передний слой — фото целиком (contain) строго по центру, без обрезки.
 * Так все карточки одинаковые по размеру и выглядят аккуратно,
 * а машина на фото никогда не обрезается.
 *
 * size: 'lg' — широкая карточка (каталог, 2 в ряд), 'md' — главная (3 в ряд).
 */
export default function CarCard({ car, size = 'md', showBudget = true }) {
    // Миниатюра (лёгкая WebP); если её нет — оригинал; если и его нет — заглушка
    const full = toImageUrl(car.images?.[0]) || FALLBACK_IMAGE;
    const src = toThumbUrl(car.images?.[0]) || FALLBACK_IMAGE;
    const isBudget = showBudget && isBudgetCustomCar(car);
    const isLarge = size === 'lg';

    const handleError = (e) => {
        const img = e.currentTarget;
        const step = img.dataset.fallback || '';
        if (!step && full !== src) {
            img.dataset.fallback = 'full';
            img.src = full;
        } else if (step !== 'stub') {
            img.dataset.fallback = 'stub';
            img.src = FALLBACK_IMAGE;
        }
    };

    return (
        <Link
            to={carPath(car)}
            className={`group relative block rounded-2xl overflow-hidden bg-slate-900 shadow-xl hover:shadow-2xl hover:shadow-blue-900/50 transition-all duration-300 hover:-translate-y-1 ${
                isLarge ? 'aspect-[16/10]' : 'aspect-[4/3]'
            }`}
        >
            {/* Размытый фон из того же фото — заполняет поля */}
            <img
                src={src}
                alt=""
                aria-hidden="true"
                loading="lazy"
                onError={handleError}
                className="absolute inset-0 w-full h-full object-cover object-center scale-110 blur-2xl opacity-70"
            />

            {/* Основное фото — целиком, по центру */}
            <img
                src={src}
                alt={car.name}
                loading="lazy"
                onError={handleError}
                className="absolute inset-0 w-full h-full object-contain object-center transition-transform duration-500 group-hover:scale-105"
            />

            {isBudget && (
                <span className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs md:text-sm font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 z-20">
                    <FireOutlined /> Бюджетная таможня
                </span>
            )}

            {/* Плашка с текстом — полупрозрачная, со стеклянным размытием */}
            <div
                className={`absolute inset-x-0 bottom-0 z-10 bg-white/40 backdrop-blur-md border-t border-white/40 ${
                    isLarge ? 'px-5 py-4' : 'px-4 py-3'
                }`}
            >
                <div className="flex items-baseline justify-between gap-3 mb-1">
                    <h3 className={`font-bold text-slate-900 line-clamp-1 m-0 ${isLarge ? 'text-2xl' : 'text-lg'}`}>
                        {car.name}
                    </h3>
                    <span className={`text-slate-800 font-semibold shrink-0 ${isLarge ? 'text-lg' : 'text-sm'}`}>
                        {car.year} г.
                    </span>
                </div>
                <div className={`font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-700 to-fuchsia-700 ${isLarge ? 'text-2xl' : 'text-xl'}`}>
                    {car.price ? `${car.price.toLocaleString('ru-RU')} ¥` : 'Цена по запросу'}
                </div>
            </div>
        </Link>
    );
}
