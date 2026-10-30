import { useState, useEffect } from 'react';
import { Button, Spin } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import CarCard from '../components/CarCard.jsx';
import { BankOutlined, ShopOutlined, SwapOutlined } from '@ant-design/icons';
import RouteHero from '../components/RouteHero.jsx';
import { fetchCars } from '../services/MockApi.js';
import LeadModal from '../components/LeadModal';
import AboutContent from '../components/AboutContent';
import BlogContent from '../components/BlogContent';
import ReviewsContent from '../components/ReviewsContent';

const SCROLL_KEY = 'homeScrollPosition';

const AUDIENCES = [
    {
        icon: <BankOutlined />,
        title: 'Компаниям для автопарка',
        desc: 'Машины на баланс компании: договор с юрлицом, расчёт с НДС и закрывающие документы для бухгалтерии.',
    },
    {
        icon: <SwapOutlined />,
        title: 'Дилерам и перекупщикам',
        desc: 'Подбираем ходовые модели под ваш рынок, выкупаем партиями и считаем полную стоимость до покупки.',
    },
    {
        icon: <ShopOutlined />,
        title: 'Автосалонам и площадкам',
        desc: 'Поставки под заказ для продажи в вашем салоне: комплектации, которых нет на российском рынке.',
    },
];

export default function Home() {
    const [leadModalOpen, setLeadModalOpen] = useState(false);
    const [popularCars, setPopularCars] = useState([]);
    const [carsLoading, setCarsLoading] = useState(true);
    const [carsError, setCarsError] = useState(false);
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

            <RouteHero onLead={() => setLeadModalOpen(true)} />

            {/* ============ КОМУ ПОСТАВЛЯЕМ ============ */}
            <section className="px-4 py-14 md:py-20 max-w-7xl mx-auto w-full">
                <h2 className="text-2xl md:text-4xl text-paper mb-10 md:mb-12 max-w-3xl">
                    Кому поставляем
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 border-t border-paper/15">
                    {AUDIENCES.map((item, idx) => (
                        <div
                            key={item.title}
                            className={`pt-6 pb-8 md:pr-8 ${idx > 0 ? 'md:pl-8 md:border-l border-paper/15 border-t md:border-t-0' : ''}`}
                        >
                            <div className="text-brass text-3xl mb-4">{item.icon}</div>
                            <h3 className="text-xl md:text-2xl font-semibold text-paper mb-3">{item.title}</h3>
                            <p className="text-paper/70 leading-relaxed text-lg m-0">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ============ ПОПУЛЯРНЫЕ АВТО ============ */}
            <section className="pb-16 md:pb-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-end mb-8 gap-4 flex-wrap">
                        <div>
                            <h2 className="text-2xl md:text-4xl text-paper m-0">
                                Популярные модели
                            </h2>
                            <p className="text-paper/70 text-lg md:text-xl mt-3 mb-0">
                                Цены в юанях — за автомобиль в Китае, до доставки и таможни
                            </p>
                        </div>

                        <Link
                            to="/catalog"
                            state={{ resetScroll: true }}
                            className="text-brass hover:text-brass-hi text-lg font-medium underline underline-offset-4 decoration-brass/40 whitespace-nowrap"
                        >
                            Весь каталог
                        </Link>
                    </div>

                    {carsLoading ? (
                        <div className="flex justify-center items-center py-24">
                            <Spin size="large" />
                        </div>
                    ) : carsError ? (
                        <div className="text-center py-16 bg-pine-900 rounded-xl border border-paper/10">
                            <h3 className="text-2xl font-semibold text-paper mb-2">
                                Не удалось загрузить автомобили
                            </h3>
                            <p className="text-paper/60 mb-6 text-base">
                                Проверьте соединение и попробуйте обновить страницу
                            </p>
                            <Button
                                onClick={() => window.location.reload()}
                                className="btn-brass !rounded-md !h-10 !px-6"
                            >
                                Обновить
                            </Button>
                        </div>
                    ) : popularCars.length === 0 ? (
                        <div className="text-center py-16 bg-pine-900 rounded-xl border border-paper/10">
                            <h3 className="text-2xl font-semibold text-paper mb-2">
                                Автомобили скоро появятся
                            </h3>
                            <p className="text-paper/60 text-base">
                                Загляните в каталог чуть позже
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {popularCars.map(car => (
                                <CarCard key={car.id} car={car} size="md" />
                            ))}
                        </div>
                    )}

                    <div className="mt-10">
                        <Link to="/catalog" state={{ resetScroll: true }}>
                            <Button size="large" className="btn-ghost !h-12 !px-8 !rounded-md">
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
                title="Обсудить поставку"
                subtitle="Расскажите, какие машины и в каком количестве нужны — менеджер перезвонит"
                successText="Эксперт свяжется с вами в течение 15 минут"
            />
        </div>
    );
}