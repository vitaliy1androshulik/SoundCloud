import React, { useState } from "react";
import "../../styles/login_signup/Login_Sіgnup.css";
import { Button, Form, Input } from "antd";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/slices/userSlice";
import { useNavigate } from "react-router-dom";
import { IRegisterForm } from "../../types/registerForm.ts";
import { normalizeUser } from "../../utilities/normalizeUser.ts";
import { AxiosError } from "axios";
import { login, register } from "../../services/authApi.ts";

const LoginSignup: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const onFinish = async (values: IRegisterForm) => {
        if (isLogin) {
            try {
                const data = await login(values.email, values.password);
                if (data.token) {
                    const user = normalizeUser(data.token);
                    if (user) {
                        localStorage.setItem("token", data.token);
                        dispatch(setUser({ user, token: data.token }));
                    }
                }
                alert("Логін успішний!");
                navigate("/home");
            } catch (error) {
                const err = error as AxiosError;
                alert("Помилка логіну: " + (err.response?.data || err.message));
            }
        } else {
            try {
                const data = await register(
                    values.username,
                    values.email,
                    values.password,
                    values.confirmPassword
                );
                if (data.token) {
                    const user = normalizeUser(data.token);
                    if (user) {
                        localStorage.setItem("token", data.token);
                        dispatch(setUser({ user, token: data.token }));
                    }
                }
                alert("Реєстрація успішна!");
                navigate("/home");
            } catch (error) {
                const err = error as AxiosError;
                alert("Помилка реєстрації: " + (err.response?.data || err.message));
            }
        }
    };

    return (
        <div  className="flex justify-center items-center h-screen
        bg-[url(images/login_signup_page/background.jpg)] bg-cover bg-center bg-no-repeat text-white">
            <div className="flex justify-center items-center h-screen bg-color-pink text-white w-full">
                {!showForm && (
                    <header className="flex-none mx-auto full-xl:max-w-screen-center-xl">
                        <div className="flex justify-between items-center full-xl:px-[60px] xl:px-[50px]">

                            <div>
                                <Button
                                    type="primary"
                                    style={{ marginRight: 10 }}
                                    onClick={() => {
                                        setIsLogin(true);
                                        setShowForm(true);
                                    }}
                                >
                                    Login
                                </Button>
                                <Button
                                    type="default"
                                    onClick={() => {
                                        setIsLogin(false);
                                        setShowForm(true);
                                    }}
                                >
                                    Register
                                </Button>
                            </div>
                        </div>
                    </header>
                )}

                {showForm && (
                    <div className="bg-white p-8 rounded-lg shadow-lg w-80">
                        <h1 className="text-3xl mb-6 text-center text-black">
                            {isLogin ? "Login" : "Register"}
                        </h1>
                        <Form
                            name={isLogin ? "login" : "register"}
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 16 }}
                            style={{ maxWidth: 600, marginTop: 20 }}
                            onFinish={onFinish}
                        >
                            {!isLogin && (
                                <Form.Item
                                    label="Username"
                                    name="username"
                                    rules={[{ required: true, message: "Please input your username!" }]}
                                >
                                    <Input />
                                </Form.Item>
                            )}

                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[{ required: true, message: "Please input your email!" }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                label="Password"
                                name="password"
                                rules={[{ required: true, message: "Please input your password!" }]}
                            >
                                <Input.Password />
                            </Form.Item>

                            {!isLogin && (
                                <Form.Item
                                    label="Confirm password"
                                    name="confirmPassword"
                                    rules={[{ required: true, message: "Please confirm your password!" }]}
                                >
                                    <Input.Password />
                                </Form.Item>
                            )}

                            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                                <Button type="primary" htmlType="submit">
                                    {isLogin ? "Login" : "Register"}
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoginSignup;
