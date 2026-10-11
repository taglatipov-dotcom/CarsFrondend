import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx' // Импортируем наш главный компонент
import './style.css'        // Импортируем стили (обязательно!)

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)