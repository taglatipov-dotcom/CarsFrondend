// ============ БАЗА ДАННЫХ МАРОК ============
const brandData = {
    // Китайские
    "Zeekr": { country: "Китай", models: ["001", "007", "X"] },
    "Li Auto": { country: "Китай", models: ["L7", "L8", "L9"] },
    "Avatr": { country: "Китай", models: ["11", "12"] },
    "Voyah": { country: "Китай", models: ["Free", "Dreamer"] },
    "Exeed": { country: "Китай", models: ["RX", "TXL"] },
    "BYD": { country: "Китай", models: ["Han", "Tang", "Seal"] },
    "Nio": { country: "Китай", models: ["ET5", "ET7", "ES6"] },
    "XPeng": { country: "Китай", models: ["P7", "G9", "G6"] },
    "Hongqi": { country: "Китай", models: ["H9", "E-HS9"] },
    "Geely": { country: "Китай", models: ["Monjaro", "Coolray", "Atlas"] },
    // Европейские
    "BMW": { country: "Германия", models: ["i4", "iX", "X5"] },
    "Mercedes-Benz": { country: "Германия", models: ["EQS", "EQE", "GLE"] },
    "Audi": { country: "Германия", models: ["e-tron", "Q8", "A6"] },
    "Porsche": { country: "Германия", models: ["Taycan", "Cayenne", "Macan"] },
    "Volkswagen": { country: "Германия", models: ["ID.4", "ID.6", "Touareg"] },
    "Volvo": { country: "Швеция", models: ["XC90", "XC60", "EX30"] },
    "Land Rover": { country: "Великобритания", models: ["Range Rover", "Defender"] },
    // Японские
    "Toyota": { country: "Япония", models: ["Camry", "RAV4", "Land Cruiser"] },
    "Lexus": { country: "Япония", models: ["RX", "NX", "LX"] },
    "Honda": { country: "Япония", models: ["CR-V", "Accord", "Pilot"] },
    "Nissan": { country: "Япония", models: ["X-Trail", "Qashqai", "Patrol"] },
    "Mazda": { country: "Япония", models: ["CX-5", "CX-9", "MX-30"] },
    "Subaru": { country: "Япония", models: ["Outback", "Forester"] },
    "Mitsubishi": { country: "Япония", models: ["Outlander", "Pajero"] },
    // Корейские
    "Hyundai": { country: "Корея", models: ["Tucson", "Santa Fe", "Palisade"] },
    "Kia": { country: "Корея", models: ["Sportage", "Sorento", "EV6"] },
    "Genesis": { country: "Корея", models: ["GV70", "GV80", "G80"] },
    // Американские
    "Tesla": { country: "США", models: ["Model 3", "Model Y", "Model S"] },
    "Jeep": { country: "США", models: ["Grand Cherokee", "Wrangler"] },
};

export const popularBrands = ["Zeekr", "Li Auto", "BMW", "Toyota", "Tesla"];
export const allBrands = Object.keys(brandData);

export const brandsByCountry = Object.entries(brandData).reduce((acc, [brand, info]) => {
    if (!acc[info.country]) acc[info.country] = [];
    acc[info.country].push(brand);
    return acc;
}, {});

// ============ СПРАВОЧНИКИ ============
const bodyTypes = ["SUV", "Sedan", "MPV"];
const colors = ["Серый металлик", "Черный", "Белый перламутр", "Синий", "Красный"];
const engineTypes = [
    "Бензиновый",
    "Последовательный гибрид",
    "Параллельный гибрид",
    "Электрический",
    "Дизельный"
];
const locations = ["Владивосток", "Москва", "Санкт-Петербург", "Новосибирск", "Казань", "Екатеринбург"];

// ============ ГЕНЕРАЦИЯ 200 МАШИН (имитация БД на бэкенде) ============
const TOTAL_CARS_IN_DB = 200;

const mockCarsDB = Array.from({ length: TOTAL_CARS_IN_DB }, (_, i) => {
    const brand = allBrands[i % allBrands.length];
    const brandInfo = brandData[brand];
    const model = brandInfo.models[Math.floor(i / allBrands.length) % brandInfo.models.length];

    const bodyType = bodyTypes[i % bodyTypes.length];
    // Разброс цен 1.5 – 9.5 млн
    const basePrice = 1500000 + ((i * 137) % 80) * 100000;
    const year = 2023 + (i % 3);
    const isNew = i % 3 !== 0;
    const engineType = engineTypes[i % engineTypes.length];

    // Мощность л.с.
    let horsepower;
    if (engineType === "Бензиновый") {
        horsepower = 130 + (i % 4) * 10; // 130, 140, 150, 160
    } else if (engineType === "Последовательный гибрид") {
        horsepower = 280 + (i % 80);
    } else if (engineType === "Параллельный гибрид") {
        horsepower = 260 + (i % 80);
    } else if (engineType === "Электрический") {
        horsepower = 300 + (i % 200);
    } else {
        horsepower = 150 + (i % 100);
    }

    return {
        id: i + 1,
        popularityRank: i,
        vin: `LFV3A23C1P40${String(i + 1).padStart(5, '0')}`,
        brand,
        model,
        name: `${brand} ${model}`,
        country: brandInfo.country,
        year,
        price: basePrice,
        oldPrice: i % 3 === 0 ? basePrice + 250000 : null,
        currency: "RUB",
        condition: isNew ? "new" : "used",
        mileage: isNew ? 0 : 5000 + (i * 1500),
        bodyType,
        color: colors[i % colors.length],
        drive: i % 2 === 0 ? "AWD" : "RWD",
        available: true,
        location: locations[i % locations.length],
        createdAt: `2024-${String((i % 12) + 1).padStart(2, '0')}-15`,

        engineType,
        horsepower,

        images: [
            `https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=1200&sig=${i}`,
            `https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=1200&sig=${i}b`,
            `https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=1200&sig=${i}c`,
            `https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1200&sig=${i}d`
        ],

        specs: {
            engine: engineType,
            power: `${horsepower} л.с.`,
            torque: `${600 + (i % 400)} Нм`,
            acceleration: `${(3.5 + (i % 30) * 0.1).toFixed(1)} сек`,
            topSpeed: `${180 + (i % 60)} км/ч`,
            range: engineType === "Электрический" ? `${400 + (i % 200)} км` : `${600 + (i % 400)} км`,
            battery: engineType === "Электрический" ? `${80 + (i % 40)} кВтч` : "—",
            charging: engineType === "Электрический" ? "800V, 30 мин до 80%" : "—",
            transmission: "Автоматическая",
            drive: i % 2 === 0 ? "Полный" : "Задний",
            consumption: `${(15 + (i % 10) * 0.3).toFixed(1)} кВтч/100км`,
            fuelType: engineType
        },

        dimensions: {
            length: `${4700 + (i % 30) * 15} мм`,
            width: `${1900 + (i % 20) * 5} мм`,
            height: `${1500 + (i % 20) * 8} мм`,
            wheelbase: `${2900 + (i % 20) * 10} мм`,
            clearance: `${150 + (i % 3) * 10} мм`,
            weight: `${2000 + (i % 30) * 20} кг`,
            trunk: `${400 + (i % 20) * 5} л`,
            seats: bodyType === "MPV" ? 7 : 5
        },

        interior: {
            color: ["Черный", "Бежевый", "Коричневый"][i % 3],
            material: i % 2 === 0 ? "Кожа Nappa" : "Эко-кожа",
            seats: "С подогревом, вентиляцией и массажем",
            display: `1${i % 5}.4" центральный сенсорный`,
            audio: `${8 + (i % 5)} динамиков премиум`
        },

        safety: [
            "ABS", "ESP", "EBD", "BAS",
            `Airbags (${6 + (i % 4)} шт)`,
            "Система контроля слепых зон",
            "Адаптивный круиз-контроль",
            "Автоматическое экстренное торможение",
            "Контроль полосы движения"
        ],

        features: [
            "Панорамная крыша",
            "Электропривод и память сидений",
            "Бесключевой доступ и запуск",
            "Камера 360°",
            "Передние и задние парктроники",
            "Apple CarPlay / Android Auto",
            "Подогрев руля и сидений",
            "Мультизонный климат-контроль",
            "LED-оптика",
            `Литые диски R${18 + (i % 3)}`
        ],

        description: `${brand} ${model} ${year} года (${brandInfo.country}) — это современный ${bodyType === 'SUV' ? 'кроссовер' : bodyType === 'Sedan' ? 'седан' : 'минивэн'} с двигателем типа "${engineType}". Мощность — ${horsepower} л.с. Автомобиль отличается передовыми технологиями, высоким уровнем комфорта и отличной динамикой.`,

        costBreakdown: {
            carPrice: basePrice,
            logistics: 400000 + (i % 20) * 10000,
            customs: Math.round(basePrice * 0.25),
            sbkts: 150000,
            companyFee: 100000
        }
    };
});

// Экспорт для использования на главной странице (первые 3 из БД)
export const mockCars = mockCarsDB;

// ============ БЛОГ ============
export const mockBlogs = [
    {
        id: 1,
        slug: "rastamozhka-2024",
        title: "Как растаможить электромобиль из Китая в 2024 году",
        excerpt: "Полный гайд по расчёту пошлин, оформлению СБКТС и ЭПТС для физических и юридических лиц.",
        image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=1200",
        date: "12 Мая 2024",
        tag: "Таможня",
        author: "Редакция ILSATAO",
        readTime: "7 мин",
        content: `
            <p class="lead">Покупка электромобиля из Китая — это не только экономия до 40% от цены европейских аналогов, но и определённые бюрократические процедуры. В этой статье мы разберём весь процесс растаможки пошагово.</p>

            <h2>Что такое СБКТС и ЭПТС?</h2>
            <p><strong>СБКТС</strong> — Свидетельство о безопасности конструкции транспортного средства. Документ подтверждает, что автомобиль соответствует требованиям технического регламента Таможенного союза.</p>
            <p><strong>ЭПТС</strong> — Электронный паспорт транспортного средства. Оформляется в системе АО «Электронный паспорт» и заменяет собой бумажный ПТС.</p>

            <blockquote>Без СБКТС и ЭПТС автомобиль невозможно поставить на учёт в ГИБДД, поэтому эти документы оформляются в первую очередь после прибытия машины в Россию.</blockquote>

            <h2>Расчёт таможенных пошлин</h2>
            <p>Размер пошлины зависит от возраста автомобиля, объёма двигателя и его таможенной стоимости. Для электромобилей действует льготная ставка — 15% от стоимости, но не менее 0,36 евро за 1 кВт·ч мощности батареи.</p>

            <img src="https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=1200" alt="Электромобиль из Китая" />

            <h3>Пример расчёта для Zeekr 001</h3>
            <table>
                <thead>
                    <tr><th>Статья расходов</th><th>Сумма</th></tr>
                </thead>
                <tbody>
                    <tr><td>Стоимость авто в Китае</td><td>3 500 000 ₽</td></tr>
                    <tr><td>Логистика до Владивостока</td><td>450 000 ₽</td></tr>
                    <tr><td>Таможенная пошлина (15%)</td><td>525 000 ₽</td></tr>
                    <tr><td>СБКТС и ЭПТС</td><td>150 000 ₽</td></tr>
                    <tr><td>Комиссия компании</td><td>100 000 ₽</td></tr>
                    <tr><td><strong>Итого под ключ</strong></td><td><strong>4 725 000 ₽</strong></td></tr>
                </tbody>
            </table>

            <h2>Пошаговая инструкция</h2>
            <ol>
                <li>Подбор автомобиля на аукционе или у дилера в Китае</li>
                <li>Заключение договора и внесение предоплаты</li>
                <li>Доставка до порта и отправка во Владивосток</li>
                <li>Прохождение таможенной очистки</li>
                <li>Оформление СБКТС в аккредитованной лаборатории</li>
                <li>Получение ЭПТС в электронном виде</li>
                <li>Постановка на учёт в ГИБДД по месту жительства</li>
            </ol>

            <h2>Видео-гайд по растаможке</h2>
            <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Растаможка авто из Китая" allowfullscreen></iframe>

            <h2>Итог</h2>
            <p>Растаможка электромобиля из Китая — процесс трудоёмкий, но вполне реальный. Главное — заранее рассчитать все расходы и работать с проверенными компаниями-посредниками. Если у вас остались вопросы, свяжитесь с нами — мы бесплатно рассчитаем стоимость вашего автомобиля под ключ.</p>
        `
    },
    {
        id: 2,
        slug: "zeekr-vs-li-auto",
        title: "Zeekr 001 против Li Auto L9: что выбрать?",
        excerpt: "Сравниваем два самых популярных китайских электрокара на российском рынке. Плюсы и минусы.",
        image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=1200",
        date: "05 Мая 2024",
        tag: "Обзоры",
        author: "Алексей Петров",
        readTime: "10 мин",
        content: `
            <p class="lead">Zeekr 001 и Li Auto L9 — два флагмана китайского автопрома, которые активно завоёвывают российский рынок. Разберём, чем они отличаются и кому подойдёт каждый.</p>

            <h2>Кузов и габариты</h2>
            <p>Zeekr 001 — это стильный <strong>шутинг-брейк</strong> длиной 4 970 мм. Li Auto L9 — полноразмерный <strong>кроссовер</strong> длиной 5 218 мм с 6-местным салоном.</p>

            <img src="https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=1200" alt="Li Auto L9" />

            <h2>Силовые установки</h2>
            <ul>
                <li><strong>Zeekr 001:</strong> полностью электрический, до 400 кВт, запас хода до 750 км (CLTC)</li>
                <li><strong>Li Auto L9:</strong> последовательный гибрид, ДВС 1.5T + 2 электромотора, общий запас хода до 1315 км</li>
            </ul>

            <blockquote>Если вы ездите преимущественно по городу и у вас есть зарядка — берите Zeekr. Если нужно ездить на дальние расстояния без проблем с зарядкой — Li Auto L9.</blockquote>

            <h2>Интерьер и технологии</h2>
            <p>Оба автомобиля предлагают премиальные материалы, панорамные крыши, огромные сенсорные экраны и продвинутые системы помощи водителю. Li Auto L9 имеет <strong>5 экранов</strong>, включая проекцию для задних пассажиров.</p>

            <img src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1200" alt="Интерьер" />

            <h2>Цены под ключ</h2>
            <table>
                <thead>
                    <tr><th>Модель</th><th>Цена в Китае</th><th>Под ключ во Владивостоке</th></tr>
                </thead>
                <tbody>
                    <tr><td>Zeekr 001</td><td>от 3 200 000 ₽</td><td>от 4 500 000 ₽</td></tr>
                    <tr><td>Li Auto L9</td><td>от 4 800 000 ₽</td><td>от 6 200 000 ₽</td></tr>
                </tbody>
            </table>

            <h2>Вывод</h2>
            <p>Оба автомобиля достойны внимания и предлагают лучшее соотношение цены и качества в своих классах. Окончательный выбор зависит от ваших приоритетов: динамика и внешний вид (Zeekr) или практичность и универсальность (Li Auto).</p>
        `
    },
    {
        id: 3,
        slug: "top-5-crossover",
        title: "Топ-5 кроссоверов из Китая до 4 млн рублей",
        excerpt: "Подборка лучших предложений от Avatr, Voyah и Exeed. Характеристики и цены под ключ.",
        image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=1200",
        date: "28 Апреля 2024",
        tag: "Подборки",
        author: "Мария Сидорова",
        readTime: "8 мин",
        content: `
            <p class="lead">Китайские кроссоверы уже давно перестали быть «дешёвыми аналогами». Сегодня это современные автомобили с премиальным оснащением по цене европейских конкурентов в базовой комплектации. Собрали для вас 5 лучших вариантов до 4 млн рублей под ключ.</p>

            <h2>1. Avatr 11</h2>
            <p>Купе-кроссовер с футуристичным дизайном, мощностью до 578 л.с. и запасом хода 680 км. Внутри — три экрана, аудиосистема премиум-класса и кожа Nappa.</p>

            <h2>2. Voyah Free</h2>
            <p>Среднеразмерный премиум-кроссовер с гибридной силовой установкой. Разгон до 100 км/ч за 4.8 секунды, запас хода 860 км по циклу CLTC.</p>

            <img src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=1200" alt="Voyah Free" />

            <h2>3. Exeed RX</h2>
            <p>Спортивный бензиновый кроссовер с 2.0T двигателем на 261 л.с., полным приводом и 8-ступенчатым автоматом. Отличный выбор для тех, кто не готов к электрификации.</p>

            <h2>4. Zeekr X</h2>
            <p>Компактный электрический кроссовер с разгоном 3.7 сек и запасом хода до 560 км. Идеален для города.</p>

            <h2>5. Hongqi E-HS9</h2>
            <p>Флагманский семиместный электрический внедорожник. 510 л.с., пневмоподвеска, четыре экрана и уровень оснащения, сопоставимый с BMW X7.</p>

            <blockquote>Все указанные цены включают таможенную очистку, СБКТС, ЭПТС и доставку до Владивостока. Стоимость может меняться в зависимости от курса валют.</blockquote>

            <h2>Сравнительная таблица</h2>
            <table>
                <thead>
                    <tr><th>Модель</th><th>Мощность</th><th>Запас хода</th><th>Цена под ключ</th></tr>
                </thead>
                <tbody>
                    <tr><td>Avatr 11</td><td>578 л.с.</td><td>680 км</td><td>от 5 200 000 ₽</td></tr>
                    <tr><td>Voyah Free</td><td>489 л.с.</td><td>860 км</td><td>от 4 800 000 ₽</td></tr>
                    <tr><td>Exeed RX</td><td>261 л.с.</td><td>~700 км</td><td>от 3 600 000 ₽</td></tr>
                    <tr><td>Zeekr X</td><td>428 л.с.</td><td>560 км</td><td>от 3 900 000 ₽</td></tr>
                    <tr><td>Hongqi E-HS9</td><td>510 л.с.</td><td>690 км</td><td>от 6 500 000 ₽</td></tr>
                </tbody>
            </table>

            <p>Если хотите рассчитать конкретную комплектацию — оставьте заявку, и наши менеджеры подберут для вас оптимальный вариант.</p>
        `
    },
    {
        id: 4,
        slug: "kak-vybrat-avto",
        title: "Как правильно выбрать авто из Китая: 7 советов эксперта",
        excerpt: "На что обращать внимание при покупке автомобиля из Китая, чтобы не пожалеть о решении.",
        image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1200",
        date: "20 Апреля 2024",
        tag: "Советы",
        author: "Алексей Петров",
        readTime: "6 мин",
        content: `
            <p class="lead">Покупка автомобиля из Китая — серьёзный шаг, требующий тщательной подготовки. Собрали 7 главных советов, которые помогут избежать ошибок и сэкономить деньги.</p>

            <h2>1. Проверяйте историю автомобиля</h2>
            <p>Всегда запрашивайте VIN-отчёт. Это позволит узнать о предыдущих ДТП, пробеге и реальном состоянии машины.</p>

            <h2>2. Не гонитесь за низкой ценой</h2>
            <p>Слишком низкая цена — первый признак проблем. Если предложение сильно ниже рынка — это либо скрытые дефекты, либо мошенничество.</p>

            <h2>3. Изучите комплектацию</h2>
            <p>У одного и того же автомобиля в Китае может быть 5-7 разных комплектаций. Внимательно проверьте, что входит в базовую, а что — в топовую.</p>

            <h2>4. Учитывайте все расходы</h2>
            <p>Кроме стоимости авто, будут: логистика, таможня, СБКТС, ЭПТС, комиссия, доставка до вашего города. Обычно итоговая цена на 35-45% выше китайской.</p>

            <h2>5. Работайте только с проверенными компаниями</h2>
            <p>Почитайте отзывы, посмотрите реальные кейсы, попросите показать предыдущие поставки. Хорошая компания всегда предоставит контакты своих клиентов.</p>

            <h2>6. Уточните сроки поставки</h2>
            <p>Обычно доставка из Китая занимает 1.5–3 месяца. Если срок обещают меньше — это повод насторожиться.</p>

            <h2>7. Проверьте гарантию</h2>
            <p>Многие китайские производители дают гарантию 5-8 лет на батарею и 3-4 года на автомобиль. Уточните, действует ли она на территории России.</p>

            <blockquote>Совет: перед покупкой обязательно посмотрите видеообзор конкретной модели и комплектации. Это поможет избежать разочарования.</blockquote>

            <p>Если сомневаетесь — обратитесь к нам за консультацией. Мы бесплатно подберём автомобиль под ваши требования и бюджет.</p>
        `
    },
    {
        id: 5,
        slug: "sbkts-chto-eto",
        title: "СБКТС: что это и как получить в 2024 году",
        excerpt: "Разбираемся, зачем нужен СБКТС, сколько стоит и какие документы потребуются.",
        image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=1200",
        date: "15 Апреля 2024",
        tag: "Документы",
        author: "Редакция ILSATAO",
        readTime: "5 мин",
        content: `
            <p class="lead">СБКТС — обязательный документ для любого автомобиля, ввозимого из-за границы. Без него поставить машину на учёт в ГИБДД не получится.</p>

            <h2>Что такое СБКТС?</h2>
            <p><strong>СБКТС</strong> (Свидетельство о безопасности конструкции транспортного средства) — документ, подтверждающий, что автомобиль соответствует техническому регламенту Таможенного союза «О безопасности колёсных транспортных средств» (ТР ТС 018/2011).</p>

            <h2>Как получить СБКТС?</h2>
            <ol>
                <li>Обратиться в аккредитованную испытательную лабораторию</li>
                <li>Предоставить автомобиль для осмотра</li>
                <li>Предоставить пакет документов (инвойс, экспортную декларацию, VIN и т.д.)</li>
                <li>Оплатить услуги лаборатории</li>
                <li>Получить СБКТС в течение 3-7 рабочих дней</li>
            </ol>

            <h2>Стоимость оформления</h2>
            <p>Стоимость СБКТС варьируется от 100 000 до 200 000 рублей в зависимости от региона, типа автомобиля и лаборатории. Для электромобилей и гибридов цена обычно выше.</p>

            <h2>Важные нюансы</h2>
            <ul>
                <li>СБКТС выдаётся на конкретный VIN</li>
                <li>Документ действует весь срок эксплуатации автомобиля</li>
                <li>При внесении изменений в конструкцию требуется переоформление</li>
                <li>СБКТС необходим для получения ЭПТС и постановки на учёт</li>
            </ul>

            <p>Мы берём на себя все процедуры по оформлению СБКТС и ЭПТС. Клиенту не нужно никуда ездить — все документы оформляются нашими специалистами.</p>
        `
    },
    {
        id: 6,
        slug: "kredit-na-avto-iz-kitaya",
        title: "Можно ли взять кредит на авто из Китая?",
        excerpt: "Разбираем варианты финансирования покупки китайского автомобиля: кредит, рассрочка, лизинг.",
        image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=1200",
        date: "08 Апреля 2024",
        tag: "Финансы",
        author: "Мария Сидорова",
        readTime: "6 мин",
        content: `
            <p class="lead">Многие клиенты задают вопрос: можно ли купить авто из Китая в кредит или рассрочку. Ответ — да, но есть нюансы.</p>

            <h2>Варианты финансирования</h2>

            <h3>1. Автокредит в банке</h3>
            <p>Не все банки готовы кредитовать покупку автомобиля из Китая напрямую. Обычно требуется, чтобы автомобиль уже был растаможен и поставлен на учёт. Тогда оформить кредит не составит труда.</p>

            <h3>2. Потребительский кредит</h3>
            <p>Универсальный вариант — взять обычный потребительский кредит наличными. Ставка обычно выше, чем по автокредиту, но зато нет ограничений по марке и стране происхождения.</p>

            <h3>3. Рассрочка от компании-посредника</h3>
            <p>Многие компании, занимающиеся поставкой авто из Китая, предлагают собственные программы рассрочки на 3–12 месяцев.</p>

            <h3>4. Лизинг</h3>
            <p>Для юридических лиц и ИП — оптимальный вариант. Позволяет включить платежи в расходы и получить налоговые вычеты.</p>

            <h2>Что важно учесть</h2>
            <ul>
                <li>Кредит выдаётся только после растаможки и постановки на учёт</li>
                <li>Первоначальный взнос обычно от 20%</li>
                <li>Срок кредита — до 5-7 лет</li>
                <li>Страхование КАСКО обязательно</li>
            </ul>

            <blockquote>Рекомендуем сначала получить одобрение кредита, а затем уже выбирать автомобиль. Так вы точно будете знать свой бюджет и не попадёте в неприятную ситуацию.</blockquote>

            <p>Мы работаем с несколькими банками-партнёрами и поможем подобрать оптимальную программу кредитования. Оставьте заявку для бесплатной консультации.</p>
        `
    }
];

// ============ ОТЗЫВЫ ============
export const mockReviews = [
    {
        id: 1,
        name: "Александр Смирнов",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
        rating: 5,
        text: "Заказывал Zeekr 001. Ребята взяли на себя всю логистику и таможню. Машина пришла в идеальном состоянии, быстрее, чем ожидал. Рекомендую!",
        car: "Zeekr 001"
    },
    {
        id: 2,
        name: "Елена Иванова",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704e",
        rating: 5,
        text: "Первый раз покупала машину из Китая. Очень боялась, но менеджеры все подробно объяснили. Расчет стоимости был прозрачным, без скрытых платежей.",
        car: "Li Auto L9"
    },
    {
        id: 3,
        name: "Дмитрий К.",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704f",
        rating: 4,
        text: "Все хорошо, машина супер. Единственный момент — ожидание шло на пару недель дольше из-за задержек на границе. Но компания держала в курсе.",
        car: "Avatr 11"
    },
    {
        id: 4,
        name: "Марина Петрова",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704a",
        rating: 5,
        text: "Отличный сервис! Заказывала Voyah Free. Всё сделали в срок, помогли с постановкой на учёт. Обязательно обращусь ещё раз, когда буду менять машину.",
        car: "Voyah Free"
    },
    {
        id: 5,
        name: "Сергей Волков",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704b",
        rating: 5,
        text: "Профессионалы своего дела. Помогли подобрать Zeekr 007 в нужной комплектации, оформили все документы, машина пришла даже быстрее заявленного срока.",
        car: "Zeekr 007"
    },
    {
        id: 6,
        name: "Ольга Кузнецова",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704c",
        rating: 5,
        text: "Спасибо менеджерам за терпение! Я долго выбирала между несколькими моделями, они подробно всё рассказали. В итоге взяла Avatr 12 — в восторге!",
        car: "Avatr 12"
    },
    {
        id: 7,
        name: "Игорь Соколов",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704g",
        rating: 5,
        text: "Заказывал Exeed RX. Всё прошло гладко, документы получил вовремя. Отдельное спасибо за консультации по обслуживанию после покупки.",
        car: "Exeed RX"
    },
    {
        id: 8,
        name: "Наталья Морозова",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704h",
        rating: 4,
        text: "Хорошая компания, работают честно. Немного затянулась доставка из-за сезона, но результат отличный. Li Auto L7 превзошёл ожидания!",
        car: "Li Auto L7"
    },
    {
        id: 9,
        name: "Андрей Лебедев",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704i",
        rating: 5,
        text: "Уже второй раз обращаюсь. Всё чётко и по делу. Цены адекватные, машины приходят в идеальном состоянии. Рекомендую всем друзьям и знакомым!",
        car: "BYD Han"
    }
];

// ============ ИМИТАЦИЯ API ЗАПРОСОВ С КЭШИРОВАНИЕМ ============

/* --- Кэш в памяти модуля. Живёт до перезагрузки страницы (F5) --- */
/* Кэшируем только результат ПЕРВОЙ страницы без фильтров. */
/* При пагинации и фильтрации — всегда имитируем запрос к API. */
let _carsFirstPageCache = null;
let _blogsCache = null;
let _blogByIdCache = null;
let _reviewsCache = null;

/* ============ CARS ============ */

/**
 * Проверяет, можно ли отдать данные из кэша мгновенно.
 * Возвращает true ТОЛЬКО для запроса «страница 1, без фильтров».
 */
export const canServeCarsFromCache = ({ filters = {}, page = 1, limit = 40 } = {}) => {
    const isDefaultFilters =
        (!filters.brand || filters.brand === 'All') &&
        (!filters.bodyType || filters.bodyType === 'All') &&
        (!filters.engineType || filters.engineType === 'All') &&
        (!filters.price || filters.price === 'All') &&
        !filters.budgetCustoms;

    return !!(isDefaultFilters && page === 1 && limit === 40 && _carsFirstPageCache);
};

/**
 * Имитация GET /api/cars
 * Принимает фильтры, страницу и лимит.
 * Возвращает { cars, total, totalPages, page, limit }
 *
 * Кэширует ТОЛЬКО первый запрос первой страницы без фильтров.
 * Все остальные запросы (пагинация, фильтры) — идут «на сервер» с задержкой.
 */
export const fetchCars = ({ filters = {}, page = 1, limit = 40 } = {}) => {
    const isDefaultFilters =
        (!filters.brand || filters.brand === 'All') &&
        (!filters.bodyType || filters.bodyType === 'All') &&
        (!filters.engineType || filters.engineType === 'All') &&
        (!filters.price || filters.price === 'All') &&
        !filters.budgetCustoms;

    const isFirstPage = page === 1 && limit === 40;
    const canUseCache = isDefaultFilters && isFirstPage;

    return new Promise((resolve) => {
        // Мгновенная отдача из кэша (повторный визит на каталог без фильтров)
        if (canUseCache && _carsFirstPageCache) {
            resolve(_carsFirstPageCache);
            return;
        }

        // Имитация запроса к API — фильтрация и пагинация «на сервере»
        setTimeout(() => {
            let result = [...mockCarsDB];

            const { brand, bodyType, engineType, price, budgetCustoms } = filters;

            if (brand && brand !== 'All') {
                result = result.filter(c => c.brand === brand);
            }
            if (bodyType && bodyType !== 'All') {
                result = result.filter(c => c.bodyType === bodyType);
            }
            if (engineType && engineType !== 'All') {
                result = result.filter(c => c.engineType === engineType);
            }
            if (price === 'under3') {
                result = result.filter(c => c.price < 3000000);
            } else if (price === '3to5') {
                result = result.filter(c => c.price >= 3000000 && c.price <= 5000000);
            } else if (price === 'over5') {
                result = result.filter(c => c.price > 5000000);
            }
            if (budgetCustoms) {
                result = result.filter(c =>
                    c.year >= 2024 &&
                    c.engineType === 'Бензиновый' &&
                    c.horsepower <= 160
                );
            }

            result.sort((a, b) => a.popularityRank - b.popularityRank);

            const total = result.length;
            const totalPages = Math.max(1, Math.ceil(total / limit));
            const safePage = Math.min(Math.max(page, 1), totalPages);
            const startIndex = (safePage - 1) * limit;
            const paginatedCars = result.slice(startIndex, startIndex + limit);

            const response = {
                cars: paginatedCars,
                total,
                totalPages,
                page: safePage,
                limit
            };

            // Кэшируем ТОЛЬКО первый запрос первой страницы без фильтров
            if (canUseCache) {
                _carsFirstPageCache = response;
            }

            resolve(response);
        }, 400);
    });
};

export const fetchCarById = (id) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(mockCarsDB.find(car => car.id === Number(id)) || null);
        }, 300);
    });
};

/* ============ BLOG ============ */

export const fetchBlogs = () => {
    return new Promise((resolve) => {
        if (_blogsCache) {
            resolve(_blogsCache);
            return;
        }

        setTimeout(() => {
            _blogsCache = mockBlogs.map(({ content, ...rest }) => rest);
            resolve(_blogsCache);
        }, 400);
    });
};

export const fetchBlogById = (id) => {
    return new Promise((resolve) => {
        const numericId = Number(id);

        if (!_blogByIdCache) _blogByIdCache = new Map();

        if (_blogByIdCache.has(numericId)) {
            resolve(_blogByIdCache.get(numericId));
            return;
        }

        setTimeout(() => {
            const blog = mockBlogs.find(b => b.id === numericId) || null;
            _blogByIdCache.set(numericId, blog);
            resolve(blog);
        }, 400);
    });
};

/* ============ REVIEWS ============ */

export const fetchReviews = () => {
    return new Promise((resolve) => {
        if (_reviewsCache) {
            resolve(_reviewsCache);
            return;
        }

        setTimeout(() => {
            _reviewsCache = [...mockReviews];
            resolve(_reviewsCache);
        }, 400);
    });
};

/* ============ LEADS ============ */

export const sendLead = (data) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log('📩 POST /api/leads', data);
            resolve({
                success: true,
                leadId: `LEAD-${Date.now()}`,
                message: 'Заявка успешно создана'
            });
        }, 800);
    });
};

/* ============ ГЕТТЕРЫ КЭША ============ */
export const getBlogsCache = () => _blogsCache;
export const getReviewsCache = () => _reviewsCache;