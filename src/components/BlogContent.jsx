import { useEffect, useState } from 'react';
import { Card, Tag, Avatar, Spin, Button } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarOutlined, UserOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { fetchBlogs, getBlogsCache } from '../services/MockApi.js';
import { toImageUrl, toThumbUrl } from '../services/urls.js';
import { blogPath } from '../utils/slug.js';

export default function BlogContent() {
    // Синхронно проверяем кэш — если данные уже есть, сразу рендерим их
    const cachedBlogs = getBlogsCache();
    const [blogs, setBlogs] = useState(cachedBlogs || []);
    const [loading, setLoading] = useState(!cachedBlogs);
    const navigate = useNavigate();

    useEffect(() => {
        // Если данные уже в кэше — ничего не грузим
        if (cachedBlogs) return;

        fetchBlogs().then(data => {
            setBlogs(data);
            setLoading(false);
        });
    }, []);

    return (
        <div className="relative">
            <div className="max-w-7xl mx-auto px-4">
                <div className="h-px bg-paper/15"></div>
            </div>

            <div className="pt-14 md:pt-20 pb-8 px-4 max-w-7xl mx-auto">
                <h2 className="text-2xl md:text-4xl mb-4 text-paper">
                    Блог и новости
                </h2>
                <p className="text-paper/70 max-w-3xl text-lg md:text-xl m-0">
                    Полезные статьи о покупке, растаможке и эксплуатации авто из Китая
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-4 pb-16">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Spin size="large" />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {blogs.slice(0, 6).map((blog, idx) => {
                                const gradients = [
                                    'bg-brass',
                                    'bg-brass',
                                    'bg-brass'
                                ];
                                const currentGradient = gradients[idx % gradients.length];

                                return (
                                    <Card
                                        key={blog.id}
                                        hoverable
                                        onClick={() => navigate(blogPath(blog))}
                                        className="group rounded-xl overflow-hidden border-none transition-all duration-300 flex flex-col h-full !bg-paper cursor-pointer"
                                        bodyStyle={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '24px' }}
                                        cover={
                                            <div className="h-48 overflow-hidden">
                                                <img
                                                    alt={blog.title}
                                                    src={toThumbUrl(blog.image)}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            </div>
                                        }
                                    >
                                        <div className="flex justify-between items-center mb-4">
                                            <Tag className={`rounded-full px-3.5 py-1 border-none text-ink font-medium ${currentGradient} text-base`}>
                                                {blog.tag}
                                            </Tag>
                                            <span className="text-ink/55 text-base flex items-center gap-1 font-medium">
                                                <CalendarOutlined /> {blog.date}
                                            </span>
                                        </div>
                                        <h3 className="text-xl md:text-2xl font-bold mb-3 line-clamp-2 text-ink group-hover:text-brass-lo transition-all">
                                            {blog.title}
                                        </h3>
                                        <p className="text-ink/80 line-clamp-2 mb-6 flex-1 text-lg md:text-xl leading-relaxed">
                                            {blog.excerpt}
                                        </p>
                                        <div className="flex items-center justify-between pt-4 border-t border-ink/10 mt-auto">
                                            <div className="flex items-center gap-2.5">
                                                <Avatar size={40} icon={<UserOutlined />} className="!bg-ink !text-paper" />
                                                <span className="text-base font-bold text-ink/80">{blog.author}</span>
                                            </div>
                                            <ArrowRightOutlined className="text-paper/80 text-lg group-hover:text-brass-lo group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>

                        <div className="mt-12">
                            <Link to="/blog" state={{ resetScroll: true }} className="block">
                                <Button
                                    type="primary"
                                    size="large"
                                    block
                                    icon={<ArrowRightOutlined className="text-2xl" />}
                                    className="!h-20 !text-xl md:!text-2xl !font-extrabold !rounded-xl btn-brass transition-all"
                                >
                                    Перейти в блог
                                </Button>
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}