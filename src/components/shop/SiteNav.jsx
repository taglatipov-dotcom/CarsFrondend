import { Link, NavLink } from 'react-router-dom';

/* Общая шапка витрины, /box и /bags: логотип, переключатель направлений, справа — слот (корзина и т.п.).
   theme: 'dark' | 'light'. Высота 56 px (h-14) — страницы считают первый экран от неё. */

const LINKS = [
    ['/cars', 'Авто'],
    ['/box', 'Боксы'],
    ['/bags', 'Сумки'],
];

export default function SiteNav({ theme = 'dark', right = null }) {
    const dark = theme === 'dark';
    const shell = dark
        ? 'bg-[#0A0C12]/85 border-white/10 text-white'
        : 'bg-[#F3EFE7]/90 border-black/10 text-[#161513]';
    const link = (active) => {
        if (dark) return active ? 'bg-white/12 !text-white' : '!text-white/60 hover:!text-white hover:bg-white/5';
        return active ? 'bg-black/[0.07] !text-[#161513]' : '!text-black/55 hover:!text-black hover:bg-black/[0.04]';
    };
    return (
        <header className={`sticky top-0 z-40 h-14 shrink-0 border-b backdrop-blur-md ${shell}`}>
            <div className="max-w-[1400px] mx-auto h-full px-3 sm:px-6 flex items-center gap-3 sm:gap-8">
                <Link to="/" className="flex items-center gap-2 font-display-x text-[13px] tracking-[0.08em] !text-current shrink-0">
                    <img src="/logo.svg" alt="" className={`w-6 h-6 ${dark ? '' : 'brightness-0'}`} />
                    <span className="hidden sm:inline">ILSATAO</span>
                </Link>
                <nav className="flex gap-0.5 sm:gap-1 text-sm">
                    {LINKS.map(([to, label]) => (
                        <NavLink key={to} to={to} className={({ isActive }) => `rounded-full px-3 py-1.5 transition-colors ${link(isActive)}`}>
                            {label}
                        </NavLink>
                    ))}
                </nav>
                <div className="ml-auto flex items-center gap-4">
                    <a href="tel:+79874981737" className={`hidden md:inline micro ${dark ? '!text-white/50 hover:!text-white' : '!text-black/50 hover:!text-black'}`}>
                        +7 987 498 17 37
                    </a>
                    {right}
                </div>
            </div>
        </header>
    );
}
