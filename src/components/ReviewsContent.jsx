import { useEffect, useState } from 'react';
import { Card, Rate, Avatar, Button, Spin } from 'antd';
import { Link } from 'react-router-dom';
import { UserOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { fetchReviews, getReviewsCache } from '../services/MockApi.js';
import { toImageUrl, toThumbUrl } from '../services/urls.js';

export default function ReviewsContent() {
    // Синхронно проверяем кэш — если данные уже есть, сразу рендерим их
    const cachedReviews = getReviewsCache();
    const [reviews, setReviews] = useState(cachedReviews || []);
    const [loading, setLoading] = useState(!cachedReviews);

    useEffect(() => {
        // Если данные уже в кэше — ничего не грузим
        if (cachedReviews) return;

        fetchReviews().then(data => {
            setReviews(data);
            setLoading(false);
        });
    }, []);

    return (
        <div className="relative">
            <div className="max-w-7xl mx-auto px-4">
                <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
            </div>

            <div className="py-16 px-4 text-center">
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 text-white drop-shadow-2xl">
                    Отзывы наших клиентов
                </h2>
                <p className="text-slate-100 max-w-3xl mx-auto text-xl md:text-2xl font-light drop-shadow-lg">
                    Более 1500 автомобилей доставлено без единого скрытого платежа
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-4 pb-16">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Spin size="large" />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {reviews.slice(0, 6).map((review) => (
                                <Card
                                    key={review.id}
                                    className="rounded-3xl shadow-2xl border-none h-full flex flex-col hover:-translate-y-2 transition-transform duration-300 !bg-white/95 backdrop-blur-xl"
                                    bodyStyle={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '28px' }}
                                >
                                    <div className="flex items-center gap-4 mb-5">
                                        <Avatar
                                            size={64}
                                            src={toThumbUrl(review.avatar)}
                                            icon={<UserOutlined />}
                                            className="border-2 border-slate-100 shadow-md flex-shrink-0"
                                        />
                                        <div>
                                            <h3 className="text-xl font-bold m-0 text-slate-800">{review.name}</h3>
                                            <Rate disabled defaultValue={review.rating} className="text-lg text-amber-400 mt-1" />
                                        </div>
                                    </div>

                                    <p className="text-slate-600 italic flex-1 mb-5 text-lg md:text-xl leading-relaxed relative">
                                        <span className="text-5xl text-slate-100 absolute -top-3 -left-2 z-0">"</span>
                                        <span className="relative z-10 line-clamp-5">{review.text}</span>
                                    </p>

                                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 rounded-2xl mt-auto border border-slate-100">
                                        <span className="text-base text-slate-500 block mb-1 font-medium">Купленный автомобиль:</span>
                                        <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 text-lg">
                                            {review.car}
                                        </span>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        <div className="mt-12">
                            <Link to="/reviews" state={{ resetScroll: true }} className="block">
                                <Button
                                    type="primary"
                                    size="large"
                                    block
                                    icon={<ArrowRightOutlined className="text-2xl" />}
                                    className="!h-20 !text-xl md:!text-2xl !font-extrabold !rounded-3xl !bg-gradient-to-r !from-violet-600 !to-fuchsia-600 !border-none hover:!from-violet-500 hover:!to-fuchsia-500 !text-white shadow-2xl shadow-fuchsia-500/50 transition-all hover:scale-[1.01]"
                                >
                                    Перейти к отзывам
                                </Button>
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}