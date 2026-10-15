import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const BASE_TITLE = 'ILSATAO';

function setMeta(selector, attr, name, content) {
    let el = document.head.querySelector(selector);
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
    }
    el.setAttribute('content', content);
}

/**
 * Заголовок вкладки и description для страниц с данными (машина, статья)
 * при переходах внутри сайта. Первую загрузку страницы для поисковиков
 * уже отдаёт бэкенд с готовыми мета-тегами (src/seo.py).
 */
export function usePageMeta(meta) {
    const title = meta?.title;
    const description = meta?.description;
    // pathname в зависимостях: App/DocumentTitle сбрасывает заголовок при смене адреса
    // (например, /car/7 → /car/zeekr-001-2026-7), и его нужно поставить заново
    const { pathname } = useLocation();
    useEffect(() => {
        if (!title) return;
        document.title = `${title} | ${BASE_TITLE}`;
        if (description) {
            const d = description.replace(/\s+/g, ' ').trim().slice(0, 300);
            setMeta('meta[name="description"]', 'name', 'description', d);
            setMeta('meta[property="og:description"]', 'property', 'og:description', d);
        }
        setMeta('meta[property="og:title"]', 'property', 'og:title', title);
    }, [title, description, pathname]);
}
