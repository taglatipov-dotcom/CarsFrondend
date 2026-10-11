import { Layout as AntLayout, Button, Drawer } from 'antd';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
    MenuOutlined,
    PhoneOutlined,
    SendOutlined
} from '@ant-design/icons';
import { useState } from 'react';
import LeadModal from './LeadModal';

const { Header, Content, Footer } = AntLayout;

export default function Layout() {
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [leadModalOpen, setLeadModalOpen] = useState(false);

    const navLinks = [
        { path: '/', label: 'Главная' },
        { path: '/catalog', label: 'Каталог' },
        { path: '/about', label: 'О нас' },
        { path: '/blog', label: 'Блог' },
        { path: '/reviews', label: 'Отзывы' },
    ];

    return (
        <AntLayout className="min-h-screen flex flex-col font-sans !bg-transparent relative">

            {/* ============ ГЛОБАЛЬНЫЙ ФОН ============ */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage:
                            "url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1920')"
                    }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-950/85 via-blue-900/80 to-blue-800/75"></div>
            </div>

            {/* ============ HEADER ============ */}
            <Header className="sticky top-0 z-50 w-full !bg-blue-950/80 backdrop-blur-xl border-b border-white/10 px-4 md:px-8 h-20 flex items-center shadow-lg">

                <Link
                    to="/"
                    state={{ resetScroll: true }}
                    className="flex items-center flex-shrink-0 hover:scale-105 transition-transform"
                    aria-label="На главную"
                >
                    <img
                        src="/logo.svg"
                        alt="ILSATAO"
                        className="h-9 md:h-11 w-auto"
                    />
                </Link>

                <div className="ml-auto flex items-center gap-4 lg:gap-6">

                    <nav className="hidden md:flex items-center gap-5 lg:gap-7">
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    state={{ resetScroll: true }}
                                    className="relative group"
                                >
                                    <span
                                        className={`text-lg font-semibold transition-all duration-300 whitespace-nowrap ${
                                            isActive
                                                ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400'
                                                : 'text-white group-hover:text-cyan-300'
                                        }`}
                                    >
                                        {link.label}
                                    </span>
                                    {isActive && (
                                        <span className="absolute -bottom-1.5 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400"></span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    <a
                        href="tel:+79990000000"
                        className="hidden lg:flex items-center gap-2 text-white text-base font-semibold hover:text-cyan-400 transition-colors whitespace-nowrap"
                    >
                        <PhoneOutlined /> +7 (999) 000-00-00
                    </a>

                    <Button
                        type="primary"
                        size="large"
                        onClick={() => setLeadModalOpen(true)}
                        className="hidden lg:inline-flex !bg-gradient-to-r !from-violet-600 !to-fuchsia-600 !border-none hover:!from-violet-500 hover:!to-fuchsia-500 !text-white !text-base !font-semibold rounded-xl shadow-lg shadow-fuchsia-500/30 transition-all hover:scale-105 whitespace-nowrap"
                    >
                        Оставить заявку
                    </Button>

                    <Button
                        className="md:hidden !text-white !bg-white/10 hover:!bg-white/20 border-none rounded-lg flex-shrink-0"
                        type="text"
                        icon={<MenuOutlined className="text-xl" />}
                        onClick={() => setMobileMenuOpen(true)}
                    />
                </div>
            </Header>

            {/* ============ МОБИЛЬНОЕ МЕНЮ ============ */}
            <Drawer
                title={<span className="font-bold text-xl text-white">Меню</span>}
                placement="right"
                onClose={() => setMobileMenuOpen(false)}
                open={mobileMenuOpen}
                styles={{
                    body: { backgroundColor: '#0f172a', color: 'white' },
                    header: { backgroundColor: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.1)' }
                }}
            >
                <div className="flex flex-col gap-6 text-lg">
                    {navLinks.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                state={{ resetScroll: true }}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`transition-colors text-lg font-semibold ${
                                    isActive
                                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400'
                                        : 'text-white hover:text-cyan-400'
                                }`}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                    <hr className="border-slate-700" />
                    <a href="tel:+79990000000" className="flex items-center gap-2 text-white text-base font-semibold whitespace-nowrap">
                        <PhoneOutlined /> +7 (999) 000-00-00
                    </a>
                    <Button
                        type="primary"
                        size="large"
                        block
                        onClick={() => { setMobileMenuOpen(false); setLeadModalOpen(true); }}
                        className="!bg-gradient-to-r !from-violet-600 !to-fuchsia-600 !border-none !text-white !font-semibold"
                    >
                        Оставить заявку
                    </Button>
                </div>
            </Drawer>

            {/* ============ CONTENT ============ */}
            <Content className="flex-1 relative z-10 !bg-transparent">
                <Outlet />
            </Content>

            {/* ============ FOOTER ============ */}
            <Footer className="!bg-blue-950/70 backdrop-blur-xl px-3 md:px-8 !py-8 border-t border-white/10 relative z-10">
                <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8">

                    <Link
                        to="/"
                        state={{ resetScroll: true }}
                        className="flex items-center flex-shrink-0"
                        aria-label="На главную"
                    >
                        <img
                            src="/logo.svg"
                            alt="ILSATAO"
                            className="h-7 w-auto"
                        />
                    </Link>

                    {/* Контакты — на мобильных в столбик, на десктопе в строку */}
                    <div className="flex flex-col md:flex-row items-center gap-3 md:gap-8 text-lg md:text-xl">
                        <a
                            href="tel:+79990000000"
                            className="flex items-center gap-2 text-white hover:text-cyan-400 transition-colors font-medium whitespace-nowrap"
                        >
                            <PhoneOutlined /> +7 (999) 000-00-00
                        </a>
                        <a
                            href="mailto:info@ilsatao.ru"
                            className="flex items-center gap-2 text-white hover:text-cyan-400 transition-colors font-medium whitespace-nowrap"
                        >
                            <SendOutlined /> info@ilsatao.ru
                        </a>
                    </div>

                    {/* Копирайт — на мобильных в столбик, на десктопе в строку */}
                    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-5 text-lg md:text-xl text-slate-400 flex-shrink-0 text-center md:text-left">
                        <p className="m-0 whitespace-nowrap">© {new Date().getFullYear()} ILSATAO</p>
                        <span className="hidden md:inline text-slate-600">|</span>
                        <Link
                            to="/privacy"
                            state={{ resetScroll: true }}
                            className="hover:text-cyan-400 transition-colors whitespace-nowrap"
                        >
                            Политика конфиденциальности
                        </Link>
                    </div>

                </div>
            </Footer>

            {/* ============ МОДАЛЬНОЕ ОКНО ЗАЯВКИ ============ */}
            <LeadModal
                open={leadModalOpen}
                onClose={() => setLeadModalOpen(false)}
                title="Оставить заявку"
                subtitle="Оставьте заявку и мы перезвоним в течение 15 минут"
            />
        </AntLayout>
    );
}