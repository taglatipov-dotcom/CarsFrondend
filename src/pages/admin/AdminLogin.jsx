import { useState } from 'react';
import { Form, Input, Button, Alert, message } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { login, isAuthenticated } from '../../services/authApi';

export default function AdminLogin() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Уже вошли — сразу в админку
    if (isAuthenticated()) {
        const to = location.state?.from?.pathname || '/admin/cars';
        return <Navigate to={to} replace />;
    }

    const handleSubmit = async ({ username, password }) => {
        setLoading(true);
        setError(null);
        try {
            await login(username, password);
            message.success('Добро пожаловать!');
            const to = location.state?.from?.pathname || '/admin/cars';
            navigate(to, { replace: true });
        } catch (e) {
            setError(e.message || 'Ошибка входа');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4"
             style={{
                 background:
                     'linear-gradient(135deg, #0f172a 0%, #1e293b 45%, #4c1d95 100%)',
             }}
        >
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-white text-3xl font-extrabold tracking-wide m-0">
                        ILSATAO
                    </h1>
                    <p className="text-slate-400 mt-2 text-sm uppercase tracking-widest m-0">
                        Панель управления
                    </p>
                </div>

                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
                    <h2 className="text-2xl font-bold text-slate-800 mb-1">
                        Вход в админку
                    </h2>
                    <p className="text-slate-500 mb-6 text-sm">
                        Введите логин и пароль администратора
                    </p>

                    {error && (
                        <Alert
                            type="error"
                            showIcon
                            message={error}
                            className="mb-5"
                            closable
                            onClose={() => setError(null)}
                        />
                    )}

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        requiredMark={false}
                        autoComplete="off"
                    >
                        <Form.Item
                            name="username"
                            label={<span className="font-semibold text-slate-700">Логин</span>}
                            rules={[{ required: true, message: 'Введите логин' }]}
                        >
                            <Input
                                size="large"
                                prefix={<UserOutlined className="text-slate-400" />}
                                placeholder="admin"
                                autoComplete="username"
                                className="!rounded-xl"
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label={<span className="font-semibold text-slate-700">Пароль</span>}
                            rules={[{ required: true, message: 'Введите пароль' }]}
                        >
                            <Input.Password
                                size="large"
                                prefix={<LockOutlined className="text-slate-400" />}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                className="!rounded-xl"
                            />
                        </Form.Item>

                        <Form.Item className="!mb-0">
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                block
                                loading={loading}
                                icon={<LoginOutlined />}
                                className="!h-12 !rounded-xl !font-semibold !text-base !bg-gradient-to-r !from-violet-600 !to-fuchsia-600 !border-none hover:!from-violet-500 hover:!to-fuchsia-500 shadow-lg shadow-fuchsia-500/30"
                            >
                                Войти
                            </Button>
                        </Form.Item>
                    </Form>

                    <div className="mt-6 text-center">
                        <a
                            href="/"
                            className="text-sm text-slate-400 hover:text-violet-600 transition-colors"
                        >
                            ← На главную
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}