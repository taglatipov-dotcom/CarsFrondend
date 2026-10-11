import { useEffect, useState } from 'react';
import { Card, Tag, Avatar, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { CalendarOutlined, UserOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { fetchBlogs, getBlogsCache } from '../services/mockApi';

export default function Blog() {
    // Синхронно проверяем кэш — если данные уже есть, сразу рендерим их
    const cachedBlogs = getBlogsCache();

    const [blogs, setBlogs] = useState(cachedBlogs || []);
    const [loading, setLoading] = useState(!cachedBlogs);
    const navigate = useNavigate();

    useEffect(() => {
        // Если данные уже в кэше — ничего не грузим, рендер мгновенный
        if (cachedBlogs) return;

        fetchBlogs().then(data => {
            setBlogs(data);
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
        <div className="max-w-7xl mx-auto py-20 px-4">
            <div className="text-center mb-16">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 text-white drop-shadow-2xl">
                    Блог и новости
                </h1>
                <p className="text-slate-100 text-xl md:text-2xl max-w-3xl mx-auto font-light drop-shadow-lg">
                    Полезные статьи о покупке, растаможке и эксплуатации авто из Китая
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {blogs.map((blog, idx) => {
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
                                <div className="h-56 overflow-hidden">
                                    <img
                                        alt={blog.title}
                                        src={blog.image}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                </div>
                            }
                        >
                            <div className="flex justify-between items-center mb-5">
                                <Tag className={`rounded-full px-3.5 py-1 border-none text-white font-semibold bg-gradient-to-r ${currentGradient} text-base`}>
                                    {blog.tag}
                                </Tag>
                                <span className="text-slate-500 text-base flex items-center gap-1 font-medium">
                                    <CalendarOutlined /> {blog.date}
                                </span>
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold mb-4 line-clamp-2 text-slate-800 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-violet-600 group-hover:to-fuchsia-600 transition-all">
                                {blog.title}
                            </h3>
                            <p className="text-slate-600 line-clamp-3 mb-8 flex-1 text-lg md:text-xl leading-relaxed">
                                {blog.excerpt}
                            </p>
                            <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-auto">
                                <div className="flex items-center gap-3">
                                    <Avatar size={44} icon={<UserOutlined />} className={`bg-gradient-to-r ${currentGradient} text-white`} />
                                    <span className="text-base font-bold text-slate-700">{blog.author}</span>
                                </div>
                                <ArrowRightOutlined className="text-slate-300 text-lg group-hover:text-violet-600 group-hover:translate-x-1 transition-all" />
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}