import { useEffect, useState } from 'react';
import { Card, Rate, Avatar, Spin, Button, Image } from 'antd';
import { UserOutlined, EditOutlined } from '@ant-design/icons';
import { fetchReviews, getReviewsCache } from '../services/MockApi.js';
import { toImageUrl } from '../services/urls.js';
import ReviewSubmitModal from '../components/ReviewSubmitModal';

export default function Reviews() {
    const cachedReviews = getReviewsCache();

    const [reviews, setReviews] = useState(cachedReviews || []);
    const [loading, setLoading] = useState(!cachedReviews);
    const [submitOpen, setSubmitOpen] = useState(false);

    useEffect(() => {
        if (cachedReviews) return;

        fetchReviews()
            .then((data) => {
                setReviews(data);
                setLoading(false);
            })
            .catch((e) => {
                console.error('[Reviews] Ошибка загрузки:', e);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="min-h-screen py-20 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 text-white drop-shadow-2xl">
                        Отзывы наших клиентов
                    </h1>
                    <p className="text-slate-100 text-xl md:text-2xl max-w-3xl mx-auto font-light drop-shadow-lg">
                        Более 1500 автомобилей доставлено без единого скрытого платежа
                    </p>

                    <div className="mt-8">
                        <Button
                            type="primary"
                            size="large"
                            icon={<EditOutlined />}
                            onClick={() => setSubmitOpen(true)}
                            className="!h-14 !px-8 !text-lg !font-bold !rounded-2xl !bg-gradient-to-r !from-violet-600 !to-fuchsia-600 !border-none hover:!from-violet-500 hover:!to-fuchsia-500 !text-white shadow-xl shadow-fuchsia-500/40 transition-all hover:-translate-y-1"
                        >
                            Оставить отзыв
                        </Button>
                    </div>
                </div>

                {reviews.length === 0 ? (
                    <div className="text-center py-20 bg-white/95 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl">
                        <h3 className="text-2xl font-bold text-slate-500 mb-2">
                            Пока нет отзывов
                        </h3>
                        <p className="text-slate-400 text-base">
                            Станьте первым, кто поделится опытом
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {reviews.map((review) => {
                            const photos = Array.isArray(review.photos)
                                ? review.photos.filter(Boolean)
                                : [];

                            return (
                                <Card
                                    key={review.id}
                                    className="rounded-3xl shadow-2xl border-none h-full flex flex-col hover:-translate-y-2 transition-transform duration-300 !bg-white/95 backdrop-blur-xl"
                                    bodyStyle={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '100%',
                                        padding: '32px',
                                    }}
                                >
                                    <div className="flex items-center gap-5 mb-6">
                                        <Avatar
                                            size={64}
                                            src={toImageUrl(review.avatar)}
                                            icon={<UserOutlined />}
                                            className="border-2 border-slate-100 shadow-md flex-shrink-0"
                                        />
                                        <div>
                                            <h3 className="text-xl font-bold m-0 text-slate-800">
                                                {review.name}
                                            </h3>
                                            <Rate
                                                disabled
                                                defaultValue={review.rating}
                                                className="text-lg text-amber-400 mt-1"
                                            />
                                        </div>
                                    </div>

                                    <p className="text-slate-600 italic flex-1 mb-6 text-lg md:text-xl leading-relaxed relative">
                                        <span className="text-5xl text-slate-100 absolute -top-3 -left-2 z-0">
                                            "
                                        </span>
                                        <span className="relative z-10">{review.text}</span>
                                    </p>

                                    {photos.length > 0 && (
                                        <Image.PreviewGroup>
                                            <div className="grid grid-cols-3 gap-2 mb-5">
                                                {photos.slice(0, 6).map((url, idx) => (
                                                    <Image
                                                        key={idx}
                                                        src={toImageUrl(url)}
                                                        height={72}
                                                        style={{
                                                            objectFit: 'cover',
                                                            borderRadius: 8,
                                                            border: '1px solid #e2e8f0',
                                                        }}
                                                        fallback="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTQwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2UyZThmMCIvPjwvc3ZnPg=="
                                                    />
                                                ))}
                                            </div>
                                        </Image.PreviewGroup>
                                    )}

                                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 rounded-2xl mt-auto border border-slate-100">
                                        <span className="text-base text-slate-500 block mb-1 font-medium">
                                            Купленный автомобиль:
                                        </span>
                                        <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 text-lg">
                                            {review.car}
                                        </span>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            <ReviewSubmitModal
                open={submitOpen}
                onClose={() => setSubmitOpen(false)}
            />
        </div>
    );
}