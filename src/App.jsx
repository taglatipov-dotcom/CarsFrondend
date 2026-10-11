import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
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

function ScrollToTop() {
    const location = useLocation();

    useEffect(() => {
        // При явном запросе — всегда наверх
        if (location.state?.resetScroll) {
            window.scrollTo(0, 0);
            return;
        }
        // Главная сама восстанавливает позицию — не трогаем
        if (location.pathname === '/') return;

        // Остальные переходы — наверх
        window.scrollTo(0, 0);
    }, [location.pathname, location.state]);

    return null;
}

function App() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <Routes>
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
            </Routes>
        </BrowserRouter>
    );
}

export default App;