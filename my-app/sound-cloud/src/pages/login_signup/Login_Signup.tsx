import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import '../../styles/login_signup/Login_Sіgnup.css'
const LoginSignup: React.FC = () => {

    const navigate = useNavigate();
    const [isChecked, setIsChecked] = useState(false);

    const handleLogin = () => {
        if (isChecked) {
            // Тут можна додати логіку авторизації
            navigate("/home");
        }
    };

    return (
        <div className="flex justify-center items-center h-screen
        bg-[url(images/login_signup_page/background.jpg)] bg-cover bg-center bg-no-repeat text-white">
            <div  className="flex justify-center items-center h-screen bg-color-pink  text-white">
                <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-80">
                    <h1 className="text-3xl mb-6 text-center">Login</h1>

                    {/* Чекбокс */}
                    <label className="flex items-center space-x-2 mb-6">
                        <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => setIsChecked(e.target.checked)}
                            className="w-4 h-4"
                        />
                        <span>Я погоджуюсь з умовами</span>
                    </label>

                    {/* Кнопка входу */}
                    <button
                        onClick={handleLogin}
                        disabled={!isChecked}
                        className={`w-full py-2 rounded text-white transition-colors 
            ${isChecked ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-500 cursor-not-allowed'}
          `}
                    >
                        Увійти
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginSignup;