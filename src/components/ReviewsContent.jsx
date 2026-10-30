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
                <div className="h-px bg-paper/15"></div>
            </div>

            <div className="pt-14 md:pt-20 pb-8 px-4 max-w-7xl mx-auto">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-paper">
                    Отзывы наших клиентов
                </h2>
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
                                    className="rounded-xl border-none h-full flex flex-col transition-transform duration-300 !bg-paper"
                                    bodyStyle={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '28px' }}
                                >
                                    <div className="flex items-center gap-4 mb-5">
                                        <Avatar
                                            size={64}
                                            src={toThumbUrl(review.avatar)}
                                            icon={<UserOutlined />}
                                            className="border-2 border-ink/10 flex-shrink-0"
                                        />
                                        <div>
                                            <h3 className="text-xl font-bold m-0 text-ink">{review.name}</h3>
                                            <Rate disabled defaultValue={review.rating} className="text-lg text-brass-lo mt-1" />
                                        </div>
                                    </div>

                                    <p className="text-ink/80 italic flex-1 mb-5 text-lg md:text-xl leading-relaxed relative">
                                        <span className="text-5xl text-paper/80 absolute -top-3 -left-2 z-0">"</span>
                                        <span className="relative z-10 line-clamp-5">{review.text}</span>
                                    </p>

                                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 rounded-lg mt-auto border border-ink/10">
                                        <span className="text-base text-ink/55 block mb-1 font-medium">Купленный автомобиль:</span>
                                        <span className="font-extrabold text-brass-lo text-lg">
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
                                    className="!h-20 !text-xl md:!text-2xl !font-extrabold !rounded-xl btn-brass transition-all"
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