import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { sendShopOrder, rub } from '../../services/ShopApi.js';

/* Оформление заказа на /box и /bags → общие заявки админки (source = box / bags).
   dark — тёмная тема (боксы), иначе светлая (сумки). */

const digitsOf = (v) => String(v || '').replace(/\D/g, '').replace(/^[78]/, '').slice(0, 10);
const fmtPhone = (d) => {
    if (!d) return '';
    let s = '+7 (' + d.slice(0, 3);
    if (d.length >= 3) s += ')';
    if (d.length > 3) s += ' ' + d.slice(3, 6);
    if (d.length > 6) s += '-' + d.slice(6, 8);
    if (d.length > 8) s += '-' + d.slice(8, 10);
    return s;
};

const METHODS = ['Звонок', 'WhatsApp', 'Telegram'];

export default function OrderModal({ open, onClose, source, title, summary, total, onDone, dark = false, accent = '#E5483A' }) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [method, setMethod] = useState('Звонок');
    const [comment, setComment] = useState('');
    const [address, setAddress] = useState('');
    const [consent, setConsent] = useState(true);
    const [state, setState] = useState('form'); // form | sending | done | error
    const [error, setError] = useState('');

    useEffect(() => {
        if (!open) return undefined;
        setState('form'); setError('');
        const onKey = (e) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
    }, [open, onClose]);

    if (!open) return null;

    const d = digitsOf(phone);
    const valid = d.length === 10 && consent;

    const submit = async (e) => {
        e.preventDefault();
        if (!valid) { setError(d.length < 10 ? 'Введите номер телефона полностью' : 'Нужно согласие на обработку данных'); return; }
        setState('sending'); setError('');
        try {
            const text = [summary, address && `Адрес доставки: ${address}`, comment && `Комментарий: ${comment}`]
                .filter(Boolean).join('\n\n');
            await sendShopOrder({ source, name: name.trim(), phone: fmtPhone(d), contactMethod: method, text, total, consent });
            setState('done');
            onDone?.();
        } catch (err) {
            setState('form');
            setError('Не удалось отправить: ' + err.message + '. Позвоните нам: +7 987 498 17 37');
        }
    };

    const c = dark
        ? { panel: 'bg-[#11141d] text-white border border-white/10', input: 'bg-white/5 border-white/15 text-white placeholder:text-white/35 focus:border-white/50', muted: 'text-white/55', chip: 'border-white/20 text-white/80', chipOn: 'text-black' }
        : { panel: 'bg-[#F6F2EA] text-[#161513] border border-black/10', input: 'bg-white border-black/15 text-[#161513] placeholder:text-black/35 focus:border-black/60', muted: 'text-black/55', chip: 'border-black/20 text-black/75', chipOn: 'text-white' };
    const inputCls = `w-full rounded-lg border px-4 py-3 text-base outline-none transition-colors ${c.input}`;

    return (
        <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-6" role="dialog" aria-modal="true">
            <button aria-label="Закрыть" onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-default" />
            <div className={`relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-6 sm:p-8 ${c.panel}`}>
                <button onClick={onClose} aria-label="Закрыть" className={`absolute top-4 right-4 w-9 h-9 rounded-full grid place-items-center text-xl ${c.muted} hover:opacity-100`}>×</button>

                {state === 'done' ? (
                    <div className="py-8 text-center">
                        <div className="text-5xl mb-4">✓</div>
                        <h3 className="text-2xl font-semibold mb-2">Заказ принят</h3>
                        <p className={c.muted}>Мы свяжемся с вами в течение рабочего дня, уточним детали и доставку.</p>
                        <button onClick={onClose} className="mt-8 rounded-full px-7 py-3 font-semibold" style={{ background: accent, color: dark ? '#000' : '#fff' }}>Хорошо</button>
                    </div>
                ) : (
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <div className={`micro ${c.muted}`}>Оформление заказа</div>
                            <h3 className="text-2xl font-semibold mt-1">{title}</h3>
                            {total ? <div className="mt-1 text-lg">Итого: <b>{rub(total)}</b></div> : null}
                        </div>
                        {summary && (
                            <pre className={`whitespace-pre-wrap text-sm rounded-lg p-3 max-h-40 overflow-auto font-sans ${dark ? 'bg-white/5' : 'bg-black/[0.04]'}`}>{summary}</pre>
                        )}
                        <input className={inputCls} placeholder="Ваше имя" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="name" />
                        <input
                            className={inputCls} placeholder="+7 (___) ___-__-__" inputMode="tel" autoComplete="tel"
                            value={fmtPhone(d)}
                            onChange={(e) => {
                                const next = digitsOf(e.target.value);
                                // стирание «)» или «-» — убираем последнюю цифру, иначе маска вернёт символ
                                setPhone(e.target.value.length < fmtPhone(d).length && next === d ? d.slice(0, -1) : next);
                            }}
                        />
                        <div>
                            <div className={`text-sm mb-2 ${c.muted}`}>Как связаться</div>
                            <div className="flex flex-wrap gap-2">
                                {METHODS.map((m) => (
                                    <button type="button" key={m} onClick={() => setMethod(m)}
                                            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${method === m ? c.chipOn : c.chip}`}
                                            style={method === m ? { background: accent, borderColor: accent } : undefined}>
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <input className={inputCls} placeholder="Город и адрес доставки (можно позже)" value={address} onChange={(e) => setAddress(e.target.value)} maxLength={300} />
                        <textarea className={inputCls} rows={2} placeholder="Комментарий: открытка, пожелания, сроки" value={comment} onChange={(e) => setComment(e.target.value)} maxLength={600} />
                        <label className={`flex gap-3 text-sm ${c.muted}`}>
                            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 w-4 h-4 shrink-0" style={{ accentColor: accent }} />
                            <span>Согласен на обработку персональных данных по <Link to="/cars/privacy" target="_blank" className="underline">политике конфиденциальности</Link></span>
                        </label>
                        {error && <div className="text-sm text-red-500">{error}</div>}
                        <button type="submit" disabled={state === 'sending'}
                                className="w-full rounded-full py-3.5 font-semibold text-base transition-opacity disabled:opacity-60"
                                style={{ background: accent, color: dark ? '#000' : '#fff' }}>
                            {state === 'sending' ? 'Отправляем…' : 'Отправить заказ'}
                        </button>
                        <p className={`text-xs text-center ${c.muted}`}>Оплата после подтверждения заказа менеджером</p>
                    </form>
                )}
            </div>
        </div>
    );
}
