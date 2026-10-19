import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Statistic, Button } from 'antd';
import { ArrowRightOutlined, CalculatorOutlined } from '@ant-design/icons';
import LeadModal from './LeadModal';

const sections = [
    {
        title: 'Не просто найти автомобиль. Найти тот, который стоит покупать.',
        paragraphs: [
            'На китайском рынке действительно много интересных предложений. Но между ценой в объявлении и конечной стоимостью автомобиля в России может быть существенная разница.',
            'Один автомобиль окажется выгодным даже с учётом таможни и доставки. Другой — потеряет всю привлекательность после расчёта расходов. А третий вообще не стоит рассматривать из-за состояния или проблем с документами.',
            'Наша работа — разобраться в этом до того, как клиент потратит деньги.',
            'Мы сравниваем варианты, уточняем информацию у продавцов, рассчитываем стоимость ввоза и помогаем выбрать автомобиль, который подходит не только по характеристикам, но и по общему бюджету.',
        ],
        wide: true,
    },
    {
        title: 'Китай ближе, чем кажется',
        paragraphs: [
            'Часть нашей команды находится в Китае. Это даёт возможность работать с местным рынком напрямую: общаться с продавцами, уточнять детали, организовывать осмотры и решать вопросы по ходу сделки.',
            'В России мы ведём работу с клиентами, готовим расчёты, согласовываем условия покупки и координируем дальнейшие этапы.',
            'Вместе это позволяет организовать процесс, в котором клиенту не приходится самостоятельно искать посредников, договариваться с китайскими продавцами и разбираться в международной логистике.',
        ],
    },
    {
        title: 'Нам важны детали',
        paragraphs: [
            'Мы понимаем, что автомобиль — серьёзная покупка. Особенно когда его предстоит оплачивать ещё до прибытия в Россию.',
            'Поэтому до выкупа обсуждаем не только сам автомобиль, но и его проверку, стоимость доставки, таможенные расходы, порядок платежей и оформления документов.',
            'Мы не обещаем, что любой автомобиль из Китая обойдётся дешевле российского предложения. Но можем помочь разобраться, какие варианты действительно имеет смысл привозить.',
        ],
    },
];

export default function AboutContent() {
    const [leadOpen, setLeadOpen] = useState(false);

    return (
        <div className="relative">
            <div className="max-w-7xl mx-auto px-4">
                <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
            </div>

            <div className="py-16 px-4 text-center">
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 text-white drop-shadow-2xl">
                    О компании ILSATAO
                </h2>
                <p className="text-slate-100 max-w-3xl mx-auto text-xl md:text-2xl font-light drop-shadow-lg">
                    Автомобили из Китая. Покупка, которую не нужно организовывать самостоятельно.
                </p>
            </div>

            <div className="max-w-7xl mx-auto py-8 px-4">
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white/50 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <p className="text-slate-900 font-bold leading-relaxed mb-6 text-xl md:text-2xl">
                                ILSATAO занимается подбором, выкупом и доставкой автомобилей с китайского рынка в Россию.
                            </p>
                            <p className="text-slate-700 leading-relaxed mb-6 text-lg md:text-xl">
                                Мы работаем не только с китайскими марками. В Китае представлен большой выбор европейских, японских и корейских автомобилей — зачастую в комплектациях, которые сложно найти на российском рынке.
                            </p>
                            <p className="text-slate-700 leading-relaxed text-lg md:text-xl">
                                Наша команда работает в России и Китае. Мы ищем подходящие предложения, связываемся с продавцами, организуем проверку автомобиля и его доставку. Клиенту остаётся выбрать подходящий вариант, согласовать условия и принять решение о покупке.
                            </p>
                        </div>
                        <div className="rounded-3xl overflow-hidden shadow-2xl relative">
                            <img
                                src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=1000"
                                alt="Офис компании"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    {sections.map((s) => (
                        <div
                            key={s.title}
                            className={`bg-white/95 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white/50 ${s.wide ? 'md:col-span-2' : ''}`}
                        >
                            <h3 className="text-2xl md:text-3xl font-extrabold mb-6 text-slate-900 leading-tight">
                                {s.title}
                            </h3>
                            {s.paragraphs.map((p, i) => (
                                <p
                                    key={i}
                                    className={`text-slate-700 leading-relaxed text-lg md:text-xl ${i < s.paragraphs.length - 1 ? 'mb-4' : ''}`}
                                >
                                    {p}
                                </p>
                            ))}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-16 max-w-4xl mx-auto">
                    {[
                        { title: 'Довольных клиентов', value: 98, suffix: '%', color: 'from-violet-500 to-fuchsia-500' },
                        { title: 'Городов доставки', value: 85, suffix: '', color: 'from-fuchsia-500 to-pink-500' }
                    ].map((stat, i) => (
                        <div key={i} className={`bg-gradient-to-br ${stat.color} p-8 rounded-3xl text-white shadow-2xl`}>
                            <Statistic
                                title={<span className="text-white/95 font-medium text-lg md:text-xl">{stat.title}</span>}
                                value={stat.value}
                                suffix={stat.suffix}
                                valueStyle={{ color: 'white', fontWeight: '800', fontSize: '3rem' }}
                            />
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-16">
                    <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white/50 flex flex-col">
                        <h3 className="text-2xl md:text-3xl font-extrabold mb-4 text-slate-900 leading-tight">
                            Посмотрите, как мы работаем
                        </h3>
                        <p className="text-slate-700 leading-relaxed text-lg md:text-xl mb-8 flex-1">
                            В нашем каталоге представлены автомобили с китайского рынка — от доступных седанов до премиальных моделей.
                        </p>
                        <Link to="/catalog" className="block">
                            <Button
                                type="primary"
                                size="large"
                                block
                                icon={<ArrowRightOutlined />}
                                className="!h-14 !text-lg !font-bold !rounded-2xl !bg-gradient-to-r !from-blue-500 !to-indigo-500 !border-none hover:!from-blue-400 hover:!to-indigo-400 !text-white shadow-xl shadow-indigo-500/40 transition-all hover:-translate-y-1"
                            >
                                Перейти в каталог
                            </Button>
                        </Link>
                    </div>

                    <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white/50 flex flex-col">
                        <h3 className="text-2xl md:text-3xl font-extrabold mb-4 text-slate-900 leading-tight">
                            Начнём с вашего автомобиля?
                        </h3>
                        <p className="text-slate-700 leading-relaxed text-lg md:text-xl mb-8 flex-1">
                            Расскажите, какую машину хотите приобрести и на какой бюджет рассчитываете. Мы посмотрим доступные предложения и подготовим предварительный расчёт стоимости с доставкой в Россию.
                        </p>
                        <Button
                            type="primary"
                            size="large"
                            block
                            icon={<CalculatorOutlined />}
                            onClick={() => setLeadOpen(true)}
                            className="!h-14 !text-lg !font-bold !rounded-2xl !bg-gradient-to-r !from-violet-600 !to-fuchsia-600 !border-none hover:!from-violet-500 hover:!to-fuchsia-500 !text-white shadow-xl shadow-fuchsia-500/40 transition-all hover:-translate-y-1"
                        >
                            Рассчитать стоимость
                        </Button>
                    </div>
                </div>
            </div>

            <LeadModal
                open={leadOpen}
                onClose={() => setLeadOpen(false)}
                title="Рассчитать стоимость"
                subtitle="Расскажите, какой автомобиль ищете и на какой бюджет рассчитываете"
                successText="Мы свяжемся с вами и подготовим предварительный расчёт"
            />
        </div>
    );
}
