import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Form, InputNumber, Select, Button, Alert, Spin } from 'antd';
import { CalculatorOutlined, PhoneOutlined } from '@ant-design/icons';
import CostBreakdown, { computeCost, formatRub, LOGISTICS_COST, COMMISSION_RATE } from '../components/CostBreakdown.jsx';
import LeadModal from '../components/LeadModal';
import { fetchCustomsCalc, normalizeCostBreakdown } from '../services/MockApi.js';
import { usePageMeta } from '../utils/pageMeta.js';

/* Коды calcus.ru: 2 — юрлицо, 3 — физлицо для перепродажи, 1 — физлицо для себя */
const OWNERS = [
    { value: 2, label: 'Юрлицо', title: 'Юрлицо', hint: 'ООО или ИП', lead: 'company' },
    { value: 3, label: 'Физлицо для перепродажи', title: 'Физлицо', hint: 'для перепродажи', lead: 'dealer' },
    { value: 1, label: 'Физлицо для себя', title: 'Физлицо', hint: 'для себя', lead: 'person' },
];

/* Выбор «Кто ввозит»: три карточки — короткое название и пояснение в одну строку */
function OwnerPicker({ value, onChange }) {
    return (
        <div role="radiogroup" aria-label="Кто ввозит" className="grid grid-cols-3 gap-2">
            {OWNERS.map((o) => {
                const on = o.value === value;
                return (
                    <button
                        key={o.value}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => onChange?.(o.value)}
                        className={`rounded-lg border px-2 py-3 text-center cursor-pointer transition-colors ${
                            on ? 'bg-ink border-ink text-paper' : 'bg-white border-ink/15 text-ink hover:border-brass-lo'
                        }`}
                    >
                        <span className="block font-semibold text-[15px] leading-tight">{o.title}</span>
                        <span className={`block text-[13px] leading-tight mt-1 ${on ? 'text-paper/70' : 'text-ink/55'}`}>{o.hint}</span>
                    </button>
                );
            })}
        </div>
    );
}

const ENGINES = ['Бензиновый', 'Дизельный', 'Электрический', 'Параллельный гибрид', 'Последовательный гибрид'];
const NEEDS_VOLUME = new Set(['Бензиновый', 'Дизельный', 'Параллельный гибрид']);

const CURRENCIES = [
    { value: 'CNY', label: '¥ юань' },
    { value: 'USD', label: '$ доллар' },
    { value: 'EUR', label: '€ евро' },
    { value: 'RUB', label: '₽ рубль' },
    { value: 'JPY', label: '¥ иена' },
    { value: 'KRW', label: '₩ вона' },
];

const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 16 }, (_, i) => THIS_YEAR - i);

function numParam(params, key) {
    const n = Number(params.get(key));
    return Number.isFinite(n) && n > 0 ? n : undefined;
}

export default function Calculator() {
    usePageMeta({
        title: 'Калькулятор растаможки',
        description: 'Расчёт стоимости автомобиля из Китая под ключ: пошлина, НДС, утильсбор, доставка. Для юрлиц и физлиц.',
    });

    const [params] = useSearchParams();
    const [form] = Form.useForm();
    const engineType = Form.useWatch('engineType', form);
    const owner = Form.useWatch('owner', form);
    const quantity = Form.useWatch('quantity', form) || 1;

    const [costData, setCostData] = useState(null);
    const [calcFor, setCalcFor] = useState(null); // параметры, по которым посчитан результат
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [leadOpen, setLeadOpen] = useState(false);

    // Данные машины из карточки (?price=…&engine=…) или пустая форма
    const initialValues = useMemo(() => {
        const engine = params.get('engine');
        const ownerParam = Number(params.get('owner'));
        return {
            owner: [1, 2, 3].includes(ownerParam) ? ownerParam : 2,
            price: numParam(params, 'price'),
            curr: CURRENCIES.some((c) => c.value === params.get('curr')) ? params.get('curr') : 'CNY',
            year: numParam(params, 'year') || THIS_YEAR,
            engineType: ENGINES.includes(engine) ? engine : 'Бензиновый',
            engineVolume: numParam(params, 'volume'),
            power: numParam(params, 'power'),
            powerUnit: Number(params.get('unit')) === 2 ? 2 : 1,
            quantity: 1,
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const { rows, total } = useMemo(() => computeCost(costData), [costData]);
    const needsVolume = NEEDS_VOLUME.has(engineType);
    const isElectric = engineType === 'Электрический' || engineType === 'Последовательный гибрид';
    const stale = calcFor && owner !== calcFor.owner; // тип ввоза поменяли после расчёта

    const handleCalc = async (values) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetchCustomsCalc({
                ...values,
                engineVolume: NEEDS_VOLUME.has(values.engineType) ? values.engineVolume : null,
            });
            setCostData(normalizeCostBreakdown(res));
            setCalcFor(values);
        } catch (e) {
            setError(e.message || 'Не удалось выполнить расчёт');
            setCostData(null);
        } finally {
            setLoading(false);
        }
    };

    const ownerInfo = OWNERS.find((o) => o.value === (calcFor?.owner ?? owner)) || OWNERS[0];
    const leadText = calcFor
        ? `Расчёт из калькулятора (${ownerInfo.label.toLowerCase()}): ` +
          `${calcFor.engineType}${calcFor.engineVolume && NEEDS_VOLUME.has(calcFor.engineType) ? `, ${calcFor.engineVolume} л` : ''}, ` +
          `${calcFor.power} ${calcFor.powerUnit === 2 ? 'кВт' : 'л.с.'}, ${calcFor.year} г., ` +
          `цена ${Number(calcFor.price).toLocaleString('ru-RU')} ${calcFor.curr}. ` +
          `Под ключ: ${formatRub(total)} за 1 авто` +
          (calcFor.quantity > 1 ? `, ${formatRub(total * calcFor.quantity)} за ${calcFor.quantity} шт.` : '.')
        : '';

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 md:py-14">
            <h1 className="text-3xl md:text-5xl text-paper m-0">Калькулятор растаможки</h1>
            <p className="text-paper/70 text-lg md:text-xl mt-4 mb-10 max-w-3xl leading-relaxed">
                Введите данные автомобиля — посчитаем пошлину, НДС, утильсбор и итог под ключ с доставкой.
                Для юрлиц ставки отличаются от расчёта для частных лиц.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-6 items-start">
                {/* ===== Форма ===== */}
                <div className="bg-paper rounded-xl p-5 md:p-8 text-ink">
                    <Form
                        form={form}
                        layout="vertical"
                        requiredMark={false}
                        initialValues={initialValues}
                        onFinish={handleCalc}
                        size="large"
                        className="calc-form"
                    >
                        <Form.Item name="owner" label="Кто ввозит">
                            <OwnerPicker />
                        </Form.Item>

                        <Form.Item label="Стоимость автомобиля" required className="!mb-0">
                            <div className="grid grid-cols-[1fr_auto] gap-2">
                                <Form.Item name="price" rules={[{ required: true, message: 'Укажите стоимость' }]}>
                                    <InputNumber min={1} className="!w-full" placeholder="150 000" formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} parser={(v) => v.replace(/\s/g, '')} />
                                </Form.Item>
                                <Form.Item name="curr">
                                    <Select options={CURRENCIES} className="!w-32" />
                                </Form.Item>
                            </div>
                        </Form.Item>

                        <div className="grid grid-cols-2 gap-3">
                            <Form.Item name="year" label="Год выпуска">
                                <Select options={YEARS.map((y) => ({ value: y, label: y }))} />
                            </Form.Item>
                            <Form.Item name="quantity" label="Количество машин">
                                <InputNumber min={1} max={10000} className="!w-full" />
                            </Form.Item>
                        </div>

                        <Form.Item name="engineType" label="Двигатель">
                            <Select options={ENGINES.map((e) => ({ value: e, label: e }))} />
                        </Form.Item>

                        <div className={`grid gap-3 ${needsVolume ? 'grid-cols-2' : 'grid-cols-1'}`}>
                            {needsVolume && (
                                <Form.Item
                                    name="engineVolume"
                                    label="Объём, л"
                                    rules={[{ required: true, message: 'Укажите объём' }]}
                                >
                                    <InputNumber min={0.1} max={10} step={0.1} className="!w-full" placeholder="1.5" />
                                </Form.Item>
                            )}
                            <Form.Item
                                label={isElectric ? 'Мощность (30-минутная)' : 'Мощность'}
                                required
                                className="!mb-0"
                            >
                                <div className="grid grid-cols-[1fr_auto] gap-2">
                                    <Form.Item name="power" rules={[{ required: true, message: 'Укажите мощность' }]}>
                                        <InputNumber min={1} max={3000} className="!w-full" placeholder="150" />
                                    </Form.Item>
                                    <Form.Item name="powerUnit">
                                        <Select
                                            className="!w-24"
                                            options={[{ value: 1, label: 'л.с.' }, { value: 2, label: 'кВт' }]}
                                        />
                                    </Form.Item>
                                </div>
                            </Form.Item>
                        </div>

                        <Button
                            htmlType="submit"
                            block
                            loading={loading}
                            icon={<CalculatorOutlined />}
                            className="btn-brass !h-12 !rounded-md !font-semibold !text-base mt-1"
                        >
                            Рассчитать
                        </Button>
                    </Form>
                </div>

                {/* ===== Результат ===== */}
                <div className="bg-paper rounded-xl p-5 md:p-8 text-ink min-h-[320px]" aria-live="polite">
                    {loading && !costData ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-3">
                            <Spin size="large" />
                            <span className="text-ink/55">Считаем стоимость…</span>
                        </div>
                    ) : error ? (
                        <Alert
                            type="error"
                            showIcon
                            message="Расчёт не выполнен"
                            description={`${error}. Проверьте данные или оставьте заявку — менеджер посчитает вручную.`}
                        />
                    ) : !costData ? (
                        <div className="h-full flex flex-col justify-center py-10">
                            <h2 className="text-2xl text-ink m-0">Что войдёт в расчёт</h2>
                            <ul className="mt-5 mb-0 pl-5 text-ink/80 text-lg leading-relaxed list-disc marker:text-brass-lo">
                                <li>цена автомобиля в рублях по курсу ЦБ;</li>
                                <li>таможенный сбор, пошлина, акциз и НДС;</li>
                                <li>утилизационный сбор;</li>
                                <li>доставка — {formatRub(LOGISTICS_COST)} за автомобиль;</li>
                                <li>наша комиссия — {Math.round(COMMISSION_RATE * 100)}% от суммы.</li>
                            </ul>
                        </div>
                    ) : (
                        <div className={stale || loading ? 'opacity-50 transition-opacity' : 'transition-opacity'}>
                            <div className="bg-ink rounded-lg px-6 py-5 mb-6">
                                <div className="text-paper/60 text-base">
                                    Под ключ за 1 автомобиль, ввоз: {ownerInfo.label.toLowerCase()}
                                </div>
                                <div className="text-paper text-3xl md:text-4xl font-semibold mt-1">{formatRub(total)}</div>
                                {calcFor.quantity > 1 && (
                                    <div className="text-brass text-lg mt-2">
                                        {formatRub(total * calcFor.quantity)} за {calcFor.quantity} шт.
                                    </div>
                                )}
                            </div>

                            {stale && (
                                <Alert className="!mb-4" type="info" showIcon message="Тип ввоза изменён — нажмите «Рассчитать», чтобы обновить итог" />
                            )}

                            <CostBreakdown rows={rows} />

                            {calcFor.owner === 2 && (
                                <p className="text-ink/60 text-sm mt-5 mb-0 leading-snug">
                                    НДС, уплаченный на таможне, плательщик НДС обычно может принять к вычету — уточните у своего бухгалтера.
                                </p>
                            )}

                            <Button
                                block
                                size="large"
                                icon={<PhoneOutlined />}
                                onClick={() => setLeadOpen(true)}
                                className="btn-brass !h-12 !rounded-md !font-semibold !text-base mt-6"
                            >
                                Отправить расчёт менеджеру
                            </Button>
                            <p className="text-ink/55 text-sm mt-3 mb-0 text-center">
                                Расчёт предварительный: итог зависит от курса валют и действующих ставок.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <LeadModal
                open={leadOpen}
                onClose={() => setLeadOpen(false)}
                title="Отправить расчёт менеджеру"
                subtitle="Проверим расчёт и подберём автомобили под эти параметры"
                successText="Менеджер свяжется с вами в течение 15 минут"
                defaultValues={{
                    preferences: leadText.slice(0, 500),
                    clientType: ownerInfo.lead,
                    quantity: calcFor?.quantity || quantity,
                }}
            />
        </div>
    );
}
