
// import {useGoogleLogin} from "@react-oauth/google";
import React, {useState} from "react";
import "../../styles/login_signup/background.css";
import {useDispatch} from "react-redux";
import {setUser} from "../../store/slices/userSlice";
import {useNavigate,useOutletContext} from "react-router-dom";
import {normalizeUser} from "../../utilities/normalizeUser.ts";
import {AxiosError} from "axios";
import {login, register} from "../../services/authApi.ts";
import "../../styles/login_signup/layout.css"
import "../../styles/login_signup/login_signup_form.css"
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

type OutletContextType = {
    showForm: boolean;
    setShowForm: (val: boolean) => void;
    isLogin: boolean;
    setIsLogin: (val: boolean) => void;
};
const LoginSignup: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {isLogin, setIsLogin} = useOutletContext<OutletContextType>();
    const {showForm, setShowForm} = useOutletContext<OutletContextType>();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const onFinish = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const values = {
            username: formData.get("username") as string,
            email: formData.get("email") as string,
            password: formData.get("password") as string,
            confirmPassword: formData.get("confirmPassword") as string,
        };

        if (isLogin) {
            //  Додати перевірки на data.token і user
            try {
                const data = await login(values.email, values.password);
                if (!data.token) {
                    alert("Помилка: токен не отримано");
                    return;
                }
                const user = normalizeUser(data.token);
                if (!user) {
                    alert("Помилка: не вдалося отримати дані користувача");
                    return;
                }
                localStorage.setItem("token", data.token);
                dispatch(setUser({ user, token: data.token }));
                navigate("/home");
            } catch (err) {
                alert("Помилка логіну: " + (err as AxiosError).message);
            }

        } else {
            // логіка реєстрації
            if (values.password !== values.confirmPassword) {
                alert("Паролі не співпадають!");
                return;
            }
            try {
                const data = await register(
                    values.username,
                    values.email,
                    values.password,
                    values.confirmPassword
                );
                if (!data.token) {
                    alert("Помилка: токен не отримано");
                    return;
                }
                const user = normalizeUser(data.token);
                if (!user) {
                    alert("Помилка: не вдалося отримати дані користувача");
                    return;
                }
                localStorage.setItem("token", data.token);
                dispatch(setUser({ user, token: data.token }));
                navigate("/home");
                // if (data.token) {
                //     const user = normalizeUser(data.token);
                //     if (user) {
                //         localStorage.setItem("token", data.token);
                //         dispatch(setUser({ user, token: data.token }));
                //     }
                // }
                // navigate("/home");
            // } catch (err) {
            //     alert("Помилка реєстрації: " + (err as AxiosError).message);
            // }

            } catch (err) {
                const axiosErr = err as AxiosError<{ error?: string; message?: string }>;

                // те, що прислав бекенд у body:
                const apiMsg =
                    axiosErr.response?.data?.error ??
                    axiosErr.response?.data?.message ??
                    "";

                // HTTP-статус може бути 400 або 409 (залежно від  обробки)
                const status = axiosErr.response?.status;

                //  email уже прив’язаний до Google-акаунта
                if ((status === 400 || status === 409) && apiMsg.includes("Google-акаунта")) {
                    alert(
                        "Цей email вже прив'язаний до Google. Увійдіть через Google, а потім у профілі встановіть локальний пароль (Меню → Профіль → Встановити пароль)."
                    );
                    return;
                }

                // інші  валідаційні помилки з бекенда
                if ((status === 400 || status === 409) && apiMsg) {
                    alert("Помилка реєстрації: " + apiMsg);
                    return;
                }

                // якщо бекенд не дав зрозумілого тексту
                alert("Помилка реєстрації: " + (axiosErr.message || "невідома помилка"));
            }
        }
    };

// NEW: допоміжний тип (не обов’язково, але зручно)
    type GoogleAuthResponse = {
        token: string;
        expiresAt?: string;
        id?: number;
        username?: string;
        email?: string;
        avatarUrl?: string;
    };

// NEW: акуратне діставання тексту помилки без any
    const msgFromError = (e: unknown) =>
        e instanceof Error ? e.message : typeof e === "string" ? e : JSON.stringify(e);

    const handleGoogleSuccess = async (response: CredentialResponse) => {
        const idToken = response.credential;
        if (!idToken) {
            alert("No credential from Google");
            return;
        }

        // DEBUG лише у dev:
        if (import.meta.env.DEV) {
            // console.debug("[GSI] idToken len=", idToken.length, "sample=", idToken.slice(0, 30), "...");
            console.debug("[GSI] idToken =", idToken); // ПОВНИЙ токен
        }

        let res: Response;
        try {
            res = await fetch("http://localhost:5122/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: idToken }),
            });
        } catch (e: unknown) {                // CHANGED: було (e: any) → стало (e: unknown)
            alert("Network error: " + msgFromError(e));   // NEW: без any, коректний вивід
            return;
        }

        //читаємо тіло відповіді  1 раз
        if (!res.ok) {
            const errBody = await res.text();  // CHANGED: читаємо .text() тільки тут (при помилці)
            if (import.meta.env.DEV) {
                console.error("[/auth/google] status:", res.status, "body:", errBody);
            }
            alert(`Google login failed: ${res.status}\n${errBody}`);
            return;
        }

        // тепер читаємо JSON (тіло ще не читалося у success-гілці)
        const data: GoogleAuthResponse = await res.json();  // додано типізацію відповіді

        const token = data?.token;
        if (!token) {
            alert("Google login failed: missing token in response");
            return;
        }

        localStorage.setItem("token", token);

        const user =
            normalizeUser(token) ?? {
                id: data.id!,
                username: data.username!,
                email: data.email!,
                avatarUrl: data.avatarUrl,
                totalPlays: 0, // new
            };

        dispatch(setUser({ user, token }));
        navigate("/home");
    };

    // Додаємо правильну обробку GIS (отримуємо ID token = credential):
    // const handleGoogleSuccess = async (res: CredentialResponse) => {
    //     const idToken = res.credential; //  Google ID token (eyJ... з 2 крапками)
    //     console.log("ID_TOKEN:", idToken); // Логування для дебагу
    //     if (!idToken) {
    //         console.error("No credential returned by Google");
    //         alert("Google login failed: No credential returned");
    //         return;
    //     }
    //
    //     try {
    //         const r = await fetch("http://localhost:5122/auth/google", {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify({ token: idToken }),
    //         });
    //
    //         // new
    //         const text = await r.text();
    //         console.log("[/auth/google] status:", r.status, "body:", text);
    //
    //         if (!r.ok) {
    //             const text = await r.text();
    //             console.error("Google login failed:", text);
    //             // alert("Google login failed");
    //             alert(`Google login failed: ${r.status}\n${text}`);
    //             return;
    //         }
    //
    //         const data = await r.json();
    //         // очікуємо { token: '<API_JWT>', expiresAt, id, username, email, avatarUrl }
    //         if (!data.token) {
    //             alert("Помилка: токен не отримано від сервера");
    //             return;
    //         }
    //         localStorage.setItem("token", data.token);
    //         const user = {
    //             id: data.id,
    //             username: data.username,
    //             email: data.email,
    //             avatarUrl: data.avatarUrl,
    //         };
    //         dispatch(setUser({ user, token: data.token }));
    //         alert("Логін через Google успішний!");
    //         navigate("/home");
    //     } catch (error) {
    //         console.error("Error during Google login:", error);
    //         alert("Google login failed");
    //     }
    // };

    const handleGoogleError = () => {
        console.error("Google Login Failed");
        alert("Google login failed");
    };

    return (
        <>
            <div className="first_container">
                <div className="first_first_text baloo2">
                    <label>Don’t miss out!</label>
                </div>

                <div className="first_second_text baloo2">
                    <label>Explore the vibrant sounds and music globally</label>
                </div>
            </div>
            <div className="second_container">
                <div className="second_first_text baloo2">
                    <label>Connect with a community that shares your taste</label>
                </div>

                <div className="second_second_button">
                    {!showForm && (
                        <button className="second_second_button_text baloo2"
                                onClick={() => {
                                    setIsLogin(true);
                                    setShowForm(true);
                                }}
                        >Get Started
                        </button>
                    )}
                    {showForm && (
                        <div className="background">
                            {isLogin ? (
                                <div className="login_form_container">
                                    <div className="login_first_close_container">
                                        <button
                                            type="button"
                                            className="login_first_close_button"
                                            onClick={() => {
                                                setIsLogin(true);
                                                setShowForm(false);
                                            }}
                                        />
                                    </div>
                                    <div className="login_second_container_text baloo2">
                                        <h1>{isLogin ? "Sign into your account" : "Sign Up"}</h1>
                                    </div>


                                    <div className="login_third_google_facebook_container">
                                        {/* new */}
                                        {/*<div className="login_third_google_button baloo2">*/}
                                        {/*    <GoogleLogin*/}
                                        {/*        onSuccess={handleGoogleSuccess}*/}
                                        {/*        onError={handleGoogleError}*/}
                                        {/*        theme="outline"*/}
                                        {/*        size="large"*/}
                                        {/*        text="signin_with"*/}
                                        {/*        shape="pill"*/}
                                        {/*        width="100%"*/}
                                        {/*    />*/}
                                        {/*</div>*/}

                                        {/* new */}
                                        <div className="login_third_google_button baloo2">
                                            <div className="oauth-wrap">
                                                {/* Видима фіолетова кнопка */}
                                                <button type="button" className="oauth-btn">
                                                    <img src="src/images/icons/google_icon.png" alt="" className="oauth-btn__icon" />
                                                    Sign in with Google
                                                </button>

                                                {/* Невидимий реальний GoogleLogin поверх */}
                                                <div className="oauth-overlay">
                                                    <GoogleLogin
                                                        onSuccess={handleGoogleSuccess}
                                                        onError={handleGoogleError}
                                                        theme="filled_blue"  // будь-що — елемент все одно невидимий
                                                        size="large"
                                                        text="signin_with"
                                                        shape="pill"
                                                        width="100%"
                                                    />
                                                </div>
                                            </div>
                                        </div>


                                        {/*old :*/}

                                    {/*    <button*/}
                                    {/*    type="button"*/}
                                    {/*    onClick={()=>googleLogin()}*/}
                                    {/*    // запускає Google OAuth*/}
                                    {/*    className="login_third_google_button baloo2"*/}
                                    {/*>*/}
                                    {/*    <img*/}
                                    {/*        src="src/images/icons/google_icon.png"*/}
                                    {/*        alt="google_icon"*/}
                                    {/*        className="w-5 h-5 mr-2"*/}
                                    {/*    />*/}
                                    {/*    Sign in with Google*/}
                                    {/*</button>*/}
                                        <button className="login_third_google_button baloo2 text-white"><img
                                            src="src/images/icons/facebook_icon.png" alt="google_icon"/> Sign in with
                                            Facebook
                                        </button>
                                    </div>
                                    <form
                                        onSubmit={onFinish}
                                        className="login_fourth_login_container"
                                        noValidate
                                    >
                                        <div className="login_fourth_text_or baloo2">
                                            <label>OR</label>
                                        </div>
                                        {!isLogin && (
                                            <div className="login_fourth_emailLogin_container">
                                                <label className="baloo2" htmlFor="username">
                                                    Username
                                                </label>
                                                <input
                                                    type="text"
                                                    id="username"
                                                    name="username"
                                                    className="baloo2 login_fourth_emailLogin_input"
                                                    placeholder="Enter your username"
                                                    required
                                                />
                                            </div>
                                        )}

                                        <div className="login_fourth_emailLogin_container">
                                            <label
                                                className="login_fourth_emailLogin_container_text baloo2"
                                                htmlFor="email"
                                            >
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                className="login_fourth_emailLogin_input baloo2"
                                                placeholder="Enter your email"
                                                required
                                            />
                                        </div>

                                        <div className="login_fourth_emailLogin_container">
                                            <label
                                                className="login_fourth_emailLogin_container_text baloo2"
                                                htmlFor="password"
                                            >
                                                Password
                                            </label>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                id="password"
                                                name="password"
                                                className="login_fourth_emailLogin_input baloo2"
                                                placeholder="Enter your password"
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="eye_icon_position"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                <img src="src/images/icons/eye_icon.png" alt="eye_icon"/>
                                            </button>
                                        </div>

                                        {isLogin && (
                                            <div className="login_fifth_forgot_password_container">
                                                <a href="#" className="baloo2">
                                                    Forgot your Password?
                                                </a>
                                            </div>
                                        )}

                                        {!isLogin && (
                                            <div className="form_group">
                                                <label className="baloo2" htmlFor="confirmPassword">
                                                    Confirm password
                                                </label>
                                                <input
                                                    type="password"
                                                    id="confirmPassword"
                                                    name="confirmPassword"
                                                    className="login_fourth_emailLogin_input baloo2"
                                                    placeholder="Confirm your password"
                                                    required
                                                />
                                            </div>
                                        )}
                                        <div className="sixth_login_button_container">
                                            <button type="submit" className="baloo2 login_sixth_button">
                                                {isLogin ? "Sign In" : "Sign Up"}
                                            </button>
                                        </div>
                                        <div className="login_seventh_container">
                                            {!isLogin ? (
                                                <label className="baloo2">
                                                    Already have an account?{" "}
                                                    <button
                                                        type="button"
                                                        className="baloo2 text-purple underline"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setIsLogin(true); // переключаємо на логін
                                                        }}
                                                    >
                                                        Sign in
                                                    </button>
                                                </label>
                                            ) : (
                                                <label className="baloo2">
                                                    Don’t have an account?{" "}
                                                    <button
                                                        type="button"
                                                        className="baloo2 text-purple underline login_signup_button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setIsLogin(false); // переключаємо на логін
                                                        }}

                                                    >
                                                        Sign up
                                                    </button>
                                                </label>
                                            )}
                                        </div>
                                    </form>

                                </div>
                            ): (
                                ///////////////////////////////////////////////////////////////////////////////////
                                <div className="signin_form_container">
                                    <div className="login_first_close_container">
                                        <button
                                            type="button"
                                            className="login_first_close_button"
                                            onClick={() => {
                                                setIsLogin(true);
                                                setShowForm(false);
                                            }}
                                        />
                                    </div>
                                    <div className="login_second_container_text baloo2">
                                        <h1>{isLogin ? "Sign into your account" : "Sign Up"}</h1>
                                    </div>
                                    <div className="login_third_google_facebook_container">

                                        {/*/!* new *!/*/}
                                        {/*<div className="login_third_google_button baloo2">*/}
                                        {/*    <GoogleLogin*/}
                                        {/*        onSuccess={handleGoogleSuccess}*/}
                                        {/*        onError={handleGoogleError}*/}
                                        {/*        theme="filled_blue"*/}
                                        {/*        size="large"*/}
                                        {/*        text="signin_with"*/}
                                        {/*        shape="rectangular"*/}
                                        {/*        width="100%"*/}
                                        {/*    />*/}
                                        {/*</div>*/}

                                        <div className="login_third_google_button baloo2">
                                            <div className="oauth-wrap">
                                                {/* Видима фіолетова кнопка */}
                                                <button type="button" className="oauth-btn">
                                                    <img src="src/images/icons/google_icon.png" alt="" className="oauth-btn__icon " />
                                                    <span>Sign up with Google</span>
                                                </button>

                                                {/* Невидимий реальний GoogleLogin поверх */}
                                                <div className="oauth-overlay text-white">
                                                    <GoogleLogin
                                                        onSuccess={handleGoogleSuccess}
                                                        onError={handleGoogleError}
                                                        theme="filled_blue"  // Елемент невидимий, але зберігаємо конфігурацію
                                                        size="large"
                                                        text="signin_with"
                                                        shape="pill"
                                                        width="100%"
                                                    />
                                                </div>
                                            </div>
                                        </div>


                                        {/*<button*/}
                                        {/*    onClick={()=>googleLogin()}*/}
                                        {/*    className="login_third_google_button baloo2"*/}
                                        {/*>*/}
                                        {/*    <img*/}
                                        {/*        src="src/images/icons/google_icon.png"*/}
                                        {/*        alt="google_icon"*/}
                                        {/*        className="w-5 h-5"*/}
                                        {/*    />*/}
                                        {/*    Sign in with Google*/}
                                        {/*</button>*/}


                                        <button className="login_third_google_button baloo2 text-white"><img
                                            src="src/images/icons/facebook_icon.png" alt="google_icon"/> Sign up with
                                            Facebook
                                        </button>
                                    </div>
                                    <form
                                        onSubmit={onFinish}
                                        className="login_fourth_login_container"
                                        noValidate
                                        autoComplete="off"
                                    >
                                        <div className="login_fourth_text_or baloo2">
                                            <label>OR</label>
                                        </div>
                                        {!isLogin && (
                                            <div className="login_fourth_emailLogin_container">
                                                <label
                                                    className="login_fourth_emailLogin_container_text baloo2"
                                                    htmlFor="username"
                                                >
                                                    Username
                                                </label>
                                                <input
                                                    type="text"
                                                    id="username"
                                                    name="username"
                                                    className="baloo2 login_fourth_emailLogin_input"
                                                    placeholder="Enter your username"
                                                    autoComplete="off"
                                                    required
                                                />
                                            </div>
                                        )}

                                        <div className="login_fourth_emailLogin_container">
                                            <label
                                                className="login_fourth_emailLogin_container_text baloo2"
                                                htmlFor="email"
                                            >
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                className="login_fourth_emailLogin_input baloo2"
                                                placeholder="Enter your email"
                                                required
                                                autoComplete="off"
                                            />
                                        </div>

                                        <div className="login_fourth_emailLogin_container">
                                            <label
                                                className="login_fourth_emailLogin_container_text baloo2"
                                                htmlFor="password"
                                            >
                                                Password
                                            </label>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                id="password"
                                                name="password"
                                                className="login_fourth_emailLogin_input baloo2"
                                                placeholder="Enter your password"
                                                required
                                                autoComplete="new-password"
                                            />
                                            <button
                                                type="button"
                                                className="eye_icon_position_signin"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                <img src="src/images/icons/eye_icon.png" alt="eye_icon"/>
                                            </button>
                                        </div>

                                        {isLogin && (
                                            <div className="login_fifth_forgot_password_container">
                                                <a href="#" className="baloo2">
                                                    Forgot your Password?
                                                </a>
                                            </div>
                                        )}

                                        {!isLogin && (
                                            <div className="form_group">
                                                <label
                                                    className="login_fourth_emailLogin_container_text baloo2"
                                                    htmlFor="confirmPassword"
                                                >
                                                    Confirm Password
                                                </label>
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    id="confirmPassword"
                                                    name="confirmPassword"
                                                    className="login_fourth_emailLogin_input baloo2"
                                                    placeholder="Confirm your password"
                                                    required
                                                    autoComplete="off"
                                                />
                                                <button
                                                    type="button"
                                                    className="eye_icon_position_signin_confirm"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                >
                                                    <img src="src/images/icons/eye_icon.png" alt="eye_icon"/>
                                                </button>
                                            </div>
                                        )}
                                        <div className="sixth_login_button_container">
                                            <button type="submit" className="baloo2 login_sixth_button">
                                                {isLogin ? "Sign In" : "Sign Up"}
                                            </button>
                                        </div>
                                        <div className="login_seventh_container">
                                            {!isLogin ? (
                                                <label className="baloo2">
                                                    Already have an account?{" "}
                                                    <button
                                                        type="button"
                                                        className="baloo2 text-purple underline login_signup_button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setIsLogin(true); // переключаємо на логін
                                                        }}

                                                    >
                                                        Sign in
                                                    </button>
                                                </label>
                                            ) : (
                                                <label className="baloo2">
                                                    Don’t have an account?{" "}
                                                    <button
                                                        type="button"
                                                        className="baloo2 text-purple underline"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setIsLogin(false); // переключаємо на логін
                                                        }}

                                                    >
                                                        Sign up
                                                    </button>
                                                </label>
                                            )}
                                        </div>
                                    </form>

                                </div>
                            )}

                        </div>
                    )}
                </div>

                <div className="second_third_text baloo2">
                    <label>Create your free account and start listening your way.</label>
                </div>
            </div>
            <div className="third_container baloo2">
                <div className="third_first_search_bar">
                    <div>
                        <img src="src/images/search_bar/search.png" alt="search" className="search_logo"/>
                    </div>
                    <input type="text" placeholder="Search for artists, bands, tracks or music"
                           className="search_input"/>
                </div>
                <label className="third_second_text">WaveCloud offers a powerful space for
                    emerging talent to grow their audience, engage directly with fans,
                    and distribute their music across channels.</label>
            </div>

        </>
    );
};

export default LoginSignup;
