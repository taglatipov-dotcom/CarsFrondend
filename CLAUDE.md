# ILSATAO — фронтенд (React + Vite)

Сайт ilsatao.ru: пригон автомобилей из Китая в Россию — каталог, карточка авто,
калькулятор таможни, блог, отзывы с модерацией, заявки, админка.
Бэкенд — отдельный репозиторий `Cars` (FastAPI).
Общаемся и пишем комментарии/сообщения коммитов **на русском**.

## Стек
React (в package.json не указан явно — приходит зависимостью antd/react-router; стоит добавить react и react-dom в dependencies), Vite 8, React Router 7, Ant Design 6 + @ant-design/icons, Tailwind CSS 4
(через `@tailwindcss/vite`), react-quill-new (редактор статей).

## Структура
```
index.html                 title, description, og-теги (SEO)
public/                    robots.txt, sitemap.xml, logo.svg — копируются в dist как есть
src/
  App.jsx                  роуты, заголовки вкладок, RequireAuth для /admin
  style.css                глобальные стили и переопределения Ant Design
  components/
    CarCard.jsx            ЕДИНАЯ карточка авто (каталог size="lg", главная size="md")
    Layout.jsx             шапка/подвал публичной части
    CostCalculatorModal.jsx  калькулятор таможни (итоги в ₽)
    ImageUploader / MultiImageUploader  загрузка картинок; обёрнуты в ImageDropZone
    ImageDropZone.jsx      Ctrl+V из буфера, drag & drop, кнопка «Вставить из буфера»
    LeadModal.jsx          форма заявки + PhoneInput (маска +7, phoneDigits/formatPhone)
    ReviewSubmitModal.jsx, *Content.jsx
  pages/                   Home, Catalog, CarDetails, Blog, BlogPost, Reviews, About, Privacy
  pages/Admin/             админка: cars, blog, reviews (модерация), leads, login
  services/
    MockApi.js             НАСТОЯЩИЙ клиент публичного API (название историческое) +
                           adaptCar (snake_case бэка → объект фронта) + кэш + фильтры каталога
    AdminApi.js, AuthApi.js, UploadApi.js
    urls.js                API_BASE_URL='/api', toImageUrl()
  utils/clipboardImages.js извлечение картинок из буфера обмена / drop
```

## API
- Всегда относительный `/api/...`. В dev Vite проксирует на `localhost:8000` и срезает `/api`
  (`vite.config.ts`), в проде то же делает nginx.
- Любой URL картинки выводить через `toImageUrl()` — он чинит старые `http://127.0.0.1:8000/uploads/...`
  и относительные `/uploads/...`.
- Каталог грузит все машины одним `GET /cars` и фильтрует/пагинирует на клиенте (`fetchCars`).
  После изменений в админке вызывать `invalidateCarsCache()` (и аналоги для блога/отзывов).

## Соглашения по UI
- Все подписи — на русском. Хранимые значения — английские коды
  (`bodyType`: SUV → «Внедорожник», Sedan, MPV, Coupe, Hatchback, Wagon — см. `BODY_TYPE_LABELS`).
- Города в поле «location» — китайские (Шанхай, Пекин, Гуанчжоу, Шэньчжэнь, Чэнду, Ханчжоу, Тяньцзинь, Ухань).
- Цены на карточках и в каталоге — в юанях (¥, `china_price`). Фильтр цены — тоже в ¥.
  Калькулятор таможни (`CostCalculatorModal`) считает и показывает итоги в рублях (₽) — его не трогать
  при изменениях валюты в других местах.
- Каталог: 2 карточки в ряд (`md:grid-cols-2`), на главной 3. Карточки только через `CarCard`.
- Фото у машин разных пропорций (3:4, 1:1, 16:9): показываем целиком (`object-contain`, по центру)
  поверх размытой копии того же фото. Не возвращать `object-cover` с обрезкой.
- Плашка с текстом на карточке — полупрозрачная `bg-white/40 backdrop-blur-md`.
- «Бюджетная таможня»: возраст 3–5 лет, ≤160 л.с., бензин/дизель, объём ≤1.5 л (`isBudgetCustomCar`).
- В карточке авто нет поля VIN; объём двигателя показывается во вкладках «Обзор» и «Характеристики».
- Стили — утилиты Tailwind; для переопределения Ant Design — `!`-классы или `style.css`.
- Телефон на сайте: +7 987 498 17 37.
- Марки авто — ЕДИНЫЙ справочник `brandData` в `MockApi.js` (марка → страна, модели). Из него
  строятся и фильтр каталога, и список в админке (`CAR_DICTIONARIES.brands = allBrands`).
  Новую марку добавлять только туда.
- Картинки в админке: везде через `ImageUploader` / `MultiImageUploader` (умеют Ctrl+V и drag & drop).
  `globalPaste` включать, только если загрузчик на странице один (сейчас — форма авто).
  В редакторе статей (Quill) вставленные картинки загружаются на сервер через `uploader.handler` —
  не возвращать дефолтное поведение Quill (base64 прямо в HTML статьи).
- Телефон в форме заявки хранится как «+7 (987) 498-17-37»; при правке маски проверять: вставку
  «89874981737» / «+7 987…», стирание Backspace через «)» и «-».

## Команды
```bash
npm install
npm run dev        # http://localhost:5173 (нужен бэкенд на :8000)
npm run build      # проверять перед каждым коммитом
```

## Деплой (сервер hera)
```bash
cd /root/Front/CarsFrondend
git pull && npm install && npm run build
sudo rsync -a --delete dist/ /var/www/ilsatao-frontend/
sudo chown -R www-data:www-data /var/www/ilsatao-frontend
sudo systemctl reload nginx
```
nginx: `try_files $uri $uri/ /index.html` (SPA). Файлы для поисковиков (robots.txt, sitemap.xml)
класть только в `public/` — из корня проекта Vite их не публикует.
При добавлении новых публичных страниц — дописать их в `public/sitemap.xml` и в `STATIC_TITLES` в `App.jsx`.

## Прочее
- Windows-репозиторий с `core.autocrlf=true`: при работе с git из Linux использовать
  `git -c core.autocrlf=true ...`.
- Git-remote — `origin` (github.com/taglatipov-dotcom/CarsFrondend).
