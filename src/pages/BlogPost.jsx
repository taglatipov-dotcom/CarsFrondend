import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Spin, Button, Tag, Avatar } from 'antd';
import {
    ArrowLeftOutlined,
    CalendarOutlined,
    UserOutlined,
    ClockCircleOutlined,
    HomeOutlined
} from '@ant-design/icons';
import { fetchBlogById, fetchBlogBySlug } from '../services/MockApi.js';
import { blogPath } from '../utils/slug.js';
import { usePageMeta } from '../utils/pageMeta.js';
import { toImageUrl } from '../services/urls.js';
import { normalizeArticleHtml } from '../utils/articleHtml.js';

export default function BlogPost() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Старые ссылки /blog/7 → ищем по id и переходим на понятный адрес
        const isOldId = /^\d+$/.test(slug || '');
        (isOldId ? fetchBlogById(slug) : fetchBlogBySlug(slug)).then(data => {
            setBlog(data);
            setLoading(false);
            if (data && isOldId && data.slug) navigate(blogPath(data), { replace: true });
        });
    }, [slug]);

    usePageMeta(blog && { title: blog.title, description: blog.excerpt });

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[70vh]">
                <Spin size="large" />
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[70vh] text-paper">
                <h2 className="text-3xl font-bold mb-4">Статья не найдена</h2>
                <Button type="primary" onClick={() => navigate('/blog')} className="!bg-ink hover:!bg-ink/90">
                    Вернуться в блог
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-4">
            <div className="w-full md:w-3/4 mx-auto">

                <div className="flex items-center gap-2 mb-8 text-base flex-wrap">
                    <Link to="/" className="!text-paper/80 hover:!text-brass-lo transition-colors flex items-center gap-1.5">
                        <HomeOutlined /> Главная
                    </Link>
                    <span className="text-ink/55">/</span>
                    <Link to="/blog" className="!text-paper/80 hover:!text-brass-lo transition-colors">
                        Блог
                    </Link>
                    <span className="text-ink/55">/</span>
                    <span className="text-ink/55 truncate max-w-[400px]">{blog.title}</span>
                </div>

                <div className="relative rounded-xl overflow-hidden mb-10 h-72 md:h-[500px]">
                    <img
                        src={toImageUrl(blog.image)}
                        alt={blog.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                    <div className="absolute top-6 left-6">
                        <Tag className="!rounded-full !px-4 !py-1.5 !border-none !text-ink !font-semibold !bg-brass !text-base !m-0">
                            {blog.tag}
                        </Tag>
                    </div>
                </div>

                <div className="mb-10">
                    <h1 className="text-3xl md:text-5xl font-extrabold mb-6 text-paper leading-tight">
                        {blog.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-5 text-paper/80 text-base">
                        <div className="flex items-center gap-2">
                            <Avatar size={40} icon={<UserOutlined />} className="bg-brass text-ink" />
                            <span className="font-semibold text-paper">{blog.author}</span>
                        </div>
                        <span className="flex items-center gap-1.5">
                            <CalendarOutlined /> {blog.date}
                        </span>
                        {blog.readTime && (
                            <span className="flex items-center gap-1.5">
                                <ClockCircleOutlined /> {blog.readTime} чтения
                            </span>
                        )}
                    </div>
                </div>

                <div className="bg-paper rounded-xl p-6 md:p-12 border border-ink/10 min-w-0 overflow-hidden">
                    <article
                        className="article-content"
                        dangerouslySetInnerHTML={{ __html: normalizeArticleHtml(blog.content) }}
                    />
                </div>

                <div className="mt-10 flex justify-center">
                    <Button
                        size="large"
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/blog')}
                        className="!h-12 !px-8 !rounded-lg !bg-paper/10 !text-paper !border-paper/15 hover:!bg-paper/20 hover:!text-paper !font-semibold !text-base"
                    >
                        Все статьи
                    </Button>
                </div>
            </div>
        </div>
    );
}