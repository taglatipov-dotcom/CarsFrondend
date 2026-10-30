import { Layout as AntLayout, Button, Drawer } from 'antd';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
    MenuOutlined,
    PhoneOutlined,
    SendOutlined,
    DashboardOutlined,
    LoginOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import LeadModal from './LeadModal';
import { isAuthenticated } from '../services/AuthApi.js';

const { Header, Content, Footer } = AntLayout;

const PHONE_DISPLAY = '+7 (987) 498-17-37';
const PHONE_HREF = 'tel:+79874981737';

export default function Layout() {
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [leadModalOpen, setLeadModalOpen] = useState(false);

    const authed = isAuthenticated();

    const navLinks = [
        { path: '/', label: 'Главная' },
        { path: '/catalog', label: 'Каталог' },
        { path: '/calculator', label: 'Калькулятор' },
        { path: '/about', label: 'О компании' },
        { path: '/blog', label: 'Блог' },
        { path: '/reviews', label: 'Отзывы' },
    ];

    return (
        <AntLayout className="min-h-screen flex flex-col font-sans !bg-pine-950 relative">

            
            {/* ============ HEADER ============ */}
            <Header className="sticky top-0 z-50 w-full !bg-pine-950/95 backdrop-blur-md border-b border-paper/10 px-3 sm:px-4 md:px-6 lg:px-8 h-20 flex items-center overflow-hidden">

                {/* Логотип — сжимаемый */}
                <Link
                    to="/"
                    state={{ resetScroll: true }}
                    className="flex items-center flex-shrink min-w-0"
                    aria-label="На главную"
                >
                    <img
                        src="/logo.svg"
                        alt="ILSATAO"
                        className="h-8 sm:h-9 md:h-10 lg:h-11 w-auto max-w-[110px] sm:max-w-[140px] md:max-w-[170px] lg:max-w-none object-contain"
                    />
                </Link>

                {/* Правый блок */}
                <div className="ml-auto flex items-center gap-2 sm:gap-3 lg:gap-6 min-w-0">

                    {/* Навигация — только на md+ */}
                    <nav className="hidden md:flex items-center gap-3 lg:gap-6 min-w-0">
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
                                        className={`text-sm lg:text-base font-medium transition-colors whitespace-nowrap ${
                                            isActive ? 'text-brass' : 'text-paper/85 group-hover:text-paper'
                                        }`}
                                    >
                                        {link.label}
                                    </span>
                                    {isActive && (
                                        <span className="absolute -bottom-2 left-0 right-0 h-px bg-brass"></span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Телефон — только на lg+ */}
                    <a
                        href={PHONE_HREF}
                        className="hidden lg:flex items-center gap-2 text-paper text-sm xl:text-base font-medium hover:text-brass transition-colors whitespace-nowrap"
                    >
                        <PhoneOutlined /> {PHONE_DISPLAY}
                    </a>

                    {/* Кнопка «Оставить заявку» — обёрнута в div, чтобы hidden работал надёжно */}
                    <div className="hidden lg:block">
                        <Button
                            type="primary"
                            size="large"
                            onClick={() => setLeadModalOpen(true)}
                            className="btn-brass !text-sm xl:!text-base !font-semibold !rounded-md whitespace-nowrap"
                        >
                            Оставить заявку
                        </Button>
                    </div>

                    {/* Бургер — только на мобильных (до md) */}
                    <Button
                        className="md:hidden !text-paper !bg-paper/10 hover:!bg-paper/20 border-none rounded-md flex-shrink-0"
                        type="text"
                        icon={<MenuOutlined className="text-xl" />}
                        onClick={() => setMobileMenuOpen(true)}
                    />
                </div>
            </Header>

            {/* ============ МОБИЛЬНОЕ МЕНЮ (Drawer) ============ */}
            <Drawer
                title={<span className="font-semibold text-xl text-paper">Меню</span>}
                placement="right"
                onClose={() => setMobileMenuOpen(false)}
                open={mobileMenuOpen}
                styles={{
                    body: { backgroundColor: '#0F1A17', color: '#ECE8DF' },
                    header: { backgroundColor: '#0F1A17', borderBottom: '1px solid rgba(236,232,223,0.1)' }
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
                                className={`transition-colors text-lg font-medium ${
                                    isActive ? 'text-brass' : 'text-paper hover:text-brass'
                                }`}
                            >
                                {link.label}
                            </Link>
                        );
                    })}

                    <hr className="border-paper/15" />

                    <a
                        href={PHONE_HREF}
                        className="flex items-center gap-2 text-paper text-base font-medium whitespace-nowrap"
                    >
                        <PhoneOutlined /> {PHONE_DISPLAY}
                    </a>

                    <Button
                        type="primary"
                        size="large"
                        block
                        onClick={() => { setMobileMenuOpen(false); setLeadModalOpen(true); }}
                        className="btn-brass !font-semibold !rounded-md"
                    >
                        Оставить заявку
                    </Button>

                    {/* ===== Ссылка в админку ===== */}
                    <hr className="border-paper/15" />

                    <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 text-paper/60 hover:text-brass transition-colors text-base"
                    >
                        {authed ? <DashboardOutlined /> : <LoginOutlined />}
                        {authed ? 'Панель администратора' : 'Войти в админку'}
                    </Link>
                </div>
            </Drawer>

            {/* ============ CONTENT ============ */}
            <Content className="flex-1 relative z-10 !bg-transparent">
                <Outlet />
            </Content>

            {/* ============ FOOTER ============ */}
            <Footer className="!bg-pine-950 px-3 md:px-8 !py-10 border-t border-paper/10 relative z-10">
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

                    <div className="flex flex-col md:flex-row items-center gap-3 md:gap-8 text-base md:text-lg">
                        <a
                            href={PHONE_HREF}
                            className="flex items-center gap-2 text-paper hover:text-brass transition-colors whitespace-nowrap"
                        >
                            <PhoneOutlined /> {PHONE_DISPLAY}
                        </a>
                        <a
                            href="mailto:info@ilsatao.ru"
                            className="flex items-center gap-2 text-paper hover:text-brass transition-colors whitespace-nowrap"
                        >
                            <SendOutlined /> info@ilsatao.ru
                        </a>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-5 text-base md:text-lg text-paper/50 flex-shrink-0 text-center md:text-left">
                        <p className="m-0 whitespace-nowrap">© {new Date().getFullYear()} ILSATAO</p>
                        <span className="hidden md:inline text-paper/20">|</span>
                        <Link
                            to="/privacy"
                            state={{ resetScroll: true }}
                            className="hover:text-brass transition-colors whitespace-nowrap"
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
                subtitle="Расскажите, какие машины нужны компании, — менеджер перезвонит в течение 15 минут"
            />
        </AntLayout>
    );
}