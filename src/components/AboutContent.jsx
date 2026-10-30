import { Link } from 'react-router-dom';
import { Button } from 'antd';
import { ArrowRightOutlined, CalculatorOutlined } from '@ant-design/icons';

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
    return (
        <div className="relative">
            <div className="max-w-7xl mx-auto px-4">
                <div className="h-px bg-paper/15"></div>
            </div>

            <div className="pt-14 md:pt-20 pb-8 px-4 max-w-7xl mx-auto">
                <h2 className="text-2xl md:text-4xl mb-4 text-paper">
                    О компании ILSATAO
                </h2>
                <p className="text-paper/70 max-w-3xl text-lg md:text-xl m-0">
                    Поставки автомобилей из Китая для бизнеса — без поиска посредников и самостоятельной логистики.
                </p>
            </div>

            <div className="max-w-7xl mx-auto py-8 px-4">
                <div className="bg-paper rounded-xl p-8 md:p-12 border border-ink/10 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <p className="text-ink font-bold leading-relaxed mb-6 text-xl md:text-2xl">
                                ILSATAO подбирает, выкупает и доставляет автомобили с китайского рынка в Россию для компаний, дилеров и автосалонов.
                            </p>
                            <p className="text-ink/80 leading-relaxed mb-6 text-lg md:text-xl">
                                Мы работаем не только с китайскими марками. В Китае представлен большой выбор европейских, японских и корейских автомобилей — зачастую в комплектациях, которые сложно найти на российском рынке.
                            </p>
                            <p className="text-ink/80 leading-relaxed text-lg md:text-xl">
                                Наша команда работает в России и Китае. Мы ищем предложения, связываемся с продавцами, организуем проверку, доставку и растаможку. Клиенту остаётся согласовать варианты и условия — остальное мы ведём по договору.
                            </p>
                        </div>
                        <div className="rounded-xl overflow-hidden relative">
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
                            className={`bg-paper rounded-xl p-8 md:p-12 border border-ink/10 ${s.wide ? 'md:col-span-2' : ''}`}
                        >
                            <h3 className="text-2xl md:text-3xl font-semibold mb-6 text-ink leading-tight">
                                {s.title}
                            </h3>
                            {s.paragraphs.map((p, i) => (
                                <p
                                    key={i}
                                    className={`text-ink/80 leading-relaxed text-lg md:text-xl ${i < s.paragraphs.length - 1 ? 'mb-4' : ''}`}
                                >
                                    {p}
                                </p>
                            ))}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pb-16 max-w-4xl">
                    {[
                        { title: 'Довольных клиентов', value: 98, suffix: '%', color: 'bg-brass' },
                        { title: 'Городов доставки', value: 85, suffix: '', color: 'bg-brass' }
                    ].map((stat, i) => (
                        <div key={i} className="border-t border-brass/50 pt-5">
                            <div className="text-brass text-5xl font-medium" style={{ fontFamily: 'var(--font-display)' }}>
                                {stat.value}{stat.suffix}
                            </div>
                            <div className="text-paper/70 text-lg mt-2">{stat.title}</div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-16">
                    <div className="bg-paper rounded-xl p-8 md:p-12 border border-ink/10 flex flex-col">
                        <h3 className="text-2xl md:text-3xl font-semibold mb-4 text-ink leading-tight">
                            Посмотрите, как мы работаем
                        </h3>
                        <p className="text-ink/80 leading-relaxed text-lg md:text-xl mb-8 flex-1">
                            В нашем каталоге представлены автомобили с китайского рынка — от доступных седанов до премиальных моделей.
                        </p>
                        <Link to="/catalog" className="block">
                            <Button
                                type="primary"
                                size="large"
                                block
                                icon={<ArrowRightOutlined />}
                                className="!h-14 !text-lg !font-semibold !rounded-lg btn-brass transition-all"
                            >
                                Перейти в каталог
                            </Button>
                        </Link>
                    </div>

                    <div className="bg-paper rounded-xl p-8 md:p-12 border border-ink/10 flex flex-col">
                        <h3 className="text-2xl md:text-3xl font-semibold mb-4 text-ink leading-tight">
                            Сколько будет стоить под ключ?
                        </h3>
                        <p className="text-ink/80 leading-relaxed text-lg md:text-xl mb-8 flex-1">
                            Введите цену, год и двигатель — калькулятор покажет пошлину, НДС, утильсбор и итог под ключ. Для юрлица и физлица.
                        </p>
                        <Link to="/calculator" state={{ resetScroll: true }} className="block">
                            <Button
                                size="large"
                                block
                                icon={<CalculatorOutlined />}
                                className="!h-14 !text-lg !font-semibold !rounded-lg btn-brass"
                            >
                                Открыть калькулятор
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
