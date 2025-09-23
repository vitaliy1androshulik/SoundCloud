import axios from "axios";


const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem("token");
    config.headers.Authorization = `Bearer ${token}`;
    console.log(localStorage.getItem("token"));
    return config;
});

export default api;