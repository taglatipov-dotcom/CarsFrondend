import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

/* Адреса сайта ILSATAO:
 *   /            витрина (Hub) — три направления
 *   /cars/...    сайт авто (Layout + страницы ниже)
 *   /box         конструктор новогодних боксов
 *   /bags        каталог сумок
 *   /admin/...   ОДНА общая админка: авто, блог, отзывы, боксы, сумки, заявки
 * Старые адреса без /cars (/catalog, /car/x, ...) nginx отдаёт 301-м; LegacyRedirect — то же на клиенте. */
import { useEffect, lazy, Suspense } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Hub from './pages/Hub';

/* Остальные страницы грузятся отдельными файлами по мере перехода:
   посетитель главной не скачивает каталог, калькулятор и тем более админку
   (Ant Design-таблицы, редактор Quill). Главная — сразу, это первый экран. */
const About = lazy(() => import('./pages/About'));
const Catalog = lazy(() => import('./pages/Catalog'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Reviews = lazy(() => import('./pages/Reviews'));
const CarDetails = lazy(() => import('./pages/CarDetails'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Calculator = lazy(() => import('./pages/Calculator'));
const Box = lazy(() => import('./pages/Box'));
const Bags = lazy(() => import('./pages/Bags'));

const AdminLayout = lazy(() => import('./pages/Admin/AdminLayout'));
const AdminCars = lazy(() => import('./pages/Admin/AdminCars'));
const AdminCarForm = lazy(() => import('./pages/Admin/AdminCarForm'));
const AdminBlogs = lazy(() => import('./pages/Admin/AdminBlogs'));
const AdminBlogForm = lazy(() => import('./pages/Admin/AdminBlogForm'));
const AdminReviews = lazy(() => import('./pages/Admin/AdminReviews'));
const AdminReviewForm = lazy(() => import('./pages/Admin/AdminReviewForm'));
const AdminLeads = lazy(() => import('./pages/Admin/AdminLeads'));
const AdminLogin = lazy(() => import('./pages/Admin/AdminLogin'));
const AdminShop = lazy(() => import('./pages/Admin/AdminShop'));

import { isAuthenticated } from './services/AuthApi.js';

const STATIC_TITLES = {
    '/cars':            'Автомобили из Китая для бизнеса',
    '/cars/about':      'О компании',
    '/cars/catalog':    'Каталог автомобилей',
    '/cars/calculator': 'Калькулятор растаможки',
    '/cars/blog':       'Блог и новости',
    '/cars/reviews':    'Отзывы клиентов',
    '/cars/privacy':    'Политика конфиденциальности',
    '/box':             'Новогодние боксы',
    '/bags':            'Сумки',
    '/admin':         'Админка',
    '/admin/login':   'Вход в админку',
    '/admin/cars':    'Автомобили — Админка',
    '/admin/blog':    'Статьи блога — Админка',
    '/admin/reviews': 'Отзывы — Админка',
    '/admin/leads':   'Заявки — Админка',
    '/admin/box/items':   'Товары для бокса — Админка',
    '/admin/box/presets': 'Готовые боксы — Админка',
    '/admin/bags':        'Сумки — Админка',
};

const BASE_TITLE = 'ILSATAO';

function resolveTitle(pathname) {
    pathname = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
    if (STATIC_TITLES[pathname]) return STATIC_TITLES[pathname];

    if (pathname.startsWith('/cars/blog/')) return 'Статья — Блог';
    if (pathname.startsWith('/cars/car/')) return 'Автомобиль — Каталог';

    if (pathname === '/Admin/cars/new') return 'Новое авто — Админка';
    if (/^\/admin\/cars\/\d+\/edit$/.test(pathname)) return 'Редактирование авто — Админка';

    if (pathname === '/Admin/blog/new') return 'Новая статья — Админка';
    if (/^\/admin\/blog\/\d+\/edit$/.test(pathname)) return 'Редактирование статьи — Админка';

    if (pathname === '/Admin/reviews/new') return 'Новый отзыв — Админка';
    if (/^\/admin\/reviews\/\d+\/edit$/.test(pathname)) return 'Редактирование отзыва — Админка';

    return BASE_TITLE;
}

function DocumentTitle() {
    const location = useLocation();
    useEffect(() => {
        const pageTitle = resolveTitle(location.pathname);
        document.title = pageTitle ? `${pageTitle} | ${BASE_TITLE}` : BASE_TITLE;
    }, [location.pathname]);
    return null;
}

function ScrollToTop() {
    const location = useLocation();
    useEffect(() => {
        if (location.state?.resetScroll) {
            window.scrollTo(0, 0);
            return;
        }
        if (location.pathname === '/' || location.pathname === '/cars') return;
        if (location.pathname.startsWith('/admin')) return;
        window.scrollTo(0, 0);
    }, [location.pathname, location.state]);
    return null;
}

/** Старые адреса сайта авто без /cars → тот же адрес с /cars (сохраняя ?query) */
function LegacyRedirect() {
    const { pathname, search } = useLocation();
    return <Navigate to={`/cars${pathname}${search}`} replace />;
}

function RequireAuth({ children }) {
    const location = useLocation();
    if (!isAuthenticated()) {
        return (
            <Navigate
                to="/admin/login"
                state={{ from: location }}
                replace
            />
        );
    }
    return children;
}

function App() {
    return (
        <BrowserRouter>
            <DocumentTitle />
            <ScrollToTop />
            <Suspense fallback={<div className="min-h-screen bg-pine-950" />}>
            <Routes>
                {/* ===== Витрина и разделы ===== */}
                <Route path="/" element={<Hub />} />
                <Route path="/box" element={<Box />} />
                <Route path="/bags" element={<Bags />} />

                {/* ===== Сайт авто ===== */}
                <Route path="/cars" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="about" element={<About />} />
                    <Route path="catalog" element={<Catalog />} />
                    <Route path="calculator" element={<Calculator />} />
                    <Route path="blog" element={<Blog />} />
                    <Route path="blog/:slug" element={<BlogPost />} />
                    <Route path="reviews" element={<Reviews />} />
                    <Route path="car/:slug" element={<CarDetails />} />
                    <Route path="privacy" element={<Privacy />} />
                </Route>

                {/* ===== Старые адреса сайта авто ===== */}
                {['catalog', 'calculator', 'about', 'blog', 'blog/:slug', 'reviews', 'privacy', 'car/:slug'].map((p) => (
                    <Route key={p} path={`/${p}`} element={<LegacyRedirect />} />
                ))}

                {/* ===== Логин ===== */}
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* ===== Защищённая админка ===== */}
                <Route
                    path="/admin"
                    element={
                        <RequireAuth>
                            <AdminLayout />
                        </RequireAuth>
                    }
                >
                    <Route index element={<Navigate to="cars" replace />} />

                    <Route path="cars" element={<AdminCars />} />
                    <Route path="cars/new" element={<AdminCarForm />} />
                    <Route path="cars/:id/edit" element={<AdminCarForm />} />

                    <Route path="blog" element={<AdminBlogs />} />
                    <Route path="blog/new" element={<AdminBlogForm />} />
                    <Route path="blog/:id/edit" element={<AdminBlogForm />} />

                    <Route path="reviews" element={<AdminReviews />} />
                    <Route path="reviews/new" element={<AdminReviewForm />} />
                    <Route path="reviews/:id/edit" element={<AdminReviewForm />} />

                    <Route path="leads" element={<AdminLeads />} />

                    <Route path="box/items" element={<AdminShop key="box_items" collection="box_items" />} />
                    <Route path="box/presets" element={<AdminShop key="box_presets" collection="box_presets" />} />
                    <Route path="bags" element={<AdminShop key="bags" collection="bags" />} />
                </Route>
            </Routes>
            </Suspense>
        </BrowserRouter>
    );
}

export default App;