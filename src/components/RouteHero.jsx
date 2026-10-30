import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import { LeftOutlined, RightOutlined, RedoOutlined } from '@ant-design/icons';

/* ============ ПУТЬ СДЕЛКИ ============
   Каждая точка — этап работы с B2B-клиентом. Тексты без обещаний сроков и цифр:
   цифры появятся, когда будут подтверждены. */
const STEPS = [
    {
        title: 'Заявка',
        text: 'Присылаете, какие машины нужны: модели, комплектации, количество и бюджет. Работаем с компаниями, дилерами и автосалонами.',
        facts: ['Договор с юрлицом или ИП', 'Разовые поставки и партии'],
    },
    {
        title: 'Подбор в Китае',
        text: 'Часть команды работает в Китае: ищем автомобили у дилеров и на площадках, сравниваем предложения и сразу считаем стоимость с доставкой и таможней.',
        facts: ['Китайские, европейские, японские и корейские марки', 'Расчёт до выкупа'],
    },
    {
        title: 'Проверка и выкуп',
        text: 'Осматриваем машины на месте, проверяем документы и историю, присылаем фото и видео. Выкупаем только после вашего согласования.',
        facts: ['Осмотр до оплаты', 'Порядок платежей — в договоре'],
    },
    {
        title: 'Доставка',
        text: 'Организуем доставку из Китая в Россию и сообщаем, на каком этапе находятся машины, пока они в пути.',
        facts: ['Один ответственный менеджер', 'Статус на каждом этапе'],
    },
    {
        title: 'Таможня',
        text: 'Оформляем ввоз на юрлицо или физлицо, оплачиваем платежи по расчёту и готовим документы для постановки на учёт.',
        facts: ['Пошлины, НДС и утильсбор — заранее в расчёте', 'ЭПТС'],
    },
    {
        title: 'Передача',
        text: 'Передаём автомобили с полным пакетом документов — в том числе закрывающими документами для бухгалтерии.',
        facts: ['Документы для бухгалтерии', 'Повторные поставки на тех же условиях'],
    },
];

/* ============ ВИДЕО МАРШРУТА ============
   Один ролик (public/video/hero.mp4, для телефона — hero-mobile.mp4): 6 сцен, между ними
   динамичные переходы. STOPS — время (с), где заканчивается каждый этап: клик проигрывает
   отрезок до следующей точки и ставит паузу. После этапа 6 ролик проходит переход 6 → 1 и
   сцену 1 до LOOP_STOP — этот кадр совпадает с STOPS[0], поэтому возврат к началу без рывка.
   Значения генерирует tools/hero-video/build_hero.py (файл hero.json рядом с роликом). */
const STOPS = [1.9167, 4.375, 7.0833, 9.6667, 12.0833, 15.4583];
const LOOP_STOP = 18.0;
const FRAME = 1 / 24;
/* Источники по порядку предпочтения: браузер берёт первый, который умеет играть.
   AV1 — лучше качество при том же весе; H.264 — для браузеров без AV1. */
const VIDEO = {
    desktop: [
        { src: '/video/hero-1440.av1.mp4', type: 'video/mp4; codecs="av01.0.12M.08"' },
        { src: '/video/hero.mp4', type: 'video/mp4; codecs="avc1.640028"' },
    ],
    mobile: [
        { src: '/video/hero-mobile.av1.mp4', type: 'video/mp4; codecs="av01.0.05M.08"' },
        { src: '/video/hero-mobile.mp4', type: 'video/mp4; codecs="avc1.640020"' },
    ],
    poster: '/video/hero.jpg',
};

const reducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const segmentStart = (i) => (i === 0 ? 0 : STOPS[i - 1]);

/* Первый экран главной: видео на всю ширину, поверх — полупрозрачная плашка
   с текстом и кнопками. Клик по видео или «Дальше» — переход к следующему этапу. */
export default function RouteHero({ onLead }) {
    const videoRef = useRef(null);
    const progressRef = useRef(null);
    const targetRef = useRef(STOPS[0]);   // время, на котором остановиться
    const stepRef = useRef(0);
    const wrapAfterRef = useRef(false);   // доехали до LOOP_STOP → тихо перемотать на STOPS[0]
    const [step, setStep] = useState(0);
    const [dip, setDip] = useState(false); // короткое затемнение при прыжке через этапы

    const [sources] = useState(() =>
        typeof window !== 'undefined' && window.matchMedia?.('(max-width: 767px)').matches ? VIDEO.mobile : VIDEO.desktop,
    );

    const play = useCallback((until) => {
        const v = videoRef.current;
        if (!v) return;
        targetRef.current = until;
        if (reducedMotion()) {
            v.currentTime = until;
            return;
        }
        const p = v.play();
        if (p?.catch) p.catch(() => { v.currentTime = until; }); // автозапуск запрещён — просто показываем кадр
    }, []);

    /* ---------- старт: сцена 1 до первой точки ---------- */
    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;
        const start = () => { v.currentTime = 0; play(STOPS[0]); };
        if (v.readyState >= 1) start();
        else v.addEventListener('loadedmetadata', start, { once: true });
    }, [play]);

    /* ---------- остановка на кадре этапа ----------
       Видео ставится на паузу на том кадре, который сейчас показан, — без перемотки
       (перемотка после паузы давала откат на кадр назад, и картинка «дёргалась»).
       Где есть requestVideoFrameCallback — проверяем каждый показанный кадр точно,
       иначе — по requestAnimationFrame с запасом в один кадр. */
    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;
        const reached = (t) => t >= targetRef.current - FRAME * 1.05; // пауза срабатывает со сдвигом ~1 кадр
        const stop = () => {
            v.pause();
            if (wrapAfterRef.current) {
                wrapAfterRef.current = false;
                targetRef.current = STOPS[0];
                // тот же кадр в начале ролика: хвост и начало совпадают покадрово
                v.currentTime = Math.max(0, STOPS[0] - (LOOP_STOP - v.currentTime));
            }
        };

        let raf = 0;
        let vfc = 0;
        const hasVfc = typeof v.requestVideoFrameCallback === 'function';
        const onFrame = (_now, meta) => {
            vfc = v.requestVideoFrameCallback(onFrame);
            if (!v.paused && reached(meta.mediaTime)) stop();
        };
        if (hasVfc) vfc = v.requestVideoFrameCallback(onFrame);

        const tick = () => {
            raf = requestAnimationFrame(tick);
            if (!hasVfc && !v.paused && v.currentTime >= targetRef.current - FRAME * 1.1) stop();
            // полоска прогресса текущего этапа
            const i = stepRef.current;
            let k = (v.currentTime - segmentStart(i)) / (STOPS[i] - segmentStart(i));
            if (i === 0 && v.currentTime > STOPS[STOPS.length - 1]) k = (v.currentTime - STOPS[5]) / (LOOP_STOP - STOPS[5]);
            if (progressRef.current) progressRef.current.style.transform = `scaleX(${Math.min(1, Math.max(0, k))})`;
        };
        raf = requestAnimationFrame(tick);
        return () => {
            cancelAnimationFrame(raf);
            if (hasVfc) v.cancelVideoFrameCallback?.(vfc);
        };
    }, []);

    /* ---------- переход к этапу ---------- */
    const goTo = useCallback((i) => {
        const v = videoRef.current;
        const target = Math.max(0, Math.min(STEPS.length - 1, i));
        const from = stepRef.current;
        if (target === from || !v) return;
        stepRef.current = target;
        setStep(target);

        // следующий по порядку (и 6 → 1 по кругу) — просто едем дальше
        if (target === from + 1) {
            play(STOPS[target]);
            return;
        }
        if (from === STEPS.length - 1 && target === 0) {
            wrapAfterRef.current = true;
            play(LOOP_STOP);
            return;
        }
        // прыжок: затемнение → встаём в конец предыдущего этапа → проигрываем переход в нужный
        setDip(true);
        window.setTimeout(() => {
            v.pause();
            v.currentTime = segmentStart(target);
            setDip(false);
            play(STOPS[target]);
        }, 220);
    }, [play]);

    const isLast = step === STEPS.length - 1;
    const next = () => goTo(isLast ? 0 : step + 1);
    const prev = () => goTo(step - 1);
    const current = STEPS[step];

    return (
        <section
            className="video-hero relative w-full overflow-hidden bg-pine-950 select-none"
            onKeyDown={(e) => {
                if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
                if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
            }}
        >
            <video
                ref={videoRef}
                className={`video-hero-media absolute inset-0 w-full h-full object-cover ${dip ? 'is-dip' : ''}`}
                poster={VIDEO.poster}
                muted
                playsInline
                preload="auto"
                aria-hidden="true"
                tabIndex={-1}
            >
                {sources.map((s) => <source key={s.src} src={s.src} type={s.type} />)}
            </video>

            {/* Затемнение для читаемости текста: сильнее слева и снизу */}
            <div className="video-hero-scrim absolute inset-0 pointer-events-none" />

            {/* Клик по видео — следующий этап */}
            <button
                type="button"
                className="absolute inset-0 w-full h-full cursor-pointer bg-transparent border-0 p-0"
                onClick={next}
                aria-label={isLast ? 'Начать маршрут сначала' : `Следующий этап: ${STEPS[step + 1].title}`}
            />
            <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col justify-between pointer-events-none">
                {/* Заголовок */}
                <div className="pt-10 md:pt-16 max-w-3xl">
                    <h1 className="text-3xl sm:text-4xl md:text-6xl text-paper m-0 video-hero-shadow">
                        Автомобили из Китая для бизнеса
                    </h1>
                    <p className="text-paper/85 text-lg md:text-xl mt-5 mb-0 max-w-2xl leading-relaxed video-hero-shadow">
                        Поставляем машины компаниям, дилерам и автосалонам: подбор, выкуп, доставка,
                        таможня и документы для бухгалтерии.
                    </p>
                </div>

                {/* Плашка этапа */}
                <div className="video-plate pointer-events-auto mb-6 md:mb-10 w-full md:max-w-[820px] rounded-xl border border-paper/15 p-5 md:p-8">
                    {/* Этапы: номер и полоска; у текущего — прогресс ролика */}
                    <ol className="grid grid-cols-6 gap-1.5 m-0 p-0 list-none" aria-label="Этапы сделки">
                        {STEPS.map((st, i) => (
                            <li key={st.title}>
                                <button
                                    type="button"
                                    onClick={() => goTo(i)}
                                    aria-current={i === step ? 'step' : undefined}
                                    aria-label={`${i + 1}. ${st.title}`}
                                    className="group w-full bg-transparent border-0 p-0 pt-1 cursor-pointer text-left"
                                >
                                    <span className="block h-[3px] rounded-full bg-paper/20 overflow-hidden">
                                        <span
                                            ref={i === step ? progressRef : undefined}
                                            className={`block h-full origin-left ${i < step ? 'bg-brass/70' : i === step ? 'bg-brass' : 'bg-transparent group-hover:bg-paper/30'}`}
                                            style={i === step ? { transform: 'scaleX(0)' } : undefined}
                                        />
                                    </span>
                                    <span className={`block mt-2 text-sm tabular-nums ${i === step ? 'text-brass' : 'text-paper/60'}`}>
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ol>

                    <div key={step} className="route-panel mt-4" aria-live="polite">
                        <h2 className="text-2xl md:text-4xl text-paper m-0">{current.title}</h2>
                        <p className="text-paper/90 text-lg md:text-xl leading-relaxed mt-3 mb-0 max-w-[68ch]">{current.text}</p>
                        <ul className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3 mb-0 p-0 list-none">
                            {current.facts.map((f) => (
                                <li key={f} className="flex items-center gap-2 text-paper text-base md:text-lg">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brass shrink-0" />
                                    {f}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-5">
                        {isLast ? (
                            <>
                                <Button size="large" onClick={onLead} className="btn-brass !h-12 !px-6 !rounded-md !font-semibold">
                                    Обсудить поставку
                                </Button>
                                <Link to="/calculator" state={{ resetScroll: true }}>
                                    <Button size="large" className="btn-ghost !h-12 !px-6 !rounded-md">
                                        Рассчитать стоимость
                                    </Button>
                                </Link>
                                <Button size="large" icon={<RedoOutlined />} onClick={next} className="btn-ghost !h-12 !rounded-md" aria-label="Пройти маршрут заново" />
                            </>
                        ) : (
                            <>
                                <Button
                                    size="large"
                                    icon={<LeftOutlined />}
                                    onClick={prev}
                                    disabled={step === 0}
                                    className="btn-ghost !h-12 !rounded-md disabled:!opacity-30"
                                    aria-label="Предыдущий этап"
                                />
                                <Button size="large" onClick={next} className="btn-brass !h-12 !px-6 !rounded-md !font-semibold">
                                    Дальше: {STEPS[step + 1].title} <RightOutlined />
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>

        </section>
    );
}
