import { useState, useEffect } from 'react';
import { Button, Spin } from 'antd';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    SafetyCertificateOutlined,
    GlobalOutlined,
    DollarOutlined,
    CarOutlined,
    ArrowRightOutlined
} from '@ant-design/icons';
import { fetchCars } from '../services/mockApi';
import LeadModal from '../components/LeadModal';
import AboutContent from '../components/AboutContent';
import BlogContent from '../components/BlogContent';
import ReviewsContent from '../components/ReviewsContent';

const SCROLL_KEY = 'homeScrollPosition';

export default function Home() {
    const [leadModalOpen, setLeadModalOpen] = useState(false);
    const [popularCars, setPopularCars] = useState([]);
    const [carsLoading, setCarsLoading] = useState(true);
    const [carsError, setCarsError] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    /* ============ ЗАГРУЗКА ПОПУЛЯРНЫХ МАШИН С БЭКЕНДА ============ */
    useEffect(() => {
        let ignore = false;

        fetchCars({ filters: {}, page: 1, limit: 9 })
            .then((res) => {
                if (ignore) return;
                setPopularCars(res.cars);
                setCarsLoading(false);
            })
            .catch((err) => {
                if (ignore) return;
                console.error('[Home] Ошибка загрузки машин:', err);
                setCarsError(true);
                setCarsLoading(false);
            });

        return () => {
            ignore = true;
        };
    }, []);

    /* ============ СОХРАНЕНИЕ И ВОССТАНОВЛЕНИЕ ПОЗИЦИИ СКРОЛЛА ============ */
    useEffect(() => {
        // Если явно запросили сброс — очищаем сохранённую позицию и вверх
        if (location.state?.resetScroll) {
            sessionStorage.removeItem(SCROLL_KEY);
            window.scrollTo(0, 0);
            return;
        }

        // Иначе — восстанавливаем сохранённую позицию
        const saved = sessionStorage.getItem(SCROLL_KEY);
        if (saved) {
            const position = parseInt(saved, 10);
            // Ждём отрисовку страницы, потом скроллим
            requestAnimationFrame(() => {
                window.scrollTo(0, position);
            });
        }

        // Сохраняем позицию при скролле
        const saveScroll = () => {
            sessionStorage.setItem(SCROLL_KEY, window.scrollY.toString());
        };

        window.addEventListener('scroll', saveScroll, { passive: true });

        return () => {
            // Сохраняем финальную позицию перед уходом со страницы
            saveScroll();
            window.removeEventListener('scroll', saveScroll);
        };
    }, [location.key]);

    return (
        <div className="flex flex-col">

            {/* ============ HERO ============ */}
            <section className="relative flex items-center justify-center overflow-hidden">
                <div className="relative z-10 text-center px-4 max-w-5xl mx-auto w-full pt-10 pb-14 md:pt-14 md:pb-20">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight drop-shadow-2xl">
                        Автомобили из Китая{' '} <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400">
                            под ключ
                        </span>
                    </h1>
                    <p className="text-slate-100 text-xl md:text-2xl max-w-3xl mx-auto font-light drop-shadow-lg mb-10">
                        Привозим автомобили из Китая с полным таможенным оформлением. Прозрачный расчет, гарантия и доставка до вашего города.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-3xl mx-auto">
                        <Link to="/catalog" state={{ resetScroll: true }} className="w-full sm:flex-1">
                            <Button
                                type="primary"
                                size="large"
                                block
                                className="!h-16 !text-lg md:!text-xl !font-bold !rounded-2xl !bg-gradient-to-r !from-violet-600 !to-fuchsia-600 !border-none hover:!from-violet-500 hover:!to-fuchsia-500 shadow-xl shadow-fuchsia-500/40 transition-all hover:-translate-y-1 w-full"
                            >
                                Перейти в каталог
                            </Button>
                        </Link>
                        <Button
                            size="large"
                            block
                            onClick={() => setLeadModalOpen(true)}
                            className="!h-16 !text-lg md:!text-xl !font-bold !rounded-2xl !bg-white/10 !text-white !border !border-white/30 hover:!bg-white/20 hover:!text-white backdrop-blur-md transition-all hover:-translate-y-1 w-full sm:flex-1"
                        >
                            Получить консультацию
                        </Button>
                    </div>
                </div>
            </section>

            {/* ============ ПРЕИМУЩЕСТВА ============ */}
            <section className="py-12 px-4 max-w-7xl mx-auto w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                        { icon: <DollarOutlined />, title: "Честная цена", desc: "Прозрачный расчет всех расходов без скрытых комиссий.", color: "from-cyan-400 to-blue-500", shadow: "shadow-cyan-500/30" },
                        { icon: <GlobalOutlined />, title: "Прямые поставки", desc: "Работаем напрямую с аукционами и дилерами Китая.", color: "from-blue-500 to-indigo-500", shadow: "shadow-blue-500/30" },
                        { icon: <SafetyCertificateOutlined />, title: "Полная гарантия", desc: "Юридическая чистота и помощь с постановкой на учет.", color: "from-violet-500 to-fuchsia-500", shadow: "shadow-violet-500/30" },
                        { icon: <CarOutlined />, title: "Любая комплектация", desc: "Подберем авто под ваш бюджет и пожелания.", color: "from-fuchsia-500 to-pink-500", shadow: "shadow-fuchsia-500/30" }
                    ].map((item, idx) => (
                        <div key={idx} className="bg-white/90 backdrop-blur-xl p-7 rounded-3xl shadow-2xl border border-white/50 hover:-translate-y-2 transition-transform duration-300">
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center text-3xl mb-5 shadow-lg ${item.shadow}`}>
                                {item.icon}
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-slate-800">{item.title}</h3>
                            <p className="text-slate-600 leading-relaxed text-lg">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ============ ПОПУЛЯРНЫЕ АВТО ============ */}
            <section className="pb-14 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-end mb-8 gap-4 flex-wrap">
                        <div>
                            <h2 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white drop-shadow-2xl">
                                Популярные модели
                            </h2>
                            <p className="text-slate-100 text-xl md:text-2xl font-light drop-shadow-lg mt-4">
                                Самые востребованные автомобили из Китая
                            </p>
                        </div>

                        <Link
                            to="/catalog"
                            state={{ resetScroll: true }}
                            className="inline-block p-[2px] rounded-3xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:scale-105 transition-transform duration-300 shadow-lg shadow-fuchsia-500/30"
                        >
                            <span className="flex items-center justify-center px-6 py-3 md:px-8 md:py-3.5 rounded-[22px] bg-blue-950/80 backdrop-blur-md text-white font-extrabold text-xl md:text-2xl whitespace-nowrap">
                                Смотреть все →
                            </span>
                        </Link>
                    </div>

                    {carsLoading ? (
                        <div className="flex justify-center items-center py-24">
                            <Spin size="large" />
                        </div>
                    ) : carsError ? (
                        <div className="text-center py-16 bg-white/90 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl">
                            <h3 className="text-2xl font-bold text-slate-500 mb-2">
                                Не удалось загрузить автомобили
                            </h3>
                            <p className="text-slate-400 mb-6 text-base">
                                Проверьте соединение и попробуйте обновить страницу
                            </p>
                            <Button
                                onClick={() => window.location.reload()}
                                className="!bg-slate-900 !text-white rounded-xl h-10 px-6"
                            >
                                Обновить
                            </Button>
                        </div>
                    ) : popularCars.length === 0 ? (
                        <div className="text-center py-16 bg-white/90 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl">
                            <h3 className="text-2xl font-bold text-slate-500 mb-2">
                                Автомобили скоро появятся
                            </h3>
                            <p className="text-slate-400 text-base">
                                Загляните в каталог чуть позже
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {popularCars.map(car => (
                                <div
                                    key={car.id}
                                    onClick={() => navigate(`/car/${car.id}`)}
                                    className="group relative rounded-2xl overflow-hidden h-80 cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-blue-900/50 transition-all duration-300 hover:-translate-y-1 flex flex-col"
                                >
                                    <img
                                        alt={car.name}
                                        src={car.images[0]}
                                        style={{ objectPosition: 'center 60%' }}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />

                                    <div className="flex-1 relative z-10"></div>

                                    <div className="relative z-10 bg-white/65 backdrop-blur-md border-t border-white/50 p-4">
                                        <div className="flex items-baseline justify-between gap-2 mb-1.5">
                                            <h3 className="text-lg font-bold text-slate-800 line-clamp-1">
                                                {car.name}
                                            </h3>
                                            <span className="text-sm text-slate-700 font-medium shrink-0">
                                                {car.year} г.
                                            </span>
                                        </div>
                                        <div className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">
                                            {car.price.toLocaleString('ru-RU')} ¥
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-12">
                        <Link to="/catalog" state={{ resetScroll: true }} className="block">
                            <Button
                                type="primary"
                                size="large"
                                block
                                icon={<ArrowRightOutlined className="text-2xl" />}
                                className="!h-20 !text-xl md:!text-2xl !font-extrabold !rounded-3xl !bg-gradient-to-r !from-violet-600 !to-fuchsia-600 !border-none hover:!from-violet-500 hover:!to-fuchsia-500 !text-white shadow-2xl shadow-fuchsia-500/50 transition-all hover:scale-[1.01]"
                            >
                                Перейти в каталог
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            <AboutContent />
            <BlogContent />
            <ReviewsContent />

            <LeadModal
                open={leadModalOpen}
                onClose={() => setLeadModalOpen(false)}
                title="Получить консультацию"
                subtitle="Эксперт по автоподбору ответит на ваши вопросы"
                successText="Эксперт свяжется с вами в течение 15 минут"
            />
        </div>
    );
}