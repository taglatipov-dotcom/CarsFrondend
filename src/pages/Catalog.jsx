import { useEffect, useState } from 'react';
import { Button, Spin, Divider, Switch, Tooltip, Modal, Input, Pagination } from 'antd';
import CarCard from '../components/CarCard.jsx';
import {
    fetchCars, canServeCarsFromCache, popularBrands, brandsByCountry, allBrands,
} from '../services/MockApi.js';
import {
    FilterOutlined,
    ClearOutlined,
    FireOutlined,
    SearchOutlined,
    GlobalOutlined
} from '@ant-design/icons';

const PAGE_SIZE = 40;

export default function Catalog() {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [loadError, setLoadError] = useState(false);

    const [filter, setFilter] = useState({
        brand: 'All',
        bodyType: 'All',
        price: 'All',
        engineType: 'All',
        budgetCustoms: false,
    });

    const [brandModalOpen, setBrandModalOpen] = useState(false);
    const [brandSearch, setBrandSearch] = useState('');

    useEffect(() => {
        let ignore = false;

        const fromCache = canServeCarsFromCache({
            filters: filter,
            page: currentPage,
            limit: PAGE_SIZE
        });
        if (!fromCache) {
            setLoading(true);
        }

        fetchCars({ filters: filter, page: currentPage, limit: PAGE_SIZE })
            .then((res) => {
                if (ignore) return;
                setLoadError(false);
                setCars(res.cars);
                setTotal(res.total);
                if (res.page !== currentPage) setCurrentPage(res.page);
            })
            .catch(() => {
                // Раньше при ошибке API спиннер крутился бесконечно
                if (!ignore) setLoadError(true);
            })
            .finally(() => {
                if (!ignore) setLoading(false);
            });

        return () => { ignore = true; };
    }, [filter, currentPage]);

    const updateFilter = (updates) => {
        setFilter((prev) => ({ ...prev, ...updates }));
        setCurrentPage(1);
    };

    const resetFilters = () => {
        setFilter({
            brand: 'All',
            bodyType: 'All',
            price: 'All',
            engineType: 'All',
            budgetCustoms: false,
        });
        setCurrentPage(1);
    };

    const isCustomBrand = filter.brand !== 'All' && !popularBrands.includes(filter.brand);

    const selectBrand = (brand) => {
        updateFilter({ brand });
        setBrandModalOpen(false);
        setBrandSearch('');
    };

    const engineTypes = [
        { value: 'All', label: 'Все' },
        { value: 'Бензиновый', label: 'Бензиновый' },
        { value: 'Последовательный гибрид', label: 'Послед. гибрид' },
        { value: 'Параллельный гибрид', label: 'Парал. гибрид' },
        { value: 'Электрический', label: 'Электрический' },
        { value: 'Дизельный', label: 'Дизельный' },
    ];

    const bodyTypeOptions = [
        { value: 'All',   label: 'Все' },
        { value: 'SUV',   label: 'Внедорожник' },
        { value: 'Sedan', label: 'Седан' },
        { value: 'MPV',   label: 'Минивэн' },
        { value: 'Coupe', label: 'Купе' },
        { value: 'Hatchback', label: 'Хэтчбек' },
        { value: 'Wagon', label: 'Универсал' },
    ];

    const filteredBrandsByCountry = Object.entries(brandsByCountry).reduce((acc, [country, brands]) => {
        const matching = brands.filter(b =>
            b.toLowerCase().includes(brandSearch.toLowerCase()) ||
            country.toLowerCase().includes(brandSearch.toLowerCase())
        );
        if (matching.length > 0) acc[country] = matching;
        return acc;
    }, {});

    const FilterButton = ({ active, onClick, children, title }) => (
        <Tooltip title={title || ''} placement="right">
            <Button
                onClick={onClick}
                className={`w-full !text-left !justify-start !h-auto min-h-[42px] !px-3.5 !py-2.5 !rounded-lg !font-medium !text-base !leading-tight !whitespace-normal transition-all ${active
                    ? '!bg-gradient-to-r !from-violet-600 !to-fuchsia-600 !text-white !border-none shadow-sm shadow-fuchsia-500/20'
                    : '!bg-transparent !text-slate-700 !border-transparent hover:!bg-slate-100 hover:!text-violet-600'
                }`}
            >
                {children}
            </Button>
        </Tooltip>
    );

    const GroupTitle = ({ children }) => (
        <span className="text-base font-bold text-slate-500 uppercase tracking-wider mb-2.5 block">
            {children}
        </span>
    );

    return (
        <div className="min-h-screen py-10 w-full">
            <div className="w-full px-3 sm:px-[5%] lg:px-[10%]">
                <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 drop-shadow-2xl">
                        Каталог автомобилей
                    </h1>
                    <p className="text-slate-100 text-xl md:text-2xl max-w-3xl mx-auto font-light drop-shadow-lg">
                        {loading && total === 0
                            ? 'Загрузка...'
                            : <>Найдено моделей: <span className="font-bold text-cyan-400">{total}</span></>
                        }
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">

                    <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
                        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/50 sticky top-24">

                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 m-0">
                                    <FilterOutlined className="text-violet-500" /> Фильтры
                                </h3>
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<ClearOutlined />}
                                    onClick={resetFilters}
                                    className="text-slate-500 hover:text-fuchsia-500 text-base"
                                >
                                    Сбросить
                                </Button>
                            </div>

                            <div className="mb-5 p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-base font-bold text-amber-700 flex items-center gap-1.5">
                                        <FireOutlined /> Бюджетная таможня
                                    </span>
                                    <Switch
                                        size="small"
                                        checked={filter.budgetCustoms}
                                        onChange={(checked) => updateFilter({ budgetCustoms: checked })}
                                        className={filter.budgetCustoms ? '!bg-amber-500' : ''}
                                    />
                                </div>
                                <Tooltip title="Авто возрастом 3–5 лет, бензиновый или дизельный двигатель, объём до 1.5 л, мощность до 160 л.с.">
                                    <p className="text-sm text-amber-800 leading-snug m-0 cursor-help">
                                        Возраст 3–5 лет · Бензин/Дизель · ≤ 1.5 л · ≤ 160 л.с.
                                    </p>
                                </Tooltip>
                            </div>

                            <Divider className="!my-5" />

                            <div className="grid grid-cols-2 gap-x-4 gap-y-6">

                                <div>
                                    <GroupTitle>Двигатель</GroupTitle>
                                    <div className="flex flex-col gap-1.5">
                                        {engineTypes.map(item => (
                                            <FilterButton
                                                key={item.value}
                                                title={item.label}
                                                active={filter.engineType === item.value}
                                                onClick={() => updateFilter({ engineType: item.value })}
                                            >
                                                {item.label}
                                            </FilterButton>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <GroupTitle>Бренд</GroupTitle>
                                    <div className="flex flex-col gap-1.5">
                                        <FilterButton
                                            active={filter.brand === 'All'}
                                            onClick={() => updateFilter({ brand: 'All' })}
                                        >
                                            Все
                                        </FilterButton>

                                        {isCustomBrand && (
                                            <FilterButton
                                                active={true}
                                                title={`Убрать фильтр ${filter.brand}`}
                                                onClick={() => updateFilter({ brand: 'All' })}
                                            >
                                                {filter.brand} ✕
                                            </FilterButton>
                                        )}

                                        {popularBrands.map(brand => (
                                            <FilterButton
                                                key={brand}
                                                active={filter.brand === brand}
                                                onClick={() => updateFilter({ brand })}
                                            >
                                                {brand}
                                            </FilterButton>
                                        ))}

                                        <Button
                                            onClick={() => setBrandModalOpen(true)}
                                            className="w-full !h-auto min-h-[42px] !px-3.5 !py-2.5 !rounded-lg !text-base !font-bold !text-violet-600 !bg-violet-50 !border !border-dashed !border-violet-300 hover:!bg-violet-100 hover:!border-violet-500 hover:!text-violet-700 transition-all !flex !items-center !justify-center !gap-1.5"
                                        >
                                            <GlobalOutlined /> Все марки ({allBrands.length})
                                        </Button>
                                    </div>
                                </div>

                                <div>
                                    <GroupTitle>Кузов</GroupTitle>
                                    <div className="flex flex-col gap-1.5">
                                        {bodyTypeOptions.map(item => (
                                            <FilterButton
                                                key={item.value}
                                                active={filter.bodyType === item.value}
                                                onClick={() => updateFilter({ bodyType: item.value })}
                                            >
                                                {item.label}
                                            </FilterButton>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <GroupTitle>Цена</GroupTitle>
                                    <div className="flex flex-col gap-1.5">
                                        {[
                                            { id: 'All', label: 'Любая' },
                                            { id: 'under150', label: 'До 150 тыс. ¥' },
                                            { id: '150to300', label: '150 – 300 тыс. ¥' },
                                            { id: 'over300', label: 'От 300 тыс. ¥' }
                                        ].map(price => (
                                            <FilterButton
                                                key={price.id}
                                                active={filter.price === price.id}
                                                onClick={() => updateFilter({ price: price.id })}
                                            >
                                                {price.label}
                                            </FilterButton>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 relative min-h-[60vh]">

                        {loading && (
                            <div className="absolute inset-0 bg-white/70 backdrop-blur-md z-40 flex items-center justify-center rounded-3xl">
                                <div className="flex flex-col items-center gap-3">
                                    <Spin size="large" />
                                    <span className="text-slate-600 font-medium text-base">Загрузка автомобилей...</span>
                                </div>
                            </div>
                        )}

                        {cars.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {cars.map(car => (
                                        <CarCard key={car.id} car={car} size="lg" />
                                    ))}
                                </div>

                                {total > PAGE_SIZE && (
                                    <div className="mt-12 flex justify-center catalog-pagination">
                                        <Pagination
                                            current={currentPage}
                                            total={total}
                                            pageSize={PAGE_SIZE}
                                            onChange={(page) => {
                                                setCurrentPage(page);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            showSizeChanger={false}
                                            showTotal={(total, range) => `${range[0]}–${range[1]} из ${total}`}
                                        />
                                    </div>
                                )}
                            </>
                        ) : !loading && loadError ? (
                            <div className="text-center py-20 bg-white/95 backdrop-blur-xl rounded-3xl border border-white/50 flex flex-col justify-center items-center shadow-2xl">
                                <h3 className="text-2xl font-bold text-slate-500 mb-2">Не удалось загрузить автомобили</h3>
                                <p className="text-slate-400 mb-6 text-base">Проверьте соединение и попробуйте обновить страницу</p>
                                <Button onClick={() => window.location.reload()} className="!bg-slate-900 !text-white rounded-xl h-10 px-6">
                                    Обновить
                                </Button>
                            </div>
                        ) : !loading ? (
                            <div className="text-center py-20 bg-white/95 backdrop-blur-xl rounded-3xl border border-white/50 flex flex-col justify-center items-center shadow-2xl">
                                <h3 className="text-2xl font-bold text-slate-400 mb-2">Ничего не найдено</h3>
                                <p className="text-slate-400 mb-6 text-base">Попробуйте изменить параметры фильтрации</p>
                                <Button onClick={resetFilters} className="!bg-slate-900 !text-white rounded-xl h-10 px-6">
                                    Сбросить фильтры
                                </Button>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>

            <Modal
                title={
                    <span className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <GlobalOutlined className="text-violet-500" /> Все марки автомобилей
                    </span>
                }
                open={brandModalOpen}
                onCancel={() => { setBrandModalOpen(false); setBrandSearch(''); }}
                footer={null}
                width={720}
                className="rounded-3xl overflow-hidden"
                bodyStyle={{ padding: '20px 24px', maxHeight: '70vh', overflowY: 'auto' }}
            >
                <Input
                    size="large"
                    placeholder="Поиск марки или страны..."
                    prefix={<SearchOutlined className="text-slate-400" />}
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                    allowClear
                    className="!rounded-xl mb-5"
                />

                <Button
                    onClick={() => selectBrand('All')}
                    className={`!w-full !h-11 !rounded-xl !font-semibold !text-base !mb-5 transition-all ${
                        filter.brand === 'All'
                            ? '!bg-gradient-to-r !from-violet-600 !to-fuchsia-600 !text-white !border-none shadow-md shadow-fuchsia-500/20'
                            : '!bg-slate-50 !text-slate-700 !border !border-slate-200 hover:!bg-slate-100'
                    }`}
                >
                    Все марки
                </Button>

                {Object.keys(filteredBrandsByCountry).length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                        <SearchOutlined className="text-3xl mb-2" />
                        <p className="text-base">Марки не найдены</p>
                    </div>
                ) : (
                    Object.entries(filteredBrandsByCountry).map(([country, brands]) => (
                        <div key={country} className="mb-5">
                            <div className="text-base font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"></span>
                                {country}
                                <span className="text-slate-400 font-normal">({brands.length})</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {brands.map(brand => {
                                    const isActive = filter.brand === brand;
                                    return (
                                        <Button
                                            key={brand}
                                            onClick={() => selectBrand(brand)}
                                            className={`!h-11 !rounded-xl !font-medium !text-base transition-all ${
                                                isActive
                                                    ? '!bg-gradient-to-r !from-violet-600 !to-fuchsia-600 !text-white !border-none shadow-md shadow-fuchsia-500/20'
                                                    : '!bg-white !text-slate-700 !border !border-slate-200 hover:!bg-violet-50 hover:!border-violet-300 hover:!text-violet-600'
                                            }`}
                                        >
                                            {brand}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </Modal>
        </div>
    );
}