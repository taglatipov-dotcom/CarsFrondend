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
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6 text-paper">
                        Отзывы наших клиентов
                    </h1>

                    <div className="mt-8">
                        <Button
                            type="primary"
                            size="large"
                            icon={<EditOutlined />}
                            onClick={() => setSubmitOpen(true)}
                            className="!h-14 !px-8 !text-lg !font-semibold !rounded-lg btn-brass transition-all"
                        >
                            Оставить отзыв
                        </Button>
                    </div>
                </div>

                {reviews.length === 0 ? (
                    <div className="text-center py-20 bg-paper rounded-xl border border-ink/10">
                        <h3 className="text-2xl font-bold text-ink/55 mb-2">
                            Пока нет отзывов
                        </h3>
                        <p className="text-ink/55 text-base">
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
                                    className="rounded-xl border-none h-full flex flex-col transition-transform duration-300 !bg-paper"
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
                                            className="border-2 border-ink/10 flex-shrink-0"
                                        />
                                        <div>
                                            <h3 className="text-xl font-bold m-0 text-ink">
                                                {review.name}
                                            </h3>
                                            <Rate
                                                disabled
                                                defaultValue={review.rating}
                                                className="text-lg text-brass-lo mt-1"
                                            />
                                        </div>
                                    </div>

                                    <p className="text-ink/80 italic flex-1 mb-6 text-lg md:text-xl leading-relaxed relative">
                                        <span className="text-5xl text-paper/80 absolute -top-3 -left-2 z-0">
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

                                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 rounded-lg mt-auto border border-ink/10">
                                        <span className="text-base text-ink/55 block mb-1 font-medium">
                                            Купленный автомобиль:
                                        </span>
                                        <span className="font-extrabold text-brass-lo text-lg">
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