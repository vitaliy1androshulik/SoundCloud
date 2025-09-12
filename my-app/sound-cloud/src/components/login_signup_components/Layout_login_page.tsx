import React,{useState} from 'react';
import { Outlet } from "react-router-dom";
import Header from "./Header.tsx";

import "../../App.css";
import "../../styles/login_signup/background.css"

const Layout_login_page: React.FC = () => {
    const [showForm, setShowForm] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    return(
        <>
            <div className="background_style min-h-screen relative z-0 relative">
                <div className="">
                    <Header setShowForm={setShowForm} setIsLogin={setIsLogin}/>
                </div>
                <div className="flex-1 z-20">
                    <Outlet context={{ showForm, setShowForm, isLogin, setIsLogin}} />
                </div>

            </div>
        </>
    );
}
export default Layout_login_page;