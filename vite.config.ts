import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [
        tailwindcss(), // Плагин для Tailwind CSS
    ],
    server: {
        proxy: {
            // всё, что начинается с /api, уходит на локальный бэкенд
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ''), // срезаем префикс, как nginx
            },
        },
    },
})