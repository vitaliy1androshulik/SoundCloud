import api from "../utilities/axiosInstance.ts";
import axios from "axios";

const API_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000/api/auth";

const extractServerMsg = (data: unknown): string | undefined => {
    if (!data) return;
    if (typeof data === "string") return data;
    if (typeof data === "object") {
        const d = data as { error?: string; message?: string; detail?: string };
        return d.error || d.message || d.detail;
    }
};

export const register = async (username: string, email: string, password: string, confirmPassword:string) => {
    const response = await api.post(`${API_URL}/User/register`, { username, email, password, confirmPassword});
    if (response.data.token) {
        localStorage.setItem("token", response.data.token);
    }
    return response.data;
};

export const login = async (email: string, password: string) => {
    const response = await api.post(`${API_URL}/User/login`, { email, password });
    if (response.data.token) {
        localStorage.setItem("token", response.data.token);
    }
    return response.data;
};

// // new: POST-запит на бекенд для встановлення локального пароля
// export const setLocalPassword = async (password: string, confirmPassword: string) => {
//     // eslint-disable-next-line no-useless-catch
//     try {
//         // const response = await api.post('/auth/set-local-password', { password, confirmPassword });
//         // return response.data;  // Повертає дані з бекенду (наприклад, успіх або оновлений токен)
//         // api має baseURL = http://localhost:5122/api
//         // Тому шлях — відносний до /api:
//         const { data } = await api.post('/User/password/set', {
//             password,
//             confirmPassword,
//         });
//         return data;
//     } catch (error) {
//         throw error;  // Обробка помилок (бекенд кине, якщо паролі не співпадають або інші валідації)
//     }
// };

export const setLocalPassword = async (password: string, confirmPassword: string) => {
    // 1) найпростіша форма
    try {
        const { data } = await api.post("/User/password/set", { password, confirmPassword });
        return data;
    } catch (err) {
        if (!axios.isAxiosError(err) || err.response?.status !== 400) throw err;
        // 2) варіант із newPassword
        try {
            const { data } = await api.post("/User/password/set", { newPassword: password, confirmPassword });
            return data;
        } catch (err2) {
            if (!axios.isAxiosError(err2) || err2.response?.status !== 400) throw err2;
            // 3) варіант із oldPassword (порожній для google-only)
            try {
                const { data } = await api.post("/User/password/set", {
                    oldPassword: "",
                    newPassword: password,
                    confirmPassword,
                });
                return data;
            } catch (err3) {
                // віддати зрозумілий текст помилки від сервера
                if (axios.isAxiosError(err3)) {
                    const msg = extractServerMsg(err3.response?.data);
                    throw new Error(msg || "Помилка встановлення пароля");
                }
                throw err3;
            }
        }
    }
};

export const logout = () => {
    localStorage.removeItem("token");
};

export const getToken = () => localStorage.getItem("token");