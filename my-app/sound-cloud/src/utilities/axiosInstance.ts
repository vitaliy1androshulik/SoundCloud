import axios from "axios";


const api = axios.create({
    // baseURL: import.meta.env.VITE_BASE_URL,
    baseURL: import.meta.env.VITE_BASE_URL || 'http://localhost:5122/api',
    withCredentials: true,
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem("token");
    if(token) config.headers.Authorization = `Bearer ${token}`;
    console.log(localStorage.getItem("token"));
    return config;
});

export default api;