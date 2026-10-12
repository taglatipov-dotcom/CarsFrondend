import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Catalog from './pages/Catalog';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Reviews from './pages/Reviews';
import CarDetails from './pages/CarDetails';
import Privacy from './pages/Privacy';

import AdminLayout from './pages/Admin/AdminLayout';
import AdminCars from './pages/Admin/AdminCars';
import AdminCarForm from './pages/Admin/AdminCarForm';
import AdminBlogs from './pages/Admin/AdminBlogs';
import AdminBlogForm from './pages/Admin/AdminBlogForm';
import AdminReviews from './pages/Admin/AdminReviews';
import AdminReviewForm from './pages/Admin/AdminReviewForm';
import AdminLeads from './pages/Admin/AdminLeads';
import AdminLogin from './pages/Admin/AdminLogin';

import { isAuthenticated } from './services/AuthApi.js';

const STATIC_TITLES = {
    '/':              'Главная',
    '/about':         'О нас',
    '/catalog':       'Каталог автомобилей',
    '/blog':          'Блог и новости',
    '/reviews':       'Отзывы клиентов',
    '/privacy':       'Политика конфиденциальности',
    '/admin':         'Админка',
    '/admin/login':   'Вход в админку',
    '/admin/cars':    'Автомобили — Админка',
    '/admin/blog':    'Статьи блога — Админка',
    '/admin/reviews': 'Отзывы — Админка',
    '/admin/leads':   'Заявки — Админка',
};

const BASE_TITLE = 'ILSATAO';

function resolveTitle(pathname) {
    if (STATIC_TITLES[pathname]) return STATIC_TITLES[pathname];

    if (pathname.startsWith('/blog/')) return 'Статья — Блог';
    if (pathname.startsWith('/car/')) return 'Автомобиль — Каталог';

    if (pathname === '/admin/cars/new') return 'Новое авто — Админка';
    if (/^\/admin\/cars\/\d+\/edit$/.test(pathname)) return 'Редактирование авто — Админка';

    if (pathname === '/admin/blog/new') return 'Новая статья — Админка';
    if (/^\/admin\/blog\/\d+\/edit$/.test(pathname)) return 'Редактирование статьи — Админка';

    if (pathname === '/admin/reviews/new') return 'Новый отзыв — Админка';
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
        if (location.pathname === '/') return;
        if (location.pathname.startsWith('/admin')) return;
        window.scrollTo(0, 0);
    }, [location.pathname, location.state]);
    return null;
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
            <Routes>
                {/* ===== Публичная часть ===== */}
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="about" element={<About />} />
                    <Route path="catalog" element={<Catalog />} />
                    <Route path="blog" element={<Blog />} />
                    <Route path="blog/:id" element={<BlogPost />} />
                    <Route path="reviews" element={<Reviews />} />
                    <Route path="car/:id" element={<CarDetails />} />
                    <Route path="privacy" element={<Privacy />} />
                </Route>

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
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;