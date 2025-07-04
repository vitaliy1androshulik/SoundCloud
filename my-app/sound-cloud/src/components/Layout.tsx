import React from 'react';
import { Outlet } from "react-router-dom";
import Header from "./Header.tsx";

import "../App.css";
const Layout: React.FC = () => {

    return(
        <>
            <div >
                <Header />
                <div >
                    <Outlet />
                </div>
            </div>
        </>
    );
}
export default Layout;