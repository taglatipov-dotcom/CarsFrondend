import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchShop, boxTotals, presetPrice, itemVolume, rub, BOX_LIMITS } from '../services/ShopApi.js';
import { toThumbUrl } from '../services/urls.js';
import { Particles, useBodyBg, useMeta } from '../components/shop/fx.jsx';
import { GiftArt } from '../components/shop/Art.jsx';
import SiteNav from '../components/shop/SiteNav.jsx';
import OrderModal from '../components/shop/OrderModal.jsx';
import '../components/shop/shop.css';

/*
 * /box — новогодние боксы. Всё нужное — на первом экране:
 *   шапка → компактная полоса (заголовок, отсчёт до НГ, вкладки) → сразу контент вкладки.
 *   Вкладка «Собрать свой» (по умолчанию): категории | товары | «Ваш бокс» (липкая панель).
 *     Пока бокс пуст, в панели — быстрый старт с готовых боксов.
 *   Вкладка «Готовые боксы»: сетка из 10 карточек — «Заказать» или «Изменить состав».
 * Лимиты — BOX_LIMITS (5 кг, 30×30×30): «+» блокируется, если товар не поместится.
 * Заказ → общие заявки админки (source = "box").
 */

const ACCENT = '#E5483A';
const BG = '#0B0D14';
const pad = (n) => String(n).padStart(2, '0');

function useCountdown() {
    const target = useMemo(() => {
        const now = new Date();
        return new Date(now.getFullYear() + (now.getMonth() === 0 && now.getDate() === 1 ? 0 : 1), 0, 1);
    }, []);
    const [left, setLeft] = useState(() => target - new Date());
    useEffect(() => { const i = setInterval(() => setLeft(target - new Date()), 1000); return () => clearInterval(i); }, [target]);
    const s = Math.max(0, Math.floor(left / 1000));
    return { year: target.getFullYear(), d: Math.floor(s / 86400), h: Math.floor(s / 3600) % 24, m: Math.floor(s / 60) % 60, sec: s % 60 };
}

function ItemPic({ item, className = '' }) {
    if (item.image) return <img src={toThumbUrl(item.image)} alt={item.name} loading="lazy" className={`object-contain ${className}`} />;
    return <span className={`grid place-items-center leading-none ${className}`} aria-hidden="true">{item.emoji || '🎁'}</span>;
}

function Meter({ label, value, pct, over }) {
    return (
        <div>
            <div className="flex justify-between micro text-white/55 mb-1.5">
                <span>{label}</span>
                <span className={over ? 'text-red-400' : 'text-white'}>{value}</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full transition-[width] duration-500"
                     style={{ width: `${pct}%`, background: over ? '#ff6b6b' : pct > 85 ? '#F2B544' : ACCENT }} />
            </div>
        </div>
    );
}

function Qty({ q, onMinus, onPlus, canPlus }) {
    return (
        <span className="flex items-center gap-1">
            <button onClick={onMinus} className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20" aria-label="Убрать">−</button>
            <span className="w-5 text-center tabular-nums text-sm">{q}</span>
            <button onClick={onPlus} disabled={!canPlus} title={canPlus ? '' : 'Не поместится в бокс'}
                    className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30" aria-label="Добавить">+</button>
        </span>
    );
}

export default function Box() {
    useBodyBg(BG);
    useMeta('Соберите новогодний подарочный бокс из 40 товаров или выберите готовый: мандарины, шоколад, пряники, чай, свечи. До 5 кг, 30×30×30 см.');

    const [items, setItems] = useState([]);
    const [presets, setPresets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tab, setTab] = useState('build'); // build | ready
    const [cat, setCat] = useState('Все');
    const [cart, setCart] = useState({}); // item_id → qty
    const [bump, setBump] = useState(0);
    const [drawer, setDrawer] = useState(false);
    const [order, setOrder] = useState(null); // { title, summary, total }
    const cd = useCountdown();

    useEffect(() => {
        Promise.all([fetchShop('box_items'), fetchShop('box_presets')])
            .then(([i, p]) => { setItems(i); setPresets(p); })
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    const byId = useMemo(() => Object.fromEntries(items.map((i) => [i.id, i])), [items]);
    const cats = useMemo(() => {
        const counts = items.reduce((m, i) => ({ ...m, [i.category]: (m[i.category] || 0) + 1 }), {});
        return [['Все', items.length], ...Object.entries(counts)];
    }, [items]);
    const lines = useMemo(() => Object.entries(cart).filter(([, q]) => q > 0)
        .map(([id, qty]) => ({ item: byId[id], qty })).filter((l) => l.item), [cart, byId]);
    const t = useMemo(() => boxTotals(lines), [lines]);
    const presetsPriced = useMemo(() => presets.map((p) => ({ p, pp: presetPrice(p, byId) })), [presets, byId]);

    const canAdd = useCallback((it) =>
        t.weight + it.weight_g <= BOX_LIMITS.weightG && t.volume + itemVolume(it) <= BOX_LIMITS.volume, [t]);

    const change = (it, delta) => {
        if (delta > 0 && !canAdd(it)) return;
        setCart((c) => ({ ...c, [it.id]: Math.max(0, (c[it.id] || 0) + delta) }));
        if (delta > 0) setBump((b) => b + 1);
    };

    const loadPreset = (p) => {
        setCart(Object.fromEntries((p.items || []).map((l) => [l.item_id, l.qty])));
        setTab('build');
        setBump((b) => b + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const summaryOf = (ls, head) => {
        const tt = boxTotals(ls);
        return [head, ...ls.map(({ item, qty }) => `• ${item.name} × ${qty} — ${rub(item.price * qty)}`),
            `Вес: ${(tt.weight / 1000).toFixed(2)} кг, заполнение: ${Math.round(tt.volumePct)}%`].join('\n');
    };

    const orderPreset = (p, pp) => setOrder({
        title: `Бокс «${p.name}»`,
        summary: summaryOf(pp.lines, `Готовый бокс «${p.name}»${p.discount ? ` (скидка ${p.discount}%)` : ''}`),
        total: pp.final,
    });

    const orderCustom = () => {
        if (!lines.length) return;
        setDrawer(false);
        setOrder({ title: 'Мой бокс', summary: summaryOf(lines, 'Собранный бокс'), total: t.price });
    };

    const visible = cat === 'Все' ? items : items.filter((i) => i.category === cat);

    /* ---------- панель «Ваш бокс» (ПК — справа, телефон — шторка) ---------- */
    const BoxPanel = (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
                <GiftArt key={bump} line={t.count ? ACCENT : 'rgba(255,255,255,.35)'} draw={false}
                         className={`w-16 h-16 shrink-0 text-white ${bump ? 'fx-pop' : ''}`} />
                <div className="min-w-0">
                    <div className="micro text-white/45">Ваш бокс · {t.count} шт</div>
                    <div className="text-3xl font-display-x leading-tight">{rub(t.price)}</div>
                </div>
            </div>
            <Meter label="Вес" value={`${(t.weight / 1000).toFixed(2)} / 5 кг`} pct={t.weightPct} over={t.overWeight} />
            <Meter label="Коробка 30×30×30" value={`${Math.round(t.volumePct)}%`} pct={t.volumePct} over={t.overVolume} />

            {lines.length ? (
                <ul className="divide-y divide-white/10 overflow-y-auto no-scrollbar -mx-1 max-h-[34vh] lg:max-h-none lg:flex-1">
                    {lines.map(({ item, qty }) => (
                        <li key={item.id} className="flex items-center gap-3 py-2 px-1">
                            <ItemPic item={item} className="w-8 h-8 text-2xl shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="text-sm truncate">{item.name}</div>
                                <div className="text-xs text-white/45">{rub(item.price * qty)}</div>
                            </div>
                            <Qty q={qty} onMinus={() => change(item, -1)} onPlus={() => change(item, 1)} canPlus={canAdd(item)} />
                        </li>
                    ))}
                </ul>
            ) : (
                <div>
                    <p className="text-white/50 text-sm m-0 mb-3">Добавьте товары или начните с готового бокса:</p>
                    <div className="flex flex-col gap-2">
                        {presetsPriced.slice(0, 4).map(({ p, pp }) => (
                            <button key={p.id} onClick={() => loadPreset(p)}
                                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-left bg-white/[0.04] hover:bg-white/[0.08] border border-white/10">
                                <span className="w-2 h-8 rounded-full shrink-0" style={{ background: p.color || ACCENT }} />
                                <span className="flex-1 min-w-0">
                                    <span className="block text-sm truncate">{p.name}</span>
                                    <span className="block text-xs text-white/45">{pp.count} шт · {rub(pp.final)}</span>
                                </span>
                                <span className="micro text-white/50">взять</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <button onClick={orderCustom} disabled={!lines.length}
                    className="w-full rounded-full py-3.5 font-semibold text-black disabled:opacity-30 transition-transform active:scale-[.98]"
                    style={{ background: ACCENT }}>
                Оформить бокс
            </button>
            {lines.length > 0 && (
                <button onClick={() => setCart({})} className="micro text-white/40 hover:text-white">Очистить</button>
            )}
        </div>
    );

    const tabBtn = (key, label, count) => (
        <button onClick={() => setTab(key)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${tab === key ? 'text-black' : 'text-white/70 hover:text-white'}`}
                style={tab === key ? { background: ACCENT } : undefined}>
            {label}{count ? <span className="opacity-60"> · {count}</span> : null}
        </button>
    );

    return (
        <div className="shop-root min-h-screen text-white" style={{ background: BG, fontFamily: "'Onest', sans-serif" }}>
            <SiteNav
                theme="dark"
                right={(
                    <button onClick={() => setDrawer(true)} className="lg:hidden relative text-xl" aria-label="Мой бокс">
                        🎁{t.count > 0 && <span className="absolute -top-1.5 -right-2.5 text-[10px] rounded-full px-1.5 text-black font-semibold" style={{ background: ACCENT }}>{t.count}</span>}
                    </button>
                )}
            />

            {/* компактная полоса: заголовок + отсчёт + вкладки */}
            <section className="relative overflow-hidden border-b border-white/10" style={{ background: 'linear-gradient(100deg, #1A0B0D 0%, #0B0D14 60%)' }}>
                <Particles mode="snow" className="absolute inset-0 w-full h-full opacity-60" />
                <div className="relative max-w-[1400px] mx-auto px-3 sm:px-6 py-4 sm:py-5 flex flex-wrap items-center gap-x-8 gap-y-3">
                    <div className="mr-auto">
                        <h1 className="font-display-x text-2xl sm:text-3xl font-medium m-0 leading-tight">Новогодние боксы</h1>
                        <p className="text-white/55 text-sm m-0 mt-1">Соберите свой или выберите готовый · до 5 кг · коробка 30×30×30 см</p>
                    </div>
                    <div className="hidden md:flex items-baseline gap-3 font-mono-x" title={`До ${cd.year} года`}>
                        <span className="micro text-white/40">до {cd.year}</span>
                        <span className="text-lg tabular-nums">{cd.d}<span className="text-white/40 text-xs"> д </span>{pad(cd.h)}<span className="text-white/40 text-xs"> ч </span>{pad(cd.m)}<span className="text-white/40 text-xs"> м </span>{pad(cd.sec)}</span>
                    </div>
                    <div className="flex gap-1 rounded-full p-1 bg-white/[0.06] border border-white/10">
                        {tabBtn('build', 'Собрать свой')}
                        {tabBtn('ready', 'Готовые боксы', presets.length)}
                    </div>
                </div>
            </section>

            {error && <div className="max-w-[1400px] mx-auto px-6 py-6 text-red-400">Не удалось загрузить товары: {error}</div>}

            <main className="max-w-[1400px] mx-auto px-3 sm:px-6 py-4 sm:py-6">
                {tab === 'build' ? (
                    <div className="grid lg:grid-cols-[190px_1fr_340px] gap-5 items-start">
                        {/* категории: ПК — колонка, телефон — лента */}
                        <nav className="lg:sticky lg:top-20 flex lg:flex-col gap-1 overflow-x-auto no-scrollbar -mx-3 px-3 lg:mx-0 lg:px-0">
                            {cats.map(([c, n]) => (
                                <button key={c} onClick={() => setCat(c)}
                                        className={`shrink-0 flex items-center justify-between gap-3 rounded-full lg:rounded-lg px-4 lg:px-3 py-2 text-sm text-left transition-colors ${cat === c ? 'bg-white text-black' : 'text-white/65 hover:text-white hover:bg-white/5 border border-white/10 lg:border-transparent'}`}>
                                    <span>{c}</span><span className={`hidden lg:inline text-xs ${cat === c ? 'text-black/50' : 'text-white/30'}`}>{n}</span>
                                </button>
                            ))}
                        </nav>

                        {/* товары */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
                            {loading && Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-52 rounded-xl bg-white/5 animate-pulse" />)}
                            {visible.map((it) => {
                                const q = cart[it.id] || 0;
                                const fits = canAdd(it);
                                return (
                                    <div key={it.id}
                                         className={`group relative rounded-xl p-3 sm:p-4 flex flex-col transition-colors ${q ? 'bg-[#E5483A]/[0.10] ring-1 ring-[#E5483A]/60' : 'bg-white/[0.04] hover:bg-white/[0.07] ring-1 ring-white/[0.06]'}`}>
                                        <ItemPic item={it} className="h-16 sm:h-20 w-full text-5xl sm:text-6xl mb-2 transition-transform duration-500 group-hover:scale-110" />
                                        <div className="text-sm leading-snug flex-1">{it.name}</div>
                                        <div className="text-[11px] text-white/40 mt-1 font-mono-x">{it.weight_g} г · {it.w}×{it.h}×{it.d}</div>
                                        <div className="flex items-center justify-between mt-2.5 gap-2">
                                            <span className="font-semibold">{rub(it.price)}</span>
                                            {q ? (
                                                <Qty q={q} onMinus={() => change(it, -1)} onPlus={() => change(it, 1)} canPlus={fits} />
                                            ) : (
                                                <button onClick={() => change(it, 1)} disabled={!fits} title={fits ? '' : 'Не поместится в бокс'}
                                                        className="w-8 h-8 rounded-full text-black text-lg font-semibold disabled:opacity-25 disabled:bg-white/40 transition-transform hover:scale-110"
                                                        style={{ background: fits ? ACCENT : undefined }} aria-label={`Добавить ${it.name}`}>
                                                    +
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* панель бокса (ПК) */}
                        <aside className="hidden lg:flex flex-col sticky top-20 max-h-[calc(100vh-6rem)] rounded-2xl bg-white/[0.05] ring-1 ring-white/10 p-5 overflow-hidden">
                            {BoxPanel}
                        </aside>
                    </div>
                ) : (
                    /* готовые боксы */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                        {loading && Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-80 rounded-2xl bg-white/5 animate-pulse" />)}
                        {presetsPriced.map(({ p, pp }, i) => {
                            const color = p.color || ACCENT;
                            return (
                                <article key={p.id} className="group rounded-2xl overflow-hidden ring-1 ring-white/10 bg-white/[0.03] flex flex-col hover:ring-white/25 transition-shadow">
                                    <div className="relative h-32 overflow-hidden" style={{ background: `linear-gradient(150deg, ${color}, ${color}66)` }}>
                                        {p.image ? (
                                            <img src={toThumbUrl(p.image)} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                                        ) : (
                                            <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-1 p-4">
                                                {pp.lines.slice(0, 7).map(({ item }, k) => (
                                                    <span key={item.id} className="text-3xl transition-transform duration-500 group-hover:-translate-y-1" style={{ transitionDelay: `${k * 40}ms` }}>{item.emoji || '🎁'}</span>
                                                ))}
                                            </div>
                                        )}
                                        <span className="absolute top-2.5 left-3 micro text-white/85">№{pad(i + 1)}</span>
                                        {p.discount > 0 && <span className="absolute top-2 right-2 micro bg-black/70 rounded-full px-2 py-0.5">−{p.discount}%</span>}
                                    </div>
                                    <div className="p-4 flex flex-col flex-1">
                                        <h3 className="text-lg font-semibold m-0">{p.name}</h3>
                                        <p className="text-white/55 text-sm mt-1 mb-0 flex-1 line-clamp-2">{p.tagline}</p>
                                        <div className="micro text-white/35 mt-3">{pp.count} шт · {(pp.weight / 1000).toFixed(1)} кг</div>
                                        <div className="flex items-baseline gap-2 mt-1">
                                            <span className="text-xl font-display-x">{rub(pp.final)}</span>
                                            {pp.final < pp.full && <span className="text-white/35 line-through text-xs">{rub(pp.full)}</span>}
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mt-3">
                                            <button onClick={() => orderPreset(p, pp)} className="rounded-full py-2 font-semibold text-black text-sm" style={{ background: ACCENT }}>Заказать</button>
                                            <button onClick={() => loadPreset(p)} className="rounded-full py-2 text-sm bg-white/10 hover:bg-white/20">Изменить</button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </main>

            <footer className="border-t border-white/10 mt-6">
                <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-6 flex flex-wrap justify-between gap-4 micro text-white/40">
                    <span>Собираете → подтверждаем по телефону → доставляем к нужной дате</span>
                    <span className="flex gap-6">
                        <Link to="/bags" className="!text-white/40 hover:!text-white">Сумки</Link>
                        <Link to="/cars" className="!text-white/40 hover:!text-white">Авто</Link>
                        <span>© {new Date().getFullYear()} ILSATAO</span>
                    </span>
                </div>
            </footer>

            {/* телефон: нижняя полоса и шторка «Мой бокс» */}
            <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 p-3 bg-[#0B0D14]/90 backdrop-blur border-t border-white/10">
                <button onClick={() => setDrawer(true)} className="w-full flex items-center justify-between rounded-full px-5 py-3 text-black font-semibold" style={{ background: ACCENT }}>
                    <span>Мой бокс · {t.count} шт</span>
                    <span>{rub(t.price)} · {Math.round(t.volumePct)}%</span>
                </button>
            </div>
            {drawer && (
                <div className="lg:hidden fixed inset-0 z-[60]">
                    <button aria-label="Закрыть" className="absolute inset-0 bg-black/60" onClick={() => setDrawer(false)} />
                    <div className="absolute bottom-0 inset-x-0 max-h-[88vh] overflow-y-auto rounded-t-2xl bg-[#11141d] border-t border-white/10 p-5">
                        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-4" />
                        {BoxPanel}
                    </div>
                </div>
            )}
            <div className="lg:hidden h-20" />

            <OrderModal
                open={!!order}
                onClose={() => setOrder(null)}
                source="box"
                title={order?.title}
                summary={order?.summary}
                total={order?.total}
                dark
                accent={ACCENT}
            />
        </div>
    );
}
