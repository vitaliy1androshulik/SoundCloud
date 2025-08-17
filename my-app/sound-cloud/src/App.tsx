// App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/main_pages/HomePage";
import LoginSignup from "./pages/login_signup/Login_Signup";
import LibraryPage from "./pages/main_pages/LibraryPage.tsx";


import './index.css';
import FeedPage from "./pages/main_pages/FeedPage.tsx";
export default function App() {
    return (
        <Router>
            <Routes>
                {/* Сторінка логіну */}
                <Route path="/" element={<LoginSignup />} />

                {/* Головний Layout */}
                <Route element={<Layout />}>
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/feed" element={<FeedPage />}/>
                    <Route path="/library" element={<LibraryPage />} />
                </Route>
            </Routes>
        </Router>
    );
}