import { Layout, Menu, Button, Popconfirm } from 'antd';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    CarOutlined,
    HomeOutlined,
    PlusCircleOutlined,
    FileTextOutlined,
    StarOutlined,
    InboxOutlined,
    LogoutOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { getUsername, logout } from '../../services/AuthApi.js';

const { Sider, Header, Content } = Layout;

export default function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const username = getUsername() || 'Admin';

    let selectedKey = 'cars-list';
    const p = location.pathname;

    if (p === '/Admin/cars/new') selectedKey = 'cars-new';
    else if (/^\/admin\/cars\/\d+\/edit$/.test(p)) selectedKey = 'cars-edit';
    else if (p === '/admin/blog') selectedKey = 'blog-list';
    else if (p === '/Admin/blog/new') selectedKey = 'blog-new';
    else if (/^\/admin\/blog\/\d+\/edit$/.test(p)) selectedKey = 'blog-edit';
    else if (p === '/admin/reviews') selectedKey = 'reviews-list';
    else if (p === '/Admin/reviews/new') selectedKey = 'reviews-new';
    else if (/^\/admin\/reviews\/\d+\/edit$/.test(p)) selectedKey = 'reviews-edit';
    else if (p === '/admin/leads') selectedKey = 'leads-list';

    const handleLogout = () => {
        logout();
        navigate('/admin/login', { replace: true });
    };

    return (
        <Layout style={{ minHeight: '100vh', background: '#f1f5f9' }}>
            <Sider
                theme="dark"
                width={260}
                breakpoint="lg"
                collapsedWidth={0}
                style={{ background: '#0f172a' }}
            >
                <div className="h-16 flex items-center justify-center border-b border-white/10">
                    <span className="text-white font-extrabold text-lg tracking-wide">
                        ILSATAO ADMIN
                    </span>
                </div>

                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[selectedKey]}
                    style={{ background: 'transparent', borderRight: 'none' }}
                    items={[
                        {
                            key: 'cars-group',
                            icon: <CarOutlined />,
                            label: 'Автомобили',
                            type: 'group',
                            children: [
                                {
                                    key: 'cars-list',
                                    icon: <CarOutlined />,
                                    label: 'Все авто',
                                    onClick: () => navigate('/admin/cars'),
                                },
                                {
                                    key: 'cars-new',
                                    icon: <PlusCircleOutlined />,
                                    label: 'Добавить авто',
                                    onClick: () => navigate('/Admin/cars/new'),
                                },
                            ],
                        },
                        {
                            key: 'blog-group',
                            icon: <FileTextOutlined />,
                            label: 'Блог',
                            type: 'group',
                            children: [
                                {
                                    key: 'blog-list',
                                    icon: <FileTextOutlined />,
                                    label: 'Все статьи',
                                    onClick: () => navigate('/admin/blog'),
                                },
                                {
                                    key: 'blog-new',
                                    icon: <PlusCircleOutlined />,
                                    label: 'Добавить статью',
                                    onClick: () => navigate('/Admin/blog/new'),
                                },
                            ],
                        },
                        {
                            key: 'reviews-group',
                            icon: <StarOutlined />,
                            label: 'Отзывы',
                            type: 'group',
                            children: [
                                {
                                    key: 'reviews-list',
                                    icon: <StarOutlined />,
                                    label: 'Все отзывы',
                                    onClick: () => navigate('/admin/reviews'),
                                },
                                {
                                    key: 'reviews-new',
                                    icon: <PlusCircleOutlined />,
                                    label: 'Добавить отзыв',
                                    onClick: () => navigate('/Admin/reviews/new'),
                                },
                            ],
                        },
                        {
                            key: 'leads-group',
                            icon: <InboxOutlined />,
                            label: 'Заявки',
                            type: 'group',
                            children: [
                                {
                                    key: 'leads-list',
                                    icon: <InboxOutlined />,
                                    label: 'Все заявки',
                                    onClick: () => navigate('/admin/leads'),
                                },
                            ],
                        },
                    ]}
                />
            </Sider>

            <Layout style={{ background: '#f1f5f9' }}>
                <Header
                    style={{
                        background: '#fff',
                        padding: '0 24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                    }}
                >
                    <span className="text-slate-700 font-semibold text-base">
                        Панель управления
                    </span>

                    <div className="flex items-center gap-3">
                        <span className="text-slate-500 text-sm hidden sm:flex items-center gap-1.5">
                            <UserOutlined /> {username}
                        </span>
                        <Link to="/">
                            <Button icon={<HomeOutlined />}>На сайт</Button>
                        </Link>
                        <Popconfirm
                            title="Выйти из админки?"
                            okText="Выйти"
                            cancelText="Отмена"
                            onConfirm={handleLogout}
                        >
                            <Button danger icon={<LogoutOutlined />}>
                                Выйти
                            </Button>
                        </Popconfirm>
                    </div>
                </Header>

                <Content style={{ padding: 24 }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
}