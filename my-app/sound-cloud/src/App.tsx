// App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.tsx";
import Layout_login_page from "./components/login_signup_components/Layout_login_page.tsx";
import HomePage from "./pages/main_pages/HomePage";
import LoginSignup from "./pages/login_signup/Login_Signup";
import LibraryPage from "./pages/main_pages/LibraryPage.tsx";
import './index.css';
import FeedPage from "./pages/main_pages/FeedPage.tsx";
import {useDispatch} from "react-redux";
import {useEffect} from "react";
import {setUser} from "./store/slices/userSlice.ts";
import {normalizeUser} from "./utilities/normalizeUser.ts";

//імпорти для адмінки

import AdminLayout from "./pages/admin/AdminLayout";
import UsersPage from "./pages/admin/UsersPage";
import TracksPage from "./pages/admin/TracksPage";


export default function App() {
    const dispatch = useDispatch();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const user = normalizeUser(token);
            if (user) {
                dispatch(setUser({ user, token }));
            }
            console.log("init user", user);
        }
    }, [dispatch]);
    return (
        <Router>
            <Routes>
                {/* Сторінка логіну */}
                <Route element={<Layout_login_page/>}>
                    <Route path="/" element={<LoginSignup/>}/>
                </Route>
                {/* Головний Layout_LS */}
                <Route element={<Layout />}>
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/feed" element={<FeedPage />} />
                    <Route path="/library" element={<LibraryPage />} />
                </Route>

                {/*  Адмінка (ОКРЕМО, без Layout) */}
                <Route path="/admin" element={<AdminLayout />}>
                    <Route path="users" element={<UsersPage />} />
                    <Route path="tracks" element={<TracksPage />} />
                </Route>
            </Routes>
        </Router>
    );
}