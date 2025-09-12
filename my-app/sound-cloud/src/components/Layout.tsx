import React from 'react';
import { Outlet } from "react-router-dom";
import Header from "./Header.tsx";
import Footer from "./Footer.tsx";

import "../App.css";

const Layout: React.FC = () => {

    return(
        <>
            <div className="page-container">
                <div className="p-4 ">
                    <Header/>
                </div>
                <div className="content">
                    <Outlet/>
                </div>
                <div className="footer">
                    <Footer/>
                </div>
            </div>
        </>
    );
}
export default Layout;