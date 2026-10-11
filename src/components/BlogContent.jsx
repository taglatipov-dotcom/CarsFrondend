import { useEffect, useState } from 'react';
import { Card, Tag, Avatar, Spin, Button } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarOutlined, UserOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { fetchBlogs, getBlogsCache } from '../services/mockApi';

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
                <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
            </div>

            <div className="py-16 px-4 text-center">
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 text-white drop-shadow-2xl">
                    Блог и новости
                </h2>
                <p className="text-slate-100 max-w-3xl mx-auto text-xl md:text-2xl font-light drop-shadow-lg">
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
                                    'from-cyan-500 to-blue-500',
                                    'from-violet-500 to-fuchsia-500',
                                    'from-amber-500 to-orange-500'
                                ];
                                const currentGradient = gradients[idx % gradients.length];

                                return (
                                    <Card
                                        key={blog.id}
                                        hoverable
                                        onClick={() => navigate(`/blog/${blog.id}`)}
                                        className="group rounded-3xl overflow-hidden border-none shadow-2xl hover:shadow-blue-900/50 transition-all duration-300 flex flex-col h-full !bg-white/95 backdrop-blur-xl cursor-pointer"
                                        bodyStyle={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '24px' }}
                                        cover={
                                            <div className="h-48 overflow-hidden">
                                                <img
                                                    alt={blog.title}
                                                    src={blog.image}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            </div>
                                        }
                                    >
                                        <div className="flex justify-between items-center mb-4">
                                            <Tag className={`rounded-full px-3.5 py-1 border-none text-white font-semibold bg-gradient-to-r ${currentGradient} text-base`}>
                                                {blog.tag}
                                            </Tag>
                                            <span className="text-slate-500 text-base flex items-center gap-1 font-medium">
                                                <CalendarOutlined /> {blog.date}
                                            </span>
                                        </div>
                                        <h3 className="text-xl md:text-2xl font-bold mb-3 line-clamp-2 text-slate-800 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-violet-600 group-hover:to-fuchsia-600 transition-all">
                                            {blog.title}
                                        </h3>
                                        <p className="text-slate-600 line-clamp-2 mb-6 flex-1 text-lg md:text-xl leading-relaxed">
                                            {blog.excerpt}
                                        </p>
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                                            <div className="flex items-center gap-2.5">
                                                <Avatar size={40} icon={<UserOutlined />} className={`bg-gradient-to-r ${currentGradient} text-white`} />
                                                <span className="text-base font-bold text-slate-700">{blog.author}</span>
                                            </div>
                                            <ArrowRightOutlined className="text-slate-300 text-lg group-hover:text-violet-600 group-hover:translate-x-1 transition-all" />
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
                                    className="!h-20 !text-xl md:!text-2xl !font-extrabold !rounded-3xl !bg-gradient-to-r !from-violet-600 !to-fuchsia-600 !border-none hover:!from-violet-500 hover:!to-fuchsia-500 !text-white shadow-2xl shadow-fuchsia-500/50 transition-all hover:scale-[1.01]"
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