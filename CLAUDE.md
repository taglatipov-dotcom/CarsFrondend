# ILSATAO — фронтенд (React + Vite)

Сайт ilsatao.ru: поставки автомобилей из Китая для бизнеса (B2B: компании для автопарка, дилеры и
перекупщики, автосалоны) — каталог, карточка авто, калькулятор растаможки, блог, отзывы, заявки, админка.
Бэкенд — отдельный репозиторий `Cars` (FastAPI).
Общаемся и пишем комментарии/сообщения коммитов **на русском**.

## Стек
React 19, Vite 8, React Router 7, Ant Design 6 + @ant-design/icons, Tailwind CSS 4
(через `@tailwindcss/vite`), react-quill-new (редактор статей).

## Структура
```
index.html                 title, description, og-теги (SEO)
public/                    robots.txt, sitemap.xml, logo.svg, video/ (hero.mp4 главной) — копируются в dist как есть
tools/hero-video/          сборка видео главной (переходы между сценами)
src/
  App.jsx                  роуты, заголовки вкладок, RequireAuth для /admin
  main.jsx                 тема Ant Design (ConfigProvider) под палитру, локаль ru_RU
  style.css                палитра (@theme), шрифты, глобальные стили и переопределения Ant Design
  components/
    CarCard.jsx            ЕДИНАЯ карточка авто (каталог size="lg", главная size="md")
    Layout.jsx             шапка/подвал публичной части
    RouteHero.jsx          первый экран главной: видео этапов на всю ширину + полупрозрачная плашка (STEPS)
    CostBreakdown.jsx      разбивка стоимости (кольцо + список), computeCost, LOGISTICS_COST, COMMISSION_RATE
    CostCalculatorModal.jsx  расчёт для машины из каталога (физлицо, итоги в ₽) + ссылка «Посчитать на юрлицо»
    ImageUploader / MultiImageUploader  загрузка картинок; обёрнуты в ImageDropZone
    ImageDropZone.jsx      Ctrl+V из буфера, drag & drop, кнопка «Вставить из буфера»
    LeadModal.jsx          форма заявки + PhoneInput (маска +7, phoneDigits/formatPhone)
    ReviewSubmitModal.jsx, *Content.jsx
  pages/                   Home, Catalog, CarDetails, Calculator (/calculator), Blog, BlogPost, Reviews, About, Privacy
  pages/Admin/             админка: cars, blog, reviews (модерация), leads, login
  services/
    MockApi.js             НАСТОЯЩИЙ клиент публичного API (название историческое) +
                           adaptCar (snake_case бэка → объект фронта) + кэш + фильтры каталога
    AdminApi.js, AuthApi.js, UploadApi.js
    urls.js                API_BASE_URL='/api', toImageUrl()
  utils/clipboardImages.js извлечение картинок из буфера обмена / drop
  utils/slug.js            адреса: carPath(car) → /car/zeekr-001-2026-7, blogPath(blog) → /blog/<slug>
  utils/pageMeta.js        usePageMeta({title, description}) для страниц с данными
  utils/articleHtml.js     чистка HTML статьи (&nbsp;, адреса картинок)
```

## API
- Всегда относительный `/api/...`. В dev Vite проксирует на `localhost:8000` и срезает `/api`
  (`vite.config.ts`), в проде то же делает nginx.
- Любой URL картинки выводить через `toImageUrl()`: он приводит все варианты из базы
  (`http://ilsatao.ru/uploads/...`, `http://localhost:8000/uploads/...`, `/uploads/...`) к `/uploads/<файл>`.
  НЕ превращать в `/api/uploads/...`: в nginx regex-локация для `.jpg/.png` важнее `location /api/`
  и отдаёт 404. `/uploads/` в nginx — `location ^~ /uploads/` → бэкенд; в dev — прокси в `vite.config.ts`.
- Миниатюры: в карточках и списках — `toThumbUrl(url)` (→ `/uploads/thumbs/<имя>.webp`, бэкенд создаёт
  сам), на странице машины в большом слайдере и в просмотре — `toImageUrl(url)` (оригинал).
- Ссылки на машины и статьи — только через `carPath()` / `blogPath()`. `slugify` в `utils/slug.js`
  повторён на бэкенде (`src/seo.py`) — менять синхронно. Старые `/car/7`, `/blog/7` перенаправляются.
- `sitemap.xml` генерирует бэкенд из базы (`/seo/sitemap.xml`); в `public/` его нет и не нужно.
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
- Плашка с текстом на карточке — полупрозрачная тёмная `bg-pine-950/65 backdrop-blur-md`, текст светлый.

- «Бюджетная таможня»: возраст 3–5 лет, ≤160 л.с., бензин/дизель, объём ≤1.5 л (`isBudgetCustomCar`).
- В карточке авто нет поля VIN; объём двигателя показывается во вкладках «Обзор» и «Характеристики».
- Стили — утилиты Tailwind; для переопределения Ant Design — `!`-классы или `style.css`.
- Телефон на сайте: +7 987 498 17 37.
- Марки авто — ЕДИНЫЙ справочник `brandData` в `MockApi.js` (марка → страна, модели). Из него
  строятся и фильтр каталога, и список в админке (`CAR_DICTIONARIES.brands = allBrands`).
  Новую марку добавлять только туда.
- Форма авто: у вкладок `forceRender`, при сохранении — `form.getFieldsValue(true)`; иначе поля
  неоткрытых вкладок не попадают в запрос. «Дублировать» = `/admin/cars/new?copy=<id>`.
- Порядок фото: перетаскивание в `MultiImageUploader` (первое — главное). Внутреннее перетаскивание
  помечено `application/x-ilsatao-photo`, чтобы `ImageDropZone` не принимал его за файл.
- Картинки в админке: везде через `ImageUploader` / `MultiImageUploader` (умеют Ctrl+V и drag & drop).
  `globalPaste` включать, только если загрузчик на странице один (сейчас — форма авто).
  В редакторе статей (Quill) вставленные картинки загружаются на сервер через `uploader.handler` —
  не возвращать дефолтное поведение Quill (base64 прямо в HTML статьи).
- Телефон в форме заявки хранится как «+7 (987) 498-17-37»; при правке маски проверять: вставку
  «89874981737» / «+7 987…», стирание Backspace через «)» и «-».

## Оформление (палитра «хвоя и латунь», с октября 2026)
- Токены — в `style.css` (`@theme`): `pine-950/900/800/700` — тёмно-зелёные фоны, `paper` — светлые
  панели («документы») и текст на тёмном, `ink` — текст на светлом, `brass` (+`brass-hi`/`brass-lo`) —
  единственный акцент, `moss` — «успех». Классы Tailwind: `bg-pine-950`, `text-paper/70`, `text-ink`, `bg-brass`…
- Не возвращать: градиенты (violet/fuchsia/cyan), цветные тени, стекло на панелях, фото-подложку сайта,
  заголовки КАПСОМ. Ссылки и акценты на светлом фоне — `brass-lo` (контраст), на тёмном — `brass`.
- Шрифты: заголовки h1/h2 — Unbounded 500 (правило в `style.css`), текст — Onest.
- Кнопки: основная — класс `btn-brass` (латунь, тёмный текст), второстепенная на тёмном — `btn-ghost`.
- Главная: `RouteHero` — блок на высоту экрана с реальным видео, поверх — полупрозрачная плашка
  (`.video-plate`) с этапом, текстом и кнопками; клик по видео / «Дальше» / номер этапа — смена этапа.
  Видео — одно, в нескольких вариантах (`<source>` по порядку, браузер берёт первый подходящий):
  ПК — `hero-1440.av1.mp4` (2560×1440, AV1) → `hero.mp4` (1920, H.264); телефон (до 767 px) —
  `hero-mobile.av1.mp4` → `hero-mobile.mp4` (1280). Кадр-заглушка `hero.jpg`. В нём 6 сцен с динамичными переходами (пролёт с радиальным размытием, рывок камеры,
  пролёт через затемнение). `STOPS` — время конца каждого этапа: клик проигрывает отрезок до следующей
  точки и ставит паузу на показанном кадре (requestVideoFrameCallback, запасной вариант — rAF) без перемотки:
  перемотка после паузы откатывала кадр назад и давала дрожание. После этапа 6 ролик идёт через
  переход 6 → 1 до `LOOP_STOP` — этот кадр совпадает с `STOPS[0]`, затем тихая перемотка в начало.
  Прыжок через этапы / назад — затемнение 0.2 с, перемотка в конец предыдущего этапа и проигрыш перехода.
  Никаких CSS-трансформаций видео на паузе (масштаб/приближение) — масштабирование стоп-кадра дрожит.
  `prefers-reduced-motion` — без проигрыша, только кадры.
- Пересборка видео из исходника (6 сцен подряд, 24 к/с): `python tools/hero-video/build_hero.py исходник.mp4 out`
  (нужны numpy, opencv-python, ffmpeg). Границы сцен — `CUTS`, стили переходов — `STYLES`. Скрипт пишет
  `hero.json` со `stops`/`loopStop` — перенести их в `STOPS`/`LOOP_STOP` в `RouteHero.jsx`.
  Качество: резкость unsharp, в AV1 — синтетическое зерно (film-grain) против «ступенек» на тёмном,
  в H.264 — tune=film и aq-mode=3. Кодирование AV1 1440p идёт несколько минут.
  Исходник (55 МБ) в репозиторий не кладём.
- Калькулятор (`/calculator`): ручной ввод → `POST /cars/calculator` (`fetchCustomsCalc`), тип ввоза
  юрлицо (по умолчанию) / физлицо для перепродажи / физлицо для себя. Принимает параметры из адреса
  (`?price&year&engine&volume&power&unit&owner&curr`) — так из карточки машины открывается расчёт на юрлицо.
- Заявка (`LeadModal`): «Кто вы» (`CLIENT_TYPES`: company/dealer/showroom/person), компания, ИНН,
  количество машин; для «Частное лицо» поля компании скрыты.

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
При добавлении новых публичных страниц — дописать их в sitemap бэкенда (`src/seo_router.py`)
и в `STATIC_TITLES` в `App.jsx`.

## Прочее
- Windows-репозиторий с `core.autocrlf=true`: при работе с git из Linux использовать
  `git -c core.autocrlf=true ...`.
- Git-remote — `origin` (github.com/taglatipov-dotcom/CarsFrondend).
