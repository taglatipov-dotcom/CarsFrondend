import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Descriptions, Button, Carousel, Spin, Tabs, Tag, Modal } from 'antd';
import {
    ArrowLeftOutlined,
    CalculatorOutlined,
    EnvironmentOutlined,
    CheckCircleOutlined,
    SafetyCertificateOutlined,
    ThunderboltOutlined,
    CarOutlined,
    InfoCircleOutlined,
    LeftOutlined,
    RightOutlined,
    ZoomInOutlined,
    CloseOutlined,
    PhoneOutlined
} from '@ant-design/icons';
import { fetchCarById, translateBodyType } from '../services/MockApi.js';
import { toImageUrl } from '../services/urls.js';
import CostCalculatorModal from '../components/CostCalculatorModal';
import LeadModal from '../components/LeadModal';

export default function CarDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [leadModalOpen, setLeadModalOpen] = useState(false);

    const [currentSlide, setCurrentSlide] = useState(0);

    const goPrev = () => {
        setCurrentSlide((prev) => (prev === 0 ? car.images.length - 1 : prev - 1));
    };
    const goNext = () => {
        setCurrentSlide((prev) => (prev === car.images.length - 1 ? 0 : prev + 1));
    };

    const [photoModalOpen, setPhotoModalOpen] = useState(false);
    const [photoIndex, setPhotoIndex] = useState(0);
    const modalCarouselRef = useRef(null);

    useEffect(() => {
        fetchCarById(id).then(data => {
            setCar(data);
            setLoading(false);
        });
    }, [id]);

    useEffect(() => {
        if (photoModalOpen && modalCarouselRef.current) {
            setTimeout(() => {
                modalCarouselRef.current?.goTo(photoIndex, false);
            }, 50);
        }
    }, [photoModalOpen]);

    useEffect(() => {
        if (!photoModalOpen) return;
        const handleKey = (e) => {
            if (e.key === 'ArrowLeft') modalCarouselRef.current?.prev();
            if (e.key === 'ArrowRight') modalCarouselRef.current?.next();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [photoModalOpen]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[70vh]">
                <Spin size="large" />
            </div>
        );
    }

    if (!car) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[70vh] text-white">
                <h2 className="text-3xl font-bold mb-4">Автомобиль не найден</h2>
                <Button type="primary" onClick={() => navigate('/catalog')} className="!bg-slate-900 hover:!bg-slate-800">
                    Вернуться в каталог
                </Button>
            </div>
        );
    }

    const openPhotoModal = (index) => {
        setPhotoIndex(index);
        setPhotoModalOpen(true);
    };

    const overviewTab = (
        <div className="py-4">
            <p className="text-slate-600 leading-relaxed text-lg mb-8">{car.description}</p>
            <Descriptions
                column={{ xs: 1, sm: 2 }}
                bordered
                size="middle"
                labelStyle={{ fontWeight: '600', color: '#475569', backgroundColor: '#f8fafc', width: '35%', fontSize: '16px' }}
                contentStyle={{ fontWeight: '500', color: '#0f172a', fontSize: '16px' }}
            >
                <Descriptions.Item label="Год выпуска">{car.year}</Descriptions.Item>
                <Descriptions.Item label="Тип кузова">{translateBodyType(car.bodyType)}</Descriptions.Item>
                <Descriptions.Item label="Объём двигателя">{car.specs.engineVolume}</Descriptions.Item>
                <Descriptions.Item label="Цвет">{car.color}</Descriptions.Item>
                <Descriptions.Item label="Привод">{car.drive}</Descriptions.Item>
                <Descriptions.Item label="Пробег">
                    {car.mileage === 0 ? '0 км (новый)' : `${car.mileage.toLocaleString('ru-RU')} км`}
                </Descriptions.Item>
                <Descriptions.Item label="Местоположение">{car.location}</Descriptions.Item>
                <Descriptions.Item label="Дата добавления">{car.createdAt}</Descriptions.Item>
            </Descriptions>
        </div>
    );

    const specsTab = (
        <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Descriptions
                title={<span className="text-2xl font-bold text-slate-800">Силовая установка</span>}
                column={1}
                bordered
                size="middle"
                labelStyle={{ fontWeight: '600', color: '#475569', backgroundColor: '#f8fafc', width: '50%', fontSize: '16px' }}
                contentStyle={{ fontSize: '16px', color: '#0f172a' }}
            >
                <Descriptions.Item label="Двигатель">{car.specs.engine}</Descriptions.Item>
                <Descriptions.Item label="Объём двигателя">{car.specs.engineVolume}</Descriptions.Item>
                <Descriptions.Item label="Мощность">{car.specs.power}</Descriptions.Item>
                <Descriptions.Item label="Крутящий момент">{car.specs.torque}</Descriptions.Item>
                <Descriptions.Item label="Разгон 0-100 км/ч">{car.specs.acceleration}</Descriptions.Item>
                <Descriptions.Item label="Макс. скорость">{car.specs.topSpeed}</Descriptions.Item>
                <Descriptions.Item label="Коробка передач">{car.specs.transmission}</Descriptions.Item>
                <Descriptions.Item label="Привод">{car.specs.drive}</Descriptions.Item>
            </Descriptions>

            <Descriptions
                title={<span className="text-2xl font-bold text-slate-800">Батарея и запас хода</span>}
                column={1}
                bordered
                size="middle"
                labelStyle={{ fontWeight: '600', color: '#475569', backgroundColor: '#f8fafc', width: '50%', fontSize: '16px' }}
                contentStyle={{ fontSize: '16px', color: '#0f172a' }}
            >
                <Descriptions.Item label="Тип топлива">{car.specs.fuelType}</Descriptions.Item>
                <Descriptions.Item label="Батарея">{car.specs.battery}</Descriptions.Item>
                <Descriptions.Item label="Запас хода">{car.specs.range}</Descriptions.Item>
                <Descriptions.Item label="Зарядка">{car.specs.charging}</Descriptions.Item>
                <Descriptions.Item label="Расход">{car.specs.consumption}</Descriptions.Item>
            </Descriptions>

            <Descriptions
                title={<span className="text-2xl font-bold text-slate-800">Габариты и масса</span>}
                column={1}
                bordered
                size="middle"
                labelStyle={{ fontWeight: '600', color: '#475569', backgroundColor: '#f8fafc', width: '50%', fontSize: '16px' }}
                contentStyle={{ fontSize: '16px', color: '#0f172a' }}
            >
                <Descriptions.Item label="Длина">{car.dimensions.length}</Descriptions.Item>
                <Descriptions.Item label="Ширина">{car.dimensions.width}</Descriptions.Item>
                <Descriptions.Item label="Высота">{car.dimensions.height}</Descriptions.Item>
                <Descriptions.Item label="Колёсная база">{car.dimensions.wheelbase}</Descriptions.Item>
                <Descriptions.Item label="Клиренс">{car.dimensions.clearance}</Descriptions.Item>
                <Descriptions.Item label="Масса">{car.dimensions.weight}</Descriptions.Item>
                <Descriptions.Item label="Объём багажника">{car.dimensions.trunk}</Descriptions.Item>
                <Descriptions.Item label="Мест">{car.dimensions.seats}</Descriptions.Item>
            </Descriptions>

            <Descriptions
                title={<span className="text-2xl font-bold text-slate-800">Интерьер</span>}
                column={1}
                bordered
                size="middle"
                labelStyle={{ fontWeight: '600', color: '#475569', backgroundColor: '#f8fafc', width: '50%', fontSize: '16px' }}
                contentStyle={{ fontSize: '16px', color: '#0f172a' }}
            >
                <Descriptions.Item label="Цвет салона">{car.interior.color}</Descriptions.Item>
                <Descriptions.Item label="Материал">{car.interior.material}</Descriptions.Item>
                <Descriptions.Item label="Сиденья">{car.interior.seats}</Descriptions.Item>
                <Descriptions.Item label="Дисплей">{car.interior.display}</Descriptions.Item>
                <Descriptions.Item label="Аудиосистема">{car.interior.audio}</Descriptions.Item>
            </Descriptions>
        </div>
    );

    const featuresTab = (
        <div className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {car.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <CheckCircleOutlined className="text-emerald-500 text-xl" />
                        <span className="text-slate-700 font-medium text-lg">{feature}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    const safetyTab = (
        <div className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {car.safety.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-violet-50 rounded-xl border border-violet-100">
                        <SafetyCertificateOutlined className="text-violet-500 text-xl" />
                        <span className="text-slate-700 font-medium text-lg">{item}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    const tabItems = [
        { key: '1', label: <span className="flex items-center gap-2 font-semibold text-lg"><InfoCircleOutlined /> Обзор</span>, children: overviewTab },
        { key: '2', label: <span className="flex items-center gap-2 font-semibold text-lg"><ThunderboltOutlined /> Характеристики</span>, children: specsTab },
        { key: '3', label: <span className="flex items-center gap-2 font-semibold text-lg"><CarOutlined /> Комплектация</span>, children: featuresTab },
        { key: '4', label: <span className="flex items-center gap-2 font-semibold text-lg"><SafetyCertificateOutlined /> Безопасность</span>, children: safetyTab },
    ];

    return (
        <div className="min-h-screen py-16 px-4">
            <div className="max-w-7xl mx-auto">

                <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(-1)}
                    className="mb-8 !text-slate-200 hover:!text-cyan-400 !font-semibold !text-lg flex items-center gap-2 transition-colors p-0 drop-shadow"
                >
                    Вернуться в каталог
                </Button>

                <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 md:p-10 shadow-2xl border border-white/50">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">

                        <div className="relative rounded-2xl overflow-hidden shadow-md group min-h-[320px] lg:min-h-[500px] bg-slate-900">
                            {/* Размытый фон из того же фото: фото разных пропорций смотрятся одинаково аккуратно */}
                            <img
                                key={`bg-${currentSlide}`}
                                src={toImageUrl(car.images[currentSlide])}
                                alt=""
                                aria-hidden="true"
                                className="absolute inset-0 w-full h-full object-cover object-center scale-110 blur-2xl opacity-70"
                            />
                            <img
                                key={currentSlide}
                                src={toImageUrl(car.images[currentSlide])}
                                alt={`${car.name} - фото ${currentSlide + 1}`}
                                onClick={() => openPhotoModal(currentSlide)}
                                className="absolute inset-0 w-full h-full object-contain object-center cursor-zoom-in animate-fade-in"
                            />

                            <button
                                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                                aria-label="Предыдущее фото"
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 transition-all z-10 opacity-0 group-hover:opacity-100"
                            >
                                <LeftOutlined className="text-lg" />
                            </button>

                            <button
                                onClick={(e) => { e.stopPropagation(); goNext(); }}
                                aria-label="Следующее фото"
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 transition-all z-10 opacity-0 group-hover:opacity-100"
                            >
                                <RightOutlined className="text-lg" />
                            </button>

                            <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-md text-white text-base font-semibold px-3 py-1.5 rounded-full z-10 flex items-center gap-1.5 pointer-events-none">
                                <ZoomInOutlined /> {currentSlide + 1} / {car.images.length}
                            </div>

                            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                                {car.condition === 'new' ? (
                                    <span className="bg-emerald-500 text-white text-base font-bold px-3.5 py-1.5 rounded-full shadow-lg">НОВЫЙ</span>
                                ) : (
                                    <span className="bg-amber-500 text-white text-base font-bold px-3.5 py-1.5 rounded-full shadow-lg">С ПРОБЕГОМ</span>
                                )}
                                {car.oldPrice && (
                                    <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-base font-bold px-3.5 py-1.5 rounded-full shadow-lg">
                                        СКИДКА {(car.oldPrice - car.price).toLocaleString('ru-RU')} ¥
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 mb-3">
                                <Tag color="blue" className="!rounded-full !px-3.5 !py-1 !text-lg !font-semibold">{car.brand}</Tag>
                                <Tag color="purple" className="!rounded-full !px-3.5 !py-1 !text-lg !font-semibold">
                                    {translateBodyType(car.bodyType)}
                                </Tag>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-slate-800">{car.name}</h1>

                            <div className="flex flex-wrap items-center gap-4 text-slate-600 text-lg mb-6">
                                <span className="flex items-center gap-1.5"><EnvironmentOutlined /> {car.location}</span>
                                <span className="flex items-center gap-1.5"><CarOutlined /> {car.year} год</span>
                                <span className="flex items-center gap-1.5"><ThunderboltOutlined /> {car.specs.power}</span>
                            </div>

                            <div className="mb-6">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">
                                        {car.price.toLocaleString('ru-RU')} ¥
                                    </span>
                                    {car.oldPrice && (
                                        <span className="text-2xl text-slate-400 line-through">
                                            {car.oldPrice.toLocaleString('ru-RU')} ¥
                                        </span>
                                    )}
                                </div>
                                <p className="text-base text-slate-500 mt-2">Цена в Китае, без учёта таможенных и логистических затрат</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                    <div className="text-base text-slate-500 font-semibold uppercase tracking-wider mb-1">Запас хода</div>
                                    <div className="text-xl font-bold text-slate-800">{car.specs.range}</div>
                                </div>
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                    <div className="text-base text-slate-500 font-semibold uppercase tracking-wider mb-1">Разгон 0-100</div>
                                    <div className="text-xl font-bold text-slate-800">{car.specs.acceleration}</div>
                                </div>
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                    <div className="text-base text-slate-500 font-semibold uppercase tracking-wider mb-1">Батарея</div>
                                    <div className="text-xl font-bold text-slate-800">{car.specs.battery}</div>
                                </div>
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                    <div className="text-base text-slate-500 font-semibold uppercase tracking-wider mb-1">Привод</div>
                                    <div className="text-xl font-bold text-slate-800">{car.specs.drive}</div>
                                </div>
                            </div>

                            <div className="mt-auto pt-2 space-y-2">
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<CalculatorOutlined />}
                                    className="w-full h-14 !text-xl font-bold rounded-2xl !bg-gradient-to-r !from-violet-600 !to-fuchsia-600 !border-none hover:!from-violet-500 hover:!to-fuchsia-500 shadow-lg shadow-fuchsia-500/30 transition-all hover:scale-[1.02]"
                                    onClick={() => setIsModalOpen(true)}
                                >
                                    Рассчитать стоимость под ключ
                                </Button>
                                <Button
                                    size="large"
                                    icon={<PhoneOutlined />}
                                    className="w-full h-12 !text-xl font-semibold rounded-2xl !bg-transparent !text-slate-700 !border !border-slate-200 hover:!bg-slate-50 hover:!border-violet-300 hover:!text-violet-600 transition-all"
                                    onClick={() => setLeadModalOpen(true)}
                                >
                                    Оставить заявку
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-100">
                        <Tabs defaultActiveKey="1" items={tabItems} size="large" className="car-details-tabs" />
                    </div>
                </div>
            </div>

            <Modal
                open={photoModalOpen}
                onCancel={() => setPhotoModalOpen(false)}
                footer={null}
                width="90vw"
                style={{ maxWidth: 1200, top: 20 }}
                centered
                closeIcon={<CloseOutlined className="text-white text-2xl hover:text-cyan-400 transition-colors" />}
                styles={{
                    content: {
                        padding: 0,
                        background: 'transparent',
                        boxShadow: 'none',
                        overflow: 'hidden',
                    },
                    body: { padding: 0 },
                    mask: {
                        background: 'rgba(0, 0, 0, 0.9)',
                        backdropFilter: 'blur(8px)',
                    },
                }}
            >
                <div className="relative rounded-2xl overflow-hidden">
                    <Carousel
                        ref={modalCarouselRef}
                        dots={false}
                        adaptiveHeight
                        afterChange={(current) => setPhotoIndex(current)}
                    >
                        {car.images.map((img, index) => (
                            <div key={index}>
                                <img
                                    src={toImageUrl(img)}
                                    alt={`${car.name} - фото ${index + 1}`}
                                    className="w-full max-h-[75vh] object-contain"
                                />
                            </div>
                        ))}
                    </Carousel>

                    <button
                        onClick={() => modalCarouselRef.current?.prev()}
                        aria-label="Предыдущее фото"
                        className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white flex items-center justify-center hover:from-violet-500 hover:to-fuchsia-500 hover:scale-110 transition-all z-20 shadow-2xl shadow-fuchsia-500/50 border-2 border-white/30"
                    >
                        <LeftOutlined className="text-xl md:text-2xl font-bold" />
                    </button>

                    <button
                        onClick={() => modalCarouselRef.current?.next()}
                        aria-label="Следующее фото"
                        className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white flex items-center justify-center hover:from-violet-500 hover:to-fuchsia-500 hover:scale-110 transition-all z-20 shadow-2xl shadow-fuchsia-500/50 border-2 border-white/30"
                    >
                        <RightOutlined className="text-xl md:text-2xl font-bold" />
                    </button>

                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white text-base font-semibold px-3.5 py-1.5 rounded-full z-20">
                        {photoIndex + 1} / {car.images.length}
                    </div>
                </div>

                <div className="flex justify-center gap-2 mt-4 flex-wrap">
                    {car.images.map((img, index) => (
                        <img
                            key={index}
                            src={toImageUrl(img)}
                            alt={`Миниатюра ${index + 1}`}
                            onClick={() => modalCarouselRef.current?.goTo(index)}
                            className={`w-16 h-12 md:w-20 md:h-14 object-cover rounded-lg cursor-pointer border-2 transition-all ${
                                photoIndex === index
                                    ? 'border-white opacity-100 scale-105 shadow-lg'
                                    : 'border-white/20 opacity-50 hover:opacity-100'
                            }`}
                        />
                    ))}
                </div>
            </Modal>

            <CostCalculatorModal car={car} visible={isModalOpen} onClose={() => setIsModalOpen(false)} />

            <LeadModal
                open={leadModalOpen}
                onClose={() => setLeadModalOpen(false)}
                title="Получить консультацию"
                subtitle={`Задайте вопрос по ${car.name}`}
                successText="Эксперт свяжется с вами в течение 15 минут"
                defaultValues={{
                    preferences: `Интересует ${car.name} (${car.year} г.), цена ${car.price.toLocaleString('ru-RU')} ¥`
                }}
            />
        </div>
    );
}