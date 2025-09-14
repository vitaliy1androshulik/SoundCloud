
import {useGoogleLogin} from "@react-oauth/google";
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
    const [showConfirmPassword, setShowConfrimPassword] = useState(false);
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
            // логіка логіну
            try {
                const data = await login(values.email, values.password);
                if (data.token) {
                    const user = normalizeUser(data.token);
                    if (user) {
                        localStorage.setItem("token", data.token);
                        dispatch(setUser({ user, token: data.token }));
                    }
                }
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
                if (data.token) {
                    const user = normalizeUser(data.token);
                    if (user) {
                        localStorage.setItem("token", data.token);
                        dispatch(setUser({ user, token: data.token }));
                    }
                }
                navigate("/home");
            } catch (err) {
                alert("Помилка реєстрації: " + (err as AxiosError).message);
            }
        }
    };

    //--- Додано: обробка Google Login ---
    const handleGoogleLogin = async (credentialResponse: any) => {
        if (!credentialResponse.credential) return;

        try {
            const res = await fetch("http://localhost:5122/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: credentialResponse.credential }),
            });

            if (!res.ok) {
                console.error("Google login failed");
                return;
            }

            const data = await res.json();
            console.log("User info from backend:", data);

            // Зберігаємо користувача
            const user = data; // payload з бекенду
            localStorage.setItem("token", credentialResponse.credential);
            dispatch(setUser({ user, token: credentialResponse.credential }));
            alert("Логін через Google успішний!");
            navigate("/home");
        } catch (error) {
            console.error("Error during Google login:", error);
        }
    };
    const googleLogin = useGoogleLogin({
        onSuccess: handleGoogleLogin,
        onError: () => console.log("Google Login Failed"),
    });
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

                                        <button
                                            type="button"
                                             // запускає Google OAuth
                                            className="login_third_google_button baloo2"
                                        >
                                            <img
                                                src="src/images/icons/google_icon.png"
                                                alt="google_icon"
                                                className="w-5 h-5 mr-2"
                                            />
                                            Sign in with Google
                                        </button>
                                        <button className="login_third_google_button baloo2"><img
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

                                                <button
                                                    onClick={()=>googleLogin()}
                                                    className="login_third_google_button baloo2"
                                                >
                                                    <img
                                                        src="src/images/icons/google_icon.png"
                                                        alt="google_icon"
                                                        className="w-5 h-5"
                                                    />
                                                    Sign in with Google
                                                </button>
                                        <button className="login_third_google_button baloo2"><img
                                            src="src/images/icons/facebook_icon.png" alt="google_icon"/> Sign in with
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
                                                    onClick={() => setShowConfrimPassword(!showConfirmPassword)}
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
