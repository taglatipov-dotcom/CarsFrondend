import { useState, useEffect, useMemo } from 'react';
import { Modal, Statistic, Divider, Button, Spin, Alert } from 'antd';
import {
    CarOutlined,
    SafetyCertificateOutlined,
    DollarOutlined,
    PhoneOutlined,
    DeleteOutlined,
    PercentageOutlined,
    CarFilled,
} from '@ant-design/icons';
import LeadModal from './LeadModal';
import { fetchCarCost, normalizeCostBreakdown } from '../services/mockApi';

/* Ставка нашей комиссии от суммы всех расходов (цена авто + таможня + логистика) */
const COMMISSION_RATE = 0.03;

/* Фиксированные логистические расходы */
const LOGISTICS_COST = 345000;

export default function CostCalculatorModal({ car, visible, onClose }) {
    const [leadModalOpen, setLeadModalOpen] = useState(false);
    const [costData, setCostData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /* ============ ЗАГРУЗКА РАСЧЁТА С БЭКЕНДА ============ */
    useEffect(() => {
        if (!visible || !car) return;

        let ignore = false;
        setLoading(true);
        setError(null);
        setCostData(null);

        const raw = car._raw;

        if (!raw) {
            setCostData(car.costBreakdown || null);
            setLoading(false);
            return;
        }

        fetchCarCost(raw)
            .then((res) => {
                if (ignore) return;
                setCostData(normalizeCostBreakdown(res, car.costBreakdown));
            })
            .catch((e) => {
                if (ignore) return;
                console.error('[calculator] Ошибка запроса /cars/cal:', e);
                setError(e.message || 'Не удалось получить расчёт');
                setCostData(car.costBreakdown || null);
            })
            .finally(() => {
                if (!ignore) setLoading(false);
            });

        return () => {
            ignore = true;
        };
    }, [visible, car?.id]);

    /* ============ СУММА БЕЗ КОМИССИИ И ИТОГ ============ */
    const sumWithoutCommission = useMemo(() => {
        if (!costData) return 0;
        return (
            (costData.price  || 0) +
            (costData.sbor   || 0) +
            (costData.tax    || 0) +
            (costData.excise || 0) +
            (costData.nds    || 0) +
            (costData.util   || 0) +
            LOGISTICS_COST
        );
    }, [costData]);

    const commission = useMemo(
        () => Math.round(sumWithoutCommission * COMMISSION_RATE),
        [sumWithoutCommission],
    );

    const finalTotal = sumWithoutCommission + commission;

    /* ============ ПОДГОТОВКА ДАННЫХ ДЛЯ ДИАГРАММЫ ============ */
    const chartData = useMemo(() => {
        if (!costData) return [];
        return [
            {
                key: 'price',
                name: 'Цена автомобиля',
                value: Math.round(costData.price || 0),
                color: '#1e293b',
                Icon: CarOutlined,
            },
            {
                key: 'sbor',
                name: 'Таможенный сбор',
                value: Math.round(costData.sbor || 0),
                color: '#22c55e',
                Icon: SafetyCertificateOutlined,
            },
            {
                key: 'tax',
                name: 'Таможенная пошлина',
                value: Math.round(costData.tax || 0),
                color: '#a855f7',
                Icon: SafetyCertificateOutlined,
            },
            {
                key: 'excise',
                name: 'Акциз',
                value: Math.round(costData.excise || 0),
                color: '#ef4444',
                Icon: PercentageOutlined,
            },
            {
                key: 'nds',
                name: 'НДС',
                value: Math.round(costData.nds || 0),
                color: '#06b6d4',
                Icon: PercentageOutlined,
            },
            {
                key: 'util',
                name: 'Утилизационный сбор',
                value: Math.round(costData.util || 0),
                color: '#eab308',
                Icon: DeleteOutlined,
            },
            {
                key: 'logistics',
                name: 'Логистические расходы',
                value: LOGISTICS_COST,
                color: '#10b981',
                Icon: CarFilled,
            },
            {
                key: 'commission',
                name: 'Наша комиссия (3%)',
                value: commission,
                color: '#f97316',
                Icon: DollarOutlined,
            },
        ].filter((item) => item.value > 0);
    }, [costData, commission]);

    const total = finalTotal;

    /* ============ SVG-ДОНАТ ============ */
    const radius = 70;
    const strokeWidth = 28;
    const circumference = 2 * Math.PI * radius;

    let runningOffset = 0;
    const segments = chartData.map((item) => {
        const percent = total > 0 ? item.value / total : 0;
        const segmentLength = percent * circumference;
        const offset = runningOffset;
        runningOffset += segmentLength;
        return {
            ...item,
            segmentLength,
            offset,
            percent: (percent * 100).toFixed(1),
        };
    });

    if (!car) return null;

    return (
        <>
            <Modal
                title={<span className="text-xl font-bold text-slate-800">Детальный расчет стоимости</span>}
                open={visible}
                onCancel={onClose}
                footer={null}
                width={820}
                centered
                className="rounded-2xl overflow-hidden"
                bodyStyle={{ padding: '20px 28px' }}
            >
                {/* Верхний блок с итогом */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl px-6 py-5 text-center mb-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/20 rounded-full blur-2xl -mr-8 -mt-8"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-fuchsia-500/20 rounded-full blur-2xl -ml-8 -mb-8"></div>
                    <Statistic
                        title={
                            <span className="text-slate-300 text-base md:text-lg font-medium uppercase tracking-wider">
                                Полная стоимость
                            </span>
                        }
                        value={total}
                        precision={0}
                        valueStyle={{ color: 'white', fontSize: '34px', fontWeight: '800', lineHeight: 1.1 }}
                        suffix={<span className="text-2xl text-slate-400 ml-1">₽</span>}
                    />
                    <div className="mt-2 text-slate-300 text-lg md:text-xl">{car.name}</div>
                </div>

                {error && (
                    <Alert
                        type="warning"
                        showIcon
                        className="mb-4"
                        message="Не удалось получить точный расчёт с сервера"
                        description="Показана предварительная оценка. Попробуйте позже или свяжитесь с менеджером."
                    />
                )}

                <Divider className="!my-4" />

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <Spin size="large" />
                        <span className="text-slate-500 text-base">Расчёт стоимости...</span>
                    </div>
                ) : segments.length === 0 ? (
                    <div className="text-center py-16 text-slate-400 text-base">
                        Нет данных для отображения
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                        <div className="relative w-48 h-48 flex-shrink-0">
                            <svg viewBox="0 0 200 200" className="w-full h-full">
                                <g transform="rotate(-90 100 100)">
                                    <circle
                                        cx="100"
                                        cy="100"
                                        r={radius}
                                        fill="transparent"
                                        stroke="#f1f5f9"
                                        strokeWidth={strokeWidth}
                                    />
                                    {segments.map((item, index) => (
                                        <circle
                                            key={index}
                                            cx="100"
                                            cy="100"
                                            r={radius}
                                            fill="transparent"
                                            stroke={item.color}
                                            strokeWidth={strokeWidth}
                                            strokeDasharray={`${item.segmentLength} ${circumference - item.segmentLength}`}
                                            strokeDashoffset={-item.offset}
                                            className="transition-all duration-700 ease-out cursor-pointer hover:opacity-80"
                                        />
                                    ))}
                                </g>
                            </svg>

                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-base text-slate-400 font-medium uppercase tracking-wider">
                                    Итого
                                </span>
                                <span className="text-2xl font-extrabold text-slate-800">100%</span>
                            </div>
                        </div>

                        <div className="flex-1 w-full">
                            <div className="flex flex-col gap-1.5">
                                {segments.map((item) => {
                                    const { Icon } = item;
                                    return (
                                        <div
                                            key={item.key}
                                            className="flex items-center justify-between px-3 py-2 rounded-xl border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-colors gap-3"
                                        >
                                            <div className="flex items-center gap-2.5 whitespace-nowrap">
                                                <div
                                                    className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                                                    style={{
                                                        backgroundColor: item.color,
                                                        boxShadow:
                                                            item.color === '#94a3b8'
                                                                ? 'inset 0 0 0 1px #64748b'
                                                                : 'none',
                                                    }}
                                                ></div>

                                                <Icon style={{ color: item.color, fontSize: '20px' }} />

                                                <span className="font-semibold text-slate-700 text-lg md:text-xl">
                                                    {item.name}
                                                </span>
                                            </div>

                                            <div className="text-right flex items-center gap-2.5 flex-shrink-0">
                                                <span className="font-bold text-slate-800 text-lg md:text-xl whitespace-nowrap">
                                                    {item.value.toLocaleString('ru-RU')} ₽
                                                </span>
                                                <span className="text-base font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full whitespace-nowrap min-w-[64px] text-center">
                                                    {item.percent}%
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Кнопка «Оставить заявку» */}
                <div className="mt-5">
                    <Button
                        type="primary"
                        size="large"
                        block
                        icon={<PhoneOutlined />}
                        onClick={() => setLeadModalOpen(true)}
                        disabled={loading}
                        className="!h-14 !text-lg md:!text-xl !font-bold !rounded-xl !bg-gradient-to-r !from-violet-600 !to-fuchsia-600 !border-none hover:!from-violet-500 hover:!to-fuchsia-500 !text-white shadow-lg shadow-fuchsia-500/30 transition-all hover:scale-[1.01] disabled:!bg-slate-300 disabled:!shadow-none disabled:!scale-100"
                    >
                        Оставить заявку
                    </Button>
                </div>

                <div className="mt-4 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                    <p className="text-slate-500 text-base m-0 leading-snug">
                        * Расчет является предварительным. Точная стоимость зависит от курса валют и текущих таможенных пошлин.
                    </p>
                </div>
            </Modal>

            <LeadModal
                open={leadModalOpen}
                onClose={() => setLeadModalOpen(false)}
                title="Оставить заявку"
                subtitle={`Заявка на ${car.name}`}
                successText="Менеджер свяжется с вами в течение 15 минут"
                defaultValues={{
                    preferences: `Интересует ${car.name} (${car.year} г.). Полная стоимость под ключ: ${total.toLocaleString('ru-RU')} ₽. Хочу оформить заявку.`,
                }}
            />
        </>
    );
}