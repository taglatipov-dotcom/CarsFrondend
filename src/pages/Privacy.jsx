import { Card } from 'antd';
import { Link } from 'react-router-dom';
import {
    ArrowLeftOutlined,
    SafetyCertificateOutlined,
    FileProtectOutlined,
    LockOutlined,
    EyeOutlined,
    UserOutlined,
    DeleteOutlined,
    MailOutlined,
    PhoneOutlined
} from '@ant-design/icons';

export default function Privacy() {
    const lastUpdate = '1 января 2025 г.';

    const sections = [
        {
            icon: <FileProtectOutlined />,
            color: 'from-cyan-400 to-blue-500',
            title: '1. Общие положения',
            content: (
                <>
                    <p>Настоящая Политика конфиденциальности (далее — «Политика») действует в отношении всей информации, которую сайт <strong>ILSATAO</strong> (далее — «Сайт») может получить о Пользователе во время использования Сайта.</p>
                    <p>Использование Сайта означает безоговорочное согласие Пользователя с настоящей Политикой и указанными в ней условиями обработки его персональной информации. В случае несогласия с этими условиями Пользователь должен воздержаться от использования Сайта.</p>
                    <p>Политика разработана в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных».</p>
                </>
            )
        },
        {
            icon: <UserOutlined />,
            color: 'from-blue-500 to-indigo-500',
            title: '2. Какие данные мы собираем',
            content: (
                <>
                    <p>Мы можем собирать следующие категории данных:</p>
                    <ul className="list-disc pl-6 space-y-2 my-3">
                        <li><strong>Персональные данные:</strong> имя, номер телефона, адрес электронной почты, которые вы добровольно указываете в формах заявок и обратной связи.</li>
                        <li><strong>Данные о предпочтениях:</strong> желаемая марка и модель автомобиля, бюджет, предпочтительный способ связи.</li>
                        <li><strong>Технические данные:</strong> IP-адрес, тип браузера, cookies, данные о посещённых страницах.</li>
                    </ul>
                </>
            )
        },
        {
            icon: <EyeOutlined />,
            color: 'from-violet-500 to-fuchsia-500',
            title: '3. Цели обработки данных',
            content: (
                <>
                    <p>Ваши персональные данные обрабатываются исключительно для следующих целей:</p>
                    <ul className="list-disc pl-6 space-y-2 my-3">
                        <li>обработка заявок на подбор, покупку и доставку автомобилей;</li>
                        <li>обратная связь с Пользователем (звонок, письмо, WhatsApp, Telegram);</li>
                        <li>предоставление консультационных услуг;</li>
                        <li>улучшение работы Сайта и качества обслуживания;</li>
                        <li>соблюдение требований законодательства РФ.</li>
                    </ul>
                    <p>Мы не используем ваши данные для навязчивых рассылок и не передаём их третьим лицам без вашего согласия.</p>
                </>
            )
        },
        {
            icon: <LockOutlined />,
            color: 'from-emerald-400 to-teal-500',
            title: '4. Защита информации',
            content: (
                <>
                    <p>Мы принимаем все необходимые организационные и технические меры для защиты персональной информации Пользователя от неправомерного или случайного доступа, уничтожения, изменения, блокирования, копирования, распространения, а также от иных неправомерных действий третьих лиц.</p>
                    <p>Передача данных между вашим браузером и сервером осуществляется по защищённому протоколу <strong>HTTPS</strong>.</p>
                </>
            )
        },
        {
            icon: <SafetyCertificateOutlined />,
            color: 'from-amber-400 to-orange-500',
            title: '5. Использование cookies',
            content: (
                <>
                    <p>Сайт использует файлы cookies для:</p>
                    <ul className="list-disc pl-6 space-y-2 my-3">
                        <li>запоминания ваших предпочтений при фильтрации каталога;</li>
                        <li>анализа посещаемости и улучшения работы Сайта;</li>
                        <li>корректной работы системы аутентификации.</li>
                    </ul>
                    <p>Вы можете в любой момент отключить cookies в настройках своего браузера, однако это может ограничить функциональность Сайта.</p>
                </>
            )
        },
        {
            icon: <DeleteOutlined />,
            color: 'from-rose-400 to-pink-500',
            title: '6. Права пользователя',
            content: (
                <>
                    <p>Вы имеете право:</p>
                    <ul className="list-disc pl-6 space-y-2 my-3">
                        <li>запросить информацию о том, какие ваши данные мы храним;</li>
                        <li>потребовать исправления, обновления или удаления ваших персональных данных;</li>
                        <li>отозвать согласие на обработку персональных данных;</li>
                        <li>направить жалобу в Роскомнадзор, если считаете, что ваши права нарушены.</li>
                    </ul>
                    <p>Для реализации своих прав свяжитесь с нами по контактным данным из раздела 8.</p>
                </>
            )
        },
        {
            icon: <FileProtectOutlined />,
            color: 'from-slate-500 to-slate-700',
            title: '7. Изменение политики',
            content: (
                <>
                    <p>Мы оставляем за собой право в любое время изменять настоящую Политику без предварительного уведомления. Новая редакция вступает в силу с момента её размещения на Сайте.</p>
                    <p>Рекомендуем периодически проверять эту страницу, чтобы быть в курсе актуальных условий обработки персональных данных.</p>
                </>
            )
        },
    ];

    return (
        <div className="min-h-screen py-14 px-4">
            <div className="max-w-4xl mx-auto">

                <Link
                    to="/"
                    className="inline-flex items-center gap-2 !text-white font-semibold text-base mb-8 hover:!text-cyan-400 transition-colors"
                >
                    <ArrowLeftOutlined /> На главную
                </Link>

                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-2xl">
                        Политика конфиденциальности
                    </h1>
                    <p className="text-slate-200 text-base md:text-lg max-w-2xl mx-auto">
                        Настоящая Политика определяет порядок обработки и защиты персональных данных пользователей сайта ILSATAO
                    </p>
                    <p className="text-slate-300 text-base mt-3">
                        Последнее обновление: <span className="font-semibold text-cyan-400">{lastUpdate}</span>
                    </p>
                </div>

                <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 md:p-10 shadow-2xl border border-white/50">

                    <div className="mb-8 p-5 rounded-2xl bg-gradient-to-br from-violet-50 to-fuchsia-50 border border-violet-100">
                        <p className="text-slate-700 leading-relaxed m-0 text-base md:text-lg">
                            Ваша конфиденциальность важна для нас. Мы собираем только те данные, которые необходимы
                            для оказания услуг по подбору и доставке автомобилей из Китая, и обрабатываем их в строгом
                            соответствии с законодательством Российской Федерации.
                        </p>
                    </div>

                    <div className="flex flex-col gap-8">
                        {sections.map((section, idx) => (
                            <div key={idx}>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.color} text-white flex items-center justify-center text-xl shadow-md flex-shrink-0`}>
                                        {section.icon}
                                    </div>
                                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 m-0">
                                        {section.title}
                                    </h2>
                                </div>
                                <div className="text-slate-600 leading-relaxed text-base md:text-lg pl-0 md:pl-16">
                                    {section.content}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 pt-8 border-t border-slate-200">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 text-white flex items-center justify-center text-xl shadow-md flex-shrink-0">
                                <MailOutlined />
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold text-slate-800 m-0">
                                8. Контактная информация
                            </h2>
                        </div>
                        <p className="text-slate-600 leading-relaxed text-base md:text-lg mb-5 md:pl-16">
                            По любым вопросам, связанным с обработкой персональных данных, вы можете связаться с нами:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:pl-16">
                            <a
                                href="tel:+79990000000"
                                className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-cyan-50 hover:border-cyan-200 transition-all group"
                            >
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 text-white flex items-center justify-center text-lg flex-shrink-0">
                                    <PhoneOutlined />
                                </div>
                                <div>
                                    <div className="text-sm text-slate-400 font-medium uppercase tracking-wider">Телефон</div>
                                    <div className="font-semibold text-slate-800 group-hover:text-cyan-600 transition-colors text-base">
                                        +7 (999) 000-00-00
                                    </div>
                                </div>
                            </a>
                            <a
                                href="mailto:info@ilsatao.ru"
                                className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-violet-50 hover:border-violet-200 transition-all group"
                            >
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white flex items-center justify-center text-lg flex-shrink-0">
                                    <MailOutlined />
                                </div>
                                <div>
                                    <div className="text-sm text-slate-400 font-medium uppercase tracking-wider">Email</div>
                                    <div className="font-semibold text-slate-800 group-hover:text-violet-600 transition-colors text-base">
                                        info@ilsatao.ru
                                    </div>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>

                <p className="text-center text-slate-300 text-base mt-8">
                    © {new Date().getFullYear()} ILSATAO. Все права защищены.
                </p>
            </div>
        </div>
    );
}