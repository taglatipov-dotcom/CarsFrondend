import { Statistic } from 'antd';

export default function AboutContent() {
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
                    Мы — команда экспертов по подбору и доставке автомобилей из Китая. Работаем с 2019 года.
                </p>
            </div>

            <div className="max-w-7xl mx-auto py-8 px-4">
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white/50 mb-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h3 className="text-3xl md:text-4xl font-extrabold mb-8 text-slate-900 leading-tight">
                                Ваш надежный партнер в мире китайского автопрома
                            </h3>
                            <p className="text-slate-700 leading-relaxed mb-6 text-lg md:text-xl">
                                За последние годы китайский автопром совершил огромный скачок. Электромобили и гибриды из Китая (Zeekr, Li Auto, Avatr, Voyah) составляют серьезную конкуренцию европейским брендам, предлагая передовые технологии по более доступной цене.
                            </p>
                            <p className="text-slate-700 leading-relaxed text-lg md:text-xl">
                                Мы берем на себя все заботы: от поиска нужной комплектации на аукционах Китая до прохождения таможни, оформления СБКТС и ЭПТС. Вы получаете автомобиль, полностью готовый к эксплуатации на территории РФ.
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

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-16">
                    {[
                        { title: 'Лет на рынке', value: 5, suffix: '+', color: 'from-cyan-400 to-blue-500' },
                        { title: 'Доставлено авто', value: 1500, suffix: '+', color: 'from-blue-500 to-indigo-500' },
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
            </div>
        </div>
    );
}