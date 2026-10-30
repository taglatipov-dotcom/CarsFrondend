import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Modal, Button, Spin, Alert } from 'antd';
import { PhoneOutlined } from '@ant-design/icons';
import LeadModal from './LeadModal';
import CostBreakdown, { computeCost, formatRub } from './CostBreakdown.jsx';
import { fetchCarCost, normalizeCostBreakdown } from '../services/MockApi.js';

/** Ссылка на отдельный калькулятор с данными этой машины (там можно выбрать юрлицо). */
function calculatorLink(raw) {
    if (!raw) return '/calculator';
    const p = new URLSearchParams();
    if (raw.china_price) p.set('price', raw.china_price);
    if (raw.year) p.set('year', raw.year);
    if (raw.engine_type) p.set('engine', raw.engine_type);
    if (raw.engine_volume) p.set('volume', raw.engine_volume);
    const ice = raw.engine_type === 'Бензиновый' || raw.engine_type === 'Дизельный';
    if (ice && (raw.horsepower || raw.engine_power)) {
        p.set('power', raw.horsepower || raw.engine_power);
        p.set('unit', '1');
    } else if (raw.engine_power) {
        p.set('power', raw.engine_power);
        p.set('unit', '2');
    }
    return `/calculator?${p.toString()}`;
}

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

    const { rows, total } = useMemo(() => computeCost(costData), [costData]);

    if (!car) return null;

    return (
        <>
            <Modal
                title={<span className="text-xl font-semibold text-ink">Расчёт стоимости под ключ</span>}
                open={visible}
                onCancel={onClose}
                footer={null}
                width={820}
                centered
                styles={{ body: { padding: '8px 4px' } }}
            >
                {/* Итог */}
                <div className="bg-ink rounded-lg px-6 py-5 mb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                    <div>
                        <div className="text-paper/60 text-base">Полная стоимость для физлица</div>
                        <div className="text-paper text-3xl md:text-4xl font-semibold mt-1">{formatRub(total)}</div>
                    </div>
                    <div className="text-paper/70 text-lg">{car.name}</div>
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

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <Spin size="large" />
                        <span className="text-ink/55 text-base">Считаем стоимость…</span>
                    </div>
                ) : rows.length === 0 ? (
                    <div className="text-center py-16 text-ink/55 text-base">
                        Для этой машины не хватает данных для расчёта — менеджер посчитает вручную.
                    </div>
                ) : (
                    <CostBreakdown rows={rows} />
                )}

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                        size="large"
                        block
                        icon={<PhoneOutlined />}
                        onClick={() => setLeadModalOpen(true)}
                        disabled={loading}
                        className="btn-brass !h-12 !text-base !font-semibold !rounded-md"
                    >
                        Оставить заявку
                    </Button>
                    <Link to={calculatorLink(car._raw)} onClick={onClose}>
                        <Button size="large" block className="!h-12 !text-base !rounded-md">
                            Посчитать на юрлицо
                        </Button>
                    </Link>
                </div>

                <p className="text-ink/55 text-sm mt-4 mb-0 text-center leading-snug">
                    Расчёт предварительный: итог зависит от курса валют и действующих таможенных ставок.
                </p>
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
