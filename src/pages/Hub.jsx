import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchShop, presetPrice, rub } from '../services/ShopApi.js';
import { API_BASE_URL, toImageUrl } from '../services/urls.js';
import { Particles, Reveal, useBodyBg, useMeta } from '../components/shop/fx.jsx';
import { GiftArt, BagArt, CarArt } from '../components/shop/Art.jsx';
import SiteNav from '../components/shop/SiteNav.jsx';
import '../components/shop/shop.css';

/*
 * Витрина ilsatao.ru — ВСЁ на первом экране, без прокрутки:
 * шапка + три карточки направлений на всю оставшуюся высоту (ПК — в ряд, телефон — три строки).
 * В карточках живые данные: фото авто, готовые боксы и сумки с ценами «от» (из /shop/...).
 */

function useShopStats() {
    const [s, setS] = useState({ presets: [], items: [], bags: [] });
    useEffect(() => {
        Promise.all([fetchShop('box_presets'), fetchShop('box_items'), fetchShop('bags')])
            .then(([presets, items, bags]) => setS({ presets, items, bags }))
            .catch(() => {});
    }, []);
    return useMemo(() => {
        const byId = Object.fromEntries(s.items.map((i) => [i.id, i]));
        const presetPrices = s.presets.map((p) => presetPrice(p, byId).final).filter(Boolean);
        const bagPrices = s.bags.map((b) => b.price).filter(Boolean);
        return {
            presets: s.presets.length,
            items: s.items.length,
            boxFrom: presetPrices.length ? Math.min(...presetPrices) : null,
            emoji: s.presets.flatMap((p) => (p.items || []).map((l) => byId[l.item_id]?.emoji)).filter(Boolean),
            bags: s.bags,
            bagFrom: bagPrices.length ? Math.min(...bagPrices) : null,
        };
    }, [s]);
}

/** Фото машины для карточки «Авто»: первая машина каталога с фото (по популярности). */
function useCarPhoto() {
    const [car, setCar] = useState(null);
    useEffect(() => {
        fetch(`${API_BASE_URL}/cars`).then((r) => (r.ok ? r.json() : [])).then((list) => {
            const cars = (Array.isArray(list) ? list : [])
                .sort((a, b) => (a.popularity_rank ?? 1e9) - (b.popularity_rank ?? 1e9));
            const withPhoto = cars.find((c) => (c.images || c.photos || []).length);
            setCar({ count: cars.length, src: withPhoto ? toImageUrl((withPhoto.images || withPhoto.photos)[0]) : null });
        }).catch(() => setCar({ count: 0, src: null }));
    }, []);
    return car;
}

function Chip({ children, light = false }) {
    return (
        <span className={`micro rounded-full px-2.5 py-1 border ${light ? 'border-black/15 text-black/60' : 'border-white/20 text-white/70'}`}>
            {children}
        </span>
    );
}

function Cta({ children, color, text = '#000' }) {
    return (
        <span className="inline-flex items-center gap-2 rounded-full pl-5 pr-4 py-2.5 text-sm font-semibold transition-transform group-hover:translate-x-1"
              style={{ background: color, color: text }}>
            {children}
            <span aria-hidden="true">→</span>
        </span>
    );
}

export default function Hub() {
    useBodyBg('#07090A');
    useMeta('ILSATAO: автомобили из Китая для бизнеса, конструктор новогодних подарочных боксов и каталог сумок.');
    const st = useShopStats();
    const car = useCarPhoto();
    const bagSamples = st.bags.slice(0, 3);
    const emoji = Array.from(new Set(st.emoji)).slice(0, 9);

    // общий каркас карточки: на телефоне — строка (текст слева, картинка справа), на ПК — колонка
    const card = 'group relative overflow-hidden rounded-2xl flex flex-col justify-end lg:justify-between p-5 sm:p-7 lg:p-9 min-h-0 !no-underline';

    return (
        <div className="shop-root h-[100svh] min-h-[560px] flex flex-col bg-[#07090A] text-white" style={{ fontFamily: "'Onest', sans-serif" }}>
            <SiteNav theme="dark" />

            <main className="flex-1 min-h-0 grid grid-rows-3 lg:grid-rows-1 lg:grid-cols-[1.25fr_1fr_1fr] gap-2 sm:gap-3 p-2 sm:p-3">
                {/* ===== Авто ===== */}
                <Link to="/cars" className={card}>
                    <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 90% at 30% 20%, #1D2F28 0%, #0F1A17 60%, #0A110F 100%)' }} />
                    {car?.src ? (
                        <img src={car.src} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-105" />
                    ) : (
                        <div className="absolute inset-0 grid place-items-center p-10 pb-40">
                            <Reveal className="w-full max-w-[420px]"><CarArt line="#C8A15A" className="w-full" /></Reveal>
                        </div>
                    )}
                    <div className={`absolute inset-0 bg-gradient-to-t ${car?.src ? 'from-black/90 via-black/45 to-black/20' : 'from-black/60 via-transparent to-transparent'}`} />
                    <div className="relative hidden lg:flex justify-between items-start">
                        <span className="micro text-white/70">01 · Для бизнеса</span>
                        <span className="micro text-[#C8A15A]">{car?.count ? `${car.count} авто в каталоге` : 'B2B'}</span>
                    </div>
                    <div className="relative">
                        <div className="micro text-white/60 lg:hidden mb-2">01 · Для бизнеса</div>
                        <h2 className="font-display-x text-2xl sm:text-4xl lg:text-5xl font-medium m-0 leading-[1.05]">Авто из Китая</h2>
                        <p className="hidden sm:block text-white/70 mt-3 max-w-md">
                            Подбор, выкуп, доставка и растаможка на юрлицо — для компаний, дилеров и автосалонов.
                        </p>
                        <div className="hidden sm:flex flex-wrap gap-2 mt-4">
                            <Chip>Каталог</Chip><Chip>Калькулятор растаможки</Chip><Chip>Документы для бухгалтерии</Chip>
                        </div>
                        <div className="mt-4 lg:mt-6"><Cta color="#C8A15A">Открыть каталог</Cta></div>
                    </div>
                </Link>

                {/* ===== Боксы ===== */}
                <Link to="/box" className={card} style={{ background: 'radial-gradient(120% 90% at 70% 20%, #4A1418 0%, #1A0B0D 55%, #0E0809 100%)' }}>
                    <Particles mode="snow" className="absolute inset-0 w-full h-full opacity-70" />
                    <div className="relative hidden lg:flex justify-between items-start">
                        <span className="micro text-white/60">02 · Подарки</span>
                        {st.boxFrom && <span className="micro text-[#FF8A7A]">от {rub(st.boxFrom)}</span>}
                    </div>
                    {/* картинка: бокс + товары */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-[42%] lg:static lg:translate-y-0 lg:w-full lg:flex-1 lg:min-h-0 pointer-events-none">
                    <Reveal className="w-full h-full grid place-items-center">
                        <div className="relative w-full max-w-[260px] aspect-square">
                            <GiftArt line="#FF6B5A" className="absolute inset-[14%] text-white transition-transform duration-700 group-hover:-translate-y-1 group-hover:rotate-[-3deg]" />
                            {emoji.map((e, i) => {
                                const a = (i / Math.max(emoji.length, 1)) * Math.PI * 2;
                                return (
                                    <span key={e} className="absolute text-xl sm:text-3xl fx-float"
                                          style={{ left: `${50 + Math.cos(a) * 44}%`, top: `${50 + Math.sin(a) * 44}%`, transform: 'translate(-50%,-50%)', animationDelay: `${i * 0.5}s` }}>
                                        {e}
                                    </span>
                                );
                            })}
                        </div>
                    </Reveal>
                    </div>
                    <div className="relative max-w-[58%] lg:max-w-none">
                        <div className="micro text-white/55 lg:hidden mb-2">02 · Подарки</div>
                        <h2 className="font-display-x text-2xl sm:text-4xl font-medium m-0 leading-[1.05]">Новогодние боксы</h2>
                        <p className="hidden sm:block text-white/65 mt-3">
                            {st.presets || 10} готовых боксов или свой из {st.items || 40} товаров.
                            {st.boxFrom ? <> От <b className="text-white">{rub(st.boxFrom)}</b>.</> : null}
                        </p>
                        <div className="mt-4 lg:mt-6"><Cta color="#E5483A">Собрать бокс</Cta></div>
                    </div>
                </Link>

                {/* ===== Сумки ===== */}
                <Link to="/bags" className={`${card} !text-[#161513]`} style={{ background: '#E9E3D6' }}>
                    <div className="relative hidden lg:flex justify-between items-start">
                        <span className="micro text-black/50">03 · Аксессуары</span>
                        {st.bagFrom && <span className="micro text-black/70">от {rub(st.bagFrom)}</span>}
                    </div>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-[44%] lg:static lg:translate-y-0 lg:w-full lg:flex-1 lg:min-h-0 pointer-events-none">
                    <Reveal className="w-full h-full grid place-items-center">
                        <div className="relative w-full max-w-[300px] aspect-[4/3]">
                            {(bagSamples.length ? bagSamples : [{ category: 'Шопер', colors: ['x:#6B6B3A'] }]).map((b, i) => {
                                const hex = String((b.colors || [])[0] || 'x:#CDB59A').split(':')[1] || '#CDB59A';
                                const pos = [
                                    'left-[2%] top-[16%] w-[50%] -rotate-6 group-hover:-rotate-12',
                                    'left-[26%] top-[2%] w-[52%] z-10 group-hover:-translate-y-2',
                                    'right-[0%] top-[20%] w-[46%] rotate-6 group-hover:rotate-12',
                                ][i];
                                return (
                                    <div key={b.id || i} className={`absolute transition-transform duration-700 ${pos}`}>
                                        <BagArt category={b.category} color={hex} line="#161513" />
                                    </div>
                                );
                            })}
                        </div>
                    </Reveal>
                    </div>
                    <div className="relative max-w-[56%] lg:max-w-none">
                        <div className="micro text-black/50 lg:hidden mb-2">03 · Аксессуары</div>
                        <h2 className="font-serif-x italic text-3xl sm:text-5xl font-medium m-0 leading-none">Сумки</h2>
                        <p className="hidden sm:block text-black/60 mt-3">
                            Шоперы, рюкзаки, кросс-боди и дорожные сумки{st.bags.length ? ` — ${st.bags.length} моделей` : ''}.
                            {st.bagFrom ? <> От <b className="text-black">{rub(st.bagFrom)}</b>.</> : null}
                        </p>
                        <div className="mt-4 lg:mt-6"><Cta color="#161513" text="#fff">Смотреть сумки</Cta></div>
                    </div>
                </Link>
            </main>
        </div>
    );
}
