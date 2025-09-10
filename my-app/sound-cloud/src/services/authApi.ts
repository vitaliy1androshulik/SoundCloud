import api from "../utilities/axiosInstance.ts";

const API_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000/api/auth";

export const register = async (username: string, email: string, password: string, confirmPassword:string) => {
    const response = await api.post(`${API_URL}/User/register`, { username, email, password, confirmPassword});
    if (response.data.token) {
        localStorage.setItem("token", response.data.token);
    }
    return response.data;
};

export const login = async (username: string, password: string) => {
    const response = await api.post(`${API_URL}/User/login`, { username, password });
    if (response.data.token) {
        localStorage.setItem("token", response.data.token);
    }
    return response.data;
};

export const logout = () => {
    localStorage.removeItem("token");
};

export const getToken = () => localStorage.getItem("token");