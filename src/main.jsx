import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider } from 'antd'
import ruRU from 'antd/locale/ru_RU'
import App from './App.jsx' // Импортируем наш главный компонент
import './style.css'        // Импортируем стили (обязательно!)

/* Тема Ant Design под палитру «хвоя и латунь» (токены — в style.css, @theme) */
const theme = {
    token: {
        colorPrimary: '#8A6A2F',
        colorLink: '#8A6A2F',
        colorSuccess: '#5F8F6E',
        colorText: '#14211C',
        fontFamily: "'Onest', system-ui, -apple-system, 'Segoe UI', sans-serif",
        borderRadius: 6,
        borderRadiusLG: 10,
    },
    components: {
        Modal: { contentBg: '#ECE8DF', headerBg: '#ECE8DF' },
        Button: { primaryShadow: 'none', defaultShadow: 'none' },
    },
}

/* После деплоя старые файлы страниц удаляются: если у посетителя открыта прежняя версия
   и он переходит на страницу, которую ещё не загружал, — просто перезагружаем сайт */
window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    window.location.reload();
});

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ConfigProvider theme={theme} locale={ruRU}>
            <App />
        </ConfigProvider>
    </React.StrictMode>,
)
