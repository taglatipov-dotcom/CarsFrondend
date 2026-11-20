import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchShop, parseColor, rub } from '../services/ShopApi.js';
import { toImageUrl, toThumbUrl } from '../services/urls.js';
import { Reveal, useBodyBg, useMeta } from '../components/shop/fx.jsx';
import { BagArt } from '../components/shop/Art.jsx';
import SiteNav from '../components/shop/SiteNav.jsx';
import OrderModal from '../components/shop/OrderModal.jsx';
import '../components/shop/shop.css';

/*
 * /bags — каталог сумок (админка → «Сумки»). Товары видны сразу: шапка → строка
 * «заголовок + категории + сортировка» → сетка карточек.
 * Светлый редакционный стиль: бежевый фон, serif-заголовки, моно-подписи.
 * Фон карточки тонируется выбранным цветом сумки; пока нет фото — векторный силуэт категории.
 * Корзина → заказ в общие заявки админки (source = "bags").
 */

const BG = '#F3EFE7';
const INK = '#161513';
const SORTS = [
    { v: 'sort', l: 'Популярные' },
    { v: 'cheap', l: 'Сначала дешевле' },
    { v: 'expensive', l: 'Сначала дороже' },
];

const tint = (hex, pct = 16) => `color-mix(in srgb, ${hex} ${pct}%, #EAE4D8)`;
const colorAt = (bag, i) => parseColor((bag.colors || [])[i] || 'Беж:#CDB59A');

function BagVisual({ bag, colorIdx = 0, className = '', full = false }) {
    const img = (bag.images || [])[0];
    if (img) {
        return <img src={full ? toImageUrl(img) : toThumbUrl(img)} alt={bag.name} loading="lazy" className={`w-full h-full object-contain ${className}`} />;
    }
    return <BagArt category={bag.category} color={colorAt(bag, colorIdx).hex} line={INK} className={className} />;
}

function Dots({ colors, active, onPick, size = 'w-4 h-4' }) {
    return (
        <div className="flex gap-1.5">
            {(colors || []).map((c, i) => {
                const { name, hex } = parseColor(c);
                return (
                    <button key={c} type="button" title={name} aria-label={name}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onPick(i); }}
                            className={`${size} rounded-full transition-transform ${i === active ? 'ring-2 ring-offset-2 ring-black/70 ring-offset-[#F3EFE7]' : 'ring-1 ring-black/15 hover:scale-110'}`}
                            style={{ background: hex }} />
                );
            })}
        </div>
    );
}

export default function Bags() {
    useBodyBg(BG);
    useMeta('Каталог сумок ILSATAO: шоперы, рюкзаки, сумки через плечо, клатчи и дорожные сумки. Заказ онлайн, доставка по России.');

    const [bags, setBags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cat, setCat] = useState('Все');
    const [sort, setSort] = useState('sort');
    const [colorOf, setColorOf] = useState({}); // id → индекс цвета
    const [open, setOpen] = useState(null);
    const [qty, setQty] = useState(1);
    const [photo, setPhoto] = useState(0);
    const [cart, setCart] = useState([]); // [{ key, bag, colorIdx, qty }]
    const [cartOpen, setCartOpen] = useState(false);
    const [order, setOrder] = useState(null);

    useEffect(() => {
        fetchShop('bags').then(setBags).catch((e) => setError(e.message)).finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!open && !cartOpen) return undefined;
        document.body.style.overflow = 'hidden';
        const onKey = (e) => { if (e.key === 'Escape') { setOpen(null); setCartOpen(false); } };
        window.addEventListener('keydown', onKey);
        return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
    }, [open, cartOpen]);

    const cats = useMemo(() => {
        const counts = bags.reduce((m, b) => ({ ...m, [b.category]: (m[b.category] || 0) + 1 }), {});
        return [['Все', bags.length], ...Object.entries(counts)];
    }, [bags]);
    const list = useMemo(() => {
        let r = cat === 'Все' ? bags : bags.filter((b) => b.category === cat);
        if (sort === 'cheap') r = [...r].sort((a, b) => a.price - b.price);
        if (sort === 'expensive') r = [...r].sort((a, b) => b.price - a.price);
        return r;
    }, [bags, cat, sort]);

    const count = cart.reduce((s, l) => s + l.qty, 0);
    const total = cart.reduce((s, l) => s + l.qty * l.bag.price, 0);

    const openBag = (b) => { setOpen(b); setQty(1); setPhoto(0); };
    const addToCart = (bag, colorIdx, q) => {
        const key = `${bag.id}:${colorIdx}`;
        setCart((c) => {
            const ex = c.find((l) => l.key === key);
            return ex ? c.map((l) => (l.key === key ? { ...l, qty: l.qty + q } : l)) : [...c, { key, bag, colorIdx, qty: q }];
        });
        setOpen(null);
        setCartOpen(true);
    };
    const setLineQty = (key, q) => setCart((c) => c.map((l) => (l.key === key ? { ...l, qty: q } : l)).filter((l) => l.qty > 0));

    const checkout = () => {
        const summary = ['Заказ сумок:', ...cart.map((l) => {
            const col = colorAt(l.bag, l.colorIdx).name;
            return `• ${l.bag.name}${col ? `, цвет: ${col}` : ''} × ${l.qty} — ${rub(l.bag.price * l.qty)}`;
        })].join('\n');
        setCartOpen(false);
        setOrder({ summary, total });
    };

    const ci = open ? (colorOf[open.id] || 0) : 0;

    return (
        <div className="shop-root min-h-screen" style={{ background: BG, color: INK, fontFamily: "'Onest', sans-serif" }}>
            <SiteNav
                theme="light"
                right={(
                    <button onClick={() => setCartOpen(true)} className="flex items-center gap-2 rounded-full pl-3 pr-1.5 py-1 text-sm bg-black/[0.05] hover:bg-black/[0.09]">
                        Корзина
                        <span key={count} className={`inline-grid place-items-center min-w-6 h-6 px-1.5 rounded-full text-white text-xs ${count ? 'fx-pop' : ''}`}
                              style={{ background: count ? INK : '#0003' }}>{count}</span>
                    </button>
                )}
            />

            <main className="max-w-[1400px] mx-auto px-3 sm:px-6 pt-5 sm:pt-7 pb-14">
                {/* заголовок + фильтры — одна компактная полоса */}
                <div className="flex flex-wrap items-end gap-x-6 gap-y-3 mb-4">
                    <h1 className="font-serif-x italic font-medium text-5xl sm:text-6xl leading-none m-0 mr-auto sm:mr-0">Сумки</h1>
                    <p className="hidden sm:block text-black/55 text-sm m-0 pb-1.5 mr-auto">
                        {bags.length || 12} моделей · доставка по России · оплата после подтверждения
                    </p>
                    <select value={sort} onChange={(e) => setSort(e.target.value)}
                            className="bg-transparent border border-black/15 rounded-full px-4 py-2 text-sm outline-none hover:border-black/40">
                        {SORTS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
                    </select>
                </div>
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 mb-5 -mx-3 px-3 sm:mx-0 sm:px-0">
                    {cats.map(([c, n]) => (
                        <button key={c} onClick={() => setCat(c)}
                                className={`shrink-0 rounded-full px-4 py-2 text-sm transition-colors ${cat === c ? 'bg-[#161513] text-white' : 'bg-black/[0.05] hover:bg-black/[0.09]'}`}>
                            {c} <span className={cat === c ? 'text-white/50' : 'text-black/35'}>{n}</span>
                        </button>
                    ))}
                </div>

                {error && <p className="text-red-700">Не удалось загрузить каталог: {error}</p>}

                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3 sm:gap-x-5 gap-y-8">
                    {loading && Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-square rounded-2xl bg-black/5 animate-pulse" />)}
                    {list.map((b, i) => {
                        const idx = colorOf[b.id] || 0;
                        const hex = colorAt(b, idx).hex;
                        return (
                            <Reveal key={b.id} delay={(i % 4) * 60}>
                                <button onClick={() => openBag(b)} className="group block w-full text-left">
                                    <div className="relative aspect-square rounded-2xl overflow-hidden grid place-items-center p-[14%] transition-colors duration-700"
                                         style={{ background: (b.images || []).length ? '#EAE4D8' : tint(hex) }}>
                                        <BagVisual bag={b} colorIdx={idx} className="w-full h-full transition-transform duration-700 group-hover:scale-[1.06] group-hover:-rotate-2" />
                                        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                                            {b.old_price > b.price && <span className="micro bg-[#161513] text-white rounded-full px-2 py-1">−{Math.round((1 - b.price / b.old_price) * 100)}%</span>}
                                            {!b.in_stock && <span className="micro bg-white/80 rounded-full px-2 py-1">Под заказ</span>}
                                        </div>
                                        <span className="absolute bottom-2.5 inset-x-2.5 text-center text-sm font-medium rounded-full py-2 bg-white/90 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                            Выбрать
                                        </span>
                                    </div>
                                </button>
                                <div className="mt-3 flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <button onClick={() => openBag(b)} className="font-serif-x text-lg sm:text-xl leading-tight text-left">{b.name}</button>
                                        <div className="text-xs text-black/45 mt-0.5 truncate">{b.category} · {b.material}</div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="font-semibold text-sm sm:text-base">{rub(b.price)}</div>
                                        {b.old_price > b.price && <div className="text-xs text-black/40 line-through">{rub(b.old_price)}</div>}
                                    </div>
                                </div>
                                <div className="mt-2.5"><Dots colors={b.colors} active={idx} onPick={(k) => setColorOf((m) => ({ ...m, [b.id]: k }))} /></div>
                            </Reveal>
                        );
                    })}
                </div>
            </main>

            <footer className="border-t border-black/10">
                <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-6 flex flex-wrap justify-between gap-4 micro text-black/45">
                    <span>Натуральные материалы · упаковка в подарочную коробку · доставка по России</span>
                    <span className="flex gap-6">
                        <Link to="/box" className="!text-black/45 hover:!text-black">Новогодние боксы</Link>
                        <Link to="/cars" className="!text-black/45 hover:!text-black">Авто</Link>
                        <span>© {new Date().getFullYear()} ILSATAO</span>
                    </span>
                </div>
            </footer>

            {/* карточка сумки */}
            {open && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6" role="dialog" aria-modal="true">
                    <button aria-label="Закрыть" className="absolute inset-0 bg-black/45 backdrop-blur-sm cursor-default" onClick={() => setOpen(null)} />
                    <div className="relative w-full max-w-4xl max-h-[94vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-[#F8F5EF] grid md:grid-cols-2">
                        <button onClick={() => setOpen(null)} aria-label="Закрыть" className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/85 text-xl">×</button>
                        <div className="p-8 sm:p-12 grid place-items-center min-h-[300px] transition-colors duration-700"
                             style={{ background: (open.images || []).length ? '#EAE4D8' : tint(colorAt(open, ci).hex, 20) }}>
                            {(open.images || []).length ? (
                                <div className="w-full">
                                    <img src={toImageUrl(open.images[photo])} alt={open.name} className="w-full aspect-square object-contain" />
                                    {open.images.length > 1 && (
                                        <div className="flex gap-2 mt-4 justify-center">
                                            {open.images.map((src, k) => (
                                                <button key={src} onClick={() => setPhoto(k)} className={`w-14 h-14 rounded-md overflow-hidden border-2 ${k === photo ? 'border-black' : 'border-transparent'}`}>
                                                    <img src={toThumbUrl(src)} alt="" className="w-full h-full object-cover" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <BagVisual bag={open} colorIdx={ci} full className="w-full max-w-sm" />
                            )}
                        </div>
                        <div className="p-6 sm:p-10 flex flex-col">
                            <div className="micro text-black/45">{open.category}</div>
                            <h3 className="font-serif-x text-4xl leading-tight mt-2 mb-3">{open.name}</h3>
                            <div className="flex items-baseline gap-3">
                                <span className="text-2xl font-semibold">{rub(open.price)}</span>
                                {open.old_price > open.price && <span className="text-black/40 line-through">{rub(open.old_price)}</span>}
                            </div>
                            {open.description && <p className="text-black/65 mt-4">{open.description}</p>}
                            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
                                {open.material && <><dt className="text-black/45">Материал</dt><dd className="m-0">{open.material}</dd></>}
                                {open.size && <><dt className="text-black/45">Размер</dt><dd className="m-0">{open.size}</dd></>}
                                <dt className="text-black/45">Наличие</dt><dd className="m-0">{open.in_stock ? 'В наличии' : 'Под заказ'}</dd>
                            </dl>
                            {(open.colors || []).length > 0 && (
                                <div className="mt-5">
                                    <div className="text-sm text-black/55 mb-2.5">Цвет: <span className="text-black">{colorAt(open, ci).name}</span></div>
                                    <Dots colors={open.colors} active={ci} size="w-7 h-7" onPick={(k) => setColorOf((m) => ({ ...m, [open.id]: k }))} />
                                </div>
                            )}
                            <div className="mt-auto pt-8 flex items-center gap-3">
                                <div className="flex items-center rounded-full bg-black/[0.06]">
                                    <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-10 h-11" aria-label="Меньше">−</button>
                                    <span className="w-6 text-center tabular-nums">{qty}</span>
                                    <button onClick={() => setQty((q) => Math.min(20, q + 1))} className="w-10 h-11" aria-label="Больше">+</button>
                                </div>
                                <button onClick={() => addToCart(open, ci, qty)} className="flex-1 rounded-full h-11 font-semibold text-white" style={{ background: INK }}>
                                    В корзину · {rub(open.price * qty)}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* корзина */}
            <div className={`fixed inset-0 z-50 transition-opacity ${cartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <button aria-label="Закрыть" className="absolute inset-0 bg-black/40 cursor-default" onClick={() => setCartOpen(false)} />
                <aside className={`absolute right-0 top-0 h-full w-full sm:w-[420px] bg-[#F8F5EF] flex flex-col transition-transform duration-500 ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="flex items-center justify-between p-6 border-b border-black/10">
                        <h3 className="font-serif-x text-3xl italic m-0">Корзина</h3>
                        <button onClick={() => setCartOpen(false)} className="w-9 h-9 text-xl" aria-label="Закрыть">×</button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-5">
                        {!cart.length && <p className="text-black/50">Пока пусто — выберите сумку в каталоге.</p>}
                        {cart.map((l) => (
                            <div key={l.key} className="flex gap-4">
                                <div className="w-20 h-20 rounded-xl grid place-items-center p-2 shrink-0" style={{ background: tint(colorAt(l.bag, l.colorIdx).hex) }}>
                                    <BagVisual bag={l.bag} colorIdx={l.colorIdx} className="w-full h-full" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-serif-x text-xl leading-tight">{l.bag.name}</div>
                                    <div className="text-xs text-black/50 mt-0.5">{colorAt(l.bag, l.colorIdx).name}</div>
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center rounded-full bg-black/[0.06] text-sm">
                                            <button onClick={() => setLineQty(l.key, l.qty - 1)} className="w-8 h-8" aria-label="Меньше">−</button>
                                            <span className="w-5 text-center tabular-nums">{l.qty}</span>
                                            <button onClick={() => setLineQty(l.key, Math.min(20, l.qty + 1))} className="w-8 h-8" aria-label="Больше">+</button>
                                        </div>
                                        <span className="font-semibold">{rub(l.bag.price * l.qty)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-6 border-t border-black/10">
                        <div className="flex justify-between text-lg mb-4"><span>Итого</span><b>{rub(total)}</b></div>
                        <button onClick={checkout} disabled={!cart.length} className="w-full rounded-full py-3.5 font-semibold text-white disabled:opacity-30" style={{ background: INK }}>
                            Оформить заказ
                        </button>
                    </div>
                </aside>
            </div>

            <OrderModal
                open={!!order}
                onClose={() => setOrder(null)}
                onDone={() => setCart([])}
                source="bags"
                title="Заказ сумок"
                summary={order?.summary}
                total={order?.total}
                accent={INK}
            />
        </div>
    );
}
